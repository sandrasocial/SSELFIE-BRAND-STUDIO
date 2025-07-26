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
    console.log('🔍 ADMIN SEARCH: Starting full repository analysis with params:', params);
    
    const results: SearchResult[] = [];
    const maxFiles = 1000; // UNLIMITED ACCESS: Maximum files increased for complete repository visibility
    
    // Search through project files
    const searchInDirectory = async (dirPath: string, basePath = '') => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (results.length >= maxFiles) break;
          
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          // MINIMAL EXCLUSIONS: Only skip build artifacts, allow access to everything else
          if (entry.name === 'node_modules' || 
              entry.name === 'dist' ||
              entry.name === 'build' ||
              entry.name === '.git') {
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
    
    console.log(`✅ ADMIN SEARCH: Found ${results.length} relevant files for comprehensive analysis`);
    
    return { 
      summary: `UNLIMITED ACCESS: Found ${results.length} files across entire repository`,
      results: results, // Return ALL results, no slicing limitation
      totalFiles: results.length,
      accessLevel: "UNLIMITED",
      note: "Complete repository access enabled - all agents can see entire codebase"
    };
    
  } catch (error) {
    console.error('❌ ADMIN SEARCH ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Repository search failed: ${errorMessage}`);
  }
}

function shouldAnalyzeFile(fileName: string): boolean {
  // UNLIMITED FILE TYPE ACCESS: Support ALL common file types agents might need
  const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.txt', '.xml', '.yaml', '.yml', '.env', '.config', '.toml'];
  return codeExtensions.some(ext => fileName.endsWith(ext));
}

function analyzeFileRelevance(content: string, params: SearchParams, fileName: string) {
  const reasons: string[] = [];
  let relevantContent = '';
  let relevant = false;
  
  // Query-based relevance - Enhanced keyword matching
  if (params.query_description) {
    const query = params.query_description.toLowerCase();
    const fileContent = content.toLowerCase();
    const fileNameLower = fileName.toLowerCase();
    
    // Extract keywords from query for better matching - ENHANCED FOR AUTONOMOUS ORCHESTRATOR
    const keywords = query.split(/[,\s-]+/).filter(word => word.length > 2);
    
    // Special handling for autonomous orchestrator queries
    const autonomousKeywords = [
      'deploy-all-agents', 'intelligent-task-distributor', 'agent-knowledge-sharing',
      'workflow-templates', 'autonomous-orchestrator', 'coordination-metrics',
      'orchestrator', 'deployment', 'coordination', 'workflow', 'knowledge', 'sharing'
    ];
    
    // Check for autonomous orchestrator specific terms
    const hasAutonomousTerms = keywords.some(k => 
      autonomousKeywords.some(a => a.includes(k.toLowerCase()) || k.toLowerCase().includes(a))
    );
    
    // Check for keyword matches
    let keywordMatches = 0;
    for (const keyword of keywords) {
      if (fileContent.includes(keyword) || fileNameLower.includes(keyword)) {
        keywordMatches++;
      }
    }
    
    // File path matches for specific components
    const pathKeywords = ['login', 'auth', 'onboard', 'workspace', 'dashboard', 'nav', 'route', 'page'];
    const pathMatches = pathKeywords.some(key => fileNameLower.includes(key));
    
    if (keywordMatches > 0 || pathMatches || hasAutonomousTerms) {
      reasons.push(`Matches ${keywordMatches} keywords from query${hasAutonomousTerms ? ' (AUTONOMOUS ORCHESTRATOR SYSTEM)' : ''}`);
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
  
  // Key architecture files and user experience files - ENHANCED FOR AUTONOMOUS ORCHESTRATOR
  const keyFiles = [
    'schema.ts', 'routes.ts', 'App.tsx', 'package.json', 'replit.md',
    'login', 'auth', 'onboard', 'workspace', 'dashboard', 'navigation',
    'home', 'landing', 'payment', 'signup',
    // AUTONOMOUS ORCHESTRATOR SYSTEM KEYWORDS
    'deploy-all-agents', 'intelligent-task-distributor', 'agent-knowledge-sharing', 
    'workflow-templates', 'coordination-metrics', 'autonomous-orchestrator',
    'orchestrator', 'task-distributor', 'knowledge-sharing', 'workflow',
    'agent-bridge', 'coordination', 'deployment'
  ];
  
  const isKeyFile = keyFiles.some(key => fileName.toLowerCase().includes(key.toLowerCase()));
  const isUserFlow = fileName.includes('pages/') || fileName.includes('components/') || fileName.includes('hooks/');
  
  if (isKeyFile || isUserFlow) {
    reasons.push(`Key user experience file: ${fileName}`);
    relevantContent = content.substring(0, 3000); // More content for analysis
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