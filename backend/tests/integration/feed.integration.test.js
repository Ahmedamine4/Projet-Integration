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

const { default: app } = await import('../../src/app.js');

describe('Feed etudiant integration', () => {
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

    it('GET /api/feed/tags retourne 401 sans token', async () => {
        const response = await request(app).get('/api/feed/tags');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it('GET /api/feed/tags retourne technologies et domaines', async () => {
        const payload = buildRegisterPayload('feed-tags');
        const user = await createLocalUserFixture(payload.email, payload.password);

        const response = await request(app)
            .get('/api/feed/tags')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('technologies');
        expect(response.body.data).toHaveProperty('domaines');
        expect(Array.isArray(response.body.data.technologies)).toBe(true);
        expect(Array.isArray(response.body.data.domaines)).toBe(true);
    });

    it('GET /api/feed/suggestions retourne les etudiants non suivis', async () => {
        const currentPayload = buildRegisterPayload('feed-current');
        const current = await createLocalUserFixture(
            currentPayload.email,
            currentPayload.password
        );

        const suggestedPayload = buildRegisterPayload('feed-suggested');
        const suggested = await createLocalUserFixture(
            suggestedPayload.email,
            suggestedPayload.password
        );

        const response = await request(app)
            .get('/api/feed/suggestions?page=1&limit=10')
            .set('Cookie', `accessToken=${buildAccessToken(current)}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.pagination).toMatchObject({
            page: 1,
            pageSize: 10,
        });

        const ids = response.body.data.map((item) => item.utilisateur_id);
        expect(ids).toContain(suggested.utilisateur_id);
        expect(ids).not.toContain(current.utilisateur_id);
    });

    it('GET /api/feed/offres et /api/feed/experiences retournent une pagination', async () => {
        const payload = buildRegisterPayload('feed-list');
        const user = await createLocalUserFixture(payload.email, payload.password);

        const offresResponse = await request(app)
            .get('/api/feed/offres?page=1&limit=3')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`);

        expect(offresResponse.status).toBe(200);
        expect(offresResponse.body.success).toBe(true);
        expect(Array.isArray(offresResponse.body.data)).toBe(true);
        expect(offresResponse.body.pagination.page).toBe(1);

        const experiencesResponse = await request(app)
            .get('/api/feed/experiences?page=1&limit=3&trending=true')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`);

        expect(experiencesResponse.status).toBe(200);
        expect(experiencesResponse.body.success).toBe(true);
        expect(Array.isArray(experiencesResponse.body.data)).toBe(true);
        expect(experiencesResponse.body.pagination.page).toBe(1);
    });

    it('POST /api/offres/:offreId/demandes retourne 400 si offre introuvable', async () => {
        const payload = buildRegisterPayload('feed-demande');
        const user = await createLocalUserFixture(payload.email, payload.password);

        const response = await request(app)
            .post('/api/offres/offre-inconnue/demandes')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`)
            .send({
                message: 'Je suis interesse par cette offre.',
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});
