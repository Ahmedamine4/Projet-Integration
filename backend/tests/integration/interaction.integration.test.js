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
  createProfessionalFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

async function seedPortfolio(studentId) {
  return prisma.portfolio.create({
    data: {
      utilisateur_id: studentId,
      titre: `Portfolio ${Date.now()}`,
      visibilite: true,
      date_generation: new Date(),
    },
  });
}

describe('Interaction integration', () => {
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

  it('POST /api/interactions/recommandations/:portfolioId retourne 401 sans token', async () => {
    const response = await request(app)
      .post('/api/interactions/recommandations/portfolio-inconnu')
      .send({ texte: 'Super profil' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/interactions/recommandations/:portfolioId cree une recommandation pour un professionnel', async () => {
    const studentPayload = buildRegisterPayload('interaction-student');
    const student = await createLocalUserFixture(
      studentPayload.email,
      studentPayload.password
    );

    const portfolio = await seedPortfolio(student.utilisateur_id);
    const professional = await createProfessionalFixture(
      `interaction.pro.${Date.now()}@integration.test`
    );

    const response = await request(app)
      .post(`/api/interactions/recommandations/${portfolio.portfolio_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(professional)}`)
      .send({
        texte: 'Profil prometteur',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      portfolio_id: portfolio.portfolio_id,
      utilisateur_id: professional.utilisateur_id,
      type: 'recommandation',
      visibilite: false,
    });
  });

  it('GET /api/interactions/recommandations/me et PATCH visibilite fonctionnent pour letudiant proprietaire', async () => {
    const studentPayload = buildRegisterPayload('interaction-owner');
    const student = await createLocalUserFixture(
      studentPayload.email,
      studentPayload.password
    );

    const portfolio = await seedPortfolio(student.utilisateur_id);
    const professional = await createProfessionalFixture(
      `interaction.owner.pro.${Date.now()}@integration.test`
    );

    const recommendation = await prisma.interaction.create({
      data: {
        utilisateur_id: professional.utilisateur_id,
        portfolio_id: portfolio.portfolio_id,
        type: 'recommandation',
        texte: 'Recommandation initiale',
        visibilite: false,
        date_interaction: new Date(),
      },
    });

    const myRecommendationsResponse = await request(app)
      .get('/api/interactions/recommandations/me')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`);

    expect(myRecommendationsResponse.status).toBe(200);
    expect(myRecommendationsResponse.body.success).toBe(true);
    expect(myRecommendationsResponse.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          interaction_id: recommendation.interaction_id,
          texte: 'Recommandation initiale',
        }),
      ])
    );

    const toggleResponse = await request(app)
      .patch(`/api/interactions/recommandations/${recommendation.interaction_id}/visibilite`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        visibilite: true,
      });

    expect(toggleResponse.status).toBe(200);
    expect(toggleResponse.body.success).toBe(true);
    expect(toggleResponse.body.data).toMatchObject({
      interaction_id: recommendation.interaction_id,
      visibilite: true,
    });
  });

  it('GET /api/interactions/recommandations/portfolio/:etudiantId retourne seulement les recommandations visibles', async () => {
    const studentPayload = buildRegisterPayload('interaction-visible');
    const student = await createLocalUserFixture(
      studentPayload.email,
      studentPayload.password
    );

    const viewerPayload = buildRegisterPayload('interaction-viewer');
    const viewer = await createLocalUserFixture(
      viewerPayload.email,
      viewerPayload.password
    );

    const portfolio = await seedPortfolio(student.utilisateur_id);
    const professional = await createProfessionalFixture(
      `interaction.visible.pro.${Date.now()}@integration.test`
    );

    const visibleRecommendation = await prisma.interaction.create({
      data: {
        utilisateur_id: professional.utilisateur_id,
        portfolio_id: portfolio.portfolio_id,
        type: 'recommandation',
        texte: 'Visible',
        visibilite: true,
        date_interaction: new Date(),
      },
    });

    await prisma.interaction.create({
      data: {
        utilisateur_id: professional.utilisateur_id,
        portfolio_id: portfolio.portfolio_id,
        type: 'recommandation',
        texte: 'Cachee',
        visibilite: false,
        date_interaction: new Date(),
      },
    });

    const response = await request(app)
      .get(`/api/interactions/recommandations/portfolio/${student.utilisateur_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(viewer)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual([
      expect.objectContaining({
        interaction_id: visibleRecommendation.interaction_id,
        texte: 'Visible',
        visibilite: true,
      }),
    ]);
  });
});
