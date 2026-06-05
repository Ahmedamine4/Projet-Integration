import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  notification: {
    create: vi.fn(),
  },
  certification: {
    findMany: vi.fn(),
  },
  experience: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
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

const storageBucketMock = {
  upload: vi.fn(),
  getPublicUrl: vi.fn(),
};

const supabaseMock = {
  storage: {
    from: vi.fn(() => storageBucketMock),
  },
};

const lierCompetencesExperienceMock = vi.fn();
const supprimerCompetencesDeveloppeesMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/config/supabase.js', () => ({
  supabase: supabaseMock,
}));

vi.mock('../../src/services/competence.helper.js', () => ({
  lierCompetencesExperience: lierCompetencesExperienceMock,
  supprimerCompetencesDeveloppees: supprimerCompetencesDeveloppeesMock,
}));

const service = await import('../../src/services/certification.service.js');

describe('certification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
    prismaMock.experience.findFirst.mockResolvedValue(null);
    supabaseMock.storage.from.mockReturnValue(storageBucketMock);
    lierCompetencesExperienceMock.mockResolvedValue([{ competence_id: 'c1' }]);
    supprimerCompetencesDeveloppeesMock.mockResolvedValue(undefined);
  });

  it('creeCertification cree une experience et une certification invisibles', async () => {
    txMock.experience.create.mockResolvedValue({ experience_id: 'exp-1' });
    txMock.certification.create.mockResolvedValue({
      experience_id: 'exp-1',
      code: 'AWS-001',
    });
    txMock.certification.findUnique.mockResolvedValue({
      experience_id: 'exp-1',
      code: 'AWS-001',
      experience: {
        competence_dev: [{ competence: { nom: 'Cloud' } }],
      },
    });

    const result = await service.creeCertification(
      'etu-1',
      {
        titre: 'AWS',
        date: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
        competences: '[{"nom":"Cloud","type":"technologie"}]',
      },
      'https://cdn.example.com/certifications/photo.png'
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: {
        titre: 'AWS',
        date_experience: new Date('2026-05-10'),
        visibilite: false,
        type: 'certification',
        description: 'Certification cloud',
        utilisateur_id: 'etu-1',
        photo: 'https://cdn.example.com/certifications/photo.png',
      },
    });
    expect(txMock.certification.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-1',
        code: 'AWS-001',
        lien_URL: 'https://example.com/cert',
      },
    });
    expect(result.code).toBe('AWS-001');
  });

  it('creeCertification refuse un doublon de titre pour le meme etudiant', async () => {
    prismaMock.experience.findFirst.mockResolvedValue({ experience_id: 'exp-existing' });

    await expect(
      service.creeCertification(
        'etu-1',
        { titre: 'AWS', date: '2026-05-10' },
        null
      )
    ).rejects.toThrow('Certification');
  });

  it('getCertificationsByEtudiant charge les certifications de l etudiant', async () => {
    prismaMock.certification.findMany.mockResolvedValue([{ experience_id: 'exp-1' }]);

    const result = await service.getCertificationsByEtudiant('etu-1');

    expect(prismaMock.certification.findMany).toHaveBeenCalledWith({
      where: { experience: { utilisateur_id: 'etu-1' } },
      include: {
        validation: {
          include: {
            institution: true,
          },
        },
        experience: {
          include: {
            competence_dev: { include: { competence: true } },
          },
        },
      },
      orderBy: { experience: { date_experience: 'desc' } },
    });
    expect(result).toEqual([{ experience_id: 'exp-1' }]);
  });

  it('editCertification refuse une certification introuvable', async () => {
    txMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      service.editCertification('etu-1', 'exp-missing', { titre: 'AWS' }, null)
    ).rejects.toThrow('Certification');
  });

  it('updateVisibiliteCertificationService refuse une certification hors ownership', async () => {
    prismaMock.experience.findFirst.mockResolvedValue(null);

    await expect(
      service.updateVisibiliteCertificationService('etu-1', 'exp-missing', true)
    ).rejects.toThrow('Certification');
  });

  it('getCertificationsVisiblesByEtudiant ne charge que les experiences visibles', async () => {
    prismaMock.experience.findMany.mockResolvedValue([{ experience_id: 'exp-visible' }]);

    const result = await service.getCertificationsVisiblesByEtudiant('etu-1');

    expect(prismaMock.experience.findMany).toHaveBeenCalledWith({
      where: { utilisateur_id: 'etu-1', type: 'certification', visibilite: true },
      include: {
        certification: {
          include: {
            validation: {
              include: {
                institution: true,
              },
            },
          },
        },
        competence_dev: { include: { competence: true } },
      },
      orderBy: { date_experience: 'desc' },
    });
    expect(result).toEqual([{ experience_id: 'exp-visible' }]);
  });
});
