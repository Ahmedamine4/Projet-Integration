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

describe('Institution integration', () => {
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

  it('GET /api/getInstitutions retourne les institutions', async () => {
    const payload = buildRegisterPayload('institutions-list');
    const user = await createLocalUserFixture(payload.email, payload.password);
    const institution1 = await createInstitutionFixture('listing-1');
    const institution2 = await createInstitutionFixture('listing-2');

    const response = await request(app)
      .get('/api/getInstitutions')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`);

    expect(response.status).toBe(200);

    const institutions = Array.isArray(response.body)
      ? response.body
      : response.body.data;

    expect(Array.isArray(institutions)).toBe(true);
    expect(institutions.length).toBeGreaterThanOrEqual(2);

    expect(institutions.every((item) => typeof item.nom === 'string')).toBe(true);

    expect(institutions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          institution_id: institution1.institution_id,
          nom: institution1.nom,
        }),
        expect.objectContaining({
          institution_id: institution2.institution_id,
          nom: institution2.nom,
        }),
      ])
    );
  });
});
