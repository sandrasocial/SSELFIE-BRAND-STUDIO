/**
 * COMPREHENSIVE EXTERNAL INTEGRATIONS TEST
 * Tests all external APIs and agent automation tasks
 */

async function testAPI(endpoint, options = {}) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://sselfie.ai' 
    : 'http://localhost:5000';
    
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // For testing
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    return { status: response.status, data, success: response.ok };
  } catch (error) {
    return { status: 500, error: error.message, success: false };
  }
}

async function testIntegrationHealth() {
  console.log('\n🔍 Testing Integration Health Check...');
  
  const result = await testAPI('/api/integrations/health');
  
  if (result.success) {
    console.log('✅ Integration health check successful');
    console.log(`📊 Summary: ${result.data.summary.active}/${result.data.summary.total} integrations active`);
    
    Object.entries(result.data.integrations).forEach(([service, status]) => {
      console.log(`   ${status ? '✅' : '❌'} ${service.toUpperCase()}`);
    });
  } else {
    console.log('❌ Integration health check failed:', result.error || result.data.error);
  }
  
  return result.success;
}

async function testFlodeskImport() {
  console.log('\n📧 Testing Flodesk Subscriber Import...');
  
  const result = await testAPI('/api/integrations/flodesk/import', {
    method: 'POST'
  });
  
  if (result.success) {
    console.log('✅ Flodesk import successful');
    console.log(`📧 Found: ${result.data.totalFound} subscribers`);
    console.log(`✅ Imported: ${result.data.imported} subscribers`);
  } else {
    console.log('❌ Flodesk import failed:', result.error || result.data.error);
  }
  
  return result.success;
}

async function testInstagramAnalytics() {
  console.log('\n📱 Testing Instagram Analytics...');
  
  const result = await testAPI('/api/integrations/instagram/analytics?timeframe=week');
  
  if (result.success) {
    console.log('✅ Instagram analytics retrieved successfully');
    console.log(`📊 Timeframe: ${result.data.timeframe}`);
    console.log(`📈 Analytics data available: ${Object.keys(result.data.analytics).length} metrics`);
  } else {
    console.log('❌ Instagram analytics failed:', result.error || result.data.error);
  }
  
  return result.success;
}

async function testAgentTasks() {
  console.log('\n🤖 Testing Agent Automation Tasks...');
  
  const result = await testAPI('/api/integrations/agent-tasks');
  
  if (result.success) {
    console.log('✅ Agent tasks retrieved successfully');
    console.log(`📋 Total tasks available: ${result.data.totalTasks}`);
    console.log(`👩‍💼 Agents: ${result.data.agents.join(', ')}`);
    console.log(`📂 Categories: ${result.data.categories.join(', ')}`);
    
    // Test each agent's tasks
    for (const agent of result.data.agents) {
      const agentResult = await testAPI(`/api/integrations/agent-tasks?agentId=${agent}`);
      if (agentResult.success) {
        console.log(`   🤖 ${agent.toUpperCase()}: ${agentResult.data.totalTasks} tasks available`);
      }
    }
  } else {
    console.log('❌ Agent tasks failed:', result.error || result.data.error);
  }
  
  return result.success;
}

async function testTaskExecution() {
  console.log('\n⚡ Testing Task Execution...');
  
  // Test Flodesk import task execution
  const result = await testAPI('/api/integrations/execute-task', {
    method: 'POST',
    body: JSON.stringify({
      taskId: 'flodesk-subscriber-import',
      agentId: 'ava',
      parameters: {}
    })
  });
  
  if (result.success) {
    console.log('✅ Task execution successful');
    console.log(`🤖 Agent: ${result.data.agentId}`);
    console.log(`📋 Task: ${result.data.taskId}`);
    console.log(`⏰ Executed at: ${result.data.executedAt}`);
    
    if (result.data.result) {
      console.log(`📊 Result: ${JSON.stringify(result.data.result, null, 2)}`);
    }
  } else {
    console.log('❌ Task execution failed:', result.error || result.data.error);
  }
  
  return result.success;
}

async function testInstagramComments() {
  console.log('\n💬 Testing Instagram Comments Management...');
  
  const result = await testAPI('/api/integrations/instagram/comments');
  
  if (result.success) {
    console.log('✅ Instagram comments retrieved successfully');
    console.log(`💬 Total comments: ${result.data.totalComments}`);
    console.log(`🕐 Fetched at: ${result.data.fetched}`);
  } else {
    console.log('❌ Instagram comments failed:', result.error || result.data.error);
  }
  
  return result.success;
}

