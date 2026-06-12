import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
    portfolio: {
        findUnique: vi.fn(),
    },
    utilisateur: {
        findUnique: vi.fn(),
    },
    interaction: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
    },
};

vi.mock('../../src/config/prisma.js', () => ({
    default: prismaMock,
}));

const interactionService = await import('../../src/services/interaction.service.js');

describe('interaction.service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('creerRecommandation refuse si portfolio introuvable', async () => {
        prismaMock.portfolio.findUnique.mockResolvedValue(null);

        await expect(
            interactionService.creerRecommandation('pro-1', 'portfolio-1', 'Très bon profil')
        ).rejects.toThrow('Portfolio non trouvé');
    });

    it('creerRecommandation refuse si utilisateur introuvable', async () => {
        prismaMock.portfolio.findUnique.mockResolvedValue({
            portfolio_id: 'portfolio-1',
        });

        prismaMock.utilisateur.findUnique.mockResolvedValue(null);

        await expect(
            interactionService.creerRecommandation('pro-1', 'portfolio-1', 'Très bon profil')
        ).rejects.toThrow('Utilisateur non trouvé');
    });

    it('creerRecommandation refuse si utilisateur non professionnel ou professeur', async () => {
        prismaMock.portfolio.findUnique.mockResolvedValue({
            portfolio_id: 'portfolio-1',
        });

        prismaMock.utilisateur.findUnique.mockResolvedValue({
            utilisateur_id: 'user-1',
            role: 'etudiant',
        });

        await expect(
            interactionService.creerRecommandation('user-1', 'portfolio-1', 'Très bon profil')
        ).rejects.toThrow('Accès refusé');
    });

    it('creerRecommandation refuse si recommandation déjà existante', async () => {
        prismaMock.portfolio.findUnique.mockResolvedValue({
            portfolio_id: 'portfolio-1',
        });

        prismaMock.utilisateur.findUnique.mockResolvedValue({
            utilisateur_id: 'pro-1',
            role: 'professionnel',
        });

        prismaMock.interaction.findFirst.mockResolvedValue({
            interaction_id: 'interaction-1',
        });

        await expect(
            interactionService.creerRecommandation('pro-1', 'portfolio-1', 'Très bon profil')
        ).rejects.toThrow('Vous avez déjà laissé une recommandation sur ce portfolio');
    });

    it('creerRecommandation crée une recommandation invisible par défaut', async () => {
        prismaMock.portfolio.findUnique.mockResolvedValue({
            portfolio_id: 'portfolio-1',
        });

        prismaMock.utilisateur.findUnique.mockResolvedValue({
            utilisateur_id: 'pro-1',
            role: 'professionnel',
        });

        prismaMock.interaction.findFirst.mockResolvedValue(null);

        prismaMock.interaction.create.mockResolvedValue({
            interaction_id: 'interaction-1',
            utilisateur_id: 'pro-1',
            portfolio_id: 'portfolio-1',
            type: 'recommandation',
            texte: 'Très bon profil',
            visibilite: false,
        });

        const result = await interactionService.creerRecommandation(
            'pro-1',
            'portfolio-1',
            'Très bon profil'
        );

        expect(prismaMock.interaction.create).toHaveBeenCalledWith({
            data: {
                utilisateur_id: 'pro-1',
                portfolio_id: 'portfolio-1',
                type: 'recommandation',
                texte: 'Très bon profil',
                visibilite: false,
                date_interaction: expect.any(Date),
            },
            include: {
                utilisateur: {
                    select: { nom: true, prenom: true, email: true },
                },
            },
        });

        expect(result.visibilite).toBe(false);
    });

    it('updateVisibiliteRecommandation refuse si recommandation introuvable', async () => {
        prismaMock.interaction.findUnique.mockResolvedValue(null);

        await expect(
            interactionService.updateVisibiliteRecommandation('etu-1', 'interaction-1', true)
        ).rejects.toThrow('Recommandation non trouvée');
    });

    it("updateVisibiliteRecommandation refuse si interaction n'est pas recommandation", async () => {
        prismaMock.interaction.findUnique.mockResolvedValue({
            interaction_id: 'interaction-1',
            type: 'like',
            portfolio: {
                utilisateur_id: 'etu-1',
            },
        });

        await expect(
            interactionService.updateVisibiliteRecommandation('etu-1', 'interaction-1', true)
        ).rejects.toThrow("Cette interaction n'est pas une recommandation");
    });

    it('updateVisibiliteRecommandation refuse si portfolio appartient à un autre étudiant', async () => {
        prismaMock.interaction.findUnique.mockResolvedValue({
            interaction_id: 'interaction-1',
            type: 'recommandation',
            portfolio: {
                utilisateur_id: 'autre-etu',
            },
        });

        await expect(
            interactionService.updateVisibiliteRecommandation('etu-1', 'interaction-1', true)
        ).rejects.toThrow('Accès refusé');
    });

    it('updateVisibiliteRecommandation met à jour la visibilité', async () => {
        prismaMock.interaction.findUnique.mockResolvedValue({
            interaction_id: 'interaction-1',
            type: 'recommandation',
            portfolio: {
                utilisateur_id: 'etu-1',
            },
        });

        prismaMock.interaction.update.mockResolvedValue({
            interaction_id: 'interaction-1',
            visibilite: true,
        });

        const result = await interactionService.updateVisibiliteRecommandation(
            'etu-1',
            'interaction-1',
            true
        );

        expect(prismaMock.interaction.update).toHaveBeenCalledWith({
            where: { interaction_id: 'interaction-1' },
            data: { visibilite: true },
            select: { interaction_id: true, visibilite: true },
        });

        expect(result).toEqual({
            interaction_id: 'interaction-1',
            visibilite: true,
        });
    });

    it('getAllRecommandations retourne [] si portfolio introuvable', async () => {
        prismaMock.portfolio.findUnique.mockResolvedValue(null);

        const result = await interactionService.getAllRecommandations('etu-1');

        expect(result).toEqual([]);
    });

    it('getAllRecommandations retourne toutes les recommandations du portfolio', async () => {
        prismaMock.portfolio.findUnique.mockResolvedValue({
            portfolio_id: 'portfolio-1',
        });

        prismaMock.interaction.findMany.mockResolvedValue([
            {
                interaction_id: 'interaction-1',
                type: 'recommandation',
            },
        ]);

        const result = await interactionService.getAllRecommandations('etu-1');

        expect(prismaMock.interaction.findMany).toHaveBeenCalledWith({
            where: {
                portfolio_id: 'portfolio-1',
                type: 'recommandation',
            },
            include: {
                utilisateur: {
                    select: {
                        nom: true,
                        prenom: true,
                        email: true,
                        professionnel: { select: { entreprise: true, poste: true } },
                    },
                },
            },
            orderBy: { date_interaction: 'desc' },
        });

        expect(result).toHaveLength(1);
    });

    it('getRecommandationsVisibles retourne uniquement les recommandations visibles', async () => {
        prismaMock.portfolio.findUnique.mockResolvedValue({
            portfolio_id: 'portfolio-1',
        });

        prismaMock.interaction.findMany.mockResolvedValue([
            {
                interaction_id: 'interaction-1',
                type: 'recommandation',
                visibilite: true,
            },
        ]);

        const result = await interactionService.getRecommandationsVisibles('etu-1');

        expect(prismaMock.interaction.findMany).toHaveBeenCalledWith({
            where: {
                portfolio_id: 'portfolio-1',
                type: 'recommandation',
                visibilite: true,
            },
            include: {
                utilisateur: {
                    select: {
                        nom: true,
                        prenom: true,
                        email: true,
                        professionnel: { select: { entreprise: true, poste: true } },
                    },
                },
            },
            orderBy: { date_interaction: 'desc' },
        });

        expect(result).toHaveLength(1);
    });
});
