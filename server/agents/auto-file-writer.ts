/**
 * AUTOMATIC FILE WRITING SYSTEM FOR REPLIT-STYLE AGENTS
 * Automatically writes agent code blocks to appropriate files
 */

export interface CodeBlock {
  content: string;
  language: string;
}

export interface FileWriteResult {
  filePath: string;
  success: boolean;
  error?: string;
  size: number;
}

export class AutoFileWriter {
  
  /**
   * Automatically detects and writes code blocks to appropriate files
   */
  static async processCodeBlocks(
    agentId: string, 
    aiResponse: string, 
    AgentCodebaseIntegration: any
  ): Promise<{ filesWritten: FileWriteResult[], modifiedResponse: string }> {
    
    const filesWritten: FileWriteResult[] = [];
    let modifiedResponse = aiResponse;
    
    // Extract all code blocks
    const codeBlockRegex = /```(?:typescript|tsx|javascript|js|css|html|json|)\n?([\s\S]*?)```/gi;
    const codeBlocks: CodeBlock[] = [];
    let match;
    
    while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
      codeBlocks.push({
        content: match[1].trim(),
        language: match[0].match(/```(\w+)/)?.[1] || 'typescript'
      });
    }
    
    console.log(`🔍 Found ${codeBlocks.length} code blocks for auto-writing`);
    
    // Process each code block
    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      const filePath = this.determineFilePath(block, agentId, aiResponse);
      
      if (filePath) {
        try {
          await AgentCodebaseIntegration.writeFile(agentId, filePath, block.content, `Auto-created by ${agentId}`);
          
          filesWritten.push({
            filePath,
            success: true,
            size: block.content.length
          });
          
          console.log(`✅ AUTO-WROTE: ${filePath} (${block.content.length} chars)`);
          
          // Replace code block with confirmation
          modifiedResponse = modifiedResponse.replace(
            /```[^`]*```/,
            `✅ **Created**: \`${filePath}\` (${block.content.length} characters)`
          );
          
        } catch (error) {
          filesWritten.push({
            filePath,
            success: false,
            error: error.message,
            size: block.content.length
          });
          
          console.error(`❌ Failed to auto-write ${filePath}:`, error);
        }
      }
    }
    
    return { filesWritten, modifiedResponse };
  }
  
  /**
   * Determines the appropriate file path for a code block
   */
  private static determineFilePath(block: CodeBlock, agentId: string, context: string): string | null {
    const content = block.content;
    
    // REACT COMPONENT DETECTION
    if (content.includes('export default function') || content.includes('export function')) {
      const componentMatch = content.match(/export\s+(?:default\s+)?function\s+([A-Z][a-zA-Z0-9]*)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        
        // Admin components
        if (componentName.includes('Admin') || context.toLowerCase().includes('admin')) {
          return `client/src/components/admin/${componentName}.tsx`;
        }
        
        // Visual editor components
        if (componentName.includes('Editor') || componentName.includes('Tab') || componentName.includes('Tree')) {
          return `client/src/components/visual-editor/${componentName}.tsx`;
        }
        
        // Regular components
        return `client/src/components/${componentName}.tsx`;
      }
    }
    
    // CONST COMPONENT DETECTION
    if (content.includes('const ') && content.includes('= (')) {
      const constMatch = content.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\(/);
      if (constMatch) {
        const componentName = constMatch[1];
        if (componentName.includes('Admin')) {
          return `client/src/components/admin/${componentName}.tsx`;
        }
        return `client/src/components/${componentName}.tsx`;
      }
    }
    
    // INTERFACE/TYPE DETECTION
    if (content.includes('interface ') || content.includes('type ')) {
      const typeMatch = content.match(/(?:interface|type)\s+([A-Z][a-zA-Z0-9]*)/);
      if (typeMatch) {
        return `shared/types/${typeMatch[1]}.ts`;
      }
    }
    
    // CSS DETECTION
    if (content.includes('@apply') || content.includes('--tw-') || content.includes('.css')) {
      return `client/src/styles/agent-generated.css`;
    }
    
    // SERVER/API DETECTION
    if (content.includes('app.') || content.includes('router.') || content.includes('express')) {
      return `server/routes/agent-generated.ts`;
    }
    
    // FALLBACK FOR ANY REACT-LIKE CODE
    if (content.includes('useState') || content.includes('React') || content.includes('jsx')) {
      return `client/src/components/agent-generated/${agentId}Component${Date.now()}.tsx`;
    }
    
    return null; // No automatic file writing for unrecognized code
  }
}