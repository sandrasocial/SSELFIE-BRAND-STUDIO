import { promises as fs } from 'fs';
import path from 'path';

/**
 * Tool for viewing, creating and editing files
 * Replicates the functionality of the main str_replace_based_edit_tool
 */
async function str_replace_based_edit_tool(params) {
  const { command, path: filePath, file_text, old_str, new_str, view_range, insert_line, insert_text } = params;
  
  if (!command || !filePath) {
    throw new Error('Missing required parameters: command and path');
  }
  
  const absolutePath = path.resolve(filePath);
  
  try {
    switch (command) {
      case 'view':
        return await viewFile(absolutePath, view_range);
        
      case 'create':
        if (!file_text) {
          throw new Error('file_text parameter required for create command');
        }
        return await createFile(absolutePath, file_text);
        
      case 'str_replace':
        if (!old_str) {
          throw new Error('old_str parameter required for str_replace command');
        }
        return await replaceInFile(absolutePath, old_str, new_str || '');
        
      case 'insert':
        if (insert_line === undefined || !insert_text) {
          throw new Error('insert_line and insert_text parameters required for insert command');
        }
        return await insertInFile(absolutePath, insert_line, insert_text);
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error(`str_replace_based_edit_tool error:`, error);
    throw error;
  }
}

async function viewFile(filePath, viewRange) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    if (viewRange && Array.isArray(viewRange) && viewRange.length === 2) {
      const [start, end] = viewRange;
      const startIdx = Math.max(0, start - 1);
      const endIdx = end === -1 ? lines.length : Math.min(lines.length, end);
      const selectedLines = lines.slice(startIdx, endIdx);
      
      return selectedLines.map((line, idx) => `${startIdx + idx + 1}\t${line}`).join('\n');
    }
    
    return lines.map((line, idx) => `${idx + 1}\t${line}`).join('\n');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

async function createFile(filePath, content) {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(filePath, content, 'utf8');
    return `File created successfully: ${filePath}`;
  } catch (error) {
    throw new Error(`Failed to create file: ${error.message}`);
  }
}

async function replaceInFile(filePath, oldStr, newStr) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    if (!content.includes(oldStr)) {
      // Enhanced string matching with whitespace normalization
      const normalizedContent = content.replace(/\s+/g, ' ').trim();
      const normalizedSearch = oldStr.replace(/\s+/g, ' ').trim();
      
      if (normalizedContent.includes(normalizedSearch)) {
        console.log(`⚠️ WHITESPACE MISMATCH: Found content with normalized matching`);
        // Try to find with flexible whitespace
        const flexiblePattern = oldStr.replace(/\s+/g, '\\s+').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(flexiblePattern);
        if (regex.test(content)) {
          console.log(`✅ FLEXIBLE MATCH: Using regex pattern matching`);
          const newContent = content.replace(regex, newStr);
          await fs.writeFile(filePath, newContent, 'utf8');
          return `File updated successfully with flexible matching: ${filePath}`;
        }
      }
      
      // Fallback: Try partial matching for large strings
      if (oldStr.length > 100) {
        const firstLine = oldStr.split('\n')[0].trim();
        if (content.includes(firstLine)) {
          console.log(`⚠️ PARTIAL MATCH: Using first line match for large string replacement`);
          const lines = content.split('\n');
          const searchLines = oldStr.split('\n');
          
          for (let i = 0; i <= lines.length - searchLines.length; i++) {
            if (lines[i].trim() === firstLine) {
              // Check if subsequent lines match
              let matchFound = true;
              for (let j = 1; j < searchLines.length && matchFound; j++) {
                if (lines[i + j]?.trim() !== searchLines[j].trim()) {
                  matchFound = false;
                }
              }
              
              if (matchFound) {
                // Replace the matched section
                lines.splice(i, searchLines.length, ...newStr.split('\n'));
                const newContent = lines.join('\n');
                await fs.writeFile(filePath, newContent, 'utf8');
                return `File updated successfully with partial matching: ${filePath}`;
              }
            }
          }
        }
      }
      
      console.error(`❌ STRING MATCH FAILED:`);
      console.error(`🔍 Searching for: "${oldStr.substring(0, 200)}${oldStr.length > 200 ? '...' : ''}"`);
      console.error(`📁 In file with ${content.length} characters`);
      console.error(`🎯 First 200 chars of file: "${content.substring(0, 200)}"`);
      throw new Error(`String not found in file after enhanced matching: ${oldStr.substring(0, 100)}${oldStr.length > 100 ? '...' : ''}`);
    }
    
    const occurrences = (content.match(new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    
    if (occurrences > 1) {
      throw new Error(`String appears ${occurrences} times in file. Please provide a more specific string.`);
    }
    
    const newContent = content.replace(oldStr, newStr);
    await fs.writeFile(filePath, newContent, 'utf8');
    
    return `File updated successfully: ${filePath}`;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

async function insertInFile(filePath, insertLine, insertText) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    const lineIndex = insertLine === 0 ? 0 : Math.min(insertLine, lines.length);
    lines.splice(lineIndex, 0, insertText);
    
    const newContent = lines.join('\n');
    await fs.writeFile(filePath, newContent, 'utf8');
    
    return `Text inserted successfully at line ${insertLine} in ${filePath}`;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw error;
  }
}

export { str_replace_based_edit_tool };