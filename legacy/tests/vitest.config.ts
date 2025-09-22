import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['server/__tests__/**/*.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
