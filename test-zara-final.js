import http from 'http';

console.log('🧪 FINAL ZARA CONNECTIVITY TEST');

const testData = JSON.stringify({
  agentId: 'zara',
  message: 'Final connectivity test - demonstrate your technical capabilities!',
  adminToken: 'sandra-admin-2025'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/consulting-chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
    process.stdout.write(chunk.toString());
  });
  
  res.on('end', () => {
    console.log('\n✅ ZARA TEST COMPLETE');
    if (res.statusCode === 200) {
      console.log('🎯 SUCCESS: Zara agent connectivity verified!');
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ ERROR: ${e.message}`);
});

req.write(testData);
req.end();