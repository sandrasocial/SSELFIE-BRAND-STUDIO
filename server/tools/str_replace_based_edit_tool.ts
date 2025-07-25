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
    console.log('👁️ CONSULTING FILE TOOL: Starting read-only operation:', {
      command: params.command,
      path: params.path,
      readOnly: params.command === 'view'
    });
    
    // CONSULTING AGENTS: ONLY ALLOW VIEW COMMAND
    if (params.command !== 'view') {
      throw new Error(`BLOCKED: Consulting agents can only view files. Attempted command: '${params.command}'`);
    }
    
    const absolutePath = path.resolve(params.path);
    
    // Security check - ensure path is within project
    const projectRoot = process.cwd();
    if (!absolutePath.startsWith(projectRoot)) {
      throw new Error('Access denied: Path outside project directory');
    }
    
    return await viewFile(absolutePath, params.view_range);
    
  } catch (error) {
    console.error('❌ CONSULTING FILE TOOL ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`File operation failed: ${errorMessage}`);
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
      rangeInfo = ` (lines ${start}-${endLine})`;
    } else {
      displayLines = lines;
      rangeInfo = ` (${lines.length} lines total)`;
    }
    
    // Add line numbers for consulting analysis
    const numberedLines = displayLines.map((line, index) => {
      const lineNumber = viewRange ? (viewRange[0] + index) : (index + 1);
      return `${lineNumber.toString().padStart(4, ' ')}\t${line}`;
    });
    
    const result = numberedLines.join('\n');
    
    console.log(`✅ CONSULTING FILE VIEW: Successfully read ${path.basename(filePath)}${rangeInfo}`);
    
    return {
      content: result,
      totalLines: lines.length,
      displayedLines: displayLines.length,
      filePath: filePath,
      operation: 'view'
    };
    
  } catch (error) {
    if (error instanceof Error && error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

// Export for use in consulting routes
export { viewFile };