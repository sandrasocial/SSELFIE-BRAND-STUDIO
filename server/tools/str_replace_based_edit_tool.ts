import fs from 'fs/promises';
import path from 'path';

interface EditToolParams {
  command: 'view' | 'create' | 'str_replace' | 'insert';
  path: string;
  view_range?: [number, number];
  file_text?: string;
  old_str?: string;
  new_str?: string;
  insert_line?: number;
  insert_text?: string;
}

export async function str_replace_based_edit_tool(params: EditToolParams) {
  try {
    // CRITICAL FIX: Validate params exist
    if (!params || typeof params !== 'object') {
      throw new Error('Invalid parameters provided to str_replace_based_edit_tool');
    }
    
    console.log('🔧 ADMIN FILE TOOL: Starting file operation:', {
      command: params.command,
      path: params.path,
      hasWriteAccess: true
    });
    
    // CRITICAL FIX: Validate required parameters
    if (!params.path || typeof params.path !== 'string') {
      throw new Error('Missing or invalid path parameter');
    }
    
    if (!params.command || typeof params.command !== 'string') {
      throw new Error('Missing or invalid command parameter');
    }
    
    // ADMIN AGENTS: ENHANCED PATH RESOLUTION for complex file creation
    // Convert absolute paths starting with / to relative paths
    let resolvedPath = params.path;
    if (params.path.startsWith('/server/') || params.path.startsWith('/client/')) {
      resolvedPath = params.path.substring(1); // Remove leading slash
      console.log(`🔧 PATH CORRECTION: ${params.path} → ${resolvedPath}`);
    }
    
    const absolutePath = path.resolve(resolvedPath);
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
      default:
        throw new Error(`Unknown command: ${params.command}`);
    }
    
  } catch (error) {
    console.error('❌ ADMIN FILE TOOL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`File operation failed: ${errorMessage}`);
  }
}

async function viewFile(filePath: string, viewRange?: [number, number]) {
  try {
    // Check if path is a directory first to prevent EISDIR error
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      // Return directory listing instead of trying to read as file
      const entries = await fs.readdir(filePath, { withFileTypes: true });
      const dirContents = entries
        .slice(0, 100) // Limit entries to prevent overflow
        .map(entry => {
          const type = entry.isDirectory() ? '(Folder)' : '(File)';
          return `${entry.name} ${type}`;
        })
        .join('\n');
      
      return `Here's the files and directories in ${filePath}:\n${dirContents}`;
    }
    
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
    
    // Check if old string exists
    if (!content.includes(oldStr)) {
      throw new Error(`String not found in file: "${oldStr}"`);
    }
    
    // Check if string appears multiple times
    const occurrences = content.split(oldStr).length - 1;
    if (occurrences > 1) {
      throw new Error(`String appears ${occurrences} times in file. Please provide a more specific string.`);
    }
    
    // Replace string
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