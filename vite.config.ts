import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(async ({ mode }) => {
  const plugins = [
    react({ jsxRuntime: "automatic" })
  ];
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
        input: path.resolve(import.meta.dirname, "client/index.html")
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
