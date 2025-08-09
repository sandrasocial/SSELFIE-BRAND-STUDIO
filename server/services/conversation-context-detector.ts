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

    // CRITICAL FIX: More nuanced context preservation
    if (isGreeting && !isContinuation && !isWorkTask) {
      contextLevel = 'minimal';
      needsFullContext = false;
      needsMemoryPatterns = true; // Keep memory patterns for better continuity
      needsWorkspaceContext = false;
    } else if (isCasualConversation && !isContinuation) {
      contextLevel = 'moderate';
      needsFullContext = true;  // Maintain full context even in casual conversation
      needsWorkspaceContext = true; // Keep workspace context for better task awareness
    } else {
      contextLevel = 'full';
    }
    
    // Force full context for certain scenarios
    if (message.includes('previous') || 
        message.includes('before') || 
        message.includes('earlier') ||
        message.includes('last time') ||
        message.includes('remember')) {
      contextLevel = 'full';
      needsFullContext = true;
      needsMemoryPatterns = true;
      needsWorkspaceContext = true;
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
   * Check if message contains work-related keywords (including verification keywords)
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