import { defineConfig, type ProxyOptions, type UserConfig, type ConfigEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { type IncomingMessage, type ServerResponse } from 'http';
import type { Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ⚠️ CRITICAL: Plugin to inject React initialization before any modules load
// This ensures radix-ui and other libraries can access React.forwardRef
const reactInitPlugin = (): Plugin => {
  return {
    name: 'react-init-plugin',
    apply: 'build',
    enforce: 'post',
    generateBundle(options, bundle) {
      // Find the entry HTML file
      const htmlFile = Object.keys(bundle).find(key => key.endsWith('.html'));
      if (!htmlFile) return;

      const html = bundle[htmlFile];
      if (html.type !== 'asset') return;

      let htmlContent = html.source as string;

      // Inject inline React initialization script BEFORE the module script
      const reactInitScript = `
<script>
// ⚠️ CRITICAL: Initialize React globally BEFORE any modules load
// This must run synchronously before any ES modules execute
(function() {
  // Create a marker that React is being initialized
  window.__REACT_INIT_STARTED__ = true;
  console.log('⏳ React initialization started...');
})();
</script>`;

      // Insert the script before the module script tag
      htmlContent = htmlContent.replace(
        /<script type="module"/,
        reactInitScript + '\n    <script type="module"'
      );

      html.source = htmlContent;
    }
  };
};

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
    }),
    reactInitPlugin()
  ];
  
  return {
    plugins,
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      target: ['esnext'],
      legalComments: 'none',
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
        '@stackframe/react',
        '@tanstack/react-query',
        '@tanstack/query-core'
      ]
    },
    optimizeDeps: {
      // ⚠️ CRITICAL: Include yup and its dependencies for proper pre-bundling
      // yup is used by @stackframe/react and needs to be bundled with tiny-case
      include: [
        'react',
        'react-dom',
        'use-sync-external-store/shim',
        'wouter',
        
        'yup',
        'tiny-case',
        'property-expr',
        'toposort',
        'normalize-wheel',
        'color',
        'queue-microtask',
        'content-type',
        'qrcode',
        'simple-swizzle',
        'color-string',
        'color-name',
        'color-convert',
      ],
      exclude: [
        '@radix-ui',
        'cmdk',
        'lucide-react',
        '@stackframe/react',
        'recharts',
        'react-redux',
        'pend',
        'callsites',
        '@alloc/quick-lru',
        'pg-int8',
        'node-gyp-build',
        '@pkgjs/parseargs',
        'yauzl-promise'
      ],
      force: false,
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
            : 'http://localhost:5173',
          changeOrigin: true,
          secure: process.env.NODE_ENV === 'production',
          ws: true,
          bypass: (req) => {
            // Don't proxy health checks during dev - they'll fail anyway
            if (req.url?.includes('/api/health') || req.url?.includes('/api/ping')) {
              return '/dev-null';
            }
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
      sourcemap: true,
      cssCodeSplit: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 2000,
      minify: process.env.NODE_ENV === 'production' ? 'esbuild' : false,
      commonjsOptions: {
        // Ensure CommonJS modules are properly converted
        transformMixedEsModules: true,
        esmExternals: true,
        defaultIsModuleExports: true,
        include: [/node_modules/],
        extensions: ['.js', '.cjs']
      },
      rollupOptions: {
        input: path.resolve(__dirname, "client/index.html"),
        output: {
          manualChunks: (id) => {
            // ⚠️ CRITICAL: react-global MUST be in its own chunk that loads first
            if (id.includes('client/src/react-global')) {
              return 'react-global';
            }

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