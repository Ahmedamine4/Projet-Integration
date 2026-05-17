import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  getPendingValidations: vi.fn(),
  updateValidationStatus: vi.fn(),
};

vi.mock('../../src/services/validation_etudiant.service.js', () => serviceMock);

const controller = await import('../../src/controllers/validation_etudiant.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('validation_etudiant.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listPendingController retourne 200 avec la liste', async () => {
    serviceMock.getPendingValidations.mockResolvedValue([{ utilisateur_id: 'u1' }]);
    const req = { params: { institutionId: 'inst-1' } };
    const res = createRes();

    await controller.listPendingController(req, res);

    expect(serviceMock.getPendingValidations).toHaveBeenCalledWith('inst-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ utilisateur_id: 'u1' }]);
  });

  it('validateStudentController retourne 400 si le statut est invalide', async () => {
    const req = {
      params: { etudiantId: 'u1', institutionId: 'inst-1' },
      body: { status: 'en_attente' },
    };
    const res = createRes();

    await controller.validateStudentController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('validateStudentController retourne 200 si la mise a jour reussit', async () => {
    serviceMock.updateValidationStatus.mockResolvedValue({ statut: 'refuse' });
    const req = {
      params: { etudiantId: 'u1', institutionId: 'inst-1' },
      body: { status: 'refuse' },
    };
    const res = createRes();

    await controller.validateStudentController(req, res);

    expect(serviceMock.updateValidationStatus).toHaveBeenCalledWith('u1', 'inst-1', 'refuse');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
