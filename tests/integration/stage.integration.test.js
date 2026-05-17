import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createProfessorFixture,
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

describe('Stage integration', () => {
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

  it('POST /api/stages/add-stage retourne 401 sans accessToken', async () => {
    const response = await request(app)
      .post('/api/stages/add-stage')
      .send({
        titre: 'Stage backend',
        description: 'API interne',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/stages/add-stage retourne 400 si la date de fin est invalide', async () => {
    const payload = buildRegisterPayload('stage-date');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: 'Stage backend',
        description: 'API interne',
        date_debut: '2026-05-10',
        date_fin: '2026-05-01',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('date');
  });

  it('POST /api/stages/add-stage cree un stage reussi', async () => {
    const payload = buildRegisterPayload('stage-create');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: `Stage backend ${Date.now()}`,
        description: 'API interne',
        missions_realisees: 'Developpement backend',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        technologies: '["Node.js","Express"]',
        domaines: '["Web"]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience).toMatchObject({
      utilisateur_id: user.utilisateur_id,
      type: 'stage',
      visibilite: false,
    });
    expect(response.body.data.stage).toMatchObject({
      missions_realisees: 'Developpement backend',
    });
    expect(response.body.data.competences).toHaveLength(3);
  });

  it('POST /api/stages/add-stage retourne 404 si le professeur est introuvable', async () => {
    const payload = buildRegisterPayload('stage-missing-prof');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: `Stage academique introuvable ${Date.now()}`,
        description: 'Validation professeur manquante',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        is_academique: true,
        email_professeur: `missing.prof.${Date.now()}@integration.test`,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Aucun professeur');
  });

  it('GET /api/stages/stages retourne les stages de letudiant connecte', async () => {
    const payload = buildRegisterPayload('stage-list');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const createResponse = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: `Stage liste ${Date.now()}`,
        description: 'Stage pour la liste',
        date_debut: '2026-06-01',
        date_fin: '2026-06-05',
        technologies: '["Node.js"]',
        domaines: '["Web"]',
      });

    expect(createResponse.status).toBe(201);

    const response = await request(app)
      .get('/api/stages/stages')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data[0]).toMatchObject({
      utilisateur_id: user.utilisateur_id,
      type: 'stage',
    });
  });

  it('PUT /api/stages/stages/:experienceId modifie un stage existant', async () => {
    const payload = buildRegisterPayload('stage-edit');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const createResponse = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: `Stage edit ${Date.now()}`,
        description: 'Avant modification',
        date_debut: '2026-06-01',
        date_fin: '2026-06-08',
        technologies: '["Node.js"]',
        domaines: '["Web"]',
      });

    expect(createResponse.status).toBe(201);

    const experienceId = createResponse.body.data.experience.experience_id;

    const response = await request(app)
      .put(`/api/stages/stages/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre: 'Stage edit modifie',
        description: 'Apres modification',
        date_debut: '2026-06-01',
        date_fin: '2026-06-12',
        technologies: '["Node.js","Express"]',
        domaines: '["Backend"]',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      experience_id: experienceId,
      titre: 'Stage edit modifie',
      description: 'Apres modification',
    });
    expect(response.body.data.stage.duree).toBe('11');
  });

  it('GET /api/stages/validations refuse sans accessToken', async () => {
    const response = await request(app)
      .get('/api/stages/validations');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/stages/validations/:experienceId retourne 400 si le statut est absent', async () => {
    const professor = await createProfessorFixture(
      `stage.prof.${Date.now()}@integration.test`
    );

    const response = await request(app)
      .patch('/api/stages/validations/exp-1')
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Le statut est requis',
    });
  });

  it('PATCH /api/stages/validations/:experienceId retourne 400 si le statut est invalide', async () => {
    const professor = await createProfessorFixture(
      `stage.prof.invalid.${Date.now()}@integration.test`
    );

    const response = await request(app)
      .patch('/api/stages/validations/exp-2')
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'en_attente' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('Statut invalide');
  });

  it('PATCH /api/stages/validations/:experienceId retourne 400 pour un refus sans commentaire', async () => {
    const professor = await createProfessorFixture(
      `stage.prof.refuse.${Date.now()}@integration.test`
    );

    const response = await request(app)
      .patch('/api/stages/validations/exp-3')
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'refuse', commentaire: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Un commentaire est requis pour un refus',
    });
  });

  it('PATCH /api/stages/validations/:experienceId valide un stage academique', async () => {
    const studentPayload = buildRegisterPayload('stage-academic-valid');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);
    const professor = await createProfessorFixture(
      `stage.prof.valid.${Date.now()}@integration.test`
    );

    const createResponse = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        titre: `Stage academique ${Date.now()}`,
        description: 'Validation professeur',
        date_debut: '2026-07-01',
        date_fin: '2026-07-15',
        is_academique: true,
        email_professeur: professor.email,
        technologies: '["NestJS"]',
        domaines: '["Backend"]',
      });

    expect(createResponse.status).toBe(201);

    const experienceId = createResponse.body.data.experience.experience_id;

    const response = await request(app)
      .patch(`/api/stages/validations/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.statut).toBe('valide');

    const experience = await prisma.experience.findUnique({
      where: { experience_id: experienceId },
      select: { visibilite: true },
    });

    expect(experience.visibilite).toBe(true);
  });

  it('PATCH /api/stages/validations/:experienceId refuse un stage avec commentaire', async () => {
    const studentPayload = buildRegisterPayload('stage-academic-refuse');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);
    const professor = await createProfessorFixture(
      `stage.prof.reject.${Date.now()}@integration.test`
    );

    const createResponse = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        titre: `Stage refuse ${Date.now()}`,
        description: 'Validation refusee',
        date_debut: '2026-08-01',
        date_fin: '2026-08-10',
        is_academique: 'true',
        email_professeur: professor.email,
      });

    expect(createResponse.status).toBe(201);

    const experienceId = createResponse.body.data.experience.experience_id;

    const response = await request(app)
      .patch(`/api/stages/validations/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'refuse', commentaire: 'A retravailler' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      statut: 'refuse',
      commentaire: 'A retravailler',
    });

    const experience = await prisma.experience.findUnique({
      where: { experience_id: experienceId },
      select: { visibilite: true },
    });

    expect(experience.visibilite).toBe(false);
  });

  it('PATCH /api/stages/validations/:experienceId retourne 403 si le professeur nest pas concerne', async () => {
    const studentPayload = buildRegisterPayload('stage-wrong-prof');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);
    const assignedProfessor = await createProfessorFixture(
      `stage.prof.assigned.${Date.now()}@integration.test`
    );
    const otherProfessor = await createProfessorFixture(
      `stage.prof.other.${Date.now()}@integration.test`
    );

    const createResponse = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        titre: `Stage non concerne ${Date.now()}`,
        description: 'Validation affectee',
        date_debut: '2026-09-01',
        date_fin: '2026-09-10',
        is_academique: true,
        email_professeur: assignedProfessor.email,
      });

    expect(createResponse.status).toBe(201);

    const experienceId = createResponse.body.data.experience.experience_id;

    const response = await request(app)
      .patch(`/api/stages/validations/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(otherProfessor)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('refus');
  });

  it('PATCH /api/stages/validations/:experienceId retourne 409 si la demande est deja traitee', async () => {
    const studentPayload = buildRegisterPayload('stage-already-treated');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);
    const professor = await createProfessorFixture(
      `stage.prof.treated.${Date.now()}@integration.test`
    );

    const createResponse = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        titre: `Stage deja traite ${Date.now()}`,
        description: 'Validation unique',
        date_debut: '2026-10-01',
        date_fin: '2026-10-12',
        is_academique: true,
        email_professeur: professor.email,
      });

    expect(createResponse.status).toBe(201);

    const experienceId = createResponse.body.data.experience.experience_id;

    const firstResponse = await request(app)
      .patch(`/api/stages/validations/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'valide' });

    expect(firstResponse.status).toBe(200);

    const secondResponse = await request(app)
      .patch(`/api/stages/validations/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'refuse', commentaire: 'Trop tard' });

    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.success).toBe(false);
    expect(secondResponse.body.message).toContain('trait');
  });
});
