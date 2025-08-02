// Direct Zara testing to monitor her over-analysis fix performance
const { ClaudeApiService } = require('./server/services/claude-api-service.ts');

async function testZaraDirectly() {
  console.log('🧪 TESTING ZARA DIRECTLY - MONITORING OVER-ANALYSIS CLEANUP');
  console.log('📋 Task: Examine and optimize Admin agent consulting chat interference system');
  
  try {
    const claudeService = new ClaudeApiService();
    
    const testMessage = `Zara, examine and optimize the Admin agent consulting chat interference system. 

Tasks to complete:
1. Analyze the routing issues causing HTML responses instead of JSON in admin endpoints
2. Fix the consulting-agents-routes.ts redirect chain that's failing  
3. Optimize the streaming admin routes for user-friendly admin-to-agent chat
4. Test the fixes to ensure proper JSON API responses
5. Document any improvements made

Use your technical expertise and tools to complete this optimization task.`;

    const conversationId = `zara-direct-test-${Date.now()}`;
    
    console.log('⏱️  Starting timer - monitoring for analysis loops vs direct implementation...');
    const startTime = Date.now();
    
    // This will test Zara with the cleaned-up system prompts
    const response = await claudeService.sendMessage(
      'admin-sandra', // userId
      'zara',         // agentName  
      testMessage,    // message
      conversationId, // conversationId
      [] // previousMessages
    );
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ ZARA RESPONSE COMPLETE - Duration: ${duration}ms`);
    console.log('📊 MONITORING ANALYSIS:');
    console.log('- Response Length:', response.length, 'characters');
    console.log('- Contains analysis keywords:', /analyz|analis|thorough|comprehensive|detailed/.test(response));
    console.log('- Contains implementation keywords:', /implement|fix|create|modify|optimize/.test(response));
    
    console.log('\n🎯 ZARA\'S ACTUAL RESPONSE:');
    console.log('=' .repeat(80));
    console.log(response);
    console.log('=' .repeat(80));
    
    return {
      success: true,
      duration,
      response,
      analysisDetected: /analyz|analis|thorough|comprehensive|detailed/.test(response),
      implementationDetected: /implement|fix|create|modify|optimize/.test(response)
    };
    
  } catch (error) {
    console.error('❌ ZARA TEST ERROR:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testZaraDirectly().then(result => {
  console.log('\n🏁 FINAL TEST RESULTS:');
  console.log(JSON.stringify(result, null, 2));
}).catch(console.error);