import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

// On mock le service pour tester les routes sans vraie base de données
vi.mock('../../src/services/auth.service.js', () => ({
  registerLocalUser: vi.fn(),
  loginLocalUser: vi.fn(),
  getPublicUserById: vi.fn(),
  getAllPublicUsers: vi.fn(),
  findUserByLocalId: vi.fn(),
  findUserBySupabaseUid: vi.fn(),
  syncGoogleUser: vi.fn(),
  sanitizeUser: vi.fn((user) => {
    const { mot_de_passe, ...safeUser } = user;
    return safeUser;
  }),
}));

// On mock Supabase pour éviter d'appeler Supabase réellement
vi.mock('../../src/config/supabase.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

import authRouter from '../../src/routes/auth.routes.js';

import {
  registerLocalUser,
  loginLocalUser,
  getPublicUserById,
  getAllPublicUsers,
  findUserByLocalId,
} from '../../src/services/auth.service.js';

describe('Tests intégration - routes auth', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.MY_EXPRESS_SECRET = 'local-secret';
    process.env.SUPABASE_JWT_SECRET = 'supabase-secret';

    app = express();
    app.use(express.json());
    app.use('/auth', authRouter);
  });

  it('POST /auth/register inscrit un étudiant', async () => {
    registerLocalUser.mockResolvedValue({
      utilisateur_id: 'u1',
      nom: 'Sara',
      prenom: 'Zbida',
      email: 'sara@test.com',
      role: 'etudiant',
      provider: 'local',
    });

    const response = await request(app)
      .post('/auth/register')
      .send({
        nom: 'Sara',
        prenom: 'Zbida',
        email: 'sara@test.com',
        password: '12345678',
        confirmPassword: '12345678',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.role).toBe('etudiant');
  });

  it('POST /auth/login connecte un utilisateur', async () => {
    loginLocalUser.mockResolvedValue({
      token: 'fake-token',
      user: {
        utilisateur_id: 'u1',
        email: 'sara@test.com',
        role: 'etudiant',
      },
    });

    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'sara@test.com',
        password: '12345678',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBe('fake-token');
  });

  it('GET /auth/profile retourne le profil si token valide', async () => {
    const token = jwt.sign(
      { id: 'u1', email: 'sara@test.com', role: 'etudiant' },
      process.env.MY_EXPRESS_SECRET
    );

    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'sara@test.com',
      role: 'etudiant',
      mot_de_passe: 'hashed',
    });

    getPublicUserById.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'sara@test.com',
      role: 'etudiant',
    });

    const response = await request(app)
      .get('/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe('sara@test.com');
  });

  it('GET /auth/profile refuse sans token', async () => {
    const response = await request(app).get('/auth/profile');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token d'authentification manquant");
  });

  it('GET /auth/users refuse un étudiant', async () => {
    const token = jwt.sign(
      { id: 'u1', email: 'student@test.com', role: 'etudiant' },
      process.env.MY_EXPRESS_SECRET
    );

    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'u1',
      email: 'student@test.com',
      role: 'etudiant',
      mot_de_passe: 'hashed',
    });

    const response = await request(app)
      .get('/auth/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Accès refusé, rôle non autorisé');
  });

  it('GET /auth/users accepte un admin', async () => {
    const token = jwt.sign(
      { id: 'admin1', email: 'admin@test.com', role: 'administrateur' },
      process.env.MY_EXPRESS_SECRET
    );

    findUserByLocalId.mockResolvedValue({
      utilisateur_id: 'admin1',
      email: 'admin@test.com',
      role: 'administrateur',
      mot_de_passe: 'hashed',
    });

    getAllPublicUsers.mockResolvedValue([
      {
        utilisateur_id: 'u1',
        email: 'sara@test.com',
        role: 'etudiant',
      },
    ]);

    const response = await request(app)
      .get('/auth/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.users).toHaveLength(1);
  });
});