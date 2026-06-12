import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildAccessToken,
  cleanupAuthFixtures,
  createLocalUserFixture,
  createProfessorFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

async function seedAcademicStage(studentId, professorId, title) {
  const experience = await prisma.experience.create({
    data: {
      titre: title,
      date_experience: new Date('2026-06-01'),
      visibilite: false,
      type: 'stage',
      type_specifique: 'academique',
      description: 'Stage seed',
      utilisateur_id: studentId,
      photo: null,
    },
  });

  await prisma.stage.create({
    data: {
      experience_id: experience.experience_id,
      date_fin: new Date('2026-06-10'),
      duree: '9',
    },
  });

  await prisma.valideStage.create({
    data: {
      utilisateur_id: professorId,
      experience_id: experience.experience_id,
      statut: 'en_attente',
      commentaire: null,
      date_d_action: new Date(),
    },
  });

  return experience.experience_id;
}

async function seedAcademicProjet(studentId, professorId, title) {
  const experience = await prisma.experience.create({
    data: {
      titre: title,
      date_experience: new Date('2026-06-01'),
      visibilite: false,
      type: 'projet',
      type_specifique: 'academique',
      description: 'Projet seed',
      utilisateur_id: studentId,
      photo: null,
    },
  });

  await prisma.projet.create({
    data: {
      experience_id: experience.experience_id,
    },
  });

  await prisma.valideProjet.create({
    data: {
      utilisateur_id: professorId,
      experience_id: experience.experience_id,
      statut: 'en_attente',
      commentaire: null,
      date_d_action: new Date(),
    },
  });

  return experience.experience_id;
}

describe('Professeur integration', () => {
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

  it('GET /api/professeur/validations retourne les demandes du professeur', async () => {
    const professor = await createProfessorFixture(
      `prof.list.${Date.now()}@integration.test`
    );

    const student = await createLocalUserFixture(
      `prof.student.${Date.now()}@integration.test`,
      'StrongPass123!'
    );

    const experienceId = await seedAcademicStage(
      student.utilisateur_id,
      professor.utilisateur_id,
      `Stage ${Date.now()}`
    );

    const response = await request(app)
      .get('/api/professeur/validations')
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const validations = Array.isArray(response.body.data)
      ? response.body.data
      : response.body.data?.validations;

    expect(Array.isArray(validations)).toBe(true);

    expect(validations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'stage',
          experience_id: experienceId,
        }),
      ])
    );
  });

  it('PATCH /api/professeur/validations/stages/:experienceId valide un stage', async () => {
    const professor = await createProfessorFixture(
      `prof.stage.${Date.now()}@integration.test`
    );

    const student = await createLocalUserFixture(
      `prof.stage.student.${Date.now()}@integration.test`,
      'StrongPass123!'
    );

    const experienceId = await seedAcademicStage(
      student.utilisateur_id,
      professor.utilisateur_id,
      `Stage academique ${Date.now()}`
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

  it('PATCH /api/professeur/validations/projets/:experienceId retourne 403 pour un autre professeur', async () => {
    const assignedProfessor = await createProfessorFixture(
      `prof.assigned.${Date.now()}@integration.test`
    );

    const otherProfessor = await createProfessorFixture(
      `prof.other.${Date.now()}@integration.test`
    );

    const student = await createLocalUserFixture(
      `prof.project.student.${Date.now()}@integration.test`,
      'StrongPass123!'
    );

    const experienceId = await seedAcademicProjet(
      student.utilisateur_id,
      assignedProfessor.utilisateur_id,
      `Projet academique ${Date.now()}`
    );

    const response = await request(app)
      .patch(`/api/professeur/validations/projets/${experienceId}`)
      .set('Cookie', `accessToken=${buildAccessToken(otherProfessor)}`)
      .send({
        statut: 'valide',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);

    const validation = await prisma.valideProjet.findFirst({
      where: {
        experience_id: experienceId,
        utilisateur_id: assignedProfessor.utilisateur_id,
      },
    });

    expect(validation).not.toBeNull();
    expect(validation.statut).toBe('en_attente');
  });
});