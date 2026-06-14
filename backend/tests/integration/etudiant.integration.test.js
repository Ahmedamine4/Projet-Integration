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

async function seedExperience(studentId, type, title, extra = {}) {
    return prisma.experience.create({
        data: {
            titre: title,
            date_experience: extra.date_experience ?? new Date('2026-05-01'),
            visibilite: extra.visibilite ?? false,
            type,
            type_specifique: extra.type_specifique ?? 'personnel',
            description: extra.description ?? `${title} description`,
            utilisateur_id: studentId,
            photo: extra.photo ?? null,
        },
    });
}

async function seedStage(studentId, title, extra = {}) {
    const experience = await seedExperience(studentId, 'stage', title, {
        type_specifique: extra.type_specifique ?? 'personnel',
        date_experience: extra.date_experience ?? new Date('2026-05-01'),
        description: extra.description ?? `${title} description`,
    });

    await prisma.stage.create({
        data: {
            experience_id: experience.experience_id,
            date_fin: extra.date_fin ?? new Date('2026-05-10'),
            duree: extra.duree ?? '9',
        },
    });

    return experience;
}

async function seedProjet(studentId, title) {
    const experience = await seedExperience(studentId, 'projet', title);

    await prisma.projet.create({
        data: {
            experience_id: experience.experience_id,
        },
    });

    return experience;
}

async function seedCertification(studentId, title) {
    const experience = await seedExperience(studentId, 'certification', title);

    await prisma.certification.create({
        data: {
            experience_id: experience.experience_id,
            code: 'CERT-1',
            lien_URL: 'https://cert.example.test',
        },
    });

    return experience;
}

describe('Etudiant integration', () => {
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

    it('GET /api/etudiant/dashboard retourne 401 sans accessToken', async () => {
        const response = await request(app).get('/api/etudiant/dashboard');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
    });

    it('GET /api/etudiant/dashboard retourne 403 pour un professeur', async () => {
        const professor = await createProfessorFixture(
            `etudiant.prof.${Date.now()}@test.integration.local`
        );

        const response = await request(app)
            .get('/api/etudiant/dashboard')
            .set('Cookie', `accessToken=${buildAccessToken(professor)}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
    });

    it('GET /api/etudiant/dashboard retourne les statistiques de letudiant', async () => {
        const payload = buildRegisterPayload('etudiant-dashboard');
        const student = await createLocalUserFixture(payload.email, payload.password);

        await seedProjet(student.utilisateur_id, 'Projet dashboard');
        await seedStage(student.utilisateur_id, 'Stage dashboard');
        await seedCertification(student.utilisateur_id, 'Cert dashboard');

        const professor = await createProfessorFixture(
            `etudiant.prof.dashboard.${Date.now()}@test.integration.local`
        );

        await prisma.lettresDeRecommendations.create({
            data: {
                utilisateur_id: student.utilisateur_id,
                prof_utilisateur_id: professor.utilisateur_id,
                objet: 'Lettre dashboard',
                description: 'Description',
                statut: 'en_attente',
                date_lettre: new Date(),
            },
        });

        const response = await request(app)
            .get('/api/etudiant/dashboard')
            .set('Cookie', `accessToken=${buildAccessToken(student)}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.stats.projets).toBeGreaterThanOrEqual(1);
        expect(response.body.data.stats.stages).toBeGreaterThanOrEqual(1);
        expect(response.body.data.stats.certifications).toBeGreaterThanOrEqual(1);
        expect(response.body.data.stats.lettres_recommandation).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/etudiant/validations retourne 400 si type invalide', async () => {
        const payload = buildRegisterPayload('etudiant-validations-invalid');
        const student = await createLocalUserFixture(payload.email, payload.password);

        const response = await request(app)
            .get('/api/etudiant/validations?type=invalide')
            .set('Cookie', `accessToken=${buildAccessToken(student)}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });

    it('GET /api/etudiant/validations liste les validations de stage', async () => {
        const payload = buildRegisterPayload('etudiant-validations-stage');
        const student = await createLocalUserFixture(payload.email, payload.password);

        const professor = await createProfessorFixture(
            `etudiant.prof.validation.${Date.now()}@test.integration.local`
        );

        const stage = await seedStage(student.utilisateur_id, 'Stage validation', {
            type_specifique: 'academique',
            date_experience: new Date('2026-05-01'),
            date_fin: new Date('2026-05-10'),
            duree: '9',
        });

        await prisma.valideStage.create({
            data: {
                utilisateur_id: professor.utilisateur_id,
                experience_id: stage.experience_id,
                statut: 'en_attente',
                commentaire: null,
                date_d_action: new Date('2026-05-11'),
            },
        });

        const response = await request(app)
            .get('/api/etudiant/validations?type=stage&statut=en_attente&page=1')
            .set('Cookie', `accessToken=${buildAccessToken(student)}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);

        expect(response.body.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: 'stage',
                    experience_id: stage.experience_id,
                    titre: 'Stage validation',
                    statut: 'en_attente',
                }),
            ])
        );

        expect(response.body.pagination.page).toBe(1);
    });
});
