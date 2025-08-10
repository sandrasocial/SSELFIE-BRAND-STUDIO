/**
 * FILESYSTEM SEARCH TOOL
 * Search through project files and directories
 */

import fs from 'fs/promises';
import path from 'path';

export async function search_filesystem(parameters: any): Promise<any> {
  console.log('🔍 FILESYSTEM SEARCH:', parameters);
  
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

    // If query description provided, use intelligent search
    if (query_description) {
      const searchTerms = extractSearchTerms(query_description);
      for (const term of searchTerms) {
        const grepResult = await executeGrep(term, search_paths);
        results += `\n=== Searching for: "${term}" ===\n${grepResult}`;
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

// Extract meaningful search terms from description
function extractSearchTerms(description: string): string[] {
  // Simple term extraction - can be enhanced
  const words = description.toLowerCase().split(/\s+/);
  return words.filter(word => 
    word.length > 3 && 
    !['find', 'search', 'look', 'locate', 'get', 'show', 'display'].includes(word)
  );
}