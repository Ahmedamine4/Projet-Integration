export default {
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.js'],
    exclude: ['node_modules/**', 'dist/**', 'coverage/**'],
    setupFiles: ['./tests/setup/test-env.setup.js'],
    globalSetup: ['./tests/setup/prisma-global.setup.js'],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
};

