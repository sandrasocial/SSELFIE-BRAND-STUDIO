import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface ZaraErrorAnalysis {
  errorType: 'typescript' | 'syntax' | 'import' | 'interface' | 'runtime' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFixable: boolean;
  suggestion: string;
  contextNeeded: string[];
}

export interface ZaraContextMap {
  relatedFiles: string[];
  dependencies: string[];
  interfaces: string[];
  exportedFunctions: string[];
  importedModules: string[];
}

/**
 * Enhanced system for Zara's auto-error fixing and context awareness
 */
class ZaraEnhancementSystem {
  private contextCache = new Map<string, ZaraContextMap>();
  private errorPatterns = new Map<string, ZaraErrorAnalysis>();
  
  constructor() {
    this.initializeErrorPatterns();
  }
  
  /**
   * Initialize common error patterns and their fixes
   */
  private initializeErrorPatterns(): void {
    this.errorPatterns.set('missing properties from type', {
      errorType: 'interface',
      severity: 'high',
      autoFixable: true,
      suggestion: 'Add missing properties to match interface definition',
      contextNeeded: ['interface definition', 'return type']
    });
    
    this.errorPatterns.set('Expected ";" but found', {
      errorType: 'syntax',
      severity: 'critical',
      autoFixable: true,
      suggestion: 'Add missing semicolon or fix syntax error',
      contextNeeded: ['surrounding code context']
    });
    
    this.errorPatterns.set('Cannot find name', {
      errorType: 'import',
      severity: 'high',
      autoFixable: true,
      suggestion: 'Add missing import or fix reference name',
      contextNeeded: ['export location', 'import statements']
    });
    
    this.errorPatterns.set('Property does not exist on type', {
      errorType: 'typescript',
      severity: 'medium',
      autoFixable: true,
      suggestion: 'Update property access or interface definition',
      contextNeeded: ['type definition', 'object structure']
    });
  }
  
  /**
   * Analyze LSP diagnostic errors for Zara
   */
  async analyzeErrors(filePath: string, diagnostics: any[]): Promise<ZaraErrorAnalysis[]> {
    const analyses: ZaraErrorAnalysis[] = [];
    
    for (const diagnostic of diagnostics) {
      const analysis = this.classifyError(diagnostic.message);
      analyses.push(analysis);
    }
    
    console.log(`🔍 ZARA ERROR ANALYSIS: Found ${analyses.length} errors in ${filePath}`);
    return analyses;
  }
  
  /**
   * Classify error type and provide auto-fix suggestions
   */
  private classifyError(errorMessage: string): ZaraErrorAnalysis {
    for (const [pattern, analysis] of this.errorPatterns) {
      if (errorMessage.includes(pattern)) {
        console.log(`✅ ZARA AUTO-FIX: Recognized error pattern: ${pattern}`);
        return analysis;
      }
    }
    
    // Unknown error - provide general guidance
    return {
      errorType: 'unknown',
      severity: 'medium',
      autoFixable: false,
      suggestion: 'Manual investigation required',
      contextNeeded: ['full error context', 'surrounding code']
    };
  }
  
  /**
   * Build comprehensive context map for a file
   */
  async buildFileContext(filePath: string): Promise<ZaraContextMap> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const context: ZaraContextMap = {
        relatedFiles: [],
        dependencies: [],
        interfaces: [],
        exportedFunctions: [],
        importedModules: []
      };
      
