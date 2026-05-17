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

describe('Portfolio integration', () => {
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

  it('GET /api/users/:id/about retourne le about public sans token', async () => {
    const payload = buildRegisterPayload('portfolio-public');
    const user = await createLocalUserFixture(payload.email, payload.password);

    await prisma.utilisateur.update({
      where: { utilisateur_id: user.utilisateur_id },
      data: { a_propos: 'Bonjour\\nportfolio' },
    });

    const response = await request(app)
      .get(`/api/users/${user.utilisateur_id}/about`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      about: 'Bonjour\nportfolio',
      ownerId: user.utilisateur_id,
      isOwner: false,
    });
  });

  it('PUT /api/users/:id/about retourne 401 sans accessToken', async () => {
    const payload = buildRegisterPayload('portfolio-401');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .put(`/api/users/${user.utilisateur_id}/about`)
      .send({ a_propos: 'Nouveau texte' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PUT /api/users/:id/about retourne 403 si le token appartient a un autre utilisateur', async () => {
    const ownerPayload = buildRegisterPayload('portfolio-owner');
    const owner = await createLocalUserFixture(ownerPayload.email, ownerPayload.password);

    const otherPayload = buildRegisterPayload('portfolio-other');
    const otherUser = await createLocalUserFixture(otherPayload.email, otherPayload.password);

    const response = await request(app)
      .put(`/api/users/${owner.utilisateur_id}/about`)
      .set('Cookie', `accessToken=${buildAccessToken(otherUser)}`)
      .send({ a_propos: 'Texte pirate' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('propri');
  });

  it('PUT /api/users/:id/about met a jour le texte nettoye', async () => {
    const payload = buildRegisterPayload('portfolio-update');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .put(`/api/users/${user.utilisateur_id}/about`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({ a_propos: '  <p>Bonjour</p>\\n\\n\\n portfolio  ' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      updated: {
        utilisateur_id: user.utilisateur_id,
        a_propos: 'Bonjour\n\nportfolio',
      },
    });
  });
});
