import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  notification: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
  utilisateur: {
    findUnique: vi.fn(),
  },
};

const envoyerNotificationEmailMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

vi.mock('../../src/utils/sendMailnotif.js', () => ({
  envoyerNotificationEmail: envoyerNotificationEmailMock,
}));

const service = await import('../../src/services/notification.service.js');

describe('notification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNotifications retourne les notifications triees du proprietaire cible', async () => {
    prismaMock.notification.findMany.mockResolvedValue([{ notification_id: 'n1' }]);

    const result = await service.getNotifications('u1');

    expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
      where: { utilisateur_cible_id: 'u1' },
      orderBy: { date_notification: 'desc' },
      include: {
        utilisateur_source: {
          select: {
            utilisateur_id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
      },
    });
    expect(result).toEqual([{ notification_id: 'n1' }]);
  });

  it('getNotificationNotread filtre les notifications non lues', async () => {
    prismaMock.notification.findMany.mockResolvedValue([{ notification_id: 'n2' }]);

    const result = await service.getNotificationNotread('u1');

    expect(prismaMock.notification.findMany).toHaveBeenCalledWith({
      where: { utilisateur_cible_id: 'u1', lu: false },
    });
    expect(result).toEqual([{ notification_id: 'n2' }]);
  });

  it('marquerCommeLue refuse si la notification appartient a un autre utilisateur', async () => {
    prismaMock.notification.findUnique.mockResolvedValue({
      notification_id: 'n1',
      utilisateur_cible_id: 'u2',
    });

    await expect(service.marquerCommeLue('n1', 'u1')).rejects.toThrow(
      'Notification non trouv'
    );
  });

  it('supprimerNotification supprime si la notification appartient au bon utilisateur', async () => {
    prismaMock.notification.findUnique.mockResolvedValue({
      notification_id: 'n1',
      utilisateur_cible_id: 'u1',
    });
    prismaMock.notification.delete.mockResolvedValue({ notification_id: 'n1' });

    const result = await service.supprimerNotification('n1', 'u1');

    expect(prismaMock.notification.delete).toHaveBeenCalledWith({
      where: { notification_id: 'n1' },
    });
    expect(result).toEqual({ notification_id: 'n1' });
  });

  it('creerNotification cree une notification et tente lenvoi email', async () => {
    prismaMock.notification.create.mockResolvedValue({
      notification_id: 'n1',
      utilisateur_source: null,
    });
    prismaMock.utilisateur.findUnique.mockResolvedValue({
      email: 'u1@test.com',
    });

    const result = await service.creerNotification('u1', 'Message', 'validation_stage');

    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: {
        message: 'Message',
        type: 'validation_stage',
        lu: false,
        date_notification: expect.any(Date),
        utilisateur_cible_id: 'u1',
        utilisateur_source_id: null,
      },
      include: {
        utilisateur_source: true,
      },
    });
    expect(envoyerNotificationEmailMock).toHaveBeenCalled();
    expect(result.notification_id).toBe('n1');
  });
});
