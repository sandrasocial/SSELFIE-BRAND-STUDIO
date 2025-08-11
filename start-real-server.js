// Use tsx to run your comprehensive TypeScript server
require('child_process').spawn('npx', ['tsx', 'server/index.ts'], { 
  stdio: 'inherit',
  env: { ...process.env, PORT: process.env.PORT || '5000' }
});