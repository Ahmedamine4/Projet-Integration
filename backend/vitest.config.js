import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./test/setup/test-env.setup.js'],
    fileParallelism: false,
    hookTimeout: 30000,
    testTimeout: 30000,
  },
});