/**
 * SMART ROUTING LAYER
 * Separates direct workspace operations ($0) from Claude API intelligence tasks (token cost)
 * Fixes the critical token drain issue by routing appropriately
 */

import { directWorkspaceAccess } from './direct-workspace-access';
import { ClaudeApiService } from './claude-api-service';

export interface TaskAnalysis {
  requiresIntelligence: boolean;
  canUseDirectTools: boolean;
  taskType: 'file_operation' | 'conversation' | 'code_generation' | 'analysis' | 'hybrid';
  estimatedComplexity: 'simple' | 'standard' | 'complex';
  directToolsNeeded: string[];
  claudeApiNeeded: boolean;
}

export interface SmartRoutingResult {
  success: boolean;
  response: string;
  toolsUsed: string[];
  costOptimized: boolean;
  routingPath: 'direct_tools' | 'claude_api' | 'hybrid';
  tokenUsage?: number;
}

export class SmartRoutingLayer {
  private claudeApiService: ClaudeApiService;

  constructor() {
    this.claudeApiService = new ClaudeApiService();
  }

  /**
   * Analyzes request to determine optimal routing path
   */
  analyzeRequest(message: string, agentName: string): TaskAnalysis {
    const lowerMessage = message.toLowerCase();
    
    // File operation patterns (should use direct tools)
    const fileOperationPatterns = [
      'create file', 'read file', 'edit file', 'delete file',
      'view file', 'update file', 'modify file', 'save file',
      'create.*\\.ts', 'create.*\\.tsx', 'create.*\\.js', 'create.*\\.json',
      'update.*\\.ts', 'edit.*\\.tsx', 'modify.*\\.js',
      'add to file', 'change in file', 'replace in file'
    ];

    // Intelligence patterns (require Claude API)
    const intelligencePatterns = [
      'generate code', 'write code', 'create component', 'build function',
      'explain', 'analyze', 'review', 'suggest', 'recommend',
      'design', 'architect', 'plan', 'strategy', 'optimize',
      'debug', 'fix bug', 'troubleshoot', 'solve problem',
      'conversation', 'chat', 'discuss', 'advice'
    ];

    // Complexity indicators
    const complexityIndicators = [
      'entire codebase', 'complete system', 'full implementation',
      'multiple files', 'comprehensive', 'end-to-end'
    ];

    const isFileOperation = fileOperationPatterns.some(pattern => 
      new RegExp(pattern).test(lowerMessage)
    );

    const requiresIntelligence = intelligencePatterns.some(pattern =>
      lowerMessage.includes(pattern)
    );

    const isComplex = complexityIndicators.some(pattern =>
      lowerMessage.includes(pattern)
    );

    // Determine task type and routing
    let taskType: TaskAnalysis['taskType'] = 'conversation';
    let canUseDirectTools = false;
    let directToolsNeeded: string[] = [];

    if (isFileOperation && !requiresIntelligence) {
      taskType = 'file_operation';
      canUseDirectTools = true;
      directToolsNeeded = ['str_replace_based_edit_tool', 'enhanced_file_editor'];
    } else if (requiresIntelligence && !isFileOperation) {
      taskType = requiresIntelligence ? 'code_generation' : 'conversation';
      canUseDirectTools = false;
    } else if (isFileOperation && requiresIntelligence) {
      taskType = 'hybrid';
      canUseDirectTools = true;
      directToolsNeeded = ['str_replace_based_edit_tool', 'enhanced_file_editor'];
    }

    const estimatedComplexity = isComplex ? 'complex' : 
                               requiresIntelligence ? 'standard' : 'simple';

    return {
      requiresIntelligence,
      canUseDirectTools,
      taskType,
      estimatedComplexity,
      directToolsNeeded,
      claudeApiNeeded: requiresIntelligence || taskType === 'conversation'
    };
  }

