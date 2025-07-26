import { Request, Response } from 'express';
import { intelligentTaskDistributor } from '../../services/intelligent-task-distributor';
import { agentKnowledgeSharing } from '../../services/agent-knowledge-sharing';
import { autonomousWorkflowTemplates } from '../../templates/workflow-templates';

interface CoordinationMetrics {
  agentCoordination: {
    totalAgents: number;
    availableAgents: number;
    activeAgents: number;
    averageLoad: number;
    averageSuccessRate: number;
  };
  deploymentMetrics: {
    activeDeployments: number;
    totalDeployments: number;
    completionRate: number;
  };
  knowledgeSharing: {
    totalInsights: number;
    totalStrategies: number;
    avgEffectiveness: number;
    knowledgeConnections: number;
  };
  systemHealth: {
    orchestratorStatus: string;
    taskDistributorStatus: string;
    knowledgeSharingStatus: string;
    lastHealthCheck: string;
  };
}

/**
 * Get comprehensive coordination metrics for Agent Activity Dashboard
 */
export async function getCoordinationMetrics(req: Request, res: Response): Promise<void> {
  try {
    console.log('📊 COORDINATION METRICS: Generating comprehensive metrics...');

    // Get agent status from task distributor
    const agentStatuses = intelligentTaskDistributor.getAgentStatus();
    const activeAgents = agentStatuses.filter(agent => agent.currentLoad > 0);
    const availableAgents = agentStatuses.filter(agent => agent.isAvailable);
    
    const averageLoad = agentStatuses.length > 0 
      ? agentStatuses.reduce((sum, agent) => sum + (agent.currentLoad / agent.maxConcurrentTasks * 100), 0) / agentStatuses.length
      : 0;
    
    const averageSuccessRate = agentStatuses.length > 0
      ? agentStatuses.reduce((sum, agent) => sum + agent.successRate, 0) / agentStatuses.length
      : 95;

    // Get knowledge sharing metrics
    const knowledgeIntelligence = agentKnowledgeSharing.getIntelligenceSummary();

    // Get workflow template statistics
    const templateStats = autonomousWorkflowTemplates.getTemplateStatistics();

    // Get real deployment metrics from deployment tracker
    const { deploymentTracker } = await import('../../services/deployment-tracking-service');
    const deploymentMetrics = deploymentTracker.getDeploymentMetrics();

    const metrics: CoordinationMetrics = {
      agentCoordination: {
        totalAgents: agentStatuses.length,
        availableAgents: availableAgents.length,
        activeAgents: activeAgents.length,
        averageLoad: Math.round(averageLoad),
        averageSuccessRate: Math.round(averageSuccessRate)
      },
      deploymentMetrics,
      knowledgeSharing: {
        totalInsights: knowledgeIntelligence.metrics.totalInsights,
        totalStrategies: knowledgeIntelligence.metrics.totalStrategies,
        avgEffectiveness: knowledgeIntelligence.metrics.avgEffectiveness,
        knowledgeConnections: knowledgeIntelligence.metrics.knowledgeConnections
      },
      systemHealth: {
        orchestratorStatus: 'operational',
        taskDistributorStatus: 'operational',
        knowledgeSharingStatus: 'operational',
        lastHealthCheck: new Date().toISOString()
      }
    };

    console.log(`📊 COORDINATION METRICS: Generated metrics for ${agentStatuses.length} agents, ${activeAgents.length} active`);

    res.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ COORDINATION METRICS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate coordination metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get active deployments for dashboard
 */
export async function getActiveDeployments(req: Request, res: Response): Promise<void> {
  try {
    console.log('🚀 ACTIVE DEPLOYMENTS: Retrieving active deployments...');

    // Get real active deployments from deployment tracker
    const { deploymentTracker } = await import('../../services/deployment-tracking-service');
    const activeDeployments = deploymentTracker.getActiveDeployments();

    console.log(`📊 ACTIVE DEPLOYMENTS: Found ${activeDeployments.length} active deployments`);

    res.json({
      success: true,
      activeDeployments,
      count: activeDeployments.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ ACTIVE DEPLOYMENTS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve active deployments',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get deployment status details
 */
export async function getDeploymentStatus(req: Request, res: Response): Promise<void> {
  try {
    const { deploymentId } = req.params;
    console.log(`🔍 DEPLOYMENT STATUS: Checking status for deployment ${deploymentId}`);

    // Get deployment from deployment tracker
    const { deploymentTracker } = await import('../../services/deployment-tracking-service');
    const deployment = deploymentTracker.getDeployment(deploymentId);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        error: 'Deployment not found',
        deploymentId
      });
    }

    res.json({
      success: true,
      deployment,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ DEPLOYMENT STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deployment status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}