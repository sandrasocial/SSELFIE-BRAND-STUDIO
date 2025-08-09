// Production API handler for Replit deployment
const express = require('express');
const path = require('path');

const app = express();

let serverInitialized = false;
let initializationPromise = null;

// Synchronous server initialization with proper error handling
function initializeServer() {
  if (serverInitialized) {
    return Promise.resolve(app);
  }
  
  if (initializationPromise) {
    return initializationPromise;
  }
  
  initializationPromise = (async () => {
    try {
      console.log('🚀 Initializing production server...');
      
      // Import the compiled server code
      const { default: createApp } = await import('../dist/index.js');
      const initializedApp = await createApp();
      
      console.log('✅ Production server initialized successfully');
      serverInitialized = true;
      
      return initializedApp || app;
    } catch (error) {
      console.error('❌ Failed to initialize server:', error);
      // Return basic express app as fallback
      return app;
    }
  })();
  
  return initializationPromise;
}

// Middleware to ensure server is initialized before handling requests
app.use(async (req, res, next) => {
  if (!serverInitialized) {
    try {
      await initializeServer();
    } catch (error) {
      console.error('Server initialization failed:', error);
      return res.status(500).json({ 
        error: 'Server initialization failed',
        message: 'Please try again in a moment'
      });
    }
  }
  next();
});

// Initialize server immediately
initializeServer();

module.exports = app;