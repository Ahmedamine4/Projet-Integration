import '../setup/test-env.setup.js';

import { TypeOffre } from '@prisma/client';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildAccessToken,
  cleanupAuthFixtures,
  createProfessionalFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

const TEST_RECRUTEUR_PREFIX = 'recruteur.';

async function cleanupRecruteurFixtures() {
  const users = await prisma.utilisateur.findMany({
    where: {
      email: {
        startsWith: TEST_RECRUTEUR_PREFIX,
      },
    },
    select: {
      utilisateur_id: true,
    },
  });

  const userIds = users.map((user) => user.utilisateur_id);
  if (userIds.length === 0) return;

  const offres = await prisma.offre.findMany({
    where: {
      utilisateur_id: {
        in: userIds,
      },
    },
    select: {
      offre_id: true,
    },
  });

  const offreIds = offres.map((offre) => offre.offre_id);

  if (offreIds.length > 0) {
    await prisma.demande.deleteMany({
      where: {
        offre_id: {
          in: offreIds,
        },
      },
    });

    await prisma.offre.deleteMany({
      where: {
        offre_id: {
          in: offreIds,
        },
      },
    });
  }
}

function buildOffrePayload(overrides = {}) {
  return {
    entreprise: overrides.entreprise ?? `Entreprise ${Date.now()}`,
    localisation: overrides.localisation ?? 'Tanger',
    technologies: overrides.technologies ?? ['Node.js', 'PostgreSQL'],
    description: overrides.description ?? 'Offre integration test',
    type: overrides.type ?? Object.values(TypeOffre)[0],
  };
}

describe('Recruteur integration', () => {
  beforeAll(async () => {
    assertAuthTestEnvironment();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanupRecruteurFixtures();
    await cleanupAuthFixtures();
  });

  afterAll(async () => {
    await cleanupRecruteurFixtures();
    await cleanupAuthFixtures();
    await prisma.$disconnect();
  });

  it('GET /api/recruteur/types-offres retourne 401 sans token', async () => {
    const response = await request(app).get('/api/recruteur/types-offres');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/recruteur/types-offres retourne les types Prisma', async () => {
    const recruiter = await createProfessionalFixture(
      `${TEST_RECRUTEUR_PREFIX}types.${Date.now()}@test.integration.local`
    );

    const response = await request(app)
      .get('/api/recruteur/types-offres')
      .set('Cookie', `accessToken=${buildAccessToken(recruiter)}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(Object.values(TypeOffre));
  });

  it('POST /api/recruteur/offres cree une offre et une notification', async () => {
    const recruiter = await createProfessionalFixture(
      `${TEST_RECRUTEUR_PREFIX}create.${Date.now()}@test.integration.local`
    );

    const payload = buildOffrePayload({
      entreprise: `Entreprise create ${Date.now()}`,
    });

    const response = await request(app)
      .post('/api/recruteur/offres')
      .set('Cookie', `accessToken=${buildAccessToken(recruiter)}`)
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      entreprise: payload.entreprise,
      localisation: payload.localisation,
      utilisateur_id: recruiter.utilisateur_id,
    });

    const notification = await prisma.notification.findFirst({
      where: {
        utilisateur_cible_id: recruiter.utilisateur_id,
      },
    });

    expect(notification).not.toBeNull();
  });

  it('GET /api/recruteur/offres liste les offres du recruteur', async () => {
    const recruiter = await createProfessionalFixture(
      `${TEST_RECRUTEUR_PREFIX}list.${Date.now()}@test.integration.local`
    );

    const offre = await prisma.offre.create({
      data: {
        ...buildOffrePayload({ entreprise: 'Entreprise liste' }),
        utilisateur_id: recruiter.utilisateur_id,
      },
    });

    const response = await request(app)
      .get('/api/recruteur/offres')
      .set('Cookie', `accessToken=${buildAccessToken(recruiter)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);

    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          offre_id: offre.offre_id,
          entreprise: 'Entreprise liste',
        }),
      ])
    );
  });

  it('PATCH /api/recruteur/offres/:offreId/terminer termine seulement une offre du recruteur', async () => {
    const recruiter = await createProfessionalFixture(
      `${TEST_RECRUTEUR_PREFIX}term.${Date.now()}@test.integration.local`
    );

    const offre = await prisma.offre.create({
      data: {
        ...buildOffrePayload({ entreprise: 'Entreprise terminer' }),
        utilisateur_id: recruiter.utilisateur_id,
      },
    });

    const response = await request(app)
      .patch(`/api/recruteur/offres/${offre.offre_id}/terminer`)
      .set('Cookie', `accessToken=${buildAccessToken(recruiter)}`);

    expect(response.status).toBe(200);
    expect(response.body.statut).toBe('TERMINEE');

    const persisted = await prisma.offre.findUnique({
      where: {
        offre_id: offre.offre_id,
      },
    });

    expect(persisted.statut).toBe('TERMINEE');
  });

  it('GET /api/recruteur/offres/:offreId/demandes retourne la pagination', async () => {
    const recruiter = await createProfessionalFixture(
      `${TEST_RECRUTEUR_PREFIX}demandes.${Date.now()}@test.integration.local`
    );

    const offre = await prisma.offre.create({
      data: {
        ...buildOffrePayload({ entreprise: 'Entreprise demandes' }),
        utilisateur_id: recruiter.utilisateur_id,
      },
    });

    const response = await request(app)
      .get(`/api/recruteur/offres/${offre.offre_id}/demandes?page=1&limit=5`)
      .set('Cookie', `accessToken=${buildAccessToken(recruiter)}`);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      page: 1,
      totalPages: 0,
      total: 0,
    });
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
