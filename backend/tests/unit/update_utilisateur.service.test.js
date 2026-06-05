import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  utilisateur: {
    update: vi.fn(),
    findUnique: vi.fn(),
  },
};

const bcryptMock = {
  compare: vi.fn(),
  genSalt: vi.fn(),
  hash: vi.fn(),
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('bcryptjs', () => ({
  default: bcryptMock,
}));

const service = await import('../../src/services/update_utilisateur.service.js');

describe('update_utilisateur.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updateNom met a jour le nom', async () => {
    prismaMock.utilisateur.update.mockResolvedValue({ utilisateur_id: 'u1', nom: 'Nom' });

    const result = await service.updateNom('u1', 'Nom');

    expect(prismaMock.utilisateur.update).toHaveBeenCalledWith({
      where: { utilisateur_id: 'u1' },
      data: { nom: 'Nom' },
      select: { utilisateur_id: true, nom: true },
    });
    expect(result).toEqual({ utilisateur_id: 'u1', nom: 'Nom' });
  });

  it("updatePassword refuse si l'ancien mot de passe est faux", async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      utilisateur_id: 'u1',
      mot_de_passe: 'hash',
    });
    bcryptMock.compare.mockResolvedValue(false);

    await expect(
      service.updatePassword('u1', 'old-pass', 'new-pass')
    ).rejects.toThrow("L'ancienne mot de passe est incorrecte!");
  });

  it('updateEmail refuse si lemail existe deja', async () => {
    prismaMock.utilisateur.findUnique.mockResolvedValue({ utilisateur_id: 'u2' });

    await expect(service.updateEmail('u1', 'used@example.com')).rejects.toThrow(
      'Cet email est déjà utilisé par un autre compte!'
    );
  });
});
