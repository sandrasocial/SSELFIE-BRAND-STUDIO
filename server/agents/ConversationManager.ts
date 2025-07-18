import { storage } from '../storage';

export interface ConversationSummary {
  agentId: string;
  userId: string;
  keyTasks: string[];
  currentContext: string;
  recentDecisions: string[];
  workflowStage: string;
  timestamp: Date;
}

export class ConversationManager {
  private static readonly MAX_MESSAGES = 30; // Limit before auto-clear
  private static readonly SUMMARY_THRESHOLD = 25; // Start summarizing at this point

  /**
   * Check if conversation needs clearing and auto-clear with memory preservation
   */
  static async manageConversationLength(
    agentId: string, 
    userId: string, 
    currentHistory: any[]
  ): Promise<{ shouldClear: boolean; summary?: ConversationSummary; newHistory: any[] }> {
    
    console.log(`🧠 Conversation length check: ${currentHistory.length} messages for ${agentId}`);
    
    if (currentHistory.length < this.MAX_MESSAGES) {
      return { shouldClear: false, newHistory: currentHistory };
    }

    console.log(`🔄 Auto-clearing conversation for ${agentId} - preserving memory...`);

    // Create intelligent summary of the conversation
    const summary = await this.createConversationSummary(agentId, userId, currentHistory);
    
    // Save summary to database
    await this.saveAgentMemory(summary);
    
    // Keep only the last 5 messages for context
    const recentMessages = currentHistory.slice(-5);
    
    // Add summary as system context at the beginning
    const summaryMessage = {
      role: 'system',
      content: `**CONVERSATION MEMORY RESTORED**\n\n**Previous Context:**\n${summary.currentContext}\n\n**Key Tasks Completed:**\n${summary.keyTasks.map(task => `• ${task}`).join('\n')}\n\n**Recent Decisions:**\n${summary.recentDecisions.map(decision => `• ${decision}`).join('\n')}\n\n**Current Workflow Stage:** ${summary.workflowStage}\n\n---\n\n**Continuing from where we left off...**`
    };

    const newHistory = [summaryMessage, ...recentMessages];
    
    console.log(`✅ Conversation cleared: ${currentHistory.length} → ${newHistory.length} messages`);
    console.log(`💾 Memory preserved in database for ${agentId}`);
    
    return { 
      shouldClear: true, 
      summary, 
      newHistory 
    };
  }

  /**
   * Create intelligent summary of conversation history
   */
  private static async createConversationSummary(
    agentId: string,
    userId: string,
    history: any[]
  ): Promise<ConversationSummary> {
    
    // Extract key information from conversation
    const keyTasks: string[] = [];
    const recentDecisions: string[] = [];
    let currentContext = '';
    let workflowStage = 'ongoing';

    // Analyze messages for important content
    for (const message of history.slice(-20)) { // Look at last 20 messages
      if (message.role === 'user') {
        // Extract task requests
        if (message.content.includes('create') || message.content.includes('build') || message.content.includes('implement')) {
          keyTasks.push(message.content.substring(0, 100) + '...');
        }
      } else if (message.role === 'assistant') {
        // Extract completed work
        if (message.content.includes('✅') || message.content.includes('completed') || message.content.includes('created')) {
          const lines = message.content.split('\n');
          for (const line of lines) {
            if (line.includes('✅') || line.includes('completed')) {
              keyTasks.push(line.trim().substring(0, 100));
            }
          }
        }
        
        // Extract decisions made
        if (message.content.includes('decided') || message.content.includes('chose') || message.content.includes('using')) {
          const lines = message.content.split('\n');
          for (const line of lines) {
            if (line.includes('decided') || line.includes('chose')) {
              recentDecisions.push(line.trim().substring(0, 100));
            }
          }
        }
      }
    }

    // Determine current context from recent messages
    const recentMessages = history.slice(-5);
    const recentContent = recentMessages.map(m => m.content).join(' ');
    
    if (recentContent.includes('admin') || recentContent.includes('dashboard')) {
      currentContext = 'Working on admin dashboard design and functionality';
      workflowStage = 'admin-dashboard';
    } else if (recentContent.includes('component') || recentContent.includes('file')) {
      currentContext = 'Creating and modifying React components';
      workflowStage = 'component-development';
    } else if (recentContent.includes('preview') || recentContent.includes('iframe')) {
      currentContext = 'Fixing preview and iframe functionality';
      workflowStage = 'preview-debugging';
    } else {
      currentContext = 'General development and design work';
      workflowStage = 'development';
    }

    return {
      agentId,
      userId,
      keyTasks: keyTasks.slice(0, 10), // Keep top 10 tasks
      currentContext,
      recentDecisions: recentDecisions.slice(0, 5), // Keep top 5 decisions
      workflowStage,
      timestamp: new Date()
    };
  }

  /**
   * Save agent memory to database
   */
  private static async saveAgentMemory(summary: ConversationSummary): Promise<void> {
    try {
      // Save to agent_conversations table as a special memory entry
      // Fix parameter order: agentId, userId, userMessage, agentResponse, devPreview
      await storage.saveAgentConversation(
        summary.agentId,
        summary.userId,
        '**CONVERSATION_MEMORY**',
        JSON.stringify(summary),
        { workflowStage: summary.workflowStage }
      );
      
      console.log(`💾 Agent memory saved for ${summary.agentId}`);
    } catch (error) {
      console.error('Failed to save agent memory:', error);
    }
  }

  /**
   * Retrieve agent memory from database
   */
  static async retrieveAgentMemory(agentId: string, userId: string): Promise<ConversationSummary | null> {
    try {
      const conversations = await storage.getAgentConversations(agentId, userId);
      
      // Find the most recent memory entry
      const memoryEntry = conversations
        .filter(conv => conv.userMessage === '**CONVERSATION_MEMORY**')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      
      if (memoryEntry) {
        return JSON.parse(memoryEntry.agentResponse);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to retrieve agent memory:', error);
      return null;
    }
  }

  /**
   * Clear old memory entries to prevent database bloat
   */
  static async cleanupOldMemories(agentId: string, userId: string): Promise<void> {
    try {
      const conversations = await storage.getAgentConversations(userId, agentId);
      const memoryEntries = conversations
        .filter(conv => conv.userMessage === '**CONVERSATION_MEMORY**')
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Keep only the 3 most recent memory entries
      if (memoryEntries.length > 3) {
        const toDelete = memoryEntries.slice(3);
        for (const entry of toDelete) {
          // Note: We'd need a delete method in storage for this
          console.log(`🧹 Would delete old memory entry: ${entry.id}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old memories:', error);
    }
  }
}