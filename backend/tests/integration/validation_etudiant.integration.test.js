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
        date: new Date(),
      },
    });

    const response = await request(app)
      .get(`/api/validation/pending/${institution.institution_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toMatchObject({
      utilisateur_id: student.utilisateur_id,
      institution_id: institution.institution_id,
      statut: 'en_attente',
    });
  });

  it('PATCH /api/validation/decide/:etudiantId/:institutionId retourne 400 si le payload n utilise pas le bon champ', async () => {
    const payload = buildRegisterPayload('validation-wrong-payload');
    const student = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('wrong-payload');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'en_attente',
        date: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/validation/decide/${student.utilisateur_id}/${institution.institution_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('statut');
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
        date: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/validation/decide/${student.utilisateur_id}/${institution.institution_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({ status: 'en_attente' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('statut');
  });

  it('PATCH /api/validation/decide/:etudiantId/:institutionId refuse la demande avec le statut metier attendu', async () => {
    const payload = buildRegisterPayload('validation-refuse');
    const student = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('decide-refuse');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'en_attente',
        date: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/validation/decide/${student.utilisateur_id}/${institution.institution_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({ status: 'refuse' });

    expect(response.status).toBe(200);
    expect(response.body.updated.statut).toBe('refuse');

    const updated = await prisma.valideEtudiant.findUnique({
      where: {
        utilisateur_id_institution_id: {
          utilisateur_id: student.utilisateur_id,
          institution_id: institution.institution_id,
        },
      },
    });

    expect(updated.statut).toBe('refuse');
  });

  it('PATCH /api/validation/decide/:etudiantId/:institutionId retourne 400 si le client envoie statut au lieu de status', async () => {
    const payload = buildRegisterPayload('validation-valide');
    const student = await createLocalUserFixture(payload.email, payload.password);
    const institution = await createInstitutionFixture('decide-statut');

    await prisma.valideEtudiant.create({
      data: {
        utilisateur_id: student.utilisateur_id,
        institution_id: institution.institution_id,
        statut: 'en_attente',
        date: new Date(),
      },
    });

    const response = await request(app)
      .patch(`/api/validation/decide/${student.utilisateur_id}/${institution.institution_id}`)
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({ statut: 'valide' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('statut');
  });
});
