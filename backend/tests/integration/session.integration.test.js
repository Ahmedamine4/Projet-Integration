import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildAccessToken,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createAdminFixture,
  createLocalUserFixture,
  extractCookieValue,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

describe('Session integration', () => {
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

  it('GET /api/auth/me/sessions retourne 401 sans token', async () => {
    const response = await request(app).get('/api/auth/me/sessions');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/auth/me/sessions retourne les sessions actives sans exposer le token', async () => {
    const payload = buildRegisterPayload('session-me');
    await createLocalUserFixture(payload.email, payload.password);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: payload.password });

    expect(loginResponse.status).toBe(200);

    const cookies = loginResponse.headers['set-cookie'];
    const response = await request(app)
      .get('/api/auth/me/sessions')
      .set('Cookie', cookies);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0]).not.toHaveProperty('session_token');
    expect(response.body.data.some((session) => session.is_current === true)).toBe(true);
  });

  it('DELETE /api/auth/me/sessions ferme les autres sessions', async () => {
    const payload = buildRegisterPayload('session-delete-others');
    const user = await createLocalUserFixture(payload.email, payload.password);

    await prisma.connexion.createMany({
      data: [
        {
          utilisateur_id: user.utilisateur_id,
          session_token: 'old-session-1',
          is_current: true,
          expires_at: new Date(Date.now() + 60_000),
        },
        {
          utilisateur_id: user.utilisateur_id,
          session_token: 'old-session-2',
          is_current: true,
          expires_at: new Date(Date.now() + 60_000),
        },
      ],
    });

    const currentToken = 'current-session-token';

    await prisma.connexion.create({
      data: {
        utilisateur_id: user.utilisateur_id,
        session_token: currentToken,
        is_current: true,
        expires_at: new Date(Date.now() + 60_000),
      },
    });

    const response = await request(app)
      .delete('/api/auth/me/sessions')
      .set('Cookie', [
        `accessToken=${buildAccessToken(user)}`,
        `sessionToken=${currentToken}`,
      ]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const oldActiveCount = await prisma.connexion.count({
      where: {
        utilisateur_id: user.utilisateur_id,
        session_token: { in: ['old-session-1', 'old-session-2'] },
        is_current: true,
      },
    });

    const currentSession = await prisma.connexion.findFirst({
      where: {
        utilisateur_id: user.utilisateur_id,
        session_token: currentToken,
      },
    });

    expect(oldActiveCount).toBe(0);
    expect(currentSession.is_current).toBe(true);
  });

  it('GET /api/auth/admin/sessions retourne 403 pour un etudiant et 200 pour admin', async () => {
    const studentPayload = buildRegisterPayload('session-student');
    const student = await createLocalUserFixture(
      studentPayload.email,
      studentPayload.password
    );

    const forbiddenResponse = await request(app)
      .get('/api/auth/admin/sessions')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`);

    expect(forbiddenResponse.status).toBe(403);
    expect(forbiddenResponse.body.success).toBe(false);

    const admin = await createAdminFixture(
      `session.admin.${Date.now()}@test.integration.local`
    );

    const adminResponse = await request(app)
      .get('/api/auth/admin/sessions?page=1&limit=5')
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.success).toBe(true);
    expect(Array.isArray(adminResponse.body.sessions)).toBe(true);
  });

  it('DELETE /api/auth/me/sessions/:sessionId refuse la session courante', async () => {
    const payload = buildRegisterPayload('session-current');
    await createLocalUserFixture(payload.email, payload.password);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: payload.password });

    const cookies = loginResponse.headers['set-cookie'];
    const sessionToken = extractCookieValue(cookies, 'sessionToken');

    const session = await prisma.connexion.findFirst({
      where: { session_token: sessionToken },
    });

    const response = await request(app)
      .delete(`/api/auth/me/sessions/${session.connexion_id}`)
      .set('Cookie', cookies);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
