/**
 * FILESYSTEM SEARCH TOOL - UNIFIED BYPASS SYSTEM
 * Direct file operations matching working tools pattern
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface SearchParams {
  query_description?: string;
  class_names?: string[];
  function_names?: string[];
  code?: string[];
  search_paths?: string[];
}

export interface SearchResult {
  file: string;
  fullPath: string;
  reason: string;
  snippet: string;
  type: string;
  priority: number;
}

export async function search_filesystem(params: SearchParams) {
  console.log('🔍 DIRECT FILESYSTEM SEARCH ACTIVE:', params);
  
  // Handle different search parameter types
  if (params.query_description) {
    return await handleNaturalLanguageSearch(params);
  }
  
  if (params.class_names || params.function_names || params.code) {
    return await handleParameterSearch(params);
  }
  
  throw new Error('Please provide search parameters: query_description, class_names, function_names, or code');
}

async function handleNaturalLanguageSearch(params: SearchParams) {
  console.log('🧠 UNIFIED BYPASS NATURAL LANGUAGE SEARCH:', params.query_description);
  
  // UNIFIED BYPASS SYSTEM: Direct file system search like working tools
  const searchResults = await searchCodebaseDirectly(params.query_description || '');
  
  // Get project structure using direct fs operations  
  const fileTree = await getFileTreeDirectly(4);
  
  // Convert to expected format
  const results: SearchResult[] = searchResults.slice(0, 50).map((result: any, index: number) => ({
    file: path.basename(result.file),
    fullPath: result.file,
    reason: `Contains: ${result.match}`,
    snippet: result.content.substring(0, 200) + '...',
    type: 'File',
    priority: 100 - index
  }));
  
  // Add core files for context if search is about components, pages, etc.
  const query = params.query_description?.toLowerCase() || '';
  if (query.includes('component') || query.includes('page') || query.includes('auth') || query.includes('service')) {
    const coreFiles = [
      'client/src/App.tsx',
      'client/src/pages',
      'client/src/components',
      'server/routes.ts',
      'server/services',
      'shared/schema.ts'
    ];
    
    for (const coreFile of coreFiles) {
      try {
        const content = await fs.readFile(coreFile, 'utf-8');
        results.unshift({
          file: path.basename(coreFile),
          fullPath: coreFile,
          reason: `Core ${query} file`,
          snippet: content.substring(0, 200) + '...',
          type: 'Core File',
          priority: 150
        });
      } catch {
        // File doesn't exist, skip
      }
    }
  }
  
  return {
    summary: `UNIFIED SEARCH: Found ${results.length} files with matching parameters (Query: "${params.query_description}")`,
    results: results,
    fileTree: fileTree,
    instructions: 'Use str_replace_based_edit_tool with command "view" and path set to fullPath to examine these files',
    searchType: 'UNIFIED_BYPASS_SEARCH'
  };
}

async function handleParameterSearch(params: SearchParams) {
  console.log('🔍 Parameter search:', { 
    classes: params.class_names?.length,
    functions: params.function_names?.length,
    code: params.code?.length 
  });
  
  const results: SearchResult[] = [];
  const maxFiles = 25;
  const searchPaths = params.search_paths || ['.'];
  
  for (const searchPath of searchPaths) {
    await searchInDirectory(searchPath, '', results, maxFiles, '', params);
  }
  
  results.sort((a, b) => b.priority - a.priority);
  
  return {
    summary: `Found ${results.length} files with matching parameters`,
    results: results.slice(0, maxFiles),
    instructions: 'Use str_replace_based_edit_tool with the fullPath to view or modify these files',
    searchType: 'PARAMETER_SEARCH'
  };
}

async function searchInDirectory(
  dirPath: string, 
  basePath: string, 
  results: SearchResult[], 
  maxFiles: number,
  query?: string,
  params?: SearchParams
) {
  if (results.length >= maxFiles) return;
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      if (results.length >= maxFiles) break;
      
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(basePath, entry.name);
      
      // Skip system directories
      if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        await searchInDirectory(fullPath, relativePath, results, maxFiles, query, params);
      } else if (entry.isFile() && shouldAnalyzeFile(entry.name)) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const analysis = analyzeFile(content, relativePath, query, params);
          
          if (analysis.relevant) {
            results.push({
              file: entry.name,
              fullPath: `./${relativePath}`,
              reason: analysis.reason,
              snippet: analysis.snippet,
              type: getFileType(relativePath),
              priority: analysis.priority
            });
          }
        } catch (error) {
          // Skip files that can't be read
          continue;
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be accessed
    return;
  }
}

function shouldAnalyzeFile(fileName: string): boolean {
  return /\.(tsx?|jsx?|ts|js|json|md|css|scss|html|vue|py|java|cpp|c|h|go|rs|php|rb|swift|kt|scala)$/i.test(fileName);
}

function analyzeFile(content: string, filePath: string, query?: string, params?: SearchParams) {
  let priority = 10;
  let reason = '';
  let relevant = false;
  
  // Boost priority for application files
  if (filePath.includes('client/src') || filePath.includes('server/') || filePath.includes('shared/')) {
    priority += 30;
  }
  
  // Query-based analysis
  if (query) {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const pathLower = filePath.toLowerCase();
    
    if (pathLower.includes(queryLower) || contentLower.includes(queryLower)) {
      relevant = true;
      priority += 20;
      reason = `Content matches query: ${query}`;
    }
  }
  
  // Parameter-based analysis
  if (params) {
    if (params.class_names) {
      for (const className of params.class_names) {
        if (content.includes(className)) {
          relevant = true;
          priority += 25;
          reason = `Contains class: ${className}`;
          break;
        }
      }
    }
    
    if (params.function_names) {
      for (const funcName of params.function_names) {
        if (content.includes(funcName)) {
          relevant = true;
          priority += 25;
          reason = `Contains function: ${funcName}`;
          break;
        }
      }
    }
    
    if (params.code) {
      for (const codeSnippet of params.code) {
        if (content.includes(codeSnippet)) {
          relevant = true;
          priority += 20;
          reason = `Contains code: ${codeSnippet}`;
          break;
        }
      }
    }
  }
  
  const snippet = content.slice(0, 200) + (content.length > 200 ? '...' : '');
  
  return { relevant, priority, reason, snippet };
}

function getFileType(filePath: string): string {
  if (filePath.includes('components/')) return 'Component';
  if (filePath.includes('pages/')) return 'Page';
  if (filePath.includes('services/')) return 'Service';
  if (filePath.includes('routes/')) return 'Route';
  if (filePath.includes('tools/')) return 'Tool';
  if (filePath.endsWith('.md')) return 'Documentation';
  return 'File';
}

// UNIFIED BYPASS HELPER FUNCTIONS - Direct fs operations like working tools

async function searchCodebaseDirectly(query: string): Promise<any[]> {
  console.log('🔍 DIRECT CODEBASE SEARCH:', query);
  const results: any[] = [];
  const maxResults = 50;
  
  // Search through project directories using direct fs operations
  const searchPaths = ['client/src', 'server', 'shared', 'components', 'hooks', 'pages'];
  
  for (const searchPath of searchPaths) {
    if (results.length >= maxResults) break;
    await searchDirectoryForQuery(searchPath, query, results, maxResults);
  }
  
  return results;
}

async function searchDirectoryForQuery(dirPath: string, query: string, results: any[], maxResults: number) {
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
        await searchDirectoryForQuery(fullPath, query, results, maxResults);
      } else if (entry.isFile() && shouldAnalyzeFile(entry.name)) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const queryLower = query.toLowerCase();
          const contentLower = content.toLowerCase();
          const pathLower = fullPath.toLowerCase();
          
          if (pathLower.includes(queryLower) || contentLower.includes(queryLower)) {
            results.push({
              file: fullPath,
              match: query,
              content: content
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

async function getFileTreeDirectly(maxDepth: number = 4): Promise<any> {
  console.log('🌳 DIRECT FILE TREE GENERATION:', { maxDepth });
  
  const tree = await buildDirectoryTree('.', 0, maxDepth);
  return tree;
}

async function buildDirectoryTree(dirPath: string, currentDepth: number, maxDepth: number): Promise<any> {
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
        const subtree = await buildDirectoryTree(fullPath, currentDepth + 1, maxDepth);
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