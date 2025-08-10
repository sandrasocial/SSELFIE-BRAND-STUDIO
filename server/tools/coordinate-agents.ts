/**
 * AGENT COORDINATION TOOL - ELENA'S REAL COORDINATION SYSTEM
 * Allows Elena to actually coordinate other agents instead of fake narrative
 */

import { claudeApiServiceSimple } from '../services/claude-api-service-simple';

interface AgentTask {
  agentId: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  timeoutMs?: number;
}

interface CoordinationRequest {
  tasks: AgentTask[];
  coordinationType: 'parallel' | 'sequential';
  userId: string;
}

export async function coordinate_agents(input: CoordinationRequest): Promise<string> {
  try {
    console.log(`🎯 ELENA COORDINATION: Starting ${input.coordinationType} coordination of ${input.tasks.length} agents`);
    
    const results = [];
    
    if (input.coordinationType === 'parallel') {
      // Execute all tasks in parallel
      const promises = input.tasks.map(async (task) => {
        try {
          console.log(`👥 COORDINATING: ${task.agentId.toUpperCase()} executing "${task.task}"`);
          
          // Create stable conversation ID for agent
          const conversationId = `admin_${task.agentId}_${input.userId}`;
          
          // Actually invoke the agent through the Claude API service
          const result = await claudeApiServiceSimple.sendMessage(
            task.task,
            conversationId,
            task.agentId,
            true // isAdminBypass
          );
          
          return {
            agentId: task.agentId,
            task: task.task,
            status: 'completed',
            result: result?.content || 'Task executed successfully'
          };
          
        } catch (error) {
          console.error(`❌ AGENT ${task.agentId.toUpperCase()} FAILED:`, error);
          return {
            agentId: task.agentId,
            task: task.task,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });
      
      results.push(...await Promise.all(promises));
      
    } else {
      // Execute tasks sequentially
      for (const task of input.tasks) {
        try {
          console.log(`👥 COORDINATING: ${task.agentId.toUpperCase()} executing "${task.task}"`);
          
          const conversationId = `admin_${task.agentId}_${input.userId}`;
          
          const result = await claudeApiServiceSimple.sendMessage(
            task.task,
            conversationId,
            task.agentId,
            true
          );
          
          results.push({
            agentId: task.agentId,
            task: task.task,
            status: 'completed',
            result: result?.content || 'Task executed successfully'
          });
          
        } catch (error) {
          console.error(`❌ AGENT ${task.agentId.toUpperCase()} FAILED:`, error);
          results.push({
            agentId: task.agentId,
            task: task.task,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }
    
    // Build coordination summary
    const completed = results.filter(r => r.status === 'completed');
    const failed = results.filter(r => r.status === 'failed');
    
    let summary = `✅ COORDINATION COMPLETE: ${completed.length}/${results.length} agents successful\n\n`;
    
    completed.forEach(result => {
      summary += `✅ ${result.agentId.toUpperCase()}: ${result.task}\n`;
    });
    
    if (failed.length > 0) {
      summary += `\n❌ FAILED TASKS:\n`;
      failed.forEach(result => {
        summary += `❌ ${result.agentId.toUpperCase()}: ${result.task} - ${result.error}\n`;
      });
    }
    
    return summary;
    
  } catch (error) {
    console.error('Agent coordination error:', error);
    return `Coordination error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}