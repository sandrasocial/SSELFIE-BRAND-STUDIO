import type { Express, Request, Response } from "express";
import express from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage.js";
import { requireStackAuth } from './stack-auth.js';
import path from 'path';
import fs from 'fs';

// Core route modules
import utilityRoutes from './routes/modules/utility.js';
import authRoutes from './routes/modules/auth.js';
import aiGenerationRoutes from './routes/modules/ai-generation.js';
import adminRoutes from './routes/modules/admin.js';
import trainingRoutes from './routes/modules/training.js';
import claudeRoutes from './routes/modules/claude.js';

// Feature-specific routes
import emailAutomation from './routes/email-automation.js';
import videoRoutes from './routes/video.js';
import emailManagementRouter from './routes/email-management-routes.js';
import { registerCheckoutRoutes } from './routes/checkout.js';
import verticalSliceRoutes from './routes/vertical-slice.js';
// Reconstructed wrapper function (previously removed during refactor cleanup)
export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server reference (needed for later return)
  const server = createServer(app);

  // Core middleware setup formerly at top-level now inside wrapper
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Register modular routes
  app.use('/', utilityRoutes);
  app.use('/', authRoutes);
  app.use('/', aiGenerationRoutes);
  app.use('/', adminRoutes);
  app.use('/', trainingRoutes);
  app.use('/', claudeRoutes);
  app.use('/api', verticalSliceRoutes);

  // Register feature-specific routes
  app.use('/api/email', emailAutomation);
  app.use('/api', videoRoutes);
  app.use('/api/email-management', emailManagementRouter);
  registerCheckoutRoutes(app);

  // Register concept cards API
  const { default: conceptCardsRouter } = await import('./routes/concept-cards.js');
  app.use('/api/concepts', conceptCardsRouter);


  // Health endpoint (duplicate removed - handled by utility module)

  // Image proxy endpoint - move to utility module later
  app.get('/api/proxy-image', requireStackAuth, async (req: Request, res: Response) => {
    try {
      const { url } = req.query;
      
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Image URL required' });
      }
      
      // Only allow our S3 bucket URLs for security
      if (!url.includes('sselfie-training-zips.s3.') && !url.includes('replicate.delivery')) {
        return res.status(403).json({ error: 'Unauthorized image source' });
      }
      
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SSELFIE-Studio/1.0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      // Set appropriate headers
      res.set({
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
      // Stream the image
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
      
    } catch (error) {
      console.error('❌ Image proxy error:', error);
      res.status(500).json({ error: 'Failed to proxy image' });
    }
  });

  // Register test and development routes
  const testRoutes = await import('./routes/modules/test.js');
  app.use('/', testRoutes.default);
    

  // CRITICAL FIX: Start background monitoring services
  
  // Start Training Completion Monitor
  const { TrainingCompletionMonitor } = await import('./training-completion-monitor.js');
  TrainingCompletionMonitor.getInstance().startMonitoring();
  
  // Start Generation Completion Monitor (CRITICAL: This was missing!)
  const { GenerationCompletionMonitor } = await import('./generation-completion-monitor.js');
  GenerationCompletionMonitor.getInstance().startMonitoring();
  
  // CRITICAL: Start migration monitor to prevent image loss from URL expiration
  const { migrationMonitor } = await import('./migration-monitor.js');
  migrationMonitor.startMonitoring();
  
  // DISABLED: Agent insights causing runtime errors due to missing API endpoints
  // const { AgentContextMonitor } = await import('./services/agent-context-monitor.js');
  // AgentContextMonitor.getInstance().startMonitoring(30); // Check every 30 minutes for launch opportunities
  
  // Additional health endpoint for frontend compatibility
  app.get('/api/health-check', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ ok: true, ts: Date.now() });
  });

  

  // Catch-all for unknown API routes
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });  return server;
}