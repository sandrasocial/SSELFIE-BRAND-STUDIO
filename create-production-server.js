#!/usr/bin/env node

/**
 * Production server creator that uses tsx wrapper
 * Creates a production-ready dist/index.js that works in deployment
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

console.log('🏗️ Creating production server...');

try {
  // Create a production server that can run TypeScript directly using tsx
  const productionServer = `#!/usr/bin/env node

/**
 * Production Server - SSELFIE Studio
 * Uses tsx to run TypeScript directly in production
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Production environment setup
const serverPath = join(__dirname, '..', 'server', 'index.ts');

console.log('🚀 SSELFIE Studio - Starting production server...');
console.log('📁 Server path:', serverPath);
console.log('🌐 Environment: PRODUCTION');

// Start the server using tsx with production settings
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: { 
    ...process.env, 
    NODE_ENV: 'production',
    PORT: process.env.PORT || '5000'
  },
  cwd: join(__dirname, '..')
});

// Handle process lifecycle
child.on('exit', (code) => {
  console.log(\`🔄 Server process exited with code: \${code}\`);
  process.exit(code || 0);
});

child.on('error', (error) => {
  console.error('❌ Server startup error:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  child.kill('SIGINT');
});

// Prevent hanging
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  child.kill('SIGTERM');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled rejection:', reason);
  child.kill('SIGTERM');
  process.exit(1);
});
`;

  writeFileSync(join(distDir, 'index.js'), productionServer);
  
  console.log('✅ Production server created successfully!');
  console.log('📁 Output: dist/index.js');
  console.log('🎯 Ready for deployment!');
  
} catch (error) {
  console.error('❌ Production server creation failed:', error);
  process.exit(1);
}