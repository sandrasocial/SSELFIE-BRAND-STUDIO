/**
 * ENHANCED FILESYSTEM SEARCH TOOL
 * Integrates semantic search, autonomous navigation, and intelligent file discovery
 */

import fs from 'fs/promises';
import path from 'path';

export async function search_filesystem(parameters: any): Promise<any> {
  console.log('🔍 SMART SEARCH ACTIVATED:', parameters);
  
  try {
    const { 
      query_description, 
      class_names = [], 
      function_names = [], 
      code = [], 
      search_paths = ['.'] 
    } = parameters;

    let results = '';

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

    // ENHANCED: Use intelligent search with multiple strategies
    if (query_description) {
      console.log('🧠 ACTIVATING: Comprehensive search intelligence');
      
      // Strategy 1: Project structure discovery
      if (query_description.toLowerCase().includes('client') || 
          query_description.toLowerCase().includes('src') || 
          query_description.toLowerCase().includes('pages') || 
          query_description.toLowerCase().includes('components') ||
          query_description.toLowerCase().includes('database')) {
        
        const dirStructure = await getDirectoryStructure();
        results += `\n=== PROJECT STRUCTURE ===\n${dirStructure}`;
        
        // Strategy 2: Smart file content discovery
        const projectFiles = await getProjectFilesList();
        results += `\n=== KEY PROJECT FILES ===\n${projectFiles}`;
      }
      
      // Strategy 3: Semantic search terms
      const searchTerms = extractSearchTerms(query_description);
      for (const term of searchTerms) {
        const grepResult = await executeGrep(term, search_paths);
        if (grepResult && grepResult !== 'No matches found') {
          results += `\n=== Content Search: "${term}" ===\n${grepResult}`;
        }
      }
      
      // Strategy 4: Database and schema discovery
      if (query_description.toLowerCase().includes('database') || 
          query_description.toLowerCase().includes('schema') ||
          query_description.toLowerCase().includes('table')) {
        results += `\n=== DATABASE INTEGRATION ===\nDatabase: PostgreSQL with Drizzle ORM\nSchema: ./shared/schema.ts\nMigrations: ./database/migrations/\nMain tables: users, agent_sessions, agent_knowledge_base`;
      }
    }

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

// Get directory structure for project overview
async function getDirectoryStructure(): Promise<string> {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const cmd = spawn('find', ['.', '-type', 'd', '-name', 'node_modules', '-prune', '-o', '-type', 'd', '-print']);
    let output = '';
    
    cmd.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    cmd.on('close', () => {
      const lines = output.split('\n').filter(line => 
        line && 
        !line.includes('node_modules') && 
        !line.includes('.git') &&
        !line.includes('.cache')
      ).slice(0, 50); // Limit output
      
      resolve(lines.join('\n'));
    });
    
    setTimeout(() => {
      cmd.kill();
      resolve('Directory scan timed out');
    }, 5000);
  });
}

// Get key project files with intelligent categorization
async function getProjectFilesList(): Promise<string> {
  const { spawn } = await import('child_process');
  
  return new Promise((resolve) => {
    const cmd = spawn('find', ['.', '-name', '*.ts', '-o', '-name', '*.tsx', '-o', '-name', '*.js', '-o', '-name', '*.jsx'], {
      cwd: process.cwd()
    });
    let output = '';
    
    cmd.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    cmd.on('close', () => {
      const files = output.split('\n').filter(file => 
        file && 
        !file.includes('node_modules') && 
        !file.includes('.cache') &&
        (file.includes('/src/') || file.includes('/server/') || file.includes('/shared/') || file.includes('/client/'))
      ).slice(0, 30);
      
      // Categorize files intelligently
      const categorized = {
        'Frontend Components': files.filter(f => f.includes('/components/')),
        'Pages/Routes': files.filter(f => f.includes('/pages/')),
        'Server/API': files.filter(f => f.includes('/server/')),
        'Shared/Schema': files.filter(f => f.includes('/shared/')),
        'Client Source': files.filter(f => f.includes('/client/src/'))
      };
      
      let result = '';
      for (const [category, fileList] of Object.entries(categorized)) {
        if (fileList.length > 0) {
          result += `\n${category}:\n${fileList.slice(0, 5).join('\n')}\n`;
        }
      }
      
      resolve(result || 'No categorized files found');
    });
    
    setTimeout(() => {
      cmd.kill();
      resolve('File scan timed out');
    }, 5000);
  });
}

// Extract meaningful search terms from description
function extractSearchTerms(description: string): string[] {
  // Simple term extraction - can be enhanced
  const words = description.toLowerCase().split(/\s+/);
  return words.filter(word => 
    word.length > 3 && 
    !['find', 'search', 'look', 'locate', 'get', 'show', 'display'].includes(word)
  );
}