import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildAccessToken,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createAdminFixture,
  createLocalUserFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

function getExperienceFromResponse(body) {
  return body.data?.experience ?? body.data;
}


async function findCreatedProjectExperience(userId, titre) {
  return prisma.experience.findFirst({
    where: {
      utilisateur_id: userId,
      titre,
      type: 'projet',
    },
    include: {
      projet: true,
    },
  });
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

  it('POST /api/add-projet retourne 401 sans token', async () => {
    const response = await request(app)
      .post('/api/add-projet')
      .send({
        projectTitle: 'Projet sans token',
        projectDate: '2026-05-09',
        description: 'Description',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
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
    const admin = await createAdminFixture(
      `projet.admin.${Date.now()}@test.integration.local`
    );

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
    expect(response.body.success).toBe(false);
  });

  it('POST /api/add-projet cree un projet simple', async () => {
    const payload = buildRegisterPayload('projet-success');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const titre = `Projet simple ${Date.now()}`;

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: titre,
        projectDate: '2026-05-09',
        description: 'Description simple',
        technologies: '["Node.js"]',
        domains: '["Web"]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const experienceFromResponse = getExperienceFromResponse(response.body);
    expect(experienceFromResponse.visibilite).toBe(false);

    const created = await findCreatedProjectExperience(user.utilisateur_id, titre);

    expect(created).not.toBeNull();
    expect(created.type).toBe('projet');
    expect(created.type_specifique).toBe('personnel');
    expect(created.projet).not.toBeNull();

    const competencesCount = await prisma.competenceDeveloppee.count({
      where: {
        experience_id: created.experience_id,
      },
    });

    expect(competencesCount).toBeGreaterThanOrEqual(2);
  });

  it('POST /api/add-projet prend en compte visibilite=true', async () => {
    const payload = buildRegisterPayload('projet-visible-legacy');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const titre = `Projet legacy ${Date.now()}`;

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: titre,
        projectDate: '2026-05-12',
        description: 'Description',
        visibilite: 'true',
        technologies: '[]',
        domains: '[]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const created = await findCreatedProjectExperience(user.utilisateur_id, titre);

    expect(created).not.toBeNull();
    expect(created.visibilite).toBe(true);
  });

  it('POST /api/add-projet applique visibilite=false par defaut quand elle est absente', async () => {
    const payload = buildRegisterPayload('projet-missing-visibility');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const titre = `Projet sans visibilite ${Date.now()}`;

    const response = await request(app)
      .post('/api/add-projet')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        projectTitle: titre,
        projectDate: '2026-05-14',
        description: 'Description',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const created = await findCreatedProjectExperience(user.utilisateur_id, titre);

    expect(created).not.toBeNull();
    expect(created.visibilite).toBe(false);
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
        professorEmail: `missing.project.prof.${Date.now()}@test.integration.local`,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
