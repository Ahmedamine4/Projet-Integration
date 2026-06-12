import { beforeEach, describe, expect, it, vi } from 'vitest';

const adminServicesMock = {
  assignerDirecteur: vi.fn(),
  promouvoirProfessionnel: vi.fn(),
  rejecterProfessionnel: vi.fn(),
};

vi.mock('../../src/services/admin.service.js', () => adminServicesMock);

const controller = await import('../../src/controllers/admin.controllers.js');

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
};

describe('admin controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ajoutDirecteur renvoie la reponse du service sans notification implicite', async () => {
    adminServicesMock.assignerDirecteur.mockResolvedValue({
      message: 'Directeur assigne',
      utilisateur: { utilisateur_id: 'user-1' },
      institution_id: 'inst-1',
    });

    const req = {
      user: { utilisateur_id: 'admin-1' },
      body: {
        utilisateur_id: 'user-1',
        institution_id: 'inst-1',
      },
    };
    const res = createRes();

    await controller.ajoutDirecteur(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Directeur assigne',
      utilisateur: { utilisateur_id: 'user-1' },
      institution_id: 'inst-1',
    });
  });

  it('validerProfessionnel renvoie 200 avec le payload de promotion', async () => {
    adminServicesMock.promouvoirProfessionnel.mockResolvedValue({
      message: 'Professionnel valide',
      utilisateur: { utilisateur_id: 'pro-1' },
      professionnel: { professionnel_utilisateur_id: 'pro-1' },
    });

    const req = {
      user: { utilisateur_id: 'admin-1' },
      params: { id: 'pro-1' },
    };
    const res = createRes();

    await controller.validerProfessionnel(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
