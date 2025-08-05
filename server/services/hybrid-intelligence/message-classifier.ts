/**
 * MESSAGE CLASSIFIER
 * Separates agent conversations from tool operations
 * Ensures agents get full Claude API access while tools use hybrid intelligence
 */

export interface MessageClassification {
  type: 'conversation' | 'tool_operation';
  confidence: number;
  reason: string;
  forceClaudeAPI: boolean;
}

export class MessageClassifier {
  private static instance: MessageClassifier;

  private constructor() {}

  public static getInstance(): MessageClassifier {
    if (!MessageClassifier.instance) {
      MessageClassifier.instance = new MessageClassifier();
    }
    return MessageClassifier.instance;
  }

  /**
   * CLASSIFY MESSAGE TYPE
   * Determines if this is a conversation or tool operation
   */
  classifyMessage(message: string, agentId: string): MessageClassification {
    const trimmedMessage = message.trim().toLowerCase();

    // TOOL OPERATION PATTERNS - These should use hybrid intelligence
    const toolPatterns = [
      /^(search|find|locate).*files?$/i,
      /^(view|show|display).*file.*content$/i,
      /^(run|execute).*command$/i,
      /^(check|verify).*status$/i,
      /^(create|add).*file.*path.*$/i,
      /^(update|edit).*specific.*line$/i,
      /^(delete|remove).*file$/i,
      /^(install|uninstall).*package$/i,
      /^(test|debug).*system$/i,
      /^(backup|restore).*database$/i
    ];

    // Check for explicit tool operations
    if (toolPatterns.some(pattern => pattern.test(message))) {
      return {
        type: 'tool_operation',
        confidence: 0.9,
        reason: 'Explicit tool operation detected',
        forceClaudeAPI: false
      };
    }

    // CONVERSATION PATTERNS - These MUST use Claude API
    const conversationPatterns = [
      /^(hey|hi|hello|good morning|good afternoon)/i,
      /how are you/i,
      /what.*think/i,
      /can you.*help/i,
      /i need.*to create/i,
      /build.*component/i,
      /write.*code/i,
      /create.*system/i,
      /implement.*feature/i,
      /design.*architecture/i,
      /analyze.*requirements/i,
      /provide.*solution/i,
      /generate.*report/i,
      /explain.*concept/i,
      /recommend.*approach/i,
      /review.*code/i
    ];

    // Check for conversation patterns
    if (conversationPatterns.some(pattern => pattern.test(message))) {
      return {
        type: 'conversation',
        confidence: 0.95,
        reason: 'Agent conversation detected - requires full Claude API intelligence',
        forceClaudeAPI: true
      };
    }

    // DEFAULT: Treat as conversation to preserve agent intelligence
    // Better to over-use Claude API than to break agent responses
    return {
      type: 'conversation',
      confidence: 0.8,
      reason: 'Default to conversation to preserve agent authenticity',
      forceClaudeAPI: true
    };
  }

  /**
   * SHOULD USE CLAUDE API
   * Determines if message should bypass hybrid system entirely
   */
  shouldUseClaudeAPI(message: string, agentId: string): boolean {
    const classification = this.classifyMessage(message, agentId);
    return classification.forceClaudeAPI;
  }

  /**
   * IS TOOL OPERATION
   * Determines if this is a pure tool operation for hybrid intelligence
   */
  isToolOperation(message: string, agentId: string): boolean {
    const classification = this.classifyMessage(message, agentId);
    return classification.type === 'tool_operation';
  }
}