import { beforeEach, describe, expect, it, vi } from 'vitest';

const activiteServiceMock = {
  createActivite: vi.fn(),
  getMesActivitesService: vi.fn(),
  getPortfolioPublicActivitiesService: vi.fn(),
  updateValidationActiviteService: vi.fn(),
};

const bucketMock = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
};

const supabaseMock = {
  storage: {
    from: vi.fn(() => bucketMock),
  },
};

vi.mock('../../src/services/activite.service.js', () => ({
  createActivite: activiteServiceMock.createActivite,
  getMesActivitesService: activiteServiceMock.getMesActivitesService,
  getPortfolioPublicActivitiesService:
    activiteServiceMock.getPortfolioPublicActivitiesService,
  updateValidationActiviteService:
    activiteServiceMock.updateValidationActiviteService,
}));

vi.mock('../../src/config/supabase.js', () => ({
  supabase: supabaseMock,
}));

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
    supabaseMock.storage.from.mockReturnValue(bucketMock);
  });

  it('createActivite retourne 201 si le service reussit', async () => {
    activiteServiceMock.createActivite.mockResolvedValue({
      experience_id: 'exp-1',
    });

    const req = {
      body: {
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
      },
      user: { utilisateur_id: 'etu-1', role: 'etudiant' },
    };
    const res = createRes();

    await controller.createActivite(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { experience_id: 'exp-1' },
    });
  });

  it('createActivite appelle le service avec data normalisee et req.user', async () => {
    activiteServiceMock.createActivite.mockResolvedValue({
      experience_id: 'exp-1',
    });

    const req = {
      body: {
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
        competences: '["Node.js"]',
        documentations: '[{"pdf":"doc.pdf"}]',
      },
      user: { utilisateur_id: 'etu-1', role: 'etudiant' },
    };
    const res = createRes();

    await controller.createActivite(req, res);

    expect(activiteServiceMock.createActivite).toHaveBeenCalledWith(
      {
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
        competences: ['Node.js'],
        documentations: [{ pdf: 'doc.pdf' }],
      },
      req.user
    );
  });

  it('createActivite transforme competences JSON string en tableau', async () => {
    activiteServiceMock.createActivite.mockResolvedValue({
      experience_id: 'exp-1',
    });

    const req = {
      body: {
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
        competences: '["React"]',
      },
      user: { utilisateur_id: 'etu-1', role: 'etudiant' },
    };
    const res = createRes();

    await controller.createActivite(req, res);

    expect(activiteServiceMock.createActivite).toHaveBeenCalledWith(
      expect.objectContaining({
        competences: ['React'],
      }),
      req.user
    );
  });

  it('createActivite transforme documentations JSON string en tableau', async () => {
    activiteServiceMock.createActivite.mockResolvedValue({
      experience_id: 'exp-1',
    });

    const req = {
      body: {
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
        documentations: '[{"captures":"img.png"}]',
      },
      user: { utilisateur_id: 'etu-1', role: 'etudiant' },
    };
    const res = createRes();

    await controller.createActivite(req, res);

    expect(activiteServiceMock.createActivite).toHaveBeenCalledWith(
      expect.objectContaining({
        documentations: [{ captures: 'img.png' }],
      }),
      req.user
    );
  });

  it("createActivite upload une image et ajoute captures dans documentations", async () => {
    bucketMock.upload.mockResolvedValue({ error: null });
    bucketMock.getPublicUrl.mockReturnValue({
      data: {
        publicUrl: 'https://cdn.example.com/activites/photo.png',
      },
    });
    activiteServiceMock.createActivite.mockResolvedValue({
      experience_id: 'exp-1',
    });

    const req = {
      body: {
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
      },
      user: { utilisateur_id: 'etu-1', role: 'etudiant' },
      file: {
        originalname: 'photo.png',
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
      },
    };
    const res = createRes();

    await controller.createActivite(req, res);

    expect(supabaseMock.storage.from).toHaveBeenCalledWith('activites');
    expect(bucketMock.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+-photo\.png$/),
      expect.any(Buffer),
      { contentType: 'image/png' }
    );
    expect(activiteServiceMock.createActivite).toHaveBeenCalledWith(
      expect.objectContaining({
        documentations: [
          { captures: 'https://cdn.example.com/activites/photo.png' },
        ],
      }),
      req.user
    );
  });

  it('createActivite retourne une erreur si Supabase echoue', async () => {
    bucketMock.upload.mockResolvedValue({
      error: { message: 'upload failed' },
    });

    const req = {
      body: {
        typeActivite: 'personnelle',
        titre: 'Club',
        type: 'club',
        lieu: 'Campus',
      },
      user: { utilisateur_id: 'etu-1', role: 'etudiant' },
      file: {
        originalname: 'photo.png',
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
      },
    };
    const res = createRes();

    await controller.createActivite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'upload failed',
    });
  });

  it('getMesActivites retourne 200 avec la liste', async () => {
    activiteServiceMock.getMesActivitesService.mockResolvedValue([
      { experience_id: 'exp-1' },
    ]);

    const req = {
      user: { utilisateur_id: 'etu-1', role: 'etudiant' },
    };
    const res = createRes();

    await controller.getMesActivites(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ experience_id: 'exp-1' }],
    });
  });

  it("updateValidationActivite retourne 200 avec l'activite mise a jour", async () => {
    activiteServiceMock.updateValidationActiviteService.mockResolvedValue({
      experience_id: 'exp-1',
      validation: { statut: 'valide' },
    });

    const req = {
      params: { id: 'exp-1' },
      body: { statut: 'valide' },
      user: { utilisateur_id: 'admin-1', role: 'administrateur' },
    };
    const res = createRes();

    await controller.updateValidationActivite(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        experience_id: 'exp-1',
        validation: { statut: 'valide' },
      },
    });
  });

  it('getActivitesPubliquesPortfolio retourne 200 avec les activites publiques', async () => {
    activiteServiceMock.getPortfolioPublicActivitiesService.mockResolvedValue([
      { experience_id: 'exp-1' },
    ]);

    const req = {
      params: { etudiantId: 'etu-1' },
    };
    const res = createRes();

    await controller.getActivitesPubliquesPortfolio(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ experience_id: 'exp-1' }],
    });
  });

  it('retourne le statusCode du service si present', async () => {
    const error = new Error('Institution introuvable');
    error.statusCode = 404;
    activiteServiceMock.createActivite.mockRejectedValue(error);

    const req = {
      body: {
        typeActivite: 'academique',
        titre: 'Conf',
        type: 'conference',
        lieu: 'Campus',
        institutionId: 'inst-1',
      },
      user: { utilisateur_id: 'etu-1', role: 'etudiant' },
    };
    const res = createRes();

    await controller.createActivite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Institution introuvable',
    });
  });
});
