import express from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const port = Number(process.env.PORT) || 5000;

// Essential middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets
app.use('/assets', express.static(path.join(__dirname, '../client/public')));
app.use('/src', express.static(path.join(__dirname, '../client/src')));

// API endpoints
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

// Serve your React application
const htmlPath = path.join(__dirname, '../client/index.html');

app.get('*', (req, res) => {
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.status(500).send('Application files not found');
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
  console.log(`🌐 Your complete application: http://localhost:${port}`);
});