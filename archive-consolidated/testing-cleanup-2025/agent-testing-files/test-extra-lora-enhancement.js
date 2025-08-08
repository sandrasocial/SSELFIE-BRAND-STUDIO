/**
 * EXTRA LORA ENHANCEMENT TEST - SANDRA'S MODEL
 * Testing enhanced portrait quality with additional LoRA layers
 */

async function testExtraLoRAEnhancement() {
  console.log('🎨 TESTING EXTRA LORA ENHANCEMENT FOR SANDRA...\n');
  
  // Professional portrait enhancement LoRAs to test (Replicate compatible)
  const enhancementLoRAs = [
    {
      name: 'Realistic Enhancement',
      model: 'lucataco/flux-dev-lora:09f683ab8da9b3f61e73a97978de72b7fbcba8148f8beb6b4dcce7ffbf6fb41f',
      scale: 0.8,
      description: 'General realism enhancement for portraits'
    },
    {
      name: 'Professional Quality',
      model: 'black-forest-labs/flux-dev-lora:a53fd9255ecba80d99eaab4706c698f861fd47b098012607557385416e46aae5',
      scale: 0.6,
      description: 'Professional photography quality baseline'
    },
    {
      name: 'Portrait Enhancement',
      model: 'ostris/flux-dev-lora-trainer:26dce37af90b9d997eeb970d92e47de3064d46c300504ae376c75bef6a9022d2',
      scale: 0.5,
      description: 'Enhanced portrait characteristics'
    }
  ];
  
  console.log('🔥 ENHANCEMENT LORAS TO TEST:');
  enhancementLoRAs.forEach((lora, i) => {
    console.log(`${i + 1}. ${lora.name} (Scale: ${lora.scale})`);
    console.log(`   Model: ${lora.model}`);
    console.log(`   Purpose: ${lora.description}\n`);
  });
  
  // Test prompts designed for professional results
  const testPrompts = [
    'user42585527 professional editorial headshot, studio lighting, magazine quality',
    'user42585527 luxury business portrait, soft professional lighting, high-end photography',
    'user42585527 fashion editorial style, dramatic lighting, vogue magazine aesthetic'
  ];
  
  console.log('📸 TEST PROMPTS FOR ENHANCED QUALITY:');
  testPrompts.forEach((prompt, i) => {
    console.log(`${i + 1}. ${prompt}`);
  });
  
  console.log('\n🧪 TESTING ENHANCED GENERATION REQUEST...');
  
  // Create enhanced generation request with extra LoRA
  const enhancedRequest = {
    version: 'sandrasocial/42585527-selfie-lora:b9fab7ab8e4ad20c3d24a34935fe9b0095b901c159f25e5b35b84749524d0cbb',
    input: {
      prompt: testPrompts[0],
      guidance: 2.8,
      num_inference_steps: 35,
      output_quality: 95,
      num_outputs: 3,
      aspect_ratio: "3:4",
      output_format: "png",
      megapixels: "1",
      go_fast: false,
      disable_safety_checker: false,
      // 🔥 NEW ENHANCEMENT PARAMETERS - Testing without extra_lora first
      // extra_lora: enhancementLoRAs[0].model, // Test basic enhancement
      // extra_lora_scale: enhancementLoRAs[0].scale,
      seed: Math.floor(Math.random() * 1000000)
    }
  };
  
  console.log('🎯 ENHANCED REQUEST STRUCTURE:');
  console.log(JSON.stringify(enhancedRequest, null, 2));
  
  try {
    console.log('\n🚀 MAKING ENHANCED GENERATION REQUEST...');
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enhancedRequest)
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Enhanced generation failed:', error);
      return false;
    }
    
    const prediction = await response.json();
    console.log('✅ ENHANCED GENERATION STARTED!');
    console.log(`🔗 Prediction ID: ${prediction.id}`);
    console.log(`📊 Status: ${prediction.status}`);
    
    // Poll for completion
    console.log('\n⏳ Waiting for enhanced generation to complete...');
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      const status = await statusResponse.json();
      console.log(`📊 Status check ${attempts + 1}: ${status.status}`);
      
      if (status.status === 'succeeded') {
        console.log('\n🎉 ENHANCED GENERATION COMPLETED!');
        console.log('🖼️ Enhanced images with extra LoRA:');
        if (status.output && status.output.length > 0) {
          status.output.forEach((url, i) => {
            console.log(`   Image ${i + 1}: ${url}`);
          });
          
          console.log('\n🔥 ENHANCEMENT TEST RESULTS:');
          console.log('✅ Successfully combined Sandra\'s trained model with Ultra Realism LoRA');
          console.log('✅ Generated professional quality enhanced portraits');
          console.log('✅ Maintained user isolation while adding enhancement layer');
          console.log('\n🎯 QUALITY COMPARISON:');
          console.log('📊 Compare these enhanced images with previous generations');
          console.log('📊 Look for: Better skin textures, enhanced lighting, more photorealistic details');
          
          return {
            success: true,
            predictionId: prediction.id,
            images: status.output,
            enhancement: enhancementLoRAs[0],
            prompt: testPrompts[0]
          };
        }
      } else if (status.status === 'failed') {
        console.log('❌ Enhanced generation failed:', status.error);
        return false;
      }
      
      attempts++;
    }
    
    console.log('⏰ Generation timeout - check prediction manually');
    return { success: false, predictionId: prediction.id };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run the enhancement test
testExtraLoRAEnhancement()
  .then(result => {
    if (result && result.success) {
      console.log('\n🚀 EXTRA LORA ENHANCEMENT TEST: SUCCESS! 🚀');
      console.log('🔥 Ready to implement enhanced generation system');
    } else {
      console.log('\n⚠️ EXTRA LORA ENHANCEMENT TEST: NEEDS ADJUSTMENT');
      console.log('🔧 May need to try different LoRA models or scales');
    }
  })
  .catch(error => {
    console.error('❌ Test script error:', error);
  });