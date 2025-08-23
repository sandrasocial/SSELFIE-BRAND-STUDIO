#!/usr/bin/env node

/**
 * COMPLETE SERVER WITH PROPER MIME TYPE HANDLING
 * Fixes the JavaScript module MIME type issue
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Enhanced static file serving with proper MIME types
const distPath = path.join(__dirname, 'dist/public');

// Configure proper MIME types
express.static.mime.define({
  'application/javascript': ['js', 'mjs'],
  'text/javascript': ['js'],
  'application/json': ['json'],
  'text/css': ['css']
});

console.log('📁 Serving static files from:', distPath);
console.log('📄 Assets path:', path.join(distPath, 'assets'));

// Serve static assets with proper headers
app.use('/assets', express.static(path.join(distPath, 'assets'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

app.use(express.static(distPath, {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'SSELFIE Studio', 
    timestamp: new Date().toISOString(),
    port: port 
  });
});

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return;
  }
  
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  res.status(404).send('Application not found');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 SSELFIE Studio LIVE on port ${port}`);
  console.log(`📂 Static files: ${distPath}`);
  console.log(`🔗 Access: http://localhost:${port}`);
});