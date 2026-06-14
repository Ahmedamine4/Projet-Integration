import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  creerOffre: vi.fn(),
  getMesOffres: vi.fn(),
  getDemandesPagination: vi.fn(),
  terminerOffre: vi.fn(),
  getTypesOffres: vi.fn(),
};

vi.mock('../../src/services/recruteur.service.js', () => serviceMock);

const controller = await import('../../src/controllers/recruteur.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('recruteur.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createOffreController cree une offre', async () => {
    serviceMock.creerOffre.mockResolvedValue({ offre_id: 'offre-1' });
    const req = { user: { utilisateur_id: 'rec-1' }, body: { titre: 'Stage' } };
    const res = createRes();

    await controller.createOffreController(req, res);

    expect(serviceMock.creerOffre).toHaveBeenCalledWith('rec-1', { titre: 'Stage' });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('getMesOffresController retourne les offres du recruteur', async () => {
    serviceMock.getMesOffres.mockResolvedValue([{ offre_id: 'offre-1' }]);
    const req = { user: { utilisateur_id: 'rec-1' } };
    const res = createRes();

    await controller.getMesOffresController(req, res);

    expect(serviceMock.getMesOffres).toHaveBeenCalledWith('rec-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('terminerOffreController termine une offre', async () => {
    serviceMock.terminerOffre.mockResolvedValue({ success: true });
    const req = { user: { utilisateur_id: 'rec-1' }, params: { offreId: 'offre-1' } };
    const res = createRes();

    await controller.terminerOffreController(req, res);

    expect(serviceMock.terminerOffre).toHaveBeenCalledWith('offre-1', 'rec-1');
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it('getDemandesParOffreController transmet pagination et offreId', async () => {
    serviceMock.getDemandesPagination.mockResolvedValue({ data: [], page: 2 });
    const req = { params: { offreId: 'offre-1' }, query: { page: '2', limit: '5' } };
    const res = createRes();

    await controller.getDemandesParOffreController(req, res);

    expect(serviceMock.getDemandesPagination).toHaveBeenCalledWith(2, 5, 'offre-1');
    expect(res.json).toHaveBeenCalledWith({ data: [], page: 2 });
  });

  it('getTypesOffresController retourne les types d offres', async () => {
    serviceMock.getTypesOffres.mockResolvedValue(['stage', 'emploi']);
    const res = createRes();

    await controller.getTypesOffresController({}, res);

    expect(res.json).toHaveBeenCalledWith(['stage', 'emploi']);
  });

  it('retourne les statuts d erreur attendus quand les services echouent', async () => {
    const res1 = createRes();
    serviceMock.creerOffre.mockRejectedValueOnce(new Error('boom create'));
    await controller.createOffreController({ user: { utilisateur_id: 'rec-1' }, body: {} }, res1);
    expect(res1.status).toHaveBeenCalledWith(500);

    const res2 = createRes();
    serviceMock.terminerOffre.mockRejectedValueOnce(new Error('boom end'));
    await controller.terminerOffreController({ user: { utilisateur_id: 'rec-1' }, params: { offreId: 'o1' } }, res2);
    expect(res2.status).toHaveBeenCalledWith(400);
  });
});
