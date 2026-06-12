import { describe, it, expect, vi, beforeEach } from 'vitest';

const assignerDirecteurMock = vi.fn();
const promouvoirProfessionnelMock = vi.fn();
const rejecterProfessionnelMock = vi.fn();
const bloquerUtilisateurMock = vi.fn();
const debloquerUtilisateurMock = vi.fn();
const getProfessionnelsEnAttenteMock = vi.fn();
const getAdminInstitutionsMock = vi.fn();
const creerInstitutionAvecDirecteurMock = vi.fn();
const rechercherUtilisateursParEmailMock = vi.fn();

vi.mock('../../src/services/admin.service.js', () => ({
    assignerDirecteur: assignerDirecteurMock,
    promouvoirProfessionnel: promouvoirProfessionnelMock,
    rejecterProfessionnel: rejecterProfessionnelMock,
    bloquerUtilisateur: bloquerUtilisateurMock,
    debloquerUtilisateur: debloquerUtilisateurMock,
    getProfessionnelsEnAttente: getProfessionnelsEnAttenteMock,
    getAdminInstitutions: getAdminInstitutionsMock,
    creerInstitutionAvecDirecteur: creerInstitutionAvecDirecteurMock,
    rechercherUtilisateursParEmail: rechercherUtilisateursParEmailMock,
}));

