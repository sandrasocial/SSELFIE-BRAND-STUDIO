/**
 * CONTEXT PRESERVATION SYSTEM
 * Maintains agent memory and learning across conversations
 */

import { db } from '../db.js';
import { eq, and, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

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
    
    // Persist to database with correct column names
    try {
      await db.execute(sql`
        INSERT INTO agent_session_contexts (
          user_id,
          agent_id,
          session_id,
          context_data,
          memory_snapshot,
          last_interaction,
          created_at,
          updated_at
        ) VALUES (
          ${userId},
          ${agentName.toLowerCase()},
          ${`${agentName}-${userId}-${Date.now()}`},
          ${JSON.stringify(updated)},
          ${JSON.stringify({
            timestamp: new Date().toISOString(),
            filesModified: updated.filesModified,
            task: updated.currentTask
          })},
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id, agent_id, session_id) 
        DO UPDATE SET
          context_data = EXCLUDED.context_data,
          memory_snapshot = EXCLUDED.memory_snapshot,
          last_interaction = NOW(),
          updated_at = NOW()
      `);
      
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
    
    // Load from database with correct column names
    try {
      const result = await db.execute(sql`
        SELECT context_data, memory_snapshot
        FROM agent_session_contexts
        WHERE agent_id = ${agentName.toLowerCase()}
          AND user_id = ${userId}
        ORDER BY updated_at DESC
        LIMIT 1
      `);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as any;
        const loaded = row.context_data as AgentContext;
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
    
    // Save to knowledge base with correct column names
    try {
      await db.execute(sql`
        INSERT INTO agent_knowledge_base (
          agent_id,
          topic,
          content,
          source,
          confidence,
          last_updated
        ) VALUES (
          ${agentName.toLowerCase()},
          ${'success_pattern'},
          ${JSON.stringify({
            pattern,
            details,
            timestamp: new Date().toISOString()
          })},
          ${'experience'},
          ${0.9},
          NOW()
        )
      `);
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
    
    // Save to knowledge base with correct column names
    try {
      await db.execute(sql`
        INSERT INTO agent_knowledge_base (
          agent_id,
          topic,
          content,
          source,
          confidence,
          last_updated
        ) VALUES (
          ${agentName.toLowerCase()},
          ${'failed_pattern'},
          ${JSON.stringify({
            attempt,
            error,
            timestamp: new Date().toISOString()
          })},
          ${'experience'},
          ${0.8},
          NOW()
        )
      `);
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
      const result = await db.execute(sql`
        SELECT topic, content
        FROM agent_knowledge_base
        WHERE agent_id = ${agentName.toLowerCase()}
        ORDER BY last_updated DESC
        LIMIT 20
      `);
      
      const patterns = result.rows as any[];
      
      const successful = patterns
        .filter(p => p.topic === 'success_pattern')
        .map(p => typeof p.content === 'string' ? JSON.parse(p.content) : p.content);
      
      const failed = patterns
        .filter(p => p.topic === 'failed_pattern')
        .map(p => typeof p.content === 'string' ? JSON.parse(p.content) : p.content);
      
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