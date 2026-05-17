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
  createProfessorFixture,
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

describe('Validation projet integration', () => {
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

  it('PUT /api/validprojets/:id retourne 401 sans token', async () => {
    const response = await request(app)
      .put('/api/validprojets/exp-1')
      .send({ statut: 'valide' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PUT /api/validprojets/:id retourne 403 avec un etudiant', async () => {
    const payload = buildRegisterPayload('valid-projet-student');
    const student = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .put('/api/validprojets/exp-1')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('PUT /api/validprojets/:id valide un projet avec un professeur et un id string', async () => {
    const studentPayload = buildRegisterPayload('valid-projet-owner');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);
    const professor = await createProfessorFixture(
      `valid.projet.prof.${Date.now()}@integration.test`
    );

    await prisma.experience.create({
      data: {
        experience_id: 'exp-validation-projet',
        titre: 'Projet a valider',
        date_experience: new Date('2026-05-10'),
        description: 'Projet integration',
        visibilite: false,
        type: 'projet',
        utilisateur_id: student.utilisateur_id,
      },
    });

    await prisma.projet.create({
      data: {
        experience_id: 'exp-validation-projet',
        technologies: ['Node.js'],
        domains: ['Web'],
      },
    });

    await prisma.valideProjet.create({
      data: {
        experience_id: 'exp-validation-projet',
        utilisateur_id: professor.utilisateur_id,
        statut: 'en_attente',
        date_d_action: new Date(),
      },
    });

    const response = await request(app)
      .put('/api/validprojets/exp-validation-projet')
      .set('Cookie', `accessToken=${buildAccessToken(professor)}`)
      .send({ statut: 'valide', commentaireProf: 'OK' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      experience_id: 'exp-validation-projet',
      utilisateur_id: professor.utilisateur_id,
      statut: 'valide',
    });
  });
});
