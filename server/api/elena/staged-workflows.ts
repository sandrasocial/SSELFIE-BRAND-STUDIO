/**
 * ELENA STAGED WORKFLOWS API
 * Manages Elena's detected workflows with authentication and database integration
 */

import { Router } from 'express';
import { elenaWorkflowDetectionService } from '../../services/elena-workflow-detection-service';

const router = Router();

/**
 * Authentication middleware for Elena workflow endpoints
 */
const validateElenaAccess = (req: any, res: any, next: any) => {
  // Check session-based authentication (preferred)
  if (req.isAuthenticated && req.isAuthenticated()) {
    const user = req.user;
    if (user?.claims?.email === 'ssa@ssasocial.com') {
      console.log('✅ ELENA STAGED WORKFLOW AUTH: Session authentication validated');
      return next();
    }
  }

  // Check admin token fallback
  const authHeader = req.headers.authorization;
  if (authHeader === 'Bearer sandra-admin-2025') {
    console.log('✅ ELENA STAGED WORKFLOW AUTH: Admin token validated');
    return next();
  }

  console.log('❌ ELENA STAGED WORKFLOW AUTH: Access denied');
  return res.status(401).json({ 
    success: false, 
    error: 'Elena workflow access requires Sandra authentication' 
  });
};

/**
 * GET /api/elena/staged-workflows
 * Retrieve all staged workflows ready for manual execution
 */
router.get('/staged-workflows', validateElenaAccess, async (req, res) => {
  try {
    console.log('🔍 ELENA STAGED WORKFLOW AUTH: Checking authentication');
    
    // Import both services to ensure we catch all staged workflows
    const { elenaConversationDetection } = await import('../../services/elena-conversation-detection');
    
    // Get workflows from both services
    const detectionServiceWorkflows = elenaWorkflowDetectionService.getStagedWorkflows();
    const conversationServiceWorkflows = elenaConversationDetection.getStagedWorkflows();
    
    const workflows = [...detectionServiceWorkflows, ...conversationServiceWorkflows];
    
    console.log(`📋 STAGED WORKFLOWS: Found ${workflows.length} workflows ready for manual execution`);
    
    res.json({
      success: true,
      workflows,
      count: workflows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ELENA STAGED WORKFLOWS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve staged workflows',
      details: error.message
    });
  }
});

/**
 * GET /api/elena/executed-workflows
 * Retrieve workflow execution history
 */
router.get('/executed-workflows', validateElenaAccess, async (req, res) => {
  try {
    console.log('🔍 ELENA EXECUTED WORKFLOWS: Retrieving workflow history');
    
    const executedWorkflows = elenaWorkflowDetectionService.getExecutedWorkflows();
    
    console.log(`📋 EXECUTED WORKFLOWS: Found ${executedWorkflows.length} workflows in history`);
    
    res.json({
      success: true,
      workflows: executedWorkflows,
      count: executedWorkflows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ELENA EXECUTED WORKFLOWS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve executed workflows',
      details: error.message
    });
  }
});

/**
 * POST /api/elena/execute-staged-workflow/:id
 * Execute a specific staged workflow
 */
router.post('/execute-staged-workflow/:id', validateElenaAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Workflow ID is required'
      });
    }

    console.log(`🚀 ELENA WORKFLOW EXECUTION: Starting workflow ${id}`);
    
    const result = await elenaWorkflowDetectionService.executeWorkflow(id);
    
    if (result.success) {
      console.log(`✅ ELENA WORKFLOW EXECUTED: ${id} - ${result.message}`);
    } else {
      console.log(`❌ ELENA WORKFLOW FAILED: ${id} - ${result.message}`);
    }
    
    res.json({
      success: result.success,
      message: result.message,
      workflowId: id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ELENA WORKFLOW EXECUTION ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute workflow',
      details: error.message,
      workflowId: req.params.id
    });
  }
});

/**
 * DELETE /api/elena/workflow/:id
 * Remove a workflow (completed or cancelled)
 */
router.delete('/workflow/:id', validateElenaAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    const removed = elenaWorkflowDetectionService.removeWorkflow(id);
    
    if (removed) {
      console.log(`🗑️ ELENA WORKFLOW REMOVED: ${id}`);
      res.json({
        success: true,
        message: 'Workflow removed successfully',
        workflowId: id
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Workflow not found',
        workflowId: id
      });
    }
  } catch (error) {
    console.error('❌ ELENA WORKFLOW REMOVAL ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove workflow',
      details: error.message
    });
  }
});

/**
 * GET /api/elena/workflow-status/:id
 * Get status of specific workflow
 */
router.get('/workflow-status/:id', validateElenaAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = elenaWorkflowDetectionService.getWorkflow(id);
    
    if (workflow) {
      res.json({
        success: true,
        workflow,
        status: workflow.status
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Workflow not found'
      });
    }
  } catch (error) {
    console.error('❌ ELENA WORKFLOW STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get workflow status',
      details: error.message
    });
  }
});



/**
 * POST /api/elena/clear-all-workflows
 * Clear all staged workflows (remove demos/tests)
 */
router.post('/clear-all-workflows', validateElenaAccess, async (req, res) => {
  try {
    elenaWorkflowDetectionService.clearAllWorkflows();
    
    res.json({
      success: true,
      message: 'All workflows cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ELENA CLEAR WORKFLOWS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear workflows',
      details: error.message
    });
  }
});

export default router;