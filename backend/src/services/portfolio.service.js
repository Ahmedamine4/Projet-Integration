import prisma from '../config/prisma.js';
import * as githubService from './github.service.js';
import { getStagesVisiblesByEtudiant, getStagesByEtudiant } from './stage.service.js';
import { getProjetsVisiblesByEtudiant, getProjetsByEtudiant } from './projet.service.js';
import { getActivitesVisiblesByEtudiant, getActivitesByEtudiant } from './activite.service.js';
import { getCertificationsVisiblesByEtudiant, getCertificationsByEtudiant } from './certification.service.js';
import { getCompetencesByExperience } from './competence.helper.js';

// Recuperer "a_propos" d'un utilisateur par son id
export async function getAboutByUserId(userId) {
  const user = await prisma.utilisateur.findUnique({
    where: { utilisateur_id: userId },
    select: { utilisateur_id: true, a_propos: true },
  });

  if (!user) return null;

  return { ownerId: user.utilisateur_id, about: user.a_propos ?? null };
}

// modifier le "a_propos" d'un utilisateur par son id
export async function updateUserAboutByUserId(userId, aboutText) {
  return prisma.utilisateur.update({
    where: { utilisateur_id: userId },
    data: { a_propos: aboutText },
    select: { utilisateur_id: true, a_propos: true },
  });
}

const normalizeCount = (count, halfPoint = 3) => {
  if (count <= 0) return 0;
  return Math.round((1 - Math.exp(-count / halfPoint)) * 100) / 100;
};

const clamp01 = (value) => Math.min(1, Math.max(0, value));

const computeProfileCompleteness = (user, portfolio) => {
  const fields = [
    !!user.a_propos,
    !!user.github,
    !!user.linkedin,
    !!user.instagram,
    !!user.telephone,
    !!user.photo,
    !!portfolio?.titre,
    !!portfolio?.objectif_cible,
    portfolio?.visibilite !== null && portfolio?.visibilite !== undefined,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100) / 100;
};

const getGithubContributionsCount = async (etudiantId) => {
  const repoWithToken = await prisma.repository.findFirst({
    where: { etudiant_id: etudiantId },
    select: { github_access_token: true },
  });

  if (!repoWithToken?.github_access_token) return 0;

  try {
    const contributions = await githubService.getUserContributions(repoWithToken.github_access_token);
    return contributions?.contributionsCollection?.totalContributions ?? 0;
  } catch (error) {
    console.warn('GitHub contributions unavailable:', error.message || error);
    return 0;
  }
};

const calculateScoreBucket = (academicCount, personalCount, academicWeight = 0.7) => {
  const academicScore = normalizeCount(academicCount, 2);
  const personalScore = normalizeCount(personalCount, 3);
  return clamp01(academicScore * academicWeight + personalScore * (1 - academicWeight));
};

export async function calculatePortfolioScore(etudiantId) {
  const [validAcademicProjects, personalProjects, validAcademicStages, personalStages, validAcademicActivities, personalActivities, certificationCount, recommendationCount] = await Promise.all([
    prisma.experience.count({
      where: {
        utilisateur_id: etudiantId,
        type: 'projet',
        type_specifique: 'academique',
        projet: { validation: { is: { statut: 'valide' } } },
      },
    }),
    prisma.experience.count({
      where: {
        utilisateur_id: etudiantId,
        type: 'projet',
        type_specifique: 'personnel',
      },
    }),
    prisma.experience.count({
      where: {
        utilisateur_id: etudiantId,
        type: 'stage',
        type_specifique: 'academique',
        stage: { validation: { is: { statut: 'valide' } } },
      },
    }),
    prisma.experience.count({
      where: {
        utilisateur_id: etudiantId,
        type: 'stage',
        type_specifique: 'personnel',
      },
    }),
    prisma.experience.count({
      where: {
        utilisateur_id: etudiantId,
        type: 'activite',
        type_specifique: 'academique',
        activite: { validation: { is: { statut: 'valide' } } },
      },
    }),
    prisma.experience.count({
      where: {
        utilisateur_id: etudiantId,
        type: 'activite',
        type_specifique: 'personnel',
      },
    }),
    prisma.certification.count({
      where: { experience: { utilisateur_id: etudiantId } },
    }),
    prisma.lettresDeRecommendations.count({
      where: { utilisateur_id: etudiantId },
    }),
  ]);

  const gitContributions = await getGithubContributionsCount(etudiantId);

  const projectsScore = calculateScoreBucket(validAcademicProjects, personalProjects);
  const stagesScore = calculateScoreBucket(validAcademicStages, personalStages);
  const activitiesScore = calculateScoreBucket(validAcademicActivities, personalActivities);
  const certificationsScore = normalizeCount(certificationCount, 3);
  const recommendationsScore = normalizeCount(recommendationCount, 3);
  const gitScore = normalizeCount(gitContributions, 40);

  const etudiant = await prisma.etudiant.findUnique({
    where: { etudiant_utilisateur_id: etudiantId },
    include: { portfolio: true, utilisateur: true },
  });

  const profileScore = computeProfileCompleteness(etudiant.utilisateur, etudiant.portfolio);

  const breakdown = {
    projectsScore,
    stagesScore,
    activitiesScore,
    certificationsScore,
    recommendationsScore,
    gitScore,
    profileScore,
  };

  const finalScore = clamp01(
    projectsScore * 0.18 +
    stagesScore * 0.18 +
    activitiesScore * 0.10 +
    certificationsScore * 0.15 +
    recommendationsScore * 0.12 +
    gitScore * 0.15 +
    profileScore * 0.12
  );

  const scoreValue = Math.round(finalScore * 100);

  if (etudiant.portfolio) {
    await prisma.$transaction(async (tx) => {
      await tx.portfolio.update({
        where: { portfolio_id: etudiant.portfolio.portfolio_id },
        data: { score_credibilite: scoreValue },
      });

      const lastHistory = await tx.portfolioScoreHistory.findFirst({
        where: { portfolio_id: etudiant.portfolio.portfolio_id },
        orderBy: { date: 'desc' },
        select: { score: true },
      });

      if (!lastHistory || lastHistory.score !== scoreValue) {
        await tx.portfolioScoreHistory.create({
          data: {
            portfolio_id: etudiant.portfolio.portfolio_id,
            score: scoreValue,
            breakdown,
          },
        });
      }
    });
  }

  return { score: scoreValue, breakdown, gitContributions };
}

