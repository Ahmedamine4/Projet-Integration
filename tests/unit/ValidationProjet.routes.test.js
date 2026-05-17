import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const controllerMock = {
  validerProjet: vi.fn((req, res) => res.status(200).json({ route: 'validprojets' })),
};

const middlewareMock = {
  authMiddleware: vi.fn((req, res, next) => {
    req.user = { utilisateur_id: 'prof-1', role: 'professeur' };
    next();
  }),
  authorizeRoles: vi.fn(() => (req, res, next) => next()),
  ROLES: {
    PROFESSEUR: 'professeur',
  },
};

vi.mock('../../src/controllers/ValideProjet.controller.js', () => controllerMock);
vi.mock('../../src/middlewares/auth.middleware.js', () => middlewareMock);

const { default: router } = await import('../../src/routes/ValidationProjet.routes.js');

describe('ValidationProjet.routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api', router);
  });

  it('PUT /api/validprojets/:id appelle le controller', async () => {
    const response = await request(app)
      .put('/api/validprojets/12')
      .send({ statut: 'valide' });

    expect(response.status).toBe(200);
    expect(middlewareMock.authMiddleware).toHaveBeenCalled();
    expect(controllerMock.validerProjet).toHaveBeenCalled();
  });
});
