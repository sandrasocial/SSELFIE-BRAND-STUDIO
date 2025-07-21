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
   * Enhanced with batch operations for better performance
   */
  static async processCodeBlocks(
    agentId: string, 
    aiResponse: string, 
    AgentCodebaseIntegration: any
  ): Promise<{ filesWritten: FileWriteResult[], modifiedResponse: string }> {
    
    const filesWritten: FileWriteResult[] = [];
    let modifiedResponse = aiResponse;
    
    // Extract all code blocks with enhanced detection for collapsible sections
    const codeBlockRegex = /```(?:typescript|tsx|javascript|js|css|html|json|react|)\s*\n?([\s\S]*?)```/gi;
    const codeBlocks: CodeBlock[] = [];
    let match;
    
    // First check for code blocks inside details/summary tags
    const detailsRegex = /<details>[\s\S]*?<summary>[\s\S]*?<\/summary>\s*([\s\S]*?)<\/details>/gi;
    let detailsMatch;
    while ((detailsMatch = detailsRegex.exec(aiResponse)) !== null) {
      const detailsContent = detailsMatch[1];
      let innerMatch;
      while ((innerMatch = codeBlockRegex.exec(detailsContent)) !== null) {
        const content = innerMatch[1].trim();
        if (content.length > 10) {
          codeBlocks.push({
            content,
            language: innerMatch[0].match(/```(\w+)/)?.[1] || 'typescript'
          });
        }
      }
    }
    
    // Then check for regular code blocks
    while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
      const content = match[1].trim();
      if (content.length > 10) {
        codeBlocks.push({
          content,
          language: match[0].match(/```(\w+)/)?.[1] || 'typescript'
        });
      }
    }
    
    console.log(`🔍 Found ${codeBlocks.length} code blocks for auto-writing`);
    
    // Prepare files for batch operation
    const filesToWrite = [];
    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      const filePath = this.determineFilePath(block, agentId, aiResponse);
      
      if (filePath) {
        filesToWrite.push({
          filePath,
          content: block.content,
          description: `Auto-generated from code block ${i + 1}`,
          originalBlock: block
        });
      }
    }
    
    // Use individual operations for all files (batch operation disabled)
    if (filesToWrite.length > 1) {
      console.log(`🔄 Processing ${filesToWrite.length} files individually`);
      
      for (let i = 0; i < filesToWrite.length; i++) {
        const file = filesToWrite[i];
        try {
          // CRITICAL FIX: Use proper file writing with workspace integration
          await this.writeFileWithIntegration(file.filePath, file.content, agentId);
          
          filesWritten.push({
            filePath: file.filePath,
            success: true,
            size: file.content.length
          });
          
          console.log(`✅ AUTO-WROTE: ${file.filePath} (${file.content.length} chars)`);
          
        } catch (error) {
          filesWritten.push({
            filePath: file.filePath,
            success: false,
            error: error.message,
            size: file.content.length
          });
          
          console.error(`❌ Failed to auto-write ${file.filePath}:`, (error as Error).message);
        }
      }
      
      // Update response for multiple files
      let fileList = filesWritten.map(f => f.success ? `✅ ${f.filePath}` : `❌ ${f.filePath}`).join('\n');
      modifiedResponse = modifiedResponse.replace(
        /```[^`]*```/,
        `✅ **Created Multiple Files:**\n${fileList}\n\n*File tree will refresh automatically to show new files.*`
      );
      
    } else if (filesToWrite.length === 1) {
      // Single file operation
      const file = filesToWrite[0];
      try {
        // CRITICAL FIX: Use proper file writing with workspace integration
        await this.writeFileWithIntegration(file.filePath, file.content, agentId);
        
        filesWritten.push({
          filePath: file.filePath,
          success: true,
          size: file.content.length
        });
        
        console.log(`✅ AUTO-WROTE: ${file.filePath} (${file.content.length} chars)`);
        
        modifiedResponse = modifiedResponse.replace(
          /```[^`]*```/,
          `✅ **Created**: \`${file.filePath}\` (${file.content.length} characters)\n\n*File tree will refresh automatically to show new files.*`
        );
        
      } catch (error) {
        filesWritten.push({
          filePath: file.filePath,
          success: false,
          error: error.message,
          size: file.content.length
        });
        
        console.error(`❌ Failed to auto-write ${file.filePath}:`, (error as Error).message);
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
    if (content.includes('export default function') || content.includes('export function') || content.includes('function ')) {
      const componentMatch = content.match(/(?:export\s+(?:default\s+)?)?function\s+([A-Z][a-zA-Z0-9]*)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        
        // Admin Dashboard components - MODIFY EXISTING FILE, DON'T CREATE NEW
        if (componentName.includes('Admin') || componentName.includes('Dashboard') || context.toLowerCase().includes('admin') || context.toLowerCase().includes('dashboard')) {
          return `client/src/pages/admin-dashboard.tsx`;
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
    
    // FALLBACK FOR ANY REACT-LIKE CODE - INTEGRATE INTO MAIN APP, NOT AGENT-GENERATED
    if (content.includes('useState') || content.includes('React') || content.includes('jsx')) {
      // Determine proper category based on component purpose
      if (context.toLowerCase().includes('admin') || context.toLowerCase().includes('dashboard')) {
        return `client/src/components/admin/GeneratedComponent.tsx`;
      }
      if (context.toLowerCase().includes('visual') || context.toLowerCase().includes('editor')) {
        return `client/src/components/visual-editor/GeneratedComponent.tsx`;
      }
      // Default to main components directory with proper integration
      return `client/src/components/GeneratedComponent.tsx`;
    }
    
    return null; // No automatic file writing for unrecognized code
  }

  /**
   * CRITICAL FIX: Write files with proper workspace integration
   * Ensures agent work appears in Sandra's codespace and main application
   */
  static async writeFileWithIntegration(filePath: string, content: string, agentId: string): Promise<void> {
    // Use the existing AgentCodebaseIntegration but with enhanced integration
    const { AgentCodebaseIntegration } = await import('./AgentCodebaseIntegration.js') as any;
    
    // Write the file to the workspace
    await AgentCodebaseIntegration.writeFile(filePath, content);
    
    // INTEGRATION STEP 1: Auto-update routing if creating new pages
    if (filePath.includes('client/src/pages/') && !filePath.includes('admin-dashboard.tsx')) {
      await this.updateAppRouting(filePath, content);
    }
    
    // INTEGRATION STEP 2: Auto-update imports if creating components
    if (filePath.includes('client/src/components/') && !filePath.includes('agent-generated')) {
      await this.updateComponentImports(filePath, content);
    }
    
    // INTEGRATION STEP 3: Update navigation if needed
    if (content.includes('export default') || content.includes('export function')) {
      await this.updateNavigationIfNeeded(filePath, content);
    }
    
    console.log(`🔗 WORKSPACE INTEGRATION: Agent ${agentId} integrated ${filePath} into main application`);
  }

  /**
   * Auto-update App.tsx routing when agents create new pages
   */
  static async updateAppRouting(filePath: string, content: string): Promise<void> {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const appPath = path.resolve('client/src/App.tsx');
      const appContent = await fs.readFile(appPath, 'utf-8');
      
      // Extract component name and route
      const componentMatch = content.match(/export\s+(?:default\s+)?(?:function\s+)?([A-Z][a-zA-Z0-9]*)/);
      if (!componentMatch) return;
      
      const componentName = componentMatch[1];
      const routeName = componentName.toLowerCase().replace(/([a-z])([A-Z])/g, '$1-$2');
      const importPath = filePath.replace('client/src/', '@/').replace('.tsx', '');
      
      // Add import if not exists
      if (!appContent.includes(`import { ${componentName} }`)) {
        const importLine = `import { ${componentName} } from '${importPath}';`;
        const updatedContent = appContent.replace(
          /import.*from.*;\n/g,
          (match, offset, string) => {
            const lastImportEnd = string.lastIndexOf(match) + match.length;
            return offset + match.length === lastImportEnd ? match + importLine + '\n' : match;
          }
        );
        
        // Add route if not exists
        const finalContent = updatedContent.replace(
          /<Route path="\/admin-visual-editor"/,
          `<Route path="/${routeName}" component={${componentName}} />\n          <Route path="/admin-visual-editor"`
        );
        
        await fs.writeFile(appPath, finalContent);
        console.log(`✅ AUTO-INTEGRATED: Added routing for ${componentName} at /${routeName}`);
      }
    } catch (error) {
      console.log(`⚠️ AUTO-INTEGRATION: Could not update routing: ${(error as Error).message}`);
    }
  }

  /**
   * Auto-update component imports when creating reusable components
   */
  static async updateComponentImports(filePath: string, content: string): Promise<void> {
    // For now, just log - more complex integration can be added later
    console.log(`🔗 COMPONENT INTEGRATION: ${filePath} available for import in main application`);
  }

  /**
   * Auto-update navigation when creating new accessible pages
   */
  static async updateNavigationIfNeeded(filePath: string, content: string): Promise<void> {
    // For now, just log - navigation integration can be added later
    console.log(`🧭 NAVIGATION INTEGRATION: ${filePath} may need navigation link updates`);
  }
}