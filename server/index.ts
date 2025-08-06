import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { TrainingCompletionMonitor } from "./training-completion-monitor";
import { registerCoverImageRoutes } from "./routes/cover-image-routes";
import { unifiedAgentSystem } from "./unified-agent-system";
import cors from "cors";

// ADD: Admin bypass system - ZERO API COSTS for admin operations
import { adminBypass } from './middleware/admin-bypass.js';
import adminToolsRouter from './routes/admin-tools.js';

// 🚀 ENHANCED SERVICES INTEGRATION - ZARA COORDINATION
// CRITICAL: Initialize Hybrid Intelligence System at startup
import { hybridIntelligence } from "./services/initialize-hybrid-intelligence";
import { webSearchOptimization } from "./services/web-search-optimization";
import { taskDependencyMapping } from "./services/task-dependency-mapping";
import { progressTracking } from "./services/progress-tracking";
// Removed unused service imports to fix LSP errors

const app = express();

// Add global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.warn('🔄 Unhandled Promise Rejection (non-fatal):', reason);
  // Don't crash the server - log and continue
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  // Only crash if it's a truly fatal error
  if (error.message.includes('EADDRINUSE') || error.message.includes('MODULE_NOT_FOUND')) {
    process.exit(1);
  }
  console.warn('🔄 Continuing operation...');
});

// Add CORS support for cross-origin requests from production domain to dev server
app.use(cors({
  origin: [
    'https://sselfie.ai', 
    'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev',
    'http://localhost:3000',
    'http://localhost:5000'
  ],
  credentials: true, // Important for session cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Add headers for iframe compatibility and image loading
app.use((req, res, next) => {
  // Allow framing for visual editor iframe
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Set referrer policy for better image loading
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  
  // Remove restrictive CSP headers completely for development
  // This allows Stripe.js and other external scripts to load without restrictions
  
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add static file serving for public directory (flatlays, etc.) BEFORE routes
app.use(express.static('public'));

// ADD: Admin bypass middleware - ZERO API COSTS for admin operations
app.use(adminBypass); // Global middleware

(async () => {
  const server = await registerRoutes(app);
  
  // ADD: Admin tools routes - Direct system access without Claude API
  app.use('/api/admin-tools', adminToolsRouter);
  
  // Register cover image routes for Flux approval system
  registerCoverImageRoutes(app);

  // 🧠 CRITICAL: Initialize HYBRID INTELLIGENCE SYSTEM
  // This connects all advanced services (memory, cross-learning, enterprise tools)
  // MUST happen before agent system initialization
  await hybridIntelligence.initialize();
  console.log('✅ HYBRID INTELLIGENCE: All advanced services connected and operational');

  // 🎯 CRITICAL: Initialize UNIFIED AGENT SYSTEM
  // This replaces 58+ competing agent integration files with ONE system
  // Eliminates decision paralysis causing agents to default to analysis mode
  await unifiedAgentSystem.initialize(app, server);
  console.log('✅ UNIFIED AGENT SYSTEM: Decision paralysis resolved, single integration active');

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Start the training completion monitor
  const monitor = TrainingCompletionMonitor.getInstance();
  monitor.startMonitoring();
  console.log('🚀 Training Completion Monitor started - will check for stuck trainings every 2 minutes');

  // 🎬 MAYA GENERATION TRACKER POLLING SYSTEM
  // Automatically checks processing generation trackers and migrates to S3
  const generationPollingInterval = setInterval(async () => {
    try {
      console.log('🎬 MAYA GENERATION MONITOR: Checking processing generation trackers...');
      
      // Import storage to access generation trackers
      const { storage } = await import('./storage');
      
      // Get all users' processing generation trackers  
      const { db } = await import('./db');
      const { generationTrackers } = await import('../shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const activeTrackers = await db
        .select()
        .from(generationTrackers)
        .where(eq(generationTrackers.status, 'processing'));
      
      if (activeTrackers.length > 0) {
        console.log(`🎬 Found ${activeTrackers.length} processing generation trackers to check`);
        
        for (const tracker of activeTrackers) {
          const minutesWaiting = Math.round((Date.now() - new Date(tracker.createdAt || new Date()).getTime()) / (1000 * 60));
          console.log(`🎬 Tracker ${tracker.id} (user ${tracker.userId}): ${minutesWaiting} minutes processing`);
          
          if (tracker.predictionId) {
            const { UnifiedGenerationService } = await import('./unified-generation-service');
            await UnifiedGenerationService.checkAndUpdateStatus(tracker.id, tracker.predictionId);
          }
        }
      }
    } catch (error) {
      console.error('Error in generation tracker monitor:', error);
    }
  }, 30 * 1000); // Check every 30 seconds for faster image previews
  
  console.log('🎬 Maya Generation Tracker Monitor started - checking every 30 seconds');

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // For Vercel deployment, export the app instead of starting server
  if (process.env.VERCEL) {
    // Export the Express app for Vercel serverless
    return app;
  }

  // ALWAYS serve the app on port 5000 for development
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = Number(process.env.PORT) || 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
