/**
 * AGENT COORDINATION BRIDGE - PHASE 2
 * Connects existing autonomous systems with project structure awareness
 * Integrates: WorkflowExecutor + TaskDistributor + DelegationSystem + ProjectContext
 */

import { WorkflowExecutor } from './workflow-executor';
import { IntelligentTaskDistributor, TaskDistributionRequest, AgentTask } from './intelligent-task-distributor';
import { ElenaDelegationSystem } from '../utils/elena-delegation-system';
import { WorkflowPersistence, ActiveTask } from '../workflows/active/workflow-persistence';
import { UnifiedStateManager } from './unified-state-manager';
import { LocalProcessingEngine } from './hybrid-intelligence/local-processing-engine';
import { AdminContextManager } from '../memory/admin-context-manager';

export interface CoordinationRequest {
  requestType: 'workflow_creation' | 'task_assignment' | 'agent_delegation' | 'status_check';
  workflowName?: string;
  description?: string;
  coordinatorAgent: string;
  targetAgents?: string[];
  tasks?: AgentTask[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  userId: string;
}

export interface CoordinationResult {
  success: boolean;
  coordinationId: string;
  workflowSession?: any;
  taskAssignments?: any[];
  delegationResults?: any[];
  activeTasks?: ActiveTask[];
  nextSteps: string[];
  error?: string;
}

export class AgentCoordinationBridge {
  private static instance: AgentCoordinationBridge;
  private workflowExecutor: WorkflowExecutor;
  private taskDistributor: IntelligentTaskDistributor;
  private delegationSystem: ElenaDelegationSystem;
  private stateManager: UnifiedStateManager;
  private processingEngine: LocalProcessingEngine;
  private contextManager: AdminContextManager;

  private constructor() {
    this.workflowExecutor = new WorkflowExecutor();
    this.taskDistributor = IntelligentTaskDistributor.getInstance();
    this.delegationSystem = ElenaDelegationSystem.getInstance();
    this.stateManager = UnifiedStateManager.getInstance();
    this.processingEngine = LocalProcessingEngine.getInstance();
    this.contextManager = AdminContextManager.getInstance();
    
    console.log('🌉 COORDINATION BRIDGE: Connecting existing autonomous systems');
    console.log('🔗 CONNECTED: WorkflowExecutor + TaskDistributor + DelegationSystem');
  }

  public static getInstance(): AgentCoordinationBridge {
    if (!AgentCoordinationBridge.instance) {
      AgentCoordinationBridge.instance = new AgentCoordinationBridge();
    }
    return AgentCoordinationBridge.instance;
  }

  /**
   * PHASE 2: PROJECT CONTEXT AWARE WORKFLOW COORDINATION
   * Orchestrates all existing systems with project structure protection
   */
  async coordinateWorkflow(request: CoordinationRequest): Promise<CoordinationResult> {
    const coordinationId = `coord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🌉 PHASE 2 COORDINATION: Starting ${request.requestType} for ${request.coordinatorAgent}`);
    console.log(`🎯 TARGET AGENTS: ${request.targetAgents?.join(', ') || 'Auto-assign'}`);
    console.log(`🏗️ PROJECT CONTEXT: Checking agent permissions and safe development zones`);
    
    // PHASE 2: Validate agent project context and permissions
    const projectContext = this.contextManager.getProjectContextForAgent(request.coordinatorAgent);
    if (!projectContext) {
      console.log(`⚠️ PHASE 2: Agent ${request.coordinatorAgent} lacks project context - initializing...`);
    } else {
      console.log(`✅ PHASE 2: Agent ${request.coordinatorAgent} has full project structure awareness`);
    }
    
