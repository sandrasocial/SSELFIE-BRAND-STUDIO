// Tool exports for Claude API service
import fs from 'fs/promises';
import path from 'path';

export interface SearchParams {
  query_description: string;
  class_names?: string[];
  function_names?: string[];
  code?: string[];
}

export interface SearchResult {
  fileName: string;
  content: string;
  reason: string;
}

export async function search_filesystem(params: SearchParams) {
  try {
    console.log('🔍 CONSULTING SEARCH: Starting codebase analysis with params:', params);
    
    const results: SearchResult[] = [];
    const maxFiles = 20; // Limit for consulting agents
    
    // Search through project files
    const searchInDirectory = async (dirPath: string, basePath = '') => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (results.length >= maxFiles) break;
          
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          // CRITICAL: Skip only archive directories that confuse agents
          const excludeDirectories = [
            'node_modules', '.git', 'dist', 'build', '.cache',
            'archive',           // OLD/LEGACY FILES - CRITICAL TO SKIP
            'attached_assets',  // USER UPLOADS
            'logs', 'temp', 'tmp'
          ];
          
          if (entry.name.startsWith('.') || excludeDirectories.includes(entry.name)) {
            continue;
          }
          
          // ADDITIONAL CHECK: Skip any path containing excluded directories
          if (excludeDirectories.some(exclude => relativePath.includes(exclude))) {
            console.log(`🚫 CONSULTING SEARCH: Skipping legacy path: ${relativePath}`);
            continue;
          }
          
          if (entry.isDirectory()) {
            await searchInDirectory(fullPath, relativePath);
          } else if (entry.isFile() && shouldAnalyzeFile(entry.name)) {
            try {
              const content = await fs.readFile(fullPath, 'utf-8');
              const analysis = analyzeFileRelevance(content, params, relativePath);
              
              if (analysis.relevant) {
                results.push({
                  fileName: relativePath,
                  content: analysis.relevantContent,
                  reason: analysis.reason
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
    
    console.log(`✅ CONSULTING SEARCH: Found ${results.length} relevant files for analysis`);
    
    return { 
      summary: `Found ${results.length} files relevant to your analysis`,
      results: results.slice(0, maxFiles),
      totalFiles: results.length
    };
    
  } catch (error) {
    console.error('❌ CONSULTING SEARCH ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Codebase search failed: ${errorMessage}`);
  }
}

function shouldAnalyzeFile(fileName: string): boolean {
  const allowedExtensions = ['.ts', '.tsx', '.js', '.jsx', '.md', '.json'];
  return allowedExtensions.some(ext => fileName.endsWith(ext));
}

function analyzeFileRelevance(content: string, params: SearchParams, filePath: string): {
  relevant: boolean;
  relevantContent: string;
  reason: string;
} {
  const queryLower = params.query_description.toLowerCase();
  const contentLower = content.toLowerCase();
  const pathLower = filePath.toLowerCase();
  
  // Check if query matches file path
  if (pathLower.includes(queryLower)) {
    return {
      relevant: true,
      relevantContent: content.substring(0, 2000),
      reason: `File path matches query: ${params.query_description}`
    };
  }
  
  // Check for specific class names
  if (params.class_names?.length) {
    for (const className of params.class_names) {
      if (content.includes(className)) {
        return {
          relevant: true,
          relevantContent: content.substring(0, 2000),
          reason: `Contains class: ${className}`
        };
      }
    }
  }
  
  // Check for specific function names
  if (params.function_names?.length) {
    for (const funcName of params.function_names) {
      if (content.includes(funcName)) {
        return {
          relevant: true,
          relevantContent: content.substring(0, 2000),
          reason: `Contains function: ${funcName}`
        };
      }
    }
  }
  
  // Check for specific code snippets
  if (params.code?.length) {
    for (const codeSnippet of params.code) {
      if (content.includes(codeSnippet)) {
        return {
          relevant: true,
          relevantContent: content.substring(0, 2000),
          reason: `Contains code: ${codeSnippet}`
        };
      }
    }
  }
  
  // Check for query description in content
  if (contentLower.includes(queryLower)) {
    return {
      relevant: true,
      relevantContent: content.substring(0, 2000),
      reason: `Content matches query: ${params.query_description}`
    };
  }
  
  return {
    relevant: false,
    relevantContent: '',
    reason: ''
  };
}

export interface EditToolParams {
  command: string;
  path: string;
  view_range?: [number, number];
}

export async function viewFileContent(params: EditToolParams): Promise<string> {
  try {
    console.log('👁️ CONSULTING FILE TOOL: Starting read-only operation:', {
      command: params.command,
      path: params.path,
      readOnly: params.command === 'view'
    });
    
    // CONSULTING AGENTS: ONLY ALLOW VIEW COMMAND
    if (params.command !== 'view') {
      throw new Error(`BLOCKED: Consulting agents can only view files. Attempted command: '${params.command}'`);
    }
    
    const absolutePath = path.resolve(params.path);
    
    // Security check - ensure path is within project
    const projectRoot = process.cwd();
    if (!absolutePath.startsWith(projectRoot)) {
      throw new Error('Access denied: Path outside project directory');
    }
    
    const content = await fs.readFile(absolutePath, 'utf-8');
    const lines = content.split('\n');
    
    if (params.view_range) {
      const [start, end] = params.view_range;
      const startIndex = Math.max(0, start - 1);
      const endIndex = end === -1 ? lines.length : Math.min(lines.length, end);
      
      const selectedLines = lines.slice(startIndex, endIndex);
      const numberedLines = selectedLines.map((line, index) => 
        `${startIndex + index + 1}: ${line}`
      ).join('\n');
      
      return `File: ${params.path}\nLines ${start}-${endIndex}:\n${numberedLines}`;
    }
    
    // Return full file with line numbers
    const numberedLines = lines.map((line, index) => 
      `${index + 1}: ${line}`
    ).join('\n');
    
    return `File: ${params.path}\n${numberedLines}`;
    
  } catch (error) {
    console.error('❌ CONSULTING FILE TOOL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`File operation failed: ${errorMessage}`);
  }
}