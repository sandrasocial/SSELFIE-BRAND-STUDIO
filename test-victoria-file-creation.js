/**
 * TEST VICTORIA AGENT FILE CREATION
 * Verify that Victoria can also create files like Maya
 */

const adminToken = 'sandra-admin-2025';
const baseUrl = 'http://localhost:5000';

async function testVictoriaFileCreation() {
  console.log('🎨 TESTING VICTORIA FILE CREATION');
  console.log('='*50);
  
  try {
    console.log('\n📝 Testing Victoria with UI component request...');
    const victoriaResponse = await fetch(`${baseUrl}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'victoria',
        message: 'Create a VictoriaTest.tsx component with a luxury button using our black/white style guide',
        adminToken: adminToken
      })
    });
    
    const victoriaData = await victoriaResponse.json();
    
    console.log('\n📄 VICTORIA RESPONSE:');
    console.log('Success:', victoriaData.success);
    console.log('Agent ID:', victoriaData.agentId);
    console.log('File Created:', victoriaData.fileCreated);
    console.log('Files Modified:', victoriaData.filesModified);
    console.log('\n💬 RESPONSE MESSAGE LENGTH:', victoriaData.message.length, 'characters');
    console.log('Message preview:', victoriaData.message.substring(0, 200) + '...');
    
    if (victoriaData.fileCreated) {
      console.log('\n✅ VICTORIA FILE CREATION SUCCESS!');
      console.log('Files created:', victoriaData.filesModified);
    } else {
      console.log('\n❌ VICTORIA FILE CREATION FAILED');
    }
    
  } catch (error) {
    console.error('💥 Victoria test failed:', error.message);
  }
}

testVictoriaFileCreation();