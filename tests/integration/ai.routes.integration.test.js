import '../setup/test-env.setup.js';

import http from 'node:http';
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

const AI_TEST_PORT = 40123;
process.env.AI_API_URL = `http://127.0.0.1:${AI_TEST_PORT}`;

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

describe('AI integration', () => {
  let server;
  let requestHandler;

  beforeAll(async () => {
    assertAuthTestEnvironment();
    await prisma.$connect();

    server = http.createServer((req, res) => requestHandler(req, res));

    await new Promise((resolve) => {
      server.listen(AI_TEST_PORT, '127.0.0.1', resolve);
    });
  });

  beforeEach(async () => {
    await cleanupAuthFixtures();
    requestHandler = async (req, res) => {
      if (req.method !== 'POST' || req.url !== '/predict') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ technologies: ['Node.js'], domains: ['Web'] }));
    };
  });

  afterAll(async () => {
    await cleanupAuthFixtures();
    await prisma.$disconnect();
    await new Promise((resolve) => server.close(resolve));
  });

  it('POST /api/ai/predict retourne 401 sans accessToken', async () => {
    const response = await request(app)
      .post('/api/ai/predict')
      .send({ text: 'Projet IA' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('POST /api/ai/predict retourne 400 si text est vide', async () => {
    const payload = buildRegisterPayload('ai-empty');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/ai/predict')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({ text: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Text is required',
    });
  });

  it('POST /api/ai/predict retourne une prediction pour un texte valide', async () => {
    const payload = buildRegisterPayload('ai-success');
    const user = await createLocalUserFixture(payload.email, payload.password);

    const response = await request(app)
      .post('/api/ai/predict')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({ text: 'Projet backend Node.js pour application web' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toEqual({
      technologies: ['Node.js'],
      domains: ['Web'],
    });
  });

  it('POST /api/ai/predict retourne 500 si le service externe echoue', async () => {
    const payload = buildRegisterPayload('ai-error');
    const user = await createLocalUserFixture(payload.email, payload.password);

    requestHandler = async (req, res) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'upstream failure' }));
    };

    const response = await request(app)
      .post('/api/ai/predict')
      .set('Cookie', `accessToken=${buildAccessToken(user)}`)
      .send({ text: 'Projet backend Node.js pour application web' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      message: 'AI prediction failed',
    });
  });
});
