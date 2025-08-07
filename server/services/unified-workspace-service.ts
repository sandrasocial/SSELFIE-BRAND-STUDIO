import { str_replace_based_edit_tool } from '../tools/str_replace_based_edit_tool.js';
// Removed search_filesystem import to break circular dependency
import fs from 'fs/promises';
import path from 'path';

/**
 * UNIFIED WORKSPACE SERVICE
 * Provides native workspace integration for admin agents (ZERO API COSTS)
 * Replicates Replit AI agent direct workspace access
 */

export interface WorkspaceOperation {
  type: 'file_read' | 'file_write' | 'file_search' | 'directory_scan' | 'context_analysis';
  path?: string;
  content?: string;
  query?: string;
  success: boolean;
  result?: any;
  error?: string;
  costOptimized: true; // Always zero cost
}

export interface ProjectContext {
  structure: ProjectStructure;
  recentChanges: string[];
  activeFiles: string[];
  gitStatus?: any;
  dependencies: any;
}

export interface ProjectStructure {
  frontend: string[];
  backend: string[];
  shared: string[];
  config: string[];
  assets: string[];
}

export interface IntentBasedQuery {
  intent: string;
  context: string;
  expectedResults: string[];
}

export class UnifiedWorkspaceService {
  private static instance: UnifiedWorkspaceService;
  private projectContext: ProjectContext | null = null;
  private workspaceRoot: string;

  private constructor() {
    this.workspaceRoot = process.cwd();
  }

  public static getInstance(): UnifiedWorkspaceService {
    if (!UnifiedWorkspaceService.instance) {
      UnifiedWorkspaceService.instance = new UnifiedWorkspaceService();
    }
    return UnifiedWorkspaceService.instance;
  }

  /**
   * ZERO-COST FILE OPERATIONS
   * Direct file access without API abstraction
   */
  async executeFileOperation(command: string, path: string, options: any = {}): Promise<WorkspaceOperation> {
    console.log(`🔧 UNIFIED WORKSPACE: Direct file operation (ZERO API COST) - ${command} on ${path}`);
    
    try {
      // Import and use the str_replace_based_edit_tool directly
      const fs = await import('fs/promises');
      const nodePath = await import('path');
      
      let result: any = {};
      
      switch (command) {
        case 'create':
          // Ensure directory exists
          const dir = nodePath.dirname(path);
          await fs.mkdir(dir, { recursive: true });
          
          // Create the file
          await fs.writeFile(path, options.file_text || '');
          result = { success: true, message: `File created: ${path}` };
          console.log(`✅ CREATED FILE: ${path}`);
          break;
          
        case 'view':
          try {
            const content = await fs.readFile(path, 'utf-8');
            result = { content, type: 'view', path };
            console.log(`👀 VIEWED FILE: ${path} (${content.length} chars)`);
          } catch (error) {
            // If it's a directory, list contents
            try {
              const entries = await fs.readdir(path);
              result = { entries, type: 'directory', path };
              console.log(`📁 LISTED DIRECTORY: ${path} (${entries.length} entries)`);
            } catch (dirError) {
              throw new Error(`Cannot view ${path}: ${error}`);
            }
          }
          break;
          
        case 'str_replace':
          const originalContent = await fs.readFile(path, 'utf-8');
          if (!originalContent.includes(options.old_str)) {
            throw new Error(`String not found: ${options.old_str}`);
          }
          const newContent = originalContent.replace(options.old_str, options.new_str || '');
          await fs.writeFile(path, newContent);
          result = { success: true, message: `File modified: ${path}` };
          console.log(`✏️ MODIFIED FILE: ${path}`);
          break;
          
        case 'delete':
          await fs.unlink(path);
          result = { success: true, message: `File deleted: ${path}` };
          console.log(`🗑️ DELETED FILE: ${path}`);
          break;
          
        default:
          throw new Error(`Unknown command: ${command}`);
      }

      return {
        type: 'file_write',
        path,
        success: true,
        result,
        costOptimized: true
      };
    } catch (error) {
      console.error(`❌ UNIFIED WORKSPACE: ${command} failed on ${path}:`, error);
      return {
        type: 'file_write',
        path,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        costOptimized: true
      };
    }
  }

