/**
 * Enhanced Content Detection Utility - Replit AI Level
 * Advanced routing with lower confidence thresholds for complex analysis
 * Determines when Claude API is needed for content generation vs autonomous tool operations
 */

export interface ContentAnalysis {
  needsClaudeGeneration: boolean;
  confidence: number;
  detectedType: 'content_generation' | 'tool_operation' | 'hybrid' | 'complex_analysis' | 'architectural_decision';
  reasoning: string;
  complexity: 'low' | 'medium' | 'high' | 'enterprise';
  contextualFactors: string[];
  alternativeApproach?: string;
}

export interface SemanticContext {
  projectContext: string;
  technicalDepth: number;
  businessImpact: number;
  architecturalImplications: boolean;
  performanceConsiderations: boolean;
}

export class EnhancedContentDetector {
  
  /**
   * Enhanced Replit AI-level analysis with lower confidence thresholds
   */
  static analyzeMessage(message: string, semanticContext?: SemanticContext): ContentAnalysis {
    const messageWords = message.toLowerCase();
    const contextualFactors: string[] = [];
    
    // Enhanced content generation keywords (require Claude API)
    const contentKeywords = [
      'create', 'generate', 'implement', 'build', 'design', 'write',
      'component', 'interface', 'service', 'function', 'class',
      '.tsx', '.ts', '.js', '.jsx', 'react', 'typescript',
      'luxury', 'editorial', 'sophisticated', 'professional',
      'code', 'implementation', 'complete', 'working', 'enhancement',
      'replit ai-level', 'advanced', 'enterprise', 'scalable', 'optimization'
    ];

    // Complex analysis keywords (lower threshold for Claude routing)
    const complexAnalysisKeywords = [
      'architecture', 'system', 'integration', 'dependency', 'mapping',
      'workload', 'balancing', 'semantic', 'project structure', 'routing',
      'improvements', 'delegation', 'task dependency', 'enhancements',
      'ai-level', 'replit', 'semantic analysis', 'contextual'
    ];

    // Tool operation keywords (can use autonomous system)
    const toolKeywords = [
      'view', 'check', 'list', 'find', 'search', 'debug', 
      'test', 'verify', 'validate', 'monitor', 'status',
      'audit', 'review', 'inspect', 'delete', 
      'remove', 'cleanup', 'clear', 'clean'
    ];

    // Simple file operation indicators
    const fileOperations = [
      'file', 'directory', 'folder', 'path'
    ];

    // Architectural decision indicators (require Claude for strategic thinking)
    const architecturalKeywords = [
      'architecture', 'system design', 'scalability', 'performance',
      'infrastructure', 'platform', 'enterprise', 'global expansion',
      'technical strategy', 'implementation approach', 'best practices'
    ];

    // Count keyword matches with enhanced weighting
    const contentMatches = contentKeywords.filter(keyword => 
      messageWords.includes(keyword)
    ).length;

    const complexAnalysisMatches = complexAnalysisKeywords.filter(keyword => 
      messageWords.includes(keyword)
    ).length;

    const toolMatches = toolKeywords.filter(keyword => 
      messageWords.includes(keyword)
    ).length;

    const fileMatches = fileOperations.filter(keyword => 
      messageWords.includes(keyword)
    ).length;

    const architecturalMatches = architecturalKeywords.filter(keyword => 
      messageWords.includes(keyword)
    ).length;

    // Enhanced complexity analysis
    const hasMultipleSystemsRequest = (message.match(/\d+\)/g) || []).length >= 2;
    const hasCompleteImplementation = /complete.*implementation/i.test(message);
    const hasEnhancementRequest = /enhancement|improve|optimize|upgrade/i.test(message);
    const hasReplitAILevel = /replit ai.?level|ai.?level/i.test(message);

    if (hasMultipleSystemsRequest) contextualFactors.push('Multiple system integration');
    if (hasCompleteImplementation) contextualFactors.push('Complete implementation required');
    if (hasEnhancementRequest) contextualFactors.push('Enhancement/optimization focus');
    if (hasReplitAILevel) contextualFactors.push('Replit AI-level complexity');

    // Simple file operations (can use autonomous system)
    const hasFileDeletion = /(?:delete|remove|cleanup|clean).*\.(tsx|ts|js|jsx|css|html)/i.test(message) && !hasMultipleSystemsRequest;
    const hasDeleteCommand = /(?:delete|remove|cleanup|clean)/i.test(message) && !hasCompleteImplementation;
    const hasSimpleFileCreation = /^create\s+[\w-]+\.(txt|md)$/i.test(message.trim());
    
    // Complex content generation (always use Claude API) - LOWERED THRESHOLDS
    const hasComplexCodeRequest = /(?:write|implement|build|generate|design).*(?:complete|full|working|functional).*(?:code|component|typescript|react)/i.test(message);
    const hasCodeWithStyling = /(?:component|interface|service).*(?:styling|design|luxury|editorial|professional)/i.test(message);
    const hasReactTypeScript = /react.*typescript|typescript.*react|\.tsx.*(?:complete|working|functional)/i.test(message);
    const hasComplexImplementation = /(?:implement|build|generate).*(?:complete|full|working|functional|proper|detailed)/i.test(message);
    const hasCodeGeneration = /(?:generate|write).*(?:code|component|typescript|react|function|class|interface)/i.test(message);
    const hasWorkingCode = /(?:working|functional|complete).*(?:code|component|react|typescript)/i.test(message);
    
    // NEW: Lower threshold complex analysis patterns
    const hasSystemIntegration = /system.*integration|integration.*system/i.test(message);
    const hasArchitecturalRequest = architecturalMatches > 0 || /architecture|architectural/i.test(message);
    const hasComplexAnalysisRequest = complexAnalysisMatches >= 2; // LOWERED from 3
    const hasEnterpriseLevel = /enterprise|scalable|production|global/i.test(message);
    
    // Determine complexity level
    let complexity: 'low' | 'medium' | 'high' | 'enterprise' = 'low';
    if (hasReplitAILevel || hasEnterpriseLevel) complexity = 'enterprise';
    else if (hasMultipleSystemsRequest || hasArchitecturalRequest) complexity = 'high';
    else if (hasComplexAnalysisRequest || hasEnhancementRequest) complexity = 'medium';
    
    // Return analysis result based on complexity and patterns
    if (hasComplexCodeRequest || hasCodeWithStyling || hasReactTypeScript || hasComplexImplementation || 
        hasCodeGeneration || hasWorkingCode || complexity === 'enterprise') {
      return {
        needsClaudeGeneration: true,
        confidence: 0.9,
        detectedType: 'content_generation',
        complexity,
        contextualFactors,
        reasoning: `Complex ${complexity} level request requiring Claude API for quality code generation`
      };
    }
    
    // For ambiguous cases (safer, faster)
    return {
      needsClaudeGeneration: false,
      confidence: 0.5,
      detectedType: 'hybrid',
      complexity,
      contextualFactors,
      reasoning: 'Ambiguous request - defaulting to tool operation for efficiency'
    };
  }

  /**
   * Quick check for content generation need
   */
  static needsClaudeGeneration(message: string): boolean {
    return EnhancedContentDetector.analyzeMessage(message).needsClaudeGeneration;
  }
}

// Export both for compatibility
export default EnhancedContentDetector;
export { EnhancedContentDetector as ContentDetector };