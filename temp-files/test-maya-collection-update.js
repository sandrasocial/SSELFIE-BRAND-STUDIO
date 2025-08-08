/**
 * TEST MAYA COLLECTION UPDATE
 * Quick test to see Maya's prompt enhancement in action
 */

const testMayaUpdate = async () => {
  console.log('🎨 Testing Maya collection update system...');
  
  // Sample collection to test Maya's upgrades
  const testCollections = [
    {
      id: 'business-power',
      name: 'Business Power',
      description: 'Executive authority and professional confidence',
      prompts: [
        {
          id: 'boardroom-1',
          name: 'Executive Authority',
          category: 'business',
          prompt: 'professional business portrait in modern office'
        },
        {
          id: 'meeting-1', 
          name: 'Leadership Moment',
          category: 'business',
          prompt: 'confident business leader in meeting room'
        }
      ]
    }
  ];
  
  try {
    const response = await fetch('http://localhost:5000/api/maya-update-collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': process.env.TEST_COOKIE || 'connect.sid=test-session'
      },
      credentials: 'include',
      body: JSON.stringify({ collections: testCollections })
    });
    
    if (!response.ok) {
      console.log('❌ Update failed:', response.status);
      const error = await response.text();
      console.log('Error details:', error);
      return;
    }
    
    const result = await response.json();
    
    console.log('✅ MAYA UPDATE SUCCESS!');
    console.log(`📊 Updated ${result.upgradeStats.totalPrompts} prompts across ${result.upgradeStats.totalCollections} collections`);
    
    // Show before/after comparison
    console.log('\n🔍 PROMPT TRANSFORMATION EXAMPLES:');
    result.updatedCollections.forEach(collection => {
      collection.prompts.forEach((prompt, index) => {
        const original = testCollections[0].prompts[index]?.prompt;
        console.log(`\n📝 "${prompt.name}":`);
        console.log(`BEFORE: ${original}`);
        console.log(`AFTER:  ${prompt.prompt.substring(0, 150)}...`);
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testMayaUpdate();