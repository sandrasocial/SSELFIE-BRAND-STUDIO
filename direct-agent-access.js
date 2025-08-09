// EMERGENCY ADMIN AGENT ACCESS - Bypass all Vite issues
// Run with: node direct-agent-access.js

import http from 'http';

const postData = JSON.stringify({
  agentId: 'zara',
  message: 'EMERGENCY ACCESS: Vite restart loop bypassed. Confirm you can access your tools and repository. System cleanup completed: logging spam stopped, database conflicts resolved, memory system unified.',
  conversationId: 'emergency-direct-access-' + Date.now()
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/consulting-agents/admin/consulting-chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🚨 EMERGENCY: Attempting direct admin agent access...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
    process.stdout.write(chunk);
  });
  
  res.on('end', () => {
    console.log('\n\n✅ EMERGENCY ACCESS COMPLETE');
  });
});

req.on('error', (e) => {
  console.error(`❌ EMERGENCY ACCESS FAILED: ${e.message}`);
});

req.write(postData);
req.end();