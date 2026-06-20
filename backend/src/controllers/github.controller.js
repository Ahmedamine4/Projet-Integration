// Done

import * as githubService from '../services/github.service.js';
import prisma from '../config/prisma.js';
import * as projetService from '../services/projet.service.js';
// je vais enlever n'import qu'elle attribut lier a prismer 
// et je vais le faire dans git.service.js

export const githubLogin = async (req, res) => {
  const etudiantId = req.user.utilisateur_id;
  const authUrl = githubService.getOAuthUrl(etudiantId);

  res.json({
    success: true,
    message: "Redirect to GitHub ",
    url: authUrl
  });
};

export const githubCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Code manquant"
    });
  }

  const accessToken = await githubService.getAccessToken(code);
  const repos = await githubService.getUserRepos(accessToken);

  const etudiantId = state || req.user?.utilisateur_id;
  //const etudiantId = state ;
  if (!etudiantId) {
    return res.status(400).json({
      success: false,
      message: "id étudiant non trouvé"
    });
  }

  const imported = await githubService.importReposToDB(etudiantId, repos, accessToken);
  await projetService.createDraftProjectsFromRepos(etudiantId, imported);

  /*res.json({
    success: true,
    message: `${imported.length} repositories importés `,
    count: imported.length,
    data: imported
  });*/
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/getting-started?github=connected`);
};

export const getMyRepositories = async (req, res) => {
  const etudiantId = req.user.utilisateur_id;

  const repositories = await prisma.repository.findMany({
    where: { etudiant_id: etudiantId },
    orderBy: { last_synced: 'desc' },
    select: {
      repository_id: true,
      title: true,
      description: true,
      link: true,
      language: true,
      stars: true,
      forks: true,
      private: true,
      last_synced: true,
    }
  });

  res.json({
    success: true,
    count: repositories.length,
    data: repositories
  });
};

async function getContributionsForEtudiant(etudiantId) {
  const etudiant = await prisma.etudiant.findUnique({
    where: { etudiant_utilisateur_id: etudiantId },
    select: {
      etudiant_utilisateur_id: true,
      portfolio: { select: { portfolio_id: true } },
    },
  });

  if (!etudiant) {
    return { status: 'missing-student' };
  }

  if (!etudiant.portfolio) {
    return { status: 'missing-portfolio' };
  }

  const repoWithToken = await prisma.repository.findFirst({
    where: { etudiant_id: etudiantId },
    orderBy: { last_synced: 'desc' },
    select: { github_access_token: true }
  });

  if (!repoWithToken?.github_access_token) {
    return { status: 'missing-token' };
  }

  return {
    status: 'ok',
    data: await githubService.getUserContributions(repoWithToken.github_access_token),
  };
}

export const getMyContributions = async (req, res) => {
  const etudiantId = req.user.utilisateur_id;

  try {
    const contributions = await getContributionsForEtudiant(etudiantId);

    if (contributions.status !== 'ok') {
      return res.status(400).json({
        success: false,
        message: 'Aucun token GitHub disponible. Connectez et synchronisez votre compte GitHub.'
      });
    }

    return res.json({
      success: true,
      data: contributions.data
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      message: error.message || 'Impossible de récupérer les contributions GitHub.'
    });
  }
};

export const getUserContributions = async (req, res) => {
  const { userId } = req.params;

  try {
    const contributions = await getContributionsForEtudiant(userId);

    if (contributions.status === 'missing-student' || contributions.status === 'missing-portfolio') {
      return res.status(404).json({
        success: false,
        message: 'Portfolio introuvable.'
      });
    }

    if (contributions.status === 'missing-token') {
      return res.status(404).json({
        success: false,
        message: 'Aucune contribution GitHub publique disponible pour ce portfolio.'
      });
    }

    return res.json({
      success: true,
      data: contributions.data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Impossible de récupérer les contributions GitHub.'
    });
  }
};

export const syncRepositories = async (req, res) => {
  const etudiantId = req.user.utilisateur_id;

  const repoWithToken = await prisma.repository.findFirst({
    where: { etudiant_id: etudiantId },
    select: { github_access_token: true }
  });

  if (!repoWithToken?.github_access_token) {
    return res.status(400).json({
      success: false,
    });
  }

  const repos = await githubService.getUserRepos(repoWithToken.github_access_token);
  const updated = await githubService.importReposToDB(
    etudiantId,
    repos,
    repoWithToken.github_access_token
  );
  /**Le déclenchement après sync GitHub
   après le sync des repos, j’ai aussi ajouté
  createDraftProjectsFromRepos(etudiantId, updated)
  Donc si un nouveau repo apparaît plus tard sur GitHub, il génère aussi un nouveau brouillon au prochain sync.*/
  const draftProjects = await projetService.createDraftProjectsFromRepos(etudiantId, updated);

  res.json({
    success: true,
    repositoriesCount: updated.length,
    draftProjectsCount: draftProjects.length,
    data: {
      repositories: updated,
      draftProjects,
    },
  });
};
