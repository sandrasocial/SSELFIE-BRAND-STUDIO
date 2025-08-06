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
   * UNIFIED INTELLIGENCE CLASSIFICATION
   * Let agents naturally decide their approach without restrictive patterns
   */
  classifyMessage(message: string, agentId: string): MessageClassification {
    // PHASE 1 CLEANUP: Remove all restrictive patterns
    // Let Claude's intelligence naturally determine tool usage
    // No forced categorization - agents decide based on context
    
    // UNIFIED APPROACH: Always give agents full intelligence access
    // They will naturally decide when to use tools vs. conversation
    return {
      type: 'conversation',
      confidence: 1.0,
      reason: 'Unified intelligence - agent decides naturally',
      forceClaudeAPI: true // Always use full Claude intelligence
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