const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('admin.controllers', () => {
  let controller;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    controller = await import('../../src/controllers/admin.controllers.js');
  });

    it('ajoutDirecteur retourne 400 si utilisateur_id ou institution_id manquant', async () => {
        const req = {
            body: {
                utilisateur_id: '',
                institution_id: 'inst-1',
            },
        };
        const res = mockRes();

        await controller.ajoutDirecteur(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(assignerDirecteurMock).not.toHaveBeenCalled();
    });

    it('ajoutDirecteur assigne un directeur', async () => {
        assignerDirecteurMock.mockResolvedValue({
            message: 'Directeur assigné',
            utilisateur: { utilisateur_id: 'u1' },
            institution_id: 'inst-1',
        });

        const req = {
            body: {
                utilisateur_id: 'u1',
                institution_id: 'inst-1',
                poste: 'Directeur',
                bureau: 'B12',
            },
        };
        const res = mockRes();

        await controller.ajoutDirecteur(req, res);

        expect(assignerDirecteurMock).toHaveBeenCalledWith({
            utilisateur_id: 'u1',
            institution_id: 'inst-1',
            poste: 'Directeur',
            bureau: 'B12',
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('ajoutDirecteur retourne 400 si service echoue', async () => {
        assignerDirecteurMock.mockRejectedValue(new Error('Institution introuvable'));

        const req = {
            body: {
                utilisateur_id: 'u1',
                institution_id: 'inst-1',
            },
        };
        const res = mockRes();

        await controller.ajoutDirecteur(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('validerProfessionnel valide un professionnel', async () => {
        promouvoirProfessionnelMock.mockResolvedValue({
            message: 'Professionnel validé',
            utilisateur: { utilisateur_id: 'u1' },
            professionnel: { professionnel_id: 'p1' },
        });

        const req = {
            params: { id: 'u1' },
            user: { utilisateur_id: 'admin-1' },
        };
        const res = mockRes();

        await controller.validerProfessionnel(req, res);

        expect(promouvoirProfessionnelMock).toHaveBeenCalledWith({
            utilisateur_id: 'u1',
            admin_id: 'admin-1',
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('validerProfessionnel retourne 400 si service echoue', async () => {
        promouvoirProfessionnelMock.mockRejectedValue(new Error('Utilisateur introuvable'));

        const req = {
            params: { id: 'u1' },
            user: { utilisateur_id: 'admin-1' },
        };
        const res = mockRes();

        await controller.validerProfessionnel(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('refuserProfessionnel refuse un professionnel', async () => {
        rejecterProfessionnelMock.mockResolvedValue({
            message: 'Professionnel refusé',
            utilisateur: { utilisateur_id: 'u1' },
            professionnel: { professionnel_id: 'p1' },
        });

        const req = {
            params: { id: 'u1' },
            user: { utilisateur_id: 'admin-1' },
        };
        const res = mockRes();

        await controller.refuserProfessionnel(req, res);

        expect(rejecterProfessionnelMock).toHaveBeenCalledWith({
            utilisateur_id: 'u1',
            admin_id: 'admin-1',
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('refuserProfessionnel retourne 400 si service echoue', async () => {
        rejecterProfessionnelMock.mockRejectedValue(new Error('Erreur refus'));

        const req = {
            params: { id: 'u1' },
            user: { utilisateur_id: 'admin-1' },
        };
        const res = mockRes();

        await controller.refuserProfessionnel(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('bloquerUtilisateurController bloque un utilisateur', async () => {
        bloquerUtilisateurMock.mockResolvedValue({
            message: 'Utilisateur bloqué',
            utilisateur: { utilisateur_id: 'u1' },
        });

        const req = {
            params: { id: 'u1' },
        };
        const res = mockRes();

        await controller.bloquerUtilisateurController(req, res);

        expect(bloquerUtilisateurMock).toHaveBeenCalledWith({
            utilisateur_id: 'u1',
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('bloquerUtilisateurController retourne 400 si service echoue', async () => {
        bloquerUtilisateurMock.mockRejectedValue(new Error('Compte introuvable'));

        const req = {
            params: { id: 'u1' },
        };
        const res = mockRes();

        await controller.bloquerUtilisateurController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('debloquerUtilisateurController debloque un utilisateur', async () => {
        debloquerUtilisateurMock.mockResolvedValue({
            message: 'Utilisateur débloqué',
            utilisateur: { utilisateur_id: 'u1' },
        });

        const req = {
            params: { id: 'u1' },
        };
        const res = mockRes();

        await controller.debloquerUtilisateurController(req, res);

        expect(debloquerUtilisateurMock).toHaveBeenCalledWith({
            utilisateur_id: 'u1',
        });

        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('debloquerUtilisateurController retourne 400 si service echoue', async () => {
        debloquerUtilisateurMock.mockRejectedValue(new Error('Compte introuvable'));

        const req = {
            params: { id: 'u1' },
        };
        const res = mockRes();

        await controller.debloquerUtilisateurController(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('listProfessionnelsEnAttente retourne la liste', async () => {
        getProfessionnelsEnAttenteMock.mockResolvedValue([
            { utilisateur_id: 'u1', role: 'professionnel' },
        ]);

        const req = {};
        const res = mockRes();

        await controller.listProfessionnelsEnAttente(req, res);

        expect(getProfessionnelsEnAttenteMock).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            professionnels: [{ utilisateur_id: 'u1', role: 'professionnel' }],
        });
    });

    it('listProfessionnelsEnAttente retourne 500 si service echoue', async () => {
        getProfessionnelsEnAttenteMock.mockRejectedValue(new Error('Erreur DB'));

        const req = {};
        const res = mockRes();

        await controller.listProfessionnelsEnAttente(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('listAdminInstitutions retourne les institutions admin', async () => {
        getAdminInstitutionsMock.mockResolvedValue([{ institution_id: 'inst-1' }]);
        const res = mockRes();

        await controller.listAdminInstitutions({}, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            institutions: [{ institution_id: 'inst-1' }],
        });
    });

    it('createAdminInstitution cree une institution avec directeur', async () => {
        creerInstitutionAvecDirecteurMock.mockResolvedValue({
            message: 'Institution creee',
            institution: { institution_id: 'inst-1' },
            directeur: { utilisateur_id: 'dir-1' },
        });
        const req = { body: { nom: 'ENSA', email_directeur: 'dir@test.com' } };
        const res = mockRes();

        await controller.createAdminInstitution(req, res);

        expect(creerInstitutionAvecDirecteurMock).toHaveBeenCalledWith({
            nom: 'ENSA',
            email_directeur: 'dir@test.com',
        });
        expect(res.status).toHaveBeenCalledWith(201);
    });

    it('rechercherUtilisateursController recherche par email', async () => {
        rechercherUtilisateursParEmailMock.mockResolvedValue([{ email: 'a@test.com' }]);
        const req = { query: { email: 'a@test.com' } };
        const res = mockRes();

        await controller.rechercherUtilisateursController(req, res);

        expect(rechercherUtilisateursParEmailMock).toHaveBeenCalledWith('a@test.com');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('promouvoirUtilisateurProController promeut un utilisateur en professionnel', async () => {
        promouvoirProfessionnelMock.mockResolvedValue({
            message: 'Professionnel validÃ©',
            utilisateur: { utilisateur_id: 'u1' },
            professionnel: { professionnel_id: 'p1' },
        });
        const req = {
            params: { id: 'u1' },
            user: { utilisateur_id: 'admin-1' },
        };
        const res = mockRes();

        await controller.promouvoirUtilisateurProController(req, res);

        expect(promouvoirProfessionnelMock).toHaveBeenCalledWith({
            utilisateur_id: 'u1',
            admin_id: 'admin-1',
        });
        expect(res.status).toHaveBeenCalledWith(200);
    });
});
