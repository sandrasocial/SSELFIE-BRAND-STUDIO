/**
 * API Retry Service
 * Provides resilient API calls with exponential backoff, circuit breaker, and deduplication
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  exponentialBase: number;
  jitterMs: number;
  timeoutMs: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeoutMs: number;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalTime: number;
  fromCache?: boolean;
  circuitBreakerTripped?: boolean;
}

export interface ApiCall<T> {
  id: string;
  fn: () => Promise<T>;
  config?: Partial<RetryConfig>;
  cacheKey?: string;
  cacheTtlMs?: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

interface CacheEntry<T> {
  data: T;
  expires: number;
  hits: number;
}

/**
 * Production-grade API retry service with circuit breaker and caching
 */
export class ApiRetryService {
  private db: IStorage;
  private defaultConfig: RetryConfig;
  private circuitBreakers = new Map<string, CircuitBreakerState>();
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(db?: IStorage, config?: Partial<RetryConfig>) {
    this.db = db || getDatabase();
    
    this.defaultConfig = {
      maxAttempts: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      exponentialBase: 2,
      jitterMs: 100,
      timeoutMs: 30000,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeoutMs: 60000,
      ...config
    };

    console.log('✅ API RETRY SERVICE: Initialized with resilience patterns');
    
    // Cleanup expired cache entries every 5 minutes
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000);
  }

  /**
   * Execute API call with retry logic, circuit breaker, and caching
   */
  async executeWithRetry<T>(apiCall: ApiCall<T>): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const config = { ...this.defaultConfig, ...apiCall.config };
    
    try {
      console.log(`🔄 API RETRY: Executing ${apiCall.id}`);

      // Check cache first
      if (apiCall.cacheKey) {
        const cached = this.getFromCache<T>(apiCall.cacheKey);
        if (cached) {
          console.log(`💾 API RETRY: Cache hit for ${apiCall.id}`);
          return {
            success: true,
            data: cached,
            attempts: 0,
            totalTime: Date.now() - startTime,
            fromCache: true
          };
        }
      }

      // Check for duplicate in-flight requests
      if (apiCall.cacheKey && this.pendingRequests.has(apiCall.cacheKey)) {
        console.log(`⏳ API RETRY: Deduplicating request ${apiCall.id}`);
        const result = await this.pendingRequests.get(apiCall.cacheKey)!;
        return {
          success: true,
          data: result,
          attempts: 0,
          totalTime: Date.now() - startTime,
          fromCache: true
        };
      }

      // Check circuit breaker
      if (config.enableCircuitBreaker && this.isCircuitBreakerOpen(apiCall.id)) {
        return {
          success: false,
          error: new Error(`Circuit breaker is open for ${apiCall.id}`),
          attempts: 0,
          totalTime: Date.now() - startTime,
          circuitBreakerTripped: true
        };
      }

      // Execute with retry logic
      const promise = this.executeWithRetryLoop(apiCall, config);
      
      // Store pending request for deduplication
      if (apiCall.cacheKey) {
        this.pendingRequests.set(apiCall.cacheKey, promise);
      }

      const result = await promise;

      // Cleanup pending request
      if (apiCall.cacheKey) {
        this.pendingRequests.delete(apiCall.cacheKey);
      }

      // Cache successful results
      if (result.success && apiCall.cacheKey && result.data) {
        this.setCache(apiCall.cacheKey, result.data, apiCall.cacheTtlMs || 300000); // 5min default
      }

      // Update circuit breaker on success
      if (result.success) {
        this.recordSuccess(apiCall.id);
      } else {
        this.recordFailure(apiCall.id);
      }

      return result;

    } catch (error) {
      console.error(`❌ API RETRY: Unexpected error in ${apiCall.id}:`, error);
      
      // Cleanup pending request
      if (apiCall.cacheKey) {
        this.pendingRequests.delete(apiCall.cacheKey);
      }
      
      this.recordFailure(apiCall.id);
      
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
        attempts: 0,
        totalTime: Date.now() - startTime
      };
    }
  }

  /**
   * Main retry loop with exponential backoff
   */
  private async executeWithRetryLoop<T>(
    apiCall: ApiCall<T>, 
    config: RetryConfig
  ): Promise<RetryResult<T>> {
    let lastError: Error | undefined;
    let attempts = 0;
    const startTime = Date.now();

    while (attempts < config.maxAttempts) {
      attempts++;
      
      try {
        console.log(`🚀 API RETRY: Attempt ${attempts}/${config.maxAttempts} for ${apiCall.id}`);
        
        // Set timeout for individual request
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), config.timeoutMs);
        });
        
        const result = await Promise.race([
          apiCall.fn(),
          timeoutPromise
        ]);

        console.log(`✅ API RETRY: Success on attempt ${attempts} for ${apiCall.id}`);
        
        return {
          success: true,
          data: result,
          attempts,
          totalTime: Date.now() - startTime
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        console.warn(`⚠️ API RETRY: Attempt ${attempts} failed for ${apiCall.id}:`, lastError.message);

        // Check if we should retry
        if (attempts >= config.maxAttempts || !this.shouldRetry(lastError)) {
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = Math.min(
          config.baseDelayMs * Math.pow(config.exponentialBase, attempts - 1),
          config.maxDelayMs
        ) + Math.random() * config.jitterMs;

        console.log(`⏱️ API RETRY: Waiting ${Math.round(delay)}ms before retry`);
        await this.sleep(delay);
      }
    }

    console.error(`❌ API RETRY: All attempts failed for ${apiCall.id}`);
    
    return {
      success: false,
      error: lastError,
      attempts,
      totalTime: Date.now() - startTime
    };
  }

  /**
   * Determine if error should trigger retry
   */
  private shouldRetry(error: Error): boolean {
    const retryableErrors = [
      'ECONNRESET',
      'ECONNREFUSED', 
      'ETIMEDOUT',
      'Request timeout',
      'Network error',
      'Rate limit exceeded'
    ];

    return retryableErrors.some(pattern => 
      error.message.includes(pattern) || 
      error.name.includes(pattern)
    );
  }

  /**
   * Circuit breaker management
   */
  private isCircuitBreakerOpen(id: string): boolean {
    const breaker = this.circuitBreakers.get(id);
    if (!breaker) return false;

    const now = Date.now();
    
    switch (breaker.state) {
      case 'closed':
        return false;
        
      case 'open':
        if (now - breaker.lastFailure > this.defaultConfig.circuitBreakerTimeoutMs) {
          breaker.state = 'half-open';
          console.log(`🔄 API RETRY: Circuit breaker half-open for ${id}`);
          return false;
        }
        return true;
        
      case 'half-open':
        return false;
        
      default:
        return false;
    }
  }

  private recordSuccess(id: string): void {
    const breaker = this.circuitBreakers.get(id);
    if (breaker) {
      breaker.failures = 0;
      breaker.state = 'closed';
      console.log(`✅ API RETRY: Circuit breaker closed for ${id}`);
    }
  }

  private recordFailure(id: string): void {
    let breaker = this.circuitBreakers.get(id);
    if (!breaker) {
      breaker = { failures: 0, lastFailure: 0, state: 'closed' };
      this.circuitBreakers.set(id, breaker);
    }

    breaker.failures++;
    breaker.lastFailure = Date.now();

    if (breaker.failures >= this.defaultConfig.circuitBreakerThreshold) {
      breaker.state = 'open';
      console.warn(`⚠️ API RETRY: Circuit breaker opened for ${id} (${breaker.failures} failures)`);
    }
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs,
      hits: 0
    });
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;
    
    this.cache.forEach((entry, key) => {
      if (now > entry.expires) {
        this.cache.delete(key);
        cleaned++;
      }
    });
    
    if (cleaned > 0) {
      console.log(`🧹 API RETRY: Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Utility methods
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service statistics
   */
  getStats(): {
    cacheSize: number;
    cacheHitRate: number;
    circuitBreakers: Array<{id: string; state: string; failures: number}>;
    pendingRequests: number;
  } {
    // Calculate cache hit rate
    let totalHits = 0;
    let totalEntries = 0;
    
    this.cache.forEach((entry) => {
      totalHits += entry.hits;
      totalEntries++;
    });
    
    const hitRate = totalEntries > 0 ? totalHits / totalEntries : 0;

    // Get circuit breaker states
    const breakers = Array.from(this.circuitBreakers.entries()).map(([id, breaker]) => ({
      id,
      state: breaker.state,
      failures: breaker.failures
    }));

    return {
      cacheSize: this.cache.size,
      cacheHitRate: hitRate,
      circuitBreakers: breakers,
      pendingRequests: this.pendingRequests.size
    };
  }

  /**
   * Reset circuit breakers and clear cache
   */
  reset(): void {
    this.circuitBreakers.clear();
    this.cache.clear();
    this.pendingRequests.clear();
    console.log('🔄 API RETRY: Service reset complete');
  }

  /**
   * Get service health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    stats: ReturnType<typeof this.getStats>;
    openCircuitBreakers: number;
  }> {
    const stats = this.getStats();
    const openBreakers = stats.circuitBreakers.filter(b => b.state === 'open').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (openBreakers > 3) {
      status = 'unhealthy';
    } else if (openBreakers > 0 || stats.cacheHitRate < 0.5) {
      status = 'degraded';
    }

    return {
      status,
      stats,
      openCircuitBreakers: openBreakers
    };
  }
}

// Export singleton instance
export const apiRetryService = new ApiRetryService();