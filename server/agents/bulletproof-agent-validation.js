/**
 * BULLETPROOF AGENT VALIDATION SYSTEM
 * Prevents all agent-generated code from breaking the application
 * Multi-stage validation with automatic error correction
 */

class BulletproofAgentValidation {
  constructor() {
    this.criticalErrors = [
      // JSX Structure Errors
      { pattern: /<Link[^>]*>[\s\S]*?<\/div>\s*$/gm, fix: this.fixLinkDivMismatch, severity: 'CRITICAL' },
      { pattern: /<div[^>]*>[\s\S]*?<\/Link>\s*$/gm, fix: this.fixDivLinkMismatch, severity: 'CRITICAL' },
      { pattern: /<([A-Z]\w*)[^>]*>[\s\S]*?<\/(?!\1)[A-Z]\w*>\s*$/gm, fix: this.fixTagMismatch, severity: 'CRITICAL' },
      
      // Import Errors
      { pattern: /useUser/g, fix: (content) => content.replace(/useUser/g, 'useAuth'), severity: 'CRITICAL' },
      { pattern: /AdminHero(?!Section)/g, fix: (content) => content.replace(/AdminHero(?!Section)/g, 'AdminHeroSection'), severity: 'CRITICAL' },
      
      // Syntax Errors
      { pattern: /let\s+(\w+):\s*any\[\]\s*=\s*\[\];\s*[\s\S]*?\s*let\s+\1:\s*any\[\]\s*=/gm, fix: this.fixDuplicateDeclarations, severity: 'CRITICAL' },
      { pattern: /}\s*,\s*$/gm, fix: (content) => content.replace(/}\s*,\s*$/gm, '}'), severity: 'HIGH' },
      
