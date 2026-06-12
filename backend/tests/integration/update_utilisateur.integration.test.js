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

  it('PATCH /api/users/update-profile/:userId reste accessible sans token', async () => {
    const payload = buildRegisterPayload('update-no-token');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .patch(`/api/users/update-profile/${user.utilisateur_id}`)
      .send({
        nom: 'Nouveau nom',
      });

    expect(response.status).toBe(200);

    const updatedUser =
      response.body.data ??
      response.body.updated ??
      response.body.user ??
      response.body;

    expect(updatedUser).toMatchObject({
      utilisateur_id: user.utilisateur_id,
      nom: 'Nouveau nom',
    });

    const persisted = await prisma.utilisateur.findUnique({
      where: {
        utilisateur_id: user.utilisateur_id,
      },
      select: {
        nom: true,
      },
    });

    expect(persisted.nom).toBe('Nouveau nom');
  });

  it('PATCH /api/users/update-profile/:userId met a jour le nom avec un utilisateur connecte', async () => {
    const payload = buildRegisterPayload('update-success');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .patch(`/api/users/update-profile/${user.utilisateur_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        nom: 'Nom mis a jour',
      });

    expect(response.status).toBe(200);

    const updatedUser =
      response.body.data ??
      response.body.updated ??
      response.body.user ??
      response.body;

    expect(updatedUser).toMatchObject({
      utilisateur_id: user.utilisateur_id,
      nom: 'Nom mis a jour',
    });

    const persisted = await prisma.utilisateur.findUnique({
      where: {
        utilisateur_id: user.utilisateur_id,
      },
      select: {
        nom: true,
      },
    });

    expect(persisted.nom).toBe('Nom mis a jour');
  });

  it('PATCH /api/users/update-profile/:userId refuse un email deja utilise', async () => {
    const ownerPayload = buildRegisterPayload('update-owner');
    const owner = await createLocalUserFixture(
      ownerPayload.email,
      ownerPayload.password
    );

    const otherPayload = buildRegisterPayload('update-other');
    const otherUser = await createLocalUserFixture(
      otherPayload.email,
      otherPayload.password
    );

    const response = await request(app)
      .patch(`/api/users/update-profile/${owner.utilisateur_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(owner)}`)
      .send({
        email: otherUser.email,
      });

    expect([400, 409, 500]).toContain(response.status);

    const bodyText = JSON.stringify(response.body).toLowerCase();
    expect(bodyText).toContain('email');

    const persisted = await prisma.utilisateur.findUnique({
      where: {
        utilisateur_id: owner.utilisateur_id,
      },
      select: {
        email: true,
      },
    });

    expect(persisted.email).toBe(owner.email);
  });
});
