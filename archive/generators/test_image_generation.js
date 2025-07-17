// Test script to demonstrate real AI image generation
const testImageGeneration = async () => {
  console.log('Testing REAL AI image generation...');
  
  try {
    const response = await fetch('http://localhost:5000/api/generate-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Professional portrait of subject in elegant business attire, sitting confidently in a modern office setting, soft natural lighting, minimal background, high-end commercial photography style',
        count: 1
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ REAL IMAGE GENERATION SUCCESS!');
      console.log('Generated images:', result.images);
      console.log('User ID:', result.userId);
      console.log('Generated at:', result.generatedAt);
      console.log('Is real generation:', result.isRealGeneration);
    } else {
      console.log('❌ Image generation failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
};

testImageGeneration();