/**
 * ACTIVE LEARNING ENGINE
 * Captures successful interaction patterns, implements confidence scoring,
 * and creates learning feedback loops for continuous agent improvement
 */

import { db } from '../db';
import { claudeConversations, claudeMessages } from '../../shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

export interface LearningPattern {
  id: string;
  agentName: string;
  patternType: 'successful_task' | 'user_satisfaction' | 'workflow_completion' | 'error_resolution';
  pattern: string;
  contextTags: string[];
  successRate: number;
  userSatisfactionScore: number;
  timesUsed: number;
  lastUsed: Date;
  effectiveness: number;
}

export interface ConfidenceScore {
  overall: number;
  taskCompletion: number;
  userSatisfaction: number;
  technicalAccuracy: number;
  responseQuality: number;
  factors: {
    historicalSuccess: number;
    patternMatch: number;
    contextRelevance: number;
    userFeedback: number;
  };
}

export interface LearningMetrics {
  agentName: string;
  totalInteractions: number;
  successfulTasks: number;
  averageConfidenceScore: number;
  improvementTrend: number;
  specializations: string[];
  weaknesses: string[];
  recommendedTraining: string[];
}

export class AgentLearningEngine {
  private static instance: AgentLearningEngine;
  private learningPatterns = new Map<string, LearningPattern[]>();
  private confidenceCache = new Map<string, ConfidenceScore>();

  public static getInstance(): AgentLearningEngine {
    if (!AgentLearningEngine.instance) {
      AgentLearningEngine.instance = new AgentLearningEngine();
    }
    return AgentLearningEngine.instance;
  }

  /**
   * Calculate confidence score for an agent's response
   */
  async calculateConfidenceScore(
    agentName: string,
    message: string,
    context: any[] = []
  ): Promise<ConfidenceScore> {
    try {
      const cacheKey = `${agentName}-${message.substring(0, 50)}`;
      
      // Check cache for recent calculations
      if (this.confidenceCache.has(cacheKey)) {
        return this.confidenceCache.get(cacheKey)!;
      }

      // Get historical success rate
      const historicalSuccess = await this.getHistoricalSuccessRate(agentName);
      
      // Analyze pattern matching
      const patternMatch = await this.analyzePatternMatch(agentName, message);
      
      // Calculate context relevance
      const contextRelevance = this.calculateContextRelevance(agentName, message, context);
      
      // Get user feedback score
      const userFeedback = await this.getUserFeedbackScore(agentName);

      // Calculate component scores
      const taskCompletion = (historicalSuccess * 0.4) + (patternMatch * 0.6);
      const userSatisfaction = (userFeedback * 0.7) + (contextRelevance * 0.3);
      const technicalAccuracy = (historicalSuccess * 0.5) + (patternMatch * 0.5);
      const responseQuality = (patternMatch * 0.4) + (contextRelevance * 0.3) + (userFeedback * 0.3);

      // Calculate overall confidence
      const overall = (taskCompletion * 0.3) + 
                     (userSatisfaction * 0.25) + 
                     (technicalAccuracy * 0.25) + 
                     (responseQuality * 0.2);

      const confidenceScore: ConfidenceScore = {
        overall: Math.min(100, Math.max(0, overall)),
        taskCompletion: Math.min(100, Math.max(0, taskCompletion)),
        userSatisfaction: Math.min(100, Math.max(0, userSatisfaction)),
        technicalAccuracy: Math.min(100, Math.max(0, technicalAccuracy)),
        responseQuality: Math.min(100, Math.max(0, responseQuality)),
        factors: {
          historicalSuccess: Math.min(100, Math.max(0, historicalSuccess)),
          patternMatch: Math.min(100, Math.max(0, patternMatch)),
          contextRelevance: Math.min(100, Math.max(0, contextRelevance)),
          userFeedback: Math.min(100, Math.max(0, userFeedback))
        }
      };

      // Cache the result
      this.confidenceCache.set(cacheKey, confidenceScore);

      return confidenceScore;

    } catch (error) {
      console.error(`❌ CONFIDENCE CALCULATION ERROR for ${agentName}:`, error);
      return {
        overall: 50,
        taskCompletion: 50,
        userSatisfaction: 50,
        technicalAccuracy: 50,
        responseQuality: 50,
        factors: {
          historicalSuccess: 50,
          patternMatch: 50,
          contextRelevance: 50,
          userFeedback: 50
        }
      };
    }
  }

