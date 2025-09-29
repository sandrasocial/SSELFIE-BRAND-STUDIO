import { db } from '../drizzle.js';
import { agentSessionContexts, sessions, users } from '../../shared/schema.js';
import { eq, and, desc } from 'drizzle-orm';
export class UnifiedSessionManager {
    static instance;
    sessionCache = new Map();
    constructor() { }
    static getInstance() {
        if (!UnifiedSessionManager.instance) {
            UnifiedSessionManager.instance = new UnifiedSessionManager();
        }
        return UnifiedSessionManager.instance;
    }
    async restoreUserSession(userId, replitSessionId) {
        console.log(`🔄 RESTORING SESSION: User ${userId}, Replit session: ${replitSessionId ? 'active' : 'none'}`);
        try {
            if (!userId || typeof userId !== 'string') {
                throw new Error('Invalid userId for session restoration');
            }
            const cacheKey = `${userId}-${replitSessionId || 'no-replit'}`;
            if (this.sessionCache.has(cacheKey)) {
                console.log('✅ SESSION CACHE: Using cached session data');
                return this.sessionCache.get(cacheKey);
            }
            const sessionData = await db.transaction(async (tx) => {
                const replitSessionValid = await this.validateReplitSession(replitSessionId);
                const userProfile = await this.getUserProfile(userId, tx);
                const agentContexts = await this.restoreAgentContexts(userId, tx);
                const lastActivity = await this.getLastUserActivity(userId, tx);
                return {
                    replitSessionValid,
                    agentContexts,
                    userProfile,
                    lastActivity
                };
            });
            this.sessionCache.set(cacheKey, sessionData);
            console.log(`✅ SESSION RESTORED: ${sessionData.agentContexts.length} agent contexts, Replit: ${sessionData.replitSessionValid ? 'valid' : 'invalid'}`);
            return sessionData;
        }
        catch (error) {
            console.error('❌ Session restoration failed:', error);
            return {
                replitSessionValid: false,
                agentContexts: [],
                userProfile: null,
                lastActivity: new Date()
            };
        }
    }
    async saveAgentSessionContext(context) {
        try {
            console.log(`💾 SAVING AGENT CONTEXT: ${context.agentId} for user ${context.userId}`);
            const memorySnapshot = await this.retrieveAgentMemory(context.agentId, context.userId);
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
            this.clearUserSessionCache(context.userId);
            console.log(`✅ AGENT CONTEXT SAVED: ${context.agentId}`);
        }
        catch (error) {
            console.error('❌ Failed to save agent session context:', error);
        }
    }
    async restoreAgentContexts(userId, tx) {
        try {
            const query = tx ? tx.select() : db.select();
            const contexts = await query
                .from(agentSessionContexts)
                .where(eq(agentSessionContexts.userId, userId))
                .orderBy(desc(agentSessionContexts.lastInteraction))
                .limit(10);
            return contexts.map(ctx => ({
                userId: ctx.userId,
                agentId: ctx.agentId,
                sessionId: ctx.sessionId,
                contextData: ctx.contextData,
                workflowState: ctx.workflowState,
                memorySnapshot: ctx.memorySnapshot
            }));
        }
        catch (error) {
            console.error('❌ Failed to restore agent contexts:', error);
            return [];
        }
    }
    async validateReplitSession(sessionId) {
        if (!sessionId)
            return false;
        try {
            const session = await db.select()
                .from(sessions)
                .where(eq(sessions.sid, sessionId))
                .limit(1);
            if (!session.length)
                return false;
            const sessionData = session[0];
            const now = new Date();
            if (sessionData.expire < now) {
                console.log('⚠️ REPLIT SESSION: Expired session detected');
                return false;
            }
            return true;
        }
        catch (error) {
            console.error('❌ Failed to validate Replit session:', error);
            return false;
        }
    }
    async getUserProfile(userId, tx) {
        try {
            const query = tx ? tx.select() : db.select();
            const user = await query
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);
            return user.length > 0 ? user[0] : null;
        }
        catch (error) {
            console.error('❌ Failed to get user profile:', error);
            return null;
        }
    }
    async getLastUserActivity(userId, tx) {
        try {
            const query = tx ? tx.select() : db.select();
            const lastContext = await query
                .from(agentSessionContexts)
                .where(eq(agentSessionContexts.userId, userId))
                .orderBy(desc(agentSessionContexts.lastInteraction))
                .limit(1);
            if (lastContext.length > 0) {
                return lastContext[0].lastInteraction || new Date();
            }
            return new Date();
        }
        catch (error) {
            console.error('❌ Failed to get last user activity:', error);
            return new Date();
        }
    }
    clearUserSessionCache(userId) {
        for (const [key] of this.sessionCache) {
            if (key.startsWith(`${userId}-`)) {
                this.sessionCache.delete(key);
            }
        }
    }
    async cleanupOldSessions() {
        try {
            console.log('🧹 CLEANING UP: Old agent session contexts');
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            await db.delete(agentSessionContexts)
                .where(and(eq(agentSessionContexts.workflowState, 'completed')));
            console.log('✅ CLEANUP COMPLETE: Old agent sessions removed');
        }
        catch (error) {
            console.error('❌ Session cleanup failed:', error);
        }
    }
    async getActiveAgentSessions() {
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
                workflowState: ctx.workflowState,
                memorySnapshot: ctx.memorySnapshot
            }));
        }
        catch (error) {
            console.error('❌ Failed to get active agent sessions:', error);
            return [];
        }
    }
    async retrieveAgentMemory(agentId, userId) {
        try {
            return {
                agentId,
                userId,
                memory: {},
                timestamp: new Date()
            };
        }
        catch (error) {
            console.error('❌ Failed to retrieve agent memory:', error);
            return null;
        }
    }
}
export const unifiedSessionManager = UnifiedSessionManager.getInstance();
//# sourceMappingURL=unified-session-manager.js.map