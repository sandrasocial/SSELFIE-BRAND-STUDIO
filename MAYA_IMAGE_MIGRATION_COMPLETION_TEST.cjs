// Maya Context Retrieval & Image Migration Test
// Tests that Maya's original styling descriptions are properly retrieved for prompt generation

const fetch = require('node-fetch');

async function testMayaContextRetrieval() {
  console.log('🧪 TESTING: Maya Context Retrieval for Consistent Prompts\n');
  
  try {
    // Step 1: Test gallery images migration was successful
    console.log('1️⃣ TESTING: Image Migration Success...');
    
    const galleryResponse = await fetch('http://localhost:5000/api/gallery-images', {
      credentials: 'include',
      headers: {
        'Cookie': 'connect.sid=s%3AIiZK87k3IfuPKozwVBBpeEjnLNWBFG0-.Tnr%2B%2FhJinLbr6jm39zhjpwJsy8hyKe4mvJbl5FmfwRY'
      }
    });
    
    if (galleryResponse.ok) {
      const galleryImages = await galleryResponse.json();
      console.log(`✅ GALLERY: ${galleryImages.length} images restored to gallery`);
    } else {
      console.log('❌ GALLERY: Failed to fetch gallery images');
    }
    
    // Step 2: Test Maya chat and concept generation
    console.log('\n2️⃣ TESTING: Maya Concept Context Preservation...');
    
    const chatResponse = await fetch('http://localhost:5000/api/maya/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'connect.sid=s%3AIiZK87k3IfuPKozwVBBpeEjnLNWBFG0-.Tnr%2B%2FhJinLbr6jm39zhjpwJsy8hyKe4mvJbl5FmfwRY'
      },
      body: JSON.stringify({
        message: 'Maya, create 3 concept cards for professional headshots with your complete styling expertise',
        context: 'regular'
      })
    });
    
    if (chatResponse.ok) {
      const chatResult = await chatResponse.json();
      if (chatResult.conceptCards && chatResult.conceptCards.length > 0) {
        console.log(`✅ CONCEPTS: Maya created ${chatResult.conceptCards.length} concept cards`);
        
        // Test concept context retrieval
        const firstConcept = chatResult.conceptCards[0];
        console.log(`🎯 CONCEPT TEST: "${firstConcept.title}"`);
        console.log(`📝 ORIGINAL CONTEXT: ${firstConcept.originalContext ? 'Present ✅' : 'Missing ❌'}`);
        
        if (firstConcept.originalContext) {
          console.log(`📏 CONTEXT LENGTH: ${firstConcept.originalContext.length} characters`);
          console.log(`🔍 CONTEXT PREVIEW: ${firstConcept.originalContext.substring(0, 150)}...`);
        }
        
        return firstConcept;
      } else {
        console.log('❌ CONCEPTS: No concept cards generated');
      }
    } else {
      console.log('❌ CHAT: Failed to get Maya response');
    }
    
  } catch (error) {
    console.error('❌ TEST ERROR:', error.message);
  }
}

// Run the test
testMayaContextRetrieval().then(() => {
  console.log('\n🏁 TEST COMPLETE: Maya Context & Image Migration');
}).catch(console.error);