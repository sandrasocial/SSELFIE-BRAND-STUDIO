// Compiled production server - points to your TypeScript server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting SSELFIE Studio production server...');

// Run your TypeScript server directly
const serverProcess = spawn('npx', ['tsx', path.join(__dirname, 'index.ts')], {
  stdio: 'inherit',
  cwd: __dirname
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

serverProcess.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (code !== 0) {
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  serverProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  serverProcess.kill('SIGINT');
});