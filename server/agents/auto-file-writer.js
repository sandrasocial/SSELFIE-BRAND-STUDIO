/**
 * AUTOMATIC FILE WRITING SYSTEM FOR REPLIT-STYLE AGENTS
 * Automatically writes agent code blocks to appropriate files
 */

export class AutoFileWriter {
  
  /**
   * Automatically detects and writes code blocks to appropriate files
   */
  static async processCodeBlocks(agentId, aiResponse, AgentCodebaseIntegration) {
    
    const filesWritten = [];
    let modifiedResponse = aiResponse;
    
    // Extract all code blocks with enhanced detection for collapsible sections
    const codeBlockRegex = /```(?:typescript|tsx|javascript|js|css|html|json|react)?\s*\n?([\s\S]*?)```/gi;
    const codeBlocks = [];
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
    
    // SPECIAL DETECTION FOR VICTORIA'S FAKE RESPONSES
    // Look for file paths followed by descriptions but no actual code
    const fakeFilePattern = /(client\/src\/[^\s]+\.tsx?)\s*-\s*([^\n]+)/g;
    let fakeMatch;
    while ((fakeMatch = fakeFilePattern.exec(aiResponse)) !== null) {
      const filePath = fakeMatch[1];
      const description = fakeMatch[2];
      
      // Check if there's actual code following this file path
      const followingText = aiResponse.substring(fakeMatch.index + fakeMatch[0].length, fakeMatch.index + fakeMatch[0].length + 500);
      const hasActualCode = followingText.includes('```') || followingText.includes('import ') || followingText.includes('export ');
      
      if (!hasActualCode) {
        console.log(`🚨 DETECTED FAKE FILE CREATION: ${filePath} - ${description}`);
        console.log(`🚨 NO ACTUAL CODE FOUND FOR: ${filePath}`);
      }
    }
    
    console.log(`🔍 Found ${codeBlocks.length} code blocks for auto-writing`);
    
    // If no code blocks found, log details for debugging
    if (codeBlocks.length === 0) {
      console.log(`🚨 NO CODE BLOCKS DETECTED - Common issues:`);
      console.log(`   - Missing triple backticks: \`\`\`typescript`);
      console.log(`   - Missing component export: "export default function ComponentName()"`);
      console.log(`   - Missing React imports: "import React from 'react';"`);
      console.log(`   - Code too short (minimum 10 characters required)`);
      console.log(`🔍 Response text preview: "${aiResponse.substring(0, 500)}..."`);
      console.log(`🔍 Testing regex pattern: ${codeBlockRegex.source}`);
      console.log(`🔍 Looking for triple backticks in response: ${aiResponse.includes('```')}`);
    }
    
    // Process each code block
    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      const filePath = this.determineFilePath(block, agentId, aiResponse);
      
      if (filePath) {
        try {
          await AgentCodebaseIntegration.writeFile(filePath, block.content);
          
          filesWritten.push({
            filePath,
            success: true,
            size: block.content.length
          });
          
          console.log(`✅ AGENT FILE OPERATION SUCCESS: ${filePath} (${block.content.length} chars)`);
          
          // Replace code block with confirmation  
          modifiedResponse = modifiedResponse.replace(
            /```[^`]*```/,
            `✅ **Created**: \`${filePath}\` (${block.content.length} characters)\n\n*File tree will refresh automatically to show new files.*`
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
        
        // AUTO-INTEGRATION: If admin component was created, auto-integrate it
        if (filePath.includes('client/src/components/admin/')) {
          try {
            await this.autoIntegrateAdminComponent(filePath, block.content);
          } catch (integrationError) {
            console.error(`⚠️ Admin component integration failed for ${filePath}:`, integrationError);
          }
        }
      }
    }
    
    return { filesWritten, modifiedResponse };
  }
  
  /**
   * Determines the appropriate file path for a code block
   */
  static determineFilePath(block, agentId, context) {
    const content = block.content;
    
    // REACT COMPONENT DETECTION
    if (content.includes('export default function') || content.includes('export function') || content.includes('function ')) {
      const componentMatch = content.match(/(?:export\s+(?:default\s+)?)?function\s+([A-Z][a-zA-Z0-9]*)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        
        // Admin Dashboard components - CREATE AS COMPONENTS, NOT PAGES
        if (componentName.includes('Admin') || componentName.includes('Dashboard') || context.toLowerCase().includes('admin') || context.toLowerCase().includes('dashboard')) {
          return `client/src/components/admin/${componentName}.tsx`;
        }
        
        // Visual editor components
        if (componentName.includes('Editor') || componentName.includes('Tab') || componentName.includes('Tree')) {
          return `client/src/components/visual-editor/${componentName}.tsx`;
        }
        
        // Hero components
        if (componentName.includes('Hero') || componentName.includes('Landing') || componentName.includes('Header')) {
          return `client/src/components/${componentName}.tsx`;
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
        if (componentName.includes('Admin') || componentName.includes('Dashboard') || context.toLowerCase().includes('admin')) {
          return `client/src/components/admin/${componentName}.tsx`;
        }
        if (componentName.includes('Editor') || componentName.includes('Tab') || componentName.includes('Tree')) {
          return `client/src/components/visual-editor/${componentName}.tsx`;
        }
        return `client/src/components/${componentName}.tsx`;
      }
    }
    
    // CSS/STYLING DETECTION
    if (content.includes('@apply') || content.includes('class=') || content.includes('className=')) {
      return `client/src/styles/agent-generated.css`;
    }
    
    // TYPESCRIPT TYPES
    if (content.includes('interface ') || content.includes('type ') || content.includes('export type')) {
      return `shared/types.ts`;
    }
    
    // AGENT CONTEXT-BASED DETECTION
    if (agentId === 'aria') {
      // Aria creates UI components by default
      const nameMatch = content.match(/(?:function|const)\s+([A-Z][a-zA-Z0-9]*)/);
      if (nameMatch) {
        return `client/src/components/${nameMatch[1]}.tsx`;
      }
      return `client/src/components/AriaGenerated.tsx`;
    }
    
    if (agentId === 'zara') {
      // Zara creates backend/API components
      if (content.includes('app.')) {
        return `server/routes.ts`;
      }
      return `client/src/components/ZaraGenerated.tsx`;
    }
    
    return null;
  }
  
  /**
   * Auto-integrates admin components into the main admin dashboard
   */
  static async autoIntegrateAdminComponent(filePath, componentContent) {
    const fs = require('fs');
    const path = require('path');
    
    // Extract component name from file path
    const componentName = path.basename(filePath, '.tsx');
    
    // Read the main admin dashboard file
    const adminDashboardPath = 'client/src/pages/admin-dashboard.tsx';
    if (!fs.existsSync(adminDashboardPath)) {
      console.log(`⚠️ Admin dashboard not found at ${adminDashboardPath}`);
      return;
    }
    
    const adminDashboardContent = fs.readFileSync(adminDashboardPath, 'utf8');
    
    // Check if component is already imported
    const importStatement = `import ${componentName} from '@/components/admin/${componentName}';`;
    if (adminDashboardContent.includes(importStatement)) {
      console.log(`✅ ${componentName} already integrated in admin dashboard`);
      return;
    }
    
    // Find existing admin component imports
    const existingImports = adminDashboardContent.match(/import.*from ['"]@\/components\/admin\/.*['"];/g) || [];
    
    // Add new import after existing admin imports
    let updatedContent = adminDashboardContent;
    if (existingImports.length > 0) {
      const lastImport = existingImports[existingImports.length - 1];
      const importIndex = adminDashboardContent.indexOf(lastImport) + lastImport.length;
      updatedContent = adminDashboardContent.slice(0, importIndex) + 
                     `\nimport ${componentName} from '@/components/admin/${componentName}';` + 
                     adminDashboardContent.slice(importIndex);
    } else {
      // Add after regular imports
      const importMatch = adminDashboardContent.match(/import.*from ['"]@\/components\/.*['"];/);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const importIndex = adminDashboardContent.indexOf(lastImport) + lastImport.length;
        updatedContent = adminDashboardContent.slice(0, importIndex) + 
                       `\nimport ${componentName} from '@/components/admin/${componentName}';` + 
                       adminDashboardContent.slice(importIndex);
      }
    }
    
    // Write the updated admin dashboard
    fs.writeFileSync(adminDashboardPath, updatedContent);
    
    console.log(`✅ Auto-integrated ${componentName} into admin dashboard`);
  }
}