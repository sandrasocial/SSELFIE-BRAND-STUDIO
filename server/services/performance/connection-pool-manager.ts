/**
 * Connection Pool Manager
 * Optimizes S3, database, and HTTP connections with monitoring and auto-scaling
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import * as https from 'https';
import * as http from 'http';

export interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeoutMs: number;
  idleTimeoutMs: number;
  maxRetries: number;
  healthCheckIntervalMs: number;
  enableMetrics: boolean;
}

export interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  queuedRequests: number;
  totalAcquired: number;
  totalReleased: number;
  totalErrors: number;
  avgAcquireTimeMs: number;
  avgUsageTimeMs: number;
}

export interface PoolHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: ConnectionMetrics;
  lastHealthCheck: number;
  errors: string[];
}

interface Connection {
  id: string;
  instance: any;
  created: number;
  lastUsed: number;
  inUse: boolean;
  errorCount: number;
  totalUsage: number;
}

interface QueuedRequest {
  resolve: (connection: Connection) => void;
  reject: (error: Error) => void;
  timestamp: number;
  timeout: NodeJS.Timeout;
}

/**
 * Generic connection pool with monitoring and auto-scaling
 */
export class ConnectionPool<T> {
  private connections = new Map<string, Connection>();
  private queue: QueuedRequest[] = [];
  private config: PoolConfig;
  private metrics: ConnectionMetrics;
  private healthCheckInterval?: NodeJS.Timeout;
  private createConnection: () => Promise<T>;
  private validateConnection: (conn: T) => Promise<boolean>;
  private destroyConnection: (conn: T) => Promise<void>;
  private poolName: string;

  constructor(
    poolName: string,
    createFn: () => Promise<T>,
    validateFn: (conn: T) => Promise<boolean>,
    destroyFn: (conn: T) => Promise<void>,
    config?: Partial<PoolConfig>
  ) {
    this.poolName = poolName;
    this.createConnection = createFn;
    this.validateConnection = validateFn;
    this.destroyConnection = destroyFn;
    
    this.config = {
      minConnections: 2,
      maxConnections: 20,
      acquireTimeoutMs: 10000,
      idleTimeoutMs: 300000, // 5 minutes
      maxRetries: 3,
      healthCheckIntervalMs: 60000, // 1 minute
      enableMetrics: true,
      ...config
    };

    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      queuedRequests: 0,
      totalAcquired: 0,
      totalReleased: 0,
      totalErrors: 0,
      avgAcquireTimeMs: 0,
      avgUsageTimeMs: 0
    };

    console.log(`✅ CONNECTION POOL: ${poolName} initialized with config:`, this.config);
    
    // Initialize minimum connections
    this.initializePool();
    
