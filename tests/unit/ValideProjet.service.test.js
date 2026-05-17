import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  valideProjet: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('@prisma/client', () => ({
  StatutValidation: {
    en_attente: 'en_attente',
    valide: 'valide',
    refuse: 'refuse',
  },
}));

const service = await import('../../src/services/ValideProjet.service.js');

describe('ValideProjet.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuse si le projet est introuvable', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue(null);

    await expect(
      service.validerProjetService({
        experience_id: 'exp-1',
        utilisateur_id: 'prof-1',
      })
    ).rejects.toThrow('PROJET_INTROUVABLE');
  });

  it('refuse si le statut est invalide', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      statut: 'en_attente',
    });

    await expect(
      service.validerProjetService({
        experience_id: 'exp-1',
        utilisateur_id: 'prof-1',
        statut: 'autre',
      })
    ).rejects.toThrow('STATUT_INVALIDE');
  });

  it('met a jour le projet avec le statut demande', async () => {
    prismaMock.valideProjet.findUnique.mockResolvedValue({
      statut: 'en_attente',
    });
    prismaMock.valideProjet.update.mockResolvedValue({ statut: 'valide' });

    const result = await service.validerProjetService({
      experience_id: 'exp-1',
      utilisateur_id: 'prof-1',
      statut: 'valide',
      commentaireProf: 'OK',
    });

    expect(prismaMock.valideProjet.update).toHaveBeenCalledWith({
      where: {
        experience_id_utilisateur_id: {
          experience_id: 'exp-1',
          utilisateur_id: 'prof-1',
        },
      },
      data: {
        statut: 'valide',
        commentaire: 'OK',
        date_d_action: expect.any(Date),
      },
    });
    expect(result).toEqual({ statut: 'valide' });
  });
});
