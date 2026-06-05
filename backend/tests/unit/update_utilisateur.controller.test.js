import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  updateNom: vi.fn(),
  updatePrenom: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
};

vi.mock('../../src/services/update_utilisateur.service.js', () => serviceMock);

const controller = await import('../../src/controllers/update_utilisateur.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('update_utilisateur.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne 400 si l'id utilisateur est invalide", async () => {
    const req = { params: { userId: ':userId' }, body: {} };
    const res = createRes();

    await controller.updatePersonalInformationsController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "ID utilisateur invalide dans l'URL",
    });
  });

  it('met a jour le nom et retourne 200', async () => {
    serviceMock.updateNom.mockResolvedValue({ utilisateur_id: 'u1', nom: 'Nouveau' });

    const req = { params: { userId: 'u1' }, body: { nom: 'Nouveau' } };
    const res = createRes();

    await controller.updatePersonalInformationsController(req, res);

    expect(serviceMock.updateNom).toHaveBeenCalledWith('u1', 'Nouveau');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('retourne 500 si le service echoue', async () => {
    serviceMock.updateEmail.mockRejectedValue(new Error('email error'));

    const req = { params: { userId: 'u1' }, body: { email: 'x@example.com' } };
    const res = createRes();

    await controller.updatePersonalInformationsController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'email error' });
  });
});
