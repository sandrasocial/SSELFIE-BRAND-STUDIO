import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      // Force single copy of React
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // Project aliases
      '@': path.resolve(__dirname, 'client/src'),
      '@components': path.resolve(__dirname, 'client/src/components'),
      '@lib': path.resolve(__dirname, 'client/src/lib'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'client/public'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          utils: ['lodash', 'date-fns'],
          auth: ['@auth/*'],
          features: ['@features/*']
        },
        inlineDynamicImports: false
      },
      treeshake: {
        moduleSideEffects: true,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 8192
  },
  esbuild: {
    drop: ['console', 'debugger'],
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    legalComments: 'none'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lodash', 'date-fns']
  },
  server: {
    port: 5173,
    hmr: {
      port: 5174,
    },
  },
});
