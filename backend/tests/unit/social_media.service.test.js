import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = {
    utilisateur: {
        findUnique: vi.fn(),
        update: vi.fn(),
    },
};

vi.mock('../../src/config/prisma.js', () => ({
    default: prismaMock,
}));

describe('social_media.service', () => {
    let service;

    beforeEach(async () => {
        vi.clearAllMocks();
        service = await import('../../src/services/social_media.service.js');
    });

    it('getSocialMedia retourne les liens sociaux utilisateur', async () => {
        prismaMock.utilisateur.findUnique.mockResolvedValue({
            github: 'https://github.com/sara',
            instagram: null,
            x: 'https://x.com/sara',
            linkedin: 'https://linkedin.com/in/sara',
        });

        const result = await service.getSocialMedia('user-1');

        expect(prismaMock.utilisateur.findUnique).toHaveBeenCalledWith({
            where: { utilisateur_id: 'user-1' },
            select: {
                github: true,
                instagram: true,
                x: true,
                linkedin: true,
            },
        });

        expect(result).toEqual({
            github: 'https://github.com/sara',
            instagram: null,
            x: 'https://x.com/sara',
            linkedin: 'https://linkedin.com/in/sara',
        });
    });

    it('getSocialMedia lance une erreur si utilisateur introuvable', async () => {
        prismaMock.utilisateur.findUnique.mockResolvedValue(null);

        await expect(service.getSocialMedia('user-404')).rejects.toThrow(
            'Utilisateur non trouvé'
        );
    });

    it('updateSocialMedia met a jour les liens sociaux avec trim', async () => {
        prismaMock.utilisateur.update.mockResolvedValue({
            github: 'https://github.com/sara',
            instagram: 'https://instagram.com/sara',
            x: null,
            linkedin: 'https://linkedin.com/in/sara',
        });

        const result = await service.updateSocialMedia('user-1', {
            github: '  https://github.com/sara  ',
            instagram: ' https://instagram.com/sara ',
            linkedin: '  https://linkedin.com/in/sara ',
        });

        expect(prismaMock.utilisateur.update).toHaveBeenCalledWith({
            where: { utilisateur_id: 'user-1' },
            data: {
                github: 'https://github.com/sara',
                instagram: 'https://instagram.com/sara',
                linkedin: 'https://linkedin.com/in/sara',
            },
            select: {
                github: true,
                instagram: true,
                x: true,
                linkedin: true,
            },
        });

        expect(result).toEqual({
            github: 'https://github.com/sara',
            instagram: 'https://instagram.com/sara',
            x: null,
            linkedin: 'https://linkedin.com/in/sara',
        });
    });

    it('updateSocialMedia transforme les champs vides en null', async () => {
        prismaMock.utilisateur.update.mockResolvedValue({
            github: null,
            instagram: null,
            x: null,
            linkedin: null,
        });

        await service.updateSocialMedia('user-1', {
            github: '',
            instagram: '   ',
            x: null,
            linkedin: undefined,
        });

        expect(prismaMock.utilisateur.update).toHaveBeenCalledWith({
            where: { utilisateur_id: 'user-1' },
            data: {
                github: null,
                instagram: null,
                x: null,
            },
            select: {
                github: true,
                instagram: true,
                x: true,
                linkedin: true,
            },
        });
    });

    it('updateSocialMedia ignore les champs non autorises', async () => {
        await expect(
            service.updateSocialMedia('user-1', {
                facebook: 'https://facebook.com/sara',
                tiktok: 'https://tiktok.com/@sara',
            })
        ).rejects.toThrow('Aucun champ valide fourni');

        expect(prismaMock.utilisateur.update).not.toHaveBeenCalled();
    });

    it('updateSocialMedia lance une erreur si aucun champ valide fourni', async () => {
        await expect(service.updateSocialMedia('user-1', {})).rejects.toThrow(
            'Aucun champ valide fourni'
        );

        expect(prismaMock.utilisateur.update).not.toHaveBeenCalled();
    });
});