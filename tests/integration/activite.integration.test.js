import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createAdminFixture,
  createLocalUserFixture,
} from '../helpers/auth.helpers.js';
import {
  assertInstitutionTestEnvironment,
  cleanupInstitutionFixtures,
  createInstitutionFixture,
} from '../helpers/institution.helpers.js';

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

describe('Activite integration', () => {
  beforeAll(async () => {
    assertAuthTestEnvironment();
    assertInstitutionTestEnvironment();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanupAuthFixtures();
    await cleanupInstitutionFixtures();
  });

  afterAll(async () => {
    await cleanupAuthFixtures();
    await cleanupInstitutionFixtures();
    await prisma.$disconnect();
  });

  it('POST /api/activites retourne 401 sans token', async () => {
    const response = await request(app)
      .post('/api/activites')
      .send({
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/activites cree une activite personnelle reussie', async () => {
    const payload = buildRegisterPayload('activite-personnelle');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        typeActivite: 'personnelle',
        titre: 'Hackathon',
        type: 'competition',
        lieu: 'Campus',
        description: 'Participation au hackathon',
        visibleToEveryone: true,
        competences: JSON.stringify(['Node.js']),
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience).toMatchObject({
      titre: 'Hackathon',
      utilisateur_id: user.utilisateur_id,
      visibilite: true,
      type: 'activite',
    });
    expect(response.body.data).toMatchObject({
      type: 'competition',
      lieu: 'Campus',
    });
  });

  it('POST /api/activites cree une activite personnelle pour un professionnel ancien etudiant', async () => {
    const user = await prisma.utilisateur.create({
      data: {
        nom: 'Pro',
        prenom: 'Test',
        email: `activite.pro.${Date.now()}@integration.test`,
        mot_de_passe: 'hashed-password',
        role: 'professionnel',
        etudiant: {
          create: {
            promotion: 'Ancien etudiant',
            niveau: 'Diplome',
          },
        },
      },
    });
    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        typeActivite: 'personnelle',
        titre: 'Conference pro',
        type: 'conference',
        lieu: 'Entreprise',
        visibleToEveryone: false,
      }); console.log(response.status, response.body); // ici pour voir où ça échoue exactement ansuppmha  apres 

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience).toMatchObject({
      utilisateur_id: user.utilisateur_id,
      visibilite: false,
    });
  });

  it('POST /api/activites refuse un role non autorise pour une activite personnelle', async () => {
    const admin = await createAdminFixture(`activite.forbidden.${Date.now()}@integration.test`);

    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({
        typeActivite: 'personnelle',
        titre: 'Conference admin',
        type: 'conference',
        lieu: 'Siege',
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      message: 'Acces reserve aux etudiants et professionnels pour une activite personnelle',
    });
  });

  it('POST /api/activites cree une activite academique avec validation en_attente', async () => {
    const payload = buildRegisterPayload('activite-academique');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('activite');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: user.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'en_attente',
        date_d_action: new Date(),
      },
    });

    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        typeActivite: 'academique',
        titre: 'Projet tutoré',
        type: 'atelier',
        lieu: 'Salle 101',
        description: 'Travail avec institution',
        institutionId: institution.institution_id,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.experience.visibilite).toBe(false);
    expect(response.body.data.validation).toMatchObject({
      institution_id: institution.institution_id,
      statut: 'en_attente',
    });
  });

  it('POST /api/activites retourne 404 si linstitution est introuvable', async () => {
    const payload = buildRegisterPayload('activite-missing-inst');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        typeActivite: 'academique',
        titre: 'Projet absent',
        type: 'atelier',
        lieu: 'Salle',
        institutionId: 'institution-introuvable',
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Institution introuvable',
    });
  });

  it('POST /api/activites retourne 403 si letudiant nest pas lie a linstitution', async () => {
    const payload = buildRegisterPayload('activite-unlinked');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('unlinked');

    const response = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        typeActivite: 'academique',
        titre: 'Projet non lie',
        type: 'atelier',
        lieu: 'Salle 202',
        institutionId: institution.institution_id,
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      message: "Cette institution n'est pas liee a l'etudiant",
    });
  });

  it('GET /api/activites/me retourne 401 sans token', async () => {
    const response = await request(app)
      .get('/api/activites/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/activites/:id/validation valide une activite academique avec un admin', async () => {
    const studentPayload = buildRegisterPayload('activite-validation');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);
    const admin = await createAdminFixture(`activite.admin.${Date.now()}@integration.test`);
    const institution = await createInstitutionFixture('validation');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'valide',
        date_d_action: new Date(),
      },
    });

    const createResponse = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        typeActivite: 'academique',
        titre: `Activite a valider ${Date.now()}`,
        type: 'conference',
        lieu: 'Amphi',
        institutionId: institution.institution_id,
      });

    expect(createResponse.status).toBe(201);

    const experienceId = createResponse.body.data.experience.experience_id;

    const response = await request(app)
      .patch(`/api/activites/${experienceId}/validation`)
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({ statut: 'valide', commentaire: 'Activite validee' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.validation).toMatchObject({
      statut: 'valide',
      commentaire: 'Activite validee',
    });
    expect(response.body.data.experience.visibilite).toBe(true);
  });

  it('PATCH /api/activites/:id/validation retourne 403 pour un non-admin', async () => {
    const studentPayload = buildRegisterPayload('activite-non-admin');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);

    const response = await request(app)
      .patch('/api/activites/exp-any/validation')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/activites/:id/validation retourne 400 si le statut est invalide', async () => {
    const studentPayload = buildRegisterPayload('activite-invalid-status');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);
    const admin = await createAdminFixture(`activite.admin.invalid.${Date.now()}@integration.test`);
    const institution = await createInstitutionFixture('invalid-status');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'valide',
        date_d_action: new Date(),
      },
    });

    const createResponse = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        typeActivite: 'academique',
        titre: `Activite statut invalide ${Date.now()}`,
        type: 'conference',
        lieu: 'Amphi',
        institutionId: institution.institution_id,
      });

    const experienceId = createResponse.body.data.experience.experience_id;

    const response = await request(app)
      .patch(`/api/activites/${experienceId}/validation`)
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({ statut: 'en_attente' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Statut de validation invalide',
    });
  });

  it('PATCH /api/activites/:id/validation refuse une activite et la rend non visible', async () => {
    const studentPayload = buildRegisterPayload('activite-refuse');
    const student = await createLocalUserFixture(studentPayload.email, studentPayload.password);
    const admin = await createAdminFixture(`activite.admin.refuse.${Date.now()}@integration.test`);
    const institution = await createInstitutionFixture('refuse');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'valide',
        date_d_action: new Date(),
      },
    });

    const createResponse = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        typeActivite: 'academique',
        titre: `Activite refusee ${Date.now()}`,
        type: 'conference',
        lieu: 'Amphi',
        institutionId: institution.institution_id,
      });

    const experienceId = createResponse.body.data.experience.experience_id;

    const response = await request(app)
      .patch(`/api/activites/${experienceId}/validation`)
      .set('Cookie', `accessToken=${buildAccessToken(admin)}`)
      .send({ statut: 'refuse', commentaire: 'Pieces insuffisantes' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.validation).toMatchObject({
      statut: 'refuse',
      commentaire: 'Pieces insuffisantes',
    });
    expect(response.body.data.experience.visibilite).toBe(false);
  });

  it('GET /api/activites/portfolio/:etudiantId ne retourne que les activites visibles', async () => {
    const payload = buildRegisterPayload('activite-portfolio');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const visibleResponse = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        typeActivite: 'personnelle',
        titre: `Visible ${Date.now()}`,
        type: 'club',
        lieu: 'Campus',
        visibleToEveryone: true,
      });

    const hiddenResponse = await request(app)
      .post('/api/activites')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        typeActivite: 'personnelle',
        titre: `Cachee ${Date.now()}`,
        type: 'club',
        lieu: 'Campus',
        visibleToEveryone: false,
      });

    expect(visibleResponse.status).toBe(201);
    expect(hiddenResponse.status).toBe(201);

    const response = await request(app)
      .get(`/api/activites/portfolio/${user.utilisateur_id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].experience).toMatchObject({
      utilisateur_id: user.utilisateur_id,
      visibilite: true,
    });
  });
});
