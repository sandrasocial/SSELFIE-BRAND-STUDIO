// Simple server starter for workflow compatibility
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting SSELFIE Studio Server...');

// Start the JavaScript server directly
const server = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    PORT: '3000'
  }
});

server.on('error', (error) => {
  console.error('Server startup error:', error);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Terminating server...');
  server.kill('SIGTERM');
});