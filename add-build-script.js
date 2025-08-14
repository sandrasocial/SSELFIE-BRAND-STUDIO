#!/usr/bin/env node

// Script to add build command to package.json for deployment
// This modifies package.json to include the required build script

import fs from 'fs';
import path from 'path';

const packageJsonPath = path.join(process.cwd(), 'package.json');

try {
  console.log('📝 Reading package.json...');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  console.log('➕ Adding build script...');
  
  // Add build script to the scripts section
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }
  
  packageJson.scripts.build = 'NODE_ENV=production npx vite build';
  
  console.log('💾 Writing updated package.json...');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Build script added successfully!');
  console.log('📋 Scripts section now includes:');
  console.log(JSON.stringify(packageJson.scripts, null, 2));
  
} catch (error) {
  console.error('❌ Error updating package.json:', error.message);
  process.exit(1);
}