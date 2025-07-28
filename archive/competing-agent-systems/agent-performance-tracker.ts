import { db } from '../db';
import { agentConversations, users } from '@shared/schema';
import { eq, and, gte, desc, count, avg, sql } from 'drizzle-orm';

export interface AgentMetrics {
  agentId: string;
  totalConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  successRate: number;
  userSatisfaction: number;
  specialtyUsage: Record<string, number>;
  workflowStages: string[];
  efficiency: number;
  lastActive: Date;
}

export interface PerformanceInsights {
  topPerformers: AgentMetrics[];
  underutilizedAgents: AgentMetrics[];
  workflowBottlenecks: string[];
  optimizationSuggestions: string[];
  overallEfficiency: number;
}

export class AgentPerformanceTracker {
  static async getAgentMetrics(agentId: string, timeframe: 'day' | 'week' | 'month' = 'week'): Promise<AgentMetrics> {
    const timeframeDays = timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - timeframeDays);

    // Get conversation data for the agent
    const conversations = await db
      .select()
      .from(agentConversations)
      .where(
        and(
          eq(agentConversations.agentName, agentId),
          gte(agentConversations.timestamp, fromDate)
        )
      )
      .orderBy(desc(agentConversations.timestamp));

    // Calculate metrics
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce((sum, conv) => {
      const messages = (conv.conversationData as any)?.messages || [];
      return sum + (Array.isArray(messages) ? messages.length : 1);
    }, 0);

    const workflowStages = [...new Set(conversations.map(c => c.workflowStage).filter(Boolean))];
    
    // Calculate specialty usage
    const specialtyUsage = conversations.reduce((usage, conv) => {
      const data = conv.conversationData as any;
      if (data?.type) {
        usage[data.type] = (usage[data.type] || 0) + 1;
      }
      return usage;
    }, {} as Record<string, number>);

    // Mock calculations for demo (in production, these would be based on real metrics)
    const avgResponseTime = Math.random() * 2000 + 500; // 500-2500ms
    const successRate = Math.random() * 20 + 80; // 80-100%
    const userSatisfaction = Math.random() * 15 + 85; // 85-100%
    const efficiency = totalMessages / Math.max(1, totalConversations);

