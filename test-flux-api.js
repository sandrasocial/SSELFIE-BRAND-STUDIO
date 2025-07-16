/**
 * TEST FLUX API - DIRECT REPLICATE CALL
 * Tests the exact API format needed for FLUX LoRA generation
 */

const REPLICATE_API_TOKEN = 'r8_XN9EOKRoCZ0JvdsDkLVHjCBXl8w3xst3pNZNd';

async function testFluxAPI() {
  console.log('🧪 TESTING FLUX API FORMAT...');
  
  // Test 1: Check account access
  try {
    const accountResponse = await fetch('https://api.replicate.com/v1/account', {
      headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
    });
    
    if (accountResponse.ok) {
      const account = await accountResponse.json();
      console.log('✅ Account verified:', account.username);
    } else {
      console.log('❌ Account check failed:', accountResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ Account error:', error.message);
    return;
  }
  
  // Test 2: Check user's trained model exists
  try {
    const modelResponse = await fetch('https://api.replicate.com/v1/models/sandrasocial/42585527-selfie-lora', {
      headers: { 'Authorization': `Token ${REPLICATE_API_TOKEN}` }
    });
    
    if (modelResponse.ok) {
      const model = await modelResponse.json();
      console.log('✅ User model found:', model.name);
      console.log('   Latest version:', model.latest_version?.id?.substring(0, 20) + '...');
    } else {
      console.log('❌ User model check failed:', modelResponse.status);
    }
  } catch (error) {
    console.log('❌ Model check error:', error.message);
  }
  
  // Test 3: Test FLUX generation with user's LoRA
  console.log('\n🚀 TESTING FLUX GENERATION...');
  
  const testPrompts = [
    // Format 1: Using model version directly (old approach)
    {
      name: 'Direct Model Version',
      body: {
        version: "sandrasocial/42585527-selfie-lora:26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2",
        input: {
          prompt: "professional headshot, business attire, confident smile",
          aspect_ratio: "3:4",
          num_outputs: 1
        }
      }
    },
    
    // Format 2: Using FLUX base model with LoRA weights (new approach)
    {
      name: 'FLUX Base + LoRA Weights',
      body: {
        model: "black-forest-labs/flux-dev-lora",
        input: {
          prompt: "professional headshot, business attire, confident smile",
          lora_weights: "sandrasocial/42585527-selfie-lora",
          lora_scale: 1.0,
          aspect_ratio: "3:4",
          num_outputs: 1,
          go_fast: true
        }
      }
    }
  ];
  
  for (const testCase of testPrompts) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    
    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.body)
      });
      
      if (response.ok) {
        const prediction = await response.json();
        console.log(`✅ ${testCase.name}: SUCCESS`);
        console.log(`   Prediction ID: ${prediction.id}`);
        console.log(`   Status: ${prediction.status}`);
      } else {
        const errorText = await response.text();
        console.log(`❌ ${testCase.name}: ${response.status}`);
        console.log(`   Error: ${errorText.substring(0, 200)}...`);
      }
    } catch (error) {
      console.log(`❌ ${testCase.name}: ${error.message}`);
    }
  }
}

testFluxAPI();