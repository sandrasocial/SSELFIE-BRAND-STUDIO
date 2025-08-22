/**
 * SPECIALIZATION INTEGRATION
 * Connects the new specialization system with Elena's delegation system
 */

import { AGENT_SPECIALIZATIONS, shouldAgentHandle, getAgentWorkStyle } from './agent-specialization-system';
import { analyzeTaskForBestAgent, preventCoordinationLoop, getAgentSelfAwarenessPrompt } from './agent-delegation-fix';
import { ElenaDelegationSystem } from '../utils/elena-delegation-system';

export interface AgentPromptContext {
  agentName: string;
  taskDescription: string;
  shouldExecute: boolean;
  specialtyPrompt: string;
  coordinationGuidance: string;
}

/**
 * Integrates specialization awareness with existing coordination system
 */
export class SpecializationIntegration {
  private static elenaSystem = ElenaDelegationSystem.getInstance();

  /**
   * Generates specialized agent prompt based on task and agent
   */
  static generateAgentPrompt(agentName: string, taskDescription: string): AgentPromptContext {
    const taskAnalysis = analyzeTaskForBestAgent(taskDescription);
    const agentAnalysis = shouldAgentHandle(agentName, taskDescription);
    const coordinationCheck = preventCoordinationLoop(agentName, taskDescription);
    
    const shouldExecute = agentAnalysis.shouldHandle && coordinationCheck.action === 'execute';
    
    const specialtyPrompt = getAgentWorkStyle(agentName);
    const selfAwarenessPrompt = getAgentSelfAwarenessPrompt(agentName);

    let coordinationGuidance = "";
    
    if (shouldExecute) {
      coordinationGuidance = `
🎯 EXECUTE DIRECTLY: This task matches your expertise perfectly!
✅ ACTION: Handle this task using your specialized skills
❌ DON'T: Delegate or coordinate - this is exactly what you're designed for
      `;
    } else {
      const bestAgent = taskAnalysis.bestAgent;
      const bestAgentSpec = AGENT_SPECIALIZATIONS[bestAgent];
      
      coordinationGuidance = `
🚨 DELEGATE: This task is outside your specialty
✅ BEST AGENT: ${bestAgentSpec.name} (${bestAgentSpec.primaryRole})
🔄 ACTION: ${agentName === 'elena' ? 'Coordinate assignment to appropriate agent' : 'Suggest delegation to Elena for coordination'}
❌ DON'T: Attempt this task yourself - focus on your specialty
      `;
    }

    return {
      agentName,
      taskDescription,
      shouldExecute,
      specialtyPrompt: specialtyPrompt + "\n" + selfAwarenessPrompt,
      coordinationGuidance
    };
  }

  /**
   * Pre-task validation to prevent coordination chaos
   */
  static validateTaskAssignment(agentName: string, taskDescription: string): {
    isValid: boolean;
    recommendation: string;
    shouldProceed: boolean;
  } {
    const analysis = shouldAgentHandle(agentName, taskDescription);
    const taskAnalysis = analyzeTaskForBestAgent(taskDescription);
    
    if (analysis.shouldHandle) {
      return {
        isValid: true,
        recommendation: `Perfect match: ${agentName} should handle this ${taskAnalysis.taskType} task`,
        shouldProceed: true
      };
    }

    const bestAgent = taskAnalysis.bestAgent;
    const bestAgentSpec = AGENT_SPECIALIZATIONS[bestAgent];

    return {
      isValid: false,
      recommendation: `Mismatch: Task should go to ${bestAgentSpec.name} who specializes in ${bestAgentSpec.primaryRole}`,
      shouldProceed: false
    };
  }

  /**
   * Enhanced delegation with specialization awareness
   */
  static async delegateWithSpecialization(
    coordinatorAgent: string,
    taskDescription: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<string> {
    // Analyze task to find best agent
    const taskAnalysis = analyzeTaskForBestAgent(taskDescription);
    const bestAgentName = taskAnalysis.bestAgent;
    
    // Use Elena's delegation system to assign task
    try {
      const result = await this.elenaSystem.delegateTask({
        id: `spec_${Date.now()}`,
        description: taskDescription,
        priority,
        skills: [taskAnalysis.taskType],
        estimatedDuration: 30,
        dependencies: [],
        coordinatorAgent,
        reasoning: taskAnalysis.reasoning
      });

      // Add specialization context to result
      const agentSpec = AGENT_SPECIALIZATIONS[bestAgentName];
      return `
✅ TASK DELEGATED SUCCESSFULLY

🎯 ASSIGNED TO: ${agentSpec.name}
📋 TASK: ${taskDescription}
🔧 SPECIALTY MATCH: ${taskAnalysis.taskType} → ${agentSpec.primaryRole}
💡 REASONING: ${taskAnalysis.reasoning}

${result}
      `;
    } catch (error) {
      return `❌ DELEGATION FAILED: ${error.message}`;
    }
  }

  /**
   * Generates system prompt for agent initialization
   */
  static getAgentSystemPrompt(agentName: string): string {
    const specialty = AGENT_SPECIALIZATIONS[agentName];
    if (!specialty) return "";

    return `
🤖 AGENT INITIALIZATION: ${specialty.name}

${getAgentSelfAwarenessPrompt(agentName)}

🎯 YOUR MISSION: Focus on ${specialty.primaryRole}
📋 YOUR APPROACH: ${specialty.coordinationStyle === 'coordinator' ? 'Coordinate and delegate' : 'Execute specialized tasks'}

CRITICAL BEHAVIOR RULES:
1. If task matches your expertise → EXECUTE DIRECTLY
2. If task is outside expertise → DELEGATE (don't coordinate unless you're Elena)
3. Know your boundaries and respect other agents' specialties
4. Focus on what you do best, delegate the rest
    `;
  }
}

// Export integration helpers
export const INTEGRATION_HELPERS = {
  /**
   * Quick check if agent should handle task
   */
  shouldHandle: (agentName: string, taskDescription: string) => {
    const analysis = shouldAgentHandle(agentName, taskDescription);
    return analysis.shouldHandle;
  },

  /**
   * Get best agent for task
   */
  getBestAgent: (taskDescription: string) => {
    const analysis = analyzeTaskForBestAgent(taskDescription);
    return analysis.bestAgent;
  },

  /**
   * Get specialization prompt for agent
   */
  getSpecializationPrompt: (agentName: string) => {
    return SpecializationIntegration.getAgentSystemPrompt(agentName);
  }
};