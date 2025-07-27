#!/usr/bin/env node

console.log('🧪 TESTING ELENA WORKFLOW - SIMPLE TEST...\n');

async function testElenaCommunication() {
  try {
    console.log('📋 Testing Elena agent chat communication...');
    
    const response = await fetch('http://localhost:5000/api/admin/agents/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: 'elena',
        message: 'Create a workflow for updating the admin dashboard with a welcome component',
        adminToken: 'sandra-admin-2025',
        conversationHistory: []
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Elena responded successfully');
      console.log('📝 Response preview:', result.message?.substring(0, 200) + '...');
      
      // Check if Elena created a workflow
      if (result.message && result.message.includes('WORKFLOW')) {
        console.log('🎯 Elena workflow creation detected!');
        
        // Test execution command
        console.log('\n🚀 Testing workflow execution command...');
        const execResponse = await fetch('http://localhost:5000/api/admin/agents/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            agentId: 'elena',
            message: 'execute workflow',
            adminToken: 'sandra-admin-2025',
            conversationHistory: [
              { type: 'user', content: 'Create a workflow for updating the admin dashboard with a welcome component' },
              { type: 'agent', content: result.message }
            ]
          })
        });
        
        if (execResponse.ok) {
          const execResult = await execResponse.json();
          console.log('✅ Workflow execution command sent');
          console.log('📝 Execution response:', execResult.message?.substring(0, 200) + '...');
        } else {
          console.log('❌ Workflow execution failed:', execResponse.status);
        }
      }
      
    } else {
      console.log('❌ Elena communication failed:', response.status);
      const text = await response.text();
      console.log('Error details:', text.substring(0, 200));
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testElenaCommunication();