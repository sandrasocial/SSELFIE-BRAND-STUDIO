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

    // Simple file operations (always use autonomous system)
    const hasFileDeletion = /(?:delete|remove|cleanup|clean).*\.(tsx|ts|js|jsx|css|html)/i.test(message);
    const hasDeleteCommand = /(?:delete|remove|cleanup|clean)/i.test(message);
    const hasSimpleFileCreation = /^create\s+[\w-]+\.(txt|md)$/i.test(message.trim());
    
    // Complex content generation (always use Claude API)
    const hasComplexCodeRequest = /(?:write|implement|build|generate|design).*(?:complete|full|working|functional).*(?:code|component|typescript|react)/i.test(message);
    const hasCodeWithStyling = /(?:component|interface|service).*(?:styling|design|luxury|editorial|professional)/i.test(message);
    const hasReactTypeScript = /react.*typescript|typescript.*react|\.tsx.*(?:complete|working|functional)/i.test(message);
    const hasComplexImplementation = /(?:implement|build|generate).*(?:complete|full|working|functional|proper|detailed)/i.test(message);

    // Priority routing decisions
    if (hasFileDeletion || hasDeleteCommand) {
      return {
        needsClaudeGeneration: false,
        confidence: 0.95,
        detectedType: 'tool_operation',
        reasoning: 'File deletion/cleanup - autonomous system handles direct file operations'
      };
    }

    if (hasComplexCodeRequest || hasCodeWithStyling || hasReactTypeScript || hasComplexImplementation) {
      return {
        needsClaudeGeneration: true,
        confidence: 0.9,
        detectedType: 'content_generation',
        reasoning: 'Complex code generation with styling/TypeScript - requires Claude API for quality'
      };
    }

    if (hasSimpleFileCreation) {
      return {
        needsClaudeGeneration: false,
        confidence: 0.85,
        detectedType: 'tool_operation',
        reasoning: 'Simple file creation - autonomous system can handle basic files'
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