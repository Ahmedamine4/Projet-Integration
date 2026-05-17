import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  utilisateur: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

const portfolioService = await import('../../src/services/portfolio.service.js');

describe('portfolio.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getAboutByUserId retourne ownerId et about si utilisateur trouve', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      a_propos: 'Texte portfolio',
    });

    const result = await portfolioService.getAboutByUserId('u1');

    expect(prismaMock.utilisateur.findUnique).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u1' },
      select: { utilisateur_id: true, a_propos: true },
    });
    expect(result).toEqual({
      ownerId: 'u1',
      about: 'Texte portfolio',
    });
  });

  it('getAboutByUserId retourne null si utilisateur introuvable', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue(null);

    const result = await portfolioService.getAboutByUserId('u404');

    expect(result).toBeNull();
  });

  it('updateUserAboutByUserId met a jour a_propos et retourne la selection attendue', async () => {
    prismaMock.utilisateur.update.mockResolvedValue({
      utilisateur_id: 'u2',
      a_propos: 'Nouveau texte',
    });

    const result = await portfolioService.updateUserAboutByUserId(
      'u2',
      'Nouveau texte'
    );

    expect(prismaMock.utilisateur.update).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u2' },
      data: { a_propos: 'Nouveau texte' },
      select: { utilisateur_id: true, a_propos: true },
    });
    expect(result).toEqual({
      utilisateur_id: 'u2',
      a_propos: 'Nouveau texte',
    });
  });
});
