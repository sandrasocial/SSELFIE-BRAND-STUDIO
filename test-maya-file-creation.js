/**
 * TEST MAYA FILE CREATION - REAL VALIDATION
 * Tests if Maya can actually create files in the system vs just claiming she's doing it
 */

async function testMayaFileCreation() {
  console.log('\n🧪 TESTING MAYA FILE CREATION CAPABILITIES...\n');
  
  try {
    // Test Maya's file creation through admin agent chat
    const testMessage = 'Maya, create a simple test component file called TestComponent.tsx in client/src/components/ with just a basic React component that says "Maya was here"';
    
    console.log('📝 Sending file creation request to Maya...');
    const response = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'maya',
        message: testMessage,
        adminToken: 'sandra-admin-2025'
      })
    });
    
    const result = await response.json();
    console.log('🤖 Maya Response:', result);
    
    // Wait a moment for file creation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if the file was actually created
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'client/src/components/TestComponent.tsx');
    
    if (fs.existsSync(filePath)) {
      console.log('✅ SUCCESS: Maya actually created the file!');
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log('📄 File content:', fileContent);
      
      // Clean up test file
      fs.unlinkSync(filePath);
      console.log('🧹 Test file cleaned up');
      
      return {
        success: true,
        message: 'Maya can actually create files in the system',
        fileCreated: true,
        content: fileContent
      };
    } else {
      console.log('❌ FAILURE: Maya claimed to create file but it was not found');
      return {
        success: false,
        message: 'Maya only claims to create files but does not actually do it',
        fileCreated: false
      };
    }
    
  } catch (error) {
    console.error('❌ Error testing Maya file creation:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testMayaFileCreation().then(result => {
  console.log('\n📊 FINAL RESULT:', result);
  process.exit(result.success ? 0 : 1);
});