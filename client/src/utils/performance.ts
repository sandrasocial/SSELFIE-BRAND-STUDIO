/**
 * Performance Monitoring and Optimization Utilities
 */

// Performance Observer for monitoring Core Web Vitals
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  // Monitor Largest Contentful Paint (LCP)
  const observeLCP = () => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  };

  // Monitor Cumulative Layout Shift (CLS)
  const observeCLS = () => {
    let cumulativeLayoutShift = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cumulativeLayoutShift += (entry as any).value;
        }
      }
      console.log('CLS:', cumulativeLayoutShift);
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  };

  // Monitor First Input Delay (FID)
  const observeFID = () => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('FID:', (entry as any).processingStart - entry.startTime);
      }
    });
    observer.observe({ entryTypes: ['first-input'] });
  };

  // Initialize all observers
  try {
    observeLCP();
    observeCLS();
    observeFID();
  } catch (error) {
    console.log('Performance monitoring not supported');
  }
};

// Image preloading utility
export const preloadCriticalImages = (imageSrcs: string[]) => {
  imageSrcs.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Resource hints for improved loading
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//sselfie-training-zips.s3.eu-north-1.amazonaws.com' },
    { rel: 'preconnect', href: 'https://sselfie-training-zips.s3.eu-north-1.amazonaws.com' },
  ];

  hints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    document.head.appendChild(link);
  });
};