    return {
      agentId,
      totalConversations,
      totalMessages,
      avgResponseTime,
      successRate,
      userSatisfaction,
      specialtyUsage,
      workflowStages,
      efficiency,
      lastActive: conversations[0]?.timestamp || new Date()
    };
  }

  static async getAllAgentMetrics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<AgentMetrics[]> {
    const agents = ['victoria', 'maya', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma'];
    
    const metrics = await Promise.all(
      agents.map(agentId => this.getAgentMetrics(agentId, timeframe))
    );

    return metrics.sort((a, b) => b.totalConversations - a.totalConversations);
  }

  static async getPerformanceInsights(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<PerformanceInsights> {
    const allMetrics = await this.getAllAgentMetrics(timeframe);
    
    // Sort by different criteria
    const byConversations = [...allMetrics].sort((a, b) => b.totalConversations - a.totalConversations);
    const byEfficiency = [...allMetrics].sort((a, b) => b.efficiency - a.efficiency);
    const byUserSatisfaction = [...allMetrics].sort((a, b) => b.userSatisfaction - a.userSatisfaction);

    // Identify top performers (top 3 in multiple categories)
    const topPerformers = byConversations.slice(0, 3);
    
    // Identify underutilized agents (bottom 3 in conversations and efficiency)
    const underutilizedAgents = allMetrics
      .filter(agent => agent.totalConversations < 5 || agent.efficiency < 2)
      .slice(0, 3);

    // Identify workflow bottlenecks
    const stageFrequency = allMetrics.reduce((stages, agent) => {
      agent.workflowStages.forEach(stage => {
        stages[stage] = (stages[stage] || 0) + 1;
      });
      return stages;
    }, {} as Record<string, number>);

    const workflowBottlenecks = Object.entries(stageFrequency)
      .filter(([_, count]) => count > 5)
      .map(([stage]) => stage);

    // Generate optimization suggestions
    const optimizationSuggestions = this.generateOptimizationSuggestions(allMetrics, stageFrequency);

    // Calculate overall efficiency
    const overallEfficiency = allMetrics.reduce((sum, agent) => sum + agent.efficiency, 0) / allMetrics.length;

    return {
      topPerformers,
      underutilizedAgents,
      workflowBottlenecks,
      optimizationSuggestions,
      overallEfficiency
    };
  }

  private static generateOptimizationSuggestions(metrics: AgentMetrics[], stageFrequency: Record<string, number>): string[] {
    const suggestions = [];

    // Check for underutilized agents
    const underutilized = metrics.filter(m => m.totalConversations < 3);
    if (underutilized.length > 0) {
      suggestions.push(`Consider increasing workload for: ${underutilized.map(a => a.agentId).join(', ')}`);
    }

    // Check for bottleneck stages
    const bottlenecks = Object.entries(stageFrequency)
      .filter(([_, count]) => count > 10)
      .map(([stage]) => stage);
    
    if (bottlenecks.length > 0) {
      suggestions.push(`Workflow bottlenecks detected in: ${bottlenecks.join(', ')}`);
    }

    // Check response times
    const slowAgents = metrics.filter(m => m.avgResponseTime > 2000);
    if (slowAgents.length > 0) {
      suggestions.push(`Optimize response times for: ${slowAgents.map(a => a.agentId).join(', ')}`);
    }

    // Check efficiency
    const inefficientAgents = metrics.filter(m => m.efficiency < 1.5);
    if (inefficientAgents.length > 0) {
      suggestions.push(`Improve workflow efficiency for: ${inefficientAgents.map(a => a.agentId).join(', ')}`);
    }

    // Overall suggestions
    const avgSatisfaction = metrics.reduce((sum, m) => sum + m.userSatisfaction, 0) / metrics.length;
    if (avgSatisfaction < 90) {
      suggestions.push('Focus on improving overall user satisfaction scores');
    }

    const totalConversations = metrics.reduce((sum, m) => sum + m.totalConversations, 0);
    if (totalConversations < 50) {
      suggestions.push('Consider promoting agent usage to increase overall platform engagement');
    }

    return suggestions;
  }

  static async getWorkflowAnalytics(): Promise<any> {
    const timeframeDays = 7;
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - timeframeDays);

    const conversations = await db
      .select()
      .from(agentConversations)
      .where(gte(agentConversations.timestamp, fromDate))
      .orderBy(desc(agentConversations.timestamp));

    // Analyze workflow patterns
    const stageTransitions = conversations.reduce((transitions, conv) => {
      const stage = conv.workflowStage || 'unknown';
      transitions[stage] = (transitions[stage] || 0) + 1;
      return transitions;
    }, {} as Record<string, number>);

    const agentDistribution = conversations.reduce((dist, conv) => {
      const agent = conv.agentName;
      dist[agent] = (dist[agent] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    // Calculate completion rates
    const workflowCompletions = conversations.filter(conv => {
      const data = conv.conversationData as any;
      return data?.status === 'completed' || data?.type === 'workflow_complete';
    }).length;

    const completionRate = (workflowCompletions / Math.max(1, conversations.length)) * 100;

    return {
      stageTransitions,
      agentDistribution,
      completionRate,
      totalWorkflows: conversations.length,
      timeframe: timeframeDays,
      trends: {
        mostActiveStage: Object.entries(stageTransitions).sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
        mostActiveAgent: Object.entries(agentDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown',
        avgWorkflowLength: conversations.length / Math.max(1, workflowCompletions)
      }
    };
  }

  static async trackAgentInteraction(agentId: string, userId: string, interactionType: string, metadata: any = {}): Promise<void> {
    // Store interaction for analytics
    await db.insert(agentConversations).values({
      userId,
      agentName: agentId,
      conversationData: {
        type: 'interaction_tracking',
        interactionType,
        metadata,
        timestamp: new Date()
      },
      workflowStage: 'tracking',
      timestamp: new Date()
    });
  }

  static async getAgentUtilizationReport(): Promise<any> {
    const allMetrics = await this.getAllAgentMetrics('week');
    
    const report = {
      summary: {
        totalAgents: allMetrics.length,
        activeAgents: allMetrics.filter(m => m.totalConversations > 0).length,
        avgConversationsPerAgent: allMetrics.reduce((sum, m) => sum + m.totalConversations, 0) / allMetrics.length,
        avgEfficiency: allMetrics.reduce((sum, m) => sum + m.efficiency, 0) / allMetrics.length
      },
      agents: allMetrics.map(metric => ({
        id: metric.agentId,
        conversations: metric.totalConversations,
        messages: metric.totalMessages,
        efficiency: metric.efficiency,
        satisfaction: metric.userSatisfaction,
        status: metric.totalConversations > 5 ? 'active' : metric.totalConversations > 0 ? 'low' : 'inactive'
      })),
      recommendations: await this.getPerformanceInsights('week').then(insights => insights.optimizationSuggestions)
    };

    return report;
  }
}