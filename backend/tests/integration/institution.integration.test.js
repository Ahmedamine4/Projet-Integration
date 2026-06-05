// On charge le meme setup d'environnement que les tests auth.
import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
  assertInstitutionTestEnvironment,
  cleanupInstitutionFixtures,
  createInstitutionFixture,
} from '../helpers/institution.helpers.js';

const { default: app } = await import('../../src/app.js');

describe('Institution integration', () => {
  beforeAll(async () => {
    assertInstitutionTestEnvironment();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanupInstitutionFixtures();
  });

  afterAll(async () => {
    await cleanupInstitutionFixtures();
    await prisma.$disconnect();
  });

  it('GET /api/getInstitutions retourne les donnees reelles', async () => {
    const institution1 = await createInstitutionFixture('listing-1');
    const institution2 = await createInstitutionFixture('listing-2');

    const response = await request(app).get('/api/getInstitutions');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body.every((item) => typeof item.nom === 'string')).toBe(true);
    expect(response.body.some((item) => item.nom === institution1.nom)).toBe(true);
    expect(response.body.some((item) => item.nom === institution2.nom)).toBe(true);
    expect(response.body.find((item) => item.nom === institution1.nom)).toEqual({
      institution_id: institution1.institution_id,
      nom: institution1.nom,
    });
  });
});
