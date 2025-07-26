import express from 'express';
import { z } from 'zod';
import { intelligentTaskDistributor } from '../../services/intelligent-task-distributor';
import { agentKnowledgeSharing } from '../../services/agent-knowledge-sharing';
import { autonomousWorkflowTemplates } from '../../templates/workflow-templates';
import { agentImplementationToolkit } from '../../tools/agent_implementation_toolkit';
import fetch from 'node-fetch';
// Admin authentication middleware with token support
const adminAuth = (req: any, res: any, next: any) => {
  // Check for admin token first
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer sandra-admin-2025') {
    return next();
  }
  
  // Check session authentication
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.email === 'ssa@ssasocial.com') {
    return next();
  }
  
  return res.status(401).json({ message: 'Unauthorized' });
};

const router = express.Router();

// Schema for autonomous deployment request
const DeploymentRequestSchema = z.object({
  workflowTemplateId: z.string().optional(),
  missionType: z.enum(['launch-readiness', 'design-audit', 'technical-review', 'marketing-campaign', 'elena-workflow', 'custom']),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('high'),
  targetAgents: z.array(z.string()).optional(),
  customRequirements: z.array(z.string()).optional(),
  estimatedDuration: z.number().optional(),
  workflowName: z.string().optional()
});

// Schema for deployment execution
const DeploymentExecutionSchema = z.object({
  deploymentId: z.string(),
  action: z.enum(['start', 'pause', 'resume', 'cancel'])
});

// In-memory deployment tracking (in production, this would be database-backed)
const activeDeployments = new Map<string, any>();
const deploymentHistory = new Map<string, any>();

/**
 * Execute real agent task by calling the actual agent chat API
 */
async function executeRealAgentTask(agentName: string, taskTitle: string, taskDescription: string) {
  try {
    const response = await fetch('http://localhost:5000/api/admin/agents/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sandra-admin-2025'
      },
      body: JSON.stringify({
        agentId: agentName.toLowerCase(),
        message: `Execute autonomous task: ${taskTitle}\n\nDescription: ${taskDescription}\n\nPlease complete this task as part of the launch readiness protocol. Create or modify files as needed and provide a summary of your work.`,
        fileEditMode: true
      })
    });

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        result: result.response,
        filesModified: result.filesModified || []
      };
    } else {
      return {
        success: false,
        error: result.error || 'Agent execution failed'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error calling agent'
    };
  }
}

/**
 * Deploy all agents with coordinated mission
 * POST /api/autonomous-orchestrator/deploy-all-agents
 */
