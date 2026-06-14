export default {
  test: {
    environment: 'node',

    include: [
      'tests/unit/**/*.test.js',
      'tests/integration/**/*.test.js',
    ],

    setupFiles: ['tests/setup/test-env.setup.js'],

    restoreMocks: true,
    clearMocks: true,

    // important pour les tests d’intégration avec DB
    fileParallelism: false,

    testTimeout: 30000,
    hookTimeout: 30000,
  },
};
