/**
 * Performance optimization utilities for SSELFIE Studio
 * Phase 3: Performance Optimization and Code Cleanup
 */

// Image optimization - Updated to remove broken assets.sselfie.ai references
export const optimizeImageLoading = () => {
  // Note: Removed broken assets.sselfie.ai preloading due to DNS resolution issues
  // Hero sections now use stone gradient patterns for brand consistency
  // This prevents network errors and improves performance
  
  console.log('🎨 SSELFIE Studio: Using stone gradient patterns for hero sections');
  
  // Optional: Preload any working static assets from main domain if needed
  // const criticalAssets = [
  //   '/images/logo.svg', // Example of working assets from main domain
  // ];
  
  // criticalAssets.forEach(src => {
  //   const link = document.createElement('link') as HTMLLinkElement;
  //   link.rel = 'preload';
  //   link.as = 'image';
  //   link.href = src;
  //   document.head.appendChild(link);
  // });
};

// Bundle optimization
export const enableServiceWorkerCaching = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production' && !/handler\//.test(window.location.pathname)) {
    // Wrap in try-catch and add proper error handling to prevent unhandled promise rejections
    try {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          return registration;
        })
        .catch(registrationError => {
          console.warn('SSELFIE Studio: Service Worker registration failed (expected in dev)', registrationError);
          // Don't throw - just log and continue
          return null;
        });
    } catch (error) {
      console.warn('SSELFIE Studio: Service Worker not supported or failed to register', error);
    }
  }
};

// Memory management
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Query optimization
export const getOptimalStaleTime = (dataType: 'user' | 'gallery' | 'generation' | 'static'): number => {
  switch (dataType) {
    case 'user':
      return 5 * 60 * 1000; // 5 minutes
    case 'gallery':
      return 2 * 60 * 1000; // 2 minutes
    case 'generation':
      return 10 * 1000; // 10 seconds
    case 'static':
      return 60 * 60 * 1000; // 1 hour
    default:
      return 30 * 1000; // 30 seconds
  }
};

// Cleanup utilities
export const createAbortController = () => {
  const controller = new AbortController();
  return {
    signal: controller.signal,
    abort: () => controller.abort(),
  };
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  } else {
    fn();
  }
};

export default {
  optimizeImageLoading,
  enableServiceWorkerCaching,
  throttle,
  debounce,
  getOptimalStaleTime,
  createAbortController,
  measurePerformance,
};