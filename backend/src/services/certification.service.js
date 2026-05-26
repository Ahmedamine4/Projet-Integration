import prisma from '../config/prisma.js';
import { supabase } from '../config/supabase.js';

export const uploadPhoto = async (file) => {
  const fileName = `${Date.now()}_${file.originalname}`;

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
      },
    });

    const certification = await tx.certification.create({
      data: {
        experience_id: experience.experience_id,
        code: data.code ,
        lien_URL: data.credentialUrl ,
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
    if (photoUrl) {
      documentation = await tx.documentation.create({
        data: { captures: photoUrl, experience_id: experience.experience_id },
      });
    }

    return tx.certification.findUnique({
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

export const getCertificationsByEtudiant = async (etudiantId) => {
  return prisma.certification.findMany({
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
        competences: true,
        documentations: true,
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

    if (photoUrl) {
      const docExistante = await tx.documentation.findFirst({ where: { experience_id: experienceId } });
      if (docExistante) {
        await tx.documentation.update({
          where: { documentation_id: docExistante.documentation_id },
          data: { captures: photoUrl },
        });
      } else {
        await tx.documentation.create({
          data: { captures: photoUrl, experience_id: experienceId },
        });
      }
    }

    return tx.certification.findUnique({
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
      certification: { include: { validation: true } },
      competences: true,
      documentations: true,
    },
    orderBy: { date_experience: 'desc' },
  });
};