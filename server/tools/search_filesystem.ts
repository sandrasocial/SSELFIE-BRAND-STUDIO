import fs from 'fs/promises';
import path from 'path';

interface SearchParams {
  query_description?: string;
  class_names?: string[];
  function_names?: string[];
  code?: string[];
}

interface SearchResult {
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
          
          // Skip excluded directories
          if (entry.name.startsWith('.') || 
              entry.name === 'node_modules' || 
              entry.name === 'dist' ||
              entry.name === 'build' ||
              entry.name === 'archive') {
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
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html'];
  return codeExtensions.some(ext => fileName.endsWith(ext));
}

function analyzeFileRelevance(content: string, params: SearchParams, fileName: string) {
  const reasons: string[] = [];
  let relevantContent = '';
  let relevant = false;
  
  // Query-based relevance
  if (params.query_description) {
    const query = params.query_description.toLowerCase();
    const fileContent = content.toLowerCase();
    const fileNameLower = fileName.toLowerCase();
    
    if (fileContent.includes(query) || fileNameLower.includes(query)) {
      reasons.push(`Contains query: "${params.query_description}"`);
      relevantContent = extractRelevantContent(content, query);
      relevant = true;
    }
  }
  
  // Class name search
  if (params.class_names?.length) {
    for (const className of params.class_names) {
      if (content.includes(className)) {
        reasons.push(`Contains class: ${className}`);
        relevantContent += extractRelevantContent(content, className);
        relevant = true;
      }
    }
  }
  
  // Function name search
  if (params.function_names?.length) {
    for (const funcName of params.function_names) {
      if (content.includes(funcName)) {
        reasons.push(`Contains function: ${funcName}`);
        relevantContent += extractRelevantContent(content, funcName);
        relevant = true;
      }
    }
  }
  
  // Code snippet search
  if (params.code?.length) {
    for (const codeSnippet of params.code) {
      if (content.includes(codeSnippet)) {
        reasons.push(`Contains code: ${codeSnippet.substring(0, 50)}...`);
        relevantContent += extractRelevantContent(content, codeSnippet);
        relevant = true;
      }
    }
  }
  
  // Key architecture files (always relevant for consulting)
  const keyFiles = ['schema.ts', 'routes.ts', 'App.tsx', 'package.json', 'replit.md'];
  if (keyFiles.some(key => fileName.includes(key))) {
    reasons.push(`Key architecture file: ${fileName}`);
    relevantContent = content.substring(0, 2000); // First 2000 chars for key files
    relevant = true;
  }
  
  return {
    relevant,
    reason: reasons.join(', '),
    relevantContent: relevantContent || content.substring(0, 1000) // Fallback to first 1000 chars
  };
}

function extractRelevantContent(content: string, searchTerm: string): string {
  const lines = content.split('\n');
  const relevantLines: string[] = [];
  const searchLower = searchTerm.toLowerCase();
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(searchLower)) {
      // Include context: 2 lines before and after
      const start = Math.max(0, index - 2);
      const end = Math.min(lines.length, index + 3);
      
      for (let i = start; i < end; i++) {
        if (!relevantLines.includes(`${i + 1}: ${lines[i]}`)) {
          relevantLines.push(`${i + 1}: ${lines[i]}`);
        }
      }
    }
  });
  
  return relevantLines.join('\n').substring(0, 1500); // Limit extracted content
}