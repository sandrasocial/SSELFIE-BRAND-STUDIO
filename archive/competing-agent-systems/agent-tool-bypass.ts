// PERMANENT FIX: Direct tool execution bypass for Claude agents
// This bypasses Claude's tool execution and directly calls tools when agents should use them

import { join } from 'path';
import fs from 'fs';

export interface ToolExecution {
  toolName: string;
  input: any;
  result: any;
  success: boolean;
}

export class AgentToolBypass {
  
  static async executeStrReplaceBasedEditTool(input: any): Promise<any> {
    const { command, path, file_text, old_str, new_str, view_range } = input;
    
    try {
      const fullPath = path.startsWith('/') ? path : join(process.cwd(), path);
      
      switch (command) {
        case 'view':
          if (!fs.existsSync(fullPath)) {
            return { error: `File not found: ${path}` };
          }
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');
          
          if (view_range && Array.isArray(view_range) && view_range.length === 2) {
            const [start, end] = view_range;
            const selectedLines = lines.slice(start - 1, end === -1 ? undefined : end);
            const numberedLines = selectedLines.map((line, idx) => `${start + idx}\t${line}`);
            return { content: numberedLines.join('\n'), type: 'view', path: fullPath };
          } else {
            const numberedLines = lines.map((line, idx) => `${idx + 1}\t${line}`);
            return { content: numberedLines.join('\n'), type: 'view', path: fullPath };
          }
          
        case 'create':
          // Ensure directory exists
          const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(fullPath, file_text || '');
          return { success: true, message: `File created: ${path}`, type: 'create', path: fullPath };
          
        case 'str_replace':
          if (!fs.existsSync(fullPath)) {
            return { error: `File not found: ${path}` };
          }
          
          const originalContent = fs.readFileSync(fullPath, 'utf-8');
          if (!originalContent.includes(old_str)) {
            return { error: `String not found: ${old_str}` };
          }
          
          const newContent = originalContent.replace(old_str, new_str || '');
          fs.writeFileSync(fullPath, newContent);
          return { success: true, message: `File modified: ${path}`, type: 'str_replace', path: fullPath };
          
        default:
          return { error: `Unknown command: ${command}` };
      }
    } catch (error) {
      return { error: error.message };
    }
  }
  
