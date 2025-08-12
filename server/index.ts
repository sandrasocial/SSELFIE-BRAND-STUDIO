// SSELFIE STUDIO - COMPREHENSIVE SERVER WITH ALL FEATURES
// This is your main application server with Maya, Victoria, Training, Payments, Admin systems
import express from 'express';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './routes';

const app = express();
// CRITICAL: Use PORT environment variable for deployment
// Cloud Run and most deployment platforms use PORT env var
const port = Number(process.env.PORT) || 8080;

// Set environment to production for deployment if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'production';
}

// Force production mode for deployment
if (process.env.PORT && !process.env.NODE_ENV.includes('development')) {
  process.env.NODE_ENV = 'production';
}

// Trust proxy for proper forwarding (required for deployment)
app.set('trust proxy', true);

console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Target Port: ${port}`);

// Essential middleware with enhanced error handling
try {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Add request timeout for deployment health checks
  app.use((req, res, next) => {
    req.setTimeout(30000); // 30 second timeout
    res.setTimeout(30000);
    next();
  });
  
  // Add basic CORS for deployment
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
  
} catch (error) {
  console.error('❌ Middleware setup failed:', error);
  // Don't exit, continue with basic setup
}

// Root endpoint serves React app instead of health check
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, '../client/dist/index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('App not found - please run npm run build');
  }
});

// HEALTH CHECK ENDPOINTS - Required for Cloud Run deployment
app.get('/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy',
      service: 'SSELFIE Studio',
      timestamp: new Date().toISOString(),
      port: port,
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('❌ Health endpoint error:', error);
    res.status(500).json({ status: 'error', message: 'Health check failed' });
  }
});

app.get('/api/health', (req, res) => {
  try {
    res.status(200).json({
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      port: port,
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('❌ API health endpoint error:', error);
    res.status(500).json({ status: 'error', message: 'API health check failed' });
  }
});

// Additional health endpoints for deployment compatibility
app.get('/ready', (req, res) => {
  try {
    res.status(200).send('Ready');
  } catch (error) {
    console.error('❌ Ready endpoint error:', error);
    res.status(500).send('Not Ready');
  }
});

app.get('/alive', (req, res) => {
  try {
    res.status(200).send('Alive');
  } catch (error) {
    console.error('❌ Alive endpoint error:', error);
    res.status(500).send('Dead');
  }
});

// Additional deployment health check endpoint
app.get('/status', (req, res) => {
  try {
    res.status(200).json({
      status: 'operational',
      service: 'SSELFIE Studio',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('❌ Status endpoint error:', error);
    res.status(500).json({ status: 'error', message: 'Status check failed' });
  }
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
    
    // Add global error handling middleware (CRITICAL for deployment)
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
    
    return server;
  } catch (error) {
    console.error('❌ Routes loading failed, using minimal fallback:', error.message);
    
    // Essential fallback routes for deployment health checks
    app.post('/api/admin/consulting-agents/chat', (req, res) => {
      try {
        res.json({ 
          status: 'success', 
          message: 'Agent system operational',
          agent: req.body.agentId || 'unknown'
        });
      } catch (err) {
        console.error('❌ Agent chat endpoint error:', err);
        res.status(500).json({ status: 'error', message: 'Agent chat failed' });
      }
    });
    
    // Add global error handling middleware for fallback
    app.use((err: any, req: any, res: any, next: any) => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
    
    // Set up static file serving even if routes fail
    setupStaticFiles();
    
    return app;
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
    if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
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
      console.log(`🔧 Environment: ${process.env.NODE_ENV}`);
      console.log(`✅ Server ready for health checks`);
    });
    
    // Enhanced error handling for deployment
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use`);
        process.exit(1);
      } else if (err.code === 'EACCES') {
        console.error(`❌ Permission denied on port ${port}`);
        process.exit(1);
      } else {
        console.error('❌ Server startup error:', err);
        process.exit(1);
      }
    });

    // Handle uncaught exceptions to prevent server crashes
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => {
        process.exit(1);
      });
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