// Performance metrics storage layer
import type { PerformanceMetrics, AggregatedMetrics } from '../../shared/types/metrics.js';

export class MetricsStorage {
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private aggregatedMetrics: Map<string, AggregatedMetrics> = new Map();

  async storePerformanceMetrics(userId: string, metrics: PerformanceMetrics): Promise<void> {
    const userMetrics = this.metrics.get(userId) || [];
    userMetrics.push({
      ...metrics,
      id: `${userId}-${Date.now()}`,
      userId
    });
    this.metrics.set(userId, userMetrics);
  }

  async getPerformanceMetrics(userId: string): Promise<PerformanceMetrics[]> {
    return this.metrics.get(userId) || [];
  }

  async updateAggregatedMetrics(userId: string, metrics: Omit<AggregatedMetrics, 'userId' | 'updatedAt'>): Promise<void> {
    this.aggregatedMetrics.set(userId, {
      ...metrics,
      userId,
      updatedAt: new Date().toISOString()
    });
  }

  async getAggregatedMetrics(userId: string): Promise<AggregatedMetrics | null> {
    return this.aggregatedMetrics.get(userId) || null;
  }
}