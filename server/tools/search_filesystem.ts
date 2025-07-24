import * as fs from 'fs/promises';
import * as path from 'path';

interface SearchParams {
  query_description?: string;
  class_names?: string[];
  function_names?: string[];
  code?: string[];
}

/**
 * Enhanced search_filesystem tool for agent integration
 * Custom implementation for comprehensive file searching
 */
export async function search_filesystem(params: SearchParams) {
  try {
    console.log('🔍 SEARCH_FILESYSTEM TOOL: Starting search with params:', params);
    
    const results: any[] = [];
    
    // Search through project files
    const searchInDirectory = async (dirPath: string, basePath = '') => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          // Skip node_modules and other excluded directories
          if (entry.name.startsWith('.') || 
              entry.name === 'node_modules' || 
              entry.name === 'dist' ||
              entry.name === 'build') {
            continue;
          }
          
          if (entry.isDirectory()) {
            await searchInDirectory(fullPath, relativePath);
          } else if (entry.isFile()) {
            // Read file content for searching
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              const shouldInclude = shouldIncludeFile(content, params, entry.name);
              
              if (shouldInclude.include) {
                results.push({
                  fileName: relativePath,
                  content: shouldInclude.relevantContent,
                  reason: shouldInclude.reason
                });
              }
            } catch (readError) {
              // Skip files that can't be read
            }
          }
        }
      } catch (dirError) {
        // Skip directories that can't be accessed
      }
    };
    
    await searchInDirectory(process.cwd());
    
    console.log(`✅ SEARCH_FILESYSTEM TOOL: Found ${results.length} matching files`);
    return { 
      results,
      summary: `Found ${results.length} files matching your criteria`
    };
    
  } catch (error) {
    console.error('❌ SEARCH_FILESYSTEM TOOL ERROR:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

function shouldIncludeFile(content: string, params: SearchParams, fileName: string) {
  const reasons: string[] = [];
  const relevantLines: string[] = [];
  
  // Check query description match
  if (params.query_description) {
    const queryWords = params.query_description.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    const fileNameLower = fileName.toLowerCase();
    
    if (queryWords.some(word => contentLower.includes(word) || fileNameLower.includes(word))) {
      reasons.push(`Matches query: ${params.query_description}`);
    }
  }
  
  // Check class names
  if (params.class_names?.length) {
    for (const className of params.class_names) {
      if (content.includes(className)) {
        reasons.push(`Contains class: ${className}`);
        // Find relevant lines
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(className)) {
            relevantLines.push(`${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
  
  // Check function names
  if (params.function_names?.length) {
    for (const funcName of params.function_names) {
      if (content.includes(funcName)) {
        reasons.push(`Contains function: ${funcName}`);
        // Find relevant lines
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(funcName)) {
            relevantLines.push(`${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
  
  // Check code snippets
  if (params.code?.length) {
    for (const codeSnippet of params.code) {
      if (content.includes(codeSnippet)) {
        reasons.push(`Contains code: ${codeSnippet}`);
        // Find relevant lines
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes(codeSnippet)) {
            relevantLines.push(`${index + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
  
  return {
    include: reasons.length > 0,
    reason: reasons.join(', '),
    relevantContent: relevantLines.length > 0 ? relevantLines.join('\n') : content.substring(0, 500)
  };
}