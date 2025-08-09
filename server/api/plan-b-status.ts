/**
 * Plan B Status API - Monitor backup execution system
 */

import { Request, Response } from 'express';
import { planBExecutor } from '../agent-tool-execution-fix';

interface PlanBOperation {
  agentId: string;
  operation: string;
  filePath: string;
  status: string;
  timestamp: Date;
  result?: any;
  error?: string;
}

interface PlanBStatus {
  isProcessing: boolean;
  queueLength: number;
  recentOperations: PlanBOperation[];
}

interface PlanBResponse {
  success: boolean;
  planB?: {
    active: boolean;
    queueLength: number;
    recentOperations: PlanBOperation[];
  };
  message?: string;
  error?: string;
  queueLength?: number;
}

interface ForcePlanBRequest {
  agentId: string;
  operation: string;
  filePath: string;
  content?: string;
}

export async function getPlanBStatus(req: Request, res: Response<PlanBResponse>): Promise<void> {
  try {
    const status: PlanBStatus = planBExecutor.getStatus();
    
    res.json({
      success: true,
      planB: {
        active: status.isProcessing,
        queueLength: status.queueLength,
        recentOperations: status.recentOperations.map(op => ({
          agentId: op.agentId,
          operation: op.operation,
          filePath: op.filePath,
          status: op.status,
          timestamp: op.timestamp,
          result: op.result || null,
          error: op.error || null
        }))
      },
      message: status.isProcessing 
        ? `Plan B processing ${status.queueLength} operations`
        : status.queueLength > 0 
          ? `Plan B queue has ${status.queueLength} pending operations`
          : 'Plan B system ready'
    });
    
  } catch (error: any) {
    console.error('Plan B status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function forcePlanBExecution(req: Request<{}, {}, ForcePlanBRequest>, res: Response<PlanBResponse>): Promise<void> {
  try {
    const { agentId, operation, filePath, content } = req.body;
    
    if (!agentId || !operation || !filePath) {
      res.status(400).json({
        success: false,
        error: 'Missing required parameters: agentId, operation, filePath'
      });
      return;
    }
    
    await planBExecutor.queueOperation(agentId, operation, filePath, content);
    
    res.json({
      success: true,
      message: `Plan B operation queued: ${agentId} ${operation} on ${filePath}`,
      queueLength: planBExecutor.getStatus().queueLength
    });
    
  } catch (error: any) {
    console.error('Force Plan B execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}