/**
 * TEST OLGA TOOL INTEGRATION
 * Tests that Olga can now use tools through the Visual Editor
 */

const TEST_URL = 'http://localhost:5000';

async function testOlgaWithTools() {
  console.log('🧪 TESTING: Olga Tool Integration through Visual Editor');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: File operation request to Olga
    console.log('\n📁 TEST 1: Requesting file audit from Olga...');
    
    const response = await fetch(`${TEST_URL}/api/admin/agents/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        agentId: 'olga',
        message: 'Olga, please show me the file structure of the client/src directory using your tools',
        conversationHistory: []
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Olga responded successfully');
      console.log('📝 Response preview:', data.message?.substring(0, 200) + '...');
      
      // Check if response contains tool execution evidence
      if (data.message?.includes('str_replace_based_edit_tool executed') || 
          data.message?.includes('search_filesystem executed')) {
        console.log('🔧 ✅ TOOL USAGE DETECTED: Olga successfully used tools!');
        return true;
      } else {
        console.log('❌ NO TOOL USAGE: Olga responded but did not use tools');
        console.log('Full response:', data.message);
        return false;
      }
    } else {
      console.log('❌ Request failed:', response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    return false;
  }
}

// Run the test
testOlgaWithTools().then(success => {
  if (success) {
    console.log('\n🎉 SUCCESS: Olga tool integration is working!');
    console.log('Sandra can now use Olga for file operations through Visual Editor');
  } else {
    console.log('\n❌ FAILURE: Olga tool integration needs more work');
  }
}).catch(error => {
  console.log('\n💥 Test crashed:', error.message);
});