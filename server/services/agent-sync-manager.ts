/**
 * AGENT SYNCHRONIZATION MANAGER
 * Connects file sync service to SSELFIE Studio agents
 * Provides real-time file change notifications and bidirectional sync
 */

import { EventEmitter } from 'events';
import { fileSyncService, FileChangeEvent } from './file-sync-service.js';

export interface AgentSyncState {
  agentId: string;
  lastSyncTime: number;
  fileCount: number;
  isActive: boolean;
  notifications: FileChangeEvent[];
}

export interface SyncNotification {
  id: string;
  agentId: string;
  changeEvent: FileChangeEvent;
  timestamp: number;
  delivered: boolean;
}

class AgentSyncManager extends EventEmitter {
  private agentStates: Map<string, AgentSyncState> = new Map();
  private pendingNotifications: Map<string, SyncNotification[]> = new Map();
  private syncHistory: SyncNotification[] = [];
  private notificationId = 0;

  constructor() {
    super();
    this.setupFileSyncListeners();
    console.log('🤖 Agent Sync Manager initialized');
  }

  /**
   * Register an agent for file synchronization
   */
  registerAgent(agentId: string): AgentSyncState {
    console.log(`🔗 Registering agent ${agentId} for file synchronization`);
    
    const syncState: AgentSyncState = {
      agentId,
      lastSyncTime: Date.now(),
      fileCount: fileSyncService.getFileStates().size,
      isActive: true,
      notifications: []
    };
    
    this.agentStates.set(agentId, syncState);
    this.pendingNotifications.set(agentId, []);
    
    // Register with file sync service
    fileSyncService.registerAgent(agentId);
    
    console.log(`✅ Agent ${agentId} registered - tracking ${syncState.fileCount} files`);
    
    return syncState;
  }

  /**
   * Unregister an agent from file synchronization
   */
  unregisterAgent(agentId: string): void {
    console.log(`🔌 Unregistering agent ${agentId} from file sync`);
    
    this.agentStates.delete(agentId);
    this.pendingNotifications.delete(agentId);
    
    fileSyncService.unregisterAgent(agentId);
    
    console.log(`✅ Agent ${agentId} unregistered from file sync`);
  }

  /**
   * Get pending file change notifications for an agent
   */
  getPendingNotifications(agentId: string): SyncNotification[] {
    const pending = this.pendingNotifications.get(agentId) || [];
    console.log(`📬 Agent ${agentId} has ${pending.length} pending notifications`);
    return [...pending];
  }

  /**
   * Mark notifications as delivered for an agent
   */
  markNotificationsDelivered(agentId: string, notificationIds: string[]): void {
    const pending = this.pendingNotifications.get(agentId) || [];
    const remaining = pending.filter(notification => !notificationIds.includes(notification.id));
    
    // Mark as delivered in history
    for (const id of notificationIds) {
      const historyItem = this.syncHistory.find(item => item.id === id);
      if (historyItem) {
        historyItem.delivered = true;
      }
    }
    
    this.pendingNotifications.set(agentId, remaining);
    
    // Update agent sync state
    const agentState = this.agentStates.get(agentId);
    if (agentState) {
      agentState.lastSyncTime = Date.now();
    }
    
    console.log(`✅ Marked ${notificationIds.length} notifications as delivered for agent ${agentId}`);
  }

  /**
   * Get current sync state for an agent
   */
  getAgentSyncState(agentId: string): AgentSyncState | null {
    return this.agentStates.get(agentId) || null;
  }

  /**
   * Get all registered agents sync states
   */
  getAllAgentStates(): Map<string, AgentSyncState> {
    return new Map(this.agentStates);
  }

  /**
   * Trigger manual sync for agent when it performs file operations
   */
  async triggerAgentFileSync(agentId: string, filePath: string, operation: 'create' | 'modify' | 'delete'): Promise<void> {
    console.log(`🔄 Agent ${agentId} triggered file sync: ${operation} ${filePath}`);
    
    // Update file sync service
    if (operation !== 'delete') {
      await fileSyncService.triggerSync(filePath, 'agent', agentId);
    }
    
    // Create change event for other agents
    const changeEvent: FileChangeEvent = {
      type: operation === 'create' ? 'created' : operation === 'modify' ? 'modified' : 'deleted',
      filePath,
      timestamp: Date.now(),
      source: 'agent',
      agentId
    };
    
    // Notify other agents (exclude the one that made the change)
    this.notifyOtherAgents(agentId, changeEvent);
  }

