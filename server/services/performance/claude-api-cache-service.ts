/**
 * Claude API Cache Service
 * Response caching, request batching, and rate limit management for AI operations
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';
import { apiRetryService, type RetryResult } from './api-retry-service.js';
// Simple hash function for cache keys

export interface ClaudeConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
  rateLimitRpm: number; // requests per minute
  rateLimitTpm: number; // tokens per minute
  cacheDefaultTtlMs: number;
  batchDelayMs: number;
  maxBatchSize: number;
  enableCompression: boolean;
}

export interface ClaudeRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  cacheKey?: string;
  cacheTtlMs?: number;
  metadata?: Record<string, any>;
}

export interface ClaudeResponse {
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  model: string;
  stopReason: string;
  fromCache?: boolean;
  batchId?: string;
  processingTimeMs: number;
}

export interface BatchRequest {
  id: string;
  request: ClaudeRequest;
  resolve: (response: ClaudeResponse) => void;
  reject: (error: Error) => void;
  timestamp: number;
  estimatedTokens: number;
}

export interface RateLimitState {
  requestsThisMinute: number;
  tokensThisMinute: number;
  windowStart: number;
  queuedRequests: number;
  avgTokensPerRequest: number;
}

export interface CacheEntry {
  response: ClaudeResponse;
  expires: number;
  hits: number;
  lastAccessed: number;
  tokenCount: number;
}

/**
 * Production-grade Claude API service with caching and rate limiting
 */
export class ClaudeApiCacheService {
  private db: IStorage;
  private config: ClaudeConfig;
  private cache = new Map<string, CacheEntry>();
  private rateLimitState: RateLimitState;
  private batchQueue: BatchRequest[] = [];
  private batchTimer?: NodeJS.Timeout;
  private compressionCache = new Map<string, string>();

  constructor(db?: IStorage, config?: Partial<ClaudeConfig>) {
    this.db = db || getDatabase();
    
    this.config = {
      apiKey: process.env['ANTHROPIC_API_KEY'] || '',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-5-haiku-20241022',
      maxTokens: 8192,
      temperature: 0.7,
      rateLimitRpm: 1000, // 1000 requests per minute
      rateLimitTpm: 80000, // 80k tokens per minute
      cacheDefaultTtlMs: 300000, // 5 minutes
      batchDelayMs: 100, // 100ms batching delay
      maxBatchSize: 10,
      enableCompression: true,
      ...config
    };

    this.rateLimitState = {
      requestsThisMinute: 0,
      tokensThisMinute: 0,
      windowStart: Date.now(),
      queuedRequests: 0,
      avgTokensPerRequest: 2000 // Initial estimate
    };

    console.log('✅ CLAUDE API CACHE: Initialized with intelligent caching and rate limiting');
    
    // Start cleanup interval
    setInterval(() => this.cleanupCache(), 5 * 60 * 1000); // 5 minutes
    setInterval(() => this.resetRateLimitWindow(), 60 * 1000); // 1 minute
  }

  /**
   * Main API call with caching, batching, and rate limiting
   */
  async chat(request: ClaudeRequest): Promise<ClaudeResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🤖 CLAUDE API: Processing chat request');

