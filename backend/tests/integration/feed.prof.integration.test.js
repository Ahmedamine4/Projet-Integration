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
  createProfessorFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

describe('Feed professeur integration', () => {
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

  it('GET /api/prof/feed/students-top retourne 401 sans token', async () => {
    const response = await request(app).get('/api/prof/feed/students-top');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/prof/feed/students-top retourne 403 pour un etudiant', async () => {
    const payload = buildRegisterPayload('feed-prof-forbidden');
    const student = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .get('/api/prof/feed/students-top')
      .set('Cookie', `accessToken=${buildAccessToken(student)}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/prof/feed/* retourne 403 avec le fixture professeur actuel', async () => {
    const professor = await createProfessorFixture(
      `feed.prof.${Date.now()}@integration.test`
    );

    const studentPayload = buildRegisterPayload('feed-prof-student');
    await createLocalUserFixture(studentPayload.email, studentPayload.password);

    const endpoints = [
      '/api/prof/feed/students-top?page=1&limit=5',
      '/api/prof/feed/suggestions?page=1&limit=5',
      '/api/prof/feed/experiences?page=1&limit=5',
    ];

    for (const endpoint of endpoints) {
      const response = await request(app)
        .get(endpoint)
        .set('Cookie', `accessToken=${buildAccessToken(professor)}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    }
  });
});
