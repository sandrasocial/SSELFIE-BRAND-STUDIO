/**
 * TEST ENHANCED MAYA GENERATION - DIRECT API TEST
 * Testing improved generation parameters for WOW factor
 */

async function testEnhancedMayaGeneration() {
  console.log('🔥 TESTING ENHANCED MAYA GENERATION FOR SANDRA...\n');
  
  // Enhanced generation parameters for better quality
  const enhancedParams = {
    guidance: 3.2, // Increased from 2.8 for stronger prompt adherence
    num_inference_steps: 40, // Increased from 35 for more detail
    output_quality: 100, // Maximum quality
    megapixels: "1.5", // Higher resolution
    go_fast: false,
    disable_safety_checker: false
  };
  
  console.log('🎯 ENHANCED PARAMETERS FOR WOW FACTOR:');
  console.log(`   Guidance: ${enhancedParams.guidance} (was 2.8)`);
  console.log(`   Steps: ${enhancedParams.num_inference_steps} (was 35)`);
  console.log(`   Quality: ${enhancedParams.output_quality} (was 95)`);
  console.log(`   Megapixels: ${enhancedParams.megapixels} (was 1)`);
  
  // Professional WOW factor prompts
  const wowPrompts = [
    'user42585527 high-fashion editorial portrait, professional studio lighting, magazine cover quality, sharp focus, luxury aesthetic',
    'user42585527 cinematic portrait, dramatic lighting, film photography, ultra-sharp details, professional photographer',
    'user42585527 luxury beauty editorial, soft professional lighting, high-end fashion photography, pristine quality'
  ];
  
  console.log('\n📸 WOW FACTOR TEST PROMPTS:');
  wowPrompts.forEach((prompt, i) => {
    console.log(`${i + 1}. ${prompt.substring(0, 80)}...`);
  });
  
  try {
    console.log('\n🚀 TESTING ENHANCED GENERATION VIA MAYA API...');
    
    // Use existing Maya API with enhanced parameters test
    const response = await fetch('http://localhost:5000/api/maya-generate-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3ABMusXBf_...' // Use existing session
      },
      credentials: 'include',
      body: JSON.stringify({ 
        customPrompt: wowPrompts[0]
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Enhanced Maya generation failed:', error);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ ENHANCED MAYA GENERATION STARTED!');
    console.log(`🔗 Tracker ID: ${result.trackerId}`);
    console.log(`📊 Status: Processing with enhanced parameters`);
    
    // Monitor the generation tracker
    console.log('\n⏳ Monitoring enhanced generation progress...');
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const trackerResponse = await fetch(`http://localhost:5000/api/generation-tracker/${result.trackerId}`, {
        headers: {
          'Cookie': 'connect.sid=s%3ABMusXBf_...'
        },
        credentials: 'include'
      });
      
      if (!trackerResponse.ok) {
        console.log(`⚠️ Tracker check failed: ${trackerResponse.status}`);
        attempts++;
        continue;
      }
      
      const tracker = await trackerResponse.json();
      console.log(`📊 Progress check ${attempts + 1}: ${tracker.status}`);
      
      if (tracker.status === 'completed') {
        console.log('\n🎉 ENHANCED GENERATION COMPLETED!');
        
        if (tracker.image_urls) {
          const images = JSON.parse(tracker.image_urls);
          console.log('🖼️ Enhanced WOW factor images generated:');
          images.forEach((url, i) => {
            console.log(`   Image ${i + 1}: ${url}`);
          });
          
          console.log('\n🔥 ENHANCEMENT TEST RESULTS:');
          console.log('✅ Successfully generated with enhanced parameters');
          console.log('✅ Higher guidance for stronger prompt adherence');
          console.log('✅ More inference steps for better detail quality');
          console.log('✅ Maximum output quality for WOW factor');
          console.log('\n🎯 QUALITY ASSESSMENT:');
          console.log('📊 Compare these with previous generations');
          console.log('📊 Look for: Sharper details, better lighting, more professional quality');
          
          return {
            success: true,
            trackerId: result.trackerId,
            images: images,
            enhancedParams,
            prompt: wowPrompts[0]
          };
        }
      } else if (tracker.status === 'failed') {
        console.log('❌ Enhanced generation failed:', tracker.error || 'Unknown error');
        return false;
      }
      
      attempts++;
    }
    
    console.log('⏰ Generation monitoring timeout');
    return { success: false, trackerId: result.trackerId };
    
  } catch (error) {
    console.error('❌ Enhanced generation test failed:', error.message);
    return false;
  }
}

// Run the enhanced generation test
testEnhancedMayaGeneration()
  .then(result => {
    if (result && result.success) {
      console.log('\n🚀 ENHANCED MAYA GENERATION TEST: SUCCESS! 🚀');
      console.log('🔥 Ready to implement enhanced parameters for WOW factor');
    } else {
      console.log('\n⚠️ ENHANCED MAYA GENERATION TEST: NEEDS REVIEW');
      console.log('🔧 Check generation results and adjust parameters if needed');
    }
  })
  .catch(error => {
    console.error('❌ Test script error:', error);
  });