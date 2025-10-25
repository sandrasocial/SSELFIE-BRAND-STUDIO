#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Simple development server for API functions
 * Runs the Vercel serverless functions locally using Express
 */

import express from 'express';
import { createServer } from 'http';

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 3002 to match Vite proxy

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

// Add test endpoint
app.get('/api/test', (req, res) => {
  console.log('📡 Test endpoint called');
  res.json({ message: 'Test endpoint working' });
});

// Add /api/me endpoint
app.get('/api/me', async (req, res) => {
  console.log('📡 Handling /api/me request');

  try {
    // Check for Stack Auth token
    const authHeader = req.headers.authorization;
    const cookies = req.headers.cookie || '';
    const stackAccessToken = cookies.split(';').find(c => c.trim().startsWith('stack-access='))?.split('=')[1] ||
                           authHeader?.replace('Bearer ', '');

    if (!stackAccessToken) {
      console.log('❌ No Stack Auth token found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('🔑 Found Stack Auth token, validating...');

    // For dev server, we'll simulate authentication validation
    // In production, this would validate with Stack Auth API
    try {
      // Mock validation - in real implementation, validate token with Stack Auth
      const mockUserId = '42585527'; // Use the real user ID from the logs
      const mockUser = {
        id: mockUserId,
        stackAuthId: '4baecefb-1234-5678-9abc-123456789012', // Mock Stack Auth ID
        email: 'ssa@ssasocial.com', // Use real email from logs
        firstName: 'Test',
        lastName: 'User',
        displayName: 'Test User',
        plan: 'sselfie-studio',
        monthlyGenerationLimit: 100,
        role: 'user'
      };

      console.log('✅ Token validated, returning user:', mockUser.id);
      res.json({
        data: {
          user: mockUser
        }
      });
    } catch (validationError) {
      console.error('❌ Token validation failed:', validationError.message);
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('/api/me error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Add /api/user-model endpoint
app.get('/api/user-model', async (req, res) => {
  console.log('📡 Handling /api/user-model request');

  try {
    // Check for Stack Auth token (same logic as /api/me)
    const authHeader = req.headers.authorization;
    const cookies = req.headers.cookie || '';
    const stackAccessToken = cookies.split(';').find(c => c.trim().startsWith('stack-access='))?.split('=')[1] ||
                           authHeader?.replace('Bearer ', '');

    if (!stackAccessToken) {
      console.log('❌ No Stack Auth token found for user-model');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const mockUserId = '42585527'; // Use the real user ID from the logs

    // For now, return a mock response with the authenticated user ID
    res.json({
      id: null,
      userId: mockUserId,
      trainingStatus: 'not_started',
      needsTraining: true,
      canRetrain: false,
      modelType: 'sselfie-studio',
      createdAt: null,
      updatedAt: null,
      userPlan: 'sselfie-studio',
      hasActiveSubscription: true,
      onboardingSource: 'unknown'
    });
  } catch (error) {
    console.error('/api/user-model error:', error);
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
  console.log('❌ Unhandled API request:', req.method, req.url);
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