/**
 * ELENA EXECUTION API ENDPOINT
 * Critical bridge connecting Elena's Execute button to autonomous orchestrator
 */

import { Request, Response } from 'express';

interface ElenaExecutionRequest {
  workflowId: string;
  workflowName: string;
  agents: Array<{
    agentId: string;
    task: string;
    filePath?: string;
  }>;
  priority?: 'low' | 'medium' | 'high';
}

interface ElenaExecutionResponse {
  success: boolean;
  executionId: string;
  message: string;
  workflowName: string;
  agentsDeployed: number;
  progressUrl: string;
  timestamp: string;
}

/**
 * Elena Workflow Execution Endpoint
 * Bridges Elena's Execute button to autonomous orchestrator system
 */
export async function executeElenaWorkflow(req: Request, res: Response) {
  console.log('🚀 ELENA EXECUTION: Processing workflow execution request');
  
  try {
    const { workflowId, workflowName, agents, priority = 'high' } = req.body as ElenaExecutionRequest;
    
    // Validate required fields
    if (!workflowId || !workflowName || !agents || agents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: workflowId, workflowName, and agents array'
      });
    }
    
    console.log(`🎯 ELENA WORKFLOW: ${workflowName} with ${agents.length} agents`);
    
    // Generate unique execution ID
    const executionId = `elena-exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Transform Elena workflow data for autonomous orchestrator
    const orchestratorMission = {
      missionId: executionId,
      missionType: 'elena-workflow',
      missionName: workflowName,
      priority: priority,
      agents: agents.map(agent => ({
        agentId: agent.agentId,
        task: agent.task,
        targetFile: agent.filePath || null,
        capabilities: ['str_replace_based_edit_tool', 'search_filesystem'],
        expectedDeliverable: agent.filePath ? 'file_modification' : 'implementation'
      })),
      coordinationMode: 'elena-workflow',
      requestedBy: 'elena-admin-interface',
      timestamp: new Date().toISOString()
    };
    
    console.log('🔄 ELENA ORCHESTRATOR: Deploying mission to autonomous orchestrator');
    
    // Deploy to autonomous orchestrator
    const orchestratorResponse = await fetch('http://localhost:5000/api/autonomous-orchestrator/deploy-all-agents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sandra-admin-2025',
        'X-Elena-Workflow': 'true'
      },
      body: JSON.stringify(orchestratorMission)
    });
    
    if (!orchestratorResponse.ok) {
      const errorData = await orchestratorResponse.text();
      console.error('❌ ORCHESTRATOR ERROR:', errorData);
      
      return res.status(500).json({
        success: false,
        error: 'Autonomous orchestrator deployment failed',
        details: errorData
      });
    }
    
    const orchestratorResult = await orchestratorResponse.json();
    console.log('✅ ELENA ORCHESTRATOR: Mission deployed successfully');
    
    // Create Elena execution response
    const response: ElenaExecutionResponse = {
      success: true,
      executionId: executionId,
      message: `Elena workflow "${workflowName}" deployed successfully with ${agents.length} agents`,
      workflowName: workflowName,
      agentsDeployed: agents.length,
      progressUrl: `/admin/agent-activity?execution=${executionId}`,
      timestamp: new Date().toISOString()
    };
    
    console.log(`🎉 ELENA EXECUTION SUCCESS: ${executionId} deployed`);
    
    // Store execution metadata for tracking
    const executionMetadata = {
      executionId,
      workflowName,
      agentsCount: agents.length,
      status: 'deployed',
      startTime: new Date().toISOString(),
      orchestratorDeploymentId: orchestratorResult.deploymentId || executionId
    };
    
    // TODO: Store in database for persistence (optional enhancement)
    
    res.json(response);
    
  } catch (error) {
    console.error('💥 ELENA EXECUTION ERROR:', error);
    
    res.status(500).json({
      success: false,
      error: 'Elena workflow execution failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Elena Execution Status Endpoint
 * Provides real-time status updates for executed workflows
 */
export async function getElenaExecutionStatus(req: Request, res: Response) {
  try {
    const { executionId } = req.params;
    
    if (!executionId) {
      return res.status(400).json({
        success: false,
        error: 'Execution ID required'
      });
    }
    
    // Get status from autonomous orchestrator
    const metricsResponse = await fetch('http://localhost:5000/api/autonomous-orchestrator/coordination-metrics', {
      headers: {
        'Authorization': 'Bearer sandra-admin-2025'
      }
    });
    
    if (metricsResponse.ok) {
      const metrics = await metricsResponse.json();
      
      res.json({
        success: true,
        executionId,
        status: 'active',
        progress: metrics.data || {},
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        success: true,
        executionId,
        status: 'unknown',
        message: 'Status monitoring unavailable',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ ELENA STATUS ERROR:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to get execution status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}