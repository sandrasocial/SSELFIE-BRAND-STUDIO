#!/usr/bin/env node

/**
 * PERSISTENT SERVER STARTUP FOR ADMIN AGENT COORDINATION
 * Ensures server stays running for admin agent communication
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting SSELFIE Studio server persistently for admin coordination...');

// Start the server process
const serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  cwd: __dirname
});

serverProcess.stdout.on('data', (data) => {
  console.log(data.toString());
});

serverProcess.stderr.on('data', (data) => {
  console.error(data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (code !== 0) {
    console.log('Restarting server...');
    setTimeout(() => {
      // Auto-restart on failure
      spawn('node', [__filename], { stdio: 'inherit' });
    }, 2000);
  }
});

// Keep the process alive
process.on('SIGTERM', () => {
  console.log('Gracefully shutting down...');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Gracefully shutting down...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});