// controllers/githubController.js
const githubService = require('../services/githubService');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

//login
exports.githubLogin = asyncHandler(async (req, res) => {
  const etudiantId = req.user.etudiant_utilisateur_id || req.user.id;
  const authUrl = githubService.getOAuthUrl(etudiantId);

  res.json({
    success: true,
    message: "Redirection vers GitHub",
    url: authUrl
  });
});

exports.githubCallback = asyncHandler(async (req, res) => {
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: "Code GitHub manquant" });
  }

  const accessToken = await githubService.getAccessToken(code);
  const repos = await githubService.getUserRepos(accessToken);

  const etudiantId = state || req.user?.etudiant_utilisateur_id || req.user?.id;

  if (!etudiantId) {
    return res.status(400).json({ success: false, message: "Étudiant non identifié" });
  }

  const imported = await githubService.importReposToDB(etudiantId, repos, accessToken);

  res.json({
    success: true,
    message: `${imported.length} repositories importés avec succès`,
    count: imported.length,
    data: imported
  });
});

//get repos
exports.getMyRepositories = asyncHandler(async (req, res) => {
  const etudiantId = req.user.etudiant_utilisateur_id || req.user.id;

  const repositories = await prisma.repository.findMany({
    where: { etudiant_id: etudiantId },
    orderBy: { last_synced: 'desc' },
  });

  res.json({
    success: true,
    count: repositories.length,
    data: repositories
  });
});

exports.syncRepositories = asyncHandler(async (req, res) => {
  const etudiantId = req.user.etudiant_utilisateur_id || req.user.id;

  const repoWithToken = await prisma.repository.findFirst({
    where: { etudiant_id: etudiantId },
    select: { github_access_token: true }
  });

  if (!repoWithToken?.github_access_token) {
    return res.status(400).json({
      success: false,
      message: "Veuillez reconnecter votre compte GitHub"
    });
  }

  const repos = await githubService.getUserRepos(repoWithToken.github_access_token);
  const updated = await githubService.importReposToDB(etudiantId, repos, repoWithToken.github_access_token);

  res.json({
    success: true,
    message: "Repositories synchronisés avec succès",
    count: updated.length
  });
});

module.exports = {
  githubLogin,
  githubCallback,
  getMyRepositories,
  syncRepositories
};