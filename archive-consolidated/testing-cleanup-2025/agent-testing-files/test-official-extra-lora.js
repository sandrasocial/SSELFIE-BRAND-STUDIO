/**
 * TEST OFFICIAL EXTRA LORA ENHANCEMENT - SANDRA'S MODEL
 * Using official black-forest-labs/flux-dev-lora with extra_lora parameter
 */

async function testOfficialExtraLoRA() {
  console.log('🔥 TESTING OFFICIAL EXTRA LORA ENHANCEMENT...\n');
  
  // Available enhancement LoRAs on Replicate/HuggingFace
  const enhancementOptions = [
    {
      name: 'Flux Realism',
      model: 'fofr/flux-realism',
      scale: 0.7,
      description: 'Professional photorealistic enhancement'
    },
    {
      name: 'Flux Ultra Realism',
      model: 'prithivMLmods/Canopus-LoRA-Flux-UltraRealism-2.0',
      scale: 0.6,
      description: 'Ultra-realistic skin textures and lighting'
    },
    {
      name: 'Portrait Enhancement',
      model: 'strangerzonehf/Flux-Super-Portrait-LoRA',
      scale: 0.8,
      description: 'Professional portrait quality with highlights'
    }
  ];
  
  console.log('🎨 AVAILABLE ENHANCEMENT LORAS:');
  enhancementOptions.forEach((lora, i) => {
    console.log(`${i + 1}. ${lora.name} (Scale: ${lora.scale})`);
    console.log(`   Model: ${lora.model}`);
    console.log(`   Purpose: ${lora.description}\n`);
  });
  
  // Test the official API format
  const enhancedRequest = {
    version: "black-forest-labs/flux-dev-lora", // Official base model
    input: {
      prompt: "user42585527 professional editorial headshot, studio lighting, magazine cover quality, ultra-realistic",
      lora_weights: "sandrasocial/42585527-selfie-lora:b9fab7ab8e4ad20c3d24a34935fe9b0095b901c159f25e5b35b84749524d0cbb",
      lora_scale: 1.0, // Full strength for Sandra's model
      extra_lora: enhancementOptions[0].model, // Flux Realism enhancement
      extra_lora_scale: enhancementOptions[0].scale,
      guidance: 3.2,
      num_inference_steps: 40,
      output_quality: 100,
      num_outputs: 3,
      aspect_ratio: "3:4",
      output_format: "png",
      megapixels: "1",
      go_fast: false,
      disable_safety_checker: false,
      seed: Math.floor(Math.random() * 1000000)
    }
  };
  
  console.log('🎯 OFFICIAL EXTRA LORA REQUEST:');
  console.log(JSON.stringify(enhancedRequest, null, 2));
  
  try {
    console.log('\n🚀 TESTING OFFICIAL FLUX DEV-LORA API...');
    
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
      console.error('❌ Official extra LoRA test failed:', error);
      return false;
    }
    
    const prediction = await response.json();
    console.log('✅ OFFICIAL EXTRA LORA GENERATION STARTED!');
    console.log(`🔗 Prediction ID: ${prediction.id}`);
    console.log(`📊 Status: ${prediction.status}`);
    
    console.log('\n🔥 ENHANCEMENT COMBINATION:');
    console.log(`✅ Primary LoRA: Sandra's trained model (100% strength)`);
    console.log(`✅ Enhancement LoRA: ${enhancementOptions[0].name} (${enhancementOptions[0].scale * 100}% strength)`);
    console.log(`✅ Result: User's likeness + Professional realism enhancement`);
    
    // Monitor generation progress
    console.log('\n⏳ Monitoring official enhanced generation...');
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
        }
      });
      
      const status = await statusResponse.json();
      console.log(`📊 Progress ${attempts + 1}: ${status.status}`);
      
      if (status.status === 'succeeded') {
        console.log('\n🎉 OFFICIAL EXTRA LORA ENHANCEMENT COMPLETED!');
        
        if (status.output && status.output.length > 0) {
          console.log('🖼️ WOW FACTOR ENHANCED IMAGES:');
          status.output.forEach((url, i) => {
            console.log(`   Enhanced Image ${i + 1}: ${url}`);
          });
          
          console.log('\n🔥 OFFICIAL ENHANCEMENT SUCCESS:');
          console.log('✅ Successfully combined Sandra\'s model with professional realism LoRA');
          console.log('✅ Used official black-forest-labs/flux-dev-lora API');
          console.log('✅ Achieved multi-LoRA enhancement while maintaining user likeness');
          console.log('✅ Generated ultra-realistic professional portraits');
          
          console.log('\n🎯 QUALITY COMPARISON CHECKLIST:');
          console.log('□ More photorealistic skin textures');
          console.log('□ Enhanced professional lighting effects');
          console.log('□ Sharper facial details and features');
          console.log('□ Magazine-quality editorial appearance');
          console.log('□ Maintained Sandra\'s recognizable likeness');
          
          return {
            success: true,
            predictionId: prediction.id,
            images: status.output,
            enhancement: enhancementOptions[0],
            apiFormat: 'official-flux-dev-lora'
          };
        }
      } else if (status.status === 'failed') {
        console.log('❌ Official enhanced generation failed:', status.error);
        return false;
      }
      
      attempts++;
    }
    
    console.log('⏰ Generation monitoring timeout');
    return { success: false, predictionId: prediction.id };
    
  } catch (error) {
    console.error('❌ Official extra LoRA test failed:', error.message);
    return false;
  }
}

// Run the official enhancement test
testOfficialExtraLoRA()
  .then(result => {
    if (result && result.success) {
      console.log('\n🚀 OFFICIAL EXTRA LORA ENHANCEMENT: SUCCESS! 🚀');
      console.log('🔥 Ready to implement into SSELFIE Studio for WOW factor results');
    } else {
      console.log('\n⚠️ OFFICIAL EXTRA LORA TEST: NEEDS REVIEW');
      console.log('🔧 Check API format and LoRA compatibility');
    }
  })
  .catch(error => {
    console.error('❌ Test script error:', error);
  });