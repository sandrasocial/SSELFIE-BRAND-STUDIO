// Import Validator - Prevents agents from creating files with broken imports
import * as fs from 'fs';
import * as path from 'path';

export class ImportValidator {
  private static readonly VALID_IMPORT_PATTERNS = {
    // SSELFIE Studio approved import patterns
    hooks: [
      '@/hooks/use-auth',
      '@/hooks/use-toast',
      '@/hooks/use-query-client'
    ],
    components: [
      '@/components/ui/',
      '@/components/admin/',
      '@/components/visual-editor/',
      '@/components/Elena/'
    ],
    lib: [
      '@/lib/queryClient',
      '@/lib/utils'
    ],
    react: [
      'react',
      'react-dom',
      'wouter',
      '@tanstack/react-query'
    ],
    ui: [
      '@/components/ui/button',
      '@/components/ui/card',
      '@/components/ui/form',
      '@/components/ui/input',
      '@/components/ui/textarea',
      '@/components/ui/badge',
      '@/components/ui/tabs'
    ]
  };

  private static readonly FORBIDDEN_IMPORTS = [
    '../lib/hooks',           // Use @/hooks/ instead
    '../components/AdminHero', // Use @/components/admin/AdminHeroSection
    './lib/hooks',            // Use @/hooks/ instead
    'useUser',               // Use useAuth from @/hooks/use-auth
  ];

  static validateFileContent(filePath: string, content: string): {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    const lines = content.split('\n');

    // Check for import statements
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('import ')) {
        this.validateImportLine(trimmed, index + 1, errors, suggestions);
      }
    });

    // Check for common React patterns
    this.validateReactPatterns(content, errors, suggestions);

    // Check for SSELFIE architecture compliance
    this.validateArchitectureCompliance(filePath, content, errors, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }

  private static validateImportLine(
    line: string, 
    lineNumber: number, 
    errors: string[], 
    suggestions: string[]
  ): void {
    // Check for forbidden imports
    this.FORBIDDEN_IMPORTS.forEach(forbidden => {
      if (line.includes(forbidden)) {
        errors.push(`Line ${lineNumber}: Forbidden import "${forbidden}"`);
        
        // Provide corrections
        if (forbidden.includes('lib/hooks')) {
          suggestions.push(`Replace with: import { useAuth } from "@/hooks/use-auth"`);
        }
        if (forbidden.includes('AdminHero')) {
          suggestions.push(`Replace with: import { AdminHeroSection } from "@/components/admin/AdminHeroSection"`);
        }
        if (forbidden === 'useUser') {
          suggestions.push(`Replace with: import { useAuth } from "@/hooks/use-auth" and use { user } = useAuth()`);
        }
      }
    });

    // Check for relative imports that should use @ alias
    if (line.includes('../') || line.includes('./')) {
      const match = line.match(/from ['"](.+)['"]/);
      if (match) {
        const importPath = match[1];
        if (importPath.includes('../components/') || importPath.includes('./components/')) {
          errors.push(`Line ${lineNumber}: Use @/components/ instead of relative path`);
          suggestions.push(`Replace with: @/components/... (use absolute path)`);
        }
        if (importPath.includes('../hooks/') || importPath.includes('./hooks/')) {
          errors.push(`Line ${lineNumber}: Use @/hooks/ instead of relative path`);
          suggestions.push(`Replace with: @/hooks/... (use absolute path)`);
        }
      }
    }
  }

  private static validateReactPatterns(
    content: string, 
    errors: string[], 
    suggestions: string[]
  ): void {
    // Check for React import (should not be needed with Vite setup)
    if (content.includes('import React from ') && !content.includes('import React,')) {
      suggestions.push('Remove explicit React import - Vite handles this automatically');
    }

    // Check for proper TypeScript patterns
    if (content.includes('function ') && !content.includes(': React.FC') && !content.includes('export default function')) {
      suggestions.push('Use "export default function ComponentName()" pattern for React components');
    }
  }

  private static validateArchitectureCompliance(
    filePath: string, 
    content: string, 
    errors: string[], 
    suggestions: string[]
  ): void {
    // Check if file is in correct location
    if (filePath.includes('pages/') && !content.includes('export default function')) {
      errors.push('Page components must have a default export function');
    }

    if (filePath.includes('components/') && !content.includes('export')) {
      errors.push('Component files must export the component');
    }

    // Check for SSELFIE specific patterns
    if (content.includes('useUser') && !content.includes('useAuth')) {
      errors.push('Use useAuth hook instead of useUser for SSELFIE Studio');
      suggestions.push('Replace useUser with: const { user } = useAuth()');
    }
  }

  static fixCommonImportIssues(content: string): string {
    let fixed = content;

    // Fix common import patterns
    const fixes = [
      // Fix useUser to useAuth
      {
        pattern: /import\s*{\s*useUser\s*}\s*from\s*['"][^'"]*['"]/g,
        replacement: 'import { useAuth } from "@/hooks/use-auth"'
      },
      {
        pattern: /const\s*{\s*user\s*}\s*=\s*useUser\(\)/g,
        replacement: 'const { user } = useAuth()'
      },
      // Fix relative imports to absolute
      {
        pattern: /from\s*['"]\.\.\/lib\/hooks['"]/g,
        replacement: 'from "@/hooks/use-auth"'
      },
      {
        pattern: /from\s*['"]\.\.\/components\/AdminHero['"]/g,
        replacement: 'from "@/components/admin/AdminHeroSection"'
      },
      // Fix component references
      {
        pattern: /<AdminHero\s/g,
        replacement: '<AdminHeroSection '
      },
      {
        pattern: /AdminHero>/g,
        replacement: 'AdminHeroSection>'
      }
    ];

    fixes.forEach(fix => {
      fixed = fixed.replace(fix.pattern, fix.replacement);
    });

    return fixed;
  }

  static generateValidationReport(filePath: string, content: string): string {
    const validation = this.validateFileContent(filePath, content);
    
    if (validation.isValid) {
      return `✅ File validation passed: ${filePath}`;
    }

    let report = `❌ File validation failed: ${filePath}\n\n`;
    
    if (validation.errors.length > 0) {
      report += `**ERRORS:**\n`;
      validation.errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += '\n';
    }

    if (validation.suggestions.length > 0) {
      report += `**SUGGESTIONS:**\n`;
      validation.suggestions.forEach(suggestion => {
        report += `- ${suggestion}\n`;
      });
    }

    return report;
  }
}