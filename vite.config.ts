import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

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
      define: { global: 'globalThis' }
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          useDefineForClassFields: true,
          jsx: 'preserve'
        }
      },
      banner: '/* eslint-disable */\n"use client";'
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
      'react': path.resolve(__dirname, "node_modules/react"),
      'react-dom': path.resolve(__dirname, "node_modules/react-dom"),
      '@stackframe/react': path.resolve(__dirname, "node_modules/@stackframe/react"),
    },
      dedupe: ['react', 'react-dom', '@stackframe/react']
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
          'use client': 'false',
          'use server': 'false'
        },
        supported: {
          'use-client': true,
          'use-server': true
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
    },    root: path.resolve(__dirname, "client"),
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: path.resolve(__dirname, "client/dist"),
      emptyOutDir: true,
      sourcemap: process.env.NODE_ENV !== 'production',
      cssCodeSplit: false,
      reportCompressedSize: false, // Disable for faster builds
      chunkSizeWarningLimit: 2000, // Increased limit for large modules
      rollupOptions: {
        input: path.resolve(__dirname, "client/index.html"),
        preserveEntrySignatures: 'strict',
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react')) {
                return 'vendor-react';
              }
              if (id.includes('@stackframe')) {
                return 'vendor-stackframe';
              }
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              if (id.includes('lucide-react') || id.includes('cmdk')) {
                return 'vendor-ui';
              }
              return 'vendor';
            }
            if (id.includes('/components/')) {
              return 'components';
            }
            if (id.includes('/pages/')) {
              return 'pages';
            }
            if (id.includes('/features/')) {
              return 'features';
            }
            return null;
          },
          },
          inlineDynamicImports: false,
          experimentalMinChunkSize: 20000, // 20kb
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
      assetsInlineLimit: 4096, // 4kb
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
