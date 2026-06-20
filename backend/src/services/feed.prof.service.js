import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';

// ─── Constantes ───────────────────────────────────────────────────────────────
const DEFAULT_LIMIT_STUDENTS_TOP   = 5;   // bandeau haut  (même école)
const DEFAULT_LIMIT_SUGGESTIONS    = 5;   // colonne droite (non-suivis)
const DEFAULT_LIMIT_EXPERIENCES    = 10;  // fil central
const POOL_SIZE_EXPERIENCES        = 300;
const RANDOM_JITTER_MAX            = 6;

const toPositiveInt = (val, def) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

// ─── Helpers privés ───────────────────────────────────────────────────────────

/** Retourne les institution_id liées au professeur (via la table institutions → professeurs) */
async function getProfInstitutionIds(profId) {
  const prof = await prisma.professeur.findUnique({
    where: { prof_utilisateur_id: profId },
    select: {
      institutions: { select: { institution_id: true } },
    },
  });
  return new Set((prof?.institutions ?? []).map((i) => i.institution_id));
}

/** Retourne les utilisateur_id que le prof suit */
async function getProfFollowingIds(profId) {
  const rows = await prisma.follow.findMany({
    where: { followerId: profId },
    select: { followingId: true },
  });
  return new Set(rows.map((r) => r.followingId));
}

// ─────────────────────────────────────────────────────────────────────────────
// 1) Étudiants de la même institution, triés par score (bandeau haut)
//    + étudiants hors institution avec score réduit, randomisés
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Renvoie des étudiants scorés pour le bandeau haut du feed professeur.
 *
 * Score (même institution) :
 *   - Portfolio crédibilité : 0-40 pts  (normalisé)
 *   - Même institution       : +30 pts bonus fixe
 *   - Jitter aléatoire       : 0-6 pts  (pour varier sans casser le tri)
 *
 * Score (hors institution) :
 *   - Portfolio crédibilité : 0-40 pts
 *   - Jitter                : 0-6 pts
 *   → toujours inférieur aux étudiants de la même école (pas de +30)
 *
 * Pagination indépendante.
 */
