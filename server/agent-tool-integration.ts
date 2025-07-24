// Agent Tool Integration System - Give Visual Editor Agents Same Tools as Replit AI
// This system adds str_replace_based_edit_tool, search_filesystem, bash, and web_search to admin agents

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ErrorDetectionIntelligence } from './agents/error-detection-intelligence';

const execAsync = promisify(exec);

export interface AgentToolRequest {
  tool: 'str_replace_based_edit_tool' | 'search_filesystem' | 'bash' | 'web_search';
  parameters: any;
  agentId: string;
  userId: string;
}

export interface AgentToolResponse {
  success: boolean;
  result?: any;
  error?: string;
  tool: string;
}

export class AgentToolSystem {
  
  /**
   * Trigger Visual Editor refresh for real-time preview updates
   */
  private static triggerVisualEditorRefresh(operation: string, filePath: string) {
    try {
      // Store refresh signal for Visual Editor polling
      global.lastFileChange = {
        timestamp: Date.now(),
        operation,
        filePath,
        needsRefresh: true
      };
      
      console.log(`🔄 VISUAL EDITOR AUTO-REFRESH: ${operation} operation on ${filePath}`);
      
    } catch (error) {
      console.warn('⚠️ Visual Editor refresh trigger failed:', error);
    }
  }
  
  /**
   * Execute tool requests from admin agents
   */
  static async executeAgentTool(request: AgentToolRequest): Promise<AgentToolResponse> {
    try {
      console.log(`🔧 AGENT TOOL: ${request.agentId} using ${request.tool}`);
      
      switch (request.tool) {
        case 'str_replace_based_edit_tool':
          return await this.handleFileEdit(request.parameters);
        case 'search_filesystem':
          return await this.handleFilesystemSearch(request.parameters);
        case 'bash':
          return await this.handleBashCommand(request.parameters);
        case 'web_search':
          return await this.handleWebSearch(request.parameters);
        default:
          return {
            success: false,
            error: `Unknown tool: ${request.tool}`,
            tool: request.tool
          };
      }
    } catch (error) {
      console.error(`❌ AGENT TOOL ERROR: ${request.tool}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tool: request.tool
      };
    }
  }

  /**
   * Handle file editing operations (view, create, str_replace, insert)
   */
  private static async handleFileEdit(params: any): Promise<AgentToolResponse> {
    const { command, path, old_str, new_str, file_text, insert_line, insert_text, view_range } = params;
    
    try {
      switch (command) {
        case 'view':
          return this.viewFile(path, view_range);
        case 'create':
          return await this.createFile(path, file_text);
        case 'str_replace':
          return await this.replaceInFile(path, old_str, new_str);
        case 'insert':
          return await this.insertInFile(path, insert_line, insert_text);
        default:
          return {
            success: false,
            error: `Unknown file edit command: ${command}`,
            tool: 'str_replace_based_edit_tool'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File operation failed',
        tool: 'str_replace_based_edit_tool'
      };
    }
  }

  private static viewFile(filePath: string, viewRange?: [number, number]): AgentToolResponse {
    try {
      if (!existsSync(filePath)) {
        return {
          success: false,
          error: `File not found: ${filePath}`,
          tool: 'str_replace_based_edit_tool'
        };
      }
      
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      let result: string;
      if (viewRange) {
        const [start, end] = viewRange;
        const startLine = Math.max(0, start - 1);
        const endLine = end === -1 ? lines.length : Math.min(lines.length, end);
        const selectedLines = lines.slice(startLine, endLine);
        
        result = selectedLines
          .map((line, index) => `${String(startLine + index + 1).padStart(5, ' ')}\t${line}`)
          .join('\n');
      } else {
        result = lines
          .map((line, index) => `${String(index + 1).padStart(5, ' ')}\t${line}`)
          .join('\n');
      }
      
      return {
        success: true,
        result: `Here's the result of running \`cat -n\` on ${viewRange ? 'a snippet of ' : ''}${filePath}:\n${result}`,
        tool: 'str_replace_based_edit_tool'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tool: 'str_replace_based_edit_tool'
      };
    }
  }

