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
  createProfessorFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

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
      photo: null,
    },
  });

  await prisma.stage.create({
    data: {
      experience_id: experience.experience_id,
      duree: overrides.duree ?? '7',
      missions_realisees:
        overrides.missions_realisees ?? 'Developpement backend',
      rapport_stage: overrides.rapport_stage ?? null,
      date_fin: overrides.date_fin ?? new Date('2026-06-08'),
    },
  });

  return experience.experience_id;
}

async function seedAcademicValidationStage(studentId, professorId, overrides = {}) {
  const experienceId = await seedStage(studentId, {
    titre: overrides.titre ?? `Stage academique ${Date.now()}`,
    description: overrides.description ?? 'Stage academique seed',
    date_experience: overrides.date_experience ?? new Date('2026-07-01'),
    type_specifique: 'academique',
    duree: overrides.duree ?? '14',
    date_fin: overrides.date_fin ?? new Date('2026-07-15'),
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

function getStageList(body) {
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.stages)) return body.stages;
  if (Array.isArray(body.data?.stages)) return body.data.stages;
  return [];
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

  it('POST /api/stages/add-stage cree un stage simple pour un etudiant', async () => {
    const payload = buildRegisterPayload('stage-create');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const titre = `Stage backend ${Date.now()}`;

    const response = await request(app)
      .post('/api/stages/add-stage')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        titre,
        description: 'API interne',
        missions_realisees: 'Developpement backend',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        technologies: '["Node.js","Express"]',
        domaines: '["Web"]',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const created = await prisma.experience.findFirst({
      where: {
        utilisateur_id: user.utilisateur_id,
        titre,
        type: 'stage',
      },
      include: {
        stage: true,
      },
    });

    expect(created).not.toBeNull();
    expect(created.type_specifique).toBe('personnel');
    expect(created.stage).not.toBeNull();
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

    const stages = getStageList(response.body);

    expect(stages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          experience_id: experienceId,
        }),
      ])
    );
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
        missions_realisees: 'Missions modifiees',
        technologies: '["Node.js","Express"]',
        domaines: '["Backend"]',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const updated = await prisma.experience.findUnique({
      where: {
        experience_id: experienceId,
      },
      select: {
        titre: true,
        description: true,
      },
    });

    expect(updated.titre).toBe('Stage edit modifie');
    expect(updated.description).toBe('Apres modification');
  });

  it('GET /api/professeur/validations/stages/:experienceId refuse sans accessToken', async () => {
    const professor = await createProfessorFixture(
      `stage.prof.get.${Date.now()}@integration.test`
    );

    const student = await createLocalUserFixture(
      `stage.student.get.${Date.now()}@integration.test`,
      'StrongPass123!'
    );

    const experienceId = await seedAcademicValidationStage(
      student.utilisateur_id,
      professor.utilisateur_id
    );

    const response = await request(app).get(
      `/api/professeur/validations/stages/${experienceId}`
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/professeur/validations/stages/:experienceId retourne 400 si un refus ne contient pas de commentaire', async () => {
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
      .patch(`/api/professeur/validations/stages/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({
        statut: 'refuse',
        commentaire: '   ',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/professeur/validations/stages/:experienceId valide le stage pour le professeur concerne', async () => {
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
      .patch(`/api/professeur/validations/stages/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({
        statut: 'valide',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const validation = await prisma.valideStage.findFirst({
      where: {
        experience_id: experienceId,
        utilisateur_id: professor.utilisateur_id,
      },
    });

    expect(validation).not.toBeNull();
    expect(validation.statut).toBe('valide');
  });
});
