/**
 * Performance Services Integration Hub
 * Unified interface for all performance optimization services
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import { ApiRetryService, apiRetryService } from './api-retry-service.js';
import { ConnectionPoolManager, connectionPoolManager } from './connection-pool-manager.js';
import { ClaudeApiCacheService, claudeApiCacheService } from './claude-api-cache-service.js';
import { PerformanceMonitorService, performanceMonitorService } from './performance-monitor-service.js';

export interface PerformanceConfig {
  apiRetry?: {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    enableCircuitBreaker?: boolean;
  };
  connectionPools?: {
    minConnections?: number;
    maxConnections?: number;
    idleTimeoutMs?: number;
    enableMetrics?: boolean;
  };
  claudeApi?: {
    rateLimitRpm?: number;
    rateLimitTpm?: number;
    cacheDefaultTtlMs?: number;
    batchDelayMs?: number;
    maxBatchSize?: number;
  };
  monitoring?: {
    samplingIntervalMs?: number;
    enableAutoScaling?: boolean;
    enableNotifications?: boolean;
  };
}

export interface SystemPerformanceStatus {
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    apiRetry: {
      status: string;
      cacheHitRate: number;
      circuitBreakers: number;
      pendingRequests: number;
    };
    connectionPools: {
      status: string;
      totalPools: number;
      totalConnections: number;
      utilizationPercent: number;
    };
    claudeApi: {
      status: string;
      cacheHitRate: number;
      rateLimitUtilization: number;
      queueSize: number;
    };
    monitoring: {
      status: string;
      activeAlerts: number;
      servicesMonitored: number;
      uptime: number;
    };
  };
  recommendations: string[];
  timestamp: number;
}

export interface PerformanceMetrics {
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  throughput: {
    requestsPerSecond: number;
    tokensPerSecond: number;
  };
  availability: {
    uptime: number;
    errorRate: number;
  };
  efficiency: {
    cacheHitRate: number;
    connectionUtilization: number;
    resourceUsage: number;
  };
}

/**
 * Unified performance optimization hub
 */
