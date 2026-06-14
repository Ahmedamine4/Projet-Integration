import { beforeEach, describe, expect, it, vi } from 'vitest';

const generateLocalTokenMock = vi.fn();
const generateRefreshTokenMock = vi.fn();
const verifyRefreshTokenMock = vi.fn();

const creerSessionMock = vi.fn();
const fermerSessionMock = vi.fn();

const registerLocalUserMock = vi.fn();
const loginLocalUserMock = vi.fn();
const syncGoogleUserMock = vi.fn();
const getPublicUserByIdMock = vi.fn();
const getAllPublicUsersMock = vi.fn();
const findUserByEmailMock = vi.fn();
const createPortfolioIfNotExistsMock = vi.fn();

const supabaseMock = {
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('../../src/config/jwt.js', () => ({
  generateLocalToken: generateLocalTokenMock,
  generateRefreshToken: generateRefreshTokenMock,
  verifyRefreshToken: verifyRefreshTokenMock,
}));

vi.mock('../../src/services/session.service.js', () => ({
  creerSession: creerSessionMock,
  fermerSession: fermerSessionMock,
}));

vi.mock('../../src/config/supabase.js', () => ({
  supabase: supabaseMock,
}));

vi.mock('../../src/services/auth.service.js', () => ({
  registerLocalUser: registerLocalUserMock,
  loginLocalUser: loginLocalUserMock,
  syncGoogleUser: syncGoogleUserMock,
  getPublicUserById: getPublicUserByIdMock,
  getAllPublicUsers: getAllPublicUsersMock,
  findUserByEmail: findUserByEmailMock,
}));

vi.mock('../../src/services/portfolio.service.js', () => ({
  createPortfolioIfNotExists: createPortfolioIfNotExistsMock,
}));

const controller = await import('../../src/controllers/auth.controller.js');

function createRes() {
  const res = {};
  res.cookie = vi.fn(() => res);
  res.clearCookie = vi.fn(() => res);
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('auth.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    generateLocalTokenMock.mockReturnValue('access-token');
    generateRefreshTokenMock.mockReturnValue('refresh-token');

    creerSessionMock.mockResolvedValue({
      session_token: 'session-token',
    });
    createPortfolioIfNotExistsMock.mockResolvedValue(undefined);
  });

  it('register renvoie 201 avec user et pose les cookies', async () => {
    const req = {
      body: {
        nom: 'Test',
        prenom: 'User',
        email: 'test@test.com',
        mot_de_passe: 'Password123!',
      },
      headers: {},
      cookies: {},
    };

    const res = createRes();

    const user = {
      utilisateur_id: 'user-1',
      email: 'test@test.com',
      role: 'etudiant',
    };

    registerLocalUserMock.mockResolvedValue(user);

    await controller.register(req, res);

    expect(registerLocalUserMock).toHaveBeenCalledWith(req.body);
    expect(generateLocalTokenMock).toHaveBeenCalledWith(user);
    expect(generateRefreshTokenMock).toHaveBeenCalledWith(user);
    expect(creerSessionMock).toHaveBeenCalledWith('user-1', req);

    expect(res.cookie).toHaveBeenCalledTimes(3);
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'access-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      })
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'sessionToken',
      'session-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Inscription réussie',
      user,
    });
  });

  it('register retourne 400 si service échoue', async () => {
    const req = {
      body: {},
      headers: {},
      cookies: {},
    };

    const res = createRes();

    registerLocalUserMock.mockRejectedValue(new Error('Email déjà utilisé'));

    await controller.register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Email déjà utilisé',
    });
  });

  it('login renvoie 200 avec user et pose les cookies', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        mot_de_passe: 'Password123!',
      },
      headers: {},
      cookies: {},
    };

    const res = createRes();

    const user = {
      utilisateur_id: 'user-1',
      email: 'test@test.com',
      role: 'etudiant',
    };

    loginLocalUserMock.mockResolvedValue({
      token: 'login-access-token',
      refreshToken: 'login-refresh-token',
      user,
    });

    await controller.login(req, res);

    expect(loginLocalUserMock).toHaveBeenCalledWith(req.body);
    expect(creerSessionMock).toHaveBeenCalledWith('user-1', req);

    expect(res.cookie).toHaveBeenCalledTimes(3);
    expect(res.cookie).toHaveBeenCalledWith(
      'accessToken',
      'login-access-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
      })
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'login-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'sessionToken',
      'session-token',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Connexion réussie',
      provider: 'local',
      user,
      token: 'login-access-token',
    });
  });

  it('login retourne 401 si service échoue', async () => {
    const req = {
      body: {
        email: 'test@test.com',
        mot_de_passe: 'bad',
      },
      headers: {},
      cookies: {},
    };

    const res = createRes();

    loginLocalUserMock.mockRejectedValue(new Error('Identifiants invalides'));

    await controller.login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Identifiants invalides',
    });
  });

  it('googleAuth retourne 401 si token manquant', async () => {
    const req = {
      body: {},
      headers: {},
      cookies: {},
    };

    const res = createRes();

    await controller.googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token Google d'authentification manquant",
    });
  });

  it('googleAuth retourne 403 si token invalide', async () => {
    const req = {
      body: {
        access_token: 'google-token',
      },
      headers: {},
      cookies: {},
    };

    const res = createRes();

    supabaseMock.auth.getUser.mockResolvedValue({
      data: null,
      error: new Error('invalid'),
    });

    await controller.googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token Google d'authentification invalide ou expiré",
    });
  });

  it('googleAuth retourne 400 si email existe déjà en local', async () => {
    const req = {
      body: {
        access_token: 'google-token',
      },
      headers: {},
      cookies: {},
    };

    const res = createRes();

    supabaseMock.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-id',
          email: 'test@test.com',
          user_metadata: {},
        },
      },
      error: null,
    });

    findUserByEmailMock.mockResolvedValue({
      utilisateur_id: 'user-local',
      email: 'test@test.com',
      provider: 'local',
    });

    await controller.googleAuth(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Un compte avec cet email existe déjà. Veuillez utiliser la connexion locale.',
    });
  });

  it('googleAuth renvoie 200 et pose les cookies si le token Supabase est valide', async () => {
    const req = {
      body: {
        access_token: 'google-token',
      },
      headers: {},
      cookies: {},
    };

    const res = createRes();

    const user = {
      utilisateur_id: 'user-google',
      email: 'google@test.com',
      provider: 'google',
      role: 'etudiant',
    };

    supabaseMock.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-id',
          email: 'google@test.com',
          user_metadata: {
            full_name: 'Google User',
          },
        },
      },
      error: null,
    });

    findUserByEmailMock.mockResolvedValue(null);
    syncGoogleUserMock.mockResolvedValue(user);

    await controller.googleAuth(req, res);

    expect(syncGoogleUserMock).toHaveBeenCalledWith({
      sub: 'google-id',
      email: 'google@test.com',
      user_metadata: {
        full_name: 'Google User',
      },
    });

    expect(generateLocalTokenMock).toHaveBeenCalledWith(user);
    expect(generateRefreshTokenMock).toHaveBeenCalledWith(user);
    expect(creerSessionMock).toHaveBeenCalledWith('user-google', req);

    expect(res.cookie).toHaveBeenCalledTimes(3);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Authentification Google réussie',
      provider: 'google',
      user,
    });
  });

  it('refreshAccessToken retourne 401 si refresh token absent', async () => {
    const req = {
      cookies: {},
    };

    const res = createRes();

    await controller.refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Refresh token manquant',
    });
  });

  it('refreshAccessToken retourne 403 si refresh token invalide', async () => {
    const req = {
      cookies: {
        refreshToken: 'bad-refresh',
      },
    };

    const res = createRes();

    verifyRefreshTokenMock.mockReturnValue(null);

    await controller.refreshAccessToken(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Refresh token invalide ou expiré.',
    });
  });

  it('refreshAccessToken retourne 404 si utilisateur introuvable', async () => {
    const req = {
      cookies: {
        refreshToken: 'refresh-token',
      },
    };

    const res = createRes();

    verifyRefreshTokenMock.mockReturnValue({
      id: 'user-1',
    });

    getPublicUserByIdMock.mockResolvedValue(null);

    await controller.refreshAccessToken(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  });

  it('refreshAccessToken renvoie 200 et renouvelle les cookies', async () => {
    const req = {
      cookies: {
        refreshToken: 'refresh-token',
      },
    };

    const res = createRes();

    const user = {
      utilisateur_id: 'user-1',
      email: 'test@test.com',
      role: 'etudiant',
    };

    verifyRefreshTokenMock.mockReturnValue({
      id: 'user-1',
    });

    getPublicUserByIdMock.mockResolvedValue(user);

    generateLocalTokenMock.mockReturnValue('new-access-token');
    generateRefreshTokenMock.mockReturnValue('new-refresh-token');

    await controller.refreshAccessToken(req, res);

    expect(generateLocalTokenMock).toHaveBeenCalledWith(user);
    expect(generateRefreshTokenMock).toHaveBeenCalledWith(user);

    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Tokens rafraîchis avec succès',
    });
  });

  it('getProfile retourne 404 si utilisateur introuvable', async () => {
    const req = {
      user: {
        utilisateur_id: 'user-1',
        provider: 'local',
      },
    };

    const res = createRes();

    getPublicUserByIdMock.mockResolvedValue(null);

    await controller.getProfile(req, res);

    expect(getPublicUserByIdMock).toHaveBeenCalledWith('user-1');
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  });

  it('getProfile retourne 200 si utilisateur trouvé', async () => {
    const req = {
      user: {
        utilisateur_id: 'user-1',
        provider: 'local',
      },
    };

    const res = createRes();

    const user = {
      utilisateur_id: 'user-1',
      email: 'test@test.com',
    };

    getPublicUserByIdMock.mockResolvedValue(user);

    await controller.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      provider: 'local',
      user,
    });
  });

  it('getAllUsers retourne tous les utilisateurs', async () => {
    const req = {};
    const res = createRes();

    const users = [
      {
        utilisateur_id: 'user-1',
        email: 'test@test.com',
      },
    ];

    getAllPublicUsersMock.mockResolvedValue(users);

    await controller.getAllUsers(req, res);

    expect(getAllPublicUsersMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      users,
    });
  });

  it('logout ferme la session et supprime les cookies', async () => {
    const req = {
      user: {
        utilisateur_id: 'user-1',
      },
      cookies: {
        sessionToken: 'session-token',
      },
    };

    const res = createRes();

    fermerSessionMock.mockResolvedValue({});

    await controller.logout(req, res);

    expect(fermerSessionMock).toHaveBeenCalledWith('session-token');

    expect(res.clearCookie).toHaveBeenCalledWith('sessionToken');
    expect(res.clearCookie).toHaveBeenCalledWith('accessToken');
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Déconnecté avec succès',
    });
  });
});
