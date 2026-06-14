import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
    follow: {
        count: vi.fn(),
    },
    experience: {
        count: vi.fn(),
    },
    lettresDeRecommendations: {
        count: vi.fn(),
        findMany: vi.fn(),
    },
    competenceDeveloppee: {
        findMany: vi.fn(),
    },
    portfolio: {
        findUnique: vi.fn(),
    },
    portfolioScoreHistory: {
        findMany: vi.fn(),
    },
    valideStage: {
        findMany: vi.fn(),
    },
    valideProjet: {
        findMany: vi.fn(),
    },
    valideActivite: {
        findMany: vi.fn(),
    },
};

vi.mock('../../src/config/prisma.js', () => ({
    default: prismaMock,
}));

const etudiantService = await import('../../src/services/etudiant.service.js');

describe('etudiant.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        prismaMock.follow.count.mockResolvedValue(0);
        prismaMock.experience.count.mockResolvedValue(0);
        prismaMock.lettresDeRecommendations.count.mockResolvedValue(0);

        prismaMock.competenceDeveloppee.findMany.mockResolvedValue([]);
        prismaMock.portfolio.findUnique.mockResolvedValue({
            score_credibilite: 0,
        });
        prismaMock.portfolioScoreHistory.findMany.mockResolvedValue([]);

        prismaMock.valideStage.findMany.mockResolvedValue([]);
        prismaMock.valideProjet.findMany.mockResolvedValue([]);
        prismaMock.valideActivite.findMany.mockResolvedValue([]);
        prismaMock.lettresDeRecommendations.findMany.mockResolvedValue([]);
    });

    it('getDashboardEtudiant retourne stats, technologies et domaines', async () => {
        prismaMock.follow.count.mockResolvedValue(5);

        prismaMock.experience.count
            .mockResolvedValueOnce(2) // projets
            .mockResolvedValueOnce(1) // stages
            .mockResolvedValueOnce(3); // certifications

        prismaMock.lettresDeRecommendations.count.mockResolvedValue(4);

        prismaMock.competenceDeveloppee.findMany
            .mockResolvedValueOnce([
                {
                    niveau: '3',
                    competence: {
                        competence_id: 'tech-1',
                        nom: 'Node.js',
                    },
                },
            ])
            .mockResolvedValueOnce([
                {
                    niveau: '2',
                    competence: {
                        competence_id: 'dom-1',
                        nom: 'Web',
                    },
                },
            ]);

        prismaMock.portfolio.findUnique.mockResolvedValue({
            score_credibilite: 80,
        });

        prismaMock.portfolioScoreHistory.findMany.mockResolvedValue([
            {
                score: 80,
                date: new Date('2026-06-01'),
            },
        ]);

        const result = await etudiantService.getDashboardEtudiant('etu-1');

        expect(result.stats).toEqual({
            followers: 5,
            projets: 2,
            stages: 1,
            lettres_recommandation: 4,
            certifications: 3,
        });

        expect(result.score).toBe(80);

        expect(result.technologies).toEqual([
            {
                nom: 'Node.js',
                niveau: 3,
            },
        ]);

        expect(result.domaines).toEqual([
            {
                nom: 'Web',
                niveau: 2,
            },
        ]);

        expect(result.score_history).toHaveLength(1);
    });

    it('getDemandesEtudiant retourne toutes les demandes normalisées', async () => {
        prismaMock.valideStage.findMany.mockResolvedValue([
            {
                statut: 'valide',
                date_d_action: new Date('2026-06-01'),
                experience_id: 'stage-1',
                commentaire: 'OK',
                experience: {
                    titre: 'Stage Backend',
                },
                professeur: {
                    utilisateur: {
                        nom: 'Prof',
                        prenom: 'A',
                    },
                },
            },
        ]);

        prismaMock.valideProjet.findMany.mockResolvedValue([
            {
                statut: 'en_attente',
                date_d_action: new Date('2026-06-02'),
                experience_id: 'projet-1',
                commentaire: null,
                projet: {
                    experience: {
                        titre: 'Projet Node',
                    },
                },
                professeur: {
                    utilisateur: {
                        nom: 'Prof',
                        prenom: 'B',
                    },
                },
            },
        ]);

        prismaMock.valideActivite.findMany.mockResolvedValue([
            {
                statut: 'refuse',
                date_d_action: new Date('2026-06-03'),
                experience_id: 'activite-1',
                commentaire: 'Refusé',
                activite: {
                    experience: {
                        titre: 'Hackathon',
                    },
                },
                institution: {
                    nom: 'ENSA',
                },
            },
        ]);

        prismaMock.lettresDeRecommendations.findMany.mockResolvedValue([
            {
                statut: 'valide',
                date_lettre: new Date('2026-06-04'),
                objet: 'Lettre stage',
                commentaire: 'OK',
                fichier: 'lettre.pdf',
                professeur: {
                    utilisateur: {
                        nom: 'Prof',
                        prenom: 'C',
                    },
                },
            },
        ]);

        const result = await etudiantService.getDemandesEtudiant('etu-1', {
            page: 1,
        });

        expect(result.data).toHaveLength(4);
        expect(result.pagination).toEqual({
            page: 1,
            totalPages: 1,
            total: 4,
            pageSize: 10,
        });

        expect(result.data[0]).toMatchObject({
            type: 'recommandation',
            titre: 'Lettre stage',
            statut: 'valide',
        });
    });

    it('getDemandesEtudiant filtre seulement les projets', async () => {
        prismaMock.valideProjet.findMany.mockResolvedValue([
            {
                statut: 'en_attente',
                date_d_action: new Date('2026-06-02'),
                experience_id: 'projet-1',
                commentaire: null,
                projet: {
                    experience: {
                        titre: 'Projet Node',
                    },
                },
                professeur: {
                    utilisateur: {
                        nom: 'Prof',
                        prenom: 'B',
                    },
                },
            },
        ]);

        const result = await etudiantService.getDemandesEtudiant('etu-1', {
            type: 'projet',
            statut: 'en_attente',
            page: 1,
        });

        expect(prismaMock.valideProjet.findMany).toHaveBeenCalled();
        expect(prismaMock.valideStage.findMany).not.toHaveBeenCalled();
        expect(prismaMock.valideActivite.findMany).not.toHaveBeenCalled();
        expect(prismaMock.lettresDeRecommendations.findMany).not.toHaveBeenCalled();

        expect(result.data).toHaveLength(1);
        expect(result.data[0]).toMatchObject({
            type: 'projet',
            experience_id: 'projet-1',
            titre: 'Projet Node',
            statut: 'en_attente',
        });
    });
});
