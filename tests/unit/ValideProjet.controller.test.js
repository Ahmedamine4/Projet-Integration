import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  validerProjetService: vi.fn(),
};

vi.mock('../../src/services/ValideProjet.service.js', () => serviceMock);

const controller = await import('../../src/controllers/ValideProjet.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('ValideProjet.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 200 si la validation reussit', async () => {
    serviceMock.validerProjetService.mockResolvedValue({ statut: 'valide' });
    const req = {
      params: { id: 'exp-1' },
      user: { utilisateur_id: 'prof-1' },
      body: { statut: 'valide', commentaireProf: 'OK' },
    };
    const res = createRes();

    await controller.validerProjet(req, res);

    expect(serviceMock.validerProjetService).toHaveBeenCalledWith({
      experience_id: 'exp-1',
      utilisateur_id: 'prof-1',
      statut: 'valide',
      commentaireProf: 'OK',
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('retourne 404 si le projet est introuvable', async () => {
    serviceMock.validerProjetService.mockRejectedValue(new Error('PROJET_INTROUVABLE'));
    const req = {
      params: { id: 'exp-404' },
      user: { utilisateur_id: 'prof-1' },
      body: {},
    };
    const res = createRes();

    await controller.validerProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});