  /**
   * Get comprehensive sync status for admin dashboard
   */
  getSyncStatus(): {
    isActive: boolean;
    agentCount: number;
    fileCount: number;
    pendingNotifications: number;
    recentChanges: number;
  } {
    const totalPending = Array.from(this.pendingNotifications.values())
      .reduce((sum, notifications) => sum + notifications.length, 0);
    
    const recentChanges = this.syncHistory.filter(
      item => Date.now() - item.timestamp < 5 * 60 * 1000 // Last 5 minutes
    ).length;
    
    return {
      isActive: fileSyncService.listenerCount('file-changed') > 0,
      agentCount: this.agentStates.size,
      fileCount: fileSyncService.getFileStates().size,
      pendingNotifications: totalPending,
      recentChanges
    };
  }

  /**
   * Setup listeners for file sync service events
   */
  private setupFileSyncListeners(): void {
    // Listen for file changes from the sync service
    fileSyncService.on('file-changed', (changeEvent: FileChangeEvent) => {
      this.handleFileChange(changeEvent);
    });
    
    // Listen for agent notifications from sync service
    fileSyncService.on('agent-notification', (data: { agentId: string; changeEvent: FileChangeEvent }) => {
      this.queueNotificationForAgent(data.agentId, data.changeEvent);
    });
    
    // Listen for sync service events
    fileSyncService.on('sync-service-started', (data) => {
      console.log(`🚀 File sync service started - monitoring ${data.fileCount} files across ${data.monitoredDirs.length} directories`);
      this.emit('sync-service-ready', data);
    });
    
    console.log('👂 Agent sync manager listening to file sync events');
  }

  /**
   * Handle file changes from sync service
   */
  private handleFileChange(changeEvent: FileChangeEvent): void {
    console.log(`📁 Processing file change: ${changeEvent.type} ${changeEvent.filePath} (source: ${changeEvent.source})`);
    
    // Emit for external listeners (like admin dashboard)
    this.emit('file-change', changeEvent);
    
    // Don't notify agents about their own changes
    if (changeEvent.source === 'agent' && changeEvent.agentId) {
      this.notifyOtherAgents(changeEvent.agentId, changeEvent);
    } else {
      // Notify all active agents about external changes
      this.notifyAllAgents(changeEvent);
    }
  }

  /**
   * Queue notification for a specific agent
   */
  private queueNotificationForAgent(agentId: string, changeEvent: FileChangeEvent): void {
    const notification: SyncNotification = {
      id: `sync-${this.notificationId++}`,
      agentId,
      changeEvent,
      timestamp: Date.now(),
      delivered: false
    };
    
    // Add to pending notifications
    const pending = this.pendingNotifications.get(agentId) || [];
    pending.push(notification);
    this.pendingNotifications.set(agentId, pending);
    
    // Add to history
    this.syncHistory.push(notification);
    
    // Trim history to last 1000 items
    if (this.syncHistory.length > 1000) {
      this.syncHistory = this.syncHistory.slice(-1000);
    }
    
    // Update agent notifications array
    const agentState = this.agentStates.get(agentId);
    if (agentState) {
      agentState.notifications.push(changeEvent);
      // Keep only last 50 notifications per agent
      if (agentState.notifications.length > 50) {
        agentState.notifications = agentState.notifications.slice(-50);
      }
    }
    
    console.log(`📬 Queued notification for agent ${agentId}: ${changeEvent.type} ${changeEvent.filePath}`);
  }

  /**
   * Notify all agents except the one that made the change
   */
  private notifyOtherAgents(excludeAgentId: string, changeEvent: FileChangeEvent): void {
    for (const agentId of this.agentStates.keys()) {
      if (agentId !== excludeAgentId) {
        this.queueNotificationForAgent(agentId, changeEvent);
      }
    }
  }

  /**
   * Notify all active agents
   */
  private notifyAllAgents(changeEvent: FileChangeEvent): void {
    for (const agentId of this.agentStates.keys()) {
      this.queueNotificationForAgent(agentId, changeEvent);
    }
  }
}

// Export singleton instance
export const agentSyncManager = new AgentSyncManager();