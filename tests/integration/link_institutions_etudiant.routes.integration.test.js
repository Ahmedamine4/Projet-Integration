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

describe('Link institutions integration', () => {
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

  it('POST /api/select-institutions retourne 400 si le body est invalide', async () => {
    const response = await request(app)
      .post('/api/select-institutions')
      .send({
        etudiantId: '',
        institutionNoms: [],
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'etudiantId et un tableau institutionNoms sont requis',
    });
  });

  it('POST /api/select-institutions retourne 200 si la liaison reussit', async () => {
    const payload = buildRegisterPayload('link-student');
    const student = await createLocalUserFixture(payload.email, payload.password);
    const institution1 = await createInstitutionFixture('link-1');
    const institution2 = await createInstitutionFixture('link-2');

    const response = await request(app)
      .post('/api/select-institutions')
      .send({
        etudiantId: student.utilisateur_id,
        institutionNoms: [institution1.nom, institution2.nom],
      });

    expect(response.status).toBe(200);
    expect(response.body.count).toBe(2);
    expect(response.body.message).toContain('liaison');

    const links = await prisma.valideEtudiant.findMany({
      where: {
        utilisateur_id: student.utilisateur_id,
      },
    });

    expect(links).toHaveLength(2);
  });

  it('POST /api/select-institutions retourne 500 si aucune institution nest trouvee', async () => {
    const payload = buildRegisterPayload('link-missing');
    const student = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/select-institutions')
      .send({
        etudiantId: student.utilisateur_id,
        institutionNoms: ['Inconnue'],
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Erreur lors de la liaison');
    expect(response.body.details).toContain('Aucune institution');
  });
});
