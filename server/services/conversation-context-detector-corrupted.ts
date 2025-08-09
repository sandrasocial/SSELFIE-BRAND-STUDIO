/**
 * CONVERSATION CONTEXT DETECTOR
 * Determines if a message requires full context or is just casual conversation
 * CRITICAL FIX: Prevents admin agents from loading heavy context for simple greetings
 */

export interface ContextRequirement {
  isWorkTask: boolean;
  isGreeting: boolean;
  isCasualConversation: boolean;
  isContinuation: boolean;
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
    
    // WORKFLOW CONTINUATION PATTERNS (should get FULL context)
    const continuationPatterns = [
      /^(yes|yeah|yep|perfect|great|excellent).*(let'?s go|continue|proceed|next)/i,
      /^(ok|okay|alright).*(let'?s|continue|go|proceed)/i,
      /^perfect[.,!]?\s*(let'?s go|continue|proceed|next)/i,
      /^(great|excellent|awesome)[.,!]?\s*(let'?s|continue|go|proceed|next)/i,
      /^let'?s (go|continue|proceed|start)/i,
      /^continue/i,
      /^proceed/i,
      /^next step/i
    ];
    
    const isContinuation = continuationPatterns.some(pattern => pattern.test(lowercaseMessage));
    
    // CASUAL CONVERSATION PATTERNS (only apply if NOT continuation)
    const casualPatterns = [
      /^(thanks|thank you|thx)/,
      /^(ok|okay|alright|got it|understood)$/,  // Only if standalone
      /^(yes|yeah|yep|no|nope)$/,               // Only if standalone
      /^(cool|nice|great|awesome)$/,            // Only if standalone
      /^(sorry|my bad|apologies)/,
      /what do you think/,
      /do you like/,
      /what's your opinion/,
      /^just checking/,
      /^quick question$/
    ];
    
    const isCasualConversation = !isContinuation && (
      casualPatterns.some(pattern => pattern.test(lowercaseMessage)) || 
      (message.length < 20 && !this.containsWorkKeywords(message))
    );
    
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
                       this.containsWorkKeywords(message) ||
                       isContinuation; // Continuations are work tasks
    
    // DETERMINE CONTEXT REQUIREMENTS
    let contextLevel: 'minimal' | 'moderate' | 'full';
    let needsFullContext = true;
    let needsMemoryPatterns = true;
    let needsWorkspaceContext = true;

    if (isGreeting && !isContinuation && !isWorkTask) {
      contextLevel = 'minimal';
      needsFullContext = false;
      needsMemoryPatterns = false;
      needsWorkspaceContext = false;
    } else if (isCasualConversation && !isContinuation) {
      contextLevel = 'moderate';
      needsFullContext = false;
      needsWorkspaceContext = false;
    } else {
      contextLevel = 'full';
    }

    return {
      isWorkTask,
      isGreeting,
      isCasualConversation,
      isContinuation,
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
      'code', 'project', 'system', 'platform', 'application',
      'server', 'client', 'api', 'database', 'feature',
      'component', 'function', 'module', 'service', 'integration',
      'deploy', 'production', 'development', 'staging', 'testing',
      'performance', 'security', 'monitoring', 'backup', 'restore',
      'configuration', 'settings', 'environment', 'infrastructure'
    ];

    // VERIFICATION FIX: Include verification-related keywords as work tasks
    const verificationKeywords = [
      'verify', 'audit', 'examine', 'investigate', 'validate', 'confirm', 'ensure'
    ];
    
    const allWorkKeywords = [...workKeywords, ...verificationKeywords];
    
    return allWorkKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }
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
      if (requirement.isContinuation) {
        prompt += `\n\n## WORKFLOW CONTINUATION MODE
You are continuing an ongoing work session. The user has confirmed to proceed with the current workflow.
Continue from where you left off in the previous conversation. Do NOT restart or re-analyze - execute next steps.`;
      }
      
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
    console.log(`   Is Continuation: ${analysis.isContinuation}`);
    console.log(`   Is Work Task: ${analysis.isWorkTask}`);
    console.log(`   Context Level: ${analysis.contextLevel.toUpperCase()}`);
    console.log(`   Needs Full Context: ${analysis.needsFullContext}`);
  }
}