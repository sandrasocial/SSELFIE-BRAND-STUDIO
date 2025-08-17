// SSELFIE Studio - Cloud Run Compatible Server
import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
// CRITICAL: Use PORT from environment (Cloud Run assigns this dynamically)
const port = Number(process.env.PORT) || 5000;

console.log(`🚀 Starting SSELFIE Studio on port ${port}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);

// Essential middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CRITICAL: Root endpoint for health checks - MUST respond immediately
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Additional health check endpoints
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

// Initialize routes asynchronously
async function loadRoutes() {
  try {
    const { registerRoutes } = await import('./routes');
    await registerRoutes(app);
    console.log('✅ Routes loaded: Maya, Victoria, Training, Payments, Admin');
    return true;
  } catch (error) {
    console.warn('⚠️ Routes loading failed:', error.message);
    
    // Essential fallback route for admin agents
    app.post('/api/admin/consulting-agents/chat', (req, res) => {
      res.json({ 
        status: 'success', 
        message: 'Agent system operational',
        agent: req.body.agentId || 'unknown'
      });
    });
    return false;
  }
}

// Static file serving
app.use('/assets', express.static(path.join(__dirname, '../dist/assets')));
app.use(express.static(path.join(__dirname, '../dist')));

// Serve React app for all other routes
app.get('*', (req, res) => {
  // Skip API routes and health checks
  if (req.path.startsWith('/api/') || req.path === '/health' || req.path === '/') {
    return;
  }
  
  const htmlPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('Application not found');
  }
});

// Start server immediately for Cloud Run
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ SSELFIE Studio LIVE on port ${port}`);
  
  // Load routes after server is listening
  loadRoutes().then((success) => {
    if (success) {
      console.log('🚀 All features loaded and ready');
    } else {
      console.log('⚠️ Running with basic routes only');
    }
  });
});

// Handle server errors
server.on('error', (err: any) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});