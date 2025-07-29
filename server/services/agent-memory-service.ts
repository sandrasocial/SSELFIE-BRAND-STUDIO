import { db } from '../db';
import { agentLearning, claudeConversations, agentCapabilities } from '../../shared/schema';
import { eq, and, desc, gte } from 'drizzle-orm';

export class AgentMemoryService {
  
  // Enhanced memory storage with automatic pattern detection
  static async storeMemory(agentName: string, userId: string, memoryData: {
    type: 'preference' | 'pattern' | 'context' | 'skill';
    category: string;
    data: any;
    confidence?: number;
  }) {
    try {
      // Check if similar memory already exists
      const existing = await db
        .select()
        .from(agentLearning)
        .where(and(
          eq(agentLearning.agentName, agentName),
          eq(agentLearning.userId, userId),
          eq(agentLearning.category, memoryData.category)
        ))
        .limit(1);

      if (existing.length > 0) {
        // Update existing memory with increased frequency and confidence
        await db
          .update(agentLearning)
          .set({
            frequency: existing[0].frequency + 1,
            confidence: Math.min(1.0, existing[0].confidence + 0.1),
            lastSeen: new Date(),
            updatedAt: new Date()
          })
          .where(eq(agentLearning.id, existing[0].id));

        return { updated: true, memoryId: existing[0].id };
      } else {
        // Create new memory
        const newMemory = await db.insert(agentLearning).values({
          agentName,
          userId,
          learningType: memoryData.type,
          category: memoryData.category,
          data: memoryData.data,
          confidence: memoryData.confidence || 0.7,
          frequency: 1,
          lastSeen: new Date()
        }).returning();

        return { created: true, memoryId: newMemory[0].id };
      }
    } catch (error) {
      console.error('Memory storage error:', error);
      throw error;
    }
  }

  // Get contextual memory for agent responses
  static async getContextualMemory(agentName: string, userId: string) {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Get high-confidence, recent patterns
      const memories = await db
        .select()
        .from(agentLearning)
        .where(and(
          eq(agentLearning.agentName, agentName),
          eq(agentLearning.userId, userId),
          gte(agentLearning.confidence, 0.6)
        ))
        .orderBy(desc(agentLearning.confidence), desc(agentLearning.frequency))
        .limit(15);

      // Get recent conversation context
      const recentConversations = await db
        .select()
        .from(claudeConversations)
        .where(and(
          eq(claudeConversations.agentName, agentName),
          eq(claudeConversations.userId, userId),
          gte(claudeConversations.lastMessageAt, oneDayAgo)
        ))
        .orderBy(desc(claudeConversations.lastMessageAt))
        .limit(3);

      return {
        preferences: memories.filter(m => m.learningType === 'preference'),
        patterns: memories.filter(m => m.lerningType === 'pattern'),
        context: memories.filter(m => m.learningType === 'context'),
        recentContext: recentConversations.map(c => c.context),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Get contextual memory error:', error);
      return null;
    }
  }

  // Learn from user interactions automatically
  static async learnFromInteraction(agentName: string, userId: string, interaction: {
    userMessage: string;
    agentResponse: string;
    userFeedback?: 'positive' | 'negative' | 'neutral';
    duration: number;
  }) {
    try {
      // Detect patterns from user behavior
      const patterns = this.detectPatterns(interaction);

      for (const pattern of patterns) {
        await this.storeMemory(agentName, userId, {
          type: 'pattern',
          category: pattern.category,
          data: pattern.data,
          confidence: pattern.confidence
        });
      }

      // Store context for future reference
      await this.storeMemory(agentName, userId, {
        type: 'context',
        category: 'interaction_context',
        data: {
          timestamp: new Date().toISOString(),
          userMessage: interaction.userMessage.substring(0, 200),
          responseType: this.classifyResponse(interaction.agentResponse),
          feedback: interaction.userFeedback,
          duration: interaction.duration
        }
      });

    } catch (error) {
      console.error('Learn from interaction error:', error);
    }
  }

  // Pattern detection from user interactions  
  private static detectPatterns(interaction: any) {
    const patterns = [];

    // Detect communication preferences
    if (interaction.userMessage.length < 50) {
      patterns.push({
        category: 'communication_style',
        data: { prefers: 'brief_responses' },
        confidence: 0.6
      });
    } else if (interaction.userMessage.length > 200) {
      patterns.push({
        category: 'communication_style', 
        data: { prefers: 'detailed_responses' },
        confidence: 0.6
      });
    }

    // Detect technical level
    const technicalKeywords = ['api', 'database', 'component', 'typescript', 'react'];
    const techCount = technicalKeywords.filter(keyword => 
      interaction.userMessage.toLowerCase().includes(keyword)
    ).length;

    if (techCount >= 2) {
      patterns.push({
        category: 'technical_level',
        data: { level: 'advanced' },
        confidence: 0.7
      });
    }

    return patterns;
  }

  private static classifyResponse(response: string) {
    if (response.includes('```')) return 'code_implementation';
    if (response.includes('analysis') || response.includes('recommend')) return 'analysis';
    if (response.includes('created') || response.includes('modified')) return 'implementation';
    return 'general';
  }
}