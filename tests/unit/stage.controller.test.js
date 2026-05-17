import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  experience: {
    findFirst: vi.fn(),
  },
};

const stageServiceMock = {
  createStage: vi.fn(),
  uploadPhoto: vi.fn(),
  getStagesByEtudiant: vi.fn(),
  updateStage: vi.fn(),
  getDemandesValidationProfesseur: vi.fn(),
  traiterValidationStage: vi.fn(),
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

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

  it('addStage retourne 400 si des champs obligatoires manquent', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage backend',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Champs obligatoires manquants',
    });
  });

  it('addStage retourne 400 si la date de fin est avant ou egale a la date de debut', async () => {
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
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'La date de fin doit être après la date de début',
    });
  });

  it('addStage retourne 400 si technologies ou domaines ne sont pas un JSON valide', async () => {
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
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Format invalide pour les technologies ou domaines',
    });
  });

  it('addStage retourne 400 si technologies ou domaines ne sont pas des tableaux', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'Stage backend',
        description: 'Description',
        date_debut: '2026-05-01',
        date_fin: '2026-05-10',
        technologies: '{"nom":"Node.js"}',
        domaines: '[]',
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Les technologies et domaines doivent être des tableaux',
    });
  });

  it('addStage retourne 409 si un stage avec le meme titre existe deja', async () => {
    stageServiceMock.createStage.mockRejectedValue(
      new Error('Stage déjà existant')
    );

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
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Vous avez déjà un stage avec ce titre',
    });
  });

  it('addStage retourne 400 si le stage academique na pas de professeur', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

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

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Veuillez entrer l'email du professeur",
    });
  });

  it('addStage upload la photo puis cree le stage', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    prismaMock.experience.findFirst.mockResolvedValue(null);
    stageServiceMock.uploadPhoto.mockResolvedValue(
      'https://cdn.example.com/stages/photo.png'
    );
    stageServiceMock.createStage.mockResolvedValue({
      experience: { experience_id: 'exp-2' },
      stage: { experience_id: 'exp-2' },
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
      },
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(stageServiceMock.uploadPhoto).toHaveBeenCalledWith(req.file);
    expect(stageServiceMock.createStage).toHaveBeenCalledWith(
      'etu-1',
      req.body,
      'https://cdn.example.com/stages/photo.png'
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        experience: { experience_id: 'exp-2' },
        stage: { experience_id: 'exp-2' },
      },
    });

    consoleSpy.mockRestore();
  });

  it('addStage retourne 404 si le professeur est introuvable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.experience.findFirst.mockResolvedValue(null);
    stageServiceMock.createStage.mockRejectedValue(
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

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Aucun professeur trouvé avec cet email',
    });

    errorSpy.mockRestore();
  });

  it('addStage retourne 500 pour une erreur inattendue', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    prismaMock.experience.findFirst.mockResolvedValue(null);
    stageServiceMock.createStage.mockRejectedValue(new Error('db error'));

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
    };
    const res = createRes();

    await controller.addStage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });

    errorSpy.mockRestore();
  });

  it('getStages retourne 200 avec les stages de letudiant connecte', async () => {
    stageServiceMock.getStagesByEtudiant.mockResolvedValue([
      { experience_id: 'exp-1', type: 'stage' },
    ]);

    const req = {
      user: { utilisateur_id: 'etu-1' },
    };
    const res = createRes();

    await controller.getStages(req, res);

    expect(stageServiceMock.getStagesByEtudiant).toHaveBeenCalledWith('etu-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ experience_id: 'exp-1', type: 'stage' }],
    });
  });

  it('getStages retourne 500 si le service echoue', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stageServiceMock.getStagesByEtudiant.mockRejectedValue(new Error('db error'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
    };
    const res = createRes();

    await controller.getStages(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });

    errorSpy.mockRestore();
  });

  it('editStage retourne 400 si les dates sont invalides', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: {
        date_debut: '2026-05-10',
        date_fin: '2026-05-10',
      },
    };
    const res = createRes();

    await controller.editStage(req, res);

    expect(stageServiceMock.updateStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'La date de fin doit être après la date de début',
    });
  });

  it('editStage upload la photo puis met a jour le stage', async () => {
    stageServiceMock.uploadPhoto.mockResolvedValue(
      'https://cdn.example.com/stages/updated-photo.png'
    );
    stageServiceMock.updateStage.mockResolvedValue({
      experience_id: 'exp-1',
      stage: { duree: '12' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: {
        titre: 'Stage modifie',
      },
      file: {
        originalname: 'photo.png',
      },
    };
    const res = createRes();

    await controller.editStage(req, res);

    expect(stageServiceMock.uploadPhoto).toHaveBeenCalledWith(req.file);
    expect(stageServiceMock.updateStage).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      req.body,
      'https://cdn.example.com/stages/updated-photo.png'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        experience_id: 'exp-1',
        stage: { duree: '12' },
      },
    });
  });

  it('editStage retourne 404 si le stage est introuvable', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stageServiceMock.updateStage.mockRejectedValue(new Error('Stage non trouvé'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'missing-exp' },
      body: {},
    };
    const res = createRes();

    await controller.editStage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Stage non trouvé',
    });

    errorSpy.mockRestore();
  });

  it('getDemandesValidation retourne 200 avec les demandes du professeur', async () => {
    stageServiceMock.getDemandesValidationProfesseur.mockResolvedValue([
      { experience_id: 'exp-10', statut: 'en_attente' },
    ]);

    const req = {
      user: { utilisateur_id: 'prof-1' },
    };
    const res = createRes();

    await controller.getDemandesValidation(req, res);

    expect(stageServiceMock.getDemandesValidationProfesseur).toHaveBeenCalledWith('prof-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ experience_id: 'exp-10', statut: 'en_attente' }],
    });
  });

  it('traiterValidation retourne 400 si le statut est absent', async () => {
    const req = {
      user: { utilisateur_id: 'prof-1' },
      params: { experienceId: 'exp-1' },
      body: {},
    };
    const res = createRes();

    await controller.traiterValidation(req, res);

    expect(stageServiceMock.traiterValidationStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Le statut est requis',
    });
  });

  it('traiterValidation retourne 400 si le statut est invalide', async () => {
    const req = {
      user: { utilisateur_id: 'prof-1' },
      params: { experienceId: 'exp-1' },
      body: { statut: 'en_attente' },
    };
    const res = createRes();

    await controller.traiterValidation(req, res);

    expect(stageServiceMock.traiterValidationStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Statut invalide. Valeurs acceptées : valide, refuse',
    });
  });

  it('traiterValidation retourne 400 pour un refus sans commentaire', async () => {
    const req = {
      user: { utilisateur_id: 'prof-1' },
      params: { experienceId: 'exp-1' },
      body: { statut: 'refuse', commentaire: '   ' },
    };
    const res = createRes();

    await controller.traiterValidation(req, res);

    expect(stageServiceMock.traiterValidationStage).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Un commentaire est requis pour un refus',
    });
  });

  it('traiterValidation retourne 200 pour une validation acceptee', async () => {
    stageServiceMock.traiterValidationStage.mockResolvedValue({
      experience_id: 'exp-1',
      statut: 'valide',
    });

    const req = {
      user: { utilisateur_id: 'prof-1' },
      params: { experienceId: 'exp-1' },
      body: { statut: 'valide' },
    };
    const res = createRes();

    await controller.traiterValidation(req, res);

    expect(stageServiceMock.traiterValidationStage).toHaveBeenCalledWith(
      'prof-1',
      'exp-1',
      'valide',
      undefined
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        experience_id: 'exp-1',
        statut: 'valide',
      },
    });
  });

  it('traiterValidation retourne 200 pour un refus avec commentaire', async () => {
    stageServiceMock.traiterValidationStage.mockResolvedValue({
      experience_id: 'exp-2',
      statut: 'refuse',
      commentaire: 'Informations insuffisantes',
    });

    const req = {
      user: { utilisateur_id: 'prof-1' },
      params: { experienceId: 'exp-2' },
      body: { statut: 'refuse', commentaire: 'Informations insuffisantes' },
    };
    const res = createRes();

    await controller.traiterValidation(req, res);

    expect(stageServiceMock.traiterValidationStage).toHaveBeenCalledWith(
      'prof-1',
      'exp-2',
      'refuse',
      'Informations insuffisantes'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('traiterValidation retourne 403 si le professeur nest pas concerne', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stageServiceMock.traiterValidationStage.mockRejectedValue(new Error('Accès refusé'));

    const req = {
      user: { utilisateur_id: 'prof-2' },
      params: { experienceId: 'exp-3' },
      body: { statut: 'valide' },
    };
    const res = createRes();

    await controller.traiterValidation(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Accès refusé',
    });

    errorSpy.mockRestore();
  });

  it('traiterValidation retourne 409 si la demande est deja traitee', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    stageServiceMock.traiterValidationStage.mockRejectedValue(
      new Error('Cette demande a déjà été traitée')
    );

    const req = {
      user: { utilisateur_id: 'prof-1' },
      params: { experienceId: 'exp-4' },
      body: { statut: 'valide' },
    };
    const res = createRes();

    await controller.traiterValidation(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Cette demande a déjà été traitée',
    });

    errorSpy.mockRestore();
  });
});
