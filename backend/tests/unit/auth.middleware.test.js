import { beforeEach, describe, expect, it, vi } from 'vitest';

// Le middleware depend du service auth pour retrouver et nettoyer le user.
const authServiceMock = {
  findUserByLocalId: vi.fn(),
  findUserBySupabaseUid: vi.fn(),
  sanitizeUser: vi.fn(),
  syncGoogleUser: vi.fn(),
};

const jwtVerifyMock = vi.fn();

vi.mock('../../src/services/auth.service.js', () => authServiceMock);

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: jwtVerifyMock,
  },
}));

const middlewareModule = await import('../../src/middlewares/auth.middleware.js');

function createRes() {
  // Faux objet response Express minimal.
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('auth.middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Secrets lus par jwt.verify dans le middleware.
    process.env.JWT_SECRET = 'jwt-secret';
    process.env.SUPABASE_JWT_SECRET = 'supabase-secret';
  });

  it('refuse sans token', async () => {
    // Arrange
    const req = { cookies: {} };
    const res = createRes();
    const next = vi.fn();

    // Act
    await middlewareModule.authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('remplit req.user et appelle next avec un accessToken local valide', async () => {
    // Arrange
    const req = { cookies: { accessToken: 'good-token' } };
    const res = createRes();
    const next = vi.fn();
    jwtVerifyMock.mockReturnValueOnce({ id: 'u1' });
    authServiceMock.findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'integration@example.com',
      role: 'etudiant',
      provider: 'local',
      mot_de_passe: 'hashed-password',
    });
    authServiceMock.sanitizeUser.mockReturnValue({
      utilisateur_id: 'u1',
      email: 'integration@example.com',
      role: 'etudiant',
      provider: 'local',
    });

    // Act
    await middlewareModule.authMiddleware(req, res, next);

    // Assert
    expect(req.user).toEqual(
      expect.objectContaining({
        utilisateur_id: 'u1',
        role: 'etudiant',
      })
    );
    expect(req.authType).toBe('local');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('refuse si le token local est invalide et le token Supabase aussi', async () => {
    // Arrange
    const req = { cookies: { accessToken: 'bad-token' } };
    const res = createRes();
    const next = vi.fn();
    jwtVerifyMock
      .mockImplementationOnce(() => {
        throw new Error('invalid local token');
      })
      .mockImplementationOnce(() => {
        throw new Error('invalid google token');
      });

    // Act
    await middlewareModule.authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('refuse si le token local est valide mais user introuvable', async () => {
    // Arrange
    const req = { cookies: { accessToken: 'good-token' } };
    const res = createRes();
    const next = vi.fn();
    jwtVerifyMock.mockReturnValueOnce({ id: 'missing-user' });
    authServiceMock.findUserByLocalId.mockResolvedValue(null);

    // Act
    await middlewareModule.authMiddleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepte un token Google valide et remplit req.user', async () => {
    // Arrange
    const req = { cookies: { accessToken: 'google-token' } };
    const res = createRes();
    const next = vi.fn();
    jwtVerifyMock
      .mockImplementationOnce(() => {
        throw new Error('not a local token');
      })
      .mockReturnValueOnce({ sub: 'google-sub-1' });
    authServiceMock.findUserBySupabaseUid.mockResolvedValue({
      utilisateur_id: 'g1',
      email: 'google@example.com',
      role: 'etudiant',
      provider: 'google',
    });
    authServiceMock.sanitizeUser.mockReturnValue({
      utilisateur_id: 'g1',
      email: 'google@example.com',
      role: 'etudiant',
      provider: 'google',
    });

    // Act
    await middlewareModule.authMiddleware(req, res, next);

    // Assert
    expect(req.authType).toBe('google');
    expect(req.user).toEqual(
      expect.objectContaining({
        utilisateur_id: 'g1',
        role: 'etudiant',
      })
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('accepte un token Google valide meme si le user est absent en base au debut', async () => {
    // Arrange
    const req = { cookies: { accessToken: 'google-token' } };
    const res = createRes();
    const next = vi.fn();
    jwtVerifyMock
      .mockImplementationOnce(() => {
        throw new Error('not a local token');
      })
      .mockReturnValueOnce({ sub: 'google-sub-2' });
    authServiceMock.findUserBySupabaseUid.mockResolvedValue(null);
    authServiceMock.syncGoogleUser.mockResolvedValue({
      utilisateur_id: 'g2',
      email: 'new.google@example.com',
      role: 'etudiant',
      provider: 'google',
    });
    authServiceMock.sanitizeUser.mockReturnValue({
      utilisateur_id: 'g2',
      email: 'new.google@example.com',
      role: 'etudiant',
      provider: 'google',
    });

    // Act
    await middlewareModule.authMiddleware(req, res, next);

    // Assert
    expect(authServiceMock.syncGoogleUser).toHaveBeenCalledWith({
      sub: 'google-sub-2',
    });
    expect(req.authType).toBe('google');
    expect(req.user).toEqual(
      expect.objectContaining({
        utilisateur_id: 'g2',
        role: 'etudiant',
      })
    );
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('authorizeRoles refuse si req.user est absent', () => {
    // Arrange
    const req = {};
    const res = createRes();
    const next = vi.fn();
    const middleware = middlewareModule.authorizeRoles(middlewareModule.ROLES.ADMIN);

    // Act
    middleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('authorizeRoles refuse un role non autorise', () => {
    // Arrange
    const req = { user: { role: 'etudiant' } };
    const res = createRes();
    const next = vi.fn();
    const middleware = middlewareModule.authorizeRoles(middlewareModule.ROLES.ADMIN);

    // Act
    middleware(req, res, next);

    // Assert
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('authorizeRoles appelle next pour un role autorise', () => {
    // Arrange
    const req = { user: { role: 'administrateur' } };
    const res = createRes();
    const next = vi.fn();
    const middleware = middlewareModule.authorizeRoles(middlewareModule.ROLES.ADMIN);

    // Act
    middleware(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
  });
});
