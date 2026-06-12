import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  utilisateur: {
    findUnique: vi.fn(),
  },
  lettresDeRecommendations: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
};

const creerNotificationMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/services/notification.service.js', () => ({
  creerNotification: creerNotificationMock,
  TYPES_NOTIFICATION: {
    RECOMMANDATION_DEMANDEE: 'recommandation_demandee',
  },
}));

describe('lettre_recommandation.service', () => {
  let service;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    service = await import('../../src/services/lettre_recommandation.service.js');
  });

  it('creerDemandeRecommandation cree une demande et notifie le professeur', async () => {
    prismaMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-user-1',
        nom: 'Prof',
        prenom: 'Ahmed',
        email: 'prof@test.com',
        professeur: {
          prof_utilisateur_id: 'prof-user-1',
        },
      })
      .mockResolvedValueOnce({
        nom: 'Zbida',
        prenom: 'Sara',
      });

    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue(null);
    prismaMock.lettresDeRecommendations.create.mockResolvedValue({
      lettre_id: 'lettre-1',
      utilisateur_id: 'etu-1',
      prof_utilisateur_id: 'prof-user-1',
      objet: 'Lettre Master',
      description: 'Besoin pour candidature',
      statut: 'en_attente',
    });

    const result = await service.creerDemandeRecommandation('etu-1', {
      objet: 'Lettre Master',
      description: 'Besoin pour candidature',
      email_professeur: 'prof@test.com',
    });

    expect(prismaMock.lettresDeRecommendations.create).toHaveBeenCalled();
    expect(creerNotificationMock).toHaveBeenNthCalledWith(
      1,
      'prof-user-1',
      expect.stringContaining('Lettre Master'),
      'recommandation_demandee'
    );
    expect(creerNotificationMock).toHaveBeenNthCalledWith(
      2,
      'etu-1',
      expect.stringContaining('professeur Prof Ahmed'),
      'recommandation_demandee'
    );
    expect(result.lettre_id).toBe('lettre-1');
  });

  it('creerDemandeRecommandation met description a null si absente', async () => {
    prismaMock.utilisateur.findUnique
      .mockResolvedValueOnce({
        utilisateur_id: 'prof-user-1',
        nom: 'Prof',
        prenom: 'Ahmed',
        professeur: {
          prof_utilisateur_id: 'prof-user-1',
        },
      })
      .mockResolvedValueOnce({
        nom: 'Zbida',
        prenom: 'Sara',
      });

    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue(null);
    prismaMock.lettresDeRecommendations.create.mockResolvedValue({
      lettre_id: 'lettre-1',
    });

    await service.creerDemandeRecommandation('etu-1', {
      objet: 'Lettre Erasmus',
      email_professeur: 'prof@test.com',
    });

    expect(prismaMock.lettresDeRecommendations.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          description: null,
        }),
      })
    );
  });

  it('creerDemandeRecommandation refuse si professeur introuvable', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue(null);

    await expect(
      service.creerDemandeRecommandation('etu-1', {
        objet: 'Lettre Master',
        email_professeur: 'prof@test.com',
      })
    ).rejects.toThrow('Professeur non trouv');
  });

  it('creerDemandeRecommandation refuse si une demande existe deja', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'prof-user-1',
      professeur: {
        prof_utilisateur_id: 'prof-user-1',
      },
    });
    prismaMock.lettresDeRecommendations.findUnique.mockResolvedValue({
      utilisateur_id: 'etu-1',
      prof_utilisateur_id: 'prof-user-1',
    });

    await expect(
      service.creerDemandeRecommandation('etu-1', {
        objet: 'Lettre Master',
        email_professeur: 'prof@test.com',
      })
    ).rejects.toThrow(/existe/);
  });

  it('getMesDemandesRecommandation retourne les demandes de letudiant triees', async () => {
    const demandes = [
      {
        lettre_id: 'lettre-1',
        objet: 'Lettre Master',
      },
    ];

    prismaMock.lettresDeRecommendations.findMany.mockResolvedValue(demandes);

    const result = await service.getMesDemandesRecommandation('etu-1');

    expect(prismaMock.lettresDeRecommendations.findMany).toHaveBeenCalledWith({
      where: { utilisateur_id: 'etu-1' },
      include: {
        professeur: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        date_lettre: 'desc',
      },
    });

    expect(result).toEqual(demandes);
  });
});
