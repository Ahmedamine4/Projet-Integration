import prisma from '../config/prisma.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
export async function assignerDirecteur({
  utilisateur_id,
  institution_id,
  poste,
  bureau,
}) {
  const motDePasse = genererMotDePasse();
  const hash = await bcrypt.hash(motDePasse, 10);
  const result = await prisma.$transaction(
    async (tx) => {
      const institution = await tx.institution.findUnique({ where: { institution_id, }, select: { nom: true, }, });
      const updatedUser = await tx.utilisateur.update({ where: { utilisateur_id, }, data: { role: 'directeur', mot_de_passe: hash, }, select: USER_SELECT, });
      await tx.directeur.create({
        data: {
          directeur_utilisateur_id:
            utilisateur_id,
          institution_id,
          poste:
            poste || null,
          bureau:
            bureau || null,
        },
      });

      return {
        utilisateur:
          updatedUser,
        institution,
      };
    }
  );

  return {
    message: `${result.utilisateur.prenom} ${result.utilisateur.nom} est maintenant directeur de ${result.institution.nom}`,
    utilisateur:result.utilisateur,
    institution_id,
    mot_de_passe:motDePasse,
  };
}

//promotion
export async function promouvoirProfessionnel({ utilisateur_id, admin_id }) {
  const utilisateur = await prisma.etudiant.findMany({
    where: { statut: 'en_attente' },
  });

  //màj statut pro
  const professionnel = await prisma.utilisateur.update({
    where: { professionnel_utilisateur_id: utilisateur_id },
    data: {
      statut: 'valide',
      admin_id,
    },
  });

  return {
    message: `${professionnel.prenom} ${professionnel.nom} a été validé comme professionnel`,
    utilisateur: professionnel,
    professionnel,
  };
}

//reject pro
export async function rejecterProfessionnel({ utilisateur_id, admin_id }) {
  const utilisateur = await prisma.etudiant.findMany({
    where: { statut: 'en_attente' },
  });

  //màj statut pro
  const professionnel = await prisma.utilisateur.update({
    where: { professionnel_utilisateur_id: utilisateur_id },
    data: {
      statut: 'refuse',
      admin_id,
    },
  });

  return {
    message: `${professionnel.prenom} ${professionnel.nom} a été refuse comme professionnel`,
    utilisateur: professionnel,
    professionnel,
  };
}
// un attribut bloque doit etre ajouter dans la table utilisateur 
export async function bloquerUtilisateur({ utilisateur_id }) {
  const utilisateur = await prisma.utilisateur.update({
    where: { utilisateur_id },
    data: { bloque: true },
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
        select: {
          nom: true,
          prenom: true,
          email: true,
        },
      },
    },
  });
}