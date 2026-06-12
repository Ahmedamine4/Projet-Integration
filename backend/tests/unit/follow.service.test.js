import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = {
    utilisateur: {
        findUnique: vi.fn(),
    },
    follow: {
        findUnique: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
        findMany: vi.fn(),
    },
};

const creerNotificationMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
    default: prismaMock,
}));

vi.mock('../../src/services/notification.service.js', () => ({
    creerNotification: creerNotificationMock,
    TYPES_NOTIFICATION: {
        NOUVEAU_FOLLOWER: 'nouveau_follower',
    },
}));

describe('follow.service', () => {
    let service;

    beforeEach(async () => {
        vi.clearAllMocks();
        service = await import('../../src/services/follow.service.js');
    });

    it('followUser crée un follow et notifie utilisateur cible', async () => {
        prismaMock.utilisateur.findUnique
            .mockResolvedValueOnce({
                utilisateur_id: 'user-2',
                nom: 'Cible',
                prenom: 'User',
            })
            .mockResolvedValueOnce({
                nom: 'Follow',
                prenom: 'Alice',
            });

        prismaMock.follow.findUnique.mockResolvedValue(null);

        prismaMock.follow.create.mockResolvedValue({
            followerId: 'user-1',
            followingId: 'user-2',
        });

        const result = await service.followUser('user-1', 'user-2');

        expect(prismaMock.utilisateur.findUnique).toHaveBeenNthCalledWith(1, {
            where: { utilisateur_id: 'user-2' },
            select: { utilisateur_id: true, nom: true, prenom: true },
        });

        expect(prismaMock.follow.findUnique).toHaveBeenCalledWith({
            where: {
                followerId_followingId: {
                    followerId: 'user-1',
                    followingId: 'user-2',
                },
            },
        });

        expect(prismaMock.follow.create).toHaveBeenCalledWith({
            data: {
                followerId: 'user-1',
                followingId: 'user-2',
            },
        });

        expect(creerNotificationMock).toHaveBeenCalledWith(
            'user-2',
            'Alice Follow a commencé à vous suivre.',
            'nouveau_follower'
        );

        expect(result).toEqual({
            followerId: 'user-1',
            followingId: 'user-2',
        });
    });

    it('followUser refuse si utilisateur essaie de se suivre lui-même', async () => {
        await expect(service.followUser('user-1', 'user-1')).rejects.toThrow(
            'Vous ne pouvez pas vous suivre vous-même'
        );

        expect(prismaMock.utilisateur.findUnique).not.toHaveBeenCalled();
        expect(prismaMock.follow.create).not.toHaveBeenCalled();
    });

    it('followUser refuse si utilisateur cible introuvable', async () => {
        prismaMock.utilisateur.findUnique.mockResolvedValue(null);

        await expect(service.followUser('user-1', 'user-2')).rejects.toThrow(
            'Utilisateur non trouvé'
        );

        expect(prismaMock.follow.create).not.toHaveBeenCalled();
        expect(creerNotificationMock).not.toHaveBeenCalled();
    });

    it('followUser refuse si follow existe déjà', async () => {
        prismaMock.utilisateur.findUnique.mockResolvedValue({
            utilisateur_id: 'user-2',
            nom: 'Cible',
            prenom: 'User',
        });

        prismaMock.follow.findUnique.mockResolvedValue({
            followerId: 'user-1',
            followingId: 'user-2',
        });

        await expect(service.followUser('user-1', 'user-2')).rejects.toThrow(
            'Vous suivez déjà cet utilisateur'
        );

        expect(prismaMock.follow.create).not.toHaveBeenCalled();
        expect(creerNotificationMock).not.toHaveBeenCalled();
    });

    it('unfollowUser supprime le follow existant', async () => {
        prismaMock.follow.findUnique.mockResolvedValue({
            followerId: 'user-1',
            followingId: 'user-2',
        });

        await service.unfollowUser('user-1', 'user-2');

        expect(prismaMock.follow.delete).toHaveBeenCalledWith({
            where: {
                followerId_followingId: {
                    followerId: 'user-1',
                    followingId: 'user-2',
                },
            },
        });
    });

    it('unfollowUser refuse si follow inexistant', async () => {
        prismaMock.follow.findUnique.mockResolvedValue(null);

        await expect(service.unfollowUser('user-1', 'user-2')).rejects.toThrow(
            'Vous ne suivez pas cet utilisateur'
        );

        expect(prismaMock.follow.delete).not.toHaveBeenCalled();
    });

    it('getFollowers retourne les followers avec isFollowing', async () => {
        const date = new Date('2026-06-09T10:00:00.000Z');

        prismaMock.follow.findMany.mockResolvedValue([
            {
                createdAt: date,
                follower: {
                    utilisateur_id: 'user-3',
                    nom: 'Follower',
                    prenom: 'Sara',
                    role: 'etudiant',
                    photo: 'photo.png',
                },
            },
        ]);

        prismaMock.follow.findUnique.mockResolvedValue({
            followerId: 'caller-1',
            followingId: 'user-3',
        });

        const result = await service.getFollowers('user-2', 'caller-1');

        expect(prismaMock.follow.findMany).toHaveBeenCalledWith({
            where: { followingId: 'user-2' },
            orderBy: { createdAt: 'desc' },
            select: {
                createdAt: true,
                follower: {
                    select: {
                        utilisateur_id: true,
                        nom: true,
                        prenom: true,
                        role: true,
                        photo: true,
                    },
                },
            },
        });

        expect(result).toEqual([
            {
                utilisateur_id: 'user-3',
                nom: 'Follower',
                prenom: 'Sara',
                role: 'etudiant',
                photo: 'photo.png',
                followedAt: date,
                isFollowing: true,
            },
        ]);
    });

    it('getFollowing retourne les utilisateurs suivis avec isFollowing false', async () => {
        const date = new Date('2026-06-09T11:00:00.000Z');

        prismaMock.follow.findMany.mockResolvedValue([
            {
                createdAt: date,
                following: {
                    utilisateur_id: 'user-4',
                    nom: 'Target',
                    prenom: 'Yassine',
                    role: 'professeur',
                    photo: null,
                },
            },
        ]);

        prismaMock.follow.findUnique.mockResolvedValue(null);

        const result = await service.getFollowing('user-1', 'caller-1');

        expect(prismaMock.follow.findMany).toHaveBeenCalledWith({
            where: { followerId: 'user-1' },
            orderBy: { createdAt: 'desc' },
            select: {
                createdAt: true,
                following: {
                    select: {
                        utilisateur_id: true,
                        nom: true,
                        prenom: true,
                        role: true,
                        photo: true,
                    },
                },
            },
        });

        expect(result).toEqual([
            {
                utilisateur_id: 'user-4',
                nom: 'Target',
                prenom: 'Yassine',
                role: 'professeur',
                photo: null,
                followedAt: date,
                isFollowing: false,
            },
        ]);
    });
});