      // Generate cache key
      const cacheKey = request.cacheKey || this.generateCacheKey(request);
      
      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log('💾 CLAUDE API: Cache hit');
        return {
          ...cached,
          fromCache: true,
          processingTimeMs: Date.now() - startTime
        };
      }

      // Check rate limits
      const estimatedTokens = this.estimateTokenCount(request);
      if (!this.canMakeRequest(estimatedTokens)) {
        // Queue for batching if rate limited
        return await this.queueForBatch(request, estimatedTokens);
      }

      // Make direct API call
      const response = await this.makeApiCall(request);
      
      // Cache successful response
      if (response.content) {
        this.setCache(cacheKey, response, request.cacheTtlMs || this.config.cacheDefaultTtlMs);
      }

      // Update rate limiting
      this.updateRateLimits(response.usage.totalTokens);

      return {
        ...response,
        processingTimeMs: Date.now() - startTime
      };

    } catch (error) {
      console.error('❌ CLAUDE API: Chat request failed:', error);
      throw new Error(`Claude API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Batch multiple requests together
   */
  async batchChat(requests: ClaudeRequest[]): Promise<ClaudeResponse[]> {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 CLAUDE API: Processing batch of ${requests.length} requests`);

      // Process cached requests first
      const results: (ClaudeResponse | null)[] = new Array(requests.length).fill(null);
      const uncachedRequests: { index: number; request: ClaudeRequest }[] = [];

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const cacheKey = request.cacheKey || this.generateCacheKey(request);
        const cached = this.getFromCache(cacheKey);
        
        if (cached) {
          results[i] = {
            ...cached,
            fromCache: true,
            processingTimeMs: Date.now() - startTime
          };
        } else {
          uncachedRequests.push({ index: i, request });
        }
      }

      console.log(`💾 CLAUDE API: ${results.filter(r => r !== null).length} cache hits, ${uncachedRequests.length} API calls needed`);

      // Process uncached requests with rate limiting
      for (const { index, request } of uncachedRequests) {
        const estimatedTokens = this.estimateTokenCount(request);
        
        if (this.canMakeRequest(estimatedTokens)) {
          const response = await this.makeApiCall(request);
          
          // Cache response
          const cacheKey = request.cacheKey || this.generateCacheKey(request);
          this.setCache(cacheKey, response, request.cacheTtlMs || this.config.cacheDefaultTtlMs);
          
          results[index] = {
            ...response,
            processingTimeMs: Date.now() - startTime
          };
          
          this.updateRateLimits(response.usage.totalTokens);
        } else {
          // Wait for rate limit window
          await this.waitForRateLimit();
          
          const response = await this.makeApiCall(request);
          const cacheKey = request.cacheKey || this.generateCacheKey(request);
          this.setCache(cacheKey, response, request.cacheTtlMs || this.config.cacheDefaultTtlMs);
          
          results[index] = {
            ...response,
            processingTimeMs: Date.now() - startTime
          };
          
          this.updateRateLimits(response.usage.totalTokens);
        }
      }

      return results as ClaudeResponse[];

    } catch (error) {
      console.error('❌ CLAUDE API: Batch request failed:', error);
      throw new Error(`Claude batch request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Make actual API call to Claude
   */
  private async makeApiCall(request: ClaudeRequest): Promise<ClaudeResponse> {
    const apiCall = {
      id: `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fn: async () => {
        const payload = {
          model: this.config.model,
          max_tokens: request.maxTokens || this.config.maxTokens,
          temperature: request.temperature !== undefined ? request.temperature : this.config.temperature,
          messages: request.messages,
          system: request.systemPrompt
        };

        const response = await fetch(`${this.config.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.config.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Claude API error (${response.status}): ${error}`);
        }

        const data = await response.json();
        
        return {
          content: data.content?.[0]?.text || '',
          usage: {
            inputTokens: data.usage?.input_tokens || 0,
            outputTokens: data.usage?.output_tokens || 0,
            totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
          },
          model: data.model,
          stopReason: data.stop_reason || 'unknown',
          processingTimeMs: 0
        };
      },
      cacheKey: `claude-api-${this.generateCacheKey(request)}`,
      cacheTtlMs: 60000 // 1 minute for API call caching
    };

    const result: RetryResult<ClaudeResponse> = await apiRetryService.executeWithRetry(apiCall);
    
    if (!result.success || !result.data) {
      throw result.error || new Error('Claude API call failed');
    }

    return result.data;
  }

  /**
   * Queue request for batch processing
   */
  private async queueForBatch(request: ClaudeRequest, estimatedTokens: number): Promise<ClaudeResponse> {
    return new Promise((resolve, reject) => {
      const batchRequest: BatchRequest = {
        id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        request,
        resolve,
        reject,
        timestamp: Date.now(),
        estimatedTokens
      };

      this.batchQueue.push(batchRequest);
      this.rateLimitState.queuedRequests = this.batchQueue.length;
      
      console.log(`⏳ CLAUDE API: Queued request (${this.batchQueue.length} in queue)`);

      // Start batch timer if not already running
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch();
        }, this.config.batchDelayMs);
      }
    });
  }

  /**
   * Process queued batch requests
   */
  private async processBatch(): Promise<void> {
    if (this.batchQueue.length === 0) {
      this.batchTimer = undefined;
      return;
    }

    console.log(`🔄 CLAUDE API: Processing batch of ${this.batchQueue.length} requests`);

    const batch = this.batchQueue.splice(0, this.config.maxBatchSize);
    this.rateLimitState.queuedRequests = this.batchQueue.length;
    const batchId = `batch-${Date.now()}`;

    // Process each request in the batch
    for (const batchRequest of batch) {
      try {
        if (this.canMakeRequest(batchRequest.estimatedTokens)) {
          const response = await this.makeApiCall(batchRequest.request);
          response.batchId = batchId;
          
          // Cache response
          const cacheKey = batchRequest.request.cacheKey || this.generateCacheKey(batchRequest.request);
          this.setCache(cacheKey, response, batchRequest.request.cacheTtlMs || this.config.cacheDefaultTtlMs);
          
          this.updateRateLimits(response.usage.totalTokens);
          batchRequest.resolve(response);
        } else {
          // Re-queue if still rate limited
          this.batchQueue.unshift(batchRequest);
        }
      } catch (error) {
        batchRequest.reject(error instanceof Error ? error : new Error('Batch processing failed'));
      }
    }

    // Schedule next batch if queue not empty
    if (this.batchQueue.length > 0) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, this.config.batchDelayMs);
    } else {
      this.batchTimer = undefined;
    }
  }

  /**
   * Rate limiting logic
   */
  private canMakeRequest(estimatedTokens: number): boolean {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.rateLimitState.windowStart >= 60000) {
      this.resetRateLimitWindow();
    }

    // Check both request and token limits
    const wouldExceedRequests = this.rateLimitState.requestsThisMinute >= this.config.rateLimitRpm;
    const wouldExceedTokens = (this.rateLimitState.tokensThisMinute + estimatedTokens) >= this.config.rateLimitTpm;

    return !wouldExceedRequests && !wouldExceedTokens;
  }

  private updateRateLimits(actualTokens: number): void {
    this.rateLimitState.requestsThisMinute++;
    this.rateLimitState.tokensThisMinute += actualTokens;
    
    // Update running average for token estimation
    this.rateLimitState.avgTokensPerRequest = 
      (this.rateLimitState.avgTokensPerRequest + actualTokens) / 2;
  }

  private resetRateLimitWindow(): void {
    this.rateLimitState.requestsThisMinute = 0;
    this.rateLimitState.tokensThisMinute = 0;
    this.rateLimitState.windowStart = Date.now();
    
    console.log('🔄 CLAUDE API: Rate limit window reset');
  }

  private async waitForRateLimit(): Promise<void> {
    const timeUntilReset = 60000 - (Date.now() - this.rateLimitState.windowStart);
    if (timeUntilReset > 0) {
      console.log(`⏱️ CLAUDE API: Waiting ${timeUntilReset}ms for rate limit reset`);
      await new Promise(resolve => setTimeout(resolve, Math.min(timeUntilReset, 5000)));
    }
  }

  /**
   * Cache management
   */
  private generateCacheKey(request: ClaudeRequest): string {
    const key = {
      messages: request.messages,
      maxTokens: request.maxTokens || this.config.maxTokens,
      temperature: request.temperature !== undefined ? request.temperature : this.config.temperature,
      systemPrompt: request.systemPrompt,
      model: this.config.model
    };
    
    // Simple hash function for cache keys
    const keyString = JSON.stringify(key);
    let hash = 0;
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return `claude-${Math.abs(hash).toString(16)}`;
  }

  private getFromCache(cacheKey: string): ClaudeResponse | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(cacheKey);
      return null;
    }
    
    entry.hits++;
    entry.lastAccessed = Date.now();
    return entry.response;
  }

  private setCache(cacheKey: string, response: ClaudeResponse, ttlMs: number): void {
    this.cache.set(cacheKey, {
      response,
      expires: Date.now() + ttlMs,
      hits: 0,
      lastAccessed: Date.now(),
      tokenCount: response.usage.totalTokens
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
      console.log(`🧹 CLAUDE API: Cleaned ${cleaned} expired cache entries`);
    }
  }

  /**
   * Token estimation
   */
  private estimateTokenCount(request: ClaudeRequest): number {
    // Simple token estimation: ~4 characters per token
    let totalChars = 0;
    
    for (const message of request.messages) {
      totalChars += message.content.length;
    }
    
    if (request.systemPrompt) {
      totalChars += request.systemPrompt.length;
    }
    
    // Add estimated output tokens
    const estimatedInputTokens = Math.ceil(totalChars / 4);
    const estimatedOutputTokens = request.maxTokens || this.config.maxTokens;
    
    return estimatedInputTokens + estimatedOutputTokens;
  }

  /**
   * Get service statistics
   */
  getStats(): {
    cache: {
      size: number;
      hitRate: number;
      totalTokensCached: number;
      averageHitsPerEntry: number;
    };
    rateLimiting: RateLimitState & {
      utilizationPercent: number;
      timeUntilReset: number;
    };
    batch: {
      queueSize: number;
      isProcessing: boolean;
      averageBatchSize: number;
    };
    performance: {
      totalRequests: number;
      cacheHits: number;
      apiCalls: number;
      averageResponseTime: number;
    };
  } {
    // Calculate cache metrics
    let totalHits = 0;
    let totalTokens = 0;
    
    this.cache.forEach((entry) => {
      totalHits += entry.hits;
      totalTokens += entry.tokenCount;
    });
    
    const hitRate = this.cache.size > 0 ? totalHits / this.cache.size : 0;

    // Rate limiting metrics
    const utilizationPercent = Math.max(
      (this.rateLimitState.requestsThisMinute / this.config.rateLimitRpm) * 100,
      (this.rateLimitState.tokensThisMinute / this.config.rateLimitTpm) * 100
    );
    
    const timeUntilReset = Math.max(0, 60000 - (Date.now() - this.rateLimitState.windowStart));

    return {
      cache: {
        size: this.cache.size,
        hitRate,
        totalTokensCached: totalTokens,
        averageHitsPerEntry: hitRate
      },
      rateLimiting: {
        ...this.rateLimitState,
        utilizationPercent,
        timeUntilReset
      },
      batch: {
        queueSize: this.batchQueue.length,
        isProcessing: !!this.batchTimer,
        averageBatchSize: Math.min(this.config.maxBatchSize, this.batchQueue.length)
      },
      performance: {
        totalRequests: this.rateLimitState.requestsThisMinute,
        cacheHits: Math.round(totalHits),
        apiCalls: this.rateLimitState.requestsThisMinute - Math.round(totalHits),
        averageResponseTime: 0 // Would need to track this separately
      }
    };
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    issues: string[];
    stats: {
      cache: {
        size: number;
        hitRate: number;
        totalTokensCached: number;
        averageHitsPerEntry: number;
      };
      rateLimiting: any;
      batch: {
        queueSize: number;
        isProcessing: boolean;
        averageBatchSize: number;
      };
    };
  }> {
    const stats = this.getStats();
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Check rate limiting pressure
    if (stats.rateLimiting.utilizationPercent > 90) {
      issues.push(`High rate limit utilization: ${stats.rateLimiting.utilizationPercent.toFixed(1)}%`);
      status = 'unhealthy';
    } else if (stats.rateLimiting.utilizationPercent > 70) {
      issues.push(`Moderate rate limit pressure: ${stats.rateLimiting.utilizationPercent.toFixed(1)}%`);
      status = status === 'healthy' ? 'degraded' : status;
    }

    // Check queue backlog
    if (stats.batch.queueSize > 50) {
      issues.push(`Large queue backlog: ${stats.batch.queueSize} requests`);
      status = 'unhealthy';
    } else if (stats.batch.queueSize > 20) {
      issues.push(`Growing queue: ${stats.batch.queueSize} requests`);
      status = status === 'healthy' ? 'degraded' : status;
    }

    // Check cache efficiency
    if (stats.cache.hitRate < 0.3 && stats.cache.size > 10) {
      issues.push(`Low cache hit rate: ${(stats.cache.hitRate * 100).toFixed(1)}%`);
      status = status === 'healthy' ? 'degraded' : status;
    }

    return { status, issues, stats };
  }

  /**
   * Clear cache and reset state
   */
  reset(): void {
    this.cache.clear();
    this.resetRateLimitWindow();
    
    // Clear batch queue
    for (const request of this.batchQueue) {
      request.reject(new Error('Service reset'));
    }
    this.batchQueue.length = 0;
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
    
    console.log('🔄 CLAUDE API: Service reset complete');
  }
}

// Export singleton instance
export const claudeApiCacheService = new ClaudeApiCacheService();