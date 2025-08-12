#!/usr/bin/env node

// SIMPLE SERVER START - DIRECT EXECUTION
require('child_process').spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  env: { ...process.env, PORT: '5000', NODE_ENV: 'development' }
});