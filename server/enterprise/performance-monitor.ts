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
  applicationPerformance: {
    errorRate: { total: number };
    responseTime: { average: number };
    throughput: { requestsPerSecond: number };
  };
  systemHealth: {
    cpu: { usage: number };
  };
}

export interface PerformanceReport {
  reportId: string;
  generatedAt: string;
  metrics: PerformanceMetrics;
}

export interface HealthMetrics {
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  uptime?: number;
  errors?: string[];
}

export interface SystemAlert {
  id: string;
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'application';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export interface AlertResolution {
  success: boolean;
  alertId: string;
  resolvedAt?: string;
  error?: string;
}

// Type guards for performance data validation
export function isValidPerformanceMetrics(obj: unknown): obj is PerformanceMetrics {
  if (!obj || typeof obj !== 'object') return false;
  
  const metrics = obj as Record<string, unknown>;
  
  return (
    typeof metrics.cpu === 'object' &&
    metrics.cpu !== null &&
    typeof (metrics.cpu as any).usage === 'number' &&
    Array.isArray((metrics.cpu as any).loadAverage) &&
    typeof metrics.memory === 'object' &&
    metrics.memory !== null &&
    typeof (metrics.memory as any).used === 'number' &&
    typeof (metrics.memory as any).total === 'number' &&
    typeof (metrics.memory as any).percentage === 'number'
  );
}

export function isValidSystemAlert(obj: unknown): obj is SystemAlert {
  if (!obj || typeof obj !== 'object') return false;
  
  const alert = obj as Record<string, unknown>;
  
  return (
    typeof alert.id === 'string' &&
    typeof alert.type === 'string' &&
    ['cpu', 'memory', 'disk', 'network', 'application'].includes(alert.type as string) &&
    typeof alert.severity === 'string' &&
    ['low', 'medium', 'high', 'critical'].includes(alert.severity as string) &&
    typeof alert.message === 'string' &&
    typeof alert.timestamp === 'string' &&
    typeof alert.resolved === 'boolean'
  );
}

export class PerformanceMonitor {
  private static readonly CACHE_TTL = 5000; // 5 seconds cache
  private static metricsCache: { data: PerformanceMetrics; timestamp: number } | null = null;
  private static alerts: SystemAlert[] = [];

  /**
   * Get system performance metrics with caching and error handling
   */
  static async getMetrics(): Promise<PerformanceMetrics> {
    try {
      // Check cache first
      if (this.metricsCache && Date.now() - this.metricsCache.timestamp < this.CACHE_TTL) {
        return this.metricsCache.data;
      }

      // Generate fresh metrics
      const metrics: PerformanceMetrics = {
        cpu: {
          usage: Math.max(0, Math.min(100, Math.random() * 30 + 10)), // 10-40% simulated
          loadAverage: [
            Math.max(0, Math.random() * 2),
            Math.max(0, Math.random() * 2),
            Math.max(0, Math.random() * 2)
          ]
        },
        memory: {
          used: Math.floor(Math.random() * 2048 + 1024), // 1-3GB simulated
          total: 8192, // 8GB total
          percentage: 0
        },
        disk: {
          used: Math.floor(Math.random() * 20480 + 10240), // 10-30GB simulated
          total: 102400, // 100GB total
          percentage: 0
        },
        network: {
          bytesIn: Math.floor(Math.random() * 1000000), // Random bytes
          bytesOut: Math.floor(Math.random() * 500000),
          connections: Math.floor(Math.random() * 50 + 10) // 10-60 connections
        },
        applicationPerformance: {
          errorRate: { total: Math.floor(Math.random() * 5) }, // 0-5 errors
          responseTime: { average: Math.max(50, Math.random() * 200 + 100) }, // 100-300ms
          throughput: { requestsPerSecond: Math.max(1, Math.random() * 100 + 20) } // 20-120 RPS
        },
        systemHealth: {
          cpu: { usage: Math.max(0, Math.min(100, Math.random() * 30 + 10)) }
        }
      };

      // Calculate percentages
      metrics.memory.percentage = Math.round((metrics.memory.used / metrics.memory.total) * 100);
      metrics.disk.percentage = Math.round((metrics.disk.used / metrics.disk.total) * 100);

      // Validate metrics before caching
      if (!isValidPerformanceMetrics(metrics)) {
        throw new Error('Generated metrics failed validation');
      }

      // Cache the metrics
      this.metricsCache = {
        data: metrics,
        timestamp: Date.now()
      };

      // Generate alerts based on metrics
      this.checkAndGenerateAlerts(metrics);

      return metrics;
    } catch (error) {
      console.error('❌ Performance Monitor Error - getMetrics:', error);
      
      // Return safe fallback metrics
      const fallbackMetrics: PerformanceMetrics = {
        cpu: { usage: 0, loadAverage: [0, 0, 0] },
        memory: { used: 0, total: 8192, percentage: 0 },
        disk: { used: 0, total: 102400, percentage: 0 },
        network: { bytesIn: 0, bytesOut: 0, connections: 0 },
        applicationPerformance: {
          errorRate: { total: 0 },
          responseTime: { average: 0 },
          throughput: { requestsPerSecond: 0 }
        },
        systemHealth: { cpu: { usage: 0 } }
      };

      return fallbackMetrics;
    }
  }

