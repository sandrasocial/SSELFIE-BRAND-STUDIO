#!/usr/bin/env node

// Simple launcher for SSELFIE Studio
console.log('🚀 Launching SSELFIE Studio...');

const { spawn } = require('child_process');
const path = require('path');

const server = spawn('npx', ['tsx', 'index.ts'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000' }
});

server.on('error', (error) => {
  console.error('Launch error:', error);
});

process.on('SIGTERM', () => server.kill());
process.on('SIGINT', () => server.kill());