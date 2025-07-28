import fs from 'fs/promises';
import path from 'path';
import { performSafetyCheck, safeFileModification } from './file_safety_guard';

interface VerificationResult {
  success: boolean;
  message: string;
  beforeHash?: string;
  afterHash?: string;
  changesSummary?: string;
}

interface ModificationResult {
  success: boolean;
  message: string;
  verification?: VerificationResult;
  beforeContent?: string;
  afterContent?: string;
}

interface DebugAnalysisResult {
  syntaxValid: boolean;
  dependencies: string[];
  patterns: string[];
  issues: string[];
  suggestions: string[];
}

interface SearchResult {
  file: string;
  line: number;
  context: string;
  match: string;
}

export interface ComprehensiveToolParams {
  command: 'view' | 'create' | 'str_replace' | 'insert' | 'line_replace' | 'section_replace' | 
           'multi_replace' | 'verify_modification' | 'analyze_file' | 'search_patterns' | 
           'safe_test' | 'emergency_revert' | 'dependency_analysis';
  path: string;
  
  // Basic editing parameters
  file_text?: string;
  old_str?: string;
  new_str?: string;
  insert_line?: number;
  insert_text?: string;
  line_number?: number;
  line_content?: string;
  start_line?: number;
  end_line?: number;
  section_content?: string;
  view_range?: [number, number];
  
  // Enhanced functionality parameters
  patterns?: string[];
  search_term?: string;
  replacements?: Array<{
    old: string;
    new: string;
  }>;
  
  // Verification parameters
  verify_before?: boolean;
  verify_after?: boolean;
  create_backup?: boolean;
  
  // Analysis parameters
  analyze_syntax?: boolean;
  analyze_dependencies?: boolean;
  analyze_patterns?: boolean;
}

/**
 * COMPREHENSIVE AGENT TOOLKIT
 * Enterprise-grade file editing with verification, recovery, and analysis capabilities
 */
