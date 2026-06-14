import { beforeEach, describe, expect, it, vi } from 'vitest';

const projetServiceMock = {
  creeProjet: vi.fn(),
  getProjetsByEtudiant: vi.fn(),
  editProjet: vi.fn(),
  supprimerProjetService: vi.fn(),
  updateVisibiliteProjetService: vi.fn(),
};

vi.mock('../../src/services/projet.service.js', () => projetServiceMock);

const controller = await import('../../src/controllers/projet.controller.js');

function createRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('projet.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addProjet retourne 400 si champs obligatoires manquants', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: { projectTitle: 'Projet' },
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(projetServiceMock.creeProjet).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addProjet retourne 400 si académique sans email professeur', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Desc',
        projetType: 'academique',
      },
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(projetServiceMock.creeProjet).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addProjet crée un projet', async () => {
    projetServiceMock.creeProjet.mockResolvedValue({ experience_id: 'exp-1' });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Desc',
      },
      file: null,
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(projetServiceMock.creeProjet).toHaveBeenCalledWith('etu-1', req.body, null);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });

  it('addProjet mappe doublon vers 409', async () => {
    projetServiceMock.creeProjet.mockRejectedValue(new Error('Projet déjà existant'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Desc',
      },
      file: null,
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('addProjet mappe professeur introuvable vers 404', async () => {
    projetServiceMock.creeProjet.mockRejectedValue(
      new Error('Professeur non trouvé avec cet email')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Desc',
      },
      file: null,
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('addProjet retourne 500 erreur inconnue', async () => {
    projetServiceMock.creeProjet.mockRejectedValue(new Error('boom'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        projectTitle: 'Projet',
        projectDate: '2026-05-09',
        description: 'Desc',
      },
      file: null,
    };
    const res = createRes();

    await controller.addProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getProjets retourne les projets', async () => {
    projetServiceMock.getProjetsByEtudiant.mockResolvedValue([
      { experience_id: 'exp-1' },
    ]);

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getProjets(req, res);

    expect(projetServiceMock.getProjetsByEtudiant).toHaveBeenCalledWith('etu-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
      })
    );
  });

  it('getProjets retourne 500 si service échoue', async () => {
    projetServiceMock.getProjetsByEtudiant.mockRejectedValue(new Error('boom'));

    const req = { user: { utilisateur_id: 'etu-1' } };
    const res = createRes();

    await controller.getProjets(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('updateProjet modifie un projet', async () => {
    projetServiceMock.editProjet.mockResolvedValue({ experience_id: 'exp-1' });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { projectTitle: 'Nouveau' },
      file: null,
    };
    const res = createRes();

    await controller.updateProjet(req, res);

    expect(projetServiceMock.editProjet).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      req.body,
      null
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateProjet mappe projet non trouvé vers 404', async () => {
    projetServiceMock.editProjet.mockRejectedValue(new Error('Projet non trouvé'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: {},
      file: null,
    };
    const res = createRes();

    await controller.updateProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updateProjet mappe technologies GitHub vers 403', async () => {
    projetServiceMock.editProjet.mockRejectedValue(
      new Error('Les technologies importées depuis GitHub sont verrouillées')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: {},
      file: null,
    };
    const res = createRes();

    await controller.updateProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('deleteProjet supprime un projet', async () => {
    projetServiceMock.supprimerProjetService.mockResolvedValue();

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
    };
    const res = createRes();

    await controller.deleteProjet(req, res);

    expect(projetServiceMock.supprimerProjetService).toHaveBeenCalledWith(
      'etu-1',
      'exp-1'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('deleteProjet mappe traité professeur vers 403', async () => {
    projetServiceMock.supprimerProjetService.mockRejectedValue(
      new Error('Ce projet a déjà été traité par le professeur, vous ne pouvez plus le supprimer')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
    };
    const res = createRes();

    await controller.deleteProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('updateVisibiliteProjet retourne 400 si visibilite non boolean', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: 'true' },
    };
    const res = createRes();

    await controller.updateVisibiliteProjet(req, res);

    expect(projetServiceMock.updateVisibiliteProjetService).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateVisibiliteProjet change la visibilité', async () => {
    projetServiceMock.updateVisibiliteProjetService.mockResolvedValue({
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

    expect(projetServiceMock.updateVisibiliteProjetService).toHaveBeenCalledWith(
      'etu-1',
      'exp-1',
      true
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateVisibiliteProjet mappe visibilité vers 403', async () => {
    projetServiceMock.updateVisibiliteProjetService.mockRejectedValue(
      new Error('Vous ne pouvez changer la visibilité que si le projet académique est validé')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: true },
    };
    const res = createRes();

    await controller.updateVisibiliteProjet(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});
