import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/database/**/*.test.ts'],
    setupFiles: ['tests/database/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        'server/services/**/*.ts',
        'shared/types/**/*.ts'
      ]
    }
  },
  resolve: {
    alias: {
      '@server': path.resolve(__dirname, './server'),
      '@shared': path.resolve(__dirname, './shared'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});