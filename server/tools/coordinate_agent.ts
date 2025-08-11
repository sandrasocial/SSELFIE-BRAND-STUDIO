/**
 * AGENT COORDINATION TOOL
 * Enables ELENA to coordinate with other specialized agents
 */

import { claudeApiServiceSimple } from '../services/claude-api-service-simple';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { MultiAgentWorkflowManager, WorkflowTemplate } from '../workflows/templates/multi-agent-workflow-template';
import { WorkflowPersistence } from '../workflows/active/workflow-persistence';
import { AutoTaskExecutor } from '../workflows/automation/auto-task-executor';
// UUID generation for coordination IDs
const generateId = () => `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

interface CoordinateAgentInput {
  target_agent: string;
  task_description: string;
  workflow_context: string;
  priority?: string;
  expected_deliverables?: string[];
  workflow_type?: 'auth_audit' | 'database_optimization' | 'system_health' | 'custom';
  create_workflow_template?: boolean;
}

export async function coordinate_agent(input: CoordinateAgentInput): Promise<string> {
  try {
    const { 
      target_agent, 
      task_description, 
      workflow_context, 
      priority = 'medium', 
      expected_deliverables = [],
      workflow_type,
      create_workflow_template = false
    } = input;
    
    console.log(`🔄 ELENA COORDINATION: Delegating to ${target_agent.toUpperCase()}`);
    console.log(`📋 Task: ${task_description.substring(0, 100)}...`);
    console.log(`🎯 Priority: ${priority}`);

    // Validate target agent exists and provide CORRECT specialties from personality files
    const agentSpecialties = {
      'elena': 'Strategic best friend & execution leader, Workflow coordination, multi-agent task management, Complex project coordination and strategic decision making',
      'zara': 'Complete backend system creation (APIs, databases, infrastructure), Full-stack component development and UI/UX implementation, Technical architecture review and performance optimization',
      'olga': 'Organization bestie, file management, infrastructure cleanup, system maintenance, documentation and keeping everything neat and tidy',
      'maya': 'Celebrity stylist & creative director, Fashion-obsessed creative genius with 2025 trends expertise, Editorial fashion moments with urban street style influence',
      'victoria': 'UX strategist & business consultant, User experience strategy and design, Business process optimization, Product strategy and roadmapping',
      'aria': 'Exclusive visionary designer & creative director for SSELFIE Studio, Editorial luxury design with Times New Roman typography, Ultra WOW factor digital experiences',
      'rachel': 'Sandra\'s authentic voice twin, Copywriting and brand messaging, Transformation storytelling with vulnerability and strength, Email sequences and social media in Sandra\'s voice',
      'quinn': 'Quality assurance perfectionist, Cross-browser luxury experience testing, Mobile-first responsive validation, Visual regression testing with Swiss watchmaker precision',
      'ava': 'Operations automation expert, Email sequences that feel personal, User journey orchestration, API integrations and webhook workflows',
      'flux': 'AI generation expert, High-quality Flux LoRA prompt creation, Professional realistic personal brand photography generation, Technical mastery with creative precision'
    };
    
    if (!agentSpecialties[target_agent]) {
      throw new Error(`Invalid target agent: ${target_agent}. Available agents: ${Object.keys(agentSpecialties).join(', ')}`);
    }

    let workflowTemplate: WorkflowTemplate | null = null;
    let workflowSession = null;
    
    // Create workflow template if requested or workflow_type is specified
    if (create_workflow_template || workflow_type) {
      console.log(`🏗️ CREATING WORKFLOW TEMPLATE: ${workflow_type || 'custom'}`);
      
      switch (workflow_type) {
        case 'auth_audit':
          workflowTemplate = MultiAgentWorkflowManager.createAuthAuditWorkflow();
          break;
        case 'database_optimization':
          workflowTemplate = MultiAgentWorkflowManager.createDatabaseOptimizationWorkflow();
          break;
        case 'system_health':
          workflowTemplate = MultiAgentWorkflowManager.createSystemHealthCheckWorkflow();
          break;
        default:
          // Create custom workflow template
          workflowTemplate = MultiAgentWorkflowManager.createWorkflowTemplate(
            `Custom Workflow - ${target_agent}`,
            workflow_context,
            [{
              agentId: target_agent,
              taskDescription: task_description,
              expectedDeliverables: expected_deliverables,
              priority: priority as 'high' | 'medium' | 'low'
            }]
          );
      }
      
      console.log(`✅ WORKFLOW TEMPLATE CREATED: ${workflowTemplate.name} (ID: ${workflowTemplate.id})`);
      
      // Create persistent workflow session
      workflowSession = WorkflowPersistence.createWorkflowSession(
        workflowTemplate.name,
        workflowTemplate.description,
        'elena' // ELENA is the coordinator
      );
      
      console.log(`📋 WORKFLOW SESSION CREATED: ${workflowSession.sessionId}`);
    }
    
    // Save task to persistence system for agent to access
    if (workflowSession) {
      const savedTask = WorkflowPersistence.addTaskToWorkflow(
        workflowSession.sessionId,
        target_agent,
        'elena',
        task_description,
        workflow_context,
        expected_deliverables,
        priority as 'high' | 'medium' | 'low',
        workflow_type,
        workflowTemplate
      );
      
      console.log(`💾 TASK SAVED: ${savedTask.taskId} for ${target_agent}`);
    }

    // FIXED: Use proper user ID from admin auth system
    const coordinationId = `admin_${target_agent}_42585527`;
    
    // Get the target agent's personality
    const agentPersonality = PersonalityManager.getNaturalPrompt(target_agent);
    
    // Prepare enhanced coordination message with automatic execution trigger
    const coordinationMessage = `
