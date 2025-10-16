import { defineConfig, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import type { IncomingMessage, ServerResponse } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const plugins = [
    react({
      jsxRuntime: "automatic",
      jsxImportSource: "react",
      babel: {
        parserOpts: {
          plugins: ['jsx', 'typescript']
        }
      }
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
    css: {
      postcss: {
        plugins: [
          tailwindcss({
            config: './client/tailwind.config.ts'
          }),
          autoprefixer(),
        ],
      },
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, "client", "src"),
        '@shared': path.resolve(__dirname, "shared"),
        '@assets': path.resolve(__dirname, "attached_assets"),
        '@lib': path.resolve(__dirname, "client", "src", "lib"),
        'react': path.resolve(__dirname, "node_modules/react"),
        'react-dom': path.resolve(__dirname, "node_modules/react-dom"),
      },
      dedupe: [
        'react', 
        'react-dom', 
        '@stackframe/react',
        '@stackframe/react/dist/esm/components/auth',
        '@stackframe/react/dist/esm/components/user-button',
        '@stackframe/react/dist/esm/components-page/stack-handler'
      ]
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        '@stackframe/react',
        '@stackframe/react/dist/esm/components/auth/**',
        '@stackframe/react/dist/esm/components/user-button',
        '@stackframe/react/dist/esm/components-page/stack-handler',
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
        jsxImportSource: 'react',
        tsconfigRaw: {
          compilerOptions: {
            experimentalDecorators: true,
            useDefineForClassFields: true,
            jsx: 'preserve',
            module: 'esnext',
            target: 'esnext',
            moduleResolution: 'bundler'
          }
        }
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
          ws: true,
          onError: (err: Error, req: IncomingMessage, res: ServerResponse) => {
            console.error('Proxy error:', err);
            res.writeHead(500, {
              'Content-Type': 'application/json',
            });
            res.end(JSON.stringify({ 
              error: 'Proxy Error',
              message: err.message 
            }));
          }
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
      rollupOptions: {
        input: path.resolve(__dirname, "client/index.html"),
          preserveEntrySignatures: 'allow-extension',
          preserveModules: false,
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
      minify: 'esbuild',
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