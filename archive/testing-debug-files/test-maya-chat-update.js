/**
 * TEST MAYA CHAT MESSAGE UPDATE FUNCTION
 * Tests the chat message update flow with a completed generation
 */

// Basic test setup  
async function testMayaChatUpdate() {
  console.log('🔍 Testing Maya chat message update function...');
  
  // Use existing completed generation data
  const testTrackerId = 111;
  const testImageUrls = [
    "https://replicate.delivery/xezq/W13U7iV51cJeIaeMM88wJo18cYdf74UOjFlXEUPJWBjetsEUB/out-0.png",
    "https://replicate.delivery/xezq/MfAAJQSZD622ZiaeEbzCepemX1SautQwYhJgMgZ9UgM8tsEUB/out-1.png",
    "https://replicate.delivery/xezq/dbvdMspRYcqfI6ADN5dC1ScVaVPXzSPwbizAVDSXkt9vllgKA/out-2.png"
  ];
  
  try {
    // Test API call to manually trigger update
    const response = await fetch('http://localhost:5173/api/test-maya-chat-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trackerId: testTrackerId,
        imageUrls: testImageUrls
      })
    });
    
    const result = await response.json();
    console.log('📊 Update result:', result);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMayaChatUpdate();
