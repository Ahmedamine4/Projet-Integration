import { describe, it, expect, vi, beforeEach } from 'vitest';

const followUserMock = vi.fn();
const unfollowUserMock = vi.fn();
const getFollowersMock = vi.fn();
const getFollowingMock = vi.fn();

vi.mock('../../src/services/follow.service.js', () => ({
    followUser: followUserMock,
    unfollowUser: unfollowUserMock,
    getFollowers: getFollowersMock,
    getFollowing: getFollowingMock,
}));

const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('follow.controller', () => {
    let controller;

    beforeEach(async () => {
        vi.clearAllMocks();
        controller = await import('../../src/controllers/follow.controller.js');
    });

    it('follow retourne 400 si targetId absent', async () => {
        const req = {
            user: { utilisateur_id: 'u1' },
            body: {},
        };
        const res = mockRes();

        await controller.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'targetId est requis',
        });
    });

    it('follow retourne 201 en cas de succes', async () => {
        followUserMock.mockResolvedValue({ id: 'follow1' });

        const req = {
            user: { utilisateur_id: 'u1' },
            body: { targetId: 'u2' },
        };
        const res = mockRes();

        await controller.follow(req, res);

        expect(followUserMock).toHaveBeenCalledWith('u1', 'u2');
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { id: 'follow1' },
        });
    });

    it('follow retourne 400 si utilisateur se suit lui-meme', async () => {
        followUserMock.mockRejectedValue(
            new Error('Vous ne pouvez pas vous suivre vous-même')
        );

        const req = {
            user: { utilisateur_id: 'u1' },
            body: { targetId: 'u1' },
        };
        const res = mockRes();

        await controller.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('follow retourne 404 utilisateur introuvable', async () => {
        followUserMock.mockRejectedValue(new Error('Utilisateur non trouvé'));

        const req = {
            user: { utilisateur_id: 'u1' },
            body: { targetId: 'u2' },
        };
        const res = mockRes();

        await controller.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('follow retourne 409 si deja suivi', async () => {
        followUserMock.mockRejectedValue(
            new Error('Vous suivez déjà cet utilisateur')
        );

        const req = {
            user: { utilisateur_id: 'u1' },
            body: { targetId: 'u2' },
        };
        const res = mockRes();

        await controller.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
    });

    it('follow retourne 500 erreur inconnue', async () => {
        followUserMock.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'u1' },
            body: { targetId: 'u2' },
        };
        const res = mockRes();

        await controller.follow(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Erreur serveur',
        });
    });

    it('unfollow retourne 200 en cas de succes', async () => {
        unfollowUserMock.mockResolvedValue();

        const req = {
            user: { utilisateur_id: 'u1' },
            params: { targetId: 'u2' },
        };
        const res = mockRes();

        await controller.unfollow(req, res);

        expect(unfollowUserMock).toHaveBeenCalledWith('u1', 'u2');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Vous ne suivez plus cet utilisateur',
        });
    });

    it('unfollow retourne 404 si follow inexistant', async () => {
        unfollowUserMock.mockRejectedValue(
            new Error('Vous ne suivez pas cet utilisateur')
        );

        const req = {
            user: { utilisateur_id: 'u1' },
            params: { targetId: 'u2' },
        };
        const res = mockRes();

        await controller.unfollow(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('unfollow retourne 500 erreur inconnue', async () => {
        unfollowUserMock.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'u1' },
            params: { targetId: 'u2' },
        };
        const res = mockRes();

        await controller.unfollow(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('listFollowers retourne les followers', async () => {
        getFollowersMock.mockResolvedValue([{ id: 'u2' }]);

        const req = {
            user: { utilisateur_id: 'caller' },
            params: { userId: 'user1' },
        };
        const res = mockRes();

        await controller.listFollowers(req, res);

        expect(getFollowersMock).toHaveBeenCalledWith('user1', 'caller');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [{ id: 'u2' }],
        });
    });

    it('listFollowing retourne les following', async () => {
        getFollowingMock.mockResolvedValue([{ id: 'u3' }]);

        const req = {
            user: { utilisateur_id: 'caller' },
            params: { userId: 'user1' },
        };
        const res = mockRes();

        await controller.listFollowing(req, res);

        expect(getFollowingMock).toHaveBeenCalledWith('user1', 'caller');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [{ id: 'u3' }],
        });
    });

    it('listFollowers retourne 500 sur erreur', async () => {
        getFollowersMock.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'caller' },
            params: { userId: 'user1' },
        };
        const res = mockRes();

        await controller.listFollowers(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('listFollowing retourne 500 sur erreur', async () => {
        getFollowingMock.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'caller' },
            params: { userId: 'user1' },
        };
        const res = mockRes();

        await controller.listFollowing(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});