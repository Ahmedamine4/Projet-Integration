// On charge le meme setup d'environnement que les tests auth.
import '../setup/test-env.setup.js';

// Outils Vitest.
import { beforeAll, describe, expect, it, vi } from 'vitest';
// Supertest sert a tester la vraie application Express.
import request from 'supertest';
// Petit helper de securite pour verifier DATABASE_URL.
import { assertInstitutionTestEnvironment } from '../helpers/institution.helpers.js';

// Mock leger de cookie-parser pour laisser app.js s'importer sans dependance reelle.
vi.mock('cookie-parser', () => ({
  default: () => (req, res, next) => {
    req.cookies = req.cookies || {};
    next();
  },
}));

// On importe ensuite la vraie app.
const { default: app } = await import('../../src/app.js');

describe('Institution integration', () => {
  // beforeAll s'execute une seule fois avant la suite.
  beforeAll(() => {
    assertInstitutionTestEnvironment();
  });

  it('GET /api/institutions retourne 404 car la route institution nest pas branchee dans app.js', async () => {
    // Act
    const response = await request(app)
      .get('/api/institutions');

    // Assert
    expect(response.status).toBe(404);
  });
});
