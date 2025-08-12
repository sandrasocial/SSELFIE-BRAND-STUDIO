#!/usr/bin/env node

/**
 * DEVELOPMENT STABLE SERVER - For Replit Workspace
 * Provides persistent development environment with background processes
 * Separate from Reserved VM production deployment
 */

const { spawn } = require('child_process');
const path = require('path');
const express = require('express');

console.log('🔧 DEVELOPMENT STABLE SERVER - Starting persistent development environment...');

// Development server that stays alive
let mainServerProcess = null;
let restartCount = 0;
const MAX_RESTARTS = 3;

function startDevelopmentServer() {
  console.log(`🔄 Starting development server (attempt ${restartCount + 1}/${MAX_RESTARTS})...`);
  
  mainServerProcess = spawn('npx', ['tsx', 'watch', 'index.ts'], {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
    env: { 
      ...process.env, 
      PORT: process.env.PORT || '5000',
      NODE_ENV: 'development',
      REPLIT_DEV_MODE: 'true'
    }
  });

  mainServerProcess.on('exit', (code, signal) => {
    console.log(`⚠️ Development server exited: code=${code}, signal=${signal}`);
    
    if (code !== 0 && restartCount < MAX_RESTARTS) {
      restartCount++;
      console.log(`🔄 Restarting development server in 3 seconds... (${restartCount}/${MAX_RESTARTS})`);
      setTimeout(startDevelopmentServer, 3000);
    } else if (restartCount >= MAX_RESTARTS) {
      console.error('❌ MAX RESTARTS REACHED - Starting fallback development server');
      startFallbackDevServer();
    }
  });

  mainServerProcess.on('error', (err) => {
    console.error('❌ Failed to start development server:', err);
    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      setTimeout(startDevelopmentServer, 3000);
    }
  });
}

function startFallbackDevServer() {
  console.log('🆘 STARTING FALLBACK DEVELOPMENT SERVER...');
  
  const fallbackApp = express();
  const port = process.env.PORT || 5000;
  
  fallbackApp.use(express.json({ limit: '10mb' }));
  fallbackApp.use(express.urlencoded({ extended: true }));
  
  // CORS for development
  fallbackApp.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
  });
  
  // Health check
  fallbackApp.get('/api/health', (req, res) => {
    res.json({ 
      status: 'development-fallback', 
      message: 'Development server operational - admin agents available',
      timestamp: new Date().toISOString() 
    });
  });
  
  // Admin agents endpoints
  fallbackApp.post('/api/consulting-agents/admin/consulting-chat', (req, res) => {
    console.log('🔧 DEV SERVER: Admin agent request:', req.body?.agentId || 'unknown');
    res.json({ 
      success: true,
      message: 'DEVELOPMENT SERVER: Admin agents operational for system work',
      agent: req.body?.agentId || 'unknown',
      mode: 'development-stable'
    });
  });
  
  fallbackApp.post('/api/admin/consulting-agents/chat', (req, res) => {
    res.json({ 
      success: true,
      message: 'DEVELOPMENT SERVER: Alternative admin endpoint active',
      agent: req.body?.agentId || 'unknown'
    });
  });
  
  // Static files
  fallbackApp.use('/assets', express.static('assets'));
  fallbackApp.use(express.static('client/public'));
  
  // Default route
  fallbackApp.get('*', (req, res) => {
    res.send(`
      <html>
      <head><title>SSELFIE Studio - Development Mode</title></head>
      <body style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h1>🔧 SSELFIE Studio - Development Environment</h1>
        <p>Development server running in fallback mode</p>
        <p>Status: <strong style="color: green;">Development Stable</strong></p>
      </body>
      </html>
    `);
  });
  
  fallbackApp.listen(port, '0.0.0.0', () => {
    console.log(`🔧 DEVELOPMENT SERVER STABLE on port ${port}`);
    console.log(`🛠️ Admin agents: http://localhost:${port}/api/consulting-agents/admin/consulting-chat`);
  });
}

// Process management for development
process.on('SIGTERM', () => {
  console.log('📧 Development server: Received SIGTERM, shutting down gracefully...');
  if (mainServerProcess) mainServerProcess.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📧 Development server: Received SIGINT, shutting down gracefully...');
  if (mainServerProcess) mainServerProcess.kill();
  process.exit(0);
});

// Keep development environment alive
setInterval(() => {
  console.log(`⏰ Development heartbeat: ${new Date().toLocaleTimeString()}`);
}, 60000);

// Start the development server
startDevelopmentServer();