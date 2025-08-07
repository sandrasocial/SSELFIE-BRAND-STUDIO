import { multiAgentCoordinator } from '../services/multi-agent-coordinator';

export async function restart_workflow(input: { name: string; workflow_timeout?: number }): Promise<string> {
  try {
    console.log(`🚀 WORKFLOW RESTART: Executing workflow "${input.name}"`);
    console.log(`🔧 TOOL INPUT:`, JSON.stringify(input, null, 2));
    
    // Test simple agent coordination first
    if (input.name.toLowerCase().includes('test')) {
      console.log(`🧪 TEST MODE: Executing simple agent coordination test`);
      
      // Direct test of agent communication
      const { ClaudeApiServiceSimple } = await import('../services/claude-api-service-simple');
      const claudeService = new ClaudeApiServiceSimple();
      
      try {
        const testResult = await claudeService.sendMessage(
          "Test message from Elena: Please search for any workspace file to verify agent coordination",
          `test_coordination_${Date.now()}`,
          'zara'
        );
        
        console.log(`✅ AGENT COORDINATION TEST SUCCESS: Zara responded with ${testResult.length} characters`);
        return `✅ AGENT COORDINATION TEST PASSED: Elena successfully coordinated with Zara. Agent communication is working through the bypass system. Zara's response: ${testResult.substring(0, 200)}...`;
        
      } catch (error) {
        console.error(`❌ AGENT COORDINATION TEST FAILED:`, error);
        return `❌ AGENT COORDINATION TEST FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }
    
    // Full workflow execution
    const success = await multiAgentCoordinator.executeWorkflow(input.name);
    
    if (success) {
      console.log(`✅ WORKFLOW SUCCESS: "${input.name}" completed successfully`);
      return `✅ WORKFLOW EXECUTED: "${input.name}" completed successfully. Multi-agent coordination worked! All participating agents completed their tasks through the bypass system.`;
    } else {
      console.log(`❌ WORKFLOW FAILED: "${input.name}" not found or execution failed`);
      return `❌ WORKFLOW FAILED: "${input.name}" not found or execution failed. Check workflow-storage.json for available workflows.`;
    }
  } catch (error) {
    console.error('❌ WORKFLOW RESTART ERROR:', error);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.log(`🔍 ERROR DETAILS:`, errorMsg);
    return `❌ WORKFLOW ERROR: ${errorMsg}. Tool restart_workflow encountered an execution error.`;
  }
}