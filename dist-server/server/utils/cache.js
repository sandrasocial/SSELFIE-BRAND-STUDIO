import { Logger } from './logger.js';
export class Cache {
    name;
    cache = new Map();
    logger;
    options;
    constructor(name, options = {}) {
        this.name = name;
        this.logger = new Logger(`Cache:${name}`);
        this.options = {
            ttl: options.ttl || 300,
            maxSize: options.maxSize || 1000,
            refreshThreshold: options.refreshThreshold || 60
        };
        this.startCleanup();
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            this.logger.debug(`Cache miss: ${key}`);
            return null;
        }
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            this.logger.debug(`Cache expired: ${key}`);
            return null;
        }
        item.accessCount++;
        item.lastAccessed = Date.now();
        this.logger.debug(`Cache hit: ${key} (access count: ${item.accessCount})`);
        return item.value;
    }
    set(key, value, ttl) {
        const now = Date.now();
        const expires = now + ((ttl || this.options.ttl) * 1000);
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
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.logger.debug(`Cache deleted: ${key}`);
        }
        return deleted;
    }
    clear() {
        this.cache.clear();
        this.logger.info(`Cache cleared: ${this.name}`);
    }
    getStats() {
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
    has(key) {
        const item = this.cache.get(key);
        return item ? Date.now() <= item.expires : false;
    }
    keys() {
        return Array.from(this.cache.keys());
    }
    evictLeastRecentlyUsed() {
        const items = Array.from(this.cache.entries());
        items.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        const toRemove = Math.ceil(items.length * 0.1);
        for (let i = 0; i < toRemove; i++) {
            this.cache.delete(items[i][0]);
        }
        this.logger.debug(`Evicted ${toRemove} LRU items from cache`);
    }
    startCleanup() {
        setInterval(() => {
            this.cleanup();
        }, 60000);
    }
    cleanup() {
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
export const userCache = new Cache('users', { ttl: 600, maxSize: 500 });
export const aiGenerationCache = new Cache('ai-generation', { ttl: 1800, maxSize: 200 });
export const staticDataCache = new Cache('static-data', { ttl: 3600, maxSize: 100 });
export function cached(cache, keyGenerator) {
    return function (target, propertyName, descriptor) {
        const method = descriptor.value;
        descriptor.value = async function (...args) {
            const key = keyGenerator ? keyGenerator(...args) : `${propertyName}:${JSON.stringify(args)}`;
            const cached = cache.get(key);
            if (cached !== null) {
                return cached;
            }
            const result = await method.apply(this, args);
            cache.set(key, result);
            return result;
        };
    };
}
export const cacheMiddleware = (cache, ttl) => {
    return (req, res, next) => {
        const key = `${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;
        const cached = cache.get(key);
        if (cached) {
            return res.json(cached);
        }
        const originalJson = res.json;
        res.json = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                cache.set(key, data, ttl);
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
//# sourceMappingURL=cache.js.map