import { agentPerformanceMonitor } from '../services/agent-performance-monitor';
import { agentStateManager } from './agent-state-manager';
// Performance optimization (simplified - no more competing config systems)
import { EventEmitter } from 'events';

class AgentPerformanceOptimizer extends EventEmitter {
  private static instance: AgentPerformanceOptimizer;
  private optimizationInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.startOptimizationLoop();
  }

  static getInstance(): AgentPerformanceOptimizer {
    if (!AgentPerformanceOptimizer.instance) {
      AgentPerformanceOptimizer.instance = new AgentPerformanceOptimizer();
    }
    return AgentPerformanceOptimizer.instance;
  }

  private startOptimizationLoop(): void {
    // Run optimization every 5 minutes
    this.optimizationInterval = setInterval(() => {
      this.optimizeAgentPerformance();
    }, 5 * 60 * 1000);
  }

  private async optimizeAgentPerformance(): Promise<void> {
    const systemStatus = agentStateManager.getSystemStatus();
    
    // Simplified performance monitoring (no more competing config systems)
    const activeAgents = ['maya', 'elena', 'olga', 'zara', 'victoria', 'aria', 'rachel', 'diana', 'quinn', 'wilma', 'sophia', 'martha', 'ava', 'flux'];
    
    activeAgents.forEach(agentId => {
      const performance = agentPerformanceMonitor.getAgentPerformanceReport(agentId);
      
      // Check response time (simplified)
      if (performance.stats.averageResponseTime > 8000) {
        this.emit('performance-warning', {
          agentId,
          issue: 'high-response-time',
          value: performance.stats.averageResponseTime
        });
      }

      // Check memory usage (simplified)
      if (performance.stats.peakMemoryUsage > 1024 * 1024 * 1024) {
        this.emit('performance-warning', {
          agentId,
          issue: 'high-memory-usage',
          value: performance.stats.peakMemoryUsage
        });
      }
    });

    // System-wide optimizations (simplified)
    const systemMetrics = agentPerformanceMonitor.getSystemOverview();
    
    if (systemMetrics.totalMemoryUsage > 4 * 1024 * 1024 * 1024) { // 4GB limit
      this.triggerMemoryCleanup();
    }

    if (systemMetrics.totalAgents > 10) { // Simplified limit
      this.balanceAgentLoad();
    }
  }

  private async triggerMemoryCleanup(): Promise<void> {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    // Reset performance metrics
    this.emit('system-cleanup', {
      timestamp: new Date(),
      type: 'memory-cleanup'
    });
  }

  private async balanceAgentLoad(): Promise<void> {
    const activeAgents = agentStateManager.getAvailableAgents();
    
    // Redistribute tasks if needed
    if (activeAgents.length < 2) return; // Need at least 2 agents to balance

    this.emit('load-balancing', {
      timestamp: new Date(),
      activeAgents: activeAgents.length
    });
  }

  getOptimizationStatus(): {
    isOptimizing: boolean;
    lastOptimization: Date | null;
    warnings: number;
  } {
    return {
      isOptimizing: this.optimizationInterval !== null,
      lastOptimization: new Date(), // You might want to store the actual last optimization time
      warnings: 0 // Implement warning counter if needed
    };
  }

  stopOptimization(): void {
    if (this.optimizationInterval) {
      clearInterval(this.optimizationInterval);
      this.optimizationInterval = null;
    }
  }
}

export const agentPerformanceOptimizer = AgentPerformanceOptimizer.getInstance();