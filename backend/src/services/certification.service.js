import prisma from '../config/prisma.js';
import { uploadPhoto, remplacerPhoto, supprimerPhoto } from '../utils/photo.utils.js';
import { lierCompetencesExperience, supprimerCompetencesDeveloppees } from './competence.helper.js';


export const creeCertification = async (etudiantId, data, file) => {
  const certExistante = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'certification', titre: data.titre },
  });
  if (certExistante) throw new Error('Certification déjà existante');

  const competences = JSON.parse(data.competences || '[]');

  const photoUrl = file ? await uploadPhoto(file, 'certifications-photos') : null;

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.titre,
        date_experience: new Date(data.date),
        visibilite: false,
        type: 'certification',
        description: data.description,
        utilisateur_id: etudiantId,
        photo: photoUrl ?? null,
      },
    });

    await tx.certification.create({
      data: {
        experience_id: experience.experience_id,
        code: data.code,
        lien_URL: data.credentialUrl,
      },
    });

    await Promise.all(
      competences.map(({ nom, type }) =>
        lierCompetencesExperience(tx, experience.experience_id, etudiantId, [nom], type)
      )
    );

    return tx.certification.findUnique({
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

export const getCertificationsByEtudiant = async (etudiantId) => {
  return prisma.certification.findMany({
    where: { experience: { utilisateur_id: etudiantId } },
    include: {
      validation: {
        include: {
          institution: true,
        },
      },
      experience: {
        include: {
          competence_dev: { include: { competence: true } },
        },
      },
    },
    orderBy: { experience: { date_experience: 'desc' } },
  });
};

export const editCertification = async (etudiantId, experienceId, data, file) => {
  const certExistante = await prisma.experience.findFirst({
    where: {
      utilisateur_id: etudiantId,
      type: 'certification',
      titre: data.titre,
      experience_id: { not: experienceId },
    },
  });
  if (certExistante) throw new Error('Certification déjà existante');

  const experienceActuelle = await prisma.experience.findFirst({
    where: { experience_id: experienceId },
    select: { photo: true },
  });

  const photoUrl = file
    ? await remplacerPhoto(file, experienceActuelle?.photo, 'certifications-photos')
    : null;

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.findFirst({
      where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'certification' },
      include: {
        certification: true,
        competence_dev: true,
      },
    });

    if (!experience) throw new Error('Certification non trouvée');

    await tx.experience.update({
      where: { experience_id: experienceId },
      data: {
        titre: data.titre ?? experience.titre,
        date_experience: data.date ? new Date(data.date) : experience.date_experience,
        description: data.description ?? experience.description,
        visibilite: false,
        photo: photoUrl ?? experience.photo,
      },
    });

    await tx.certification.update({
      where: { experience_id: experienceId },
      data: {
        code: data.code ?? experience.certification.code,
        lien_URL: data.credentialUrl ?? experience.certification.lien_URL,
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

    return tx.certification.findUnique({
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

export const supprimerCertificationService = async (etudiantId, experienceId) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'certification' },
    select: { photo: true },
  });

  if (!experience) throw new Error('Certification non trouvée');

  
  await supprimerPhoto(experience.photo, 'certifications-photos');

  
  await prisma.experience.delete({
    where: { experience_id: experienceId },
  });
};

export const updateVisibiliteCertificationService = async (etudiantId, experienceId, visibilite) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'certification' },
  });

  if (!experience) throw new Error('Certification non trouvée');

  return prisma.experience.update({
    where: { experience_id: experienceId },
    data: { visibilite },
    select: { experience_id: true, visibilite: true },
  });
};

export const getCertificationsVisiblesByEtudiant = async (etudiantId) => {
  return prisma.experience.findMany({
    where: { utilisateur_id: etudiantId, type: 'certification', visibilite: true },
    include: {
      certification: {
        include: {
          validation: {
            include: {
              institution: true,
            },
          },
        },
      },
      competence_dev: { include: { competence: true } },
    },
    orderBy: { date_experience: 'desc' },
  });
};