import prisma from '../config/prisma.js';

// Ce include centralise les relations utiles a renvoyer apres creation,
// lecture et validation d'une activite.
const ACTIVITY_INCLUDE = {
  experience: {
    include: {
      documentations: true,
      competences: true,
    },
  },
  validation: {
    include: {
      institution: true,
    },
  },
};

const REVIEW_STATUSES = ['valide', 'refuse'];

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function isAcademicActivityData(data) {
  return normalizeText(data?.activiteType) === 'academique';
}

// Double protection cote service: on ne depend pas uniquement du middleware.
async function ensureStudent(user) {
  if (!user?.utilisateur_id) {
    throw createHttpError(401, 'Utilisateur non authentifie');
  }

  if (user.role !== 'etudiant') {
    throw createHttpError(403, 'Acces reserve aux etudiants');
  }

  const student = await prisma.etudiant.findUnique({
    where: {
      etudiant_utilisateur_id: user.utilisateur_id,
    },
  });

  if (!student) {
    throw createHttpError(403, 'Compte etudiant introuvable');
  }

  return student;
}

async function ensureUserRoleRecord(user, expectedRole, modelName, idField, notFoundMessage) {
  if (!user?.utilisateur_id) {
    throw createHttpError(401, 'Utilisateur non authentifie');
  }

  if (user.role !== expectedRole) {
    throw createHttpError(403, `Acces reserve aux ${expectedRole}s`);
  }

  const record = await prisma[modelName].findUnique({
    where: {
      [idField]: user.utilisateur_id,
    },
  });

  if (!record) {
    throw createHttpError(403, notFoundMessage);
  }

  return record;
}

async function ensurePersonalActivityAuthor(user) {
  if (!user?.utilisateur_id) {
    throw createHttpError(401, 'Utilisateur non authentifie');
  }

  if (user.role === 'etudiant') {
    await ensureStudent(user);
    return 'etudiant';
  }

  if (user.role === 'professionnel') {
    await ensureUserRoleRecord(
      user,
      'professionnel',
      'professionnel',
      'professionnel_utilisateur_id',
      'Compte professionnel introuvable'
    );
    return 'professionnel';
  }

  throw createHttpError(
    403,
    'Acces reserve aux etudiants et professionnels pour les activites personnelles'
  );
}

// Meme principe pour la validation admin: le service reste securise
// meme si la route ou le middleware etaient contournes.
function ensureAdmin(user) {
  if (!user?.utilisateur_id) {
    throw createHttpError(401, 'Utilisateur non authentifie');
  }

  if (user.role !== 'administrateur') {
    throw createHttpError(403, 'Acces reserve aux administrateurs');
  }
}

async function ensureActivityOwnership(experienceId, userId) {
  const activite = await prisma.activite.findUnique({
    where: {
      experience_id: experienceId,
    },
    include: {
      experience: true,
      validation: true,
    },
  });

  if (!activite) {
    throw createHttpError(404, 'Activite introuvable');
  }

  if (activite.experience.utilisateur_id !== userId) {
    throw createHttpError(403, "Acces refuse a cette activite");
  }

  return activite;
}

async function ensureInstitutionExists(institutionId) {
  const institution = await prisma.institution.findUnique({
    where: {
      institution_id: institutionId,
    },
  });

  if (!institution) {
    throw createHttpError(404, 'Institution introuvable');
  }

  return institution;
}

async function ensureStudentInstitutionLink(userId, institutionId) {
  const studentInstitution = await prisma.valideEtudiant.findUnique({
    where: {
      utilisateur_id_institution_id: {
        utilisateur_id: userId,
        institution_id: institutionId,
      },
    },
  });

  if (!studentInstitution) {
    throw createHttpError(
      403,
      "Cette institution n'est pas liee a l'etudiant"
    );
  }

  return studentInstitution;
}

