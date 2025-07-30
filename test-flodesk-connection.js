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
    const response = await fetch('https://api.flodesk.com/v1/subscribers?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SSELFIE Studio (https://sselfie.ai)'
      }
    });
    
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