/**
 * SIMPLE FILESYSTEM SEARCH TOOL
 * Clean project navigation and file discovery
 */

import fs from 'fs/promises';
import path from 'path';

export async function search_filesystem(parameters: any): Promise<string> {
  console.log('🔍 PROJECT SEARCH:', parameters);
  
  try {
    const { 
      query_description, 
      class_names = [], 
      function_names = [], 
      code = [], 
      search_paths = ['.'],
      userId,
      agentName,
      adminContext = false
    } = parameters;

    // AUTHENTICATION CHECK: Ensure admin agents have proper access
    console.log('🔐 SEARCH AUTHENTICATION:', { userId, agentName, adminContext });
    const isAdminUser = userId === '42585527' || adminContext === true;
    console.log('🔐 ADMIN ACCESS GRANTED:', isAdminUser);

    let results = '';

    // SHOW CURRENT WORKING DIRECTORY FOR DEBUG
    console.log('🔍 AGENT WORKING DIRECTORY:', process.cwd());
    
    // AGENTS ARE RUNNING FROM SERVER DIR - NEED TO ADJUST PATHS
    const workspaceRoot = process.cwd().endsWith('/server') ? '..' : '.';
    
    // FOCUSED SEARCH PATHS: Exclude cache and temporary directories
    const validSearchPaths = search_paths.length > 0 ? search_paths : ['.'];
    const adjustedPaths = validSearchPaths.map(path => {
      if (path === '.') {
        // For root searches, target ALL main directories including documentation
        return [
          `${workspaceRoot}/client/src`, 
          `${workspaceRoot}/server`, 
          `${workspaceRoot}/shared`, 
          `${workspaceRoot}/infrastructure`,
          `${workspaceRoot}/docs`,
          `${workspaceRoot}/*.md`,
          `${workspaceRoot}/infrastructure/docs`,
          `${workspaceRoot}/infrastructure/docs/*.md`
        ];
      }
      if (path.startsWith('./')) return path.replace('./', `${workspaceRoot}/`);
      if (path.startsWith('/')) return path; // Absolute paths unchanged
      // Relative paths need workspace root prefix
      return `${workspaceRoot}/${path}`;
    }).flat();
    
    console.log('🔍 PATH ADJUSTMENT:', { original: search_paths, adjusted: adjustedPaths });

    // If specific code snippets are provided, search for them
    if (code.length > 0) {
      for (const codeSnippet of code) {
        const grepResult = await executeGrep(codeSnippet, adjustedPaths);
        results += `\n=== Searching for code: "${codeSnippet}" ===\n${grepResult}`;
      }
    }

    // If class names are provided, search for them
    if (class_names.length > 0) {
      for (const className of class_names) {
        const grepResult = await executeGrep(`class ${className}`, adjustedPaths);
        results += `\n=== Searching for class: "${className}" ===\n${grepResult}`;
      }
    }

    // If function names are provided, search for them
    if (function_names.length > 0) {
      for (const funcName of function_names) {
        const grepResult = await executeGrep(`function ${funcName}\\|${funcName}\\s*[=:]`, adjustedPaths);
        results += `\n=== Searching for function: "${funcName}" ===\n${grepResult}`;
      }
    }

    // INTELLIGENT SEMANTIC SEARCH: Advanced natural language processing
    if (query_description) {
      const searchTerms = extractSearchTerms(query_description);
      console.log('🧠 SEMANTIC EXPANSION:', searchTerms);
      
      // CONTEXTUAL RELATIONSHIP DISCOVERY: Find related files automatically
      const relatedFiles = await discoverRelatedFiles(searchTerms, workspaceRoot);
      console.log('🔗 DISCOVERED RELATED FILES:', relatedFiles.length);
      
      // COMPREHENSIVE SEARCH STRATEGY: Multiple search approaches
      
      // 1. EXACT TERM MATCHING across all discovered files
      for (const term of searchTerms.slice(0, 5)) {
        const broadResult = await executeGrep(term, [...adjustedPaths, ...relatedFiles]);
        if (broadResult && broadResult !== 'No matches found' && broadResult.length > 50) {
          results += `\n=== 🔍 Found "${term}" (${broadResult.split('\n').length} matches) ===\n${broadResult.substring(0, 1800)}\n`;
        }
      }
      
      // 2. PATTERN MATCHING for component relationships
      if (searchTerms.some(term => ['component', 'page', 'route', 'ui', 'tsx'].includes(term.toLowerCase()))) {
        const componentPatterns = [
          'export default function',
          'import.*from.*pages',
          'component.*props',
          'Route path=',
          'useState|useEffect'
        ];
        
        for (const pattern of componentPatterns) {
          const patternResult = await executeGrep(pattern, [`${workspaceRoot}/client/src`]);
          if (patternResult && patternResult !== 'No matches found') {
            results += `\n=== 🧩 Component Pattern "${pattern.split('|')[0]}" ===\n${patternResult.substring(0, 1000)}\n`;
          }
        }
      }
      
      // 3. API AND DATABASE RELATIONSHIP DISCOVERY
      if (searchTerms.some(term => ['api', 'database', 'route', 'endpoint', 'schema'].includes(term.toLowerCase()))) {
        const backendPatterns = [
          'router\\.',
          'app\\.(get|post|put|delete)',
          'export.*schema',
          'drizzle|postgres',
          'apiRequest'
        ];
        
        for (const pattern of backendPatterns) {
          const apiResult = await executeGrep(pattern, [`${workspaceRoot}/server`, `${workspaceRoot}/shared`]);
          if (apiResult && apiResult !== 'No matches found') {
            results += `\n=== 🔌 API Pattern "${pattern.split('\\')[0]}" ===\n${apiResult.substring(0, 1000)}\n`;
          }
        }
      }
      
      // 4. BUSINESS LOGIC AND FEATURE DISCOVERY
      if (searchTerms.some(term => ['business', 'model', 'strategy', 'launch', 'plan'].includes(term.toLowerCase()))) {
        const businessPatterns = await executeGrep('train.*style.*gallery\\|business.*model\\|launch.*strategy', [
          `${workspaceRoot}/*.md`,
          `${workspaceRoot}/docs`,
          `${workspaceRoot}/infrastructure/docs`
        ]);
        
        if (businessPatterns && businessPatterns !== 'No matches found') {
          results += `\n=== 📋 Business Intelligence ===\n${businessPatterns.substring(0, 1500)}\n`;
        }
      }
      
      // 5. CROSS-REFERENCE FILE IMPORTS AND DEPENDENCIES
      const importResults = await findFileImports(searchTerms, workspaceRoot);
      if (importResults.length > 0) {
        results += `\n=== 🔗 Related File Dependencies ===\n${importResults.join('\n').substring(0, 1200)}\n`;
      }
    }

    console.log('🔍 SEARCH RESULTS LENGTH:', results.length);
    
    // AUTHENTICATION: If no results and not admin, return permission message
    if (!results && !isAdminUser) {
      return 'Access restricted. Admin authentication required for full search capabilities.';
    }
    
    // ADMIN ACCESS: Return full results with authentication confirmation
    if (isAdminUser && results) {
      return `🔐 AUTHENTICATED SEARCH (User: ${userId})\n\n${results}`;
    }
    
    return results || 'No results found for the search criteria.';

  } catch (error) {
    console.error('❌ FILESYSTEM SEARCH ERROR:', error);
    throw error;
  }
}

