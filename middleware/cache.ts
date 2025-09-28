/**
 * Caching Middleware for Production Readiness
 * Implements caching strategies and cache invalidation
 */

import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  vary?: string[]; // Vary headers to consider
  private?: boolean; // Whether cache should be private
  maxAge?: number; // Max age in seconds
}

interface CacheEntry {
  data: any;
  headers: Record<string, string>;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 1000; // Maximum cache entries

  set(key: string, data: any, headers: Record<string, string>, ttl: number) {
    // Cleanup old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      headers,
      timestamp: Date.now(),
      ttl: ttl * 1000 // Convert to milliseconds
    });
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  private cleanup() {
    const now = Date.now();
    const toDelete: string[] = [];

    // Remove expired entries
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.cache.delete(key));

    // If still too many entries, remove oldest ones
    if (this.cache.size >= this.maxSize) {
      const entries: Array<[string, CacheEntry]> = [];
      this.cache.forEach((entry, key) => {
        entries.push([key, entry]);
      });
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2));
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats() {
    const entries: Array<{ key: string; timestamp: number; ttl: number; expired: boolean }> = [];
    this.cache.forEach((entry, key) => {
      entries.push({
        key,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        expired: Date.now() - entry.timestamp > entry.ttl
      });
    });

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries
    };
  }
}

// Global cache manager instance
const cacheManager = new CacheManager();

/**
 * Generate cache key from request
 */
function generateCacheKey(req: Request, vary: string[] = []): string {
  const baseKey = `${req.method}:${req.originalUrl || req.url}`;
  
  if (vary.length === 0) {
    return baseKey;
  }

  const varyParts = vary.map(header => {
    const value = req.get(header) || '';
    return `${header}:${value}`;
  }).join('|');

  return `${baseKey}|${varyParts}`;
}

/**
 * Cache middleware for GET requests
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    vary = [],
    private: isPrivate = false,
    maxAge = ttl
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = generateCacheKey(req, vary);
    const cached = cacheManager.get(cacheKey);

    if (cached) {
      // Set cached headers
      Object.entries(cached.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // Add cache hit header
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Key', cacheKey);
      
      return res.json(cached.data);
    }

    // Intercept response
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(data: any) {
      // Don't cache error responses
      if (res.statusCode >= 400) {
        return originalSend.call(this, data);
      }

      // Set cache headers
      const cacheControl = isPrivate ? 'private' : 'public';
      res.setHeader('Cache-Control', `${cacheControl}, max-age=${maxAge}`);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);

      // Store in cache
      const headers: Record<string, string> = {};
      res.getHeaderNames().forEach(name => {
        const value = res.getHeader(name);
        if (typeof value === 'string') {
          headers[name] = value;
        }
      });

      cacheManager.set(cacheKey, data, headers, ttl);

      return originalSend.call(this, data);
    };

    res.json = function(data: any) {
      // Don't cache error responses
      if (res.statusCode >= 400) {
        return originalJson.call(this, data);
      }

      // Set cache headers
      const cacheControl = isPrivate ? 'private' : 'public';
      res.setHeader('Cache-Control', `${cacheControl}, max-age=${maxAge}`);
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);

      // Store in cache
      const headers: Record<string, string> = {};
      res.getHeaderNames().forEach(name => {
        const value = res.getHeader(name);
        if (typeof value === 'string') {
          headers[name] = value;
        }
      });

      cacheManager.set(cacheKey, data, headers, ttl);

      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Cache invalidation middleware
 */
export function cacheInvalidation(patterns: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Invalidate cache on write operations
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      if (patterns.length === 0) {
        // Clear all cache if no patterns specified
        cacheManager.clear();
      } else {
        // Clear specific patterns
        patterns.forEach(pattern => {
          const regex = new RegExp(pattern);
          const stats = cacheManager.getStats();
          
          stats.entries.forEach(entry => {
            if (regex.test(entry.key)) {
              cacheManager.delete(entry.key);
            }
          });
        });
      }
    }

    next();
  };
}

/**
 * Cache statistics endpoint middleware
 */
export function cacheStats() {
  return (req: Request, res: Response) => {
    const stats = cacheManager.getStats();
    res.json({
      cache: stats,
      timestamp: new Date().toISOString()
    });
  };
}

/**
 * Static asset caching middleware
 */
export function staticAssetCache(maxAge: number = 31536000) { // 1 year default
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if request is for static assets
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot'];
    const isStaticAsset = staticExtensions.some(ext => req.url.endsWith(ext));

    if (isStaticAsset) {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
      res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
    }

    next();
  };
}

// Export cache manager for direct access
export { cacheManager };

// Default export with common cache configurations
export default {
  // Short cache for API responses
  api: cacheMiddleware({ ttl: 60, private: true }),
  
  // Medium cache for user data
  user: cacheMiddleware({ ttl: 300, private: true }),
  
  // Long cache for static content
  static: cacheMiddleware({ ttl: 3600, private: false }),
  
  // Very long cache for immutable assets
  immutable: staticAssetCache(31536000),
  
  // Cache invalidation
  invalidate: cacheInvalidation,
  
  // Cache statistics
  stats: cacheStats
};