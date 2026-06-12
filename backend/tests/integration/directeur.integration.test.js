import '../setup/test-env.setup.js';

import bcrypt from 'bcryptjs';
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

const DIRECTEUR_DOMAIN = '@directeur.integration.test';

async function cleanupDirecteurFixtures() {
    const users = await prisma.utilisateur.findMany({
        where: {
            email: {
                endsWith: DIRECTEUR_DOMAIN,
            },
        },
        select: {
            utilisateur_id: true,
        },
    });

    const userIds = users.map((user) => user.utilisateur_id);

    if (userIds.length > 0) {
        await prisma.directeur.deleteMany({
            where: {
                directeur_utilisateur_id: {
                    in: userIds,
                },
            },
        });

        await prisma.utilisateur.deleteMany({
            where: {
                utilisateur_id: {
                    in: userIds,
                },
            },
        });
    }

    await prisma.institution.deleteMany({
        where: {
            email: {
                endsWith: DIRECTEUR_DOMAIN,
            },
        },
    });
}

async function createDirecteurFixture(prefix = 'directeur') {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `${prefix}.${unique}${DIRECTEUR_DOMAIN}`;
    const hash = await bcrypt.hash('StrongPass123!', 10);

    return prisma.$transaction(async (tx) => {
        const user = await tx.utilisateur.create({
            data: {
                nom: 'Directeur',
                prenom: 'Integration',
                email,
                mot_de_passe: hash,
                role: 'directeur',
                provider: 'local',
            },
        });

        const institution = await tx.institution.create({
            data: {
                nom: `Institution Directeur ${unique}`,
                email,
                academique: true,
            },
        });

        await tx.directeur.create({
            data: {
                directeur_utilisateur_id: user.utilisateur_id,
                institution_id: institution.institution_id,
            },
        });

        return { user, institution };
    });
}

describe('Directeur integration', () => {
    beforeAll(async () => {
        assertAuthTestEnvironment();
        await prisma.$connect();
    });

    beforeEach(async () => {
        await cleanupDirecteurFixtures();
        await cleanupAuthFixtures();
    });

    afterAll(async () => {
        await cleanupDirecteurFixtures();
        await cleanupAuthFixtures();
        await prisma.$disconnect();
    });

    it('GET /api/directeur/dashboard/stats retourne 401 sans token', async () => {
        const response = await request(app).get('/api/directeur/dashboard/stats');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it('GET /api/directeur/dashboard/stats retourne 403 pour un etudiant', async () => {
        const payload = buildRegisterPayload('directeur-forbidden');
        const student = await createLocalUserFixture(payload.email, payload.password);

        const response = await request(app)
            .get('/api/directeur/dashboard/stats')
            .set('Cookie', `accessToken=${buildAccessToken(student)}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it('GET /api/directeur/dashboard/stats retourne les stats de son institution', async () => {
        const { user, institution } = await createDirecteurFixture('stats');

        const response = await request(app)
            .get('/api/directeur/dashboard/stats')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.institution.institution_id).toBe(
            institution.institution_id
        );
        expect(response.body.data.stats).toMatchObject({
            totalProfessors: expect.any(Number),
            totalStudents: expect.any(Number),
            pendingInscriptions: expect.any(Number),
            pendingActivites: expect.any(Number),
            totalPending: expect.any(Number),
        });
    });

    it('GET /api/directeur/membres retourne les professeurs avec pagination', async () => {
        const { user } = await createDirecteurFixture('membres');

        const response = await request(app)
            .get('/api/directeur/membres?type=professeur&page=1')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.membres)).toBe(true);
        expect(response.body.data.pagination.page).toBe(1);
    });

    it('GET /api/directeur/demandes retourne les demandes inscription avec pagination', async () => {
        const { user } = await createDirecteurFixture('demandes');

        const response = await request(app)
            .get('/api/directeur/demandes?type=inscription&page=1')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data.demandes)).toBe(true);
        expect(response.body.data.pagination.page).toBe(1);
    });

    it('POST /api/directeur/professeurs retourne 400 si email invalide', async () => {
        const { user } = await createDirecteurFixture('professeur-invalid');

        const response = await request(app)
            .post('/api/directeur/professeurs')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`)
            .send({
                email: 'email-invalide',
                nom: 'Prof',
                prenom: 'Invalid',
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('PUT /api/directeur/demandes/inscription retourne 400 si payload incomplet', async () => {
        const { user } = await createDirecteurFixture('inscription-invalid');

        const response = await request(app)
            .put('/api/directeur/demandes/inscription')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`)
            .send({
                statut: 'valide',
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('PUT /api/directeur/demandes/activite retourne 400 si payload incomplet', async () => {
        const { user } = await createDirecteurFixture('activite-invalid');

        const response = await request(app)
            .put('/api/directeur/demandes/activite')
            .set('Cookie', `accessToken=${buildAccessToken(user)}`)
            .send({
                statut: 'valide',
            });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
});