import { defineConfig, type ProxyOptions, type UserConfig, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { type IncomingMessage, type ServerResponse } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const plugins = [
    react({
      jsxRuntime: "automatic",
      jsxImportSource: "react",
      babel: {
        parserOpts: {
          plugins: ['jsx', 'typescript']
        }
      },
      // Add better error overlay handling
      include: "**/*.{js,ts,jsx,tsx}",
    })
  ];
  
  return {
    plugins,
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      target: ['esnext'],
      legalComments: 'none',
      define: {
        global: 'globalThis'
      },
      banner: '/* eslint-disable */',
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          useDefineForClassFields: true,
          jsx: 'preserve'
        }
      }
    },
    // PostCSS configuration is in postcss.config.js
    css: {
      postcss: './postcss.config.js'
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, "client", "src"),
        '@shared': path.resolve(__dirname, "shared"),
        '@assets': path.resolve(__dirname, "attached_assets"),
        '@lib': path.resolve(__dirname, "client", "src", "lib"),
      },
      dedupe: [
        'react',
        'react-dom',
        '@stackframe/react'
      ]
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        '@stackframe/react',
        '@radix-ui/**',
        'cmdk',
        'lucide-react'
      ],
      exclude: [],
      force: true,
      esbuildOptions: {
        target: 'esnext',
        define: {
          global: 'globalThis'
        },
        banner: {
          js: '/* eslint-disable */\n"use client";'
        },
        jsx: 'automatic',
        jsxImportSource: 'react'
      }
    },
    root: path.resolve(__dirname, "client"),
    server: {
      proxy: {
        '/api': {
          target: process.env.NODE_ENV === 'production' 
            ? process.env.API_URL || 'https://api.sselfie.com'
            : 'http://localhost:3001',
          changeOrigin: true,
          secure: process.env.NODE_ENV === 'production',
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
      outDir: path.resolve(__dirname, "client/dist"),
      emptyOutDir: true,
      sourcemap: process.env.NODE_ENV !== 'production',
      cssCodeSplit: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
      rollupOptions: {
        input: path.resolve(__dirname, "client/index.html"),
        output: {
          manualChunks: (id) => {
            // Framework chunks
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
              return 'react-core';
            }
            
            // Keep all @stackframe/react code in a single chunk to avoid circular dependencies
            if (id.includes('@stackframe/react')) {
              return 'stackframe';
            }

            // UI library chunks
            if (id.includes('@radix-ui/')) {
              return 'radix-ui';
            }
            if (id.includes('cmdk') || id.includes('lucide-react')) {
              return 'ui-libs';
            }

            // App code chunks
            if (id.includes('client/src/lib/') || id.includes('client/src/utils/')) {
              return 'app-core';
            }
            if (id.includes('client/src/features/')) {
              return 'app-features';
            }
            if (id.includes('client/src/pages/')) {
              return 'app-pages';
            }
            if (id.includes('client/src/components/ui/')) {
              return 'app-ui';
            }
            if (id.includes('client/src/components/')) {
              return 'app-components';
            }
          },
          inlineDynamicImports: false,
          experimentalMinChunkSize: 20000,
          compact: true,
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/css/[name].[hash][extname]';
            }
            if (assetInfo.name?.match(/\.(woff2?|ttf|otf|eot)$/)) {
              return 'assets/fonts/[name].[hash][extname]';
            }
            if (assetInfo.name?.match(/\.(png|jpe?g|gif|svg|webp|avif)$/)) {
              return 'assets/img/[name].[hash][extname]';
            }
            return 'assets/[name].[hash][extname]';
          },
          chunkFileNames: (chunkInfo) => {
            const prefix = chunkInfo.name.startsWith('app-') ? 'app' : 
                         chunkInfo.name.startsWith('vendor-') ? 'vendor' : 
                         'chunks';
            return `assets/js/${prefix}/[name].[hash].js`;
          },
          entryFileNames: 'assets/js/[name].[hash].js'
        }
      },
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
      assetsInlineLimit: 4096,
      modulePreload: {
        polyfill: false
      }
    },
    define: {
      global: 'globalThis',
      'globalThis.__STACK_PROJECT_ID__': JSON.stringify(process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be"),
      'globalThis.__STACK_PUBLISHABLE_CLIENT_KEY__': JSON.stringify(process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg"),
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        VITE_STACK_PROJECT_ID: process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be",
        VITE_STACK_PUBLISHABLE_CLIENT_KEY: process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg"
      }),
      __STACK_PROJECT_ID__: JSON.stringify(process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be"),
      __STACK_PUBLISHABLE_CLIENT_KEY__: JSON.stringify(process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg"),
    },
  };
});