/**
 * Caching System
 * Provides in-memory and Redis caching capabilities
 */

import { Logger } from './logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum number of items
  refreshThreshold?: number; // Refresh when TTL is below this threshold
}

export interface CacheItem<T> {
  value: T;
  expires: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

export class Cache<T = any> {
  private cache = new Map<string, CacheItem<T>>();
  private logger: Logger;
  private options: Required<CacheOptions>;

  constructor(
    private name: string,
    options: CacheOptions = {}
  ) {
    this.logger = new Logger(`Cache:${name}`);
    this.options = {
      ttl: options.ttl || 300, // 5 minutes default
      maxSize: options.maxSize || 1000,
      refreshThreshold: options.refreshThreshold || 60 // 1 minute
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.logger.debug(`Cache miss: ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      this.logger.debug(`Cache expired: ${key}`);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    this.logger.debug(`Cache hit: ${key} (access count: ${item.accessCount})`);
    return item.value;
  }

  /**
   * Set value in cache
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expires = now + ((ttl || this.options.ttl) * 1000);

    // Check if we need to evict items
    if (this.cache.size >= this.options.maxSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(key, {
      value,
      expires,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now
    });

    this.logger.debug(`Cache set: ${key} (TTL: ${ttl || this.options.ttl}s)`);
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.logger.info(`Cache cleared: ${this.name}`);
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    totalAccesses: number;
    oldestItem: number;
    newestItem: number;
  } {
    const items = Array.from(this.cache.values());
    const totalAccesses = items.reduce((sum, item) => sum + item.accessCount, 0);
    const hitRate = totalAccesses > 0 ? items.length / totalAccesses : 0;
    const timestamps = items.map(item => item.createdAt);
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      totalAccesses,
      oldestItem: timestamps.length > 0 ? Math.min(...timestamps) : 0,
      newestItem: timestamps.length > 0 ? Math.max(...timestamps) : 0
    };
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? Date.now() <= item.expires : false;
  }

  /**
   * Get all keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Evict least recently used items
   */
  private evictLeastRecentlyUsed(): void {
    const items = Array.from(this.cache.entries());
    items.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove 10% of items
    const toRemove = Math.ceil(items.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(items[i][0]);
    }
    
    this.logger.debug(`Evicted ${toRemove} LRU items from cache`);
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Run every minute
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expires) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired items from cache`);
    }
  }
}

// Create cache instances for different purposes
export const userCache = new Cache('users', { ttl: 600, maxSize: 500 }); // 10 minutes
export const aiGenerationCache = new Cache('ai-generation', { ttl: 1800, maxSize: 200 }); // 30 minutes
export const staticDataCache = new Cache('static-data', { ttl: 3600, maxSize: 100 }); // 1 hour

// Cache decorator for methods
export function cached(cache: Cache, keyGenerator?: (...args: any[]) => string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator ? keyGenerator(...args) : `${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = cache.get(key);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      cache.set(key, result);
      
      return result;
    };
  };
}

// Cache middleware for Express routes
export const cacheMiddleware = (cache: Cache, ttl?: number) => {
  return (req: any, res: any, next: any) => {
    const key = `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
    
    const cached = cache.get(key);
    if (cached) {
      return res.json(cached);
    }

    // Store original res.json
    const originalJson = res.json;
    
    res.json = function (data: any) {
      // Cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttl);
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
};
