import { beforeEach, describe, expect, it, vi } from 'vitest';

const createProjetMock = vi.fn();

const bucketMock = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
};

const supabaseMock = {
  storage: {
    from: vi.fn(() => bucketMock),
  },
};

vi.mock('../../src/services/projet.service.js', () => ({
  createProjet: createProjetMock,
}));

vi.mock('../../src/config/supabase.js', () => ({
  supabase: supabaseMock,
}));

vi.mock('@prisma/client', () => ({
  TypeSpecifique: {
    academique: 'academique',
  },
}));

const { addProjet } = await import('../../src/controllers/projet.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('projet.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.storage.from.mockReturnValue(bucketMock);
  });

  it('retourne 401 si req.user.id est absent', async () => {
    const req = {
      user: {},
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'true',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Unauthorized: User ID not found in request',
    });
  });

  it('retourne 400 si des champs obligatoires sont manquants', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Champs obligatoires manquants',
    });
  });

  it('retourne 400 pour un projet academique sans email professeur', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'true',
        projetType: 'academique',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('professeur'),
      })
    );
  });

  it('convertit visibleToEveryone en boolean true', async () => {
    createProjetMock.mockResolvedValue({
      experience: { experience_id: 'exp-1' },
      projet: { experience_id: 'exp-1' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'true',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(createProjetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        visibleToEveryone: true,
      }),
      'etu-1'
    );
  });

  it('conserve visibleToEveryone a true quand un vrai boolean true est envoye', async () => {
    createProjetMock.mockResolvedValue({
      experience: { experience_id: 'exp-true-bool' },
      projet: { experience_id: 'exp-true-bool' },
    });

    const req = {
      user: { utilisateur_id: 'etu-bool-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: true,
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(createProjetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        visibleToEveryone: true,
      }),
      'etu-bool-1'
    );
  });

  it('conserve visibleToEveryone a false quand un vrai boolean false est envoye', async () => {
    createProjetMock.mockResolvedValue({
      experience: { experience_id: 'exp-false-bool' },
      projet: { experience_id: 'exp-false-bool' },
    });

    const req = {
      user: { utilisateur_id: 'etu-bool-2' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: false,
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(createProjetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        visibleToEveryone: false,
      }),
      'etu-bool-2'
    );
  });

  it('convertit visibleToEveryone en boolean false quand la string "false" est envoyee', async () => {
    createProjetMock.mockResolvedValue({
      experience: { experience_id: 'exp-false-string' },
      projet: { experience_id: 'exp-false-string' },
    });

    const req = {
      user: { utilisateur_id: 'etu-string-2' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'false',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(createProjetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        visibleToEveryone: false,
      }),
      'etu-string-2'
    );
  });

  it('retourne 400 si visibleToEveryone est absent', async () => {
    const req = {
      user: { utilisateur_id: 'etu-missing-visibility' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(createProjetMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Champs obligatoires manquants',
    });
  });

  it('parse technologies et domains avant appel du service', async () => {
    createProjetMock.mockResolvedValue({
      experience: { experience_id: 'exp-1' },
      projet: { experience_id: 'exp-1' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'true',
        technologies: '["Node.js"]',
        domains: '["Web"]',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(createProjetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        visibleToEveryone: true,
        technologies: ['Node.js'],
        domains: ['Web'],
      }),
      'etu-1'
    );
  });

  it('retourne 201 avec le resultat du service', async () => {
    createProjetMock.mockResolvedValue({
      experience: { experience_id: 'exp-1' },
      projet: { experience_id: 'exp-1' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'true',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(createProjetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        visibleToEveryone: true,
      }),
      'etu-1'
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: {
        experience: { experience_id: 'exp-1' },
        projet: { experience_id: 'exp-1' },
      },
    });
  });

  it('upload une image sur Supabase avant de creer le projet', async () => {
    bucketMock.upload.mockResolvedValue({ error: null });
    bucketMock.getPublicUrl.mockReturnValue({
      data: {
        publicUrl: 'https://cdn.example.com/projets/projet.png',
      },
    });
    createProjetMock.mockResolvedValue({
      experience: { experience_id: 'exp-2' },
      projet: { experience_id: 'exp-2' },
    });

    const req = {
      user: { utilisateur_id: 'etu-2' },
      body: {
        projectTitle: 'Projet image',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'false',
      },
      file: {
        originalname: 'projet.png',
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(bucketMock.upload).toHaveBeenCalledWith(
      expect.stringMatching(/^\d+-projet\.png$/),
      expect.any(Buffer),
      { contentType: 'image/png' }
    );
    expect(createProjetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        visibleToEveryone: false,
        imageUrl: 'https://cdn.example.com/projets/projet.png',
      }),
      'etu-2'
    );
  });

  it('retourne 500 si upload Supabase echoue', async () => {
    bucketMock.upload.mockResolvedValue({
      error: { message: 'upload failed' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'true',
      },
      file: {
        originalname: 'image.png',
        buffer: Buffer.from('image'),
        mimetype: 'image/png',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'upload failed',
    });
  });

  it('retourne 500 si le service echoue', async () => {
    createProjetMock.mockRejectedValue(new Error('db error'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: 'true',
      },
    };
    const res = createRes();

    await addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'db error',
    });
  });
});
