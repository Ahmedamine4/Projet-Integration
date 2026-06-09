import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';
import { lierCompetencesExperience, supprimerCompetencesDeveloppees } from './competence.helper.js';
import { creerNotification } from './notification.service.js';
<<<<<<< Updated upstream
export const uploadPhoto = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;
=======
>>>>>>> Stashed changes

  const { error } = await supabase.storage
    .from('certifications-photos')
    .upload(fileName, file.buffer, { contentType: file.mimetype });

  if (error) throw new Error('Erreur upload photo : ' + error.message);

  const { data } = supabase.storage
    .from('certifications-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const creeCertification = async (etudiantId, data, photoUrl) => {
  const certExistante = await prisma.experience.findFirst({
    where: { utilisateur_id: etudiantId, type: 'certification', titre: data.titre },
  });
  if (certExistante) throw new Error('Certification déjà existante');

  const competences = JSON.parse(data.competences || '[]');

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

    const certification = await tx.certification.create({
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

export const editCertification = async (etudiantId, experienceId, data, photoUrl) => {
  const certExistante = await prisma.experience.findFirst({
    where: {
      utilisateur_id: etudiantId,
      type: 'certification',
      titre: data.titre,
      experience_id: { not: experienceId },
    },
  });
  if (certExistante) throw new Error('Certification déjà existante');

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

export const updateVisibiliteCertificationService = async (etudiantId, experienceId, visibilite) => {
  const experience = await prisma.experience.findFirst({
    where: { experience_id: experienceId, utilisateur_id: etudiantId, type: 'certification' },
  });

  if (!experience) throw new Error('Certification non trouvée');

  const updated = await prisma.experience.update({
    where: { experience_id: experienceId },
    data: { visibilite },
    select: { experience_id: true, visibilite: true },
  });
<<<<<<< Updated upstream

  await creerNotification(
    etudiantId,
    'La visibilite de votre certification a ete mise a jour.',
    'portfolio_visibility',
    { utilisateurSourceId: etudiantId }
  );

  return updated;
};


=======

  await creerNotification(
    etudiantId,
    'La visibilite de votre certification a ete mise a jour.',
    'portfolio_visibility',
    { utilisateurSourceId: etudiantId }
  );

  return updated;
};
>>>>>>> Stashed changes
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
