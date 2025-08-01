import { Request, Response } from 'express';

export interface WorkflowCleanupRequest {
  clearDeployments?: boolean;
  resetAgents?: boolean;
  clearMetrics?: boolean;
  force?: boolean;
}

export interface WorkflowCleanupResponse {
  success: boolean;
  cleared: {
    deployments: number;
    agents: string[];
    metrics: boolean;
  };
  message: string;
  timestamp: string;
}

// In-memory storage for workflow cleanup
let activeDeployments: Map<string, any> = new Map();
let agentStates: Map<string, any> = new Map();
let workflowMetrics: any = {
  totalDeployments: 0,
  activeDeployments: 0,
  completionRate: 100
};

export async function cleanupWorkflows(req: Request, res: Response) {
  try {
    const { clearDeployments = true, resetAgents = true, clearMetrics = false, force = true }: WorkflowCleanupRequest = req.body;

    let clearedDeployments = 0;
    let clearedAgents: string[] = [];

    // Clear active deployments
    if (clearDeployments) {
      clearedDeployments = activeDeployments.size;
      activeDeployments.clear();
      console.log(`🧹 CLEANUP: Cleared ${clearedDeployments} active deployments`);
    }

    // Reset agent states
    if (resetAgents) {
      const agentNames = ['elena', 'aria', 'zara', 'olga', 'maya', 'victoria', 'rachel', 'ava', 'quinn'];
      for (const agent of agentNames) {
        agentStates.set(agent, {
          status: 'idle',
          currentTask: null,
          lastActivity: new Date(),
          workflowId: null
        });
        clearedAgents.push(agent);
      }
      console.log(`🧹 CLEANUP: Reset ${clearedAgents.length} agent states to idle`);
    }

    // Reset metrics
    if (clearMetrics) {
      workflowMetrics = {
        totalDeployments: 0,
        activeDeployments: 0,
        completionRate: 100
      };
      console.log(`🧹 CLEANUP: Reset workflow metrics`);
    }

    const response: WorkflowCleanupResponse = {
      success: true,
      cleared: {
        deployments: clearedDeployments,
        agents: clearedAgents,
        metrics: clearMetrics
      },
      message: `Successfully cleared ${clearedDeployments} deployments and reset ${clearedAgents.length} agents`,
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('Workflow cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup workflows',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export function stopAllWorkflows(req: Request, res: Response) {
  try {
    const { force = true } = req.body;
    
    // Stop all active workflows
    const stoppedCount = activeDeployments.size;
    activeDeployments.clear();
    
    console.log(`🛑 STOP ALL: Stopped ${stoppedCount} active workflows`);
    
    res.json({
      success: true,
      stopped: stoppedCount,
      message: `Stopped ${stoppedCount} active workflows`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Stop workflows error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop workflows'
    });
  }
}

export function clearAllDeployments(req: Request, res: Response) {
  try {
    const { clearAll = true } = req.body;
    
    const clearedCount = activeDeployments.size;
    activeDeployments.clear();
    
    // Reset deployment metrics
    workflowMetrics.activeDeployments = 0;
    workflowMetrics.totalDeployments = 0;
    
    console.log(`🗑️ CLEAR ALL: Cleared ${clearedCount} deployments`);
    
    res.json({
      success: true,
      cleared: clearedCount,
      message: `Cleared ${clearedCount} deployments`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Clear deployments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear deployments'
    });
  }
}