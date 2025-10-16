import { defineConfig, type UserConfig } from 'vite';
import sharedConfig from './vite.shared.config';
import { mergeConfig } from 'vite';

const devConfig: UserConfig = {
  mode: 'development',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    },
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    sourcemap: true,
    minify: false
  }
};

export default defineConfig(mergeConfig(sharedConfig, devConfig));