import { Logger } from './logger.js';
export class CacheManager {
    logger;
    cache;
    options;
    accessOrder;
    constructor(options = {}) {
        this.logger = new Logger('CacheManager');
        this.cache = new Map();
        this.accessOrder = [];
        this.options = {
            ttl: options.ttl || 300000,
            maxSize: options.maxSize || 1000,
            strategy: options.strategy || 'lru'
        };
    }
    set(key, value, ttl) {
        const now = Date.now();
        const expiresAt = now + (ttl || this.options.ttl);
        const item = {
            value,
            expiresAt,
            createdAt: now,
            accessCount: 0,
            lastAccessed: now
        };
        this.cache.set(key, item);
        this.updateAccessOrder(key);
        if (this.cache.size > this.options.maxSize) {
            this.evictItems();
        }
        this.logger.debug(`Cache set: ${key} (TTL: ${ttl || this.options.ttl}ms)`);
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
            return null;
        }
        item.accessCount++;
        item.lastAccessed = Date.now();
        this.updateAccessOrder(key);
        return item.value;
    }
    has(key) {
        const item = this.cache.get(key);
        if (!item)
            return false;
        if (Date.now() > item.expiresAt) {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
            return false;
        }
        return true;
    }
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.removeFromAccessOrder(key);
            this.logger.debug(`Cache deleted: ${key}`);
        }
        return deleted;
    }
    clear() {
        this.cache.clear();
        this.accessOrder = [];
        this.logger.info('Cache cleared');
    }
    getStats() {
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
        const memoryUsage = this.cache.size * 1000;
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
    cleanup() {
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
    updateAccessOrder(key) {
        this.removeFromAccessOrder(key);
        this.accessOrder.push(key);
    }
    removeFromAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
    }
    evictItems() {
        const itemsToEvict = this.cache.size - this.options.maxSize;
        if (itemsToEvict <= 0)
            return;
        let keysToEvict = [];
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
    getLeastFrequentlyUsedKeys(count) {
        return Array.from(this.cache.entries())
            .sort((a, b) => a[1].accessCount - b[1].accessCount)
            .slice(0, count)
            .map(([key]) => key);
    }
    getOldestKeys(count) {
        return Array.from(this.cache.entries())
            .sort((a, b) => a[1].createdAt - b[1].createdAt)
            .slice(0, count)
            .map(([key]) => key);
    }
}
export class MultiLevelCacheManager {
    logger;
    levels;
    levelNames;
    constructor(levels) {
        this.logger = new Logger('MultiLevelCacheManager');
        this.levels = levels.map(level => new CacheManager(level.options));
        this.levelNames = levels.map(level => level.name);
    }
    get(key) {
        for (let i = 0; i < this.levels.length; i++) {
            const value = this.levels[i].get(key);
            if (value !== null) {
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
    set(key, value, ttl) {
        this.levels.forEach((level, index) => {
            level.set(key, value, ttl);
        });
        this.logger.debug(`Cache set in all ${this.levels.length} levels`);
    }
    delete(key) {
        let deleted = false;
        this.levels.forEach(level => {
            if (level.delete(key)) {
                deleted = true;
            }
        });
        return deleted;
    }
    clear() {
        this.levels.forEach(level => level.clear());
        this.logger.info('All cache levels cleared');
    }
    getStats() {
        return this.levels.map((level, index) => ({
            level: this.levelNames[index],
            stats: level.getStats()
        }));
    }
    cleanup() {
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
export const memoryCache = new CacheManager({
    ttl: 300000,
    maxSize: 1000,
    strategy: 'lru'
});
export const multiLevelCache = new MultiLevelCacheManager([
    { name: 'L1', options: { ttl: 60000, maxSize: 100, strategy: 'lru' } },
    { name: 'L2', options: { ttl: 300000, maxSize: 500, strategy: 'lru' } },
    { name: 'L3', options: { ttl: 1800000, maxSize: 1000, strategy: 'lfu' } }
]);
//# sourceMappingURL=cache-manager.js.map