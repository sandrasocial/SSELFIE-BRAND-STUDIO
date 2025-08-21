#!/usr/bin/env node
// Production starter for SSELFIE Studio deployment

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting SSELFIE Studio for deployment...');
console.log(`📂 Working directory: ${process.cwd()}`);
console.log(`🔧 Node environment: ${process.env.NODE_ENV || 'production'}`);

const server = spawn('node', ['--import', 'tsx', path.join(__dirname, 'server/index.ts')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || '3000'
  }
});

server.on('error', (err) => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});

server.on('exit', (code, signal) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code} and signal ${signal}`);
    process.exit(code || 1);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.kill('SIGINT');
});