router.post('/deploy-all-agents', adminAuth, async (req, res) => {
  try {
    console.log('🔍 AUTONOMOUS ORCHESTRATOR: Received request body:', JSON.stringify(req.body, null, 2));
    
    const validation = DeploymentRequestSchema.safeParse(req.body);
    if (!validation.success) {
      console.error('❌ VALIDATION FAILED:', validation.error.errors);
      return res.status(400).json({
        success: false,
        error: 'Invalid deployment request',
        details: validation.error.errors
      });
    }

    const deploymentRequest = validation.data;
    console.log('✅ VALIDATION PASSED:', JSON.stringify(deploymentRequest, null, 2));
    const deploymentId = `deployment-${Date.now()}`;

    console.log(`🚀 AUTONOMOUS ORCHESTRATOR: Starting deployment ${deploymentId} - Mission: ${deploymentRequest.missionType}`);

    // Get workflow template or create custom workflow
    let workflowTemplate;
    if (deploymentRequest.workflowTemplateId) {
      workflowTemplate = autonomousWorkflowTemplates.getTemplate(deploymentRequest.workflowTemplateId);
    } else {
      // Create custom workflow based on mission type
      workflowTemplate = await createCustomWorkflow(deploymentRequest);
    }

    if (!workflowTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Workflow template not found'
      });
    }

    // Create deployment execution plan
    const deploymentPlan = await createDeploymentPlan(workflowTemplate, deploymentRequest);

    // Initialize deployment tracking
    const deployment = {
      id: deploymentId,
      templateId: workflowTemplate.id,
      missionType: deploymentRequest.missionType,
      status: 'initializing',
      startTime: new Date(),
      estimatedCompletion: new Date(Date.now() + (deploymentRequest.estimatedDuration || workflowTemplate.estimatedDuration) * 60000),
      progress: 0,
      currentPhase: 0,
      totalPhases: workflowTemplate.phases.length,
      assignedAgents: deploymentPlan.agentAssignments,
      tasks: deploymentPlan.tasks,
      results: [],
      logs: [`🚀 Deployment ${deploymentId} initialized with mission: ${deploymentRequest.missionType}`]
    };

    activeDeployments.set(deploymentId, deployment);

    // Start autonomous execution with a delay to allow UI to show the deployment
    setTimeout(() => executeDeployment(deploymentId), 5000);

    res.json({
      success: true,
      deploymentId,
      deployment: {
        id: deployment.id,
        missionType: deployment.missionType,
        status: deployment.status,
        startTime: deployment.startTime,
        estimatedCompletion: deployment.estimatedCompletion,
        totalPhases: deployment.totalPhases,
        assignedAgents: deployment.assignedAgents.length,
        message: `Autonomous deployment initiated with ${deployment.assignedAgents.length} agents across ${deployment.totalPhases} phases`
      }
    });

  } catch (error) {
    console.error('❌ AUTONOMOUS ORCHESTRATOR ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deploy agents',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get deployment status
 * GET /api/autonomous-orchestrator/deployment-status/:deploymentId
 */
router.get('/deployment-status/:deploymentId', adminAuth, async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const deployment = activeDeployments.get(deploymentId) || deploymentHistory.get(deploymentId);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found'
      });
    }

    res.json({
      success: true,
      deployment: {
        id: deployment.id,
        missionType: deployment.missionType,
        status: deployment.status,
        progress: deployment.progress,
        currentPhase: deployment.currentPhase,
        totalPhases: deployment.totalPhases,
        startTime: deployment.startTime,
        estimatedCompletion: deployment.estimatedCompletion,
        completedTasks: deployment.results.length,
        totalTasks: deployment.tasks.length,
        assignedAgents: deployment.assignedAgents,
        recentLogs: deployment.logs.slice(-5)
      }
    });

  } catch (error) {
    console.error('❌ DEPLOYMENT STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deployment status'
    });
  }
});

/**
 * Get all active deployments
 * GET /api/autonomous-orchestrator/active-deployments
 */
router.get('/active-deployments', adminAuth, async (req, res) => {
  try {
    const deployments = Array.from(activeDeployments.values()).map(deployment => ({
      id: deployment.id,
      missionType: deployment.missionType,
      status: deployment.status,
      progress: deployment.progress,
      startTime: deployment.startTime,
      assignedAgents: deployment.assignedAgents.length
    }));

    res.json({
      success: true,
      activeDeployments: deployments,
      totalActive: deployments.length
    });

  } catch (error) {
    console.error('❌ ACTIVE DEPLOYMENTS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active deployments'
    });
  }
});

/**
 * Control deployment execution
 * POST /api/autonomous-orchestrator/control-deployment
 */