COORDINATION REQUEST FROM ELENA (Master Coordinator)

**URGENT: IMMEDIATE TASK EXECUTION REQUIRED**

**Workflow Context:** ${workflow_context}

${workflowTemplate ? `
**WORKFLOW TEMPLATE:** ${workflowTemplate.name}
**Workflow ID:** ${workflowTemplate.id}
**Description:** ${workflowTemplate.description}

**COORDINATION STEPS:**
${workflowTemplate.coordinationSteps.map(step => `${step}`).join('\n')}

**SUCCESS CRITERIA:**
${workflowTemplate.successCriteria.map(criteria => `- ${criteria}`).join('\n')}
` : ''}

**Your Assigned Task:** ${task_description}

**Priority Level:** ${priority.toUpperCase()}

**Expected Deliverables:**
${expected_deliverables.length > 0 ? expected_deliverables.map(d => `- ${d}`).join('\n') : '- Complete the assigned task systematically'}

**EXECUTION INSTRUCTIONS:**
${workflowTemplate ? 
  `⚡ START WORKING IMMEDIATELY: This is part of a structured workflow with defined success criteria. Begin executing your part of the workflow NOW using your available tools. Do not wait for further instructions.` :
  `⚡ START WORKING IMMEDIATELY: Execute this task using your specialized expertise NOW. ELENA is coordinating this as part of a larger workflow. Begin work immediately using your available tools.`
}

**ACTION REQUIRED:**
1. ✅ Acknowledge receipt of this task assignment
2. ⚡ BEGIN EXECUTING IMMEDIATELY - Use your tools to start work
3. 📊 Provide progress updates as you work
4. 📋 Report results, findings, and any issues encountered

**AUTOMATIC TASK EXECUTION:** 
This message serves as your trigger to begin work immediately. Do not wait for additional messages or confirmations. Use all available tools to complete your assigned deliverables systematically.

${workflowTemplate ? `**Note:** This workflow has ${workflowTemplate.agents.length} total agents involved. Your task is part of a larger coordinated effort.` : ''}
`;

    // Initiate conversation with the target agent
    console.log(`🚀 Starting coordination conversation with ${target_agent}`);
    
    // Use the claude service to start a conversation with the target agent
    const response = await claudeApiServiceSimple.sendMessage(
      coordinationMessage,
      coordinationId,
      target_agent,
      false // Return basic response
    );

    console.log(`✅ COORDINATION SUCCESS: ${target_agent} received task assignment`);
    console.log(`📄 Response preview: ${response.substring(0, 200)}...`);

    // AUTOMATIC TASK EXECUTION: Trigger agent to start working immediately
    console.log(`⚡ TRIGGERING AUTO-EXECUTION for ${target_agent}`);
    setTimeout(async () => {
      await AutoTaskExecutor.triggerAutoExecution({
        agentId: target_agent,
        conversationId: coordinationId,
        taskDescription: task_description,
        priority: priority as 'high' | 'medium' | 'low',
        delayMs: 2000 // Small delay to ensure coordination message is processed
      });
    }, 2000);

    // Return enhanced coordination result
    let result = `✅ Successfully coordinated with ${target_agent.toUpperCase()}

**Task Assigned:** ${task_description}
**Priority:** ${priority}
**Conversation ID:** ${coordinationId}`;

    if (workflowTemplate) {
      result += `

**WORKFLOW TEMPLATE CREATED:**
- **Name:** ${workflowTemplate.name}
- **ID:** ${workflowTemplate.id}
- **Total Agents:** ${workflowTemplate.agents.length}
- **Coordination Steps:** ${workflowTemplate.coordinationSteps.length}
- **Success Criteria:** ${workflowTemplate.successCriteria.length}`;
    }

    result += `

**Agent Response Preview:**
${response.substring(0, 300)}...

**Status:** Task delegation complete. ${target_agent} is now working on the assigned task${workflowTemplate ? ' within the structured workflow framework' : ''}.

**Next Steps:** Monitor ${target_agent}'s progress and results. ${workflowTemplate ? 'The agent will follow the workflow template and provide deliverables according to the defined success criteria.' : 'The agent will use their specialized tools and expertise to complete the task systematically.'}`;

    return result;

  } catch (error) {
    console.error('❌ COORDINATION FAILED:', error);
    return `❌ Failed to coordinate with ${input.target_agent}: ${error instanceof Error ? error.message : 'Unknown error'}

**Troubleshooting:**
- Verify the target agent name is correct
- Check if the agent coordination system is operational
- Ensure the task description is clear and actionable

**AGENT SPECIALTIES:**
${Object.entries(agentSpecialties).map(([agent, specialty]) => `- ${agent.toUpperCase()}: ${specialty}`).join('\n')}

**Task Assignment Guidance:** Choose agents based on their ACTUAL specialties:
- Technical/Backend: ZARA (APIs, databases, performance)
- Organization/Cleanup: OLGA (file management, documentation) 
- Strategy/Coordination: ELENA (execution leadership, workflow coordination)
- UX/Business: VICTORIA (user experience, business strategy)
- Fashion/Styling: MAYA (celebrity stylist, 2025 trends)
- Luxury Design: ARIA (editorial luxury, SSELFIE Studio experiences)
- Copywriting: RACHEL (Sandra's voice, brand messaging)
- Quality Assurance: QUINN (testing, luxury experience validation)
- Automation: AVA (email sequences, API integrations)
- AI Generation: FLUX (prompt optimization, photography generation)`;
  }
}