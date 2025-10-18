// Barrel file consolidating performance utilities
// Re-export core optimization helpers
export {
  optimizeImageLoading,
  enableServiceWorkerCaching,
  throttle,
  debounce,
  getOptimalStaleTime,
  createAbortController,
  measurePerformance,
} from './performanceOptimizations.js';

// Re-export luxury performance toolkit
export {
  LuxuryPerformanceOptimizer,
} from './performanceOptimization.js';

export type { PerformanceMetrics, ImageGenerationData } from './performanceOptimization.js';