router.post('/control-deployment', adminAuth, async (req, res) => {
  try {
    const validation = DeploymentExecutionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Invalid execution control request'
      });
    }

    const { deploymentId, action } = validation.data;
    const deployment = activeDeployments.get(deploymentId);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found'
      });
    }

    // Update deployment status based on action
    switch (action) {
      case 'start':
        if (deployment.status === 'initializing') {
          deployment.status = 'active';
          deployment.logs.push(`▶️ Deployment started by admin command`);
        }
        break;
      case 'pause':
        if (deployment.status === 'active') {
          deployment.status = 'paused';
          deployment.logs.push(`⏸️ Deployment paused by admin command`);
        }
        break;
      case 'resume':
        if (deployment.status === 'paused') {
          deployment.status = 'active';
          deployment.logs.push(`▶️ Deployment resumed by admin command`);
        }
        break;
      case 'cancel':
        deployment.status = 'cancelled';
        deployment.logs.push(`❌ Deployment cancelled by admin command`);
        // Move to history
        deploymentHistory.set(deploymentId, deployment);
        activeDeployments.delete(deploymentId);
        break;
    }

    res.json({
      success: true,
      deploymentId,
      newStatus: deployment.status,
      message: `Deployment ${action} executed successfully`
    });

  } catch (error) {
    console.error('❌ DEPLOYMENT CONTROL ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to control deployment'
    });
  }
});

/**
 * Get agent coordination metrics
 * GET /api/autonomous-orchestrator/coordination-metrics
 */
router.get('/coordination-metrics', adminAuth, async (req, res) => {
  try {
    const agentStatuses = intelligentTaskDistributor.getAgentStatus();
    const knowledgeMetrics = agentKnowledgeSharing.getIntelligenceSummary();
    const activeDeploymentCount = activeDeployments.size;

    const metrics = {
      agentCoordination: {
        totalAgents: agentStatuses.length,
        availableAgents: agentStatuses.filter(a => a.isAvailable).length,
        activeAgents: agentStatuses.filter(a => a.currentLoad > 0).length,
        averageLoad: agentStatuses.reduce((sum, a) => sum + a.currentLoad, 0) / agentStatuses.length,
        averageSuccessRate: agentStatuses.reduce((sum, a) => sum + a.successRate, 0) / agentStatuses.length
      },
      deploymentMetrics: {
        activeDeployments: activeDeploymentCount,
        totalDeployments: activeDeployments.size + deploymentHistory.size,
        completionRate: deploymentHistory.size / (activeDeployments.size + deploymentHistory.size) * 100
      },
      knowledgeSharing: {
        totalInsights: knowledgeMetrics.metrics.totalInsights,
        totalStrategies: knowledgeMetrics.metrics.totalStrategies,
        avgEffectiveness: knowledgeMetrics.metrics.avgEffectiveness,
        knowledgeConnections: knowledgeMetrics.metrics.knowledgeConnections
      },
      systemHealth: {
        orchestratorStatus: 'operational',
        taskDistributorStatus: 'operational',
        knowledgeSharingStatus: 'operational',
        lastHealthCheck: new Date()
      }
    };

    res.json({
      success: true,
      metrics,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ COORDINATION METRICS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get coordination metrics'
    });
  }
});

// PRIVATE HELPER FUNCTIONS

/**
 * Create custom workflow based on mission type
 */