  /**
   * Get health metrics with proper error handling and return types
   */
  static async getHealthMetrics(): Promise<HealthMetrics> {
    try {
      const metrics = await this.getMetrics();
      
      // Determine health status based on metrics
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      const errors: string[] = [];

      if (metrics.cpu.usage > 80) {
        status = 'critical';
        errors.push(`High CPU usage: ${metrics.cpu.usage.toFixed(1)}%`);
      } else if (metrics.cpu.usage > 60) {
        status = 'warning';
        errors.push(`Elevated CPU usage: ${metrics.cpu.usage.toFixed(1)}%`);
      }

      if (metrics.memory.percentage > 85) {
        status = 'critical';
        errors.push(`High memory usage: ${metrics.memory.percentage}%`);
      } else if (metrics.memory.percentage > 70) {
        status = 'warning';
        errors.push(`Elevated memory usage: ${metrics.memory.percentage}%`);
      }

      if (metrics.disk.percentage > 90) {
        status = 'critical';
        errors.push(`High disk usage: ${metrics.disk.percentage}%`);
      }

      const healthMetrics: HealthMetrics = {
        status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime ? Math.floor(process.uptime()) : undefined,
        errors: errors.length > 0 ? errors : undefined
      };

      return healthMetrics;
    } catch (error) {
      console.error('❌ Performance Monitor Error - getHealthMetrics:', error);
      
      return {
        status: 'critical',
        timestamp: new Date().toISOString(),
        errors: ['Failed to retrieve health metrics']
      };
    }
  }

