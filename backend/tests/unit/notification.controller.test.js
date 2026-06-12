import { beforeEach, describe, expect, it, vi } from 'vitest';

const notificationServiceMock = {
  getNotifications: vi.fn(),
  getNotificationNotread: vi.fn(),
  getHistoriqueActivite: vi.fn(),
  marquerCommeLue: vi.fn(),
  supprimerNotification: vi.fn(),
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
  });

  it('getMesNotifications retourne 500 si le service echoue', async () => {
    notificationServiceMock.getNotifications.mockRejectedValue(new Error('boom'));

    const res = createRes();

    await controller.getMesNotifications({ user: { utilisateur_id: 'u1' } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('getMesNotificationsNonLues retourne 200 avec les notifications non lues', async () => {
    notificationServiceMock.getNotificationNotread.mockResolvedValue([
      { notification_id: 'n2', lu: false },
    ]);

    const req = { user: { utilisateur_id: 'u1' } };
    const res = createRes();

    await controller.getMesNotificationsNonLues(req, res);

    expect(notificationServiceMock.getNotificationNotread).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('getMesNotificationsNonLues retourne 500 si le service echoue', async () => {
    notificationServiceMock.getNotificationNotread.mockRejectedValue(new Error('boom'));

    const res = createRes();

    await controller.getMesNotificationsNonLues({ user: { utilisateur_id: 'u1' } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
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
  });

  it('lireNotification retourne 404 avec le message service si la notification est interdite', async () => {
    notificationServiceMock.marquerCommeLue.mockRejectedValue(
      new Error('Notification non trouvee ou acces refuse')
    );

    const req = {
      user: { utilisateur_id: 'u1' },
      params: { notificationId: 'n1' },
    };
    const res = createRes();

    await controller.lireNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Notification non trouvee ou acces refuse',
    });
  });

  it('supprimerNotificationController retourne 200 si la suppression reussit', async () => {
    notificationServiceMock.supprimerNotification.mockResolvedValue({ notification_id: 'n1' });

    const req = {
      user: { utilisateur_id: 'u1' },
      params: { notificationId: 'n1' },
    };
    const res = createRes();

    await controller.supprimerNotificationController(req, res);

    expect(notificationServiceMock.supprimerNotification).toHaveBeenCalledWith('n1', 'u1');
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('supprimerNotificationController retourne 404 si la notification est introuvable', async () => {
    notificationServiceMock.supprimerNotification.mockRejectedValue(
      new Error('Notification non trouvee ou acces refuse')
    );

    const req = {
      user: { utilisateur_id: 'u1' },
      params: { notificationId: 'n1' },
    };
    const res = createRes();

    await controller.supprimerNotificationController(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('getHistorique retourne 200 avec les notifications historisees', async () => {
    notificationServiceMock.getHistoriqueActivite.mockResolvedValue([
      { notification_id: 'h1', type: 'commentaire_stage' },
    ]);

    const req = { user: { utilisateur_id: 'u1' } };
    const res = createRes();

    await controller.getHistorique(req, res);

    expect(notificationServiceMock.getHistoriqueActivite).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
