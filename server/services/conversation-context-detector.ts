/**
 * CONVERSATION CONTEXT DETECTOR
 * Determines if a message requires full context or is just casual conversation
 * CRITICAL FIX: Prevents admin agents from loading heavy context for simple greetings
 */

export interface ContextRequirement {
  isWorkTask: boolean;
  isGreeting: boolean;
  isCasualConversation: boolean;
  needsFullContext: boolean;
  needsMemoryPatterns: boolean;
  needsWorkspaceContext: boolean;
  contextLevel: 'minimal' | 'moderate' | 'full';
}

export class ConversationContextDetector {
  
  /**
   * Analyze message to determine what level of context is needed
   */
  static analyzeMessage(message: string): ContextRequirement {
    const lowercaseMessage = message.toLowerCase().trim();
    
    // GREETING PATTERNS
    const greetingPatterns = [
      /^(hi|hey|hello|good morning|good afternoon|good evening)/,
      /how are you/,
      /what's up/,
      /how's it going/,
      /^yo[\s,]/,
      /^sup[\s,]?/,
      /nice to see you/,
      /good to see you/
    ];
    
    const isGreeting = greetingPatterns.some(pattern => pattern.test(lowercaseMessage));
    
    // CASUAL CONVERSATION PATTERNS
    const casualPatterns = [
      /^(thanks|thank you|thx)/,
      /^(ok|okay|alright|got it|understood)/,
      /^(yes|yeah|yep|no|nope)/,
      /^(cool|nice|great|awesome)/,
      /^(sorry|my bad|apologies)/,
      /what do you think/,
      /do you like/,
      /what's your opinion/,
      /^just checking/,
      /^quick question$/
    ];
    
    const isCasualConversation = casualPatterns.some(pattern => pattern.test(lowercaseMessage)) || 
                                 (message.length < 20 && !this.containsWorkKeywords(message));
    
    // WORK TASK PATTERNS
    const workPatterns = [
      /create|build|implement|add|remove|delete|modify|update|fix|debug/,
      /file|component|function|class|interface|api|endpoint|route/,
      /database|table|query|schema|migration/,
      /test|deploy|install|configure|setup/,
      /error|issue|problem|bug|fail/,
      /search|find|look for|locate/,
      /analyze|review|check|examine|audit/,
      /help me (with|to)/,
      /can you (create|build|implement|add|remove|fix|debug|find)/,
      /need (to|you to)/,
      /(make|do) (a|an|the|this|that)/
    ];
    
    const isWorkTask = workPatterns.some(pattern => pattern.test(lowercaseMessage)) ||
                       this.containsWorkKeywords(message);
    
    // DETERMINE CONTEXT REQUIREMENTS
    let contextLevel: 'minimal' | 'moderate' | 'full' = 'full';
    let needsFullContext = true;
    let needsMemoryPatterns = true;
    let needsWorkspaceContext = true;
    
    if (isGreeting && !isWorkTask) {
      contextLevel = 'minimal';
      needsFullContext = false;
      needsMemoryPatterns = false;
      needsWorkspaceContext = false;
    } else if (isCasualConversation && !isWorkTask) {
      contextLevel = 'minimal';
      needsFullContext = false;
      needsMemoryPatterns = false;
      needsWorkspaceContext = false;
    } else if (message.length < 50 && !isWorkTask) {
      contextLevel = 'moderate';
      needsFullContext = false;
      needsMemoryPatterns = false;
      needsWorkspaceContext = false;
    }
    
    return {
      isWorkTask,
      isGreeting,
      isCasualConversation,
      needsFullContext,
      needsMemoryPatterns,
      needsWorkspaceContext,
      contextLevel
    };
  }
  
  /**
   * Check if message contains work-related keywords
   */
  private static containsWorkKeywords(message: string): boolean {
    const workKeywords = [
      'typescript', 'javascript', 'react', 'express', 'database', 'api',
      'component', 'function', 'class', 'interface', 'server', 'client',
      'frontend', 'backend', 'css', 'html', 'sql', 'json', 'npm', 'git',
      'deployment', 'production', 'development', 'testing', 'auth', 'login',
      'user', 'admin', 'dashboard', 'form', 'button', 'page', 'route',
      'service', 'model', 'controller', 'middleware', 'schema', 'type',
      'import', 'export', 'await', 'async', 'promise', 'fetch', 'axios'
    ];
    
    const lowercaseMessage = message.toLowerCase();
    return workKeywords.some(keyword => lowercaseMessage.includes(keyword));
  }
  
  /**
   * Generate appropriate system prompt based on context requirements
   */
  static generateContextPrompt(
    baseSystemPrompt: string,
    requirement: ContextRequirement,
    contextSummary?: string,
    memoryPatterns?: string,
    workspaceContext?: any
  ): string {
    let prompt = baseSystemPrompt;
    
    if (requirement.contextLevel === 'minimal') {
      // For greetings and casual conversation - just personality, no work context
      prompt += `\n\n## CONVERSATION MODE: CASUAL
You are having a casual conversation. Respond naturally and authentically with your personality.
No need to reference previous work tasks or technical context unless specifically asked.`;
      
    } else if (requirement.contextLevel === 'moderate') {
      // Light context for simple questions
      if (contextSummary) {
        prompt += `\n\n## LIGHT CONTEXT:\n${contextSummary}`;
      }
      
    } else {
      // Full context for work tasks
      if (memoryPatterns) {
        prompt += memoryPatterns;
      }
      
      if (contextSummary) {
        prompt += `\n\n${contextSummary}`;
      }
      
      // Add full project architecture info for work tasks
      prompt += `\n\n## PROJECT ARCHITECTURE - CRITICAL KNOWLEDGE
**SSELFIE Studio Structure (React + TypeScript + Express + PostgreSQL)**

### FILE ORGANIZATION:
- **client/**: React frontend (components, pages, hooks, contexts)
- **server/**: Express backend (routes, services, agents)  
- **shared/**: Shared types and schemas (Drizzle ORM)

### DESIGN RULES - LUXURY STANDARDS
- **Colors**: Black (#0a0a0a), White (#fefefe), Gray (#f5f5f5) ONLY
- **Typography**: Times New Roman headlines, system fonts for body
- **Layout**: No rounded corners (border-radius: 0), editorial spacing

### TOOLS:
- search_filesystem: Find files (use simple keywords)
- str_replace_based_edit_tool: View/edit files  
- bash: Run commands and tests

**REMEMBER**: You have full codebase access. Search and understand before changing.`;
    }
    
    return prompt;
  }
  
  /**
   * Debug message analysis
   */
  static debugAnalysis(message: string): void {
    const analysis = this.analyzeMessage(message);
    console.log(`🔍 CONTEXT ANALYSIS: "${message.substring(0, 50)}..."`);
    console.log(`   Is Greeting: ${analysis.isGreeting}`);
    console.log(`   Is Casual: ${analysis.isCasualConversation}`);
    console.log(`   Is Work Task: ${analysis.isWorkTask}`);
    console.log(`   Context Level: ${analysis.contextLevel.toUpperCase()}`);
    console.log(`   Needs Full Context: ${analysis.needsFullContext}`);
  }
}