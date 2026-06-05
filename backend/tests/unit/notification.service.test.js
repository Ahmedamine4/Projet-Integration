import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  notification: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
  },
};

vi.mock('../../src/config/prisma.js', () => ({
  default: prismaMock,
}));

const service = await import('../../src/services/notification.service.js');

describe('notification.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getNotifications retourne les notifications triees', async () => {
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

  it('marquerCommeLue refuse si la notification appartient a un autre utilisateur', async () => {
    prismaMock.notification.findUnique.mockResolvedValue({
      notification_id: 'n1',
      utilisateur_cible_id: 'u2',
    });

    await expect(service.marquerCommeLue('n1', 'u1')).rejects.toThrow(
      'Notification non trouvee ou acces refuse'
    );
  });

  it('creerNotification cree une notification non lue avec source optionnelle', async () => {
    prismaMock.notification.create.mockResolvedValue({ notification_id: 'n1' });

    const result = await service.creerNotification(
      'u1',
      'Message',
      'validation_stage',
      { utilisateurSourceId: 'u2' }
    );

    expect(prismaMock.notification.create).toHaveBeenCalledWith({
      data: {
        message: 'Message',
        type: 'validation_stage',
        lu: false,
        date_notification: expect.any(Date),
        utilisateur_cible_id: 'u1',
        utilisateur_source_id: 'u2',
      },
    });
    expect(result).toEqual({ notification_id: 'n1' });
  });
});
