/**
 * Memory Management Utilities
 */

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