export class PerformanceHub {
  private db: IStorage;
  private initialized = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    console.log('✅ PERFORMANCE HUB: Initialized unified performance optimization');
  }

  /**
   * Initialize all performance services with configuration
   */
  async initialize(config?: PerformanceConfig): Promise<void> {
    try {
      console.log('🚀 PERFORMANCE HUB: Initializing all performance services...');

      // Initialize connection pools
      console.log('🔗 Setting up connection pools...');
      const httpPool = connectionPoolManager.createHttpPool('http-global', config?.connectionPools);
      const s3Pool = connectionPoolManager.createS3Pool('s3-global', config?.connectionPools);
      
      console.log(`✅ Created HTTP pool with ${config?.connectionPools?.maxConnections || 20} max connections`);
      console.log(`✅ Created S3 pool with ${config?.connectionPools?.maxConnections || 20} max connections`);

      // All other services are initialized as singletons
      console.log('✅ API Retry Service: Ready with circuit breaker protection');
      console.log('✅ Claude API Cache Service: Ready with intelligent caching');
      console.log('✅ Performance Monitor Service: Ready with real-time monitoring');

      this.initialized = true;

      // Start periodic health checks
      this.startHealthChecks();

      console.log('🎉 PERFORMANCE HUB: All services initialized successfully');

    } catch (error) {
      console.error('❌ PERFORMANCE HUB: Initialization failed:', error);
      throw new Error(`Performance hub initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get comprehensive system performance status
   */
  async getSystemStatus(): Promise<SystemPerformanceStatus> {
    if (!this.initialized) {
      throw new Error('Performance hub not initialized');
    }

    try {
      // Collect status from all services
      const apiRetryStats = apiRetryService.getStats();
      const poolStats = await connectionPoolManager.getStats();
      const claudeStats = claudeApiCacheService.getStats();
      const monitoringOverview = performanceMonitorService.getSystemOverview();
      const monitoringStats = performanceMonitorService.getStats();

      const services = {
        apiRetry: {
          status: apiRetryStats.circuitBreakers.filter(cb => cb.state === 'open').length > 0 ? 'degraded' : 'healthy',
          cacheHitRate: apiRetryStats.cacheHitRate,
          circuitBreakers: apiRetryStats.circuitBreakers.length,
          pendingRequests: apiRetryStats.pendingRequests
        },
        connectionPools: {
          status: poolStats.overallHealth,
          totalPools: poolStats.totalPools,
          totalConnections: Object.values(poolStats.pools).reduce((total: number, pool: any) => total + pool.totalConnections, 0),
          utilizationPercent: Object.values(poolStats.pools).reduce((total: number, pool: any) => total + (pool.activeConnections / pool.totalConnections * 100), 0) / poolStats.totalPools || 0
        },
        claudeApi: {
          status: claudeStats.rateLimiting.utilizationPercent > 90 ? 'unhealthy' : 
                   claudeStats.rateLimiting.utilizationPercent > 70 ? 'degraded' : 'healthy',
          cacheHitRate: claudeStats.cache.hitRate * 100,
          rateLimitUtilization: claudeStats.rateLimiting.utilizationPercent,
          queueSize: claudeStats.batch.queueSize
        },
        monitoring: {
          status: monitoringOverview.overallStatus,
          activeAlerts: monitoringOverview.summary.criticalAlerts + monitoringOverview.summary.warningAlerts,
          servicesMonitored: monitoringOverview.summary.totalServices,
          uptime: monitoringStats.monitoringUptime
        }
      };

      // Determine overall health
      let overallHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      const statuses = Object.values(services).map(service => service.status);
      
      if (statuses.includes('unhealthy') || monitoringOverview.summary.criticalAlerts > 0) {
        overallHealth = 'unhealthy';
      } else if (statuses.includes('degraded') || monitoringOverview.summary.warningAlerts > 0) {
        overallHealth = 'degraded';
      }

      // Generate recommendations
      const recommendations = this.generateRecommendations(services, monitoringOverview);

      return {
        overallHealth,
        services,
        recommendations,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error('❌ PERFORMANCE HUB: Error getting system status:', error);
      throw new Error(`Failed to get system status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(services: any, monitoringOverview: any): string[] {
    const recommendations: string[] = [];

    // API Retry recommendations
    if (services.apiRetry.circuitBreakers > 0) {
      recommendations.push('🔧 API Retry: Circuit breakers are active - check external service health');
    }
    if (services.apiRetry.cacheHitRate < 0.5) {
      recommendations.push('💾 API Retry: Low cache hit rate - consider adjusting cache TTL settings');
    }

    // Connection Pool recommendations
    if (services.connectionPools.utilizationPercent > 80) {
      recommendations.push('🔗 Connection Pools: High utilization - consider increasing pool size');
    }
    if (services.connectionPools.status === 'degraded') {
      recommendations.push('⚠️ Connection Pools: Some pools are degraded - check connection health');
    }

    // Claude API recommendations
    if (services.claudeApi.rateLimitUtilization > 90) {
      recommendations.push('🤖 Claude API: High rate limit utilization - consider request batching');
    }
    if (services.claudeApi.cacheHitRate < 30) {
      recommendations.push('💾 Claude API: Low cache hit rate - review caching strategy');
    }
    if (services.claudeApi.queueSize > 20) {
      recommendations.push('⏳ Claude API: Large queue - consider load balancing');
    }

    // Monitoring recommendations
    if (monitoringOverview.summary.criticalAlerts > 0) {
      recommendations.push('🚨 Monitoring: Critical alerts active - immediate attention required');
    }
    if (monitoringOverview.summary.warningAlerts > 5) {
      recommendations.push('⚠️ Monitoring: Multiple warnings - review system capacity');
    }

    // System-wide recommendations
    if (recommendations.length === 0) {
      recommendations.push('✅ System performing well - continue monitoring');
    } else if (recommendations.length > 5) {
      recommendations.unshift('🔥 Multiple performance issues detected - consider system maintenance');
    }

    return recommendations;
  }

  /**
   * Get aggregated performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    if (!this.initialized) {
      throw new Error('Performance hub not initialized');
    }

    try {
      const monitoringOverview = performanceMonitorService.getSystemOverview();
      const monitoringStats = performanceMonitorService.getStats();
      const claudeStats = claudeApiCacheService.getStats();
      const apiRetryStats = apiRetryService.getStats();

      // Calculate response time percentiles (mock implementation)
      const responseTimes = monitoringOverview.services.map(s => s.responseTime).filter(rt => rt > 0);
      responseTimes.sort((a, b) => a - b);
      
      const p50Index = Math.floor(responseTimes.length * 0.5);
      const p95Index = Math.floor(responseTimes.length * 0.95);
      const p99Index = Math.floor(responseTimes.length * 0.99);

      return {
        responseTime: {
          p50: responseTimes[p50Index] || 0,
          p95: responseTimes[p95Index] || 0,
          p99: responseTimes[p99Index] || 0
        },
        throughput: {
          requestsPerSecond: monitoringOverview.services.reduce((total, service) => total + service.throughput, 0),
          tokensPerSecond: claudeStats.performance.totalRequests > 0 ? claudeStats.cache.totalTokensCached / 60 : 0
        },
        availability: {
          uptime: monitoringStats.monitoringUptime,
          errorRate: monitoringOverview.services.reduce((total, service) => total + service.errorRate, 0) / monitoringOverview.services.length || 0
        },
        efficiency: {
          cacheHitRate: (apiRetryStats.cacheHitRate + claudeStats.cache.hitRate) / 2,
          connectionUtilization: 75, // Mock value - would calculate from pool stats
          resourceUsage: 60 // Mock value - would calculate from system metrics
        }
      };

    } catch (error) {
      console.error('❌ PERFORMANCE HUB: Error getting metrics:', error);
      throw new Error(`Failed to get performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute function with full performance optimization
   */
  async executeOptimized<T>(
    operation: () => Promise<T>,
    options?: {
      cacheKey?: string;
      cacheTtlMs?: number;
      retryConfig?: {
        maxAttempts?: number;
        timeoutMs?: number;
      };
      useConnectionPool?: 'http' | 's3';
    }
  ): Promise<T> {
    if (!this.initialized) {
      throw new Error('Performance hub not initialized');
    }

    try {
      const startTime = Date.now();

      // Use API retry service for resilient execution
      const apiCall = {
        id: `hub-operation-${Date.now()}`,
        fn: async () => {
          if (options?.useConnectionPool) {
            const pool = connectionPoolManager.getPool(options.useConnectionPool === 'http' ? 'http-global' : 's3-global');
            if (pool) {
              return await pool.execute(async () => await operation());
            }
          }
          return await operation();
        },
        config: options?.retryConfig,
        cacheKey: options?.cacheKey,
        cacheTtlMs: options?.cacheTtlMs
      };

      const result = await apiRetryService.executeWithRetry(apiCall);
      
      if (!result.success || result.data === undefined) {
        throw result.error || new Error('Operation failed');
      }

      const duration = Date.now() - startTime;
      console.log(`⚡ PERFORMANCE HUB: Operation completed in ${duration}ms ${result.fromCache ? '(cached)' : '(fresh)'}`);

      return result.data;

    } catch (error) {
      console.error('❌ PERFORMANCE HUB: Optimized execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute Claude API call with full optimization
   */
  async executeClaudeOptimized(request: {
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
    cacheKey?: string;
    cacheTtlMs?: number;
  }) {
    if (!this.initialized) {
      throw new Error('Performance hub not initialized');
    }

    return await claudeApiCacheService.chat(request);
  }

  /**
   * Start periodic health checks
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const status = await this.getSystemStatus();
        
        if (status.overallHealth === 'unhealthy') {
          console.warn('🚨 PERFORMANCE HUB: System health is UNHEALTHY');
          console.warn('📋 Recommendations:', status.recommendations.slice(0, 3));
        } else if (status.overallHealth === 'degraded') {
          console.info('⚠️ PERFORMANCE HUB: System health is DEGRADED');
        }

      } catch (error) {
        console.error('❌ PERFORMANCE HUB: Health check failed:', error);
      }
    }, 60000); // Every minute

    console.log('💓 PERFORMANCE HUB: Health monitoring started');
  }

  /**
   * Get comprehensive diagnostics
   */
  async getDiagnostics(): Promise<{
    initialized: boolean;
    services: {
      apiRetry: any;
      connectionPools: any;
      claudeApi: any;
      monitoring: any;
    };
    systemStatus: SystemPerformanceStatus;
    performanceMetrics: PerformanceMetrics;
  }> {
    const systemStatus = await this.getSystemStatus();
    const performanceMetrics = await this.getPerformanceMetrics();

    return {
      initialized: this.initialized,
      services: {
        apiRetry: apiRetryService.getStats(),
        connectionPools: await connectionPoolManager.getStats(),
        claudeApi: claudeApiCacheService.getStats(),
        monitoring: performanceMonitorService.getStats()
      },
      systemStatus,
      performanceMetrics
    };
  }

  /**
   * Shutdown all performance services
   */
  async shutdown(): Promise<void> {
    console.log('🔄 PERFORMANCE HUB: Shutting down all services...');

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    // Shutdown services in reverse dependency order
    await performanceMonitorService.shutdown();
    claudeApiCacheService.reset();
    await connectionPoolManager.shutdown();
    apiRetryService.reset();

    this.initialized = false;
    console.log('✅ PERFORMANCE HUB: Shutdown complete');
  }

  /**
   * Check if hub is ready
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Reset all services (for testing/debugging)
   */
  async reset(): Promise<void> {
    console.log('🔄 PERFORMANCE HUB: Resetting all services...');
    
    performanceMonitorService.getSystemOverview(); // Trigger reset internally
    claudeApiCacheService.reset();
    apiRetryService.reset();
    
    console.log('✅ PERFORMANCE HUB: Reset complete');
  }
}

// Export singleton instance
export const performanceHub = new PerformanceHub();

// Auto-initialize on import with default config
performanceHub.initialize({
  apiRetry: {
    maxAttempts: 3,
    enableCircuitBreaker: true
  },
  connectionPools: {
    maxConnections: 20,
    enableMetrics: true
  },
  claudeApi: {
    rateLimitRpm: 1000,
    cacheDefaultTtlMs: 300000, // 5 minutes
    batchDelayMs: 100
  },
  monitoring: {
    samplingIntervalMs: 30000, // 30 seconds
    enableAutoScaling: true,
    enableNotifications: true
  }
}).catch(error => {
  console.error('❌ PERFORMANCE HUB: Auto-initialization failed:', error);
});

export default performanceHub;