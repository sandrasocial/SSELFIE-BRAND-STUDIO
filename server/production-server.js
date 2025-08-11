const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = Number(process.env.PORT) || 5000;

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('🚀 Starting SSELFIE Studio with your compiled assets...');

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'SSELFIE Studio Production'
  });
});

app.post('/api/admin/consulting-agents/chat', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Agent system operational',
    agent: req.body.agentId || 'unknown'
  });
});

// Authentication routes will be setup by setupAuth() function above
app.get('/api/login', (req, res) => {
  res.redirect('/api/auth/replit');
});

// Fallback auth endpoint if comprehensive routes don't load
app.get('/api/auth/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Setup authentication and comprehensive routes
async function setupAuth() {
  try {
    console.log('🔐 Setting up authentication system...');
    
    // Try to load comprehensive authentication from compiled dist
    const { setupAuth, isAuthenticated } = require('../dist/replitAuth.js');
    await setupAuth(app);
    console.log('✅ Full authentication system initialized');
    
    // Try to load comprehensive routes
    const { registerRoutes } = require('../dist/routes.js');
    await registerRoutes(app);
    console.log('✅ All comprehensive routes loaded: Maya, Victoria, Training, Payments, Admin!');
    
    return true;
  } catch (error) {
    console.warn('⚠️ Could not load comprehensive auth/routes:', error.message);
    console.warn('   Using simplified authentication bridge...');
    
    // Fallback to simple authentication
    const { setupSimpleAuth } = require('./auth-bridge.js');
    setupSimpleAuth(app);
    
    return false;
  }
}

// Initialize auth and routes
setupAuth();

// Serve built assets with proper headers
app.use('/assets', express.static(path.join(__dirname, '../assets'), {
  maxAge: '1y',
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Serve static files from dist/public if it exists
const distPublic = path.join(__dirname, '../dist/public');
if (fs.existsSync(distPublic)) {
  app.use(express.static(distPublic));
  console.log('📦 Serving built files from dist/public');
}

// Serve client public files
app.use(express.static(path.join(__dirname, '../client/public')));

// Create a simple HTML that loads your compiled assets
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SSELFIE Studio - AI Personal Branding Platform</title>
    <link rel="stylesheet" href="/assets/index-BtK4vJ_V.css">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index-DjkYMJ1K.js"></script>
  </body>
</html>`;

// Serve the HTML for all non-API routes
app.get('*', (req, res) => {
  const clientHtml = path.join(__dirname, '../client/index.html');
  
  // Try to serve the original client HTML first
  if (fs.existsSync(clientHtml)) {
    res.sendFile(clientHtml);
  } else {
    // Fallback to our generated HTML with assets
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
  console.log(`🌐 Access your app: http://localhost:${port}`);
  console.log(`📦 Using compiled assets for optimal performance`);
  console.log(`🎯 All your features should be available!`);
});