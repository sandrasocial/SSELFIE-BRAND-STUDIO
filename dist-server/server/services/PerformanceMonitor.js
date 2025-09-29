export class PerformanceMonitor {
    static metrics = new Map();
    static MAX_METRICS_PER_KEY = 1000;
    static startTimer(key) {
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }
        const metrics = this.metrics.get(key);
        metrics.push({
            startTime: performance.now()
        });
        if (metrics.length > this.MAX_METRICS_PER_KEY) {
            metrics.shift();
        }
    }
    static endTimer(key) {
        const metrics = this.metrics.get(key);
        if (!metrics || metrics.length === 0) {
            console.warn(`No start time found for key: ${key}`);
            return;
        }
        const currentMetric = metrics[metrics.length - 1];
        currentMetric.endTime = performance.now();
        currentMetric.duration = currentMetric.endTime - currentMetric.startTime;
        if (currentMetric.duration > 1000) {
            console.warn(`Operation ${key} took ${currentMetric.duration}ms to complete`);
        }
    }
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
    static clearMetrics() {
        this.metrics.clear();
    }
}
//# sourceMappingURL=PerformanceMonitor.js.map