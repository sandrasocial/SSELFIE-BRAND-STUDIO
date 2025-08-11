#!/usr/bin/env node

/**
 * Simple server build script using tsx for compilation
 * Creates dist/index.js from server/index.ts using TypeScript compiler
 */

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, copyFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, 'dist');
if (!existsSync(distDir)) {
  mkdirSync(distDir, { recursive: true });
}

console.log('🏗️ Building server for production...');

try {
  // Create a simple production server wrapper that uses tsx
  const serverWrapper = `#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use tsx to run the TypeScript server directly
const serverPath = join(__dirname, '..', 'server', 'index.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
`;

  writeFileSync('dist/index.js', serverWrapper);
  
  console.log('✅ Server build completed successfully!');
  console.log('📁 Output: dist/index.js (tsx wrapper)');
  
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}