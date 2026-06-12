import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  updateNom: vi.fn(),
  updatePrenom: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  createProfessionnelProfile: vi.fn(),
  deleteUserAccount: vi.fn(),
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

  it('met a jour prenom, email et mot de passe quand ils sont fournis', async () => {
    serviceMock.updatePrenom.mockResolvedValue({ prenom: 'Nouveau' });
    serviceMock.updateEmail.mockResolvedValue({ email: 'new@example.com' });
    serviceMock.updatePassword.mockResolvedValue({ ok: true });

    const req = {
      params: { userId: 'u1' },
      body: {
        prenom: 'Nouveau',
        email: 'new@example.com',
        current_password: 'old',
        new_password: 'new-pass',
      },
    };
    const res = createRes();

    await controller.updatePersonalInformationsController(req, res);

    expect(serviceMock.updatePrenom).toHaveBeenCalledWith('u1', 'Nouveau');
    expect(serviceMock.updateEmail).toHaveBeenCalledWith('u1', 'new@example.com');
    expect(serviceMock.updatePassword).toHaveBeenCalledWith('u1', 'old', 'new-pass');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('requestProfessionnelStatusController valide les champs requis', async () => {
    const res = createRes();

    await controller.requestProfessionnelStatusController({
      user: { utilisateur_id: 'u1' },
      body: { entreprise: '', poste: '', email_professionnel: '' },
    }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(serviceMock.createProfessionnelProfile).not.toHaveBeenCalled();
  });

  it('requestProfessionnelStatusController cree le profil professionnel', async () => {
    serviceMock.createProfessionnelProfile.mockResolvedValue({ professionnel_id: 'pro-1' });
    const res = createRes();

    await controller.requestProfessionnelStatusController({
      user: { utilisateur_id: 'u1' },
      body: {
        entreprise: 'OpenAI',
        poste: 'Engineer',
        email_professionnel: 'pro@test.com',
      },
    }, res);

    expect(serviceMock.createProfessionnelProfile).toHaveBeenCalledWith('u1', {
      entreprise: 'OpenAI',
      poste: 'Engineer',
      email_professionnel: 'pro@test.com',
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('deleteAccountController valide le mot de passe puis supprime le compte', async () => {
    const res1 = createRes();
    await controller.deleteAccountController({
      user: { utilisateur_id: 'u1' },
      body: {},
    }, res1);
    expect(res1.status).toHaveBeenCalledWith(400);

    serviceMock.deleteUserAccount.mockResolvedValue(undefined);
    const res2 = createRes();
    await controller.deleteAccountController({
      user: { utilisateur_id: 'u1' },
      body: { password: 'secret' },
    }, res2);

    expect(serviceMock.deleteUserAccount).toHaveBeenCalledWith('u1', 'secret');
    expect(res2.status).toHaveBeenCalledWith(200);
  });
});
