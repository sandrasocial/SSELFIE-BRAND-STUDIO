
// UNIFIED AGENT TOOL INTEGRATION
// Streamlined tool execution aligned with simplified agent personalities

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ToolRequest {
  tool: 'str_replace_based_edit_tool' | 'search_filesystem' | 'bash';
  parameters: any;
  agentId: string;
}

export interface ToolResponse {
  success: boolean;
  result?: any;
  error?: string;
}

export class UnifiedAgentToolSystem {
  
  /**
   * Execute tool request with streamlined processing
   */
  static async executeToolRequest(request: ToolRequest): Promise<ToolResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (request.tool) {
        case 'str_replace_based_edit_tool':
          result = await this.handleFileOperation(request.parameters);
          break;
        case 'search_filesystem':
          result = await this.handleSearch(request.parameters);
          break;
        case 'bash':
          result = await this.handleBashCommand(request.parameters);
          break;
        default:
          return { success: false, error: `Unknown tool: ${request.tool}` };
      }
      
      const executionTime = Date.now() - startTime;
      console.log(`🔧 UNIFIED TOOL: ${request.tool} executed in ${executionTime}ms`);
      
      return { success: true, result };
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ UNIFIED TOOL ERROR (${executionTime}ms):`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private static async handleFileOperation(params: any): Promise<string> {
    const { command, path, old_str, new_str, file_text, view_range } = params;
    
    switch (command) {
      case 'view':
        return this.viewFile(path, view_range);
      case 'create':
        return this.createFile(path, file_text);
      case 'str_replace':
        return this.replaceInFile(path, old_str, new_str);
      default:
        throw new Error(`Unknown file command: ${command}`);
    }
  }

  private static viewFile(filePath: string, viewRange?: [number, number]): string {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const stats = statSync(filePath);
    if (stats.isDirectory()) {
      const entries = readdirSync(filePath, { withFileTypes: true }).slice(0, 50);
      const dirContents = entries
        .map(entry => `├── ${entry.name}${entry.isDirectory() ? ' (Directory)' : ''}`)
        .join('\n');
      return `Directory contents for ${filePath}:\n${dirContents}`;
    }
    
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (viewRange) {
      const [start, end] = viewRange;
      const startLine = Math.max(0, start - 1);
      const endLine = end === -1 ? lines.length : Math.min(lines.length, end);
      const selectedLines = lines.slice(startLine, endLine);
      
      return selectedLines
        .map((line, index) => `${String(startLine + index + 1).padStart(5, ' ')}\t${line}`)
        .join('\n');
    }
    
    return lines
      .map((line, index) => `${String(index + 1).padStart(5, ' ')}\t${line}`)
      .join('\n');
  }

  private static createFile(filePath: string, content: string): string {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      const { mkdirSync } = require('fs');
      mkdirSync(dir, { recursive: true });
    }
    
    writeFileSync(filePath, content, 'utf8');
    
    // Trigger refresh for live preview
    this.triggerRefresh('create', filePath);
    
    return `File created: ${filePath}`;
  }

  private static replaceInFile(filePath: string, oldStr: string, newStr: string = ''): string {
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    const content = readFileSync(filePath, 'utf8');
    
    if (!content.includes(oldStr)) {
      throw new Error(`String not found in ${filePath}: ${oldStr}`);
    }
    
    const newContent = content.replace(oldStr, newStr);
    writeFileSync(filePath, newContent, 'utf8');
    
    // Trigger refresh for live preview
    this.triggerRefresh('str_replace', filePath);
    
    return `File modified: ${filePath}`;
  }

  private static async handleSearch(params: any): Promise<string> {
    const { query_description, class_names = [], function_names = [], code = [] } = params;
    
    const searchTerms = [...class_names, ...function_names, ...code];
    if (query_description) {
      searchTerms.push(...query_description.split(' ').filter(term => term.length > 3));
    }
    
    const results: string[] = [];
    
    // Search in key directories
    for (const dir of ['client/src', 'server', 'shared']) {
      if (existsSync(dir)) {
        this.searchDirectory(dir, searchTerms, results, 2);
      }
    }
    
    return results.length > 0 
      ? `Search results:\n${results.join('\n')}`
      : 'No matching files found';
  }

  private static searchDirectory(dir: string, terms: string[], results: string[], maxDepth: number, currentDepth = 0): void {
    if (currentDepth > maxDepth || results.length > 20) return;
    
    try {
      const items = readdirSync(dir);
      
      for (const item of items) {
        if (item.startsWith('.') || item === 'node_modules') continue;
        
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          this.searchDirectory(fullPath, terms, results, maxDepth, currentDepth + 1);
        } else if (item.match(/\.(ts|tsx|js|jsx)$/)) {
          try {
            const content = readFileSync(fullPath, 'utf8');
            const hasMatch = terms.some(term => 
              content.toLowerCase().includes(term.toLowerCase())
            );
            
            if (hasMatch) {
              results.push(`\nFile: ${fullPath.replace(process.cwd() + '/', '')}`);
              
              const lines = content.split('\n');
              const relevantLines: string[] = [];
              
              lines.forEach((line, index) => {
                if (terms.some(term => line.toLowerCase().includes(term.toLowerCase()))) {
                  relevantLines.push(`${index + 1}: ${line.trim()}`);
                }
              });
              
              if (relevantLines.length > 0) {
                results.push(relevantLines.slice(0, 10).join('\n'));
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
  }

  private static async handleBashCommand(params: any): Promise<string> {
    const { command } = params;
    
    if (!command) {
      throw new Error('No command provided');
    }
    
    try {
      const { stdout, stderr } = await execAsync(command, { 
        cwd: process.cwd(),
        timeout: 30000
      });
      
      let result = 'Command executed successfully.\n';
      if (stdout) result += `Output:\n${stdout}\n`;
      if (stderr) result += `Stderr:\n${stderr}\n`;
      
      return result;
      
    } catch (error: any) {
      let errorMsg = `Command failed: ${error.code || 'Unknown error'}`;
      if (error.stdout) errorMsg += `\nOutput:\n${error.stdout}`;
      if (error.stderr) errorMsg += `\nError:\n${error.stderr}`;
      
      throw new Error(errorMsg);
    }
  }

  private static triggerRefresh(operation: string, filePath: string): void {
    try {
      (global as any).lastFileChange = {
        timestamp: Date.now(),
        operation,
        filePath,
        needsRefresh: true
      };
    } catch (error) {
      console.warn('⚠️ Refresh trigger failed:', error);
    }
  }
}
