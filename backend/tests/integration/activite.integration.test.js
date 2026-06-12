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

async function seedActivite(studentId, overrides = {}) {
  const experience = await prisma.experience.create({
    data: {
      titre: overrides.titre ?? `Activite ${Date.now()}`,
      date_experience: overrides.date_experience ?? new Date('2026-05-09'),
      visibilite: overrides.visibilite ?? false,
      type: 'activite',
      type_specifique: overrides.type_specifique ?? 'personnel',
      description: overrides.description ?? 'Description activite',
      utilisateur_id: studentId,
    },
  });

  const activite = await prisma.activite.create({
    data: {
      experience_id: experience.experience_id,
      type: overrides.typeActivite ?? 'club',
      lieu: overrides.lieu ?? 'Campus',
    },
  });

  return { experience, activite };
}

describe('Activite integration', () => {
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

  it('POST /api/activites retourne 401 sans token', async () => {
    const response = await request(app)
      .post('/api/activites')
      .send({
        titre: 'Club',
        date_experience: '2026-05-09',
        description: 'Description',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/activites retourne 400 si les champs obligatoires manquent', async () => {
    const payload = buildRegisterPayload('activite-missing');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: 'Club',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Champs obligatoires manquants');
  });

  it('POST /api/activites cree une activite simple pour un etudiant', async () => {
    const payload = buildRegisterPayload('activite-create');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: `Hackathon ${Date.now()}`,
        date_experience: '2026-05-09',
        description: 'Participation',
        typeActivite: 'competition',
        lieu: 'Campus',
        competences: '[{"nom":"Node.js","type":"technologie"}]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience.utilisateur_id).toBe(user.utilisateur_id);
  });

  it('POST /api/activites retourne 403 pour un administrateur', async () => {
    const admin = await createAdminFixture(
      `activite.admin.${Date.now()}@integration.test`
    );

    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({
        titre: 'Conference',
        date_experience: '2026-05-09',
        description: 'Description',
        typeActivite: 'conference',
        lieu: 'Campus',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/activites/me retourne les activites de letudiant connecte', async () => {
    const payload = buildRegisterPayload('activite-list');
    const user = await createLocalUserFixture(payload.email, payload.password);

    await seedActivite(user.utilisateur_id, {
      titre: `Activite liste ${Date.now()}`,
    });

    const response = await request(app)
      .get('/api/activites/me')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].experience.utilisateur_id).toBe(user.utilisateur_id);
  });

  it('PATCH /api/activites/:experienceId/visibilite met a jour la visibilite', async () => {
    const payload = buildRegisterPayload('activite-visible');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const { experience } = await seedActivite(user.utilisateur_id);

    const response = await request(app)
      .patch(`/api/activites/${experience.experience_id}/visibilite`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        visibilite: true,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.visibilite).toBe(true);
  });
});