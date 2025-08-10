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
  static async validateAgentCode(
    filePath: string, 
    content: string, 
    agentId: string
  ): Promise<ValidationResult> {
    console.log(`🔍 REPLIT VALIDATOR: Checking ${filePath} for ${agentId}`);
    
    const validation: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fixes: []
    };
    
    try {
      if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        this.validateTypeScriptSyntax(content, validation);
      }
      
      if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
        this.validateReactSyntax(content, validation);
      }
      
      if (filePath.endsWith('.css')) {
        this.validateCSSSyntax(content, validation);
      }
      
    } catch (error) {
      validation.isValid = false;
      validation.errors.push({
        type: 'SYNTAX_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        line: this.extractLineNumber(error instanceof Error ? error.message : '')
      });
    }
    
    this.validateImports(content, validation);
    this.validateComponentReferences(content, validation);
    this.validateHookUsage(content, validation);
    
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
  
  private static validateTypeScriptSyntax(content: string, validation: ValidationResult): void {
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
  
  private static validateReactSyntax(content: string, validation: ValidationResult): void {
    const openTags = content.match(/<(\w+)(?:\s[^>]*)?\s*(?<!\/)\s*>/g) || [];
    const closeTags = content.match(/<\/(\w+)\s*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      validation.errors.push({
        type: 'JSX_ERROR',
        message: 'Unclosed JSX tags detected'
      });
    }
  }
  
  private static validateCSSSyntax(content: string, validation: ValidationResult): void {
    const patterns = [
      { pattern: /\{[^}]*\}/g, error: 'Missing closing brace in CSS' },
      { pattern: /[^}]*\}/g, error: 'Missing opening brace in CSS' },
      { pattern: /[^;}\n]*[:][^;}\n]*(?![;\n}])/g, error: 'Missing semicolon in CSS declaration' }
    ];
    
    patterns.forEach(({ pattern, error }) => {
      if (pattern.test(content)) {
        validation.warnings.push({ type: 'CSS_WARNING', message: error });
      }
    });
  }

  private static validateImports(content: string, validation: ValidationResult): void {
    const importLines = content.match(/import\s+.*?from\s+['"].*?['"]/g) || [];
    
    importLines.forEach(line => {
      if (!line.endsWith(';')) {
        validation.warnings.push({
          type: 'IMPORT_WARNING',
          message: 'Import statement missing semicolon'
        });
      }
      
      if (line.includes('..')) {
        validation.warnings.push({
          type: 'IMPORT_WARNING',
          message: 'Relative import paths should be avoided'
        });
      }
    });
  }

  private static validateComponentReferences(content: string, validation: ValidationResult): void {
    const componentRefs = content.match(/(?<=<)[A-Z]\w+/g) || [];
    const imports = content.match(/import\s+.*?from/g) || [];
    
    componentRefs.forEach(component => {
      if (!imports.some(imp => imp.includes(component))) {
        validation.warnings.push({
          type: 'COMPONENT_WARNING',
          message: `Component ${component} used but not imported`
        });
      }
    });
  }

  private static validateHookUsage(content: string, validation: ValidationResult): void {
    const hookCalls = content.match(/use[A-Z]\w+/g) || [];
    
    hookCalls.forEach(hook => {
      if (!content.includes('import') || !content.includes('react')) {
        validation.errors.push({
          type: 'HOOK_ERROR',
          message: `Hook ${hook} used but React not imported`
        });
      }
    });
  }

  private static autoFixCriticalIssues(content: string, validation: ValidationResult): string {
    let fixedContent = content;
    
    // Add missing semicolons to imports
    fixedContent = fixedContent.replace(
      /import\s+.*?from\s+['"].*?['"](?!\s*;)/g,
      match => `${match};`
    );
    
    // Fix hook dependencies
    fixedContent = fixedContent.replace(
      /useEffect\s*\(\s*\(\)\s*=>\s*{[\s\S]*?}\s*\)(?!\s*,\s*\[\])/g,
      match => `${match}, []`
    );
    
    return fixedContent;
  }

  private static extractLineNumber(errorMessage: string): number | undefined {
    const match = errorMessage.match(/line\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : undefined;
  }
}