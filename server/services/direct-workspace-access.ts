/**
 * DIRECT WORKSPACE ACCESS
 * Bypasses API overhead for file operations - mimics Replit's direct integration
 * Provides local file system access without expensive API calls
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

export interface FileOperation {
  type: 'read' | 'write' | 'create' | 'delete' | 'search';
  path: string;
  content?: string;
  encoding?: BufferEncoding;
}

export interface FileOperationResult {
  success: boolean;
  content?: string;
  error?: string;
  bytesProcessed?: number;
  operationType: string;
}

export interface SearchResult {
  file: string;
  line: number;
  content: string;
  match: string;
}

export class DirectWorkspaceAccess {
  private projectRoot: string;
  // UNRESTRICTED ACCESS RESTORED - All file types allowed for complete repository access
  private allowedExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.txt', '.csv', 
    '.png', '.jpg', '.jpeg', '.zip', '.scss', '.yaml', '.yml', '.env', '.gitignore',
    '.py', '.rb', '.php', '.cpp', '.c', '.h', '.hpp', '.java', '.go', '.rs', '.swift'
  ];
  // MINIMAL RESTRICTIONS - Only exclude system directories that cause performance issues
  private forbiddenPaths = ['node_modules', '.git'];

  constructor() {
    // Get project root directory
    this.projectRoot = process.cwd();
    console.log(`🔧 DIRECT WORKSPACE ACCESS: Initialized at ${this.projectRoot}`);
  }

  /**
   * Resolve relative path to absolute path safely
   */
  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(this.projectRoot, filePath);
  }

  /**
   * Check if path is allowed for access - COMPLETE UNRESTRICTED ACCESS
   */
  private isPathAllowed(fullPath: string): boolean {
    // Must be within project root for security
    if (!fullPath.startsWith(this.projectRoot)) {
      return false;
    }

    // MINIMAL RESTRICTIONS: Only performance-impacting directories blocked
    const relativePath = path.relative(this.projectRoot, fullPath);
    return !this.forbiddenPaths.some(forbidden => 
      relativePath.startsWith(forbidden + path.sep) || relativePath === forbidden
    );
  }

  /**
   * Read file content directly from workspace
   * No API overhead - instant access
   */
  async readFile(filePath: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(filePath);
      
      if (!this.isPathAllowed(fullPath)) {
        throw new Error(`Access denied to path: ${filePath}`);
      }

      const content = await fs.readFile(fullPath, 'utf-8');
      
      console.log(`📖 DIRECT READ: ${filePath} (${content.length} chars) - NO API COST`);
      
      return {
        success: true,
        content,
        bytesProcessed: content.length,
        operationType: 'read'
      };

    } catch (error) {
      console.error(`❌ DIRECT READ ERROR: ${filePath}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        operationType: 'read'
      };
    }
  }

  /**
   * Write file content directly to workspace
   * No API overhead - instant modification
   */
  async writeFile(filePath: string, content: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(filePath);
      
      if (!this.isPathAllowed(fullPath)) {
        throw new Error(`Access denied to path: ${filePath}`);
      }

      // Ensure directory exists
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });

      await fs.writeFile(fullPath, content, 'utf-8');
      
      console.log(`✍️ DIRECT WRITE: ${filePath} (${content.length} chars) - NO API COST`);
      
      return {
        success: true,
        bytesProcessed: content.length,
        operationType: 'write'
      };

    } catch (error) {
      console.error(`❌ DIRECT WRITE ERROR: ${filePath}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        operationType: 'write'
      };
    }
  }

  /**
   * Search codebase directly without API calls
   * Lightning-fast local search
   */
  async searchCodebase(query: string, extensions?: string[]): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const searchExtensions = extensions || this.allowedExtensions;
    
    console.log(`🔍 DIRECT SEARCH: "${query}" in ${searchExtensions.join(', ')} files - NO API COST`);

    try {
      await this.searchDirectory(this.projectRoot, query, searchExtensions, results);
      
      console.log(`✅ DIRECT SEARCH COMPLETE: Found ${results.length} matches`);
      
      return results.slice(0, 50); // Limit results to prevent overwhelming

    } catch (error) {
      console.error('❌ DIRECT SEARCH ERROR:', error);
      return [];
    }
  }

  /**
   * Get file tree structure directly
   * No API overhead for workspace exploration
   */
  async getFileTree(maxDepth: number = 3): Promise<any> {
    console.log(`🌳 DIRECT FILE TREE: Building workspace structure (depth ${maxDepth}) - NO API COST`);

    try {
      const tree = await this.buildFileTree(this.projectRoot, maxDepth, 0);
      
      console.log(`✅ DIRECT FILE TREE: Built successfully`);
      
      return tree;

    } catch (error) {
      console.error('❌ DIRECT FILE TREE ERROR:', error);
      return { error: 'Failed to build file tree' };
    }
  }

  /**
   * Batch file operations for efficiency
   * Process multiple files in single operation
   */
  async batchOperations(operations: FileOperation[]): Promise<FileOperationResult[]> {
    console.log(`🔄 BATCH OPERATIONS: Processing ${operations.length} file operations - NO API COST`);

    const results: FileOperationResult[] = [];

    for (const operation of operations) {
      try {
        let result: FileOperationResult;

        switch (operation.type) {
          case 'read':
            result = await this.readFile(operation.path);
            break;
          case 'write':
          case 'create':
            result = await this.writeFile(operation.path, operation.content || '');
            break;
          case 'delete':
            result = await this.deleteFile(operation.path);
            break;
          case 'search':
            const searchResults = await this.searchCodebase(operation.content || '');
            result = {
              success: true,
              content: JSON.stringify(searchResults),
              operationType: 'search'
            };
            break;
          default:
            result = {
              success: false,
              error: `Unknown operation type: ${operation.type}`,
              operationType: operation.type
            };
        }

        results.push(result);

      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          operationType: operation.type
        });
      }
    }

    console.log(`✅ BATCH OPERATIONS COMPLETE: ${results.filter(r => r.success).length}/${results.length} successful`);

    return results;
  }

  /**
   * Delete file directly from workspace
   */
  private async deleteFile(filePath: string): Promise<FileOperationResult> {
    try {
      const fullPath = this.resolvePath(filePath);
      
      if (!this.isPathAllowed(fullPath)) {
        throw new Error(`Access denied to path: ${filePath}`);
      }

      await fs.unlink(fullPath);
      
      console.log(`🗑️ DIRECT DELETE: ${filePath} - NO API COST`);
      
      return {
        success: true,
        operationType: 'delete'
      };

    } catch (error) {
      console.error(`❌ DIRECT DELETE ERROR: ${filePath}:`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        operationType: 'delete'
      };
    }
  }

  /**
   * Recursively search directory for query
   */
  private async searchDirectory(
    dirPath: string, 
    query: string, 
    extensions: string[], 
    results: SearchResult[]
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.projectRoot, fullPath);

        // Skip forbidden paths
        if (this.forbiddenPaths.some(forbidden => relativePath.includes(forbidden))) {
          continue;
        }

        if (entry.isDirectory()) {
          await this.searchDirectory(fullPath, query, extensions, results);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            await this.searchInFile(fullPath, relativePath, query, results);
          }
        }
      }

    } catch (error) {
      // Skip directories we can't read
      console.debug(`Skipping directory ${dirPath}:`, error);
    }
  }

  /**
   * Search for query within a specific file
   */
  private async searchInFile(
    fullPath: string, 
    relativePath: string, 
    query: string, 
    results: SearchResult[]
  ): Promise<void> {
    try {
      const content = await fs.readFile(fullPath, 'utf-8');
      const lines = content.split('\n');
      const queryLower = query.toLowerCase();

      lines.forEach((line, index) => {
        if (line.toLowerCase().includes(queryLower)) {
          results.push({
            file: relativePath,
            line: index + 1,
            content: line.trim(),
            match: query
          });
        }
      });

    } catch (error) {
      // Skip files we can't read
      console.debug(`Skipping file ${fullPath}:`, error);
    }
  }

  /**
   * Build file tree structure recursively
   */
  private async buildFileTree(dirPath: string, maxDepth: number, currentDepth: number): Promise<any> {
    if (currentDepth >= maxDepth) {
      return { name: path.basename(dirPath), type: 'directory', truncated: true };
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const children: any[] = [];

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(this.projectRoot, fullPath);

        // Skip forbidden paths
        if (this.forbiddenPaths.some(forbidden => relativePath.includes(forbidden))) {
          continue;
        }

        if (entry.isDirectory()) {
          const subtree = await this.buildFileTree(fullPath, maxDepth, currentDepth + 1);
          children.push(subtree);
        } else {
          children.push({
            name: entry.name,
            type: 'file',
            path: relativePath
          });
        }
      }

      return {
        name: path.basename(dirPath),
        type: 'directory',
        children: children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        })
      };

    } catch (error) {
      return {
        name: path.basename(dirPath),
        type: 'directory',
        error: 'Access denied'
      };
    }
  }

  /**
   * Get workspace statistics
   */
  async getWorkspaceStats(): Promise<any> {
    try {
      const stats = {
        projectRoot: this.projectRoot,
        allowedExtensions: this.allowedExtensions,
        forbiddenPaths: this.forbiddenPaths,
        lastAccess: new Date().toISOString(),
        operationsPerformed: 0 // TODO: Track this
      };

      return stats;

    } catch (error) {
      return { error: 'Failed to get workspace stats' };
    }
  }
}

export const directWorkspaceAccess = new DirectWorkspaceAccess();