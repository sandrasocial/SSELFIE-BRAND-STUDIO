/**
 * CLAUDE-HYBRID BRIDGE
 * Enables Claude agents to trigger hybrid intelligence tool execution during conversations
 * Maintains authentic agent personalities while providing zero-cost tool operations
 */

import { HybridAgentOrchestrator } from './hybrid-intelligence/hybrid-agent-orchestrator';
import type { LocalStreamingRequest } from './hybrid-intelligence/local-streaming-engine';

export interface ToolExecutionRequest {
  toolName: string;
  parameters: any;
  agentId: string;
  userId: string;
  conversationId: string;
  context?: any;
}

export interface ToolExecutionResult {
  success: boolean;
  result: any;
  tokensUsed: number;
  tokensSaved: number;
  executionTime: number;
}

export class ClaudeHybridBridge {
  private static instance: ClaudeHybridBridge;
  private hybridOrchestrator = HybridAgentOrchestrator.getInstance();

  private constructor() {}

  public static getInstance(): ClaudeHybridBridge {
    if (!ClaudeHybridBridge.instance) {
      ClaudeHybridBridge.instance = new ClaudeHybridBridge();
    }
    return ClaudeHybridBridge.instance;
  }

  /**
   * EXECUTE TOOL VIA HYBRID INTELLIGENCE
   * Called when Claude agents need to execute tools during conversations
   */
  async executeToolViaHybrid(request: ToolExecutionRequest): Promise<ToolExecutionResult> {
    const startTime = Date.now();
    console.log(`🌉 CLAUDE→HYBRID BRIDGE: ${request.agentId} executing ${request.toolName} via hybrid intelligence`);

    try {
      // Convert tool execution to hybrid request format
      const hybridRequest: LocalStreamingRequest = {
        agentId: request.agentId,
        userId: request.userId,
        message: this.formatToolExecutionMessage(request.toolName, request.parameters),
        conversationId: request.conversationId,
        context: {
          toolExecution: true,
          originalTool: request.toolName,
          originalParameters: request.parameters,
          ...request.context
        }
      };

      // Execute through hybrid intelligence system
      const hybridResult = await this.hybridOrchestrator.processHybridRequest(hybridRequest);

      if (hybridResult.success) {
        console.log(`✅ HYBRID EXECUTION SUCCESS: ${request.toolName} completed with ${hybridResult.tokensSaved} tokens saved`);
        
        return {
          success: true,
          result: this.parseToolResult(hybridResult.content, request.toolName),
          tokensUsed: hybridResult.tokensUsed,
          tokensSaved: hybridResult.tokensSaved,
          executionTime: Date.now() - startTime
        };
      } else {
        console.log(`⚠️ HYBRID EXECUTION PARTIAL: ${request.toolName} - attempting direct execution`);
        
        // Fallback to direct tool execution if hybrid fails
        const directResult = await this.executeToolDirectly(request);
        return {
          success: directResult.success,
          result: directResult.result,
          tokensUsed: 0, // Direct execution still zero-cost
          tokensSaved: 1000, // Estimated tokens saved vs Claude API
          executionTime: Date.now() - startTime
        };
      }

    } catch (error) {
      console.error(`❌ CLAUDE→HYBRID BRIDGE ERROR: ${request.toolName}:`, error);
      
      // Emergency fallback
      const emergencyResult = await this.executeToolDirectly(request);
      return {
        success: emergencyResult.success,
        result: emergencyResult.result,
        tokensUsed: 0,
        tokensSaved: 0,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * FORMAT TOOL EXECUTION MESSAGE
   * Converts tool parameters into a message format for hybrid processing
   */
  private formatToolExecutionMessage(toolName: string, parameters: any): string {
    switch (toolName) {
      case 'search_filesystem':
        if (parameters.query_description) {
          return `Search for: ${parameters.query_description}${parameters.search_paths ? ` in paths: ${parameters.search_paths.join(', ')}` : ''}`;
        }
        if (parameters.code && parameters.code.length > 0) {
          return `Find code: ${parameters.code.join(', ')}`;
        }
        if (parameters.function_names && parameters.function_names.length > 0) {
          return `Find functions: ${parameters.function_names.join(', ')}`;
        }
        return 'Search filesystem';

      case 'str_replace_based_edit_tool':
        if (parameters.command === 'view') {
          return `View file: ${parameters.path}${parameters.view_range ? ` lines ${parameters.view_range.join('-')}` : ''}`;
        }
        if (parameters.command === 'create') {
          return `Create file: ${parameters.path}`;
        }
        if (parameters.command === 'str_replace') {
          return `Edit file: ${parameters.path} - replace content`;
        }
        return `File operation: ${parameters.command} on ${parameters.path}`;

      case 'bash':
        return `Execute command: ${parameters.command}`;

      case 'get_latest_lsp_diagnostics':
        return `Check for errors${parameters.file_path ? ` in ${parameters.file_path}` : ''}`;

      default:
        return `Execute ${toolName} with parameters: ${JSON.stringify(parameters)}`;
    }
  }

  /**
   * PARSE TOOL RESULT
   * Converts hybrid intelligence response back to tool-specific format
   */
  private parseToolResult(content: string, toolName: string): any {
    try {
      // Try to parse as JSON first
      const jsonResult = JSON.parse(content);
      return jsonResult;
    } catch {
      // Return as string content for text-based results
      return {
        content,
        toolName,
        success: true
      };
    }
  }

  /**
   * EXECUTE TOOL DIRECTLY
   * Emergency fallback for direct tool execution
   */
  private async executeToolDirectly(request: ToolExecutionRequest): Promise<{ success: boolean; result: any }> {
    console.log(`🔧 DIRECT TOOL EXECUTION: ${request.toolName} (emergency fallback)`);

    try {
      switch (request.toolName) {
        case 'search_filesystem':
          return await this.executeSearchFilesystem(request.parameters);
        
        case 'str_replace_based_edit_tool':
          return await this.executeFileOperation(request.parameters);
        
        case 'bash':
          return await this.executeBashCommand(request.parameters);
        
        case 'get_latest_lsp_diagnostics':
          return await this.executeLspDiagnostics(request.parameters);
        
        default:
          return {
            success: false,
            result: { error: `Unknown tool: ${request.toolName}` }
          };
      }
    } catch (error) {
      return {
        success: false,
        result: { error: error.message }
      };
    }
  }

  private async executeSearchFilesystem(params: any): Promise<{ success: boolean; result: any }> {
    // Import and execute search_filesystem logic
    const { search_filesystem } = await import('../../tools/search_filesystem');
    const result = await search_filesystem(params);
    return { success: true, result };
  }

  private async executeFileOperation(params: any): Promise<{ success: boolean; result: any }> {
    // Import and execute str_replace_based_edit_tool logic
    const { str_replace_based_edit_tool } = await import('../../tools/str_replace_based_edit_tool');
    const result = await str_replace_based_edit_tool(params);
    return { success: true, result };
  }

  private async executeBashCommand(params: any): Promise<{ success: boolean; result: any }> {
    // Import and execute bash command logic
    const { bash } = await import('../../tools/bash');
    const result = await bash(params);
    return { success: true, result };
  }

  private async executeLspDiagnostics(params: any): Promise<{ success: boolean; result: any }> {
    // Import and execute LSP diagnostics logic
    const { get_latest_lsp_diagnostics } = await import('../../tools/get_latest_lsp_diagnostics');
    const result = await get_latest_lsp_diagnostics(params);
    return { success: true, result };
  }
}

export const claudeHybridBridge = ClaudeHybridBridge.getInstance();