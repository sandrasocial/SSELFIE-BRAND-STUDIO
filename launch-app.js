#!/usr/bin/env node

// SSELFIE Studio - Proper Launch Script
// This ensures fresh builds and correct port deployment for Replit preview

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SSELFIE Studio - Deployment Launch');
console.log('🔧 Building fresh frontend with React fixes...');

// Step 1: Build frontend with latest React fixes
const buildProcess = spawn('npm', ['run', 'build'], { 
  stdio: 'inherit', 
  cwd: process.cwd() 
});

buildProcess.on('close', (buildCode) => {
  if (buildCode !== 0) {
    console.error('❌ Frontend build failed');
    process.exit(1);
  }
  
  console.log('✅ Frontend build completed');
  console.log('📦 Copying assets to serving location...');
  
  // Step 2: Copy assets
  try {
    const { execSync } = require('child_process');
    execSync('cp -rf client/dist/* dist/public/', { stdio: 'inherit' });
    console.log('✅ Assets copied successfully');
  } catch (error) {
    console.error('❌ Asset copy failed:', error.message);
    process.exit(1);
  }
  
  console.log('🌐 Starting SSELFIE Studio on port 5000...');
  
  // Step 3: Start server on port 5000 for Replit preview
  const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      PORT: '5000',
      NODE_ENV: 'production'
    }
  });
  
  serverProcess.on('close', (serverCode) => {
    console.log(`Server process exited with code ${serverCode}`);
    process.exit(serverCode);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down SSELFIE Studio...');
    serverProcess.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down SSELFIE Studio...');
    serverProcess.kill('SIGTERM');
  });
});