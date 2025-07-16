/**
 * TEST IMAGE GENERATION AFTER FIX
 * Validates Maya AI image generation is working with corrected LoRA reference
 */

const baseUrl = 'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev';

async function testImageGeneration() {
  console.log('🧪 TESTING MAYA AI IMAGE GENERATION...');
  
  // Test with admin user's session
  const testPayload = {
    message: "Generate a professional headshot in business attire",
    regenerateImages: true
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/maya-generate-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3A-LrrAKeB...' // Admin session
      },
      body: JSON.stringify(testPayload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ MAYA AI GENERATION SUCCESS!');
      console.log('   Tracker ID:', data.trackerId);
      console.log('   Prediction ID:', data.predictionId);
      console.log('   Usage Status:', data.usageStatus.plan);
      console.log('   Remaining Generations:', data.usageStatus.remainingGenerations);
    } else {
      console.log('❌ Generation failed:', response.status);
      console.log('   Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Request error:', error.message);
  }
}

async function testAIPhotoshoot() {
  console.log('\n🧪 TESTING AI PHOTOSHOOT GENERATION...');
  
  const testPayload = {
    category: "editorial",
    subcategory: "business-portrait", 
    customPrompt: "confident professional headshot, business attire"
  };
  
  try {
    const response = await fetch(`${baseUrl}/api/generate-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3A-LrrAKeB...' // Admin session
      },
      body: JSON.stringify(testPayload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ AI PHOTOSHOOT GENERATION SUCCESS!');
      console.log('   Image ID:', data.id);
      console.log('   Success:', data.success);
    } else {
      console.log('❌ Photoshoot failed:', response.status);
      console.log('   Error:', data.error);
    }
  } catch (error) {
    console.log('❌ Request error:', error.message);
  }
}

async function runGenerationTests() {
  console.log('🚀 TESTING IMAGE GENERATION FIXES');
  console.log('==================================');
  console.log('Validating both Maya AI and AI Photoshoot generation...\n');
  
  await testImageGeneration();
  await testAIPhotoshoot();
  
  console.log('\n🎯 TESTING COMPLETE');
  console.log('==================');
  console.log('Both generation systems should now work with user-trained models');
}

runGenerationTests();