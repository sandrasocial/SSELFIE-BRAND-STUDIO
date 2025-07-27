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
    const maxFiles = 50000; // UNLIMITED ACCESS: MASSIVE increase for complete repository visibility (10x previous limit)
    
    // Search through project files
    const searchInDirectory = async (dirPath: string, basePath = '') => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (results.length >= maxFiles) break;
          
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.join(basePath, entry.name);
          
          // MINIMAL EXCLUSIONS: Only skip major build artifacts, allow access to EVERYTHING else including hidden files
          if (entry.name === 'node_modules' || 
              entry.name === 'dist' ||
              entry.name === 'build' ||
              entry.name === '.git' ||
              entry.name === '.next' ||
              entry.name === 'coverage') {
            continue;
          }
          
          // INCLUDE HIDDEN FILES: Allow access to .env, .replit, .gitignore, etc.
          // No exclusion for dot files - Sandra needs complete access
          
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
    
    console.log(`✅ ADMIN SEARCH: Found ${results.length} relevant files for comprehensive analysis (max: ${maxFiles})`);
    
    // FORCE SHOW MORE RESULTS: If we hit the limit, explicitly tell agents there might be more
    const hitLimit = results.length >= maxFiles;
    
    return { 
      summary: `UNLIMITED ACCESS: Found ${results.length} files across entire repository${hitLimit ? ' (LIMIT REACHED - more files available)' : ''}`,
      results: results, // Return ALL results, no slicing limitation
      totalFiles: results.length,
      accessLevel: "UNLIMITED",
      note: `Complete repository access enabled - all agents can see entire codebase${hitLimit ? '. Search hit maximum limit - refine query for specific files.' : ''}`,
      searchStats: {
        filesAnalyzed: results.length,
        maxCapacity: maxFiles,
        hitLimit,
        suggestion: hitLimit ? "Use more specific search terms to find exact files" : "Complete search performed"
      }
    };
    
  } catch (error) {
    console.error('❌ ADMIN SEARCH ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Repository search failed: ${errorMessage}`);
  }
}

