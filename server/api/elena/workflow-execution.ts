/**
 * Elena Workflow Execution API
 * Handles workflow execution requests from Agent Activity Dashboard
 */

import { Request, Response } from 'express';
import { workflowStagingService } from '../../services/workflow-staging-service';

/**
 * Get all staged workflows ready for manual execution
 */
export async function getStagedWorkflows(req: Request, res: Response) {
  try {
    console.log('📋 API: Getting staged workflows');
    
    const workflows = workflowStagingService.getStagedWorkflows();
    
    res.json({
      success: true,
      workflows,
      count: workflows.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API: Error getting staged workflows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get staged workflows',
      message: error.message
    });
  }
}

/**
 * Execute a staged workflow manually
 */
export async function executeWorkflow(req: Request, res: Response) {
  try {
    const { workflowId } = req.params;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'Workflow ID is required'
      });
    }

    console.log('🚀 API: Executing workflow', workflowId);
    
    const result = await workflowStagingService.executeWorkflow(workflowId);
    
    if (result.success) {
      res.json({
        success: true,
        executionId: result.executionId,
        message: 'Workflow execution started successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to execute workflow'
      });
    }

  } catch (error) {
    console.error('❌ API: Error executing workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow',
      message: error.message
    });
  }
}

/**
 * Get workflow execution status
 */
export async function getExecutionStatus(req: Request, res: Response) {
  try {
    const { executionId } = req.params;
    
    if (!executionId) {
      return res.status(400).json({
        success: false,
        error: 'Execution ID is required'
      });
    }

    console.log('📊 API: Getting execution status', executionId);
    
    const execution = workflowStagingService.getExecutionStatus(executionId);
    
    if (execution) {
      res.json({
        success: true,
        execution,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Execution not found'
      });
    }

  } catch (error) {
    console.error('❌ API: Error getting execution status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get execution status',
      message: error.message
    });
  }
}

/**
 * Get all active workflow executions
 */
export async function getActiveExecutions(req: Request, res: Response) {
  try {
    console.log('🔄 API: Getting active executions');
    
    const executions = workflowStagingService.getActiveExecutions();
    
    res.json({
      success: true,
      executions,
      count: executions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API: Error getting active executions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active executions',
      message: error.message
    });
  }
}

/**
 * Remove a staged workflow
 */
export async function removeWorkflow(req: Request, res: Response) {
  try {
    const { workflowId } = req.params;
    
    if (!workflowId) {
      return res.status(400).json({
        success: false,
        error: 'Workflow ID is required'
      });
    }

    console.log('🗑️ API: Removing workflow', workflowId);
    
    const removed = workflowStagingService.removeWorkflow(workflowId);
    
    if (removed) {
      res.json({
        success: true,
        message: 'Workflow removed successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }

  } catch (error) {
    console.error('❌ API: Error removing workflow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove workflow',
      message: error.message
    });
  }
}