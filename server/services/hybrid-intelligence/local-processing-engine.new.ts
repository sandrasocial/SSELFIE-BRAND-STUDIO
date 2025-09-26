/**
 * LOCAL PROCESSING ENGINE - PHASE 3: CROSS-AGENT LEARNING ACTIVATION
 * Connects with agent learning database for cross-agent intelligence sharing
 * Handles pattern extraction, validation, and knowledge persistence locally
 * WITHOUT consuming Claude API tokens while building shared agent intelligence
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../../server/drizzle.js';
import { 
  agentLearning, 
  agentSessionContexts, 
   private validateCSSLocally(code: string, errors: string[], suggestions: string[]): void {
    const brackets = this.countBrackets(code);
    if (brackets.curly !== 0) {
      errors.push('Mismatched CSS braces');
      suggestions.push('Check for missing closing } in CSS rules');
    }
    
    const lines = code.split('\n').filter(line => line.trim());
    lines.forEach((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.includes(':') && !trimmedLine.endsWith(';') && !trimmedLine.endsWith('{') && !trimmedLine.endsWith('}')) {
        suggestions.push(`Line ${i + 1}: Consider adding semicolon`);
      }
    });
  }Base, 
  agentPerformanceMetrics
} from '../../../shared/schema.js';

// Type imports
import type {
  AgentLearning,
  AgentKnowledgeBase,
  AgentPerformanceMetrics
} from '../../../shared/schema.js';

// Core interfaces
export interface PatternData {
  type: string;
  category: string;
  data: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  suggestions: string[];
}

export interface BracketCount {
  curly: number;
  round: number;
  square: number;
}

/**
 * Local Processing Engine Class
 */
export class LocalProcessingEngine {
  private static instance: LocalProcessingEngine;
  private learningCache: Map<string, AgentLearning>;
  private crossAgentPatterns: Map<string, PatternData[]>;

  private constructor() {
    this.learningCache = new Map();
    this.crossAgentPatterns = new Map();
    console.log('🧠 PHASE 3: Cross-Agent Learning Engine initializing...');
    void this.initializeCrossAgentLearning();
  }

  public static getInstance(): LocalProcessingEngine {
    if (!LocalProcessingEngine.instance) {
      LocalProcessingEngine.instance = new LocalProcessingEngine();
    }
    return LocalProcessingEngine.instance;
  }

  /**
   * Initialize cross-agent learning system
   */
  private async initializeCrossAgentLearning(): Promise<void> {
    try {
      const existingLearning = await db
        .select()
        .from(agentLearning)
        .orderBy(desc(agentLearning.confidence))
        .limit(100);

      // Cache high-confidence patterns
      for (const learning of existingLearning) {
        if (parseFloat(learning.confidence || '0') > 0.7) {
          const cacheKey = `${learning.agentName}-${learning.category}`;
          this.learningCache.set(cacheKey, learning);
        }
      }

      console.log(`🧠 Loaded ${existingLearning.length} learning patterns`);
      console.log(`🔥 Cached ${this.learningCache.size} high-confidence patterns`);
    } catch (error) {
      console.error('⚠️ Learning initialization error:', error);
    }
  }

  /**
   * Extract conversation patterns locally
   */
  extractPatternsLocally(userMessage: string, assistantMessage: string): PatternData[] {
    const patterns: PatternData[] = [];
    const userLower = userMessage.toLowerCase();
    const assistantLower = assistantMessage.toLowerCase();

    // 1. Conversation Pattern Analysis
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

    // 2. Task Completion Patterns
    if (assistantMessage.includes('✅') || assistantMessage.includes('completed') || assistantMessage.includes('success')) {
      patterns.push({
        type: 'task_completion',
        category: 'workflow',
        data: {
          taskType: this.identifyTaskTypeLocally(userMessage),
          completionIndicators: ['success', 'completed', 'finished'].filter(
            indicator => assistantLower.includes(indicator)
          ),
          responseLength: assistantMessage.length
        }
      });
    }

    // 3. Tool Usage Patterns
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

    // 4. Communication Preferences
    if (userLower.includes('please') || userLower.includes('can you') || userLower.includes('help')) {
      patterns.push({
        type: 'communication_style',
        category: 'user_interaction',
        data: {
          politeRequest: true,
          helpSeeking: true,
          communicationTone: 'collaborative'
        }
      });
    }

    return patterns;
  }

