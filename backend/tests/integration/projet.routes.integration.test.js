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

describe('Projet integration', () => {
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

  it('POST /api/add-projet retourne 400 si des champs obligatoires manquent', async () => {
    const payload = buildRegisterPayload('projet-missing');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet seul',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/add-projet retourne 403 pour un role non autorise', async () => {
    const admin = await createAdminFixture(`projet.admin.${Date.now()}@integration.test`);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({
        projectTitle: 'Projet admin',
        projectDate: '2026-05-09',
        description: 'Description',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/add-projet retourne 400 pour un projet academique sans professeur', async () => {
    const payload = buildRegisterPayload('projet-academique');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet academique',
        projectDate: '2026-05-09',
        description: 'Description',
        projetType: 'academique',
      });

    expect(response.status).toBe(400);
  });

  it('POST /api/add-projet cree un projet simple', async () => {
    const payload = buildRegisterPayload('projet-success');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet simple',
        projectDate: '2026-05-09',
        description: 'Description simple',
        technologies: '["Node.js"]',
        domains: '["Web"]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience.visibilite).toBe(false);
    expect(response.body.data.competences).toHaveLength(2);
  });

  it('POST /api/add-projet accepte visibleToEveryone sans changer la visibilite par defaut', async () => {
    const payload = buildRegisterPayload('projet-visible-legacy');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: `Projet legacy ${Date.now()}`,
        projectDate: '2026-05-12',
        description: 'Description',
        visibleToEveryone: 'true',
        technologies: '[]',
        domains: '[]',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.experience.visibilite).toBe(false);
  });

  it('POST /api/add-projet accepte aussi labsence de visibleToEveryone', async () => {
    const payload = buildRegisterPayload('projet-missing-visibility');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: `Projet sans visibilite ${Date.now()}`,
        projectDate: '2026-05-14',
        description: 'Description',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('POST /api/add-projet retourne 404 si le professeur academique est introuvable', async () => {
    const payload = buildRegisterPayload('projet-missing-prof-http');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: 'Projet academique sans vrai prof',
        projectDate: '2026-05-15',
        description: 'Description',
        projetType: 'academique',
        professorEmail: `missing.project.prof.${Date.now()}@integration.test`,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
