const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting proper Vite development server...');

// Change to client directory and start Vite
const viteProcess = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

viteProcess.on('error', (error) => {
  console.error('❌ Vite failed:', error);
});

viteProcess.on('exit', (code) => {
  console.log(`🔧 Vite exited with code ${code}`);
});

console.log('✅ Vite development server starting...');