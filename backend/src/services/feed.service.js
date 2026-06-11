import prisma from '../config/prisma.js';

const PAGE_SIZE = 10;


const FEED_OFFRES_COUNT = 5;
const FEED_USERS_COUNT = 5;
const FEED_EXPERIENCES_COUNT = 10;

// Mélange un tableau (Fisher-Yates)
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const getFeedEtudiant = async (etudiantId) => {
  // ----------------------------------------------------------
  // 1) Données de contexte sur l'utilisateur courant
  // ----------------------------------------------------------
  const [following, mesInstitutions, mesCompetences] = await Promise.all([
    // Liste des utilisateurs déjà suivis
    prisma.follow.findMany({
      where: { followerId: etudiantId },
      select: { followingId: true },
    }),

    // Institutions de l'étudiant courant
    prisma.valideEtudiant.findMany({
      where: { utilisateur_id: etudiantId },
      select: { institution_id: true },
    }),

    // Compétences (technologies + domaines) développées par l'étudiant courant
    prisma.competenceDeveloppee.findMany({
      where: { experience: { utilisateur_id: etudiantId } },
      select: { competence_id: true },
      distinct: ['competence_id'],
    }),
  ]);

  const followingIds = new Set(following.map((f) => f.followingId));
  const mesInstitutionIds = new Set(mesInstitutions.map((i) => i.institution_id));
  const mesCompetenceIds = new Set(mesCompetences.map((c) => c.competence_id));

  // ----------------------------------------------------------
  // 2) Offres aléatoires
  // ----------------------------------------------------------
  const offresPool = await prisma.offre.findMany({
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
    take: 50,
    orderBy: { date: 'desc' },
  });

  const offres = shuffle(offresPool).slice(0, FEED_OFFRES_COUNT);

  // ----------------------------------------------------------
  // 3) Utilisateurs suggérés (non suivis, non soi-même)
  // ----------------------------------------------------------
  const utilisateursPool = await prisma.utilisateur.findMany({
    where: {
      utilisateur_id: { notIn: [etudiantId, ...followingIds] },
      bloque: false,
    },
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
    take: 50,
  });

  const utilisateursSuggeres = shuffle(utilisateursPool)
    .slice(0, FEED_USERS_COUNT)
    .map((u) => ({
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

  // ----------------------------------------------------------
  // 4) Expériences (publications) avec calcul de score
  // ----------------------------------------------------------
  const experiencesPool = await prisma.experience.findMany({
    where: {
      visibilite: true,
      is_draft: false,
      deleted_at: null,
      utilisateur_id: { not: etudiantId },
    },
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
    take: 100,
  });

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
      score,
      score_breakdown: breakdown,
    };
  });

  
  experiencesScored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.date) - new Date(a.date);
  });

  const experiences = experiencesScored.slice(0, FEED_EXPERIENCES_COUNT);

  return {
    offres,
    utilisateurs_suggeres: utilisateursSuggeres,
    experiences,
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