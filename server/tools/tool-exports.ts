// Tool exports for Claude API service
export { str_replace_based_edit_tool } from './str_replace_based_edit_tool.ts';
export { bash } from './bash.ts';
export { direct_file_access } from './direct_file_access.ts';
import fs from 'fs/promises';
import path from 'path';

export interface SearchParams {
  query_description: string;
  class_names?: string[];
  function_names?: string[];
  code?: string[];
  directories?: string[];
}

export interface SearchResult {
  fileName: string;
  content: string;
  reason: string;
  priority?: number;
  relatedFiles?: string[];
}

export async function search_filesystem(params: SearchParams) {
  try {
    console.log('🔍 CONSULTING SEARCH: Starting codebase analysis with params:', params);
    
    const results: SearchResult[] = [];
    const maxFiles = 500; // COMPLETE UNRESTRICTED ACCESS: Maximum repository visibility restored
    
    // Search through project files
    const searchInDirectory = async (dirPath: string, basePath = '') => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (results.length >= maxFiles) break;
          
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          // UNRESTRICTED ACCESS: Allow access to ALL directories except system ones
          const excludeDirectories = [
            'node_modules', '.git', 'dist', 'build', '.cache'
          ];
          
          // COMPLETE ACCESS RESTORED: Only skip performance-impacting system directories  
          if (excludeDirectories.includes(entry.name)) {
            continue;
          }
          // ALLOW HIDDEN FILES: Include .env, .gitignore, etc. for complete visibility
          if (entry.name.startsWith('.') && !entry.name.match(/\.(env|gitignore|eslintrc|prettierrc)/)) {
            continue;
          }
          
          if (entry.isDirectory()) {
            await searchInDirectory(fullPath, relativePath);
          } else if (entry.isFile() && shouldAnalyzeFile(entry.name)) {
            try {
              // Handle binary files (images, zips) differently from text files
              const isBinaryFile = /\.(png|jpg|jpeg|zip)$/i.test(entry.name);
              
              if (isBinaryFile) {
                // For binary files, just include file info without reading content
                const analysis = analyzeBinaryFileRelevance(params, relativePath);
                if (analysis.relevant) {
                  results.push({
                    fileName: relativePath,
                    content: analysis.relevantContent,
                    reason: analysis.reason
                  });
                }
              } else {
                // SMART ROUTING: Check path relevance first to avoid unnecessary file reads
                const pathAnalysis = analyzePathRelevance(params, relativePath);
                
                if (pathAnalysis.relevant) {
                  // Only read file content if path indicates relevance
                  const content = await fs.readFile(fullPath, 'utf-8');
                  const analysis = analyzeFileRelevance(content, params, relativePath);
                  
                  if (analysis.relevant) {
                    results.push({
                      fileName: relativePath,
                      content: analysis.relevantContent,
                      reason: analysis.reason,
                      priority: analysis.priority
                    });
                  }
                } else {
                  // Quick path-only check for obvious matches
                  const quickCheck = quickPathMatch(params, relativePath);
                  if (quickCheck.relevant) {
                    results.push({
                      fileName: relativePath,
                      content: `[File found by path matching - use direct_file_access tool to view content]`,
                      reason: quickCheck.reason
                    });
                  }
                }
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
    
    // PRIORITY-BASED SORTING: Sort results by priority (highest first)
    const sortedResults = results.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // RELATED FILE DISCOVERY: Add related files for top results
    const enhancedResults = sortedResults.slice(0, Math.min(10, sortedResults.length)).map(result => {
      const allFilePaths = results.map(r => r.fileName);
      const relatedFiles = findRelatedFiles(result.fileName, allFilePaths);
      return {
        ...result,
        relatedFiles: relatedFiles.length > 0 ? relatedFiles : undefined
      };
    });
    
    // Combine enhanced top results with remaining sorted results
    const finalResults = [
      ...enhancedResults,
      ...sortedResults.slice(enhancedResults.length)
    ].slice(0, maxFiles);
    
    console.log(`🎯 INTELLIGENT SEARCH SUCCESS: Found ${results.length} files, ranked by priority (${sortedResults.filter(r => r.priority && r.priority > 80).length} high-priority matches)`);
    
    return { 
      summary: `🎯 SMART SEARCH: Found ${results.length} files with intelligent priority ranking (${sortedResults.filter(r => r.priority && r.priority > 80).length} high-priority matches)`,
      results: finalResults,
      totalFiles: results.length,
      searchStrategy: 'priority-based with related file discovery'
    };
    
  } catch (error) {
    console.error('❌ CONSULTING SEARCH ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Codebase search failed: ${errorMessage}`);
  }
}

function shouldAnalyzeFile(fileName: string): boolean {
  const allowedExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.md', '.json',
    '.css', '.scss', '.html', '.txt', '.csv', '.png', '.jpg', '.jpeg', '.zip'
  ];
  return allowedExtensions.some(ext => fileName.endsWith(ext));
}

function analyzeFileRelevance(content: string, params: SearchParams, filePath: string): {
  relevant: boolean;
  relevantContent: string;
  reason: string;
  priority: number;
} {
  const queryLower = params.query_description.toLowerCase();
  const contentLower = content.toLowerCase();
  const pathLower = filePath.toLowerCase();
  
  // SMART QUERY PROCESSING: Handle complex queries intelligently
  const queryTerms = processSmartQuery(queryLower);
  const fileName = path.basename(pathLower);
  
  // PRIORITY-BASED SCORING SYSTEM
  let priority = 0;
  let relevantContent = '';
  let reason = '';
  
  // PRIORITY 1 (100): EXACT MAIN FILE MATCHES
  if (isMainApplicationFile(filePath)) {
    const mainFileScore = calculateMainFileScore(queryTerms, pathLower, contentLower, fileName);
    if (mainFileScore > 50) {
      priority = 100 + mainFileScore;
      relevantContent = extractRelevantContent(content, queryTerms);
      reason = `🎯 MAIN APP FILE: ${fileName} (${mainFileScore}% match)`;
      return { relevant: true, relevantContent, reason, priority };
    }
  }
  
  // PRIORITY 2 (80): COMPONENT/PAGE MATCHES  
  if (isComponentOrPage(filePath)) {
    const componentScore = calculateComponentScore(queryTerms, pathLower, contentLower, fileName);
    if (componentScore > 40) {
      priority = 80 + componentScore;
      relevantContent = extractRelevantContent(content, queryTerms);
      reason = `📄 COMPONENT/PAGE: ${fileName} (${componentScore}% match)`;
      return { relevant: true, relevantContent, reason, priority };
    }
  }
  
  // PRIORITY 3 (60): SEMANTIC KEYWORD MATCHING
  const semanticScore = calculateSemanticMatch(queryTerms, pathLower, contentLower);
  if (semanticScore > 30) {
    priority = 60 + semanticScore;
    relevantContent = extractRelevantContent(content, queryTerms);
    reason = `🔍 SEMANTIC MATCH: ${fileName} (${semanticScore}% relevance)`;
    return { relevant: true, relevantContent, reason, priority };
  }
  
  // PRIORITY 4 (40): CLASS/FUNCTION SPECIFIC MATCHES
  if (params.class_names?.length) {
    for (const className of params.class_names) {
      if (content.includes(className)) {
        return {
          relevant: true,
          relevantContent: content.substring(0, 2000),
          reason: `Contains class: ${className}`,
          priority: 40
        };
      }
    }
  }
  
  if (params.function_names?.length) {
    for (const funcName of params.function_names) {
      if (content.includes(funcName)) {
        return {
          relevant: true,
          relevantContent: content.substring(0, 2000),
          reason: `Contains function: ${funcName}`,
          priority: 38
        };
      }
    }
  }
  
  if (params.code?.length) {
    for (const codeSnippet of params.code) {
      if (content.includes(codeSnippet)) {
        return {
          relevant: true,
          relevantContent: content.substring(0, 2000),
          reason: `Contains code: ${codeSnippet}`,
          priority: 35
        };
      }
    }
  }
  
  // PRIORITY 5 (20): GENERAL CONTENT MATCHING
  const queryKeywords = queryLower.split(/\s+/).filter(word => word.length > 2);
  const contentMatches = queryKeywords.some(keyword => contentLower.includes(keyword));
  if (contentLower.includes(queryLower) || contentMatches) {
    return {
      relevant: true,
      relevantContent: content.substring(0, 2000),
      reason: `Content matches query: ${params.query_description}`,
      priority: 20
    };
  }
  
  return {
    relevant: false,
    relevantContent: '',
    reason: '',
    priority: 0
  };
}

// ================== INTELLIGENT SEARCH SYSTEM FUNCTIONS ==================

// SMART QUERY PROCESSING: Handle complex multi-word queries
function processSmartQuery(query: string): { 
  primary: string[], 
  secondary: string[], 
  context: string[] 
} {
  const terms = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  
  // INTELLIGENT CATEGORIZATION
  const primary: string[] = [];
  const secondary: string[] = [];  
  const context: string[] = [];
  
  for (const term of terms) {
    // Primary terms (most important)
    if (['admin', 'consulting', 'agent', 'dashboard', 'page', 'component'].includes(term)) {
      primary.push(term);
    }
    // Secondary terms (modifiers)
    else if (['interface', 'system', 'tool', 'service', 'api', 'route'].includes(term)) {
      secondary.push(term);
    }
    // Context terms
    else {
      context.push(term);
    }
  }
  
  return { primary, secondary, context };
}

// MAIN APPLICATION FILE DETECTION
function isMainApplicationFile(filePath: string): boolean {
  const path = filePath.toLowerCase();
  const importantPaths = [
    'client/src/pages/',
    'client/src/components/',
    'server/routes/',
    'server/services/',
    'shared/',
    'client/src/app.tsx'
  ];
  
  return importantPaths.some(important => path.includes(important)) &&
         !path.includes('node_modules') &&
         !path.includes('.cache') &&
         !path.includes('archive') &&
         !path.includes('backup');
}

// COMPONENT/PAGE FILE DETECTION
function isComponentOrPage(filePath: string): boolean {
  const path = filePath.toLowerCase();
  return (path.includes('/pages/') || path.includes('/components/')) &&
         (path.endsWith('.tsx') || path.endsWith('.ts')) &&
         !path.includes('archive');
}

// MAIN FILE SCORING ALGORITHM
function calculateMainFileScore(queryTerms: any, pathLower: string, contentLower: string, fileName: string): number {
  let score = 0;
  
  // Filename exact matches (highest weight)
  if (queryTerms.primary.some((term: string) => fileName.includes(term))) score += 50;
  
  // Path matches
  if (queryTerms.primary.some((term: string) => pathLower.includes(term))) score += 30;
  
  // Content relevance
  const contentMatches = queryTerms.primary.filter((term: string) => contentLower.includes(term)).length;
  score += Math.min(contentMatches * 10, 40);
  
  // Boost for multi-term matches
  if (queryTerms.primary.length > 1) {
    const multiMatch = queryTerms.primary.filter((term: string) => 
      pathLower.includes(term) || contentLower.includes(term)
    ).length;
    if (multiMatch >= 2) score += 30;
  }
  
  return Math.min(score, 100);
}

// COMPONENT SCORING ALGORITHM  
function calculateComponentScore(queryTerms: any, pathLower: string, contentLower: string, fileName: string): number {
  let score = 0;
  
  // Similar to main file scoring but slightly lower weights
  if (queryTerms.primary.some((term: string) => fileName.includes(term))) score += 40;
  if (queryTerms.primary.some((term: string) => pathLower.includes(term))) score += 25;
  
  const contentMatches = queryTerms.primary.filter((term: string) => contentLower.includes(term)).length;
  score += Math.min(contentMatches * 8, 35);
  
  return Math.min(score, 100);
}

// SEMANTIC MATCHING ALGORITHM
function calculateSemanticMatch(queryTerms: any, pathLower: string, contentLower: string): number {
  let score = 0;
  
  // Check all term types with different weights
  const allTerms = [...queryTerms.primary, ...queryTerms.secondary, ...queryTerms.context];
  
  for (const term of allTerms) {
    if (pathLower.includes(term)) score += 15;
    if (contentLower.includes(term)) score += 10;
  }
  
  // Synonym matching for common terms
  const synonyms: Record<string, string[]> = {
    'admin': ['administration', 'administrator', 'manage', 'management'],
    'agent': ['bot', 'assistant', 'ai', 'chat'],
    'consulting': ['consultant', 'advice', 'advisory', 'guidance'],
    'page': ['view', 'screen', 'interface', 'ui']
  };
  
  for (const [key, syns] of Object.entries(synonyms)) {
    if (queryTerms.primary.includes(key)) {
      for (const syn of syns) {
        if (pathLower.includes(syn) || contentLower.includes(syn)) {
          score += 12;
        }
      }
    }
  }
  
  return Math.min(score, 100);
}

// EXTRACT MOST RELEVANT CONTENT
function extractRelevantContent(content: string, queryTerms: any): string {
  const lines = content.split('\n');
  const relevantLines: string[] = [];
  const allTerms = [...queryTerms.primary, ...queryTerms.secondary, ...queryTerms.context];
  
  // Find lines containing query terms
  for (let i = 0; i < lines.length && relevantLines.length < 50; i++) {
    const line = lines[i].toLowerCase();
    if (allTerms.some(term => line.includes(term))) {
      // Include context lines (1 before, current, 1 after)
      const start = Math.max(0, i - 1);
      const end = Math.min(lines.length, i + 2);
      relevantLines.push(...lines.slice(start, end));
    }
  }
  
  // If no specific matches, return the beginning
  if (relevantLines.length === 0) {
    return content.substring(0, 1500);
  }
  
  const relevantText = relevantLines.join('\n');
  return relevantText.length > 2000 ? relevantText.substring(0, 2000) + '...' : relevantText;
}

// RELATED FILE DISCOVERY SYSTEM
function findRelatedFiles(filePath: string, allFiles: string[]): string[] {
  const related: string[] = [];
  const fileName = path.basename(filePath, path.extname(filePath)).toLowerCase();
  const dirPath = path.dirname(filePath);
  
  // Find files in same directory
  const sameDir = allFiles.filter(f => path.dirname(f) === dirPath && f !== filePath);
  related.push(...sameDir.slice(0, 3)); // Limit to 3 files per category
  
  // Find files with similar names
  const similarNames = allFiles.filter(f => {
    const otherFileName = path.basename(f, path.extname(f)).toLowerCase();
    return otherFileName.includes(fileName) || fileName.includes(otherFileName);
  });
  related.push(...similarNames.slice(0, 2));
  
  // Find component/page pairs (e.g., admin-dashboard.tsx and AdminDashboard component)
  const componentMatch = fileName.replace(/-/g, '').replace(/_/g, '');
  const componentPairs = allFiles.filter(f => {
    const otherBase = path.basename(f, path.extname(f)).toLowerCase();
    const otherClean = otherBase.replace(/-/g, '').replace(/_/g, '');
    return otherClean.includes(componentMatch) || componentMatch.includes(otherClean);
  });
  related.push(...componentPairs.slice(0, 2));
  
  // Remove duplicates and original file
  return [...new Set(related)].filter(f => f !== filePath).slice(0, 5);
}

function analyzeBinaryFileRelevance(params: SearchParams, filePath: string): {
  relevant: boolean;
  relevantContent: string;
  reason: string;
} {
  const queryLower = params.query_description.toLowerCase();
  const pathLower = filePath.toLowerCase();
  
  // Check if query matches file path or type
  if (pathLower.includes(queryLower) || 
      queryLower.includes('image') && /\.(png|jpg|jpeg)$/i.test(filePath) ||
      queryLower.includes('archive') && /\.zip$/i.test(filePath) ||
      queryLower.includes('asset') && /attached_assets/.test(filePath)) {
    
    const fileType = filePath.split('.').pop()?.toUpperCase() || 'FILE';
    return {
      relevant: true,
      relevantContent: `[${fileType} FILE] ${filePath}\nBinary file - use str_replace_based_edit_tool with 'view' command to access`,
      reason: `Binary file matches search criteria: ${params.query_description}`
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
    
    // ENTERPRISE AGENTS: Full file system access for all operations
    console.log(`💼 ENTERPRISE ACCESS: Agent executing ${params.command} operation`);
    
    
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

// SMART ROUTING: Path-only relevance check to avoid unnecessary file reads
function analyzePathRelevance(params: SearchParams, filePath: string): {
  relevant: boolean;
  reason: string;
} {
  const queryLower = params.query_description.toLowerCase();
  const pathLower = filePath.toLowerCase();
  
  // High-priority path matches
  const fileName = path.basename(pathLower);
  if (fileName === queryLower || fileName.includes(queryLower)) {
    return {
      relevant: true,
      reason: 'Exact filename match - high priority'
    };
  }
  
  if (pathLower.includes(queryLower)) {
    return {
      relevant: true,
      reason: 'Path contains query - medium priority'
    };
  }
  
  // Check for related terms
  const queryKeywords = queryLower.split(/\s+/).filter(word => word.length > 2);
  const pathMatches = queryKeywords.some(keyword => pathLower.includes(keyword));
  if (pathMatches) {
    return {
      relevant: true,
      reason: 'Path contains related keywords'
    };
  }
  
  return {
    relevant: false,
    reason: 'Path not relevant'
  };
}

// QUICK PATH MATCHING: Ultra-fast matching for obvious cases
function quickPathMatch(params: SearchParams, filePath: string): {
  relevant: boolean;
  reason: string;
} {
  const queryLower = params.query_description.toLowerCase();
  const pathLower = filePath.toLowerCase();
  
  // Only return exact matches to avoid false positives
  if (pathLower.includes(queryLower)) {
    return {
      relevant: true,
      reason: `Quick path match: ${filePath} (use direct_file_access to view)`
    };
  }
  
  return {
    relevant: false,
    reason: ''
  };
}