// Execute grep command safely with proper path handling
async function executeGrep(searchTerm: string, searchPaths: string[]): Promise<string> {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    // Ensure we have valid paths, default to current working directory
    const pathArgs = searchPaths.length > 0 ? searchPaths : ['.'];
    
    console.log('🔍 GREP COMMAND:', `grep -r -n -i --include=*.ts --include=*.js --include=*.tsx --include=*.jsx --include=*.md "${searchTerm}" ${pathArgs.join(' ')}`);
    
    // Include source files only, exclude cache and node_modules
    const cmd = spawn('grep', [
      '-r', '-n', '-i', 
      '--include=*.ts', '--include=*.js', '--include=*.tsx', '--include=*.jsx', 
      '--include=*.md',
      '--exclude-dir=node_modules',
      '--exclude-dir=.cache',
      '--exclude-dir=.local',
      '--exclude-dir=.git',
      '--exclude-dir=dist',
      '--exclude-dir=build',
      searchTerm, 
      ...pathArgs
    ], {
      cwd: process.cwd() // Ensure we run from the correct directory
    });
    
    let output = '';
    let errorOutput = '';
    
    cmd.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    cmd.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    cmd.on('close', (code) => {
      console.log('🔍 GREP EXIT CODE:', code);
      console.log('🔍 GREP OUTPUT LENGTH:', output.length);
      if (output) {
        console.log('🔍 GREP SAMPLE:', output.substring(0, 300));
      }
      resolve(output || 'No matches found');
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      cmd.kill();
      resolve('Search timed out');
    }, 10000);
  });
}

