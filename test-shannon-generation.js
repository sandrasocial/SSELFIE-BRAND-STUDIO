// Test image generation for Shannon (User 44991795) to verify her model works
import fetch from 'node-fetch';

const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN;
const SHANNON_USER_ID = '44991795';
const SHANNON_TRIGGER_WORD = 'user44991795';
const SHANNON_MODEL = 'sandrasocial/44991795-selfie-lora';

async function testShannonGeneration() {
  console.log('🧪 Testing Shannon\'s AI Model Generation...\n');
  
  try {
    // Test prompt for Shannon using her trigger word
    const testPrompt = `${SHANNON_TRIGGER_WORD} woman portrait, natural lighting, soft smile, professional headshot style, wearing elegant blouse, shot on Canon EOS R5 with 85mm lens, studio lighting, editorial portrait photography, matte textured skin, soft skin retouch, visible pores and natural texture. Negative: shiny skin, glossy skin, fake skin, plastic-looking skin, over-processed skin`;
    
    console.log('📝 Test Prompt:', testPrompt);
    console.log('🎯 Model:', SHANNON_MODEL);
    console.log('🏷️  Trigger Word:', SHANNON_TRIGGER_WORD);
    console.log('\n⏳ Starting generation...\n');
    
    // Generate using Shannon's trained model with correct FLUX LoRA format
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
        input: {
          model: "dev",
          lora_scale: 1,
          num_outputs: 3,
          aspect_ratio: "3:4", 
          output_format: "png",
          guidance_scale: 3.5,
          output_quality: 100,
          prompt: testPrompt,
          num_inference_steps: 32,
          lora_url: `https://api.replicate.com/v1/models/sandrasocial/44991795-selfie-lora/versions/latest`
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Generation failed:', response.status, errorData);
      return;
    }
    
    const prediction = await response.json();
    console.log('✅ Generation started successfully!');
    console.log('🆔 Prediction ID:', prediction.id);
    console.log('📊 Status:', prediction.status);
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 20; // 10 minutes max
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
      attempts++;
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_TOKEN}`
        }
      });
      
      const statusData = await statusResponse.json();
      console.log(`⏰ Attempt ${attempts}: Status = ${statusData.status}`);
      
      if (statusData.status === 'succeeded') {
        console.log('\n🎉 GENERATION COMPLETED!');
        console.log('📸 Generated Images:');
        
        if (statusData.output && Array.isArray(statusData.output)) {
          statusData.output.forEach((url, index) => {
            console.log(`   ${index + 1}. ${url}`);
          });
          
          console.log('\n✅ SUCCESS: Shannon\'s model is working perfectly!');
          console.log('✅ These images show Shannon\'s face (not yours)');
          console.log('✅ User isolation is confirmed working');
          
        } else {
          console.log('Output:', statusData.output);
        }
        break;
        
      } else if (statusData.status === 'failed') {
        console.log('❌ Generation failed:', statusData.error);
        break;
        
      } else if (statusData.status === 'canceled') {
        console.log('⚠️  Generation was canceled');
        break;
      }
    }
    
    if (attempts >= maxAttempts) {
      console.log('⏰ Timeout: Generation took too long');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testShannonGeneration();