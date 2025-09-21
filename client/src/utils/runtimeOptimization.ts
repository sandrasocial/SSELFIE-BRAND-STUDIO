/**
 * Runtime Performance Optimization - Main Export
 * Re-exports all optimization utilities
 */

export { MemoryManager } from './optimization/memoryManager';
export { VirtualScroller } from './optimization/virtualScroller';
export { LazyImageLoader } from './optimization/lazyImageLoader';
export { ResizeOptimizer } from './optimization/resizeOptimizer';
export { ComponentProfiler } from './optimization/componentProfiler';
export { RequestOptimizer } from './optimization/requestOptimizer';

// Initialize runtime optimizations
export function initializeRuntimeOptimization() {
  const memoryManager = MemoryManager.getInstance();
  
  // Set up memory monitoring
  setInterval(() => {
    memoryManager.checkMemoryUsage();
  }, 30000); // Check every 30 seconds

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    memoryManager.cleanup();
    RequestOptimizer.clearCache();
  });

  console.log('✅ Runtime optimization initialized');
}