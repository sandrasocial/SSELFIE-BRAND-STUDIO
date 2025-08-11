#!/usr/bin/env node

// Start your real SSELFIE Studio server with all features
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting your REAL SSELFIE Studio server with all 4 months of work...');
console.log('📍 Using server/index.ts - your comprehensive system');

// Kill any existing processes on port 5000
const killProcess = spawn('pkill', ['-f', 'production-server.js'], { stdio: 'ignore' });

killProcess.on('close', () => {
  // Start your real server using tsx to handle TypeScript
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '5000' }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start real server:', error.message);
    process.exit(1);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n⏹️ Shutting down server...');
    serverProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
  });
});