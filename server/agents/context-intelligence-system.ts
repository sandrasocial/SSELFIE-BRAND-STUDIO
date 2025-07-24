// Context Intelligence System - Makes Visual Editor agents understand like Replit AI
// This bridges the gap between single-message context and full conversation understanding

import { ConversationManager } from '../conversation-manager';

export interface ProjectContext {
  currentTask?: string;
  recentDecisions: string[];
  technicalState: string;
  userPreferences: string[];
  workingOn: string[];
  lastAgentWork: { agent: string; task: string; timestamp: number }[];
}

export interface ContextualizedMessage {
  originalMessage: string;
  contextualizedMessage: string;
  projectContext: ProjectContext;
  conversationHistory: Array<{ role: string; content: string }>;
}

export class ContextIntelligenceSystem {
  
  /**
   * Transforms a single message into contextually-aware message like Replit AI
   * Adds conversation history, project context, and implied understanding
   */
  static async contextualizeMessage(
    userId: string, 
    agentId: string, 
    originalMessage: string
  ): Promise<ContextualizedMessage> {
    
    // Get conversation history (like Replit AI has)
    const conversationHistory = await ConversationManager.getRecentHistory(userId, agentId, 10);
    
    // Extract project context from recent work
    const projectContext = await this.extractProjectContext(userId, agentId, conversationHistory);
    
    // Build contextually-aware message
    const contextualizedMessage = this.buildContextualMessage(
      originalMessage, 
      projectContext, 
      conversationHistory
    );
    
    return {
      originalMessage,
      contextualizedMessage,
      projectContext,
      conversationHistory
    };
  }
  
  /**
   * Extracts current project state and context from conversation history
   */
  private static async extractProjectContext(
    userId: string, 
    agentId: string, 
    history: Array<{ role: string; content: string }>
  ): Promise<ProjectContext> {
    
    const recentMessages = history.slice(-20).map(h => h.content).join(' ');
    
    return {
      currentTask: this.extractCurrentTask(recentMessages),
      recentDecisions: this.extractRecentDecisions(recentMessages),
      technicalState: this.extractTechnicalState(recentMessages),
      userPreferences: this.extractUserPreferences(recentMessages),
      workingOn: this.extractWorkingOn(recentMessages),
      lastAgentWork: this.extractLastAgentWork(history)
    };
  }
  
  /**
   * Builds Replit AI style contextual message with full understanding
   */
  private static buildContextualMessage(
    originalMessage: string,
    context: ProjectContext, 
    history: Array<{ role: string; content: string }>
  ): string {
    
    let contextualMessage = `**FULL PROJECT CONTEXT (Like Replit AI):**

**Current Conversation Context:**
${originalMessage}

**What You're Currently Working On:**
${context.workingOn.length > 0 ? context.workingOn.join(', ') : 'New task starting'}

**Recent Project Context:**
${context.currentTask || 'No active task context'}

**Recent Technical Decisions:**
${context.recentDecisions.slice(0, 3).join('\n') || 'No recent decisions found'}

**User's Working Style/Preferences:**
${context.userPreferences.join('\n') || 'Standard approach'}

**Last Agent Work:**
${context.lastAgentWork.slice(0, 2).map(work => 
  `- ${work.agent}: ${work.task} (${Math.round((Date.now() - work.timestamp) / 60000)} min ago)`
).join('\n') || 'No recent agent work'}

**Technical State:**
${context.technicalState || 'Standard SSELFIE Studio architecture'}

---

**CONTEXTUALIZED REQUEST:**
Based on the above context, here's what the user is asking for:

${originalMessage}

**Context-Aware Understanding:**
- This request relates to: ${this.inferRequestContext(originalMessage, context)}
- User expects: ${this.inferUserExpectation(originalMessage, context)}
- Required approach: ${this.inferRequiredApproach(originalMessage, context)}`;

    return contextualMessage;
  }
  
  /**
   * Smart context extraction methods
   */
  private static extractCurrentTask(text: string): string {
    const taskIndicators = ['working on', 'building', 'creating', 'fixing', 'updating'];
    for (const indicator of taskIndicators) {
      const match = text.match(new RegExp(`${indicator} ([^.!?]+)`, 'i'));
      if (match) return match[1];
    }
    return '';
  }
  
