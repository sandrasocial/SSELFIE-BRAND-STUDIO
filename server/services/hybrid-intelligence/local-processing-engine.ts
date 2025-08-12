/**
 * LOCAL PROCESSING ENGINE
 * Handles pattern extraction, validation, and data processing locally
 * WITHOUT consuming Claude API tokens while preserving agent intelligence
 */

import { db } from '../../db';
import { agentLearning, agentSessionContexts } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';

export class LocalProcessingEngine {
  private static instance: LocalProcessingEngine;

  private constructor() {}

  public static getInstance(): LocalProcessingEngine {
    if (!LocalProcessingEngine.instance) {
      LocalProcessingEngine.instance = new LocalProcessingEngine();
    }
    return LocalProcessingEngine.instance;
  }

  // ================== PATTERN EXTRACTION (LOCAL) ==================
  
  /**
   * Extract conversation patterns locally without Claude API
   */
  extractPatternsLocally(userMessage: string, assistantMessage: string): Array<{type: string, category: string, data: any}> {
    const patterns = [];
    const userLower = userMessage.toLowerCase();
    const assistantLower = assistantMessage.toLowerCase();

    // 1. CONVERSATION PATTERN ANALYSIS (LOCAL)
    patterns.push({
      type: 'pattern',
      category: 'conversation',
      data: {
        userIntent: this.extractIntentLocally(userMessage),
        responseType: this.extractResponseTypeLocally(assistantMessage),
        interactionLength: userMessage.length + assistantMessage.length,
        timestamp: new Date().toISOString()
      }
    });

    // 2. TASK COMPLETION PATTERNS (LOCAL)
    if (assistantMessage.includes('✅') || assistantMessage.includes('completed') || assistantMessage.includes('success')) {
      patterns.push({
        type: 'task_completion',
        category: 'workflow',
        data: {
          taskType: this.identifyTaskTypeLocally(userMessage),
          completionIndicators: ['success', 'completed', 'finished'].filter(indicator => 
            assistantLower.includes(indicator)
          ),
          responseLength: assistantMessage.length
        }
      });
    }

    // 3. TOOL USAGE PATTERNS (LOCAL)
    if (assistantMessage.includes('str_replace_based_edit_tool') || assistantMessage.includes('bash')) {
      patterns.push({
        type: 'tool_usage',
        category: 'technical',
        data: {
          toolsUsed: this.extractToolsUsedLocally(assistantMessage),
          taskContext: userMessage.substring(0, 150),
          success: assistantMessage.includes('✅') || assistantMessage.includes('successfully')
        }
      });
    }

    // 4. COMMUNICATION PREFERENCES (LOCAL)
    if (userLower.includes('please') || userLower.includes('can you') || userLower.includes('help')) {
      patterns.push({
        type: 'communication_style',
        category: 'preference',
        data: {
          politenessLevel: userLower.includes('please') ? 'polite' : 'direct',
          requestType: userLower.includes('help') ? 'assistance' : 'action',
          urgencyLevel: userLower.includes('urgent') || userLower.includes('quickly') ? 'high' : 'normal'
        }
      });
    }

    // 5. DESIGN PATTERN RECOGNITION (LOCAL)
    if (userLower.includes('design') || userLower.includes('ui') || userLower.includes('component')) {
      patterns.push({
        type: 'design_request',
        category: 'creative',
        data: {
          designType: this.identifyDesignTypeLocally(userMessage),
          luxuryElements: userLower.includes('luxury') || userLower.includes('sophisticated'),
          colorPreferences: this.extractColorPreferencesLocally(userMessage)
        }
      });
    }

    return patterns;
  }

  // ================== INTENT ANALYSIS (LOCAL) ==================
  
