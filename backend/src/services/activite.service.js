import prisma from '../config/prisma.js';

// Include commun pour renvoyer une activite avec ses relations utiles.
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

function normalizeNullableText(value) {
  const text = normalizeText(value);
  return text || null;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  return fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function ensureAuthenticated(user) {
  if (!user?.utilisateur_id) {
    throw createHttpError(401, 'Utilisateur non authentifie');
  }
}

async function ensureStudent(user) {
  // On protege la logique academique avec une double verification:
  // role utilisateur + existence reelle dans la table etudiants.
  ensureAuthenticated(user);

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

async function ensureAdmin(user) {
  // Meme principe pour l'admin: le service reste securise
  // meme si la route change plus tard.
  ensureAuthenticated(user);

  if (user.role !== 'administrateur') {
    throw createHttpError(403, 'Acces reserve aux administrateurs');
  }

  const admin = await prisma.administrateur.findUnique({
    where: {
      admin_utilisateur_id: user.utilisateur_id,
    },
  });

  if (!admin) {
    throw createHttpError(403, 'Compte administrateur introuvable');
  }

  return admin;
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
  // Une activite academique n'est autorisee que si l'etudiant
  // est bien lie a l'institution concernee.
  const studentInstitution = await prisma.valideEtudiant.findUnique({
    where: {
      utilisateur_id_institution_id: {
        utilisateur_id: userId,
        institution_id: institutionId,
      },
    },
  });

  if (!studentInstitution) {
    throw createHttpError(403, "Cette institution n'est pas liee a l'etudiant");
  }

  return studentInstitution;
}

async function attachCompetences(tx, experienceId, competences) {
  // On cree les competences puis on les connecte a l'experience
  // dans la meme transaction pour garder des donnees coherentes.
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
        type: typeof item === 'object' ? normalizeNullableText(item.type) : null,
        niveau: typeof item === 'object' ? normalizeNullableText(item.niveau) : null,
        description: typeof item === 'object'
          ? normalizeNullableText(item.description)
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

async function attachDocumentations(tx, experienceId, entries) {
  // Les preuves restent optionnelles: on ignore simplement les entrees vides.
  const docs = normalizeArray(entries)
    .map((entry) => ({
      captures: normalizeNullableText(entry?.captures),
      pdf: normalizeNullableText(entry?.pdf),
      experience_id: experienceId,
    }))
    .filter((entry) => entry.captures || entry.pdf);

  if (docs.length === 0) {
    return;
  }

  await tx.documentation.createMany({
    data: docs,
  });
}

function buildBaseActivityPayload(data, userId, isAcademic) {
  const titre = normalizeText(data?.titre);
  const description = normalizeNullableText(data?.description);
  const type = normalizeNullableText(data?.type);
  const lieu = normalizeNullableText(data?.lieu);
  const requestedVisibility = normalizeBoolean(
    data?.visibilite ?? data?.visibleToEveryone,
    false
  );

  if (!titre || !type || !lieu) {
    throw createHttpError(400, 'Les champs titre, type et lieu sont obligatoires');
  }

  const dateExperience = data?.date_experience
    ? new Date(data.date_experience)
    : new Date();

  if (Number.isNaN(dateExperience.getTime())) {
    throw createHttpError(400, 'date_experience invalide');
  }

  // Une activite academique n'est jamais visible a la creation.
  // Une activite personnelle peut suivre le choix de l'utilisateur.
  return {
    experience: {
      titre,
      description,
      date_experience: dateExperience,
      visibilite: isAcademic ? false : requestedVisibility,
      type: 'activite',
      utilisateur_id: userId,
    },
    activite: {
      type,
      lieu,
    },
  };
}

export async function createActivite(data, user) {
  ensureAuthenticated(user);

  const typeActivite = normalizeText(data?.typeActivite).toLowerCase();
  if (!typeActivite || !['personnelle', 'academique'].includes(typeActivite)) {
    throw createHttpError(400, 'typeActivite doit etre "personnelle" ou "academique"');
  }

  if (typeActivite === 'personnelle') {
    // Cas personnel: etudiant ou professionnel autorise.
    if (!['etudiant', 'professionnel'].includes(user.role)) {
      throw createHttpError(
        403,
        'Acces reserve aux etudiants et professionnels pour une activite personnelle'
      );
    }
  } else {
    // Cas academique: reserve a l'etudiant et controle de l'institution.
    await ensureStudent(user);

    const institutionId = normalizeText(data?.institutionId);
    if (!institutionId) {
      throw createHttpError(400, 'institutionId est obligatoire pour une activite academique');
    }

    await ensureInstitutionExists(institutionId);
    await ensureStudentInstitutionLink(user.utilisateur_id, institutionId);
  }

  return prisma.$transaction(async (tx) => {
    const isAcademic = typeActivite === 'academique';
    const payload = buildBaseActivityPayload(data, user.utilisateur_id, isAcademic);
    const competences = normalizeArray(data?.competences);
    const documentations = normalizeArray(data?.documentations);

    // 1. On cree d'abord l'experience mere.
    const experience = await tx.experience.create({
      data: payload.experience,
    });

    // 2. Puis la specialisation activite reliee a cette experience.
    await tx.activite.create({
      data: {
        experience_id: experience.experience_id,
        ...payload.activite,
      },
    });

    // 3. Les pieces optionnelles sont rattachees ensuite.
    await attachCompetences(tx, experience.experience_id, competences);
    await attachDocumentations(tx, experience.experience_id, documentations);

    if (isAcademic) {
      // Une activite academique cree automatiquement une demande de validation.
      await tx.valideActivite.create({
        data: {
          experience_id: experience.experience_id,
          institution_id: normalizeText(data.institutionId),
          statut: 'en_attente',
          commentaire: normalizeNullableText(data?.commentaire),
          date_d_action: new Date(),
        },
      });
    }

    // 4. On relit la version finale avec les relations utiles pour la reponse API.
    return tx.activite.findUnique({
      where: {
        experience_id: experience.experience_id,
      },
      include: ACTIVITY_INCLUDE,
    });
  });
}

export async function getMesActivitesService(user) {
  ensureAuthenticated(user);

  // Cette route sert au tableau de bord personnel, pas au portfolio public.
  if (!['etudiant', 'professionnel'].includes(user.role)) {
    throw createHttpError(403, 'Acces reserve aux etudiants et professionnels');
  }

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
  await ensureAdmin(user);

  if (!experienceId) {
    throw createHttpError(400, "Identifiant d'activite manquant");
  }

  const statut = normalizeText(data?.statut).toLowerCase();
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
    throw createHttpError(400, "Cette activite ne dispose pas d'une validation administrable");
  }

  return prisma.$transaction(async (tx) => {
    // On garde le statut, le commentaire et la date de decision au meme endroit.
    await tx.valideActivite.update({
      where: {
        experience_id: experienceId,
      },
      data: {
        statut,
        commentaire: normalizeNullableText(data?.commentaire),
        date_d_action: new Date(),
      },
    });

    // La visibilite publique depend directement de la decision admin.
    await tx.experience.update({
      where: {
        experience_id: experienceId,
      },
      data: {
        visibilite: statut === 'valide',
      },
    });

    // On renvoie l'activite finale apres mise a jour.
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
      OR: [
        // Activite personnelle visible: pas de validation, mais deja publique.
        {
          validation: {
            is: null,
          },
        },
        // Activite academique: visible seulement apres validation admin positive.
        {
          validation: {
            is: {
              statut: 'valide',
            },
          },
        },
      ],
    },
    include: ACTIVITY_INCLUDE,
    orderBy: {
      experience: {
        date_experience: 'desc',
      },
    },
  });
}
