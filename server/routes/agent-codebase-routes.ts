/**
 * AGENT CODEBASE ACCESS ROUTES
 * Secure API endpoints for Sandra's agents to access and modify the codebase
 */

import { Router } from 'express';
import { AgentCodebaseIntegration } from '../agents/agent-codebase-integration';

const router = Router();

/**
 * SECURE ADMIN CHECK
 * Only Sandra can authorize agent codebase access
 */
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    if (!req.user || req.user.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Access check failed' });
  }
};

/**
 * AGENT FILE OPERATIONS
 */

// Read file - allows agents to analyze existing code
router.post('/agent/read-file', isAdmin, async (req, res) => {
  try {
    const { agentId, filePath } = req.body;
    
    if (!agentId || !filePath) {
      return res.status(400).json({ error: 'Agent ID and file path required' });
    }
    
    const content = await AgentCodebaseIntegration.readFile(agentId, filePath);
    
    res.json({
      success: true,
      content,
      message: `Agent ${agentId} successfully read ${filePath}`
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'File read failed'
    });
  }
});

// Write file - allows agents to create/modify files
router.post('/agent/write-file', isAdmin, async (req, res) => {
  try {
    const { agentId, filePath, content, description } = req.body;
    
    if (!agentId || !filePath || !content) {
      return res.status(400).json({ error: 'Agent ID, file path, and content required' });
    }
    
    await AgentCodebaseIntegration.writeFile(agentId, filePath, content, description);
    
    res.json({
      success: true,
      message: `Agent ${agentId} successfully wrote ${filePath}`
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'File write failed'
    });
  }
});

/**
 * EMAIL AUTOMATION CREATION
 */
router.post('/agent/create-email-automation', isAdmin, async (req, res) => {
  try {
    const { agentId, automationConfig } = req.body;
    
    if (!agentId || !automationConfig) {
      return res.status(400).json({ error: 'Agent ID and automation config required' });
    }
    
    const fileName = await AgentCodebaseIntegration.createEmailAutomation(agentId, automationConfig);
    
    res.json({
      success: true,
      fileName,
      message: `Agent ${agentId} created email automation: ${automationConfig.name}`
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Email automation creation failed'
    });
  }
});

/**
 * API ENDPOINT CREATION
 */
router.post('/agent/create-api-endpoint', isAdmin, async (req, res) => {
  try {
    const { agentId, endpointConfig } = req.body;
    
    if (!agentId || !endpointConfig) {
      return res.status(400).json({ error: 'Agent ID and endpoint config required' });
    }
    
    await AgentCodebaseIntegration.createAPIEndpoint(agentId, endpointConfig);
    
    res.json({
      success: true,
      message: `Agent ${agentId} created API endpoint: ${endpointConfig.method} ${endpointConfig.path}`
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'API endpoint creation failed'
    });
  }
});

/**
 * DATABASE OPERATIONS
 */
router.post('/agent/create-database-table', isAdmin, async (req, res) => {
  try {
    const { agentId, tableConfig } = req.body;
    
    if (!agentId || !tableConfig) {
      return res.status(400).json({ error: 'Agent ID and table config required' });
    }
    
    await AgentCodebaseIntegration.createDatabaseTable(agentId, tableConfig);
    
    res.json({
      success: true,
      message: `Agent ${agentId} created database table: ${tableConfig.name}`
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Database table creation failed'
    });
  }
});

/**
 * WORKFLOW CREATION
 */
router.post('/agent/create-workflow', isAdmin, async (req, res) => {
  try {
    const { agentId, workflowConfig } = req.body;
    
    if (!agentId || !workflowConfig) {
      return res.status(400).json({ error: 'Agent ID and workflow config required' });
    }
    
    const fileName = await AgentCodebaseIntegration.createWorkflow(agentId, workflowConfig);
    
    res.json({
      success: true,
      fileName,
      message: `Agent ${agentId} created workflow: ${workflowConfig.name}`
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Workflow creation failed'
    });
  }
});

/**
 * AGENT CAPABILITIES CHECK
 */
router.get('/agent/:agentId/capabilities', isAdmin, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const capabilities = await AgentCodebaseIntegration.checkAgentCapabilities(agentId);
    
    res.json({
      agentId,
      capabilities,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Capabilities check failed'
    });
  }
});

/**
 * OPERATION LOGS
 */
router.get('/agent/operations', isAdmin, async (req, res) => {
  try {
    // Return recent agent operations log
    res.json({
      message: 'Agent operations log - Coming soon',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      error: error.message || 'Operations log failed'
    });
  }
});

export default router;