// Use tsx to run your comprehensive TypeScript server
require('child_process').spawn('npx', ['tsx', 'server/index.ts'], { 
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || '5000' }
});

return; // Exit early to avoid running old server

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files with proper MIME types
app.use('/assets', express.static(path.join(__dirname, '../client/public')));
app.use('/src', express.static(path.join(__dirname, '../client/src'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.jsx') || path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));
app.use(express.static(path.join(__dirname, '../client/public')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    server: 'SSELFIE Studio'
  });
});

app.post('/api/admin/consulting-agents/chat', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Agent system operational',
    agent: req.body.agentId || 'unknown'
  });
});

app.get('/api/auth/user', (req, res) => {
  // Mock auth response for development
  res.status(401).json({ error: 'Not authenticated' });
});

app.get('/api/login', (req, res) => {
  res.send(`
    <html>
      <head><title>SSELFIE Studio - Login</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>SSELFIE Studio</h1>
        <p>Authentication system would go here</p>
        <button onclick="window.close()">Close</button>
      </body>
    </html>
  `);
});

// Serve React app for all other routes
const htmlPath = path.join(__dirname, '../client/index.html');

app.get('*', (req, res) => {
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send(`
      <html>
        <head><title>SSELFIE Studio - Not Found</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>SSELFIE Studio</h1>
          <p>Application files not found at: ${htmlPath}</p>
          <p>Please build the client first.</p>
        </body>
      </html>
    `);
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
  console.log(`🌐 Access your app: http://localhost:${port}`);
  console.log(`📁 Serving from: ${htmlPath}`);
  console.log(`📦 Static files: /src -> ${path.join(__dirname, '../client/src')}`);
  console.log(`🎯 Note: You may need to build the client for production use`);
});