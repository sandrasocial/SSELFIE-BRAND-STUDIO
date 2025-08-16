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
                    const { registerRoutes } = await import('./server/routes.ts');
                    
                    const app = express.default();
                    
                    // Create HTTP server for registerRoutes (it expects to return a server)
                    const httpServer = await registerRoutes(app);
                    
                    // Use the Express app as middleware for Vite
                    server.middlewares.use('/api', app);
                    console.log('✅ Backend routes successfully integrated with Vite dev server');
                } catch (error) {
                    console.log('Backend setup failed, running frontend only:', error.message);
                    console.error('Backend error details:', error);
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
