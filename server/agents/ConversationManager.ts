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
   * Create intelligent summary of conversation history (Enhanced for Replit-style memory)
   */
  static async createConversationSummary(
    agentId: string,
    userId: string,
    history: any[]
  ): Promise<ConversationSummary> {
    
    // Extract key information from conversation
    const keyTasks: string[] = [];
    const recentDecisions: string[] = [];
    let currentContext = '';
    let workflowStage = 'ongoing';

    // Enhanced analysis - look at ALL messages for maximum context preservation
    for (const message of history) { // Analyze entire conversation history
      if (message.role === 'user') {
        // Extract specific task requests with better patterns
        const content = message.content.toLowerCase();
        if (content.includes('create') || content.includes('build') || content.includes('implement') || 
            content.includes('design') || content.includes('fix') || content.includes('add') ||
            content.includes('update') || content.includes('make') || content.includes('develop') ||
            content.includes('hero') || content.includes('ready to start')) {
          let task = message.content.substring(0, 120).replace(/\n/g, ' ').trim();
          
          // Special handling for specific contexts
          if (content.includes('hero') && content.includes('admin')) {
            task = 'Create full-bleed hero image for admin dashboard with luxury editorial design';
          }
          
          if (task && !keyTasks.includes(task)) {
            keyTasks.push(task);
          }
        }
      } else if (message.role === 'assistant') {
        // Extract completed work with better pattern matching
        const content = message.content.toLowerCase();
        if (content.includes('✅') || content.includes('completed') || content.includes('created') || 
            content.includes('implemented') || content.includes('fixed') || content.includes('added') ||
            content.includes('updated') || content.includes('built')) {
          const lines = message.content.split('\n');
          for (const line of lines) {
            if (line.includes('✅') || line.includes('completed') || line.includes('created') ||
                line.includes('implemented') || line.includes('fixed')) {
              const task = line.trim().substring(0, 120).replace(/[✅]/g, '').trim();
              if (task && !keyTasks.includes(task)) {
                keyTasks.push(task);
              }
            }
          }
        }
        
        // Extract decisions made with better pattern matching
        if (content.includes('decided') || content.includes('chose') || content.includes('using') ||
            content.includes('selected') || content.includes('approach')) {
          const lines = message.content.split('\n');
          for (const line of lines) {
            if (line.includes('decided') || line.includes('chose') || line.includes('approach')) {
              const decision = line.trim().substring(0, 120);
              if (decision && !recentDecisions.includes(decision)) {
                recentDecisions.push(decision);
              }
            }
          }
        }
      }
    }

    // Enhanced context detection from entire conversation for Replit-style memory
    const fullContent = history.map(m => m.content).join(' ').toLowerCase();
    
    // More sophisticated context detection with current task patterns
    if (fullContent.includes('hero') && (fullContent.includes('admin') || fullContent.includes('dashboard'))) {
      currentContext = 'Creating luxury full-bleed hero image for Sandra\'s admin dashboard with editorial design and Times New Roman typography';
      workflowStage = 'admin-hero-design';
      // Add the current task to keyTasks for proper memory
      keyTasks.push('Create full-bleed hero image for admin dashboard with luxury editorial design');
    } else if (fullContent.includes('chat') && fullContent.includes('management')) {
      currentContext = 'Implementing Replit-style chat management system with save/load functionality and enhanced memory';
      workflowStage = 'chat-management';
    } else if (fullContent.includes('admin') && fullContent.includes('dashboard')) {
      currentContext = 'Working on Sandra\'s admin dashboard with agent chat interfaces and luxury design systems';
      workflowStage = 'admin-dashboard';
    } else if (fullContent.includes('memory') && fullContent.includes('agent')) {
      currentContext = 'Implementing and debugging agent memory systems for conversation continuity and context preservation';
      workflowStage = 'memory-system';
    } else if (fullContent.includes('auto-clear') || (fullContent.includes('conversation') && fullContent.includes('management'))) {
      currentContext = 'Debugging conversation management and auto-clear interference with agent behavior patterns';
      workflowStage = 'conversation-debugging';
    } else if (fullContent.includes('visual') && fullContent.includes('editor')) {
      currentContext = 'Enhancing visual editor interface with multi-tab editing and agent integration';
      workflowStage = 'visual-editor';
    } else if (fullContent.includes('file') && fullContent.includes('creation')) {
      currentContext = 'Implementing agent file creation system with real filesystem integration';
      workflowStage = 'file-system';
    } else if (fullContent.includes('test') && fullContent.includes('component')) {
      currentContext = 'Creating and testing React components with proper TypeScript and styling integration';
      workflowStage = 'component-testing';
    } else {
      currentContext = 'General SSELFIE Studio development with luxury editorial design standards';
      workflowStage = 'development';
    }

    return {
      agentId,
      userId,
      keyTasks: [...new Set(keyTasks)].slice(0, 15), // Remove duplicates and keep top 15 tasks
      currentContext,
      recentDecisions: [...new Set(recentDecisions)].slice(0, 8), // Remove duplicates and keep top 8 decisions
      workflowStage,
      timestamp: new Date()
    };
  }

  /**
   * Save agent memory to database
   */
  static async saveAgentMemory(summary: ConversationSummary): Promise<void> {
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