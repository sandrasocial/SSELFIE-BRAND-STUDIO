// Production API handler for Replit deployment
const express = require('express');
const path = require('path');

const app = express();

// Synchronous server initialization for production stability
let serverInitialized = false;
let serverInstance = null;

async function initializeServer() {
  if (serverInitialized && serverInstance) {
    return serverInstance;
  }
  
  try {
    console.log('🚀 Initializing production server...');
    const { registerRoutes } = await import('../dist/index.js');
    serverInstance = await registerRoutes(app);
    serverInitialized = true;
    console.log('✅ Production server initialized successfully');
    return serverInstance;
  } catch (error) {
    console.error('❌ Failed to initialize server:', error);
    throw error;
  }
}

// Add middleware to ensure server is initialized before handling requests
app.use(async (req, res, next) => {
  if (!serverInitialized) {
    try {
      await initializeServer();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Server initialization failed',
        message: error.message 
      });
    }
  }
  next();
});

// Initialize server immediately
initializeServer().catch(console.error);

module.exports = app;