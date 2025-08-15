import * as ts from 'typescript';
import * as path from 'path';

export interface AgentProtocolValidation {
  isValid: boolean;
  errors: string[];
}

export class AgentProtocolValidator {
  private static FORBIDDEN_IMPORTS = [
    { pattern: /import.*useUser.*from.*['"]\.\.\/lib\/hooks['"]/, message: 'Use "import { useAuth } from "@/hooks/use-auth"" instead' },
    { pattern: /import.*AdminHero.*from.*['"]\.\.\/components\/AdminHero['"]/, message: 'Use "import { AdminHeroSection } from "@/components/admin/AdminHeroSection"" instead' },
  ];

  private static FORBIDDEN_PATTERNS = [
    { pattern: /const.*\{.*user.*\}.*=.*useUser\(\)/, message: 'Use "const { user } = useAuth()" instead' },
    { pattern: /<AdminHero.*\/>/, message: 'Use "<AdminHeroSection />" instead' },
    { pattern: /from.*['"]\.\.\/*/, message: 'Use absolute imports with "@/" prefix instead of relative paths' },
  ];

  static validateSourceCode(sourceCode: string): AgentProtocolValidation {
    const errors: string[] = [];

    // Check for forbidden imports
    this.FORBIDDEN_IMPORTS.forEach(({pattern, message}) => {
      if (pattern.test(sourceCode)) {
        errors.push(`Invalid import pattern: ${message}`);
      }
    });

    // Check for forbidden usage patterns
    this.FORBIDDEN_PATTERNS.forEach(({pattern, message}) => {
      if (pattern.test(sourceCode)) {
        errors.push(`Invalid code pattern: ${message}`);
      }
    });

    // Validate absolute imports
    if (sourceCode.includes('../') || sourceCode.includes('./')) {
      errors.push('All imports must use absolute paths with "@/" prefix');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateComponent(sourceCode: string): AgentProtocolValidation {
    const errors: string[] = [];
    
    // Check for default export
    if (!sourceCode.includes('export default function')) {
      errors.push('Components must use default export function');
    }

    // Combine with general validation
    const generalValidation = this.validateSourceCode(sourceCode);
    errors.push(...generalValidation.errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static autoFixImports(sourceCode: string): string {
    let fixedCode = sourceCode;

    // Auto-fix common import patterns
    fixedCode = fixedCode.replace(
      /import.*\{.*useUser.*\}.*from.*['"]\.\.\/lib\/hooks['"]/g,
      'import { useAuth } from "@/hooks/use-auth"'
    );

    fixedCode = fixedCode.replace(
      /import.*AdminHero.*from.*['"]\.\.\/components\/AdminHero['"]/g,
      'import { AdminHeroSection } from "@/components/admin/AdminHeroSection"'
    );

    // Auto-fix relative paths to absolute
    fixedCode = fixedCode.replace(
      /from.*['"]\.\.\/(.*)['"]/g,
      (match, p1) => `from "@/${p1}"`
    );

    return fixedCode;
  }
}

// Export validation rules as documentation
export const AGENT_SAFETY_PROTOCOLS = {
  IMPORT_RULES: [
    {
      rule: 'Use absolute imports with @/ prefix',
      example: 'import { Button } from "@/components/ui/button"'
    },
    {
      rule: 'Use useAuth instead of useUser',
      example: 'import { useAuth } from "@/hooks/use-auth"'
    },
    {
      rule: 'Use AdminHeroSection instead of AdminHero',
      example: 'import { AdminHeroSection } from "@/components/admin/AdminHeroSection"'
    }
  ],
  COMPONENT_RULES: [
    {
      rule: 'Use default exports for components',
      example: 'export default function ComponentName() { ... }'
    },
    {
      rule: 'Use absolute paths for all imports',
      example: 'import { Something } from "@/path/to/component"'
    }
  ]
};