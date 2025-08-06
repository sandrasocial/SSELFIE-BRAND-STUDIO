import { Express } from 'express';
import { AgentCodebaseIntegration } from '../agents/agent-codebase-integration.js';
import { readFile, unlink } from 'fs/promises';

export function setupRollbackRoutes(app: Express) {
  // Rollback a file to its backup version
  app.post('/api/admin/rollback-file', async (req, res) => {
    try {
      const { filePath, adminToken } = req.body;
      
      // Verify admin token
      if (adminToken !== 'sandra-admin-2025') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const backupPath = filePath.replace('.tsx', '.backup.tsx');
      
      // Read backup content
      const backupContent = await readFile(backupPath, 'utf8');
      
      // Restore original file
      await AgentCodebaseIntegration.writeFile(filePath, backupContent);
      
      // Remove backup file
      await unlink(backupPath);
      
      console.log(`🔄 Rolled back file: ${filePath}`);
      
      res.json({
        success: true,
        message: `File ${filePath} rolled back successfully`,
        filePath,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Rollback failed:', error);
      res.status(500).json({ 
        error: 'Rollback failed', 
        details: error.message 
      });
    }
  });
  
  // List available backups
  app.get('/api/admin/backups', async (req, res) => {
    try {
      const { glob } = await import('glob');
      const backupFiles = await glob('client/src/components/**/*.backup.tsx');
      
      const backups = backupFiles.map(backup => ({
        backupPath: backup,
        originalPath: backup.replace('.backup.tsx', '.tsx'),
        fileName: backup.split('/').pop()?.replace('.backup.tsx', '') || 'Unknown'
      }));
      
      res.json({ backups });
      
    } catch (error) {
      console.error('Failed to list backups:', error);
      res.status(500).json({ error: 'Failed to list backups' });
    }
  });
}