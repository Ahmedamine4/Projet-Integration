import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

// Mock du module jsonwebtoken pour piloter les cas
// token local valide, token Google valide ou token invalide.
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
}));

// Mock de la generation du token local.
vi.mock('../../src/config/jwt.js', () => ({
  generateLocalToken: vi.fn(),
}));

// Mock de Supabase pour eviter un vrai appel API.
vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

// Mock des services utilises par les routes.
// Cela permet de tester le comportement HTTP sans utiliser
// les vraies dependances du backend.
vi.mock('../../src/services/auth.service.js', () => ({
  registerLocalUser: vi.fn(),
  loginLocalUser: vi.fn(),
  syncGoogleUser: vi.fn(),
  getPublicUserById: vi.fn(),
  getAllPublicUsers: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserByLocalId: vi.fn(),
  findUserBySupabaseUid: vi.fn(),
  sanitizeUser: vi.fn((user) => {
    const { mot_de_passe, ...safeUser } = user;
    return safeUser;
  }),
}));

// app est l'application Express reelle.
// request(app) envoie de vraies requetes HTTP de test dessus.
import jwt from 'jsonwebtoken';
import { generateLocalToken } from '../../src/config/jwt.js';
import { supabase } from '../../src/config/supabase.js';
import app from '../../src/app.js';
import {
  findUserByEmail,
  findUserByLocalId,
  findUserBySupabaseUid,
  getAllPublicUsers,
  getPublicUserById,
  loginLocalUser,
  registerLocalUser,
  syncGoogleUser,
} from '../../src/services/auth.service.js';

