import { describe, it, expect, vi, beforeEach } from 'vitest';

const getDemandesMock = vi.fn();
const getPendingStatsMock = vi.fn();
const getStageByIdMock = vi.fn();
const getProjetByIdMock = vi.fn();
const traiterValidationProjetMock = vi.fn();
const traiterValidationStageProfMock = vi.fn();
const getLettreByIdMock = vi.fn();
const traiterLettreMock = vi.fn();

vi.mock('../../src/services/professeur.service.js', () => ({
    getDemandes: getDemandesMock,
    getPendingStats: getPendingStatsMock,
    getStageById: getStageByIdMock,
    getProjetById: getProjetByIdMock,
    traiterValidationProjet: traiterValidationProjetMock,
    traiterValidationStageProf: traiterValidationStageProfMock,
    getLettreById: getLettreByIdMock,
    traiterLettre: traiterLettreMock,
}));

const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('professeur.controller', () => {
    let controller;

    beforeEach(async () => {
        vi.clearAllMocks();
        controller = await import('../../src/controllers/professeur.controller.js');
    });

    it('listDemandes retourne 400 si type invalide', async () => {
        const req = {
            user: { utilisateur_id: 'prof-1' },
            query: { type: 'bad' },
        };
        const res = mockRes();

        await controller.listDemandes(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('listDemandes retourne 400 si statut invalide', async () => {
        const req = {
            user: { utilisateur_id: 'prof-1' },
            query: { statut: 'bad' },
        };
        const res = mockRes();

        await controller.listDemandes(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('listDemandes retourne les demandes', async () => {
        getDemandesMock.mockResolvedValue({
            data: [{ type: 'stage' }],
            pagination: { page: 1 },
        });
        getPendingStatsMock.mockResolvedValue({
            stagePending: 1,
            projetPending: 0,
            recommandationPending: 0,
        });

        const req = {
            user: { utilisateur_id: 'prof-1' },
            query: { type: 'stage', statut: 'en_attente', page: '1' },
        };
        const res = mockRes();

        await controller.listDemandes(req, res);

        expect(getDemandesMock).toHaveBeenCalledWith('prof-1', {
            type: 'stage',
            statut: 'en_attente',
            page: '1',
        });
        expect(getPendingStatsMock).toHaveBeenCalledWith('prof-1');

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('listDemandes retourne 500 si service echoue', async () => {
        getDemandesMock.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'prof-1' },
            query: {},
        };
        const res = mockRes();

        await controller.listDemandes(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('getStageDetail retourne 200', async () => {
        getStageByIdMock.mockResolvedValue({ experience_id: 'exp-1' });

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
        };
        const res = mockRes();

        await controller.getStageDetail(req, res);

        expect(getStageByIdMock).toHaveBeenCalledWith('prof-1', 'exp-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getStageDetail retourne 404 si stage introuvable', async () => {
        getStageByIdMock.mockRejectedValue(new Error('Stage non trouvé'));

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
        };
        const res = mockRes();

        await controller.getStageDetail(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('getStageDetail retourne 403 si acces refuse', async () => {
        getStageByIdMock.mockRejectedValue(new Error('Accès refusé'));

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
        };
        const res = mockRes();

        await controller.getStageDetail(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    it('getProjetDetail retourne 200', async () => {
        getProjetByIdMock.mockResolvedValue({ experience_id: 'exp-1' });

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
        };
        const res = mockRes();

        await controller.getProjetDetail(req, res);

        expect(getProjetByIdMock).toHaveBeenCalledWith('prof-1', 'exp-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getProjetDetail retourne 404 si projet introuvable', async () => {
        getProjetByIdMock.mockRejectedValue(new Error('Projet non trouvé'));

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
        };
        const res = mockRes();

        await controller.getProjetDetail(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('validerProjet retourne 400 si statut invalide', async () => {
        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
            body: { statut: 'bad' },
        };
        const res = mockRes();

        await controller.validerProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validerProjet retourne 200 si service reussit', async () => {
        traiterValidationProjetMock.mockResolvedValue({ statut: 'valide' });

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
            body: { statut: 'valide', commentaire: 'ok' },
        };
        const res = mockRes();

        await controller.validerProjet(req, res);

        expect(traiterValidationProjetMock).toHaveBeenCalledWith(
            'prof-1',
            'exp-1',
            'valide',
            'ok'
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('validerProjet mappe erreur commentaire requis vers 400', async () => {
        traiterValidationProjetMock.mockRejectedValue(
            new Error('Un commentaire est requis pour un refus')
        );

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
            body: { statut: 'refuse' },
        };
        const res = mockRes();

        await controller.validerProjet(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validerStage retourne 400 si statut invalide', async () => {
        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
            body: { statut: 'bad' },
        };
        const res = mockRes();

        await controller.validerStage(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validerStage retourne 200 si service reussit', async () => {
        traiterValidationStageProfMock.mockResolvedValue({ statut: 'valide' });

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { experienceId: 'exp-1' },
            body: { statut: 'valide', commentaire: 'ok' },
        };
        const res = mockRes();

        await controller.validerStage(req, res);

        expect(traiterValidationStageProfMock).toHaveBeenCalledWith(
            'prof-1',
            'exp-1',
            'valide',
            'ok'
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getLettre retourne 200', async () => {
        getLettreByIdMock.mockResolvedValue({ objet: 'Lettre' });

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { etudiantId: 'etu-1' },
        };
        const res = mockRes();

        await controller.getLettre(req, res);

        expect(getLettreByIdMock).toHaveBeenCalledWith('prof-1', 'etu-1');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('getLettre retourne 404 si demande introuvable', async () => {
        getLettreByIdMock.mockRejectedValue(new Error('Demande non trouvée'));

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { etudiantId: 'etu-1' },
        };
        const res = mockRes();

        await controller.getLettre(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it('traiterDemandeLettre retourne 400 si statut invalide', async () => {
        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { etudiantId: 'etu-1' },
            body: { statut: 'bad' },
        };
        const res = mockRes();

        await controller.traiterDemandeLettre(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('traiterDemandeLettre retourne 200', async () => {
        traiterLettreMock.mockResolvedValue({ statut: 'valide' });

        const file = { buffer: Buffer.from('pdf') };

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { etudiantId: 'etu-1' },
            body: { statut: 'valide', commentaire: 'ok' },
            file,
        };
        const res = mockRes();

        await controller.traiterDemandeLettre(req, res);

        expect(traiterLettreMock).toHaveBeenCalledWith(
            'prof-1',
            'etu-1',
            { statut: 'valide', commentaire: 'ok' },
            file
        );
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('traiterDemandeLettre mappe fichier PDF requis vers 400', async () => {
        traiterLettreMock.mockRejectedValue(
            new Error('Un fichier PDF est requis pour valider')
        );

        const req = {
            user: { utilisateur_id: 'prof-1' },
            params: { etudiantId: 'etu-1' },
            body: { statut: 'valide' },
        };
        const res = mockRes();

        await controller.traiterDemandeLettre(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });
});
