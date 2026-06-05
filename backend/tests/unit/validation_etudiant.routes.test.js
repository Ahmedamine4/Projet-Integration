import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const controllerMock = {
  listPendingController: vi.fn((req, res) => res.status(200).json({ route: 'pending' })),
  validateStudentController: vi.fn((req, res) => res.status(200).json({ route: 'decide' })),
};

vi.mock('../../src/controllers/validation_etudiant.controller.js', () => controllerMock);
vi.mock('../../src/middlewares/auth.middleware.js', () => ({
  authMiddleware: (req, res, next) => next(),
  authorizeRoles: () => (req, res, next) => next(),
  ROLES: {
    ADMIN: 'administrateur',
    DIRECTEUR: 'directeur',
    ETUDIANT: 'etudiant',
    PROFESSEUR: 'professeur',
    PROFESSIONNEL: 'professionnel',
  },
}));

const { default: router } = await import('../../src/routes/validation_etudiant.routes.js');

describe('validation_etudiant.routes', () => {
  let app;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/validation', router);
  });

  it('GET /validation/pending/:institutionId appelle listPendingController', async () => {
    const response = await request(app).get('/validation/pending/inst-1');

    expect(response.status).toBe(200);
    expect(controllerMock.listPendingController).toHaveBeenCalled();
  });

  it('PATCH /validation/decide/:etudiantId/:institutionId appelle validateStudentController', async () => {
    const response = await request(app)
      .patch('/validation/decide/u1/inst-1')
      .send({ status: 'refuse' });

    expect(response.status).toBe(200);
    expect(controllerMock.validateStudentController).toHaveBeenCalled();
  });
});
