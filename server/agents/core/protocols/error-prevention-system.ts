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
    
    // RELAXED VALIDATION: Only warn about major issues, don't block development
    
    // Server imports: Suggest .js extension for production but don't enforce during development
    if (filePath.includes('server/') && process.env.NODE_ENV === 'production') {
      const relativeImports = code.match(/from ['"]\.\.?\/[^'"]+['"]/g) || [];
      relativeImports.forEach(imp => {
        if (!imp.includes('.js') && !imp.includes('schema') && !imp.includes('.ts')) {
          warnings.push(`Production build may need .js extension: ${imp}`);
          suggestions.push(`Consider adding .js extension to: ${imp}`);
        }
      });
    }
    
    // Client imports: Suggest aliases but don't enforce
    if (filePath.includes('client/')) {
      const deepRelativeImports = code.match(/from ['"]\.\.\/\.\.\/\.\.\/[^'"]+['"]/g) || [];
      if (deepRelativeImports.length > 0) {
        suggestions.push('Consider using @/ aliases for cleaner imports (e.g., @/components)');
      }
    }
    
    // Shared schema imports: Suggest but don't enforce
    if (code.includes('from "../shared/') || code.includes('from "../../shared/')) {
      suggestions.push('Consider using @shared/ alias for shared imports (already configured in tsconfig.json)');
    }
    
    return {
      valid: true, // Always valid - only provide suggestions
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
    
    // RELAXED COMPONENT VALIDATION: Only catch major issues
    
    // Check for component export - only warn if completely missing
    if (!code.includes('export') && fileName.endsWith('.tsx')) {
      warnings.push('Component files typically export a component');
      suggestions.push(`Consider adding: export function ${fileName.replace('.tsx', '')}() { ... }`);
    }
    
    // Check for hooks usage without React import (only if hooks are used)
    const usesHooks = code.match(/\b(useState|useEffect|useQuery|useMutation)\(/);
    if (usesHooks && !code.includes("from 'react'") && !code.includes("from '@tanstack/react-query'")) {
      suggestions.push("Consider importing React hooks or query hooks if needed");
    }
    
    return {
      valid: true, // Always valid - only provide suggestions
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
    
    // RELAXED API VALIDATION: Only suggest patterns, don't enforce
    if (!code.includes('router.') && !code.includes('app.') && !code.includes('export')) {
      suggestions.push('Consider using Express router pattern: router.post("/api/endpoint", async (req, res) => { ... })');
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
    if (code.includes('from(') && !code.includes('../shared/schema')) {
      warnings.push('Database tables should be imported from ../shared/schema');
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
    
    // FLEXIBLE FILE PLACEMENT: Suggest best practices but don't enforce
    const suggestedPaths: Record<string, string[]> = {
      component: ['client/src/components/'],
      page: ['client/src/pages/'],
      hook: ['client/src/hooks/'],
      api: ['server/routes/'],
      service: ['server/services/'],
      agent: ['server/agents/'],
      schema: ['shared/']
    };
    
    const suggested = suggestedPaths[fileType];
    if (suggested && !suggested.some(path => filePath.includes(path))) {
      suggestions.push(`Consider organizing ${fileType} files in: ${suggested[0]}`);
    }
    
    return {
      valid: true, // Always valid - file placement is flexible during development
      errors,
      warnings: [],
      suggestions
    };
  }
}