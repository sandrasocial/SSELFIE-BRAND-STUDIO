#!/usr/bin/env node

/**
 * PRODUCTION STARTUP SCRIPT - COMPLETE DEPLOYMENT
 * Ensures clean build, proper bundle serving, and stable server
 */

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 SSELFIE Studio Production Startup');

// Kill any existing servers
try {
  execSync('pkill -f "tsx.*index" 2>/dev/null || true');
  console.log('✅ Cleared existing server processes');
} catch (e) {}

// Clean build
console.log('🔨 Building frontend...');
try {
  execSync('rm -rf dist/ && npm run build', { stdio: 'inherit' });
  console.log('✅ Frontend build complete');
} catch (e) {
  console.error('❌ Build failed:', e.message);
  process.exit(1);
}

// Copy assets to correct location for server
const distPath = './dist';
const publicPath = './dist/public';

if (fs.existsSync(distPath) && !fs.existsSync(path.join(publicPath, 'index.html'))) {
  try {
    execSync(`mkdir -p ${publicPath} && cp -r ${distPath}/* ${publicPath}/`);
    console.log('✅ Assets copied to server location');
  } catch (e) {
    console.log('⚠️ Asset copy failed, continuing...');
  }
}

// Start server
console.log('⚡ Starting production server...');
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: '5000',
    NODE_ENV: 'production'
  }
});

server.on('error', (error) => {
  console.error('❌ Server error:', error.message);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.log(`⚠️ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill('SIGTERM');
  setTimeout(() => process.exit(0), 2000);
});

console.log('🛡️ Production server starting...');