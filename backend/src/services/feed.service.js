import prisma from '../config/prisma.js';
import { Prisma } from '@prisma/client';

const PAGE_SIZE = 10;


const DEFAULT_LIMIT_OFFRES = 5;
const DEFAULT_LIMIT_USERS = 5;
const DEFAULT_LIMIT_EXPERIENCES = 10;
const POOL_SIZE_EXPERIENCES = 300; // taille du pool sur lequel le score est calculé avant pagination
const RANDOM_JITTER_MAX = 6; // bruit aléatoire ajouté au score pour varier l'ordre à chaque appel

const toPositiveInt = (val, def) => {
  const n = parseInt(val, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

// ----------------------------------------------------------
// 1) Offres — paginé + ordre aléatoire à chaque appel
// ----------------------------------------------------------
export const getFeedOffres = async (etudiantId, { page, limit } = {}) => {
  const pageNum = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_OFFRES);
  const skip = (pageNum - 1) * pageSize;

  const total = await prisma.offre.count();

  // On tire des ids aléatoirement (PostgreSQL ORDER BY random())
  const randomRows = await prisma.$queryRaw(
    Prisma.sql`SELECT offre_id FROM offres ORDER BY random() OFFSET ${skip} LIMIT ${pageSize}`
  );
  const ids = randomRows.map((r) => r.offre_id);

  const offresData = ids.length
    ? await prisma.offre.findMany({
        where: { offre_id: { in: ids } },
        select: {
          offre_id: true,
          entreprise: true,
          localisation: true,
          technologies: true,
          description: true,
          type: true,
          date: true,
          utilisateur: {
            select: {
              utilisateur_id: true,
              nom: true,
              prenom: true,
              photo: true,
              professionnel: { select: { entreprise: true, poste: true } },
            },
          },
        },
      })
    : [];

  // Préserver l'ordre aléatoire renvoyé par la requête SQL
  const byId = new Map(offresData.map((o) => [o.offre_id, o]));
  const offres = ids.map((id) => byId.get(id)).filter(Boolean);

  return {
    data: offres,
    pagination: {
      page: pageNum,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  };
};

// ----------------------------------------------------------
// 2) Suggestions d'utilisateurs (non suivis, non soi-même) — paginé + aléatoire
// ----------------------------------------------------------
export const getFeedSuggestions = async (etudiantId, { page, limit } = {}) => {
  const pageNum = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_USERS);
  const skip = (pageNum - 1) * pageSize;

  const following = await prisma.follow.findMany({
    where: { followerId: etudiantId },
    select: { followingId: true },
  });
  const excludeIds = [etudiantId, ...following.map((f) => f.followingId)];

  const where = {
    utilisateur_id: { notIn: excludeIds },
    bloque: false,
    role: 'etudiant',
  };

  const total = await prisma.utilisateur.count({ where });

  const randomRows = await prisma.$queryRaw(
    Prisma.sql`SELECT utilisateur_id FROM utilisateurs WHERE bloque = false AND role = 'etudiant' AND utilisateur_id NOT IN (${Prisma.join(excludeIds.length ? excludeIds : ['__none__'])}) ORDER BY random() OFFSET ${skip} LIMIT ${pageSize}`
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
          role: true,
          etudiant: {
            select: {
              niveau: true,
              institutions: {
                select: { institution: { select: { nom: true } } },
                take: 1,
              },
            },
          },
          professionnel: { select: { poste: true, entreprise: true } },
          professeur: { select: { specialite: true, departement: true } },
        },
      })
    : [];

  const byId = new Map(utilisateursData.map((u) => [u.utilisateur_id, u]));
  const utilisateurs = ids.map((id) => byId.get(id)).filter(Boolean);

  const data = utilisateurs.map((u) => ({
    utilisateur_id: u.utilisateur_id,
    nom: u.nom,
    prenom: u.prenom,
    photo: u.photo,
    role: u.role,
    sous_titre:
      u.role === 'etudiant'
        ? u.etudiant?.institutions?.[0]?.institution?.nom ?? u.etudiant?.niveau ?? null
        : u.role === 'professionnel'
        ? `${u.professionnel?.poste ?? ''} ${u.professionnel?.entreprise ? '· ' + u.professionnel.entreprise : ''}`.trim()
        : u.role === 'professeur'
        ? u.professeur?.specialite ?? u.professeur?.departement ?? null
        : null,
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

// ----------------------------------------------------------
// 3) Expériences — score + filtres + pagination
// ----------------------------------------------------------
// Filtres acceptés :
//  - technologie : nom d'une technologie (Competence.type = 'technologie')
//  - domaine     : nom d'un domaine (Competence.type = 'domaine')
//  - meme_ecole  : 'true' -> uniquement les expériences d'étudiants partageant une institution avec moi
//  - following   : 'true' -> uniquement les expériences des personnes que je suis
//  - trending    : 'true' -> tri par score de portfolio (crédibilité) au lieu du score de pertinence
export const getFeedExperiences = async (etudiantId, { page, limit, technologie, domaine, meme_ecole, following: followingFilter, trending } = {}) => {
  const pageNum = toPositiveInt(page, 1);
  const pageSize = toPositiveInt(limit, DEFAULT_LIMIT_EXPERIENCES);
  const skip = (pageNum - 1) * pageSize;

  const isMemeEcole = String(meme_ecole).toLowerCase() === 'true';
  const isFollowingOnly = String(followingFilter).toLowerCase() === 'true';
  const isTrending = String(trending).toLowerCase() === 'true';

  // ----------------------------------------------------------
  // Données de contexte sur l'utilisateur courant
  // ----------------------------------------------------------
  const [followingRows, mesInstitutions, mesCompetences] = await Promise.all([
    prisma.follow.findMany({
      where: { followerId: etudiantId },
      select: { followingId: true },
    }),
    prisma.valideEtudiant.findMany({
      where: { utilisateur_id: etudiantId },
      select: { institution_id: true },
    }),
    prisma.competenceDeveloppee.findMany({
      where: { experience: { utilisateur_id: etudiantId } },
      select: { competence_id: true },
      distinct: ['competence_id'],
    }),
  ]);

  const followingIds = new Set(followingRows.map((f) => f.followingId));
  const mesInstitutionIds = new Set(mesInstitutions.map((i) => i.institution_id));
  const mesCompetenceIds = new Set(mesCompetences.map((c) => c.competence_id));

  // ----------------------------------------------------------
  // Construction du filtre Prisma
  // ----------------------------------------------------------
  const where = {
    visibilite: true,
    is_draft: false,
    deleted_at: null,
    utilisateur_id: { not: etudiantId },
  };

  if (isFollowingOnly) {
    const ids = [...followingIds];
    where.utilisateur_id = { in: ids.length > 0 ? ids : ['__none__'] };
  }

  if (isMemeEcole) {
    const ids = [...mesInstitutionIds];
    where.etudiant = {
      institutions: { some: { institution_id: { in: ids.length > 0 ? ids : ['__none__'] } } },
    };
  }

  if (technologie) {
    where.competence_dev = {
      ...(where.competence_dev ?? {}),
      some: { competence: { type: 'technologie', nom: { equals: technologie, mode: 'insensitive' } } },
    };
  }

  if (domaine) {
    // Si on a déjà un filtre "some" pour technologie, on combine avec AND pour exiger les deux
    if (where.competence_dev?.some) {
      where.AND = [
        ...(where.AND ?? []),
        { competence_dev: { some: { competence: { type: 'technologie', nom: { equals: technologie, mode: 'insensitive' } } } } },
        { competence_dev: { some: { competence: { type: 'domaine', nom: { equals: domaine, mode: 'insensitive' } } } } },
      ];
      delete where.competence_dev;
    } else {
      where.competence_dev = {
        some: { competence: { type: 'domaine', nom: { equals: domaine, mode: 'insensitive' } } },
      };
    }
  }

  // ----------------------------------------------------------
  // Pool d'expériences correspondant aux filtres
  // ----------------------------------------------------------
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
              select: { institution_id: true, institution: { select: { nom: true } } },
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

  const experiencesScored = experiencesPool.map((exp) => {
    let score = 0;
    const breakdown = {};

    const auteur = exp.etudiant?.utilisateur;
    const isFollowed = followingIds.has(exp.utilisateur_id);
    const portfolioScore = exp.etudiant?.portfolio?.score_credibilite ?? 0;

    // a) Suivi de l'auteur
    if (isFollowed) {
      breakdown.follow = 25;
      score += 25;
    }

    // b) Même école / institution
    const memesInstitutions = (exp.etudiant?.institutions ?? []).filter((i) =>
      mesInstitutionIds.has(i.institution_id)
    );
    if (memesInstitutions.length > 0) {
      breakdown.meme_ecole = 20;
      score += 20;
    }

    // c) Score du portfolio de l'auteur (crédibilité), normalisé sur 15 pts max
    const portfolioBonus = Math.min(15, Math.round((portfolioScore / 100) * 15));
    if (portfolioBonus > 0) {
      breakdown.portfolio = portfolioBonus;
      score += portfolioBonus;
    }

    // d) Correspondance technologies / domaines (intérêts communs)
    const competencesExp = exp.competence_dev.map((c) => c.competence);
    const matches = competencesExp.filter((c) => mesCompetenceIds.has(c.competence_id));
    const matchBonus = Math.min(20, matches.length * 5);
    if (matchBonus > 0) {
      breakdown.competences_communes = matchBonus;
      score += matchBonus;
    }

    // e) Engagement (likes / commentaires)
    const likes = exp.interactions.filter((i) => i.type === 'like').length;
    const comments = exp.interactions.filter((i) => i.type === 'commentaire').length;
    const engagementBonus = Math.min(10, likes * 1 + comments * 2);
    if (engagementBonus > 0) {
      breakdown.engagement = engagementBonus;
      score += engagementBonus;
    }

    // f) Récence (jusqu'à 10 pts, décroît avec le temps)
    let recenceBonus = 0;
    if (exp.date_experience) {
      const ageJours = (now - new Date(exp.date_experience).getTime()) / (1000 * 60 * 60 * 24);
      recenceBonus = Math.max(0, Math.round(10 - ageJours / 3)); // perd ~1pt tous les 3 jours
    }
    if (recenceBonus > 0) {
      breakdown.recence = recenceBonus;
      score += recenceBonus;
    }

    // g) Bruit aléatoire (pour varier l'ordre à chaque appel, sans casser la pertinence globale)
    const jitter = Math.floor(Math.random() * (RANDOM_JITTER_MAX + 1));
    breakdown.alea = jitter;
    score += jitter;

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
      is_following_auteur: isFollowed,
      portfolio_score: portfolioScore,
      score,
      score_breakdown: breakdown,
    };
  });

  // ----------------------------------------------------------
  // Tri
  // ----------------------------------------------------------
  if (isTrending) {
    // Trending = on privilégie les portfolios les mieux notés
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


export const getFeedTechnologiesDomaines = async () => {
  const [technologies, domaines] = await Promise.all([
    prisma.competence.findMany({
      where: { type: 'technologie' },
      orderBy: { nom: 'asc' },
      select: { competence_id: true, nom: true },
    }),
    prisma.competence.findMany({
      where: { type: 'domaine' },
      orderBy: { nom: 'asc' },
      select: { competence_id: true, nom: true },
    }),
  ]);

  return { technologies, domaines };
};