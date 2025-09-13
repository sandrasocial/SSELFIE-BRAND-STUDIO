// Simple test for save-image endpoint
import fetch from 'node-fetch';

async function testSaveImage() {
  try {
    console.log('Testing save-image endpoint...');
    
    const response = await fetch('http://localhost:3000/api/save-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'stack-access-token=test-token'
      },
      body: JSON.stringify({
        imageUrl: 'https://example.com/test-image.jpg',
        source: 'maya_generation',
        prompt: 'Test image save'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response body:', text);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSaveImage();
