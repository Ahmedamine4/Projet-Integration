import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createAdminFixture,
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

async function seedCertification(studentId, overrides = {}) {
  const experience = await prisma.experience.create({
    data: {
      titre: overrides.titre ?? `Certification ${Date.now()}`,
      date_experience: new Date('2026-05-10'),
      visibilite: overrides.visibilite ?? false,
      type: 'certification',
      description: overrides.description ?? 'Certification seed',
      utilisateur_id: studentId,
    },
  });

  await prisma.certification.create({
    data: {
      experience_id: experience.experience_id,
      code: overrides.code ?? 'CERT-001',
      lien_URL: overrides.lien_URL ?? 'https://example.com/cert',
    },
  });

  return experience.experience_id;
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
    const response = await request(app).post('/api/certifications').send({
      titre: 'AWS',
      date: '2026-05-10',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/certifications refuse un role non autorise', async () => {
    const admin = await createAdminFixture(
      `certification.admin.${Date.now()}@integration.test`
    );

    const response = await request(app)
      .post('/api/certifications')
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({
        titre: 'AWS',
        date: '2026-05-10',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/certifications cree une certification avec le payload reel', async () => {
    const payload = buildRegisterPayload('certification-create');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/certifications')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: 'AWS',
        date: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('GET /api/certifications/me retourne les certifications de letudiant connecte', async () => {
    const payload = buildRegisterPayload('certification-list');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const experienceId = await seedCertification(user.utilisateur_id);

    const response = await request(app)
      .get('/api/certifications/me')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(
      response.body.data.some((item) => item.experience_id === experienceId)
    ).toBe(true);
  });

  it('PATCH /api/certifications/:experienceId met a jour une certification existante', async () => {
    const payload = buildRegisterPayload('certification-update');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const experienceId = await seedCertification(user.utilisateur_id, {
      titre: `Certification update ${Date.now()}`,
    });

    const response = await request(app)
      .patch(`/api/certifications/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: 'Certification mise a jour',
        date: '2026-06-01',
        description: 'Description modifiee',
        code: 'CERT-UPDATED',
        credentialUrl: 'https://example.com/cert-updated',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('PATCH /api/certifications/:experienceId/visibilite met a jour la visibilite', async () => {
    const payload = buildRegisterPayload('certification-visible');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const experienceId = await seedCertification(user.utilisateur_id, {
      visibilite: false,
    });

    const response = await request(app)
      .patch(`/api/certifications/${experienceId}/visibilite`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({ visibilite: true });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const updated = await prisma.experience.findUnique({
      where: { experience_id: experienceId },
      select: { visibilite: true },
    });

    expect(updated.visibilite).toBe(true);
  });
});
