/**
 * Component Performance Monitoring
 */

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

      const measurements = this.measurements.get(componentName)!;
      measurements.push(duration);

      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift();
      }

      // Log slow renders
      if (duration > 16) {
        console.warn(`⚠️ Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    } else {
      fn();
    }
  }

  static getStats(componentName: string) {
    const measurements = this.measurements.get(componentName);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const avg = measurements.reduce((a, b) => a + b) / measurements.length;
    const max = Math.max(...measurements);
    const min = Math.min(...measurements);

    return { avg, max, min, count: measurements.length };
  }

  static getAllStats() {
    const stats: Record<string, any> = {};
    for (const [componentName] of this.measurements) {
      stats[componentName] = this.getStats(componentName);
    }
    return stats;
  }

  static clearStats() {
    this.measurements.clear();
  }
}