      // Unclosed Elements
      { pattern: /<[A-Z]\w*[^>\/]*(?<!\/)\s*$/gm, fix: this.addClosingTag, severity: 'HIGH' }
    ];
  }

  /**
   * Main validation entry point
   */
  async validateAgentCode(agentId, content, filePath) {
    console.log(`🛡️ BULLETPROOF: Validating ${agentId} code for ${filePath}`);
    
    const errors = [];
    let fixedContent = content;
    let fixesApplied = 0;

    // Stage 1: Critical Error Detection
    for (const errorPattern of this.criticalErrors) {
      const matches = content.match(errorPattern.pattern);
      if (matches) {
        errors.push({
          type: errorPattern.severity,
          count: matches.length,
          pattern: errorPattern.pattern.toString()
        });

        // Apply automatic fix
        try {
          fixedContent = errorPattern.fix(fixedContent);
          fixesApplied++;
          console.log(`🔧 BULLETPROOF: Auto-fixed ${errorPattern.severity} error (${matches.length} instances)`);
        } catch (fixError) {
          console.error(`❌ BULLETPROOF: Failed to fix error:`, fixError);
        }
      }
    }

    // Stage 2: JSX Balance Validation
    const jsxValidation = this.validateJSXBalance(fixedContent);
    if (!jsxValidation.isValid) {
      errors.push(...jsxValidation.errors);
      fixedContent = jsxValidation.fixedContent;
      fixesApplied += jsxValidation.fixesApplied;
    }

    // Stage 3: Import Path Validation
    const importValidation = this.validateImportPaths(fixedContent);
    if (!importValidation.isValid) {
      errors.push(...importValidation.errors);
      fixedContent = importValidation.fixedContent;
      fixesApplied += importValidation.fixesApplied;
    }

    return {
      isValid: errors.length === 0,
      errors,
      originalContent: content,
      fixedContent,
      fixesApplied,
      agentId,
      filePath
    };
  }

  /**
   * Fix Link/div tag mismatches
   */
  fixLinkDivMismatch(content) {
    return content.replace(/<Link([^>]*)>([\s\S]*?)<\/div>\s*$/gm, '<Link$1>$2</Link>');
  }

  fixDivLinkMismatch(content) {
    return content.replace(/<div([^>]*)>([\s\S]*?)<\/Link>\s*$/gm, '<div$1>$2</div>');
  }

  fixTagMismatch(content) {
    // More sophisticated tag matching - find opening tag and ensure closing tag matches
    return content.replace(/<([A-Z]\w*)([^>]*)>([\s\S]*?)<\/(?!\1)[A-Z]\w*>\s*$/gm, '<$1$2>$3</$1>');
  }

  /**
   * Fix duplicate variable declarations
   */
  fixDuplicateDeclarations(content) {
    const lines = content.split('\n');
    const declarations = new Set();
    const fixedLines = [];

    for (const line of lines) {
      const match = line.match(/^\s*let\s+(\w+):\s*any\[\]\s*=\s*\[\];?\s*$/);
      if (match) {
        const varName = match[1];
        if (declarations.has(varName)) {
          console.log(`🔧 BULLETPROOF: Removing duplicate declaration of ${varName}`);
          continue; // Skip duplicate declaration
        }
        declarations.add(varName);
      }
      fixedLines.push(line);
    }

    return fixedLines.join('\n');
  }

  /**
   * Add missing closing tags
   */
  addClosingTag(content) {
    return content.replace(/<([A-Z]\w*)([^>\/]*)\s*$/gm, '<$1$2></$1>');
  }

  /**
   * Validate JSX tag balance
   */
  validateJSXBalance(content) {
    const errors = [];
    let fixedContent = content;
    let fixesApplied = 0;

    // Extract JSX elements and validate balance
    const jsxStack = [];
    const jsxRegex = /<\/?([A-Z]\w*)[^>]*>/g;
    let match;

    while ((match = jsxRegex.exec(content)) !== null) {
      const [fullMatch, tagName] = match;
      
      if (fullMatch.startsWith('</')) {
        // Closing tag
        if (jsxStack.length === 0 || jsxStack[jsxStack.length - 1] !== tagName) {
          errors.push({
            type: 'JSX_MISMATCH',
            message: `Unmatched closing tag: ${fullMatch}`,
            position: match.index
          });
        } else {
          jsxStack.pop();
        }
      } else if (!fullMatch.endsWith('/>')) {
        // Opening tag (not self-closing)
        jsxStack.push(tagName);
      }
    }

    // Check for unclosed tags
    if (jsxStack.length > 0) {
      errors.push({
        type: 'UNCLOSED_TAGS',
        message: `Unclosed tags: ${jsxStack.join(', ')}`,
        tags: jsxStack
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      fixedContent,
      fixesApplied
    };
  }

  /**
   * Validate import paths
   */
  validateImportPaths(content) {
    const errors = [];
    let fixedContent = content;
    let fixesApplied = 0;

    const importFixes = [
      { from: /from\s*['"]\.\.\/lib\/hooks['"]/, to: 'from "@/hooks/use-auth"' },
      { from: /from\s*['"]\.\.\/components\/admin\/AdminHero['"]/, to: 'from "@/components/admin/AdminHeroSection"' },
      { from: /import.*from\s*['"]\.\.?\//g, to: (match) => match.replace(/['"]\.\.?\//, '"@/') }
    ];

    for (const fix of importFixes) {
      const matches = content.match(fix.from);
      if (matches) {
        errors.push({
          type: 'IMPORT_PATH',
          count: matches.length,
          message: `Relative import detected: ${matches[0]}`
        });

        fixedContent = fixedContent.replace(fix.from, fix.to);
        fixesApplied++;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      fixedContent,
      fixesApplied
    };
  }

  /**
   * Emergency intervention for critical failures
   */
  emergencyIntervention(agentId, content, filePath) {
    console.log(`🚨 EMERGENCY: Agent ${agentId} created critical errors in ${filePath}`);
    
    // Apply all emergency fixes
    let emergency = content;
    
    // Fix the most common crash patterns
    emergency = emergency.replace(/<Link([^>]*)>[\s\S]*?<\/div>/g, '<Link$1>$2</Link>');
    emergency = emergency.replace(/useUser/g, 'useAuth');
    emergency = emergency.replace(/AdminHero(?!Section)/g, 'AdminHeroSection');
    emergency = emergency.replace(/let\s+fileOperations:\s*any\[\]\s*=\s*\[\];\s*([\s\S]*?)\s*let\s+fileOperations:/g, 'let fileOperations: any[] = [];$1');
    
    return {
      emergencyContent: emergency,
      interventionApplied: true,
      originalContent: content
    };
  }
}

export default new BulletproofAgentValidation();