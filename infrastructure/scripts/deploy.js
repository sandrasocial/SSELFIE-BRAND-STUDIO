#!/usr/bin/env node
// SSELFIE Studio Deployment Script
// This script ensures the server starts properly for deployment

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

async function deployServer() {
  try {
    console.log('🚀 Starting SSELFIE Studio deployment...');
    
    // Check if build exists
    const distPath = path.join(process.cwd(), 'client/dist');
    if (!fs.existsSync(distPath)) {
      console.log('📦 Building client...');
      await execAsync('npm run build');
    }
    
    // Start the server
    console.log('🌐 Starting server for deployment...');
    const { spawn } = await import('child_process');
    
    const server = spawn('node', ['--import', 'tsx', 'server/index.ts'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: process.env.PORT || '3000'
      }
    });
    
    // Handle server lifecycle
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });
    
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down...');
      server.kill('SIGTERM');
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 Received SIGINT, shutting down...');
      server.kill('SIGINT');
    });
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

deployServer();