async function createCustomWorkflow(deploymentRequest: any): Promise<any> {
  // Handle Elena workflows specially
  if (deploymentRequest.missionType === 'elena-workflow') {
    return {
      id: 'elena-custom-workflow',
      name: deploymentRequest.workflowName || 'Elena Strategic Workflow',
      description: `Elena's strategic workflow: ${deploymentRequest.workflowName || 'Custom Mission'}`,
      category: 'coordination',
      estimatedDuration: deploymentRequest.estimatedDuration || 30,
      requiredAgents: deploymentRequest.targetAgents || ['aria', 'victoria', 'zara'],
      phases: [
        {
          id: 'elena-coordination-phase',
          name: 'Elena Strategic Coordination Phase',
          description: 'Execute Elena\'s coordinated multi-agent workflow',
          parallelExecution: true,
          dependencies: [],
          estimatedDuration: deploymentRequest.estimatedDuration || 30,
          tasks: deploymentRequest.customRequirements?.map((req: string, index: number) => ({
            id: `elena-task-${index}`,
            title: req,
            description: req,
            priority: deploymentRequest.priority || 'high',
            complexity: 'moderate',
            requiredSkills: ['coordination', 'implementation'],
            estimatedTime: Math.ceil((deploymentRequest.estimatedDuration || 30) / (deploymentRequest.customRequirements?.length || 1)),
            dependencies: [],
            phaseIndex: 0
          })) || [
            {
              id: 'elena-default-task',
              title: 'Execute Elena\'s Strategic Mission',
              description: 'Complete the strategic coordination task as outlined by Elena',
              priority: deploymentRequest.priority || 'high',
              complexity: 'moderate',
              requiredSkills: ['coordination'],
              estimatedTime: deploymentRequest.estimatedDuration || 30,
              dependencies: [],
              phaseIndex: 0
            }
          ]
        }
      ]
    };
  }

  const templates = autonomousWorkflowTemplates.getTemplatesByCategory(
    deploymentRequest.missionType === 'launch-readiness' ? 'launch' :
    deploymentRequest.missionType === 'design-audit' ? 'audit' :
    deploymentRequest.missionType === 'technical-review' ? 'audit' :
    deploymentRequest.missionType === 'marketing-campaign' ? 'development' : 'optimization'
  );

  if (templates.length > 0) {
    return templates[0]; // Return the first matching template
  }

  // Create a basic custom workflow if no template matches
  return {
    id: 'custom-workflow',
    name: 'Custom Mission Workflow',
    description: `Custom workflow for ${deploymentRequest.missionType}`,
    category: 'development',
    estimatedDuration: deploymentRequest.estimatedDuration || 60,
    requiredAgents: deploymentRequest.targetAgents || ['elena', 'aria', 'zara'],
    phases: [
      {
        id: 'custom-phase-1',
        name: 'Custom Mission Phase 1',
        description: 'Execute first phase of custom mission requirements',
        parallelExecution: true,
        dependencies: [],
        estimatedDuration: (deploymentRequest.estimatedDuration || 60) / 2,
        tasks: deploymentRequest.customRequirements?.filter((req: string, index: number) => index % 2 === 0).map((req: string, index: number) => ({
          id: `custom-task-phase1-${index}`,
          title: req,
          description: req,
          priority: deploymentRequest.priority,
          complexity: 'moderate',
          requiredSkills: ['coordination'],
          estimatedTime: 15,
          dependencies: [],
          phaseIndex: 0
        })) || []
      },
      {
        id: 'custom-phase-2',
        name: 'Custom Mission Phase 2',
        description: 'Execute second phase of custom mission requirements',
        parallelExecution: true,
        dependencies: [],
        estimatedDuration: (deploymentRequest.estimatedDuration || 60) / 2,
        tasks: deploymentRequest.customRequirements?.filter((req: string, index: number) => index % 2 === 1).map((req: string, index: number) => ({
          id: `custom-task-phase2-${index}`,
          title: req,
          description: req,
          priority: deploymentRequest.priority,
          complexity: 'moderate',
          requiredSkills: ['coordination'],
          estimatedTime: 15,
          dependencies: [],
          phaseIndex: 1
        })) || []
      }
    ]
  };
}

/**
 * Create deployment plan with agent assignments
 */
async function createDeploymentPlan(workflowTemplate: any, deploymentRequest: any): Promise<any> {
  const tasks = workflowTemplate.phases.flatMap((phase: any) => phase.tasks);
  const agentAssignments = [];

  // Assign optimal agents to tasks and ensure proper phase assignment
  for (const task of tasks) {
    const assignment = await intelligentTaskDistributor.assignOptimalAgent(task);
    // Ensure assignment has the task ID for linking
    assignment.taskId = task.id;
    // Preserve the phase index from the task
    assignment.phaseIndex = task.phaseIndex || 0;
    agentAssignments.push(assignment);
  }

  console.log(`🔥 DEPLOYMENT PLAN CREATED: ${tasks.length} tasks, ${agentAssignments.length} assignments`);

  return {
    tasks,
    agentAssignments,
    workflow: workflowTemplate,
    estimatedCompletion: new Date(Date.now() + workflowTemplate.estimatedDuration * 60000)
  };
}

