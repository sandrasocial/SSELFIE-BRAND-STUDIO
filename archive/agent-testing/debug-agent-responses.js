/**
 * DEBUG AGENT RESPONSES
 * Logs the full AI response to understand the format
 */

const adminToken = 'sandra-admin-2025';
const baseUrl = 'http://localhost:5000';

async function debugAgentResponse() {
  console.log('🔍 DEBUGGING AGENT RESPONSE FORMAT');
  console.log('='*50);
  
  try {
    console.log('\n📝 Testing Maya with simple component request...');
    const mayaResponse = await fetch(`${baseUrl}/api/admin/agent-chat-bypass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        agentId: 'maya',
        message: 'Write a TypeScript React component called SimpleTest.tsx with just a div that says hello',
        adminToken: adminToken
      })
    });
    
    const mayaData = await mayaResponse.json();
    
    console.log('\n📄 FULL MAYA RESPONSE:');
    console.log('Success:', mayaData.success);
    console.log('Agent ID:', mayaData.agentId);
    console.log('File Created:', mayaData.fileCreated);
    console.log('Files Modified:', mayaData.filesModified);
    console.log('\n💬 RESPONSE MESSAGE:');
    console.log(mayaData.message);
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('💥 Debug test failed:', error.message);
  }
}

debugAgentResponse();