// REMOVED: Hardcoded file content function - agents should use str_replace_based_edit_tool

// COMPLETE BUSINESS MODEL VISIBILITY FOR ADMIN AGENTS
async function getProjectOverview(): Promise<string> {
  // READ BUSINESS MODEL DOCUMENTATION WITH DEBUG
  console.log('🔍 LOADING BUSINESS DOCS...');
  console.log('🔍 CURRENT WORKING DIR:', process.cwd());
  const businessDocs = await getBusinessModelDocumentation();
  console.log('📄 BUSINESS DOCS LENGTH:', businessDocs.length);
  
  return `🚀 SSELFIE STUDIO - COMPLETE PROJECT & BUSINESS MODEL ACCESS:

📋 SANDRA'S BUSINESS MODEL & LAUNCH STRATEGY:
${businessDocs}

✅ ROOT DIRECTORIES (what agents can access):
./server/ - Express.js backend, API routes, agent tools, services
./client/ - Frontend React application (CONTAINS src/ subdirectory)  
./client/src/ - Main React source code (components, pages, hooks)
./shared/ - TypeScript schemas (database models, types)
./config/ - Configuration files
./_architecture/ - Architecture documentation
./attached_assets/ - User uploads and project assets
./admin-development/ - Admin agent development files
./infrastructure/ - Infrastructure and deployment configurations

📋 KEY BUSINESS & PROJECT FILES:
./replit.md - COMPLETE project documentation and business architecture
./SANDRA_LAUNCH_STRATEGY.md - Launch strategy and business plans
./MEMBER_WORKSPACE_REDESIGN_PLAN.md - User experience and features
./ARCHITECTURE_OVERVIEW.md - Technical architecture documentation  
./PROJECT_GUIDE.md - Development and business guidelines
./package.json - Dependencies (React, Express, PostgreSQL, Drizzle, etc.)
./server/index.ts - Main server entry point
./shared/schema.ts - Database schema (PostgreSQL + Drizzle ORM)

🎯 CRITICAL LOCATIONS FOR AGENTS:
- Business Strategy: ./SANDRA_LAUNCH_STRATEGY.md, ./replit.md
- User Experience: ./MEMBER_WORKSPACE_REDESIGN_PLAN.md  
- React Components: ./client/src/components/
- React Pages: ./client/src/pages/ (including pricing, workspace, etc.)
- API Routes: ./server/routes/
- Database: PostgreSQL with Drizzle ORM in ./shared/schema.ts
- Agent Tools: ./server/tools/

🔧 Tech Stack: React 18 + TypeScript + Express + PostgreSQL + Drizzle + Tailwind CSS
💰 Revenue Model: €39 Single Mom Starter + Premium subscriptions
🎯 Business Focus: AI Personal Branding Platform for immediate income generation

✅ PROJECT STATUS: READY FOR SIMPLIFIED LAUNCH WITH REVENUE GENERATION`;
}

