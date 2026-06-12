import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';

// ─── Constantes ───────────────────────────────────────────────────────────────
const DEFAULT_LIMIT_STUDENTS_TOP  = 5;
const DEFAULT_LIMIT_SUGGESTIONS   = 5;
const DEFAULT_LIMIT_EXPERIENCES   = 10;
const POOL_SIZE_EXPERIENCES       = 300;
const RANDOM_JITTER_MAX           = 6;

const toPositiveInt = (val, def) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

/** Retourne les utilisateur_id que le professionnel suit */
async function getProfessionnelFollowingIds(professionnelId) {
  const rows = await prisma.follow.findMany({
    where: { followerId: professionnelId },
    select: { followingId: true },
  });
  return new Set(rows.map((r) => r.followingId));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) Étudiants aléatoires – bandeau haut
//    Tous les étudiants non bloqués (hors soi-même), ordre aléatoire.
//    Renvoie : nom, prénom, photo, a_propos, niveau, institution principale.
// ─────────────────────────────────────────────────────────────────────────────
export const getProfessionnelFeedStudentsTop = async (professionnelId, { page, limit } = {}) => {
  const pageNum  = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_STUDENTS_TOP);
  const skip     = (pageNum - 1) * pageSize;

  const total = await prisma.utilisateur.count({
    where: {
      utilisateur_id: { not: professionnelId },
      bloque: false,
      role: 'etudiant',
    },
  });

  // Ordre aléatoire côté PostgreSQL pour varier à chaque appel
  const randomRows = await prisma.$queryRaw(
    Prisma.sql`
      SELECT utilisateur_id FROM utilisateurs
      WHERE bloque = false
        AND role = 'etudiant'
        AND utilisateur_id != ${professionnelId}
      ORDER BY random()
      OFFSET ${skip} LIMIT ${pageSize}
    `
  );
  const ids = randomRows.map((r) => r.utilisateur_id);

  const utilisateursData = ids.length
    ? await prisma.utilisateur.findMany({
        where: { utilisateur_id: { in: ids } },
        select: {
          utilisateur_id: true,
          nom: true,
          prenom: true,
          photo: true,
          a_propos: true,
          etudiant: {
            select: {
              niveau: true,
              institutions: {
                select: { institution: { select: { nom: true } } },
                take: 1,
              },
            },
          },
        },
      })
    : [];

  const byId = new Map(utilisateursData.map((u) => [u.utilisateur_id, u]));

  const data = ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((u) => ({
      utilisateur_id: u.utilisateur_id,
      nom: u.nom,
      prenom: u.prenom,
      photo: u.photo,
      a_propos: u.a_propos,
      niveau: u.etudiant?.niveau ?? null,
      institution: u.etudiant?.institutions?.[0]?.institution?.nom ?? null,
    }));

  return {
    data,
    pagination: {
      page: pageNum,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 2) Suggestions d'étudiants non suivis – colonne droite
//    Étudiants que le professionnel ne suit pas encore, ordre aléatoire.
// ─────────────────────────────────────────────────────────────────────────────
export const getProfessionnelFeedSuggestions = async (professionnelId, { page, limit } = {}) => {
  const pageNum  = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_SUGGESTIONS);
  const skip     = (pageNum - 1) * pageSize;

  const followingIds = await getProfessionnelFollowingIds(professionnelId);
  const excludeIds   = [professionnelId, ...followingIds];

  const total = await prisma.utilisateur.count({
    where: {
      utilisateur_id: { notIn: excludeIds },
      bloque: false,
      role: 'etudiant',
    },
  });

  const randomRows = await prisma.$queryRaw(
    Prisma.sql`
      SELECT utilisateur_id FROM utilisateurs
      WHERE bloque = false
        AND role = 'etudiant'
        AND utilisateur_id NOT IN (${Prisma.join(excludeIds.length ? excludeIds : ['__none__'])})
      ORDER BY random()
      OFFSET ${skip} LIMIT ${pageSize}
    `
  );
  const ids = randomRows.map((r) => r.utilisateur_id);

  const utilisateursData = ids.length
    ? await prisma.utilisateur.findMany({
        where: { utilisateur_id: { in: ids } },
        select: {
          utilisateur_id: true,
          nom: true,
          prenom: true,
          photo: true,
          etudiant: {
            select: {
              niveau: true,
              institutions: {
                select: { institution: { select: { nom: true } } },
                take: 1,
              },
            },
          },
        },
      })
    : [];

  const byId = new Map(utilisateursData.map((u) => [u.utilisateur_id, u]));

  const data = ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((u) => ({
      utilisateur_id: u.utilisateur_id,
      nom: u.nom,
      prenom: u.prenom,
      photo: u.photo,
      sous_titre:
        u.etudiant?.institutions?.[0]?.institution?.nom ??
        u.etudiant?.niveau ??
        null,
    }));

  return {
    data,
    pagination: {
      page: pageNum,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 3) Expériences scorées – fil central
//
// Score :
//   - Suivi par le professionnel      : +25 pts
//   - Portfolio (score_credibilite)   : 0-15 pts  (normalisé)
//   - Engagement (likes/commentaires) : 0-10 pts
//   - Récence                         : 0-10 pts
//   - Jitter aléatoire                : 0-6  pts
//
// Filtres :
//   technologie, domaine, following (mes abonnements), trending (meilleur portfolio)
// ─────────────────────────────────────────────────────────────────────────────
export const getProfessionnelFeedExperiences = async (
  professionnelId,
  { page, limit, technologie, domaine, following: followingFilter, trending } = {}
) => {
  const pageNum  = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_EXPERIENCES);
  const skip     = (pageNum - 1) * pageSize;

  const isFollowingOnly = String(followingFilter).toLowerCase() === 'true';
  const isTrending      = String(trending).toLowerCase() === 'true';

  const followingIds = await getProfessionnelFollowingIds(professionnelId);

  // ── Filtre Prisma ─────────────────────────────────────────────────────────
  const where = {
    visibilite: true,
    is_draft: false,
    deleted_at: null,
    utilisateur_id: { not: professionnelId },
  };

  if (isFollowingOnly) {
    const ids = [...followingIds];
    where.utilisateur_id = { in: ids.length > 0 ? ids : ['__none__'] };
  }

  if (technologie && domaine) {
    where.AND = [
      ...(where.AND ?? []),
      {
        competence_dev: {
          some: {
            competence: { type: 'technologie', nom: { equals: technologie, mode: 'insensitive' } },
          },
        },
      },
      {
        competence_dev: {
          some: {
            competence: { type: 'domaine', nom: { equals: domaine, mode: 'insensitive' } },
          },
        },
      },
    ];
  } else if (technologie) {
    where.competence_dev = {
      some: {
        competence: { type: 'technologie', nom: { equals: technologie, mode: 'insensitive' } },
      },
    };
  } else if (domaine) {
    where.competence_dev = {
      some: {
        competence: { type: 'domaine', nom: { equals: domaine, mode: 'insensitive' } },
      },
    };
  }

  // ── Pool d'expériences ────────────────────────────────────────────────────
  const [experiencesPool, total] = await Promise.all([
    prisma.experience.findMany({
      where,
      select: {
        experience_id: true,
        titre: true,
        description: true,
        photo: true,
        type: true,
        type_specifique: true,
        date_experience: true,
        utilisateur_id: true,
        etudiant: {
          select: {
            utilisateur: {
              select: {
                utilisateur_id: true,
                nom: true,
                prenom: true,
                photo: true,
              },
            },
            institutions: {
              select: { institution: { select: { nom: true } } },
              take: 1,
            },
            portfolio: { select: { score_credibilite: true } },
          },
        },
        competence_dev: {
          select: {
            competence: { select: { competence_id: true, nom: true, type: true } },
          },
        },
        interactions: {
          where: { type: { in: ['like', 'commentaire'] } },
          select: { type: true },
        },
      },
      orderBy: { date_experience: 'desc' },
      take: POOL_SIZE_EXPERIENCES,
    }),
    prisma.experience.count({ where }),
  ]);

  const now = Date.now();

  // ── Calcul du score ───────────────────────────────────────────────────────
  const experiencesScored = experiencesPool.map((exp) => {
    let score = 0;
    const breakdown = {};

    const auteur         = exp.etudiant?.utilisateur;
    const portfolioScore = exp.etudiant?.portfolio?.score_credibilite ?? 0;

    // a) Suivi par le professionnel
    if (followingIds.has(exp.utilisateur_id)) {
      breakdown.following = 25;
      score += 25;
    }

    // b) Portfolio crédibilité (0-15 pts)
    const portfolioBonus = Math.min(15, Math.round((portfolioScore / 100) * 15));
    if (portfolioBonus > 0) {
      breakdown.portfolio = portfolioBonus;
      score += portfolioBonus;
    }

    // c) Engagement (likes + commentaires, max 10 pts)
    const likes    = exp.interactions.filter((i) => i.type === 'like').length;
    const comments = exp.interactions.filter((i) => i.type === 'commentaire').length;
    const engagementBonus = Math.min(10, likes * 1 + comments * 2);
    if (engagementBonus > 0) {
      breakdown.engagement = engagementBonus;
      score += engagementBonus;
    }

    // d) Récence (max 10 pts, -1pt tous les 3 jours)
    let recenceBonus = 0;
    if (exp.date_experience) {
      const ageJours =
        (now - new Date(exp.date_experience).getTime()) / (1000 * 60 * 60 * 24);
      recenceBonus = Math.max(0, Math.round(10 - ageJours / 3));
    }
    if (recenceBonus > 0) {
      breakdown.recence = recenceBonus;
      score += recenceBonus;
    }

    // e) Jitter aléatoire
    const jitter = Math.floor(Math.random() * (RANDOM_JITTER_MAX + 1));
    breakdown.alea = jitter;
    score += jitter;

    const competencesExp = exp.competence_dev.map((c) => c.competence);

    return {
      experience_id: exp.experience_id,
      titre: exp.titre,
      description: exp.description,
      photo: exp.photo,
      type: exp.type,
      type_specifique: exp.type_specifique,
      date: exp.date_experience,
      auteur: auteur
        ? {
            utilisateur_id: auteur.utilisateur_id,
            nom: auteur.nom,
            prenom: auteur.prenom,
            photo: auteur.photo,
            institution: exp.etudiant?.institutions?.[0]?.institution?.nom ?? null,
          }
        : null,
      technologies: competencesExp.filter((c) => c.type === 'technologie').map((c) => c.nom),
      domaines: competencesExp.filter((c) => c.type === 'domaine').map((c) => c.nom),
      stats: { likes, commentaires: comments },
      is_following_auteur: followingIds.has(exp.utilisateur_id),
      portfolio_score: portfolioScore,
      score,
      score_breakdown: breakdown,
    };
  });

  // ── Tri ───────────────────────────────────────────────────────────────────
  if (isTrending) {
    experiencesScored.sort((a, b) => {
      if (b.portfolio_score !== a.portfolio_score) return b.portfolio_score - a.portfolio_score;
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.date) - new Date(a.date);
    });
  } else {
    experiencesScored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.date) - new Date(a.date);
    });
  }

  const data = experiencesScored.slice(skip, skip + pageSize);

  return {
    data,
    pagination: {
      page: pageNum,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
    filters_appliques: {
      technologie: technologie ?? null,
      domaine: domaine ?? null,
      following: isFollowingOnly,
      trending: isTrending,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4) Tags (technologies & domaines) – réutilise feed.service.js sans le modifier
// ─────────────────────────────────────────────────────────────────────────────
export { getFeedTechnologiesDomaines as getProfessionnelFeedTags } from './feed.service.js';