/**
 * Execute deployment autonomously
 */
async function executeDeployment(deploymentId: string): Promise<void> {
  console.log(`🔥 EXECUTE DEPLOYMENT CALLED: ${deploymentId}`);
  const deployment = activeDeployments.get(deploymentId);
  if (!deployment) {
    console.log(`🔥 DEPLOYMENT NOT FOUND: ${deploymentId}`);
    return;
  }

  try {
    console.log(`🔥 DEPLOYMENT FOUND, STARTING EXECUTION: ${deploymentId}`);
    deployment.status = 'active';
    deployment.logs.push(`🎯 Beginning autonomous execution of ${deployment.missionType} mission`);

    for (let phaseIndex = 0; phaseIndex < deployment.totalPhases; phaseIndex++) {
      if (deployment.status !== 'active') break; // Check for pause/cancel

      deployment.currentPhase = phaseIndex;
      deployment.logs.push(`📋 Starting phase ${phaseIndex + 1}/${deployment.totalPhases}`);

      // Execute phase tasks - fix filtering to use task assignments with proper phase index
      const phaseAssignments = deployment.assignedAgents.filter((assignment: any) => assignment.phaseIndex === phaseIndex);
      console.log(`🔥 PHASE ${phaseIndex + 1} ASSIGNMENTS:`, phaseAssignments.length);
      
      for (const assignment of phaseAssignments) {
        if (deployment.status !== 'active') break;

        const task = deployment.tasks.find((t: any) => t.id === assignment.taskId);
        if (task) {
          deployment.logs.push(`🤖 ${assignment.agentName} executing: ${task.title}`);
          
          try {
            // REAL AGENT EXECUTION - Call the actual agent system
            console.log(`🔥 EXECUTING REAL AGENT: ${assignment.agentName} - ${task.title}`);
            const agentResponse = await executeRealAgentTask(assignment.agentName, task.title, task.description);
            console.log(`🔥 AGENT RESPONSE:`, { success: agentResponse.success, filesModified: agentResponse.filesModified?.length || 0 });
            
            deployment.results.push({
              taskId: task.id,
              agentName: assignment.agentName,
              status: agentResponse.success ? 'completed' : 'failed',
              completedAt: new Date(),
              result: agentResponse.result,
              filesModified: agentResponse.filesModified || []
            });

            deployment.logs.push(`✅ ${assignment.agentName} completed: ${task.title} - ${agentResponse.filesModified?.length || 0} files modified`);
          } catch (error) {
            console.log(`🔥 AGENT EXECUTION ERROR:`, error);
            deployment.results.push({
              taskId: task.id,
              agentName: assignment.agentName,
              status: 'failed',
              completedAt: new Date(),
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            deployment.logs.push(`❌ ${assignment.agentName} failed: ${task.title} - ${error instanceof Error ? error.message : 'Unknown error'}`);
          }

          deployment.progress = Math.round((deployment.results.length / deployment.tasks.length) * 100);
          console.log(`✅ Task completed: ${task.title} (${deployment.progress}% total progress)`);
        }
      }

      deployment.logs.push(`✅ Phase ${phaseIndex + 1} completed`);
    }

    if (deployment.status === 'active') {
      deployment.status = 'completed';
      deployment.logs.push(`🎉 Mission ${deployment.missionType} completed successfully!`);
      
      // Keep completed deployments visible for 5 minutes before moving to history
      setTimeout(() => {
        console.log(`📁 Moving deployment ${deploymentId} to history after completion display period`);
        deploymentHistory.set(deploymentId, deployment);
        activeDeployments.delete(deploymentId);
      }, 300000); // 5 minutes
    }

  } catch (error) {
    deployment.status = 'failed';
    deployment.logs.push(`❌ Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(`❌ DEPLOYMENT EXECUTION ERROR (${deploymentId}):`, error);
  }
}

export default router;