import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false, // avoid polluting global expect to prevent Playwright conflict
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx,js}'],
    exclude: ['tests/e2e/**/*'],
  },
  esbuild: {
    target: 'node18',
  },
});