/**
 * FILESYSTEM SEARCH TOOL
 * Real file system operations for agent orchestration
 */

import * as fs from 'fs';
import * as path from 'path';

export async function search_filesystem(parameters: any): Promise<any> {
  console.log('🔍 SEARCH FILESYSTEM:', parameters);
  
  try {
    const { query_description, code, class_names, function_names, search_paths = ['.'] } = parameters;
    
    const results: any[] = [];
    const searchPaths = Array.isArray(search_paths) ? search_paths : [search_paths];
    
    // Search for files based on criteria
    for (const searchPath of searchPaths) {
      const fullPath = path.resolve(searchPath);
      if (fs.existsSync(fullPath)) {
        const files = await searchInDirectory(fullPath, {
          query_description,
          code,
          class_names,
          function_names
        });
        results.push(...files);
      }
    }
    
    return {
      results: results.slice(0, 50), // Limit results
      count: results.length,
      searchTerm: query_description || 'file search'
    };
  } catch (error) {
    console.error('Search filesystem error:', error);
    return {
      results: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Search failed'
    };
  }
}

async function searchInDirectory(dirPath: string, criteria: any): Promise<string[]> {
  const results: string[] = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        const subResults = await searchInDirectory(itemPath, criteria);
        results.push(...subResults);
      } else if (stats.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx') || item.endsWith('.js') || item.endsWith('.jsx'))) {
        // Check if file matches search criteria
        if (matchesSearchCriteria(itemPath, criteria)) {
          results.push(itemPath);
        }
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  
  return results;
}

function matchesSearchCriteria(filePath: string, criteria: any): boolean {
  const { query_description, code, class_names, function_names } = criteria;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Search by query description (simple keyword matching)
    if (query_description) {
      const keywords = query_description.toLowerCase().split(' ');
      const contentLower = content.toLowerCase();
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        return true;
      }
    }
    
    // Search by code snippets
    if (code && Array.isArray(code)) {
      if (code.some(snippet => content.includes(snippet))) {
        return true;
      }
    }
    
    // Search by class names
    if (class_names && Array.isArray(class_names)) {
      if (class_names.some(className => content.includes(className))) {
        return true;
      }
    }
    
    // Search by function names
    if (function_names && Array.isArray(function_names)) {
      if (function_names.some(funcName => content.includes(funcName))) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}