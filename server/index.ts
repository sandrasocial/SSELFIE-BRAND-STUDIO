
import "./env-setup.js";
import express from 'express';
import path from 'path';
import { registerRoutes } from './routes';
import { securityHeaders, inputValidation } from './middleware/security';
import { rateLimits } from './middleware/rate-limiter';
import { cacheMiddleware, staticDataCache } from './utils/cache';
import { Logger } from './utils/logger';
import { liveSessionsManager } from './realtime/live-sessions';
import { LIVE_SOCKET_ENABLED } from './env';

const app = express();
const logger = new Logger('Server');

// Trust proxy for rate limiting
app.set('trust proxy', true);

// Security middleware
app.use(securityHeaders);
app.use(inputValidation);

// Rate limiting
app.use(rateLimits.general);

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
    env: process.env.NODE_ENV || 'development'
  });
});
app.get('/', (req, res) => {
  res.status(200).send('SSELFIE Studio API');
});

// Register all routes (async for test compatibility)
async function setupApp() {
  try {
    console.log('🚀 Setting up SSELFIE Studio server...');
    
    // Setup static file serving based on environment
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      // In production, Vercel handles static files via vercel.json routes
      // Only serve attached assets (user uploads, etc.)
      app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
      console.log('📁 Production: Vercel handling static files, serving attached assets only');
    } else {
      // Development mode: serve built files if they exist
      const distPath = path.join(process.cwd(), 'client', 'dist');
      if (require('fs').existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use('/assets', express.static(path.join(distPath, 'assets')));
        app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
        
        // SPA fallback for development
        app.get('*', (req, res) => {
          if (req.path.startsWith('/api/') || req.path === '/health') {
            return;
          }
          res.sendFile(path.join(distPath, 'index.html'));
        });
        console.log('📁 Development: Serving static files from client/dist');
      }
    }
    
    // Register API routes and get HTTP server
    const server = await registerRoutes(app);
    
    // Initialize Socket.IO for real-time features if enabled
    if (LIVE_SOCKET_ENABLED) {
      liveSessionsManager.initialize(server);
      console.log('🔄 Socket.IO real-time server initialized');
    } else {
      console.log('⚡ Socket.IO disabled via LIVE_SOCKET_ENABLED environment variable');
    }
    
    console.log('✅ Server setup completed successfully');
  } catch (error) {
    console.error('❌ Server setup failed:', error);
    throw error;
  }
}

// Only auto-run if not in test
if (process.env.NODE_ENV !== 'test') {
  setupApp();
}

export { app, setupApp };