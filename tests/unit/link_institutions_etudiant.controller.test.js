import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  LinkInstitutionsToEtudiant: vi.fn(),
};

vi.mock('../../src/services/link_institutions_etudiant.service.js', () => serviceMock);

const { LinkInstitutionsToEtudiantController } = await import(
  '../../src/controllers/link_institutions_etudiant.controller.js'
);

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('link_institutions_etudiant.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne 400 si etudiantId ou institutionNoms sont invalides', async () => {
    const req = {
      body: {
        etudiantId: '',
        institutionNoms: [],
      },
    };
    const res = createRes();

    await LinkInstitutionsToEtudiantController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'etudiantId et un tableau institutionNoms sont requis',
    });
    expect(serviceMock.LinkInstitutionsToEtudiant).not.toHaveBeenCalled();
  });

  it('retourne 200 avec le nombre de liaisons traitees', async () => {
    serviceMock.LinkInstitutionsToEtudiant.mockResolvedValue([
      { institution_id: 'inst-1' },
      { institution_id: 'inst-2' },
    ]);

    const req = {
      body: {
        etudiantId: 'etu-1',
        institutionNoms: ['EMSI', 'ENSA'],
      },
    };
    const res = createRes();

    await LinkInstitutionsToEtudiantController(req, res);

    expect(serviceMock.LinkInstitutionsToEtudiant).toHaveBeenCalledWith(
      'etu-1',
      ['EMSI', 'ENSA']
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Demandes de liaison traitées avec succès.',
      count: 2,
    });
  });

  it('retourne 500 si le service echoue', async () => {
    serviceMock.LinkInstitutionsToEtudiant.mockRejectedValue(
      new Error('db error')
    );

    const req = {
      body: {
        etudiantId: 'etu-1',
        institutionNoms: ['EMSI'],
      },
    };
    const res = createRes();

    await LinkInstitutionsToEtudiantController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erreur lors de la liaison',
      details: 'db error',
    });
  });
});
