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
  private static readonly MAX_MESSAGES = 10000; // MASSIVE limit - no auto-clearing
  private static readonly SUMMARY_THRESHOLD = 9500; // Only warn when extremely high

  /**
   * Check if conversation needs clearing - DISABLED AUTO-CLEAR FUNCTIONALITY
   * Elena's memory must persist across long sessions without interruption
   */
  static async manageConversationLength(
    agentId: string, 
    userId: string, 
    currentHistory: any[]
  ): Promise<{ shouldClear: boolean; summary?: ConversationSummary; newHistory: any[] }> {
    
    console.log(`🧠 Conversation length check: ${currentHistory.length} messages for ${agentId} (AUTO-CLEAR DISABLED)`);
    
    // NEVER auto-clear - only return warning if extremely high
    if (currentHistory.length >= this.SUMMARY_THRESHOLD) {
      console.log(`⚠️  Long conversation detected (${currentHistory.length} messages) but auto-clear disabled for Elena's memory preservation`);
    }
    
    // ALWAYS return shouldClear: false - no automatic conversation clearing
    return { shouldClear: false, newHistory: currentHistory };
  }

  /**
   * Create intelligent summary of conversation history (Enhanced for Elena's strategic context)
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

    // Get the full conversation text for context analysis
    const fullConversation = history.map(msg => msg.content).join(' ').toLowerCase();
    
    console.log(`🔍 ELENA MEMORY: Analyzing ${history.length} messages for context extraction`);

    // Enhanced analysis - look at ALL messages for maximum context preservation
    for (const message of history) {
      if (message.role === 'user') {
        // Extract specific task requests with enhanced patterns for Elena
        const content = message.content.toLowerCase();
        const originalContent = message.content;
        
        // BUILD-specific task detection
        if (content.includes('build') && (content.includes('website') || content.includes('builder') || content.includes('step 4'))) {
          keyTasks.push('BUILD feature development: Website builder implementation for Step 4');
        }
        
        // Workflow and audit requests
        if (content.includes('workflow') && (content.includes('audit') || content.includes('complete'))) {
          keyTasks.push('Conduct comprehensive workflow audit and completion strategy');
        }
        
        // Component analysis requests
        if (content.includes('audit') && content.includes('component')) {
          keyTasks.push('Comprehensive component analysis and gap identification');
        }
        
        // General task patterns
        if (content.includes('create') || content.includes('build') || content.includes('implement') || 
            content.includes('design') || content.includes('fix') || content.includes('add') ||
            content.includes('update') || content.includes('make') || content.includes('develop') ||
            content.includes('complete') || content.includes('ready to start')) {
          let task = originalContent.substring(0, 150).replace(/\n/g, ' ').trim();
          if (task && !keyTasks.some(existingTask => existingTask.includes(task.substring(0, 50)))) {
            keyTasks.push(task);
          }
        }
      } else if (message.role === 'assistant') {
        // Extract Elena's analysis and strategic decisions
        const content = message.content.toLowerCase();
        const originalContent = message.content;
        
        // Look for Elena's strategic analysis patterns
        if (content.includes('strategic analysis') || content.includes('recommended workflow') || 
            content.includes('next steps') || content.includes('workflow estimation')) {
          const lines = originalContent.split('\n');
          for (const line of lines) {
            if (line.includes('**') && (line.includes('ANALYSIS') || line.includes('WORKFLOW') || 
                line.includes('RECOMMENDATION') || line.includes('STEPS'))) {
              const decision = line.trim().substring(0, 120);
              if (decision && !recentDecisions.includes(decision)) {
                recentDecisions.push(decision);
              }
            }
          }
        }
        
        // Extract completion status
        if (content.includes('✅') || content.includes('completed') || content.includes('created') || 
            content.includes('implemented') || content.includes('fixed') || content.includes('added')) {
          const lines = originalContent.split('\n');
          for (const line of lines) {
            if (line.includes('✅') || line.toLowerCase().includes('completed')) {
              const task = line.trim().substring(0, 120).replace(/[✅]/g, '').trim();
              if (task && !keyTasks.some(existingTask => existingTask.includes(task.substring(0, 30)))) {
                keyTasks.push(task);
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
    } else if (fullContent.includes('build') && (fullContent.includes('analysis') || fullContent.includes('audit') || fullContent.includes('workflow'))) {
      currentContext = 'Elena conducting comprehensive BUILD feature analysis including component status, gaps identification, and strategic planning for Step 4 implementation';
      workflowStage = 'build-analysis';
      keyTasks.push('Analyze BUILD feature status and identify missing components');
      keyTasks.push('Create comprehensive component gap analysis');  
      keyTasks.push('Provide strategic implementation roadmap');
      keyTasks.push('Continue BUILD feature development workflow');
    } else if (fullContent.includes('memory') && (fullContent.includes('agent') || fullContent.includes('test'))) {
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
      keyTasks: Array.from(new Set(keyTasks)).slice(0, 15), // Remove duplicates and keep top 15 tasks
      currentContext,
      recentDecisions: Array.from(new Set(recentDecisions)).slice(0, 8), // Remove duplicates and keep top 8 decisions
      workflowStage,
      timestamp: new Date()
    };
  }

  /**
   * Save agent memory to database (RE-ENABLED with corruption fix)
   */
  static async saveAgentMemory(summary: ConversationSummary): Promise<void> {
    try {
      // Save memory as special conversation entry that can be filtered out in UI
      await storage.saveAgentConversation(
        summary.agentId,
        summary.userId,
        '**CONVERSATION_MEMORY**', // Special marker for memory entries
        JSON.stringify({
          agentId: summary.agentId,
          userId: summary.userId,
          keyTasks: summary.keyTasks,
          currentContext: summary.currentContext,
          recentDecisions: summary.recentDecisions,
          workflowStage: summary.workflowStage,
          timestamp: summary.timestamp
        }),
        []
      );
      console.log(`💾 Memory summary saved for ${summary.agentId}: ${summary.keyTasks.length} tasks, ${summary.recentDecisions.length} decisions`);
      
      // Cleanup old memory entries to prevent bloat
      await this.cleanupOldMemories(summary.agentId, summary.userId);
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
        .sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime())[0];
      
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
      const conversations = await storage.getAgentConversations(agentId, userId);
      const memoryEntries = conversations
        .filter(conv => conv.userMessage === '**CONVERSATION_MEMORY**')
        .sort((a, b) => new Date(b.timestamp || '').getTime() - new Date(a.timestamp || '').getTime());
      
      // Keep only the 3 most recent memory entries (for now just log - deletion can be added later)
      if (memoryEntries.length > 3) {
        const toDelete = memoryEntries.slice(3);
        console.log(`🧹 Memory cleanup: Found ${memoryEntries.length} entries, would clean ${toDelete.length} old entries`);
      }
    } catch (error) {
      console.error('Failed to cleanup old memories:', error);
    }
  }
}