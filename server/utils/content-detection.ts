/**
 * Content Detection Utility
 * Determines when Claude API is needed for content generation vs autonomous tool operations
 */

export interface ContentAnalysis {
  needsClaudeGeneration: boolean;
  confidence: number;
  detectedType: 'content_generation' | 'tool_operation' | 'hybrid';
  reasoning: string;
}

export class ContentDetector {
  
  /**
   * Analyze if a message needs Claude API for content generation
   */
  static analyzeMessage(message: string): ContentAnalysis {
    const messageWords = message.toLowerCase();
    
    // Content generation keywords (require Claude API)
    const contentKeywords = [
      'create', 'generate', 'implement', 'build', 'design', 'write',
      'component', 'interface', 'service', 'function', 'class',
      '.tsx', '.ts', '.js', '.jsx', 'react', 'typescript',
      'luxury', 'editorial', 'sophisticated', 'professional',
      'code', 'implementation', 'complete', 'working'
    ];

    // Tool operation keywords (can use autonomous system)
    const toolKeywords = [
      'view', 'check', 'list', 'find', 'search', 'debug', 
      'test', 'verify', 'validate', 'monitor', 'status',
      'audit', 'analyze', 'review', 'inspect', 'delete', 
      'remove', 'cleanup', 'clear', 'clean'
    ];

    // File operation indicators
    const fileOperations = [
      'file', 'directory', 'folder', 'path', 'structure'
    ];

    // Count keyword matches
    const contentMatches = contentKeywords.filter(keyword => 
      messageWords.includes(keyword)
    ).length;

    const toolMatches = toolKeywords.filter(keyword => 
      messageWords.includes(keyword)
    ).length;

    const fileMatches = fileOperations.filter(keyword => 
      messageWords.includes(keyword)
    ).length;

    // Specific deletion patterns (always use autonomous system)
    const hasFileDeletion = /(?:delete|remove|cleanup|clean).*\.(tsx|ts|js|jsx|css|html)/i.test(message);
    const hasDeleteCommand = /(?:delete|remove|cleanup|clean)/i.test(message);
    
    // DIRECT AGENT ACCESS: All file operations use autonomous system (not Claude API)
    const hasFileCreation = /create.*\.(tsx|ts|js|jsx|css|html|md)/i.test(message);
    const hasComponentRequest = /component|interface|service/i.test(message);
    const hasImplementation = /implement|build|generate.*code/i.test(message);

    // Decision logic - ALL file operations use autonomous system with direct tool access
    if (hasFileDeletion || hasDeleteCommand || hasFileCreation || hasComponentRequest || hasImplementation) {
      return {
        needsClaudeGeneration: false,
        confidence: 0.9,
        detectedType: 'tool_operation',
        reasoning: 'Direct agent tool access - autonomous system handles all file operations'
      };
    }

    if (contentMatches > toolMatches + fileMatches) {
      return {
        needsClaudeGeneration: true,
        confidence: Math.min(0.8, contentMatches / (contentMatches + toolMatches + 1)),
        detectedType: 'content_generation',
        reasoning: `Content generation keywords (${contentMatches}) outweigh tool operations (${toolMatches})`
      };
    }

    if (toolMatches > contentMatches) {
      return {
        needsClaudeGeneration: false,
        confidence: Math.min(0.8, toolMatches / (toolMatches + contentMatches + 1)),
        detectedType: 'tool_operation',
        reasoning: `Tool operation keywords (${toolMatches}) outweigh content generation (${contentMatches})`
      };
    }

    // Default to tool operation for ambiguous cases (safer, faster)
    return {
      needsClaudeGeneration: false,
      confidence: 0.5,
      detectedType: 'hybrid',
      reasoning: 'Ambiguous request - defaulting to tool operation for efficiency'
    };
  }

  /**
   * Quick check for content generation need
   */
  static needsClaudeGeneration(message: string): boolean {
    return this.analyzeMessage(message).needsClaudeGeneration;
  }
}

export default ContentDetector;