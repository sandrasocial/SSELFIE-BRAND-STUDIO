/**
 * PERFORMANCE MONITOR
 * Tracks performance metrics for memory and context operations
 */
export class PerformanceMonitor {
    static metrics = new Map();
    static MAX_METRICS_PER_KEY = 1000;
    /**
     * Start timing an operation
     */
    static startTimer(key) {
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }
        const metrics = this.metrics.get(key);
        metrics.push({
            startTime: performance.now()
        });
        // Cleanup old metrics if needed
        if (metrics.length > this.MAX_METRICS_PER_KEY) {
            metrics.shift();
        }
    }
    /**
     * End timing an operation
     */
    static endTimer(key) {
        const metrics = this.metrics.get(key);
        if (!metrics || metrics.length === 0) {
            console.warn(`No start time found for key: ${key}`);
            return;
        }
        const currentMetric = metrics[metrics.length - 1];
        currentMetric.endTime = performance.now();
        currentMetric.duration = currentMetric.endTime - currentMetric.startTime;
        // Alert if operation took too long
        if (currentMetric.duration > 1000) { // 1 second threshold
            console.warn(`Operation ${key} took ${currentMetric.duration}ms to complete`);
        }
    }
    /**
     * Get average duration for an operation
     */
    static getAverageDuration(key) {
        const metrics = this.metrics.get(key);
        if (!metrics || metrics.length === 0)
            return 0;
        const completedMetrics = metrics.filter(m => m.duration !== undefined);
        if (completedMetrics.length === 0)
            return 0;
        const total = completedMetrics.reduce((sum, metric) => sum + (metric.duration || 0), 0);
        return total / completedMetrics.length;
    }
    /**
     * Get performance report for all operations
     */
    static getPerformanceReport() {
        const report = {};
        for (const [key, metrics] of this.metrics.entries()) {
            const completedMetrics = metrics.filter(m => m.duration !== undefined);
            if (completedMetrics.length === 0)
                continue;
            const durations = completedMetrics.map(m => m.duration);
            report[key] = {
                average: this.getAverageDuration(key),
                min: Math.min(...durations),
                max: Math.max(...durations),
                count: completedMetrics.length
            };
        }
        return report;
    }
    /**
     * Clear all metrics
     */
    static clearMetrics() {
        this.metrics.clear();
    }
}