  private static async createFile(filePath: string, content: string): Promise<AgentToolResponse> {
    try {
      // ERROR DETECTION: Analyze content before creating file
      console.log(`🔍 ERROR DETECTION: Analyzing file creation: ${filePath}`);
      const errorResult = await ErrorDetectionIntelligence.detectErrors(filePath, content, 'create');
      
      // Check if critical errors can be auto-corrected
      const hasUncorrectableErrors = errorResult.errors.some(e => 
        e.severity === 'error' && 
        !e.fixable && 
        (e.type === 'security' || e.type === 'structure')
      );
      
      if (errorResult.severity === 'critical' && hasUncorrectableErrors && !errorResult.correctedContent) {
        console.log(`🚫 CRITICAL ERRORS DETECTED: Blocking file creation`);
        console.log(`   Errors: ${errorResult.errors.map(e => e.message).join(', ')}`);
        
        return {
          success: false,
          error: `❌ Critical errors detected - file creation blocked:\n${errorResult.errors.map(e => `- ${e.message}`).join('\n')}\n\nSuggestions:\n${errorResult.suggestions.map(s => `- ${s.description}`).join('\n')}`,
          tool: 'str_replace_based_edit_tool'
        };
      }
      
      // Use corrected content if auto-correction is available
      const finalContent = errorResult.correctedContent || content;
      if (errorResult.correctedContent) {
        console.log(`✅ AUTO-CORRECTION: Applied fixes to ${filePath}`);
      }
      
      // Create directory if it doesn't exist
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        const { mkdirSync } = require('fs');
        mkdirSync(dir, { recursive: true });
      }
      
      writeFileSync(filePath, finalContent, 'utf8');
      
      // TRIGGER AUTO-REFRESH FOR VISUAL EDITOR
      this.triggerVisualEditorRefresh('create', filePath);
      
      return {
        success: true,
        result: `The file ${filePath} has been edited. Here's the result of running \`cat -n\` on ${filePath}:\n${content.split('\n').map((line, i) => `${String(i + 1).padStart(5, ' ')}\t${line}`).join('\n')}`,
        tool: 'str_replace_based_edit_tool'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tool: 'str_replace_based_edit_tool'
      };
    }
  }

  private static replaceInFile(filePath: string, oldStr: string, newStr: string = ''): AgentToolResponse {
    try {
      if (!existsSync(filePath)) {
        return {
          success: false,
          error: `File not found: ${filePath}`,
          tool: 'str_replace_based_edit_tool'
        };
      }
      
      const content = readFileSync(filePath, 'utf8');
      
      if (!content.includes(oldStr)) {
        return {
          success: false,
          error: `*No replacement was performed*, old_str \`${oldStr}\` did not appear verbatim in ${filePath}. Please complete this edit before proceeding to the next step.`,
          tool: 'str_replace_based_edit_tool'
        };
      }
      
      const newContent = content.replace(oldStr, newStr);
      writeFileSync(filePath, newContent, 'utf8');
      
      // TRIGGER AUTO-REFRESH FOR VISUAL EDITOR
      this.triggerVisualEditorRefresh('str_replace', filePath);
      
      // Show the edited section
      const lines = newContent.split('\n');
      const editedLines = lines
        .map((line, index) => `${String(index + 1).padStart(5, ' ')}\t${line}`)
        .join('\n');
      
      return {
        success: true,
        result: `The file ${filePath} has been edited. Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n${editedLines}\nReview the changes and make sure they are as expected (correct indentation, no duplicate lines, etc). Edit the file again if necessary.`,
        tool: 'str_replace_based_edit_tool'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to replace in file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tool: 'str_replace_based_edit_tool'
      };
    }
  }

  private static insertInFile(filePath: string, insertLine: number, insertText: string): AgentToolResponse {
    try {
      if (!existsSync(filePath)) {
        return {
          success: false,
          error: `File not found: ${filePath}`,
          tool: 'str_replace_based_edit_tool'
        };
      }
      
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.splice(insertLine, 0, insertText);
      const newContent = lines.join('\n');
      
      writeFileSync(filePath, newContent, 'utf8');
      
      // TRIGGER AUTO-REFRESH FOR VISUAL EDITOR
      this.triggerVisualEditorRefresh('insert', filePath);
      
      return {
        success: true,
        result: `The file ${filePath} has been edited. Text inserted at line ${insertLine}.`,
        tool: 'str_replace_based_edit_tool'
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to insert in file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tool: 'str_replace_based_edit_tool'
      };
    }
  }

  /**
   * Handle filesystem search operations
   */
  private static async handleFilesystemSearch(params: any): Promise<AgentToolResponse> {
    const { query_description, class_names = [], function_names = [], code = [] } = params;
    
    try {
      const searchResults = await this.searchFileSystem(query_description, class_names, function_names, code);
      
      return {
        success: true,
        result: searchResults,
        tool: 'search_filesystem'
      };
    } catch (error) {
      return {
        success: false,
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        tool: 'search_filesystem'
      };
    }
  }

  private static async searchFileSystem(
    queryDescription?: string,
    classNames: string[] = [],
    functionNames: string[] = [],
    codeSnippets: string[] = []
  ): Promise<string> {
    const results: string[] = [];
    const searchTerms = [...classNames, ...functionNames, ...codeSnippets];
    
    if (queryDescription) {
      searchTerms.push(...queryDescription.split(' ').filter(term => term.length > 3));
    }
    
    const searchDirectory = (dir: string, maxDepth: number = 3, currentDepth: number = 0): void => {
      if (currentDepth > maxDepth) return;
      
      try {
        const items = readdirSync(dir);
        
        for (const item of items) {
          if (item.startsWith('.') || item === 'node_modules') continue;
          
          const fullPath = join(dir, item);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory()) {
            searchDirectory(fullPath, maxDepth, currentDepth + 1);
          } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
            try {
              const content = readFileSync(fullPath, 'utf8');
              const hasMatch = searchTerms.some(term => 
                content.toLowerCase().includes(term.toLowerCase())
              );
              
              if (hasMatch) {
                results.push(`\nFile Name: ${fullPath.replace(process.cwd() + '/', '')}`);
                
                // Extract relevant content snippets
                const lines = content.split('\n');
                const relevantLines: string[] = [];
                
                lines.forEach((line, index) => {
                  if (searchTerms.some(term => line.toLowerCase().includes(term.toLowerCase()))) {
                    const start = Math.max(0, index - 2);
                    const end = Math.min(lines.length, index + 3);
                    relevantLines.push(...lines.slice(start, end));
                  }
                });
                
                if (relevantLines.length > 0) {
                  results.push('Relevant Content:');
                  results.push(relevantLines.slice(0, 50).join('\n')); // Limit to 50 lines
                  if (relevantLines.length > 50) {
                    results.push('...[Truncated]');
                  }
                }
              }
            } catch (error) {
              // Skip files that can't be read
            }
          }
        }
      } catch (error) {
        // Skip directories that can't be read
      }
    };
    
    searchDirectory('client');
    searchDirectory('server');
    searchDirectory('shared');
    
    if (results.length === 0) {
      return 'No relevant files found matching the search criteria.';
    }
    
    return `Found the following relevant files and contents in the filesystem:\n${results.join('\n')}\n\nEnd of relevant files.`;
  }

  /**
   * Handle bash command execution
   */
  private static async handleBashCommand(params: any): Promise<AgentToolResponse> {
    const { command, restart } = params;
    
    if (restart) {
      return {
        success: true,
        result: 'Bash tool restarted.',
        tool: 'bash'
      };
    }
    
    if (!command) {
      return {
        success: false,
        error: 'No command provided',
        tool: 'bash'
      };
    }
    
    try {
      console.log(`🔧 AGENT BASH: Executing command: ${command}`);
      const { stdout, stderr } = await execAsync(command, { 
        cwd: process.cwd(),
        timeout: 30000 // 30 second timeout
      });
      
      let result = 'Command executed successfully.\n';
      if (stdout) {
        result += `The output was\n\`\`\`\n${stdout}\n\`\`\``;
      }
      if (stderr) {
        result += `\nStderr:\n\`\`\`\n${stderr}\n\`\`\``;
      }
      
      return {
        success: true,
        result,
        tool: 'bash'
      };
    } catch (error: any) {
      let errorMessage = `Command exited with reason: \`${error.code ? 'Exited' : 'Error'}\``;
      if (error.code) {
        errorMessage += ` and exit code: \`${error.code}\``;
      }
      if (error.stdout) {
        errorMessage += `\nThere was output:\n\`\`\`\n${error.stdout}\n\`\`\``;
      }
      if (error.stderr) {
        errorMessage += `\nThere was error output:\n\`\`\`\n${error.stderr}\n\`\`\``;
      }
      
      return {
        success: false,
        error: errorMessage,
        tool: 'bash'
      };
    }
  }

  /**
   * Handle web search operations
   */
  private static async handleWebSearch(params: any): Promise<AgentToolResponse> {
    const { query } = params;
    
    // For now, return a placeholder since web search would require external API
    return {
      success: false,
      error: 'Web search not implemented in agent tool system. Use external search manually.',
      tool: 'web_search'
    };
  }
}