// Cette suite teste les routes HTTP avec Supertest.
// Ici, on envoie de vraies requetes au routeur Express,
// mais les services externes restent mockes.
describe('auth routes', () => {
  beforeEach(() => {
    // On nettoie tous les mocks avant chaque scenario
    // pour garder des tests independants.
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'local-secret';
    process.env.SUPABASE_JWT_SECRET = 'google-secret';
  });

  it('POST /api/auth/register retourne 201 en cas de succes', async () => {
    // On teste le parcours HTTP complet de l'inscription.
    // La requete passe par la route puis le controller.
    registerLocalUser.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
    });
    generateLocalToken.mockReturnValue('local-token');

    // send(...) represente le body JSON envoye a l'API.
    const response = await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@test.com',
      password: 'Password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBe('local-token');
    expect(response.body.user.provider).toBe('local');
    expect(response.body.user.mot_de_passe).toBeUndefined();
  });

  it('POST /api/auth/register retourne 400 si lemail existe deja', async () => {
    // La route doit propager une erreur simple du service.
    registerLocalUser.mockRejectedValue(new Error('Email déjà utilisé'));

    const response = await request(app).post('/api/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'used@test.com',
      password: 'Password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/register retourne 400 si les champs sont invalides', async () => {
    // La route doit refuser une inscription invalide.
    registerLocalUser.mockRejectedValue(new Error('Tous les champs sont requis'));

    const response = await request(app).post('/api/auth/register').send({
      firstName: '',
      lastName: 'Doe',
      email: 'bad-email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Tous les champs sont requis');
  });

  it('POST /api/auth/login retourne 200 avec le token local', async () => {
    // On verifie le format de reponse du login local.
    loginLocalUser.mockResolvedValue({
      token: 'login-token',
      user: {
        utilisateur_id: 'u1',
        nom: 'Doe',
        prenom: 'Jane',
        email: 'jane@test.com',
        role: 'etudiant',
        provider: 'local',
      },
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'jane@test.com',
      password: 'Password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.provider).toBe('local');
    expect(response.body.token).toBe('login-token');
    expect(response.body.user.mot_de_passe).toBeUndefined();
  });

  it('POST /api/auth/login retourne 401 si le mot de passe est faux', async () => {
    // Mot de passe faux = reponse 401.
    loginLocalUser.mockRejectedValue(new Error('Email ou mot de passe incorrect'));

    const response = await request(app).post('/api/auth/login').send({
      email: 'jane@test.com',
      password: 'wrong-password',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/login retourne 401 si lemail est inexistant', async () => {
    // Email inconnu = meme reponse 401.
    loginLocalUser.mockRejectedValue(new Error('Email ou mot de passe incorrect'));

    const response = await request(app).post('/api/auth/login').send({
      email: 'unknown@test.com',
      password: 'Password123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/google retourne 200 avec provider google', async () => {
    // On teste le login Google avec un token valide.
    // Si Supabase valide le token, le backend connecte ou cree l'utilisateur.
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uid',
          email: 'google@test.com',
          user_metadata: {
            given_name: 'John',
            family_name: 'Doe',
          },
        },
      },
      error: null,
    });
    findUserByEmail.mockResolvedValue(null);
    syncGoogleUser.mockResolvedValue({
      utilisateur_id: 'u2',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
    });
    generateLocalToken.mockReturnValue('google-token');

    // Ici le token Google est envoye dans le body.
    const response = await request(app).post('/api/auth/google').send({
      access_token: 'good-google-token',
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.provider).toBe('google');
    expect(response.body.token).toBe('google-token');
    expect(response.body.user.provider).toBe('google');
  });

  it('POST /api/auth/google retourne 403 si le token Google est invalide', async () => {
    // Si Supabase refuse le token, la route doit renvoyer 403.
    supabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('invalid'),
    });

    const response = await request(app).post('/api/auth/google').send({
      access_token: 'bad-google-token',
    });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/google evite un doublon si un compte local existe deja', async () => {
    // Un compte local existant bloque la creation d'un compte Google doublon.
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uid',
          email: 'local@test.com',
          user_metadata: {},
        },
      },
      error: null,
    });
    findUserByEmail.mockResolvedValue({
      utilisateur_id: 'u9',
      email: 'local@test.com',
      provider: 'local',
    });

    const response = await request(app).post('/api/auth/google').send({
      access_token: 'good-google-token',
    });

    expect(response.status).toBe(400);
    expect(syncGoogleUser).not.toHaveBeenCalled();
  });

  it('POST /api/auth/google retourne 500 si syncGoogleUser echoue', async () => {
    // Si la synchronisation Google echoue, la route doit renvoyer 500.
    supabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'google-uid',
          email: 'google@test.com',
          user_metadata: {
            given_name: 'John',
            family_name: 'Doe',
          },
        },
      },
      error: null,
    });
    findUserByEmail.mockResolvedValue(null);
    syncGoogleUser.mockRejectedValue(new Error('Erreur sync Google'));

    const response = await request(app).post('/api/auth/google').send({
      access_token: 'good-google-token',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: 'Erreur sync Google',
    });
  });

  it('GET /api/auth/me retourne 200 si le token local est valide', async () => {
    // On teste une route protegee avec un token local.
    // Le middleware doit d'abord remplir req.user avant que le controller reponde.
    jwt.verify.mockReturnValue({
      id: 'u1',
      email: 'jane@test.com',
      role: 'etudiant',
    });
    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
      mot_de_passe: 'secret',
    });
    getPublicUserById.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
    });

    // set('Authorization', ...) simule l'envoi du header Bearer token.
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer local-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('jane@test.com');
  });

  it('GET /api/auth/me retourne 401 sans token', async () => {
    // Sans Authorization, la route protegee refuse l'acces.
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token d'authentification manquant");
  });

  it('GET /api/auth/me retourne 403 si le token est invalide', async () => {
    // Un token invalide doit etre refuse.
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer bad-token');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Token d'authentification invalide");
  });

  it('GET /api/auth/me retourne 401 si le token local est valide mais lutilisateur nexiste pas', async () => {
    // Le token est correct, mais aucun utilisateur n'est trouve en base.
    jwt.verify.mockReturnValue({
      id: 'u404',
      email: 'ghost@test.com',
      role: 'etudiant',
    });
    findUserByLocalId.mockResolvedValue(null);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer local-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: 'Utilisateur non trouvé',
    });
  });

  it('GET /api/auth/me retourne 500 si getPublicUserById echoue', async () => {
    // Si la lecture du profil echoue, la route doit renvoyer 500.
    jwt.verify.mockReturnValue({
      id: 'u1',
      email: 'jane@test.com',
      role: 'etudiant',
    });
    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
      mot_de_passe: 'secret',
    });
    getPublicUserById.mockRejectedValue(new Error('Erreur profil'));

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer local-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: 'Erreur profil',
    });
  });

  it('GET /api/auth/users retourne 200 pour un admin', async () => {
    // Un administrateur doit pouvoir lire la liste des users.
    jwt.verify.mockReturnValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'administrateur',
    });
    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'admin-1',
      nom: 'Admin',
      prenom: 'Root',
      email: 'admin@test.com',
      role: 'administrateur',
      provider: 'local',
      mot_de_passe: 'secret',
    });
    getAllPublicUsers.mockResolvedValue([
      {
        utilisateur_id: 'u1',
        email: 'user@test.com',
      },
    ]);

    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
  });

  it('GET /api/auth/users retourne 403 pour un etudiant', async () => {
    // Un etudiant authentifie reste bloque sur une route admin.
    jwt.verify.mockReturnValue({
      id: 'u1',
      email: 'student@test.com',
      role: 'etudiant',
    });
    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'student@test.com',
      role: 'etudiant',
      provider: 'local',
      mot_de_passe: 'secret',
    });

    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', 'Bearer student-token');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Accès refusé, rôle non autorisé');
  });

  it('GET /api/auth/users retourne 500 si getAllPublicUsers echoue', async () => {
    // Si la lecture de la liste des users echoue, la route doit renvoyer 500.
    jwt.verify.mockReturnValue({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'administrateur',
    });
    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'admin-1',
      nom: 'Admin',
      prenom: 'Root',
      email: 'admin@test.com',
      role: 'administrateur',
      provider: 'local',
      mot_de_passe: 'secret',
    });
    getAllPublicUsers.mockRejectedValue(new Error('Erreur liste users'));

    const response = await request(app)
      .get('/api/auth/users')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: 'Erreur liste users',
    });
  });

  it('GET /api/auth/me accepte aussi un token google valide', async () => {
    // Le middleware doit aussi accepter un token Google.
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
    getPublicUserById.mockResolvedValue({
      utilisateur_id: 'u2',
      nom: 'Doe',
      prenom: 'John',
      email: 'google@test.com',
      role: 'etudiant',
      provider: 'google',
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer google-token');

    expect(response.status).toBe(200);
    expect(response.body.user.provider).toBe('google');
  });

  it('GET /api/auth/profile retourne 200 si le token local est valide', async () => {
    // Cette route doit fonctionner comme /me.
    jwt.verify.mockReturnValue({
      id: 'u1',
      email: 'jane@test.com',
      role: 'etudiant',
    });
    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
      mot_de_passe: 'secret',
    });
    getPublicUserById.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Doe',
      prenom: 'Jane',
      email: 'jane@test.com',
      role: 'etudiant',
      provider: 'local',
    });

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer local-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('jane@test.com');
  });

  it('GET /api/auth/profile retourne 401 sans token', async () => {
    // Sans token, /profile doit etre refusee comme /me.
    const response = await request(app).get('/api/auth/profile');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token d'authentification manquant");
  });

  it('GET /api/auth/profile retourne 403 si le token est invalide', async () => {
    // Un token invalide doit etre refuse sur /profile.
    jwt.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer bad-token');

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Token d'authentification invalide");
  });
});
