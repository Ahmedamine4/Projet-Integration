import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
    connexion: {
        findUnique: vi.fn(),
    },
};

const getSessionsActivesMock = vi.fn();
const getAllSessionsMock = vi.fn();
const fermerSessionMock = vi.fn();
const fermerAutresSessionsMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
    default: prismaMock,
}));

vi.mock('../../src/services/session.service.js', () => ({
    getSessionsActives: getSessionsActivesMock,
    getAllSessions: getAllSessionsMock,
    fermerSession: fermerSessionMock,
    fermerAutresSessions: fermerAutresSessionsMock,
}));

const controller = await import('../../src/controllers/session.controller.js');

function createRes() {
    const res = {};
    res.status = vi.fn(() => res);
    res.json = vi.fn(() => res);
    return res;
}

describe('session.controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getMesSessions retourne les sessions sans exposer session_token', async () => {
        const req = {
            user: { utilisateur_id: 'user-1' },
            cookies: { sessionToken: 'current-token' },
        };
        const res = createRes();

        getSessionsActivesMock.mockResolvedValue([
            {
                connexion_id: 'conn-1',
                utilisateur_id: 'user-1',
                session_token: 'current-token',
            },
            {
                connexion_id: 'conn-2',
                utilisateur_id: 'user-1',
                session_token: 'old-token',
            },
        ]);

        await controller.getMesSessions(req, res);

        expect(getSessionsActivesMock).toHaveBeenCalledWith('user-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [
                {
                    connexion_id: 'conn-1',
                    utilisateur_id: 'user-1',
                    session_token: undefined,
                    is_current: true,
                },
                {
                    connexion_id: 'conn-2',
                    utilisateur_id: 'user-1',
                    session_token: undefined,
                    is_current: false,
                },
            ],
        });
    });

    it('logoutSession refuse de fermer la session courante', async () => {
        const req = {
            params: { sessionId: 'conn-1' },
            user: { utilisateur_id: 'user-1' },
            cookies: { sessionToken: 'current-token' },
        };
        const res = createRes();

        prismaMock.connexion.findUnique.mockResolvedValue({
            connexion_id: 'conn-1',
            utilisateur_id: 'user-1',
            session_token: 'current-token',
        });

        await controller.logoutSession(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Utilisez /logout pour fermer la session courante',
        });
    });

    it('logoutSession ferme une session non courante', async () => {
        const req = {
            params: { sessionId: 'conn-1' },
            user: { utilisateur_id: 'user-1' },
            cookies: { sessionToken: 'current-token' },
        };
        const res = createRes();

        prismaMock.connexion.findUnique.mockResolvedValue({
            connexion_id: 'conn-1',
            utilisateur_id: 'user-1',
            session_token: 'old-token',
        });

        fermerSessionMock.mockResolvedValue({});

        await controller.logoutSession(req, res);

        expect(fermerSessionMock).toHaveBeenCalledWith('old-token');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Session fermée',
        });
    });

    it('getAdminSessions passe page et limit au service', async () => {
        const req = {
            query: {
                page: '2',
                limit: '10',
            },
        };
        const res = createRes();

        getAllSessionsMock.mockResolvedValue({
            sessions: [{ connexion_id: 'conn-1' }],
            total: 15,
            page: 2,
            limit: 10,
        });

        await controller.getAdminSessions(req, res);

        expect(getAllSessionsMock).toHaveBeenCalledWith({
            page: 2,
            limit: 10,
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('logoutAutresSessions ferme les sessions sauf la courante', async () => {
        const req = {
            user: { utilisateur_id: 'user-1' },
            cookies: { sessionToken: 'current-token' },
        };
        const res = createRes();

        fermerAutresSessionsMock.mockResolvedValue({ count: 2 });

        await controller.logoutAutresSessions(req, res);

        expect(fermerAutresSessionsMock).toHaveBeenCalledWith('user-1', 'current-token');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('logoutSession retourne 403 si la session appartient a un autre utilisateur', async () => {
        const req = {
            params: { sessionId: 'conn-1' },
            user: { utilisateur_id: 'user-1' },
            cookies: { sessionToken: 'current-token' },
        };
        const res = createRes();

        prismaMock.connexion.findUnique.mockResolvedValue({
            connexion_id: 'conn-1',
            utilisateur_id: 'user-2',
            session_token: 'old-token',
        });

        await controller.logoutSession(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});
