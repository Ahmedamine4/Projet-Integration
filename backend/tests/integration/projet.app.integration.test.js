import '../setup/test-env.setup.js';

import { describe, expect, it } from 'vitest';
import request from 'supertest';

const { default: app } = await import('../../src/app.js');

describe('projet app integration', () => {
  it('POST /api/add-projet retourne 401 sans accessToken', async () => {
    const response = await request(app)
      .post('/api/add-projet')
      .send({
        projectTitle: 'Projet PFE',
        projectDate: '2026-05-09',
        description: 'Description',
        visibleToEveryone: true,
      });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Token d'authentification manquant",
    });
  });
});
