import React from 'react';

/**
 * Performance Monitoring Utilities
 * Tracks Core Web Vitals and performance metrics
 */

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
  loadTime: number | null; // Page load time
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    loadTime: null
  };

  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.isInitialized = true;
    this.measureCoreWebVitals();
    this.measurePageLoadTime();
    this.measureResourceTiming();
  }

  private measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry;
          this.metrics.lcp = lastEntry.startTime;
          this.logMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP measurement not supported:', e);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.logMetric('FID', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID measurement not supported:', e);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.logMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS measurement not supported:', e);
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.logMetric('FCP', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (e) {
        console.warn('FCP measurement not supported:', e);
      }
    }
  }

  private measurePageLoadTime() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.metrics.loadTime = navigation.loadEventEnd - navigation.navigationStart;
        
        this.logMetric('TTFB', this.metrics.ttfb);
        this.logMetric('Load Time', this.metrics.loadTime);
      }
    });
  }

  private measureResourceTiming() {
    if (typeof window === 'undefined') return;

    // Monitor resource loading performance
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            // Log slow resources
            if (entry.duration > 1000) {
              console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource timing not supported:', e);
      }
    }
  }

  private logMetric(name: string, value: number) {
    const status = this.getMetricStatus(name, value);
    console.log(`📊 ${name}: ${value.toFixed(2)}ms ${status}`);
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(name, value);
    }
  }

  private getMetricStatus(name: string, value: number): string {
    const thresholds: { [key: string]: { good: number; needsImprovement: number } } = {
      'LCP': { good: 2500, needsImprovement: 4000 },
      'FID': { good: 100, needsImprovement: 300 },
      'CLS': { good: 0.1, needsImprovement: 0.25 },
      'FCP': { good: 1800, needsImprovement: 3000 },
      'TTFB': { good: 800, needsImprovement: 1800 },
      'Load Time': { good: 3000, needsImprovement: 5000 }
    };

    const threshold = thresholds[name];
    if (!threshold) return '';

    if (value <= threshold.good) return '✅ Good';
    if (value <= threshold.needsImprovement) return '⚠️ Needs Improvement';
    return '❌ Poor';
  }

  private sendToAnalytics(name: string, value: number) {
    // Send to your analytics service
    // Example: Google Analytics, Mixpanel, etc.
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        metric_rating: this.getMetricStatus(name, value).includes('Good') ? 'good' : 'poor'
      });
    }
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getPerformanceScore(): number {
    const metrics = this.getMetrics();
    let score = 0;
    let count = 0;

    // LCP Score (25% weight)
    if (metrics.lcp !== null) {
      score += metrics.lcp <= 2500 ? 25 : metrics.lcp <= 4000 ? 15 : 5;
      count++;
    }

    // FID Score (25% weight)
    if (metrics.fid !== null) {
      score += metrics.fid <= 100 ? 25 : metrics.fid <= 300 ? 15 : 5;
      count++;
    }

    // CLS Score (25% weight)
    if (metrics.cls !== null) {
      score += metrics.cls <= 0.1 ? 25 : metrics.cls <= 0.25 ? 15 : 5;
      count++;
    }

    // FCP Score (25% weight)
    if (metrics.fcp !== null) {
      score += metrics.fcp <= 1800 ? 25 : metrics.fcp <= 3000 ? 15 : 5;
      count++;
    }

    return count > 0 ? Math.round(score / count) : 0;
  }

  public cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>(performanceMonitor.getMetrics());
  const [score, setScore] = React.useState<number>(performanceMonitor.getPerformanceScore());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
      setScore(performanceMonitor.getPerformanceScore());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { metrics, score };
}

export default performanceMonitor;