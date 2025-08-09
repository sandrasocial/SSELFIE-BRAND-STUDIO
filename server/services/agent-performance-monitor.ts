/**
 * Agent Performance Monitoring System
 * Tracks agent performance metrics and resource usage
 */

import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';
import { db } from '../db';
import { simpleMemoryService } from './simple-memory-service';

interface PerformanceMetrics {
  agentId: string;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  timestamp: Date;
  conversationId: string;
}

interface AgentUsageStats {
  totalCalls: number;
  averageResponseTime: number;
  peakMemoryUsage: number;
  lastActive: Date;
}

class AgentPerformanceMonitor extends EventEmitter {
  private static instance: AgentPerformanceMonitor;
  private metrics = new Map<string, PerformanceMetrics[]>();
  private stats = new Map<string, AgentUsageStats>();
  private readonly MAX_METRICS_PER_AGENT = 1000;
  
  private constructor() {
    super();
    this.setupCleanupInterval();
  }

  static getInstance(): AgentPerformanceMonitor {
    if (!AgentPerformanceMonitor.instance) {
      AgentPerformanceMonitor.instance = new AgentPerformanceMonitor();
    }
    return AgentPerformanceMonitor.instance;
  }

  /**
   * Start monitoring an agent interaction
   */
  startMonitoring(agentId: string, conversationId: string): () => void {
    const startTime = performance.now();
    const startMemory = process.memoryUsage().heapUsed;
    const startCpu = process.cpuUsage();

    // Return stop function
    return () => {
      const endTime = performance.now();
      const endMemory = process.memoryUsage().heapUsed;
      const endCpu = process.cpuUsage(startCpu);

      const metrics: PerformanceMetrics = {
        agentId,
        responseTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        cpuUsage: (endCpu.user + endCpu.system) / 1000000, // Convert to seconds
        timestamp: new Date(),
        conversationId
      };

      this.recordMetrics(metrics);
    };
  }

  /**
   * Record performance metrics for an agent
   */
  private recordMetrics(metrics: PerformanceMetrics): void {
    // Store metrics
    if (!this.metrics.has(metrics.agentId)) {
      this.metrics.set(metrics.agentId, []);
    }
    const agentMetrics = this.metrics.get(metrics.agentId)!;
    agentMetrics.push(metrics);

    // Update stats
    this.updateAgentStats(metrics);

    // Emit monitoring event
    this.emit('metrics', metrics);

    // Clean up old metrics if needed
    if (agentMetrics.length > this.MAX_METRICS_PER_AGENT) {
      agentMetrics.shift(); // Remove oldest metric
    }
  }

  /**
   * Update agent usage statistics
   */
  private updateAgentStats(metrics: PerformanceMetrics): void {
    const currentStats = this.stats.get(metrics.agentId) || {
      totalCalls: 0,
      averageResponseTime: 0,
      peakMemoryUsage: 0,
      lastActive: new Date()
    };

    // Update stats
    currentStats.totalCalls++;
    currentStats.averageResponseTime = (
      (currentStats.averageResponseTime * (currentStats.totalCalls - 1) + metrics.responseTime) / 
      currentStats.totalCalls
    );
    currentStats.peakMemoryUsage = Math.max(currentStats.peakMemoryUsage, metrics.memoryUsage);
    currentStats.lastActive = metrics.timestamp;

    this.stats.set(metrics.agentId, currentStats);
  }

  /**
   * Get performance report for an agent
   */
  getAgentPerformanceReport(agentId: string): {
    metrics: PerformanceMetrics[];
    stats: AgentUsageStats;
  } {
    return {
      metrics: this.metrics.get(agentId) || [],
      stats: this.stats.get(agentId) || {
        totalCalls: 0,
        averageResponseTime: 0,
        peakMemoryUsage: 0,
        lastActive: new Date()
      }
    };
  }

  /**
   * Get system-wide performance overview
   */
  getSystemOverview(): {
    totalAgents: number;
    totalCalls: number;
    averageResponseTime: number;
    totalMemoryUsage: number;
  } {
    let totalCalls = 0;
    let totalResponseTime = 0;
    let totalMemory = 0;

    this.stats.forEach(stats => {
      totalCalls += stats.totalCalls;
      totalResponseTime += stats.averageResponseTime * stats.totalCalls;
      totalMemory += stats.peakMemoryUsage;
    });

    return {
      totalAgents: this.stats.size,
      totalCalls,
      averageResponseTime: totalCalls > 0 ? totalResponseTime / totalCalls : 0,
      totalMemoryUsage: totalMemory
    };
  }

  /**
   * Clean up old metrics periodically
   */
  private setupCleanupInterval(): void {
    const ONE_HOUR = 60 * 60 * 1000;
    
    setInterval(() => {
      const cutoff = new Date(Date.now() - (24 * ONE_HOUR)); // Keep 24 hours of data
      
      this.metrics.forEach((agentMetrics, agentId) => {
        this.metrics.set(
          agentId,
          agentMetrics.filter(m => m.timestamp > cutoff)
        );
      });
    }, ONE_HOUR);
  }

  /**
   * Check for performance issues
   */
  checkPerformanceIssues(): {
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    this.stats.forEach((stats, agentId) => {
      // Check response time
      if (stats.averageResponseTime > 5000) { // 5 seconds
        issues.push(`High average response time for agent ${agentId}`);
        recommendations.push(`Consider optimizing agent ${agentId}'s processing logic`);
      }

      // Check memory usage
      if (stats.peakMemoryUsage > 1024 * 1024 * 100) { // 100MB
        issues.push(`High memory usage for agent ${agentId}`);
        recommendations.push(`Review memory management for agent ${agentId}`);
      }
    });

    // Check system-wide metrics
    const overview = this.getSystemOverview();
    if (overview.totalMemoryUsage > 1024 * 1024 * 1000) { // 1GB
      issues.push('High system-wide memory usage');
      recommendations.push('Consider implementing more aggressive memory cleanup');
    }

    return { issues, recommendations };
  }
}

// Export singleton instance
export const agentPerformanceMonitor = AgentPerformanceMonitor.getInstance();