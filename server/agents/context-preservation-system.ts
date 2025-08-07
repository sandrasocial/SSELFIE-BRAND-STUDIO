/**
 * CONTEXT PRESERVATION SYSTEM
 * Maintains agent memory and learning across conversations
 */

import { db } from '../db.js';
import { agentKnowledgeBase, agentSessionContexts } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface AgentContext {
  agentName: string;
  userId: string;
  currentTask: string;
  filesModified: string[];
  successfulPatterns: string[];
  failedAttempts: string[];
  lastWorkingState: any;
  projectContext: Record<string, any>;
}

export class ContextPreservationSystem {
  private static contextCache = new Map<string, AgentContext>();
  
  /**
   * Save agent context for future conversations
   */
  static async saveContext(
    agentName: string,
    userId: string,
    context: Partial<AgentContext>
  ): Promise<void> {
    const key = `${agentName}-${userId}`;
    
    // Update cache
    const existing = this.contextCache.get(key) || {
      agentName,
      userId,
      currentTask: '',
      filesModified: [],
      successfulPatterns: [],
      failedAttempts: [],
      lastWorkingState: {},
      projectContext: {}
    };
    
    const updated = { ...existing, ...context };
    this.contextCache.set(key, updated);
    
    // Persist to database
    try {
      await db.insert(agentSessionContexts).values({
        agentName: agentName.toLowerCase(),
        userId,
        sessionId: `${agentName}-${userId}-${Date.now()}`,
        context: updated,
        metadata: {
          timestamp: new Date().toISOString(),
          filesModified: updated.filesModified,
          task: updated.currentTask
        },
        createdAt: new Date()
      }).onConflictDoUpdate({
        target: [agentSessionContexts.agentName, agentSessionContexts.userId],
        set: {
          context: updated,
          metadata: {
            timestamp: new Date().toISOString(),
            filesModified: updated.filesModified,
            task: updated.currentTask
          }
        }
      });
      
      console.log(`💾 Context saved for ${agentName}: ${updated.currentTask}`);
    } catch (error) {
      console.error('Failed to persist context:', error);
    }
  }
  
  /**
   * Load agent context from previous conversations
   */
  static async loadContext(
    agentName: string,
    userId: string
  ): Promise<AgentContext | null> {
    const key = `${agentName}-${userId}`;
    
    // Check cache first
    if (this.contextCache.has(key)) {
      return this.contextCache.get(key)!;
    }
    
    // Load from database
    try {
      const [context] = await db
        .select()
        .from(agentSessionContexts)
        .where(
          and(
            eq(agentSessionContexts.agentName, agentName.toLowerCase()),
            eq(agentSessionContexts.userId, userId)
          )
        )
        .orderBy(desc(agentSessionContexts.createdAt))
        .limit(1);
      
      if (context && context.context) {
        const loaded = context.context as AgentContext;
        this.contextCache.set(key, loaded);
        console.log(`📚 Loaded context for ${agentName}: ${loaded.currentTask}`);
        return loaded;
      }
    } catch (error) {
      console.error('Failed to load context:', error);
    }
    
    return null;
  }
  
  /**
   * Record successful pattern for learning
   */
  static async recordSuccess(
    agentName: string,
    userId: string,
    pattern: string,
    details: any
  ): Promise<void> {
    const context = await this.loadContext(agentName, userId) || {
      agentName,
      userId,
      currentTask: '',
      filesModified: [],
      successfulPatterns: [],
      failedAttempts: [],
      lastWorkingState: {},
      projectContext: {}
    };
    
    context.successfulPatterns.push(pattern);
    context.lastWorkingState = details;
    
    await this.saveContext(agentName, userId, context);
    
    // Save to knowledge base for permanent learning
    try {
      await db.insert(agentKnowledgeBase).values({
        agentName: agentName.toLowerCase(),
        category: 'success_pattern',
        knowledge: {
          pattern,
          details,
          timestamp: new Date().toISOString()
        },
        confidence: 0.9,
        usageCount: 1,
        lastUsed: new Date(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to save to knowledge base:', error);
    }
  }
  
  /**
   * Record failed attempt for learning
   */
  static async recordFailure(
    agentName: string,
    userId: string,
    attempt: string,
    error: string
  ): Promise<void> {
    const context = await this.loadContext(agentName, userId) || {
      agentName,
      userId,
      currentTask: '',
      filesModified: [],
      successfulPatterns: [],
      failedAttempts: [],
      lastWorkingState: {},
      projectContext: {}
    };
    
    context.failedAttempts.push(`${attempt}: ${error}`);
    
    await this.saveContext(agentName, userId, context);
    
    // Save to knowledge base for learning what not to do
    try {
      await db.insert(agentKnowledgeBase).values({
        agentName: agentName.toLowerCase(),
        category: 'failed_pattern',
        knowledge: {
          attempt,
          error,
          timestamp: new Date().toISOString()
        },
        confidence: 0.8,
        usageCount: 1,
        lastUsed: new Date(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Failed to save failure pattern:', error);
    }
  }
  
  /**
   * Get agent's learned patterns
   */
  static async getLearnedPatterns(agentName: string): Promise<{
    successful: any[],
    failed: any[]
  }> {
    try {
      const patterns = await db
        .select()
        .from(agentKnowledgeBase)
        .where(eq(agentKnowledgeBase.agentName, agentName.toLowerCase()))
        .orderBy(desc(agentKnowledgeBase.lastUsed))
        .limit(20);
      
      const successful = patterns
        .filter(p => p.category === 'success_pattern')
        .map(p => p.knowledge);
      
      const failed = patterns
        .filter(p => p.category === 'failed_pattern')
        .map(p => p.knowledge);
      
      return { successful, failed };
    } catch (error) {
      console.error('Failed to get learned patterns:', error);
      return { successful: [], failed: [] };
    }
  }
  
  /**
   * Clear stale context older than 7 days
   */
  static async clearStaleContext(): Promise<void> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Clear old cache entries
    for (const [key, context] of this.contextCache.entries()) {
      if (!context.projectContext.lastAccess || 
          new Date(context.projectContext.lastAccess) < sevenDaysAgo) {
        this.contextCache.delete(key);
      }
    }
    
    console.log('🧹 Cleared stale context entries');
  }
  
  /**
   * Get context summary for agent prompt
   */
  static async getContextSummary(
    agentName: string,
    userId: string
  ): Promise<string> {
    const context = await this.loadContext(agentName, userId);
    
    if (!context) {
      return '';
    }
    
    const patterns = await this.getLearnedPatterns(agentName);
    
    let summary = '\n## PREVIOUS CONTEXT:\n';
    
    if (context.currentTask) {
      summary += `Last task: ${context.currentTask}\n`;
    }
    
    if (context.filesModified.length > 0) {
      summary += `Files worked on: ${context.filesModified.slice(-5).join(', ')}\n`;
    }
    
    if (patterns.successful.length > 0) {
      summary += `Successful patterns: ${patterns.successful.slice(0, 3).map(p => p.pattern).join(', ')}\n`;
    }
    
    if (patterns.failed.length > 0) {
      summary += `Avoid: ${patterns.failed.slice(0, 2).map(p => p.attempt).join(', ')}\n`;
    }
    
    return summary;
  }
}