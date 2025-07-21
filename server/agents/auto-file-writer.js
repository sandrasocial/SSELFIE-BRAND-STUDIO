/**
 * AUTOMATIC FILE WRITING SYSTEM FOR REPLIT-STYLE AGENTS
 * Automatically writes agent code blocks to appropriate files
 * WITH IMPORT VALIDATION TO PREVENT CRASHES
 */

// Import validation patterns to prevent app crashes
const VALID_IMPORT_FIXES = [
  // Fix useUser to useAuth
  { pattern: /import\s*{\s*useUser\s*}\s*from\s*['"][^'"]*['"]/, replacement: 'import { useAuth } from "@/hooks/use-auth"' },
  { pattern: /const\s*{\s*user\s*}\s*=\s*useUser\(\)/, replacement: 'const { user } = useAuth()' },
  // Fix relative imports to absolute
  { pattern: /from\s*['"]\.\.\/lib\/hooks['"]/, replacement: 'from "@/hooks/use-auth"' },
  { pattern: /from\s*['"]\.\.\/components\/AdminHero['"]/, replacement: 'from "@/components/admin/AdminHeroSection"' },
  // Fix component references
  { pattern: /<AdminHero\s/g, replacement: '<AdminHeroSection ' },
  { pattern: /AdminHero>/g, replacement: 'AdminHeroSection>' }
];

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
          // CRITICAL: Validate and fix imports before writing to prevent crashes
          let validatedContent = this.validateAndFixImports(block.content, filePath);
          
          await AgentCodebaseIntegration.writeFile(filePath, validatedContent);
          
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

    // Apply all import fixes
    VALID_IMPORT_FIXES.forEach(fix => {
      if (fix.pattern.test && fix.pattern.test(fixed)) {
        fixed = fixed.replace(fix.pattern, fix.replacement);
        issues.push('Fixed import pattern');
      } else if (typeof fix.pattern === 'string' && fixed.includes(fix.pattern)) {
        fixed = fixed.replace(new RegExp(fix.pattern, 'g'), fix.replacement);
        issues.push('Fixed import pattern');
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
        
        // COMPONENTS: Admin Dashboard components
        if (componentName.includes('Admin') || componentName.includes('Dashboard') || 
            contextLower.includes('admin') || contextLower.includes('dashboard')) {
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
  
  /**
   * Auto-integrates redesigned pages by creating route links
   */
  static async autoIntegrateRedesignedPage(filePath, componentContent, context) {
    const fs = require('fs');
    const path = require('path');
    
    // Extract page name from file path
    const pageName = path.basename(filePath, '.tsx');
    const originalPageName = pageName.replace('-redesigned', '');
    
    // Read the main App.tsx file
    const appPath = 'client/src/App.tsx';
    if (!fs.existsSync(appPath)) {
      console.log(`⚠️ App.tsx not found at ${appPath}`);
      return;
    }
    
    const appContent = fs.readFileSync(appPath, 'utf8');
    
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
    fs.writeFileSync(appPath, updatedContent);
    
    console.log(`✅ Auto-integrated ${pageName} into App.tsx (route commented out)`);
  }
  
  /**
   * Auto-integrates visual editor components
   */
  static async autoIntegrateVisualEditorComponent(filePath, componentContent) {
    const fs = require('fs');
    const path = require('path');
    
    // Extract component name from file path
    const componentName = path.basename(filePath, '.tsx');
    
    // Read the main visual editor file
    const visualEditorPath = 'client/src/components/visual-editor/OptimizedVisualEditor.tsx';
    if (!fs.existsSync(visualEditorPath)) {
      console.log(`⚠️ Visual editor not found at ${visualEditorPath}`);
      return;
    }
    
    const visualEditorContent = fs.readFileSync(visualEditorPath, 'utf8');
    
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
      fs.writeFileSync(visualEditorPath, updatedContent);
      
      console.log(`✅ Auto-integrated ${componentName} into visual editor`);
    }
  }
  
  /**
   * Auto-integrates generic components (creates index export)
   */
  static async autoIntegrateGenericComponent(filePath, componentContent) {
    const fs = require('fs');
    const path = require('path');
    
    // Extract component name from file path
    const componentName = path.basename(filePath, '.tsx');
    
    // Create or update components index file
    const componentsIndexPath = 'client/src/components/index.ts';
    let indexContent = '';
    
    if (fs.existsSync(componentsIndexPath)) {
      indexContent = fs.readFileSync(componentsIndexPath, 'utf8');
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
    fs.writeFileSync(componentsIndexPath, indexContent);
    
    console.log(`✅ Auto-integrated ${componentName} into components index`);
  }
}