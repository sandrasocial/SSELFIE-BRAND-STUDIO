/**
 * ENHANCED AGENT CAPABILITIES ROUTES
 * Additional routes to give agents Replit-level capabilities
 */

import { Router } from 'express';
import { AgentCodebaseIntegration } from '../agents/agent-codebase-integration.js';
import { isAuthenticated } from '../replitAuth.js';

const router = Router();

/**
 * Terminal command execution for agents
 */
router.post('/execute-command', isAuthenticated, async (req, res) => {
  try {
    const { agentId, command, workingDirectory } = req.body;
    
    if (!agentId || !command) {
      return res.status(400).json({ error: 'Missing agentId or command' });
    }
    
    const result = await AgentCodebaseIntegration.executeCommand(
      agentId, 
      command, 
      workingDirectory
    );
    
    res.json(result);
  } catch (error) {
    console.error('Command execution error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Package installation for agents
 */
router.post('/install-package', isAuthenticated, async (req, res) => {
  try {
    const { agentId, packageName, isDev } = req.body;
    
    if (!agentId || !packageName) {
      return res.status(400).json({ error: 'Missing agentId or packageName' });
    }
    
    const result = await AgentCodebaseIntegration.installPackage(
      agentId, 
      packageName, 
      isDev
    );
    
    res.json(result);
  } catch (error) {
    console.error('Package installation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Code analysis for error detection
 */
router.post('/analyze-code', isAuthenticated, async (req, res) => {
  try {
    const { agentId, filePath } = req.body;
    
    if (!agentId || !filePath) {
      return res.status(400).json({ error: 'Missing agentId or filePath' });
    }
    
    const result = await AgentCodebaseIntegration.analyzeCodeForErrors(agentId, filePath);
    
    res.json(result);
  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Database migration execution
 */
router.post('/run-migration', isAuthenticated, async (req, res) => {
  try {
    const { agentId, migrationName } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Missing agentId' });
    }
    
    const result = await AgentCodebaseIntegration.runDatabaseMigration(agentId, migrationName);
    
    res.json(result);
  } catch (error) {
    console.error('Database migration error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Dependency analysis
 */
router.get('/analyze-dependencies/:agentId', isAuthenticated, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const result = await AgentCodebaseIntegration.analyzeDependencies(agentId);
    
    res.json(result);
  } catch (error) {
    console.error('Dependency analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * File diff and version control
 */
router.post('/file-diff', isAuthenticated, async (req, res) => {
  try {
    const { agentId, filePath, version1, version2 } = req.body;
    
    if (!agentId || !filePath) {
      return res.status(400).json({ error: 'Missing agentId or filePath' });
    }
    
    const result = await AgentCodebaseIntegration.getFileDiff(
      agentId, 
      filePath, 
      version1, 
      version2
    );
    
    res.json(result);
  } catch (error) {
    console.error('File diff error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Restore from backup
 */
router.post('/restore-backup', isAuthenticated, async (req, res) => {
  try {
    const { agentId, filePath, backupVersion } = req.body;
    
    if (!agentId || !filePath || !backupVersion) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    await AgentCodebaseIntegration.restoreFromBackup(agentId, filePath, backupVersion);
    
    res.json({ success: true, message: 'File restored successfully' });
  } catch (error) {
    console.error('Backup restore error:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as agentEnhancementRoutes };