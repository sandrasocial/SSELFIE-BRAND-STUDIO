#!/usr/bin/env node

// Production startup script for SSELFIE Studio deployment
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting SSELFIE Studio Production Deployment...');

// Kill any existing servers first
const { exec } = require('child_process');
exec('pkill -f tsx', () => {
  console.log('🛑 Cleared any existing servers');
});

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
  
  // Verify build assets exist and move them to correct location
  const clientDistPath = path.join(__dirname, 'client', 'dist', 'index.html');
  const serverDistPath = path.join(__dirname, 'dist', 'public', 'index.html');
  
  if (!fs.existsSync(clientDistPath)) {
    console.error('❌ Build assets not found at:', clientDistPath);
    process.exit(1);
  }
  
  // Ensure dist/public directory exists and copy assets
  const publicDir = path.join(__dirname, 'dist', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  // Copy built assets from client/dist to dist/public
  const clientDistDir = path.join(__dirname, 'client', 'dist');
  const copyRecursive = (src, dest) => {
    if (fs.statSync(src).isDirectory()) {
      if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
      fs.readdirSync(src).forEach(item => {
        copyRecursive(path.join(src, item), path.join(dest, item));
      });
    } else {
      fs.copyFileSync(src, dest);
    }
  };
  
  copyRecursive(clientDistDir, publicDir);
  console.log('✅ Build assets moved to dist/public/');
  
  console.log('✅ Build assets verified');
  console.log('🚀 Starting server...');
  
  // Start the server with optimized settings for deployment
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
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