  /**
   * Generate performance report with comprehensive error handling
   */
  static async generatePerformanceReport(): Promise<PerformanceReport> {
    try {
      const metrics = await this.getMetrics();
      
      const report: PerformanceReport = {
        reportId: `perf-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        generatedAt: new Date().toISOString(),
        metrics
      };

      return report;
    } catch (error) {
      console.error('❌ Performance Monitor Error - generatePerformanceReport:', error);
      
      // Return fallback report
      const fallbackMetrics = await this.getMetrics(); // This has its own error handling
      
      return {
        reportId: `perf-error-${Date.now()}`,
        generatedAt: new Date().toISOString(),
        metrics: fallbackMetrics
      };
    }
  }

  /**
   * Get system alerts with proper error handling
   */
  static async getSystemAlerts(): Promise<SystemAlert[]> {
    try {
      // Clean up resolved alerts older than 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      this.alerts = this.alerts.filter(alert => 
        !alert.resolved || new Date(alert.timestamp).getTime() > oneDayAgo
      );

      return [...this.alerts]; // Return copy to prevent external mutations
    } catch (error) {
      console.error('❌ Performance Monitor Error - getSystemAlerts:', error);
      return [];
    }
  }

  /**
   * Resolve alert with proper validation and error handling
   */
  static async resolveAlert(alertId: string): Promise<AlertResolution> {
    try {
      if (!alertId || typeof alertId !== 'string') {
        return {
          success: false,
          alertId,
          error: 'Invalid alert ID provided'
        };
      }

      const alertIndex = this.alerts.findIndex(alert => alert.id === alertId);
      
      if (alertIndex === -1) {
        return {
          success: false,
          alertId,
          error: 'Alert not found'
        };
      }

      // Mark alert as resolved
      this.alerts[alertIndex].resolved = true;
      
      const result: AlertResolution = {
        success: true,
        alertId,
        resolvedAt: new Date().toISOString()
      };

      console.log(`✅ Performance alert resolved: ${alertId}`);
      return result;
    } catch (error) {
      console.error('❌ Performance Monitor Error - resolveAlert:', error);
      
      return {
        success: false,
        alertId,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check metrics and generate alerts if needed
   */
  private static checkAndGenerateAlerts(metrics: PerformanceMetrics): void {
    try {
      const now = new Date().toISOString();

      // CPU alert
      if (metrics.cpu.usage > 80) {
        this.addAlert({
          id: `cpu-${Date.now()}`,
          type: 'cpu',
          severity: metrics.cpu.usage > 95 ? 'critical' : 'high',
          message: `High CPU usage detected: ${metrics.cpu.usage.toFixed(1)}%`,
          timestamp: now,
          resolved: false
        });
      }

      // Memory alert
      if (metrics.memory.percentage > 85) {
        this.addAlert({
          id: `memory-${Date.now()}`,
          type: 'memory',
          severity: metrics.memory.percentage > 95 ? 'critical' : 'high',
          message: `High memory usage detected: ${metrics.memory.percentage}%`,
          timestamp: now,
          resolved: false
        });
      }

      // Disk alert
      if (metrics.disk.percentage > 90) {
        this.addAlert({
          id: `disk-${Date.now()}`,
          type: 'disk',
          severity: metrics.disk.percentage > 98 ? 'critical' : 'high',
          message: `High disk usage detected: ${metrics.disk.percentage}%`,
          timestamp: now,
          resolved: false
        });
      }

      // Application performance alert
      if (metrics.applicationPerformance.errorRate.total > 10) {
        this.addAlert({
          id: `app-errors-${Date.now()}`,
          type: 'application',
          severity: metrics.applicationPerformance.errorRate.total > 50 ? 'critical' : 'medium',
          message: `High error rate detected: ${metrics.applicationPerformance.errorRate.total} errors`,
          timestamp: now,
          resolved: false
        });
      }

      if (metrics.applicationPerformance.responseTime.average > 2000) {
        this.addAlert({
          id: `app-slow-${Date.now()}`,
          type: 'application',
          severity: metrics.applicationPerformance.responseTime.average > 5000 ? 'critical' : 'medium',
          message: `Slow response time detected: ${metrics.applicationPerformance.responseTime.average.toFixed(0)}ms`,
          timestamp: now,
          resolved: false
        });
      }
    } catch (error) {
      console.error('❌ Performance Monitor Error - checkAndGenerateAlerts:', error);
    }
  }

  /**
   * Add alert with validation
   */
  private static addAlert(alert: SystemAlert): void {
    try {
      if (!isValidSystemAlert(alert)) {
        console.error('❌ Invalid alert data:', alert);
        return;
      }

      // Check for duplicate alerts (same type and severity within 5 minutes)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      const isDuplicate = this.alerts.some(existingAlert => 
        existingAlert.type === alert.type &&
        existingAlert.severity === alert.severity &&
        !existingAlert.resolved &&
        new Date(existingAlert.timestamp).getTime() > fiveMinutesAgo
      );

      if (!isDuplicate) {
        this.alerts.push(alert);
        
        // Keep only the latest 100 alerts to prevent memory issues
        if (this.alerts.length > 100) {
          this.alerts = this.alerts.slice(-100);
        }
      }
    } catch (error) {
      console.error('❌ Performance Monitor Error - addAlert:', error);
    }
  }

  /**
   * Clear all alerts (for testing/maintenance)
   */
  static clearAllAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get performance monitor status
   */
  static getStatus(): { enabled: boolean; alertCount: number; cacheAge: number } {
    const cacheAge = this.metricsCache ? Date.now() - this.metricsCache.timestamp : -1;
    
    return {
      enabled: true,
      alertCount: this.alerts.filter(alert => !alert.resolved).length,
      cacheAge
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
