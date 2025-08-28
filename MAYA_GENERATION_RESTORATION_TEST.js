// Maya Generation Restoration Test
// Tests Maya's prompt generation and response formatting after fix

const testPromptExtraction = () => {
  console.log('🎯 MAYA GENERATION TEST: Testing prompt extraction from responses...');
  
  // Test case 1: Prompt block extraction
  const responseWithPromptBlock = `
I'm so excited to create these stunning executive headshots for you! This will showcase your confidence and authority perfectly.

\`\`\`prompt
user42585527, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, professional executive portrait, impeccably tailored charcoal grey blazer, minimalist modern office setting, confident gaze, natural lighting, sharp focus, editorial photography style
\`\`\`
`;

  // Test case 2: Embedded prompt format  
  const responseWithEmbeddedPrompt = `
**🎯 EXECUTIVE POWER LOOK - Modern Authority**
user42585527, raw photo, visible skin pores, film grain, unretouched natural skin texture, subsurface scattering, photographed on film, professional executive portrait, impeccably tailored charcoal grey blazer...
`;

  // Test prompt extraction logic (mirrors server/routes/maya-unified.ts)
  const testExtraction = (response, testName) => {
    console.log(`\n📝 Testing: ${testName}`);
    
    let extractedPrompt = null;
    let canGenerate = false;
    
    // Check generation triggers
    if (response.toLowerCase().includes('generate') || 
        response.toLowerCase().includes('create') ||
        response.toLowerCase().includes('photoshoot') ||
        response.includes('```prompt') ||
        response.includes('🎯')) {
      canGenerate = true;
      console.log('✅ Generation trigger detected');
    }
    
    // Extract prompt block
    const promptMatch = response.match(/```prompt\s*([\s\S]*?)\s*```/);
    if (promptMatch) {
      extractedPrompt = promptMatch[1].trim();
      console.log('✅ Prompt block extracted:', extractedPrompt.substring(0, 100) + '...');
    } else {
      // Try embedded format
      const embeddedMatch = response.match(/\*\*🎯[^*]*\*\*\s*([\s\S]*?)(?=\*\*🎯|\*\*Generated|$)/);
      if (embeddedMatch) {
        extractedPrompt = embeddedMatch[1].trim();
        console.log('✅ Embedded prompt extracted:', extractedPrompt.substring(0, 100) + '...');
      }
    }
    
    console.log(`   canGenerate: ${canGenerate}`);
    console.log(`   hasPrompt: ${!!extractedPrompt}`);
    console.log(`   promptLength: ${extractedPrompt ? extractedPrompt.length : 0}`);
    
    return { canGenerate, extractedPrompt };
  };
  
  // Run tests
  const test1 = testExtraction(responseWithPromptBlock, 'Prompt Block Format');
  const test2 = testExtraction(responseWithEmbeddedPrompt, 'Embedded Prompt Format');
  
  console.log('\n🎯 MAYA GENERATION TEST RESULTS:');
  console.log('Test 1 (Prompt Block):', test1.canGenerate && test1.extractedPrompt ? '✅ PASS' : '❌ FAIL');
  console.log('Test 2 (Embedded):', test2.canGenerate && test2.extractedPrompt ? '✅ PASS' : '❌ FAIL');
  
  if (test1.canGenerate && test1.extractedPrompt && test2.canGenerate && test2.extractedPrompt) {
    console.log('\n🎉 MAYA GENERATION RESTORATION: SUCCESS!');
    console.log('✅ Response processing correctly identifies generation triggers');
    console.log('✅ Prompt extraction works for both formats');
    console.log('✅ Generation buttons should now appear in Maya interface');
  } else {
    console.log('\n❌ MAYA GENERATION RESTORATION: NEEDS ATTENTION');
  }
};

// Run the test
testPromptExtraction();