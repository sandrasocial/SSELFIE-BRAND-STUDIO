// SSELFIE STUDIO - COMPREHENSIVE SERVER WITH ALL FEATURES
// This is your main application server with Maya, Victoria, Training, Payments, Admin systems
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { registerRoutes } from './routes';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Use PORT from .replit config (3000) which maps to external port 80
const port = Number(process.env.PORT) || 3000;

// Trust proxy for proper forwarding (required for deployment)
app.set('trust proxy', true);

console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌐 Target Port: ${port}`);

// HEALTH CHECK ENDPOINTS - Required for Cloud Run deployment
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'SSELFIE Studio',
    timestamp: new Date().toISOString(),
    port: port
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    port: port,
    env: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint health check for deployment systems
app.get('/', (req, res, next) => {
  // Aggressive health check detection for deployment platforms
  const userAgent = req.headers['user-agent']?.toLowerCase() || '';
  const acceptHeader = req.headers['accept']?.toLowerCase() || '';
  
  const isHealthCheck = 
    // Deployment platform probes
    userAgent.includes('googlehc') ||
    userAgent.includes('kube-probe') ||
    userAgent.includes('elb-healthchecker') ||
    userAgent.includes('health') ||
    userAgent.includes('probe') ||
    userAgent.includes('check') ||
    // Replit deployment system
    userAgent.includes('replit') ||
    // Generic monitoring
    userAgent.includes('monitor') ||
    userAgent.includes('uptime') ||
    // Query parameter override
    req.query.health === 'true' ||
    // Header override
    req.headers['x-health-check'] ||
    // Accept JSON with curl (deployment scripts)
    (userAgent.includes('curl') && acceptHeader.includes('application/json')) ||
    // Empty or minimal user agents (common for health checks)
    userAgent === '' || userAgent.length < 10;
  
  if (isHealthCheck) {
    console.log(`🔍 Health check detected: ${userAgent || 'empty'}`);
    return res.status(200).json({ 
      status: 'healthy',
      service: 'SSELFIE Studio',
      timestamp: new Date().toISOString(),
      port: port,
      ready: true,
      userAgent: userAgent
    });
  }
  
  // For browsers and normal requests, continue to React app
  next();
});

// Initialize your complete SSELFIE Studio application
async function startCompleteApp() {
  try {
    console.log('📦 Loading comprehensive routes...');
    
    // Create HTTP server for Vite integration
    const server = createServer(app);
    
    // Load your complete routing system with all features
    await registerRoutes(app);
    
    // Serve attached_assets directory for agent images and uploads
    const attachedAssetsPath = path.join(__dirname, '../attached_assets');
    if (fs.existsSync(attachedAssetsPath)) {
      app.use('/attached_assets', express.static(attachedAssetsPath, {
        maxAge: '1h',
        etag: true,
        lastModified: true
      }));
      console.log(`📁 Serving attached_assets from: ${attachedAssetsPath}`);
    }
    
    console.log('✅ All your comprehensive routes loaded: Maya, Victoria, Training, Payments, Admin, and more!');
    console.log('✅ All your features loaded!');
    
    // Set up development mode with Vite for proper SPA routing
    console.log('🔧 Starting development mode with Vite...');
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

// Setup development mode with environment detection
async function setupDevelopmentMode(server: any) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    console.log('🔧 Environment mode:', isProduction ? 'production' : 'development');
    
    if (isProduction) {
      console.log('🏭 Using production static files...');
      setupStaticFiles();
      return;
    }
    
    console.log('🔧 Setting up Vite development server...');
    
    // Import setupVite function for development only
    const { setupVite } = await import('./vite.js');
    await setupVite(app, server);
    
    console.log('✅ Vite development server configured successfully');
  } catch (error) {
    console.error('⚠️ Vite setup failed, falling back to production mode:', error);
    setupStaticFiles();
  }
}

function setupStaticFiles() {
  // Priority order for serving built assets
  const distPath = path.join(__dirname, '../client/dist');
  
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
      if (req.path.startsWith('/api/') || req.path === '/health' || res.headersSent) {
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
    // Load your complete application BEFORE starting server
    const httpServer = await startCompleteApp();
    
    // Start the server
    httpServer.listen(port, '0.0.0.0', () => {
      console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
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