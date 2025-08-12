#!/usr/bin/env node

// Production startup script for SSELFIE Studio deployment
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SSELFIE Studio Production Deployment...');

// Set production environment
process.env.NODE_ENV = 'production';
process.env.PORT = process.env.PORT || '80';

console.log('📦 Building frontend assets...');

// Build the frontend first
const buildProcess = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true
});

buildProcess.on('close', (buildCode) => {
  if (buildCode !== 0) {
    console.error('❌ Build failed with code:', buildCode);
    process.exit(1);
  }
  
  console.log('✅ Build completed successfully');
  
  // Verify build assets exist
  const distPath = path.join(__dirname, 'dist', 'index.html');
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build assets not found at:', distPath);
    process.exit(1);
  }
  
  console.log('✅ Build assets verified');
  console.log('🚀 Starting server...');
  
  // Start the server with optimized settings for deployment
  const serverProcess = spawn('npx', ['tsx', 'server/index-deployment.ts'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: process.env.PORT || '80',
      // Ensure fast startup for health checks
      TS_NODE_TRANSPILE_ONLY: 'true',
      TS_NODE_TYPE_CHECK: 'false'
    }
  });
  
  serverProcess.on('close', (serverCode) => {
    console.log('Server exited with code:', serverCode);
    process.exit(serverCode);
  });
  
  // Handle shutdown gracefully
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    serverProcess.kill('SIGTERM');
  });
  
  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    serverProcess.kill('SIGINT');
  });
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
});