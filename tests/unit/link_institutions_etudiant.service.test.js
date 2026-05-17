import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFindMany, mockUpsert } = vi.hoisted(() => ({
  mockFindMany: vi.fn(),
  mockUpsert: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {
      this.institution = {
        findMany: mockFindMany,
      };
      this.valideEtudiant = {
        upsert: mockUpsert,
      };
    }
  },
}));

const { LinkInstitutionsToEtudiant } = await import(
  '../../src/services/link_institutions_etudiant.service.js'
);

describe('link_institutions_etudiant.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne les liaisons creees ou retrouvees pour les institutions trouvees', async () => {
    mockFindMany.mockResolvedValue([
      { institution_id: 'inst-1', nom: 'EMSI' },
      { institution_id: 'inst-2', nom: 'ENSA' },
    ]);
    mockUpsert
      .mockResolvedValueOnce({
        utilisateur_id: 'etu-1',
        institution_id: 'inst-1',
        statut: 'en_attente',
      })
      .mockResolvedValueOnce({
        utilisateur_id: 'etu-1',
        institution_id: 'inst-2',
        statut: 'en_attente',
      });

    const result = await LinkInstitutionsToEtudiant('etu-1', ['EMSI', 'ENSA']);

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        nom: {
          in: ['EMSI', 'ENSA'],
          mode: 'insensitive',
        },
      },
    });
    expect(mockUpsert).toHaveBeenNthCalledWith(1, {
      where: {
        utilisateur_id_institution_id: {
          utilisateur_id: 'etu-1',
          institution_id: 'inst-1',
        },
      },
      update: {},
      create: {
        utilisateur_id: 'etu-1',
        institution_id: 'inst-1',
        statut: 'en_attente',
        date_d_action: expect.any(Date),
      },
    });
    expect(mockUpsert).toHaveBeenNthCalledWith(2, {
      where: {
        utilisateur_id_institution_id: {
          utilisateur_id: 'etu-1',
          institution_id: 'inst-2',
        },
      },
      update: {},
      create: {
        utilisateur_id: 'etu-1',
        institution_id: 'inst-2',
        statut: 'en_attente',
        date_d_action: expect.any(Date),
      },
    });
    expect(result).toEqual([
      {
        utilisateur_id: 'etu-1',
        institution_id: 'inst-1',
        statut: 'en_attente',
      },
      {
        utilisateur_id: 'etu-1',
        institution_id: 'inst-2',
        statut: 'en_attente',
      },
    ]);
  });

  it('lance une erreur si aucune institution ne correspond aux noms fournis', async () => {
    mockFindMany.mockResolvedValue([]);

    await expect(
      LinkInstitutionsToEtudiant('etu-1', ['Inconnue'])
    ).rejects.toThrow('Aucune institution trouv');

    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
