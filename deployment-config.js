#!/usr/bin/env node

/**
 * SSELFIE Studio Deployment Configuration
 * Ensures all AWS SDK dependencies are properly bundled for production
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 SSELFIE Studio: Starting production build...');

try {
  // 1. Build frontend
  console.log('📦 Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit' });

  // 2. Build backend with proper externals
  console.log('🔧 Building backend with esbuild...');
  execSync(`esbuild server/index.ts \\
    --platform=node \\
    --bundle \\
    --format=esm \\
    --outdir=dist \\
    --external:@aws-sdk/client-s3 \\
    --external:@aws-sdk/lib-storage \\
    --external:@neondatabase/serverless \\
    --external:express \\
    --external:passport \\
    --external:passport-local \\
    --external:passport-google-oauth20 \\
    --external:connect-pg-simple \\
    --external:express-session \\
    --external:memoizee \\
    --external:ws \\
    --external:cors \\
    --external:multer \\
    --external:archiver \\
    --external:unzipper \\
    --external:sharp \\
    --external:form-data \\
    --external:node-fetch \\
    --external:openid-client`, { stdio: 'inherit' });

  // 3. Verify critical dependencies exist
  const criticalDeps = [
    '@aws-sdk/client-s3',
    '@aws-sdk/lib-storage',
    '@neondatabase/serverless',
    'express'
  ];

  console.log('✅ Verifying critical dependencies...');
  for (const dep of criticalDeps) {
    if (!fs.existsSync(`node_modules/${dep}`)) {
      throw new Error(`Critical dependency missing: ${dep}`);
    }
  }

  console.log('🎉 Build completed successfully!');
  console.log('📁 Distribution files created in ./dist/');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}