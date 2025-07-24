/**
 * ERROR DETECTION INTELLIGENCE SYSTEM
 * 
 * Provides real-time error detection and prevention capabilities for Sandra's AI agents,
 * matching and exceeding Replit AI's ability to detect and prevent coding errors.
 * 
 * Key Features:
 * - Pre-execution code validation
 * - Syntax error detection
 * - TypeScript error prevention
 * - File integrity checks
 * - Dangerous pattern detection
 * - Auto-correction suggestions
 */

import * as fs from 'fs/promises';
import * as path from 'path';

export interface ErrorDetectionResult {
  hasErrors: boolean;
  errors: DetectedError[];
  warnings: DetectedWarning[];
  suggestions: ErrorSuggestion[];
  correctedContent?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface DetectedError {
  type: 'syntax' | 'typescript' | 'import' | 'structure' | 'security';
  message: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning' | 'info';
  fixable: boolean;
}

export interface DetectedWarning {
  type: 'performance' | 'style' | 'compatibility' | 'maintenance';
  message: string;
  line?: number;
  suggestion: string;
}

export interface ErrorSuggestion {
  description: string;
  fix: string;
  confidence: number; // 0-100
  autoApply: boolean;
}

export class ErrorDetectionIntelligence {
  
  /**
   * Main error detection function - analyzes content before file operations
   */
  static async detectErrors(
    filePath: string,
    content: string,
    operation: 'create' | 'edit' | 'replace'
  ): Promise<ErrorDetectionResult> {
    
    console.log(`🔍 ERROR DETECTION: Analyzing ${operation} operation on ${filePath}`);
    
    const errors: DetectedError[] = [];
    const warnings: DetectedWarning[] = [];
    const suggestions: ErrorSuggestion[] = [];
    
    // 1. DANGEROUS PATTERN DETECTION (Critical)
    const dangerousPatterns = await this.detectDangerousPatterns(content, filePath);
    errors.push(...dangerousPatterns);
    
    // 2. SYNTAX VALIDATION (High Priority)
    const syntaxErrors = await this.validateSyntax(content, filePath);
    errors.push(...syntaxErrors);
    
    // 3. TYPESCRIPT VALIDATION (High Priority)
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      const tsErrors = await this.validateTypeScript(content, filePath);
      errors.push(...tsErrors);
    }
    
    // 4. IMPORT/DEPENDENCY VALIDATION (Medium Priority)
    const importErrors = await this.validateImports(content, filePath);
    errors.push(...importErrors);
    
    // 5. STRUCTURE VALIDATION (Medium Priority)
    const structureWarnings = await this.validateStructure(content, filePath);
    warnings.push(...structureWarnings);
    
    // 6. GENERATE AUTO-CORRECTIONS (If Possible)
    let correctedContent: string | undefined;
    if (errors.some(e => e.fixable)) {
      correctedContent = await this.generateAutoCorrection(content, errors);
      
      if (correctedContent && correctedContent !== content) {
        suggestions.push({
          description: "Auto-corrected detected errors",
          fix: "Applied automatic fixes for common issues",
          confidence: 85,
          autoApply: true
        });
      }
    }
    
    // Determine overall severity
    const severity = this.calculateSeverity(errors);
    
    console.log(`🔍 ERROR DETECTION: Found ${errors.length} errors, ${warnings.length} warnings (${severity} severity)`);
    
    return {
      hasErrors: errors.length > 0,
      errors,
      warnings,
      suggestions,
      correctedContent,
      severity
    };
  }
  
  /**
   * Detect dangerous patterns that could break the application
   */
  private static async detectDangerousPatterns(content: string, filePath: string): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    
    // File tree structures in CSS/JS files
    if (content.includes('├──') || content.includes('└──') || content.includes('│')) {
      errors.push({
        type: 'structure',
        message: 'File contains file tree structure - this will break CSS/JS parsing',
        severity: 'error',
        fixable: true
      });
    }
    
    // SQL injection patterns
    if (content.includes('DROP TABLE') || content.includes('DELETE FROM') && !filePath.includes('migration')) {
      errors.push({
        type: 'security',
        message: 'Potentially dangerous SQL operation detected',
        severity: 'error',
        fixable: false
      });
    }
    
    // Infinite loops
    if (content.includes('while(true)') || content.includes('for(;;)')) {
      errors.push({
        type: 'structure',
        message: 'Potential infinite loop detected - could crash application',
        severity: 'error',
        fixable: false
      });
    }
    
