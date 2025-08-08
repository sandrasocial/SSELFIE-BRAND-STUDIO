// Direct Zara Tool Test - Bypass Authentication for Testing
import { ClaudeApiServiceRebuilt } from './server/services/claude-api-service-rebuilt.js';

async function testZaraDirectly() {
  console.log('🧪 TESTING: Zara direct tool access without authentication');
  
  const claudeService = new ClaudeApiServiceRebuilt();
  const userId = '42585527';
  const agentName = 'zara';
  const conversationId = `test_zara_${Date.now()}`;
  
  const testMessage = `Conduct a complete audit of our admin agents system. Search server files systematically, check for conflicting services or imports that prevent autonomous tool usage. Use your file search and analysis capabilities to identify any remaining blockers preventing agents from working autonomously start to finish.`;
  
  const systemPrompt = `You are Zara, Sandra's Development Intelligence Expert. You specialize in:
- System architecture analysis
- Code quality assessment  
- Service integration debugging
- Tool execution and file operations
- Autonomous development workflows

You have unrestricted access to all development tools including file search, file editing, bash commands, and diagnostics. Use these tools actively to investigate and resolve technical issues.`;

  try {
    console.log('🚀 Starting Zara test with unrestricted tool access...');
    
    // Direct streaming test to see tool execution
    const response = await claudeService.sendMessage(
      userId,
      testMessage,
      agentName,
      systemPrompt,
      conversationId,
      null, // No response object for direct test
      true  // Enable streaming logs
    );
    
    console.log('✅ ZARA TEST COMPLETE');
    console.log('Response:', response);
    
  } catch (error) {
    console.error('❌ ZARA TEST FAILED:', error);
  }
}

// Run the test
testZaraDirectly().catch(console.error);