  /**
   * Save learning data to database
   */
  async saveLearningData(agentName: string, learningType: string, category: string, data: Record<string, any>): Promise<void> {
    try {
      console.log(`💾 Saving learning: ${agentName} - ${category}`);
      
      await db.insert(agentLearning).values({
        agentName,
        learningType,
        category,
        data: JSON.stringify(data),
        confidence: '0.8',
        frequency: 1,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Learning saved: ${agentName} pattern stored`);
    } catch (error) {
      console.error('❌ Learning save failed:', error);
    }
  }

  /**
   * Extract intent locally
   */
  private extractIntentLocally(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('fix') || message.includes('error') || message.includes('bug')) {
      return 'debugging';
    } else if (message.includes('create') || message.includes('build') || message.includes('add')) {
      return 'creation';
    } else if (message.includes('update') || message.includes('modify') || message.includes('change')) {
      return 'modification';
    } else if (message.includes('help') || message.includes('how') || message.includes('what')) {
      return 'assistance';
    }
    
    return 'general';
  }

  /**
   * Extract response type locally
   */
  private extractResponseTypeLocally(assistantMessage: string): string {
    const message = assistantMessage.toLowerCase();
    
    if (message.includes('tool_calls') || message.includes('str_replace')) {
      return 'implementation';
    } else if (message.includes('explanation') || message.includes('analysis')) {
      return 'explanation';
    } else if (message.includes('✅') || message.includes('completed')) {
      return 'completion';
    }
    
    return 'conversational';
  }

  /**
   * Identify task type locally
   */
  private identifyTaskTypeLocally(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('database') || message.includes('sql')) {
      return 'database';
    } else if (message.includes('frontend') || message.includes('ui') || message.includes('component')) {
      return 'frontend';
    } else if (message.includes('backend') || message.includes('api') || message.includes('server')) {
      return 'backend';
    } else if (message.includes('fix') || message.includes('debug')) {
      return 'debugging';
    }
    
    return 'general';
  }

  /**
   * Extract tools used from response
   */
  private extractToolsUsedLocally(response: string): string[] {
    const tools: string[] = [];
    
    if (response.includes('str_replace_based_edit_tool')) {
      tools.push('file_editing');
    }
    if (response.includes('bash')) {
      tools.push('shell_commands');
    }
    if (response.includes('execute_sql_tool')) {
      tools.push('database_operations');
    }
    if (response.includes('search_filesystem')) {
      tools.push('file_search');
    }
    if (response.includes('coordinate_agent')) {
      tools.push('coordinate_agent');
    }
    
    return tools;
  }

  /**
   * Identify design type from message
   */
  private identifyDesignTypeLocally(message: string): string {
    const lower = message.toLowerCase();
    
    if (lower.includes('dashboard') || lower.includes('admin')) {
      return 'dashboard';
    }
    if (lower.includes('landing') || lower.includes('homepage')) {
      return 'landing_page';
    }
    if (lower.includes('form') || lower.includes('input')) {
      return 'form';
    }
    if (lower.includes('nav') || lower.includes('menu')) {
      return 'navigation';
    }
    if (lower.includes('card') || lower.includes('component')) {
      return 'component';
    }
    if (lower.includes('modal') || lower.includes('popup')) {
      return 'modal';
    }
    if (lower.includes('table') || lower.includes('list')) {
      return 'data_display';
    }
    
    return 'general_ui';
  }

  /**
   * Process tool results locally
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
    
    // Default processing
    return this.processGenericResultLocally(toolResult);
  }

  /**
   * Process file edit results
   */
  private processFileEditResultLocally(result: string): string {
    if (result.length <= 8000) {
      return result;
    }
    
    const lines = result.split('\n');
    const importantLines = lines.filter(line => 
      line.includes('successfully') ||
      line.includes('created') ||
      line.includes('modified') ||
      line.includes('error') ||
      line.includes('failed') ||
      line.includes('File:') ||
      line.includes('Result:') ||
      (line.includes('line') && line.includes(':'))
    );
    
    if (importantLines.length > 0) {
      return `${importantLines.slice(0, 30).join('\n')}\n\n[File operation details - ${result.length} chars total]`;
    }
    
    return `${result.substring(0, 4000)}\n\n[File content truncated - ${result.length} total characters]`;
  }

  /**
   * Process command output
   */
  private processCommandResultLocally(result: string): string {
    if (result.length <= 5000) {
      return result;
    }
    
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
   * Process search results
   */
  private processSearchResultLocally(result: string): string {
    try {
      const files = result.match(/fileName[^}]+/g) || [];
      const fileList = files.slice(0, 15).map(f => {
        const name = f.match(/"([^"]+)"/)?.at(1) || '';
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

  /**
   * Validate code locally
   */
  validateCodeLocally(code: string, filePath: string): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      this.validateTypeScriptLocally(code, errors, suggestions);
    }
    
    if (filePath.endsWith('.css')) {
      this.validateCSSLocally(code, errors, suggestions);
    }
    
    if (filePath.endsWith('.json')) {
      this.validateJSONLocally(code, errors, suggestions);
    }
    
    return { valid: errors.length === 0, errors, suggestions };
  }

  /**
   * Basic TypeScript validation
   */
  private validateTypeScriptLocally(code: string, errors: string[], suggestions: string[]): void {
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
    
    const lines = code.split('\n').filter(line => line.trim());
    lines.forEach((line, i) => {
      const trimmedLine = line.trim();
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
   * Count bracket pairs
   */
  private countBrackets(code: string): BracketCount {
    let curly = 0;
    let round = 0;
    let square = 0;
    
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
}

// Export singleton instance
export const localProcessingEngine = LocalProcessingEngine.getInstance();