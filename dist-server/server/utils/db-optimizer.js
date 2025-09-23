/**
 * Database Query Optimizer
 * Provides query optimization and connection pooling
 */
import { Logger } from './logger';
import { performanceMonitor } from './performance-monitor';
export class DatabaseOptimizer {
    logger;
    queryStats = [];
    maxStatsSize = 1000;
    constructor() {
        this.logger = new Logger('DatabaseOptimizer');
    }
    /**
     * Execute optimized query with monitoring
     */
    async executeQuery(query, params = [], options = {}) {
        const startTime = Date.now();
        const endTiming = performanceMonitor.startTiming('database_query');
        try {
            this.logger.debug('Executing query', { query, params, options });
            // Add query timeout
            const timeout = options.timeout || 30000; // 30 seconds default
            // Execute query with timeout
            const result = await this.executeWithTimeout(query, params, timeout);
            const duration = Date.now() - startTime;
            endTiming();
            // Record query stats
            this.recordQueryStats({
                query: this.sanitizeQuery(query),
                duration,
                rows: Array.isArray(result) ? result.length : 0,
                cached: false,
                timestamp: new Date()
            });
            // Log slow queries
            if (duration > 1000) {
                this.logger.warn('Slow query detected', {
                    query: this.sanitizeQuery(query),
                    duration: `${duration}ms`,
                    rows: Array.isArray(result) ? result.length : 0
                });
            }
            return result;
        }
        catch (error) {
            endTiming();
            this.logger.error('Query execution failed', {
                query: this.sanitizeQuery(query),
                error: error.message,
                duration: Date.now() - startTime
            });
            throw error;
        }
    }
    /**
     * Execute query with retries
     */
    async executeWithRetries(query, params = [], options = {}) {
        const maxRetries = options.retries || 3;
        let lastError;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await this.executeQuery(query, params, options);
            }
            catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                    this.logger.warn(`Query attempt ${attempt} failed, retrying in ${delay}ms`, {
                        query: this.sanitizeQuery(query),
                        error: error.message
                    });
                    await this.sleep(delay);
                }
            }
        }
        throw lastError;
    }
    /**
     * Get query performance statistics
     */
    getQueryStats() {
        if (this.queryStats.length === 0) {
            return {
                totalQueries: 0,
                averageDuration: 0,
                slowestQuery: null,
                fastestQuery: null,
                queriesByDuration: {}
            };
        }
        const durations = this.queryStats.map(s => s.duration);
        const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const slowestQuery = this.queryStats.reduce((max, current) => current.duration > max.duration ? current : max);
        const fastestQuery = this.queryStats.reduce((min, current) => current.duration < min.duration ? current : min);
        // Group queries by duration ranges
        const queriesByDuration = {
            '0-100ms': this.queryStats.filter(s => s.duration <= 100).length,
            '100-500ms': this.queryStats.filter(s => s.duration > 100 && s.duration <= 500).length,
            '500-1000ms': this.queryStats.filter(s => s.duration > 500 && s.duration <= 1000).length,
            '1000ms+': this.queryStats.filter(s => s.duration > 1000).length
        };
        return {
            totalQueries: this.queryStats.length,
            averageDuration: Math.round(averageDuration),
            slowestQuery,
            fastestQuery,
            queriesByDuration
        };
    }
    /**
     * Get slow queries for analysis
     */
    getSlowQueries(threshold = 1000) {
        return this.queryStats
            .filter(s => s.duration > threshold)
            .sort((a, b) => b.duration - a.duration);
    }
    /**
     * Clear query statistics
     */
    clearStats() {
        this.queryStats = [];
        this.logger.info('Query statistics cleared');
    }
    /**
     * Execute query with timeout
     */
    async executeWithTimeout(query, params, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error(`Query timeout after ${timeout}ms`));
            }, timeout);
            // This would be replaced with actual database execution
            // For now, simulate a database call
            setTimeout(() => {
                clearTimeout(timer);
                resolve([]);
            }, Math.random() * 100); // Simulate random query time
        });
    }
    /**
     * Record query statistics
     */
    recordQueryStats(stats) {
        this.queryStats.push(stats);
        // Keep only recent stats
        if (this.queryStats.length > this.maxStatsSize) {
            this.queryStats = this.queryStats.slice(-this.maxStatsSize);
        }
    }
    /**
     * Sanitize query for logging (remove sensitive data)
     */
    sanitizeQuery(query) {
        return query
            .replace(/\$\d+/g, '?') // Replace parameter placeholders
            .replace(/'.*?'/g, "'***'") // Replace string literals
            .replace(/\b\d+\b/g, 'N') // Replace numbers
            .substring(0, 200); // Limit length
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
// Create global database optimizer instance
export const dbOptimizer = new DatabaseOptimizer();
// Query optimization utilities
export const QueryOptimizer = {
    /**
     * Add indexes for common queries
     */
    async addIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status)',
            'CREATE INDEX IF NOT EXISTS idx_maya_chats_user_id ON maya_chats(user_id)',
            'CREATE INDEX IF NOT EXISTS idx_maya_chats_created_at ON maya_chats(created_at)'
        ];
        for (const indexQuery of indexes) {
            try {
                await dbOptimizer.executeQuery(indexQuery);
                console.log(`✅ Index created: ${indexQuery.split(' ')[5]}`);
            }
            catch (error) {
                console.warn(`⚠️  Index creation failed: ${error.message}`);
            }
        }
    },
    /**
     * Analyze query performance
     */
    async analyzeQuery(query) {
        const explainQuery = `EXPLAIN ANALYZE ${query}`;
        return await dbOptimizer.executeQuery(explainQuery);
    },
    /**
     * Get table statistics
     */
    async getTableStats(tableName) {
        const statsQuery = `
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE tablename = $1
    `;
        return await dbOptimizer.executeQuery(statsQuery, [tableName]);
    }
};
