import { beforeEach, describe, expect, it, vi } from 'vitest';

const certificationServiceMock = {
  uploadPhoto: vi.fn(),
  creeCertification: vi.fn(),
  getCertificationsByEtudiant: vi.fn(),
  editCertification: vi.fn(),
  updateVisibiliteCertificationService: vi.fn(),
};

vi.mock('../../src/services/certification.service.js', () => certificationServiceMock);

const controller = await import('../../src/controllers/certification.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('certification.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('addCertification retourne 400 si les champs obligatoires manquent', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: { titre: 'AWS' },
    };
    const res = createRes();

    await controller.addCertification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('addCertification appelle creeCertification avec le payload reel', async () => {
    certificationServiceMock.creeCertification.mockResolvedValue({
      experience_id: 'exp-1',
      code: 'AWS-001',
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        titre: 'AWS',
        date: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
      },
    };
    const res = createRes();

    await controller.addCertification(req, res);

    expect(certificationServiceMock.creeCertification).toHaveBeenCalledWith(
      'etu-1',
      req.body,
      null
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('addCertification retourne 409 sur un doublon de certification', async () => {
    certificationServiceMock.creeCertification.mockRejectedValue(
      new Error('Certification déjà existante')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: { titre: 'AWS', date: '2026-05-10' },
    };
    const res = createRes();

    await controller.addCertification(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('getMesCertifications retourne 200 avec la liste', async () => {
    certificationServiceMock.getCertificationsByEtudiant.mockResolvedValue([
      { experience_id: 'exp-1' },
      { experience_id: 'exp-2' },
    ]);

    const req = {
      user: { utilisateur_id: 'etu-1' },
    };
    const res = createRes();

    await controller.getMesCertifications(req, res);

    expect(certificationServiceMock.getCertificationsByEtudiant).toHaveBeenCalledWith(
      'etu-1'
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('updateCertification retourne 404 si la certification est introuvable', async () => {
    certificationServiceMock.editCertification.mockRejectedValue(
      new Error('Certification non trouvée')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-missing' },
      body: {},
    };
    const res = createRes();

    await controller.updateCertification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updateVisibiliteCertification refuse une visibilite non booleenne', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: 'true' },
    };
    const res = createRes();

    await controller.updateVisibiliteCertification(req, res);

    expect(
      certificationServiceMock.updateVisibiliteCertificationService
    ).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateVisibiliteCertification appelle le service avec la visibilite booleenne', async () => {
    certificationServiceMock.updateVisibiliteCertificationService.mockResolvedValue({
      experience_id: 'exp-1',
      visibilite: true,
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      params: { experienceId: 'exp-1' },
      body: { visibilite: true },
    };
    const res = createRes();

    await controller.updateVisibiliteCertification(req, res);

    expect(
      certificationServiceMock.updateVisibiliteCertificationService
    ).toHaveBeenCalledWith('etu-1', 'exp-1', true);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
