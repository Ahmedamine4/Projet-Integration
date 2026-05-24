import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
<<<<<<< HEAD
=======
import jwt from 'jsonwebtoken';
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertAuthTestEnvironment,
  buildRegisterPayload,
  cleanupAuthFixtures,
  createLocalUserFixture,
} from '../helpers/auth.helpers.js';
import {
  assertInstitutionTestEnvironment,
  cleanupInstitutionFixtures,
  createInstitutionFixture,
} from '../helpers/institution.helpers.js';

const { default: app } = await import('../../src/app.js');

<<<<<<< HEAD
=======
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

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
describe('Validation etudiant integration', () => {
  beforeAll(async () => {
    assertAuthTestEnvironment();
    assertInstitutionTestEnvironment();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanupInstitutionFixtures();
    await cleanupAuthFixtures();
  });

  afterAll(async () => {
    await cleanupInstitutionFixtures();
    await cleanupAuthFixtures();
    await prisma.$disconnect();
  });

  it('GET /api/validation/pending/:institutionId retourne 401 sans token', async () => {
    const response = await request(app).get('/api/validation/pending/inst-1');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/validation/pending/:institutionId retourne les demandes en attente', async () => {
    const payload = buildRegisterPayload('validation-pending');
    const student = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('pending');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'en_attente',
        date_d_action: new Date(),
      },
    });

    const response = await request(app)
<<<<<<< HEAD
      .get(`/api/validation/pending/${institution.institution_id}`);
=======
      .get(`/api/validation/pending/${institution.institution_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`);
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toMatchObject({
      utilisateur_id: student.utilisateur_id,
      institution_id: institution.institution_id,
      statut: 'en_attente',
    });
  });

<<<<<<< HEAD
=======
  it('PATCH /api/validation/decide/:etudiantId/:institutionId retourne 401 sans token', async () => {
    const response = await request(app)
      .patch('/api/validation/decide/etu-1/inst-1')
      .send({ statut: 'valide' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('PATCH /api/validation/decide/:etudiantId/:institutionId retourne 400 si le statut est invalide', async () => {
    const payload = buildRegisterPayload('validation-invalid');
    const student = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('invalid');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'en_attente',
        date_d_action: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/validation/decide/${student.utilisateur_id}/${institution.institution_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({ statut: 'en_attente' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('statut');
  });

>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
  it('PATCH /api/validation/decide/:etudiantId/:institutionId accepte le statut refuse', async () => {
    const payload = buildRegisterPayload('validation-refuse');
    const student = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('decide');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'en_attente',
        date_d_action: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/validation/decide/${student.utilisateur_id}/${institution.institution_id}`)
<<<<<<< HEAD
=======
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
      .send({ status: 'refuse' });

    expect(response.status).toBe(200);
    expect(response.body.updated).toMatchObject({
      utilisateur_id: student.utilisateur_id,
      institution_id: institution.institution_id,
      statut: 'refuse',
    });
  });
<<<<<<< HEAD
=======

  it('PATCH /api/validation/decide/:etudiantId/:institutionId accepte aussi le champ statut et persiste la decision', async () => {
    const payload = buildRegisterPayload('validation-valide');
    const student = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('decide-statut');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'en_attente',
        date_d_action: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/validation/decide/${student.utilisateur_id}/${institution.institution_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(200);
    expect(response.body.updated.statut).toBe('valide');

    const persisted = await prisma.valideEtudiant.findUnique({
      where: {
        utilisateur_id_institution_id: {
          utilisateur_id: student.utilisateur_id,
          institution_id: institution.institution_id,
        },
      },
      select: {
        statut: true,
      },
    });

    expect(persisted.statut).toBe('valide');
  });
>>>>>>> ec44a4e (Ajout projet draft GitHub et les tests)
});
