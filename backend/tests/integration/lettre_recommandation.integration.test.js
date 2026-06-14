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

describe('Lettre recommandation integration', () => {
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

  it('POST /api/lettre-recommandation cree une demande et la relation Prisma', async () => {
    const student = await createLocalUserFixture(
      `lettre.student.${Date.now()}@test.integration.local`,
      'StrongPass123!'
    );

    const professor = await createProfessorFixture(
      `lettre.prof.${Date.now()}@test.integration.local`
    );

    const response = await request(app)
      .post('/api/lettre-recommandation')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        objet: 'Demande Master',
        description: 'Besoin pour dossier',
        email_professeur: professor.email,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    const persisted = await prisma.lettresDeRecommendations.findFirst({
      where: {
        utilisateur_id: student.utilisateur_id,
        prof_utilisateur_id: professor.utilisateur_id,
      },
    });

    expect(persisted).not.toBeNull();
    expect(persisted.objet).toBe('Demande Master');
    expect(persisted.description).toBe('Besoin pour dossier');
    expect(persisted.statut).toBe('en_attente');
  });

  it('GET /api/lettre-recommandation/me retourne les demandes de letudiant connecte', async () => {
    const student = await createLocalUserFixture(
      `lettre.student.list.${Date.now()}@test.integration.local`,
      'StrongPass123!'
    );

    const professor = await createProfessorFixture(
      `lettre.prof.list.${Date.now()}@test.integration.local`
    );

    await prisma.lettresDeRecommendations.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        prof_utilisateur_id: professor.utilisateur_id,
        objet: 'Demande list',
        description: 'Description',
        statut: 'en_attente',
        date_lettre: new Date(),
      },
    });

    const response = await request(app)
      .get('/api/lettre-recommandation/me')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          objet: 'Demande list',
          description: 'Description',
          statut: 'en_attente',
        }),
      ])
    );
  });
});