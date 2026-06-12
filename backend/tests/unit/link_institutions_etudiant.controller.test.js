import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMock = {
  LinkInstitutionsToEtudiantService: vi.fn(),
  updateValidEtudiantDescriptionService: vi.fn(),
};

vi.mock('../../src/services/link_institutions_etudiant.service.js', () => serviceMock);

const {
  LinkInstitutionsToEtudiantController,
  updateValidEtudiantDescriptionController,
} = await import('../../src/controllers/link_institutions_etudiant.controller.js');

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

  it('retourne 400 si etudiantId ou institutions sont invalides', async () => {
    const req = {
      body: {
        etudiantId: '',
        institutions: [],
      },
    };
    const res = createRes();

    await LinkInstitutionsToEtudiantController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(serviceMock.LinkInstitutionsToEtudiantService).not.toHaveBeenCalled();
  });

  it('retourne 200 avec le nombre de liaisons traitees', async () => {
    serviceMock.LinkInstitutionsToEtudiantService.mockResolvedValue([
      { institution_id: 'inst-1' },
      { institution_id: 'inst-2' },
    ]);

    const req = {
      body: {
        etudiantId: 'etu-1',
        etudie: true,
        institutions: [{ institutionId: 'inst-1' }, { institutionId: 'inst-2' }],
      },
    };
    const res = createRes();

    await LinkInstitutionsToEtudiantController(req, res);

    expect(serviceMock.LinkInstitutionsToEtudiantService).toHaveBeenCalledWith(
      'etu-1',
      true,
      req.body.institutions
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: expect.stringContaining('Institutions'),
      count: 2,
      data: [{ institution_id: 'inst-1' }, { institution_id: 'inst-2' }],
    });
  });

  it('updateValidEtudiantDescriptionController retourne 400 si la description manque', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {},
    };
    const res = createRes();

    await updateValidEtudiantDescriptionController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
