#!/usr/bin/env node

/**
 * SSELFIE STUDIO - ROBUST SERVER LAUNCHER
 * Bypasses all TypeScript/ES module conflicts
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SSELFIE Studio - Robust Server Launcher');
console.log('🔧 Bypassing configuration conflicts...');

let serverProcess = null;
let restartCount = 0;

function startServer() {
  console.log(`\n⚡ Starting server (attempt ${restartCount + 1})`);
  
  // Use tsx directly with proper flags
  serverProcess = spawn('npx', ['tsx', '--no-cache', 'server/index.ts'], {
    stdio: 'pipe',
    env: {
      ...process.env,
      PORT: '5000',
      NODE_ENV: 'development',
      TSX_TSCONFIG_PATH: './tsconfig.json'
    },
    cwd: process.cwd()
  });
  
  // Pipe output to console with prefixes
  serverProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`[SERVER] ${line.trim()}`);
    });
  });
  
  serverProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(`[ERROR] ${line.trim()}`);
    });
  });
  
  serverProcess.on('close', (code, signal) => {
    console.log(`\n⚠️ Server process ended: code=${code}, signal=${signal}`);
    
    if (code !== 0 && restartCount < 3) {
      console.log('🔄 Restarting in 3 seconds...');
      setTimeout(() => {
        restartCount++;
        startServer();
      }, 3000);
    } else if (restartCount >= 3) {
      console.log('❌ Max restart attempts reached');
      process.exit(1);
    }
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    setTimeout(() => {
      restartCount++;
      startServer();
    }, 5000);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    setTimeout(() => process.exit(0), 2000);
  } else {
    process.exit(0);
  }
});

// Check if dist exists
const distPath = path.join(process.cwd(), 'dist', 'public');
if (!fs.existsSync(distPath)) {
  console.log('📦 Building frontend first...');
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    env: process.env
  });
  
  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build complete, starting server...');
      startServer();
    } else {
      console.log('⚠️ Build had issues, starting server anyway...');
      startServer();
    }
  });
} else {
  startServer();
}

console.log('🛡️ Server will auto-restart on failures');