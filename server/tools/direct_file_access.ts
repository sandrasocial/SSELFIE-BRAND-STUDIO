/**
 * DIRECT FILE ACCESS TOOL
 * Bypass system for agents to access files without API overhead
 * Provides complete repository access for admin agents
 */

import { DirectWorkspaceAccess } from '../services/direct-workspace-access';

// Initialize direct access system
const directAccess = new DirectWorkspaceAccess();

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
        // Read file content directly
        const result = await directAccess.readFile(params.path);
        return {
          success: result.success,
          content: result.content,
          error: result.error,
          path: params.path,
          type: 'file_content'
        };
        
      case 'list':
        // Get directory listing or full file tree
        if (params.path === '.' || params.path === '' || params.path === '/') {
          const tree = await directAccess.getFileTree(params.max_depth || 4);
          return {
            success: true,
            tree,
            type: 'directory_tree',
            path: params.path
          };
        } else {
          // List specific directory
          const tree = await directAccess.getFileTree(params.max_depth || 3);
          return {
            success: true,
            tree,
            type: 'directory_listing',
            path: params.path
          };
        }
        
      case 'exists':
        // Check if file/directory exists
        try {
          const result = await directAccess.readFile(params.path);
          return { 
            success: true, 
            exists: result.success, 
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
        // Search for files matching path pattern or content
        const searchResults = await directAccess.searchCodebase(params.path);
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