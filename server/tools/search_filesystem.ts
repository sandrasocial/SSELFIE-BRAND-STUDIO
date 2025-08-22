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
      search_paths = ['.'] 
    } = parameters;

    let results = '';

    // AGENT-FRIENDLY PROJECT STATUS - Direct and Clear
    const projectOverview = await getProjectOverview();
    const dirStructure = await getBasicDirectoryListing();
    
    // SHOW CURRENT WORKING DIRECTORY FOR DEBUG
    console.log('🔍 AGENT WORKING DIRECTORY:', process.cwd());
    
    results += `🚀 SSELFIE STUDIO PROJECT - CURRENT IMPLEMENTATION STATUS\n`;
    results += `✅ BUSINESS MODEL: Pre-login + Post-login workspace (TRAIN-STYLE-SHOOT-BUILD) + Gallery\n\n`;
    results += `📱 CURRENT LIVE STRUCTURE:\n`;
    results += `✅ Pre-login: Editorial landing (/), about, pricing, blog, login\n`;
    results += `✅ Post-login: Workspace (/workspace) with 4-phase journey:\n`;
    results += `   • TRAIN: /ai-training (SimpleTraining component)\n`;
    results += `   • STYLE: /maya (Maya AI stylist component)\n`;
    results += `   • SHOOT: /ai-photoshoot (AIPhotoshoot component)\n`;
    results += `   • BUILD: /build (Build component)\n`;
    results += `✅ SSELFIE GALLERY: /gallery, /sselfie-gallery (SSELFIEGallery component)\n\n`;
    results += `⚠️  CRITICAL: Look at client/src/App.tsx for current routing, not old documentation!\n\n`;
    results += `📁 COMPLETE DIRECTORY STRUCTURE:\n${dirStructure}\n`;
    results += `📋 PROJECT ARCHITECTURE:\n${projectOverview}\n\n`;
    results += `🎯 AGENT ACCESS: You have complete visibility and can edit all files.\n`;
    results += `🔧 TOOLS AVAILABLE: Use str_replace_based_edit_tool for file access, bash for commands.\n`;

    // If specific code snippets are provided, search for them
    if (code.length > 0) {
      for (const codeSnippet of code) {
        const grepResult = await executeGrep(codeSnippet, search_paths);
        results += `\n=== Searching for code: "${codeSnippet}" ===\n${grepResult}`;
      }
    }

    // If class names are provided, search for them
    if (class_names.length > 0) {
      for (const className of class_names) {
        const grepResult = await executeGrep(`class ${className}`, search_paths);
        results += `\n=== Searching for class: "${className}" ===\n${grepResult}`;
      }
    }

    // If function names are provided, search for them
    if (function_names.length > 0) {
      for (const funcName of function_names) {
        const grepResult = await executeGrep(`function ${funcName}\\|${funcName}\\s*[=:]`, search_paths);
        results += `\n=== Searching for function: "${funcName}" ===\n${grepResult}`;
      }
    }

    // Enhanced search for query descriptions
    if (query_description) {
      // ADMIN AGENTS: Direct file content access for specific queries
      if (query_description.toLowerCase().includes('about') || query_description.toLowerCase().includes('story')) {
        const aboutFiles = await getSpecificFileContent([
          'client/src/pages/AboutPage.tsx',
          'client/src/pages/about.tsx', 
          'client/src/components/editorial-story.tsx',
          'client/src/components/welcome-section.tsx',
          'client/src/components/welcome-editorial.tsx'
        ]);
        results += `\n🔍 SANDRA'S STORY & ABOUT PAGE CONTENT:\n${aboutFiles}\n`;
      }
      
      if (query_description.toLowerCase().includes('how') || query_description.toLowerCase().includes('works')) {
        const howItWorksContent = await getSpecificFileContent([
          'client/src/pages/how-it-works.tsx'
        ]);
        results += `\n🔍 HOW IT WORKS PAGE CONTENT:\n${howItWorksContent}\n`;
      }
      
      if (query_description.toLowerCase().includes('pricing') || query_description.toLowerCase().includes('plan')) {
        const pricingContent = await getSpecificFileContent([
          'client/src/pages/pricing.tsx',
          'client/src/components/pricing'
        ]);
        results += `\n🔍 PRICING CONTENT:\n${pricingContent}\n`;
      }
      
      // Basic content search for specific terms
      const searchTerms = extractSearchTerms(query_description);
      for (const term of searchTerms) {
        const grepResult = await executeGrep(term, search_paths);
        if (grepResult && grepResult !== 'No matches found') {
          results += `\n=== Found: "${term}" ===\n${grepResult.substring(0, 1000)}`;
        }
      }
    }

    console.log('🔍 SEARCH RESULTS LENGTH:', results.length);
    return results || 'No results found for the search criteria.';

  } catch (error) {
    console.error('❌ FILESYSTEM SEARCH ERROR:', error);
    throw error;
  }
}

// Execute grep command safely
async function executeGrep(searchTerm: string, searchPaths: string[]): Promise<string> {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const pathArgs = searchPaths.length > 0 ? searchPaths : ['.'];
    const cmd = spawn('grep', ['-r', '-n', '-i', '--include=*.ts', '--include=*.js', '--include=*.tsx', '--include=*.jsx', searchTerm, ...pathArgs]);
    
    let output = '';
    let errorOutput = '';
    
    cmd.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    cmd.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    cmd.on('close', (code) => {
      // ADMIN AGENTS: NO OUTPUT TRUNCATION - FULL RESULTS
      resolve(output || 'No matches found');
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      cmd.kill();
      resolve('Search timed out');
    }, 10000);
  });
}

// GET SPECIFIC FILE CONTENT FOR ADMIN AGENTS
async function getSpecificFileContent(filePaths: string[]): Promise<string> {
  const fs = await import('fs/promises');
  const path = await import('path');
  let content = '';
  
  for (const filePath of filePaths) {
    try {
      const fullPath = path.resolve(filePath);
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      content += `\n📄 FILE: ${filePath}\n${fileContent.substring(0, 2000)}\n${'='.repeat(50)}\n`;
    } catch (error) {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  }
  
  return content;
}

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

// Extract search terms from description
function extractSearchTerms(description: string): string[] {
  const words = description.toLowerCase().split(/\s+/);
  return words.filter(word => 
    word.length > 2 && 
    !['find', 'search', 'look', 'locate', 'get', 'show', 'display', 'any', 'all'].includes(word)
  ).slice(0, 3); // Limit to 3 terms max
}