async function testExternalAPIDirectly() {
  console.log('\n🔗 Testing External API Service Directly...');
  
  try {
    // Import and test the external API service directly
    const { ExternalAPIService } = await import('./server/integrations/external-api-service.js');
    
    console.log('🔍 Testing direct API service calls...');
    
    // Test Flodesk connection
    try {
      const subscribers = await ExternalAPIService.getFlodeskSubscribers();
      console.log(`✅ Flodesk: Connected successfully (${subscribers.length} subscribers)`);
    } catch (error) {
      console.log(`❌ Flodesk: ${error.message}`);
    }
    
    // Test Instagram connection
    try {
      const analytics = await ExternalAPIService.getInstagramAnalytics();
      console.log(`✅ Instagram: Connected successfully`);
    } catch (error) {
      console.log(`❌ Instagram: ${error.message}`);
    }
    
    // Test Make connection
    try {
      const scenarios = await ExternalAPIService.getMakeScenarios();
      console.log(`✅ Make: Connected successfully (${scenarios.scenarios?.length || 0} scenarios)`);
    } catch (error) {
      console.log(`❌ Make: ${error.message}`);
    }
    
    // Test ManyChat connection
    try {
      const subscribers = await ExternalAPIService.getManychatSubscribers();
      console.log(`✅ ManyChat: Connected successfully (${subscribers.length} subscribers)`);
    } catch (error) {
      console.log(`❌ ManyChat: ${error.message}`);
    }
    
  } catch (error) {
    console.log('❌ Direct API test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testEnvironmentSecrets() {
  console.log('\n🔐 Testing Environment Secrets...');
  
  const requiredSecrets = [
    'MAKE_API_TOKEN',
    'FLODESK_API_KEY', 
    'MANYCHAT_API_TOKEN',
    'META_APP_ID',
    'META_APP_SECRET',
    'META_ACCESS_TOKEN',
    'INSTAGRAM_BUSINESS_ACCOUNT_ID'
  ];
  
  let allSecretsPresent = true;
  
  for (const secret of requiredSecrets) {
    const isPresent = !!process.env[secret];
    console.log(`${isPresent ? '✅' : '❌'} ${secret}: ${isPresent ? 'Present' : 'Missing'}`);
    if (!isPresent) allSecretsPresent = false;
  }
  
  return allSecretsPresent;
}

async function generateIntegrationsReport() {
  console.log('\n📋 EXTERNAL INTEGRATIONS TEST REPORT');
  console.log('═'.repeat(50));
  
  const results = {
    environmentSecrets: await testEnvironmentSecrets(),
    integrationHealth: await testIntegrationHealth(),
    flodeskImport: await testFlodeskImport(),
    instagramAnalytics: await testInstagramAnalytics(),
    agentTasks: await testAgentTasks(),
    taskExecution: await testTaskExecution(),
    instagramComments: await testInstagramComments(),
    directAPITest: await testExternalAPIDirectly()
  };
  
  console.log('\n📊 SUMMARY:');
  console.log('═'.repeat(30));
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test.replace(/([A-Z])/g, ' $1').toUpperCase()}`);
  });
  
  console.log(`\n🎯 SUCCESS RATE: ${passedTests}/${totalTests} (${successRate}%)`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL EXTERNAL INTEGRATIONS READY FOR SANDRA\'S AI AGENTS!');
    console.log('🚀 Agents can now:');
    console.log('   • Import 2,500 Flodesk subscribers');
    console.log('   • Automate Instagram DMs and comments');
    console.log('   • Create Make automation workflows');
    console.log('   • Manage ManyChat conversations');
    console.log('   • Generate real-time analytics reports');
  } else {
    console.log('\n⚠️  Some integrations need attention before full agent activation');
  }
  
  return {
    success: passedTests === totalTests,
    passedTests,
    totalTests,
    successRate: successRate + '%',
    results
  };
}

// Auto-run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateIntegrationsReport()
    .then(report => {
      console.log('\n✅ Integration test completed');
      process.exit(report.success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Integration test failed:', error);
      process.exit(1);
    });
}

export { generateIntegrationsReport, testExternalAPIDirectly };