export async function comprehensive_agent_toolkit(params: ComprehensiveToolParams): Promise<string> {
  try {
    console.log('🚀 COMPREHENSIVE AGENT TOOLKIT: Starting operation:', {
      command: params.command,
      path: params.path,
      verificationEnabled: params.verify_before || params.verify_after
    });
    
    const absolutePath = path.resolve(params.path);
    
    // Security check - ensure path is within project
    const projectRoot = process.cwd();
    if (!absolutePath.startsWith(projectRoot)) {
      throw new Error('Access denied: Path outside project directory');
    }
    
    // Execute the requested command
    switch (params.command) {
      case 'view':
        return await enhancedViewFile(absolutePath, params.view_range);
        
      case 'create':
        return await verifiedCreateFile(absolutePath, params.file_text!, params);
        
      case 'str_replace':
        return await verifiedStringReplace(absolutePath, params.old_str!, params.new_str || '', params);
        
      case 'insert':
        return await verifiedInsert(absolutePath, params.insert_line!, params.insert_text!, params);
        
      case 'line_replace':
        return await verifiedLineReplace(absolutePath, params.line_number!, params.line_content!, params);
        
      case 'section_replace':
        return await verifiedSectionReplace(absolutePath, params.start_line!, params.end_line!, params.section_content!, params);
        
      case 'multi_replace':
        return await verifiedMultiReplace(absolutePath, params.replacements!, params);
        
      case 'verify_modification':
        return await verifyModification(absolutePath, params);
        
      case 'analyze_file':
        return await analyzeFile(absolutePath, params);
        
      case 'search_patterns':
        return await searchPatterns(absolutePath, params.patterns || [params.search_term!], params);
        
      case 'safe_test':
        return await safeTestModification(absolutePath, params);
        
      case 'emergency_revert':
        return await emergencyRevert(absolutePath);
        
      case 'dependency_analysis':
        return await dependencyAnalysis(absolutePath);
        
      default:
        throw new Error(`Unknown command: ${params.command}`);
    }
    
  } catch (error) {
    console.error('❌ COMPREHENSIVE TOOLKIT ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Comprehensive toolkit operation failed: ${errorMessage}`);
  }
}

async function enhancedViewFile(filePath: string, viewRange?: [number, number]): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let displayLines: string[];
    let rangeInfo = '';
    
    if (viewRange && Array.isArray(viewRange) && viewRange.length === 2) {
      const [start, end] = viewRange;
      const startLine = Math.max(1, start) - 1;
      const endLine = end === -1 ? lines.length : Math.min(lines.length, end);
      
      displayLines = lines.slice(startLine, endLine);
      rangeInfo = `Viewing lines ${start}-${endLine === lines.length ? 'end' : endLine} of ${lines.length}`;
    } else {
      displayLines = lines;
      rangeInfo = `Viewing entire file (${lines.length} lines)`;
    }
    
    const numberedLines = displayLines.map((line, index) => {
      const lineNumber = viewRange ? (viewRange[0] + index) : (index + 1);
      return `${lineNumber.toString().padStart(4)}\t${line}`;
    }).join('\n');
    
    // Enhanced view with file stats
    const stats = await fs.stat(filePath);
    const fileInfo = `File: ${filePath} | Size: ${stats.size} bytes | Modified: ${stats.mtime.toISOString()}`;
    
    return `Here's the result of running \`cat -n\` on ${viewRange ? 'a snippet of ' : ''}${filePath}:\n${fileInfo}\n${rangeInfo ? rangeInfo + '\n' : ''}${numberedLines}`;
    
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

async function verifiedCreateFile(filePath: string, content: string, params: ComprehensiveToolParams): Promise<string> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Pre-creation verification
    if (params.verify_before) {
      const syntaxCheck = await performSafetyCheck(filePath, content);
      if (!syntaxCheck.isValid) {
        throw new Error(`Pre-creation syntax validation failed: ${syntaxCheck.errors.join(', ')}`);
      }
    }
    
    // Use safe file modification with safety checks
    const createResult = await safeFileModification(filePath, content, {
      enableSyntaxCheck: true,
      enableBackup: params.create_backup || false
    });
    
    if (!createResult.success) {
      throw new Error(`Safe file creation failed: ${createResult.message}`);
    }
    
    // Post-creation verification
    let verification: VerificationResult | undefined;
    if (params.verify_after) {
      verification = await verifyFileContent(filePath, content);
    }
    
    return `✅ File created successfully: ${filePath}\n${verification ? `Verification: ${verification.message}` : ''}`;
    
  } catch (error) {
    throw new Error(`Enhanced file creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifiedStringReplace(filePath: string, oldStr: string, newStr: string, params: ComprehensiveToolParams): Promise<string> {
  try {
    const beforeContent = await fs.readFile(filePath, 'utf-8');
    
    // Enhanced pattern matching
    let targetStr = oldStr;
    if (!beforeContent.includes(oldStr)) {
      // Try whitespace-normalized matching
      const normalizedOld = oldStr.replace(/\s+/g, ' ').trim();
      const normalizedContent = beforeContent.replace(/\s+/g, ' ');
      
      if (normalizedContent.includes(normalizedOld)) {
        console.log('🔍 Using whitespace-normalized matching');
        // Find the actual string with original whitespace
        const lines = beforeContent.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].replace(/\s+/g, ' ').trim().includes(normalizedOld)) {
            const actualLine = lines[i];
            const startIndex = actualLine.replace(/\s+/g, ' ').indexOf(normalizedOld);
            // This is a simplified approach - in practice, you'd want more sophisticated matching
            targetStr = actualLine.trim();
            break;
          }
        }
      } else {
        throw new Error(`String not found: "${oldStr}". Available content preview: ${beforeContent.substring(0, 200)}...`);
      }
    }
    
    if (!beforeContent.includes(targetStr)) {
      throw new Error(`Enhanced matching failed. String "${oldStr}" not found in file.`);
    }
    
    const afterContent = beforeContent.replace(targetStr, newStr);
    
    // Verify the replacement actually happened
    if (beforeContent === afterContent && oldStr !== newStr) {
      throw new Error('String replacement failed - no changes were made');
    }
    
    // Pre-write verification
    if (params.verify_before) {
      const syntaxCheck = await performSafetyCheck(absolutePath, afterContent);
      if (!syntaxCheck.isValid) {
        throw new Error(`Pre-write syntax validation failed: ${syntaxCheck.errors.join(', ')}`);
      }
    }
    
    // Safe file modification
    const modifyResult = await safeFileModification(absolutePath, afterContent, {
      enableSyntaxCheck: true,
      enableBackup: params.create_backup !== false // Default to true for replacements
    });
    
    if (!modifyResult.success) {
      throw new Error(`Safe file modification failed: ${modifyResult.message}`);
    }
    
    // Post-write verification
    let verification: VerificationResult | undefined;
    if (params.verify_after) {
      verification = await verifyFileContent(filePath, afterContent);
    }
    
    const changesSummary = `Replaced "${oldStr.substring(0, 50)}${oldStr.length > 50 ? '...' : ''}" with "${newStr.substring(0, 50)}${newStr.length > 50 ? '...' : ''}"`;
    
    return `✅ String replacement completed: ${filePath}\n${changesSummary}\n${verification ? `Verification: ${verification.message}` : ''}`;
    
  } catch (error) {
    throw new Error(`Enhanced string replacement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifiedLineReplace(filePath: string, lineNumber: number, lineContent: string, params: ComprehensiveToolParams): Promise<string> {
  try {
    const beforeContent = await fs.readFile(filePath, 'utf-8');
    const lines = beforeContent.split('\n');
    
    if (lineNumber < 1 || lineNumber > lines.length) {
      throw new Error(`Line number ${lineNumber} is out of range (1-${lines.length})`);
    }
    
    const beforeLine = lines[lineNumber - 1];
    lines[lineNumber - 1] = lineContent;
    const afterContent = lines.join('\n');
    
    // Pre-write verification
    if (params.verify_before) {
      const syntaxCheck = await performSafetyCheck(filePath, afterContent);
      if (!syntaxCheck.isValid) {
        throw new Error(`Pre-write syntax validation failed: ${syntaxCheck.errors.join(', ')}`);
      }
    }
    
    // Safe file modification
    const modifyResult = await safeFileModification(filePath, afterContent, {
      enableSyntaxCheck: true,
      enableBackup: params.create_backup !== false
    });
    
    if (!modifyResult.success) {
      throw new Error(`Safe file modification failed: ${modifyResult.message}`);
    }
    
    // Post-write verification
    let verification: VerificationResult | undefined;
    if (params.verify_after) {
      verification = await verifyFileContent(filePath, afterContent);
    }
    
    return `✅ Line ${lineNumber} replaced successfully: ${filePath}\nBefore: ${beforeLine}\nAfter: ${lineContent}\n${verification ? `Verification: ${verification.message}` : ''}`;
    
  } catch (error) {
    throw new Error(`Enhanced line replacement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifiedSectionReplace(filePath: string, startLine: number, endLine: number, sectionContent: string, params: ComprehensiveToolParams): Promise<string> {
  try {
    const beforeContent = await fs.readFile(filePath, 'utf-8');
    const lines = beforeContent.split('\n');
    
    if (startLine < 1 || endLine > lines.length || startLine > endLine) {
      throw new Error(`Invalid line range: ${startLine}-${endLine} (file has ${lines.length} lines)`);
    }
    
    const beforeSection = lines.slice(startLine - 1, endLine).join('\n');
    const newLines = sectionContent.split('\n');
    
    // Replace the section
    lines.splice(startLine - 1, endLine - startLine + 1, ...newLines);
    const afterContent = lines.join('\n');
    
    // Pre-write verification
    if (params.verify_before) {
      const syntaxCheck = await performSafetyCheck(filePath, afterContent);
      if (!syntaxCheck.isValid) {
        throw new Error(`Pre-write syntax validation failed: ${syntaxCheck.errors.join(', ')}`);
      }
    }
    
    // Safe file modification
    const modifyResult = await safeFileModification(filePath, afterContent, {
      enableSyntaxCheck: true,
      enableBackup: params.create_backup !== false
    });
    
    if (!modifyResult.success) {
      throw new Error(`Safe file modification failed: ${modifyResult.message}`);
    }
    
    // Post-write verification
    let verification: VerificationResult | undefined;
    if (params.verify_after) {
      verification = await verifyFileContent(filePath, afterContent);
    }
    
    return `✅ Section lines ${startLine}-${endLine} replaced successfully: ${filePath}\nReplaced ${endLine - startLine + 1} lines with ${newLines.length} lines\n${verification ? `Verification: ${verification.message}` : ''}`;
    
  } catch (error) {
    throw new Error(`Enhanced section replacement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifiedMultiReplace(filePath: string, replacements: Array<{old: string, new: string}>, params: ComprehensiveToolParams): Promise<string> {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let changesMade = 0;
    const changes: string[] = [];
    
    for (const replacement of replacements) {
      const beforeReplace = content;
      content = content.replace(replacement.old, replacement.new);
      
      if (beforeReplace !== content) {
        changesMade++;
        changes.push(`"${replacement.old.substring(0, 30)}..." → "${replacement.new.substring(0, 30)}..."`);
      }
    }
    
    if (changesMade === 0) {
      throw new Error('No replacements were made - none of the target strings were found');
    }
    
    // Pre-write verification
    if (params.verify_before) {
      const syntaxCheck = await performSafetyCheck(filePath, content);
      if (!syntaxCheck.isValid) {
        throw new Error(`Pre-write syntax validation failed: ${syntaxCheck.errors.join(', ')}`);
      }
    }
    
    // Safe file modification
    const modifyResult = await safeFileModification(filePath, content, {
      enableSyntaxCheck: true,
      enableBackup: params.create_backup !== false
    });
    
    if (!modifyResult.success) {
      throw new Error(`Safe file modification failed: ${modifyResult.message}`);
    }
    
    // Post-write verification
    let verification: VerificationResult | undefined;
    if (params.verify_after) {
      verification = await verifyFileContent(filePath, content);
    }
    
    return `✅ Multi-replacement completed: ${filePath}\n${changesMade} changes made:\n${changes.join('\n')}\n${verification ? `Verification: ${verification.message}` : ''}`;
    
  } catch (error) {
    throw new Error(`Enhanced multi-replacement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifiedInsert(filePath: string, insertLine: number, insertText: string, params: ComprehensiveToolParams): Promise<string> {
  try {
    const beforeContent = await fs.readFile(filePath, 'utf-8');
    const lines = beforeContent.split('\n');
    
    if (insertLine < 0 || insertLine > lines.length) {
      throw new Error(`Insert line ${insertLine} is out of range (0-${lines.length})`);
    }
    
    lines.splice(insertLine, 0, insertText);
    const afterContent = lines.join('\n');
    
    // Pre-write verification
    if (params.verify_before) {
      const syntaxCheck = await performSafetyCheck(filePath, afterContent);
      if (!syntaxCheck.isValid) {
        throw new Error(`Pre-write syntax validation failed: ${syntaxCheck.errors.join(', ')}`);
      }
    }
    
    // Safe file modification
    const modifyResult = await safeFileModification(filePath, afterContent, {
      enableSyntaxCheck: true,
      enableBackup: params.create_backup !== false
    });
    
    if (!modifyResult.success) {
      throw new Error(`Safe file modification failed: ${modifyResult.message}`);
    }
    
    // Post-write verification
    let verification: VerificationResult | undefined;
    if (params.verify_after) {
      verification = await verifyFileContent(filePath, afterContent);
    }
    
    return `✅ Text inserted at line ${insertLine}: ${filePath}\nInserted: ${insertText}\n${verification ? `Verification: ${verification.message}` : ''}`;
    
  } catch (error) {
    throw new Error(`Enhanced insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyModification(filePath: string, params: ComprehensiveToolParams): Promise<string> {
  try {
    const verification = await verifyFileContent(filePath);
    return `🔍 File verification result: ${filePath}\n${verification.message}`;
  } catch (error) {
    throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function analyzeFile(filePath: string, params: ComprehensiveToolParams): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const analysis: DebugAnalysisResult = {
      syntaxValid: true,
      dependencies: [],
      patterns: [],
      issues: [],
      suggestions: []
    };
    
    // Syntax validation
    if (params.analyze_syntax !== false) {
      const syntaxCheck = await performSafetyCheck(filePath, content);
      analysis.syntaxValid = syntaxCheck.isValid;
      if (!syntaxCheck.isValid) {
        analysis.issues.push(...syntaxCheck.errors);
      }
    }
    
    // Dependency analysis
    if (params.analyze_dependencies !== false) {
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        analysis.dependencies.push(match[1]);
      }
      while ((match = requireRegex.exec(content)) !== null) {
        analysis.dependencies.push(match[1]);
      }
    }
    
    // Pattern analysis
    if (params.analyze_patterns !== false) {
      const patterns = [
        'template literals with backticks',
        'arrow functions',
        'async/await',
        'destructuring',
        'spread operator'
      ];
      
      if (content.includes('`')) analysis.patterns.push('template literals');
      if (content.includes('=>')) analysis.patterns.push('arrow functions');
      if (content.includes('async') || content.includes('await')) analysis.patterns.push('async/await');
      if (content.includes('{') && content.includes('}')) analysis.patterns.push('destructuring');
      if (content.includes('...')) analysis.patterns.push('spread operator');
    }
    
    // Generate suggestions
    if (analysis.issues.length > 0) {
      analysis.suggestions.push('Fix syntax errors before proceeding with modifications');
    }
    if (analysis.dependencies.length > 10) {
      analysis.suggestions.push('Consider splitting into smaller modules');
    }
    
    const result = `📊 File Analysis: ${filePath}
✅ Syntax Valid: ${analysis.syntaxValid}
📦 Dependencies (${analysis.dependencies.length}): ${analysis.dependencies.slice(0, 5).join(', ')}${analysis.dependencies.length > 5 ? '...' : ''}
🔍 Patterns: ${analysis.patterns.join(', ') || 'None detected'}
⚠️ Issues: ${analysis.issues.join('; ') || 'None'}
💡 Suggestions: ${analysis.suggestions.join('; ') || 'None'}`;
    
    return result;
    
  } catch (error) {
    throw new Error(`File analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function searchPatterns(filePath: string, patterns: string[], params: ComprehensiveToolParams): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const results: SearchResult[] = [];
    
    for (const pattern of patterns) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(pattern)) {
          results.push({
            file: filePath,
            line: i + 1,
            context: line.trim(),
            match: pattern
          });
        }
      }
    }
    
    if (results.length === 0) {
      return `🔍 Pattern search completed: No matches found for patterns: ${patterns.join(', ')}`;
    }
    
    const resultText = results.map(r => 
      `Line ${r.line}: ${r.context} (matched: "${r.match}")`
    ).join('\n');
    
    return `🔍 Pattern search results: ${filePath}\nFound ${results.length} matches:\n${resultText}`;
    
  } catch (error) {
    throw new Error(`Pattern search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function safeTestModification(filePath: string, params: ComprehensiveToolParams): Promise<string> {
  try {
    // This would test modifications without actually applying them
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Simulate the modification based on provided parameters
    let testContent = content;
    if (params.old_str && params.new_str) {
      testContent = content.replace(params.old_str, params.new_str);
    }
    
    // Test syntax validation
    const syntaxCheck = await performSafetyCheck(filePath, testContent);
    
    return `🧪 Safe test completed: ${filePath}\nSyntax valid: ${syntaxCheck.isValid}\n${syntaxCheck.isValid ? 'Modification appears safe to apply' : `Issues found: ${syntaxCheck.errors.join(', ')}`}`;
    
  } catch (error) {
    throw new Error(`Safe test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function emergencyRevert(filePath: string): Promise<string> {
  try {
    // Look for backup files
    const backupPattern = `${filePath}.backup-`;
    const dir = path.dirname(filePath);
    const files = await fs.readdir(dir);
    
    const backupFiles = files
      .filter(f => f.startsWith(path.basename(filePath) + '.backup-'))
      .sort()
      .reverse(); // Most recent first
    
    if (backupFiles.length === 0) {
      throw new Error('No backup files found for emergency revert');
    }
    
    const latestBackup = path.join(dir, backupFiles[0]);
    const backupContent = await fs.readFile(latestBackup, 'utf-8');
    
    await fs.writeFile(filePath, backupContent, 'utf-8');
    
    return `🚨 Emergency revert completed: ${filePath}\nReverted to backup: ${latestBackup}`;
    
  } catch (error) {
    throw new Error(`Emergency revert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function dependencyAnalysis(filePath: string): Promise<string> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const dependencies = new Set<string>();
    const usages = new Set<string>();
    
    // Find imports
    const importRegex = /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const [, namedImports, namespaceImport, defaultImport, moduleName] = match;
      dependencies.add(moduleName);
      
      if (namedImports) {
        namedImports.split(',').forEach(imp => usages.add(imp.trim()));
      }
      if (namespaceImport) usages.add(namespaceImport);
      if (defaultImport) usages.add(defaultImport);
    }
    
    return `🔗 Dependency Analysis: ${filePath}
📦 Modules: ${Array.from(dependencies).join(', ') || 'None'}
🎯 Imported Items: ${Array.from(usages).join(', ') || 'None'}
📊 Total Dependencies: ${dependencies.size}`;
    
  } catch (error) {
    throw new Error(`Dependency analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function verifyFileContent(filePath: string, expectedContent?: string): Promise<VerificationResult> {
  try {
    const actualContent = await fs.readFile(filePath, 'utf-8');
    
    if (expectedContent) {
      const matches = actualContent === expectedContent;
      return {
        success: matches,
        message: matches ? 'Content verification passed' : 'Content verification failed - file content differs from expected'
      };
    }
    
    // Basic verification - file exists and is readable
    const syntaxCheck = await performSafetyCheck(filePath, actualContent);
    return {
      success: syntaxCheck.isValid,
      message: syntaxCheck.isValid 
        ? 'File verification passed - syntax valid' 
        : `File verification failed - syntax errors: ${syntaxCheck.errors.join(', ')}`
    };
    
  } catch (error) {
    return {
      success: false,
      message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}