/**
 * BACKUP MANAGEMENT API ROUTES
 * Provides Sandra with complete control over agent backups
 * Rollback capabilities, backup monitoring, and cleanup functions
 */

import type { Express } from "express";
import { isAuthenticated } from "../replitAuth";
import { AgentBackupSystem } from "../agents/agent-backup-system";
import path from "path";

export function registerBackupManagementRoutes(app: Express) {
  
  // Get backup statistics and overview
  app.get("/api/admin/backups/stats", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const stats = AgentBackupSystem.getBackupStats();
      res.json({
        success: true,
        stats: {
          totalBackups: stats.totalBackups,
          agentStats: stats.agentStats,
          backupSystemActive: true
        }
      });

    } catch (error) {
      console.error('❌ Error getting backup stats:', error);
      res.status(500).json({ 
        error: 'Failed to get backup statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // List backups for a specific file
  app.post("/api/admin/backups/list", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { filePath } = req.body;
      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }

      const backups = AgentBackupSystem.listBackups(filePath);
      const backupDetails = backups.map(backupPath => {
        try {
          const metadataPath = `${backupPath}.meta`;
          const fs = require('fs');
          if (fs.existsSync(metadataPath)) {
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
            return {
              backupPath,
              timestamp: metadata.backupTime,
              agentId: metadata.agentId,
              fileSize: metadata.fileSize,
              readable: new Date(metadata.backupTime).toLocaleString()
            };
          }
          return { backupPath, timestamp: 'Unknown' };
        } catch (e) {
          return { backupPath, timestamp: 'Error reading metadata' };
        }
      });

      res.json({
        success: true,
        filePath,
        backups: backupDetails
      });

    } catch (error) {
      console.error('❌ Error listing backups:', error);
      res.status(500).json({ 
        error: 'Failed to list backups',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Restore file from backup
  app.post("/api/admin/backups/restore", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { backupPath } = req.body;
      if (!backupPath) {
        return res.status(400).json({ error: 'Backup path is required' });
      }

      await AgentBackupSystem.restoreFromBackup(backupPath);

      res.json({
        success: true,
        message: 'File successfully restored from backup',
        backupPath
      });

    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      res.status(500).json({ 
        error: 'Failed to restore backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Cleanup old backups
  app.post("/api/admin/backups/cleanup", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      AgentBackupSystem.cleanupOldBackups();

      const newStats = AgentBackupSystem.getBackupStats();
      
      res.json({
        success: true,
        message: 'Backup cleanup completed',
        remainingBackups: newStats.totalBackups
      });

    } catch (error) {
      console.error('❌ Error cleaning up backups:', error);
      res.status(500).json({ 
        error: 'Failed to cleanup backups',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Create manual backup of specific file
  app.post("/api/admin/backups/create", isAuthenticated, async (req, res) => {
    try {
      if (req.user?.claims?.email !== 'ssa@ssasocial.com') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { filePath, agentId = 'manual' } = req.body;
      if (!filePath) {
        return res.status(400).json({ error: 'File path is required' });
      }

      const backupPath = await AgentBackupSystem.createBackup(filePath, agentId);

      res.json({
        success: true,
        message: 'Manual backup created successfully',
        backupPath,
        originalFile: filePath
      });

    } catch (error) {
      console.error('❌ Error creating manual backup:', error);
      res.status(500).json({ 
        error: 'Failed to create backup',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  console.log('✅ Backup Management API routes registered');
}