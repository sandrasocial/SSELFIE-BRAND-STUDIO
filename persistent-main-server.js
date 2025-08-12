#!/usr/bin/env node

/**
 * PERSISTENT MAIN SERVER - Your Complete SSELFIE Studio Application
 * Keeps your full 4-month application running with all features
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 PERSISTENT MAIN SERVER - Keeping your complete SSELFIE Studio running...');

let mainServerProcess = null;
let restartCount = 0;
const MAX_RESTARTS = 5;

function startMainServer() {
  console.log(`🔄 Starting your complete SSELFIE Studio (attempt ${restartCount + 1}/${MAX_RESTARTS})...`);
  
  mainServerProcess = spawn('npx', ['tsx', 'index.ts'], {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit',
    env: { 
      ...process.env, 
      PORT: process.env.PORT || '5000',
      NODE_ENV: 'development'
    }
  });

  mainServerProcess.on('exit', (code, signal) => {
    console.log(`⚠️ SSELFIE Studio exited: code=${code}, signal=${signal}`);
    
    if (code !== 0 && restartCount < MAX_RESTARTS) {
      restartCount++;
      console.log(`🔄 Restarting SSELFIE Studio in 3 seconds... (${restartCount}/${MAX_RESTARTS})`);
      setTimeout(startMainServer, 3000);
    } else if (restartCount >= MAX_RESTARTS) {
      console.error('❌ MAX RESTARTS REACHED - Check logs for issues');
      process.exit(1);
    }
  });

  mainServerProcess.on('error', (error) => {
    console.error('❌ Failed to start SSELFIE Studio:', error);
    if (restartCount < MAX_RESTARTS) {
      restartCount++;
      setTimeout(startMainServer, 5000);
    }
  });
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('👋 Shutting down SSELFIE Studio gracefully...');
  if (mainServerProcess) {
    mainServerProcess.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 Shutting down SSELFIE Studio gracefully...');
  if (mainServerProcess) {
    mainServerProcess.kill('SIGTERM');
  }
  process.exit(0);
});

// Start your complete application
startMainServer();