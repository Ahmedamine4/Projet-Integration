import { beforeEach, describe, expect, it, vi } from 'vitest';

const etudiantServiceMock = {
    getDashboardEtudiant: vi.fn(),
    getDemandesEtudiant: vi.fn(),
};

vi.mock('../../src/services/etudiant.service.js', () => etudiantServiceMock);

const controller = await import('../../src/controllers/etudiant.controller.js');

function createRes() {
    return {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
}

describe('etudiant.controller', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getDashboard retourne le dashboard étudiant', async () => {
        etudiantServiceMock.getDashboardEtudiant.mockResolvedValue({
            stats: { projets: 2 },
        });

        const req = {
            user: { utilisateur_id: 'etu-1' },
        };
        const res = createRes();

        await controller.getDashboard(req, res);

        expect(etudiantServiceMock.getDashboardEtudiant).toHaveBeenCalledWith('etu-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: { stats: { projets: 2 } },
        });
    });

    it('getDashboard retourne 500 si service échoue', async () => {
        etudiantServiceMock.getDashboardEtudiant.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'etu-1' },
        };
        const res = createRes();

        await controller.getDashboard(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Erreur serveur',
        });
    });

    it('listMesDemandes retourne 400 si type invalide', async () => {
        const req = {
            user: { utilisateur_id: 'etu-1' },
            query: { type: 'bad-type' },
        };
        const res = createRes();

        await controller.listMesDemandes(req, res);

        expect(etudiantServiceMock.getDemandesEtudiant).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('listMesDemandes retourne 400 si statut invalide', async () => {
        const req = {
            user: { utilisateur_id: 'etu-1' },
            query: { statut: 'bad-statut' },
        };
        const res = createRes();

        await controller.listMesDemandes(req, res);

        expect(etudiantServiceMock.getDemandesEtudiant).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('listMesDemandes retourne les demandes avec filtres', async () => {
        etudiantServiceMock.getDemandesEtudiant.mockResolvedValue({
            data: [{ type: 'stage', statut: 'en_attente' }],
            pagination: { page: 1, totalPages: 1, total: 1, pageSize: 10 },
        });

        const req = {
            user: { utilisateur_id: 'etu-1' },
            query: {
                type: 'stage',
                statut: 'en_attente',
                page: '1',
            },
        };
        const res = createRes();

        await controller.listMesDemandes(req, res);

        expect(etudiantServiceMock.getDemandesEtudiant).toHaveBeenCalledWith('etu-1', {
            type: 'stage',
            statut: 'en_attente',
            page: '1',
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: [{ type: 'stage', statut: 'en_attente' }],
            pagination: { page: 1, totalPages: 1, total: 1, pageSize: 10 },
        });
    });

    it('listMesDemandes retourne 500 si service échoue', async () => {
        etudiantServiceMock.getDemandesEtudiant.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'etu-1' },
            query: {},
        };
        const res = createRes();

        await controller.listMesDemandes(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Erreur serveur',
        });
    });
});