export const getProfFeedStudentsTop = async (profId, { page, limit } = {}) => {
  const pageNum  = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_STUDENTS_TOP);
  const skip     = (pageNum - 1) * pageSize;

  const profInstitutionIds = await getProfInstitutionIds(profId);
  const instIds = [...profInstitutionIds];

  // Tous les étudiants non bloqués (hors le prof lui-même)
  const allStudents = await prisma.utilisateur.findMany({
    where: {
      utilisateur_id: { not: profId },
      bloque: false,
      role: 'etudiant',
      etudiant: { isNot: null },
    },
    select: {
      utilisateur_id: true,
      nom: true,
      prenom: true,
      photo: true,
      a_propos: true,
      etudiant: {
        select: {
          niveau: true,
          portfolio: { select: { score_credibilite: true } },
          institutions: {
            select: { institution_id: true, institution: { select: { nom: true } } },
          },
        },
      },
    },
  });

  const total = allStudents.length;

  const scored = allStudents.map((u) => {
    let score = 0;

    // a) Portfolio
    const portfolioScore = u.etudiant?.portfolio?.score_credibilite ?? 0;
    const portfolioBonus = Math.min(40, Math.round((portfolioScore / 100) * 40));
    score += portfolioBonus;

    // b) Même institution ?
    const studentInstIds = new Set((u.etudiant?.institutions ?? []).map((i) => i.institution_id));
    const sameSchool = instIds.some((id) => studentInstIds.has(id));
    if (sameSchool) score += 30;

    // c) Jitter
    score += Math.floor(Math.random() * (RANDOM_JITTER_MAX + 1));

    const mainInstitution = u.etudiant?.institutions?.[0]?.institution?.nom ?? null;

    return {
      utilisateur_id: u.utilisateur_id,
      nom: u.nom,
      prenom: u.prenom,
      photo: u.photo,
      a_propos: u.a_propos,
      niveau: u.etudiant?.niveau ?? null,
      institution: mainInstitution,
      portfolio_score: portfolioScore,
      meme_institution: sameSchool,
      score,
    };
  });

  // Tri : meme_institution en premier, puis score décroissant
  scored.sort((a, b) => {
    if (b.meme_institution !== a.meme_institution)
      return b.meme_institution ? 1 : -1;
    return b.score - a.score;
  });

  const data = scored.slice(skip, skip + pageSize);

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
// 2) Suggestions d'étudiants non suivis (colonne droite)
//    Étudiants que le prof ne suit pas encore, ordre aléatoire
// ─────────────────────────────────────────────────────────────────────────────
export const getProfFeedSuggestions = async (profId, { page, limit } = {}) => {
  const pageNum  = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_SUGGESTIONS);
  const skip     = (pageNum - 1) * pageSize;

  const followingIds = await getProfFollowingIds(profId);
  const excludeIds = [profId, ...followingIds];

  const total = await prisma.utilisateur.count({
    where: {
      utilisateur_id: { notIn: excludeIds },
      bloque: false,
      role: 'etudiant',
    },
  });

  // Ordre aléatoire côté PostgreSQL pour de vraies suggestions variables
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
// 3) Expériences — score + filtres + pagination (fil central)
//
// Score (adapté au contexte professeur) :
//   - Même institution que le prof   : +30 pts
//   - Suivi par le prof              : +20 pts
//   - Portfolio (crédibilité auteur) : 0-15 pts
//   - Récence                        : 0-10 pts
//   - Engagement (likes/commentaires): 0-10 pts
//   - Jitter aléatoire               : 0-6 pts
//
// Filtres :
//   technologie, domaine, meme_ecole, following, trending
// ─────────────────────────────────────────────────────────────────────────────
export const getProfFeedExperiences = async (
  profId,
  { page, limit, technologie, domaine, meme_ecole, following: followingFilter, trending } = {}
) => {
  const pageNum  = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_EXPERIENCES);
  const skip     = (pageNum - 1) * pageSize;

  const isMemeEcole      = String(meme_ecole).toLowerCase() === 'true';
  const isFollowingOnly  = String(followingFilter).toLowerCase() === 'true';
  const isTrending       = String(trending).toLowerCase() === 'true';

  // Contexte du professeur
  const [profInstitutionIds, followingIds] = await Promise.all([
    getProfInstitutionIds(profId),
    getProfFollowingIds(profId),
  ]);

  const instIds = [...profInstitutionIds];

  // ── Construction du filtre Prisma ────────────────────────────────────────
  const where = {
    visibilite: true,
    is_draft: false,
    deleted_at: null,
    utilisateur_id: { not: profId },
  };

  if (isFollowingOnly) {
    const ids = [...followingIds];
    where.utilisateur_id = { in: ids.length > 0 ? ids : ['__none__'] };
  }

  if (isMemeEcole) {
    where.etudiant = {
      institutions: {
        some: {
          institution_id: { in: instIds.length > 0 ? instIds : ['__none__'] },
        },
      },
    };
  }

  if (technologie && domaine) {
    // Les deux filtres combinés avec AND
    where.AND = [
      ...(where.AND ?? []),
      {
        competence_dev: {
          some: {
            competence: {
              type: 'technologie',
              nom: { equals: technologie, mode: 'insensitive' },
            },
          },
        },
      },
      {
        competence_dev: {
          some: {
            competence: {
              type: 'domaine',
              nom: { equals: domaine, mode: 'insensitive' },
            },
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

  // ── Pool d'expériences ───────────────────────────────────────────────────
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
              select: {
                institution_id: true,
                institution: { select: { nom: true } },
              },
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

  // ── Calcul du score ──────────────────────────────────────────────────────
  const experiencesScored = experiencesPool.map((exp) => {
    let score = 0;
    const breakdown = {};

    const auteur         = exp.etudiant?.utilisateur;
    const portfolioScore = exp.etudiant?.portfolio?.score_credibilite ?? 0;

    // a) Même institution que le prof
    const studentInstIds = new Set(
      (exp.etudiant?.institutions ?? []).map((i) => i.institution_id)
    );
    const sameSchool = instIds.some((id) => studentInstIds.has(id));
    if (sameSchool) {
      breakdown.meme_institution = 30;
      score += 30;
    }

    // b) Suivi par le prof
    if (followingIds.has(exp.utilisateur_id)) {
      breakdown.following = 20;
      score += 20;
    }

    // c) Score portfolio (crédibilité), normalisé sur 15 pts max
    const portfolioBonus = Math.min(15, Math.round((portfolioScore / 100) * 15));
    if (portfolioBonus > 0) {
      breakdown.portfolio = portfolioBonus;
      score += portfolioBonus;
    }

    // d) Engagement
    const likes    = exp.interactions.filter((i) => i.type === 'like').length;
    const comments = exp.interactions.filter((i) => i.type === 'commentaire').length;
    const engagementBonus = Math.min(10, likes * 1 + comments * 2);
    if (engagementBonus > 0) {
      breakdown.engagement = engagementBonus;
      score += engagementBonus;
    }

    // e) Récence (jusqu'à 10 pts)
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

    // f) Jitter aléatoire
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
      meme_institution: sameSchool,
      portfolio_score: portfolioScore,
      score,
      score_breakdown: breakdown,
    };
  });

  // ── Tri ──────────────────────────────────────────────────────────────────
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
      meme_ecole: isMemeEcole,
      following: isFollowingOnly,
      trending: isTrending,
    },
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// 4) Liste des technologies & domaines disponibles (pour les filtres UI)
//    Réutilise la même logique que pour l'étudiant → import direct possible
//    mais on la ré-exporte ici pour éviter de modifier feed.service.js
// ─────────────────────────────────────────────────────────────────────────────
export { getFeedTechnologiesDomaines as getProfFeedTags } from './feed.service.js';