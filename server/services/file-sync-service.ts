/**
 * COMPREHENSIVE BIDIRECTIONAL FILE SYNCHRONIZATION SERVICE
 * Real-time file change detection and agent notification system
 */

import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';

export interface FileChangeEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed';
  filePath: string;
  oldPath?: string; // For rename events
  timestamp: number;
  size?: number;
  source: 'replit' | 'agent' | 'external';
  agentId?: string;
}

export interface SyncedFile {
  path: string;
  lastModified: number;
  size: number;
  hash?: string;
}

class FileSyncService extends EventEmitter {
  private watchers: Map<string, fs.FSWatcher> = new Map();
  private fileStates: Map<string, SyncedFile> = new Map();
  private syncedAgents: Set<string> = new Set();
  private isMonitoring = false;
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();
  
  // Directories to monitor for changes
  private readonly monitoredDirs = [
    'client',
    'server', 
    'shared',
    'public',
    'api',
    'data',
    'assets',
    'attached_assets'
  ];

  // File extensions to monitor
  private readonly monitoredExtensions = [
    '.ts', '.tsx', '.js', '.jsx', 
    '.css', '.scss', '.html', '.json',
    '.md', '.txt', '.yml', '.yaml',
    '.sql', '.env'
  ];

  constructor() {
    super();
    this.setupExitHandlers();
  }

  /**
   * Start monitoring file changes across the project
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.log('📁 File sync service already monitoring');
      return;
    }

    console.log('🚀 Starting comprehensive file synchronization service...');
    
    try {
      // Initial file state scan
      await this.scanInitialFileStates();
      
      // Set up watchers for each monitored directory
      for (const dir of this.monitoredDirs) {
        await this.setupDirectoryWatcher(dir);
      }
      
      // Set up root directory watcher for new files
      await this.setupDirectoryWatcher('.');
      
      this.isMonitoring = true;
      console.log(`✅ File sync service monitoring ${this.monitoredDirs.length} directories`);
      
      // Emit service started event
      this.emit('sync-service-started', {
        monitoredDirs: this.monitoredDirs,
        fileCount: this.fileStates.size,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('❌ Failed to start file sync service:', error);
      throw error;
    }
  }

  /**
   * Stop monitoring and cleanup watchers
   */
  async stopMonitoring(): Promise<void> {
    console.log('🛑 Stopping file sync service...');
    
    // Clear all watchers
    for (const [path, watcher] of this.watchers) {
      try {
        watcher.close();
        console.log(`✅ Stopped watching: ${path}`);
      } catch (error) {
        console.error(`❌ Error stopping watcher for ${path}:`, error);
      }
    }
    
    this.watchers.clear();
    this.debounceTimers.clear();
    this.isMonitoring = false;
    
    console.log('✅ File sync service stopped');
  }

  /**
   * Register an agent to receive file change notifications
   */
  registerAgent(agentId: string): void {
    this.syncedAgents.add(agentId);
    console.log(`🤖 Agent ${agentId} registered for file sync notifications`);
    
    // Send current file state to newly registered agent
    this.emit('agent-registered', {
      agentId,
      fileCount: this.fileStates.size,
      timestamp: Date.now()
    });
  }

  /**
   * Unregister an agent from file change notifications
   */
  unregisterAgent(agentId: string): void {
    this.syncedAgents.delete(agentId);
    console.log(`🤖 Agent ${agentId} unregistered from file sync`);
  }

  /**
   * Manually trigger file sync for specific path
   */
  async triggerSync(filePath: string, source: 'replit' | 'agent' | 'external' = 'external', agentId?: string): Promise<void> {
    try {
      const fullPath = path.resolve(filePath);
      const stats = await fs.promises.stat(fullPath);
      
      const changeEvent: FileChangeEvent = {
        type: this.fileStates.has(filePath) ? 'modified' : 'created',
        filePath,
        timestamp: Date.now(),
        size: stats.size,
        source,
        agentId
      };
      
      await this.handleFileChange(changeEvent);
      console.log(`🔄 Manual sync triggered for ${filePath}`);
      
    } catch (error) {
      console.error(`❌ Manual sync failed for ${filePath}:`, error);
    }
  }

  /**
   * Get current file states for agent synchronization
   */
  getFileStates(): Map<string, SyncedFile> {
    return new Map(this.fileStates);
  }

  /**
   * Scan initial file states across all monitored directories
   */
  private async scanInitialFileStates(): Promise<void> {
    console.log('📊 Scanning initial file states...');
    
    for (const dir of this.monitoredDirs) {
      await this.scanDirectory(dir);
    }
    
    console.log(`📊 Initial scan complete: ${this.fileStates.size} files tracked`);
  }

