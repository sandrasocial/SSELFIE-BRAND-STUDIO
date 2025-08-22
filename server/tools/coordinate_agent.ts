/**
 * COORDINATE AGENT TOOL
 * Direct agent-to-agent coordination and task delegation
 * Part of Elena's delegation system for autonomous agent workflows
 */

export interface CoordinateAgentInput {
  target_agent: string;
  task_description: string;
  workflow_context?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expected_deliverables: string[];
  deadline?: string;
  dependencies?: string[];
  coordinating_agent?: string;
  userId?: string;
  adminContext?: boolean;
}

export interface CoordinateAgentResult {
  success: boolean;
  coordination_id: string;
  target_agent: string;
  status: 'queued' | 'accepted' | 'in_progress' | 'completed' | 'failed';
  message: string;
  estimated_completion?: string;
}

/**
 * Coordinate with another agent by delegating a specific task
 */
export async function coordinate_agent(input: CoordinateAgentInput): Promise<CoordinateAgentResult> {
  try {
    // AUTHENTICATION CHECK: Ensure admin access for agent coordination
    const isAdminUser = input.userId === '42585527' || input.adminContext === true;
    console.log('🔐 COORDINATION AUTHENTICATION:', { 
      userId: input.userId, 
      coordinatingAgent: input.coordinating_agent, 
      adminAccess: isAdminUser 
    });
    
    if (!isAdminUser) {
      throw new Error('Agent coordination requires admin authentication');
    }

    // INTELLIGENT AGENT SELECTION: Use Elena's delegation system for optimal assignments
    let selectedAgent = input.target_agent;
    let delegationReasoning = '';
    
    if (input.coordinating_agent === 'elena') {
      try {
        const { ElenaDelegationSystem } = await import('../utils/elena-delegation-system');
        const delegationSystem = ElenaDelegationSystem.getInstance();
        
        // Analyze task to determine required specialties
        const requiredSpecialties = delegationSystem.analyzeRequiredSpecialties(input.task_description);
        
        // Create task for intelligent assignment
        const taskDependency = {
          taskId: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dependsOn: [],
          priority: input.priority || 'medium',
          estimatedTime: delegationSystem.estimateTaskTime(input.task_description, requiredSpecialties),
          agentSpecialty: requiredSpecialties,
          status: 'pending' as const
        };
        
        const optimalDecision = await delegationSystem.findOptimalAgent(taskDependency);
        selectedAgent = optimalDecision.assignedAgent;
        delegationReasoning = optimalDecision.reasoning;
        
        console.log(`🧠 INTELLIGENT ASSIGNMENT: Elena selected ${selectedAgent} for "${input.task_description.substring(0, 50)}..." based on specialties [${requiredSpecialties.join(', ')}]. Reasoning: ${delegationReasoning}`);
        
        // Update input with intelligent selection
        input.target_agent = selectedAgent;
        
      } catch (error) {
        console.warn(`⚠️ DELEGATION WARNING: Could not use intelligent assignment, using manually specified agent ${input.target_agent}:`, error);
        selectedAgent = input.target_agent;
      }
    }
    
    // Validate target agent exists
    const validAgents = [
      'elena', 'zara', 'maya', 'aria', 'quinn', 'rachel', 'victoria', 
      'sophia', 'olga', 'flux', 'wilma', 'diana', 'martha', 'ava'
    ];
    
    if (!validAgents.includes(selectedAgent)) {
      throw new Error(`Invalid target agent: ${selectedAgent}. Must be one of: ${validAgents.join(', ')}`);
    }

    // Generate coordination ID
    const coordination_id = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create task delegation record
    const coordination_data = {
      coordination_id,
      target_agent: selectedAgent,
      task_description: input.task_description,
      workflow_context: input.workflow_context || 'Direct coordination',
      priority: input.priority,
      expected_deliverables: input.expected_deliverables,
      deadline: input.deadline,
      dependencies: input.dependencies || [],
      status: 'queued' as const,
      created_at: new Date().toISOString(),
      coordinating_agent: input.coordinating_agent || 'elena', // Use authenticated agent
      admin_user_id: input.userId
    };

    // Log coordination attempt
    console.log(`🤝 AGENT COORDINATION: ${coordination_data.coordinating_agent} → ${selectedAgent}`, {
      task: input.task_description.substring(0, 100) + '...',
      priority: input.priority,
      deliverables: input.expected_deliverables.length,
      intelligentSelection: delegationReasoning ? 'Yes' : 'Manual'
    });

    // SYSTEM INTEGRATION: Store in both in-memory AND database + WorkflowPersistence
    // 1. In-memory tracking for immediate access
    if (!global.agentCoordinations) {
      global.agentCoordinations = new Map();
    }
    global.agentCoordinations.set(coordination_id, coordination_data);
    
    // 2. Store in database for persistence
    try {
      const { db } = await import('../db');
      const { agentTasks } = await import('../../shared/schema');
      const { sql } = await import('drizzle-orm');
      
      await db.insert(agentTasks).values({
        taskId: sql`gen_random_uuid()`,
        agentName: input.target_agent,
        instruction: input.task_description,
        conversationContext: [input.workflow_context || 'Direct coordination'],
        priority: input.priority,
        completionCriteria: input.expected_deliverables,
        qualityGates: ['coordination_success'],
        estimatedDuration: input.priority === 'critical' ? 60 : 
                          input.priority === 'high' ? 120 :
                          input.priority === 'medium' ? 240 : 480,
        status: 'assigned',
        progress: 0
      });
      
      console.log(`💾 DATABASE: Task stored for ${input.target_agent}`);
    } catch (dbError) {
      console.warn(`⚠️ DATABASE WARNING: Could not store task in database:`, dbError);
    }
    
    // 3. Store in WorkflowPersistence for immediate agent access
    try {
      const { WorkflowPersistence } = await import('../workflows/active/workflow-persistence');
      
      const workflowTask = {
        taskId: coordination_id,
        agentName: input.target_agent,
        taskDescription: input.task_description,
        priority: input.priority,
        status: 'assigned' as const,
        assignedAt: new Date(),
        coordinatorAgent: input.coordinating_agent || 'elena',
        expectedDeliverables: input.expected_deliverables,
        workflowType: 'coordination',
        workflowContext: input.workflow_context || 'Direct coordination'
      };
      
      WorkflowPersistence.assignTaskToAgent(input.target_agent, workflowTask);
      console.log(`🔄 WORKFLOW: Task assigned to ${input.target_agent} via WorkflowPersistence`);
    } catch (workflowError) {
      console.warn(`⚠️ WORKFLOW WARNING: Could not assign task via WorkflowPersistence:`, workflowError);
    }

    // Estimate completion time based on priority and complexity
    const estimatedHours = input.priority === 'critical' ? 1 : 
                          input.priority === 'high' ? 2 :
                          input.priority === 'medium' ? 4 : 8;
    
    const estimated_completion = new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString();

    return {
      success: true,
      coordination_id,
      target_agent: input.target_agent,
      status: 'queued',
      message: `✅ COORDINATION SUCCESS: Task delegated to ${input.target_agent} with priority ${input.priority}. Expected deliverables: ${input.expected_deliverables.join(', ')}`,
      estimated_completion
    };

  } catch (error) {
    console.error('❌ COORDINATION ERROR:', error);
    return {
      success: false,
      coordination_id: '',
      target_agent: input.target_agent,
      status: 'failed',
      message: `❌ COORDINATION FAILED: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get coordination status for tracking
 */
export function getCoordinationStatus(coordination_id: string) {
  if (!global.agentCoordinations) return null;
  return global.agentCoordinations.get(coordination_id);
}

/**
 * Update coordination status
 */
export function updateCoordinationStatus(coordination_id: string, status: CoordinateAgentResult['status'], message?: string) {
  if (!global.agentCoordinations) return false;
  
  const coordination = global.agentCoordinations.get(coordination_id);
  if (!coordination) return false;
  
  coordination.status = status;
  coordination.updated_at = new Date().toISOString();
  if (message) coordination.latest_message = message;
  
  global.agentCoordinations.set(coordination_id, coordination);
  return true;
}