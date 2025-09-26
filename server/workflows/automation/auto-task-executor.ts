/**
 * AUTOMATIC TASK EXECUTION SYSTEM
 * Automatic task executor that triggers agents to begin working on assigned tasks without manual activation
 */

import { ClaudeApiService } from '../../services/hybrid-intelligence/claude-api.service.js';
const claudeApiService = new ClaudeApiService();

export interface AutoExecutionConfig {
  agentId: string;
  conversationId: string;
  taskDescription: string;
  priority: 'high' | 'medium' | 'low';
  delayMs?: number; // Optional delay before auto-execution
}

export class AutoTaskExecutor {
  /**
   * Automatically trigger an agent to start working on their assigned task
   */
  static async triggerAutoExecution(config: AutoExecutionConfig): Promise<boolean> {
    try {
      const { agentId, conversationId, taskDescription, priority, delayMs = 0 } = config;
      
      console.log(`[Lightning] AUTO-EXECUTION: Triggering ${agentId} to start work immediately`);
      
      // Optional delay (for dependency management)
      if (delayMs > 0) {
        console.log(`AUTO-EXECUTION: Waiting ${delayMs}ms before triggering ${agentId}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      // Create immediate execution trigger message
      const autoExecutionMessage = `[Lightning] AUTOMATIC TASK EXECUTION TRIGGER [Lightning]

You have been assigned a ${priority.toUpperCase()} priority task and must begin working IMMEDIATELY.

**Your Task:** ${taskDescription}

**IMMEDIATE ACTIONS REQUIRED:**
1. ✅ Start using your available tools RIGHT NOW
2. 🔍 Begin systematic work on your assigned deliverables  
3. 📊 Provide real-time progress updates
4. 🎯 Focus on completing your specific role in this workflow

**AUTO-EXECUTION MODE:** This is an automatic trigger. No manual confirmation is needed. Begin work immediately using all necessary tools to complete your assigned task.

**Priority Level:** ${priority.toUpperCase()} - Work with appropriate urgency.

START WORKING NOW. Use your specialized tools and expertise to execute your task systematically.`;

      // Send auto-execution trigger to agent
      const response: string = await claudeApiService.sendMessage(
        autoExecutionMessage,
        conversationId,
        agentId,
        false // Basic response
      );

      console.log(`[OK] AUTO-EXECUTION: ${agentId} triggered successfully`);
      console.log(`[Doc] Response: ${response.substring(0, 150)}...`);
      
      return true;
      
    } catch (error) {
      console.error(`AUTO-EXECUTION FAILED for ${config.agentId}:`, error);
      return false;
    }
  }
  
  /**
   * Trigger multiple agents simultaneously with auto-execution
   */
  static async triggerMultipleAgents(configs: AutoExecutionConfig[]): Promise<{ successful: string[]; failed: string[] }> {
    const results = await Promise.allSettled(
      configs.map(config => this.triggerAutoExecution(config))
    );
    
    const successful: string[] = [];
    const failed: string[] = [];
    
    results.forEach((result, index) => {
      const config = configs[index];
      if (config && result.status === 'fulfilled' && result.value) {
        successful.push(config.agentId);
      } else if (config) {
        failed.push(config.agentId);
      }
    });
    
    console.log(`[OK] AUTO-EXECUTION BATCH: ${successful.length} successful, ${failed.length} failed`);
    return { successful, failed };
  }
  
  /**
   * Create auto-execution config from workflow template
   */
  static createAutoExecutionConfigs(
    workflowTemplate: any,
    sessionId: string
  ): AutoExecutionConfig[] {
    return workflowTemplate.agents.map((agent: any, index: number) => ({
      agentId: agent.agentId,
      conversationId: `admin_${agent.agentId}_42585527`,
      taskDescription: agent.taskDescription,
      priority: agent.priority,
      delayMs: agent.dependencies?.length ? 5000 * index : 0 // Stagger dependent tasks
    }));
  }
}