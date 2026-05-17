import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const controllerMock = {
  updatePersonalInformationsController: vi.fn((req, res) =>
    res.status(200).json({ route: 'updated', userId: req.params.userId })
  ),
};

vi.mock('../../src/controllers/update_utilisateur.controller.js', () => controllerMock);

const { default: router } = await import('../../src/routes/update_utilisateur.routes.js');

describe('update_utilisateur.routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/users', router);
  });

  it('PATCH /users/update-profile/:userId appelle le controller', async () => {
    const response = await request(app)
      .patch('/users/update-profile/u1')
      .send({ nom: 'Nom' });

    expect(response.status).toBe(200);
    expect(controllerMock.updatePersonalInformationsController).toHaveBeenCalled();
  });
});
