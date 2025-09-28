// Client-side performance monitoring and route prefetching
import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

// Define metrics types
interface PerformanceMetrics {
  pageLoadTime?: number;
  timeToFirstByte?: number;
  timeToFirstPaint?: number;
  timeToFirstContentfulPaint?: number;
  timeToInteractive?: number;
  domContentLoaded?: number;
}

interface ResourceMetrics {
  name: string;
  initiatorType: string;
  duration: number;
  size?: number;
}

// Routes that should be prefetched
const PREFETCH_ROUTES = [
  '/maya',
  '/studio',
  '/gallery',
  '/settings'
];

// Helper to collect performance metrics
const collectPerformanceMetrics = (): PerformanceMetrics => {
  const metrics: PerformanceMetrics = {};
  
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    
    // Core metrics
    metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
    metrics.timeToFirstByte = timing.responseStart - timing.navigationStart;
    metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
    
    // Paint metrics
    const paintMetrics = window.performance.getEntriesByType('paint');
    paintMetrics.forEach(({ name, startTime }) => {
      if (name === 'first-paint') {
        metrics.timeToFirstPaint = startTime;
      } else if (name === 'first-contentful-paint') {
        metrics.timeToFirstContentfulPaint = startTime;
      }
    });
  }
  
  return metrics;
};

// Helper to collect resource metrics
const collectResourceMetrics = (): ResourceMetrics[] => {
  if (!window.performance || !window.performance.getEntriesByType) return [];
  
  return window.performance.getEntriesByType('resource').map(entry => ({
    name: entry.name,
    initiatorType: (entry as PerformanceResourceTiming).initiatorType || 'unknown',
    duration: entry.duration,
    size: (entry as PerformanceResourceTiming).transferSize
  }));
};

// Hook for performance monitoring and route prefetching
export const usePerformanceMonitoring = () => {
  const [, setLocation] = useLocation();
  
  // Prefetch routes
  const prefetchRoutes = useCallback(() => {
    PREFETCH_ROUTES.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }, []);

  // Report metrics
  const reportMetrics = useCallback(async () => {
    const metrics = collectPerformanceMetrics();
    const resourceMetrics = collectResourceMetrics();

    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics, resourceMetrics })
      });
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }, []);

  useEffect(() => {
    // Start prefetching after initial page load
    window.requestIdleCallback(() => {
      prefetchRoutes();
    });

    // Collect metrics when page is fully loaded
    window.addEventListener('load', () => {
      window.requestIdleCallback(() => {
        reportMetrics();
      });
    });
  }, [prefetchRoutes, reportMetrics]);

  return {
    prefetchRoutes,
    reportMetrics
  };
};