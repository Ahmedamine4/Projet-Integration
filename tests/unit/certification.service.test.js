import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
  certification: {
    findMany: vi.fn(),
  },
};

const txMock = {
  experience: {
    create: vi.fn(),
  },
  certification: {
    create: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('@prisma/client', () => ({
  TypeExperience: {
    certification: 'certification',
  },
  StatutValidation: {
    en_attente: 'en_attente',
  },
}));

const service = await import('../../src/services/certification.service.js');

describe('certification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
  });

  it('createCertification cree une experience et une certification', async () => {
    txMock.experience.create.mockResolvedValue({
      experience_id: 'exp-1',
    });
    txMock.certification.create.mockResolvedValue({
      experience_id: 'exp-1',
      code: 'AWS-001',
    });

    const result = await service.createCertification(
      {
        title: 'AWS',
        issueDate: '2026-05-10',
        credentialUrl: 'https://example.com/cert',
        description: 'Certification cloud',
        code: 'AWS-001',
        visibleToEveryone: true,
      },
      'etu-1'
    );

    expect(txMock.experience.create).toHaveBeenCalledWith({
      data: {
        titre: 'AWS',
        type: 'certification',
        date_experience: new Date('2026-05-10'),
        description: 'Certification cloud',
        visibilite: true,
        utilisateur_id: 'etu-1',
      },
    });
    expect(txMock.certification.create).toHaveBeenCalledWith({
      data: {
        experience_id: 'exp-1',
        document: 'https://example.com/cert',
        lien_URL: 'https://example.com/cert',
        code: 'AWS-001',
      },
    });
    expect(result).toEqual({
      experience: { experience_id: 'exp-1' },
      certification: { experience_id: 'exp-1', code: 'AWS-001' },
    });
  });

  it('getMyCertifications appelle Prisma avec le bon filtre', async () => {
    prismaMock.certification.findMany.mockResolvedValue([
      { experience_id: 'exp-1' },
    ]);

    const result = await service.getMyCertifications('etu-1');

    expect(prismaMock.certification.findMany).toHaveBeenCalledWith({
      where: {
        experience: {
          utilisateur_id: 'etu-1',
        },
      },
      include: {
        experience: true,
        validation: true,
      },
      orderBy: {
        experience: {
          date_experience: 'desc',
        },
      },
    });
    expect(result).toEqual([{ experience_id: 'exp-1' }]);
  });
});
