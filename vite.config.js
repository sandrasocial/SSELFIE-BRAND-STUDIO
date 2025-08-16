import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
    plugins: [
        react(),
        runtimeErrorOverlay(),
        ...(process.env.NODE_ENV !== "production" &&
            process.env.REPL_ID !== undefined
            ? [
                await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
            ]
            : []),
        // Add a plugin to setup the Express backend
        {
            name: 'express-backend',
            configureServer: async (server) => {
                try {
                    // Setup API routes using Express middleware
                    const express = await import('express');
                    const { registerRoutes } = await import('../server/routes.js');
                    
                    const app = express.default();
                    app.use(express.default.json({ limit: '50mb' }));
                    app.use(express.default.urlencoded({ extended: true, limit: '50mb' }));
                    
                    await registerRoutes(app);
                    server.middlewares.use('/api', app);
                } catch (error) {
                    console.log('Backend setup failed, running frontend only:', error.message);
                }
            }
        }
    ],
    resolve: {
        alias: {
            "@": path.resolve(import.meta.dirname, "client", "src"),
            "@shared": path.resolve(import.meta.dirname, "shared"),
            "@assets": path.resolve(import.meta.dirname, "attached_assets"),
        },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true,
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        fs: {
            strict: false,
            allow: ['..']
        },
    },
});
