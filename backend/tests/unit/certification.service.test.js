import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  experience: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  certification: {
    findMany: vi.fn(),
  },
};

const txMock = {
  experience: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  certification: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
};

const photoUtilsMock = {
  uploadPhoto: vi.fn(),
  remplacerPhoto: vi.fn(),
  supprimerPhoto: vi.fn(),
};

const lierCompetencesExperienceMock = vi.fn();
const supprimerCompetencesDeveloppeesMock = vi.fn();
const getCompetencesByExperienceMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/utils/photo.utils.js', () => photoUtilsMock);

vi.mock('../../src/services/competence.helper.js', () => ({
  normaliserCompetences: vi.fn((competences = []) => competences),
  lierCompetencesExperience: lierCompetencesExperienceMock,
  supprimerCompetencesDeveloppees: supprimerCompetencesDeveloppeesMock,
  getCompetencesByExperience: getCompetencesByExperienceMock,
}));

const certificationService = await import('../../src/services/certification.service.js');

describe('certification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
    prismaMock.experience.findFirst.mockResolvedValue(null);
    prismaMock.experience.findMany.mockResolvedValue([]);
    prismaMock.experience.update.mockResolvedValue({});
    prismaMock.experience.delete.mockResolvedValue({});

    prismaMock.certification.findMany.mockResolvedValue([]);

    photoUtilsMock.uploadPhoto.mockResolvedValue('https://cdn/cert.png');
    photoUtilsMock.remplacerPhoto.mockResolvedValue('https://cdn/new-cert.png');
    photoUtilsMock.supprimerPhoto.mockResolvedValue(undefined);

    lierCompetencesExperienceMock.mockResolvedValue([{ competence_id: 'comp-1' }]);
    supprimerCompetencesDeveloppeesMock.mockResolvedValue(undefined);
    getCompetencesByExperienceMock.mockResolvedValue([{ competence_id: 'comp-1' }]);
  });

  it('creeCertification refuse un doublon', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-existing',
    });

    await expect(
      certificationService.creeCertification('etu-1', { titre: 'Certif' }, null)
    ).rejects.toThrow('Certification déjà existante');
  });

  it('creeCertification crée une certification avec photo et compétences', async () => {
    txMock.experience.create.mockResolvedValue({ experience_id: 'exp-1' });
    txMock.certification.create.mockResolvedValue({ experience_id: 'exp-1' });

    txMock.certification.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      experience: {
        competences: [{ competence_id: 'comp-1' }],
      },
    });

    const result = await certificationService.creeCertification(
      'etu-1',
      {
        titre: 'Certif Node',
        date: '2026-05-09',
        description: 'Desc',
        code: 'ABC',
        credentialUrl: 'https://certif.test',
        competences: JSON.stringify([{ nom: 'Node.js', type: 'technologie' }]),
      },
      {
        originalname: 'cert.png',
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
      }
    );

    expect(photoUtilsMock.uploadPhoto).toHaveBeenCalledWith(
      expect.any(Object),
      'certifications-photos'
    );

    expect(txMock.experience.create).toHaveBeenCalled();
    expect(txMock.certification.create).toHaveBeenCalled();

    expect(lierCompetencesExperienceMock).toHaveBeenCalledWith(
      txMock,
      'exp-1',
      'etu-1',
      ['Node.js'],
      'technologie'
    );

    expect(result).toEqual(
      expect.objectContaining({
        experience_id: 'exp-1',
      })
    );
  });

  it('getCertificationsByEtudiant retourne les certifications', async () => {
    prismaMock.certification.findMany.mockResolvedValue([
      {
        experience_id: 'exp-1',
        experience: {
          competences: [{ competence_id: 'comp-1' }],
        },
      },
    ]);

    const result = await certificationService.getCertificationsByEtudiant('etu-1');

    expect(prismaMock.certification.findMany).toHaveBeenCalled();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          experience_id: 'exp-1',
        }),
      ])
    );
  });

  it('editCertification refuse un doublon', async () => {
    prismaMock.experience.findFirst.mockResolvedValueOnce({
      experience_id: 'exp-existing',
    });

    await expect(
      certificationService.editCertification('etu-1', 'exp-1', { titre: 'Certif' }, null)
    ).rejects.toThrow('Certification déjà existante');
  });

  it('editCertification retourne erreur si certification introuvable', async () => {
    prismaMock.experience.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ photo: null });

    txMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      certificationService.editCertification('etu-1', 'exp-1', {}, null)
    ).rejects.toThrow('Certification non trouvée');
  });

  it('editCertification modifie certification avec photo et compétences', async () => {
    prismaMock.experience.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ photo: 'old.png' });

    txMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      titre: 'Old',
      date_experience: new Date('2026-05-09'),
      description: 'Old desc',
      photo: 'old.png',
      certification: {
        code: 'OLD',
        lien_URL: 'https://old.test',
      },
    });

    txMock.experience.update.mockResolvedValue({});
    txMock.certification.update.mockResolvedValue({});

    txMock.certification.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      experience: {
        competences: [{ competence_id: 'comp-1' }],
      },
    });

    const result = await certificationService.editCertification(
      'etu-1',
      'exp-1',
      {
        titre: 'New',
        date: '2026-06-01',
        description: 'New desc',
        code: 'NEW',
        credentialUrl: 'https://new.test',
        competences: JSON.stringify([{ nom: 'React', type: 'technologie' }]),
      },
      {
        originalname: 'new.png',
        buffer: Buffer.from('img'),
        mimetype: 'image/png',
      }
    );

    expect(photoUtilsMock.remplacerPhoto).toHaveBeenCalled();
    expect(txMock.experience.update).toHaveBeenCalled();
    expect(txMock.certification.update).toHaveBeenCalled();

    expect(supprimerCompetencesDeveloppeesMock).toHaveBeenCalledWith(
      txMock,
      'exp-1',
      'etu-1'
    );

    expect(lierCompetencesExperienceMock).toHaveBeenCalledWith(
      txMock,
      'exp-1',
      'etu-1',
      ['React'],
      'technologie'
    );

    expect(result).toEqual(
      expect.objectContaining({
        experience_id: 'exp-1',
      })
    );
  });

  it('supprimerCertificationService retourne erreur si introuvable', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      certificationService.supprimerCertificationService('etu-1', 'exp-1')
    ).rejects.toThrow('Certification non trouvée');
  });

  it('supprimerCertificationService supprime photo puis soft delete expérience', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
      photo: 'https://cdn/certifications-photos/img.png',
    });

    prismaMock.experience.update.mockResolvedValue({
      experience_id: 'exp-1',
      deleted_at: new Date(),
    });

    await certificationService.supprimerCertificationService('etu-1', 'exp-1');

    expect(photoUtilsMock.supprimerPhoto).toHaveBeenCalledWith(
      'https://cdn/certifications-photos/img.png',
      'certifications-photos'
    );

    expect(prismaMock.experience.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: { deleted_at: expect.any(Date) },
    });
  });

  it('updateVisibiliteCertificationService retourne erreur si introuvable', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      certificationService.updateVisibiliteCertificationService('etu-1', 'exp-1', true)
    ).rejects.toThrow('Certification non trouvée');
  });

  it('updateVisibiliteCertificationService change la visibilité', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({
      experience_id: 'exp-1',
    });

    prismaMock.experience.update.mockResolvedValue({
      experience_id: 'exp-1',
      visibilite: true,
    });

    const result = await certificationService.updateVisibiliteCertificationService(
      'etu-1',
      'exp-1',
      true
    );

    expect(prismaMock.experience.update).toHaveBeenCalledWith({
      where: { experience_id: 'exp-1' },
      data: { visibilite: true },
      select: { experience_id: true, visibilite: true },
    });

    expect(result).toEqual({
      experience_id: 'exp-1',
      visibilite: true,
    });
  });

  it('getCertificationsVisiblesByEtudiant retourne les certifications visibles', async () => {
    prismaMock.experience.findMany.mockResolvedValue([
      {
        experience_id: 'exp-1',
        visibilite: true,
      },
    ]);

    const result = await certificationService.getCertificationsVisiblesByEtudiant('etu-1');

    expect(prismaMock.experience.findMany).toHaveBeenCalled();

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          experience_id: 'exp-1',
          visibilite: true,
        }),
      ])
    );
  });
});