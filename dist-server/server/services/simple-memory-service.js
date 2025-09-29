import { storage } from '../storage.js';
export class SimpleMemoryService {
    static instance;
    contextCache = new Map();
    constructor() { }
    static getInstance() {
        if (!SimpleMemoryService.instance) {
            SimpleMemoryService.instance = new SimpleMemoryService();
        }
        return SimpleMemoryService.instance;
    }
    async prepareAgentContext(options) {
        const { agentName, userId, task = '', isAdminBypass = false } = options;
        const cacheKey = `${agentName}-${userId}`;
        const cached = this.contextCache.get(cacheKey);
        if (cached && this.isCacheValid(cached)) {
            console.log(`🧠 MEMORY: Using cached context for ${agentName} (${cached.memories.length} memories)`);
            return cached;
        }
        let persistedMemories = [];
        try {
            const persistedData = await storage.getAgentMemory(agentName, userId);
            if (persistedData && persistedData.context && persistedData.context.memories) {
                persistedMemories = persistedData.context.memories;
                console.log(`💾 LOADED: ${persistedMemories.length} persisted memories for ${agentName}`);
            }
        }
        catch (error) {
            console.error(`⚠️ Failed to load persisted memories for ${agentName}:`, error);
        }
        const context = {
            agentName,
            userId,
            currentTask: task,
            adminPrivileges: isAdminBypass,
            memories: persistedMemories,
            timestamp: new Date()
        };
        this.contextCache.set(cacheKey, context);
        console.log(`🧠 MEMORY: Prepared context for ${agentName}${isAdminBypass ? ' [ADMIN]' : ''} (${persistedMemories.length} restored)`);
        return context;
    }
    async saveAgentMemory(context, data) {
        const cacheKey = `${context.agentName}-${context.userId}`;
        const memoryItem = {
            data,
            timestamp: new Date(),
            task: context.currentTask
        };
        if (!context.memories) {
            context.memories = [];
        }
        context.memories.push(memoryItem);
        this.contextCache.set(cacheKey, context);
        try {
            await storage.saveAgentMemory(context.agentName, context.userId, { context });
            console.log(`💾 SAVED: Memory persisted for ${context.agentName}`);
        }
        catch (error) {
            console.error(`⚠️ Failed to persist memory for ${context.agentName}:`, error);
        }
    }
    shouldBypassClaude(message, agentId) {
        const isExactJSONTool = message.trim().startsWith('{') && message.trim().endsWith('}') &&
            (message.includes('"command":') || message.includes('"query_description":') || message.includes('"sql_query":'));
        return isExactJSONTool;
    }
    async getFullConversationContext(agentName, userId) {
        try {
            const context = await this.prepareAgentContext({ agentName, userId, isAdminBypass: true });
            const storedData = await storage.getAgentMemory(agentName, userId);
            if (storedData && storedData.conversationHistory) {
                console.log(`🧠 LOCAL FULL CONTEXT: Loaded ${storedData.conversationHistory.length} messages for ${agentName}`);
                return storedData.conversationHistory;
            }
            const { db } = await import('../db.js');
            const { claudeMessages } = await import('../../shared/schema.js');
            const { eq, desc } = await import('drizzle-orm');
            const conversationId = `admin_${agentName.toLowerCase()}_${userId}`;
            const messages = await db
                .select()
                .from(claudeMessages)
                .where(eq(claudeMessages.conversationId, conversationId))
                .orderBy(claudeMessages.createdAt)
                .limit(100);
            const formattedMessages = messages.map(msg => ({
                role: msg.role === 'agent' ? 'assistant' : msg.role,
                content: msg.content
            }));
            console.log(`🧠 LOCAL FALLBACK: Loaded ${formattedMessages.length} messages from database for ${agentName}`);
            return formattedMessages;
        }
        catch (error) {
            console.error(`Failed to get full context for ${agentName}:`, error);
            return [];
        }
    }
    async getWorkspaceContext(agentName, userId) {
        try {
            const context = await this.prepareAgentContext({ agentName, userId, isAdminBypass: true });
            if (context.memories.length > 0) {
                const recentMemories = context.memories.slice(-3)
                    .map(mem => `- ${mem.data?.pattern || mem.data?.currentTask || 'Previous task'}`)
                    .join('\n');
                return `Recent workspace context for ${agentName}:\n${recentMemories}`;
            }
            return `Agent ${agentName} workspace ready for new tasks`;
        }
        catch (error) {
            console.error(`Failed to get workspace context for ${agentName}:`, error);
            return `Agent ${agentName} workspace context unavailable`;
        }
    }
    async consolidateMemory(agentId, userId) {
        const context = await this.prepareAgentContext({
            agentName: agentId,
            userId
        });
        const uniqueMemories = context.memories.filter((memory, index, self) => index === self.findIndex(m => m.timestamp.getTime() === memory.timestamp.getTime() &&
            JSON.stringify(m.data) === JSON.stringify(memory.data)));
        context.memories = uniqueMemories;
        await storage.saveAgentMemory(agentId, userId, { context });
        console.log(`🧠 UNLIMITED MEMORY: All ${context.memories.length} memories preserved for ${agentId}`);
    }
    refreshAgentMemory(agentName, userId, preserveContext = true) {
        const cacheKey = `${agentName}-${userId}`;
        if (preserveContext) {
            const existing = this.contextCache.get(cacheKey);
            if (existing) {
                existing.timestamp = new Date();
                console.log(`🔄 MEMORY: Refreshed timestamp for ${agentName} (context preserved)`);
                return;
            }
        }
        this.contextCache.delete(cacheKey);
        console.log(`⚠️ MEMORY: Hard cleared memory for ${agentName} (context lost)`);
    }
    isCacheValid(context) {
        const now = new Date();
        const age = now.getTime() - context.timestamp.getTime();
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        return age < maxAge;
    }
    async prepareAgentWorkspace(agentName, userId, task, isAdminBypass = false) {
        return this.prepareAgentContext({ agentName, userId, task, isAdminBypass });
    }
    async getAgentMemoryProfile(agentName, userId, adminBypass = false) {
        const context = await this.prepareAgentContext({ agentName, userId, isAdminBypass: adminBypass });
        return {
            agentName,
            userId,
            memoryStrength: 1.0,
            learningPatterns: context.memories.slice(-5),
            intelligenceLevel: adminBypass ? 10 : 7,
            adminBypass,
            context: context,
            memoryCount: context.memories.length,
            lastOptimization: new Date()
        };
    }
    analyzeMessage(message) {
        return {
            isContinuation: true,
            isWorkTask: true,
            contextLevel: 'full'
        };
    }
    workflowStates = new Map();
    async saveWorkflowState(workflowId, state) {
        this.workflowStates.set(workflowId, {
            ...state,
            lastUpdateTime: new Date()
        });
        console.log(`💾 WORKFLOW: Saved state for workflow ${workflowId}`);
    }
    async getWorkflowState(workflowId) {
        const state = this.workflowStates.get(workflowId);
        if (!state) {
            console.log(`❌ WORKFLOW: No state found for workflow ${workflowId}`);
            return null;
        }
        console.log(`📖 WORKFLOW: Retrieved state for workflow ${workflowId}`);
        return state;
    }
    clearWorkflowState(workflowId) {
        this.workflowStates.delete(workflowId);
        console.log(`🗑️ WORKFLOW: Cleared state for workflow ${workflowId}`);
    }
}
export const simpleMemoryService = SimpleMemoryService.getInstance();
//# sourceMappingURL=simple-memory-service.js.map