  /**
   * Routes request through optimal path based on analysis
   */
  async routeRequest(
    userId: string,
    agentName: string,
    message: string,
    conversationId: string | null,
    fileEditMode: boolean = true
  ): Promise<SmartRoutingResult> {
    console.log('🎯 SMART ROUTING: Analyzing request for optimal path...');
    
    const analysis = this.analyzeRequest(message, agentName);
    
    console.log('🎯 TASK ANALYSIS:', {
      taskType: analysis.taskType,
      requiresIntelligence: analysis.requiresIntelligence,
      canUseDirectTools: analysis.canUseDirectTools,
      complexity: analysis.estimatedComplexity
    });

    // Import token monitoring
    const { tokenUsageMonitor } = await import('../monitoring/token-usage-monitor');

    try {
      switch (analysis.taskType) {
        case 'file_operation':
          const directResult = await this.handleDirectFileOperation(message, analysis);
          
          // Log token usage for monitoring
          tokenUsageMonitor.logTokenUsage({
            agentName,
            requestType: analysis.taskType,
            routingPath: directResult.routingPath,
            tokensUsed: directResult.tokenUsage || 0,
            costOptimized: directResult.costOptimized,
            message: message.substring(0, 100), // Truncate for privacy
            userId
          });
          
          return directResult;

        case 'conversation':
        case 'code_generation':
        case 'analysis':
          const intelligenceResult = await this.handleIntelligenceTask(
            userId, agentName, message, conversationId, analysis, fileEditMode
          );
          
          // Log token usage
          tokenUsageMonitor.logTokenUsage({
            agentName,
            requestType: analysis.taskType,
            routingPath: intelligenceResult.routingPath,
            tokensUsed: intelligenceResult.tokenUsage || 0,
            costOptimized: intelligenceResult.costOptimized,
            message: message.substring(0, 100),
            userId
          });
          
          return intelligenceResult;

        case 'hybrid':
          const hybridResult = await this.handleHybridTask(
            userId, agentName, message, conversationId, analysis, fileEditMode
          );
          
          // Log token usage
          tokenUsageMonitor.logTokenUsage({
            agentName,
            requestType: analysis.taskType,
            routingPath: hybridResult.routingPath,
            tokensUsed: hybridResult.tokenUsage || 0,
            costOptimized: hybridResult.costOptimized,
            message: message.substring(0, 100),
            userId
          });
          
          return hybridResult;

        default:
          // Fallback to Claude API for unknown patterns
          const fallbackResult = await this.handleIntelligenceTask(
            userId, agentName, message, conversationId, analysis, fileEditMode
          );
          
          // Log fallback usage
          tokenUsageMonitor.logTokenUsage({
            agentName,
            requestType: 'fallback',
            routingPath: fallbackResult.routingPath,
            tokensUsed: fallbackResult.tokenUsage || 0,
            costOptimized: fallbackResult.costOptimized,
            message: message.substring(0, 100),
            userId
          });
          
          return fallbackResult;
      }
    } catch (error) {
      console.error('❌ SMART ROUTING ERROR:', error);
      
      // Fallback to Claude API on routing errors
      return await this.handleIntelligenceTask(
        userId, agentName, message, conversationId, analysis, fileEditMode
      );
    }
  }

  /**
   * Handle simple file operations with direct tools ($0 cost)
   */
  private async handleDirectFileOperation(
    message: string, 
    analysis: TaskAnalysis
  ): Promise<SmartRoutingResult> {
    console.log('🔧 DIRECT TOOLS: Handling file operation with $0 workspace access');

    try {
      // Parse file operation from message
      const operation = this.parseFileOperation(message);
      
      if (!operation) {
        throw new Error('Could not parse file operation from message');
      }

      let response = '';
      const toolsUsed: string[] = [];

      switch (operation.type) {
        case 'read':
          const readResult = await directWorkspaceAccess.readFile(operation.path);
          if (readResult.success) {
            response = `File read successfully:\n\`\`\`\n${readResult.content}\n\`\`\``;
            toolsUsed.push('direct_file_read');
          } else {
            throw new Error(readResult.error || 'File read failed');
          }
          break;

        case 'create':
        case 'write':
          const writeResult = await directWorkspaceAccess.writeFile(
            operation.path, 
            operation.content || ''
          );
          if (writeResult.success) {
            response = `File created successfully at ${operation.path}`;
            toolsUsed.push('direct_file_write');
          } else {
            throw new Error(writeResult.error || 'File write failed');
          }
          break;

        default:
          throw new Error(`Unsupported direct operation: ${operation.type}`);
      }

      return {
        success: true,
        response,
        toolsUsed,
        costOptimized: true,
        routingPath: 'direct_tools',
        tokenUsage: 0
      };

    } catch (error) {
      console.log('⚠️ DIRECT TOOLS FALLBACK: Routing to Claude API for complex file operation');
      
      // Fallback to Claude API for complex file operations
      const claudeResult = await this.claudeApiService.sendMessage(
        '42585527', // Admin user ID  
        'system',
        null,
        message
      );

      return {
        success: true,
        response: claudeResult,
        toolsUsed: ['claude_api_fallback'],
        costOptimized: false,
        routingPath: 'claude_api'
      };
    }
  }

