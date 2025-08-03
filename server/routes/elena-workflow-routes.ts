// CONSOLIDATED: Elena Workflow Routes - DEACTIVATED
// All agent routing now flows through unified-agent-system.ts to prevent conflicts
// This file is preserved for reference but routes are not registered

import { Router } from 'express';
import { ElenaWorkflowSystem } from '../elena-workflow-system';

const router = Router();

/**
 * ADMIN AUTHENTICATION CHECK for Elena Workflows
 * Supports both admin token and session authentication
 */
const isAdminOrToken = (req: any, res: any, next: any) => {
  try {
    // Check for admin token from visual editor
    const adminToken = req.headers['x-admin-token'] || req.body.adminToken;
    if (adminToken === 'sandra-admin-2025') {
      return next();
    }
    
    // Fallback to session authentication for direct access
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.claims?.email === 'ssa@ssasocial.com') {
      return next();
    }
    
    console.log('🔒 ELENA AUTH CHECK:', {
      hasAdminToken: !!adminToken,
      isSessionAuth: req.isAuthenticated && req.isAuthenticated(),
      userEmail: req.user?.claims?.email
    });
    
    return res.status(401).json({ error: 'Admin authentication required' });
  } catch (error) {
    console.error('Elena authentication check failed:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
};

/**
 * Create workflow from visual editor request 
 */
router.post('/create-workflow', isAdminOrToken, async (req, res) => {
  try {
    const { request, userId } = req.body;
    
    if (!request) {
      return res.status(400).json({ error: 'Request is required' });
    }

    console.log(`ELENA VISUAL EDITOR: Creating workflow for request: "${request}"`);

    // Create workflow using Elena's system
    const workflow = await ElenaWorkflowSystem.createWorkflowFromRequest(
      userId || '42585527',
      request
    );

    // Return workflow for visual editor display
    res.json({
      success: true,
      workflow: workflow,
      message: `ERROR: Template responses disabled. Elena must use authentic Claude API responses only.`
    });

  } catch (error) {
    console.error('Elena workflow creation error:', error);
    res.status(500).json({
      error: 'Failed to create workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Execute workflow from visual editor
 */
router.post('/execute-workflow', isAdminOrToken, async (req, res) => {
  try {
    const { workflowId } = req.body;
    
    if (!workflowId) {
      return res.status(400).json({ error: 'Workflow ID is required' });
    }

    console.log(`ELENA VISUAL EDITOR: Executing workflow: ${workflowId}`);

    // Execute workflow
    const result = await ElenaWorkflowSystem.executeWorkflow(workflowId);

    res.json({
      success: true,
      executionId: result.executionId,
      message: 'Workflow execution started. You will see live progress updates in the chat.'
    });

  } catch (error) {
    console.error('Elena workflow execution error:', error);
    res.status(500).json({
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Get workflow progress for live updates (POST for admin token authentication)
 */
router.post('/workflow-progress/:workflowId', isAdminOrToken, async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    console.log(`ELENA PROGRESS CHECK: Workflow ${workflowId}`);
    
    // Get current workflow status
    const progress = await ElenaWorkflowSystem.getWorkflowProgress(workflowId);
    
    res.json({
      success: true,
      progress: progress
    });

  } catch (error) {
    console.error('Elena workflow progress error:', error);
    res.status(500).json({
      error: 'Failed to get workflow progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;