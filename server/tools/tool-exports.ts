// Tool exports for Claude API service
export { str_replace_based_edit_tool } from './str_replace_based_edit_tool.ts';
export { bash } from './bash.ts';
export { direct_file_access } from './direct_file_access.ts';
export { enhanced_search_bypass, analyzeSearchQuery } from './enhanced_search_bypass.ts';
import fs from 'fs/promises';
import path from 'path';
import { AutonomousNavigationSystem } from '../services/autonomous-navigation-system.js';
import { IntelligentContextManager } from '../services/intelligent-context-manager.js';
// Cache system completely disabled for direct filesystem access

export interface SearchParams {
  query_description?: string; // FIXED: Make optional to support all search types
  class_names?: string[];
  function_names?: string[];
  code?: string[];
  directories?: string[];
  // Enhanced agent context
  agentName?: string;
  conversationId?: string;
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
    console.log('🔍 INTELLIGENT SEARCH SYSTEM ACTIVE:', params);
    
    // INTELLIGENT ROUTING: Connect to sophisticated search systems
    if (params.query_description) {
      console.log('🧠 NATURAL LANGUAGE QUERY DETECTED - Routing to intelligent search system');
      return await handleNaturalLanguageSearch(params);
    }
    
    // Standard parameter-based search
    if (!params.class_names && !params.function_names && !params.code) {
      throw new Error('Please provide either query_description, class_names, function_names, or code parameters');
    }
    
    // Get agent context from params (if available)
    const conversationId = (params as any).conversationId || 'default';
    const agentName = (params as any).agentName || 'unknown';
    
    // CACHE SYSTEM DISABLED: Agents must search actual project files
    console.log(`🚀 CACHE SYSTEM BYPASSED: Agent ${agentName} performing direct filesystem search`);
    
    const results: SearchResult[] = [];
    const maxFiles = 25; // OPTIMIZED: Limit results to prevent content overload
    
    // Search through project files
    const searchInDirectory = async (dirPath: string, basePath = '') => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (results.length >= maxFiles) break;
          
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          // TRUE BYPASS: Only exclude performance-critical system directories
          const excludeDirectories = [
            'node_modules', '.git', 'dist', 'build'
          ];
          
          // APPLICATION FILE PRIORITY: Boost ALL critical application files
          const isApplicationFile = relativePath.includes('client/src') || 
                                   relativePath.includes('/pages/') ||
                                   relativePath.includes('/components/') ||
                                   relativePath.includes('/api/') ||
                                   relativePath.includes('server/') ||
                                   relativePath.includes('/services/') ||
                                   relativePath.includes('/agents/') ||
                                   relativePath.includes('/routes/') ||
                                   relativePath.endsWith('.tsx') ||
                                   relativePath.endsWith('.ts') && !relativePath.includes('node_modules');
          
          if (isApplicationFile) {
            console.log(`🚀 APPLICATION FILE DETECTED: ${relativePath} - boosting priority`);
          }
          
          // MINIMAL EXCLUSIONS: Allow access to almost everything including cache, archives  
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
                // TRUE BYPASS: Read all files without pre-filtering
                const content = await fs.readFile(fullPath, 'utf-8');
                const analysis = analyzeFileRelevance(content, params, relativePath);
                