// Get complete directory listing - FIXED: No truncation for admin agents
async function getBasicDirectoryListing(): Promise<string> {
  try {
    // Use native fs for more reliable and comprehensive results
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Get root directory contents first  
    // If running from server directory, go up one level to workspace root
    const workspaceRoot = process.cwd().endsWith('/server') ? '..' : '.';
    const rootItems = await fs.readdir(workspaceRoot, { withFileTypes: true });
    let listing = 'ROOT DIRECTORY CONTENTS:\n';
    
    // ADMIN AGENTS: FULL REPOSITORY ACCESS - NO LIMITATIONS
    for (const item of rootItems) { // NO TRUNCATION for admin agents
      const type = item.isDirectory() ? 'DIR' : 'FILE';
      const name = item.name;
      
      // Skip ONLY node_modules and .git to show complete project
      if (!['node_modules', '.git'].includes(name)) {
        listing += `${type}: ${name}\n`;
        
        // Show ALL key subdirectories for admin agents  
        if (item.isDirectory() && ['server', 'client', 'src', 'components', 'pages', 'shared', 'config', '_architecture', 'attached_assets', 'admin-development', 'infrastructure'].includes(name)) {
          try {
            const subItems = await fs.readdir(name, { withFileTypes: true });
            for (const subItem of subItems) { // NO SLICE LIMITATION
              const subType = subItem.isDirectory() ? 'DIR' : 'FILE';
              listing += `  └─ ${subType}: ${name}/${subItem.name}\n`;
              
              // Show deeper levels for client/src specifically
              if (name === 'client' && subItem.isDirectory() && subItem.name === 'src') {
                try {
                  const srcItems = await fs.readdir(`${name}/${subItem.name}`, { withFileTypes: true });
                  for (const srcSubItem of srcItems) { // NO SLICE - FULL ACCESS
                    const srcType = srcSubItem.isDirectory() ? 'DIR' : 'FILE';
                    listing += `    └─ ${srcType}: ${name}/${subItem.name}/${srcSubItem.name}\n`;
                    
                    // Show pages directory contents
                    if (srcSubItem.isDirectory() && srcSubItem.name === 'pages') {
                      try {
                        const pageItems = await fs.readdir(`${name}/${subItem.name}/${srcSubItem.name}`, { withFileTypes: true });
                        for (const pageItem of pageItems) { // NO SLICE - SHOW ALL
                          listing += `      └─ FILE: ${name}/${subItem.name}/${srcSubItem.name}/${pageItem.name}\n`;
                        }
                      } catch {}
                    }
                  }
                } catch {}
              }
            }
          } catch (error) {
            listing += `  └─ (access restricted)\n`;
          }
        }
      }
    }
    
    return listing;
  } catch (error) {
    // Fallback to ls command but WITHOUT TRUNCATION
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const cmd = spawn('ls', ['-la']);
      
      let output = '';
      
      cmd.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      cmd.on('close', () => {
        // CRITICAL FIX: Return FULL output without truncation
        resolve(output || 'Directory listing unavailable');
      });
      
      setTimeout(() => {
        cmd.kill();
        resolve('Directory listing timed out');
      }, 10000); // Increased timeout
    });
  }
}

// BUSINESS MODEL ACCESS: Read key business documentation for admin agents
async function getBusinessModelDocumentation(): Promise<string> {
  console.log('🔍 GETTING BUSINESS DOCS...');
  let businessInfo = '';
  
  const keyBusinessFiles = [
    'replit.md',
    'SANDRA_LAUNCH_STRATEGY.md', 
    'MEMBER_WORKSPACE_REDESIGN_PLAN.md',
    'ARCHITECTURE_OVERVIEW.md',
    'PROJECT_GUIDE.md'
  ];
  
  for (const filename of keyBusinessFiles) {
    try {
      const fs = await import('fs/promises');
      const workspaceRoot = process.cwd().endsWith('/server') ? '..' : '.';
      console.log(`🔍 TRYING TO READ: ${workspaceRoot}/${filename}`);
      const content = await fs.readFile(`${workspaceRoot}/${filename}`, 'utf-8');
      console.log(`✅ READ ${filename}: ${content.length} characters`);
      
      // KEY BUSINESS CRITICAL INFO - FULL ACCESS FOR AGENTS
      businessInfo += `\n📄 ${filename.toUpperCase()}:\n`;
      
      // SPECIAL HANDLING FOR CRITICAL FILES
      if (filename === 'SANDRA_LAUNCH_STRATEGY.md') {
        // Include MORE of the launch strategy since it's critical
        businessInfo += content.substring(0, 4000);
        if (content.length > 4000) {
          businessInfo += '\n... (file continues - agents can access full file via str_replace_based_edit_tool)';
        }
      } else if (filename === 'replit.md') {
        // Include business model overview from replit.md
        businessInfo += content.substring(0, 3000);
        if (content.length > 3000) {
          businessInfo += '\n... (file continues)';
        }
      } else {
        // Other files - substantial excerpts
        businessInfo += content.substring(0, 1500);
        if (content.length > 1500) {
          businessInfo += '\n... (file continues)';
        }
      }
      businessInfo += '\n\n';
    } catch (error) {
      console.log(`❌ FAILED TO READ ${filename}:`, error instanceof Error ? error.message : 'Unknown error');
      businessInfo += `\n📄 ${filename}: File not accessible - ${error instanceof Error ? error.message : 'Unknown error'}\n`;
    }
  }
  
  console.log('📄 FINAL BUSINESS INFO LENGTH:', businessInfo.length);
  return businessInfo || '📄 Business documentation access limited - check file permissions';
}

