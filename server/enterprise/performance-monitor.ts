export interface PerformanceMetrics {
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
    connections: number;
  };
  applicationPerformance?: any; // Added for compatibility
  systemHealth?: any; // Added for compatibility
}

export class PerformanceMonitor {
  static async getMetrics(): Promise<PerformanceMetrics> {
    // Placeholder implementation
    return {
      cpu: {
        usage: 0,
        loadAverage: [0, 0, 0]
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      },
      disk: {
        used: 0,
        total: 0,
        percentage: 0
      },
      network: {
        bytesIn: 0,
        bytesOut: 0,
        connections: 0
      }
    };
  }

  static async getHealthMetrics() {
    // Placeholder implementation
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
