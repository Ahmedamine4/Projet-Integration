import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFindMany, mockUpdate } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      this.valideEtudiant = {
        findMany: mockFindMany,
        update: mockUpdate,
      };
    }
  },
}));

const service = await import('../../src/services/validation_etudiant.service.js');

describe('validation_etudiant.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPendingValidations retourne les demandes en attente', async () => {
    mockFindMany.mockResolvedValue([{ utilisateur_id: 'u1' }]);

    const result = await service.getPendingValidations('inst-1');

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        institution_id: 'inst-1',
        statut: 'en_attente',
      },
      include: {
        etudiant: true,
      },
    });
    expect(result).toEqual([{ utilisateur_id: 'u1' }]);
  });

  it('updateValidationStatus met a jour le statut', async () => {
    mockUpdate.mockResolvedValue({ statut: 'refuse' });

    const result = await service.updateValidationStatus('u1', 'inst-1', 'refuse');

    expect(mockUpdate).toHaveBeenCalledWith({
      where: {
        utilisateur_id_institution_id: {
          utilisateur_id: 'u1',
          institution_id: 'inst-1',
        },
      },
      data: {
        statut: 'refuse',
        date_d_action: expect.any(Date),
      },
    });
    expect(result).toEqual({ statut: 'refuse' });
  });
});