  /**
   * INTELLIGENT FILE DISCOVERY
   * Finds files based on intent, not exact paths
   */
  async discoverFilesByIntent(intent: IntentBasedQuery): Promise<WorkspaceOperation> {
    console.log(`🎯 UNIFIED WORKSPACE: Direct file scanning - "${intent.intent}"`);

    try {
      // BREAK CIRCULAR DEPENDENCY: Use direct file scanning instead of search_filesystem
      const relevantFiles = await this.directFileScan(intent.intent);

      return {
        type: 'file_search',
        query: intent.intent,
        success: true,
        result: relevantFiles,
        costOptimized: true
      };
    } catch (error) {
      return {
        type: 'file_search',
        query: intent.intent,
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        costOptimized: true
      };
    }
  }

  private async directFileScan(intent: string): Promise<string[]> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const results: string[] = [];
    const keywords = intent.toLowerCase().split(/\s+/);
    
    // Scan key directories without using search_filesystem
    const directories = ['client/src', 'server', 'shared'];
    
    for (const dir of directories) {
      const dirPath = path.join(process.cwd(), dir);
      try {
        await this.scanForKeywords(dirPath, keywords, results, dir, 0);
      } catch (error) {
        // Skip directories that don't exist
      }
    }
    
    return results.slice(0, 8); // Limit results
  }

  private async scanForKeywords(dirPath: string, keywords: string[], results: string[], basePath: string, depth: number): Promise<void> {
    if (depth > 2) return; // Prevent deep recursion
    
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.join(basePath, entry.name);
        
        if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
          const filenameLower = entry.name.toLowerCase();
          if (keywords.some(keyword => keyword.length > 2 && filenameLower.includes(keyword))) {
            results.push(relativePath);
          }
        } else if (entry.isDirectory()) {
          await this.scanForKeywords(fullPath, keywords, results, relativePath, depth + 1);
        }
      }
    } catch (error) {
      // Skip unreadable directories
    }
  }

  /**
   * PROJECT STRUCTURE AWARENESS
   * Understands the codebase organization
   */
  async buildProjectContext(): Promise<ProjectContext> {
    console.log('🏗️ UNIFIED WORKSPACE: Building project context (ZERO API COST)');

    if (this.projectContext) {
      return this.projectContext;
    }

    try {
      // Scan key directories
      const [clientFiles, serverFiles, sharedFiles, configFiles] = await Promise.all([
        this.scanDirectory('client/src'),
        this.scanDirectory('server'),
        this.scanDirectory('shared'),
        this.scanDirectory('.', ['*.config.*', '*.json', '*.ts', '*.js'])
      ]);

      // Read package.json for dependencies
      const packageContent = await this.readFile('package.json');
      const dependencies = packageContent ? JSON.parse(packageContent) : {};

      this.projectContext = {
        structure: {
          frontend: clientFiles,
          backend: serverFiles,
          shared: sharedFiles,
          config: configFiles,
          assets: []
        },
        recentChanges: [],
        activeFiles: [],
        dependencies
      };

      return this.projectContext;
    } catch (error) {
      console.error('❌ UNIFIED WORKSPACE: Context building failed:', error);
      // Return minimal context to continue operation
      return {
        structure: { frontend: [], backend: [], shared: [], config: [], assets: [] },
        recentChanges: [],
        activeFiles: [],
        dependencies: {}
      };
    }
  }

  /**
   * PREDICTIVE ERROR PREVENTION
   * Validates operations before execution
   */
  async validateOperation(operation: any): Promise<{ valid: boolean; suggestions?: string[] }> {
    console.log('🛡️ UNIFIED WORKSPACE: Validating operation');

    // Common error patterns
    const errorPatterns = [
      { pattern: /client\/assets/, suggestion: 'Use @assets/ import instead of direct path' },
      { pattern: /\/repo\//, suggestion: 'Remove /repo/ prefix - use relative paths' },
      { pattern: /undefined|null/, suggestion: 'Check for null/undefined parameters' }
    ];

    const suggestions: string[] = [];
    let valid = true;

    if (operation.path) {
      for (const { pattern, suggestion } of errorPatterns) {
        if (pattern.test(operation.path)) {
          valid = false;
          suggestions.push(suggestion);
        }
      }

      // Check if file exists for edit operations
      if (operation.command === 'str_replace' || operation.command === 'insert') {
        try {
          await fs.access(path.resolve(operation.path));
        } catch {
          valid = false;
          suggestions.push(`File ${operation.path} does not exist - use 'create' command first`);
        }
      }
    }

    return { valid, suggestions: suggestions.length > 0 ? suggestions : undefined };
  }

  /**
   * AUTONOMOUS NAVIGATION
   * Smart file resolution based on context
   */
  async resolveFilePath(query: string, context?: string): Promise<string[]> {
    console.log(`🧭 UNIFIED WORKSPACE: Resolving file path for "${query}"`);

    const projectContext = await this.buildProjectContext();
    const allFiles = [
      ...projectContext.structure.frontend,
      ...projectContext.structure.backend,
      ...projectContext.structure.shared,
      ...projectContext.structure.config
    ];

    // Smart resolution patterns
    const resolutionPatterns = [
      { pattern: /auth|login|session/, paths: ['server/replitAuth.ts', 'client/src/hooks/use-auth.ts'] },
      { pattern: /app|main/, paths: ['client/src/App.tsx', 'server/index.ts'] },
      { pattern: /route|api/, paths: ['server/routes.ts', 'client/src/pages'] },
      { pattern: /schema|database/, paths: ['shared/schema.ts', 'server/db.ts'] },
      { pattern: /style|css|design/, paths: ['client/src/index.css', 'tailwind.config.ts'] }
    ];

    for (const { pattern, paths } of resolutionPatterns) {
      if (pattern.test(query.toLowerCase())) {
        return paths.filter(path => allFiles.some(f => f.includes(path.split('/').pop() || '')));
      }
    }

    // Fallback to fuzzy search
    return allFiles.filter(file => 
      file.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(file.split('/').pop()?.toLowerCase() || '')
    ).slice(0, 5);
  }

  // PRIVATE HELPER METHODS

  private async scanDirectory(dirPath: string, patterns?: string[]): Promise<string[]> {
    try {
      const fullPath = path.resolve(this.workspaceRoot, dirPath);
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      
      const files: string[] = [];
      for (const item of items) {
        const itemPath = path.join(dirPath, item.name);
        if (item.isFile()) {
          files.push(itemPath);
        } else if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
          const subFiles = await this.scanDirectory(itemPath);
          files.push(...subFiles);
        }
      }
      
      return files;
    } catch {
      return [];
    }
  }

  private async readFile(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(path.resolve(this.workspaceRoot, filePath), 'utf-8');
    } catch {
      return null;
    }
  }

  private translateIntentToSearch(intent: IntentBasedQuery): any {
    // Translate natural language intent to search parameters
    const intentKeywords = intent.intent.toLowerCase();
    
    if (intentKeywords.includes('authentication') || intentKeywords.includes('login')) {
      return {
        query_description: 'Find authentication and login related files',
        function_names: ['login', 'auth', 'session'],
        code: ['passport', 'authentication', 'login']
      };
    }
    
    if (intentKeywords.includes('database') || intentKeywords.includes('schema')) {
      return {
        query_description: 'Find database schema and connection files',
        function_names: ['db', 'schema', 'database'],
        code: ['drizzle', 'postgres', 'schema']
      };
    }
    
    // Default search
    return {
      query_description: intent.intent,
      code: [intent.context]
    };
  }

  private rankFilesByRelevance(files: any[], intent: IntentBasedQuery): any[] {
    // Rank files by relevance to intent
    if (!Array.isArray(files)) return [];
    
    return files.sort((a, b) => {
      const aScore = this.calculateRelevanceScore(a, intent);
      const bScore = this.calculateRelevanceScore(b, intent);
      return bScore - aScore;
    });
  }

  private calculateRelevanceScore(file: any, intent: IntentBasedQuery): number {
    let score = 0;
    const fileName = typeof file === 'string' ? file : file.path || '';
    const intentLower = intent.intent.toLowerCase();
    
    // Exact matches get highest score
    if (fileName.toLowerCase().includes(intentLower)) score += 10;
    
    // Partial matches
    const intentWords = intentLower.split(' ');
    intentWords.forEach(word => {
      if (fileName.toLowerCase().includes(word)) score += 3;
    });
    
    // File type relevance
    if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) score += 2;
    if (fileName.includes('server/') && intentLower.includes('backend')) score += 5;
    if (fileName.includes('client/') && intentLower.includes('frontend')) score += 5;
    
    return score;
  }
}

// Export singleton instance
export const unifiedWorkspace = UnifiedWorkspaceService.getInstance();