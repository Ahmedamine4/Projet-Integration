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
    const payload = buildRegisterPayload('link-invalid-body');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/select-institutions')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({
        etudiantId: '',
        institutions: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('etudiantId');
    expect(response.body.error).toContain('institutions');
  });

  it('POST /api/select-institutions retourne 200 si la liaison reussit avec des IDs', async () => {
    const payload = buildRegisterPayload('link-student');
    const student = await createLocalUserFixture(payload.email, payload.password);

    const institution1 = await createInstitutionFixture('link-1');
    const institution2 = await createInstitutionFixture('link-2');

    const response = await request(app)
      .post('/api/select-institutions')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`)
      .send({
        etudiantId: student.utilisateur_id,
        etudie: true,
        institutions: [
          {
            institutionId: institution1.institution_id,
            date_debut: '2024-09-01',
            niveau: 'bachelor',
          },
          {
            institutionId: institution2.institution_id,
            date_debut: '2025-09-01',
            date_fin: '2026-06-30',
            niveau: 'master',
          },
        ],
      });

    expect(response.status).toBe(200);

    const links = await prisma.valideEtudiant.findMany({
      where: {
        utilisateur_id: student.utilisateur_id,
      },
    });

    expect(links).toHaveLength(2);
    expect(links.map((link) => link.institution_id).sort()).toEqual(
      [institution1.institution_id, institution2.institution_id].sort()
    );
  });
});