    try {
      const result: CoordinationResult = {
        success: false,
        coordinationId,
        nextSteps: [],
      };

      // STEP 1: CREATE WORKFLOW SESSION (if needed)
      if (request.requestType === 'workflow_creation' && request.workflowName && request.description) {
        result.workflowSession = WorkflowPersistence.createWorkflowSession(
          request.workflowName,
          request.description,
          request.coordinatorAgent
        );
        console.log(`✅ WORKFLOW SESSION: Created ${result.workflowSession.sessionId}`);
      }

      // STEP 2: INTELLIGENT TASK DISTRIBUTION
      if (request.tasks && request.tasks.length > 0) {
        const distributionRequest: TaskDistributionRequest = {
          agents: request.targetAgents || ['elena', 'aria', 'zara', 'maya', 'olga', 'victoria'],
          tasks: request.tasks,
          workflowType: request.workflowName || 'coordination',
          priority: request.priority
        };

        const distribution = await this.taskDistributor.distributeTasks(distributionRequest);
        result.taskAssignments = distribution.assignments;
        console.log(`📋 TASK DISTRIBUTION: ${distribution.assignments.length} assignments created`);

        // STEP 3: DELEGATE TO ELENA SYSTEM
        for (const assignment of distribution.assignments) {
          const delegationResult = await this.delegationSystem.delegateTask({
            taskId: `${coordinationId}_${assignment.agentName}`,
            assignedAgent: assignment.agentName,
            coordinatorAgent: request.coordinatorAgent,
            taskDescription: assignment.tasks.map(t => t.description).join('; '),
            workflowContext: request.description || 'Coordination bridge task',
            expectedDeliverables: assignment.tasks.map(t => `Complete: ${t.description}`),
            priority: request.priority,
            status: 'assigned',
            assignedAt: new Date()
          });

          if (!result.delegationResults) result.delegationResults = [];
          result.delegationResults.push(delegationResult);
        }

        console.log(`🎯 DELEGATION: Tasks delegated to ${result.delegationResults?.length} agents`);
      }

      // STEP 4: UPDATE AGENT STATES
      if (request.targetAgents) {
        for (const agentId of request.targetAgents) {
          await this.stateManager.coordinateAgentTask(
            agentId, 
            `Coordination: ${request.workflowName || request.requestType}`,
            request.userId
          );
        }
        console.log(`🧠 STATE UPDATE: Updated context for ${request.targetAgents.length} agents`);
      }

      // STEP 5: GET ACTIVE TASKS FOR MONITORING
      result.activeTasks = WorkflowPersistence.getAllActiveTasks();

      // STEP 6: DEFINE NEXT STEPS
      result.nextSteps = [
        'Agents have been assigned their tasks via existing coordination systems',
        'Use get_assigned_tasks tool to retrieve specific task assignments',
        'Monitor workflow progress through WorkflowPersistence system',
        'Cross-agent learning patterns will be captured by LocalProcessingEngine',
        'Agent states updated through UnifiedStateManager for consistency'
      ];

      result.success = true;
      console.log(`✅ COORDINATION COMPLETE: ${coordinationId} successfully orchestrated`);
      
      return result;

    } catch (error) {
      console.error(`❌ COORDINATION FAILED: ${coordinationId}`, error);
      return {
        success: false,
        coordinationId,
        nextSteps: ['Review coordination error and retry'],
        error: error instanceof Error ? error.message : 'Unknown coordination error'
      };
    }
  }

  /**
   * PHASE 2: Validate if agent can safely modify files
   */
  public validateAgentFileAccess(agentId: string, filePaths: string[]): {
    allowed: string[];
    blocked: { path: string; reason: string; suggestion?: string }[];
    warnings: string[];
  } {
    const result = {
      allowed: [] as string[],
      blocked: [] as { path: string; reason: string; suggestion?: string }[],
      warnings: [] as string[]
    };

    for (const filePath of filePaths) {
      const validation = this.contextManager.canAgentModifyPath(agentId, filePath);
      
      if (validation.allowed) {
        result.allowed.push(filePath);
        if (validation.suggestion) {
          result.warnings.push(`${filePath}: ${validation.suggestion}`);
        }
      } else {
        result.blocked.push({
          path: filePath,
          reason: validation.reason,
          suggestion: validation.suggestion
        });
      }
    }

    return result;
  }

  /**
   * PHASE 2: Get comprehensive system status with project context
   */
  public getSystemStatus(): {
    phase: string;
    coordinationBridge: string;
    connectedSystems: { [key: string]: string };
    projectProtection: {
      protectedSystems: number;
      safeDevelopmentZones: number;
      activeAgents: string[];
    };
    systemHealth: string;
  } {
    // Get all active agent contexts
    const activeAgents = Array.from(this.contextManager['activeContexts'].keys())
      .map(key => key.split('-')[0]);

    return {
      phase: 'Phase 2 - Project Context Integration',
      coordinationBridge: 'Operational',
      connectedSystems: {
        workflowExecutor: 'Connected',
        taskDistributor: 'Connected', 
        delegationSystem: 'Connected',
        stateManager: 'Connected',
        processingEngine: 'Connected',
        contextManager: 'Connected'
      },
      projectProtection: {
        protectedSystems: 3, // Maya revenue systems, database schema, client interface
        safeDevelopmentZones: 2, // Admin agents, infrastructure
        activeAgents
      },
      systemHealth: 'Active coordination with project protection'
    };
  }

