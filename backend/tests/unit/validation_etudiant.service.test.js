import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  valideEtudiant: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
};

const creerNotificationMock = vi.fn();

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/services/notification.service.js', () => ({
  creerNotification: creerNotificationMock,
}));

const service = await import('../../src/services/validation_etudiant.service.js');

describe('validation_etudiant.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getPendingValidations retourne les demandes en attente', async () => {
    prismaMock.valideEtudiant.findMany.mockResolvedValue([{ utilisateur_id: 'u1' }]);

    const result = await service.getPendingValidations('inst-1');

    expect(prismaMock.valideEtudiant.findMany).toHaveBeenCalledWith({
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

  it('updateValidationStatus met a jour le statut et notifie l etudiant', async () => {
    prismaMock.valideEtudiant.update.mockResolvedValue({ statut: 'refuse' });

    const result = await service.updateValidationStatus('u1', 'inst-1', 'refuse', {
      utilisateurSourceId: 'dir-1',
    });

    expect(prismaMock.valideEtudiant.update).toHaveBeenCalledWith({
      where: {
        utilisateur_id_institution_id: {
          utilisateur_id: 'u1',
          institution_id: 'inst-1',
        },
      },
      data: {
        statut: 'refuse',
        date: expect.any(Date),
      },
    });
    expect(creerNotificationMock).toHaveBeenCalledWith(
      'u1',
      "Votre demande de liaison a l'institution a ete refusee.",
      'validation_institution',
      { utilisateurSourceId: 'dir-1' }
    );
    expect(result).toEqual({ statut: 'refuse' });
  });
});
