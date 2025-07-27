/**
 * TEST SIMPLE ENDPOINT - VERIFY EXPRESS ROUTING WORKS
 */

async function testSimpleEndpoint() {
  console.log('Testing if Express API routes work at all...');
  
  try {
    // Test existing working endpoint
    console.log('1. Testing known working endpoint: /api/admin/agent-file-operation');
    const workingResponse = await fetch('http://localhost:5000/api/admin/agent-file-operation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'test',
        operation: 'write',
        filePath: 'test-simple.txt',
        content: 'test',
        description: 'test',
        adminSessionId: 'BMusXBf_test'
      })
    });
    
    console.log('Working endpoint status:', workingResponse.status);
    console.log('Working endpoint headers:', workingResponse.headers.get('content-type'));
    
    if (workingResponse.ok) {
      const data = await workingResponse.json();
      console.log('✅ Known working endpoint returns JSON:', data.success);
    }
    
    // Test the new endpoint
    console.log('\n2. Testing new endpoint: /api/admin/agent-chat-bypass');
    const newResponse = await fetch('http://localhost:5000/api/admin/agent-chat-bypass', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: 'test',
        message: 'test',
        adminToken: 'sandra-admin-2025'
      })
    });
    
    console.log('New endpoint status:', newResponse.status);
    console.log('New endpoint headers:', newResponse.headers.get('content-type'));
    
    const responseText = await newResponse.text();
    console.log('Response is HTML?', responseText.startsWith('<!DOCTYPE html>'));
    console.log('Response preview:', responseText.substring(0, 100));
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testSimpleEndpoint();