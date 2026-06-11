import prisma from '../config/prisma.js';
import { uploadPhoto, remplacerPhoto, supprimerPhoto } from '../utils/photo.utils.js';
import { lierCompetencesExperience, supprimerCompetencesDeveloppees, getCompetencesByExperience } from './competence.helper.js';

const parseBoolean = (value) => value === true || value === 'true' || value === '1' || value === 1;

export const creeCertification = async (etudiantId, data, file) => {
  const certExistante = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'certification', titre: data.titre, deleted_at: null },
  });
  if (certExistante) throw new Error('Certification déjà existante');

  const competencesInput = JSON.parse(data.competences || '[]');
  const visibilite = data.visibilite !== undefined ? parseBoolean(data.visibilite) : false;

  const photoUrl = file ? await uploadPhoto(file, 'certifications-photos') : null;

  let institution = null;
  if (data.nom_institution) {
    institution = await prisma.institution.findFirst({
      where: { nom: data.nom_institution },
    });
    if (!institution) throw new Error('Institution non trouvée');
  }

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.create({
      data: {
        titre: data.titre,
        date_experience: new Date(data.date),
        visibilite,
        type: 'certification',
        description: data.description,
        utilisateur_id: etudiantId,
        photo: photoUrl ?? null,
        deleted_at: null,
      },
    });

    await tx.certification.create({
      data: {
        experience_id: experience.experience_id,
        code: data.code ?? null,
        lien_URL: data.credentialUrl ?? null,
        institution_id: institution?.institution_id ?? null,
      },
    });

    await Promise.all(
      competencesInput.map(({ nom, type }) =>
        lierCompetencesExperience(tx, experience.experience_id, etudiantId, [nom], type)
      )
    );

    const result = await tx.certification.findUnique({
      where: { experience_id: experience.experience_id },
      include: {
        experience: true,
        institution: true,
      },
    });

    const competencesRangees = await getCompetencesByExperience(experience.experience_id);

    return {
      ...result,
      experience: {
        ...result.experience,
        competences: competencesRangees,
      },
    };
  });
};

export const getCertificationsByEtudiant = async (etudiantId) => {
  const certifications = await prisma.certification.findMany({
    where: { experience: { utilisateur_id: etudiantId, deleted_at: null } },
    include: {
      institution: true,
      experience: true,
    },
    orderBy: { experience: { date_experience: 'desc' } },
  });

  return Promise.all(
    certifications.map(async (certification) => {
      const competences = await getCompetencesByExperience(certification.experience_id);
      return {
        ...certification,
        experience: {
          ...certification.experience,
          competences,
        },
      };
    })
  );
};

export const editCertification = async (etudiantId, experienceId, data, file) => {
  const certExistante = await prisma.experience.findFirst({
    where: {
      utilisateur_id: etudiantId,
      type: 'certification',
      titre: data.titre,
      deleted_at: null,
      experience_id: { not: experienceId },
    },
  });
  if (certExistante) throw new Error('Certification déjà existante');

  const experienceActuelle = await prisma.experience.findFirst({
    where: { experience_id: experienceId, deleted_at: null },
    select: { photo: true },
  });

  const photoUrl = file
    ? await remplacerPhoto(file, experienceActuelle?.photo, 'certifications-photos')
    : null;

  // Chercher la nouvelle institution par nom avant la transaction (si fournie)
  let institution = null;
  if (data.nom_institution) {
    institution = await prisma.institution.findFirst({
      where: { nom: data.nom_institution },
    });
    if (!institution) throw new Error('Institution non trouvée');
  }

  return await prisma.$transaction(async (tx) => {
    const experience = await tx.experience.findFirst({
      where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'certification', deleted_at: null },
      include: {
        certification: true,
        competence_dev: true,
      },
    });

    if (!experience) throw new Error('Certification non trouvée');

    const visibilite = data.visibilite !== undefined
      ? parseBoolean(data.visibilite)
      : experience.visibilite;

    await tx.experience.update({
      where: { experience_id: experienceId },
      data: {
        titre: data.titre ?? experience.titre,
        date_experience: data.date ? new Date(data.date) : experience.date_experience,
        description: data.description ?? experience.description,
        visibilite,
        photo: photoUrl ?? experience.photo,
      },
    });

    await tx.certification.update({
      where: { experience_id: experienceId },
      data: {
        code: data.code ?? experience.certification.code,
        lien_URL: data.credentialUrl ?? experience.certification.lien_URL,
        institution_id: institution?.institution_id ?? experience.certification.institution_id,
      },
    });

    if (data.competences !== undefined) {
      const competencesInput = JSON.parse(data.competences || '[]');
      await supprimerCompetencesDeveloppees(tx, experienceId, etudiantId);
      await Promise.all(
        competencesInput.map(({ nom, type }) =>
          lierCompetencesExperience(tx, experienceId, etudiantId, [nom], type)
        )
      );
    }

    const result = await tx.certification.findUnique({
      where: { experience_id: experienceId },
      include: {
        experience: true,
        institution: true,
      },
    });

    const competences = await getCompetencesByExperience(experienceId);

    return {
      ...result,
      experience: {
        ...result.experience,
        competences,
      },
    };
  });
};

export const supprimerCertificationService = async (etudiantId, experienceId) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'certification', deleted_at: null },
    select: { photo: true },
  });

  if (!experience) throw new Error('Certification non trouvée');

  await supprimerPhoto(experience.photo, 'certifications-photos');

  await prisma.experience.update({
    where: { experience_id: experienceId },
    data: { deleted_at: new Date() },
  });
};

export const updateVisibiliteCertificationService = async (etudiantId, experienceId, visibilite) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'certification', deleted_at: null },
  });

  if (!experience) throw new Error('Certification non trouvée');

  return prisma.experience.update({
    where: { experience_id: experienceId },
    data: { visibilite },
    select: { experience_id: true, visibilite: true },
  });
};

export const getCertificationsVisiblesByEtudiant = async (etudiantId) => {
  const certifications = await prisma.experience.findMany({
    where: {
      utilisateur_id: etudiantId,
      type: 'certification',
      visibilite: true,
      deleted_at: null,
    },
    include: {
      certification: {
        include: {
          institution: true,
        },
      },
    },
    orderBy: { date_experience: 'desc' },
  });

  return Promise.all(
    certifications.map(async (certification) => {
      const competences = await getCompetencesByExperience(certification.experience_id);
      return {
        ...certification,
        competences,
      };
    })
  );
};