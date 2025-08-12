/**
 * ADMIN CONTEXT MANAGER - CLEAN IMPLEMENTATION
 * Eliminates broken generic systems, implements personality-first admin agents
 */

interface AdminAgentContext {
  agentId: string;
  userId: string;
  conversationId: string;
  personality: any;
  adminPrivileges: boolean;
  memoryContext: string[];
  lastActivity: Date;
}

export class AdminContextManager {
  private static instance: AdminContextManager;
  private activeContexts = new Map<string, AdminAgentContext>();

  private constructor() {}

  public static getInstance(): AdminContextManager {
    if (!AdminContextManager.instance) {
      AdminContextManager.instance = new AdminContextManager();
    }
    return AdminContextManager.instance;
  }

  /**
   * ELIMINATE GENERIC ROUTING: Create personality-first agent context
   */
  async createAdminAgentContext(
    agentId: string, 
    userId: string, 
    conversationId: string, 
    personality: any
  ): Promise<AdminAgentContext> {
    console.log(`🤖 ADMIN AGENT ACTIVATION: ${personality.name} with full personality integration`);
    
    const context: AdminAgentContext = {
      agentId,
      userId,
      conversationId,
      personality,
      adminPrivileges: true,
      memoryContext: [],
      lastActivity: new Date()
    };

    this.activeContexts.set(`${agentId}-${userId}`, context);
    return context;
  }

  /**
   * UPDATE CONTEXT: Maintain agent memory and personality state
   */
  async updateContext(contextKey: string, message: string): Promise<void> {
    const context = this.activeContexts.get(contextKey);
    if (context) {
      context.memoryContext.push(message);
      context.lastActivity = new Date();
      
      // Keep last 50 messages for context
      if (context.memoryContext.length > 50) {
        context.memoryContext = context.memoryContext.slice(-50);
      }
    }
  }

  /**
   * GET AGENT CONTEXT: Retrieve full personality and memory context
   */
  getAgentContext(agentId: string, userId: string): AdminAgentContext | undefined {
    return this.activeContexts.get(`${agentId}-${userId}`);
  }
}