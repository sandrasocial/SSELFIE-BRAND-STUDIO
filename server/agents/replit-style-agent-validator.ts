/**
 * REPLIT-STYLE AGENT CODE VALIDATOR
 * Catches errors before they crash the app, just like Replit's agent interface
 */

import fs from 'fs/promises';
import { execSync } from 'child_process';

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  fixes: string[];
  fixedContent?: string;
}

interface ValidationError {
  type: string;
  message: string;
  line?: number;
}

interface ValidationWarning {
  type: string;
  message: string;
}

export class ReplitStyleAgentValidator {
  /**
   * Validates agent-generated code before writing to prevent crashes
   * Mimics Replit's real-time error detection
   */
  static async validateAgentCode(filePath: string, content: string, agentId: string): Promise<ValidationResult> {
    console.log(`🔍 REPLIT VALIDATOR: Checking ${filePath} for ${agentId}`);
    
    const validation: ValidationResult = {
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
      
    } catch (error: any) {
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
  static validateTypeScriptSyntax(content: string, validation: ValidationResult): void {
    // Check for common TypeScript errors
    const patterns: Array<{ pattern: RegExp; error: string }> = [
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
  static validateReactSyntax(content: string, validation: ValidationResult): void {
    // Check for unclosed JSX tags
    const openTags = content.match(/<(\w+)(?:\s[^>]*)?\s*(?<!\/)\s*>/g) || [];
    const closeTags = content.match(/<\/(\w+)\s*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      validation.errors.push({
        type: 'JSX_ERROR',
        message: 'Mismatched JSX tags detected'
      });
    }
  }
  
  /**
   * Validates CSS syntax
   */
  static validateCSSSyntax(content: string, validation: ValidationResult): void {
    // Basic CSS validation
    const cssErrors = content.match(/{[^}]*}/g)?.filter(block => {
      return !block.includes(':') || !block.includes(';');
    });
    
    if (cssErrors?.length) {
      validation.errors.push({
        type: 'CSS_ERROR',
        message: 'Invalid CSS property syntax detected'
      });
    }
  }
  
  /**
   * Validates import statements
   */
  static validateImports(content: string, validation: ValidationResult): void {
    const importLines = content.match(/import\s+.*?from\s+['"].*?['"]/g) || [];
    
    importLines.forEach(line => {
      if (!line.endsWith(';')) {
        validation.warnings.push({
          type: 'IMPORT_WARNING',
          message: 'Missing semicolon in import statement'
        });
      }
    });
  }
  
  /**
   * Validates component references
   */
  static validateComponentReferences(content: string, validation: ValidationResult): void {
    const componentRefs = content.match(/(?<=<)\w+/g) || [];
    const definedComponents = content.match(/(?<=function\s+)\w+/g) || [];
    
    componentRefs.forEach(ref => {
      if (!definedComponents.includes(ref) && !ref.match(/^[a-z]/)) {
        validation.warnings.push({
          type: 'COMPONENT_WARNING',
          message: `Component "${ref}" is referenced but not defined`
        });
      }
    });
  }
  
  /**
   * Validates React hook usage
   */
  static validateHookUsage(content: string, validation: ValidationResult): void {
    // Check for hooks not at the top level
    const hookCalls = content.match(/use[A-Z]\w+\(/g) || [];
    const nestedHooks = content.match(/(?<=function\s+\w+\s*\([^)]*\)\s*{[\s\S]*?)use[A-Z]\w+\(/g) || [];
    
    if (nestedHooks.length > 0) {
      validation.errors.push({
        type: 'HOOK_ERROR',
        message: 'Hooks must be called at the top level'
      });
    }
  }
  
  /**
   * Attempts to fix critical issues automatically
   */
  static autoFixCriticalIssues(content: string, validation: ValidationResult): string {
    let fixedContent = content;
    
    // Add missing semicolons to imports
    fixedContent = fixedContent.replace(
      /import\s+.*?from\s+['"].*?['"]\s*(?!;)/g,
      match => `${match};`
    );
    
    // Fix common TypeScript/React issues
    fixedContent = fixedContent
      .replace(/useState\s*\([^)]*\)\s*(?![;,=])/g, match => `${match};`)
      .replace(/useEffect\s*\([^)]*\)\s*(?![;,])/g, match => `${match}, []);`);
    
    return fixedContent;
  }
  
  /**
   * Extracts line number from error message
   */
  static extractLineNumber(errorMessage: string): number | undefined {
    const match = errorMessage.match(/line\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : undefined;
  }
}