import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  institution: {
    findMany: vi.fn(),
  },
  valideEtudiant: {
    upsert: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

const { LinkInstitutionsToEtudiant } = await import(
  '../../src/services/link_institutions_etudiant.service.js'
);

describe('link_institutions_etudiant.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retourne les liaisons creees ou retrouvees pour les institutions trouvees', async () => {
    prismaMock.institution.findMany.mockResolvedValue([
      { institution_id: 'inst-1', nom: 'EMSI' },
      { institution_id: 'inst-2', nom: 'ENSA' },
    ]);
    prismaMock.valideEtudiant.upsert
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

    const result = await LinkInstitutionsToEtudiant('etu-1', ['inst-1', 'inst-2']);

    expect(prismaMock.institution.findMany).toHaveBeenCalledWith({
      where: {
        institution_id: { in: ['inst-1', 'inst-2'] },
      },
      select: { nom: true, institution_id: true },
    });
    expect(prismaMock.valideEtudiant.upsert).toHaveBeenNthCalledWith(1, {
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
        date: expect.any(Date),
      },
    });
    expect(prismaMock.valideEtudiant.upsert).toHaveBeenNthCalledWith(2, {
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
        date: expect.any(Date),
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
    prismaMock.institution.findMany.mockResolvedValue([]);

    await expect(
      LinkInstitutionsToEtudiant('etu-1', ['inst-404'])
    ).rejects.toThrow('Aucune institution trouv');

    expect(prismaMock.valideEtudiant.upsert).not.toHaveBeenCalled();
  });
});
