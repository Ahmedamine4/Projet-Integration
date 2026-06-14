import { describe, it, expect, vi, beforeEach } from 'vitest';

const getSocialMediaMock = vi.fn();
const updateSocialMediaMock = vi.fn();

vi.mock('../../src/services/social_media.service.js', () => ({
    getSocialMedia: getSocialMediaMock,
    updateSocialMedia: updateSocialMediaMock,
}));

const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('social_media.controller', () => {
    let controller;

    beforeEach(async () => {
        vi.clearAllMocks();
        controller = await import('../../src/controllers/social_media.controller.js');
    });

    it('getSocialMediaController retourne les liens sociaux', async () => {
        const data = {
            github: 'https://github.com/sara',
            instagram: null,
            x: null,
            linkedin: 'https://linkedin.com/in/sara',
        };

        getSocialMediaMock.mockResolvedValue(data);

        const req = {
            params: { userId: 'user-1' },
        };
        const res = mockRes();

        await controller.getSocialMediaController(req, res);

        expect(getSocialMediaMock).toHaveBeenCalledWith('user-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data,
        });
    });

    it('getSocialMediaController retourne 404 si utilisateur introuvable', async () => {
        getSocialMediaMock.mockRejectedValue(new Error('Utilisateur non trouvé'));

        const req = {
            params: { userId: 'user-404' },
        };
        const res = mockRes();

        await controller.getSocialMediaController(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Utilisateur non trouvé',
        });
    });

    it('getSocialMediaController retourne 500 sur erreur inconnue', async () => {
        getSocialMediaMock.mockRejectedValue(new Error('boom'));

        const req = {
            params: { userId: 'user-1' },
        };
        const res = mockRes();

        await controller.getSocialMediaController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Erreur serveur',
        });
    });

    it('updateSocialMediaController retourne 401 si utilisateur non connecte', async () => {
        const req = {
            params: { userId: 'user-1' },
            user: null,
            body: { github: 'https://github.com/sara' },
        };
        const res = mockRes();

        await controller.updateSocialMediaController(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(updateSocialMediaMock).not.toHaveBeenCalled();
    });

    it('updateSocialMediaController retourne 403 si utilisateur non proprietaire', async () => {
        const req = {
            params: { userId: 'user-1' },
            user: { utilisateur_id: 'user-2' },
            body: { github: 'https://github.com/sara' },
        };
        const res = mockRes();

        await controller.updateSocialMediaController(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(updateSocialMediaMock).not.toHaveBeenCalled();
    });

    it('updateSocialMediaController retourne 200 apres modification', async () => {
        const updated = {
            github: 'https://github.com/sara',
            instagram: null,
            x: null,
            linkedin: null,
        };

        updateSocialMediaMock.mockResolvedValue(updated);

        const req = {
            params: { userId: 'user-1' },
            user: { utilisateur_id: 'user-1' },
            body: { github: 'https://github.com/sara' },
        };
        const res = mockRes();

        await controller.updateSocialMediaController(req, res);

        expect(updateSocialMediaMock).toHaveBeenCalledWith('user-1', {
            github: 'https://github.com/sara',
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: updated,
        });
    });

    it('updateSocialMediaController retourne 400 si aucun champ valide', async () => {
        updateSocialMediaMock.mockRejectedValue(
            new Error('Aucun champ valide fourni')
        );

        const req = {
            params: { userId: 'user-1' },
            user: { utilisateur_id: 'user-1' },
            body: {},
        };
        const res = mockRes();

        await controller.updateSocialMediaController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Aucun champ valide fourni',
        });
    });

    it('updateSocialMediaController retourne 500 sur erreur inconnue', async () => {
        updateSocialMediaMock.mockRejectedValue(new Error('boom'));

        const req = {
            params: { userId: 'user-1' },
            user: { utilisateur_id: 'user-1' },
            body: { github: 'https://github.com/sara' },
        };
        const res = mockRes();

        await controller.updateSocialMediaController(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Erreur serveur',
        });
    });
});
