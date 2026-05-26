import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';

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

export const creeActivite = async (etudiantId, data, imageUrl) => {
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
        tx.competence.create({
          data: {
            type,
            nom,
            experiences: { connect: { experience_id: experience.experience_id } },
          },
        })
      )
    );

    let documentation = null;
    if (imageUrl) {
      documentation = await tx.documentation.create({
        data: { captures: imageUrl, experience_id: experience.experience_id },
      });
    }

    return await tx.activite.findUnique({
      where: { experience_id: experience.experience_id },
      include: {
        experience: {
          include: {
            competences: true,
            documentations: true,
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
      experience: {
        include: {
          competences: true,
          documentations: true,
        },
      },
    },
    orderBy: { experience: { date_experience: 'desc' } },
  });
};

export const editActivite = async (etudiantId, experienceId, data, imageUrl) => {
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
        competences: true,
        documentations: true,
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

      await tx.competence.deleteMany({
        where: { experiences: { some: { experience_id: experienceId } } },
      });

      await Promise.all(
        competences.map(({ nom, type }) =>
          tx.competence.create({
            data: {
              type,
              nom,
              experiences: { connect: { experience_id: experienceId } },
            },
          })
        )
      );
    }

    if (imageUrl) {
      const docExistante = await tx.documentation.findFirst({ where: { experience_id: experienceId } });
      if (docExistante) {
        await tx.documentation.update({
          where: { documentation_id: docExistante.documentation_id },
          data: { captures: imageUrl },
        });
      } else {
        await tx.documentation.create({
          data: { captures: imageUrl, experience_id: experienceId },
        });
      }
    }

    return tx.activite.findUnique({
      where: { experience_id: experienceId },
      include: {
        experience: {
          include: {
            competences: true,
            documentations: true,
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
};

export async function getActivitesVisiblesByEtudiant(etudiantId) {
  return prisma.experience.findMany({
    where: { utilisateur_id: etudiantId, type: 'activite', visibilite: true },
    include: {
      activite: { include: { validation: true, clubs: true } },
      competences: true,
      documentations: true,
    },
    orderBy: { date_experience: 'desc' },
  });
}