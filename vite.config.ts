import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  const plugins = [
    react({ jsxRuntime: "automatic" })
  ];
  
  // Validate required public environment variables
  const requiredPublicEnvVars = [
    'VITE_STACK_PROJECT_ID',
    'VITE_STACK_PUBLISHABLE_CLIENT_KEY'
  ];
  
  for (const envVar of requiredPublicEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required public environment variable: ${envVar}`);
    }
  }
  
  return {
    plugins,
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

    // 🔒 Force a single React copy for the whole graph
    resolve: {
      alias: {
        // lock React to the root node_modules so sub-deps can’t sneak in a second copy
        react: path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),

        // your existing aliases (unchanged)
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },

    // your existing root/build/server config (unchanged)
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "client/dist"),
      emptyOutDir: true,
      // Better CommonJS support
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true
      },
      // Optimize bundle size
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        input: path.resolve(__dirname, "client/index.html"),
        output: {
          format: 'es',
          manualChunks: {
            // Minimal chunking - only separate the most problematic dependencies
            'vendor': ['react', 'react-dom'],
            'stackauth': ['@stackframe/react', '@stackframe/stack']
          },
          // Conservative interop settings
          interop: 'compat',
          exports: 'named'
        },
        external: [],
      },
      // Enable source maps for debugging
      sourcemap: mode === 'development',
      // Optimize minification - use esbuild (faster, no extra deps)
      minify: 'esbuild',
    },
    server: {
      host: "0.0.0.0",
      port: parseInt(process.env['PORT'] || "8080"),
      fs: { strict: false },
    },

    // helpful nudges for prebundling and SSR
    optimizeDeps: {
      include: [
        "react", 
        "react-dom", 
        "react/jsx-runtime",
        "@tanstack/react-query",
        "wouter",
        "@stackframe/react"
      ],
      force: true
    },
    ssr: {
      noExternal: ["@stackframe/react"],
    },
    define: {
      global: 'globalThis',
      // 🔥 CRITICAL FIX: Stack Auth expects Next.js style environment variables
      // Define both globalThis prefix and process.env for full compatibility
      'globalThis.__STACK_PROJECT_ID__': JSON.stringify(process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be"),
      'globalThis.__STACK_PUBLISHABLE_CLIENT_KEY__': JSON.stringify(process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg"),
      // Stack Auth checks process.env (Next.js style)
      'globalThis.process': JSON.stringify({ 
        env: {
          NEXT_PUBLIC_STACK_PROJECT_ID: process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be",
          NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY: process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg",
          // Also provide Vite-style variables
          VITE_STACK_PROJECT_ID: process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be",
          VITE_STACK_PUBLISHABLE_CLIENT_KEY: process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg"
        }
      }),
      // Also define without globalThis for backwards compatibility
      __STACK_PROJECT_ID__: JSON.stringify(process.env.VITE_STACK_PROJECT_ID || "253d7343-a0d4-43a1-be5c-822f590d40be"),
      __STACK_PUBLISHABLE_CLIENT_KEY__: JSON.stringify(process.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || "pck_bqv6htnwq1f37nd2fn6qatxx2f8x0tnxvjj7xwgh1zmhg"),
    },
  };
});
