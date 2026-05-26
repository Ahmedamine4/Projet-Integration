import prisma from '../config/prisma.js';

export const getInstitutions = async () => {
    return await prisma.institution.findMany({
        select: {
            institution_id: true,
            nom: true
        }
    });
}

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
}