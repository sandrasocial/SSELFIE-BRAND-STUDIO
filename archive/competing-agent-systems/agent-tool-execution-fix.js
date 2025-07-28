/**
 * COMPREHENSIVE AGENT TOOL EXECUTION FIX
 * Addresses the core issue where agents cannot properly modify files
 */

import { promises as fs } from 'fs';
import path from 'path';

// Enhanced string matching with multiple fallback strategies
export async function enhancedStringMatch(content, searchStr) {
  console.log(`🔍 ENHANCED MATCH: Searching for string of length ${searchStr.length}`);
  
  // Strategy 1: Exact match
  if (content.includes(searchStr)) {
    console.log(`✅ EXACT MATCH: Found exact string match`);
    return { strategy: 'exact', index: content.indexOf(searchStr) };
  }
  
  // Strategy 2: Normalize whitespace
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  const normalizedSearch = searchStr.replace(/\s+/g, ' ').trim();
  
  if (normalizedContent.includes(normalizedSearch)) {
    console.log(`✅ NORMALIZED MATCH: Found with normalized whitespace`);
    // Find original position by mapping normalized to original
    let originalIndex = -1;
    let normalizedIndex = normalizedContent.indexOf(normalizedSearch);
    
    if (normalizedIndex !== -1) {
      let charCount = 0;
      let normalizedCount = 0;
      
      for (let i = 0; i < content.length && normalizedCount <= normalizedIndex; i++) {
        if (normalizedCount === normalizedIndex) {
          originalIndex = charCount;
          break;
        }
        charCount++;
        if (!/\s/.test(content[i])) {
          normalizedCount++;
        } else if (/\s/.test(content[i]) && normalizedContent[normalizedCount] === ' ') {
          normalizedCount++;
        }
      }
    }
    
    return { strategy: 'normalized', index: originalIndex };
  }
  
  // Strategy 3: Line-by-line fuzzy matching
  const contentLines = content.split('\n');
  const searchLines = searchStr.split('\n');
  
  if (searchLines.length > 1) {
    const firstLine = searchLines[0].trim();
    
    for (let i = 0; i < contentLines.length; i++) {
      if (contentLines[i].trim() === firstLine) {
        console.log(`🎯 FIRST LINE MATCH: Found at line ${i + 1}`);
        
        // Check if subsequent lines match
        let allLinesMatch = true;
        for (let j = 1; j < searchLines.length && allLinesMatch; j++) {
          const contentLine = contentLines[i + j]?.trim() || '';
          const searchLine = searchLines[j].trim();
          
          if (contentLine !== searchLine) {
            allLinesMatch = false;
          }
        }
        
        if (allLinesMatch) {
          console.log(`✅ MULTI-LINE MATCH: All ${searchLines.length} lines matched`);
          // Calculate character index
          let charIndex = 0;
          for (let k = 0; k < i; k++) {
            charIndex += contentLines[k].length + 1; // +1 for newline
          }
          return { strategy: 'multiline', index: charIndex, lineStart: i, lineCount: searchLines.length };
        }
      }
    }
  }
  
  // Strategy 4: Substring matching for large blocks
  if (searchStr.length > 100) {
    const searchStart = searchStr.substring(0, 50).trim();
    const searchEnd = searchStr.substring(searchStr.length - 50).trim();
    
    const startIndex = content.indexOf(searchStart);
    const endIndex = content.lastIndexOf(searchEnd);
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      console.log(`✅ SUBSTRING MATCH: Found start and end markers`);
      return { strategy: 'substring', index: startIndex, endIndex: endIndex + searchEnd.length };
    }
  }
  
  console.log(`❌ NO MATCH: All strategies failed`);
  return null;
}

// Enhanced file replacement with multiple strategies
export async function enhancedFileReplace(filePath, oldStr, newStr) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const matchResult = await enhancedStringMatch(content, oldStr);
    
    if (!matchResult) {
      throw new Error(`No matching strategy succeeded for string replacement in ${filePath}`);
    }
    
    let newContent;
    
    switch (matchResult.strategy) {
      case 'exact':
        newContent = content.replace(oldStr, newStr);
        break;
        
      case 'normalized':
        // Use regex with flexible whitespace
        const flexiblePattern = oldStr.replace(/\s+/g, '\\s+').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(flexiblePattern);
        newContent = content.replace(regex, newStr);
        break;
        
      case 'multiline':
        const lines = content.split('\n');
        lines.splice(matchResult.lineStart, matchResult.lineCount, ...newStr.split('\n'));
        newContent = lines.join('\n');
        break;
        
      case 'substring':
        const beforeMatch = content.substring(0, matchResult.index);
        const afterMatch = content.substring(matchResult.endIndex);
        newContent = beforeMatch + newStr + afterMatch;
        break;
        
      default:
        throw new Error(`Unknown matching strategy: ${matchResult.strategy}`);
    }
    
    await fs.writeFile(filePath, newContent, 'utf8');
    console.log(`✅ FILE UPDATED: Used ${matchResult.strategy} strategy for ${filePath}`);
    
    return `File updated successfully using ${matchResult.strategy} matching: ${filePath}`;
    
  } catch (error) {
    console.error(`❌ ENHANCED REPLACE FAILED:`, error);
    throw error;
  }
}

