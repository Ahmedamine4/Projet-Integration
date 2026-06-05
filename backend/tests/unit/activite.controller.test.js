import { beforeEach, describe, expect, it, vi } from 'vitest';

const activiteServiceMock = {
  uploadPhoto: vi.fn(),
  creeActivite: vi.fn(),
  getActivitesByEtudiant: vi.fn(),
  editActivite: vi.fn(),
  updateVisibiliteActiviteService: vi.fn(),
};

vi.mock('../../src/services/activite.service.js', () => activiteServiceMock);

const controller = await import('../../src/controllers/activite.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('activite.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addActivite retourne 400 si des champs obligatoires manquent', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: { titre: 'Club' },
    };
    const res = createRes();

    await controller.addActivite(req, res);

    expect(activiteServiceMock.creeActivite).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addActivite upload la photo puis appelle creeActivite', async () => {
    activiteServiceMock.uploadPhoto.mockResolvedValue(
      'https://cdn.example.com/activites/photo.png'
    );
    activiteServiceMock.creeActivite.mockResolvedValue({ experience_id: 'exp-1' });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Club',
        date_experience: '2026-05-09',
        description: 'Description',
      },
      file: {
        originalname: 'photo.png',
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
      },
    };
    const res = createRes();

    await controller.addActivite(req, res);

    expect(activiteServiceMock.creeActivite).toHaveBeenCalledWith(
      'etu-1',
      req.body,
      'https://cdn.example.com/activites/photo.png'
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('getMesActivites retourne la liste des activites', async () => {
    activiteServiceMock.getActivitesByEtudiant.mockResolvedValue([
      { experience_id: 'exp-1' },
    ]);

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getMesActivites(req, res);

    expect(activiteServiceMock.getActivitesByEtudiant).toHaveBeenCalledWith(
      'etu-1'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateActivite retourne 404 si l activite est introuvable', async () => {
    activiteServiceMock.editActivite.mockRejectedValue(
      new Error('Activité non trouvée')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: {},
    };
    const res = createRes();

    await controller.updateActivite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updateVisibiliteActivite refuse une visibilite non booleenne', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: 'true' },
    };
    const res = createRes();

    await controller.updateVisibiliteActivite(req, res);

    expect(
      activiteServiceMock.updateVisibiliteActiviteService
    ).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
