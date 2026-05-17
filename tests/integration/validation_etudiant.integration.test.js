import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
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
      .get(`/api/validation/pending/${institution.institution_id}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).toMatchObject({
      utilisateur_id: student.utilisateur_id,
      institution_id: institution.institution_id,
      statut: 'en_attente',
    });
  });

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
      .send({ status: 'refuse' });

    expect(response.status).toBe(200);
    expect(response.body.updated).toMatchObject({
      utilisateur_id: student.utilisateur_id,
      institution_id: institution.institution_id,
      statut: 'refuse',
    });
  });
});
