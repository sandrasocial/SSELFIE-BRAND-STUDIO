// Direct Tool Executor - No Claude API Credits Required
// This enables agents to directly execute file operations without Claude API calls

import { str_replace_based_edit_tool } from '../tools/str_replace_based_edit_tool';
import { search_filesystem } from '../tools/search_filesystem';

export interface DirectToolResult {
  success: boolean;
  result: any;
  error?: string;
}

export class DirectToolExecutor {
  
  /**
   * Execute search_filesystem directly without Claude API
   */
  static async executeSearchFilesystem(params: any): Promise<DirectToolResult> {
    try {
      console.log('🔍 DIRECT SEARCH: Executing filesystem search without API costs');
      const result = await search_filesystem(params);
      return {
        success: true,
        result: result
      };
    } catch (error) {
      console.error('❌ DIRECT SEARCH ERROR:', error);
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Execute str_replace_based_edit_tool directly without Claude API
   */
  static async executeFileOperation(params: any): Promise<DirectToolResult> {
    try {
      console.log('🔧 DIRECT FILE OP: Executing file operation without API costs');
      const result = await str_replace_based_edit_tool(params);
      return {
        success: true,
        result: result
      };
    } catch (error) {
      console.error('❌ DIRECT FILE OP ERROR:', error);
      return {
        success: false,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Detect if a message contains tool requests and execute them directly
   */
  static async detectAndExecuteTools(message: string, agentName: string): Promise<{
    toolsExecuted: boolean;
    toolResults: string;
    modifiedMessage: string;
  }> {
    let toolsExecuted = false;
    let toolResults = '';
    let modifiedMessage = message;

    // Detect search requests
    const searchPatterns = [
      /examine.*?([a-zA-Z0-9\/\-_.]+\.(ts|tsx|js|jsx|json|md))/gi,
      /look.*?at.*?([a-zA-Z0-9\/\-_.]+\.(ts|tsx|js|jsx|json|md))/gi,
      /check.*?([a-zA-Z0-9\/\-_.]+\.(ts|tsx|js|jsx|json|md))/gi,
      /view.*?([a-zA-Z0-9\/\-_.]+\.(ts|tsx|js|jsx|json|md))/gi,
      /search.*?for.*?([\w\-_.]+)/gi
    ];

    for (const pattern of searchPatterns) {
      const matches = message.match(pattern);
      if (matches) {
        for (const match of matches) {
          // Extract file path
          const fileMatch = match.match(/([a-zA-Z0-9\/\-_.]+\.(ts|tsx|js|jsx|json|md))/);
          if (fileMatch) {
            const filePath = fileMatch[1];
            
            console.log(`🎯 DIRECT TOOL DETECTION: Found file request for ${filePath}`);
            
            // Execute direct file view
            const fileResult = await this.executeFileOperation({
              command: 'view',
              path: filePath,
              view_range: [1, 100] // First 100 lines
            });

            if (fileResult.success) {
              toolsExecuted = true;
              toolResults += `\n\n**File: ${filePath}**\n${fileResult.result}\n`;
            }
          }
        }
      }
    }

    // Detect search for methods, classes, or functions
    const searchRequestPatterns = [
      /find.*?(\w+)\s*(method|function|class)/gi,
      /search.*?for.*?(\w+)/gi,
      /locate.*?(\w+)/gi
    ];

    for (const pattern of searchRequestPatterns) {
      const matches = message.match(pattern);
      if (matches) {
        for (const match of matches) {
          const searchMatch = match.match(/(\w+)/);
          if (searchMatch) {
            const searchTerm = searchMatch[1];
            
            console.log(`🔍 DIRECT SEARCH DETECTION: Found search request for ${searchTerm}`);
            
            // Execute direct search
            const searchResult = await this.executeSearchFilesystem({
              query_description: `Find ${searchTerm} in codebase`,
              function_names: [searchTerm],
              class_names: [searchTerm]
            });

            if (searchResult.success) {
              toolsExecuted = true;
              toolResults += `\n\n**Search Results for "${searchTerm}":**\n${JSON.stringify(searchResult.result, null, 2)}\n`;
            }
          }
        }
      }
    }

    // If tools were executed, modify the message to include results
    if (toolsExecuted) {
      modifiedMessage = `${message}\n\n**Direct Tool Results (No API Costs):**${toolResults}`;
    }

    return {
      toolsExecuted,
      toolResults,
      modifiedMessage
    };
  }
}