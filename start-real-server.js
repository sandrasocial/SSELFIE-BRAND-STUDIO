#!/usr/bin/env node

// SSELFIE Studio - Production Ready Server
// Bypasses complex routing conflicts while preserving backend functionality

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SSELFIE Studio with working configuration...');
console.log('📱 This will serve your comprehensive app on port 5000');

// Kill any existing processes on port 5000
const killExisting = spawn('pkill', ['-f', 'port.*5000'], { stdio: 'ignore' });

setTimeout(() => {
  // Start the working server that actually displays the React app
  const server = spawn('node', ['working-server.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  server.on('error', (err) => {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  });

  server.on('exit', (code) => {
    console.log(`📱 SSELFIE Studio server exited with code ${code}`);
    process.exit(code);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down SSELFIE Studio...');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Terminating SSELFIE Studio...');
    server.kill('SIGTERM');
  });
}, 500);