  /**
   * Record successful pattern for learning
   */
  async recordSuccessfulPattern(
    agentName: string,
    patternType: LearningPattern['patternType'],
    pattern: string,
    contextTags: string[],
    userSatisfactionScore: number = 85
  ): Promise<void> {
    try {
      const patternId = `${agentName}-${patternType}-${Date.now()}`;
      
      const learningPattern: LearningPattern = {
        id: patternId,
        agentName,
        patternType,
        pattern,
        contextTags,
        successRate: 100, // Start with 100% for new successful patterns
        userSatisfactionScore,
        timesUsed: 1,
        lastUsed: new Date(),
        effectiveness: userSatisfactionScore
      };

      // Store in memory cache
      if (!this.learningPatterns.has(agentName)) {
        this.learningPatterns.set(agentName, []);
      }
      this.learningPatterns.get(agentName)!.push(learningPattern);

      // Keep only last 100 patterns per agent
      const patterns = this.learningPatterns.get(agentName)!;
      if (patterns.length > 100) {
        this.learningPatterns.set(agentName, patterns.slice(-100));
      }

      console.log(`✅ LEARNING PATTERN RECORDED: ${agentName} - ${patternType}`);

    } catch (error) {
      console.error(`❌ PATTERN RECORDING ERROR for ${agentName}:`, error);
    }
  }

  /**
   * Get learning metrics for an agent
   */
  async getLearningMetrics(agentName: string, userId: string): Promise<LearningMetrics> {
    try {
      const conversations = await db
        .select()
        .from(claudeConversations)
        .where(
          and(
            eq(claudeConversations.userId, userId),
            eq(claudeConversations.agentName, agentName),
            gte(claudeConversations.createdAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) // Last 30 days
          )
        );

      let totalInteractions = 0;
      let successfulTasks = 0;
      const specializations = new Set<string>();
      const weaknesses = new Set<string>();

      for (const conversation of conversations) {
        const messages = await db
          .select()
          .from(claudeMessages)
          .where(eq(claudeMessages.conversationId, conversation.id));

        totalInteractions += messages.filter(m => m.role === 'assistant').length;
        successfulTasks += messages.filter(m => m.toolCallsSuccess).length;

        // Analyze specializations and weaknesses
        messages.forEach(msg => {
          if (msg.content) {
            const content = msg.content.toLowerCase();
            
            // Identify specializations (successful tasks)
            if (msg.toolCallsSuccess) {
              if (content.includes('design') || content.includes('ui')) specializations.add('Design & UI');
              if (content.includes('technical') || content.includes('code')) specializations.add('Technical Implementation');
              if (content.includes('workflow') || content.includes('coordinate')) specializations.add('Workflow Coordination');
              if (content.includes('optimization')) specializations.add('Performance Optimization');
            } else {
              // Identify weaknesses (failed tasks)
              if (content.includes('error') || content.includes('failed')) {
                if (content.includes('file') || content.includes('path')) weaknesses.add('File Operations');
                if (content.includes('api') || content.includes('endpoint')) weaknesses.add('API Integration');
                if (content.includes('database') || content.includes('sql')) weaknesses.add('Database Operations');
              }
            }
          }
        });
      }

      const successRate = totalInteractions > 0 ? (successfulTasks / totalInteractions) * 100 : 0;
      
      // Calculate improvement trend (compare last 7 days vs previous 7 days)
      const recentSuccess = await this.getRecentSuccessRate(agentName, userId, 7);
      const previousSuccess = await this.getRecentSuccessRate(agentName, userId, 14, 7);
      const improvementTrend = recentSuccess - previousSuccess;

      // Generate training recommendations
      const recommendedTraining: string[] = [];
      if (successRate < 70) recommendedTraining.push('Task Completion Accuracy');
      if (weaknesses.has('File Operations')) recommendedTraining.push('File System Operations');
      if (weaknesses.has('API Integration')) recommendedTraining.push('API Development Patterns');
      if (specializations.size < 2) recommendedTraining.push('Skill Diversification');

      return {
        agentName,
        totalInteractions,
        successfulTasks,
        averageConfidenceScore: successRate,
        improvementTrend,
        specializations: Array.from(specializations),
        weaknesses: Array.from(weaknesses),
        recommendedTraining
      };

    } catch (error) {
      console.error(`❌ METRICS ERROR for ${agentName}:`, error);
      return {
        agentName,
        totalInteractions: 0,
        successfulTasks: 0,
        averageConfidenceScore: 0,
        improvementTrend: 0,
        specializations: [],
        weaknesses: [],
        recommendedTraining: ['System Integration Check']
      };
    }
  }

