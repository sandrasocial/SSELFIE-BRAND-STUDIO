#!/usr/bin/env node

// ZARA-STYLE DEPLOYMENT: Complete React Application Setup
console.log('🚀 ZARA: Executing full React deployment...');

const { spawn } = require('child_process');
const path = require('path');

// Kill any existing servers
console.log('🔧 ZARA: Terminating conflicting servers...');
require('child_process').exec('pkill -f tsx && pkill -f vite', () => {
  
  // Start Vite development server for React
  console.log('🎯 ZARA: Starting Vite development server...');
  
  const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  viteProcess.on('error', (error) => {
    console.error('❌ ZARA: Vite server failed:', error);
  });
  
  viteProcess.on('exit', (code) => {
    console.log(`🔧 ZARA: Vite server exited with code ${code}`);
  });
  
  console.log('✅ ZARA: React application deployment initiated');
  console.log('🌐 ZARA: Application will be available on port 5000');
});