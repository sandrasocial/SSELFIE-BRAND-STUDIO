#!/usr/bin/env node
// Quick OAuth authentication development server
process.env.NODE_ENV = 'development';
process.env.PORT = '5000';

console.log('🚀 Starting SSELFIE Studio OAuth Development Server...');
console.log('📡 Port: 5000');
console.log('🔒 OAuth: Enabled');

// Kill any existing server processes
import { exec } from 'child_process';
exec('pkill -f "tsx.*index.ts"', () => {
  // Start the server
  import('./server/index.ts').catch(console.error);
});