  /**
   * Recursively scan directory for files
   */
  private async scanDirectory(dirPath: string): Promise<void> {
    try {
      const fullPath = path.resolve(dirPath);
      const exists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
      
      if (!exists) return;
      
      const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const entryPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules and other excluded directories
          if (!this.shouldIgnoreDirectory(entry.name)) {
            await this.scanDirectory(entryPath);
          }
        } else if (entry.isFile()) {
          if (this.shouldMonitorFile(entryPath)) {
            const stats = await fs.promises.stat(path.resolve(entryPath));
            this.fileStates.set(entryPath, {
              path: entryPath,
              lastModified: stats.mtime.getTime(),
              size: stats.size
            });
          }
        }
      }
    } catch (error) {
      console.error(`❌ Error scanning directory ${dirPath}:`, error);
    }
  }

  /**
   * Set up file watcher for a directory
   */
  private async setupDirectoryWatcher(dirPath: string): Promise<void> {
    try {
      const fullPath = path.resolve(dirPath);
      const exists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
      
      if (!exists) {
        console.log(`⚠️ Directory ${dirPath} does not exist, skipping watcher`);
        return;
      }
      
      const watcher = fs.watch(fullPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          const filePath = path.join(dirPath, filename);
          this.handleFileSystemEvent(eventType, filePath);
        }
      });
      
      this.watchers.set(dirPath, watcher);
      console.log(`👀 Watching directory: ${dirPath}`);
      
    } catch (error) {
      console.error(`❌ Failed to setup watcher for ${dirPath}:`, error);
    }
  }

  /**
   * Handle file system events with debouncing
   */
  private handleFileSystemEvent(eventType: string, filePath: string): void {
    // Skip if not a monitored file
    if (!this.shouldMonitorFile(filePath)) return;
    
    // Debounce rapid file changes
    const debounceKey = filePath;
    if (this.debounceTimers.has(debounceKey)) {
      clearTimeout(this.debounceTimers.get(debounceKey)!);
    }
    
    this.debounceTimers.set(debounceKey, setTimeout(async () => {
      this.debounceTimers.delete(debounceKey);
      await this.processFileSystemEvent(eventType, filePath);
    }, 100)); // 100ms debounce
  }

  /**
   * Process debounced file system event
   */
  private async processFileSystemEvent(eventType: string, filePath: string): Promise<void> {
    try {
      const fullPath = path.resolve(filePath);
      const exists = await fs.promises.access(fullPath).then(() => true).catch(() => false);
      const previousState = this.fileStates.get(filePath);
      
      if (exists) {
        const stats = await fs.promises.stat(fullPath);
        const newState: SyncedFile = {
          path: filePath,
          lastModified: stats.mtime.getTime(),
          size: stats.size
        };
        
        // Determine change type
        let changeType: FileChangeEvent['type'];
        if (!previousState) {
          changeType = 'created';
        } else if (previousState.lastModified !== newState.lastModified || previousState.size !== newState.size) {
          changeType = 'modified';
        } else {
          return; // No actual change
        }
        
        this.fileStates.set(filePath, newState);
        
        const changeEvent: FileChangeEvent = {
          type: changeType,
          filePath,
          timestamp: Date.now(),
          size: stats.size,
          source: 'replit' // Assume Replit changes unless marked otherwise
        };
        
        await this.handleFileChange(changeEvent);
        
      } else if (previousState) {
        // File was deleted
        this.fileStates.delete(filePath);
        
        const changeEvent: FileChangeEvent = {
          type: 'deleted',
          filePath,
          timestamp: Date.now(),
          source: 'replit'
        };
        
        await this.handleFileChange(changeEvent);
      }
      
    } catch (error) {
      console.error(`❌ Error processing file event for ${filePath}:`, error);
    }
  }

  /**
   * Handle file change and notify agents
   */
  private async handleFileChange(changeEvent: FileChangeEvent): Promise<void> {
    console.log(`📁 File ${changeEvent.type}: ${changeEvent.filePath} (${changeEvent.source})`);
    
    // Emit change event for any listeners
    this.emit('file-changed', changeEvent);
    
    // Notify all registered agents
    for (const agentId of this.syncedAgents) {
      this.emit('agent-notification', {
        agentId,
        changeEvent,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Check if file should be monitored
   */
  private shouldMonitorFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return this.monitoredExtensions.includes(ext) && !this.shouldIgnoreFile(filePath);
  }

  /**
   * Check if file should be ignored
   */
  private shouldIgnoreFile(filePath: string): boolean {
    const ignoredPatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.cache',
      'temp',
      '.log'
    ];
    
    return ignoredPatterns.some(pattern => filePath.includes(pattern));
  }

  /**
   * Check if directory should be ignored
   */
  private shouldIgnoreDirectory(dirName: string): boolean {
    const ignoredDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.cache',
      '.next',
      'coverage'
    ];
    
    return ignoredDirs.includes(dirName);
  }

  /**
   * Setup process exit handlers for cleanup
   */
  private setupExitHandlers(): void {
    const cleanup = () => {
      if (this.isMonitoring) {
        console.log('🧹 Cleaning up file sync service...');
        this.stopMonitoring();
      }
    };
    
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }
}

// Export singleton instance
export const fileSyncService = new FileSyncService();

// Auto-start monitoring when module loads
fileSyncService.startMonitoring().catch(error => {
  console.error('❌ Failed to auto-start file sync service:', error);
});