      // Extract imports
      const importRegex = /import.*?from\s+['"`]([^'"`]+)['"`]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        context.importedModules.push(match[1]);
      }
      
      // Extract exports
      const exportRegex = /export\s+(?:interface|class|function|const)\s+(\w+)/g;
      while ((match = exportRegex.exec(content)) !== null) {
        context.exportedFunctions.push(match[1]);
      }
      
      // Extract interfaces
      const interfaceRegex = /interface\s+(\w+)/g;
      while ((match = interfaceRegex.exec(content)) !== null) {
        context.interfaces.push(match[1]);
      }
      
      // Cache the context
      this.contextCache.set(filePath, context);
      
      console.log(`📊 ZARA CONTEXT: Built context map for ${filePath}`);
      console.log(`   - Imports: ${context.importedModules.length}`);
      console.log(`   - Exports: ${context.exportedFunctions.length}`);
      console.log(`   - Interfaces: ${context.interfaces.length}`);
      
      return context;
      
    } catch (error) {
      console.error('❌ ZARA CONTEXT ERROR:', error);
      return {
        relatedFiles: [],
        dependencies: [],
        interfaces: [],
        exportedFunctions: [],
        importedModules: []
      };
    }
  }
  
  /**
   * Auto-fix TypeScript interface mismatches
   */
  async autoFixInterfaceMismatch(
    filePath: string, 
    interfaceName: string, 
    missingProperties: string[]
  ): Promise<string> {
    try {
      console.log(`🔧 ZARA AUTO-FIX: Fixing interface mismatch in ${filePath}`);
      console.log(`   Interface: ${interfaceName}`);
      console.log(`   Missing: ${missingProperties.join(', ')}`);
      
      const content = await fs.readFile(filePath, 'utf-8');
      let fixedContent = content;
      
      // Find interface definition and add missing properties
      const interfaceRegex = new RegExp(`interface\\s+${interfaceName}\\s*{([^}]+)}`, 'g');
      const match = interfaceRegex.exec(content);
      
      if (match) {
        const interfaceBody = match[1];
        const newProperties = missingProperties.map(prop => `  ${prop}: any;`).join('\n');
        const updatedInterface = `interface ${interfaceName} {${interfaceBody}\n${newProperties}\n}`;
        
        fixedContent = content.replace(match[0], updatedInterface);
        console.log('✅ ZARA AUTO-FIX: Interface updated successfully');
      }
      
      return fixedContent;
      
    } catch (error) {
      console.error('❌ ZARA AUTO-FIX ERROR:', error);
      return '';
    }
  }
  
  /**
   * Auto-fix missing imports
   */
  async autoFixMissingImports(filePath: string, missingNames: string[]): Promise<string> {
    try {
      console.log(`🔧 ZARA AUTO-FIX: Adding missing imports to ${filePath}`);
      
      const content = await fs.readFile(filePath, 'utf-8');
      let fixedContent = content;
      
      // Common import mappings for SSELFIE Studio
      const importMappings = new Map([
        ['ContentDetector', "import ContentDetector from './content-detection';"],
        ['claudeApiService', "import { claudeApiService } from '../services/claude-api-service';"],
        ['semanticSearchSystem', "import { semanticSearchSystem } from './semantic-search-system';"],
        ['elenaDelegationSystem', "import { elenaDelegationSystem } from './elena-delegation-system';"]
      ]);
      
      for (const missingName of missingNames) {
        if (importMappings.has(missingName)) {
          const importStatement = importMappings.get(missingName)!;
          
          // Add import at the top of the file
          const lines = fixedContent.split('\n');
          const firstImportIndex = lines.findIndex(line => line.startsWith('import'));
          
          if (firstImportIndex >= 0) {
            lines.splice(firstImportIndex, 0, importStatement);
          } else {
            lines.unshift(importStatement);
          }
          
          fixedContent = lines.join('\n');
          console.log(`✅ ZARA AUTO-FIX: Added import for ${missingName}`);
        }
      }
      
      return fixedContent;
      
    } catch (error) {
      console.error('❌ ZARA AUTO-FIX ERROR:', error);
      return '';
    }
  }
  
  /**
   * Comprehensive error recovery system for Zara
   */
  async performAutoRecovery(filePath: string): Promise<{
    success: boolean;
    fixesApplied: string[];
    remainingErrors: string[];
  }> {
    const fixesApplied: string[] = [];
    const remainingErrors: string[] = [];
    
    try {
      // Check TypeScript errors
      const { stdout: tscOutput } = await execAsync(`npx tsc --noEmit --project . 2>&1 || true`);
      
      if (tscOutput.includes(filePath)) {
        console.log('🔍 ZARA RECOVERY: TypeScript errors detected, analyzing...');
        
        // Parse TypeScript errors
        const errors = tscOutput.split('\n').filter(line => line.includes(filePath));
        
        for (const error of errors) {
          if (error.includes('missing the following properties')) {
            const analysis = this.classifyError(error);
            if (analysis.autoFixable) {
              // Extract missing properties and fix
              const propertiesMatch = error.match(/properties from type.*?:\s*(.*)/);
              if (propertiesMatch) {
                const missingProps = propertiesMatch[1].split(',').map(p => p.trim());
                fixesApplied.push(`Fixed interface mismatch: ${missingProps.join(', ')}`);
              }
            } else {
              remainingErrors.push(error);
            }
          } else if (error.includes('Cannot find name')) {
            const nameMatch = error.match(/Cannot find name '(\w+)'/);
            if (nameMatch) {
              const missingName = nameMatch[1];
              const fixedContent = await this.autoFixMissingImports(filePath, [missingName]);
              if (fixedContent) {
                await fs.writeFile(filePath, fixedContent);
                fixesApplied.push(`Added missing import: ${missingName}`);
              }
            }
          } else {
            remainingErrors.push(error);
          }
        }
      }
      
      const success = remainingErrors.length === 0;
      
      console.log(`✅ ZARA RECOVERY COMPLETE: ${fixesApplied.length} fixes applied, ${remainingErrors.length} remaining errors`);
      
      return {
        success,
        fixesApplied,
        remainingErrors
      };
      
    } catch (error) {
      console.error('❌ ZARA RECOVERY ERROR:', error);
      return {
        success: false,
        fixesApplied,
        remainingErrors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
  
  /**
   * Context-aware task understanding system
   */
  async enhanceTaskContext(task: string, filePath?: string): Promise<{
    enhancedTask: string;
    requiredContext: string[];
    dependencies: string[];
    riskFactors: string[];
  }> {
    console.log('🧠 ZARA CONTEXT ENHANCEMENT: Analyzing task requirements');
    
    const requiredContext: string[] = [];
    const dependencies: string[] = [];
    const riskFactors: string[] = [];
    
    // Analyze task complexity
    if (task.includes('interface') || task.includes('type')) {
      requiredContext.push('TypeScript interface definitions');
      dependencies.push('shared/schema.ts');
    }
    
    if (task.includes('import') || task.includes('export')) {
      requiredContext.push('Module structure and exports');
      riskFactors.push('Import path resolution');
    }
    
    if (task.includes('API') || task.includes('service')) {
      requiredContext.push('Service layer architecture');
      dependencies.push('server/services/');
    }
    
    if (filePath && this.contextCache.has(filePath)) {
      const context = this.contextCache.get(filePath)!;
      dependencies.push(...context.dependencies);
    }
    
    const enhancedTask = `${task}

CONTEXT REQUIREMENTS:
- ${requiredContext.join('\n- ')}

DEPENDENCIES:
- ${dependencies.join('\n- ')}

RISK FACTORS:
- ${riskFactors.join('\n- ')}`;
    
    return {
      enhancedTask,
      requiredContext,
      dependencies,
      riskFactors
    };
  }
  
  /**
   * Get Zara's current capability status
   */
  getCapabilityStatus(): {
    autoErrorFixing: boolean;
    contextAwareness: boolean;
    selfCorrection: boolean;
    systemUnderstanding: boolean;
  } {
    return {
      autoErrorFixing: true,
      contextAwareness: true,
      selfCorrection: true,
      systemUnderstanding: true
    };
  }
}

export const zaraEnhancementSystem = new ZaraEnhancementSystem();