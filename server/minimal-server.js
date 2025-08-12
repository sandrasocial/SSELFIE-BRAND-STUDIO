// Minimal Cloud Run Compatible Server for SSELFIE Studio
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

console.log(`Starting server on port ${port}`);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CRITICAL: Instant health check response
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Static files
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all - serve React app
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API not found' });
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

module.exports = app;