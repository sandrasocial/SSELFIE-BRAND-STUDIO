/**
 * INTELLIGENT INTEGRATION MODULE
 * Connects all intelligence systems for enhanced agent capabilities
 */

import { ErrorPreventionSystem } from './error-prevention-system.js';
import { ContextPreservationSystem } from './context-preservation-system.js';
import { getArchitecturalContext } from './architectural-knowledge-base.js';

export class IntelligentIntegrationModule {
  /**
   * Enhance agent system prompt with all intelligence
   */
  static async enhanceSystemPrompt(
    basePrompt: string,
    agentName: string,
    userId: string
  ): Promise<string> {
    let enhancedPrompt = basePrompt;
    
    // Add architectural knowledge
    const architecturalContext = getArchitecturalContext();
    enhancedPrompt += architecturalContext;
    
    // Add previous context
    const previousContext = await ContextPreservationSystem.getContextSummary(agentName, userId);
    if (previousContext) {
      enhancedPrompt += previousContext;
    }
    
    // Add learned patterns
    const patterns = await ContextPreservationSystem.getLearnedPatterns(agentName);
    if (patterns.successful.length > 0) {
      enhancedPrompt += '\n## SUCCESSFUL PATTERNS TO USE:\n';
      patterns.successful.slice(0, 3).forEach(p => {
        enhancedPrompt += `- ${p.pattern}\n`;
      });
    }
    
    if (patterns.failed.length > 0) {
      enhancedPrompt += '\n## PATTERNS TO AVOID:\n';
      patterns.failed.slice(0, 2).forEach(p => {
        enhancedPrompt += `- ${p.attempt}: ${p.error}\n`;
      });
    }
    
    return enhancedPrompt;
  }
  
  /**
   * Process tool execution with intelligence
   */
  static async processToolExecution(
    toolName: string,
    toolInput: any,
    agentName: string,
    userId: string
  ): Promise<{ valid: boolean; suggestions?: string[] }> {
    // Validate before execution
    if (toolName === 'str_replace_based_edit_tool' && toolInput.command === 'str_replace') {
      if (toolInput.new_str) {
        const validation = await ErrorPreventionSystem.validateCode(
          toolInput.new_str,
          toolInput.path || ''
        );
        
        if (!validation.valid) {
          // Record failure for learning
          await ContextPreservationSystem.recordFailure(
            agentName,
            userId,
            `Code modification in ${toolInput.path}`,
            validation.errors.join(', ')
          );
          
          return {
            valid: false,
            suggestions: validation.suggestions
          };
        }
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Record successful execution for learning
   */
  static async recordSuccess(
    agentName: string,
    userId: string,
    action: string,
    details: any
  ): Promise<void> {
    await ContextPreservationSystem.recordSuccess(
      agentName,
      userId,
      action,
      details
    );
  }
  
  /**
   * Get intelligent search parameters
   */
  static getSmartSearchParams(query: string): any {
    // Simplify search queries for better results
    const keywords = query.toLowerCase().split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 3); // Limit to 3 key terms
    
    return {
      query_description: keywords.join(' '),
      maxResults: 10 // Focus on top results
    };
  }
  
  /**
   * Format search results for agent comprehension
   */
  static formatSearchResults(results: any): string {
    if (!results || !results.results) {
      return 'No files found. Try different search terms.';
    }
    
    let formatted = `FOUND ${results.results.length} FILES:\n\n`;
    
    results.results.forEach((r: any, i: number) => {
      formatted += `${i + 1}. ${r.file}\n`;
      formatted += `   Reason: ${r.reason}\n`;
      if (r.snippet) {
        formatted += `   Preview: ${r.snippet.substring(0, 100)}...\n`;
      }
      formatted += '\n';
    });
    
    formatted += '\nACTION: Use str_replace_based_edit_tool to view or modify these files.';
    
    return formatted;
  }
  
  /**
   * Get architectural hints for file placement
   */
  static getFilePlacementHint(fileType: string): string {
    const hints: Record<string, string> = {
      component: 'Place in client/src/components/',
      page: 'Place in client/src/pages/',
      hook: 'Place in client/src/hooks/',
      api: 'Place in server/routes/',
      service: 'Place in server/services/',
      agent: 'Place in server/agents/',
      schema: 'Place in shared/'
    };
    
    return hints[fileType] || 'Check project structure for proper placement';
  }
  
  /**
   * Validate file modification intent
   */
  static validateModificationIntent(
    fileName: string,
    intent: string
  ): { shouldModify: boolean; reason: string } {
    // Check for common mistakes
    if (fileName.includes('-redesigned') || fileName.includes('-new')) {
      return {
        shouldModify: false,
        reason: 'Modify the original file instead of creating a new version'
      };
    }
    
    if (intent.includes('create') && fileName.includes('admin-dashboard')) {
      return {
        shouldModify: false,
        reason: 'admin-dashboard.tsx already exists - modify it instead'
      };
    }
    
    return {
      shouldModify: true,
      reason: 'Proceed with modification'
    };
  }
}