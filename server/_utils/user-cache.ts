/**
 * Simple in-memory cache for user and model lookups
 * Reduces database load by caching frequent queries
 */

import { User, UserModel } from '../../shared/schema.js';

interface CacheEntry<T> {
  data: T | undefined;
  timestamp: number;
  expiresAt: number;
}

interface UserCacheEntry extends CacheEntry<User> {}
interface ModelCacheEntry extends CacheEntry<UserModel> {}

class UserCache {
  private userCache = new Map<string, UserCacheEntry>();
  private modelCache = new Map<string, ModelCacheEntry>();
  private readonly TTL = 30000; // 30 seconds cache
  private readonly MAX_SIZE = 500; // Max cache entries per type

  /**
   * Get user from cache if available and not expired
   */
  getUser(stackAuthId: string): User | undefined | null {
    const entry = this.userCache.get(stackAuthId);
    
    if (!entry) {
      return null; // Cache miss
    }
    
    if (Date.now() > entry.expiresAt) {
      this.userCache.delete(stackAuthId);
      return null; // Expired
    }
    
    return entry.data; // Cache hit
  }

  /**
   * Get model from cache if available and not expired
   */
  getModel(userId: string): UserModel | undefined | null {
    const entry = this.modelCache.get(userId);
    
    if (!entry) {
      return null; // Cache miss
    }
    
    if (Date.now() > entry.expiresAt) {
      this.modelCache.delete(userId);
      return null; // Expired
    }
    
    return entry.data; // Cache hit
  }

  /**
   * Store user in cache
   */
  setUser(stackAuthId: string, user: User | undefined): void {
    this.cleanupIfNeeded(this.userCache);

    const now = Date.now();
    this.userCache.set(stackAuthId, {
      data: user,
      timestamp: now,
      expiresAt: now + this.TTL
    });
  }

  /**
   * Store model in cache
   */
  setModel(userId: string, model: UserModel | undefined): void {
    this.cleanupIfNeeded(this.modelCache);

    const now = Date.now();
    this.modelCache.set(userId, {
      data: model,
      timestamp: now,
      expiresAt: now + this.TTL
    });
  }

  private cleanupIfNeeded<T>(cache: Map<string, CacheEntry<T>>): void {
    // Prevent cache from growing too large
    if (cache.size >= this.MAX_SIZE) {
      // Remove oldest entries
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 10% of entries
      const toRemove = Math.floor(this.MAX_SIZE * 0.1);
      for (let i = 0; i < toRemove; i++) {
        cache.delete(entries[i][0]);
      }
    }
  }

  /**
   * Legacy method - delegates to getUser
   */
  get(stackAuthId: string): User | undefined | null {
    return this.getUser(stackAuthId);
  }

  /**
   * Legacy method - delegates to setUser
   */
  set(stackAuthId: string, user: User | undefined): void {
    this.setUser(stackAuthId, user);
  }

  /**
   * Clear cache entry for a user (use when user data is updated)
   */
  invalidateUser(stackAuthId: string): void {
    this.userCache.delete(stackAuthId);
  }

  /**
   * Legacy method - delegates to invalidateUser
   */
  invalidate(stackAuthId: string): void {
    this.invalidateUser(stackAuthId);
  }

  /**
   * Clear cache entry for a model (use when model data is updated)
   */
  invalidateModel(userId: string): void {
    this.modelCache.delete(userId);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.userCache.clear();
    this.modelCache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { users: number; models: number; maxSize: number; ttlMs: number } {
    return {
      users: this.userCache.size,
      models: this.modelCache.size,
      maxSize: this.MAX_SIZE,
      ttlMs: this.TTL
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    
    // Cleanup user cache
    const usersToDelete: string[] = [];
    for (const [key, entry] of this.userCache.entries()) {
      if (now > entry.expiresAt) {
        usersToDelete.push(key);
      }
    }
    usersToDelete.forEach(key => this.userCache.delete(key));
    
    // Cleanup model cache
    const modelsToDelete: string[] = [];
    for (const [key, entry] of this.modelCache.entries()) {
      if (now > entry.expiresAt) {
        modelsToDelete.push(key);
      }
    }
    modelsToDelete.forEach(key => this.modelCache.delete(key));
  }
}

// Export singleton instance
export const userCache = new UserCache();

// Periodic cleanup (run every 60 seconds)
setInterval(() => {
  userCache.cleanup();
}, 60000);