// Done

import * as githubService from '../services/github.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import prisma from '../config/prisma.js';

export const githubLogin = asyncHandler(async (req, res) => {
  const etudiantId = req.user.utilisateur_id ;
  const authUrl = githubService.getOAuthUrl(etudiantId);

  res.json({
    success: true,
    message: "Redirection vers GitHub ",
    url: authUrl
  });
});

export const githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: "Code d'autorisation GitHub manquant"
    });
  }

  const accessToken = await githubService.getAccessToken(code);
  const repos = await githubService.getUserRepos(accessToken);

  const etudiantId = state || req.user?.utilisateur_id ;

  if (!etudiantId) {
    return res.status(400).json({
      success: false,
      message: "Identifiant étudiant non trouvé"
    });
  }

  const imported = await githubService.importReposToDB(etudiantId, repos, accessToken);

  res.json({
    success: true,
    message: `${imported.length} repositories importés avec succès`,
    count: imported.length,
    data: imported
  });
});

export const getMyRepositories = asyncHandler(async (req, res) => {
  const etudiantId =  req.user.utilisateur_id ;

  const repositories = await prisma.repository.findMany({
        where: { etudiant_id: etudiantId },
        orderBy: { last_synced: 'desc' },
        select: {
      repository_id: true,
      name: true,
      full_name: true,
      description: true,
      html_url: true,
      language: true,
      stars: true,
      forks: true,
      is_private: true,
      last_synced: true,
    }
  });

  res.json({
    success: true,
    count: repositories.length,
    data: repositories
  });
});

export const syncRepositories = asyncHandler(async (req, res) => {
  const etudiantId = req.user.utilisateur_id ;

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
  const updated = await githubService.importReposToDB(etudiantId, repos, repoWithToken.github_access_token);

  res.json({
    success: true,
    count: updated.length
  });
});