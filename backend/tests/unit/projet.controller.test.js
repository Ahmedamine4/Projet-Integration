import { beforeEach, describe, expect, it, vi } from 'vitest';

const uploadPhotoMock = vi.fn();
const creeProjetMock = vi.fn();
const getProjetsByEtudiantMock = vi.fn();
const editProjetMock = vi.fn();
const updateVisibiliteProjetServiceMock = vi.fn();

vi.mock('../../src/services/projet.service.js', () => ({
  uploadPhoto: uploadPhotoMock,
  creeProjet: creeProjetMock,
  getProjetsByEtudiant: getProjetsByEtudiantMock,
  editProjet: editProjetMock,
  updateVisibiliteProjetService: updateVisibiliteProjetServiceMock,
}));

const controller = await import('../../src/controllers/projet.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('projet.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 400 si des champs obligatoires sont manquants', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: { projectTitle: 'Projet' },
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(creeProjetMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Champs obligatoires manquants',
    });
  });

  it('retourne 400 pour un projet academique sans email professeur', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet academique',
        projectDate: '2026-05-09',
        description: 'Description',
        projetType: 'academique',
      },
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(creeProjetMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('upload l image puis appelle creeProjet avec le payload reel', async () => {
    uploadPhotoMock.mockResolvedValue('https://cdn.example.com/projet.png');
    creeProjetMock.mockResolvedValue({
      experience: { experience_id: 'exp-1' },
      projet: { experience_id: 'exp-1' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet reel',
        projectDate: '2026-05-09',
        description: 'Description',
        technologies: '["Node.js"]',
        domains: '["Web"]',
      },
      file: {
        originalname: 'projet.png',
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
      },
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(uploadPhotoMock).toHaveBeenCalledWith(req.file);
    expect(creeProjetMock).toHaveBeenCalledWith(
      'etu-1',
      req.body,
      'https://cdn.example.com/projet.png'
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('mappe le doublon projet vers 409', async () => {
    creeProjetMock.mockRejectedValue(new Error('Projet déjà existant'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet reel',
        projectDate: '2026-05-09',
        description: 'Description',
      },
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Projet déjà existant',
    });
  });

  it('retourne les projets de l etudiant connecte', async () => {
    getProjetsByEtudiantMock.mockResolvedValue([{ experience_id: 'exp-1' }]);

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getProjets(req, res);

    expect(getProjetsByEtudiantMock).toHaveBeenCalledWith('etu-1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('retourne 403 si le service refuse les technologies verrouillees', async () => {
    editProjetMock.mockRejectedValue(
      new Error('Les technologies import�es depuis GitHub sont verrouill�es')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { technologies: '["TypeScript"]' },
    };
    const res = createRes();

    await controller.updateProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('retourne 404 si le projet a modifier est introuvable', async () => {
    editProjetMock.mockRejectedValue(new Error('Projet non trouvé'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-missing' },
      body: {},
    };
    const res = createRes();

    await controller.updateProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('refuse une visibilite non booleenne', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: 'true' },
    };
    const res = createRes();

    await controller.updateVisibiliteProjet(req, res);

    expect(updateVisibiliteProjetServiceMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('appelle le service de visibilite avec le boolen fourni', async () => {
    updateVisibiliteProjetServiceMock.mockResolvedValue({
      experience_id: 'exp-1',
      visibilite: true,
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: true },
    };
    const res = createRes();

    await controller.updateVisibiliteProjet(req, res);

    expect(updateVisibiliteProjetServiceMock).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      true
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
