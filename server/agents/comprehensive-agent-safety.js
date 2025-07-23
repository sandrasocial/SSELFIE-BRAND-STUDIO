/**
 * COMPREHENSIVE AGENT SAFETY SYSTEM
 * Prevents all agent-generated files from breaking the application
 * Multi-layer validation with automatic error detection and fixing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fsPromises = fs.promises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ComprehensiveAgentSafety {
  constructor() {
    // Known component mappings for auto-fixing
    this.componentMappings = {
      'useUser': 'useAuth',
      'AdminHero': 'AdminHeroSection',
      'BuildLayout': 'Layout',
      'UserProfile': 'Profile'
    };

    // Valid import paths for SSELFIE Studio
    this.validImportPaths = {
      '@/hooks/use-auth': true,
      '@/components/ui/': true,
      '@/lib/': true,
      '@shared/': true,
      'wouter': true,
      'react': true,
      'lucide-react': true
    };

    // Dangerous patterns that break applications
    this.dangerousPatterns = [
      /useUser(?!\w)/g, // useUser hook (should be useAuth)
      /AdminHero(?!Section)/g, // AdminHero (should be AdminHeroSection)
      /import.*from\s+['"]\.\.?\//g, // Relative imports
      /<[A-Z]\w*[^>]*(?<!\/)\s*$/gm, // Unclosed JSX tags
      /\{\s*\w+\s*\?\s*\w+\s*:\s*$/gm, // Incomplete ternary
      /\.map\([^)]*$(?!\))/gm // Incomplete map functions
    ];
  }

  /**
   * STAGE 1: Pre-write validation
   * Validates content before writing to prevent crashes
   */
  async validateBeforeWrite(filePath, content) {
    console.log(`🔍 SAFETY: Pre-write validation for ${filePath}`);
    
    const errors = [];
    
    // 1. Check for dangerous import patterns
    const importErrors = this.validateImports(content);
    if (importErrors.length > 0) {
      errors.push(...importErrors);
    }

    // 2. Check JSX syntax
    const jsxErrors = this.validateJSX(content);
    if (jsxErrors.length > 0) {
      errors.push(...jsxErrors);
    }

    // 3. Check for unclosed elements
    const structureErrors = this.validateStructure(content);
    if (structureErrors.length > 0) {
      errors.push(...structureErrors);
    }

    return {
      isValid: errors.length === 0,
      errors,
      fixedContent: this.autoFixContent(content)
    };
  }

  /**
   * STAGE 2: Import validation and auto-fixing
   */
  validateImports(content) {
    const errors = [];
    if (!content || typeof content !== 'string') {
      console.log(`⚠️ SAFETY: Invalid content for import validation: ${typeof content}`);
      return errors;
    }
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      if (line.trim().startsWith('import')) {
        // Check for useUser (should be useAuth)
        if (line.includes('useUser')) {
          errors.push({
            type: 'INVALID_HOOK',
            line: index + 1,
            message: 'useUser hook does not exist, should be useAuth',
            fix: line.replace('useUser', 'useAuth')
          });
        }

        // Check for relative imports
        if (line.includes('../') || line.includes('./')) {
          errors.push({
            type: 'RELATIVE_IMPORT',
            line: index + 1,
            message: 'Relative imports should use absolute @/ paths',
            fix: this.convertToAbsoluteImport(line)
          });
        }

        // Check for non-existent components
        if (line.includes('AdminHero') && !line.includes('AdminHeroSection')) {
          errors.push({
            type: 'INVALID_COMPONENT',
            line: index + 1,
            message: 'AdminHero component does not exist, should be AdminHeroSection',
            fix: line.replace('AdminHero', 'AdminHeroSection')
          });
        }
      }
    });

    return errors;
  }

  /**
   * STAGE 3: JSX structure validation
   */
  validateJSX(content) {
    const errors = [];
    
    // Check for unclosed JSX tags
    const openTags = content.match(/<[A-Z][A-Za-z0-9]*[^>]*(?<!\/)\s*>/g) || [];
    const closeTags = content.match(/<\/[A-Z][A-Za-z0-9]*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      errors.push({
        type: 'UNCLOSED_JSX',
        message: `JSX structure mismatch: ${openTags.length} opening tags, ${closeTags.length} closing tags`,
        openTags: openTags.length,
        closeTags: closeTags.length
      });
    }

    // Check for incomplete ternary operators
    if (content.match(/\?\s*\w+\s*:\s*$/m)) {
      errors.push({
        type: 'INCOMPLETE_TERNARY',
        message: 'Incomplete ternary operator found'
      });
    }

    return errors;
  }

  /**
   * STAGE 4: File structure validation
   */
  validateStructure(content) {
    const errors = [];
    
    // Check for React component structure
    if (content.includes('export default function') || content.includes('export default')) {
      // Must have proper return statement
      if (!content.includes('return (') && !content.includes('return <')) {
        errors.push({
          type: 'MISSING_RETURN',
          message: 'React component missing return statement'
        });
      }

      // Must close all parentheses
      const openParens = (content.match(/\(/g) || []).length;
      const closeParens = (content.match(/\)/g) || []).length;
      
      if (openParens !== closeParens) {
        errors.push({
          type: 'UNMATCHED_PARENTHESES',
          message: `Unmatched parentheses: ${openParens} open, ${closeParens} close`
        });
      }
    }

    return errors;
  }

  /**
   * STAGE 5: Automatic content fixing
   */
  autoFixContent(content) {
    let fixedContent = content;

    // Fix useUser → useAuth
    fixedContent = fixedContent.replace(/useUser/g, 'useAuth');

    // Fix AdminHero → AdminHeroSection
    fixedContent = fixedContent.replace(/AdminHero(?!Section)/g, 'AdminHeroSection');

    // Fix relative imports to absolute
    fixedContent = fixedContent.replace(
      /import\s+(.+)\s+from\s+['"]\.\.\/(.+)['"];?/g,
      'import $1 from "@/$2";'
    );

    // Fix missing semicolons
    fixedContent = fixedContent.replace(/import\s+.+from\s+.+[^;]$/gm, '$&;');

    return fixedContent;
  }

  /**
   * STAGE 6: Convert relative to absolute imports
   */
  convertToAbsoluteImport(importLine) {
    // Convert ../lib/ to @/lib/
    let fixed = importLine.replace(/\.\.\/lib\//g, '@/lib/');
    
    // Convert ../components/ to @/components/
    fixed = fixed.replace(/\.\.\/components\//g, '@/components/');
    
    // Convert ../hooks/ to @/hooks/
    fixed = fixed.replace(/\.\.\/hooks\//g, '@/hooks/');
    
    return fixed;
  }

  /**
   * STAGE 7: Safe file writing with backup
   */
  async safeWriteFile(filePath, content) {
    try {
      // Create backup if file exists
      if (await this.fileExists(filePath)) {
        const backupPath = `${filePath}.backup.${Date.now()}`;
        await fsPromises.copyFile(filePath, backupPath);
        console.log(`💾 SAFETY: Created backup at ${backupPath}`);
      }

      // Validate before writing
      const validation = await this.validateBeforeWrite(filePath, content);
      
      if (!validation.isValid) {
        console.log(`❌ SAFETY: Validation failed for ${filePath}:`);
        validation.errors.forEach(error => {
          console.log(`  - ${error.type}: ${error.message}`);
        });
        
        // Use fixed content if available
        if (validation.fixedContent && validation.fixedContent !== content) {
          console.log(`🔧 SAFETY: Using auto-fixed content`);
          content = validation.fixedContent;
        } else {
          throw new Error(`File validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
        }
      }

      // Write the file
      await fsPromises.writeFile(filePath, content, 'utf8');
      console.log(`✅ SAFETY: Successfully wrote ${filePath}`);

      // Post-write verification
      const written = await fsPromises.readFile(filePath, 'utf8');
      if (written !== content) {
        throw new Error('File content verification failed');
      }

      return { success: true, path: filePath };

    } catch (error) {
      console.error(`❌ SAFETY: Failed to write ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * STAGE 8: File existence check
   */
  async fileExists(filePath) {
    try {
      await fsPromises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * STAGE 9: Emergency rollback system
   */
  async rollbackFile(filePath) {
    try {
      const backupFiles = await this.getBackupFiles(filePath);
      if (backupFiles.length === 0) {
        throw new Error('No backup files found');
      }

      // Use most recent backup
      const latestBackup = backupFiles[backupFiles.length - 1];
      await fsPromises.copyFile(latestBackup, filePath);
      console.log(`🔄 SAFETY: Rolled back ${filePath} from ${latestBackup}`);
      
      return { success: true, backup: latestBackup };
    } catch (error) {
      console.error(`❌ SAFETY: Rollback failed for ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Get all backup files for a given path
   */
  async getBackupFiles(filePath) {
    try {
      const dir = path.dirname(filePath);
      const filename = path.basename(filePath);
      const files = await fsPromises.readdir(dir);
      
      return files
        .filter(file => file.startsWith(`${filename}.backup.`))
        .map(file => path.join(dir, file))
        .sort();
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export default new ComprehensiveAgentSafety();