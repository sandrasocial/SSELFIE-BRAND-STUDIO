#!/usr/bin/env node

// Simple build script to make your React app work
const esbuild = require('esbuild');
const path = require('path');

console.log('🔨 Building your SSELFIE Studio frontend...');

esbuild.build({
  entryPoints: ['client/src/main.tsx'],
  bundle: true,
  outfile: 'client/public/bundle.js',
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css'
  },
  alias: {
    '@': path.resolve(__dirname, 'client/src'),
    '@shared': path.resolve(__dirname, 'shared'),
    '@assets': path.resolve(__dirname, 'attached_assets'),
  },
  define: {
    'process.env.NODE_ENV': '"development"'
  },
  sourcemap: true,
}).then(() => {
  console.log('✅ Frontend built successfully!');
}).catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});