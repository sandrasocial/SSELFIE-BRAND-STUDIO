#!/usr/bin/env node

// SSELFIE STUDIO - FIXED SERVER STARTUP
// This script fixes the port conflicts and starts the server properly

console.log('🔧 Starting SSELFIE Studio with fixed configuration...');

// Kill any existing processes on port 3000
const { exec } = require('child_process');

function killExistingProcesses() {
  return new Promise((resolve) => {
    exec('lsof -t -i:3000 | xargs kill -9 2>/dev/null || true', () => {
      console.log('✅ Cleared any existing processes on port 3000');
      resolve();
    });
  });
}

async function startServer() {
  await killExistingProcesses();
  
  // Set proper environment variables
  process.env.NODE_ENV = 'development';
  process.env.PORT = '3000';
  
  console.log('🌐 Environment:', process.env.NODE_ENV);
  console.log('🔌 Port:', process.env.PORT);
  
  // Start the server
  const { spawn } = require('child_process');
  
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
  
  server.on('exit', (code) => {
    console.log(`🔄 Server exited with code ${code}`);
    if (code !== 0) {
      console.log('🔄 Restarting server in 3 seconds...');
      setTimeout(startServer, 3000);
    }
  });
}

startServer().catch(console.error);