import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const controllerMock = {
  getMesNotifications: vi.fn((req, res) => res.status(200).json({ route: 'list' })),
  getHistorique: vi.fn((req, res) => res.status(200).json({ route: 'history' })),
  lireNotification: vi.fn((req, res) => res.status(200).json({ route: 'read' })),
};

const authMock = {
  authMiddleware: vi.fn((req, res, next) => {
    req.user = { utilisateur_id: 'u1' };
    next();
  }),
};

vi.mock('../../src/controllers/notification.controller.js', () => controllerMock);
vi.mock('../../src/middlewares/auth.middleware.js', () => authMock);

const { default: router } = await import('../../src/routes/notification.routes.js');

describe('notification.routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/notifications', router);
  });

  it('GET /notifications appelle getMesNotifications', async () => {
    const response = await request(app).get('/notifications');

    expect(response.status).toBe(200);
    expect(authMock.authMiddleware).toHaveBeenCalled();
    expect(controllerMock.getMesNotifications).toHaveBeenCalled();
  });

  it('PATCH /notifications/:id/lire appelle lireNotification', async () => {
    const response = await request(app).patch('/notifications/n1/lire');

    expect(response.status).toBe(200);
    expect(controllerMock.lireNotification).toHaveBeenCalled();
  });

  it('GET /notifications/historique appelle getHistorique', async () => {
    const response = await request(app).get('/notifications/historique');

    expect(response.status).toBe(200);
    expect(controllerMock.getHistorique).toHaveBeenCalled();
  });
});
