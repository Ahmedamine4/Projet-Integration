import { beforeEach, describe, expect, it, vi } from 'vitest';

const stageServiceMock = {
  uploadPhoto: vi.fn(),
  creeStage: vi.fn(),
  getStagesByEtudiant: vi.fn(),
  editStage: vi.fn(),
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

  it('retourne 400 si des champs obligatoires manquent', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: { titre: 'Stage backend' },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(stageServiceMock.creeStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retourne 400 si les dates sont invalides', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage backend',
        description: 'Description',
        date_debut: '2026-05-10',
        date_fin: '2026-05-10',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retourne 400 si technologies ou domaines ne sont pas un JSON valide', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage backend',
        description: 'Description',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        technologies: 'pas-json',
        domaines: '[]',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('retourne 400 si le stage academique n a pas de professeur', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage academique',
        description: 'Description',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        technologies: '[]',
        domaines: '[]',
        is_academique: 'true',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(stageServiceMock.creeStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('upload la photo puis appelle creeStage avec le payload reel', async () => {
    stageServiceMock.uploadPhoto.mockResolvedValue('https://cdn.example.com/stages/photo.png');
    stageServiceMock.creeStage.mockResolvedValue({
      experience: { experience_id: 'exp-1' },
      stage: { experience_id: 'exp-1' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage backend',
        description: 'Description',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        technologies: '[]',
        domaines: '[]',
      },
      file: {
        originalname: 'photo.png',
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
      },
    };
    const res = createRes();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await controller.addStage(req, res);

    expect(stageServiceMock.uploadPhoto).toHaveBeenCalledWith(req.file);
    expect(stageServiceMock.creeStage).toHaveBeenCalledWith(
      'etu-1',
      req.body,
      'https://cdn.example.com/stages/photo.png'
    );
    expect(res.status).toHaveBeenCalledWith(201);
    logSpy.mockRestore();
  });

  it('mappe professeur introuvable vers 404', async () => {
    stageServiceMock.creeStage.mockRejectedValue(
      new Error('Professeur non trouvé avec cet email')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage academique',
        description: 'Description',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        technologies: '[]',
        domaines: '[]',
        is_academique: 'true',
        email_professeur: 'missing@example.com',
      },
    };
    const res = createRes();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Aucun professeur trouvé avec cet email',
    });
    errorSpy.mockRestore();
  });

  it('retourne la liste des stages de l etudiant connecte', async () => {
    stageServiceMock.getStagesByEtudiant.mockResolvedValue([{ experience_id: 'exp-1' }]);

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getStages(req, res);

    expect(stageServiceMock.getStagesByEtudiant).toHaveBeenCalledWith('etu-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateStage refuse des dates invalides', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: {
        date_debut: '2026-05-10',
        date_fin: '2026-05-10',
      },
    };
    const res = createRes();

    await controller.updateStage(req, res);

    expect(stageServiceMock.editStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateStage appelle editStage avec la photo uploadee', async () => {
    stageServiceMock.uploadPhoto.mockResolvedValue('https://cdn.example.com/stages/updated.png');
    stageServiceMock.editStage.mockResolvedValue({
      experience_id: 'exp-1',
      stage: { duree: '12' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { titre: 'Stage modifie' },
      file: {
        originalname: 'photo.png',
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
      },
    };
    const res = createRes();

    await controller.updateStage(req, res);

    expect(stageServiceMock.editStage).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      req.body,
      'https://cdn.example.com/stages/updated.png'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateVisibiliteStage refuse une visibilite non booleenne', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: 'true' },
    };
    const res = createRes();

    await controller.updateVisibiliteStage(req, res);

    expect(stageServiceMock.updateVisibiliteStageService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
