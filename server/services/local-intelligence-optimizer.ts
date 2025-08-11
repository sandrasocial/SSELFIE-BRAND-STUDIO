/**
 * LOCAL INTELLIGENCE OPTIMIZER - ZARA'S TOKEN OPTIMIZATION
 * Redirects agent operations to local systems while preserving intelligence
 * SAVES TOKENS: Replaces Claude API calls with local processing where appropriate
 */

import { simpleMemoryService } from './simple-memory-service.js';
import { db } from '../db.js';
import { agentLearning, agentSessionContexts } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';

export class LocalIntelligenceOptimizer {
  private static instance: LocalIntelligenceOptimizer;
  
  // Local pattern cache to avoid repeated API calls
  private patternCache = new Map<string, any>();
  private insightsCache = new Map<string, any>();
  
  public static getInstance(): LocalIntelligenceOptimizer {
    if (!LocalIntelligenceOptimizer.instance) {
      LocalIntelligenceOptimizer.instance = new LocalIntelligenceOptimizer();
    }
    return LocalIntelligenceOptimizer.instance;
  }

  /**
   * LOCAL LEARNING INSIGHTS - ZERO TOKEN USAGE
   * Replaces expensive Claude API calls with local database analysis
   */
  async getLocalLearningInsights(agentName: string, userId: string): Promise<any> {
    const cacheKey = `${agentName}_${userId}_insights`;
    
    // Check local cache first (5 minute expiry)
    const cached = this.insightsCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < 300000) {
      console.log(`🧠 LOCAL INSIGHTS: Using cached data for ${agentName} (${cached.totalPatterns} patterns)`);
      return cached.data;
    }
    
