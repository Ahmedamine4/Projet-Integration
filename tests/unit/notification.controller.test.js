import { beforeEach, describe, expect, it, vi } from 'vitest';

const notificationServiceMock = {
  getNotifications: vi.fn(),
  marquerCommeLue: vi.fn(),
};

vi.mock('../../src/services/notification.service.js', () => notificationServiceMock);

const controller = await import('../../src/controllers/notification.controller.js');

function createRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('notification.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMesNotifications retourne 200 avec les notifications', async () => {
    notificationServiceMock.getNotifications.mockResolvedValue([
      { notification_id: 'n1', message: 'Bonjour' },
    ]);

    const req = { user: { utilisateur_id: 'u1' } };
    const res = createRes();

    await controller.getMesNotifications(req, res);

    expect(notificationServiceMock.getNotifications).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ notification_id: 'n1', message: 'Bonjour' }],
    });
  });

  it('lireNotification retourne 200 avec la notification mise a jour', async () => {
    notificationServiceMock.marquerCommeLue.mockResolvedValue({
      notification_id: 'n1',
      lu: true,
    });

    const req = {
      user: { utilisateur_id: 'u1' },
      params: { notificationId: 'n1' },
    };
    const res = createRes();

    await controller.lireNotification(req, res);

    expect(notificationServiceMock.marquerCommeLue).toHaveBeenCalledWith('n1', 'u1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { notification_id: 'n1', lu: true },
    });
  });

  it('retourne 500 si le service echoue', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    notificationServiceMock.getNotifications.mockRejectedValue(new Error('db error'));

    const req = { user: { utilisateur_id: 'u1' } };
    const res = createRes();

    await controller.getMesNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Erreur serveur',
    });

    errorSpy.mockRestore();
  });
});
