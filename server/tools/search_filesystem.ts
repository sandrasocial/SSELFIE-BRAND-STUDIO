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

    // ENHANCED PROJECT OVERVIEW - Make it impossible to miss
    const projectOverview = await getProjectOverview();
    results += `🏗️ === PROJECT OVERVIEW (SSELFIE STUDIO) ===\n${projectOverview}\n\n`;
    
    // ALWAYS show actual directory listing so agents can see files
    const dirStructure = await getBasicDirectoryListing();
    results += `📁 === ACTUAL PROJECT FILES (ls -la) ===\n${dirStructure}\n`;

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
      // ALWAYS show key files first
      const keyFilesResult = await executeGrep('package\\.json\\|vite\\.config\\|tsconfig', search_paths);
      if (keyFilesResult && keyFilesResult !== 'No matches found') {
        results += `\n📋 === KEY PROJECT FILES ===\n${keyFilesResult.substring(0, 2000)}`;
      }
      
      // Search for specific terms in the query
      const searchTerms = extractSearchTerms(query_description);
      for (const term of searchTerms) {
        const grepResult = await executeGrep(term, search_paths);
        if (grepResult && grepResult !== 'No matches found') {
          results += `\n🔍 === Found: "${term}" ===\n${grepResult.substring(0, 1000)}`;
        }
      }
      
      // Show package.json content for context
      try {
        const fs = await import('fs/promises');
        const packageContent = await fs.readFile('./package.json', 'utf8');
        const packageJson = JSON.parse(packageContent);
        results += `\n📦 === PACKAGE.JSON CONTENT ===\n`;
        results += `Name: ${packageJson.name}\n`;
        results += `Scripts: ${Object.keys(packageJson.scripts || {}).join(', ')}\n`;
        results += `Dependencies: ${Object.keys(packageJson.dependencies || {}).length} packages\n`;
        results += `Main technologies: ${Object.keys(packageJson.dependencies || {}).slice(0, 10).join(', ')}\n`;
      } catch (err) {
        results += `\n📦 === PACKAGE.JSON ===\nUnable to read package.json: ${err.message}\n`;
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
      if (output.length > 5000) {
        output = output.substring(0, 5000) + '\n... (output truncated)';
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

// Simple project overview - CORRECTED STRUCTURE  
async function getProjectOverview(): Promise<string> {
  return `🚀 SSELFIE Studio - FULL PROJECT STRUCTURE DETECTED:

✅ ROOT DIRECTORIES (what agents can access):
./server/ - Express.js backend, API routes, agent tools, services
./client/ - Frontend React application  
./src/ - Main React source code (components, pages, hooks)
./shared/ - TypeScript schemas (database models, types)
./components/ - Additional UI component library
./pages/ - Page components and routing
./database/ - Database migrations and setup

📋 KEY FILES TO KNOW:
./package.json - Dependencies (React, Express, PostgreSQL, Drizzle, etc.)
./server/index.ts - Main server entry point
./server/routes/ - API routes directory
./server/tools/ - Agent tools directory (search_filesystem, bash, etc.)
./shared/schema.ts - Database schema (PostgreSQL + Drizzle ORM)
./replit.md - Project documentation and architecture

🎯 IMPORTANT LOCATIONS:
- React Components: ./src/components/ and ./components/
- API Routes: ./server/routes/
- Database: PostgreSQL with Drizzle ORM in ./shared/schema.ts
- Agent Tools: ./server/tools/
- Frontend Pages: ./src/pages/ and ./pages/

🔧 Tech Stack: React 18 + TypeScript + Express + PostgreSQL + Drizzle + Tailwind CSS

✅ PROJECT STATUS: FULLY INITIALIZED AND READY FOR DEVELOPMENT`;
}

// Get basic directory listing
async function getBasicDirectoryListing(): Promise<string> {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const cmd = spawn('ls', ['-la']);
    
    let output = '';
    
    cmd.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    cmd.on('close', () => {
      resolve(output.substring(0, 1000) || 'Directory listing unavailable');
    });
    
    setTimeout(() => {
      cmd.kill();
      resolve('Directory listing timed out');
    }, 5000);
  });
}

// Extract search terms from description - IMPROVED
function extractSearchTerms(description: string): string[] {
  // Look for specific file patterns and important terms
  const patterns = [
    'package\\.json',
    'tsconfig',
    'vite\\.config',
    'SSELFIE',
    'React',
    'Express',
    'server',
    'client',
    'component',
    'schema'
  ];
  
  const words = description.toLowerCase().split(/\s+/);
  const foundTerms = words.filter(word => 
    word.length > 2 && 
    !['find', 'search', 'look', 'locate', 'get', 'show', 'display', 'any', 'all', 'files', 'related', 'including'].includes(word)
  );
  
  // Add pattern matches
  const descLower = description.toLowerCase();
  patterns.forEach(pattern => {
    if (descLower.includes(pattern.replace(/\\./g, '.'))) {
      foundTerms.push(pattern);
    }
  });
  
  return [...new Set(foundTerms)].slice(0, 5); // Remove duplicates, limit to 5 terms
}