                // UNRESTRICTED ACCESS: Always include relevant files with full content
                if (analysis.relevant) {
                  let priority = analysis.priority;
                  // APPLICATION FILE BOOST: Give ALL application files higher priority
                  if (isApplicationFile) {
                    priority += 50; // Significant boost for all application files
                  }
                  
                  results.push({
                    fileName: relativePath,
                    content: analysis.relevantContent.substring(0, 300) + (analysis.relevantContent.length > 300 ? '...' : ''),
                    reason: analysis.reason + (isApplicationFile ? ' [APP FILE]' : ''),
                    priority
                  });
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
    
    // DIRECT ACCESS MODE: No filtering, show actual project files
    console.log('✅ DIRECT ACCESS MODE - No template redirects, no doc filtering');
    
    // Filter out ONLY template/archive files that were hijacking searches
    const isTemplateOverride = (result: any) => 
      result.fileName?.includes('admin-created-maya-components') ||
      result.fileName?.includes('template-override') ||
      result.fileName?.includes('archive/') ||
      result.fileName?.startsWith('AGENT_') ||
      result.fileName?.startsWith('ADMIN_') ||
      result.fileName?.startsWith('SYSTEM_');
    
    // Keep ALL real application files, filter ONLY template overrides
    const realProjectFiles = sortedResults.filter(r => !isTemplateOverride(r));
    const templateFiles = sortedResults.filter(r => isTemplateOverride(r));
    
    // Prioritize real project files, keep some templates for reference only
    const finalSortedResults = realProjectFiles.length > 0 
      ? [...realProjectFiles, ...templateFiles.slice(0, 2)]
      : sortedResults;
    
    // RELATED FILE DISCOVERY: Add related files for top results  
    const enhancedResults = finalSortedResults.slice(0, Math.min(15, finalSortedResults.length)).map(result => {
      const allFilePaths = results.map(r => r.fileName);
      const relatedFiles = findRelatedFiles(result.fileName, allFilePaths);
      return {
        ...result,
        relatedFiles: relatedFiles.length > 0 ? relatedFiles : undefined
      };
    });
    
    // Combine enhanced top results with remaining sorted results (prioritizing app files)
    const finalResults = [
      ...enhancedResults,
      ...finalSortedResults.slice(enhancedResults.length)
    ].slice(0, maxFiles);
    
    console.log(`✅ SEARCH COMPLETE: Found ${results.length} relevant files`);
    
    // CACHE DISABLED: No longer storing results to prevent search hijacking
    console.log(`✅ DIRECT SEARCH COMPLETE: ${finalResults.length} files found via actual filesystem search`);
    
    // OPTIMIZED RESULTS: Minimal data to prevent content overload
    const directAccessResults = finalResults.map(r => ({
      file: r.fileName,
      fullPath: r.fileName.startsWith('./') ? r.fileName : `./${r.fileName}`,
      reason: r.reason.replace(/[🎯📄🔍]/g, '').trim(),
      snippet: r.content.substring(0, 150) + (r.content.length > 150 ? '...' : ''),
      type: r.fileName.endsWith('.tsx') ? 'React Component' : 
            r.fileName.endsWith('.ts') ? 'TypeScript File' :
            r.fileName.endsWith('.js') ? 'JavaScript File' :
            r.fileName.endsWith('.md') ? 'Documentation' : 'File',
      priority: r.priority || 0
    }));
    
    return { 
      summary: `DIRECT ACCESS: Found ${results.length} actual project files (template overrides removed)`,
      results: directAccessResults,
      instructions: 'Use str_replace_based_edit_tool with the fullPath to view or modify these files',
      accessMode: 'DIRECT_FILESYSTEM_ACCESS',
      searchType: 'DIRECT_FILESYSTEM_SEARCH'
    };
    
  } catch (error) {
    console.error('❌ CONSULTING SEARCH ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Codebase search failed: ${errorMessage}`);
  }
}

/**
 * PURE NATURAL LANGUAGE SEARCH HANDLER
 * Simple, unrestricted search that trusts agent intelligence
 */
async function handleNaturalLanguageSearch(params: SearchParams) {
  const query = params.query_description!;
  const agentName = params.agentName || 'unknown';
  
  console.log(`🧠 UNRESTRICTED SEARCH: "${query}" for agent ${agentName}`);
  
  try {
    // Let intelligence systems work naturally without forcing them into specific patterns
    const navigationSystem = AutonomousNavigationSystem.getInstance();
    const contextManager = IntelligentContextManager.getInstance();
    
    // Get intelligent suggestions but don't force specific discovery patterns
    const [navigationResult, workContext] = await Promise.all([
      navigationSystem.navigateToRelevantFiles({
        goal: query,
        agentType: agentName
      }),
      contextManager.prepareAgentWorkspace(query, agentName)
    ]);
    
    // Combine intelligence results without restrictions
    const allFiles = [
      ...navigationResult.discoveredFiles,
      ...workContext.relevantFiles
    ];
    
    // Simple deduplication, no artificial prioritization
    const uniqueFiles = [...new Set(allFiles)];
    
    // Convert to simple results format
    const results = uniqueFiles.map(file => ({
      file,
      fullPath: file.startsWith('./') ? file : `./${file}`,
      reason: 'Found via intelligent search',
      type: file.endsWith('.tsx') ? 'React Component' : 
            file.endsWith('.ts') ? 'TypeScript File' : 'File'
    }));
    
    return {
      summary: `UNRESTRICTED SEARCH: Found ${results.length} files via intelligent navigation`,
      results,
      instructions: 'Use str_replace_based_edit_tool with the fullPath to view or modify these files',
      accessMode: 'UNRESTRICTED_INTELLIGENCE',
      searchType: 'NATURAL_LANGUAGE_SEARCH'
    };
    
  } catch (error) {
    console.error('❌ SEARCH ERROR:', error);
    // Simple fallback to enhanced search bypass
    const { enhanced_search_bypass } = await import('./enhanced_search_bypass.js');
    return await enhanced_search_bypass({
      naturalLanguageQuery: query,
      agentName
    });
  }
}

// All hardcoded discovery functions removed - let intelligence systems work naturally

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
  const queryLower = (params.query_description || '').toLowerCase();
  const contentLower = content.toLowerCase();
  const pathLower = filePath.toLowerCase();
  
