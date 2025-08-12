// Production API handler for Replit deployment
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Essential middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

let serverInitialized = false;
let initializationPromise = null;

// Enhanced server initialization with proper error handling
async function initializeServer() {
  if (serverInitialized) {
    return app;
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      console.log('🚀 Initializing SSELFIE Studio production server...');
      
      // Try to import the compiled server code
      try {
        const { default: createApp } = await import('../dist/index.js');
        const initializedApp = await createApp();
        console.log('✅ Full application server loaded');
        serverInitialized = true;
        return initializedApp || app;
      } catch (serverError) {
        console.warn('⚠️ Main server not available, using fallback mode:', serverError.message);
        
        // Fallback to basic server functionality
        setupFallbackRoutes();
        serverInitialized = true;
        return app;
      }
    } catch (error) {
      console.error('❌ Failed to initialize server:', error);
      setupFallbackRoutes();
      serverInitialized = true;
      return app;
    }
  })();
  
  return initializationPromise;
}

// Setup fallback routes for basic functionality
function setupFallbackRoutes() {
  console.log('🔧 Setting up fallback routes...');
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      server: 'SSELFIE Studio (Fallback Mode)',
      environment: 'production'
    });
  });

  // Basic API endpoints
  app.post('/api/admin/consulting-agents/chat', (req, res) => {
    res.json({ 
      status: 'success', 
      message: 'Agent system operational (fallback mode)',
      agent: req.body.agentId || 'unknown',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/auth/user', (req, res) => {
    res.status(401).json({ 
      error: 'Not authenticated',
      message: 'Please login to continue'
    });
  });

  // Serve static files
  const staticPaths = [
    path.join(__dirname, '../dist/public'),
    path.join(__dirname, '../assets'),
    path.join(__dirname, '../client/public')
  ];

  staticPaths.forEach(staticPath => {
    if (fs.existsSync(staticPath)) {
      app.use('/assets', express.static(staticPath));
      app.use(express.static(staticPath));
      console.log(`📁 Serving static files from: ${staticPath}`);
    }
  });

  // Serve React app for all other routes
  const possibleHtmlPaths = [
    path.join(__dirname, '../dist/public/index.html'),
    path.join(__dirname, '../assets/index.html'),
    path.join(__dirname, '../client/index.html')
  ];

  const htmlPath = possibleHtmlPaths.find(p => fs.existsSync(p));

  app.get('*', (req, res) => {
    if (htmlPath) {
      res.sendFile(htmlPath);
    } else {
      res.status(404).json({
        error: 'Application not found',
        message: 'The application files could not be located',
        availablePaths: possibleHtmlPaths,
        timestamp: new Date().toISOString()
      });
    }
  });

  console.log('✅ Fallback routes configured');
}

// Middleware to ensure server is initialized before handling requests
app.use(async (req, res, next) => {
  if (!serverInitialized) {
    try {
      await initializeServer();
    } catch (error) {
      console.error('Server initialization failed:', error);
      return res.status(500).json({ 
        error: 'Server initialization failed',
        message: 'Please try again in a moment',
        timestamp: new Date().toISOString()
      });
    }
  }
  next();
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in production
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize server immediately
initializeServer().catch(error => {
  console.error('Failed to start server initialization:', error);
});

// Start the server
if (require.main === module) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
    console.log(`🌐 Server accessible at: http://0.0.0.0:${port}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
  });
}

module.exports = app;