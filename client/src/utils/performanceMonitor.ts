/**
 * Phase 4: Real-time Performance Monitoring System
 * Advanced performance tracking for SSELFIE Studio
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceThresholds {
  warning: number;
  critical: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private thresholds: Map<string, PerformanceThresholds> = new Map();
  private callbacks: Map<string, ((metric: PerformanceMetric) => void)[]> = new Map();

  constructor() {
    this.setupDefaultThresholds();
    this.initializeObservers();
  }

  private setupDefaultThresholds() {
    // Maya AI System thresholds
    this.thresholds.set('maya_response_time', { warning: 3000, critical: 5000 });
    this.thresholds.set('maya_generation_time', { warning: 30000, critical: 60000 });
    
    // Gallery performance thresholds
    this.thresholds.set('gallery_load_time', { warning: 2000, critical: 4000 });
    this.thresholds.set('image_load_time', { warning: 1000, critical: 3000 });
    
    // Core Web Vitals
    this.thresholds.set('LCP', { warning: 2500, critical: 4000 });
    this.thresholds.set('FID', { warning: 100, critical: 300 });
    this.thresholds.set('CLS', { warning: 0.1, critical: 0.25 });
    
    // Memory usage
    this.thresholds.set('memory_usage', { warning: 50, critical: 80 }); // Percentage
  }

  private initializeObservers() {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.recordMetric('page_load_time', entry.loadEventEnd - entry.loadEventStart);
              this.recordMetric('dom_content_loaded', (entry as PerformanceNavigationTiming).domContentLoadedEventEnd - (entry as PerformanceNavigationTiming).domContentLoadedEventStart);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (e) {
        console.warn('Navigation timing observer not supported');
      }

      // Long task detection
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.recordMetric('long_task', entry.duration, {
              startTime: entry.startTime,
              name: entry.name
            });
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (e) {
        console.warn('Long task observer not supported');
      }

      // Layout shift detection
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          list.getEntries().forEach((entry) => {
            if ((entry as any).hadRecentInput) return;
            clsValue += (entry as any).value;
          });
          if (clsValue > 0) {
            this.recordMetric('CLS', clsValue);
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('Layout shift observer not supported');
      }
    }

    // Memory monitoring
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = (performance as any).memory;
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        
        this.recordMetric('memory_usage', usagePercent, {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        });
      };

      // Check memory every 30 seconds
      const interval = setInterval(checkMemory, 30000);
      
      // Initial check
      checkMemory();

      // Cleanup
      window.addEventListener('beforeunload', () => {
        clearInterval(interval);
      });
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Check thresholds
    this.checkThresholds(metric);

    // Trigger callbacks
    this.triggerCallbacks(metric);
  }

  private checkThresholds(metric: PerformanceMetric) {
    const threshold = this.thresholds.get(metric.name);
    if (!threshold) return;

    if (metric.value > threshold.critical) {
      console.error(`🚨 CRITICAL: ${metric.name} (${metric.value}) exceeded critical threshold (${threshold.critical})`);
      this.reportPerformanceIssue(metric, 'critical');
    } else if (metric.value > threshold.warning) {
      console.warn(`⚠️ WARNING: ${metric.name} (${metric.value}) exceeded warning threshold (${threshold.warning})`);
      this.reportPerformanceIssue(metric, 'warning');
    }
  }

  private triggerCallbacks(metric: PerformanceMetric) {
    const callbacks = this.callbacks.get(metric.name) || [];
    callbacks.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.error('Error in performance callback:', error);
      }
    });
  }

  private reportPerformanceIssue(metric: PerformanceMetric, severity: 'warning' | 'critical') {
    // In production, this could send to analytics service
    const report = {
      metric: metric.name,
      value: metric.value,
      severity,
      timestamp: metric.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
      metadata: metric.metadata
    };

    // For now, just log. In production, send to monitoring service
    if (process.env.NODE_ENV === 'development') {
      console.table(report);
    }
  }

  // Maya-specific performance tracking
  trackMayaResponse(duration: number, success: boolean, metadata?: Record<string, any>) {
    this.recordMetric('maya_response_time', duration, {
      success,
      ...metadata
    });
  }

  trackMayaGeneration(duration: number, imageCount: number, success: boolean) {
    this.recordMetric('maya_generation_time', duration, {
      imageCount,
      success
    });
  }

  // Gallery-specific tracking
  trackGalleryLoad(duration: number, imageCount: number) {
    this.recordMetric('gallery_load_time', duration, {
      imageCount
    });
  }

  trackImageLoad(duration: number, imageSize?: number, format?: string) {
    this.recordMetric('image_load_time', duration, {
      imageSize,
      format
    });
  }

  // Get performance summary
  getPerformanceSummary(timeWindow: number = 300000): Record<string, any> {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      metric => now - metric.timestamp < timeWindow
    );

    const summary: Record<string, any> = {};

    // Group by metric name
    const metricGroups = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate statistics for each metric
    Object.entries(metricGroups).forEach(([name, values]) => {
      summary[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p95: this.calculatePercentile(values, 95)
      };
    });

    return summary;
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  // Subscribe to metric updates
  onMetric(metricName: string, callback: (metric: PerformanceMetric) => void) {
    if (!this.callbacks.has(metricName)) {
      this.callbacks.set(metricName, []);
    }
    this.callbacks.get(metricName)!.push(callback);
  }

  // Cleanup
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
    this.callbacks.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;