export async function getPortfolioScoreHistory(portfolioId) {
  return prisma.portfolioScoreHistory.findMany({
    where: { portfolio_id: portfolioId },
    orderBy: { date: 'desc' },
  });
}

// export async function refreshAllPortfolioScores() {
//   const portfolios = await prisma.portfolio.findMany({
//     select: { portfolio_id: true, utilisateur_id: true },
//   });

//   for (const item of portfolios) {
//     try {
//       await calculatePortfolioScore(item.utilisateur_id);
//     } catch (error) {
//       console.error(`Erreur rafraîchissement score portfolio ${item.portfolio_id}:`, error);
//     }
//   }
// }

export async function getPortfolioEtudiant(etudiantId, isOwner, filters = {}) {
  const { technologies = [], domaines = [] } = filters;
  const totalFiltres = technologies.length + domaines.length;

  const etudiant = await prisma.etudiant.findUnique({
    where: { etudiant_utilisateur_id: etudiantId },
    include: {
      utilisateur: {
        select: {
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          a_propos: true,
          github: true,
          instagram: true,
          x: true,
          linkedin: true,
          photo: true,
          _count: {
            select: { followers: true },
          },
        },
      },
      portfolio: {
        include: {
          _count: {
            select: { interactions: true },
          },
        },
      },
      badges: true,
      clubs: true,
      institutions: {
        where: isOwner ? {} : { statut: 'valide' },
        include: { institution: true },
      },
    },
  });

  if (!etudiant) throw new Error('Étudiant non trouvé');

  const [stages, projets, activites, certifications] = await Promise.all([
    isOwner ? getStagesByEtudiant(etudiantId) : getStagesVisiblesByEtudiant(etudiantId),
    isOwner ? getProjetsByEtudiant(etudiantId) : getProjetsVisiblesByEtudiant(etudiantId),
    isOwner ? getActivitesByEtudiant(etudiantId) : getActivitesVisiblesByEtudiant(etudiantId),
    isOwner ? getCertificationsByEtudiant(etudiantId) : getCertificationsVisiblesByEtudiant(etudiantId),
  ]);

  const scoreData = await calculatePortfolioScore(etudiantId);

  if (!technologies.length && !domaines.length) {
    return {
      ...etudiant,
      isOwner,
      stages,
      projets,
      activites,
      certifications,
      score_credibilite: scoreData.score,
      score_breakdown: scoreData.breakdown,
      gitContributions: scoreData.gitContributions,
    };
  }

  const highlight = (list) => {
    return list
      .map(item => {
        const competences = item.competence_dev ?? [];

        const techCount = competences.filter(cd =>
          cd.competence.type === 'technologie' && technologies.includes(cd.competence.nom)
        ).length;

        const domaineCount = competences.filter(cd =>
          cd.competence.type === 'domaine' && domaines.includes(cd.competence.nom)
        ).length;
        const score = totalFiltres > 0 ? Math.round(((techCount + domaineCount) / totalFiltres) * 100) : 0;

        return {
          ...item,
          highlighted: techCount + domaineCount > 0,
          score,
          techCount,
          domaineCount,
        };
      })
      .sort((a, b) => b.techCount - a.techCount || b.domaineCount - a.domaineCount);
  };

  return {
    ...etudiant,
    isOwner,
    stages: highlight(stages),
    projets: highlight(projets),
    activites: highlight(activites),
    certifications: highlight(certifications),
    score_credibilite: scoreData.score,
    score_breakdown: scoreData.breakdown,
    gitContributions: scoreData.gitContributions,
  };
}

export async function getExperienceById(experienceId) {
  
  const experience = await prisma.experience.findUnique({
    where: { experience_id: experienceId },
    include: {
      stage: {
        include: { validation: { include: { professeur: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } } } } },
      },
      projet: {
        include: { validation: { include: { professeur: { include: { utilisateur: { select: { nom: true, prenom: true, email: true } } } } } } },
      },
      activite: {
        include: {
          validation: { include: { institution: true } },
          clubs: true,
        },
      },
      certification: {
        include: { validation: { include: { institution: true } } },
      },
    },
  });
 
  if (!experience) return null;
 
  const { technologies, domaines } = await getCompetencesByExperience(experienceId);
 
  const typeSpecifique = experience.type;
  let details = null;
 
  if (typeSpecifique === 'stage') details = experience.stage;
  else if (typeSpecifique === 'projet') details = experience.projet;
  else if (typeSpecifique === 'activite') details = experience.activite;
  else if (typeSpecifique === 'certification') details = experience.certification;
 
  return {
    experience_id: experience.experience_id,
    titre: experience.titre,
    type: experience.type,
    type_specifique: experience.type_specifique ?? null,
    date_experience: experience.date_experience,
    description: experience.description,
    photo: experience.photo ?? null,
    visibilite: experience.visibilite,
    is_draft: experience.is_draft,
    utilisateur_id: experience.utilisateur_id,
    technologies,
    domaines,
    details,
  };
}
