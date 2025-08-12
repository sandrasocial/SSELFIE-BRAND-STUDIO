#!/usr/bin/env node

// Quick Maya Chat Test Script
const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting SSELFIE Studio server for Maya testing...');

// Start server
const server = spawn('node', ['-r', 'esbuild-register', 'server/index.ts'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

let serverReady = false;

server.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('SSELFIE Studio LIVE')) {
    serverReady = true;
    console.log('✅ Server is ready! Testing Maya chat functionality...');
    
    // Test Maya chat endpoint
    setTimeout(() => {
      testMayaChat();
    }, 2000);
  }
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

async function testMayaChat() {
  try {
    const testData = JSON.stringify({
      message: "Hello Maya, test connection",
      chatHistory: []
    });
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/maya-chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('📡 Maya API Response Status:', res.statusCode);
        if (responseData) {
          console.log('📄 Maya API Response:', responseData.substring(0, 200));
        }
        
        if (res.statusCode === 200) {
          console.log('✅ Maya chat endpoint is working!');
        } else {
          console.log('❌ Maya chat endpoint returned error:', res.statusCode);
        }
        
        process.exit(0);
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Maya API connection error:', error.message);
      process.exit(1);
    });
    
    req.write(testData);
    req.end();
    
  } catch (error) {
    console.error('❌ Maya test failed:', error.message);
    process.exit(1);
  }
}

// Handle cleanup
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Maya test...');
  server.kill();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down Maya test...');
  server.kill();
  process.exit(0);
});