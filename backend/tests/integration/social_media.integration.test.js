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

describe('Social media integration', () => {
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

  it('GET /api/users/:userId/social retourne 401 sans token', async () => {
    const payload = buildRegisterPayload('social-get-401');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app).get(
      `/api/users/${user.utilisateur_id}/social`
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/users/:userId/social retourne les liens sociaux de l utilisateur', async () => {
    const payload = buildRegisterPayload('social-get');
    const user = await createLocalUserFixture(payload.email, payload.password);

    await prisma.utilisateur.update({
      where: { utilisateur_id: user.utilisateur_id },
      data: {
        github: 'octocat',
        linkedin: 'octocat-linkedin',
      },
    });

    const response = await request(app)
      .get(`/api/users/${user.utilisateur_id}/social`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      github: 'octocat',
      linkedin: 'octocat-linkedin',
    });
  });

  it('PUT /api/users/:userId/social refuse un autre proprietaire puis met a jour les champs nettoyes', async () => {
    const ownerPayload = buildRegisterPayload('social-owner');
    const owner = await createLocalUserFixture(
      ownerPayload.email,
      ownerPayload.password
    );

    const otherPayload = buildRegisterPayload('social-other');
    const otherUser = await createLocalUserFixture(
      otherPayload.email,
      otherPayload.password
    );

    const forbiddenResponse = await request(app)
      .put(`/api/users/${owner.utilisateur_id}/social`)
      .set('Cookie', `accessToken=${buildAccessToken(otherUser)}`)
      .send({
        github: 'hijack',
      });

    expect(forbiddenResponse.status).toBe(403);
    expect(forbiddenResponse.body.success).toBe(false);

    const successResponse = await request(app)
      .put(`/api/users/${owner.utilisateur_id}/social`)
      .set('Cookie', `accessToken=${buildAccessToken(owner)}`)
      .send({
        github: '  octocat  ',
        x: '  test-x  ',
      });

    expect(successResponse.status).toBe(200);
    expect(successResponse.body.success).toBe(true);
    expect(successResponse.body.data).toMatchObject({
      github: 'octocat',
      x: 'test-x',
    });
  });
});
