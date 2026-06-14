import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  getDashboardStats: vi.fn(),
  getInstitutionMembers: vi.fn(),
  getPendingRequests: vi.fn(),
  createInstitutionProfessor: vi.fn(),
  traiterDemandeInscription: vi.fn(),
  traiterDemandeActivite: vi.fn(),
};

vi.mock('../../src/services/directeur.service.js', () => serviceMock);

const controller = await import('../../src/controllers/directeur.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('directeur.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getStats retourne les stats du directeur', async () => {
    serviceMock.getDashboardStats.mockResolvedValue({ total: 3 });
    const req = { user: { utilisateur_id: 'dir-1' } };
    const res = createRes();

    await controller.getStats(req, res);

    expect(serviceMock.getDashboardStats).toHaveBeenCalledWith('dir-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getMembers transmet page et type au service', async () => {
    serviceMock.getInstitutionMembers.mockResolvedValue({ items: [] });
    const req = {
      user: { utilisateur_id: 'dir-1' },
      query: { page: '2', type: 'professeur' },
    };
    const res = createRes();

    await controller.getMembers(req, res);

    expect(serviceMock.getInstitutionMembers).toHaveBeenCalledWith('dir-1', 2, 'professeur');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getRequests retourne 400 si le service echoue', async () => {
    serviceMock.getPendingRequests.mockRejectedValue(new Error('boom'));
    const req = { user: { utilisateur_id: 'dir-1' }, query: {} };
    const res = createRes();

    await controller.getRequests(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addProfessor cree un professeur via le service', async () => {
    serviceMock.createInstitutionProfessor.mockResolvedValue({ emailSent: true, professeur: { id: 'p1' } });
    const req = { user: { utilisateur_id: 'dir-1' }, body: { email: 'prof@test.com' } };
    const res = createRes();

    await controller.addProfessor(req, res);

    expect(serviceMock.createInstitutionProfessor).toHaveBeenCalledWith({
      directeurId: 'dir-1',
      email: 'prof@test.com',
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('traiterInscription valide les champs obligatoires', async () => {
    const res = createRes();

    await controller.traiterInscription({ body: {}, user: { utilisateur_id: 'dir-1' } }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(serviceMock.traiterDemandeInscription).not.toHaveBeenCalled();
  });

  it('traiterActivite traite une demande activite', async () => {
    serviceMock.traiterDemandeActivite.mockResolvedValue({ statut: 'valide' });
    const req = {
      body: { experienceId: 'exp-1', statut: 'valide' },
      user: { utilisateur_id: 'dir-1' },
    };
    const res = createRes();

    await controller.traiterActivite(req, res);

    expect(serviceMock.traiterDemandeActivite).toHaveBeenCalledWith('dir-1', 'exp-1', 'valide');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
