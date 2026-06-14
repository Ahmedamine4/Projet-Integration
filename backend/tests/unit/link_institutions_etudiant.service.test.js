import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  $transaction: vi.fn(),
};

const txMock = {
  etudiant: {
    update: vi.fn(),
  },
  valideEtudiant: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClientMock {
    constructor() {
      return prismaMock;
    }
  },
}));

const service = await import('../../src/services/link_institutions_etudiant.service.js');

describe('link_institutions_etudiant.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback) => callback(txMock));
  });

  it('cree les liaisons avec calcul de date de fin et met a jour etudie', async () => {
    txMock.etudiant.update.mockResolvedValue({});
    txMock.valideEtudiant.create
      .mockResolvedValueOnce({ institution_id: 'inst-1', statut: 'en_attente' })
      .mockResolvedValueOnce({ institution_id: 'inst-2', statut: 'en_attente' });

    const result = await service.LinkInstitutionsToEtudiantService(
      'etu-1',
      'true',
      [
        {
          institutionId: 'inst-1',
          date_debut: '2024-09-01',
          niveau: 'bachelor',
        },
        {
          institutionId: 'inst-2',
          date_debut: '2025-09-01',
          date_fin: '2026-06-30',
          niveau: 'master',
          description: 'Parcours master',
        },
      ]
    );

    expect(txMock.etudiant.update).toHaveBeenCalledWith({
      where: { etudiant_utilisateur_id: 'etu-1' },
      data: { etudie: true },
    });
    expect(txMock.valideEtudiant.create).toHaveBeenCalledTimes(2);
    expect(result).toHaveLength(2);
  });

  it('force etudie a false si la date de fin la plus lointaine est depassee', async () => {
    txMock.etudiant.update.mockResolvedValue({});
    txMock.valideEtudiant.create.mockResolvedValue({ institution_id: 'inst-1' });

    await service.LinkInstitutionsToEtudiantService(
      'etu-1',
      'true',
      [
        {
          institutionId: 'inst-1',
          date_debut: '2020-09-01',
          date_fin: '2021-06-30',
          niveau: 'bachelor',
        },
      ]
    );

    expect(txMock.etudiant.update).toHaveBeenCalledWith({
      where: { etudiant_utilisateur_id: 'etu-1' },
      data: { etudie: false },
    });
  });
});
