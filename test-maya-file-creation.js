/**
 * TEST: Maya Agent File Creation Flow
 * Simulates exactly what happens when you ask Maya to create a component
 */

async function testMayaFileCreation() {
  console.log('🧪 TESTING MAYA AGENT FILE CREATION...');
  
  try {
    // Simulate the exact API call that happens when you chat with Maya
    const response = await fetch('http://localhost:5000/api/agents/maya/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This would need proper authentication in real scenario
      },
      body: JSON.stringify({
        message: 'Create a TestButton component'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📝 Maya Response:', data);
    
    if (data.fileOperations && data.fileOperations.length > 0) {
      console.log('✅ Maya reported file operations:', data.fileOperations);
      
      // Check if the file was actually created
      const fs = await import('fs/promises');
      const filePath = data.fileOperations[0].path;
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        console.log('✅ File confirmed created:', filePath);
        console.log('📄 File content preview:', content.substring(0, 200) + '...');
        return { success: true, file: filePath };
      } catch (fileError) {
        console.log('❌ File NOT found despite Maya claiming to create it:', filePath);
        return { success: false, reason: 'File not created despite claim' };
      }
    } else {
      console.log('❌ Maya did not report any file operations');
      return { success: false, reason: 'No file operations reported' };
    }
    
  } catch (error) {
    console.log('❌ Maya API call failed:', error.message);
    return { success: false, reason: error.message };
  }
}

// Run the test
testMayaFileCreation().then(result => {
  console.log('\n🎯 TEST RESULT:', result);
  
  if (!result.success) {
    console.log('\n🔧 POSSIBLE ISSUES:');
    console.log('1. Agent conversation routes not connected to file operations');
    console.log('2. Authentication required for API calls');
    console.log('3. AgentCodebaseIntegration not being called properly');
    console.log('4. Server not running or responding');
  }
});