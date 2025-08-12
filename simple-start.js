#!/usr/bin/env node

/**
 * SIMPLE STATIC SERVER WITH PROPER MIME TYPES
 * Fixes the MIME type issue for JavaScript modules
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Configure express to serve static files with proper MIME types
app.use(express.static('dist/public', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (path.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
  }
}));

// Specifically handle assets with proper MIME types
app.use('/assets', express.static('dist/public/assets', {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SSELFIE Studio', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// SPA fallback for React Router
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(__dirname, 'dist/public/index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  res.status(404).send('Application not found - please run npm run build');
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ SSELFIE Studio serving on port ${port}`);
  console.log(`📂 Static files: ${path.join(__dirname, 'dist/public')}`);
  console.log(`🔗 Access at: http://localhost:${port}`);
  
  // Verify key files exist
  const jsBundle = path.join(__dirname, 'dist/public/assets/index-7ugjoSbr.js');
  const cssBundle = path.join(__dirname, 'dist/public/assets/index-CHEsUpOc.css');
  
  console.log(`📄 JS Bundle exists: ${fs.existsSync(jsBundle)}`);
  console.log(`🎨 CSS Bundle exists: ${fs.existsSync(cssBundle)}`);
});