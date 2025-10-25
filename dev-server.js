#!/usr/bin/env node

/**
 * Simple development server for API functions
 * Runs the Vercel serverless functions locally using Express
 */

import express from 'express';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3000 to avoid conflicts

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and use API handlers
// This is a simplified version - in a real implementation,
// you'd need to map all the API routes properly

app.get('/api/health', async (req, res) => {
  try {
    // Import the compiled health handler
    const { default: handler } = await import('./dist/server/server/api/health.js');
    await handler(req, res);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Import required modules for HTTP requests
import https from 'https';

// Handle Stack Auth proxy requests
app.use('/api/auth', async (req, res) => {
  console.log('🔍 Stack Auth route matched:', req.method, req.url);
  console.log('🔍 Request body present:', !!req.body, 'Content-Type:', req.headers['content-type']);
  console.log('🔍 Request body type:', typeof req.body, 'keys:', req.body ? Object.keys(req.body) : 'none');
  try {
    // Proxy to Stack Auth API - handle OAuth vs other endpoints differently
    let stackUrl;
    if (req.url.includes('/oauth/')) {
      // OAuth endpoints need /auth prefix
      stackUrl = `https://api.stack-auth.com/api/v1/auth${req.url}`;
    } else {
      // Other Stack Auth endpoints use /api/v1 prefix
      stackUrl = `https://api.stack-auth.com/api/v1${req.url}`;
    }    console.log('🔁 Proxying to Stack Auth:', req.method, req.url, '→', stackUrl);
    
    // Prepare headers
    const headers = { ...req.headers };
    delete headers['host']; // Remove host header
    delete headers['connection']; // Remove connection header
    
    // Prepare request options
    const options = {
      method: req.method,
      headers: {
        ...headers,
        'User-Agent': 'SSELFIE-Dev-Server/1.0',
        'Accept': 'application/json',
        'Content-Type': req.headers['content-type'] || 'application/json'
      }
    };
    
    // Handle request body for POST/PUT/PATCH - use parsed body from Express
    let requestBody = null;
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      requestBody = JSON.stringify(req.body);
      options.headers['Content-Length'] = Buffer.byteLength(requestBody, 'utf8');
      console.log('🔁 Request body to send:', requestBody.substring(0, 200) + (requestBody.length > 200 ? '...' : ''));
    }
    
    // Make the request to Stack Auth
    const stackReq = https.request(stackUrl, options, (stackRes) => {
      console.log('📡 Stack Auth response:', stackRes.statusCode);
      // Set response headers
      res.status(stackRes.statusCode);
      
      // Copy response headers
      Object.keys(stackRes.headers).forEach(key => {
        if (key !== 'connection' && key !== 'keep-alive') {
          res.setHeader(key, stackRes.headers[key]);
        }
      });
      
      // Pipe the response
      stackRes.pipe(res);
    });
    
    stackReq.on('error', (error) => {
      console.error('❌ Stack Auth proxy error:', error);
      res.status(500).json({ 
        error: 'Failed to proxy request to Stack Auth',
        details: error.message 
      });
    });
    
    // Send request body if present
    if (requestBody) {
      stackReq.write(requestBody);
    }
    
    stackReq.end();
    
  } catch (error) {
    console.error('❌ Stack Auth proxy setup error:', error);
    res.status(500).json({ 
      error: 'Internal server error in Stack Auth proxy',
      details: error.message 
    });
  }
});

// Catch-all for other API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not implemented in dev server' });
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 API Dev Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to handle API requests`);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down API dev server...');
  server.close(() => {
    process.exit(0);
  });
});