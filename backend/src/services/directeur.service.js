import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { envoyerIdentifiants } from '../utils/sendMail.js';

const USER_SELECT = {
  utilisateur_id: true,
  nom: true,
  prenom: true,
  email: true,
  role: true,
  provider: true,
  photo: true,
};

function generatePassword() {
  return crypto.randomBytes(9).toString('base64url');
}

async function getDirectorInstitution(directeurId) {
  const directeur = await prisma.directeur.findUnique({
    where: { directeur_utilisateur_id: directeurId },
    include: { institution: true },
  });

  if (!directeur?.institution) {
    throw new Error('Institution du directeur introuvable');
  }

  return directeur.institution;
}

export async function getDashboardStats(directeurId) {
  const institution = await getDirectorInstitution(directeurId);
  const currentDate = new Date();

  const totalProfessors = await prisma.professeur.count({
    where: { institutions: { some: { institution_id: institution.institution_id } } }
  });

  const totalStudents = await prisma.valideEtudiant.count({
    where: {
      institution_id: institution.institution_id,
      statut: 'valide',
      date_debut: { lte: currentDate },
      OR: [{ date_fin: { gte: currentDate } }, { date_fin: null }],
      etudiant: { etudie: true }
    }
  });

  const pendingInscriptions = await prisma.valideEtudiant.count({
    where: { institution_id: institution.institution_id, statut: 'en_attente' }
  });

  const pendingActivites = await prisma.valideActivite.count({
    where: { institution_id: institution.institution_id, statut: 'en_attente' }
  });

  return {
    institution,
    stats: {
      totalProfessors,
      totalStudents,
      pendingInscriptions,
      pendingActivites,
      totalPending: pendingInscriptions + pendingActivites
    }
  };
}

export async function getInstitutionMembers(directeurId, page = 1, type) {
  const institution = await getDirectorInstitution(directeurId);
  const currentDate = new Date();
  
  const limit = 10;
  const skip = (page - 1) * limit;

  let membres = [];
  let totalItems = 0;

  if (type === 'professeur') {
    totalItems = await prisma.professeur.count({
      where: { institutions: { some: { institution_id: institution.institution_id } } }
    });
    
    membres = await prisma.professeur.findMany({
      where: { institutions: { some: { institution_id: institution.institution_id } } },
      skip,
      take: limit,
      include: { utilisateur: { select: USER_SELECT } }
    });
  } else if (type === 'etudiant') {
    const whereClause = {
      institution_id: institution.institution_id,
      statut: 'valide',
      date_debut: { lte: currentDate },
      OR: [{ date_fin: { gte: currentDate } }, { date_fin: null }],
      etudiant: { etudie: true }
    };

    totalItems = await prisma.valideEtudiant.count({ where: whereClause });
    
    membres = await prisma.valideEtudiant.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: { etudiant: { include: { utilisateur: { select: USER_SELECT } } } }
    });
  } else {
    throw new Error("Le type de membre doit être 'etudiant' ou 'professeur'");
  }

  return {
    membres,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems
    }
  };
}

export async function getPendingRequests(directeurId, page = 1, type) {
  const institution = await getDirectorInstitution(directeurId);
  
  const limit = 10;
  const skip = (page - 1) * limit;

  let demandes = [];
  let totalItems = 0;

  if (type === 'inscription') {
    const whereClause = {
      institution_id: institution.institution_id,
      statut: 'en_attente'
    };

    totalItems = await prisma.valideEtudiant.count({ where: whereClause });
    
    demandes = await prisma.valideEtudiant.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: { etudiant: { include: { utilisateur: { select: USER_SELECT } } } }
    });
  } else if (type === 'activite') {
    const whereClause = {
      institution_id: institution.institution_id,
      statut: 'en_attente'
    };

    totalItems = await prisma.valideActivite.count({ where: whereClause });
    
    demandes = await prisma.valideActivite.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        activite: {
          include: {
            experience: {
              include: {
                etudiant: {
                  include: { utilisateur: { select: USER_SELECT } }
                }
              }
            }
          }
        }
      }
    });
  } else {
    throw new Error("Le type de demande doit être 'inscription' ou 'activite'");
  }

  return {
    demandes,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      totalItems
    }
  };
}

export async function createInstitutionProfessor({
  directeurId,
  email,
  prenom = 'Professeur',
  nom = 'Institution',
  departement,
  specialite,
}) {
  const institution = await getDirectorInstitution(directeurId);
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    throw new Error('Email invalide');
  }

  const existingUser = await prisma.utilisateur.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new Error('Email deja utilise');
  }

  const motDePasse = generatePassword();
  const hash = await bcrypt.hash(motDePasse, 10);

  const professeur = await prisma.$transaction(async (tx) => {
    const utilisateur = await tx.utilisateur.create({
      data: {
        nom,
        prenom,
        email: normalizedEmail,
        mot_de_passe: hash,
        role: 'professeur',
        provider: 'local',
      },
      select: USER_SELECT,
    });

    return tx.professeur.create({
      data: {
        prof_utilisateur_id: utilisateur.utilisateur_id,
        departement: departement || null,
        specialite: specialite || null,
        institutions: {
          connect: { institution_id: institution.institution_id },
        },
      },
      include: {
        utilisateur: {
          select: USER_SELECT,
        },
      },
    });
  });

  try {
    await envoyerIdentifiants({
      email: normalizedEmail,
      prenom,
      motDePasse,
      institution: institution.nom,
      role: 'professeur',
    });

    return { professeur, emailSent: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') throw error;
    return {
      professeur,
      emailSent: false,
      temporaryPassword: motDePasse,
      warning: error.message,
    };
  }
}

export async function traiterDemandeInscription(directeurId, etudiantId, statut) {
  const institution = await getDirectorInstitution(directeurId);

  if (!['valide', 'refuse'].includes(statut)) {
    throw new Error("Le statut doit être 'valide' ou 'refuse'");
  }

  const demande = await prisma.valideEtudiant.findFirst({
    where: {
      utilisateur_id: etudiantId,
      institution_id: institution.institution_id,
    },
    orderBy: {
      date_debut: 'desc',
    },
  });

  if (!demande) {
    throw new Error('Aucune demande trouvée pour cet étudiant et cette institution.');
  }

  const updatedDemande = await prisma.valideEtudiant.update({
    where: {
      valide_etudiant_id: demande.valide_etudiant_id,
    },
    data: { statut },
  });

  return updatedDemande;
}

export async function traiterDemandeActivite(directeurId, experienceId, statut) {
  const institution = await getDirectorInstitution(directeurId);

  if (!['valide', 'refuse'].includes(statut)) {
    throw new Error("Le statut doit être 'valide' ou 'refuse'");
  }

  const updatedActivite = await prisma.valideActivite.update({
    where: {
      experience_id_institution_id: {
        experience_id: experienceId,
        institution_id: institution.institution_id
      }
    },
    data: { 
      statut,
      date_d_action: new Date()
    }
  });

  return updatedActivite;
}