#!/usr/bin/env node

console.log('🧪 TESTING SANDRA WORKFLOW EXECUTION ISSUE...\n');

async function testSandraWorkflow() {
  try {
    console.log('📋 Step 1: Ask Elena to create a workflow...');
    
    const createResponse = await fetch('http://localhost:5000/api/admin/agents/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: 'elena',
        message: 'Create a workflow for redesigning the Admin Dashboard with a welcome component',
        adminToken: 'sandra-admin-2025',
        conversationHistory: []
      })
    });
    
    if (!createResponse.ok) {
      console.log('❌ Elena workflow creation failed:', createResponse.status);
      return;
    }
    
    const createResult = await createResponse.json();
    console.log('✅ Elena responded with workflow creation');
    console.log('📝 Response preview:', createResult.message?.substring(0, 200) + '...');
    
    console.log('\n🚀 Step 2: Ask Elena to execute workflow...');
    
    const executeResponse = await fetch('http://localhost:5000/api/admin/agents/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agentId: 'elena',
        message: 'execute workflow',
        adminToken: 'sandra-admin-2025',
        conversationHistory: [
          { type: 'user', content: 'Create a workflow for redesigning the Admin Dashboard with a welcome component' },
          { type: 'agent', content: createResult.message }
        ]
      })
    });
    
    if (!executeResponse.ok) {
      console.log('❌ Elena workflow execution failed:', executeResponse.status);
      const errorText = await executeResponse.text();
      console.log('Error details:', errorText);
      return;
    }
    
    const executeResult = await executeResponse.json();
    console.log('✅ Elena execution response received');
    console.log('📝 Execution response:', executeResult.message?.substring(0, 300) + '...');
    
    // Check if actual workflow started
    if (executeResult.message && executeResult.message.includes('WORKFLOW EXECUTION STARTED')) {
      console.log('🎯 SUCCESS: Workflow execution started successfully!');
      
      // Wait a bit and check workflow progress
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('\n📊 Step 3: Checking workflow progress...');
      
      // Check if agents are actually working
      const agentsResponse = await fetch('http://localhost:5000/api/agents');
      if (agentsResponse.ok) {
        const agents = await agentsResponse.json();
        console.log('👥 Available agents:', agents.length);
        
        // Check for any agent activity
        const metricsResponse = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'admin-token': 'sandra-admin-2025' }
        });
        
        if (metricsResponse.ok) {
          const metrics = await metricsResponse.json();
          console.log('📈 Agent tasks completed:', metrics.agentTasks || 0);
        }
      }
      
    } else {
      console.log('❌ Workflow execution failed or not started properly');
      console.log('Response:', executeResult.message);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testSandraWorkflow();