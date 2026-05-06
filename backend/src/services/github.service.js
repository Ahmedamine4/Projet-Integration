const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class GitHubService {
  constructor() {
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
    this.redirectUri = process.env.GITHUB_REDIRECT_URI;
  }

  getOAuthUrl(state) {
    return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=repo user:email&state=${state}`;
  }

  async getAccessToken(code) {
    const res = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    }, { headers: { Accept: 'application/json' } });

    return res.data.access_token;
  }

  async getUserRepos(accessToken) {
    const res = await axios.get('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    return res.data;
  }

  // Importation des repos
  async importReposToDB(etudiantId, repos, accessToken) {
    const operations = repos.map(repo => {
      return prisma.repository.upsert({
        where: { github_id: repo.id },
        update: {
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          is_private: repo.private,
          github_access_token: accessToken,
          last_synced: new Date(),
        },
        create: {
          github_id: repo.id,
          etudiant_id: etudiantId,
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          html_url: repo.html_url,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          is_private: repo.private,
          github_access_token: accessToken,
          last_synced: new Date(),
        },
      });
    });

    return await Promise.all(operations);
  }
}

module.exports = new GitHubService();