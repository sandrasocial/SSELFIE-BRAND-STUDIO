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
    
    // Validate target agent exists
    const validAgents = [
      'elena', 'zara', 'maya', 'aria', 'quinn', 'rachel', 'victoria', 
      'sophia', 'olga', 'flux', 'wilma', 'diana', 'martha', 'ava'
    ];
    
    if (!validAgents.includes(input.target_agent)) {
      throw new Error(`Invalid target agent: ${input.target_agent}. Must be one of: ${validAgents.join(', ')}`);
    }

    // Generate coordination ID
    const coordination_id = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create task delegation record
    const coordination_data = {
      coordination_id,
      target_agent: input.target_agent,
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
    console.log(`🤝 AGENT COORDINATION: ${coordination_data.coordinating_agent} → ${input.target_agent}`, {
      task: input.task_description.substring(0, 100) + '...',
      priority: input.priority,
      deliverables: input.expected_deliverables.length
    });

    // Store coordination task (in production this would go to database)
    // For now, we'll use in-memory coordination tracking
    if (!global.agentCoordinations) {
      global.agentCoordinations = new Map();
    }
    global.agentCoordinations.set(coordination_id, coordination_data);

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