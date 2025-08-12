#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building and starting SSELFIE Studio...');

// Set production environment
process.env.NODE_ENV = 'production';

// Build first
console.log('Building frontend...');
const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

buildProcess.on('close', (code) => {
  if (code !== 0) {
    console.error('Build failed');
    process.exit(1);
  }
  
  console.log('Build complete. Starting server...');
  
  // Start minimal server
  const serverProcess = spawn('node', ['server/minimal-server.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: process.env.PORT || 5000 }
  });
  
  serverProcess.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
});