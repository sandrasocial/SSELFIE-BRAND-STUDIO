/**
 * FILE EDIT TOOL
 * Real file editing operations for agent orchestration
 */

import fs from 'fs/promises';
import path from 'path';

export async function str_replace_based_edit_tool(parameters: any): Promise<any> {
  console.log('✏️ FILE EDIT TOOL:', parameters);
  
  try {
    const { command, path: filePath, file_text, old_str, new_str, view_range, insert_line, insert_text } = parameters;

    if (!command) {
      throw new Error('Command parameter is required');
    }

    // Resolve the file path relative to the project root
    const resolvedPath = path.resolve(process.cwd(), filePath || '');
    
    switch (command) {
      case 'view':
        return await handleView(resolvedPath, view_range);
      
      case 'create':
        return await handleCreate(resolvedPath, file_text || '');
      
      case 'str_replace':
        return await handleStringReplace(resolvedPath, old_str, new_str);
      
      case 'insert':
        return await handleInsert(resolvedPath, insert_line, insert_text);
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error('❌ FILE EDIT ERROR:', error);
    throw error;
  }
}

// View file with optional line range
async function handleView(filePath: string, viewRange?: [number, number]): Promise<string> {
  try {
    // Check if path is a directory
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      const entries = await fs.readdir(filePath, { withFileTypes: true });
      const fileList = entries
        .slice(0, 100) // Limit directory listing
        .map(entry => entry.isDirectory() ? `${entry.name}/` : entry.name)
        .join('\n');
      return `Directory listing for ${filePath}:\n${fileList}`;
    }

    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    if (viewRange) {
      const [start, end] = viewRange;
      const actualEnd = end === -1 ? lines.length : Math.min(end, lines.length);
      const actualStart = Math.max(1, start);
      
      const selectedLines = lines.slice(actualStart - 1, actualEnd);
      const numberedLines = selectedLines.map((line, index) => 
        `${(actualStart + index).toString().padStart(4, ' ')}\t${line}`
      ).join('\n');
      
      return `Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n${numberedLines}`;
    } else {
      // SMART TRUNCATION: Show relevant content based on file size and type
      const maxLines = getSmartLineLimit(filePath, lines.length);
      
      if (lines.length <= maxLines) {
        // Small file - show all content with line numbers
        const numberedLines = lines.map((line, index) => 
          `${(index + 1).toString().padStart(4, ' ')}\t${line}`
        ).join('\n');
        return `Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n${numberedLines}`;
      } else {
        // Large file - smart truncation with context
        const startLines = Math.ceil(maxLines * 0.6); // 60% from start
        const endLines = maxLines - startLines; // 40% from end
        
        const topContent = lines.slice(0, startLines).map((line, index) => 
          `${(index + 1).toString().padStart(4, ' ')}\t${line}`
        ).join('\n');
        
        const bottomContent = lines.slice(-endLines).map((line, index) => 
          `${(lines.length - endLines + index + 1).toString().padStart(4, ' ')}\t${line}`
        ).join('\n');
        
        return `Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n${topContent}\n\n... (${lines.length - maxLines} lines truncated) ...\n\n${bottomContent}`;
      }
    }
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`File ${filePath} not found`);
    }
    throw error;
  }
}

// Create new file
async function handleCreate(filePath: string, content: string): Promise<string> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write file
    await fs.writeFile(filePath, content, 'utf-8');
    
    // Show relative path instead of absolute path for cleaner response
    const relativePath = path.relative(process.cwd(), filePath);
    
    console.log(`✅ FILE CREATED: ${filePath}`);
    return `File created successfully at: ${relativePath || filePath}`;
  } catch (error) {
    throw new Error(`Failed to create file: ${(error as Error).message}`);
  }
}

// Replace string in file
async function handleStringReplace(filePath: string, oldStr: string, newStr: string = ''): Promise<string> {
  try {
    if (!oldStr) {
      throw new Error('old_str parameter is required for str_replace');
    }

    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check if old string exists
    if (!content.includes(oldStr)) {
      throw new Error(`String not found in file. The exact string to replace was not found.`);
    }
    
    // Count occurrences
    const occurrences = (content.match(new RegExp(escapeRegExp(oldStr), 'g')) || []).length;
    if (occurrences > 1) {
      throw new Error(`Multiple occurrences found (${occurrences}). The string to replace must be unique.`);
    }
    
    // Perform replacement
    const newContent = content.replace(oldStr, newStr);
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    console.log(`✅ STRING REPLACED in ${filePath}`);
    return `The file ${filePath} has been edited. Here's the result of running \`cat -n\` on a snippet of ${filePath}:\n` +
           newContent.split('\n').slice(0, 10).map((line, i) => `${(i + 1).toString().padStart(4, ' ')}\t${line}`).join('\n');
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`File ${filePath} not found`);
    }
    throw error;
  }
}

// Insert text at specific line
async function handleInsert(filePath: string, insertLine: number, insertText: string): Promise<string> {
  try {
    if (insertLine === undefined || insertText === undefined) {
      throw new Error('insert_line and insert_text parameters are required for insert');
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Insert text at specified line (0 = beginning, N = after line N)
    const actualLine = Math.max(0, Math.min(insertLine, lines.length));
    lines.splice(actualLine, 0, insertText);
    
    const newContent = lines.join('\n');
    await fs.writeFile(filePath, newContent, 'utf-8');
    
    console.log(`✅ TEXT INSERTED in ${filePath} at line ${actualLine}`);
    return `Text inserted at line ${actualLine} in ${filePath}`;
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      throw new Error(`File ${filePath} not found`);
    }
    throw error;
  }
}

// Helper function to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// SMART LINE LIMITS: Optimize based on file type and size
function getSmartLineLimit(filePath: string, totalLines: number): number {
  const extension = path.extname(filePath).toLowerCase();
  
  // Config files - show more content
  if (['.json', '.md', '.txt', '.yml', '.yaml'].includes(extension)) {
    return Math.min(500, totalLines);
  }
  
  // Code files - moderate showing
  if (['.ts', '.tsx', '', '.jsx', '.py', '.css'].includes(extension)) {
    return Math.min(300, totalLines);
  }
  
  // Large data files - minimal showing
  if (['.csv', '.log', '.sql'].includes(extension)) {
    return Math.min(100, totalLines);
  }
  
  // Default for unknown types
  return Math.min(200, totalLines);
}