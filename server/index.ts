import "./env-setup.js";

import express from 'express';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './routes.js';
import { securityHeaders, inputValidation } from './middleware/security.js';
import { rateLimits } from './middleware/rate-limiter.js';
import { cacheMiddleware, staticDataCache } from './utils/cache.js';
import { Logger } from './utils/logger.js';
import { liveSessionsManager } from './realtime/live-sessions.js';
import { LIVE_SOCKET_ENABLED } from './env.js';

const app = express();
const logger = new Logger('Server');

// Trust proxy for rate limiting
app.set('trust proxy', true);

// SHARED MIDDLEWARE - Runs in both development and production
// Security middleware
app.use(securityHeaders);
app.use(inputValidation);

// Rate limiting
app.use(rateLimits.general);

// SHARED ROUTES - Available in both environments
// Health and root endpoints with caching
app.get('/health', cacheMiddleware(staticDataCache, 30), (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SSELFIE Studio',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', cacheMiddleware(staticDataCache, 30), (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env['NODE_ENV'] || 'development'
  });
});

app.get('/', (req, res) => {
  res.status(200).send('SSELFIE Studio API');
});

// Register all routes (async for test compatibility)
async function setupApp() {
  try {
    // Register API routes FIRST - these run in both environments
    const server = await registerRoutes(app);

    // ENVIRONMENT-SPECIFIC CLIENT SERVING
    const isProduction = process.env['NODE_ENV'] === 'production';

    if (isProduction) {
      // PRODUCTION: Serve static files from built client
      logger.info('🚀 Starting production server with static file serving');
      
      // Serve user uploaded assets
      app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
      
      // Serve built client files
      const distPath = path.join(process.cwd(), 'client', 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use('/assets', express.static(path.join(distPath, 'assets')));
        
        // SPA fallback - serve index.html for all non-API routes
        app.get('*', (req, res) => {
          // Skip API routes and health checks
          if (req.path.startsWith('/api/') || req.path === '/health') {
            return res.status(404).json({ error: 'Not found' });
          }
          res.sendFile(path.join(distPath, 'index.html'));
        });
      } else {
        logger.warn('⚠️  Client dist folder not found in production mode');
      }
    } else {
      // DEVELOPMENT: Integrate with Vite dev server
      logger.info('🛠️  Starting development server with Vite integration');
      
      // Serve user uploaded assets
      app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
      
      try {
        // Dynamic import Vite to avoid bundling issues
        const { createServer } = await import('vite');
        
        // Create Vite server in middleware mode
        const vite = await createServer({
          server: { middlewareMode: true },
          appType: 'spa',
          root: path.join(process.cwd(), 'client'),
        });
        
        // Use Vite's middleware for handling client requests
        app.use(vite.middlewares);
        
        logger.info('✅ Vite dev server middleware integrated');
      } catch (error) {
        logger.error('❌ Failed to setup Vite dev server:', { error: error instanceof Error ? error.message : String(error) });
        
        // Fallback: Check if client is built and serve statically
        const distPath = path.join(process.cwd(), 'client', 'dist');
        if (fs.existsSync(distPath)) {
          logger.info('📁 Falling back to serving built client files');
          app.use(express.static(distPath));
          app.use('/assets', express.static(path.join(distPath, 'assets')));
          
          // SPA fallback for development
          app.get('*', (req, res) => {
            if (req.path.startsWith('/api/') || req.path === '/health') {
              return res.status(404).json({ error: 'Not found' });
            }
            res.sendFile(path.join(distPath, 'index.html'));
          });
        } else {
          logger.warn('⚠️  No Vite server and no built client found. Client routes will not work.');
        }
      }
    }

    // Initialize Socket.IO for real-time features if enabled
    if (LIVE_SOCKET_ENABLED) {
      liveSessionsManager.initialize(server);
    }

    // Start the server
    const port = Number(process.env['PORT']) || 5000;
    server.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${port} (${isProduction ? 'production' : 'development'} mode)`);
    });

    return server;
  } catch (error) {
    console.error('❌ Server setup failed:', error);
    throw error;
  }
}

// Only auto-run if not in test
if (process.env['NODE_ENV'] !== 'test') {
  setupApp();
}

export { app, setupApp };
