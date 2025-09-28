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

  // Critical path entries - only build what we need
  const criticalEntries = {
    main: path.resolve(__dirname, "client/src/main.tsx"),
    maya: path.resolve(__dirname, "client/src/pages/maya.tsx"),
    auth: path.resolve(__dirname, "client/src/pages/auth.tsx"),
    checkout: path.resolve(__dirname, "client/src/pages/checkout.tsx")
  };
  
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
    
    // Only build critical path entries
    build: {
      rollupOptions: {
        input: criticalEntries,
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'wouter'],
            'maya-core': [
              './client/src/components/maya/MayaChat.tsx',
              './client/src/components/maya/MayaGallery.tsx'
            ],
            'auth-core': ['./client/src/components/auth/SignupFlow.tsx'],
            'payment': ['./client/src/components/checkout/PaymentForm.tsx'],
          }
        }
      },
      // Ensure tree-shaking is aggressive
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false
      }
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

    // Optimized build configuration for performance
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "client/dist"),
      emptyOutDir: true,
      // Enhanced chunk optimization
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        input: path.resolve(__dirname, "client/index.html"),
        output: {
          manualChunks(id) {
            // Core vendor dependencies
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'core-vendor';
              }
              if (id.includes('@stackframe') || id.includes('@tanstack')) {
                return 'app-vendor';
              }
              return 'deps';
            }
            // UI components
            if (id.includes('components/ui/') || id.includes('shared/ui/')) {
              return 'ui';
            }
            // Maya-specific code
            if (id.includes('/maya/') || id.includes('MayaComponents/')) {
              return 'maya';
            }
            // Feature modules
            if (id.includes('features/')) {
              const parts = id.split('features/');
              if (parts[1]) {
                const feature = parts[1].split('/')[0];
                return `feature-${feature}`;
              }
            }
            return null;
          }
        }
      },
      // Production optimizations
      target: 'esnext',
      minify: mode === 'production' ? 'terser' : false,
      sourcemap: mode === 'development',
    },
    server: {
      host: "0.0.0.0",
      port: parseInt(process.env['PORT'] || "8080"),
      fs: { strict: false },
    },

    // Optimized dependency handling
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@tanstack/react-query"
      ],
      exclude: ['@ffmpeg/core']
    },
    ssr: {
      noExternal: ["@stackframe/react"],
    },
  };
});
