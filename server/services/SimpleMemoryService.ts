/**
 * SIMPLE MEMORY SERVICE
 * Manages memory persistence and cleanup for agent conversations
 * Implements singleton pattern with database backup
 */

import { Database } from '../database/Database';
import { PerformanceMonitor } from './PerformanceMonitor';

interface MemoryEntry {
  key: string;
  data: any;
  timestamp: number;
  taskId?: string;
  agentId?: string;
}

export class SimpleMemoryService {
  private static instance: SimpleMemoryService;
  private contextCache: Map<string, MemoryEntry>;
  private readonly MAX_CACHE_SIZE = 1000;
  private readonly CLEANUP_INTERVAL = 1000 * 60 * 60; // 1 hour
  private readonly ENTRY_TTL = 1000 * 60 * 60 * 24; // 24 hours

  private constructor() {
    this.contextCache = new Map();
    // REMOVED: Cleanup interval was causing server restarts
  }

  public static getInstance(): SimpleMemoryService {
    if (!SimpleMemoryService.instance) {
      SimpleMemoryService.instance = new SimpleMemoryService();
    }
    return SimpleMemoryService.instance;
  }

  /**
   * Store data in memory with database backup
   */
  public async set(key: string, data: any, taskId?: string, agentId?: string): Promise<void> {
    try {
      PerformanceMonitor.startTimer('memory_set');

      // Ensure cache doesn't exceed max size
      if (this.contextCache.size >= this.MAX_CACHE_SIZE) {
        this.cleanup();
      }

      const entry: MemoryEntry = {
        key,
        data,
        timestamp: Date.now(),
        taskId,
        agentId
      };

      // Update cache
      this.contextCache.set(key, entry);

      // Backup to database
      await Database.query(
        'INSERT INTO memory_entries (key, data, timestamp, task_id, agent_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (key) DO UPDATE SET data = $2, timestamp = $3, task_id = $4, agent_id = $5',
        [key, JSON.stringify(data), entry.timestamp, taskId, agentId]
      );

      PerformanceMonitor.endTimer('memory_set');
    } catch (error) {
      console.error('Error in SimpleMemoryService.set:', error);
      throw error;
    }
  }

  /**
   * Retrieve data from memory or database
   */
  public async get(key: string): Promise<any> {
    try {
      PerformanceMonitor.startTimer('memory_get');

      // Check cache first
      const cachedEntry = this.contextCache.get(key);
      if (cachedEntry && Date.now() - cachedEntry.timestamp < this.ENTRY_TTL) {
        PerformanceMonitor.endTimer('memory_get');
        return cachedEntry.data;
      }

      // If not in cache or expired, check database
      const result = await Database.query(
        'SELECT data FROM memory_entries WHERE key = $1 AND timestamp > $2',
        [key, Date.now() - this.ENTRY_TTL]
      );

      if (result.rows.length > 0) {
        const data = JSON.parse(result.rows[0].data);
        this.contextCache.set(key, {
          key,
          data,
          timestamp: Date.now()
        });
        PerformanceMonitor.endTimer('memory_get');
        return data;
      }

      PerformanceMonitor.endTimer('memory_get');
      return null;
    } catch (error) {
      console.error('Error in SimpleMemoryService.get:', error);
      throw error;
    }
  }

  /**
   * Clean up expired entries from cache and database
   */
  private async cleanup(): Promise<void> {
    try {
      PerformanceMonitor.startTimer('memory_cleanup');

      const now = Date.now();
      const expired = now - this.ENTRY_TTL;

      // Cleanup cache
      for (const [key, entry] of this.contextCache.entries()) {
        if (entry.timestamp < expired) {
          this.contextCache.delete(key);
        }
      }

      // Cleanup database
      await Database.query(
        'DELETE FROM memory_entries WHERE timestamp < $1',
        [expired]
      );

      PerformanceMonitor.endTimer('memory_cleanup');
    } catch (error) {
      console.error('Error in SimpleMemoryService.cleanup:', error);
    }
  }

  /**
   * Start automatic cleanup interval
   */
  private startCleanupInterval(): void {
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  /**
   * Clear memory for specific task
   */
  public async clearTaskMemory(taskId: string): Promise<void> {
    try {
      // Clear from cache
      for (const [key, entry] of this.contextCache.entries()) {
        if (entry.taskId === taskId) {
          this.contextCache.delete(key);
        }
      }

      // Clear from database
      await Database.query(
        'DELETE FROM memory_entries WHERE task_id = $1',
        [taskId]
      );
    } catch (error) {
      console.error('Error in SimpleMemoryService.clearTaskMemory:', error);
      throw error;
    }
  }

  /**
   * Get all memory entries for an agent
   */
  public async getAgentMemory(agentId: string): Promise<any[]> {
    try {
      const result = await Database.query(
        'SELECT data FROM memory_entries WHERE agent_id = $1 AND timestamp > $2 ORDER BY timestamp DESC',
        [agentId, Date.now() - this.ENTRY_TTL]
      );
      return result.rows.map(row => JSON.parse(row.data));
    } catch (error) {
      console.error('Error in SimpleMemoryService.getAgentMemory:', error);
      throw error;
    }
  }
}