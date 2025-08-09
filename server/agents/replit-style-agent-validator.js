/**
 * REPLIT-STYLE AGENT CODE VALIDATOR
 * Catches errors before they crash the app, just like Replit's agent interface
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';

export class ReplitStyleAgentValidator {
  
  /**
   * Validates agent-generated code before writing to prevent crashes
   * Mimics Replit's real-time error detection
   */
  static async validateAgentCode(filePath, content, agentId) {
    console.log(`🔍 REPLIT VALIDATOR: Checking ${filePath} for ${agentId}`);
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: []
    };
    
    // 1. SYNTAX VALIDATION
    try {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        // TypeScript syntax check without compilation
        this.validateTypeScriptSyntax(content, validation);
      }
      
      if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
        // React JSX validation
        this.validateReactSyntax(content, validation);
      }
      
      if (filePath.endsWith('.css')) {
        // CSS syntax validation
        this.validateCSSSyntax(content, validation);
      }
      
    } catch (error) {
      validation.isValid = false;
      validation.errors.push({
        type: 'SYNTAX_ERROR',
        message: error.message,
        line: this.extractLineNumber(error.message)
      });
    }
    
    // 2. IMPORT VALIDATION (Critical for preventing crashes)
    this.validateImports(content, validation);
    
    // 3. COMPONENT REFERENCE VALIDATION
    this.validateComponentReferences(content, validation);
    
    // 4. HOOK VALIDATION
    this.validateHookUsage(content, validation);
    
    // 5. AUTO-FIX CRITICAL ISSUES
    if (!validation.isValid) {
      const fixedContent = this.autoFixCriticalIssues(content, validation);
      if (fixedContent !== content) {
        validation.fixedContent = fixedContent;
        validation.fixes.push('Applied automatic fixes for critical issues');
      }
    }
    
    console.log(`🔍 VALIDATION RESULT: ${validation.isValid ? '✅ PASSED' : '❌ FAILED'} - ${validation.errors.length} errors, ${validation.warnings.length} warnings`);
    
    return validation;
  }
  
  /**
   * Validates TypeScript syntax
   */
  static validateTypeScriptSyntax(content, validation) {
    // Check for common TypeScript errors
    const patterns = [
      { pattern: /import\s+\{[^}]+\}\s+from\s+['"][^'"]*['"]\s*(?![;,])/g, error: 'Missing semicolon after import' },
      { pattern: /export\s+default\s+function\s+\w+\([^)]*\)\s*{[\s\S]*?}(?!\s*;?\s*$)/g, error: 'Component not properly exported' },
      { pattern: /useState\s*\([^)]*\)\s*(?![;,=])/g, error: 'useState hook not properly assigned' },
      { pattern: /useEffect\s*\([^)]*\)\s*(?![;,])/g, error: 'useEffect hook missing dependency array' }
    ];
    
    patterns.forEach(({ pattern, error }) => {
      if (pattern.test(content)) {
        validation.warnings.push({ type: 'TYPESCRIPT_WARNING', message: error });
      }
    });
  }
  
  /**
   * Validates React JSX syntax
   */
  static validateReactSyntax(content, validation) {
    // Check for unclosed JSX tags
    const openTags = content.match(/<(\w+)(?:\s[^>]*)?\s*(?<!\/)\s*>/g) || [];
    const closeTags = content.match(/<\/(\w+)\s*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      validation.errors.push({
        type: 'JSX_ERROR',
        message: 'Unclosed JSX tags detected',
        severity: 'CRITICAL'
      });
      validation.isValid = false;
    }
    
    // Check for invalid JSX patterns
    if (content.includes('class=')) {
      validation.errors.push({
        type: 'JSX_ERROR',
        message: 'Use className instead of class in JSX',
        severity: 'CRITICAL'
      });
      validation.isValid = false;
    }
  }
  
  /**
   * Validates CSS syntax
   */
  static validateCSSSyntax(content, validation) {
    // Check for unclosed braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      validation.errors.push({
        type: 'CSS_ERROR',
        message: 'Unclosed CSS braces',
        severity: 'CRITICAL'
      });
      validation.isValid = false;
    }
  }
  
  /**
   * Validates imports to prevent crashes
   */
  static validateImports(content, validation) {
    const importLines = content.match(/import\s+.*?from\s+['"][^'"]+['"];?/g) || [];
    
    importLines.forEach(line => {
      // Check for problematic imports
      if (line.includes('useUser')) {
        validation.errors.push({
          type: 'IMPORT_ERROR',
          message: 'useUser hook does not exist - use useAuth instead',
          severity: 'CRITICAL',
          fix: line.replace('useUser', 'useAuth')
        });
        validation.isValid = false;
      }
      
      if (line.includes('../lib/hooks')) {
        validation.errors.push({
          type: 'IMPORT_ERROR', 
          message: 'Use absolute imports: @/hooks/use-auth instead of relative paths',
          severity: 'CRITICAL',
          fix: line.replace('../lib/hooks', '@/hooks/use-auth')
        });
        validation.isValid = false;
      }
      
      if (line.includes('AdminHero') && !line.includes('AdminHeroSection')) {
        validation.errors.push({
          type: 'IMPORT_ERROR',
          message: 'AdminHero component renamed to AdminHeroSection',
          severity: 'CRITICAL',
          fix: line.replace('AdminHero', 'AdminHeroSection')
        });
        validation.isValid = false;
      }
    });
  }
  
  /**
   * Validates component references
   */
  static validateComponentReferences(content, validation) {
    // Check for undefined component usage
    const jsxTags = content.match(/<(\w+)/g) || [];
    const imports = content.match(/import\s+\{([^}]+)\}/g) || [];
    const importedComponents = imports.join('').match(/\w+/g) || [];
    
    jsxTags.forEach(tag => {
      const componentName = tag.replace('<', '');
      if (componentName[0] === componentName[0].toUpperCase() && 
          !importedComponents.includes(componentName) &&
          !['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'input', 'form'].includes(componentName.toLowerCase())) {
        validation.warnings.push({
          type: 'COMPONENT_WARNING',
          message: `Component ${componentName} used but not imported`
        });
      }
    });
  }
  
  /**
   * Validates React hook usage
   */
  static validateHookUsage(content, validation) {
    // Check for hooks called outside component
    const hookCalls = content.match(/use\w+\s*\(/g) || [];
    const isInsideComponent = /export\s+default\s+function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g.test(content);
    
    if (hookCalls.length > 0 && !isInsideComponent) {
      validation.errors.push({
        type: 'HOOK_ERROR',
        message: 'Hooks can only be called inside React components',
        severity: 'CRITICAL'
      });
      validation.isValid = false;
    }
  }
  
  /**
   * Auto-fixes critical issues that would crash the app
   */
  static autoFixCriticalIssues(content, validation) {
    let fixedContent = content;
    
    validation.errors.forEach(error => {
      if (error.fix) {
        fixedContent = fixedContent.replace(error.message.split(' - ')[0], error.fix);
      }
    });
    
    // Apply standard fixes
    fixedContent = fixedContent.replace(/useUser/g, 'useAuth');
    fixedContent = fixedContent.replace(/from\s*['"]\.\.\/lib\/hooks['"]/, 'from "@/hooks/use-auth"');
    fixedContent = fixedContent.replace(/AdminHero(?!Section)/g, 'AdminHeroSection');
    fixedContent = fixedContent.replace(/class=/g, 'className=');
    
    return fixedContent;
  }
  
  /**
   * Extracts line number from error message
   */
  static extractLineNumber(errorMessage) {
    const match = errorMessage.match(/line\s+(\d+)/i);
    return match ? parseInt(match[1]) : null;
  }
}