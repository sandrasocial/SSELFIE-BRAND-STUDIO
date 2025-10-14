/**
 * Test script to verify gallery images authentication
 */
import fetch from 'node-fetch';

async function testGalleryImages() {
  console.log('🧪 Testing gallery images authentication...');

  try {
    // Test without auth - should fail
    console.log('Testing without authentication...');
    const response1 = await fetch('http://localhost:3000/api/gallery-images');
    console.log('Status without auth:', response1.status);

    // Test with invalid token - should fail
    console.log('Testing with invalid token...');
    const response2 = await fetch('http://localhost:3000/api/gallery-images', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('Status with invalid token:', response2.status);

    console.log('✅ Test completed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testGalleryImages();