  /**
   * Handle intelligence tasks that require Claude API
   */
  private async handleIntelligenceTask(
    userId: string,
    agentName: string,
    message: string,
    conversationId: string | null,
    analysis: TaskAnalysis,
    fileEditMode: boolean
  ): Promise<SmartRoutingResult> {
    console.log('🧠 CLAUDE API: Handling intelligence task with token usage');

    const response = await this.claudeApiService.sendMessage(
      userId,
      agentName,
      conversationId,
      message,
      undefined, // systemPrompt
      undefined, // tools
      fileEditMode
    );

    // Estimate token usage based on complexity
    const estimatedTokens = analysis.estimatedComplexity === 'complex' ? 32000 :
                           analysis.estimatedComplexity === 'standard' ? 8000 : 4000;

    return {
      success: true,
      response,
      toolsUsed: ['claude_api', agentName],
      costOptimized: false,
      routingPath: 'claude_api',
      tokenUsage: estimatedTokens
    };
  }

  /**
   * Handle hybrid tasks (direct tools + Claude API)
   */
  private async handleHybridTask(
    userId: string,
    agentName: string,
    message: string,
    conversationId: string | null,
    analysis: TaskAnalysis,
    fileEditMode: boolean
  ): Promise<SmartRoutingResult> {
    console.log('🔀 HYBRID: Using direct tools + Claude API for optimal cost/capability balance');

    // First attempt direct tools for any file operations
    const directToolsUsed: string[] = [];
    let directResponse = '';

    try {
      const operation = this.parseFileOperation(message);
      if (operation) {
        const directResult = await this.handleDirectFileOperation(message, analysis);
        if (directResult.success) {
          directResponse = directResult.response;
          directToolsUsed.push(...directResult.toolsUsed);
        }
      }
    } catch (error) {
      console.log('⚠️ HYBRID: Direct tools failed, proceeding with Claude API only');
    }

    // Then use Claude API for intelligence/generation
    const claudeResponse = await this.claudeApiService.sendMessage(
      userId,
      agentName,
      conversationId,
      message,
      undefined,
      undefined,
      fileEditMode
    );

    const combinedResponse = directResponse ? 
      `${directResponse}\n\n${claudeResponse}` : claudeResponse;

    const estimatedTokens = analysis.estimatedComplexity === 'complex' ? 32000 :
                           analysis.estimatedComplexity === 'standard' ? 8000 : 4000;

    return {
      success: true,
      response: combinedResponse,
      toolsUsed: [...directToolsUsed, 'claude_api', agentName],
      costOptimized: directToolsUsed.length > 0,
      routingPath: 'hybrid',
      tokenUsage: estimatedTokens
    };
  }

  /**
   * Parse file operation details from natural language message
   */
  private parseFileOperation(message: string): {
    type: 'read' | 'write' | 'create' | 'edit' | 'delete';
    path: string;
    content?: string;
  } | null {
    const lowerMessage = message.toLowerCase();

    // Extract file path
    const pathMatch = message.match(/(?:file|path)\s+([^\s]+\.[a-zA-Z]+)/i) ||
                     message.match(/([^\s]+\.[a-zA-Z]+)/);
    
    if (!pathMatch) return null;

    const path = pathMatch[1];

    // Determine operation type
    if (lowerMessage.includes('read') || lowerMessage.includes('view') || lowerMessage.includes('show')) {
      return { type: 'read', path };
    }

    if (lowerMessage.includes('create') || lowerMessage.includes('new')) {
      // Extract content if provided
      const contentMatch = message.match(/(?:content|with)[\s:]+(.+)$/i);
      return { 
        type: 'create', 
        path, 
        content: contentMatch ? contentMatch[1] : '' 
      };
    }

    if (lowerMessage.includes('write') || lowerMessage.includes('save')) {
      const contentMatch = message.match(/(?:content|with)[\s:]+(.+)$/i);
      return { 
        type: 'write', 
        path, 
        content: contentMatch ? contentMatch[1] : '' 
      };
    }

    return null;
  }
}

export const smartRoutingLayer = new SmartRoutingLayer();