  // SMART QUERY PROCESSING: Handle complex queries intelligently
  const queryTerms = processSmartQuery(queryLower);
  const fileName = path.basename(pathLower);
  
  // SIMPLE RELEVANCE CHECK - Trust agent intelligence
  let relevantContent = '';
  let reason = '';
  
  // Basic matching without artificial constraints
  const hasQueryMatch = queryTerms.primary.some(term => 
    contentLower.includes(term) || pathLower.includes(term) || fileName.toLowerCase().includes(term)
  );
  
  // Removed complex priority algorithms - let agents use natural intelligence
  
  // Simple parameter matching without priority constraints
  if (params.class_names?.length) {
    for (const className of params.class_names) {
      if (content.includes(className)) {
        return {
          relevant: true,
          relevantContent: content.substring(0, 2000),
          reason: `Contains class: ${className}`,
          priority: 1
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
          priority: 1
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
          priority: 1
        };
      }
    }
  }
  
  // Simple natural language query matching
  if (hasQueryMatch || (queryLower && contentLower.includes(queryLower))) {
    return {
      relevant: true,
      relevantContent: content.substring(0, 2000),
      reason: `Matches query: ${fileName}`,
      priority: 1
    };
  }

  // No artificial priority constraints - all files equal

  // Removed hardcoded member journey file list - let agents discover naturally

  
  return {
    relevant: false,
    relevantContent: '',
    reason: '',
    priority: 0
  };
}

// ================== INTELLIGENT SEARCH SYSTEM FUNCTIONS ==================

// SIMPLIFIED: No query preprocessing in TRUE BYPASS system
function processSmartQuery(query: string): { 
  primary: string[], 
  secondary: string[], 
  context: string[] 
} {
  // BYPASS: Return original query terms without categorization
  const terms = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  return { 
    primary: terms, 
    secondary: [], 
    context: [] 
  };
}

// Removed hardcoded file detection - let agent intelligence work naturally

// Removed hardcoded component detection - trust agent intelligence

// Removed hardcoded scoring algorithm - trust pure agent intelligence

// Removed hardcoded component scoring - let agents use natural intelligence

// Removed hardcoded semantic matching - trust agent natural language understanding

// Removed hardcoded content extraction - let agents determine relevant content naturally

// Removed hardcoded related file discovery - trust agent intelligence to find related files naturally

function analyzeBinaryFileRelevance(params: SearchParams, filePath: string): {
  relevant: boolean;
  relevantContent: string;
  reason: string;
} {
  const queryLower = (params.query_description || '').toLowerCase();
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

// REMOVED: analyzePathRelevance function eliminated as part of TRUE BYPASS system

// REMOVED: quickPathMatch function eliminated as part of TRUE BYPASS system