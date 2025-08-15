import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";

// Import all modular route modules
import { setupHealthRoutes } from "./health.ts";
import { setupAuthRoutes } from "./auth.ts";
import { setupUserRoutes } from "./users.ts";
import { setupMayaRoutes } from "./agents/maya.ts";
import { setupVictoriaRoutes } from "./agents/victoria.ts";
import { setupPaymentRoutes } from "./business/payments.ts";

export async function registerNewRoutes(app: Express): Promise<Server> {
  console.log('🚀 REGISTERING MODULAR ROUTES - Breaking down 2,891-line routes.ts');

  // Essential middleware setup
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Trust proxy for deployment
  app.set('trust proxy', true);

  // Register modular routes
  setupHealthRoutes(app);          // Health checks - IMMEDIATE
  await setupAuthRoutes(app);      // Authentication - CRITICAL  
  setupUserRoutes(app);           // User management
  setupMayaRoutes(app);           // Maya AI image generation
  setupVictoriaRoutes(app);       // Victoria AI website builder
  setupPaymentRoutes(app);        // Stripe payments

  console.log('✅ MODULAR ROUTES: All route modules registered successfully');
  console.log('🔧 SERVER STABILITY: Replaced 2,891-line routes.ts with focused modules');

  const httpServer = createServer(app);
  return httpServer;
}