    try {
      const normalizedAgentName = agentName.toLowerCase();
      
      // LOCAL DATABASE QUERY - NO API TOKENS USED
      const learningData = await db
        .select()
        .from(agentLearning)
        .where(and(
          eq(agentLearning.agentName, normalizedAgentName),
          eq(agentLearning.userId, userId)
        ))
        .orderBy(desc(agentLearning.lastSeen))
        .limit(100);

      // LOCAL PATTERN ANALYSIS - NO API TOKENS USED
      const insights = this.analyzeLocalPatterns(learningData);
      
      // Cache locally for performance
      this.insightsCache.set(cacheKey, {
        data: insights,
        timestamp: Date.now()
      });
      
      console.log(`🧠 LOCAL INSIGHTS: Generated for ${agentName} - ${insights.totalPatterns} patterns, ${Object.keys(insights.categories).length} categories`);
      return insights;
      
    } catch (error) {
      console.error(`❌ LOCAL INSIGHTS: Failed for ${agentName}:`, error);
      return { totalPatterns: 0, categories: {}, recentActivity: [], confidenceAverage: 0 };
    }
  }

  /**
   * LOCAL PATTERN ANALYSIS - ZERO TOKEN USAGE
   * Replaces Claude API pattern extraction with local algorithms
   */
  private analyzeLocalPatterns(learningData: any[]): any {
    const insights = {
      totalPatterns: learningData.length,
      categories: {} as Record<string, any>,
      recentActivity: learningData.slice(0, 10),
      confidenceAverage: 0,
      topPatterns: [] as any[],
      trendAnalysis: this.calculateLocalTrends(learningData)
    };

    // LOCAL GROUPING AND ANALYSIS - NO API TOKENS
    for (const pattern of learningData) {
      const category = pattern.category || 'general';
      if (!insights.categories[category]) {
        insights.categories[category] = {
          count: 0,
          avgConfidence: 0,
          patterns: [],
          growth: 0
        };
      }
      
      insights.categories[category].count++;
      insights.categories[category].patterns.push(pattern);
    }

    // Calculate averages locally
    for (const category in insights.categories) {
      const categoryData = insights.categories[category];
      categoryData.avgConfidence = categoryData.patterns.reduce((sum: number, p: any) => 
        sum + parseFloat(p.confidence?.toString() || '0'), 0) / categoryData.patterns.length;
    }

    // Overall confidence calculation
    insights.confidenceAverage = learningData.reduce((sum, p) => 
      sum + parseFloat(p.confidence?.toString() || '0'), 0) / (learningData.length || 1);

    // Identify top patterns locally
    insights.topPatterns = learningData
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, 5);

    return insights;
  }

  /**
   * LOCAL TREND CALCULATION - ZERO TOKEN USAGE
   */
  private calculateLocalTrends(learningData: any[]): any {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentPatterns = learningData.filter(p => 
      new Date(p.lastSeen) > weekAgo
    ).length;
    
    const olderPatterns = learningData.length - recentPatterns;
    const growthRate = olderPatterns > 0 ? (recentPatterns / olderPatterns) : 1;
    
    return {
      weeklyGrowth: growthRate,
      recentActivity: recentPatterns,
      isGrowing: growthRate > 1.1,
      activityLevel: recentPatterns > 10 ? 'high' : recentPatterns > 5 ? 'medium' : 'low'
    };
  }

  /**
   * LOCAL PATTERN EXTRACTION - ZERO TOKEN USAGE
   * Replaces Claude API pattern extraction with local text analysis
   */
  extractLocalPatterns(userMessage: string, assistantMessage: string): any[] {
    const patterns: any[] = [];
    
    // LOCAL TEXT ANALYSIS - NO API TOKENS
    const messageLength = userMessage.length;
    const responseLength = assistantMessage.length;
    
    // Detect conversation patterns locally
    if (userMessage.toLowerCase().includes('fix') || userMessage.toLowerCase().includes('error')) {
      patterns.push({
        type: 'troubleshooting',
        category: 'technical',
        data: { 
          userMessageLength: messageLength,
          responseLength: responseLength,
          keywords: this.extractLocalKeywords(userMessage)
        }
      });
    }
    
    if (userMessage.toLowerCase().includes('build') || userMessage.toLowerCase().includes('create')) {
      patterns.push({
        type: 'development',
        category: 'creation',
        data: {
          requestType: 'build',
          complexity: messageLength > 200 ? 'high' : 'medium'
        }
      });
    }
    
    if (assistantMessage.includes('✅') || assistantMessage.includes('success')) {
      patterns.push({
        type: 'success',
        category: 'outcome',
        data: {
          completionIndicators: (assistantMessage.match(/✅/g) || []).length,
          responsePositivity: 'positive'
        }
      });
    }
    
    // Tool usage patterns
    if (assistantMessage.includes('str_replace_based_edit_tool') || assistantMessage.includes('bash')) {
      patterns.push({
        type: 'tool_usage',
        category: 'automation',
        data: {
          toolsDetected: this.detectLocalToolUsage(assistantMessage),
          workflowType: 'file_editing'
        }
      });
    }
    
    console.log(`🔍 LOCAL PATTERNS: Extracted ${patterns.length} patterns without API calls`);
    return patterns;
  }

  /**
   * LOCAL KEYWORD EXTRACTION - ZERO TOKEN USAGE
   */
  private extractLocalKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 10); // Top 10 keywords
  }

  /**
   * LOCAL TOOL DETECTION - ZERO TOKEN USAGE
   */
  private detectLocalToolUsage(text: string): string[] {
    const tools = [];
    if (text.includes('str_replace_based_edit_tool')) tools.push('file_editor');
    if (text.includes('bash')) tools.push('terminal');
    if (text.includes('search_filesystem')) tools.push('file_search');
    if (text.includes('execute_sql_tool')) tools.push('database');
    if (text.includes('web_search')) tools.push('web_research');
    return tools;
  }

  /**
   * LOCAL SESSION UPDATE - ZERO TOKEN USAGE
   * Replaces API calls with direct database operations
   */
  async updateLocalSessionContext(userId: string, agentName: string, conversationId: string, context: any): Promise<void> {
    try {
      const normalizedAgentName = agentName.toLowerCase();
      
      // LOCAL CONTEXT ANALYSIS - NO API TOKENS
      const contextData = {
        lastConversationId: conversationId,
        recentInteractions: context,
        timestamp: new Date().toISOString(),
        interactionType: this.classifyLocalInteraction(context),
        mood: this.detectLocalMood(context),
        complexity: this.assessLocalComplexity(context)
      };

      // DIRECT DATABASE OPERATION - NO API TOKENS
      const existing = await db
        .select()
        .from(agentSessionContexts)
        .where(and(
          eq(agentSessionContexts.userId, userId),
          eq(agentSessionContexts.agentId, normalizedAgentName)
        ))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(agentSessionContexts)
          .set({
            contextData: contextData,
            lastInteraction: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(agentSessionContexts.id, existing[0].id));
      } else {
        await db.insert(agentSessionContexts).values({
          userId: userId,
          agentId: normalizedAgentName,
          sessionId: `${userId}_${normalizedAgentName}_session`,
          contextData: contextData,
          workflowState: 'active',
          lastInteraction: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      console.log(`🔄 LOCAL SESSION: Updated for ${normalizedAgentName} (${contextData.interactionType})`);
    } catch (error) {
      console.error(`❌ LOCAL SESSION: Failed for ${agentName}:`, error);
    }
  }

  /**
   * LOCAL INTERACTION CLASSIFICATION - ZERO TOKEN USAGE
   */
  private classifyLocalInteraction(context: any): string {
    const message = context.message || '';
    
    if (message.includes('build') || message.includes('create')) return 'creation';
    if (message.includes('fix') || message.includes('error')) return 'troubleshooting';
    if (message.includes('optimize') || message.includes('improve')) return 'optimization';
    if (message.includes('deploy') || message.includes('launch')) return 'deployment';
    if (context.toolsUsed && context.toolsUsed.length > 0) return 'automation';
    
    return 'conversation';
  }

  /**
   * LOCAL MOOD DETECTION - ZERO TOKEN USAGE
   */
  private detectLocalMood(context: any): string {
    const response = context.response || '';
    
    if (response.includes('✅') || response.includes('success')) return 'positive';
    if (response.includes('❌') || response.includes('error')) return 'problem-solving';
    if (response.includes('🚀') || response.includes('deployed')) return 'accomplished';
    if (response.includes('🔍') || response.includes('analyzing')) return 'investigative';
    
    return 'neutral';
  }

  /**
   * LOCAL COMPLEXITY ASSESSMENT - ZERO TOKEN USAGE
   */
  private assessLocalComplexity(context: any): string {
    const toolCount = (context.toolsUsed || []).length;
    const messageLength = (context.message || '').length;
    const responseLength = (context.response || '').length;
    
    if (toolCount > 3 || responseLength > 2000) return 'high';
    if (toolCount > 1 || messageLength > 500) return 'medium';
    return 'low';
  }

  /**
   * SMART CACHE MANAGEMENT
   */
  clearExpiredCache(): void {
    const now = Date.now();
    const expiryTime = 300000; // 5 minutes
    
    for (const [key, value] of this.insightsCache.entries()) {
      if (now - (value as any).timestamp > expiryTime) {
        this.insightsCache.delete(key);
      }
    }
    
    console.log(`🧹 LOCAL CACHE: Cleared expired entries, ${this.insightsCache.size} entries remain`);
  }
}

// Export singleton instance
export const localIntelligenceOptimizer = LocalIntelligenceOptimizer.getInstance();