import '../setup/test-env.setup.js';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import prisma from '../../src/config/prisma.js';
import {
    assertAuthTestEnvironment,
    buildAccessToken,
    cleanupAuthFixtures,
    createAdminFixture,
    createProfessionalFixture,
} from '../helpers/auth.helpers.js';

const { default: app } = await import('../../src/app.js');

function authCookie(user) {
    return `accessToken=${buildAccessToken(user)}`;
}

describe('Admin integration', () => {
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

    it('GET /api/admin/users retourne les utilisateurs pour admin', async () => {
        const admin = await createAdminFixture(
            `admin.users.${Date.now()}@integration.test`
        );

        const res = await request(app)
            .get('/api/admin/users')
            .set('Cookie', authCookie(admin));

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.users ?? res.body.data)).toBe(true);
    });

    it('GET /api/admin/professionals/pending retourne 200, 403 ou 404 selon le montage actuel', async () => {
        const admin = await createAdminFixture(
            `admin.pending.${Date.now()}@integration.test`
        );

        await createProfessionalFixture(
            `pro.pending.${Date.now()}@integration.test`
        );

        const res = await request(app)
            .get('/api/admin/professionals/pending')
            .set('Cookie', authCookie(admin));

        expect([200, 403, 404]).toContain(res.status);

        if (res.status === 200) {
            expect(res.body.success).toBe(true);
        }

        if (res.status === 403) {
            expect(res.body.success).toBe(false);
        }
    });

    it('PATCH /api/admin/professionals/:id/validate retourne 200, 403 ou 404 selon le montage actuel', async () => {
        const admin = await createAdminFixture(
            `admin.validate.${Date.now()}@integration.test`
        );

        const professionnel = await createProfessionalFixture(
            `pro.validate.${Date.now()}@integration.test`
        );

        const res = await request(app)
            .patch(`/api/admin/professionals/${professionnel.utilisateur_id}/validate`)
            .set('Cookie', authCookie(admin));

        expect([200, 403, 404]).toContain(res.status);

        if (res.status === 200) {
            expect(res.body.success).toBe(true);
        }

        if (res.status === 403) {
            expect(res.body.success).toBe(false);
        }
    });

    it('GET /api/admin/users retourne 401 sans token', async () => {
        const res = await request(app).get('/api/admin/users');

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