// Plan B: Direct agent execution bypass
export class AgentExecutionBypass {
  constructor() {
    this.executionQueue = [];
    this.isProcessing = false;
  }
  
  // Queue agent file operations for direct execution
  // CRITICAL: This system ONLY executes the EXACT code that agents generate
  // It does NOT create designs - it only applies Aria's designs when tools fail
  async queueOperation(agentId, operation, filePath, content) {
    console.log(`📋 PLAN B QUEUE: ${agentId} operation ${operation} on ${filePath}`);
    
    // BRAND PROTECTION: Only allow specific agents to modify design files
    if (filePath.includes('components/') || filePath.includes('pages/')) {
      if (agentId !== 'aria' && agentId !== 'zara') {
        console.error(`🚨 BRAND PROTECTION: ${agentId} blocked from modifying ${filePath} - only Aria can design!`);
        throw new Error(`Brand protection: Only Aria can modify design components, not ${agentId}`);
      }
    }
    
    this.executionQueue.push({
      agentId,
      operation,
      filePath,
      content,
      timestamp: Date.now(),
      status: 'queued',
      designerApproved: agentId === 'aria' || agentId === 'zara'
    });
    
    if (!this.isProcessing) {
      await this.processQueue();
    }
  }
  
  // Process queued operations directly
  async processQueue() {
    this.isProcessing = true;
    console.log(`🔄 PLAN B PROCESSING: ${this.executionQueue.length} operations in queue`);
    
    while (this.executionQueue.length > 0) {
      const operation = this.executionQueue.shift();
      operation.status = 'processing';
      
      try {
        let result;
        
        // CRITICAL: Verify designer authorization for design files
        if (!operation.designerApproved && (operation.filePath.includes('components/') || operation.filePath.includes('pages/'))) {
          throw new Error(`BRAND PROTECTION: ${operation.agentId} cannot modify design files - only Aria approved!`);
        }
        
        switch (operation.operation) {
          case 'create':
            // IMPORTANT: This creates the EXACT file content that Aria designed
            await fs.mkdir(path.dirname(operation.filePath), { recursive: true });
            await fs.writeFile(operation.filePath, operation.content, 'utf8');
            result = `File created with ${operation.agentId}'s exact content: ${operation.filePath}`;
            break;
            
          case 'str_replace':
            // IMPORTANT: This applies the EXACT changes that Aria specified
            result = await enhancedFileReplace(
              operation.filePath, 
              operation.content.oldStr, 
              operation.content.newStr
            );
            break;
            
          case 'view':
            const fileContent = await fs.readFile(operation.filePath, 'utf8');
            result = `File viewed: ${operation.filePath} (${fileContent.length} characters)`;
            break;
            
          default:
            throw new Error(`Unknown operation: ${operation.operation}`);
        }
        
        operation.status = 'completed';
        operation.result = result;
        
        console.log(`✅ PLAN B SUCCESS: ${operation.agentId} ${operation.operation} completed`);
        
        // Trigger visual editor refresh
        global.lastFileChange = {
          timestamp: Date.now(),
          operation: operation.operation,
          filePath: operation.filePath,
          needsRefresh: true,
          executedBy: `plan-b-${operation.agentId}`
        };
        
      } catch (error) {
        operation.status = 'failed';
        operation.error = error.message;
        console.error(`❌ PLAN B FAILED: ${operation.agentId} ${operation.operation}:`, error);
      }
    }
    
    this.isProcessing = false;
    console.log(`✅ PLAN B COMPLETE: All queued operations processed`);
  }
  
  // Get execution status
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.executionQueue.length,
      recentOperations: this.executionQueue.slice(-10)
    };
  }
}

// Global Plan B instance
export const planBExecutor = new AgentExecutionBypass();

// Agent communication interceptor
export async function interceptAgentExecution(agentId, message, toolCalls) {
  console.log(`🎯 INTERCEPTING: ${agentId} execution with ${toolCalls?.length || 0} tool calls`);
  
  // Check if agent is attempting file operations
  const fileOperations = toolCalls?.filter(call => 
    call.name === 'str_replace_based_edit_tool'
  ) || [];
  
  if (fileOperations.length > 0) {
    console.log(`🚨 PLAN B ACTIVATION: ${agentId} attempting ${fileOperations.length} file operations`);
    
    // Queue operations for Plan B execution
    for (const operation of fileOperations) {
      await planBExecutor.queueOperation(
        agentId,
        operation.input.command,
        operation.input.path,
        operation.input
      );
    }
    
    return {
      success: true,
      message: `Plan B activated: ${fileOperations.length} operations queued for direct execution`,
      planBActivated: true
    };
  }
  
  return null; // No interception needed
}