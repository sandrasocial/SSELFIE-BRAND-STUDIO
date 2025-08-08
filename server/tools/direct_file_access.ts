/**
 * DIRECT FILE ACCESS TOOL - UNIFIED BYPASS SYSTEM
 * Direct file operations matching working tools pattern
 * Provides complete repository access for admin agents
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface DirectFileAccessParams {
  action: 'view' | 'list' | 'exists' | 'search_path';
  path: string;
  recursive?: boolean;
  max_depth?: number;
}

export async function direct_file_access(params: DirectFileAccessParams): Promise<any> {
  console.log(`🔍 DIRECT FILE ACCESS: ${params.action} "${params.path}" - BYPASS SYSTEM ACTIVE`);
  
  try {
    switch (params.action) {
      case 'view':
        // UNIFIED BYPASS: Read file content using direct fs operations
        try {
          const content = await fs.readFile(params.path, 'utf-8');
          return {
            success: true,
            content: content,
            path: params.path,
            type: 'file_content'
          };
        } catch (error: any) {
          return {
            success: false,
            content: null,
            error: error.message,
            path: params.path,
            type: 'file_content'
          };
        }
        
      case 'list':
        // UNIFIED BYPASS: Get directory listing using direct fs operations
        if (params.path === '.' || params.path === '' || params.path === '/') {
          const tree = await buildFileTreeDirectly('.', 0, params.max_depth || 4);
          return {
            success: true,
            tree,
            type: 'directory_tree',
            path: params.path
          };
        } else {
          // List specific directory
          const tree = await buildFileTreeDirectly(params.path, 0, params.max_depth || 3);
          return {
            success: true,
            tree,
            type: 'directory_listing',
            path: params.path
          };
        }
        
      case 'exists':
        // UNIFIED BYPASS: Check if file/directory exists using direct fs operations
        try {
          await fs.access(params.path);
          return { 
            success: true, 
            exists: true, 
            path: params.path,
            type: 'existence_check'
          };
        } catch {
          return { 
            success: true, 
            exists: false, 
            path: params.path,
            type: 'existence_check'
          };
        }
        
      case 'search_path':
        // UNIFIED BYPASS: Search for files using direct fs operations  
        const searchResults = await searchFilesDirectly(params.path);
        return {
          success: true,
          results: searchResults.slice(0, 50), // Limit to prevent overwhelming
          total_found: searchResults.length,
          query: params.path,
          type: 'search_results'
        };
        
      default:
        return { 
          success: false, 
          error: `Unknown action: ${params.action}`,
          type: 'error'
        };
    }
  } catch (error) {
    console.error(`❌ DIRECT FILE ACCESS ERROR [${params.action}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      path: params.path,
      action: params.action,
      type: 'error'
    };
  }
}

// UNIFIED BYPASS HELPER FUNCTIONS - Direct fs operations like working tools

async function buildFileTreeDirectly(dirPath: string, currentDepth: number, maxDepth: number): Promise<any> {
  if (currentDepth >= maxDepth) return null;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const tree: any = {};
    
    for (const entry of entries) {
      // Skip system directories - match archive exclusion pattern
      if (['node_modules', '.git', 'dist', 'build', 'archive-consolidated', 'attached_assets'].includes(entry.name)) {
        continue;
      }
      
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        const subtree = await buildFileTreeDirectly(fullPath, currentDepth + 1, maxDepth);
        if (subtree) {
          tree[entry.name] = subtree;
        }
      } else {
        tree[entry.name] = 'file';
      }
    }
    
    return tree;
  } catch {
    return null;
  }
}

async function searchFilesDirectly(query: string): Promise<any[]> {
  console.log('🔍 DIRECT FILE SEARCH:', query);
  const results: any[] = [];
  const maxResults = 50;
  
  // Search through project directories using direct fs operations
  const searchPaths = ['client/src', 'server', 'shared', 'components', 'hooks', 'pages'];
  
  for (const searchPath of searchPaths) {
    if (results.length >= maxResults) break;
    await searchDirectoryForFiles(searchPath, query, results, maxResults);
  }
  
  return results;
}

async function searchDirectoryForFiles(dirPath: string, query: string, results: any[], maxResults: number) {
  if (results.length >= maxResults) return;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (results.length >= maxResults) break;
      
      const fullPath = path.join(dirPath, entry.name);
      
      // Skip system directories - match archive exclusion pattern
      if (['node_modules', '.git', 'dist', 'build', 'archive-consolidated', 'attached_assets'].includes(entry.name)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await searchDirectoryForFiles(fullPath, query, results, maxResults);
      } else if (entry.isFile() && shouldAnalyzeFileForSearch(entry.name)) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const queryLower = query.toLowerCase();
          const contentLower = content.toLowerCase();
          const pathLower = fullPath.toLowerCase();
          
          if (pathLower.includes(queryLower) || contentLower.includes(queryLower)) {
            results.push({
              file: fullPath,
              match: query,
              content: content.substring(0, 200) + '...'
            });
          }
        } catch {
          // Skip files that can't be read
        }
      }
    }
  } catch {
    // Skip directories that can't be accessed
  }
}

function shouldAnalyzeFileForSearch(fileName: string): boolean {
  return /\.(tsx?|jsx?|ts|js|json|md|css|scss|html|vue|py|java|cpp|c|h|go|rs|php|rb|swift|kt|scala)$/i.test(fileName);
}