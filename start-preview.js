#!/usr/bin/env node

// Simple production server startup for Replit preview
process.env.NODE_ENV = 'production';
process.env.PORT = '8080';

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SSELFIE Studio for preview...');
console.log('🔧 Environment: production');
console.log('🌐 Port: 8080');

const serverProcess = spawn('node', ['-r', 'esbuild-register', 'index.ts'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: '8080'
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Server error:', error);
});

serverProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
  }
});

// Keep process alive
process.on('SIGTERM', () => {
  console.log('🛑 Terminating server...');
  serverProcess.kill();
});

process.on('SIGINT', () => {
  console.log('🛑 Terminating server...');
  serverProcess.kill();
});