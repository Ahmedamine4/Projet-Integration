import { describe, it, expect, vi, beforeEach } from 'vitest';

const creerDemandeRecommandationMock = vi.fn();
const getMesDemandesRecommandationMock = vi.fn();

vi.mock('../../src/services/lettre_recommandation.service.js', () => ({
    creerDemandeRecommandation: creerDemandeRecommandationMock,
    getMesDemandesRecommandation: getMesDemandesRecommandationMock,
}));

const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('lettre_recommandation.controller', () => {
    let controller;

    beforeEach(async () => {
        vi.clearAllMocks();
        controller = await import('../../src/controllers/lettre_recommandation.controller.js');
    });

    it('demanderRecommandation retourne 400 si email_professeur absent', async () => {
        const req = {
            user: { utilisateur_id: 'etu-1' },
            body: {
                objet: 'Lettre Master',
            },
        };
        const res = mockRes();

        await controller.demanderRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Email du professeur requis',
        });
        expect(creerDemandeRecommandationMock).not.toHaveBeenCalled();
    });

    it('demanderRecommandation retourne 400 si objet absent', async () => {
        const req = {
            user: { utilisateur_id: 'etu-1' },
            body: {
                email_professeur: 'prof@test.com',
            },
        };
        const res = mockRes();

        await controller.demanderRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Objet de la demande requis',
        });
        expect(creerDemandeRecommandationMock).not.toHaveBeenCalled();
    });

    it('demanderRecommandation retourne 201 si demande creee', async () => {
        const demande = {
            lettre_id: 'lettre-1',
            objet: 'Lettre Master',
            statut: 'en_attente',
        };

        creerDemandeRecommandationMock.mockResolvedValue(demande);

        const req = {
            user: { utilisateur_id: 'etu-1' },
            body: {
                objet: 'Lettre Master',
                description: 'Besoin pour candidature',
                email_professeur: 'prof@test.com',
            },
        };
        const res = mockRes();

        await controller.demanderRecommandation(req, res);

        expect(creerDemandeRecommandationMock).toHaveBeenCalledWith('etu-1', req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: demande,
        });
    });

    it('demanderRecommandation retourne 404 si professeur introuvable', async () => {
        creerDemandeRecommandationMock.mockRejectedValue(
            new Error('Professeur non trouvé avec cet email')
        );

        const req = {
            user: { utilisateur_id: 'etu-1' },
            body: {
                objet: 'Lettre Master',
                email_professeur: 'prof@test.com',
            },
        };
        const res = mockRes();

        await controller.demanderRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Professeur non trouvé avec cet email',
        });
    });

    it('demanderRecommandation retourne 500 sur erreur inconnue', async () => {
        creerDemandeRecommandationMock.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'etu-1' },
            body: {
                objet: 'Lettre Master',
                email_professeur: 'prof@test.com',
            },
        };
        const res = mockRes();

        await controller.demanderRecommandation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Erreur serveur',
        });
    });

    it('getMesRecommandations retourne les demandes de etudiant', async () => {
        const demandes = [
            {
                lettre_id: 'lettre-1',
                objet: 'Lettre Master',
            },
        ];

        getMesDemandesRecommandationMock.mockResolvedValue(demandes);

        const req = {
            user: { utilisateur_id: 'etu-1' },
        };
        const res = mockRes();

        await controller.getMesRecommandations(req, res);

        expect(getMesDemandesRecommandationMock).toHaveBeenCalledWith('etu-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: demandes,
        });
    });

    it('getMesRecommandations retourne 500 si service echoue', async () => {
        getMesDemandesRecommandationMock.mockRejectedValue(new Error('boom'));

        const req = {
            user: { utilisateur_id: 'etu-1' },
        };
        const res = mockRes();

        await controller.getMesRecommandations(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            message: 'Erreur serveur',
        });
    });
});