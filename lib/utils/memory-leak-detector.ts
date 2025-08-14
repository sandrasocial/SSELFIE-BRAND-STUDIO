import { EventEmitter } from 'events';

export class MemoryLeakDetector extends EventEmitter {
  private warningThreshold: number = 1024 * 1024 * 1024; // 1GB
  private criticalThreshold: number = 1.5 * 1024 * 1024 * 1024; // 1.5GB
  private checkInterval: number = 1000 * 60; // Check every minute

  constructor() {
    super();
    this.startMonitoring();
  }

  private startMonitoring(): void {
    setInterval(() => {
      const used = process.memoryUsage();
      
      if (used.heapUsed > this.criticalThreshold) {
        this.emit('critical', {
          message: `🚨 CRITICAL: Memory usage at ${Math.round(used.heapUsed / 1024 / 1024)}MB`,
          usage: used
        });
      } else if (used.heapUsed > this.warningThreshold) {
        this.emit('warning', {
          message: `⚠️ WARNING: Memory usage at ${Math.round(used.heapUsed / 1024 / 1024)}MB`,
          usage: used
        });
      }
    }, this.checkInterval);
  }
}