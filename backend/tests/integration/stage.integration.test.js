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

async function seedStage(studentId, overrides = {}) {
  const experience = await prisma.experience.create({
    data: {
      titre: overrides.titre ?? `Stage ${Date.now()}`,
      date_experience: overrides.date_experience ?? new Date('2026-06-01'),
      visibilite: overrides.visibilite ?? false,
      type: 'stage',
      type_specifique: overrides.type_specifique ?? 'personnel',
      description: overrides.description ?? 'Stage seed',
      utilisateur_id: studentId,
    },
  });

  await prisma.stage.create({
    data: {
      experience_id: experience.experience_id,
      duree: overrides.duree ?? '7',
      missions_realisees:
        overrides.missions_realisees ?? 'Developpement backend',
      rapport_stage: overrides.rapport_stage ?? null,
    },
  });

  return experience.experience_id;
}

async function seedAcademicValidationStage(studentId, professorId, overrides = {}) {
  const experienceId = await seedStage(studentId, {
    titre: overrides.titre,
    description: overrides.description,
    date_experience: overrides.date_experience ?? new Date('2026-07-01'),
    type_specifique: 'academique',
    duree: overrides.duree ?? '14',
  });

  await prisma.valideStage.create({
    data: {
      utilisateur_id: professorId,
      experience_id: experienceId,
      statut: overrides.statut ?? 'en_attente',
      date_d_action: new Date(),
      commentaire: overrides.commentaire ?? null,
    },
  });

  return experienceId;
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
    const response = await request(app).post('/api/stages/add-stage').send({
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
  });

  it('POST /api/stages/add-stage cree un stage simple pour un etudiant', async () => {
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
        technologies: '[]',
        domaines: '[]',
        is_academique: 'true',
        email_professeur: `missing.prof.${Date.now()}@integration.test`,
      });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/stages/stages retourne les stages de letudiant connecte', async () => {
    const payload = buildRegisterPayload('stage-list');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const experienceId = await seedStage(user.utilisateur_id, {
      titre: `Stage liste ${Date.now()}`,
    });

    const response = await request(app)
      .get('/api/stages/stages')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(
      response.body.data.some((item) => item.experience_id === experienceId)
    ).toBe(true);
  });

  it('GET /api/stages/stages retourne 403 pour un professeur', async () => {
    const professor = await createProfessorFixture(
      `stage.prof.list.${Date.now()}@integration.test`
    );

    const response = await request(app)
      .get('/api/stages/stages')
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/stages/stages/:experienceId modifie un stage existant', async () => {
    const payload = buildRegisterPayload('stage-edit');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const experienceId = await seedStage(user.utilisateur_id, {
      titre: `Stage edit ${Date.now()}`,
      description: 'Avant modification',
      date_experience: new Date('2026-06-01'),
      duree: '7',
    });

    const response = await request(app)
      .patch(`/api/stages/stages/${experienceId}`)
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
  });

  it('GET /api/validations/stages refuse sans accessToken', async () => {
    const response = await request(app).get('/api/validations/stages');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/validations/stages retourne 403 pour un etudiant', async () => {
    const payload = buildRegisterPayload('stage-validation-student');
    const student = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .get('/api/validations/stages')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/validations/stages/:experienceId retourne 400 si un refus ne contient pas de commentaire', async () => {
    const professor = await createProfessorFixture(
      `stage.prof.refuse.${Date.now()}@integration.test`
    );
    const student = await createLocalUserFixture(
      `stage.student.refuse.${Date.now()}@integration.test`,
      'StrongPass123!'
    );
    const experienceId = await seedAcademicValidationStage(
      student.utilisateur_id,
      professor.utilisateur_id
    );

    const response = await request(app)
      .patch(`/api/validations/stages/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'refuse', commentaire: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/validations/stages/:experienceId valide le stage pour le professeur concerne', async () => {
    const studentPayload = buildRegisterPayload('stage-academic-valid');
    const student = await createLocalUserFixture(
      studentPayload.email,
      studentPayload.password
    );
    const professor = await createProfessorFixture(
      `stage.prof.valid.${Date.now()}@integration.test`
    );
    const experienceId = await seedAcademicValidationStage(
      student.utilisateur_id,
      professor.utilisateur_id,
      {
        titre: `Stage academique ${Date.now()}`,
      }
    );

    const response = await request(app)
      .patch(`/api/validations/stages/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const validation = await prisma.valideStage.findUnique({
      where: { experience_id: experienceId },
    });

    expect(validation.statut).toBe('valide');
  });

  it('PATCH /api/validations/stages/:experienceId retourne 403 si le professeur nest pas concerne', async () => {
    const studentPayload = buildRegisterPayload('stage-wrong-prof');
    const student = await createLocalUserFixture(
      studentPayload.email,
      studentPayload.password
    );
    const assignedProfessor = await createProfessorFixture(
      `stage.prof.assigned.${Date.now()}@integration.test`
    );
    const otherProfessor = await createProfessorFixture(
      `stage.prof.other.${Date.now()}@integration.test`
    );
    const experienceId = await seedAcademicValidationStage(
      student.utilisateur_id,
      assignedProfessor.utilisateur_id
    );

    const response = await request(app)
      .patch(`/api/validations/stages/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(otherProfessor)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });
});
