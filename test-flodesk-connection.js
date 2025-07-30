// Quick test script for fresh Flodesk API key
import fetch from 'node-fetch';

async function testFlodeskConnection() {
  const apiKey = process.env.FLODESK_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No FLODESK_API_KEY found');
    return;
  }
  
  console.log('🔍 Testing Flodesk API connection...');
  console.log(`📊 API Key length: ${apiKey.length} characters`);
  console.log(`🔑 API Key prefix: ${apiKey.substring(0, 15)}...`);
  
  try {
    // Try different Flodesk API approaches
    console.log('🔍 Testing multiple authentication approaches...');
    
    // Test 1: Standard Bearer token
    let response = await fetch('https://api.flodesk.com/v1/subscribers?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SSELFIE Studio/1.0',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📡 Test 1 (Bearer): ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // Test 2: Try different endpoint format
      response = await fetch('https://api.flodesk.com/v1/subscribers', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`📡 Test 2 (No params): ${response.status} ${response.statusText}`);
    }
    
    if (!response.ok) {
      // Test 3: Try X-API-Key format
      response = await fetch('https://api.flodesk.com/v1/subscribers?page=1&limit=5', {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log(`📡 Test 3 (X-API-Key): ${response.status} ${response.statusText}`);
    }
    
    if (!response.ok) {
      // Test 4: Try BASIC AUTH (from official docs)
      const basicAuth = Buffer.from(`${apiKey}:`).toString('base64');
      response = await fetch('https://api.flodesk.com/v1/subscribers?page=1&per_page=5', {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/json',
          'User-Agent': 'SSELFIE Studio/1.0'
        }
      });
      
      console.log(`📡 Test 4 (Basic Auth): ${response.status} ${response.statusText}`);
    }
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Flodesk API connection working');
      console.log(`📊 Found ${data.data ? data.data.length : 0} subscribers in first page`);
      if (data.data && data.data.length > 0) {
        console.log('👤 Sample subscriber:', {
          email: data.data[0].email,
          firstName: data.data[0].first_name,
          status: data.data[0].status
        });
      }
    } else {
      const errorBody = await response.text();
      console.log('❌ ERROR: Flodesk API failed');
      console.log('📄 Error details:', errorBody);
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
  }
}

testFlodeskConnection();