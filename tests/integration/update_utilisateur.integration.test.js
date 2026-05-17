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

describe('Update utilisateur integration', () => {
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

  it('PATCH /api/users/update-profile/:userId retourne 401 sans token', async () => {
    const payload = buildRegisterPayload('update-no-token');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .patch(`/api/users/update-profile/${user.utilisateur_id}`)
      .send({ nom: 'Nouveau nom' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/users/update-profile/:userId met a jour le nom avec un utilisateur connecte', async () => {
    const payload = buildRegisterPayload('update-success');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .patch(`/api/users/update-profile/${user.utilisateur_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({ nom: 'Nom mis a jour' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      utilisateur_id: user.utilisateur_id,
      nom: 'Nom mis a jour',
    });
  });
});