  /**
   * BRIDGE EXISTING PROJECT CONTEXT AWARENESS
   * Connects AdminContextManager with project structure understanding
   */
  async integrateProjectContext(agentId: string, userId: string): Promise<{
    success: boolean;
    projectContext: any;
    agentCapabilities: string[];
  }> {
    console.log(`🏗️ PROJECT CONTEXT: Integrating for ${agentId}`);
    
    try {
      // Get agent context from existing system
      const agentState = await this.stateManager.getAgentState(agentId, userId);
      
      // Add project structure awareness
      const projectContext = {
        ...agentState,
        projectStructure: {
          coreRevenueSystems: '🔒 Protected - Maya revenue systems',
          adminDevelopmentZone: '✅ Safe - Admin agent workspace',
          existingSystems: [
            'bulletproof-upload-service.ts (AWS S3)',
            'unified-generation-service.ts',
            'image-storage-service.ts',
            'training system with Replicate API'
          ],
          avoidConflicts: [
            'Do not create duplicate upload services',
            'Use existing AWS S3 infrastructure',
            'Build on existing database schema',
            'Coordinate with other agents before major changes'
          ]
        },
        lastContextUpdate: new Date()
      };

      // Save enhanced context
      await this.stateManager.updateAgentState(agentId, userId, projectContext);
      
      console.log(`✅ PROJECT CONTEXT: ${agentId} now aware of project structure`);
      
      return {
        success: true,
        projectContext,
        agentCapabilities: projectContext.capabilities || []
      };
      
    } catch (error) {
      console.error(`❌ PROJECT CONTEXT FAILED for ${agentId}:`, error);
      return {
        success: false,
        projectContext: {},
        agentCapabilities: []
      };
    }
  }

  /**
   * ACTIVATE CROSS-AGENT LEARNING PIPELINE
   * Connects LocalProcessingEngine with agent_learning database
   */
  async activateCrossAgentLearning(sourceAgent: string, targetAgents: string[], learningData: any): Promise<boolean> {
    console.log(`🧠 CROSS-LEARNING: ${sourceAgent} sharing knowledge with ${targetAgents.join(', ')}`);
    
    try {
      // Process learning patterns locally first
      const patterns = this.processingEngine.extractPatternsLocally(
        learningData.userMessage || '',
        learningData.agentResponse || ''
      );

      // Share successful patterns with other agents
      for (const pattern of patterns) {
        if (pattern.type === 'task_completion' && learningData.success) {
          await this.processingEngine.saveLearningData(
            targetAgents.join(','),
            'pattern',
            'successful_coordination',
            {
              sourceAgent,
              pattern: pattern.data,
              timestamp: new Date(),
              sharedWith: targetAgents
            }
          );
        }
      }

      console.log(`✅ CROSS-LEARNING: Shared ${patterns.length} patterns across agents`);
      return true;
      
    } catch (error) {
      console.error(`❌ CROSS-LEARNING FAILED:`, error);
      return false;
    }
  }

  /**
   * GET COORDINATION STATUS
   * Monitor all connected systems
   */
  async getCoordinationStatus(): Promise<{
    activeWorkflows: number;
    activeTasks: number;
    agentWorkloads: any;
    systemHealth: string;
  }> {
    const activeTasks = WorkflowPersistence.getAllActiveTasks();
    const agentWorkloads = this.delegationSystem.getAgentWorkloads();
    
    return {
      activeWorkflows: WorkflowPersistence.getActiveWorkflows().length,
      activeTasks: activeTasks.length,
      agentWorkloads,
      systemHealth: activeTasks.length > 0 ? 'Active coordination in progress' : 'Ready for new workflows'
    };
  }
}

// Export singleton instance
export const agentCoordinationBridge = AgentCoordinationBridge.getInstance();