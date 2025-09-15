import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// Use async config so dynamic imports are safe
export default defineConfig(async ({ mode }) => {
  const plugins = [
    // React 19 wants the automatic JSX runtime (or just remove the option;
    // default is automatic). "classic" can cause weirdness with modern libs.
    react({ jsxRuntime: "automatic" }),
    runtimeErrorOverlay(),
  ];

  // Only load Cartographer in repl dev env
  if (mode !== "production" && process.env.REPL_ID !== undefined) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    plugins,

    // 🔒 Force a single React copy for the whole graph
    resolve: {
      alias: {
        // lock React to the root node_modules so sub-deps can’t sneak in a second copy
        react: path.resolve(import.meta.dirname, "node_modules/react"),
        "react-dom": path.resolve(import.meta.dirname, "node_modules/react-dom"),

        // your existing aliases (unchanged)
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },

    // your existing root/build/server config (unchanged)
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "client/dist"),
      emptyOutDir: true,
      // Optimize bundle size
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Enable code splitting for better performance
          manualChunks: {
            // Vendor chunks for better caching
            'react-vendor': ['react', 'react-dom'],
            'stack-vendor': ['@stackframe/react', '@stackframe/stack'],
            'query-vendor': ['@tanstack/react-query'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tooltip'],
            'utils-vendor': ['wouter', 'clsx', 'class-variance-authority'],
            // Page chunks for lazy loading
            'pages-auth': [
              './src/pages/simple-training.tsx',
              './src/pages/simple-checkout.tsx',
              './src/pages/payment-success.tsx'
            ],
            'pages-app': [
              './src/pages/BrandStudioPage.tsx',
              './src/pages/AppLayout.tsx'
            ],
            'pages-landing': [
              './src/pages/business-landing.tsx',
              './src/pages/about.tsx',
              './src/pages/how-it-works.tsx'
            ]
          },
          // Optimize chunk naming
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
      },
      // Enable source maps for debugging
      sourcemap: mode === 'development',
      // Optimize minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: parseInt(process.env.PORT || "8080"),
      hmr: {
        host: "fantastic-space-orbit-4j6xjqq799j437w49-5000.app.github.dev",
        protocol: "wss",
        port: 443
      },
      fs: { strict: false },
    },

    // helpful nudges for prebundling and SSR
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    ssr: {
      noExternal: ["@stackframe/react"],
    },
  };
});