// INTELLIGENT SEMANTIC SEARCH TERM EXTRACTION
function extractSearchTerms(description: string): string[] {
  // COMPREHENSIVE KEYWORD MAPPING for SSELFIE Studio Complete User Journey
  const sselfieKeywordMap = {
    // PRE-LOGIN PAGES (Public Website)
    'landing': ['editorial-landing', 'EditorialLanding', 'landing', 'home', 'hero', 'public'],
    'about': ['about', 'AboutPage', 'story', 'mission', 'vision'],
    'how-it-works': ['how-it-works', 'HowItWorks', 'process', 'workflow', 'steps'],
    'pricing': ['pricing', 'Pricing', 'subscription', 'stripe', 'payment', 'checkout', 'plan', 'cost'],
    'blog': ['blog', 'Blog', 'content', 'articles', 'posts'],
    'login': ['login', 'Login', 'auth', 'authentication', 'signin', 'replit'],
    'checkout': ['checkout', 'Checkout', 'simple-checkout', 'payment-success', 'thank-you'],
    
    // POST-LOGIN CORE FEATURES (Member Area)
    'workspace': ['workspace', 'Workspace', 'dashboard', 'member', 'studio', 'home', 'main'],
    'train': ['SimpleTraining', 'simple-training', 'ai-training', 'model-training', 'replicate', 'flux', 'lora', 'user_models', 'training'],
    'style': ['Maya', 'maya', 'styling', 'fashion', 'aesthetic', 'maya_chat', 'maya-chat', 'style-guide', 'brand', 'personal-brand'],
    'gallery': ['SSELFIEGallery', 'sselfie-gallery', 'ai_images', 'generated_images', 'photo', 'image', 'collection'],
    'build': ['Build', 'build', 'Victoria', 'victoria', 'victoria-builder', 'victoria-preview', 'website', 'landing-page', 'builder'],
    
    // BUILD WORKSPACE COMPONENTS
    'victoria': ['Victoria', 'victoria', 'victoria-chat', 'victoria-builder', 'victoria-preview', 'website-builder', 'landing-pages'],
    'website': ['website', 'landing-page', 'builder', 'preview', 'domain', 'publish', 'site'],
    'photoshoot': ['ai-photoshoot', 'sandra-photoshoot', 'AIPhotoshoot', 'generation', 'custom-photoshoot'],
    
    // UI/UX Components
    'component': ['components', 'ui', 'tsx', 'jsx', 'button', 'form', 'modal', 'interface'],
    'page': ['pages', 'route', 'App.tsx', 'navigation', 'routing', 'view'],
    'navigation': ['MemberNavigation', 'nav', 'menu', 'header', 'sidebar', 'link'],
    
    // Backend Systems
    'api': ['routes', 'server', 'endpoint', 'api', 'express', 'backend', 'service'],
    'database': ['schema', 'drizzle', 'postgres', 'table', 'sql', 'db', 'data'],
    'auth': ['authentication', 'login', 'user', 'session', 'replit', 'protected'],
    
    // Business & Admin
    'admin': ['admin', 'consulting-agents', 'elena', 'coordination', 'agent', 'management'],
    'business': ['model', 'strategy', 'launch', 'revenue', 'plan', 'overview'],
    'onboarding': ['onboarding', 'brand-onboarding', 'welcome', 'setup', 'questionnaire'],
    
    // Technical Infrastructure
    'service': ['service', 'utility', 'helper', 'tool', 'function', 'integration'],
    'config': ['config', 'setup', 'environment', 'settings', 'deployment'],
    'flow': ['flow', 'workflow', 'process', 'journey', 'funnel', 'experience']
  };
  
  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'how', 'what', 'where', 'when', 'why', 'show', 'find', 'search', 'get', 'look', 'see', 'view', 'read', 'content', 'file', 'page', 'current', 'status', 'implementation', 'please', 'help'];
  
  // Extract base terms
  const baseTerms = description
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  // Expand with semantic mappings
  const expandedTerms = new Set<string>();
  
  for (const term of baseTerms) {
    expandedTerms.add(term);
    
    // Add semantic mappings
    for (const [key, mappings] of Object.entries(sselfieKeywordMap)) {
      if (term.includes(key) || key.includes(term)) {
        mappings.forEach(mapping => expandedTerms.add(mapping));
      }
    }
  }
  
  // Convert back to array and prioritize
  const finalTerms = Array.from(expandedTerms)
    .sort((a, b) => {
      // Prioritize longer, more specific terms
      if (a.length !== b.length) return b.length - a.length;
      // Prioritize exact matches from the original query
      if (baseTerms.includes(a) && !baseTerms.includes(b)) return -1;
      if (baseTerms.includes(b) && !baseTerms.includes(a)) return 1;
      return 0;
    })
    .slice(0, 8); // Increased to 8 terms for better coverage
  
  console.log(`🧠 SEMANTIC EXPANSION: "${description}" → [${finalTerms.join(', ')}]`);
  return finalTerms;
}

