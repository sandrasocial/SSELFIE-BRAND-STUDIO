import fs from 'fs/promises';
import path from 'path';

interface EnhancedEditParams {
  command: 'view' | 'create' | 'str_replace' | 'insert' | 'line_replace' | 'section_replace' | 'multi_replace';
  path: string;
  
  // Standard parameters
  view_range?: [number, number];
  file_text?: string;
  old_str?: string;
  new_str?: string;
  insert_line?: number;
  insert_text?: string;
  
  // Enhanced parameters
  line_number?: number;           // For line_replace
  line_content?: string;          // New content for line_replace
  start_line?: number;            // For section_replace
  end_line?: number;              // For section_replace
  section_content?: string;       // New content for section_replace
  replacements?: Array<{          // For multi_replace
    old: string;
    new: string;
  }>;
}

export async function enhanced_file_editor(params: EnhancedEditParams) {
  try {
    console.log('🚀 ENHANCED FILE EDITOR: Starting operation:', {
      command: params.command,
      path: params.path,
      hasWriteAccess: true
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
        return await viewFile(absolutePath, params.view_range);
        
      case 'create':
        if (!params.file_text) throw new Error('file_text required for create command');
        return await createFile(absolutePath, params.file_text);
        
      case 'str_replace':
        if (!params.old_str) throw new Error('old_str required for str_replace command');
        return await replaceInFile(absolutePath, params.old_str, params.new_str || '');
        
      case 'insert':
        if (params.insert_line === undefined || !params.insert_text) {
          throw new Error('insert_line and insert_text required for insert command');
        }
        return await insertInFile(absolutePath, params.insert_line, params.insert_text);
        
      case 'line_replace':
        if (params.line_number === undefined || !params.line_content) {
          throw new Error('line_number and line_content required for line_replace command');
        }
        return await replaceLineInFile(absolutePath, params.line_number, params.line_content);
        
      case 'section_replace':
        if (params.start_line === undefined || params.end_line === undefined || !params.section_content) {
          throw new Error('start_line, end_line, and section_content required for section_replace command');
        }
        return await replaceSectionInFile(absolutePath, params.start_line, params.end_line, params.section_content);
        
      case 'multi_replace':
        if (!params.replacements || params.replacements.length === 0) {
          throw new Error('replacements array required for multi_replace command');
        }
        return await multiReplaceInFile(absolutePath, params.replacements);
        
      default:
        throw new Error(`Unknown command: ${params.command}`);
    }
    
  } catch (error) {
    console.error('❌ ENHANCED FILE EDITOR ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Enhanced file operation failed: ${errorMessage}`);
  }
}

async function viewFile(filePath: string, viewRange?: [number, number]) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    let displayLines: string[];
    let rangeInfo = '';
    
    if (viewRange && Array.isArray(viewRange) && viewRange.length === 2) {
      const [start, end] = viewRange;
      const startLine = Math.max(1, start) - 1; // Convert to 0-indexed
      const endLine = end === -1 ? lines.length : Math.min(lines.length, end);
      
      displayLines = lines.slice(startLine, endLine);
      rangeInfo = `Viewing lines ${start}-${endLine === lines.length ? 'end' : endLine} of ${lines.length}`;
    } else {
      displayLines = lines;
      rangeInfo = `Viewing entire file (${lines.length} lines)`;
    }
    
    // Format with line numbers
    const numberedLines = displayLines.map((line, index) => {
      const lineNumber = viewRange ? (viewRange[0] + index) : (index + 1);
      return `${lineNumber.toString().padStart(4)}\t${line}`;
    }).join('\n');
    
    return `Here's the result of running \`cat -n\` on ${viewRange ? 'a snippet of ' : ''}${filePath}:\n${rangeInfo ? rangeInfo + '\n' : ''}${numberedLines}`;
    
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

async function createFile(filePath: string, content: string) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, content, 'utf-8');
    
    return `File created successfully: ${filePath}`;
  } catch (error) {
    throw new Error(`Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function replaceInFile(filePath: string, oldStr: string, newStr: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // More flexible string matching - normalize whitespace
    const normalizedOld = oldStr.trim();
    const normalizedContent = content;
    
    // Check if old string exists (with flexibility for whitespace)
    if (!normalizedContent.includes(normalizedOld)) {
      // Try with normalized whitespace
      const contentLines = content.split('\n');
      let found = false;
      for (let line of contentLines) {
        if (line.trim().includes(normalizedOld.trim())) {
          found = true;
          break;
        }
      }
      if (!found) {
        throw new Error(`String not found in file: "${oldStr}"`);
      }
    }
    
    // Replace string with enhanced matching
    const newContent = content.replace(oldStr, newStr);
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    return `String replaced successfully in ${filePath}`;
  } catch (error) {
    throw new Error(`Failed to replace string: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function insertInFile(filePath: string, insertLine: number, insertText: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Insert at specified line (0-indexed)
    const insertIndex = insertLine === 0 ? 0 : insertLine;
    lines.splice(insertIndex, 0, insertText);
    
    const newContent = lines.join('\n');
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    return `Text inserted successfully at line ${insertLine} in ${filePath}`;
  } catch (error) {
    throw new Error(`Failed to insert text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function replaceLineInFile(filePath: string, lineNumber: number, newContent: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Validate line number
    if (lineNumber < 1 || lineNumber > lines.length) {
      throw new Error(`Line number ${lineNumber} is out of range (1-${lines.length})`);
    }
    
    // Replace the specific line (convert to 0-indexed)
    lines[lineNumber - 1] = newContent;
    
    const updatedContent = lines.join('\n');
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
    return `Line ${lineNumber} replaced successfully in ${filePath}`;
  } catch (error) {
    throw new Error(`Failed to replace line: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function replaceSectionInFile(filePath: string, startLine: number, endLine: number, newContent: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Validate line numbers
    if (startLine < 1 || startLine > lines.length) {
      throw new Error(`Start line ${startLine} is out of range (1-${lines.length})`);
    }
    if (endLine < startLine || endLine > lines.length) {
      throw new Error(`End line ${endLine} is invalid (must be between ${startLine}-${lines.length})`);
    }
    
    // Replace the section (convert to 0-indexed)
    const newLines = newContent.split('\n');
    lines.splice(startLine - 1, endLine - startLine + 1, ...newLines);
    
    const updatedContent = lines.join('\n');
    await fs.writeFile(filePath, updatedContent, 'utf-8');
    
    return `Lines ${startLine}-${endLine} replaced successfully in ${filePath}`;
  } catch (error) {
    throw new Error(`Failed to replace section: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function multiReplaceInFile(filePath: string, replacements: Array<{old: string, new: string}>) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let replacementCount = 0;
    const results: string[] = [];
    
    for (const replacement of replacements) {
      const oldStr = replacement.old;
      const newStr = replacement.new;
      
      if (content.includes(oldStr)) {
        content = content.replace(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newStr);
        replacementCount++;
        results.push(`✅ Replaced: "${oldStr}" → "${newStr}"`);
      } else {
        results.push(`⚠️ Not found: "${oldStr}"`);
      }
    }
    
    if (replacementCount > 0) {
      await fs.writeFile(filePath, content, 'utf-8');
    }
    
    return `Multi-replace completed in ${filePath}:\n${results.join('\n')}\nTotal replacements: ${replacementCount}`;
  } catch (error) {
    throw new Error(`Failed to perform multi-replace: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}