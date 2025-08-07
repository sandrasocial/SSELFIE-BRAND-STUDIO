/**
 * ERROR PREVENTION SYSTEM
 * Validates agent changes before they break the application
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class ErrorPreventionSystem {
  /**
   * Validate imports in TypeScript/JavaScript code
   */
  static validateImports(code: string, filePath: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Check server imports have .js extension
    if (filePath.includes('server/')) {
      const relativeImports = code.match(/from ['"]\.\.?\/[^'"]+['"]/g) || [];
      relativeImports.forEach(imp => {
        if (!imp.includes('.js') && !imp.includes('schema')) {
          errors.push(`Server import missing .js extension: ${imp}`);
          suggestions.push(`Add .js extension to: ${imp}`);
        }
      });
    }
    
    // Check client imports use proper aliases
    if (filePath.includes('client/')) {
      const badImports = code.match(/from ['"]\.\.\/\.\.\/[^'"]+['"]/g) || [];
      if (badImports.length > 0) {
        warnings.push('Use @/ aliases instead of relative imports in client code');
        suggestions.push('Replace ../../components with @/components');
      }
    }
    
    // Check for shared schema imports
    if (code.includes('from "../shared/') || code.includes('from "../../shared/')) {
      errors.push('Use @shared/schema for shared imports');
      suggestions.push('Replace relative shared paths with @shared/schema');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  /**
   * Validate React component structure
   */
  static validateReactComponent(code: string, fileName: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Check for component export
    if (!code.includes('export function') && !code.includes('export const') && !code.includes('export default')) {
      errors.push('Component must be exported');
      suggestions.push(`Add: export function ${fileName.replace('.tsx', '')}() { ... }`);
    }
    
    // Check for JSX return
    if (!code.includes('return (') && !code.includes('return <')) {
      warnings.push('Component should return JSX');
    }
    
    // Check for proper hooks usage
    if (code.includes('useState(') && !code.includes("from 'react'")) {
      errors.push('Missing React import for hooks');
      suggestions.push("Add: import { useState } from 'react'");
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  /**
   * Validate API route structure
   */
  static validateApiRoute(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Check for proper Express route structure
    if (!code.includes('router.') && !code.includes('app.')) {
      errors.push('API route must use Express router');
      suggestions.push('Add: router.post("/api/endpoint", async (req, res) => { ... })');
    }
    
    // Check for async error handling
    if (code.includes('async (req, res)') && !code.includes('try {')) {
      warnings.push('Async routes should have try-catch error handling');
      suggestions.push('Wrap async logic in try-catch block');
    }
    
    // Check for response sending
    if (!code.includes('res.json') && !code.includes('res.send') && !code.includes('res.status')) {
      warnings.push('Route should send a response');
      suggestions.push('Add: res.json({ success: true, data: ... })');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  /**
   * Validate database query structure
   */
  static validateDatabaseQuery(code: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Check for proper Drizzle imports
    if (code.includes('db.') && !code.includes('from drizzle-orm')) {
      errors.push('Missing Drizzle ORM imports');
      suggestions.push("Add: import { eq, and, desc } from 'drizzle-orm'");
    }
    
    // Check for proper table imports
    if (code.includes('from(') && !code.includes('@shared/schema')) {
      warnings.push('Database tables should be imported from @shared/schema');
    }
    
    // Check for SQL injection prevention
    if (code.includes('`SELECT') || code.includes('`INSERT') || code.includes('`UPDATE')) {
      errors.push('Use Drizzle ORM methods instead of raw SQL');
      suggestions.push('Use: db.select().from(table).where(eq(table.field, value))');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  /**
   * Main validation orchestrator
   */
  static async validateCode(code: string, filePath: string): Promise<ValidationResult> {
    const results: ValidationResult[] = [];
    
    // Run appropriate validations based on file type
    results.push(this.validateImports(code, filePath));
    
    if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
      results.push(this.validateReactComponent(code, filePath));
    }
    
    if (filePath.includes('routes/') || filePath.includes('api/')) {
      results.push(this.validateApiRoute(code));
    }
    
    if (code.includes('db.') || code.includes('from(')) {
      results.push(this.validateDatabaseQuery(code));
    }
    
    // Combine all validation results
    const combined: ValidationResult = {
      valid: results.every(r => r.valid),
      errors: results.flatMap(r => r.errors),
      warnings: results.flatMap(r => r.warnings),
      suggestions: results.flatMap(r => r.suggestions)
    };
    
    return combined;
  }
  
  /**
   * Generate fix suggestions for common errors
   */
  static generateFixSuggestions(error: string): string[] {
    const suggestions: string[] = [];
    
    if (error.includes('Cannot find module')) {
      suggestions.push('Check import path and file extension');
      suggestions.push('Ensure the file exists at the specified path');
      suggestions.push('For server files, add .js extension');
    }
    
    if (error.includes('is not a function')) {
      suggestions.push('Check if the import is properly exported');
      suggestions.push('Verify named vs default exports');
    }
    
    if (error.includes('Unexpected token')) {
      suggestions.push('Check for syntax errors in JSX');
      suggestions.push('Ensure all brackets and parentheses are balanced');
    }
    
    if (error.includes('undefined')) {
      suggestions.push('Check if variable is properly initialized');
      suggestions.push('Verify import statements');
      suggestions.push('Ensure async operations are awaited');
    }
    
    return suggestions;
  }
  
  /**
   * Validate file placement based on type
   */
  static validateFilePlacement(filePath: string, fileType: string): ValidationResult {
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    const expectedPaths: Record<string, string[]> = {
      component: ['client/src/components/'],
      page: ['client/src/pages/'],
      hook: ['client/src/hooks/'],
      api: ['server/routes/'],
      service: ['server/services/'],
      agent: ['server/agents/'],
      schema: ['shared/']
    };
    
    const expected = expectedPaths[fileType];
    if (expected && !expected.some(path => filePath.includes(path))) {
      errors.push(`File placed in wrong directory for ${fileType}`);
      suggestions.push(`Move to: ${expected[0]}`);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
      suggestions
    };
  }
}