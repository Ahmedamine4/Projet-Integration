import { beforeEach, describe, expect, it, vi } from 'vitest';

const transactionMock = vi.fn();

const prismaMock = {
  $transaction: transactionMock,
  utilisateur: {
    update: vi.fn(),
    findUnique: vi.fn(),
  },
  professionnel: {
    upsert: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

describe('admin.service', () => {
  let service;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    service = await import('../../src/services/admin.service.js');
  });

  it('assignerDirecteur expose le bug poste/bureau non definis dans le service', async () => {
    const txMock = {
      institution: {
        findUnique: vi.fn().mockResolvedValue({ nom: 'ENSA' }),
      },
      utilisateur: {
        update: vi.fn().mockResolvedValue({
          utilisateur_id: 'u1',
          nom: 'Zbida',
          prenom: 'Sara',
          email: 'sara@test.com',
          role: 'directeur',
        }),
      },
      directeur: {
        create: vi.fn(),
      },
    };

    transactionMock.mockImplementation(async (callback) => callback(txMock));

    await expect(
      service.assignerDirecteur({
        utilisateur_id: 'u1',
        institution_id: 'inst-1',
        poste: 'Directrice',
        bureau: 'B12',
      })
    ).rejects.toThrow(/poste/i);
  });

  it('promouvoirProfessionnel valide un professionnel avec upsert', async () => {
    const txMock = {
      utilisateur: {
        update: vi.fn().mockResolvedValue({
          utilisateur_id: 'u1',
          prenom: 'Sara',
          nom: 'Zbida',
          role: 'professionnel',
        }),
      },
      professionnel: {
        upsert: vi.fn().mockResolvedValue({
          professionnel_utilisateur_id: 'u1',
          statut: 'valide',
          utilisateur: {
            utilisateur_id: 'u1',
            prenom: 'Sara',
            nom: 'Zbida',
            role: 'professionnel',
          },
        }),
      },
    };

    transactionMock.mockImplementation(async (callback) => callback(txMock));

    const result = await service.promouvoirProfessionnel({
      utilisateur_id: 'u1',
      admin_id: 'admin-1',
    });

    expect(txMock.professionnel.upsert).toHaveBeenCalledWith({
      where: { professionnel_utilisateur_id: 'u1' },
      update: {
        statut: 'valide',
        admin_id: 'admin-1',
      },
      create: {
        professionnel_utilisateur_id: 'u1',
        statut: 'valide',
        admin_id: 'admin-1',
      },
      include: {
        utilisateur: { select: expect.any(Object) },
      },
    });

    expect(result.message).toContain('valid');
  });

  it('rejecterProfessionnel refuse un professionnel', async () => {
    prismaMock.professionnel.update.mockResolvedValue({
      professionnel_utilisateur_id: 'u1',
      statut: 'refuse',
      utilisateur: {
        utilisateur_id: 'u1',
        prenom: 'Sara',
        nom: 'Zbida',
      },
    });

    const result = await service.rejecterProfessionnel({
      utilisateur_id: 'u1',
      admin_id: 'admin-1',
    });

    expect(prismaMock.professionnel.update).toHaveBeenCalledWith({
      where: { professionnel_utilisateur_id: 'u1' },
      data: {
        statut: 'refuse',
        admin_id: 'admin-1',
      },
      include: {
        utilisateur: { select: expect.any(Object) },
      },
    });

    expect(result.message).toContain('refus');
  });

  it('bloquerUtilisateur bloque un compte non admin', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue({ role: 'etudiant' });
    prismaMock.utilisateur.update.mockResolvedValue({
      utilisateur_id: 'u1',
      bloque: true,
    });

    const result = await service.bloquerUtilisateur({
      utilisateur_id: 'u1',
    });

    expect(prismaMock.utilisateur.update).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u1' },
      data: { bloque: true },
      select: expect.any(Object),
    });

    expect(result.utilisateur.bloque).toBe(true);
  });

  it('debloquerUtilisateur debloque un compte', async () => {
    prismaMock.utilisateur.update.mockResolvedValue({
      utilisateur_id: 'u1',
      bloque: false,
    });

    const result = await service.debloquerUtilisateur({
      utilisateur_id: 'u1',
    });

    expect(prismaMock.utilisateur.update).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u1' },
      data: { bloque: false },
      select: expect.any(Object),
    });

    expect(result.utilisateur.bloque).toBe(false);
  });

  it('getProfessionnelsEnAttente retourne les professionnels en attente', async () => {
    const professionnels = [
      {
        professionnel_utilisateur_id: 'p1',
        statut: 'en_attente',
        utilisateur: {
          nom: 'Zbida',
          prenom: 'Sara',
          email: 'sara@test.com',
        },
      },
    ];

    prismaMock.professionnel.findMany.mockResolvedValue(professionnels);

    const result = await service.getProfessionnelsEnAttente();

    expect(prismaMock.professionnel.findMany).toHaveBeenCalledWith({
      where: {
        statut: 'en_attente',
      },
      include: {
        utilisateur: {
          select: expect.any(Object),
        },
      },
      orderBy: {
        utilisateur: {
          date_de_creation: 'desc',
        },
      },
    });

    expect(result).toEqual(professionnels);
  });
});
