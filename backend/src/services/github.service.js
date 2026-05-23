//  Done
import prisma from '../config/prisma.js';
import axios from 'axios';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI;

export const getOAuthUrl = (state) => {
  return `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(GITHUB_REDIRECT_URI)}&scope=repo user:email&state=${state}`;
};

export const getAccessToken = async (code) => {
  const response = await axios.post('https://github.com/login/oauth/access_token', {
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    code,
    redirect_uri: GITHUB_REDIRECT_URI,
  }, {
    headers: { Accept: 'application/json' }
  });

  if (response.data.error) {
    throw new Error(response.data.error_description || 'Failed to get access token');
  }
  return response.data.access_token;
};

export const getUserRepos = async (accessToken) => {
  const response = await axios.get('https://api.github.com/user/repos?per_page=100&sort=updated', {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github.v3+json'
    }
  });
  return response.data;
};

export const importReposToDB = async (etudiantId, repos, accessToken) => {
  const operations = repos.map((repo) => {
    return prisma.repository.upsert({
      where: { github_id: repo.id },
      update: {
        title: repo.title,
        description: repo.description,
        link: repo.link,
        language: repo.language,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        is_private: repo.private,
        github_access_token: accessToken,
        last_synced: new Date(),
      },
      create: {
        github_id: repo.id,
        etudiant_id: etudiantId,
        title: repo.title,
        description: repo.description,
        link: repo.link,
        language: repo.language,
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        is_private: repo.private,
        github_access_token: accessToken,
        last_synced: new Date(),
      },
    });
  });

  return await Promise.all(operations);
};