  /**
   * Extract user intent using local pattern matching
   */
  extractIntentLocally(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('create') || lower.includes('build') || lower.includes('make')) return 'create';
    if (lower.includes('fix') || lower.includes('repair') || lower.includes('debug')) return 'fix';
    if (lower.includes('analyze') || lower.includes('check') || lower.includes('review')) return 'analyze';
    if (lower.includes('explain') || lower.includes('help') || lower.includes('how')) return 'explain';
    if (lower.includes('update') || lower.includes('modify') || lower.includes('change')) return 'update';
    if (lower.includes('optimize') || lower.includes('improve') || lower.includes('enhance')) return 'optimize';
    if (lower.includes('deploy') || lower.includes('launch') || lower.includes('publish')) return 'deploy';
    if (lower.includes('test') || lower.includes('validate') || lower.includes('verify')) return 'test';
    return 'general';
  }

  /**
   * Classify response type using local analysis
   */
  extractResponseTypeLocally(response: string): string {
    if (response.includes('```') || response.includes('tsx') || response.includes('typescript')) return 'code';
    if (response.includes('✅') || response.includes('🔧') || response.includes('🎯')) return 'actionable';
    if (response.includes('analysis') || response.includes('found') || response.includes('discovered')) return 'analytical';
    if (response.length > 1000) return 'comprehensive';
    if (response.includes('ERROR') || response.includes('❌') || response.includes('failed')) return 'error';
    if (response.includes('WARNING') || response.includes('⚠️')) return 'warning';
    return 'standard';
  }

  /**
   * Identify task type using local pattern matching
   */
  identifyTaskTypeLocally(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('component') || lower.includes('tsx') || lower.includes('react')) return 'component_development';
    if (lower.includes('database') || lower.includes('schema') || lower.includes('sql')) return 'database';
    if (lower.includes('api') || lower.includes('endpoint') || lower.includes('route')) return 'api_development';
    if (lower.includes('design') || lower.includes('ui') || lower.includes('styling')) return 'design';
    if (lower.includes('agent') || lower.includes('ai') || lower.includes('claude')) return 'agent_system';
    if (lower.includes('auth') || lower.includes('login') || lower.includes('session')) return 'authentication';
    if (lower.includes('deploy') || lower.includes('build') || lower.includes('production')) return 'deployment';
    if (lower.includes('test') || lower.includes('debug') || lower.includes('error')) return 'debugging';
    return 'general_development';
  }

  // ================== TOOL RESULT PROCESSING (LOCAL) ==================
  
  /**
   * Process tool results locally without Claude API
   */
  processToolResultLocally(toolResult: string, toolName: string): string {
    // Fast path for small results
    if (toolResult.length <= 2000) {
      return toolResult;
    }
    
    // Tool-specific local processing
    if (toolName === 'str_replace_based_edit_tool') {
      return this.processFileEditResultLocally(toolResult);
    }
    
    if (toolName === 'bash' || toolName === 'execute_sql_tool') {
      return this.processCommandResultLocally(toolResult);
    }
    
    if (toolName === 'search_filesystem') {
      return this.processSearchResultLocally(toolResult);
    }
    
    // Default local processing
    return this.processGenericResultLocally(toolResult);
  }

  /**
   * Process file edit results locally
   */
  private processFileEditResultLocally(result: string): string {
    // Preserve file editing results completely (they're usually important)
    if (result.length <= 8000) {
      return result;
    }
    
    // Extract key information from file operations
    const lines = result.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('successfully') ||
      line.includes('created') ||
      line.includes('modified') ||
      line.includes('error') ||
      line.includes('failed') ||
      line.includes('File:') ||
      line.includes('Result:') ||
      line.includes('line') && line.includes(':')
    );
    
    if (importantLines.length > 0) {
      return `${importantLines.slice(0, 30).join('\n')}\n\n[File operation details - ${result.length} chars total]`;
    }
    
    return `${result.substring(0, 4000)}\n\n[File content truncated - ${result.length} total characters]`;
  }

  /**
   * Process command output locally
   */
  private processCommandResultLocally(result: string): string {
    if (result.length <= 5000) {
      return result;
    }
    
    // Extract meaningful command output
    const lines = result.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('error') ||
      line.includes('warning') ||
      line.includes('success') ||
      line.includes('completed') ||
      line.includes('failed') ||
      line.includes('●') ||
      line.includes('✓') ||
      line.includes('✗') ||
      line.trim().startsWith('[')
    );
    
    if (importantLines.length > 0) {
      return `${importantLines.slice(0, 20).join('\n')}\n\n[Command output - ${result.length} chars total]`;
    }
    
    return `${result.substring(0, 2500)}\n\n[Output truncated - ${result.length} total characters]`;
  }

  /**
   * Process search results locally
   */
  private processSearchResultLocally(result: string): string {
    try {
      // Extract file names and paths from search results
      const files = result.match(/fileName[^}]+/g) || [];
      const fileList = files.slice(0, 15).map(f => {
        const name = f.match(/"([^"]+)"/)?.[1] || '';
        return `- ${name}`;
      }).join('\n');
      
      return `SEARCH RESULTS (${files.length} files found):\n${fileList}\n\nUse str_replace_based_edit_tool to view or modify these files.`;
    } catch (error) {
      return this.processGenericResultLocally(result);
    }
  }

  /**
   * Generic result processing
   */
  private processGenericResultLocally(result: string): string {
    const lines = result.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('successfully') ||
      line.includes('created') ||
      line.includes('modified') ||
      line.includes('error') ||
      line.includes('failed') ||
      line.includes('Result:') ||
      line.includes('Status:')
    ).slice(0, 20);
    
    const summary = importantLines.join('\n') || lines.slice(0, 30).join('\n');
    return `${summary}\n\n[${result.length} chars total - showing key results]`;
  }

  // ================== ERROR VALIDATION (LOCAL) ==================
  
  /**
   * Validate code locally without Claude API
   */
  validateCodeLocally(code: string, filePath: string): {valid: boolean, errors: string[], suggestions: string[]} {
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    // Basic syntax validation
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      this.validateTypeScriptLocally(code, errors, suggestions);
    }
    
    if (filePath.endsWith('.css')) {
      this.validateCSSLocally(code, errors, suggestions);
    }
    
    if (filePath.endsWith('.json')) {
      this.validateJSONLocally(code, errors, suggestions);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      suggestions
    };
  }

  /**
   * Basic TypeScript validation
   */
  private validateTypeScriptLocally(code: string, errors: string[], suggestions: string[]): void {
    // Check for common syntax issues
    const brackets = this.countBrackets(code);
    if (brackets.curly !== 0) {
      errors.push('Mismatched curly braces');
      suggestions.push('Check for missing or extra { } braces');
    }
    
    if (brackets.round !== 0) {
      errors.push('Mismatched parentheses');
      suggestions.push('Check for missing or extra ( ) parentheses');
    }
    
    if (brackets.square !== 0) {
      errors.push('Mismatched square brackets');
      suggestions.push('Check for missing or extra [ ] brackets');
    }
    
    // Check for unterminated strings
    const stringQuotes = (code.match(/"/g) || []).length;
    const templateLiterals = (code.match(/`/g) || []).length;
    
    if (stringQuotes % 2 !== 0) {
      errors.push('Unterminated string literal');
      suggestions.push('Check for missing closing quote');
    }
    
    if (templateLiterals % 2 !== 0) {
      errors.push('Unterminated template literal');
      suggestions.push('Check for missing closing backtick');
    }
  }

  /**
   * Basic CSS validation
   */
  private validateCSSLocally(code: string, errors: string[], suggestions: string[]): void {
    const brackets = this.countBrackets(code);
    if (brackets.curly !== 0) {
      errors.push('Mismatched CSS braces');
      suggestions.push('Check for missing closing } in CSS rules');
    }
    
    // Check for missing semicolons
    const lines = code.split('\n').filter(line => line.trim());
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.includes(':') && !line.endsWith(';') && !line.endsWith('{') && !line.endsWith('}')) {
        suggestions.push(`Line ${i + 1}: Consider adding semicolon`);
      }
    }
  }

  /**
   * Basic JSON validation
   */
  private validateJSONLocally(code: string, errors: string[], suggestions: string[]): void {
    try {
      JSON.parse(code);
    } catch (error) {
      errors.push('Invalid JSON syntax');
      suggestions.push('Check for trailing commas, missing quotes, or malformed structure');
    }
  }

  /**
   * Count bracket pairs for validation
   */
  private countBrackets(code: string): {curly: number, round: number, square: number} {
    let curly = 0, round = 0, square = 0;
    
    for (const char of code) {
      switch (char) {
        case '{': curly++; break;
        case '}': curly--; break;
        case '(': round++; break;
        case ')': round--; break;
        case '[': square++; break;
        case ']': square--; break;
      }
    }
    
    return { curly, round, square };
  }

  // ================== DATABASE OPERATIONS (LOCAL) ==================
  
  /**
   * Update agent learning locally (database operations only)
   */
  async updateAgentLearningLocally(
    userId: string, 
    agentName: string, 
    userMessage: string, 
    assistantMessage: string
  ): Promise<void> {
    try {
      const normalizedAgentName = agentName.toLowerCase();
      const patterns = this.extractPatternsLocally(userMessage, assistantMessage);

      for (const pattern of patterns) {
        const existing = await db
          .select()
          .from(agentLearning)
          .where(and(
            eq(agentLearning.agentName, normalizedAgentName),
            eq(agentLearning.userId, userId),
            eq(agentLearning.learningType, pattern.type),
            eq(agentLearning.category, pattern.category)
          ))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(agentLearning)
            .set({
              frequency: (existing[0].frequency || 0) + 1,
              confidence: Math.min(1.0, parseFloat(existing[0].confidence?.toString() || "0.5") + 0.1).toString(),
              lastSeen: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(agentLearning.id, existing[0].id));
        } else {
          await db.insert(agentLearning).values({
            agentName: normalizedAgentName,
            userId: userId,
            learningType: pattern.type,
            category: pattern.category,
            data: pattern.data,
            confidence: "0.7",
            frequency: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }
      
      console.log(`🧠 LOCAL: Learning updated for ${normalizedAgentName}: ${patterns.length} patterns`);
    } catch (error) {
      console.error('Failed to update agent learning locally:', error);
    }
  }

  /**
   * Update session context locally (database operations only)
   */
  async updateSessionContextLocally(
    userId: string, 
    agentName: string, 
    conversationId: string, 
    context: any
  ): Promise<void> {
    try {
      const normalizedAgentName = agentName.toLowerCase();
      const sessionId = `${userId}_${normalizedAgentName}_session`;

      const existing = await db
        .select()
        .from(agentSessionContexts)
        .where(and(
          eq(agentSessionContexts.userId, userId),
          eq(agentSessionContexts.agentId, normalizedAgentName)
        ))
        .limit(1);

      const contextData = {
        lastConversationId: conversationId,
        recentInteractions: context,
        timestamp: new Date().toISOString()
      };

      if (existing.length > 0) {
        await db
          .update(agentSessionContexts)
          .set({
            contextData: contextData,
            lastInteraction: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(agentSessionContexts.id, existing[0].id));
      } else {
        await db.insert(agentSessionContexts).values({
          userId: userId,
          agentId: normalizedAgentName,
          sessionId: sessionId,
          contextData: contextData,
          workflowState: 'active',
          lastInteraction: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      console.log(`🔄 LOCAL: Session context updated for ${normalizedAgentName}`);
    } catch (error) {
      console.error('Failed to update session context locally:', error);
    }
  }

  // ================== HELPER FUNCTIONS (LOCAL) ==================
  
  /**
   * Extract tools used from response text
   */
  private extractToolsUsedLocally(response: string): string[] {
    const tools = [];
    if (response.includes('str_replace_based_edit_tool')) tools.push('str_replace_based_edit_tool');
    if (response.includes('bash')) tools.push('bash');
    if (response.includes('execute_sql_tool')) tools.push('execute_sql_tool');
    if (response.includes('search_filesystem')) tools.push('search_filesystem');
    if (response.includes('coordinate_agent')) tools.push('coordinate_agent');
    return tools;
  }

  /**
   * Identify design type from message
   */
  private identifyDesignTypeLocally(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('dashboard') || lower.includes('admin')) return 'dashboard';
    if (lower.includes('landing') || lower.includes('homepage')) return 'landing_page';
    if (lower.includes('form') || lower.includes('input')) return 'form';
    if (lower.includes('nav') || lower.includes('menu')) return 'navigation';
    if (lower.includes('card') || lower.includes('component')) return 'component';
    if (lower.includes('modal') || lower.includes('popup')) return 'modal';
    if (lower.includes('table') || lower.includes('list')) return 'data_display';
    return 'general_ui';
  }

  /**
   * Extract color preferences from message
   */
  private extractColorPreferencesLocally(message: string): string[] {
    const colors = [];
    const lower = message.toLowerCase();
    
    if (lower.includes('black') || lower.includes('dark')) colors.push('black');
    if (lower.includes('white') || lower.includes('light')) colors.push('white');
    if (lower.includes('gold') || lower.includes('luxury')) colors.push('gold');
    if (lower.includes('blue')) colors.push('blue');
    if (lower.includes('red')) colors.push('red');
    if (lower.includes('green')) colors.push('green');
    if (lower.includes('purple')) colors.push('purple');
    if (lower.includes('elegant') || lower.includes('sophisticated')) colors.push('neutral');
    
    return colors;
  }

  /**
   * Generate error fix suggestions locally
   */
  generateFixSuggestionsLocally(errorMessage: string): string[] {
    const suggestions = [];
    const lower = errorMessage.toLowerCase();
    
    if (lower.includes('syntax')) {
      suggestions.push('Check for missing semicolons, brackets, or quotes');
    }
    
    if (lower.includes('file not found') || lower.includes('enoent')) {
      suggestions.push('Verify file path exists and has correct permissions');
    }
    
    if (lower.includes('permission denied')) {
      suggestions.push('Check file permissions or run with appropriate access');
    }
    
    if (lower.includes('port') && lower.includes('already in use')) {
      suggestions.push('Try a different port or stop the conflicting process');
    }
    
    if (lower.includes('module not found') || lower.includes('cannot resolve')) {
      suggestions.push('Install missing dependencies with npm install');
    }
    
    if (lower.includes('type error') || lower.includes('typescript')) {
      suggestions.push('Check type definitions and imports');
    }
    
    return suggestions.length > 0 ? suggestions : ['Review error details and check documentation'];
  }
}

export const localProcessingEngine = LocalProcessingEngine.getInstance();