// SSELFIE STUDIO - COMPREHENSIVE SERVER WITH ALL FEATURES
// This is your main application server with Maya, Victoria, Training, Payments, Admin systems
import express from 'express';
import path from 'path';
import fs from 'fs';
import { registerRoutes } from './routes';

const app = express();
const port = Number(process.env.PORT) || 5000;

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

// Root endpoint for quick health checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'SSELFIE Studio Online',
    service: 'Complete Application with Maya, Victoria, Training, Admin',
    timestamp: new Date().toISOString()
  });
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
    if (req.path.startsWith('/api/') || req.path === '/health' || req.path === '/') {
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
const server = app.listen(port, '0.0.0.0', async () => {
  console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Load your complete application after server starts
  await startCompleteApp();
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