// Production Server for SSELFIE Studio - Cloud Run Compatible
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

console.log(`SSELFIE Studio starting on port ${port}`);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Immediate health check response - CRITICAL for Cloud Run
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', port });
});

// Static files - check all possible locations
const distPublicPath = path.join(__dirname, '../dist/public');
const clientDistPath = path.join(__dirname, '../client/dist'); 
const distPath = path.join(__dirname, '../dist');

let serveFrom = null;

if (fs.existsSync(distPublicPath)) {
  serveFrom = distPublicPath;
  app.use('/assets', express.static(path.join(distPublicPath, 'assets')));
  app.use(express.static(distPublicPath));
  console.log(`Serving from: ${distPublicPath}`);
} else if (fs.existsSync(clientDistPath)) {
  serveFrom = clientDistPath;
  app.use('/assets', express.static(path.join(clientDistPath, 'assets')));
  app.use(express.static(clientDistPath));
  console.log(`Serving from: ${clientDistPath}`);
} else if (fs.existsSync(distPath)) {
  serveFrom = distPath;
  app.use('/assets', express.static(path.join(distPath, 'assets')));
  app.use(express.static(distPath));
  console.log(`Serving from: ${distPath}`);
} else {
  console.log('No dist folder found - app may not be built');
}

// API fallback
app.get('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve React app
app.get('*', (req, res) => {
  const distPublicIndexPath = path.join(__dirname, '../dist/public/index.html');
  const clientIndexPath = path.join(__dirname, '../client/dist/index.html');
  const altIndexPath = path.join(__dirname, '../dist/index.html');
  
  if (fs.existsSync(distPublicIndexPath)) {
    res.sendFile(distPublicIndexPath);
  } else if (fs.existsSync(clientIndexPath)) {
    res.sendFile(clientIndexPath);
  } else if (fs.existsSync(altIndexPath)) {
    res.sendFile(altIndexPath);
  } else {
    res.status(404).send('SSELFIE Studio - Application not built yet');
  }
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`✅ SSELFIE Studio running on port ${port}`);
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
const shutdown = () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;