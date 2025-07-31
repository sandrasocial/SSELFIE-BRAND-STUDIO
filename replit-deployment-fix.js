#!/usr/bin/env node

/**
 * SSELFIE Studio - Replit Deployment Fix
 * Resolves AWS SDK missing dependency issue for production deployment
 */

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

console.log('🔧 REPLIT DEPLOYMENT FIX: Starting AWS SDK dependency resolution...');

async function fixDeployment() {
  try {
    // 1. Verify AWS SDK packages are installed
    console.log('📦 Verifying AWS SDK packages...');
    const awsPackages = ['@aws-sdk/client-s3', '@aws-sdk/lib-storage'];
    
    for (const pkg of awsPackages) {
      try {
        await fs.access(`node_modules/${pkg}`);
        console.log(`✅ Found: ${pkg}`);
      } catch (error) {
        console.log(`❌ Missing: ${pkg} - Installing...`);
        execSync(`npm install ${pkg}`, { stdio: 'inherit' });
      }
    }

    // 2. Create production-ready build
    console.log('🏗️ Creating production build...');
    
    // Clean previous build
    try {
      await fs.rm('dist', { recursive: true });
      console.log('🧹 Cleaned previous build');
    } catch (e) {
      // Directory might not exist
    }

    // Build frontend
    console.log('📦 Building frontend...');
    execSync('vite build', { stdio: 'inherit' });

    // Build backend with AWS SDK bundled
    console.log('🔧 Building backend with bundled AWS dependencies...');
    execSync(`esbuild server/index.ts \\
      --platform=node \\
      --bundle \\
      --format=esm \\
      --outdir=dist \\
      --external:express \\
      --external:passport* \\
      --external:connect-pg-simple \\
      --external:express-session \\
      --external:memoizee \\
      --external:ws \\
      --external:cors \\
      --external:multer \\
      --external:sharp \\
      --external:@neondatabase/serverless`, { stdio: 'inherit' });

    // 3. Copy critical package.json for production
    console.log('📄 Creating production package.json...');
    const prodPackageJson = {
      "name": "sselfie-studio-production",
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "start": "NODE_ENV=production node index.js"
      },
      "dependencies": {
        "express": "^4.21.2",
        "express-session": "^1.18.1",
        "passport": "^0.7.0",
        "passport-local": "^1.0.0",
        "passport-google-oauth20": "^2.0.0",
        "connect-pg-simple": "^10.0.0",
        "memoizee": "^0.4.17",
        "ws": "^8.18.0",
        "cors": "^2.8.5",
        "multer": "^1.4.5-lts.1",
        "sharp": "^0.33.5",
        "@neondatabase/serverless": "^0.10.4"
      }
    };
    
    await fs.writeFile('dist/package.json', JSON.stringify(prodPackageJson, null, 2));

    console.log('✅ DEPLOYMENT FIX COMPLETE!');
    console.log('📁 Production files ready in ./dist/');
    console.log('🚀 AWS SDK dependencies bundled into index.js');
    console.log('📦 External dependencies listed in dist/package.json');

  } catch (error) {
    console.error('❌ Deployment fix failed:', error.message);
    process.exit(1);
  }
}

fixDeployment();