#!/usr/bin/env node

/**
 * MINIMAL STABLE SERVER - For Replit Preview
 * Simple Express server that works without ES modules
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS and JSON middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SSELFIE Studio Development Server',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Basic API endpoints  
app.get('/api/test', (req, res) => {
  res.json({ message: 'API Working!', server: 'minimal-stable' });
});

// Serve static files if available
app.use(express.static('dist/public'));
app.use(express.static('public'));

// Fallback route
app.get('*', (req, res) => {
  res.json({ 
    message: 'SSELFIE Studio API', 
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MINIMAL SERVER RUNNING`);
  console.log(`🌐 Preview: http://localhost:${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Ready for Replit Preview`);
});

process.on('SIGTERM', () => {
  console.log('👋 Server shutting down gracefully');
  process.exit(0);
});