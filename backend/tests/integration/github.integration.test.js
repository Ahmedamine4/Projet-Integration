import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildAccessToken,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createLocalUserFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

describe('GitHub integration', () => {
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

  it('GET /api/github/login retourne 401 sans token', async () => {
    const response = await request(app).get('/api/github/login');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/github/login retourne une URL OAuth pour un etudiant', async () => {
    const payload = buildRegisterPayload('github-login');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .get('/api/github/login')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.url).toContain('github.com/login/oauth/authorize');
    expect(response.body.url).toContain(user.utilisateur_id);
  });

  it('GET /api/github/callback retourne 401 si code manquant', async () => {
    const response = await request(app).get('/api/github/callback');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/github/repositories retourne une liste vide si aucun repo importe', async () => {
    const payload = buildRegisterPayload('github-repos');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .get('/api/github/repositories')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(0);
    expect(response.body.data).toEqual([]);
  });

  it('GET /api/github/contributions retourne 400 sans token GitHub synchronise', async () => {
    const payload = buildRegisterPayload('github-contrib');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .get('/api/github/contributions')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/github/sync retourne 400 sans token GitHub synchronise', async () => {
    const payload = buildRegisterPayload('github-sync');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/github/sync')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
