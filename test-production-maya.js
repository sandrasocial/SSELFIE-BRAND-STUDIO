// Test production Maya endpoint
console.log('🔍 Testing production Maya endpoint...');

const testMessage = { 
  message: "I need some professional photo concepts for my business", 
  context: { styling: true },
  chatHistory: []
};

fetch('https://sselfie-brand-studio-9jk81661d-sselfie-studio.vercel.app/api/maya/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Note: This will fail auth but we want to see the response structure
  },
  body: JSON.stringify(testMessage)
})
.then(response => response.json())
.then(data => {
  console.log('📤 Maya Response Structure:', JSON.stringify(data, null, 2));
  
  if (data.conceptCards) {
    console.log(`✅ Found ${data.conceptCards.length} concept cards:`, data.conceptCards);
  } else {
    console.log('❌ No concept cards found in response');
  }
  
  if (data.response) {
    console.log('📝 Maya response text:', data.response.substring(0, 500) + '...');
  }
})
.catch(error => {
  console.error('❌ Error:', error);
});