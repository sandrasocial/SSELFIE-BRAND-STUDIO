const fs = require('fs').promises;
const path = require('path');

/**
 * Tool for searching the filesystem for files, classes, functions, or code snippets
 * Replicates the functionality of the main search_filesystem tool
 */
async function search_filesystem(params) {
  const { query_description, class_names = [], function_names = [], code = [] } = params;
  
  const results = {
    files: [],
    matches: []
  };
  
  try {
    // Start from project root
    const rootDir = process.cwd();
    
    // Search for files and content
    await searchDirectory(rootDir, results, {
      query: query_description,
      classNames: class_names,
      functionNames: function_names,
      codeSnippets: code
    });
    
    return {
      summary: `Found ${results.matches.length} matches across ${results.files.length} files`,
      files: results.files.slice(0, 20), // Limit to first 20 files
      matches: results.matches.slice(0, 50) // Limit to first 50 matches
    };
    
  } catch (error) {
    console.error('search_filesystem error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

async function searchDirectory(dir, results, searchParams, depth = 0) {
  if (depth > 4) return; // Limit recursion depth
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (shouldSkip(entry.name)) continue;
      
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await searchDirectory(fullPath, results, searchParams, depth + 1);
      } else if (entry.isFile() && isSearchableFile(entry.name)) {
        await searchFile(fullPath, results, searchParams);
      }
    }
  } catch (error) {
    // Skip directories we can't read
    console.warn(`Could not read directory ${dir}:`, error.message);
  }
}

async function searchFile(filePath, results, searchParams) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    let hasMatches = false;
    const fileMatches = [];
    
    // Search for query description terms
    if (searchParams.query) {
      const queryTerms = searchParams.query.toLowerCase().split(/\s+/);
      const contentLower = content.toLowerCase();
      
      queryTerms.forEach(term => {
        if (contentLower.includes(term)) {
          hasMatches = true;
          fileMatches.push({
            type: 'query_match',
            term: term,
            file: relativePath
          });
        }
      });
    }
    
    // Search for class names
    searchParams.classNames.forEach(className => {
      const classRegex = new RegExp(`class\\s+${className}|interface\\s+${className}|type\\s+${className}`, 'gi');
      const matches = content.match(classRegex);
      if (matches) {
        hasMatches = true;
        fileMatches.push({
          type: 'class',
          name: className,
          file: relativePath,
          matches: matches.length
        });
      }
    });
    
    // Search for function names
    searchParams.functionNames.forEach(funcName => {
      const funcRegex = new RegExp(`function\\s+${funcName}|const\\s+${funcName}\\s*=|${funcName}\\s*\\(`, 'gi');
      const matches = content.match(funcRegex);
      if (matches) {
        hasMatches = true;
        fileMatches.push({
          type: 'function',
          name: funcName,
          file: relativePath,
          matches: matches.length
        });
      }
    });
    
    // Search for code snippets
    searchParams.codeSnippets.forEach(codeSnippet => {
      if (content.includes(codeSnippet)) {
        hasMatches = true;
        fileMatches.push({
          type: 'code',
          snippet: codeSnippet.substring(0, 100) + '...',
          file: relativePath
        });
      }
    });
    
    if (hasMatches) {
      results.files.push(relativePath);
      results.matches.push(...fileMatches);
      
      // Add file content preview for relevant files
      if (fileMatches.length > 0) {
        const lines = content.split('\n');
        const preview = lines.slice(0, 20).join('\n');
        
        results.matches.push({
          type: 'file_content',
          file: relativePath,
          preview: preview + (lines.length > 20 ? '\n...[truncated]' : ''),
          total_lines: lines.length
        });
      }
    }
    
  } catch (error) {
    // Skip files we can't read
    console.warn(`Could not read file ${filePath}:`, error.message);
  }
}

function shouldSkip(name) {
  const skipDirs = [
    'node_modules', '.git', '.next', 'dist', 'build', '.cache',
    'coverage', '.nyc_output', 'logs', 'temp', 'tmp', '.DS_Store',
    'archive', 'agent-backups'
  ];
  
  return skipDirs.includes(name) || name.startsWith('.');
}

function isSearchableFile(filename) {
  const searchableExts = [
    '.js', '.jsx', '.ts', '.tsx', '.json', '.md', '.txt',
    '.css', '.scss', '.html', '.vue', '.py', '.java',
    '.go', '.rs', '.php', '.rb', '.swift', '.kt'
  ];
  
  const ext = path.extname(filename);
  return searchableExts.includes(ext);
}

module.exports = { search_filesystem };