  private static extractRecentDecisions(text: string): string[] {
    const decisions = [];
    const decisionPatterns = [
      /decided to ([^.!?]+)/gi,
      /chose to ([^.!?]+)/gi,
      /going with ([^.!?]+)/gi,
      /using ([^.!?]+)/gi
    ];
    
    for (const pattern of decisionPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        decisions.push(match[1]);
      }
    }
    return decisions.slice(0, 5);
  }
  
  private static extractTechnicalState(text: string): string {
    if (text.includes('admin dashboard')) return 'Working on admin dashboard improvements';
    if (text.includes('landing page')) return 'Landing page development active';
    if (text.includes('authentication')) return 'Authentication system work';
    if (text.includes('workflow')) return 'Workflow system development';
    return 'General SSELFIE Studio development';
  }
  
  private static extractUserPreferences(text: string): string[] {
    const preferences = [];
    if (text.includes('luxury') || text.includes('editorial')) preferences.push('Luxury editorial design style');
    if (text.includes('simple') || text.includes('clean')) preferences.push('Clean, simple approach');
    if (text.includes('Times New Roman')) preferences.push('Times New Roman typography');
    if (text.includes('black and white')) preferences.push('Black and white color scheme');
    return preferences;
  }
  
  private static extractWorkingOn(text: string): string[] {
    const working = [];
    const workPatterns = [
      /working on ([^.!?]+)/gi,
      /building ([^.!?]+)/gi,
      /creating ([^.!?]+)/gi,
      /fixing ([^.!?]+)/gi
    ];
    
    for (const pattern of workPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        working.push(match[1]);
      }
    }
    return working.slice(0, 3);
  }
  
  private static extractLastAgentWork(history: Array<{ role: string; content: string }>): Array<{ agent: string; task: string; timestamp: number }> {
    const agentWork = [];
    const agents = ['aria', 'zara', 'rachel', 'victoria', 'maya', 'elena', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga'];
    
    for (let i = history.length - 1; i >= 0 && agentWork.length < 5; i--) {
      const message = history[i];
      for (const agent of agents) {
        if (message.content.toLowerCase().includes(agent) && message.content.includes('working on')) {
          const taskMatch = message.content.match(/working on ([^.!?]+)/i);
          if (taskMatch) {
            agentWork.push({
              agent,
              task: taskMatch[1],
              timestamp: Date.now() - ((history.length - i) * 60000) // Approximate timestamp
            });
            break;
          }
        }
      }
    }
    return agentWork;
  }
  
  /**
   * Smart inference methods for better understanding
   */
  private static inferRequestContext(message: string, context: ProjectContext): string {
    if (message.includes('admin') && context.workingOn.some(w => w.includes('admin'))) {
      return 'Continuation of admin dashboard work';
    }
    if (message.includes('fix') && context.lastAgentWork.length > 0) {
      return `Follow-up to ${context.lastAgentWork[0].agent}'s recent work`;
    }
    if (message.includes('redesign') || message.includes('improve')) {
      return 'Enhancement/improvement of existing feature';
    }
    return 'New task or request';
  }
  
  private static inferUserExpectation(message: string, context: ProjectContext): string {
    if (message.includes('quick') || message.includes('simple')) {
      return 'Fast, simple solution maintaining existing style';
    }
    if (message.includes('complete') || message.includes('full')) {
      return 'Comprehensive solution with full integration';
    }
    if (context.userPreferences.includes('Luxury editorial design style')) {
      return 'Solution following luxury editorial design standards';
    }
    return 'Professional solution following SSELFIE Studio standards';
  }
  
  private static inferRequiredApproach(message: string, context: ProjectContext): string {
    const actionWords = ['create', 'build', 'make', 'add', 'implement'];
    const modifyWords = ['fix', 'update', 'change', 'improve', 'redesign'];
    
    if (actionWords.some(word => message.toLowerCase().includes(word))) {
      return 'Create new component with immediate integration';
    }
    if (modifyWords.some(word => message.toLowerCase().includes(word))) {
      return 'Modify existing files maintaining current architecture';
    }
    return 'Analyze first, then determine appropriate action';
  }
}

export default ContextIntelligenceSystem;