  static detectFileOperation(message: string): { shouldUseTools: boolean; toolCalls: any[] } {
    const lowerMessage = message.toLowerCase();
    
    // ENHANCED DETECTION: Support Aria's sophisticated design requests
    const isFileOp = lowerMessage.includes('create') || 
                     lowerMessage.includes('view') || 
                     lowerMessage.includes('show') ||
                     lowerMessage.includes('file') ||
                     lowerMessage.includes('.tsx') ||
                     lowerMessage.includes('.ts') ||
                     lowerMessage.includes('.js') ||
                     lowerMessage.includes('component') ||
                     // ARIA DESIGN PATTERNS: Detect when Aria wants to modify existing files
                     lowerMessage.includes('redesign') ||
                     lowerMessage.includes('modify') ||
                     lowerMessage.includes('update') ||
                     lowerMessage.includes('enhance') ||
                     lowerMessage.includes('improve') ||
                     lowerMessage.includes('admin dashboard') ||
                     lowerMessage.includes('dashboard') ||
                     // SPECIFIC FILE REFERENCES: Direct file path mentions
                     message.includes('client/src/') ||
                     message.includes('server/') ||
                     // LUXURY DESIGN TERMS: Aria's design vocabulary
                     (lowerMessage.includes('luxury') && (lowerMessage.includes('design') || lowerMessage.includes('editorial'))) ||
                     // MODIFICATION REQUESTS: General file modification patterns
                     lowerMessage.includes('replace the') ||
                     lowerMessage.includes('change the') ||
                     lowerMessage.includes('update the');
    
    if (!isFileOp) {
      return { shouldUseTools: false, toolCalls: [] };
    }
    
    const toolCalls = [];
    
    // SPECIAL CASE: Admin Dashboard Redesign Detection
    if (lowerMessage.includes('admin dashboard') && (lowerMessage.includes('redesign') || lowerMessage.includes('modify') || lowerMessage.includes('update'))) {
      toolCalls.push({
        name: 'str_replace_based_edit_tool',
        input: {
          command: 'view',
          path: 'client/src/components/admin/AdminDashboard.tsx'
        }
      });
      return { shouldUseTools: true, toolCalls };
    }
    
    // Extract file creation patterns
    const createMatch = message.match(/create (?:file )?([^\s]+\.(?:tsx|ts|js|json|md))/i);
    if (createMatch) {
      const filePath = createMatch[1];
      
      // Extract content if provided
      let content = '';
      const contentMatch = message.match(/with content:?\s*(.+)/is);
      if (contentMatch) {
        content = contentMatch[1].trim();
      } else {
        // Generate basic content based on file type
        if (filePath.endsWith('.tsx')) {
          const componentName = filePath.split('/').pop()?.replace('.tsx', '') || 'Component';
          content = `import React from 'react';\n\nexport default function ${componentName}() {\n  return (\n    <div>\n      <h1>${componentName}</h1>\n    </div>\n  );\n}`;
        }
      }
      
      toolCalls.push({
        name: 'str_replace_based_edit_tool',
        input: {
          command: 'create',
          path: filePath,
          file_text: content
        }
      });
    }
    
    // Extract view patterns - BUT PREVENT INVALID FILE PATHS FROM CONVERSATIONAL LANGUAGE
    const viewMatch = message.match(/(?:view|show) (?:file )?([^\s]+)/i);
    if (viewMatch && !createMatch) {
      const filePath = viewMatch[1];
      
      // 🚨 CRITICAL FIX: Prevent conversational words from being treated as file paths
      const invalidPaths = ['me', 'the', 'files', 'that', 'this', 'them', 'it', 'all', 'what', 'where', 'which'];
      if (invalidPaths.includes(filePath.toLowerCase()) || filePath.length < 3) {
        console.log(`❌ BYPASS INVALID PATH DETECTED: "${filePath}" - Skipping tool call`);
        // Don't add tool call for invalid paths - let normal conversation handle it
        return { shouldUseTools: false, toolCalls: [] };
      }
      
      toolCalls.push({
        name: 'str_replace_based_edit_tool', 
        input: {
          command: 'view',
          path: filePath
        }
      });
    }
    
    // ARIA FILE MODIFICATION PATTERNS: Handle requests to modify specific files
    const modifyPatterns = [
      /(?:redesign|modify|update|enhance|improve)\s+(?:the\s+)?(?:file\s+)?([^\s]+\.(?:tsx|ts|js))/i,
      /work\s+on\s+(?:the\s+)?(?:file\s+)?([^\s]+\.(?:tsx|ts|js))/i,
      /(client\/src\/[^\s]+\.(?:tsx|ts|js))/i,
      /(server\/[^\s]+\.(?:tsx|ts|js))/i
    ];
    
    for (const pattern of modifyPatterns) {
      const match = message.match(pattern);
      if (match && !createMatch && !viewMatch) {
        const filePath = match[1];
        
        // First, view the file to understand its current state
        toolCalls.push({
          name: 'str_replace_based_edit_tool',
          input: {
            command: 'view',
            path: filePath
          }
        });
        break; // Only process first match to avoid duplicates
      }
    }
    
    // ADMIN DASHBOARD SPECIFIC: Handle requests to work on admin dashboard
    if (lowerMessage.includes('admin dashboard') && !createMatch) {
      const adminDashboardPath = 'client/src/components/admin/AdminDashboard.tsx';
      toolCalls.push({
        name: 'str_replace_based_edit_tool',
        input: {
          command: 'view',
          path: adminDashboardPath
        }
      });
    }
    
    return { shouldUseTools: toolCalls.length > 0, toolCalls };
  }
  
  static async processToolBypass(message: string, agentId: string): Promise<{ response: string; toolExecutions: ToolExecution[] }> {
    const detection = this.detectFileOperation(message);
    
    if (!detection.shouldUseTools) {
      return { response: '', toolExecutions: [] };  
    }
    
    const toolExecutions: ToolExecution[] = [];
    let response = '';
    
    for (const toolCall of detection.toolCalls) {
      if (toolCall.name === 'str_replace_based_edit_tool') {
        const result = await this.executeStrReplaceBasedEditTool(toolCall.input);
        
        toolExecutions.push({
          toolName: toolCall.name,
          input: toolCall.input,
          result,
          success: !result.error
        });
        
        if (result.error) {
          response += `❌ Error: ${result.error}\n`;
        } else {
          switch (toolCall.input.command) {
            case 'create':
              response += `✅ Created file: ${toolCall.input.path}\n`;
              break;
            case 'view':
              response += `📁 Viewing ${toolCall.input.path}:\n\`\`\`\n${result.content}\n\`\`\`\n`;
              break;
            case 'str_replace':
              response += `✅ Modified file: ${toolCall.input.path}\n`;
              break;
          }
        }
      }
    }
    
    return { response, toolExecutions };
  }
}