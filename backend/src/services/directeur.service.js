import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/prisma.js';
import { envoyerIdentifiants } from '../utils/sendMail.js';
import { getPendingValidations } from './validation_etudiant.service.js';

const USER_SELECT = {
  utilisateur_id: true,
  nom: true,
  prenom: true,
  email: true,
  role: true,
  provider: true,
};

function generatePassword() {
  return crypto.randomBytes(9).toString('base64url');
}

async function getDirectorInstitution(directeurId) {
  const directeur = await prisma.directeur.findUnique({
    where: { directeur_utilisateur_id: directeurId },
    include: {
      institution: {
        include: {
          professeurs: {
            include: {
              utilisateur: {
                select: {
                  utilisateur_id: true,
                  nom: true,
                  prenom: true,
                  email: true,
                  photo: true,
                },
              },
            },
          },
          etudiants: {
            where: { statut: 'valide' },
            include: {
              etudiant: {
                include: {
                  utilisateur: {
                    select: {
                      utilisateur_id: true,
                      nom: true,
                      prenom: true,
                      email: true,
                      photo: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!directeur?.institution) {
    throw new Error('Institution du directeur introuvable');
  }

  return directeur.institution;
}

export async function getDirecteurDashboard(directeurId) {
  const institution = await getDirectorInstitution(directeurId);
  const pendingStudents = await getPendingValidations(institution.institution_id);

  return {
    institution,
    professors: institution.professeurs,
    pendingStudents,
    stats: {
      totalProfessors: institution.professeurs.length,
      totalStudents: institution.etudiants.length,
    },
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
          select: {
            utilisateur_id: true,
            nom: true,
            prenom: true,
            email: true,
            photo: true,
          },
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

    return {
      professeur,
      emailSent: true,
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    return {
      professeur,
      emailSent: false,
      temporaryPassword: motDePasse,
      warning: error.message,
    };
  }
}
