import { beforeEach, describe, expect, it, vi } from 'vitest';

const githubServiceMock = {
  getOAuthUrl: vi.fn(),
  getAccessToken: vi.fn(),
  getUserRepos: vi.fn(),
  importReposToDB: vi.fn(),
};

const projetServiceMock = {
  createDraftProjectsFromRepos: vi.fn(),
};

const prismaMock = {
  repository: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('../../src/services/github.service.js', () => githubServiceMock);
vi.mock('../../src/services/projet.service.js', () => projetServiceMock);
vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

const controller = await import('../../src/controllers/github.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  };
}

describe('github.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FRONTEND_URL = 'http://localhost:5173';
  });

  it('githubLogin construit l url OAuth avec l etudiant connecte', async () => {
    githubServiceMock.getOAuthUrl.mockReturnValue('https://github.com/login/oauth/authorize');

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.githubLogin(req, res);

    expect(githubServiceMock.getOAuthUrl).toHaveBeenCalledWith('etu-1');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Redirect to GitHub ',
      url: 'https://github.com/login/oauth/authorize',
    });
  });

  it('githubCallback retourne 400 sans code', async () => {
    const req = { query: {} };
    const res = createRes();

    await controller.githubCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(githubServiceMock.getAccessToken).not.toHaveBeenCalled();
  });

  it('githubCallback importe les repos puis cree les drafts', async () => {
    githubServiceMock.getAccessToken.mockResolvedValue('gh-token');
    githubServiceMock.getUserRepos.mockResolvedValue([{ id: 1, name: 'repo-a' }]);
    githubServiceMock.importReposToDB.mockResolvedValue([
      {
        repository_id: 'repo-1',
        etudiant_id: 'etu-1',
        title: 'repo-a',
        description: null,
        link: 'https://github.com/demo/repo-a',
        language: 'TypeScript',
      },
    ]);
    projetServiceMock.createDraftProjectsFromRepos.mockResolvedValue([
      { experience: { experience_id: 'exp-1' } },
    ]);

    const req = {
      query: { code: 'oauth-code', state: 'etu-1' },
    };
    const res = createRes();

    await controller.githubCallback(req, res);

    expect(githubServiceMock.importReposToDB).toHaveBeenCalledWith(
      'etu-1',
      [{ id: 1, name: 'repo-a' }],
      'gh-token'
    );
    expect(projetServiceMock.createDraftProjectsFromRepos).toHaveBeenCalledWith(
      'etu-1',
      expect.any(Array)
    );
    expect(res.redirect).toHaveBeenCalledWith(
      'http://localhost:5173/getting-started?github=connected'
    );
  });

  it('githubCallback utilise req.user si state est absent', async () => {
    githubServiceMock.getAccessToken.mockResolvedValue('gh-token');
    githubServiceMock.getUserRepos.mockResolvedValue([{ id: 1, name: 'repo-a' }]);
    githubServiceMock.importReposToDB.mockResolvedValue([
      { repository_id: 'repo-1', etudiant_id: 'etu-1', title: 'repo-a' },
    ]);
    projetServiceMock.createDraftProjectsFromRepos.mockResolvedValue([]);

    const req = {
      query: { code: 'oauth-code' },
      user: { utilisateur_id: 'etu-1' },
    };
    const res = createRes();

    await controller.githubCallback(req, res);

    expect(githubServiceMock.importReposToDB).toHaveBeenCalledWith(
      'etu-1',
      [{ id: 1, name: 'repo-a' }],
      'gh-token'
    );
  });

  it('githubCallback retourne 400 si aucun etudiant ne peut etre determine', async () => {
    githubServiceMock.getAccessToken.mockResolvedValue('gh-token');
    githubServiceMock.getUserRepos.mockResolvedValue([]);

    const req = {
      query: { code: 'oauth-code' },
    };
    const res = createRes();

    await controller.githubCallback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(githubServiceMock.importReposToDB).not.toHaveBeenCalled();
  });

  it('getMyRepositories lit uniquement les repos de l etudiant connecte', async () => {
    prismaMock.repository.findMany.mockResolvedValue([
      { repository_id: 'repo-1', title: 'repo-a' },
    ]);

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getMyRepositories(req, res);

    expect(prismaMock.repository.findMany).toHaveBeenCalledWith({
      where: { etudiant_id: 'etu-1' },
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
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 1,
      data: [{ repository_id: 'repo-1', title: 'repo-a' }],
    });
  });

  it('syncRepositories retourne 400 si aucun token GitHub n est stocke', async () => {
    prismaMock.repository.findFirst.mockResolvedValue(null);

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.syncRepositories(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(githubServiceMock.getUserRepos).not.toHaveBeenCalled();
  });

  it('syncRepositories importe les repos et cree les nouveaux drafts', async () => {
    prismaMock.repository.findFirst.mockResolvedValue({
      github_access_token: 'stored-gh-token',
    });
    githubServiceMock.getUserRepos.mockResolvedValue([
      { id: 1, name: 'repo-a' },
      { id: 2, name: 'repo-b' },
    ]);
    githubServiceMock.importReposToDB.mockResolvedValue([
      { repository_id: 'repo-1', title: 'repo-a' },
      { repository_id: 'repo-2', title: 'repo-b' },
    ]);
    projetServiceMock.createDraftProjectsFromRepos.mockResolvedValue([
      { experience: { experience_id: 'exp-1' } },
    ]);

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.syncRepositories(req, res);

    expect(githubServiceMock.getUserRepos).toHaveBeenCalledWith('stored-gh-token');
    expect(githubServiceMock.importReposToDB).toHaveBeenCalledWith(
      'etu-1',
      [{ id: 1, name: 'repo-a' }, { id: 2, name: 'repo-b' }],
      'stored-gh-token'
    );
    expect(projetServiceMock.createDraftProjectsFromRepos).toHaveBeenCalledWith(
      'etu-1',
      [{ repository_id: 'repo-1', title: 'repo-a' }, { repository_id: 'repo-2', title: 'repo-b' }]
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      repositoriesCount: 2,
      draftProjectsCount: 1,
      data: {
        repositories: [{ repository_id: 'repo-1', title: 'repo-a' }, { repository_id: 'repo-2', title: 'repo-b' }],
        draftProjects: [{ experience: { experience_id: 'exp-1' } }],
      },
    });
  });

  it('getMyContributions retourne 400 si aucun token GitHub n est disponible', async () => {
    prismaMock.repository.findFirst.mockResolvedValue(null);
    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getMyContributions(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('getUserContributions retourne 404 si utilisateur sans token', async () => {
    prismaMock.repository.findFirst.mockResolvedValue(null);
    const req = { params: { userId: 'etu-2' } };
    const res = createRes();

    await controller.getUserContributions(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
