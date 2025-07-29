import { db } from "../db";
import { 
  agentLearning, 
  agentKnowledgeBase, 
  agentPerformanceMetrics, 
  agentCapabilities,
  claudeConversations,
  claudeMessages,
  type InsertAgentLearning,
  type InsertAgentKnowledgeBase,
  type InsertAgentPerformanceMetrics,
  type AgentLearning,
  type AgentKnowledgeBase
} from "../../shared/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";

export interface MemoryInsight {
  type: 'preference' | 'pattern' | 'skill' | 'context' | 'relationship';
  category: string;
  content: string;
  confidence: number;
  frequency: number;
  lastSeen: Date;
  relatedTopics?: string[];
  userSpecific?: boolean;
}

export interface LearningContext {
  userId: string;
  agentName: string;
  conversationId?: string;
  sessionContext: Record<string, any>;
  messageHistory: Array<{
    role: string;
    content: string;
    timestamp: Date;
  }>;
}

export class EnhancedAgentMemory {
  
  /**
   * Enhanced memory storage with relationship tracking and contextual learning
   */
  async storeMemory(
    agentName: string, 
    userId: string, 
    insight: MemoryInsight,
    context?: LearningContext
  ): Promise<void> {
    try {
      // Store in agent learning table with enhanced metadata
      const learningData: InsertAgentLearning = {
        agentName,
        userId,
        learningType: insight.type,
        category: insight.category,
        data: {
          content: insight.content,
          relatedTopics: insight.relatedTopics || [],
          userSpecific: insight.userSpecific || false,
          sessionContext: context?.sessionContext || {},
          derivedFrom: context?.conversationId || null,
          timestamp: new Date().toISOString()
        },
        confidence: insight.confidence.toString(),
        frequency: insight.frequency,
        lastSeen: new Date()
      };

      await db.insert(agentLearning).values(learningData);

      // Also store in knowledge base if it's a significant insight
      if (insight.confidence > 0.7) {
        await this.updateKnowledgeBase(agentName, insight);
      }

      // Update performance metrics
      await this.updatePerformanceMetrics(agentName, insight.type, true);

    } catch (error) {
      console.error('Error storing agent memory:', error);
      throw error;
    }
  }

  /**
   * Intelligent memory retrieval with context matching
   */
  async retrieveRelevantMemories(
    agentName: string,
    userId: string,
    currentContext: string,
    limit: number = 10
  ): Promise<AgentLearning[]> {
    try {
      // Get recent high-confidence memories
      const recentMemories = await db
        .select()
        .from(agentLearning)
        .where(
          and(
            eq(agentLearning.agentName, agentName),
            eq(agentLearning.userId, userId),
            gte(agentLearning.confidence, sql`0.5`)
          )
        )
        .orderBy(desc(agentLearning.lastSeen))
        .limit(limit);

      // TODO: Add semantic similarity matching for context relevance
      return recentMemories;

    } catch (error) {
      console.error('Error retrieving memories:', error);
      return [];
    }
  }

  /**
   * Cross-agent knowledge sharing for collaborative learning
   */
  async shareKnowledgeAcrossAgents(
    sourceAgent: string,
    targetAgents: string[],
    knowledgeTopic: string,
    minConfidence: number = 0.8
  ): Promise<void> {
    try {
      // Get high-confidence knowledge from source agent
      const sharedKnowledge = await db
        .select()
        .from(agentKnowledgeBase)
        .where(
          and(
            eq(agentKnowledgeBase.agentId, sourceAgent),
            eq(agentKnowledgeBase.topic, knowledgeTopic),
            gte(agentKnowledgeBase.confidence, sql`${minConfidence}`)
          )
        );

      // Distribute to target agents with reduced confidence
      for (const knowledge of sharedKnowledge) {
        for (const targetAgent of targetAgents) {
          const sharedEntry: InsertAgentKnowledgeBase = {
            agentId: targetAgent,
            topic: knowledge.topic,
            content: knowledge.content,
            source: `shared_from_${sourceAgent}`,
            confidence: (parseFloat(knowledge.confidence) * 0.8).toString(), // Reduce confidence for shared knowledge
            tags: [...(knowledge.tags || []), 'shared_knowledge']
          };

          await db.insert(agentKnowledgeBase).values(sharedEntry);
        }
      }

    } catch (error) {
      console.error('Error sharing knowledge across agents:', error);
      throw error;
    }
  }

  /**
   * Advanced pattern recognition from conversation history
   */
  async analyzeConversationPatterns(
    agentName: string,
    userId: string,
    timeframe: number = 30 // days
  ): Promise<MemoryInsight[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframe);

      // Get recent conversations
      const conversations = await db
        .select()
        .from(claudeConversations)
        .where(
          and(
            eq(claudeConversations.agentName, agentName),
            eq(claudeConversations.userId, userId),
            gte(claudeConversations.createdAt, cutoffDate)
          )
        );

      const insights: MemoryInsight[] = [];

      for (const conversation of conversations) {
        // Get messages for this conversation
        const messages = await db
          .select()
          .from(claudeMessages)
          .where(eq(claudeMessages.conversationId, conversation.id))
          .orderBy(claudeMessages.timestamp);

        // Analyze patterns (this is where you'd implement NLP/ML analysis)
        const patterns = await this.extractPatternsFromMessages(messages);
        insights.push(...patterns);
      }

