#!/usr/bin/env node

// MINIMAL SERVER LAUNCHER - BYPASS CONFIG CONFLICTS
const { spawn } = require('child_process');

console.log('🚀 MINIMAL SERVER MODE - BYPASSING CONFIG CONFLICTS');

function launchServer() {
  console.log('⚡ Starting minimal server...');
  
  const server = spawn('node', ['--loader=tsx/esm', '--no-warnings', 'server/index.ts'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: '5000',
      NODE_ENV: 'development',
      NODE_OPTIONS: '--loader=tsx/esm --no-warnings'
    },
    cwd: process.cwd()
  });

  server.on('close', (code) => {
    if (code !== 0) {
      console.log(`\n🔄 Server exited with code ${code}, restarting...`);
      setTimeout(launchServer, 3000);
    }
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error.message);
    setTimeout(launchServer, 5000);
  });
}

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  process.exit(0);
});

launchServer();