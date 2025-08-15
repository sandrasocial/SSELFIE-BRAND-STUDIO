#!/usr/bin/env node

/**
 * Production server build script using esbuild
 * Creates a standalone dist/index.js from server/index.ts
 */

import { build } from 'esbuild';
import { existsSync, mkdirSync } from 'fs';

const distDir = './dist';
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

console.log('🏗️ Building production server...');

try {
  await build({
    entryPoints: ['server/index.ts'],
    bundle: true, // Bundle required for external option
    platform: 'node',
    target: 'node18',
    format: 'esm',
    outfile: 'dist/index.js',
    external: [
      // All production dependencies - keep as external
      'express', 'cors', '@neondatabase/serverless', 'drizzle-orm', 
      'passport', 'express-session', 'connect-pg-simple', '@anthropic-ai/sdk',
      'ws', 'archiver', '@aws-sdk/client-s3', '@aws-sdk/lib-storage', 
      'stripe', 'resend', 'uuid', 'nanoid', 'memoizee', 'prom-client',
      'drizzle-zod', 'zod', 'express-rate-limit', 'tsx', 'typescript',
      'openid-client', '@sentry/node', '@sentry/integrations', 'axios',
      'class-variance-authority', 'clsx', 'esbuild'
    ],
    define: {
      'process.env.NODE_ENV': '"production"'
    },
    logLevel: 'info',
    minify: false,
    sourcemap: false
  });

  console.log('✅ Production server build completed!');
  console.log('📁 Output: dist/index.js');
  
} catch (error) {
  console.error('❌ Production server build failed:', error);
  process.exit(1);
}