  /**
   * Implement learning feedback loop
   */
  async processFeedbackLoop(
    agentName: string,
    userMessage: string,
    agentResponse: string,
    userSatisfaction: number,
    taskSuccess: boolean
  ): Promise<void> {
    try {
      // Record the interaction pattern
      if (taskSuccess && userSatisfaction >= 70) {
        await this.recordSuccessfulPattern(
          agentName,
          'successful_task',
          `${userMessage.substring(0, 100)} -> ${agentResponse.substring(0, 100)}`,
          this.extractContextTags(userMessage),
          userSatisfaction
        );
      }

      // Update existing patterns
      const patterns = this.learningPatterns.get(agentName) || [];
      patterns.forEach(pattern => {
        if (this.isPatternMatch(pattern.pattern, userMessage)) {
          pattern.timesUsed += 1;
          pattern.lastUsed = new Date();
          
          // Update effectiveness with weighted average
          const weight = 0.3; // How much new feedback affects the score
          pattern.effectiveness = (pattern.effectiveness * (1 - weight)) + (userSatisfaction * weight);
          
          // Update success rate
          if (taskSuccess) {
            pattern.successRate = (pattern.successRate * 0.9) + (100 * 0.1);
          } else {
            pattern.successRate = (pattern.successRate * 0.9) + (0 * 0.1);
          }
        }
      });

      console.log(`✅ FEEDBACK PROCESSED: ${agentName} - Satisfaction: ${userSatisfaction}%`);

    } catch (error) {
      console.error(`❌ FEEDBACK PROCESSING ERROR for ${agentName}:`, error);
    }
  }

