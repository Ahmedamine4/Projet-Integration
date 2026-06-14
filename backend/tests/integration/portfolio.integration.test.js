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
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

async function seedProject(studentId, { titre, visibilite }) {
  const experience = await prisma.experience.create({
    data: {
      titre,
      date_experience: new Date('2026-05-10'),
      visibilite,
      type: 'projet',
      type_specifique: 'personnel',
      description: `${titre} description`,
      utilisateur_id: studentId,
      photo: null,
    },
  });

  await prisma.projet.create({
    data: {
      experience_id: experience.experience_id,
    },
  });

  return experience;
}

describe('Portfolio integration', () => {
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

  it('GET /api/users/:id/about retourne le about public sans token', async () => {
    const payload = buildRegisterPayload('portfolio-public');
    const user = await createLocalUserFixture(payload.email, payload.password);

    await prisma.utilisateur.update({
      where: {
        utilisateur_id: user.utilisateur_id,
      },
      data: {
        a_propos: 'Bonjour\\nportfolio',
      },
    });

    const response = await request(app).get(
      `/api/users/${user.utilisateur_id}/about`
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.about).toBe('Bonjour\nportfolio');
    expect(response.body.ownerId).toBe(user.utilisateur_id);
    expect(response.body.isOwner).toBe(false);
  });

  it('PUT /api/users/:id/about retourne 401 sans accessToken', async () => {
    const payload = buildRegisterPayload('portfolio-401');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .put(`/api/users/${user.utilisateur_id}/about`)
      .send({
        a_propos: 'Nouveau texte',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PUT /api/users/:id/about retourne 403 si le token appartient a un autre utilisateur', async () => {
    const ownerPayload = buildRegisterPayload('portfolio-owner');
    const owner = await createLocalUserFixture(
      ownerPayload.email,
      ownerPayload.password
    );

    const otherPayload = buildRegisterPayload('portfolio-other');
    const otherUser = await createLocalUserFixture(
      otherPayload.email,
      otherPayload.password
    );

    const response = await request(app)
      .put(`/api/users/${owner.utilisateur_id}/about`)
      .set('Cookie', `accessToken=${buildAccessToken(otherUser)}`)
      .send({
        a_propos: 'Texte pirate',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('propri');
  });

  it('PUT /api/users/:id/about met a jour le texte nettoye', async () => {
    const payload = buildRegisterPayload('portfolio-update');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .put(`/api/users/${user.utilisateur_id}/about`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        a_propos: '  <p>Bonjour</p>\\n\\n\\n portfolio  ',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.updated).toEqual({
      utilisateur_id: user.utilisateur_id,
      a_propos: 'Bonjour\n\nportfolio',
    });

    const updatedUser = await prisma.utilisateur.findUnique({
      where: {
        utilisateur_id: user.utilisateur_id,
      },
      select: {
        a_propos: true,
      },
    });

    expect(updatedUser.a_propos).toBe('Bonjour\n\nportfolio');
  });

  it('GET /api/users/portfolio/:etudiantId retourne 401 sans token', async () => {
    const payload = buildRegisterPayload('portfolio-public-data');
    const user = await createLocalUserFixture(payload.email, payload.password);

    await seedProject(user.utilisateur_id, {
      titre: `Projet visible ${Date.now()}`,
      visibilite: true,
    });

    await seedProject(user.utilisateur_id, {
      titre: `Projet prive ${Date.now()}`,
      visibilite: false,
    });

    const response = await request(app).get(
      `/api/users/portfolio/${user.utilisateur_id}`
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/users/portfolio/:etudiantId expose les donnees privees au proprietaire authentifie', async () => {
    const payload = buildRegisterPayload('portfolio-owner-data');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const visibleProject = await seedProject(user.utilisateur_id, {
      titre: `Projet visible owner ${Date.now()}`,
      visibilite: true,
    });

    const privateProject = await seedProject(user.utilisateur_id, {
      titre: `Projet prive owner ${Date.now()}`,
      visibilite: false,
    });

    const response = await request(app)
      .get(`/api/users/portfolio/${user.utilisateur_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.isOwner).toBe(true);
    expect(Array.isArray(response.body.data.projets)).toBe(true);

    const projectIds = response.body.data.projets.map((item) => item.experience_id);

    expect(projectIds).toEqual(
      expect.arrayContaining([
        visibleProject.experience_id,
        privateProject.experience_id,
      ])
    );
  });
});
