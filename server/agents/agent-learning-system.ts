// SSELFIE Studio AI Agent Learning & Training System
import { db } from '../db';
import { agentLearning, agentKnowledgeBase, agentPerformanceMetrics } from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface LearningEvent {
  agentId: string;
  taskType: string;
  context: string;
  outcome: 'success' | 'failure' | 'partial';
  learningNotes: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeEntry {
  agentId: string;
  topic: string;
  content: string;
  source: 'conversation' | 'training' | 'documentation' | 'experience';
  confidence: number;
  lastUpdated: Date;
}

export interface PerformanceMetrics {
  agentId: string;
  taskType: string;
  successRate: number;
  averageTime: number;
  userSatisfactionScore: number;
  improvementTrend: 'improving' | 'stable' | 'declining';
}

export class AgentLearningSystem {
  
  // Record learning event for agent improvement
  async recordLearningEvent(event: LearningEvent): Promise<void> {
    try {
      await db.insert(agentLearning).values({
        agentId: event.agentId,
        taskType: event.taskType,
        context: event.context,
        outcome: event.outcome,
        learningNotes: event.learningNotes,
        metadata: event.metadata || {},
        timestamp: new Date()
      });
      
      // Update performance metrics
      await this.updatePerformanceMetrics(event.agentId, event.taskType, event.outcome);
    } catch (error) {
      console.error('Failed to record learning event:', error);
    }
  }

  // Add knowledge to agent's knowledge base
  async addKnowledge(knowledge: KnowledgeEntry): Promise<void> {
    try {
      // Check if knowledge already exists
      const existing = await db.select()
        .from(agentKnowledgeBase)
        .where(and(
          eq(agentKnowledgeBase.agentId, knowledge.agentId),
          eq(agentKnowledgeBase.topic, knowledge.topic)
        ));

      if (existing.length > 0) {
        // Update existing knowledge
        await db.update(agentKnowledgeBase)
          .set({
            content: knowledge.content,
            confidence: knowledge.confidence,
            lastUpdated: new Date()
          })
          .where(eq(agentKnowledgeBase.id, existing[0].id));
      } else {
        // Insert new knowledge
        await db.insert(agentKnowledgeBase).values({
          agentId: knowledge.agentId,
          topic: knowledge.topic,
          content: knowledge.content,
          source: knowledge.source,
          confidence: knowledge.confidence,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to add knowledge:', error);
    }
  }

  // Get agent's knowledge for a specific topic
  async getAgentKnowledge(agentId: string, topic?: string): Promise<KnowledgeEntry[]> {
    try {
      const query = db.select().from(agentKnowledgeBase)
        .where(eq(agentKnowledgeBase.agentId, agentId));
      
      if (topic) {
        query.where(eq(agentKnowledgeBase.topic, topic));
      }
      
      const results = await query.orderBy(desc(agentKnowledgeBase.lastUpdated));
      
      return results.map(row => ({
        agentId: row.agentId,
        topic: row.topic,
        content: row.content,
        source: row.source as 'conversation' | 'training' | 'documentation' | 'experience',
        confidence: row.confidence,
        lastUpdated: row.lastUpdated
      }));
    } catch (error) {
      console.error('Failed to get agent knowledge:', error);
      return [];
    }
  }

  // Get agent performance metrics
  async getPerformanceMetrics(agentId: string): Promise<PerformanceMetrics[]> {
    try {
      const results = await db.select()
        .from(agentPerformanceMetrics)
        .where(eq(agentPerformanceMetrics.agentId, agentId))
        .orderBy(desc(agentPerformanceMetrics.lastUpdated));

      return results.map(row => ({
        agentId: row.agentId,
        taskType: row.taskType,
        successRate: row.successRate,
        averageTime: row.averageTime,
        userSatisfactionScore: row.userSatisfactionScore,
        improvementTrend: row.improvementTrend as 'improving' | 'stable' | 'declining'
      }));
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return [];
    }
  }

  // Update performance metrics based on task outcome
  private async updatePerformanceMetrics(
    agentId: string, 
    taskType: string, 
    outcome: 'success' | 'failure' | 'partial'
  ): Promise<void> {
    try {
      const existing = await db.select()
        .from(agentPerformanceMetrics)
        .where(and(
          eq(agentPerformanceMetrics.agentId, agentId),
          eq(agentPerformanceMetrics.taskType, taskType)
        ));

      const successValue = outcome === 'success' ? 1 : outcome === 'partial' ? 0.5 : 0;

      if (existing.length > 0) {
        const current = existing[0];
        const newSuccessRate = (current.successRate * current.totalTasks + successValue) / (current.totalTasks + 1);
        
        await db.update(agentPerformanceMetrics)
          .set({
            successRate: newSuccessRate,
            totalTasks: current.totalTasks + 1,
            lastUpdated: new Date()
          })
          .where(eq(agentPerformanceMetrics.id, current.id));
      } else {
        await db.insert(agentPerformanceMetrics).values({
          agentId,
          taskType,
          successRate: successValue,
          averageTime: 0,
          userSatisfactionScore: 0,
          totalTasks: 1,
          improvementTrend: 'stable',
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to update performance metrics:', error);
    }
  }

  // Get learning history for agent improvement
  async getLearningHistory(agentId: string, limit: number = 50): Promise<LearningEvent[]> {
    try {
      const results = await db.select()
        .from(agentLearning)
        .where(eq(agentLearning.agentId, agentId))
        .orderBy(desc(agentLearning.timestamp))
        .limit(limit);

      return results.map(row => ({
        agentId: row.agentId,
        taskType: row.taskType,
        context: row.context,
        outcome: row.outcome as 'success' | 'failure' | 'partial',
        learningNotes: row.learningNotes,
        metadata: row.metadata as Record<string, any>
      }));
    } catch (error) {
      console.error('Failed to get learning history:', error);
      return [];
    }
  }

  // Generate agent enhancement recommendations
  async generateEnhancementRecommendations(agentId: string): Promise<string[]> {
    const recommendations: string[] = [];
    
    try {
      const metrics = await this.getPerformanceMetrics(agentId);
      const learningHistory = await this.getLearningHistory(agentId, 20);
      
      // Analyze performance patterns
      const lowPerformanceTasks = metrics.filter(m => m.successRate < 0.7);
      if (lowPerformanceTasks.length > 0) {
        recommendations.push(`Focus on improving: ${lowPerformanceTasks.map(t => t.taskType).join(', ')}`);
      }
      
      // Analyze recent failures
      const recentFailures = learningHistory.filter(l => l.outcome === 'failure');
      if (recentFailures.length > 3) {
        recommendations.push('Review recent failure patterns and update training data');
      }
      
      // Check knowledge gaps
      const knowledge = await this.getAgentKnowledge(agentId);
      const lowConfidenceKnowledge = knowledge.filter(k => k.confidence < 0.6);
      if (lowConfidenceKnowledge.length > 0) {
        recommendations.push('Update knowledge base for low-confidence topics');
      }
      
      return recommendations;
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      return ['Unable to generate recommendations at this time'];
    }
  }
}

export const agentLearningSystem = new AgentLearningSystem();