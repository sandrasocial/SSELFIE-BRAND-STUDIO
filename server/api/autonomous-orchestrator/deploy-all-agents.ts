/**
 * AUTONOMOUS ORCHESTRATOR - DEPLOY ALL AGENTS
 * Central deployment system for multi-agent workflows
 * Critical missing piece for Sandra's agent system
 */

import express from 'express';
import { intelligentTaskDistributor } from '../../services/intelligent-task-distributor';
import { CrossAgentIntelligence } from '../../services/cross-agent-intelligence';
import { workflowTemplates } from '../../templates/workflow-templates';

const router = express.Router();

export interface AgentDeploymentRequest {
  workflowName: string;
  agents: string[];
  tasks: AgentTask[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  context: string;
  expectedDuration?: number;
  dependencies?: string[];
}

export interface AgentTask {
  id: string;
  description: string;
  assignedAgent: string;
  dependencies: string[];
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface DeploymentResponse {
  success: boolean;
  deploymentId: string;
  agentsDeployed: number;
  estimatedCompletion: Date;
  trackingUrl: string;
  message: string;
}

/**
 * DEPLOY ALL AGENTS ENDPOINT
 * Main orchestrator endpoint that Sandra's system depends on
 */
router.post('/deploy-all-agents', async (req: express.Request, res: express.Response) => {
  try {
    console.log('🚀 AUTONOMOUS ORCHESTRATOR: Deploy-all-agents endpoint called');
    
    const deployment: AgentDeploymentRequest = req.body;
    const deploymentId = `deploy_${Date.now()}`;
    
    // Validate request
    if (!deployment.workflowName || !deployment.agents || deployment.agents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid deployment request: workflowName and agents required'
      });
    }

    console.log(`🎯 ORCHESTRATOR: Deploying ${deployment.agents.length} agents for workflow: ${deployment.workflowName}`);

    // Get workflow template
    const workflowTemplate = await workflowTemplates.getWorkflowTemplate(deployment.workflowName);
    
    // Distribute tasks to agents using intelligent task distributor
    const taskDistribution = await intelligentTaskDistributor.distributeTasks({
      agents: deployment.agents,
      tasks: deployment.tasks || workflowTemplate.defaultTasks,
      workflowType: deployment.workflowName,
      priority: deployment.priority
    });

    console.log(`📋 ORCHESTRATOR: Distributed ${taskDistribution.assignments.length} task assignments`);

    // Initialize cross-agent collaboration
    const crossAgentIntelligence = CrossAgentIntelligence.getInstance();
    await crossAgentIntelligence.initiateAgentCollaboration(
      deployment.agents,
      deployment.context,
      'problem_solving'
    );

    // Calculate estimated completion
    const totalDuration = deployment.expectedDuration || 
      taskDistribution.assignments.reduce((sum: number, task: { estimatedDuration: number }) => sum + task.estimatedDuration, 0);
    
    const estimatedCompletion = new Date(Date.now() + totalDuration * 60 * 1000);

    // Create deployment response
    const response: DeploymentResponse = {
      success: true,
      deploymentId,
      agentsDeployed: deployment.agents.length,
      estimatedCompletion,
      trackingUrl: `/admin/agent-activity?deployment=${deploymentId}`,
      message: `Successfully deployed ${deployment.agents.length} agents for ${deployment.workflowName}`
    };

    console.log(`✅ ORCHESTRATOR: Deployment ${deploymentId} successful`);
    console.log(`🎯 TRACKING: ${response.trackingUrl}`);

    res.json(response);

  } catch (error) {
    console.error('❌ ORCHESTRATOR: Deployment failed:', error);
    res.status(500).json({
      success: false,
      error: 'Deployment failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET DEPLOYMENT STATUS
 * Track ongoing deployments
 */
router.get('/deployment-status/:deploymentId', async (req: express.Request, res: express.Response) => {
  try {
    const { deploymentId } = req.params;
    
    // Get deployment status from task distributor
    const status = await intelligentTaskDistributor.getDeploymentStatus(deploymentId);
    
    res.json(status);
  } catch (error) {
    console.error('❌ ORCHESTRATOR: Status check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Status check failed'
    });
  }
});

export default router;