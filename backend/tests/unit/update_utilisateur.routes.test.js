import { describe, expect, it } from 'vitest';

describe('update_utilisateur.routes', () => {
  it('simporte correctement et expose les routes attendues', async () => {
    const module = await import('../../src/routes/update_utilisateur.routes.js');
    const router = module.default;

    expect(typeof router).toBe('function');

    const routes = router.stack
      .filter((layer) => layer.route)
      .map((layer) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    expect(routes).toEqual(
      expect.arrayContaining([
        { path: '/update-profile/:userId', methods: ['patch'] },
        { path: '/request-professionnel', methods: ['post'] },
        { path: '/delete-account', methods: ['delete'] },
      ])
    );
  });
});
