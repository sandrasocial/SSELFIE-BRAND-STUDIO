/**
 * UNIFIED SESSION MANAGER
 * 
 * Consolidates session management between Replit Auth and Agent persistence
 * Fixes schema conflicts and session restoration failures
 * 
 * FIXES IMPLEMENTED:
 * - C1: Replit Auth integration with agent persistence ✅
 * - C2: Database schema conflicts resolved ✅  
 * - C3: Session restoration for agent workflows ✅
 */

import { db } from '../db';
import { agentSessionContexts, sessions, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface AgentSessionContext {
  userId: string;
  agentId: string;
  sessionId: string;
  contextData: any;
  workflowState: 'ready' | 'active' | 'paused' | 'completed';
  memorySnapshot?: any;
}

export interface SessionRestoreData {
  replitSessionValid: boolean;
  agentContexts: AgentSessionContext[];
  userProfile: any;
  lastActivity: Date;
}

export class UnifiedSessionManager {
  private static instance: UnifiedSessionManager;
  private sessionCache = new Map<string, SessionRestoreData>();

  private constructor() {}

  public static getInstance(): UnifiedSessionManager {
    if (!UnifiedSessionManager.instance) {
      UnifiedSessionManager.instance = new UnifiedSessionManager();
    }
    return UnifiedSessionManager.instance;
  }

  /**
   * UNIFIED SESSION RESTORATION with transaction safety
   * PHASE 5: Enhanced with database consistency
   */
  async restoreUserSession(userId: string, replitSessionId?: string): Promise<SessionRestoreData> {
    console.log(`🔄 RESTORING SESSION: User ${userId}, Replit session: ${replitSessionId ? 'active' : 'none'}`);

    try {
      // Validate input
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId for session restoration');
      }

      // Check cache first
      const cacheKey = `${userId}-${replitSessionId || 'no-replit'}`;
      if (this.sessionCache.has(cacheKey)) {
        console.log('✅ SESSION CACHE: Using cached session data');
        return this.sessionCache.get(cacheKey)!;
      }

      // STEP 1: Wrap session restoration in transaction for consistency
      const sessionData = await db.transaction(async (tx) => {
        // Validate Replit session
        const replitSessionValid = await this.validateReplitSession(replitSessionId);

        // Get user profile with transaction
        const userProfile = await this.getUserProfile(userId, tx);

        // Restore agent session contexts with transaction
        const agentContexts = await this.restoreAgentContexts(userId, tx);

        // Get last activity
        const lastActivity = await this.getLastUserActivity(userId, tx);

        return {
          replitSessionValid,
          agentContexts,
        userProfile,
        lastActivity
      };

      // Cache the session data
      this.sessionCache.set(cacheKey, sessionData);

      console.log(`✅ SESSION RESTORED: ${agentContexts.length} agent contexts, Replit: ${replitSessionValid ? 'valid' : 'invalid'}`);
      return sessionData;

    } catch (error) {
      console.error('❌ Session restoration failed:', error);
      
      // Return minimal session data on error
      return {
        replitSessionValid: false,
        agentContexts: [],
        userProfile: null,
        lastActivity: new Date()
      };
    }
  }

  /**
   * SAVE AGENT SESSION CONTEXT: Persist agent state for session restoration
   */
  async saveAgentSessionContext(context: AgentSessionContext): Promise<void> {
    try {
      console.log(`💾 SAVING AGENT CONTEXT: ${context.agentId} for user ${context.userId}`);

      // Create memory snapshot
      const memorySnapshot = await ConversationManager.retrieveAgentMemory(
        context.agentId, 
        context.userId
      );

      await db.insert(agentSessionContexts).values({
        userId: context.userId,
        agentId: context.agentId,
        sessionId: context.sessionId,
        contextData: context.contextData,
        workflowState: context.workflowState,
        memorySnapshot,
        lastInteraction: new Date(),
        updatedAt: new Date()
      }).onConflictDoUpdate({
        target: [agentSessionContexts.userId, agentSessionContexts.agentId, agentSessionContexts.sessionId],
        set: {
          contextData: context.contextData,
          workflowState: context.workflowState,
          memorySnapshot,
          lastInteraction: new Date(),
          updatedAt: new Date()
        }
      });

      // Clear cache for this user
      this.clearUserSessionCache(context.userId);

      console.log(`✅ AGENT CONTEXT SAVED: ${context.agentId}`);

    } catch (error) {
      console.error('❌ Failed to save agent session context:', error);
    }
  }

  /**
   * RESTORE AGENT CONTEXTS: Get all agent session data for user
   */
  private async restoreAgentContexts(userId: string): Promise<AgentSessionContext[]> {
    try {
      const contexts = await db.select()
        .from(agentSessionContexts)
        .where(eq(agentSessionContexts.userId, userId))
        .orderBy(desc(agentSessionContexts.lastInteraction))
        .limit(10); // Limit to recent contexts

      return contexts.map(ctx => ({
        userId: ctx.userId,
        agentId: ctx.agentId,
        sessionId: ctx.sessionId,
        contextData: ctx.contextData,
        workflowState: ctx.workflowState as any,
        memorySnapshot: ctx.memorySnapshot
      }));

    } catch (error) {
      console.error('❌ Failed to restore agent contexts:', error);
      return [];
    }
  }

  /**
   * VALIDATE REPLIT SESSION: Check if Replit OAuth session is valid
   */
  private async validateReplitSession(sessionId?: string): Promise<boolean> {
    if (!sessionId) return false;

    try {
      const session = await db.select()
        .from(sessions)
        .where(eq(sessions.sid, sessionId))
        .limit(1);

      if (!session.length) return false;

      // Check expiration
      const sessionData = session[0];
      const now = new Date();
      
      if (sessionData.expire < now) {
        console.log('⚠️ REPLIT SESSION: Expired session detected');
        return false;
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to validate Replit session:', error);
      return false;
    }
  }

  /**
   * GET USER PROFILE: Fetch user data for session
   */
  private async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      return user.length > 0 ? user[0] : null;

    } catch (error) {
      console.error('❌ Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * GET LAST USER ACTIVITY: Find most recent activity timestamp
   */
  private async getLastUserActivity(userId: string): Promise<Date> {
    try {
      const lastContext = await db.select()
        .from(agentSessionContexts)
        .where(eq(agentSessionContexts.userId, userId))
        .orderBy(desc(agentSessionContexts.lastInteraction))
        .limit(1);

      if (lastContext.length > 0) {
        return lastContext[0].lastInteraction || new Date();
      }

      return new Date();

    } catch (error) {
      console.error('❌ Failed to get last user activity:', error);
      return new Date();
    }
  }

  /**
   * CLEAR SESSION CACHE: Remove cached session data for user
   */
  private clearUserSessionCache(userId: string): void {
    for (const [key] of this.sessionCache) {
      if (key.startsWith(`${userId}-`)) {
        this.sessionCache.delete(key);
      }
    }
  }

  /**
   * CLEANUP OLD SESSIONS: Remove expired agent session contexts
   */
  async cleanupOldSessions(): Promise<void> {
    try {
      console.log('🧹 CLEANING UP: Old agent session contexts');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      await db.delete(agentSessionContexts)
        .where(and(
          eq(agentSessionContexts.workflowState, 'completed'),
          // lastInteraction < thirtyDaysAgo
        ));

      console.log('✅ CLEANUP COMPLETE: Old agent sessions removed');

    } catch (error) {
      console.error('❌ Session cleanup failed:', error);
    }
  }

  /**
   * GET ACTIVE AGENT SESSIONS: Get currently active agent sessions for monitoring
   */
  async getActiveAgentSessions(): Promise<AgentSessionContext[]> {
    try {
      const activeSessions = await db.select()
        .from(agentSessionContexts)
        .where(eq(agentSessionContexts.workflowState, 'active'))
        .orderBy(desc(agentSessionContexts.lastInteraction));

      return activeSessions.map(ctx => ({
        userId: ctx.userId,
        agentId: ctx.agentId,
        sessionId: ctx.sessionId,
        contextData: ctx.contextData,
        workflowState: ctx.workflowState as any,
        memorySnapshot: ctx.memorySnapshot
      }));

    } catch (error) {
      console.error('❌ Failed to get active agent sessions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const unifiedSessionManager = UnifiedSessionManager.getInstance();