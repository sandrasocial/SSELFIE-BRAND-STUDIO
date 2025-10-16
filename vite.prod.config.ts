import { defineConfig, type UserConfig } from 'vite';
import sharedConfig from './vite.shared.config';
import { mergeConfig } from 'vite';
import path from 'path';
import type { OutputOptions } from 'rollup';

const prodConfig: UserConfig = {
  mode: 'production',
  build: {
    outDir: path.resolve(__dirname, "client/dist"),
    emptyOutDir: true,
    sourcemap: false,
    cssCodeSplit: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
    minify: 'esbuild',
    rollupOptions: {
      input: path.resolve(__dirname, "client/index.html"),
      preserveEntrySignatures: 'strict',
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'stackframe': [
            '@stackframe/react',
            '@stackframe/react/dist/esm/components/auth',
            '@stackframe/react/dist/esm/components/user-button',
            '@stackframe/react/dist/esm/components-page/stack-handler'
          ],
          'radix-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'ui-libs': ['cmdk', 'lucide-react']
        },
        inlineDynamicImports: false,
        experimentalMinChunkSize: 20000,
        compact: true,
        assetFileNames: (info) => {
          if (info.name?.endsWith('.css')) return 'assets/css/[name].[hash][extname]';
          if (info.name?.match(/\.(woff2?|ttf|otf|eot)$/)) return 'assets/fonts/[name].[hash][extname]';
          if (info.name?.match(/\.(png|jpe?g|gif|svg|webp|avif)$/)) return 'assets/img/[name].[hash][extname]';
          return 'assets/[name].[hash][extname]';
        },
        chunkFileNames: (info) => {
          const prefix = info.name.startsWith('app-') ? 'app' : 
                        info.name.startsWith('vendor-') ? 'vendor' : 
                        'chunks';
          return `assets/js/${prefix}/[name].[hash].js`;
        },
        entryFileNames: 'assets/js/[name].[hash].js'
      } as OutputOptions
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.API_URL || 'https://api.sselfie.com',
        changeOrigin: true,
        secure: true,
        ws: true
      }
    }
  }
};

export default defineConfig(mergeConfig(sharedConfig, prodConfig));