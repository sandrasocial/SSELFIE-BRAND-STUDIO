/**
 * AGENT COORDINATION TOOL
 * Enables ELENA to coordinate with other specialized agents
 */

import { claudeApiServiceSimple } from '../services/claude-api-service-simple';
import { PersonalityManager } from '../agents/personalities/personality-config';
// UUID generation for coordination IDs
const generateId = () => `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface CoordinateAgentInput {
  target_agent: string;
  task_description: string;
  workflow_context: string;
  priority?: string;
  expected_deliverables?: string[];
}

export async function coordinate_agent(input: CoordinateAgentInput): Promise<string> {
  try {
    const { target_agent, task_description, workflow_context, priority = 'medium', expected_deliverables = [] } = input;
    
    console.log(`🔄 ELENA COORDINATION: Delegating to ${target_agent.toUpperCase()}`);
    console.log(`📋 Task: ${task_description.substring(0, 100)}...`);
    console.log(`🎯 Priority: ${priority}`);

    // Validate target agent exists
    const availableAgents = ['victoria', 'zara', 'aria', 'maya', 'olga', 'rachel', 'diana', 'quinn', 'wilma', 'sophia', 'martha', 'ava', 'flux'];
    if (!availableAgents.includes(target_agent)) {
      throw new Error(`Invalid target agent: ${target_agent}. Available agents: ${availableAgents.join(', ')}`);
    }

    // Create conversation ID for the coordinated agent
    const coordinationId = `coordination_${target_agent}_${Date.now()}`;
    
    // Get the target agent's personality
    const agentPersonality = PersonalityManager.getNaturalPrompt(target_agent);
    
    // Prepare coordination message with context from ELENA
    const coordinationMessage = `
COORDINATION REQUEST FROM ELENA (Master Coordinator)

**Workflow Context:** ${workflow_context}

**Your Assigned Task:** ${task_description}

**Priority Level:** ${priority.toUpperCase()}

**Expected Deliverables:**
${expected_deliverables.length > 0 ? expected_deliverables.map(d => `- ${d}`).join('\n') : '- Complete the assigned task systematically'}

**Instructions:**
Please execute this task using your specialized expertise. ELENA is coordinating this as part of a larger workflow. Report back with your results, findings, and any issues encountered.

Use your available tools to complete this work thoroughly. If you need additional context or run into blockers, document them clearly in your response.
`;

    // Initiate conversation with the target agent
    console.log(`🚀 Starting coordination conversation with ${target_agent}`);
    
    // Use the claude service to start a conversation with the target agent
    const response = await claudeApiServiceSimple.sendMessage(
      'sandra-admin-coordination', // Use admin coordination user ID
      target_agent,
      coordinationId,
      coordinationMessage,
      agentPersonality,
      [] // No special tools for now - agents use their standard toolset
    );

    console.log(`✅ COORDINATION SUCCESS: ${target_agent} received task assignment`);
    console.log(`📄 Response preview: ${response.substring(0, 200)}...`);

    // Return coordination result
    return `✅ Successfully coordinated with ${target_agent.toUpperCase()}

**Task Assigned:** ${task_description}
**Priority:** ${priority}
**Conversation ID:** ${coordinationId}

**Agent Response Preview:**
${response.substring(0, 300)}...

**Status:** Task delegation complete. ${target_agent} is now working on the assigned task with full context from the workflow.

**Next Steps:** Monitor ${target_agent}'s progress and results. The agent will use their specialized tools and expertise to complete the task systematically.`;

  } catch (error) {
    console.error('❌ COORDINATION FAILED:', error);
    return `❌ Failed to coordinate with ${input.target_agent}: ${error instanceof Error ? error.message : 'Unknown error'}

**Troubleshooting:**
- Verify the target agent name is correct
- Check if the agent coordination system is operational
- Ensure the task description is clear and actionable

**Available Agents:** victoria, zara, aria, maya, olga, rachel, diana, quinn, wilma, sophia, martha, ava, flux`;
  }
}