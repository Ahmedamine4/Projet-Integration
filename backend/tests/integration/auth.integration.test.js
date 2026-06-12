import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createLocalUserFixture,
  extractCookieValue,
  signExpiredAccessToken,
  signExpiredRefreshToken,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

function buildAccessToken(user) {
  return jwt.sign(
    {
      id: user.utilisateur_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

describe('Auth integration', () => {
  beforeAll(async () => {
    assertAuthTestEnvironment();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanupAuthFixtures();
  });

  afterAll(async () => {
    await cleanupAuthFixtures();
    await prisma.$disconnect();
  });

  it('POST /api/auth/register refuse des champs invalides', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: '',
        lastName: '',
        email: 'email-invalide',
        password: '123',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/register inscrit un utilisateur local avec un payload valide', async () => {
    const payload = buildRegisterPayload('register-valid');

    const response = await request(app)
      .post('/api/auth/register')
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    expect(response.body.user).toMatchObject({
      email: payload.email,
      role: 'etudiant',
      provider: 'local',
      nom: payload.lastName,
      prenom: payload.firstName,
    });

    expect(response.body.user).not.toHaveProperty('mot_de_passe');

    const setCookie = response.headers['set-cookie'] || [];
    expect(extractCookieValue(setCookie, 'accessToken')).toEqual(expect.any(String));
    expect(extractCookieValue(setCookie, 'refreshToken')).toEqual(expect.any(String));
  });

  it('POST /api/auth/login connecte un utilisateur local valide', async () => {
    const payload = buildRegisterPayload('login-current');
    await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: payload.email,
        password: payload.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.provider).toBe('local');

    expect(response.body.user).toMatchObject({
      email: payload.email,
      role: 'etudiant',
      provider: 'local',
    });

    expect(response.body.user).not.toHaveProperty('mot_de_passe');

    const setCookie = response.headers['set-cookie'] || [];
    expect(extractCookieValue(setCookie, 'accessToken')).toEqual(expect.any(String));
    expect(extractCookieValue(setCookie, 'refreshToken')).toEqual(expect.any(String));
  });

  it('POST /api/auth/login refuse un mot de passe incorrect', async () => {
    const payload = buildRegisterPayload('login-wrong');
    await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: payload.email,
        password: 'wrong-password',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/register refuse un email deja utilise', async () => {
    const payload = buildRegisterPayload('duplicate');
    await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/auth/register')
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/auth/me refuse l acces sans accessToken', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/auth/me refuse un accessToken invalide', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', 'accessToken=token-invalide');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/auth/profile refuse l acces sans accessToken', async () => {
    const response = await request(app).get('/api/auth/profile');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/auth/profile refuse un accessToken invalide', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Cookie', 'accessToken=token-invalide');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/auth/me refuse un accessToken expire', async () => {
    const payload = buildRegisterPayload('expired-access');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const expiredAccessToken = signExpiredAccessToken(user);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Cookie', `accessToken=${expiredAccessToken}`);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/refresh-token refuse un refreshToken manquant', async () => {
    const response = await request(app).post('/api/auth/refresh-token');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/refresh-token refuse un refreshToken invalide', async () => {
    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', 'refreshToken=refresh-invalide');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/refresh-token refuse un refreshToken expire', async () => {
    const expiredRefreshToken = signExpiredRefreshToken({
      utilisateur_id: 'expired-refresh-user',
    });

    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${expiredRefreshToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/auth/refresh-token retourne de nouveaux cookies avec un refreshToken valide', async () => {
    const payload = buildRegisterPayload('refresh-valid');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const validRefreshToken = jwt.sign(
      { id: user.utilisateur_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const response = await request(app)
      .post('/api/auth/refresh-token')
      .set('Cookie', `refreshToken=${validRefreshToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const setCookie = response.headers['set-cookie'] || [];
    const accessToken = extractCookieValue(setCookie, 'accessToken');
    const refreshToken = extractCookieValue(setCookie, 'refreshToken');

    expect(accessToken).toEqual(expect.any(String));
    expect(refreshToken).toEqual(expect.any(String));

    const decodedAccess = jwt.verify(accessToken, process.env.JWT_SECRET);
    expect(decodedAccess.id).toBe(user.utilisateur_id);
    expect(decodedAccess.role).toBe(user.role);
  });

  it('GET /api/auth/users refuse l acces sans accessToken', async () => {
    const response = await request(app).get('/api/auth/users');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/auth/users retourne 403 pour un etudiant', async () => {
    const payload = buildRegisterPayload('users-student');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .get('/api/auth/users')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/auth/users accepte un administrateur local', async () => {
    const payload = buildRegisterPayload('users-admin');

    const user = await createLocalUserFixture(payload.email, payload.password, {
      role: 'administrateur',
      nom: 'Admin',
      prenom: 'Fixture',
    });

    const response = await request(app)
      .get('/api/auth/users')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(
      response.body.users.some((listedUser) => listedUser.email === payload.email)
    ).toBe(true);
  });

  it('POST /api/auth/google refuse un token Google manquant', async () => {
    const response = await request(app)
      .post('/api/auth/google')
      .send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
