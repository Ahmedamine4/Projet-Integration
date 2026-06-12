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

describe('Photo integration', () => {
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

  it('GET /api/users/:id/photo retourne 404 si utilisateur introuvable', async () => {
    const response = await request(app).get('/api/users/user-inconnu/photo');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/users/:id/photo retourne la photo publique', async () => {
    const payload = buildRegisterPayload('photo-get');
    const user = await createLocalUserFixture(payload.email, payload.password);

    await prisma.utilisateur.update({
      where: { utilisateur_id: user.utilisateur_id },
      data: { photo: 'https://example.com/photo.png' },
    });

    const response = await request(app).get(
      `/api/users/${user.utilisateur_id}/photo`
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      photo: 'https://example.com/photo.png',
    });
  });

  it('POST /api/users/:id/photo retourne 401 sans token', async () => {
    const payload = buildRegisterPayload('photo-no-token');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app).post(
      `/api/users/${user.utilisateur_id}/photo`
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/users/:id/photo retourne 403 pour un autre utilisateur', async () => {
    const ownerPayload = buildRegisterPayload('photo-owner');
    const owner = await createLocalUserFixture(
      ownerPayload.email,
      ownerPayload.password
    );

    const otherPayload = buildRegisterPayload('photo-other');
    const other = await createLocalUserFixture(
      otherPayload.email,
      otherPayload.password
    );

    const response = await request(app)
      .post(`/api/users/${owner.utilisateur_id}/photo`)
      .set('Cookie', `accessToken=${buildAccessToken(other)}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/users/:id/photo retourne 400 si fichier manquant pour le proprietaire', async () => {
    const payload = buildRegisterPayload('photo-missing-file');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post(`/api/users/${user.utilisateur_id}/photo`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
