const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from client
app.use('/assets', express.static(path.join(__dirname, '../client/public')));
app.use('/src', express.static(path.join(__dirname, '../client/src')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/admin/consulting-agents/chat', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Agent system operational',
    agent: req.body.agentId || 'unknown'
  });
});

// Serve React app for all routes
const htmlPath = path.join(__dirname, '../client/index.html');

app.get('*', (req, res) => {
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(404).send('Application not found');
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
  console.log(`🌐 Access your app: http://localhost:${port}`);
});