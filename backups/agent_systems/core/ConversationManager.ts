import { storage } from '../../storage';
// ELIMINATED: AdvancedMemorySystem - replaced with simple-memory-service
import { simpleMemoryService } from '../../services/simple-memory-service';
import { claudeApiServiceSimple } from '../../services/claude-api-service-simple';
import { WorkflowStateManager, WorkflowState } from './WorkflowStateManager';

// SIMPLIFIED MEMORY SYSTEM INTEGRATION
const memoryService = simpleMemoryService;

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
    
    // UNIFIED MEMORY PERSISTENCE: Save to all memory systems
    await this.saveAgentMemory(summary);
    
    // Enhanced learning integration using working system
    const insights = await claudeApiServiceSimple.getAgentLearningInsights(agentId, userId);
    console.log(`🧠 Learning insights for ${agentId}:`, insights?.totalPatterns || 0, 'patterns');
    
    // Use unified simple memory service
    await memoryService.consolidateMemory(agentId, userId);
    
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
        
        // Launch readiness audit requests
        if (content.includes('launch') && (content.includes('audit') || content.includes('readiness') || content.includes('ready'))) {
          keyTasks.push('SSELFIE Studio platform launch readiness audit');
        }
        
        // Platform audit requests  
        if (content.includes('platform') && content.includes('audit')) {
          keyTasks.push('Complete SSELFIE Studio platform audit and analysis');
        }
        
        // Comprehensive audit requests
        if (content.includes('audit') && (content.includes('complete') || content.includes('comprehensive') || content.includes('studio'))) {
          keyTasks.push('Complete comprehensive SSELFIE Studio audit');
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
    
    // Dynamic context detection based on current conversation content
    const contextKeywords = [];
    if (fullContent.includes('dashboard')) contextKeywords.push('dashboard');
    if (fullContent.includes('redesign')) contextKeywords.push('redesign');
    if (fullContent.includes('workflow')) contextKeywords.push('workflow');
    if (fullContent.includes('audit')) contextKeywords.push('audit');
    if (fullContent.includes('launch')) contextKeywords.push('launch');
    if (fullContent.includes('admin')) contextKeywords.push('admin');
    
    if (contextKeywords.length > 0) {
      currentContext = `Working on: ${contextKeywords.join(', ')} related tasks`;
      workflowStage = contextKeywords.join('-').toLowerCase();
    } else {
      // Extract the most recent user request as context
      const recentUserMessages = history.filter(m => m.role === 'user').slice(-3);
      if (recentUserMessages.length > 0) {
        const latestRequest = recentUserMessages[recentUserMessages.length - 1].content;
        currentContext = `Current focus: ${latestRequest.substring(0, 100).replace(/\n/g, ' ').trim()}`;
        workflowStage = 'current-task';
      } else {
        currentContext = 'Available for new tasks';
        workflowStage = 'ready';
      }
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
        []
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
        .filter(conv => conv.content === '**CONVERSATION_MEMORY**')
        .sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return dateB - dateA;
        })[0];
      
      if (memoryEntry) {
        return JSON.parse(memoryEntry.content);
      }
      
      return null;
    } catch (error) {
      console.error('Failed to retrieve agent memory:', error);
      return null;
    }
  }

  /**
   * UNIFIED CONTEXT RESTORATION: Restore agent context between sessions
   */
  static async restoreAgentContext(agentId: string, userId: string): Promise<any[]> {
    try {
      console.log(`🔄 RESTORING CONTEXT: Agent ${agentId} for user ${userId}`);
      
      // Get latest memory from ConversationManager
      const latestMemory = await this.retrieveAgentMemory(agentId, userId);
      
      // Get learning patterns from enhanced learning system
      const learningInsights = await claudeApiServiceSimple.getAgentLearningInsights(agentId, userId);
      const agentKnowledge = learningInsights?.recentActivity || [];
      
      // Get advanced memory profile from simple memory service
      const memoryProfile = await memoryService.getAgentMemoryProfile(agentId, userId);
      
      const contextMessages: any[] = [];
      
      if (latestMemory) {
        // Add conversation memory
        contextMessages.push({
          role: 'system',
          content: `**SESSION CONTEXT RESTORED**\n\n**Previous Context:**\n${latestMemory.currentContext}\n\n**Key Tasks:**\n${latestMemory.keyTasks.map(task => `• ${task}`).join('\n')}\n\n**Recent Decisions:**\n${latestMemory.recentDecisions.map(decision => `• ${decision}`).join('\n')}\n\n**Workflow Stage:** ${latestMemory.workflowStage}`
        });
      }
      
      if (agentKnowledge.length > 0) {
        // Add learned knowledge
        const recentKnowledge = agentKnowledge.slice(0, 5);
        contextMessages.push({
          role: 'system',
          content: `**LEARNED KNOWLEDGE:**\n${recentKnowledge.map((k: any) => `• ${k.learningType}: ${k.category} (confidence: ${k.confidence})`).join('\n')}`
        });
      }
      
      if (memoryProfile) {
        // Add intelligence optimization data
        contextMessages.push({
          role: 'system',
          content: `**AGENT OPTIMIZATION:**\nIntelligence Level: ${memoryProfile.intelligenceLevel}/10\nMemory Strength: ${(memoryProfile.memoryStrength * 100).toFixed(1)}%\nLast Optimization: ${memoryProfile.lastOptimization.toISOString().split('T')[0]}`
        });
      }
      
      console.log(`✅ CONTEXT RESTORED: ${contextMessages.length} memory segments loaded for ${agentId}`);
      return contextMessages;
      
    } catch (error) {
      console.error('Failed to restore agent context:', error);
      return [];
    }
  }

  /**
   * Clear old memory entries to prevent database bloat
   */
  static async cleanupOldMemories(agentId: string, userId: string): Promise<void> {
    try {
      const conversations = await storage.getAgentConversations(agentId, userId);
      const memoryEntries = conversations
        .filter(conv => conv.content === '**CONVERSATION_MEMORY**')
        .sort((a, b) => {
          const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return dateB - dateA;
        });
      
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