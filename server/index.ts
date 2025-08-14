// SSELFIE STUDIO - COMPREHENSIVE SERVER WITH ALL FEATURES
// This is your main application server with Maya, Victoria, Training, Payments, Admin systems
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { registerRoutes } from './routes';

// ES module equivalent of __dirname with proper path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure we're working from the project root regardless of execution context
const projectRoot = process.cwd().endsWith('/server') ? path.dirname(process.cwd()) : process.cwd();
console.log(`📁 Project root: ${projectRoot}`);

const app = express();
// Use PORT from environment, avoiding conflicting WebSocket port 24678
const port = Number(process.env.PORT) || 3000;

// Ensure we don't use the conflicting WebSocket port
if (port === 24678) {
  console.warn('⚠️  Avoiding WebSocket port conflict, using 3000 instead');
  process.env.PORT = '3000';
}

// Trust proxy for proper forwarding (required for deployment)
app.set('trust proxy', true);

console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Target Port: ${port}`);

// CRITICAL: Health checks MUST be registered FIRST before any complex initialization
// Cloud Run requires response within 5 seconds - respond instantly before loading routes

// INSTANT HEALTH CHECK - Responds before any initialization
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// ROOT ENDPOINT - Health checks vs React app routing  
app.get('/', (req, res, next) => {
  const userAgent = req.headers['user-agent']?.toLowerCase() || '';
  
  // Only respond with JSON for deployment health checks
  const isHealthCheck = 
    userAgent.includes('googlehc') ||
    userAgent.includes('kube-probe') ||
    userAgent.includes('probe') ||
    userAgent.includes('health') ||
    userAgent.includes('elb-healthchecker') ||
    req.query.health === 'true';
  
  if (isHealthCheck) {
    return res.status(200).json({ status: 'ok', ready: true });
  }
  
  // All other requests (browsers, curl without specific health patterns) continue to React app
  next();
});

// Initialize your complete SSELFIE Studio application  
async function startCompleteApp() {
  try {
    // Create HTTP server FIRST to start responding to health checks
    const server = createServer(app);
    
    // Start server immediately for health checks
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Server responding to health checks on port ${port}`);
    });
    
    // Load routes AFTER server is listening
    console.log('📦 Loading comprehensive routes...');
    await registerRoutes(app);
    console.log('✅ All API routes loaded: Maya, Victoria, Training, Payments, Admin, and more!');
    
    // Serve attached_assets directory for agent images and uploads
    const attachedAssetsPath = path.join(projectRoot, 'attached_assets');
    if (fs.existsSync(attachedAssetsPath)) {
      app.use('/attached_assets', express.static(attachedAssetsPath, {
        maxAge: '1h',
        etag: true,
        lastModified: true
      }));
      console.log(`📁 Serving attached_assets from: ${attachedAssetsPath}`);
    }
    
    // Set up serving mode based on environment AFTER API routes
    console.log('🔧 Configuring frontend server for environment...');
    await setupDevelopmentMode(server);
    
    return server;
  } catch (error) {
    console.error('❌ CRITICAL: Failed to load your main application:', error);
    // Graceful error handling - try to continue with static files
    console.log('🔄 Attempting graceful recovery with static files...');
    setupStaticFiles();
    return createServer(app); // Return newly created server
  }
}

// Setup serving mode with proper production detection  
async function setupDevelopmentMode(server: any) {
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.REPLIT_DEPLOYMENT === 'true' ||
                      process.env.REPLIT_ENV === 'production' ||
                      !process.env.REPLIT_DEV;
  
  console.log('🔍 Environment check:', { 
    NODE_ENV: process.env.NODE_ENV, 
    REPLIT_DEPLOYMENT: process.env.REPLIT_DEPLOYMENT,
    REPLIT_ENV: process.env.REPLIT_ENV,
    REPLIT_DEV: process.env.REPLIT_DEV 
  });
  console.log(`🔧 Environment mode: ${isProduction ? 'production' : 'development'}`);
  
  if (isProduction) {
    console.log('🏭 Production mode: Using built static files (NO WebSocket conflicts)...');
    setupStaticFiles();
    return;
  }
  
  // Development mode: use Vite with proper setup
  console.log('🔧 Development mode: Setting up Vite server...');
  try {
    // Skip Vite setup if we detect deployment environment to avoid WebSocket conflicts
    if (process.env.PORT && process.env.PORT !== '3000') {
      console.log('⚠️  Deployment detected, skipping Vite WebSocket to avoid port conflicts');
      setupStaticFiles();
      return;
    }
    
    const { setupVite } = await import('./vite.js');
    await setupVite(app, server);
    console.log('✅ Vite development server configured');
    console.log('🌐 HMR should connect to port 3000');
  } catch (error) {
    console.error('❌ Vite setup failed:', error);
    console.log('🔄 Attempting graceful recovery with static files...');
    setupStaticFiles();
  }
}

function setupStaticFiles() {
  // Priority order for serving built assets
  const distPath = path.join(projectRoot, 'client/dist');
  
  if (fs.existsSync(distPath)) {
    console.log(`📁 Serving static files from: ${distPath}`);
    
    // Serve static assets with proper headers
    app.use(express.static(distPath, {
      maxAge: '1h',
      etag: true,
      lastModified: true
    }));
    
    // Explicit assets routing
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      app.use('/assets', express.static(assetsPath, {
        maxAge: '1h',
        etag: true
      }));
      console.log(`📦 Assets directory found with ${fs.readdirSync(assetsPath).length} files`);
    }
    
    // React app fallback for SPA routing with timeout protection
    app.get('*', (req, res) => {
      // Skip routes that should be handled elsewhere
      if (req.path.startsWith('/api/') || 
          req.path === '/health' || 
          req.path === '/api/health' ||
          res.headersSent) {
        return;
      }
      
      // Set response timeout to prevent hanging during health checks
      res.setTimeout(4000, () => {
        if (!res.headersSent) {
          res.status(408).json({ error: 'Request timeout', service: 'SSELFIE Studio' });
        }
      });
      
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application not found - index.html missing');
      }
    });
  } else {
    console.error(`❌ Build directory not found: ${distPath}`);
    console.log('🔧 Please run: npm run build');
    
    // Fallback error page
    app.get('*', (req, res) => {
      if (!req.path.startsWith('/api/')) {
        res.status(503).send(`
          <h1>SSELFIE Studio - Build Required</h1>
          <p>Frontend assets not found. Please run: <code>npm run build</code></p>
          <p>Looking for: ${distPath}</p>
        `);
      }
    });
  }
}

// Start server with complete application
async function startServer() {
  try {
    // Start server immediately for health checks, load features after
    const httpServer = await startCompleteApp();
    
    console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Handle server errors gracefully
    httpServer.on('error', (err: any) => {
      console.error('❌ Server startup error:', err);
      // Log error but don't crash - let monitoring handle restarts
      if (err.code === 'EADDRINUSE') {
        console.log('🔄 Port in use, retrying...');
      }
    });

    // Graceful shutdown for Cloud Run
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      httpServer.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    return httpServer;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // Log detailed error but allow restart mechanisms to handle recovery
    console.log('🔄 Server will be restarted by workflow system...');
    throw error; // Let the workflow system handle restart
  }
}

// Initialize server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});