/**
 * Runtime Performance Optimization Utilities
 * Optimizes memory usage, rendering, and user interactions
 */

// Memory management
export class MemoryManager {
  private static instance: MemoryManager;
  private cleanupTasks: (() => void)[] = [];
  private memoryThreshold = 50 * 1024 * 1024; // 50MB

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }

  cleanup() {
    console.log('🧹 Memory Manager: Running cleanup tasks');
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Memory cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  checkMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      
      console.log(`📊 Memory Usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
      
      if (usedMB > this.memoryThreshold / 1024 / 1024) {
        console.warn('⚠️ High memory usage detected, running cleanup');
        this.cleanup();
      }
    }
  }
}

// Virtual scrolling for large lists
export class VirtualScroller {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleItems: number;
  private totalItems: number;
  private scrollTop: number = 0;
  private startIndex: number = 0;
  private endIndex: number = 0;

  constructor(container: HTMLElement, itemHeight: number, visibleItems: number) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.visibleItems = visibleItems;
    this.totalItems = 0;
    this.setupScrollListener();
  }

  setTotalItems(count: number) {
    this.totalItems = count;
    this.updateContainerHeight();
    this.renderVisibleItems();
  }

  private setupScrollListener() {
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
  }

  private handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.calculateVisibleRange();
    this.renderVisibleItems();
  }

  private calculateVisibleRange() {
    this.startIndex = Math.floor(this.scrollTop / this.itemHeight);
    this.endIndex = Math.min(
      this.startIndex + this.visibleItems + 1,
      this.totalItems
    );
  }

  private updateContainerHeight() {
    this.container.style.height = `${this.totalItems * this.itemHeight}px`;
  }

  private renderVisibleItems() {
    // This would be implemented based on your specific rendering needs
    console.log(`Rendering items ${this.startIndex} to ${this.endIndex}`);
  }
}

// Image lazy loading with intersection observer
export class LazyImageLoader {
  private observer: IntersectionObserver;
  private images: Map<HTMLImageElement, string> = new Map();

  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  }

  observe(img: HTMLImageElement, src: string) {
    this.images.set(img, src);
    this.observer.observe(img);
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = this.images.get(img);
        
        if (src) {
          img.src = src;
          img.classList.add('loaded');
          this.observer.unobserve(img);
          this.images.delete(img);
        }
      }
    });
  }

  disconnect() {
    this.observer.disconnect();
    this.images.clear();
  }
}

// Debounced resize handler
export class ResizeOptimizer {
  private resizeHandlers: (() => void)[] = [];
  private debounceDelay: number = 100;
  private timeoutId: number | null = null;

  addHandler(handler: () => void) {
    this.resizeHandlers.push(handler);
  }

  removeHandler(handler: () => void) {
    const index = this.resizeHandlers.indexOf(handler);
    if (index > -1) {
      this.resizeHandlers.splice(index, 1);
    }
  }

  private handleResize = () => {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = window.setTimeout(() => {
      this.resizeHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.warn('Resize handler failed:', error);
        }
      });
    }, this.debounceDelay);
  };

  start() {
    window.addEventListener('resize', this.handleResize);
  }

  stop() {
    window.removeEventListener('resize', this.handleResize);
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

// Component performance monitoring
export class ComponentProfiler {
  private static measurements: Map<string, number[]> = new Map();

  static measure(componentName: string, fn: () => void) {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      fn();
      const end = performance.now();
      const duration = end - start;

      if (!this.measurements.has(componentName)) {
        this.measurements.set(componentName, []);
      }
      
      this.measurements.get(componentName)!.push(duration);
      
      if (duration > 16) { // More than one frame
        console.warn(`🐌 Slow component: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    } else {
      fn();
    }
  }

  static getAverageTime(componentName: string): number {
    const measurements = this.measurements.get(componentName);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }

  static getReport(): Record<string, number> {
    const report: Record<string, number> = {};
    this.measurements.forEach((times, component) => {
      report[component] = this.getAverageTime(component);
    });
    return report;
  }
}

// Request optimization
export class RequestOptimizer {
  private static pendingRequests: Map<string, Promise<any>> = new Map();
  private static requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private static cacheTimeout = 5 * 60 * 1000; // 5 minutes

  static async request<T>(
    key: string,
    requestFn: () => Promise<T>,
    useCache: boolean = true
  ): Promise<T> {
    // Check cache first
    if (useCache) {
      const cached = this.requestCache.get(key);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`📦 Request cache hit: ${key}`);
        return cached.data;
      }
    }

    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      console.log(`⏳ Request deduplication: ${key}`);
      return this.pendingRequests.get(key)!;
    }

    // Make new request
    const requestPromise = requestFn().then(data => {
      // Cache the result
      if (useCache) {
        this.requestCache.set(key, {
          data,
          timestamp: Date.now()
        });
      }
      
      // Remove from pending
      this.pendingRequests.delete(key);
      
      return data;
    }).catch(error => {
      // Remove from pending on error
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  static clearCache() {
    this.requestCache.clear();
    this.pendingRequests.clear();
  }
}

// Initialize runtime optimizations
export function initializeRuntimeOptimization() {
  const memoryManager = MemoryManager.getInstance();
  
  // Check memory usage every 30 seconds
  setInterval(() => {
    memoryManager.checkMemoryUsage();
  }, 30000);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    memoryManager.cleanup();
  });

  console.log('🚀 Runtime optimization initialized');
}

export default {
  MemoryManager,
  VirtualScroller,
  LazyImageLoader,
  ResizeOptimizer,
  ComponentProfiler,
  RequestOptimizer,
  initializeRuntimeOptimization
};
