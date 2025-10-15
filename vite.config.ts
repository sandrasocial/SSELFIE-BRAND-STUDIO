import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import type { UserConfig } from 'vite';
import type { OutputAsset, OutputChunk } from 'rollup';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: UserConfig = {
  plugins: [
    react({ 
      jsxRuntime: "automatic",
      jsxImportSource: "react",
      babel: {
        parserOpts: {
          plugins: ['jsx', 'typescript']
        }
      }
    })
  ],
  define: {
    'globalThis.__STACK_PROJECT_ID__': JSON.stringify(process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be"),
    'globalThis.__STACK_PUBLISHABLE_CLIENT_KEY__': JSON.stringify(process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg"),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.VITE_STACK_PROJECT_ID': JSON.stringify(process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be"),
    'process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY': JSON.stringify(process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg")
  },
  
  esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      target: ['esnext'],
      legalComments: 'none',
      define: { global: 'globalThis' },
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
      postcss: './postcss.config.js',
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
            target: 'esnext'
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
        output: [{
          manualChunks(id: string) {
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
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js'
        }]
      }
    }
  };

export default config;
