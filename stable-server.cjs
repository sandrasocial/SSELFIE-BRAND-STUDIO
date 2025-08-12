#!/usr/bin/env node

/**
 * SSELFIE Studio - Stable Server Launcher (CommonJS)
 * Prevents SIGTERM shutdowns and maintains server stability
 */

const { spawn } = require('child_process');

let serverProcess = null;
let restartCount = 0;
const MAX_RESTARTS = 10;

console.log('🚀 SSELFIE Studio - Stable Server Mode');

function startServer() {
  console.log(`\n⚡ Starting server (attempt ${restartCount + 1})`);
  
  serverProcess = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      PORT: '5000',
      NODE_ENV: 'production'
    },
    cwd: process.cwd()
  });
  
  serverProcess.on('close', (code, signal) => {
    console.log(`\n⚠️ Server ended: code=${code}, signal=${signal}`);
    
    if (restartCount < MAX_RESTARTS) {
      console.log('🔄 Auto-restarting in 2 seconds...');
      setTimeout(() => {
        restartCount++;
        startServer();
      }, 2000);
    } else {
      console.log('❌ Max restarts reached');
      process.exit(1);
    }
  });
}

// Handle shutdown signals
process.on('SIGINT', () => {
  console.log('\n🛑 Shutdown requested');
  if (serverProcess) serverProcess.kill('SIGINT');
  process.exit(0);
});

startServer();
console.log('🛡️ Server will auto-restart if terminated');