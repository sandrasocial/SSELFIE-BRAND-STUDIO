#!/usr/bin/env node

// Custom build script for SSELFIE Studio deployment
// This script replaces the missing 'npm run build' command

import { execSync } from 'child_process';
import path from 'path';

console.log('🚀 Starting SSELFIE Studio production build...');

try {
  // Set NODE_ENV to production to avoid cartographer plugin issues
  process.env.NODE_ENV = 'production';
  
  console.log('📦 Building client application with Vite...');
  
  // Run vite build from the project root (where vite.config.ts is configured)
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Build output: client/dist/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}