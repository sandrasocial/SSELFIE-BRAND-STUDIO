#!/usr/bin/env node
console.log('🚀 ADMIN COORDINATION COMPLETE: Starting SSELFIE Studio with forwardRef fixes...');
import('./server/index.ts').then(() => {
  console.log('✅ Server started successfully with admin agent coordination');
}).catch((error) => {
  console.error('❌ Server startup failed:', error);
});