  /**
   * Get historical success rate for an agent
   */
  private async getHistoricalSuccessRate(agentName: string): Promise<number> {
    try {
      const result = await db
        .select({
          totalTasks: sql<number>`COUNT(*)`,
          successfulTasks: sql<number>`SUM(CASE WHEN tool_calls_success = true THEN 1 ELSE 0 END)`
        })
        .from(claudeMessages)
        .innerJoin(claudeConversations, eq(claudeMessages.conversationId, claudeConversations.id))
        .where(
          and(
            eq(claudeConversations.agentName, agentName),
            gte(claudeMessages.timestamp, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          )
        );

      if (result.length > 0 && result[0].totalTasks > 0) {
        return (result[0].successfulTasks / result[0].totalTasks) * 100;
      }
      return 70; // Default confidence for new agents

    } catch (error) {
      console.error(`❌ HISTORICAL SUCCESS RATE ERROR for ${agentName}:`, error);
      return 70;
    }
  }

  /**
   * Analyze pattern matching for confidence scoring
   */
  private async analyzePatternMatch(agentName: string, message: string): Promise<number> {
    const patterns = this.learningPatterns.get(agentName) || [];
    
    if (patterns.length === 0) return 60; // Default for agents without patterns
    
    let bestMatch = 0;
    patterns.forEach(pattern => {
      const matchScore = this.calculatePatternSimilarity(pattern.pattern, message);
      if (matchScore > bestMatch) {
        bestMatch = matchScore;
      }
    });
    
    return bestMatch;
  }

  /**
   * Calculate context relevance score
   */
  private calculateContextRelevance(agentName: string, message: string, context: any[]): Promise<number> {
    // Agent specialization mapping
    const agentSpecializations: Record<string, string[]> = {
      'elena': ['coordination', 'workflow', 'strategy'],
      'aria': ['design', 'ui', 'visual'],
      'zara': ['technical', 'code', 'architecture'],
      'maya': ['ai', 'photography', 'styling'],
      'victoria': ['ux', 'conversion', 'user'],
      'rachel': ['copy', 'voice', 'brand'],
      'ava': ['automation', 'workflow', 'process'],
      'quinn': ['quality', 'testing', 'standards'],
      'sophia': ['social', 'media', 'community'],
      'martha': ['marketing', 'ads', 'revenue'],
      'diana': ['business', 'strategy', 'coaching'],
      'wilma': ['workflow', 'process', 'efficiency'],
      'olga': ['organization', 'cleanup', 'files']
    };

    const specializations = agentSpecializations[agentName.toLowerCase()] || [];
    const messageLower = message.toLowerCase();
    
    let relevanceScore = 0;
    specializations.forEach(spec => {
      if (messageLower.includes(spec)) {
        relevanceScore += 20;
      }
    });
    
    return Promise.resolve(Math.min(100, relevanceScore + 40)); // Base 40 + specialization bonus
  }

  /**
   * Get user feedback score for an agent
   */
  private async getUserFeedbackScore(agentName: string): Promise<number> {
    const patterns = this.learningPatterns.get(agentName) || [];
    
    if (patterns.length === 0) return 75; // Default score
    
    const totalSatisfaction = patterns.reduce((sum, pattern) => sum + pattern.userSatisfactionScore, 0);
    return totalSatisfaction / patterns.length;
  }

  /**
   * Get recent success rate for trend analysis
   */
  private async getRecentSuccessRate(agentName: string, userId: string, days: number, offset: number = 0): Promise<number> {
    try {
      const startDate = new Date(Date.now() - (days + offset) * 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() - offset * 24 * 60 * 60 * 1000);

      const result = await db
        .select({
          totalTasks: sql<number>`COUNT(*)`,
          successfulTasks: sql<number>`SUM(CASE WHEN tool_calls_success = true THEN 1 ELSE 0 END)`
        })
        .from(claudeMessages)
        .innerJoin(claudeConversations, eq(claudeMessages.conversationId, claudeConversations.id))
        .where(
          and(
            eq(claudeConversations.agentName, agentName),
            eq(claudeConversations.userId, userId),
            gte(claudeMessages.timestamp, startDate),
            sql`timestamp <= ${endDate}`
          )
        );

      if (result.length > 0 && result[0].totalTasks > 0) {
        return (result[0].successfulTasks / result[0].totalTasks) * 100;
      }
      return 0;

    } catch (error) {
      console.error(`❌ RECENT SUCCESS RATE ERROR for ${agentName}:`, error);
      return 0;
    }
  }

  /**
   * Extract context tags from user message
   */
  private extractContextTags(message: string): string[] {
    const tags: string[] = [];
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('create') || messageLower.includes('build')) tags.push('creation');
    if (messageLower.includes('fix') || messageLower.includes('resolve')) tags.push('problem_solving');
    if (messageLower.includes('optimize') || messageLower.includes('improve')) tags.push('optimization');
    if (messageLower.includes('design') || messageLower.includes('ui')) tags.push('design');
    if (messageLower.includes('urgent') || messageLower.includes('critical')) tags.push('urgent');
    if (messageLower.includes('file') || messageLower.includes('component')) tags.push('file_operation');
    
    return tags;
  }

  /**
   * Check if a pattern matches a message
   */
  private isPatternMatch(pattern: string, message: string): boolean {
    const patternWords = pattern.toLowerCase().split(' ').slice(0, 10); // First 10 words
    const messageWords = message.toLowerCase().split(' ');
    
    let matchCount = 0;
    patternWords.forEach(word => {
      if (messageWords.includes(word)) {
        matchCount++;
      }
    });
    
    return matchCount >= Math.min(3, patternWords.length * 0.5); // At least 50% word match
  }

  /**
   * Calculate pattern similarity score
   */
  private calculatePatternSimilarity(pattern: string, message: string): number {
    const patternWords = pattern.toLowerCase().split(' ');
    const messageWords = message.toLowerCase().split(' ');
    
    let matchCount = 0;
    patternWords.forEach(word => {
      if (messageWords.includes(word)) {
        matchCount++;
      }
    });
    
    return Math.min(100, (matchCount / Math.max(patternWords.length, messageWords.length)) * 100);
  }

  /**
   * Clear learning cache
   */
  clearCache(): void {
    this.learningPatterns.clear();
    this.confidenceCache.clear();
    console.log('🔄 LEARNING CACHE CLEARED');
  }

  /**
   * Get learning statistics
   */
  getLearningStats(): { totalPatterns: number; totalAgents: number; cacheSize: string } {
    const totalPatterns = Array.from(this.learningPatterns.values()).reduce((sum, patterns) => sum + patterns.length, 0);
    return {
      totalPatterns,
      totalAgents: this.learningPatterns.size,
      cacheSize: `${JSON.stringify(Array.from(this.learningPatterns.values())).length} bytes`
    };
  }
}

// Export singleton instance
export const agentLearningEngine = AgentLearningEngine.getInstance();