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

describe('Notification integration', () => {
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

  it('GET /api/notifications retourne 401 sans token', async () => {
    const response = await request(app).get('/api/notifications');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

<<<<<<< HEAD
=======
  it('PATCH /api/notifications/:notificationId/lire retourne 401 sans token', async () => {
    const response = await request(app)
      .patch('/api/notifications/n1/lire');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
  it('GET /api/notifications retourne les notifications de l utilisateur connecte', async () => {
    const payload = buildRegisterPayload('notif-list');
    const user = await createLocalUserFixture(payload.email, payload.password);

    await prisma.notification.create({
      data: {
        utilisateur_id: user.utilisateur_id,
        message: 'Notification de test',
        type: 'validation_stage',
        lu: false,
        date_notification: new Date(),
      },
    });

    const response = await request(app)
      .get('/api/notifications')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0]).toMatchObject({
      utilisateur_id: user.utilisateur_id,
      message: 'Notification de test',
      lu: false,
    });
  });

  it('PATCH /api/notifications/:notificationId/lire marque une notification comme lue', async () => {
    const payload = buildRegisterPayload('notif-read');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const notification = await prisma.notification.create({
      data: {
        utilisateur_id: user.utilisateur_id,
        message: 'Notification a lire',
        type: 'validation_stage',
        lu: false,
        date_notification: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/notifications/${notification.notification_id}/lire`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      notification_id: notification.notification_id,
      lu: true,
    });
  });

  it('PATCH /api/notifications/:notificationId/lire refuse l acces a une notification dun autre utilisateur', async () => {
    const ownerPayload = buildRegisterPayload('notif-owner');
    const owner = await createLocalUserFixture(ownerPayload.email, ownerPayload.password);
    const otherPayload = buildRegisterPayload('notif-other');
    const otherUser = await createLocalUserFixture(otherPayload.email, otherPayload.password);

    const notification = await prisma.notification.create({
      data: {
        utilisateur_id: owner.utilisateur_id,
        message: 'Notification privee',
        type: 'validation_stage',
        lu: false,
        date_notification: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/notifications/${notification.notification_id}/lire`)
      .set('Cookie', `accessToken=${buildAccessToken(otherUser)}`);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'Erreur serveur',
    });

    const persisted = await prisma.notification.findUnique({
      where: { notification_id: notification.notification_id },
      select: { lu: true },
    });

    expect(persisted.lu).toBe(false);
  });
});
