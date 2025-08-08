// Quick test script for ManyChat API key
import fetch from 'node-fetch';

async function testManyChatConnection() {
  const apiKey = process.env.MANYCHAT_API_KEY;
  
  if (!apiKey) {
    console.log('❌ No MANYCHAT_API_KEY found');
    return;
  }
  
  console.log('🔍 Testing ManyChat API connection...');
  console.log(`📊 API Key format: ${apiKey.split(':')[0]}:***`);
  
  try {
    // Test ManyChat connection with findByName endpoint
    const response = await fetch('https://api.manychat.com/fb/subscriber/findByName', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '',  // Empty name to get subscribers
        limit: 5
      })
    });
    
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    
    if (response.ok || response.status === 400) {
      // 400 is expected for test subscriber ID
      console.log('✅ SUCCESS! ManyChat API connection working');
      const data = await response.json();
      console.log('📄 Response structure:', Object.keys(data));
    } else {
      const errorBody = await response.text();
      console.log('❌ ERROR: ManyChat API failed');
      console.log('📄 Error details:', errorBody);
    }
    
  } catch (error) {
    console.log('❌ NETWORK ERROR:', error.message);
  }
}

testManyChatConnection();