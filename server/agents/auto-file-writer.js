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
        
        // Trigger file tree refresh for visual editor synchronization
        this.triggerFileTreeRefresh();
        
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
          // ENHANCED VALIDATION: Final content check before writing
          if (!this.validateFileContent(block.content, filePath)) {
            console.log(`🚨 VALIDATION FAILED: Content rejected for ${filePath}`);
            filesWritten.push({
              filePath,
              success: false,
              error: 'Content validation failed - dangerous or invalid content detected',
              source: 'codeblock'
            });
            continue;
          }
          
          await this.writeFile(filePath, block.content);
          filesWritten.push({
            filePath,
            success: true,
            size: block.content.length,
            source: 'codeblock'
          });
          
          console.log(`✅ CODE BLOCK FILE CREATED: ${filePath} (${block.content.length} chars)`);
          
          // Trigger file tree refresh for visual editor synchronization
          this.triggerFileTreeRefresh();
          
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
   * Trigger file tree refresh for visual editor synchronization
   */
  static triggerFileTreeRefresh() {
    try {
      // Signal to visual editor that file tree needs refresh
      // This can be used by frontend to refresh file tree displays
      console.log('🔄 AUTO-FILE-WRITER: Triggering file tree refresh');
      
      // Store timestamp for frontend polling
      global.lastFileTreeUpdate = Date.now();
      
    } catch (error) {
      console.log('⚠️ File tree refresh trigger failed:', error.message);  
    }
  }
  
  /**
   * Check if content looks like file content with ENHANCED ERROR DETECTION
   */
  static looksLikeFileContent(content, language) {
    // Must be substantial content
    if (content.length < 50) return false;
    
    // CRITICAL: Detect dangerous patterns that should NEVER be written to files
    const dangerousPatterns = [
      /^[\s]*ComponentName\/[\s]*$/m, // File tree structures
      /├──|└──|│/, // ASCII tree characters
      /^[\s]*#.*Barrel export.*$/m, // File structure comments
      /^[\s]*\w+\/[\s]*$/m, // Directory names with slashes
      /^[\s]*\w+\.\w+[\s]*#.*$/m, // File listings with comments
    ];
    
    // BLOCK dangerous content immediately
    if (dangerousPatterns.some(pattern => pattern.test(content))) {
      console.log('🚨 DANGEROUS CONTENT BLOCKED: File tree structure detected, not valid file content');
      return false;
    }
    
    // Language-specific validation
    if (language === 'css' || content.includes('client/src/styles')) {
      // CSS must contain actual CSS rules
      const cssPatterns = [
        /\.[a-zA-Z][a-zA-Z0-9-]*\s*{/, // CSS class selectors
        /@[a-zA-Z][a-zA-Z0-9-]*/, // CSS at-rules
        /[a-zA-Z-]+\s*:\s*[^;]+;/, // CSS properties
        /\/\*.*\*\//, // CSS comments
      ];
      
      if (!cssPatterns.some(pattern => pattern.test(content))) {
        console.log('🚨 INVALID CSS BLOCKED: Content does not contain valid CSS rules');
        return false;
      }
    }
    
    // TypeScript/JavaScript validation
    if (language === 'tsx' || language === 'jsx' || language === 'ts' || language === 'js') {
      const codePatterns = [
        /import\s+.*from/,
        /export\s+(default\s+)?/,
        /function\s+\w+/,
        /const\s+\w+\s*=/,
        /interface\s+\w+/,
        /class\s+\w+/,
        /<\w+.*>/,
      ];
      
      if (!codePatterns.some(pattern => pattern.test(content))) {
        console.log('🚨 INVALID CODE BLOCKED: Content does not contain valid TypeScript/JavaScript');
        return false;
      }
    }
    
    return true;
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

  /**
   * Enhanced content validation before writing files
   */
  static validateFileContent(content, filePath) {
    const extension = path.extname(filePath);
    
    // CSS file validation
    if (extension === '.css') {
      // Must not contain file tree characters
      if (/├──|└──|│|ComponentName\//.test(content)) {
        console.log('🚨 CSS VALIDATION FAILED: Contains file tree characters');
        return false;
      }
      
      // Must contain valid CSS (selectors, properties, or comments)
      const validCssPatterns = [
        /\.[a-zA-Z][a-zA-Z0-9-]*\s*{/, // Class selectors
        /[a-zA-Z-]+\s*:\s*[^;]+;/, // CSS properties
        /\/\*.*\*\//, // CSS comments
        /@[a-zA-Z][a-zA-Z0-9-]*/, // At-rules
      ];
      
      if (!validCssPatterns.some(pattern => pattern.test(content))) {
        console.log('🚨 CSS VALIDATION FAILED: No valid CSS patterns found');
        return false;
      }
    }
    
    // TypeScript/JavaScript file validation
    if (['.ts', '.tsx', '.js', '.jsx'].includes(extension)) {
      // Must not contain file tree characters
      if (/├──|└──|│|ComponentName\//.test(content)) {
        console.log('🚨 TS/JS VALIDATION FAILED: Contains file tree characters');
        return false;
      }
      
      // Must contain valid code patterns
      const validCodePatterns = [
        /import\s+.*from/,
        /export\s+(default\s+)?/,
        /function\s+[a-zA-Z_]\w*/,
        /const\s+[a-zA-Z_]\w*\s*=/,
        /interface\s+[a-zA-Z_]\w*/,
        /class\s+[a-zA-Z_]\w*/,
      ];
      
      if (!validCodePatterns.some(pattern => pattern.test(content))) {
        console.log('🚨 CODE VALIDATION FAILED: No valid code patterns found');
        return false;
      }
    }
    
    console.log(`✅ CONTENT VALIDATION PASSED: ${filePath}`);
    return true;
  }

  /**
   * Legacy function for backward compatibility with existing agent system
   */
  static async processCodeBlocks(agentId, aiResponse, AgentCodebaseIntegration) {
    console.log(`🔍 AUTO-FILE-WRITER: Legacy processCodeBlocks called for ${agentId}`);
    
    const result = await this.processAgentResponse(aiResponse, agentId);
    
    return {
      filesWritten: result.filesWritten,
      modifiedResponse: result.modifiedResponse,
      totalProcessed: result.totalProcessed
    };
  }
}

export default AutoFileWriter;