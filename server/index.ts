// SSELFIE STUDIO - COMPREHENSIVE SERVER WITH ALL FEATURES
// This is your main application server with Maya, Victoria, Training, Payments, Admin systems
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { registerRoutes } from './routes';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Force port 3000 for development, prevent production port conflicts
const port = 3000;

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

// Root endpoint - serve React app for browsers, limited health check for specific probes only
app.get('/', (req, res, next) => {
  // Only return JSON for very specific deployment health probes
  const isDeploymentProbe = req.headers['user-agent']?.includes('GoogleHC') ||
                           req.headers['user-agent']?.includes('kube-probe') ||
                           req.headers['user-agent']?.includes('ELB-HealthChecker');
  
  if (isDeploymentProbe) {
    // Health check for deployment probe only
    return res.status(200).json({ 
      status: 'healthy',
      service: 'SSELFIE Studio',
      timestamp: new Date().toISOString(),
      port: port
    });
  }
  
  // For all other requests (browsers, Replit preview, etc.), serve the React app
  next();
});

// Initialize your complete SSELFIE Studio application
async function startCompleteApp() {
  try {
    console.log('📦 Loading comprehensive routes...');
    
    // Load your complete routing system with all features
    const server = await registerRoutes(app);
    
    console.log('✅ All your comprehensive routes loaded: Maya, Victoria, Training, Payments, Admin, and more!');
    console.log('✅ All your features loaded!');
    
    // Set up static file serving after routes are loaded
    setupStaticFiles();
    
    return server;
  } catch (error) {
    console.error('❌ CRITICAL: Failed to load your main application:', error);
    process.exit(1);
  }
}

function setupStaticFiles() {
  // Serve built frontend assets
  const possibleDistPaths = [
    path.join(__dirname, '../dist/public'),
    path.join(__dirname, '../client/dist'), 
    path.join(__dirname, '../dist')
  ];
  
  for (const distPath of possibleDistPaths) {
    if (fs.existsSync(distPath)) {
      console.log(`📁 Serving static files from: ${distPath}`);
      app.use(express.static(distPath));
      app.use('/assets', express.static(path.join(distPath, 'assets')));
      break;
    }
  }
  
  // React app fallback for SPA routing
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/') || req.path === '/health' || res.headersSent) {
      return;
    }
    
    const possibleIndexPaths = [
      path.join(__dirname, '../dist/public/index.html'),
      path.join(__dirname, '../client/dist/index.html'),
      path.join(__dirname, '../dist/index.html')
    ];
    
    for (const indexPath of possibleIndexPaths) {
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    
    res.status(404).send('Application not found - please run npm run build');
  });
}

// Start server with complete application
async function startServer() {
  try {
    // Load your complete application BEFORE starting server
    await startCompleteApp();
    
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    
    // Handle server errors
    server.on('error', (err: any) => {
      console.error('❌ Server startup error:', err);
      process.exit(1);
    });

    // Graceful shutdown for Cloud Run
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Initialize server
startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});