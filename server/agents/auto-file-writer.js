/**
 * BULLETPROOF AUTOMATIC FILE WRITING SYSTEM FOR REPLIT-STYLE AGENTS
 * Automatically writes agent code blocks to appropriate files
 * WITH COMPREHENSIVE SAFETY VALIDATION TO PREVENT ALL CRASHES
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fsPromises = fs.promises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the comprehensive safety system
import ComprehensiveAgentSafety from './comprehensive-agent-safety.js';

// Enhanced validation patterns to prevent app crashes
const CRITICAL_VALIDATION_PATTERNS = [
  // Critical hook fixes
  { pattern: /useUser/g, replacement: 'useAuth', type: 'CRITICAL_HOOK_FIX' },
  { pattern: /import\s*{\s*useUser\s*}/g, replacement: 'import { useAuth }', type: 'CRITICAL_IMPORT_FIX' },
  
  // Critical component fixes
  { pattern: /AdminHero(?!Section)/g, replacement: 'AdminHeroSection', type: 'CRITICAL_COMPONENT_FIX' },
  { pattern: /import.*AdminHero[^S]/g, replacement: match => match.replace('AdminHero', 'AdminHeroSection'), type: 'CRITICAL_IMPORT_FIX' },
  
  // Critical path fixes
  { pattern: /from\s*['"]\.\.\/lib\/hooks['"]/, replacement: 'from "@/hooks/use-auth"', type: 'CRITICAL_PATH_FIX' },
  { pattern: /from\s*['"]\.\.\/hooks\/use-user['"]/, replacement: 'from "@/hooks/use-auth"', type: 'CRITICAL_PATH_FIX' },
  
  // JSX structure fixes
  { pattern: /<([A-Z]\w*)[^>]*(?<!\/)\s*>\s*$/gm, replacement: match => match.trim() + '\n', type: 'JSX_STRUCTURE_FIX' }
];

export class AutoFileWriter {

  /**
   * Determine file language from path
   */
  static getLanguageFromPath(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const extMap = {
      '.tsx': 'tsx',
      '.ts': 'typescript', 
      '.jsx': 'jsx',
      '.js': 'javascript',
      '.css': 'css',
      '.html': 'html',
      '.json': 'json'
    };
    return extMap[ext] || 'typescript';
  }

  /**
   * Smart file path determination based on content and agent context
   */
  static smartDetermineFilePath(content, agentId, language) {
    console.log(`🎯 AUTO-FILE-WRITER: Smart path determination for ${agentId}, language: ${language}`);
    
    // Check for component exports
    if (content.includes('export default function') || content.includes('export default class')) {
      const componentMatch = content.match(/export default (?:function|class)\s+(\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        
        // Agent-specific path logic
        if (agentId === 'aria' || componentName.includes('Admin') || componentName.includes('Dashboard')) {
          return `client/src/components/admin/${componentName}.tsx`;
        } else if (agentId === 'victoria' || componentName.includes('Build') || componentName.includes('Website')) {
          return `client/src/components/build/${componentName}.tsx`;
        } else if (componentName.includes('Page') || componentName.includes('Layout')) {
          return `client/src/pages/${componentName.toLowerCase().replace('page', '')}.tsx`;
        } else {
          return `client/src/components/${componentName}.tsx`;
        }
      }
    }
    
    // Default fallback
    const timestamp = Date.now();
    return `client/src/components/agent-generated-${agentId}-${timestamp}.tsx`;
  }
  
  /**
   * Automatically detects and writes code blocks to appropriate files
   */
  static async processCodeBlocks(agentId, aiResponse, AgentCodebaseIntegration) {
    
    console.log(`🔍 AUTO-FILE-WRITER ENTRY: Processing response for ${agentId}`);
    console.log(`🔍 AUTO-FILE-WRITER DEBUG: Response contains <write_to_file>: ${aiResponse.includes('<write_to_file>')}`);
    console.log(`🔍 AUTO-FILE-WRITER DEBUG: Response contains triple backticks: ${aiResponse.includes('```')}`);
    
    // Import Replit-style validator
    const { ReplitStyleAgentValidator } = await import('./replit-style-agent-validator.js');
    
    const filesWritten = [];
    let modifiedResponse = aiResponse;
    
    // ENHANCED: Extract ALL possible file creation patterns with improved detection
    const codeBlockRegex = /```(?:typescript|tsx|javascript|js|css|html|json|react)?\s*\n?([\s\S]*?)```/gi;
    const writeToFileRegex = /<write_to_file>\s*<path>(.*?)<\/path>\s*<content>([\s\S]*?)<\/content>\s*<\/write_to_file>/gi;
    const fileOperationRegex = /<file_operation>\s*<(?:create_file|modify_file)>\s*<path>(.*?)<\/path>\s*<content>([\s\S]*?)<\/content>\s*<\/(?:create_file|modify_file)>\s*<\/file_operation>/gi;
    const codeBlocks = [];
    let match;
    
    // PRIORITY 1: Check for XML-style file operations first (highest priority)
    let xmlMatch;
    while ((xmlMatch = writeToFileRegex.exec(aiResponse)) !== null) {
      const filePath = xmlMatch[1].trim();
      const content = xmlMatch[2].trim();
      console.log(`🎯 AUTO-FILE-WRITER: Found XML write_to_file for ${filePath}`);
      
      if (content.length > 10) {
        codeBlocks.push({
          content,
          filePath,
          language: this.getLanguageFromPath(filePath),
          source: 'xml_write_to_file',
          priority: 1
        });
      }
    }

    // PRIORITY 2: Check for file_operation tags  
    let fileOpMatch;
    while ((fileOpMatch = fileOperationRegex.exec(aiResponse)) !== null) {
      const filePath = fileOpMatch[1].trim();
      const content = fileOpMatch[2].trim();
      console.log(`🎯 AUTO-FILE-WRITER: Found file_operation for ${filePath}`);
      
      if (content.length > 10) {
        codeBlocks.push({
          content,
          filePath,
          language: this.getLanguageFromPath(filePath),
          source: 'file_operation',
          priority: 2
        });
      }
    }

    // PRIORITY 3: Check for code blocks inside details/summary tags
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
            language: innerMatch[0].match(/```(\w+)/)?.[1] || 'typescript',
            source: 'details_code_block',
            priority: 3
          });
        }
      }
    }
    
    // PRIORITY 4: Extract regular code blocks  
    while ((match = codeBlockRegex.exec(aiResponse)) !== null) {
      const content = match[1].trim();
      if (content.length > 10) {
        codeBlocks.push({
          content,
          language: match[0].match(/```(\w+)/)?.[1] || 'typescript',
          source: 'regular_code_block',
          priority: 4
        });
      }
    }

    // Sort by priority (XML file operations first, then file operations, then details, then regular)
    codeBlocks.sort((a, b) => (a.priority || 999) - (b.priority || 999));
    
    console.log(`🎯 AUTO-FILE-WRITER: Found ${codeBlocks.length} total code blocks to process`);
    codeBlocks.forEach((block, i) => {
      console.log(`   ${i+1}. ${block.source} (${block.language}) ${block.filePath ? '-> ' + block.filePath : ''}`);
    });
    
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
    console.log(`🔍 DEBUG: Response contains <write_to_file>: ${aiResponse.includes('<write_to_file>')}`);
    console.log(`🔍 DEBUG: Response contains triple backticks: ${aiResponse.includes('```')}`);
    console.log(`🔍 DEBUG: Response preview: "${aiResponse.substring(0, 200)}..."`);
    
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
    
    // Process each code block in priority order
    for (let i = 0; i < codeBlocks.length; i++) {
      const block = codeBlocks[i];
      
      console.log(`🔧 Processing code block ${i+1}/${codeBlocks.length}: ${block.source}`);
      
      // Determine file path
      let targetFilePath = block.filePath || this.smartDetermineFilePath(block.content, agentId, block.language);
      
      console.log(`📁 Target file path: ${targetFilePath}`);
      
      // Validate and clean the content before writing
      let cleanContent = block.content;
      
      // Apply critical validation patterns
      for (const validation of CRITICAL_VALIDATION_PATTERNS) {
        if (validation.pattern.test(cleanContent)) {
          console.log(`🔧 AUTO-FILE-WRITER: Applying ${validation.type} fix`);
          cleanContent = cleanContent.replace(validation.pattern, validation.replacement);
        }
      }
      
      // Use Replit-style validator for comprehensive safety
      const validation = ReplitStyleAgentValidator.validateCode(cleanContent, block.language);
      if (!validation.isValid) {
        console.log(`🚨 AUTO-FILE-WRITER: Code validation failed with ${validation.errors.length} errors`);
        validation.errors.forEach(error => console.log(`   ❌ ${error}`));
        
        // Apply auto-fixes if available
        if (validation.autoFixedCode) {
          console.log(`🔧 AUTO-FILE-WRITER: Applied auto-fixes`);
          cleanContent = validation.autoFixedCode;
        } else {
          console.log(`⏭️ AUTO-FILE-WRITER: Skipping invalid code block`);
          continue;
        }
      }
      
      try {
        // Write the file
        await AgentCodebaseIntegration.writeFile(targetFilePath, cleanContent);
        
        console.log(`✅ AUTO-FILE-WRITER: Successfully created ${targetFilePath}`);
        filesWritten.push({
          filePath: targetFilePath,
          language: block.language,
          source: block.source,
          contentLength: cleanContent.length,
          success: true
        });
        
        // Update the response to show file was created
        const fileCreationMessage = `\n\n✅ **File Created**: \`${targetFilePath}\` (${cleanContent.length} characters)\n`;
        modifiedResponse += fileCreationMessage;
        
      } catch (error) {
        console.error(`❌ AUTO-FILE-WRITER: Failed to write ${targetFilePath}:`, error);
        filesWritten.push({
          filePath: targetFilePath,
          language: block.language,
          source: block.source,
          error: error.message,
          success: false
        });
      }
    }
    
    // Return results
    console.log(`🎯 AUTO-FILE-WRITER COMPLETE: Processed ${filesWritten.length} files`);
    return {
      filesWritten,
      modifiedResponse,
      totalProcessed: codeBlocks.length
    };
  }
}
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
        
        // AUTO-INTEGRATION: Handle different component types
        if (filePath.includes('client/src/components/admin/')) {
          try {
            await this.autoIntegrateAdminComponent(filePath, block.content);
          } catch (integrationError) {
            console.error(`⚠️ Admin component integration failed for ${filePath}:`, integrationError);
          }
        } else if (filePath.includes('client/src/components/visual-editor/')) {
          try {
            await this.autoIntegrateVisualEditorComponent(filePath, block.content);
          } catch (integrationError) {
            console.error(`⚠️ Visual editor integration failed for ${filePath}:`, integrationError);
          }
        } else if (filePath.includes('client/src/pages/') && filePath.includes('-redesigned.tsx')) {
          try {
            await this.autoIntegrateRedesignedPage(filePath, block.content, context);
          } catch (integrationError) {
            console.error(`⚠️ Page integration failed for ${filePath}:`, integrationError);
          }
        } else if (filePath.includes('client/src/components/') && !filePath.includes('/admin/') && !filePath.includes('/visual-editor/')) {
          try {
            await this.autoIntegrateGenericComponent(filePath, block.content);
          } catch (integrationError) {
            console.error(`⚠️ Generic component integration failed for ${filePath}:`, integrationError);
          }
        }
      }
    }
    
    return { filesWritten, modifiedResponse };
  }

  /**
   * CRITICAL: Validates and fixes imports to prevent app crashes
   */
  static validateAndFixImports(content, filePath) {
    let fixed = content;
    let issues = [];

    // Apply all import fixes using CRITICAL_VALIDATION_PATTERNS
    CRITICAL_VALIDATION_PATTERNS.forEach(fix => {
      if (fix.pattern instanceof RegExp) {
        if (fix.pattern.test(fixed)) {
          fixed = fixed.replace(fix.pattern, fix.replacement);
          issues.push(`Fixed ${fix.type}: ${fix.pattern}`);
        }
      } else if (typeof fix.pattern === 'string' && fixed.includes(fix.pattern)) {
        fixed = fixed.replace(new RegExp(fix.pattern, 'g'), fix.replacement);
        issues.push(`Fixed ${fix.type}: ${fix.pattern}`);
      }
    });

    // Validate common problematic patterns
    const lines = fixed.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ')) {
        // Check for forbidden relative imports
        if (line.includes('../lib/hooks') || line.includes('./lib/hooks')) {
          issues.push(`Line ${index + 1}: Relative import detected and should be fixed`);
        }
        if (line.includes('../components/AdminHero')) {
          issues.push(`Line ${index + 1}: AdminHero import should use AdminHeroSection`);
        }
      }
    });

    if (issues.length > 0) {
      console.log(`🔧 IMPORT VALIDATION: Fixed ${issues.length} issues in ${filePath}`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }

    return fixed;
  }
  
  /**
   * Determines the appropriate file path for a code block
   */
  static determineFilePath(block, agentId, context) {
    const content = block.content;
    const contextLower = context.toLowerCase();
    
    // REACT COMPONENT DETECTION
    if (content.includes('export default function') || content.includes('export function') || content.includes('function ')) {
      const componentMatch = content.match(/(?:export\s+(?:default\s+)?)?function\s+([A-Z][a-zA-Z0-9]*)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        const componentLower = componentName.toLowerCase();
        
        // PAGES: Detect page redesign requests (create as pages, not components)
        if (contextLower.includes('page') && (
          contextLower.includes('redesign') || 
          contextLower.includes('create') || 
          contextLower.includes('new page')
        )) {
          // Determine page type from context and component name
          if (contextLower.includes('landing') || componentLower.includes('landing')) {
            return `client/src/pages/landing-redesigned.tsx`;
          }
          if (contextLower.includes('pricing') || componentLower.includes('pricing')) {
            return `client/src/pages/pricing-redesigned.tsx`;
          }
          if (contextLower.includes('workspace') || componentLower.includes('workspace')) {
            return `client/src/pages/workspace-redesigned.tsx`;
          }
          if (contextLower.includes('onboarding') || componentLower.includes('onboarding')) {
            return `client/src/pages/onboarding-redesigned.tsx`;
          }
          // Generic page creation
          return `client/src/pages/${componentName.toLowerCase()}.tsx`;
        }
        
        // CRITICAL: Apply file integration protocol for admin dashboard
        if (componentName.includes('Admin') || componentName.includes('Dashboard') || 
            contextLower.includes('admin') || contextLower.includes('dashboard')) {
          
          // Check if this is a redesign request for existing admin dashboard
          if (contextLower.includes('redesign') || contextLower.includes('improve') || 
              contextLower.includes('enhance') || contextLower.includes('update')) {
            console.log(`🔗 INTEGRATION: Redirecting admin dashboard redesign to existing file`);
            return `client/src/pages/admin-dashboard.tsx`;
          }
          
          return `client/src/components/admin/${componentName}.tsx`;
        }
        
        // COMPONENTS: Visual editor components
        if (componentName.includes('Editor') || componentName.includes('Tab') || 
            componentName.includes('Tree') || contextLower.includes('editor') || 
            contextLower.includes('visual')) {
          return `client/src/components/visual-editor/${componentName}.tsx`;
        }
        
        // COMPONENTS: UI components (Hero, Card, Modal, etc.)
        if (componentName.includes('Hero') || componentName.includes('Card') || 
            componentName.includes('Modal') || componentName.includes('Button') ||
            componentName.includes('Form') || componentName.includes('Header') ||
            componentName.includes('Footer') || componentName.includes('Nav')) {
          return `client/src/components/${componentName}.tsx`;
        }
        
        // CONTEXT-BASED COMPONENT DETECTION
        if (contextLower.includes('component') || contextLower.includes('redesign') && !contextLower.includes('page')) {
          return `client/src/components/${componentName}.tsx`;
        }
        
        // Default: Regular components
        return `client/src/components/${componentName}.tsx`;
      }
    }
    
    // CONST COMPONENT DETECTION
    if (content.includes('const ') && content.includes('= (')) {
      const constMatch = content.match(/const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\(/);
      if (constMatch) {
        const componentName = constMatch[1];
        
        // Apply same logic as function components
        if (componentName.includes('Admin') || componentName.includes('Dashboard') || contextLower.includes('admin') || contextLower.includes('dashboard')) {
          return `client/src/components/admin/${componentName}.tsx`;
        }
        if (componentName.includes('Editor') || componentName.includes('Tab') || componentName.includes('Tree') || contextLower.includes('editor') || contextLower.includes('visual')) {
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
    // Using fsPromises and path from ES module imports
    
    // Extract component name from file path
    const componentName = path.basename(filePath, '.tsx');
    
    // Read the main admin dashboard file
    const adminDashboardPath = 'client/src/pages/admin-dashboard.tsx';
    try {
      await fsPromises.access(adminDashboardPath);
    } catch {
      console.log(`⚠️ Admin dashboard not found at ${adminDashboardPath}`);
      return;
    }
    
    const adminDashboardContent = await fsPromises.readFile(adminDashboardPath, 'utf8');
    
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
    await fsPromises.writeFile(adminDashboardPath, updatedContent);
    
    console.log(`✅ Auto-integrated ${componentName} into admin dashboard`);
  }
  
  /**
   * Auto-integrates redesigned pages by creating route links
   */
  static async autoIntegrateRedesignedPage(filePath, componentContent, context) {
    // Using fsPromises and path from ES module imports
    
    // Extract page name from file path
    const pageName = path.basename(filePath, '.tsx');
    const originalPageName = pageName.replace('-redesigned', '');
    
    // Read the main App.tsx file
    const appPath = 'client/src/App.tsx';
    try {
      await fsPromises.access(appPath);
    } catch {
      console.log(`⚠️ App.tsx not found at ${appPath}`);
      return;
    }
    
    const appContent = await fsPromises.readFile(appPath, 'utf8');
    
    // Check if page is already imported
    const componentNamePascal = pageName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');
    
    const importStatement = `import ${componentNamePascal} from "@/pages/${pageName}";`;
    if (appContent.includes(importStatement)) {
      console.log(`✅ ${pageName} already integrated in App.tsx`);
      return;
    }
    
    // Add import after other page imports
    const existingImports = appContent.match(/import .* from ["']@\/pages\/.*["'];/g) || [];
    
    let updatedContent = appContent;
    if (existingImports.length > 0) {
      const lastImport = existingImports[existingImports.length - 1];
      const importIndex = appContent.indexOf(lastImport) + lastImport.length;
      updatedContent = appContent.slice(0, importIndex) + 
                     `\n${importStatement}` + 
                     appContent.slice(importIndex);
    }
    
    // Add route (commented out by default so it doesn't break existing routes)
    const routeComment = `\n          {/* <Route path="/${originalPageName}-redesigned" component={${componentNamePascal}} /> */}`;
    const routeIndex = updatedContent.indexOf('</Switch>');
    if (routeIndex !== -1) {
      updatedContent = updatedContent.slice(0, routeIndex) + 
                      routeComment + 
                      updatedContent.slice(routeIndex);
    }
    
    // Write the updated App.tsx
    await fsPromises.writeFile(appPath, updatedContent);
    
    console.log(`✅ Auto-integrated ${pageName} into App.tsx (route commented out)`);
  }
  
  /**
   * Auto-integrates visual editor components
   */
  static async autoIntegrateVisualEditorComponent(filePath, componentContent) {
    // Using fsPromises and path from ES module imports
    
    // Extract component name from file path
    const componentName = path.basename(filePath, '.tsx');
    
    // Read the main visual editor file
    const visualEditorPath = 'client/src/components/visual-editor/OptimizedVisualEditor.tsx';
    try {
      await fsPromises.access(visualEditorPath);
    } catch {
      console.log(`⚠️ Visual editor not found at ${visualEditorPath}`);
      return;
    }
    
    const visualEditorContent = await fsPromises.readFile(visualEditorPath, 'utf8');
    
    // Check if component is already imported
    const importStatement = `import ${componentName} from './${componentName}';`;
    if (visualEditorContent.includes(importStatement)) {
      console.log(`✅ ${componentName} already integrated in visual editor`);
      return;
    }
    
    // Add import after other visual editor imports
    const lastImportIndex = visualEditorContent.lastIndexOf("} from './");
    if (lastImportIndex !== -1) {
      const nextLineIndex = visualEditorContent.indexOf('\n', lastImportIndex);
      const updatedContent = visualEditorContent.slice(0, nextLineIndex) + 
                            `\nimport ${componentName} from './${componentName}';` + 
                            visualEditorContent.slice(nextLineIndex);
      
      // Write the updated visual editor
      await fsPromises.writeFile(visualEditorPath, updatedContent);
      
      console.log(`✅ Auto-integrated ${componentName} into visual editor`);
    }
  }
  
  /**
   * Auto-integrates generic components (creates index export)
   */
  static async autoIntegrateGenericComponent(filePath, componentContent) {
    // Using fsPromises and path from ES module imports
    
    // Extract component name from file path
    const componentName = path.basename(filePath, '.tsx');
    
    // Create or update components index file
    const componentsIndexPath = 'client/src/components/index.ts';
    let indexContent = '';
    
    try {
      await fsPromises.access(componentsIndexPath);
      indexContent = await fsPromises.readFile(componentsIndexPath, 'utf8');
    } catch {
      // File doesn't exist, will create new
    }
    
    // Check if component is already exported
    const exportStatement = `export { default as ${componentName} } from './${componentName}';`;
    if (indexContent.includes(exportStatement)) {
      console.log(`✅ ${componentName} already exported in components index`);
      return;
    }
    
    // Add export to index
    indexContent += `\n${exportStatement}`;
    
    // Write the updated index
    await fsPromises.writeFile(componentsIndexPath, indexContent);
    
    console.log(`✅ Auto-integrated ${componentName} into components index`);
  }
}