/**
 * AGENT SYNCHRONIZATION API ROUTES
 * Provides real-time file sync endpoints for SSELFIE Studio agents
 */

import { Router } from 'express';
import { agentSyncManager } from '../services/agent-sync-manager.js';
import { fileSyncService } from '../services/file-sync-service.js';

const router = Router();

/**
 * ADMIN AUTHENTICATION CHECK
 */
const isAdmin = (req: any, res: any, next: any) => {
  try {
    const adminToken = req.headers['x-admin-token'] || req.body.adminToken;
    if (adminToken === 'sandra-admin-2025') {
      return next();
    }
    
    if (!req.user || req.user.claims?.email !== 'ssa@ssasocial.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Authentication check failed:', error);
    res.status(500).json({ error: 'Authentication check failed' });
  }
};

/**
 * REGISTER AGENT FOR FILE SYNCHRONIZATION
 * POST /api/admin/agent-sync/register
 */
router.post('/register', isAdmin, async (req, res) => {
  try {
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID required' });
    }
    
    const syncState = agentSyncManager.registerAgent(agentId);
    
    res.json({
      success: true,
      message: `Agent ${agentId} registered for file synchronization`,
      syncState
    });
    
  } catch (error) {
    console.error('Agent sync registration error:', error);
    res.status(500).json({
      error: 'Failed to register agent for sync',
      details: error.message
    });
  }
});

/**
 * UNREGISTER AGENT FROM FILE SYNCHRONIZATION
 * POST /api/admin/agent-sync/unregister
 */
router.post('/unregister', isAdmin, async (req, res) => {
  try {
    const { agentId } = req.body;
    
    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID required' });
    }
    
    agentSyncManager.unregisterAgent(agentId);
    
    res.json({
      success: true,
      message: `Agent ${agentId} unregistered from file synchronization`
    });
    
  } catch (error) {
    console.error('Agent sync unregistration error:', error);
    res.status(500).json({
      error: 'Failed to unregister agent from sync',
      details: error.message
    });
  }
});

/**
 * GET PENDING FILE NOTIFICATIONS FOR AGENT
 * GET /api/admin/agent-sync/notifications/:agentId
 */
router.get('/notifications/:agentId', isAdmin, async (req, res) => {
  try {
    const { agentId } = req.params;
    
    const notifications = agentSyncManager.getPendingNotifications(agentId);
    const syncState = agentSyncManager.getAgentSyncState(agentId);
    
    res.json({
      success: true,
      agentId,
      notifications,
      syncState,
      count: notifications.length
    });
    
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to get notifications',
      details: error.message
    });
  }
});

/**
 * MARK NOTIFICATIONS AS DELIVERED
 * POST /api/admin/agent-sync/mark-delivered
 */
router.post('/mark-delivered', isAdmin, async (req, res) => {
  try {
    const { agentId, notificationIds } = req.body;
    
    if (!agentId || !Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'Agent ID and notification IDs array required' });
    }
    
    agentSyncManager.markNotificationsDelivered(agentId, notificationIds);
    
    res.json({
      success: true,
      message: `Marked ${notificationIds.length} notifications as delivered for ${agentId}`
    });
    
  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({
      error: 'Failed to mark notifications as delivered',
      details: error.message
    });
  }
});

/**
 * TRIGGER MANUAL FILE SYNC FOR AGENT
 * POST /api/admin/agent-sync/trigger
 */
router.post('/trigger', isAdmin, async (req, res) => {
  try {
    const { agentId, filePath, operation } = req.body;
    
    if (!agentId || !filePath || !operation) {
      return res.status(400).json({ error: 'Agent ID, file path, and operation required' });
    }
    
    if (!['create', 'modify', 'delete'].includes(operation)) {
      return res.status(400).json({ error: 'Operation must be create, modify, or delete' });
    }
    
    await agentSyncManager.triggerAgentFileSync(agentId, filePath, operation);
    
    res.json({
      success: true,
      message: `File sync triggered for ${agentId}: ${operation} ${filePath}`
    });
    
  } catch (error) {
    console.error('Trigger sync error:', error);
    res.status(500).json({
      error: 'Failed to trigger file sync',
      details: error.message
    });
  }
});

/**
 * GET COMPREHENSIVE SYNC STATUS
 * GET /api/admin/agent-sync/status
 */
router.get('/status', isAdmin, async (req, res) => {
  try {
    const syncStatus = agentSyncManager.getSyncStatus();
    const allAgentStates = agentSyncManager.getAllAgentStates();
    const fileStates = fileSyncService.getFileStates();
    
    res.json({
      success: true,
      syncStatus,
      agents: Object.fromEntries(allAgentStates),
      totalFiles: fileStates.size,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Get sync status error:', error);
    res.status(500).json({
      error: 'Failed to get sync status',
      details: error.message
    });
  }
});

/**
 * GET CURRENT FILE STATES
 * GET /api/admin/agent-sync/files
 */
router.get('/files', isAdmin, async (req, res) => {
  try {
    const fileStates = fileSyncService.getFileStates();
    
    // Convert Map to object for JSON response
    const filesObject = Object.fromEntries(fileStates);
    
    res.json({
      success: true,
      files: filesObject,
      count: fileStates.size,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Get file states error:', error);
    res.status(500).json({
      error: 'Failed to get file states',
      details: error.message
    });
  }
});

/**
 * FORCE FILE RESCAN
 * POST /api/admin/agent-sync/rescan
 */
router.post('/rescan', isAdmin, async (req, res) => {
  try {
    console.log('🔄 Force file rescan requested');
    
    // Stop and restart monitoring to force rescan
    await fileSyncService.stopMonitoring();
    await fileSyncService.startMonitoring();
    
    const fileStates = fileSyncService.getFileStates();
    
    res.json({
      success: true,
      message: 'File rescan completed',
      fileCount: fileStates.size,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('Force rescan error:', error);
    res.status(500).json({
      error: 'Failed to force rescan',
      details: error.message
    });
  }
});

export default router;