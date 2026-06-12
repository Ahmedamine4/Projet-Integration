import prisma from '../config/prisma.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { creerNotification } from './notification.service.js';

const ADMIN_USER_SELECT = {
  utilisateur_id: true,
  nom: true,
  prenom: true,
  email: true,
  role: true,
  provider: true,
  date_de_creation: true,
  bloque: true,
};

const ADMIN_INSTITUTION_INCLUDE = {
  directeur: {
    include: {
      utilisateur: {
        select: {
          utilisateur_id: true,
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  },
};

function normalizeEmail(email) {
  return email?.trim().toLowerCase();
}

function genererMotDePasse(longueur = 12) {
  const minuscules = 'abcdefghijklmnopqrstuvwxyz';
  const majuscules = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const chiffres = '0123456789';
  const symboles = '!@#$%^&*';
  const caracteres = minuscules + majuscules + chiffres + symboles;

  let motDePasse = '';
  motDePasse += minuscules[crypto.randomInt(minuscules.length)];
  motDePasse += majuscules[crypto.randomInt(majuscules.length)];
  motDePasse += chiffres[crypto.randomInt(chiffres.length)];
  motDePasse += symboles[crypto.randomInt(symboles.length)];

  for (let i = 4; i < longueur; i++) {
    motDePasse += caracteres[crypto.randomInt(caracteres.length)];
  }

  return motDePasse
    .split('')
    .sort(() => crypto.randomInt(3) - 1)
    .join('');
}


export async function getAdminInstitutions() {
  return prisma.institution.findMany({
    include: ADMIN_INSTITUTION_INCLUDE,
    orderBy: { nom: 'asc' },
  });
}

export async function creerInstitutionAvecDirecteur({ nom, email_directeur }) {
  const institutionName = nom?.trim();
  const directeurEmail = normalizeEmail(email_directeur);
  if (!institutionName || !directeurEmail) {
    throw new Error("Le nom de l'institution et l'email du directeur sont requis");
  }

  const existingInstitution = await prisma.institution.findFirst({
    where: { nom: { equals: institutionName, mode: 'insensitive' } },
  });

  if (existingInstitution) {
    throw new Error('Une institution avec ce nom existe déjà');
  }

  const motDePasse = genererMotDePasse();
  const hash = await bcrypt.hash(motDePasse, 10);

  const result = await prisma.$transaction(async (tx) => {
    let directeur = await tx.utilisateur.findUnique({
      where: { email: directeurEmail },
      select: ADMIN_USER_SELECT,
    });

    if (directeur?.role === 'administrateur') {
      throw new Error('Un administrateur ne peut pas être assigné directeur');
    }

    if (!directeur) {
      directeur = await tx.utilisateur.create({
        data: {
          nom: institutionName.slice(0, 50),
          prenom: 'Directeur',
          email: directeurEmail,
          mot_de_passe: hash,
          role: 'directeur',
          provider: 'local',
        },
        select: ADMIN_USER_SELECT,
      });
    } else {
      directeur = await tx.utilisateur.update({
        where: { utilisateur_id: directeur.utilisateur_id },
        data: {
          role: 'directeur',
          // Le formulaire admin ne collecte pas de mot de passe; on force donc
          // un mot de passe temporaire envoyé par email pour garantir l'accès directeur.
          mot_de_passe: hash,
          provider: 'local',
        },
        select: ADMIN_USER_SELECT,
      });
    }

    const institution = await tx.institution.create({
      data: {
        nom: institutionName,
        // Le formulaire admin ne fournit que l'email du directeur; on le garde aussi
        // dans institutions.email pour respecter la contrainte NOT NULL existante.
        email: directeurEmail,
        academique: true,
        directeur: {
          create: {
            directeur_utilisateur_id: directeur.utilisateur_id,
          },
        },
      },
      include: ADMIN_INSTITUTION_INCLUDE,
    });

    

    return { institution, directeur};
  });

  await creerNotification(
      result.directeur.utilisateur_id,
      'Votre institution a été créée avec succès. Vos identifiants de connexion sont :\n\n' + `Email : ${result.directeur.email}\nMot de passe temporaire : ${motDePasse}\n\nVeuillez vous connecter et changer votre mot de passe dès que possible.`,
      'mot_de_pass'
    );

  return {
    message:'Institution créée et identifiants envoyés au directeur',
    institution: result.institution,
    directeur: result.directeur,
  };
}

export async function assignerDirecteur({
  utilisateur_id,
  institution_id,
  poste = null,
  bureau = null,
}) {
  const result = await prisma.$transaction(async (tx) => {
    const institution = await tx.institution.findUnique({
      where: { institution_id },
      select: { nom: true },
    });

    if (!institution) throw new Error('Institution introuvable');

    const updatedUser = await tx.utilisateur.update({
      where: { utilisateur_id },
      data: { role: 'directeur' },
      select: ADMIN_USER_SELECT,
    });

    await tx.directeur.create({
      data: {
        directeur_utilisateur_id: utilisateur_id,
        institution_id,
        poste: poste || null,
        bureau: bureau || null,
      },
    });

    return {
      utilisateur: updatedUser,
      institution,
    };
  });

  return {
    message: `${result.utilisateur.prenom} ${result.utilisateur.nom} est maintenant directeur de ${result.institution.nom}`,
    utilisateur: result.utilisateur,
    institution_id,
  };
}

export async function promouvoirProfessionnel({ utilisateur_id, admin_id }) {
  const result = await prisma.$transaction(async (tx) => {
    const utilisateur = await tx.utilisateur.update({
      where: { utilisateur_id },
      data: { role: 'professionnel' },
      select: ADMIN_USER_SELECT,
    });

    const professionnel = await tx.professionnel.upsert({
      where: { professionnel_utilisateur_id: utilisateur_id },
      update: {
        statut: 'valide',
        admin_id,
      },
      create: {
        professionnel_utilisateur_id: utilisateur_id,
        statut: 'valide',
        admin_id,
      },
      include: {
        utilisateur: { select: ADMIN_USER_SELECT },
      },
    });

    return { utilisateur, professionnel };
  });

  return {
    message: `${result.utilisateur.prenom} ${result.utilisateur.nom} a été validé comme professionnel`,
    utilisateur: result.utilisateur,
    professionnel: result.professionnel,
  };
}

export async function rejecterProfessionnel({ utilisateur_id, admin_id }) {
  const professionnel = await prisma.professionnel.update({
    where: { professionnel_utilisateur_id: utilisateur_id },
    data: {
      statut: 'refuse',
      admin_id,
    },
    include: {
      utilisateur: { select: ADMIN_USER_SELECT },
    },
  });

  return {
    message: `${professionnel.utilisateur.prenom} ${professionnel.utilisateur.nom} a été refusé comme professionnel`,
    utilisateur: professionnel.utilisateur,
    professionnel,
  };
}

export async function bloquerUtilisateur({ utilisateur_id }) {
  const existing = await prisma.utilisateur.findUnique({
    where: { utilisateur_id },
    select: { role: true },
  });

  if (!existing) throw new Error('Utilisateur introuvable');
  if (existing.role === 'administrateur') throw new Error('Impossible de bloquer un administrateur');

  const utilisateur = await prisma.utilisateur.update({
    where: { utilisateur_id },
    data: { bloque: true },
    select: ADMIN_USER_SELECT,
  });

  return {
    message: 'Compte bloqué avec succès',
    utilisateur,
  };
}

export async function debloquerUtilisateur({ utilisateur_id }) {
  const utilisateur = await prisma.utilisateur.update({
    where: { utilisateur_id },
    data: { bloque: false },
    select: ADMIN_USER_SELECT,
  });

  return {
    message: 'Compte débloqué avec succès',
    utilisateur,
  };
}

export async function getProfessionnelsEnAttente() {
  return prisma.professionnel.findMany({
    where: {
      statut: 'en_attente',
    },
    include: {
      utilisateur: {
        select: ADMIN_USER_SELECT,
      },
    },
    orderBy: {
      utilisateur: {
        date_de_creation: 'desc',
      },
    },
  });
}

export async function rechercherUtilisateursParEmail(email) {
  const q = normalizeEmail(email);
  if (!q) return [];

  return prisma.utilisateur.findMany({
    where: {
      email: { contains: q, mode: 'insensitive' },
      role: { notIn: ['administrateur', 'professionnel'] },
    },
    select: ADMIN_USER_SELECT,
    orderBy: { email: 'asc' },
    take: 6,
  });
}
