/**
 * Plan B Status API - Monitor backup execution system
 */

import { planBExecutor } from '../agent-tool-execution-fix.js';

export async function getPlanBStatus(req, res) {
  try {
    const status = planBExecutor.getStatus();
    
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
    
  } catch (error) {
    console.error('Plan B status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

export async function forcePlanBExecution(req, res) {
  try {
    const { agentId, operation, filePath, content } = req.body;
    
    if (!agentId || !operation || !filePath) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: agentId, operation, filePath'
      });
    }
    
    await planBExecutor.queueOperation(agentId, operation, filePath, content);
    
    res.json({
      success: true,
      message: `Plan B operation queued: ${agentId} ${operation} on ${filePath}`,
      queueLength: planBExecutor.getStatus().queueLength
    });
    
  } catch (error) {
    console.error('Force Plan B execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}