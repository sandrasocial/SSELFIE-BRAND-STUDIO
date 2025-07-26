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
    
    const workflows = elenaWorkflowDetectionService.getStagedWorkflows();
    
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
 * POST /api/elena/test-workflow-detection
 * Test Elena's workflow detection with sample conversation
 */
router.post('/test-workflow-detection', validateElenaAccess, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required for testing'
      });
    }

    const analysis = elenaWorkflowDetectionService.analyzeConversation(message, 'elena');
    
    // If workflow detected, stage it automatically
    if (analysis.hasWorkflow && analysis.workflow) {
      console.log('✅ WORKFLOW DETECTED: Staging for Agent Activity dashboard');
      elenaWorkflowDetectionService.stageWorkflow(analysis.workflow);
    }
    
    res.json({
      success: true,
      analysis,
      testMessage: message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ELENA WORKFLOW DETECTION TEST ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test workflow detection',
      details: error.message
    });
  }
});

router.post('/create-test-workflow', validateElenaAccess, async (req, res) => {
  try {
    console.log('🧪 CREATING TEST WORKFLOW for Agent Activity dashboard');
    
    const testWorkflow = elenaWorkflowDetectionService.createTestWorkflow();
    
    res.json({
      success: true,
      workflow: testWorkflow,
      message: 'Test workflow created and staged for Agent Activity dashboard',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ CREATE TEST WORKFLOW ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create test workflow',
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