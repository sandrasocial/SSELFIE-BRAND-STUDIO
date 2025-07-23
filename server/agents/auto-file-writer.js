/**
 * AUTO-FILE-WRITER - CLEAN VERSION
 * Automatically creates files from agent responses with code blocks
 */

import { promises as fsPromises } from 'fs';
import path from 'path';

export class AutoFileWriter {
  
  /**
   * Process agent response and extract/create files from code blocks
   */
  static async processAgentResponse(responseText, agentId = 'unknown', context = {}) {
    const filesWritten = [];
    let modifiedResponse = responseText;
    
    console.log(`🔍 AUTO-FILE-WRITER: Processing response from ${agentId} (${responseText.length} chars)`);
    
    // Extract XML write_to_file tags (priority 1)
    const xmlMatches = responseText.matchAll(/<write_to_file>\s*<path>(.*?)<\/path>\s*<content>(.*?)<\/content>\s*<\/write_to_file>/gs);
    
    for (const match of xmlMatches) {
      const filePath = match[1].trim();
      const content = match[2].trim();
      
      try {
        await this.writeFile(filePath, content);
        filesWritten.push({
          filePath,
          success: true,
          size: content.length,
          source: 'xml'
        });
        
        console.log(`✅ XML FILE CREATED: ${filePath} (${content.length} chars)`);
        
        // Replace XML block with confirmation
        modifiedResponse = modifiedResponse.replace(match[0], `✅ **Created**: \`${filePath}\` (${content.length} characters)`);
        
      } catch (error) {
        console.error(`❌ Failed to write XML file ${filePath}:`, error);
        filesWritten.push({
          filePath,
          success: false,
          error: error.message,
          source: 'xml'
        });
      }
    }
    
    // Extract regular code blocks (priority 2)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(responseText)) !== null) {
      const language = match[1] || 'text';
      const content = match[2].trim();
      
      if (content.length > 50 && this.looksLikeFileContent(content, language)) {
        codeBlocks.push({
          language,
          content,
          fullMatch: match[0]
        });
      }
    }
    
    // Process code blocks
    for (const block of codeBlocks) {
      const filePath = this.detectFilePath(block.content, block.language, agentId, context);
      
      if (filePath) {
        try {
          await this.writeFile(filePath, block.content);
          filesWritten.push({
            filePath,
            success: true,
            size: block.content.length,
            source: 'codeblock'
          });
          
          console.log(`✅ CODE BLOCK FILE CREATED: ${filePath} (${block.content.length} chars)`);
          
          // Replace code block with confirmation
          modifiedResponse = modifiedResponse.replace(
            block.fullMatch,
            `✅ **Created**: \`${filePath}\` (${block.content.length} characters)`
          );
          
        } catch (error) {
          console.error(`❌ Failed to write code block file ${filePath}:`, error);
          filesWritten.push({
            filePath,
            success: false,
            error: error.message,
            source: 'codeblock'
          });
        }
      }
    }
    
    console.log(`🎯 AUTO-FILE-WRITER COMPLETE: Processed ${filesWritten.length} files`);
    return {
      filesWritten,
      modifiedResponse,
      totalProcessed: codeBlocks.length
    };
  }
  
  /**
   * Write file to disk with directory creation
   */
  static async writeFile(filePath, content) {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    await fsPromises.mkdir(dir, { recursive: true });
    
    // Write file
    await fsPromises.writeFile(fullPath, content, 'utf8');
  }
  
  /**
   * Check if content looks like file content
   */
  static looksLikeFileContent(content, language) {
    // Must be substantial content
    if (content.length < 50) return false;
    
    // Common file patterns
    const filePatterns = [
      /import\s+.*from/,
      /export\s+(default\s+)?/,
      /function\s+\w+/,
      /const\s+\w+\s*=/,
      /interface\s+\w+/,
      /class\s+\w+/,
      /<\w+.*>/,
      /\.tsx?$|\.jsx?$|\.css$|\.scss$/
    ];
    
    return filePatterns.some(pattern => pattern.test(content));
  }
  
  /**
   * Detect file path from content and context
   */
  static detectFilePath(content, language, agentId, context) {
    // ADMIN COMPONENT DETECTION
    if (content.includes('AdminDashboard') || content.includes('admin-dashboard')) {
      return 'client/src/components/admin/AdminDashboard.tsx';
    }
    
    // COMPONENT DETECTION
    const componentMatch = content.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
    if (componentMatch && (language === 'tsx' || language === 'jsx' || content.includes('React'))) {
      const componentName = componentMatch[1];
      
      // Admin components go to admin folder
      if (componentName.includes('Admin') || agentId === 'aria' && context.admin) {
        return `client/src/components/admin/${componentName}.tsx`;
      }
      
      // Visual editor components
      if (componentName.includes('Editor') || componentName.includes('Visual')) {
        return `client/src/components/visual-editor/${componentName}.tsx`;
      }
      
      // Default component location
      return `client/src/components/${componentName}.tsx`;
    }
    
    // CSS/STYLE DETECTION
    if (language === 'css' || content.includes('@apply') || content.includes('.css')) {
      return 'client/src/styles/generated.css';
    }
    
    // TYPE DETECTION
    if (content.includes('interface ') || content.includes('type ') || content.includes('export type')) {
      return 'shared/types.ts';
    }
    
    return null;
  }
}

export default AutoFileWriter;