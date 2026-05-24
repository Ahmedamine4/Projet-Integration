import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildRegisterPayload,
  cleanupAuthFixtures,
<<<<<<< HEAD
=======
  createAdminFixture,
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
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

describe('Certification integration', () => {
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

  it('POST /api/certifications refuse sans token', async () => {
    const response = await request(app)
      .post('/api/certifications')
      .send({
        title: 'AWS',
        issueDate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
        visibleToEveryone: true,
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

<<<<<<< HEAD
=======
  it('POST /api/certifications refuse un role non autorise', async () => {
    const admin = await createAdminFixture(`certification.admin.${Date.now()}@integration.test`);

    const response = await request(app)
      .post('/api/certifications')
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({
        title: 'AWS',
        issueDate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
        visibleToEveryone: true,
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
  it('POST /api/certifications refuse si issueDate manque', async () => {
    const payload = buildRegisterPayload('certification-missing');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/certifications')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        title: 'AWS',
        issuedate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Champs obligatoires manquants',
    });
  });

  it('POST /api/certifications cree une certification pour un utilisateur connecte', async () => {
    const payload = buildRegisterPayload('certification-create');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/certifications')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        title: 'AWS',
        issueDate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
        visibleToEveryone: true,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience).toMatchObject({
      titre: 'AWS',
      utilisateur_id: user.utilisateur_id,
    });
    expect(response.body.data.certification).toMatchObject({
      code: 'AWS-001',
      lien_URL: 'https://example.com/cert',
    });
  });

  it('GET /api/certifications/me retourne les certifications de l utilisateur connecte', async () => {
    const payload = buildRegisterPayload('certification-list');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const createResponse = await request(app)
      .post('/api/certifications')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        title: 'AWS',
        issueDate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
        visibleToEveryone: false,
      });

    expect(createResponse.status).toBe(201);

    const response = await request(app)
      .get('/api/certifications/me')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(1);
    expect(response.body.data[0].experience).toMatchObject({
      titre: 'AWS',
      utilisateur_id: user.utilisateur_id,
    });
    expect(response.body.data[0]).toMatchObject({
      code: 'AWS-001',
      lien_URL: 'https://example.com/cert',
    });
  });
<<<<<<< HEAD
=======

  it('GET /api/certifications/me refuse un role non autorise', async () => {
    const admin = await createAdminFixture(`certification.list.admin.${Date.now()}@integration.test`);

    const response = await request(app)
      .get('/api/certifications/me')
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
});
