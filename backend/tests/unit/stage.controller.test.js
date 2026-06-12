import { beforeEach, describe, expect, it, vi } from 'vitest';

const stageServiceMock = {
  creeStage: vi.fn(),
  getStagesByEtudiant: vi.fn(),
  editStage: vi.fn(),
  supprimerStageService: vi.fn(),
  updateVisibiliteStageService: vi.fn(),
};

vi.mock('../../src/services/stage.service.js', () => stageServiceMock);

const controller = await import('../../src/controllers/stage.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('stage.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addStage retourne 400 si champs obligatoires manquants', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: { titre: 'Stage' },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(stageServiceMock.creeStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addStage retourne 400 si date_fin <= date_debut', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage',
        description: 'Desc',
        date_debut: '2026-05-10',
        date_fin: '2026-05-09',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addStage retourne 400 si JSON technologies invalide', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage',
        description: 'Desc',
        date_debut: '2026-05-09',
        date_fin: '2026-06-09',
        technologies: 'bad-json',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addStage retourne 400 si technologies/domaines ne sont pas tableaux', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage',
        description: 'Desc',
        date_debut: '2026-05-09',
        date_fin: '2026-06-09',
        technologies: '{}',
        domaines: '[]',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addStage retourne 400 si academique sans email professeur', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage',
        description: 'Desc',
        date_debut: '2026-05-09',
        date_fin: '2026-06-09',
        technologies: '[]',
        domaines: '[]',
        is_academique: 'true',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addStage cree un stage', async () => {
    stageServiceMock.creeStage.mockResolvedValue({ experience_id: 'exp-1' });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage',
        description: 'Desc',
        date_debut: '2026-05-09',
        date_fin: '2026-06-09',
        technologies: '["Node.js"]',
        domaines: '["Backend"]',
      },
      file: null,
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(stageServiceMock.creeStage).toHaveBeenCalledWith('etu-1', req.body, null);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('addStage expose le bug mapStageErrorStatus manquant sur les erreurs service', async () => {
    stageServiceMock.creeStage.mockRejectedValue(new Error('Stage deja existant'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage',
        description: 'Desc',
        date_debut: '2026-05-09',
        date_fin: '2026-06-09',
        technologies: '[]',
        domaines: '[]',
      },
    };
    const res = createRes();

    await expect(controller.addStage(req, res)).rejects.toThrow(/mapStageErrorStatus/);
  });

  it('getStages retourne les stages', async () => {
    stageServiceMock.getStagesByEtudiant.mockResolvedValue([{ experience_id: 'exp-1' }]);

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getStages(req, res);

    expect(stageServiceMock.getStagesByEtudiant).toHaveBeenCalledWith('etu-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getStages retourne 500 si service echoue', async () => {
    stageServiceMock.getStagesByEtudiant.mockRejectedValue(new Error('boom'));

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getStages(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('updateStage retourne 400 si dates invalides', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: {
        date_debut: '2026-06-10',
        date_fin: '2026-06-09',
      },
    };
    const res = createRes();

    await controller.updateStage(req, res);

    expect(stageServiceMock.editStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateStage modifie un stage', async () => {
    stageServiceMock.editStage.mockResolvedValue({ experience_id: 'exp-1' });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { titre: 'Stage modifie' },
      file: null,
    };
    const res = createRes();

    await controller.updateStage(req, res);

    expect(stageServiceMock.editStage).toHaveBeenCalledWith('etu-1', 'exp-1', req.body, null);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateStage expose le bug mapStageErrorStatus sur stage non trouve', async () => {
    stageServiceMock.editStage.mockRejectedValue(new Error('Stage non trouve'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: {},
    };
    const res = createRes();

    await expect(controller.updateStage(req, res)).rejects.toThrow(/mapStageErrorStatus/);
  });

  it('deleteStage supprime un stage', async () => {
    stageServiceMock.supprimerStageService.mockResolvedValue();

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
    };
    const res = createRes();

    await controller.deleteStage(req, res);

    expect(stageServiceMock.supprimerStageService).toHaveBeenCalledWith('etu-1', 'exp-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deleteStage expose le bug mapStageErrorStatus quand le service rejette', async () => {
    stageServiceMock.supprimerStageService.mockRejectedValue(
      new Error('Ce stage a deja ete traite par le professeur')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
    };
    const res = createRes();

    await expect(controller.deleteStage(req, res)).rejects.toThrow(/mapStageErrorStatus/);
  });

  it('updateVisibiliteStage convertit toute valeur non vraie explicite a false', async () => {
    stageServiceMock.updateVisibiliteStageService.mockResolvedValue({
      experience_id: 'exp-1',
      visibilite: false,
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: 'not-a-bool' },
    };
    const res = createRes();

    await controller.updateVisibiliteStage(req, res);

    expect(stageServiceMock.updateVisibiliteStageService).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      false
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateVisibiliteStage change la visibilite', async () => {
    stageServiceMock.updateVisibiliteStageService.mockResolvedValue({
      experience_id: 'exp-1',
      visibilite: true,
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: true },
    };
    const res = createRes();

    await controller.updateVisibiliteStage(req, res);

    expect(stageServiceMock.updateVisibiliteStageService).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      true
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateVisibiliteStage expose le bug mapStageErrorStatus pour une erreur service', async () => {
    stageServiceMock.updateVisibiliteStageService.mockRejectedValue(
      new Error('visibilite impossible')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: true },
    };
    const res = createRes();

    await expect(controller.updateVisibiliteStage(req, res)).rejects.toThrow(/mapStageErrorStatus/);
  });
});