// INTELLIGENT FILE DISCOVERY: Find related files based on semantic context
async function discoverRelatedFiles(searchTerms: string[], workspaceRoot: string): Promise<string[]> {
  const relatedFiles = new Set<string>();
  
  // SSELFIE STUDIO COMPLETE FILE RELATIONSHIP MAP
  const fileRelationships = {
    // PRE-LOGIN PAGES (Public Website)
    'editorial-landing': [`${workspaceRoot}/client/src/pages/editorial-landing.tsx`, `${workspaceRoot}/client/src/pages/landing.tsx`],
    'about': [`${workspaceRoot}/client/src/pages/about.tsx`, `${workspaceRoot}/client/src/pages/AboutPage.tsx`],
    'how-it-works': [`${workspaceRoot}/client/src/pages/how-it-works.tsx`],
    'pricing': [`${workspaceRoot}/client/src/pages/pricing.tsx`],
    'blog': [`${workspaceRoot}/client/src/pages/blog.tsx`],
    'login': [`${workspaceRoot}/client/src/pages/login.tsx`, `${workspaceRoot}/server/replitAuth.ts`, `${workspaceRoot}/server/auth`],
    'checkout': [`${workspaceRoot}/client/src/pages/checkout.tsx`, `${workspaceRoot}/client/src/pages/simple-checkout.tsx`, `${workspaceRoot}/client/src/pages/payment-success.tsx`, `${workspaceRoot}/client/src/pages/thank-you.tsx`],
    
    // POST-LOGIN CORE FEATURES (Member Workspace)
    'workspace': [`${workspaceRoot}/client/src/pages/workspace.tsx`, `${workspaceRoot}/client/src/components/member-navigation.tsx`],
    'SimpleTraining': [`${workspaceRoot}/client/src/pages/simple-training.tsx`, `${workspaceRoot}/client/src/pages/ai-training.tsx`, `${workspaceRoot}/client/src/components/training`, `${workspaceRoot}/server/routes/*training*`],
    'Maya': [`${workspaceRoot}/client/src/pages/maya.tsx`, `${workspaceRoot}/client/src/components/maya`, `${workspaceRoot}/server/routes/*maya*`],
    'SSELFIEGallery': [`${workspaceRoot}/client/src/pages/sselfie-gallery.tsx`, `${workspaceRoot}/client/src/components/gallery`, `${workspaceRoot}/server/routes/*gallery*`],
    
    // BUILD WORKSPACE (Victoria & Website Builder)
    'Build': [`${workspaceRoot}/client/src/pages/build.tsx`],
    'Victoria': [`${workspaceRoot}/client/src/pages/victoria.tsx`, `${workspaceRoot}/client/src/pages/victoria-chat.tsx`, `${workspaceRoot}/client/src/pages/victoria-builder.tsx`, `${workspaceRoot}/client/src/pages/victoria-preview.tsx`, `${workspaceRoot}/client/src/components/victoria`],
    'website-builder': [`${workspaceRoot}/client/src/pages/victoria-builder.tsx`, `${workspaceRoot}/client/src/pages/victoria-preview.tsx`, `${workspaceRoot}/client/src/components/website`, `${workspaceRoot}/server/routes/*website*`],
    'photoshoot': [`${workspaceRoot}/client/src/pages/ai-photoshoot.tsx`, `${workspaceRoot}/client/src/pages/sandra-photoshoot.tsx`, `${workspaceRoot}/client/src/pages/custom-photoshoot-library.tsx`],
    
    // UI/UX Components
    'components': [`${workspaceRoot}/client/src/components`, `${workspaceRoot}/client/src/components/ui`],
    'pages': [`${workspaceRoot}/client/src/pages`, `${workspaceRoot}/client/src/App.tsx`],
    'navigation': [`${workspaceRoot}/client/src/components/member-navigation.tsx`, `${workspaceRoot}/client/src/components/navigation`],
    
    // Backend Systems
    'api': [`${workspaceRoot}/server/routes`, `${workspaceRoot}/server/index.ts`],
    'database': [`${workspaceRoot}/shared/schema.ts`, `${workspaceRoot}/server/db`, `${workspaceRoot}/drizzle`],
    'auth': [`${workspaceRoot}/server/replitAuth.ts`, `${workspaceRoot}/server/auth`],
    
    // Business & Admin
    'business': [`${workspaceRoot}/*.md`, `${workspaceRoot}/docs`, `${workspaceRoot}/infrastructure/docs`],
    'admin': [`${workspaceRoot}/client/src/pages/admin*`, `${workspaceRoot}/server/agents`, `${workspaceRoot}/server/routes/consulting-agents*`],
    'onboarding': [`${workspaceRoot}/client/src/pages/onboarding.tsx`, `${workspaceRoot}/client/src/pages/brand-onboarding.tsx`, `${workspaceRoot}/client/src/pages/welcome.tsx`]
  };
  
  // Add related files based on search terms
  for (const term of searchTerms) {
    for (const [key, paths] of Object.entries(fileRelationships)) {
      if (term.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(term.toLowerCase())) {
        paths.forEach(path => relatedFiles.add(path));
      }
    }
  }
  
  return Array.from(relatedFiles);
}

// IMPORT RELATIONSHIP DISCOVERY: Find files that import/export related functionality
async function findFileImports(searchTerms: string[], workspaceRoot: string): Promise<string[]> {
  const importResults: string[] = [];
  
  try {
    // Search for import statements related to search terms
    for (const term of searchTerms.slice(0, 3)) {
      const importSearch = await executeGrep(`import.*${term}|from.*${term}`, [`${workspaceRoot}/client/src`, `${workspaceRoot}/server`]);
      if (importSearch && importSearch !== 'No matches found') {
        importResults.push(`Import references for "${term}":\n${importSearch.substring(0, 500)}`);
      }
    }
  } catch (error) {
    console.log('Import search failed:', error);
  }
  
  return importResults;
}

function oldExtractSearchTerms(description: string): string[] {
  const words = description.toLowerCase().split(/\s+/);
  return words.filter(word => 
    word.length > 2 && 
    !['find', 'search', 'look', 'locate', 'get', 'show', 'display', 'any', 'all'].includes(word)
  ).slice(0, 3); // Limit to 3 terms max
}