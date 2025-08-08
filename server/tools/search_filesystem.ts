/**
 * FILESYSTEM SEARCH TOOL - DIRECT IMPLEMENTATION
 * Restored direct search capabilities for agents
 */

import fs from 'fs/promises';
import path from 'path';

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
  console.log('🧠 Natural language search:', params.query_description);
  
  const results: SearchResult[] = [];
  const maxFiles = 25;
  const searchPaths = params.search_paths || ['.'];
  
  for (const searchPath of searchPaths) {
    await searchInDirectory(searchPath, '', results, maxFiles, params.query_description || '');
  }
  
  // Sort by priority and limit results
  results.sort((a, b) => b.priority - a.priority);
  
  return {
    summary: `Found ${results.length} files matching query`,
    results: results.slice(0, maxFiles),
    instructions: 'Use str_replace_based_edit_tool with the fullPath to view or modify these files',
    searchType: 'NATURAL_LANGUAGE_SEARCH'
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