function shouldAnalyzeFile(fileName: string): boolean {
  // UNLIMITED FILE TYPE ACCESS: Support ALL possible file types agents might need
  const codeExtensions = [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', '.html', '.txt', '.xml', '.yaml', '.yml', 
    '.env', '.config', '.toml', '.py', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs', 
    '.swift', '.kt', '.scala', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd', '.sql',
    '.graphql', '.gql', '.proto', '.dockerfile', '.dockerignore', '.gitignore', '.gitattributes',
    '.editorconfig', '.prettierrc', '.eslintrc', '.babelrc', '.nvmrc', '.npmrc', '.yarnrc',
    '.replit', '.nix', '.lock', '.log', '.ini', '.conf', '.properties', '.manifest', '.plist'
  ];
  
  // Also allow files without extensions (like Dockerfile, Makefile, etc.)
  const hasExtension = fileName.includes('.');
  if (!hasExtension) return true; // Include files without extensions
  
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
    const keywords = query.split(/[,\s-]+/).filter(word => word.length > 1); // UNLIMITED: Reduced minimum length to catch more matches
    
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
    
    // ULTIMATE keyword matching - maximum coverage
    let keywordMatches = 0;
    for (const keyword of keywords) {
      // Ultra-comprehensive matching patterns
      if (fileContent.includes(keyword) || 
          fileNameLower.includes(keyword) || 
          fileName.toLowerCase().includes(keyword) || 
          content.toLowerCase().includes(keyword) ||
          // Match variations and patterns
          fileContent.includes(keyword.replace('-', '')) ||
          fileContent.includes(keyword.replace('_', '')) ||
          fileContent.includes(keyword.charAt(0).toUpperCase() + keyword.slice(1)) || // Capitalize first letter
          fileName.toLowerCase().split('/').some(part => part.includes(keyword)) || // Check path segments
          content.toLowerCase().match(new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`)) // Word boundary match
         ) {
        keywordMatches++;
      }
    }
    
    // ULTRA-AGGRESSIVE matching - find everything possible
    const additionalMatches = keywords.filter(k => 
      fileNameLower.indexOf(k) !== -1 || 
      fileContent.indexOf(k) !== -1 ||
      fileNameLower.replace('-', '').includes(k) ||
      fileNameLower.replace('_', '').includes(k) ||
      fileNameLower.replace('.', '').includes(k) ||
      fileName.replace(/([A-Z])/g, '-$1').toLowerCase().includes(k) || // Convert CamelCase to kebab-case
      fileName.toLowerCase().split(/[\.\/\\]/).some(part => part.includes(k)) || // Check file path parts
      content.toLowerCase().split(/[\s\n\r\t,;.!?(){}[\]"'`]/).some(word => word.includes(k)) // Check all words
    ).length;
    
    // File path matches for specific components - MASSIVELY EXPANDED
    const pathKeywords = [
      'login', 'auth', 'onboard', 'workspace', 'dashboard', 'nav', 'route', 'page',
      'agent', 'elena', 'workflow', 'activity', 'admin', 'component', 'hook', 'api',
      'service', 'util', 'lib', 'config', 'schema', 'type', 'interface', 'model',
      'controller', 'middleware', 'validation', 'test', 'spec', 'story', 'style',
      'layout', 'template', 'form', 'button', 'modal', 'popup', 'drawer', 'sidebar',
      'header', 'footer', 'menu', 'tab', 'card', 'table', 'list', 'grid', 'chart'
    ];
    const pathMatches = pathKeywords.some(key => fileNameLower.includes(key));
    
    const totalMatches = keywordMatches + additionalMatches;
    if (totalMatches > 0 || pathMatches || hasAutonomousTerms) {
      reasons.push(`Matches ${totalMatches} keywords from query${hasAutonomousTerms ? ' (AUTONOMOUS ORCHESTRATOR SYSTEM)' : ''}${pathMatches ? ' + path match' : ''}`);
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
  
  // UNLIMITED KEY FILES: Massively expanded to catch EVERYTHING Sandra's agents might need
  const keyFiles = [
    'schema.ts', 'routes.ts', 'App.tsx', 'package.json', 'replit.md', 'README.md',
    'login', 'auth', 'onboard', 'workspace', 'dashboard', 'navigation',
    'home', 'landing', 'payment', 'signup', 'profile', 'settings',
    // AUTONOMOUS ORCHESTRATOR SYSTEM KEYWORDS
    'deploy-all-agents', 'intelligent-task-distributor', 'agent-knowledge-sharing', 
    'workflow-templates', 'coordination-metrics', 'autonomous-orchestrator',
    'orchestrator', 'task-distributor', 'knowledge-sharing', 'workflow',
    'agent-bridge', 'coordination', 'deployment', 'elena', 'agent-activity',
    // SSELFIE STUDIO SPECIFIC
    'maya', 'victoria', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga',
    'sselfie', 'selfie', 'studio', 'gallery', 'photoshoot', 'ai-generator', 'training',
    'subscription', 'pricing', 'checkout', 'payment', 'stripe', 'billing',
    // CORE ARCHITECTURE
    'index', 'main', 'config', 'env', 'types', 'interfaces', 'models', 'schemas',
    'services', 'api', 'endpoints', 'routes', 'middleware', 'auth', 'session',
    'database', 'storage', 'cache', 'queue', 'worker', 'cron', 'scheduler'
  ];
  
  const isKeyFile = keyFiles.some(key => fileName.toLowerCase().includes(key.toLowerCase()));
  const isUserFlow = fileName.includes('pages/') || fileName.includes('components/') || fileName.includes('hooks/') || 
                    fileName.includes('src/') || fileName.includes('server/') || fileName.includes('shared/') ||
                    fileName.includes('client/') || fileName.includes('api/') || fileName.includes('lib/') ||
                    fileName.includes('utils/') || fileName.includes('services/') || fileName.includes('tools/');
  
  if (isKeyFile || isUserFlow) {
    reasons.push(`Key user experience file: ${fileName}`);
    relevantContent = content.substring(0, 8000); // UNLIMITED: Massive content extraction for complete analysis
    relevant = true;
  }
  
  return {
    relevant,
    reason: reasons.join(', '),
    relevantContent: relevantContent || content.substring(0, 5000) // UNLIMITED: Fallback increased to 5000 chars for complete context
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
  
  return relevantLines.join('\n').substring(0, 5000); // UNLIMITED: Dramatically increased content extraction (was 1500)
}