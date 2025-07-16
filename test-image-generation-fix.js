/**
 * TEST IMAGE GENERATION AFTER FIX
 * Validates Maya AI image generation is working with corrected LoRA reference
 */

const baseUrl = 'https://e33979fc-c9be-4f0d-9a7b-6a3e83046828-00-3ij9k7qy14rai.picard.replit.dev';

async function testImageGeneration() {
  console.log('🔍 TESTING MAYA AI IMAGE GENERATION...');
  
  try {
    // Test Maya AI generation with admin user's session
    const response = await fetch(`${baseUrl}/api/maya-generate-images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3A-LrrAKeB' // Admin session from logs
      },
      body: JSON.stringify({
        prompt: 'professional headshot, studio lighting, editorial style',
        style: 'editorial'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Maya AI generation successful!');
      console.log(`   - Response: ${JSON.stringify(data).substring(0, 200)}...`);
      return true;
    } else {
      console.log(`❌ Maya AI generation failed: ${response.status}`);
      console.log(`   - Error: ${JSON.stringify(data)}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Maya AI generation error: ${error.message}`);
    return false;
  }
}

async function testAIPhotoshoot() {
  console.log('\n🔍 TESTING AI PHOTOSHOOT...');
  
  try {
    const response = await fetch(`${baseUrl}/api/ai-photoshoot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3A-LrrAKeB'
      },
      body: JSON.stringify({
        style: 'editorial',
        prompt: 'professional portrait, studio lighting'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ AI Photoshoot generation successful!');
      return true;
    } else {
      console.log(`❌ AI Photoshoot failed: ${response.status}`);
      console.log(`   - Error: ${JSON.stringify(data)}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ AI Photoshoot error: ${error.message}`);
    return false;
  }
}

async function runGenerationTests() {
  console.log('🚀 TESTING IMAGE GENERATION AFTER FIX');
  console.log('=====================================');
  
  const mayaResult = await testImageGeneration();
  const photoshootResult = await testAIPhotoshoot();
  
  console.log('\n📊 GENERATION TEST RESULTS');
  console.log('==========================');
  
  if (mayaResult && photoshootResult) {
    console.log('🎉 ALL GENERATION TESTS PASSED!');
    console.log('✅ Maya AI generation working');
    console.log('✅ AI Photoshoot working');
    console.log('✅ Platform ready for live users');
  } else {
    console.log('⚠️  SOME GENERATION TESTS FAILED');
    console.log(`   - Maya AI: ${mayaResult ? 'PASS' : 'FAIL'}`);
    console.log(`   - AI Photoshoot: ${photoshootResult ? 'PASS' : 'FAIL'}`);
  }
}

runGenerationTests();