      return insights;

    } catch (error) {
      console.error('Error analyzing conversation patterns:', error);
      return [];
    }
  }

  /**
   * Memory consolidation - merge similar memories and strengthen frequently accessed ones
   */
  async consolidateMemories(agentName: string, userId: string): Promise<void> {
    try {
      // Get all memories for this agent-user pair
      const memories = await db
        .select()
        .from(agentLearning)
        .where(
          and(
            eq(agentLearning.agentName, agentName),
            eq(agentLearning.userId, userId)
          )
        );

      // Group similar memories by category and content similarity
      const groupedMemories = this.groupSimilarMemories(memories);

      // Consolidate each group
      for (const group of groupedMemories) {
        if (group.length > 1) {
          await this.mergeMemoryGroup(group);
        }
      }

    } catch (error) {
      console.error('Error consolidating memories:', error);
      throw error;
    }
  }

  /**
   * Get memory statistics for agent performance analysis
   */
  async getMemoryStats(agentName: string): Promise<{
    totalMemories: number;
    averageConfidence: number;
    topCategories: Array<{ category: string; count: number }>;
    learningTrend: 'improving' | 'stable' | 'declining';
  }> {
    try {
      // Total memories
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(agentLearning)
        .where(eq(agentLearning.agentName, agentName));

      const totalMemories = totalResult[0]?.count || 0;

      // Average confidence
      const avgResult = await db
        .select({ avg: sql<number>`avg(cast(confidence as decimal))` })
        .from(agentLearning)
        .where(eq(agentLearning.agentName, agentName));

      const averageConfidence = avgResult[0]?.avg || 0;

      // Top categories
      const categoryResult = await db
        .select({
          category: agentLearning.category,
          count: sql<number>`count(*)`
        })
        .from(agentLearning)
        .where(eq(agentLearning.agentName, agentName))
        .groupBy(agentLearning.category)
        .orderBy(sql`count(*) desc`)
        .limit(5);

      const topCategories = categoryResult.map(r => ({
        category: r.category || 'unknown',
        count: r.count
      }));

      // Learning trend analysis (simplified)
      const recentMemories = await db
        .select()
        .from(agentLearning)
        .where(eq(agentLearning.agentName, agentName))
        .orderBy(desc(agentLearning.createdAt))
        .limit(20);

      const learningTrend = this.analyzeLearningTrend(recentMemories);

      return {
        totalMemories,
        averageConfidence,
        topCategories,
        learningTrend
      };

    } catch (error) {
      console.error('Error getting memory stats:', error);
      throw error;
    }
  }

  // Private helper methods

  private async updateKnowledgeBase(agentName: string, insight: MemoryInsight): Promise<void> {
    const knowledgeEntry: InsertAgentKnowledgeBase = {
      agentId: agentName,
      topic: insight.category,
      content: insight.content,
      source: 'conversation',
      confidence: insight.confidence.toString(),
      tags: insight.relatedTopics || []
    };

    await db.insert(agentKnowledgeBase).values(knowledgeEntry);
  }

  private async updatePerformanceMetrics(
    agentName: string, 
    taskType: string, 
    success: boolean
  ): Promise<void> {
    // This would update the agent's performance metrics
    // Implementation depends on your specific metrics tracking needs
    console.log(`Updating performance metrics for ${agentName}: ${taskType} - ${success}`);
  }

  private async extractPatternsFromMessages(messages: any[]): Promise<MemoryInsight[]> {
    // This is where you'd implement sophisticated pattern recognition
    // For now, return basic patterns
    const insights: MemoryInsight[] = [];

    // Example: Detect user preferences from message patterns
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length > 5) {
      insights.push({
        type: 'preference',
        category: 'communication_style',
        content: 'User prefers detailed explanations',
        confidence: 0.7,
        frequency: userMessages.length,
        lastSeen: new Date(),
        userSpecific: true
      });
    }

    return insights;
  }

  private groupSimilarMemories(memories: AgentLearning[]): AgentLearning[][] {
    // Implement memory grouping logic based on similarity
    // For now, group by category
    const groups: { [key: string]: AgentLearning[] } = {};
    
    memories.forEach(memory => {
      const key = `${memory.category}_${memory.learningType}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(memory);
    });

    return Object.values(groups);
  }

  private async mergeMemoryGroup(group: AgentLearning[]): Promise<void> {
    // Implement memory merging logic
    // This would combine similar memories into a stronger, more confident memory
    console.log(`Merging ${group.length} similar memories`);
  }

  private analyzeLearningTrend(recentMemories: AgentLearning[]): 'improving' | 'stable' | 'declining' {
    // Analyze confidence trends over time
    if (recentMemories.length < 5) return 'stable';

    const confidences = recentMemories.map(m => parseFloat(m.confidence));
    const firstHalf = confidences.slice(0, Math.floor(confidences.length / 2));
    const secondHalf = confidences.slice(Math.floor(confidences.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const improvement = secondAvg - firstAvg;
    
    if (improvement > 0.1) return 'improving';
    if (improvement < -0.1) return 'declining';
    return 'stable';
  }
}

// Export singleton instance
export const agentMemory = new EnhancedAgentMemory();