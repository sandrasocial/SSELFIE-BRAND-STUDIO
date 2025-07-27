// Production API handler for Vercel deployment
const express = require('express');
const path = require('path');

const app = express();

// Import the compiled server code
async function loadServer() {
  try {
    const { registerRoutes } = await import('../dist/index.js');
    const server = await registerRoutes(app);
    return server;
  } catch (error) {
    console.error('Failed to load server:', error);
    throw error;
  }
}

// Initialize server
loadServer().catch(console.error);

module.exports = app;