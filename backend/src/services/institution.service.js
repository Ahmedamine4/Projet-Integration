import prisma from '../config/prisma.js';

export const getInstitutions = async () => {
  return await prisma.institution.findMany({
    select: {
      institution_id: true,
      nom: true,
    },
  });
};

export const getInstitutionsValideEtudiant = async (etudiantId) => {
  const validations = await prisma.valideEtudiant.findMany({
    where: {
      utilisateur_id: etudiantId,
      statut: 'valide',
    },
    select: {
      institution: {
        select: {
          institution_id: true,
          nom: true,
          email: true,
          address: true,
          description: true,
        },
      },
    },
  });

  return validations.map((v) => v.institution);
};

export const getProfesseursByInstitution = async (institutionId) => {
  const institution = await prisma.institution.findUnique({
    where: { institution_id: institutionId },
    select: {
      institution_id: true,
      nom: true,
      professeurs: {
        select: {
          prof_utilisateur_id: true,
          departement: true,
          specialite: true,
          utilisateur: {
            select: {
              nom: true,
              prenom: true,
              email: true,
              photo: true,
            },
          },
        },
      },
    },
  });

  if (!institution) throw new Error('Institution non trouvée');

  return institution;
};