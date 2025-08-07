// Direct File Access Tool - Provides Replit AI-level file access without filtering
import fs from 'fs/promises';
import path from 'path';

// BYPASS SYSTEM: Enhanced pattern matching for agent file access
function checkPatternMatch(filePath: string, pattern: string): boolean {
  // Convert glob pattern to regex - CORRECTED ORDER for proper wildcard matching
  let regex = pattern.toLowerCase();
  
  // Replace in correct order to avoid conflicts
  regex = regex.replace(/\*\*/g, '@@DOUBLESTAR@@');  // Temporarily replace **
  regex = regex.replace(/\*/g, '[^/]*');             // Replace single * first
  regex = regex.replace(/@@DOUBLESTAR@@/g, '.*');     // Replace ** with .*
  regex = regex.replace(/\./g, '\\.');               // Escape dots last
  
  const regexPattern = new RegExp(`^${regex}$`);
  const testPath = filePath.toLowerCase();
  
  // DEBUG: Log pattern matching for troubleshooting
  console.log(`🔍 PATTERN MATCH: "${testPath}" vs pattern "${pattern}" (regex: "${regex}") = ${regexPattern.test(testPath)}`);
  
  return regexPattern.test(testPath);
}

export interface DirectFileAccessParams {
  action: 'view' | 'list' | 'exists' | 'search_path';
  path: string;
  recursive?: boolean;
  max_depth?: number;
}

export async function direct_file_access(params: DirectFileAccessParams) {
  try {
    console.log('🎯 DIRECT FILE ACCESS:', params);
    
    const { action, path: filePath, recursive = false, max_depth = 3 } = params;
    const fullPath = path.resolve(process.cwd(), filePath);
    
    // Security check - ensure path is within project
    if (!fullPath.startsWith(process.cwd())) {
      throw new Error('Access denied: Path outside project directory');
    }
    
    switch (action) {
      case 'exists':
        return await checkFileExists(fullPath, filePath);
        
      case 'view':
        return await viewFile(fullPath, filePath);
        
      case 'list':
        return await listDirectory(fullPath, filePath, recursive, max_depth);
        
      case 'search_path':
        return await searchByPath(filePath, recursive, max_depth);
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ DIRECT FILE ACCESS ERROR:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      path: params.path
    };
  }
}

async function checkFileExists(fullPath: string, originalPath: string) {
  try {
    const stats = await fs.stat(fullPath);
    return {
      success: true,
      exists: true,
      path: originalPath,
      type: stats.isDirectory() ? 'directory' : 'file',
      size: stats.isFile() ? stats.size : undefined,
      modified: stats.mtime.toISOString()
    };
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return {
        success: true,
        exists: false,
        path: originalPath
      };
    }
    throw error;
  }
}

async function viewFile(fullPath: string, originalPath: string) {
  try {
    const stats = await fs.stat(fullPath);
    
    if (stats.isDirectory()) {
      return {
        success: false,
        error: 'Path is a directory, use action: "list" instead',
        path: originalPath
      };
    }
    
    // Check if file is too large (>1MB)
    if (stats.size > 1024 * 1024) {
      const content = await fs.readFile(fullPath, 'utf-8');
      return {
        success: true,
        path: originalPath,
        size: stats.size,
        content: content.substring(0, 5000) + `\n\n[File truncated - ${stats.size} total bytes]`,
        truncated: true
      };
    }
    
    const content = await fs.readFile(fullPath, 'utf-8');
    return {
      success: true,
      path: originalPath,
      size: stats.size,
      content: content,
      truncated: false
    };
    
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return {
        success: false,
        error: 'File not found',
        path: originalPath
      };
    }
    throw error;
  }
}

async function listDirectory(fullPath: string, originalPath: string, recursive: boolean, maxDepth: number, currentDepth = 0) {
  try {
    const stats = await fs.stat(fullPath);
    
    if (!stats.isDirectory()) {
      return {
        success: false,
        error: 'Path is not a directory',
        path: originalPath
      };
    }
    
    const entries = await fs.readdir(fullPath, { withFileTypes: true });
    const items: any[] = [];
    
    for (const entry of entries) {
      // Skip common directories that clutter results
      if (entry.name.startsWith('.') && !entry.name.match(/\.(env|gitignore|eslintrc|prettierrc)/)) {
        continue;
      }
      if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        continue;
      }
      
      const itemPath = path.join(originalPath, entry.name);
      const fullItemPath = path.join(fullPath, entry.name);
      
      if (entry.isDirectory()) {
        const item: any = {
          name: entry.name,
          type: 'directory',
          path: itemPath
        };
        
        // Recursively list subdirectories if requested and within depth limit
        if (recursive && currentDepth < maxDepth) {
          try {
            const subResult = await listDirectory(fullItemPath, itemPath, recursive, maxDepth, currentDepth + 1);
            if (subResult.success) {
              item.children = subResult.items;
            }
          } catch (subError) {
            // Skip directories that can't be accessed
            item.error = 'Access denied';
          }
        }
        
        items.push(item);
      } else {
        const itemStats = await fs.stat(fullItemPath);
        items.push({
          name: entry.name,
          type: 'file',
          path: itemPath,
          size: itemStats.size,
          modified: itemStats.mtime.toISOString()
        });
      }
    }
    
    return {
      success: true,
      path: originalPath,
      items: items.sort((a, b) => {
        // Directories first, then files, both alphabetically
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
      total: items.length
    };
    
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      return {
        success: false,
        error: 'Directory not found',
        path: originalPath
      };
    }
    throw error;
  }
}

async function searchByPath(searchPath: string, recursive: boolean, maxDepth: number) {
  try {
    const results: any[] = [];
    
    // Search for files matching the path pattern
    const searchInDirectory = async (dirPath: string, basePath = '', currentDepth = 0) => {
      if (currentDepth > maxDepth) return;
      
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
            continue;
          }
          
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          // ENHANCED PATTERN MATCHING: Support glob patterns and wildcards
          const matchesPattern = checkPatternMatch(relativePath, searchPath) ||
                                checkPatternMatch(entry.name, searchPath);
          
          if (matchesPattern) {
            
            const stats = await fs.stat(fullPath);
            results.push({
              name: entry.name,
              path: relativePath,
              type: entry.isDirectory() ? 'directory' : 'file',
              size: entry.isFile() ? stats.size : undefined,
              modified: stats.mtime.toISOString(),
              matchReason: checkPatternMatch(relativePath, searchPath) ? 'path' : 'filename'
            });
          }
          
          // Recursively search subdirectories
          if (entry.isDirectory() && recursive && currentDepth < maxDepth) {
            await searchInDirectory(fullPath, relativePath, currentDepth + 1);
          }
        }
      } catch (dirError) {
        // Skip directories that can't be accessed
      }
    };
    
    await searchInDirectory(process.cwd());
    
    return {
      success: true,
      searchPath: searchPath,
      results: results.sort((a, b) => {
        // Exact filename matches first, then path matches
        if (a.matchReason !== b.matchReason) {
          return a.matchReason === 'filename' ? -1 : 1;
        }
        return a.path.localeCompare(b.path);
      }),
      total: results.length
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      searchPath: searchPath
    };
  }
}