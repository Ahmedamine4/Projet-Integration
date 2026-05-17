import { beforeEach, describe, expect, it, vi } from 'vitest';

// Le controller delegue presque tout au service auth.
const authServiceMock = {
  registerLocalUser: vi.fn(),
  loginLocalUser: vi.fn(),
  syncGoogleUser: vi.fn(),
  getPublicUserById: vi.fn(),
  getAllPublicUsers: vi.fn(),
  findUserByEmail: vi.fn(),
};

const jwtMock = {
  generateLocalToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
};

const supabaseGetUserMock = vi.fn();

// On mocke uniquement les dependances du controller.
vi.mock('../../src/services/auth.service.js', () => authServiceMock);

vi.mock('../../src/config/jwt.js', () => jwtMock);

vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: supabaseGetUserMock,
    },
  },
}));

const controller = await import('../../src/controllers/auth.controller.js');

function createRes() {
  // Petit faux objet Express pour verifier status/json/cookie.
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    cookie: vi.fn().mockReturnThis(),
    clearCookie: vi.fn().mockReturnThis(),
  };
}

describe('auth.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ces secrets suffisent pour les appels internes du controller.
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'refresh-secret';
  });

  it('register renvoie 201 avec user et pose les cookies', async () => {
    // Arrange
    const req = {
      body: {
        firstName: 'Integration',
        lastName: 'Tester',
        email: 'integration@example.com',
        password: 'StrongPass123!',
      },
    };
    const res = createRes();
    authServiceMock.registerLocalUser.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Tester',
      prenom: 'Integration',
      email: 'integration@example.com',
      role: 'etudiant',
      provider: 'local',
    });
    jwtMock.generateLocalToken.mockReturnValue('access-token');
    jwtMock.generateRefreshToken.mockReturnValue('refresh-token');

    // Act
    await controller.register(req, res);

    // Assert
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: expect.objectContaining({
          email: 'integration@example.com',
        }),
      })
    );
  });

  it('register renvoie 400 si le service echoue', async () => {
    // Arrange
    const req = { body: {} };
    const res = createRes();
    authServiceMock.registerLocalUser.mockRejectedValue(new Error('Tous les champs sont requis'));

    // Act
    await controller.register(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Tous les champs sont requis',
      })
    );
  });

  it('login renvoie 200 avec user et pose les cookies', async () => {
    // Arrange
    const req = {
      body: {
        email: 'integration@example.com',
        password: 'StrongPass123!',
      },
    };
    const res = createRes();
    authServiceMock.loginLocalUser.mockResolvedValue({
      user: {
        utilisateur_id: 'u2',
        email: 'integration@example.com',
        role: 'etudiant',
        provider: 'local',
      },
      token: 'access-token',
      refreshToken: 'refresh-token',
    });

    // Act
    await controller.login(req, res);

    // Assert
    // Le controller ne renvoie pas accessToken dans le body.
    // Il prend "token" du service puis le place dans le cookie "accessToken".
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        provider: 'local',
        user: expect.objectContaining({
          email: 'integration@example.com',
        }),
      })
    );
  });

  it('login renvoie 401 si email ou mot de passe incorrect', async () => {
    // Arrange
    const req = { body: { email: 'x', password: 'y' } };
    const res = createRes();
    authServiceMock.loginLocalUser.mockRejectedValue(new Error('Email ou mot de passe incorrect'));

    // Act
    await controller.login(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Email ou mot de passe incorrect',
      })
    );
  });

  it('googleAuth renvoie 401 si le token Google est manquant', async () => {
    // Arrange
    const req = { body: {}, headers: {} };
    const res = createRes();

    // Act
    await controller.googleAuth(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('googleAuth renvoie 403 si le token Google est invalide', async () => {
    // Arrange
    const req = { body: { access_token: 'bad-token' }, headers: {} };
    const res = createRes();
    supabaseGetUserMock.mockResolvedValue({
      data: null,
      error: new Error('invalid token'),
    });

    // Act
    await controller.googleAuth(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('googleAuth renvoie 400 si l email existe deja en local', async () => {
    // Arrange
    const req = { body: { access_token: 'good-token' }, headers: {} };
    const res = createRes();
    supabaseGetUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'google-sub-1',
          email: 'already.used@example.com',
          user_metadata: {
            given_name: 'Google',
            family_name: 'User',
          },
        },
      },
      error: null,
    });
    authServiceMock.findUserByEmail.mockResolvedValue({
      utilisateur_id: 'u-local',
      email: 'already.used@example.com',
      provider: 'local',
    });

    // Act
    await controller.googleAuth(req, res);

    // Assert
    expect(authServiceMock.syncGoogleUser).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('connexion locale'),
      })
    );
  });

  it('googleAuth renvoie 200 et pose les cookies si le token Supabase est valide', async () => {
    // Arrange
    const req = { body: { access_token: 'good-token' }, headers: {} };
    const res = createRes();
    supabaseGetUserMock.mockResolvedValue({
      data: {
        user: {
          id: 'google-sub-1',
          email: 'google@example.com',
          user_metadata: {
            given_name: 'Google',
            family_name: 'User',
          },
        },
      },
      error: null,
    });
    authServiceMock.findUserByEmail.mockResolvedValue(null);
    authServiceMock.syncGoogleUser.mockResolvedValue({
      utilisateur_id: 'g1',
      email: 'google@example.com',
      role: 'etudiant',
      provider: 'google',
    });
    jwtMock.generateLocalToken.mockReturnValue('access-token');
    jwtMock.generateRefreshToken.mockReturnValue('refresh-token');

    // Act
    await controller.googleAuth(req, res);

    // Assert
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        provider: 'google',
      })
    );
  });

  it('refreshAccessToken renvoie 401 si le refresh token manque', async () => {
    // Arrange
    const req = { cookies: {} };
    const res = createRes();

    // Act
    await controller.refreshAccessToken(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('refreshAccessToken renvoie 403 si le refresh token est invalide', async () => {
    // Arrange
    const req = { cookies: { refreshToken: 'bad-refresh' } };
    const res = createRes();
    jwtMock.verifyRefreshToken.mockReturnValue(null);

    // Act
    await controller.refreshAccessToken(req, res);

    // Assert
    expect(res.clearCookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('refreshAccessToken renvoie 200 avec nouveaux cookies si le refresh token est valide', async () => {
    // Arrange
    const req = { cookies: { refreshToken: 'good-refresh' } };
    const res = createRes();
    jwtMock.verifyRefreshToken.mockReturnValue({ id: 'u1' });
    authServiceMock.getPublicUserById.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'integration@example.com',
      role: 'etudiant',
      provider: 'local',
    });
    jwtMock.generateLocalToken.mockReturnValue('new-access-token');
    jwtMock.generateRefreshToken.mockReturnValue('new-refresh-token');

    // Act
    await controller.refreshAccessToken(req, res);

    // Assert
    expect(res.cookie).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: expect.any(String),
      })
    );
  });

  it("refreshAccessToken renvoie 404 si l'utilisateur n'existe pas", async () => {
    // Arrange
    const req = { cookies: { refreshToken: 'good-refresh' } };
    const res = createRes();
    jwtMock.verifyRefreshToken.mockReturnValue({ id: 'u404' });
    authServiceMock.getPublicUserById.mockResolvedValue(null);

    // Act
    await controller.refreshAccessToken(req, res);

    // Assert
    expect(res.cookie).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining('Utilisateur non trouvé'),
      })
    );
  });

  it('getProfile renvoie 200 avec un user sans mot_de_passe', async () => {
    // Arrange
    const req = { user: { utilisateur_id: 'u1', provider: 'local' } };
    const res = createRes();
    authServiceMock.getPublicUserById.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'integration@example.com',
      role: 'etudiant',
      provider: 'local',
    });

    // Act
    await controller.getProfile(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        user: expect.objectContaining({
          email: 'integration@example.com',
        }),
      })
    );
  });

  it('getAllUsers renvoie 200 avec la liste des utilisateurs publics', async () => {
    // Arrange
    const req = {};
    const res = createRes();
    authServiceMock.getAllPublicUsers.mockResolvedValue([
      {
        utilisateur_id: 'u1',
        email: 'one@example.com',
        role: 'etudiant',
        provider: 'local',
      },
      {
        utilisateur_id: 'u2',
        email: 'two@example.com',
        role: 'administrateur',
        provider: 'local',
      },
    ]);

    // Act
    await controller.getAllUsers(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      users: expect.arrayContaining([
        expect.objectContaining({ email: 'one@example.com' }),
        expect.objectContaining({ email: 'two@example.com' }),
      ]),
    });
  });
});