    // Start health monitoring
    if (this.config.healthCheckIntervalMs > 0) {
      this.startHealthChecking();
    }
  }

  /**
   * Initialize pool with minimum connections
   */
  private async initializePool(): Promise<void> {
    try {
      const promises = Array(this.config.minConnections).fill(null).map(() => this.createNewConnection());
      await Promise.all(promises);
      console.log(`✅ CONNECTION POOL: ${this.poolName} initialized with ${this.config.minConnections} connections`);
    } catch (error) {
      console.error(`❌ CONNECTION POOL: Failed to initialize ${this.poolName}:`, error);
    }
  }

  /**
   * Acquire connection from pool
   */
  async acquire(): Promise<Connection> {
    const startTime = Date.now();
    
    try {
      // Try to get idle connection first
      const idleConnection = this.findIdleConnection();
      if (idleConnection) {
        idleConnection.inUse = true;
        idleConnection.lastUsed = Date.now();
        this.updateMetrics('acquire', Date.now() - startTime);
        return idleConnection;
      }

      // Try to create new connection if under limit
      if (this.connections.size < this.config.maxConnections) {
        const newConnection = await this.createNewConnection();
        newConnection.inUse = true;
        newConnection.lastUsed = Date.now();
        this.updateMetrics('acquire', Date.now() - startTime);
        return newConnection;
      }

      // Queue request if at capacity
      return await this.queueRequest();

    } catch (error) {
      this.metrics.totalErrors++;
      throw new Error(`Failed to acquire connection from ${this.poolName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Release connection back to pool
   */
  async release(connection: Connection): Promise<void> {
    const startTime = Date.now();
    
    try {
      if (!this.connections.has(connection.id)) {
        console.warn(`⚠️ CONNECTION POOL: Attempting to release unknown connection ${connection.id}`);
        return;
      }

      connection.inUse = false;
      connection.lastUsed = Date.now();
      connection.totalUsage++;

      // Check if connection is still valid
      const isValid = await this.validateConnection(connection.instance);
      if (!isValid) {
        console.warn(`⚠️ CONNECTION POOL: Removing invalid connection ${connection.id}`);
        await this.removeConnection(connection.id);
        return;
      }

      // Process queued requests
      if (this.queue.length > 0) {
        const queuedRequest = this.queue.shift()!;
        clearTimeout(queuedRequest.timeout);
        connection.inUse = true;
        queuedRequest.resolve(connection);
      }

      this.updateMetrics('release', Date.now() - startTime);
      
    } catch (error) {
      this.metrics.totalErrors++;
      console.error(`❌ CONNECTION POOL: Error releasing connection ${connection.id}:`, error);
      
      // Remove problematic connection
      await this.removeConnection(connection.id);
    }
  }

  /**
   * Execute function with acquired connection
   */
  async execute<R>(fn: (conn: T) => Promise<R>): Promise<R> {
    const connection = await this.acquire();
    
    try {
      const result = await fn(connection.instance);
      await this.release(connection);
      return result;
    } catch (error) {
      // Mark connection as potentially problematic
      connection.errorCount++;
      await this.release(connection);
      throw error;
    }
  }

  /**
   * Find available idle connection
   */
  private findIdleConnection(): Connection | null {
    let result: Connection | null = null;
    this.connections.forEach((connection) => {
      if (!result && !connection.inUse && connection.errorCount < this.config.maxRetries) {
        result = connection;
      }
    });
    return result;
  }

  /**
   * Create new connection
   */
  private async createNewConnection(): Promise<Connection> {
    const connectionId = `${this.poolName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const instance = await this.createConnection();
      
      const connection: Connection = {
        id: connectionId,
        instance,
        created: Date.now(),
        lastUsed: Date.now(),
        inUse: false,
        errorCount: 0,
        totalUsage: 0
      };

      this.connections.set(connectionId, connection);
      this.metrics.totalConnections++;
      
      console.log(`🔗 CONNECTION POOL: Created new connection ${connectionId} for ${this.poolName}`);
      return connection;
      
    } catch (error) {
      this.metrics.totalErrors++;
      throw new Error(`Failed to create connection for ${this.poolName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Queue connection request
   */
  private async queueRequest(): Promise<Connection> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        const index = this.queue.findIndex(req => req.resolve === resolve);
        if (index !== -1) {
          this.queue.splice(index, 1);
          this.metrics.queuedRequests = this.queue.length;
        }
        reject(new Error(`Connection acquire timeout for ${this.poolName}`));
      }, this.config.acquireTimeoutMs);

      this.queue.push({
        resolve,
        reject,
        timestamp: Date.now(),
        timeout
      });
      
      this.metrics.queuedRequests = this.queue.length;
    });
  }

  /**
   * Remove connection from pool
   */
  private async removeConnection(connectionId: string): Promise<void> {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    try {
      await this.destroyConnection(connection.instance);
      this.connections.delete(connectionId);
      console.log(`🗑️ CONNECTION POOL: Removed connection ${connectionId} from ${this.poolName}`);
    } catch (error) {
      console.error(`❌ CONNECTION POOL: Error destroying connection ${connectionId}:`, error);
    }
  }

  /**
   * Update pool metrics
   */
  private updateMetrics(operation: 'acquire' | 'release', timeMs: number): void {
    if (!this.config.enableMetrics) return;

    if (operation === 'acquire') {
      this.metrics.totalAcquired++;
      // Update rolling average
      this.metrics.avgAcquireTimeMs = (this.metrics.avgAcquireTimeMs + timeMs) / 2;
    } else {
      this.metrics.totalReleased++;
      this.metrics.avgUsageTimeMs = (this.metrics.avgUsageTimeMs + timeMs) / 2;
    }

    // Update current counts
    this.metrics.activeConnections = Array.from(this.connections.values()).filter(c => c.inUse).length;
    this.metrics.idleConnections = this.connections.size - this.metrics.activeConnections;
    this.metrics.queuedRequests = this.queue.length;
  }

  /**
   * Start health checking
   */
  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * Perform health check and cleanup
   */
  private async performHealthCheck(): Promise<void> {
    const now = Date.now();
    const connectionsToRemove: string[] = [];

    await Promise.all(
      Array.from(this.connections.entries()).map(async ([id, connection]) => {
        // Remove idle connections that exceeded idle timeout
        if (!connection.inUse && (now - connection.lastUsed) > this.config.idleTimeoutMs) {
          connectionsToRemove.push(id);
          return;
        }

        // Remove connections with too many errors
        if (connection.errorCount >= this.config.maxRetries) {
          connectionsToRemove.push(id);
          return;
        }

        // Validate connection if not in use
        if (!connection.inUse) {
          try {
            const isValid = await this.validateConnection(connection.instance);
            if (!isValid) {
              connectionsToRemove.push(id);
            }
          } catch (error) {
            console.warn(`⚠️ CONNECTION POOL: Health check failed for ${id}:`, error);
            connectionsToRemove.push(id);
          }
        }
      })
    );

    // Remove unhealthy connections
    for (const id of connectionsToRemove) {
      await this.removeConnection(id);
    }

    // Ensure minimum connections
    const currentConnections = this.connections.size;
    if (currentConnections < this.config.minConnections) {
      const needed = this.config.minConnections - currentConnections;
      console.log(`🔄 CONNECTION POOL: Creating ${needed} connections to maintain minimum for ${this.poolName}`);
      
      try {
        const promises = Array(needed).fill(null).map(() => this.createNewConnection());
        await Promise.all(promises);
      } catch (error) {
        console.error(`❌ CONNECTION POOL: Failed to maintain minimum connections:`, error);
      }
    }

    console.log(`💓 CONNECTION POOL: Health check completed for ${this.poolName} - ${this.connections.size} connections`);
  }

  /**
   * Get pool health status
   */
  async getHealth(): Promise<PoolHealth> {
    const errors: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check queue backlog
    if (this.queue.length > this.config.maxConnections / 2) {
      errors.push(`High queue backlog: ${this.queue.length} requests`);
      status = 'degraded';
    }

    // Check error rate
    const errorRate = this.metrics.totalErrors / Math.max(this.metrics.totalAcquired, 1);
    if (errorRate > 0.1) {
      errors.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
      status = 'unhealthy';
    }

    // Check connection availability
    if (this.metrics.idleConnections === 0 && this.queue.length > 0) {
      errors.push('No idle connections available');
      status = status === 'unhealthy' ? 'unhealthy' : 'degraded';
    }

    return {
      status,
      metrics: { ...this.metrics },
      lastHealthCheck: Date.now(),
      errors
    };
  }

  /**
   * Get detailed pool statistics
   */
  getStats(): ConnectionMetrics & {
    poolName: string;
    config: PoolConfig;
    connectionDetails: Array<{
      id: string;
      age: number;
      inUse: boolean;
      errorCount: number;
      totalUsage: number;
    }>;
  } {
    const connectionDetails = Array.from(this.connections.values()).map(conn => ({
      id: conn.id,
      age: Date.now() - conn.created,
      inUse: conn.inUse,
      errorCount: conn.errorCount,
      totalUsage: conn.totalUsage
    }));

    return {
      ...this.metrics,
      poolName: this.poolName,
      config: this.config,
      connectionDetails
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log(`🔄 CONNECTION POOL: Shutting down ${this.poolName}...`);
    
    // Stop health checking
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Reject all queued requests
    for (const request of this.queue) {
      clearTimeout(request.timeout);
      request.reject(new Error(`Pool ${this.poolName} is shutting down`));
    }
    this.queue.length = 0;

    // Close all connections
    const promises = Array.from(this.connections.keys()).map(id => this.removeConnection(id));
    await Promise.all(promises);

    console.log(`✅ CONNECTION POOL: ${this.poolName} shutdown complete`);
  }
}

/**
 * Connection Pool Manager - manages multiple pools
 */
export class ConnectionPoolManager {
  private pools = new Map<string, ConnectionPool<any>>();
  private db: IStorage;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    console.log('✅ CONNECTION POOL MANAGER: Initialized');
  }

  /**
   * Create HTTP/HTTPS agent pool
   */
  createHttpPool(name: string = 'http', config?: Partial<PoolConfig>): ConnectionPool<http.Agent | https.Agent> {
    const pool = new ConnectionPool(
      name,
      async () => {
        return new https.Agent({
          keepAlive: true,
          keepAliveMsecs: 30000,
          maxSockets: 50,
          maxFreeSockets: 10,
          timeout: 30000
        });
      },
      async (agent) => {
        return agent && typeof agent === 'object' && 'destroy' in agent;
      },
      async (agent) => {
        agent.destroy();
      },
      config
    );

    this.pools.set(name, pool);
    return pool;
  }

  /**
   * Create S3 client pool
   */
  createS3Pool(name: string = 's3', config?: Partial<PoolConfig>): ConnectionPool<any> {
    const pool = new ConnectionPool(
      name,
      async () => {
        // Return mock S3 client - replace with actual AWS SDK client
        return {
          config: { region: 'eu-west-1' },
          uploadPart: async () => ({ ETag: 'test' }),
          completeMultipartUpload: async () => ({ Location: 'test' }),
          headObject: async () => ({ ContentLength: 100 }),
          destroy: () => {}
        };
      },
      async (client) => {
        return client && typeof client.config === 'object';
      },
      async (client) => {
        if (client.destroy) client.destroy();
      },
      config
    );

    this.pools.set(name, pool);
    return pool;
  }

  /**
   * Get pool by name
   */
  getPool<T>(name: string): ConnectionPool<T> | undefined {
    return this.pools.get(name);
  }

  /**
   * Get all pool health statuses
   */
  async getAllHealth(): Promise<Record<string, PoolHealth>> {
    const health: Record<string, PoolHealth> = {};
    
    await Promise.all(
      Array.from(this.pools.entries()).map(async ([name, pool]) => {
        health[name] = await pool.getHealth();
      })
    );
    
    return health;
  }

  /**
   * Get comprehensive statistics
   */
  async getStats(): Promise<{
    totalPools: number;
    overallHealth: 'healthy' | 'degraded' | 'unhealthy';
    pools: Record<string, any>;
  }> {
    const poolStats: Record<string, any> = {};
    let unhealthyCount = 0;
    let degradedCount = 0;

    await Promise.all(
      Array.from(this.pools.entries()).map(async ([name, pool]) => {
        const health = await pool.getHealth();
        const stats = pool.getStats();
        
        poolStats[name] = {
          health: health.status,
          ...stats
        };

        if (health.status === 'unhealthy') unhealthyCount++;
        else if (health.status === 'degraded') degradedCount++;
      })
    );

    let overallHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
      overallHealth = 'unhealthy';
    } else if (degradedCount > 0) {
      overallHealth = 'degraded';
    }

    return {
      totalPools: this.pools.size,
      overallHealth,
      pools: poolStats
    };
  }

  /**
   * Shutdown all pools
   */
  async shutdown(): Promise<void> {
    console.log('🔄 CONNECTION POOL MANAGER: Shutting down all pools...');
    
    const promises = Array.from(this.pools.values()).map(pool => pool.shutdown());
    await Promise.all(promises);
    
    this.pools.clear();
    console.log('✅ CONNECTION POOL MANAGER: Shutdown complete');
  }
}

// Export singleton instance
export const connectionPoolManager = new ConnectionPoolManager();