async function attachCompetences(tx, experienceId, competences) {
  for (const item of normalizeArray(competences)) {
    const nom = typeof item === 'string'
      ? item.trim()
      : normalizeText(item?.nom);

    if (!nom) {
      continue;
    }

    const competence = await tx.competence.create({
      data: {
        nom,
        type: typeof item === 'object' ? normalizeText(item.type) || null : null,
        niveau: typeof item === 'object' ? normalizeText(item.niveau) || null : null,
        description: typeof item === 'object'
          ? normalizeText(item.description) || null
          : null,
      },
    });

    await tx.experience.update({
      where: {
        experience_id: experienceId,
      },
      data: {
        competences: {
          connect: {
            competence_id: competence.competence_id,
          },
        },
      },
    });
  }
}

async function attachDocumentations(tx, experienceId, documentations) {
  const docs = normalizeArray(documentations)
    .map((doc) => ({
      captures: normalizeText(doc?.captures) || null,
      pdf: normalizeText(doc?.pdf) || null,
      experience_id: experienceId,
    }))
    .filter((doc) => doc.captures || doc.pdf);

  if (docs.length === 0) {
    return;
  }

  await tx.documentation.createMany({
    data: docs,
  });
}

async function createBaseActivity(tx, data, userId) {
  const titre = normalizeText(data?.titre);
  const description = normalizeText(data?.description);
  const type = normalizeText(data?.type);
  const lieu = normalizeText(data?.lieu);

  if (!titre || !type || !lieu) {
    throw createHttpError(400, 'Les champs titre, type et lieu sont obligatoires');
  }

  const dateExperience = data?.date_experience
    ? new Date(data.date_experience)
    : new Date();

  if (Number.isNaN(dateExperience.getTime())) {
    throw createHttpError(400, 'date_experience invalide');
  }

  const experience = await tx.experience.create({
    data: {
      titre,
      description: description || null,
      date_experience: dateExperience,
      visibilite: false,
      type: 'activite',
      utilisateur_id: userId,
    },
  });

  await tx.activite.create({
    data: {
      experience_id: experience.experience_id,
      type,
      lieu,
    },
  });

  await attachCompetences(tx, experience.experience_id, data?.competences);
  await attachDocumentations(tx, experience.experience_id, data?.documentations);

  return experience.experience_id;
}

export async function createPersonalActivityService(data, user) {
  await ensurePersonalActivityAuthor(user);

  return prisma.$transaction(async (tx) => {
    const experienceId = await createBaseActivity(tx, data, user.utilisateur_id);

    return tx.activite.findUnique({
      where: {
        experience_id: experienceId,
      },
      include: ACTIVITY_INCLUDE,
    });
  });
}

export async function createAcademicActivityService(data, user) {
  await ensureStudent(user);

  const institutionId = normalizeText(data?.institutionId);
  if (!institutionId) {
    throw createHttpError(400, 'institutionId est obligatoire pour une activite academique');
  }

  await ensureInstitutionExists(institutionId);
  await ensureStudentInstitutionLink(user.utilisateur_id, institutionId);

  return prisma.$transaction(async (tx) => {
    const experienceId = await createBaseActivity(tx, data, user.utilisateur_id);

    await tx.valideActivite.create({
      data: {
        experience_id: experienceId,
        institution_id: institutionId,
        statut: 'en_attente',
        date_d_action: new Date(),
        commentaire: normalizeText(data?.commentaire) || null,
      },
    });

    return tx.activite.findUnique({
      where: {
        experience_id: experienceId,
      },
      include: ACTIVITY_INCLUDE,
    });
  });
}

export async function createActivite(data, user) {
  if (isAcademicActivityData(data)) {
    return createAcademicActivityService(data, user);
  }

  return createPersonalActivityService(data, user);
}

