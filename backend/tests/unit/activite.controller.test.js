import { beforeEach, describe, expect, it, vi } from 'vitest';

const activiteServiceMock = {
  creeActivite: vi.fn(),
  getActivitesByEtudiant: vi.fn(),
  editActivite: vi.fn(),
  supprimerActiviteService: vi.fn(),
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

  it('addActivite retourne 400 si champs obligatoires manquants', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: { titre: 'Club' },
    };
    const res = createRes();

    await controller.addActivite(req, res);

    expect(activiteServiceMock.creeActivite).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addActivite retourne 400 si activité académique sans institution', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Club',
        description: 'Description',
        date_experience: '2026-05-09',
        is_academique: 'true',
      },
    };
    const res = createRes();

    await controller.addActivite(req, res);

    expect(activiteServiceMock.creeActivite).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addActivite crée une activité avec req.file', async () => {
    activiteServiceMock.creeActivite.mockResolvedValue({
      experience_id: 'exp-1',
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Club',
        description: 'Description',
        date_experience: '2026-05-09',
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
      req.file
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('addActivite retourne 409 si activité déjà existante', async () => {
    activiteServiceMock.creeActivite.mockRejectedValue(
      new Error('Activité déjà existante')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Club',
        description: 'Description',
        date_experience: '2026-05-09',
      },
    };
    const res = createRes();

    await controller.addActivite(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('getActivites retourne les activités', async () => {
    activiteServiceMock.getActivitesByEtudiant.mockResolvedValue([
      { experience_id: 'exp-1' },
    ]);

    const req = {
      user: { utilisateur_id: 'etu-1' },
    };
    const res = createRes();

    await controller.getActivites(req, res);

    expect(activiteServiceMock.getActivitesByEtudiant).toHaveBeenCalledWith('etu-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateActivite modifie une activité', async () => {
    activiteServiceMock.editActivite.mockResolvedValue({
      experience_id: 'exp-1',
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { titre: 'Nouveau titre' },
      file: null,
    };
    const res = createRes();

    await controller.updateActivite(req, res);

    expect(activiteServiceMock.editActivite).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      req.body,
      null
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateActivite retourne 404 si activité non trouvée', async () => {
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

  it('deleteActivite supprime une activité', async () => {
    activiteServiceMock.supprimerActiviteService.mockResolvedValue();

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
    };
    const res = createRes();

    await controller.deleteActivite(req, res);

    expect(activiteServiceMock.supprimerActiviteService).toHaveBeenCalledWith(
      'etu-1',
      'exp-1'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deleteActivite retourne 403 si activité déjà traitée', async () => {
    activiteServiceMock.supprimerActiviteService.mockRejectedValue(
      new Error("Cette activité a déjà été traitée par l'institution, vous ne pouvez plus la supprimer")
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
    };
    const res = createRes();

    await controller.deleteActivite(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('updateVisibiliteActivite retourne 400 si visibilite n’est pas boolean', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: 'true' },
    };
    const res = createRes();

    await controller.updateVisibiliteActivite(req, res);

    expect(activiteServiceMock.updateVisibiliteActiviteService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateVisibiliteActivite change la visibilité', async () => {
    activiteServiceMock.updateVisibiliteActiviteService.mockResolvedValue({
      experience_id: 'exp-1',
      visibilite: true,
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: true },
    };
    const res = createRes();

    await controller.updateVisibiliteActivite(req, res);

    expect(activiteServiceMock.updateVisibiliteActiviteService).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      true
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});