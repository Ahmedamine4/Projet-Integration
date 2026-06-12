import { beforeEach, describe, expect, it, vi } from 'vitest';

const institutionServiceMock = {
  getInstitutions: vi.fn(),
  getAcademicInstitutions: vi.fn(),
  getNonAcademicInstitutions: vi.fn(),
  getInstitutionsValideEtudiant: vi.fn(),
  getProfesseursByInstitution: vi.fn(),
};

vi.mock('../../src/services/institution.service.js', () => institutionServiceMock);

const controller = await import('../../src/controllers/institution.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('institution.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getInstitution retourne les institutions', async () => {
    institutionServiceMock.getInstitutions.mockResolvedValue([
      { institution_id: 'inst-1', nom: 'ENSA' },
    ]);

    const res = createRes();

    await controller.getInstitution({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { institution_id: 'inst-1', nom: 'ENSA' },
    ]);
  });

  it('getInstitution retourne 500 si le service echoue', async () => {
    institutionServiceMock.getInstitutions.mockRejectedValue(new Error('boom'));

    const res = createRes();

    await controller.getInstitution({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal server error',
    });
  });

  it('getAcademicInstitutionsController retourne les institutions academiques', async () => {
    institutionServiceMock.getAcademicInstitutions.mockResolvedValue([
      { institution_id: 'inst-a' },
    ]);

    const res = createRes();

    await controller.getAcademicInstitutionsController({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ institution_id: 'inst-a' }],
    });
  });

  it('getNonAcademicInstitutionsController retourne les institutions non academiques', async () => {
    institutionServiceMock.getNonAcademicInstitutions.mockResolvedValue([
      { institution_id: 'inst-b' },
    ]);

    const res = createRes();

    await controller.getNonAcademicInstitutionsController({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ institution_id: 'inst-b' }],
    });
  });

  it('getInstitutionByEtudiant retourne les institutions validees', async () => {
    institutionServiceMock.getInstitutionsValideEtudiant.mockResolvedValue([
      { institution_id: 'inst-1' },
    ]);

    const req = {
      user: { utilisateur_id: 'etu-1' },
    };
    const res = createRes();

    await controller.getInstitutionByEtudiant(req, res);

    expect(institutionServiceMock.getInstitutionsValideEtudiant).toHaveBeenCalledWith('etu-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ institution_id: 'inst-1' }],
    });
  });

  it('getInstitutionByEtudiant retourne 500 si le service echoue', async () => {
    institutionServiceMock.getInstitutionsValideEtudiant.mockRejectedValue(new Error('boom'));

    const req = {
      user: { utilisateur_id: 'etu-1' },
    };
    const res = createRes();

    await controller.getInstitutionByEtudiant(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });
  });

  it('getProfesseursParInstitution retourne les professeurs', async () => {
    institutionServiceMock.getProfesseursByInstitution.mockResolvedValue([
      { utilisateur_id: 'prof-1' },
    ]);

    const req = {
      params: { institutionId: 'inst-1' },
    };
    const res = createRes();

    await controller.getProfesseursParInstitution(req, res);

    expect(institutionServiceMock.getProfesseursByInstitution).toHaveBeenCalledWith('inst-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ utilisateur_id: 'prof-1' }],
    });
  });

  it('getProfesseursParInstitution retourne 404 si institution non trouvee', async () => {
    institutionServiceMock.getProfesseursByInstitution.mockRejectedValue(
      new Error('Institution non trouvée')
    );

    const req = {
      params: { institutionId: 'inst-1' },
    };
    const res = createRes();

    await controller.getProfesseursParInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Institution non trouvée',
    });
  });

  it('getProfesseursParInstitution retourne 500 si erreur inconnue', async () => {
    institutionServiceMock.getProfesseursByInstitution.mockRejectedValue(new Error('boom'));

    const req = {
      params: { institutionId: 'inst-1' },
    };
    const res = createRes();

    await controller.getProfesseursParInstitution(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });
  });
});