export async function submitActivityForValidationService(experienceId, data, user) {
  await ensureStudent(user);

  if (!experienceId) {
    throw createHttpError(400, "Identifiant d'activite manquant");
  }

  const institutionId = normalizeText(data?.institutionId);
  if (!institutionId) {
    throw createHttpError(400, 'institutionId est obligatoire');
  }

  await ensureInstitutionExists(institutionId);
  await ensureStudentInstitutionLink(user.utilisateur_id, institutionId);
  const activite = await ensureActivityOwnership(experienceId, user.utilisateur_id);

  return prisma.$transaction(async (tx) => {
    if (activite.validation) {
      await tx.valideActivite.update({
        where: {
          experience_id: experienceId,
        },
        data: {
          institution_id: institutionId,
          statut: 'en_attente',
          date_d_action: new Date(),
          commentaire: normalizeText(data?.commentaire) || null,
        },
      });
    } else {
      await tx.valideActivite.create({
        data: {
          experience_id: experienceId,
          institution_id: institutionId,
          statut: 'en_attente',
          date_d_action: new Date(),
          commentaire: normalizeText(data?.commentaire) || null,
        },
      });
    }

    await tx.experience.update({
      where: {
        experience_id: experienceId,
      },
      data: {
        visibilite: false,
      },
    });

    return tx.activite.findUnique({
      where: {
        experience_id: experienceId,
      },
      include: ACTIVITY_INCLUDE,
    });
  });
}

export async function getMesActivitesService(user) {
  await ensurePersonalActivityAuthor(user);

  // Cette route concerne "mes activites", donc elle retourne tout pour l'etudiant
  // ou le professionnel connecte, y compris les activites non encore visibles publiquement.
  return prisma.activite.findMany({
    where: {
      experience: {
        utilisateur_id: user.utilisateur_id,
      },
    },
    include: ACTIVITY_INCLUDE,
    orderBy: {
      experience: {
        date_experience: 'desc',
      },
    },
  });
}

export async function updateValidationActiviteService(experienceId, data, user) {
  ensureAdmin(user);

  if (!experienceId) {
    throw createHttpError(400, "Identifiant d'activite manquant");
  }

  const statut = normalizeText(data?.statut);
  const commentaire = normalizeText(data?.commentaire) || null;

  if (!REVIEW_STATUSES.includes(statut)) {
    throw createHttpError(400, 'Statut de validation invalide');
  }

  const activite = await prisma.activite.findUnique({
    where: {
      experience_id: experienceId,
    },
    include: ACTIVITY_INCLUDE,
  });

  if (!activite) {
    throw createHttpError(404, 'Activite introuvable');
  }

  if (!activite.validation) {
    throw createHttpError(
      400,
      "Cette activite ne dispose pas d'une validation administrable"
    );
  }

  return prisma.$transaction(async (tx) => {
    // Mise a jour du statut administratif de l'activite.
    await tx.valideActivite.update({
      where: {
        experience_id: experienceId,
      },
      data: {
        statut,
        commentaire,
        date_d_action: new Date(),
      },
    });

    // Une activite validee devient visible, une activite refusee ou en attente ne l'est pas.
    await tx.experience.update({
      where: {
        experience_id: experienceId,
      },
      data: {
        visibilite: statut === 'valide',
      },
    });

    // On renvoie la version finale de l'activite apres validation.
    return tx.activite.findUnique({
      where: {
        experience_id: experienceId,
      },
      include: ACTIVITY_INCLUDE,
    });
  });
}

export async function getPortfolioPublicActivitiesService(etudiantId) {
  const userId = normalizeText(etudiantId);

  if (!userId) {
    throw createHttpError(400, "Identifiant d'etudiant manquant");
  }

  return prisma.activite.findMany({
    where: {
      experience: {
        utilisateur_id: userId,
        type: 'activite',
        visibilite: true,
      },
      validation: {
        is: {
          statut: 'valide',
        },
      },
    },
    include: ACTIVITY_INCLUDE,
    orderBy: {
      experience: {
        date_experience: 'desc',
      },
    },
  });
}
