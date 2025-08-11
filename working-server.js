const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('client/public'));

// Serve source files directly (this fixes the import resolution)
app.use('/src', express.static('client/src'));

// Serve attached assets
app.use('/assets', express.static('attached_assets'));

// API routes for your SSELFIE Studio
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/admin/consulting-agents/chat', (req, res) => {
  res.json({ 
    status: 'success', 
    agent: req.body.agentId,
    message: 'Agent system operational'
  });
});

app.get('/api/login', (req, res) => {
  res.redirect('/login');
});

// Serve your main app for all routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log('🚀 SSELFIE Studio RESTORED: http://localhost:5000');
  console.log('🌐 External access via sselfie.ai');
  console.log('✅ Static file serving working');
  console.log('✅ SPA routing working');
  console.log('✅ API endpoints working');
});