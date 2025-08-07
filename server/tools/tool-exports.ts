// Tool exports for Claude API service
export { str_replace_based_edit_tool } from './str_replace_based_edit_tool.ts';
export { bash } from './bash.ts';
export { direct_file_access } from './direct_file_access.ts';
import fs from 'fs/promises';
import path from 'path';
import { agentSearchCache } from '../services/agent-search-cache';

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
    console.log('🔍 SEARCH WITH RESTORED CACHE SYSTEM:', params);
    
    // Get agent context from params (if available)
    const conversationId = (params as any).conversationId || 'default';
    const agentName = (params as any).agentName || 'unknown';
    
    // Check cache optimization suggestions  
    const cacheAnalysis = agentSearchCache.shouldSkipSearch(conversationId, agentName, params.query_description);
    if (cacheAnalysis.shouldSkip && cacheAnalysis.suggestedFiles) {
      console.log(`🚀 CACHE OPTIMIZATION: ${cacheAnalysis.reason}`);
      const cachedResults = cacheAnalysis.suggestedFiles.map((file: any) => ({
        file: file.path,
        fullPath: file.path.startsWith('./') ? file.path : `./${file.path}`,
        reason: `CACHED: ${file.path}`,
        snippet: file.content?.substring(0, 200) + '...' || '',
        type: 'Cached File'
      }));
      
      return {
        summary: `Found ${cachedResults.length} cached files (Cache: ${cacheAnalysis.reason})`,
        results: cachedResults,
        instructions: 'Use str_replace_based_edit_tool to view these cached files',
        accessMode: 'CACHE_OPTIMIZATION'
      };
    }
    
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
    
    // ADD RESULTS TO RESTORED CACHE SYSTEM
    agentSearchCache.addSearchResults(conversationId, agentName, params.query_description, finalResults);
    
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
      cacheStats: agentSearchCache.getCacheStats()
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
    if (mainFileScore > 15) {  // LOWERED: From 50 to 15 for better component access
      priority = 100 + mainFileScore;
      relevantContent = extractRelevantContent(content, queryTerms);
      reason = `🎯 MAIN APP FILE: ${fileName} (${mainFileScore}% match)`;
      return { relevant: true, relevantContent, reason, priority };
    }
  }
  
  // PRIORITY 2 (80): COMPONENT/PAGE MATCHES  
  if (isComponentOrPage(filePath)) {
    const componentScore = calculateComponentScore(queryTerms, pathLower, contentLower, fileName);
    if (componentScore > 10) {  // LOWERED: From 40 to 10 for comprehensive component access
      priority = 80 + componentScore;
      relevantContent = extractRelevantContent(content, queryTerms);
      reason = `📄 COMPONENT/PAGE: ${fileName} (${componentScore}% match)`;
      return { relevant: true, relevantContent, reason, priority };
    }
  }
  
  // PRIORITY 3 (60): SEMANTIC KEYWORD MATCHING
  const semanticScore = calculateSemanticMatch(queryTerms, pathLower, contentLower);
  if (semanticScore > 8) {  // LOWERED: From 30 to 8 for broader semantic matching
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

  // LOW PRIORITY FOR DOCUMENTATION AND CONFIG FILES (still included but deprioritized)
  const lowPriorityPatterns = [
    // Documentation files
    '.md', '.txt', '.csv', 
    // Configuration files
    '.json', '.config.', '.eslint', '.prettier', 'package-lock.json',
    // Build/deployment files
    'dockerfile', 'docker-compose', '.yml', '.yaml',
    // Log and temporary files
    '.log', '.cache', '.tmp', 'temp',
    // Asset files (unless specifically searched)
    '.png', '.jpg', '.jpeg', '.gif', '.svg'
  ];

  const isDocumentationFile = fileName.endsWith('.md') && 
    (fileName.includes('AGENT') || fileName.includes('ADMIN') || fileName.includes('ANALYSIS') || 
     fileName.includes('REPORT') || fileName.includes('STATUS') || fileName.includes('FIX') ||
     fileName.includes('SUCCESS') || fileName.includes('COMPLETE') || fileName.includes('AUDIT') ||
     fileName.includes('SYSTEM') || fileName.includes('INTEGRATION') || fileName.includes('CRITICAL'));

  const isLowPriorityFile = lowPriorityPatterns.some(pattern => 
    fileName.includes(pattern) || pathLower.includes(pattern)
  );

  // Documentation files get very low priority unless specifically requested  
  if (isDocumentationFile && !queryLower.includes('analysis') && !queryLower.includes('report')) {
    return {
      relevant: true,
      relevantContent: content.substring(0, 500), // Limited content for docs
      reason: `Documentation file: ${fileName} (low priority)`,
      priority: 5 // Very low priority
    };
  }

  // Other low priority files get low priority but still included
  if (isLowPriorityFile && !queryLower.includes('config') && !queryLower.includes('asset')) {
    return {
      relevant: true,
      relevantContent: content.substring(0, 1000),
      reason: `Configuration/asset file: ${fileName} (low priority)`,
      priority: 10 // Low priority but still visible
    };
  }

  // MEMBER JOURNEY DIRECT FILE MAPPING: Exact file matches get absolute highest priority
  const memberJourneyFiles = [
    'workspace.tsx', 'editorial-landing.tsx', 'pricing.tsx', 'checkout.tsx', 'login.tsx',
    'simple-training.tsx', 'ai-photoshoot.tsx', 'build.tsx', 'victoria-builder.tsx',
    'sselfie-gallery.tsx', 'flatlay-library.tsx', 'about.tsx', 'how-it-works.tsx',
    'landing.tsx', 'new-landing.tsx', 'member-navigation.tsx', 'workspace-interface.tsx',
    'editorial-story.tsx', 'editorial-spread.tsx', 'editorial-testimonials.tsx'
  ];
  
  if (memberJourneyFiles.includes(fileName)) {
    // Add helpful path information for agents
    const fullPath = `client/src/pages/${fileName}`;
    return {
      relevant: true,
      relevantContent: content.substring(0, 3000), // Maximum content for member files
      reason: `CORE MEMBER JOURNEY: ${fileName} (Path: ${fullPath})`,
      priority: 200 // ABSOLUTE HIGHEST PRIORITY - Always show member journey files first
    };
  }
  
  // HIGH PRIORITY: ALL CORE APPLICATION FILES - No restrictions or limitations
  const applicationFilePaths = [
    // MEMBER JOURNEY & UI
    'pages/', 'components/', 'hooks/', 'lib/', 'src/',
    // SERVER INFRASTRUCTURE  
    'routes/', 'services/', 'agents/', 'tools/', 'server/', 'shared/',
    // DATABASE & STORAGE
    'schema', 'database', 'storage', 'db',
    // MEMBER EXPERIENCE FILES
    'editorial', 'workspace', 'training', 'photoshoot', 'gallery', 'flatlay',
    'pricing', 'checkout', 'login', 'about', 'landing', 'build'
  ];
  
  const isApplicationFile = applicationFilePaths.some(appPath => pathLower.includes(appPath));
  
  if (isApplicationFile) {
    // DETERMINE PRIORITY LEVEL
    let appPriority = 50; // Good base priority for all app files
    
    // BOOST for member journey files
    if (pathLower.includes('editorial') || pathLower.includes('workspace') || 
        pathLower.includes('training') || pathLower.includes('photoshoot') || 
        pathLower.includes('gallery') || pathLower.includes('flatlay')) {
      appPriority = 80;
    }
    
    // BOOST for core infrastructure
    if (pathLower.includes('routes/') || pathLower.includes('services/') || 
        pathLower.includes('schema') || pathLower.includes('database')) {
      appPriority = 70;
    }
    
    // BOOST for pages and components
    if (pathLower.includes('pages/') || pathLower.includes('components/')) {
      appPriority = 60;
    }
    
    return {
      relevant: true,
      relevantContent: content.substring(0, 2500), // More content for app files
      reason: `Core application file: ${fileName}`,
      priority: appPriority
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

// MAIN APPLICATION FILE DETECTION
function isMainApplicationFile(filePath: string): boolean {
  const path = filePath.toLowerCase();
  
  // HIGHEST PRIORITY: Core application files that agents need
  const coreApplicationPaths = [
    // MEMBER-FACING FILES (highest priority)
    'client/src/pages/',
    'client/src/components/',
    'server/routes/',
    'server/services/',
    'shared/',
    
    // SUPPORTING APPLICATION FILES
    'client/src/hooks/',
    'client/src/lib/',
    'server/agents/',
    'server/tools/',
    'server/db',
    'server/storage',
    'client/src/app.tsx'
  ];
  
  // Check if it's a core application file
  const isCoreFile = coreApplicationPaths.some(corePath => path.includes(corePath));
  
  // Exclude non-application files
  const excludePatterns = ['node_modules', 'dist', 'build', '.git', '.cache'];
  const isExcluded = excludePatterns.some(pattern => path.includes(pattern));
  
  return isCoreFile && !isExcluded;
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
  
  // Synonym matching for MEMBER journey terms (prioritized over admin)
  const synonyms: Record<string, string[]> = {
    'member': ['user', 'customer', 'client', 'workspace', 'journey'],
    'editorial': ['landing', 'story', 'testimonial', 'spread'],
    'train': ['training', 'simple-training', 'model', 'upload'],
    'shoot': ['photoshoot', 'ai-photoshoot', 'photography', 'photos'],
    'style': ['styling', 'design', 'brand', 'aesthetic'], 
    'build': ['builder', 'victoria-builder', 'create', 'generate'],
    'gallery': ['sselfie-gallery', 'photos', 'collection'],
    'flatlay': ['library', 'flatlay-library', 'assets'],
    'workspace': ['member-workspace', 'dashboard', 'interface'],
    'checkout': ['payment', 'pricing', 'subscription', 'billing'],
    'agent': ['bot', 'assistant', 'ai', 'chat'],
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

// REMOVED: analyzePathRelevance function eliminated as part of TRUE BYPASS system

// REMOVED: quickPathMatch function eliminated as part of TRUE BYPASS system