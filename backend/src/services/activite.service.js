import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';
import { lierCompetencesExperience, supprimerCompetencesDeveloppees } from './competence.helper.js';
import { creerNotification } from './notification.service.js';
export const uploadPhoto = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;

  const { error } = await supabase.storage
    .from('activites-photos')
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error('Erreur upload image : ' + error.message);

  const { data } = supabase.storage
    .from('activites-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const creeActivite = async (etudiantId, data, photoUrl) => {
  const activiteExistante = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'activite', titre: data.titre },
  });
  if (activiteExistante) throw new Error('Activité déjà existante');

  const competences = JSON.parse(data.competences || '[]');

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.titre,
        date_experience: new Date(data.date_experience),
        visibilite: false,
        type: 'activite',
        description: data.description,
        utilisateur_id: etudiantId,
        photo: photoUrl ?? null,
      },
    });

    const activite = await tx.activite.create({
      data: {
        experience_id: experience.experience_id,
        type: data.typeActivite ?? null,
        lieu: data.lieu ?? null,
      },
    });

    await Promise.all(
      competences.map(({ nom, type }) =>
        lierCompetencesExperience(tx, experience.experience_id, etudiantId, [nom], type)
      )
    );

    return await tx.activite.findUnique({
      where: { experience_id: experience.experience_id },
      include: {
        experience: {
          include: {
            competence_dev: { include: { competence: true } },
          },
        },
      },
    });
  });
};

export const getActivitesByEtudiant = async (etudiantId) => {
  return prisma.activite.findMany({
    where: { experience: { utilisateur_id: etudiantId } },
    include: {
      clubs: true,
      experience: {
        include: {
          competence_dev: { include: { competence: true } },
        },
      },
    },
    orderBy: { experience: { date_experience: 'desc' } },
  });
};

export const editActivite = async (etudiantId, experienceId, data, photoUrl) => {
  const activiteExistante = await prisma.experience.findFirst({
    where: {
      utilisateur_id: etudiantId,
      type: 'activite',
      titre: data.titre,
      experience_id: { not: experienceId },
    },
  });
  if (activiteExistante) throw new Error('Activité déjà existante');

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.findFirst({
      where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'activite' },
      include: {
        activite: true,
        competence_dev: true,
      },
    });

    if (!experience) throw new Error('Activité non trouvée');

    await tx.experience.update({
      where: { experience_id: experienceId },
      data: {
        titre: data.titre ?? experience.titre,
        date_experience: data.date_experience ? new Date(data.date_experience) : experience.date_experience,
        description: data.description ?? experience.description,
        visibilite: false,
        photo: photoUrl ?? experience.photo,
      },
    });

    await tx.activite.update({
      where: { experience_id: experienceId },
      data: {
        type: data.typeActivite ?? experience.activite.type,
        lieu: data.lieu ?? experience.activite.lieu,
      },
    });

    if (data.competences !== undefined) {
      const competences = JSON.parse(data.competences || '[]');

      await supprimerCompetencesDeveloppees(tx, experienceId, etudiantId);

      await Promise.all(
        competences.map(({ nom, type }) =>
          lierCompetencesExperience(tx, experienceId, etudiantId, [nom], type)
        )
      );
    }


    return tx.activite.findUnique({
      where: { experience_id: experienceId },
      include: {
        experience: {
          include: {
            competence_dev: { include: { competence: true } },
          },
        },
      },
    });
  });
};

export const updateVisibiliteActiviteService = async (etudiantId, experienceId, visibilite) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'activite' },
  });

  if (!experience) throw new Error('Activité non trouvée');

  return prisma.experience.update({
    where: { experience_id: experienceId },
    data: { visibilite },
    select: { experience_id: true, visibilite: true },
  });

  await creerNotification(
    etudiantId,
    'La visibilite de votre activite a ete mise a jour.',
    'portfolio_visibility',
    { utilisateurSourceId: etudiantId }
  );

  return updated;
};

export async function getActivitesVisiblesByEtudiant(etudiantId) {
  return prisma.experience.findMany({
    where: { utilisateur_id: etudiantId, type: 'activite', visibilite: true },
    include: {
      activite: { include: { validation: true, clubs: true } },
      competence_dev: { include: { competence: true } },
    },
    orderBy: { date_experience: 'desc' },
  });
}
