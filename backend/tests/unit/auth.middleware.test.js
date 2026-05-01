import { beforeEach, describe, expect, it, vi } from 'vitest';

// Ce mock remplace le package jsonwebtoken.
// Il sert a choisir librement si jwt.verify reussit ou echoue.
// Mock de jsonwebtoken :
// on remplace jwt.verify par une fausse fonction
// pour choisir librement si le token est valide ou non.
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

// Ces mocks remplacent les fonctions du service appelees par le middleware.
// Mock des fonctions du service utilisees par le middleware.
// Le middleware depend de ces fonctions pour retrouver l'utilisateur.
vi.mock('../../src/services/auth.service.js', () => ({
  findUserByLocalId: vi.fn(),
  findUserBySupabaseUid: vi.fn(),
  sanitizeUser: vi.fn((user) => {
    const { mot_de_passe, ...safeUser } = user;
    return safeUser;
  }),
  syncGoogleUser: vi.fn(),
}));

// Ici, jwt est la version mockee du module.
import jwt from 'jsonwebtoken';
import {
  findUserByLocalId,
  findUserBySupabaseUid,
  syncGoogleUser,
} from '../../src/services/auth.service.js';
import {
  authMiddleware,
  authorizeRoles,
  ROLES,
} from '../../src/middlewares/auth.middleware.js';

// Cette fonction simule la reponse Express.
// Elle permet de verifier facilement les appels a status() et json().
function createResponseMock() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('auth.middleware', () => {
  beforeEach(() => {
    // On nettoie les mocks et on prepare les secrets utilises par le middleware.
    vi.clearAllMocks();
    // Ces variables sont lues par jwt.verify dans le middleware.
    process.env.JWT_SECRET = 'local-secret';
    process.env.SUPABASE_JWT_SECRET = 'google-secret';
  });

  it('refuse la requete si aucun token nest envoye', async () => {
    // Une route protegee doit refuser une requete sans Bearer token.
    const req = { headers: {} };
    const res = createResponseMock();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token d'authentification manquant",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('accepte un token local valide et remplit req.user', async () => {
    // Si le token local est bon, le middleware prepare req.user.
    // Cela permet aux controllers suivants de savoir qui est connecte.
    const req = {
      headers: { authorization: 'Bearer local-token' },
    };
    const res = createResponseMock();
    const next = vi.fn();

    // Le mock retourne ici le contenu decode du token local.
    jwt.verify.mockReturnValue({
      id: 'u1',
      email: 'jane@test.com',
      role: 'etudiant',
    });
    // Cette ligne simule le user retrouve en base grace a l'id du token.
    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
      mot_de_passe: 'secret',
    });

    await authMiddleware(req, res, next);

    // On verifie que le middleware a bien utilise le bon secret JWT local.
    expect(jwt.verify).toHaveBeenCalledWith('local-token', 'local-secret');
    // req.user sera reutilise ensuite dans les controllers.
    expect(req.user).toEqual({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
    });
    expect(req.authType).toBe('local');
    // next() signifie qu'Express peut passer a la suite.
    expect(next).toHaveBeenCalled();
  });

  it('accepte un token google valide si le token local echoue', async () => {
    // Si le token local echoue, on essaie ensuite le token Google.
    // Cela montre que le middleware accepte deux modes d'authentification.
    const req = {
      headers: { authorization: 'Bearer google-token' },
    };
    const res = createResponseMock();
    const next = vi.fn();

    // 1er appel : echec avec le secret local
    // 2e appel : succes avec le secret Google
    jwt.verify
      .mockImplementationOnce(() => {
        throw new Error('not local');
      })
      .mockReturnValueOnce({
        sub: 'google-uid',
        email: 'google@test.com',
      });
    findUserBySupabaseUid.mockResolvedValue({
      utilisateur_id: 'u2',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
      supabase_uid: 'google-uid',
    });

    await authMiddleware(req, res, next);

    expect(req.user.email).toBe('google@test.com');
    expect(req.authType).toBe('google');
    expect(next).toHaveBeenCalled();
  });

  it('refuse un token local valide si lutilisateur nexiste pas', async () => {
    // Le token est bien decode, mais aucun utilisateur n'est trouve en base.
    const req = {
      headers: { authorization: 'Bearer local-token' },
    };
    const res = createResponseMock();
    const next = vi.fn();

    jwt.verify.mockReturnValue({
      id: 'u404',
      email: 'ghost@test.com',
      role: 'etudiant',
    });
    findUserByLocalId.mockResolvedValue(null);

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Utilisateur non trouvé',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('cree le user google si le token google est valide mais le user est absent', async () => {
    // Un user Google absent peut etre synchronise automatiquement.
    // Le middleware peut donc reconstruire un compte local a partir du token Google.
    const req = {
      headers: { authorization: 'Bearer google-token' },
    };
    const res = createResponseMock();
    const next = vi.fn();

    jwt.verify
      .mockImplementationOnce(() => {
        throw new Error('not local');
      })
      .mockReturnValueOnce({
        sub: 'google-uid',
        email: 'google@test.com',
      });
    // null = aucun user Google trouve en base.
    findUserBySupabaseUid.mockResolvedValue(null);
    // Le mock simule ensuite la creation/synchronisation du compte.
    syncGoogleUser.mockResolvedValue({
      utilisateur_id: 'u2',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
    });

    await authMiddleware(req, res, next);

    expect(syncGoogleUser).toHaveBeenCalledWith({
      sub: 'google-uid',
      email: 'google@test.com',
    });
    expect(req.user.provider).toBe('google');
    expect(next).toHaveBeenCalled();
  });

  it('refuse un token invalide', async () => {
    // Si aucun des deux secrets ne valide le token, on refuse.
    const req = {
      headers: { authorization: 'Bearer bad-token' },
    };
    const res = createResponseMock();
    const next = vi.fn();

    jwt.verify.mockImplementation(() => {
      throw new Error('invalid');
    });

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Token d'authentification invalide",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('authorizeRoles accepte un administrateur', () => {
    // Un admin peut passer sur une route reservee admin.
    const req = { user: { role: ROLES.ADMIN } };
    const res = createResponseMock();
    const next = vi.fn();

    authorizeRoles(ROLES.ADMIN)(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('authorizeRoles refuse un utilisateur non connecte', () => {
    // Sans req.user, la verification de role doit echouer.
    const req = {};
    const res = createResponseMock();
    const next = vi.fn();

    authorizeRoles(ROLES.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Utilisateur non connecté',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('authorizeRoles refuse un role non autorise', () => {
    // Un etudiant ne peut pas acceder a une route admin.
    const req = { user: { role: ROLES.ETUDIANT } };
    const res = createResponseMock();
    const next = vi.fn();

    authorizeRoles(ROLES.ADMIN)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Accès refusé, rôle non autorisé',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
