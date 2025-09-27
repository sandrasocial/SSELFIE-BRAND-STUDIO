/**
 * Cache Manager
 * Multi-level caching system with TTL and invalidation
 */

import { Logger } from './logger';

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items
  strategy?: 'lru' | 'lfu' | 'fifo'; // Eviction strategy
}

export interface CacheItem<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

export class CacheManager<T = any> {
  private logger: Logger;
  private cache: Map<string, CacheItem<T>>;
  private options: Required<CacheOptions>;
  private accessOrder: string[];

  constructor(options: CacheOptions = {}) {
    this.logger = new Logger('CacheManager');
    this.cache = new Map();
    this.accessOrder = [];
    this.options = {
      ttl: options.ttl || 300000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      strategy: options.strategy || 'lru'
    };
  }

  /**
   * Set a cache item
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.options.ttl);
    
    const item: CacheItem<T> = {
      value,
      expiresAt,
      createdAt: now,
      accessCount: 0,
      lastAccessed: now
    };
    
    this.cache.set(key, item);
    this.updateAccessOrder(key);
    
    // Check if we need to evict items
    if (this.cache.size > this.options.maxSize) {
      this.evictItems();
    }
    
    this.logger.debug(`Cache set: ${key} (TTL: ${ttl || this.options.ttl}ms)`);
  }

  /**
   * Get a cache item
   */
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }
    
    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.updateAccessOrder(key);
    
    return item.value;
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if item has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete a cache item
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
      this.logger.debug(`Cache deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache items
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
    totalHits: number;
    totalMisses: number;
    memoryUsage: number;
    expiredItems: number;
  } {
    const now = Date.now();
    let expiredItems = 0;
    let totalHits = 0;
    let totalMisses = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        expiredItems++;
      }
      totalHits += item.accessCount;
    }
    
    const totalAccesses = totalHits + totalMisses;
    const hitRate = totalAccesses > 0 ? (totalHits / totalAccesses) * 100 : 0;
    const missRate = 100 - hitRate;
    
    // Estimate memory usage (rough calculation)
    const memoryUsage = this.cache.size * 1000; // Rough estimate
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate,
      missRate,
      totalHits,
      totalMisses,
      memoryUsage,
      expiredItems
    };
  }

  /**
   * Clean up expired items
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.logger.info(`Cleaned up ${cleanedCount} expired cache items`);
    }
    
    return cleanedCount;
  }

  /**
   * Update access order for LRU strategy
   */
  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Evict items based on strategy
   */
  private evictItems(): void {
    const itemsToEvict = this.cache.size - this.options.maxSize;
    
    if (itemsToEvict <= 0) return;
    
    let keysToEvict: string[] = [];
    
    switch (this.options.strategy) {
      case 'lru':
        keysToEvict = this.accessOrder.slice(0, itemsToEvict);
        break;
      case 'lfu':
        keysToEvict = this.getLeastFrequentlyUsedKeys(itemsToEvict);
        break;
      case 'fifo':
        keysToEvict = this.getOldestKeys(itemsToEvict);
        break;
    }
    
    keysToEvict.forEach(key => {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
    });
    
    this.logger.debug(`Evicted ${keysToEvict.length} cache items using ${this.options.strategy} strategy`);
  }

  /**
   * Get least frequently used keys
   */
  private getLeastFrequentlyUsedKeys(count: number): string[] {
    return Array.from(this.cache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)
      .slice(0, count)
      .map(([key]) => key);
  }

  /**
   * Get oldest keys
   */
  private getOldestKeys(count: number): string[] {
    return Array.from(this.cache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .slice(0, count)
      .map(([key]) => key);
  }
}

/**
 * Multi-level cache manager
 */
export class MultiLevelCacheManager<T = any> {
  private logger: Logger;
  private levels: CacheManager<T>[];
  private levelNames: string[];

  constructor(levels: Array<{ name: string; options: CacheOptions }>) {
    this.logger = new Logger('MultiLevelCacheManager');
    this.levels = levels.map(level => new CacheManager<T>(level.options));
    this.levelNames = levels.map(level => level.name);
  }

  /**
   * Get value from cache (check all levels)
   */
  get(key: string): T | null {
    for (let i = 0; i < this.levels.length; i++) {
      const value = this.levels[i].get(key);
      if (value !== null) {
        // Promote to higher levels
        for (let j = 0; j < i; j++) {
          this.levels[j].set(key, value);
        }
        this.logger.debug(`Cache hit at level ${i + 1} (${this.levelNames[i]})`);
        return value;
      }
    }
    
    this.logger.debug(`Cache miss for key: ${key}`);
    return null;
  }

  /**
   * Set value in all cache levels
   */
  set(key: string, value: T, ttl?: number): void {
    this.levels.forEach((level, index) => {
      level.set(key, value, ttl);
    });
    this.logger.debug(`Cache set in all ${this.levels.length} levels`);
  }

  /**
   * Delete value from all cache levels
   */
  delete(key: string): boolean {
    let deleted = false;
    this.levels.forEach(level => {
      if (level.delete(key)) {
        deleted = true;
      }
    });
    return deleted;
  }

  /**
   * Clear all cache levels
   */
  clear(): void {
    this.levels.forEach(level => level.clear());
    this.logger.info('All cache levels cleared');
  }

  /**
   * Get statistics for all levels
   */
  getStats(): Array<{ level: string; stats: any }> {
    return this.levels.map((level, index) => ({
      level: this.levelNames[index],
      stats: level.getStats()
    }));
  }

  /**
   * Cleanup all levels
   */
  cleanup(): number {
    let totalCleaned = 0;
    this.levels.forEach((level, index) => {
      const cleaned = level.cleanup();
      totalCleaned += cleaned;
      if (cleaned > 0) {
        this.logger.debug(`Level ${index + 1} (${this.levelNames[index]}) cleaned ${cleaned} items`);
      }
    });
    return totalCleaned;
  }
}

// Export singleton instances
export const memoryCache = new CacheManager({
  ttl: 300000, // 5 minutes
  maxSize: 1000,
  strategy: 'lru'
});

export const multiLevelCache = new MultiLevelCacheManager([
  { name: 'L1', options: { ttl: 60000, maxSize: 100, strategy: 'lru' } }, // 1 minute
  { name: 'L2', options: { ttl: 300000, maxSize: 500, strategy: 'lru' } }, // 5 minutes
  { name: 'L3', options: { ttl: 1800000, maxSize: 1000, strategy: 'lfu' } } // 30 minutes
]);
