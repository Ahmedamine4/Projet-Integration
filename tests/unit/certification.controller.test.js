import { beforeEach, describe, expect, it, vi } from 'vitest';

const certificationServiceMock = {
  createCertification: vi.fn(),
  getMyCertifications: vi.fn(),
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

  it('addCertification retourne 400 si champs manquants', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        title: 'AWS',
      },
    };
    const res = createRes();

    await controller.addCertification(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Champs obligatoires manquants',
    });
  });

  it('addCertification retourne 201 si creation reussie', async () => {
    certificationServiceMock.createCertification.mockResolvedValue({
      experience: { experience_id: 'exp-1' },
      certification: { experience_id: 'exp-1' },
    });

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        title: 'AWS',
        issueDate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
      },
    };
    const res = createRes();

    await controller.addCertification(req, res);

    expect(certificationServiceMock.createCertification).toHaveBeenCalledWith(
      req.body,
      'etu-1'
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: expect.any(String),
      data: {
        experience: { experience_id: 'exp-1' },
        certification: { experience_id: 'exp-1' },
      },
    });
  });

  it('addCertification retourne 500 si le service echoue', async () => {
    certificationServiceMock.createCertification.mockRejectedValue(
      new Error('db error')
    );

    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        title: 'AWS',
        issueDate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
      },
    };
    const res = createRes();

    await controller.addCertification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'db error',
    });
  });

  it('addCertification retourne 400 si seul issuedate est envoye', async () => {
    const req = {
      user: { utilisateur_id: 'etu-1' },
      body: {
        title: 'AWS',
        issuedate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
      },
    };
    const res = createRes();

    await controller.addCertification(req, res);

    expect(certificationServiceMock.createCertification).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Champs obligatoires manquants',
    });
  });

  it('getMyCertifications retourne 200 avec la liste', async () => {
    certificationServiceMock.getMyCertifications.mockResolvedValue([
      { experience_id: 'exp-1' },
      { experience_id: 'exp-2' },
    ]);

    const req = {
      user: { utilisateur_id: 'etu-1' },
    };
    const res = createRes();

    await controller.getMyCertifications(req, res);

    expect(certificationServiceMock.getMyCertifications).toHaveBeenCalledWith('etu-1');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      count: 2,
      data: [{ experience_id: 'exp-1' }, { experience_id: 'exp-2' }],
    });
  });
});
