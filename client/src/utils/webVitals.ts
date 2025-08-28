/**
 * Phase 4: Web Vitals and Runtime Performance Monitoring
 * SSELFIE Studio Performance Tracking
 */

interface PerformanceEntry {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

interface WebVitalsMetric {
  name: string;
  value: number;
  delta: number;
  id: string;
  entries: PerformanceEntry[];
}

// Performance thresholds for SSELFIE Studio
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Custom metrics for Maya AI system
  MAYA_RESPONSE: 3000,     // Maya chat response time
  GENERATION_START: 5000,  // Image generation initiation
  GALLERY_LOAD: 2000,      // Gallery page load time
  TRAINING_UPLOAD: 10000,  // Training image upload
};

let performanceData: Record<string, number[]> = {};

// Track performance metrics
export const trackPerformance = (metric: string, value: number) => {
  if (!performanceData[metric]) {
    performanceData[metric] = [];
  }
  performanceData[metric].push(value);
  
  // Log performance issues in development
  if (process.env.NODE_ENV === 'development') {
    const threshold = PERFORMANCE_THRESHOLDS[metric as keyof typeof PERFORMANCE_THRESHOLDS];
    if (threshold && value > threshold) {
      console.warn(`⚠️ Performance Warning: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`);
    }
  }
};

// Maya-specific performance tracking
export const trackMayaPerformance = {
  chatStart: () => performance.mark('maya-chat-start'),
  chatEnd: () => {
    performance.mark('maya-chat-end');
    performance.measure('maya-chat-duration', 'maya-chat-start', 'maya-chat-end');
    const measure = performance.getEntriesByName('maya-chat-duration')[0];
    if (measure) {
      trackPerformance('MAYA_RESPONSE', measure.duration);
    }
  },
  
  generationStart: () => performance.mark('maya-generation-start'),
  generationEnd: () => {
    performance.mark('maya-generation-end');
    performance.measure('maya-generation-duration', 'maya-generation-start', 'maya-generation-end');
    const measure = performance.getEntriesByName('maya-generation-duration')[0];
    if (measure) {
      trackPerformance('GENERATION_START', measure.duration);
    }
  }
};

// Gallery performance tracking
export const trackGalleryPerformance = {
  loadStart: () => performance.mark('gallery-load-start'),
  loadEnd: () => {
    performance.mark('gallery-load-end');
    performance.measure('gallery-load-duration', 'gallery-load-start', 'gallery-load-end');
    const measure = performance.getEntriesByName('gallery-load-duration')[0];
    if (measure) {
      trackPerformance('GALLERY_LOAD', measure.duration);
    }
  }
};

// Get performance summary for admin analytics
export const getPerformanceSummary = () => {
  const summary: Record<string, { average: number; max: number; count: number }> = {};
  
  Object.entries(performanceData).forEach(([metric, values]) => {
    summary[metric] = {
      average: values.reduce((a, b) => a + b, 0) / values.length,
      max: Math.max(...values),
      count: values.length
    };
  });
  
  return summary;
};

// Clear performance data (for privacy)
export const clearPerformanceData = () => {
  performanceData = {};
  performance.clearMarks();
  performance.clearMeasures();
};

// Runtime performance optimization
export const optimizeRuntime = () => {
  // Enable long task detection
  if ('PerformanceLongTaskTiming' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Long task threshold
          console.warn('⚠️ Long task detected:', entry.duration + 'ms');
        }
      });
    });
    
    try {
      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Longtask API not supported
    }
  }
  
  // Memory usage monitoring
  if ('memory' in performance) {
    const checkMemory = () => {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        console.warn('⚠️ High memory usage detected');
      }
    };
    
    setInterval(checkMemory, 30000); // Check every 30 seconds
  }
};

export default {
  trackPerformance,
  trackMayaPerformance,
  trackGalleryPerformance,
  getPerformanceSummary,
  clearPerformanceData,
  optimizeRuntime,
};