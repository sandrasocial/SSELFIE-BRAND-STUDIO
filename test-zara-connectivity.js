/**
 * ZARA AGENT CONNECTIVITY TEST
 * Direct test to verify Zara agent is accessible and functional
 */

import http from 'http';

const testZaraConnectivity = async () => {
  console.log('🧪 TESTING ZARA AGENT CONNECTIVITY...');
  
  // Test data for Zara agent
  const testData = JSON.stringify({
    agentId: 'zara',
    message: 'Hey Zara! This is a direct connectivity test. Can you respond and show your technical brilliance?',
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

  const startTime = Date.now();
  
  const req = http.request(options, (res) => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log(`📡 Response Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
      console.log('📦 Received chunk:', chunk.toString());
    });
    
    res.on('end', () => {
      const responseTime = Date.now() - startTime;
      console.log(`✅ ZARA TEST COMPLETE in ${responseTime}ms`);
      console.log(`📝 Full Response:`, data);
      
      if (res.statusCode === 200) {
        console.log('🎯 SUCCESS: Zara agent connectivity verified!');
      } else {
        console.log('❌ ISSUE: Unexpected status code:', res.statusCode);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ CONNECTION ERROR: ${e.message}`);
    console.log('🔄 Server likely still starting up...');
  });

  // Send the test data
  req.write(testData);
  req.end();
};

// Run the test
console.log('🚀 Starting Zara connectivity test...');
testZaraConnectivity();