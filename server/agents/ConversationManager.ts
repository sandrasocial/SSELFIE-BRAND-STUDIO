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
    
    // DEBUG: Look at the most recent messages
    const recentMessages = history.slice(-3);
    console.log('🔍 RECENT MESSAGES FOR DEBUG:', recentMessages.map(m => ({ role: m.role, content: m.content.substring(0, 100) })));

    // ENHANCED SESSION APPROACH - Look at recent messages (last 10) for better context capture
    const recentHistory = history.slice(-10);
    
    for (const message of recentHistory) {
      if (message.role === 'user' || message.role === 'human') {
        // Extract specific task requests with enhanced patterns for Elena
        const content = message.content.toLowerCase();
        const originalContent = message.content;
        
        // AGGRESSIVE TASK EXTRACTION - Capture ALL user messages that contain task patterns
        if (content.includes('elena') || content.includes('need') || content.includes('want') || 
            content.includes('should') || content.includes('can you') || content.includes('please') ||
            content.includes('maya') || content.includes('analyze') || content.includes('test') ||
            content.includes('quality') || content.includes('generation') || content.includes('photos') ||
            content.includes('check') || content.includes('verify') || content.includes('access') ||
            content.includes('file') || content.includes('system') || content.includes('chat') ||
            content.includes('implement') || content.includes('parameters') || content.includes('flux') ||
            content.includes('audit') || content.includes('coordinate') || content.includes('help') ||
            content.includes('working') || content.includes('work on') || content.includes('focus on') ||
            content.includes('yes') || content.includes('continue') || content.includes('doing')) {
          
          // Extract the actual task request with better context preservation
          let task = originalContent.substring(0, 400).replace(/\n/g, ' ').trim();
          if (task && task.length > 2) {
            // Always add tasks, even if similar exist - better to have context than lose it
            keyTasks.push(task);
            console.log(`📝 TASK EXTRACTED: ${task.substring(0, 100)}...`);
          }
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
    
    // ENHANCED CONTEXT PRESERVATION - Use all tasks to build comprehensive context
    if (keyTasks.length > 0) {
      // Use the most recent tasks as context with better summary
      const recentTasks = keyTasks.slice(-3); // Last 3 tasks for better context
      currentContext = `Active tasks: ${recentTasks.join(' | ').substring(0, 300)}`;
      workflowStage = 'active-task';
    } else {
      // Default - but should rarely happen with improved extraction
      currentContext = 'Elena ready for new task assignment';
      workflowStage = 'ready';
    }
    
    console.log(`🧠 MEMORY SUMMARY: ${keyTasks.length} tasks extracted, context: ${currentContext.substring(0, 100)}...`);

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