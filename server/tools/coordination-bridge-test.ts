/**
 * COORDINATION BRIDGE TEST
 * Verifies Elena can access all coordination systems
 */

import { coordinateAgents } from './agent-coordination-tool';

export async function testCoordinationBridge() {
  console.log('🧪 TESTING ELENA\'S COORDINATION BRIDGE');
  
  const tests = [
    {
      name: 'Send Message Test',
      request: {
        action: 'send_message' as const,
        targetAgent: 'zara',
        message: 'Test coordination message from Elena'
      }
    },
    {
      name: 'Task Assignment Test', 
      request: {
        action: 'assign_task' as const,
        targetAgent: 'aria',
        task: 'Test task assignment from Elena'
      }
    },
    {
      name: 'Workflow Coordination Test',
      request: {
        action: 'coordinate_workflow' as const,
        agents: ['zara', 'aria'],
        task: 'Test multi-agent workflow coordination',
        workflowType: 'test',
        priority: 'medium' as const
      }
    },
    {
      name: 'Task Distribution Test',
      request: {
        action: 'distribute_tasks' as const,
        agents: ['zara', 'aria', 'olga'],
        task: 'Test intelligent task distribution',
        workflowType: 'test',
        priority: 'low' as const
      }
    }
  ];

  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`🔧 Running: ${test.name}`);
      const result = await coordinateAgents(test.request);
      results.push({
        test: test.name,
        success: result.success,
        message: result.message,
        executingAgents: result.executingAgents
      });
      console.log(`✅ ${test.name}: ${result.success ? 'PASSED' : 'FAILED'}`);
    } catch (error) {
      results.push({
        test: test.name,
        success: false,
        message: `Error: ${error}`,
        executingAgents: []
      });
      console.log(`❌ ${test.name}: FAILED - ${error}`);
    }
  }

  const passedTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`🧪 COORDINATION BRIDGE TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
  
  return {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests,
    results
  };
}