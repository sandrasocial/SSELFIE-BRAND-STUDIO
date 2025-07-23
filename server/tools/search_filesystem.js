import fs from 'fs';
import path from 'path';

/**
 * Search filesystem for files, classes, functions, or code snippets
 * This tool allows Elena to analyze the actual codebase for strategic planning
 */
export async function search_filesystem(input) {
  const { query_description, class_names = [], function_names = [], code = [] } = input;
  
  console.log('🔍 SEARCH_FILESYSTEM: Searching codebase with query:', query_description);
  
  const results = {
    files_found: [],
    classes_found: [],
    functions_found: [],
    code_snippets: [],
    analysis_summary: ''
  };
  
  // Define search directories
  const searchDirs = [
    'client/src',
    'server', 
    'shared',
    '.' // root for config files
  ];
  
  // File extensions to search
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css'];
  
  try {
    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        await searchDirectory(dir, extensions, results, query_description, class_names, function_names, code);
      }
    }
    
    // Generate analysis summary
    results.analysis_summary = generateAnalysisSummary(results, query_description);
    
    console.log('✅ SEARCH_FILESYSTEM: Found', results.files_found.length, 'relevant files');
    return results;
    
  } catch (error) {
    console.error('❌ SEARCH_FILESYSTEM ERROR:', error);
    return {
      error: error.message,
      files_found: [],
      classes_found: [],
      functions_found: [],
      code_snippets: [],
      analysis_summary: `Search failed: ${error.message}`
    };
  }
}

async function searchDirectory(dir, extensions, results, query, classNames, functionNames, codeSnippets, level = 0) {
  if (level > 3) return; // Prevent deep recursion
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      // Skip common ignore patterns
      if (item.startsWith('.') || item === 'node_modules' || item === 'dist' || item === 'build') {
        continue;
      }
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await searchDirectory(fullPath, extensions, results, query, classNames, functionNames, codeSnippets, level + 1);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          await searchFile(fullPath, results, query, classNames, functionNames, codeSnippets);
        }
      }
    }
  } catch (error) {
    console.error('Error searching directory:', dir, error);
  }
}

async function searchFile(filePath, results, query, classNames, functionNames, codeSnippets) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let isRelevant = false;
    
    // Check for query terms (case insensitive)
    if (query) {
      const queryTerms = query.toLowerCase().split(/\s+/);
      const contentLower = content.toLowerCase();
      isRelevant = queryTerms.some(term => contentLower.includes(term));
    }
    
    // Search for specific classes
    for (const className of classNames) {
      if (content.includes(className)) {
        results.classes_found.push({
          class: className,
          file: filePath,
          context: extractContext(content, className)
        });
        isRelevant = true;
      }
    }
    
    // Search for specific functions
    for (const functionName of functionNames) {
      const functionRegex = new RegExp(`(function|const|let|var)\\s+${functionName}|${functionName}\\s*[:=]\\s*\\(|${functionName}\\s*\\(`, 'g');
      if (functionRegex.test(content)) {
        results.functions_found.push({
          function: functionName,
          file: filePath,
          context: extractContext(content, functionName)
        });
        isRelevant = true;
      }
    }
    
    // Search for code snippets
    for (const snippet of codeSnippets) {
      if (content.includes(snippet)) {
        results.code_snippets.push({
          snippet: snippet,
          file: filePath,
          context: extractContext(content, snippet)
        });
        isRelevant = true;
      }
    }
    
    // If file is relevant, add to results
    if (isRelevant) {
      results.files_found.push({
        path: filePath,
        size: content.length,
        lines: lines.length,
        preview: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
        key_features: extractKeyFeatures(content, filePath)
      });
    }
    
  } catch (error) {
    console.error('Error reading file:', filePath, error);
  }
}

function extractContext(content, searchTerm) {
  const lines = content.split('\n');
  const contextLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchTerm)) {
      const start = Math.max(0, i - 2);
      const end = Math.min(lines.length, i + 3);
      return lines.slice(start, end).join('\n');
    }
  }
  
  return content.substring(0, 200) + '...';
}

function extractKeyFeatures(content, filePath) {
  const features = [];
  
  // Check for React components
  if (content.includes('export default') && (content.includes('function') || content.includes('const'))) {
    features.push('React Component');
  }
  
  // Check for API endpoints
  if (content.includes('app.get') || content.includes('app.post') || content.includes('app.put') || content.includes('app.delete')) {
    features.push('API Endpoints');
  }
  
  // Check for database schemas
  if (content.includes('createTable') || content.includes('pgTable') || content.includes('drizzle')) {
    features.push('Database Schema');
  }
  
  // Check for authentication
  if (content.includes('auth') || content.includes('login') || content.includes('session')) {
    features.push('Authentication');
  }
  
  // Check for payment processing
  if (content.includes('stripe') || content.includes('payment') || content.includes('billing')) {
    features.push('Payment Processing');
  }
  
  // Check for deployment configs
  if (filePath.includes('vercel') || filePath.includes('deploy') || content.includes('build')) {
    features.push('Deployment Configuration');
  }
  
  return features;
}

function generateAnalysisSummary(results, query) {
  const fileCount = results.files_found.length;
  const classCount = results.classes_found.length;
  const functionCount = results.functions_found.length;
  
  let summary = `CODEBASE ANALYSIS RESULTS for "${query}":\n\n`;
  
  summary += `📊 OVERVIEW:\n`;
  summary += `- Found ${fileCount} relevant files\n`;
  summary += `- Found ${classCount} matching classes\n`;
  summary += `- Found ${functionCount} matching functions\n\n`;
  
  if (results.files_found.length > 0) {
    summary += `🔍 KEY FILES DISCOVERED:\n`;
    results.files_found.slice(0, 10).forEach(file => {
      summary += `- ${file.path} (${file.lines} lines) - ${file.key_features.join(', ')}\n`;
    });
    summary += '\n';
  }
  
  // Analyze architecture patterns
  const allFeatures = results.files_found.flatMap(f => f.key_features);
  const featureCounts = {};
  allFeatures.forEach(feature => {
    featureCounts[feature] = (featureCounts[feature] || 0) + 1;
  });
  
  if (Object.keys(featureCounts).length > 0) {
    summary += `🏗️ ARCHITECTURE ANALYSIS:\n`;
    Object.entries(featureCounts).forEach(([feature, count]) => {
      summary += `- ${feature}: ${count} files\n`;
    });
    summary += '\n';
  }
  
  return summary;
}