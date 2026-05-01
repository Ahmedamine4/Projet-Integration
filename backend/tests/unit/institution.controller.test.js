import { beforeEach, describe, expect, it, vi } from 'vitest';

// On mocke le service pour tester uniquement le controller.
// Mock du service institution :
// le controller sera teste seul, sans vraie lecture Prisma.
vi.mock('../../src/services/institution.service.js', () => ({
  getInstitutions: vi.fn(),
}));

// Ici, getInstitutions correspond a la version mockee du service.
import { getInstitutions } from '../../src/services/institution.service.js';
import { getInstitution } from '../../src/controllers/institution.controller.js';

// Faux objet response Express pour tester le controller seul.
function createResponseMock() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('institution.controller', () => {
  beforeEach(() => {
    // On nettoie les mocks avant chaque cas.
    vi.clearAllMocks();
  });

  it('getInstitution retourne 200 avec la liste des institutions', async () => {
    // Le controller doit renvoyer la liste si le service reussit.
    const req = {};
    const res = createResponseMock();

    // Le service mocke renvoie directement les institutions.
    getInstitutions.mockResolvedValue([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);

    // On execute la fonction du controller.
    await getInstitution(req, res);

    // Le controller doit renvoyer le bon statut.
    expect(res.status).toHaveBeenCalledWith(200);
    // Puis renvoyer la liste en JSON.
    expect(res.json).toHaveBeenCalledWith([
      { nom: 'EMSI' },
      { nom: 'ENSA' },
    ]);
  });

  it('getInstitution retourne 500 si le service echoue', async () => {
    // Une erreur de service doit renvoyer une erreur serveur.
    const req = {};
    const res = createResponseMock();
    // On neutralise console.error pour ne pas polluer la sortie du test.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Cette ligne simule une erreur du service.
    getInstitutions.mockRejectedValue(new Error('db error'));

    await getInstitution(req, res);

    // 500 = erreur interne du serveur.
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });

    consoleSpy.mockRestore();
  });
});
