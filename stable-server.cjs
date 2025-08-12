#!/usr/bin/env node

/**
 * COMPREHENSIVE SERVER WITH PROPER MIME TYPES
 * Fixes all MIME type issues including service worker and manifest
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

// Define proper MIME types
const mimeTypes = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.html': 'text/html',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Configure static file serving with comprehensive MIME types
app.use(express.static('dist/public', {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext];
    
    if (mimeType) {
      res.setHeader('Content-Type', `${mimeType}; charset=utf-8`);
    }
    
    // Special handling for service worker
    if (filePath.endsWith('sw.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.setHeader('Service-Worker-Allowed', '/');
    }
    
    // Special handling for manifest
    if (filePath.endsWith('manifest.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
  }
}));

// Explicit asset handling with proper MIME types
app.use('/assets', express.static('dist/public/assets', {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.js') {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (ext === '.css') {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SSELFIE Studio', 
    timestamp: new Date().toISOString(),
    port: port,
    mimeTypes: 'configured'
  });
});

// Create dummy manifest.json if missing to prevent errors
const manifestPath = path.join(__dirname, 'dist/public/manifest.json');
if (!fs.existsSync(manifestPath)) {
  const manifest = {
    "name": "SSELFIE Studio",
    "short_name": "SSELFIE",
    "description": "AI Personal Branding Platform",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#000000",
    "theme_color": "#000000"
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('📄 Created manifest.json');
}

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  res.status(404).send('Application not found');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ SSELFIE Studio COMPLETE on port ${port}`);
  console.log(`📂 Static files: ${path.join(__dirname, 'dist/public')}`);
  console.log(`🔗 Access: http://localhost:${port}`);
  
  // Log bundle status
  const distPath = path.join(__dirname, 'dist/public/assets');
  if (fs.existsSync(distPath)) {
    const bundles = fs.readdirSync(distPath).filter(f => f.startsWith('index-') && f.endsWith('.js'));
    console.log(`📦 Active bundles: ${bundles.join(', ')}`);
  }
});