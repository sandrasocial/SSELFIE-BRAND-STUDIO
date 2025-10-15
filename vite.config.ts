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
      // Enable JSX features needed for Stack Auth
      jsx: 'automatic',
      jsxImportSource: 'react',
      // Allow use of modern features
      target: ['esnext']
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
      },
      dedupe: ['react', 'react-dom', '@stackframe/react']
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@stackframe/react'],
      force: true
    },

    root: path.resolve(__dirname, "client"),
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
      chunkSizeWarningLimit: 1000, // Increase warning limit
      rollupOptions: {
        input: path.resolve(__dirname, "client/index.html"),
        output: {
          manualChunks: (id) => {
            // Core vendor chunk
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/@stackframe/react')) {
              return 'vendor-core';
            }
            // UI components chunk
            if (id.includes('node_modules/@radix-ui/') ||
                id.includes('node_modules/cmdk/') ||
                id.includes('node_modules/lucide-react/')) {
              return 'vendor-ui';
            }
            // Utils chunk
            if (id.includes('node_modules/')) {
              return 'vendor-utils';
            }
            // Async components chunk
            if (id.includes('/components/ui/')) {
              return 'async-components';
            }
          },
          inlineDynamicImports: false,
          compact: true,
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/styles.[hash].css';
            }
            return 'assets/[name].[hash][extname]';
          },
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js'
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
