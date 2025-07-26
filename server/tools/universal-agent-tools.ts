import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Universal Agent Tools - Dynamic, flexible tool system for all agents
 * Supports any task without hardcoded limitations
 */

export interface UniversalToolParams {
  [key: string]: any;
}

export interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: any;
}

export class UniversalAgentTools {
  
  /**
   * Dynamic file system search - supports any search criteria
   */
  static async searchFilesystem(params: {
    query_description?: string;
    class_names?: string[];
    function_names?: string[];
    code?: string[];
    file_extensions?: string[];
    directories?: string[];
    max_results?: number;
  }): Promise<ToolResult> {
    try {
      console.log('🔍 UNIVERSAL SEARCH: Dynamic codebase analysis:', params);
      
      const results: any[] = [];
      const maxResults = params.max_results || 30;
      
      const searchInDirectory = async (dirPath: string, basePath = '') => {
        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          
          for (const entry of entries) {
            if (results.length >= maxResults) break;
            
            const fullPath = path.join(dirPath, entry.name);
            const relativePath = path.join(basePath, entry.name);
            
            // Skip excluded directories (configurable)
            const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.cache'];
            if (entry.name.startsWith('.') && !entry.name.includes('.ts') && !entry.name.includes('.js')) {
              continue;
            }
            if (excludeDirs.includes(entry.name)) continue;
            
            // Directory filtering
            if (params.directories?.length && entry.isDirectory()) {
              const shouldInclude = params.directories.some(dir => 
                relativePath.toLowerCase().includes(dir.toLowerCase())
              );
              if (!shouldInclude) continue;
            }
            
            if (entry.isDirectory()) {
              await searchInDirectory(fullPath, relativePath);
            } else if (entry.isFile()) {
              // File extension filtering
              const extensions = params.file_extensions || ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html'];
              const hasValidExtension = extensions.some(ext => entry.name.endsWith(ext));
              
              if (hasValidExtension) {
                try {
                  const content = await fs.readFile(fullPath, 'utf-8');
                  const analysis = this.analyzeFileRelevance(content, params, relativePath);
                  
                  if (analysis.relevant) {
                    results.push({
                      fileName: relativePath,
                      content: analysis.relevantContent,
                      reason: analysis.reason,
                      fileSize: content.length,
                      lastModified: (await fs.stat(fullPath)).mtime
                    });
                  }
                } catch (readError) {
                  // Skip files that can't be read
                }
              }
            }
          }
        } catch (dirError) {
          // Skip directories that can't be accessed
        }
      };
      
      await searchInDirectory(process.cwd());
      
      console.log(`✅ UNIVERSAL SEARCH: Found ${results.length} relevant files`);
      
      return {
        success: true,
        result: {
          summary: `Found ${results.length} files matching your criteria`,
          files: results,
          totalFiles: results.length,
          searchParams: params
        }
      };
      
    } catch (error) {
      console.error('❌ UNIVERSAL SEARCH ERROR:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed'
      };
    }
  }

  /**
   * Dynamic file operations - view, create, modify based on agent needs
   */
  static async fileOperations(params: {
    command: 'view' | 'create' | 'str_replace' | 'insert';
    path: string;
    content?: string;
    old_str?: string;
    new_str?: string;
    insert_line?: number;
    insert_text?: string;
    view_range?: [number, number];
    backup?: boolean;
  }): Promise<ToolResult> {
    try {
      console.log('📁 UNIVERSAL FILE OP:', params.command, 'on', params.path);
      
      const absolutePath = path.resolve(params.path);
      const projectRoot = process.cwd();
      
      // ADMIN AGENTS: UNLIMITED FILE ACCESS - No path restrictions for Sandra's agents
      // Security disabled for maximum agent flexibility
      // if (!absolutePath.startsWith(projectRoot)) {
      //   return {
      //     success: false,
      //     error: 'Access denied: Path outside project directory'
      //   };
      // }
      
      switch (params.command) {
        case 'view':
          return await this.viewFile(absolutePath, params.view_range);
          
        case 'create':
          if (!params.content) {
            return { success: false, error: 'Content required for create operation' };
          }
          return await this.createFile(absolutePath, params.content, params.backup);
          
        case 'str_replace':
          if (!params.old_str) {
            return { success: false, error: 'old_str required for str_replace operation' };
          }
          return await this.replaceInFile(absolutePath, params.old_str, params.new_str || '', params.backup);
          
        case 'insert':
          if (params.insert_line === undefined || !params.insert_text) {
            return { success: false, error: 'insert_line and insert_text required for insert operation' };
          }
          return await this.insertInFile(absolutePath, params.insert_line, params.insert_text, params.backup);
          
        default:
          return { success: false, error: `Unknown command: ${params.command}` };
      }
      
    } catch (error) {
      console.error('❌ UNIVERSAL FILE OP ERROR:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'File operation failed'
      };
    }
  }

  /**
   * Dynamic bash/shell command execution
   */
  static async executeCommand(params: {
    command: string;
    cwd?: string;
    timeout?: number;
    env?: Record<string, string>;
  }): Promise<ToolResult> {
    try {
      console.log('⚡ UNIVERSAL COMMAND:', params.command);
      
      const options: any = {
        cwd: params.cwd || process.cwd(),
        timeout: params.timeout || 30000, // 30 second default timeout
        env: { ...process.env, ...params.env }
      };
      
      const { stdout, stderr } = await execAsync(params.command, options);
      
      return {
        success: true,
        result: {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          command: params.command,
          executedAt: new Date().toISOString()
        }
      };
      
    } catch (error: any) {
      console.error('❌ UNIVERSAL COMMAND ERROR:', error);
      return {
        success: false,
        error: error.message || 'Command execution failed',
        metadata: {
          stdout: error.stdout,
          stderr: error.stderr,
          code: error.code
        }
      };
    }
  }

  /**
   * Web search for current information (dynamic query support)
   */
  static async webSearch(params: {
    query: string;
    source?: 'duckduckgo' | 'web' | 'trends';
    max_results?: number;
  }): Promise<ToolResult> {
    try {
      console.log('🌐 UNIVERSAL WEB SEARCH:', params.query);
      
      // Using DuckDuckGo instant answer API
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(params.query)}&format=json&no_html=1&skip_disambig=1`);
      const data = await response.json() as any;
      
      let searchResults = {
        query: params.query,
        summary: '',
        relatedTopics: [],
        answer: '',
        searchedAt: new Date().toISOString()
      };
      
      if (data?.AbstractText) {
        searchResults.summary = data.AbstractText;
      }
      
      if (data?.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        searchResults.relatedTopics = data.RelatedTopics.slice(0, params.max_results || 5).map((topic: any) => ({
          text: topic.Text,
          url: topic.FirstURL
        }));
      }
      
      if (data?.Answer) {
        searchResults.answer = data.Answer;
      }
      
      return {
        success: true,
        result: searchResults
      };
      
    } catch (error) {
      console.error('❌ UNIVERSAL WEB SEARCH ERROR:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web search failed'
      };
    }
  }

  // Helper methods for file operations
  private static async viewFile(absolutePath: string, viewRange?: [number, number]): Promise<ToolResult> {
    try {
      const content = await fs.readFile(absolutePath, 'utf-8');
      const lines = content.split('\n');
      
      if (viewRange) {
        const [start, end] = viewRange;
        const startIndex = Math.max(0, start - 1);
        const endIndex = end === -1 ? lines.length : Math.min(lines.length, end);
        
        const selectedLines = lines.slice(startIndex, endIndex);
        const numberedContent = selectedLines.map((line, index) => 
          `${startIndex + index + 1}: ${line}`
        ).join('\n');
        
        return {
          success: true,
          result: {
            path: absolutePath,
            content: numberedContent,
            lineRange: `${start}-${endIndex}`,
            totalLines: lines.length
          }
        };
      }
      
      return {
        success: true,
        result: {
          path: absolutePath,
          content: content,
          lines: lines.length,
          size: content.length
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async createFile(absolutePath: string, content: string, backup?: boolean): Promise<ToolResult> {
    try {
      // Create backup if file exists and backup is requested
      if (backup) {
        try {
          await fs.access(absolutePath);
          const backupPath = `${absolutePath}.backup.${Date.now()}`;
          await fs.copyFile(absolutePath, backupPath);
          console.log(`📁 BACKUP: Created ${backupPath}`);
        } catch {
          // File doesn't exist, no backup needed
        }
      }
      
      // Ensure directory exists
      const dir = path.dirname(absolutePath);
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(absolutePath, content, 'utf-8');
      
      return {
        success: true,
        result: {
          path: absolutePath,
          size: content.length,
          created: true
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async replaceInFile(absolutePath: string, oldStr: string, newStr: string, backup?: boolean): Promise<ToolResult> {
    try {
      const content = await fs.readFile(absolutePath, 'utf-8');
      
      if (!content.includes(oldStr)) {
        return {
          success: false,
          error: 'String not found in file'
        };
      }
      
      if (backup) {
        const backupPath = `${absolutePath}.backup.${Date.now()}`;
        await fs.copyFile(absolutePath, backupPath);
        console.log(`📁 BACKUP: Created ${backupPath}`);
      }
      
      const newContent = content.replace(oldStr, newStr);
      await fs.writeFile(absolutePath, newContent, 'utf-8');
      
      return {
        success: true,
        result: {
          path: absolutePath,
          oldLength: content.length,
          newLength: newContent.length,
          replaced: true
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to replace in file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static async insertInFile(absolutePath: string, insertLine: number, insertText: string, backup?: boolean): Promise<ToolResult> {
    try {
      const content = await fs.readFile(absolutePath, 'utf-8');
      const lines = content.split('\n');
      
      if (backup) {
        const backupPath = `${absolutePath}.backup.${Date.now()}`;
        await fs.copyFile(absolutePath, backupPath);
        console.log(`📁 BACKUP: Created ${backupPath}`);
      }
      
      lines.splice(insertLine, 0, insertText);
      const newContent = lines.join('\n');
      await fs.writeFile(absolutePath, newContent, 'utf-8');
      
      return {
        success: true,
        result: {
          path: absolutePath,
          insertedAt: insertLine,
          newTotalLines: lines.length,
          inserted: true
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to insert in file: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private static analyzeFileRelevance(content: string, params: any, fileName: string) {
    const reasons: string[] = [];
    let relevantContent = '';
    let relevant = false;
    
    // Dynamic keyword matching
    if (params.query_description) {
      const query = params.query_description.toLowerCase();
      const fileContent = content.toLowerCase();
      const fileNameLower = fileName.toLowerCase();
      
      // Extract keywords dynamically
      const keywords = query.split(/[,\s]+/).filter(word => word.length > 2);
      
      let keywordMatches = 0;
      for (const keyword of keywords) {
        if (fileContent.includes(keyword) || fileNameLower.includes(keyword)) {
          keywordMatches++;
        }
      }
      
      if (keywordMatches > 0) {
        reasons.push(`Matches ${keywordMatches} keywords from query`);
        relevantContent = this.extractRelevantContent(content, query);
        relevant = true;
      }
    }
    
    // Dynamic class/function/code matching
    ['class_names', 'function_names', 'code'].forEach(paramKey => {
      if (params[paramKey]?.length) {
        for (const item of params[paramKey]) {
          if (content.includes(item)) {
            reasons.push(`Contains ${paramKey.replace('_', ' ')}: ${item}`);
            relevantContent += this.extractRelevantContent(content, item);
            relevant = true;
          }
        }
      }
    });
    
    // Architecture and important files
    const importantPatterns = [
      'schema.ts', 'routes.ts', 'App.tsx', 'index.ts', 'package.json',
      'config', 'auth', 'api', 'component', 'page', 'hook', 'service'
    ];
    
    if (importantPatterns.some(pattern => fileName.toLowerCase().includes(pattern.toLowerCase()))) {
      reasons.push(`Important architecture file: ${fileName}`);
      relevantContent = content.substring(0, 4000);
      relevant = true;
    }
    
    return {
      relevant,
      relevantContent: relevantContent || content.substring(0, 2000),
      reason: reasons.join('; ')
    };
  }

  private static extractRelevantContent(content: string, searchTerm: string): string {
    const lines = content.split('\n');
    const searchLower = searchTerm.toLowerCase();
    const relevantLines: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchLower)) {
        // Include context around the match
        const start = Math.max(0, index - 2);
        const end = Math.min(lines.length, index + 3);
        for (let i = start; i < end; i++) {
          if (!relevantLines.includes(lines[i])) {
            relevantLines.push(`${i + 1}: ${lines[i]}`);
          }
        }
      }
    });
    
    return relevantLines.slice(0, 20).join('\n'); // Limit to 20 lines
  }
}