    // Missing semicolons in critical contexts
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.trim().match(/^(import|export|const|let|var|function|class)\s+.*[^;{}\s]$/)) {
        errors.push({
          type: 'syntax',
          message: 'Missing semicolon - could cause parsing issues',
          line: index + 1,
          severity: 'warning',
          fixable: true
        });
      }
    });
    
    return errors;
  }
  
  /**
   * Validate basic syntax patterns
   */
  private static async validateSyntax(content: string, filePath: string): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    
    // Bracket matching
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack: string[] = [];
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      if (Object.keys(brackets).includes(char)) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop();
        if (!last || brackets[last as keyof typeof brackets] !== char) {
          errors.push({
            type: 'syntax',
            message: `Unmatched bracket: ${char}`,
            severity: 'error',
            fixable: false
          });
        }
      }
    }
    
    if (stack.length > 0) {
      errors.push({
        type: 'syntax',
        message: `Unclosed brackets: ${stack.join(', ')}`,
        severity: 'error',
        fixable: false
      });
    }
    
    // Quote matching
    const quotes = ['"', "'", '`'];
    quotes.forEach(quote => {
      const matches = (content.match(new RegExp(quote, 'g')) || []).length;
      if (matches % 2 !== 0) {
        errors.push({
          type: 'syntax',
          message: `Unmatched quote: ${quote}`,
          severity: 'error',
          fixable: true
        });
      }
    });
    
    return errors;
  }
  
  /**
   * Validate TypeScript-specific issues
   */
  private static async validateTypeScript(content: string, filePath: string): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    
    // Check for common TypeScript errors
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Missing type annotations on function parameters
      if (line.includes('function') && line.includes('(') && !line.includes(':') && !line.includes('any')) {
        errors.push({
          type: 'typescript',
          message: 'Function parameter missing type annotation',
          line: index + 1,
          severity: 'warning',
          fixable: false
        });
      }
      
      // Unused imports
      if (line.trim().startsWith('import') && !content.includes(line.match(/import\s+{([^}]+)}/)?.[1]?.trim() || '')) {
        errors.push({
          type: 'typescript',
          message: 'Potentially unused import',
          line: index + 1,
          severity: 'info',
          fixable: true
        });
      }
    });
    
    return errors;
  }
  
  /**
   * Validate imports and dependencies
   */
  private static async validateImports(content: string, filePath: string): Promise<DetectedError[]> {
    const errors: DetectedError[] = [];
    
    const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
    
    for (const importLine of importLines) {
      // Check for relative imports that might not exist
      const relativeImportMatch = importLine.match(/from\s+['"](\.\/.+)['"]/);
      if (relativeImportMatch) {
        const importPath = relativeImportMatch[1];
        const fullPath = path.resolve(path.dirname(filePath), importPath);
        
        try {
          await fs.access(fullPath);
        } catch {
          // Try with common extensions
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          let found = false;
          
          for (const ext of extensions) {
            try {
              await fs.access(fullPath + ext);
              found = true;
              break;
            } catch {}
          }
          
          if (!found) {
            errors.push({
              type: 'import',
              message: `Import path may not exist: ${importPath}`,
              severity: 'error',
              fixable: false
            });
          }
        }
      }
    }
    
    return errors;
  }
  
  /**
   * Validate file structure and organization
   */
  private static async validateStructure(content: string, filePath: string): Promise<DetectedWarning[]> {
    const warnings: DetectedWarning[] = [];
    
    // Check file size
    if (content.length > 5000) {
      warnings.push({
        type: 'maintenance',
        message: 'File is quite large - consider breaking into smaller modules',
        suggestion: 'Split into multiple files or extract reusable components'
      });
    }
    
    // Check for excessive nesting
    const maxIndentation = Math.max(...content.split('\n').map(line => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    }));
    
    if (maxIndentation > 20) {
      warnings.push({
        type: 'style',
        message: 'Deep nesting detected - consider refactoring',
        suggestion: 'Extract nested logic into separate functions'
      });
    }
    
    return warnings;
  }
  
  /**
   * Generate automatic corrections for fixable errors
   */
  private static async generateAutoCorrection(content: string, errors: DetectedError[]): Promise<string> {
    let corrected = content;
    
    for (const error of errors.filter(e => e.fixable)) {
      switch (error.type) {
        case 'structure':
          // Remove file tree patterns
          corrected = corrected.replace(/├──.*\n/g, '');
          corrected = corrected.replace(/└──.*\n/g, '');
          corrected = corrected.replace(/│.*\n/g, '');
          break;
          
        case 'syntax':
          if (error.message.includes('semicolon')) {
            // Add missing semicolons (basic pattern)
            corrected = corrected.replace(/^(import.*[^;])$/gm, '$1;');
            corrected = corrected.replace(/^(export.*[^;{}])$/gm, '$1;');
          }
          break;
      }
    }
    
    return corrected;
  }
  
  /**
   * Calculate overall severity based on detected errors
   */
  private static calculateSeverity(errors: DetectedError[]): 'low' | 'medium' | 'high' | 'critical' {
    if (errors.some(e => e.type === 'security' || e.severity === 'error')) {
      return 'critical';
    }
    
    if (errors.some(e => e.type === 'syntax' || e.type === 'typescript')) {
      return 'high';
    }
    
    if (errors.some(e => e.type === 'import' || e.type === 'structure')) {
      return 'medium';
    }
    
    return 'low';
  }
  
  /**
   * Quick validation check for critical errors only
   */
  static async quickValidation(content: string, filePath: string): Promise<boolean> {
    const result = await this.detectErrors(filePath, content, 'create');
    return result.severity !== 'critical';
  }
  
  /**
   * Get error summary for logging
   */
  static getErrorSummary(result: ErrorDetectionResult): string {
    if (!result.hasErrors) {
      return '✅ No errors detected';
    }
    
    const errorCount = result.errors.length;
    const warningCount = result.warnings.length;
    const severity = result.severity.toUpperCase();
    
    return `⚠️ ${errorCount} errors, ${warningCount} warnings (${severity})`;
  }
}

export default ErrorDetectionIntelligence;