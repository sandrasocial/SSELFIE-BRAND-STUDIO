/**
 * CODEBASE UNDERSTANDING INTELLIGENCE SYSTEM
 * 
 * Advanced codebase analysis and understanding capabilities for Sandra's agents
 * Provides comprehensive knowledge of project structure, dependencies, and relationships
 * Enables agents to understand code context and make informed architectural decisions
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { globby } from 'globby';

export interface FileAnalysis {
  path: string;
  type: 'component' | 'page' | 'api' | 'utility' | 'config' | 'data' | 'test' | 'other';
  size: number;
  language: string;
  dependencies: string[];
  exports: string[];
  imports: string[];
  functions: string[];
  classes: string[];
  interfaces: string[];
  lastModified: Date;
  complexity: 'low' | 'medium' | 'high';
  businessCritical: boolean;
}

export interface CodebaseInsight {
  projectStructure: {
    totalFiles: number;
    filesByType: Record<string, number>;
    largestFiles: FileAnalysis[];
    recentlyModified: FileAnalysis[];
  };
  dependencies: {
    external: string[];
    internal: Map<string, string[]>;
    circular: string[][];
    unused: string[];
  };
  architecture: {
    patterns: string[];
    antiPatterns: string[];
    suggestions: string[];
    technicalDebt: string[];
  };
  businessLogic: {
    coreFeatures: string[];
    userFlows: string[];
    dataModels: string[];
    apiEndpoints: string[];
  };
}

export class CodebaseUnderstandingIntelligence {
  private static cacheExpiry = 30 * 60 * 1000; // 30 minutes - Optimized for performance
  private static cache: { data: CodebaseInsight | null; timestamp: number } = { data: null, timestamp: 0 };
  
  /**
   * Analyze entire codebase and generate comprehensive understanding
   */
  static async analyzeCodebase(): Promise<CodebaseInsight> {
    console.log('🧠 CODEBASE INTELLIGENCE: Starting comprehensive analysis...');
    
    // CACHE DISABLED - Always do fresh analysis for direct file access
    const now = Date.now();
    console.log('🧠 CODEBASE INTELLIGENCE: Cache disabled - performing fresh analysis for direct access');
    
    try {
      // Get all relevant files
      const files = await globby([
        'client/src/**/*.{ts,tsx,js,jsx}',
        'server/**/*.{ts,js}',
        'shared/**/*.{ts,js}',
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts'
      ], {
        ignore: ['node_modules/**', 'dist/**', 'build/**', '.git/**']
      });
      
      console.log(`🧠 CODEBASE INTELLIGENCE: Analyzing ${files.length} files...`);
      
      // Analyze each file
      const fileAnalyses: FileAnalysis[] = [];
      for (const filePath of files) {
        try {
          const analysis = await this.analyzeFile(filePath);
          if (analysis) {
            fileAnalyses.push(analysis);
          }
        } catch (error) {
          console.log(`⚠️ Error analyzing ${filePath}: ${error}`);
        }
      }
      
      // Generate comprehensive insights
      const insights: CodebaseInsight = {
        projectStructure: this.analyzeProjectStructure(fileAnalyses),
        dependencies: await this.analyzeDependencies(fileAnalyses),
        architecture: this.analyzeArchitecture(fileAnalyses),
        businessLogic: this.analyzeBusinessLogic(fileAnalyses)
      };
      
      // CACHE DISABLED - No caching for direct file access mode
      this.cache = { data: null, timestamp: 0 };
      
      console.log('🧠 CODEBASE INTELLIGENCE: Analysis complete');
      return insights;
      
    } catch (error) {
      console.error('🧠 CODEBASE INTELLIGENCE ERROR:', error);
      throw new Error(`Codebase analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Analyze individual file for structure and content
   */
  private static async analyzeFile(filePath: string): Promise<FileAnalysis | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      
      const analysis: FileAnalysis = {
        path: filePath,
        type: this.determineFileType(filePath, content),
        size: stats.size,
        language: this.determineLanguage(filePath),
        dependencies: this.extractDependencies(content),
        exports: this.extractExports(content),
        imports: this.extractImports(content),
        functions: this.extractFunctions(content),
        classes: this.extractClasses(content),
        interfaces: this.extractInterfaces(content),
        lastModified: stats.mtime,
        complexity: this.assessComplexity(content),
        businessCritical: this.isBusinessCritical(filePath, content)
      };
      
      return analysis;
    } catch (error) {
      return null;
    }
  }
  
  /**
   * Determine file type based on path and content
   */
  private static determineFileType(filePath: string, content: string): FileAnalysis['type'] {
    if (filePath.includes('/components/')) return 'component';
    if (filePath.includes('/pages/')) return 'page';
    if (filePath.includes('/api/') || filePath.includes('server/routes')) return 'api';
    if (filePath.includes('/lib/') || filePath.includes('/utils/')) return 'utility';
    if (filePath.includes('config') || filePath.endsWith('.config.ts') || filePath.endsWith('.config.js')) return 'config';
    if (filePath.includes('/schema') || filePath.includes('/types/')) return 'data';
    if (filePath.includes('test') || filePath.includes('spec')) return 'test';
    return 'other';
  }
  
  /**
   * Determine programming language
   */
  private static determineLanguage(filePath: string): string {
    const ext = path.extname(filePath);
    switch (ext) {
      case '.ts': return 'typescript';
      case '.tsx': return 'typescript-react';
      case '.js': return 'javascript';
      case '.jsx': return 'javascript-react';
      case '.json': return 'json';
      default: return 'unknown';
    }
  }
  
  /**
   * Extract import dependencies from file content
   */
  private static extractDependencies(content: string): string[] {
    const deps: string[] = [];
    
    // Extract import statements
    const importRegex = /import.*?from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }
    
    // Extract require statements
    const requireRegex = /require\(['"`]([^'"`]+)['"`]\)/g;
    while ((match = requireRegex.exec(content)) !== null) {
      deps.push(match[1]);
    }
    
    return [...new Set(deps)];
  }
  
  /**
   * Extract exports from file content
   */
  private static extractExports(content: string): string[] {
    const exports: string[] = [];
    
    // Named exports
    const namedExports = /export\s+(?:const|let|var|function|class|interface|type)\s+(\w+)/g;
    let match;
    while ((match = namedExports.exec(content)) !== null) {
      exports.push(match[1]);
    }
    
    // Default exports
    if (content.includes('export default')) {
      exports.push('default');
    }
    
    return exports;
  }
  
  /**
   * Extract import statements
   */
  private static extractImports(content: string): string[] {
    const imports: string[] = [];
    const importRegex = /import\s+(?:\{([^}]+)\}|\*\s+as\s+(\w+)|(\w+))\s+from/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      if (match[1]) {
        // Named imports
        imports.push(...match[1].split(',').map(s => s.trim()));
      } else if (match[2]) {
        // Namespace import
        imports.push(match[2]);
      } else if (match[3]) {
        // Default import
        imports.push(match[3]);
      }
    }
    return imports;
  }
  
  /**
   * Extract function definitions
   */
  private static extractFunctions(content: string): string[] {
    const functions: string[] = [];
    
    // Function declarations
    const funcDeclarations = /(?:export\s+)?(?:async\s+)?function\s+(\w+)/g;
    let match;
    while ((match = funcDeclarations.exec(content)) !== null) {
      functions.push(match[1]);
    }
    
    // Arrow functions
    const arrowFunctions = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/g;
    while ((match = arrowFunctions.exec(content)) !== null) {
      functions.push(match[1]);
    }
    
    return functions;
  }
  
  /**
   * Extract class definitions
   */
  private static extractClasses(content: string): string[] {
    const classes: string[] = [];
    const classRegex = /(?:export\s+)?class\s+(\w+)/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
      classes.push(match[1]);
    }
    return classes;
  }
  
  /**
   * Extract interface definitions
   */
  private static extractInterfaces(content: string): string[] {
    const interfaces: string[] = [];
    const interfaceRegex = /(?:export\s+)?interface\s+(\w+)/g;
    let match;
    while ((match = interfaceRegex.exec(content)) !== null) {
      interfaces.push(match[1]);
    }
    return interfaces;
  }
  
  /**
   * Assess code complexity
   */
  private static assessComplexity(content: string): 'low' | 'medium' | 'high' {
    const lines = content.split('\n').length;
    const cyclomatic = (content.match(/if|else|while|for|switch|case|catch|\?\?|\|\||&&/g) || []).length;
    
    if (lines < 100 && cyclomatic < 10) return 'low';
    if (lines < 300 && cyclomatic < 25) return 'medium';
    return 'high';
  }
  
  /**
   * Determine if file is business critical
   */
  private static isBusinessCritical(filePath: string, content: string): boolean {
    const criticalPatterns = [
      'payment', 'billing', 'stripe', 'auth', 'login', 'session',
      'database', 'storage', 'schema', 'migration',
      'api', 'routes', 'endpoint',
      'generation', 'ai', 'flux', 'replicate'
    ];
    
    const pathLower = filePath.toLowerCase();
    const contentLower = content.toLowerCase();
    
    return criticalPatterns.some(pattern => 
      pathLower.includes(pattern) || contentLower.includes(pattern)
    );
  }
  
  /**
   * Analyze project structure
   */
  private static analyzeProjectStructure(files: FileAnalysis[]) {
    const filesByType = files.reduce((acc, file) => {
      acc[file.type] = (acc[file.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const largestFiles = files
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);
    
    const recentlyModified = files
      .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
      .slice(0, 10);
    
    return {
      totalFiles: files.length,
      filesByType,
      largestFiles,
      recentlyModified
    };
  }
  
  /**
   * Analyze dependencies and relationships
   */
  private static async analyzeDependencies(files: FileAnalysis[]) {
    const external: string[] = [];
    const internal = new Map<string, string[]>();
    const circular: string[][] = [];
    const unused: string[] = [];
    
    // Extract external dependencies
    files.forEach(file => {
      file.dependencies.forEach(dep => {
        if (!dep.startsWith('.') && !dep.startsWith('/')) {
          external.push(dep);
        } else {
          const deps = internal.get(file.path) || [];
          deps.push(dep);
          internal.set(file.path, deps);
        }
      });
    });
    
    // TODO: Implement circular dependency detection
    // TODO: Implement unused dependency detection
    
    return {
      external: [...new Set(external)],
      internal,
      circular,
      unused
    };
  }
  
  /**
   * Analyze architecture patterns
   */
  private static analyzeArchitecture(files: FileAnalysis[]) {
    const patterns: string[] = [];
    const antiPatterns: string[] = [];
    const suggestions: string[] = [];
    const technicalDebt: string[] = [];
    
    // Detect patterns
    const hasComponents = files.some(f => f.type === 'component');
    const hasPages = files.some(f => f.type === 'page');
    const hasApi = files.some(f => f.type === 'api');
    const hasUtilities = files.some(f => f.type === 'utility');
    
    if (hasComponents && hasPages) patterns.push('Component-based architecture');
    if (hasApi) patterns.push('API-driven architecture');
    if (hasUtilities) patterns.push('Utility-first approach');
    
    // Detect anti-patterns
    const largeFiles = files.filter(f => f.size > 10000);
    if (largeFiles.length > 0) {
      antiPatterns.push(`Large files detected: ${largeFiles.length} files over 10KB`);
    }
    
    const highComplexity = files.filter(f => f.complexity === 'high');
    if (highComplexity.length > 0) {
      antiPatterns.push(`High complexity files: ${highComplexity.length} files`);
    }
    
    // Generate suggestions
    if (antiPatterns.length > 0) {
      suggestions.push('Consider breaking down large files into smaller modules');
      suggestions.push('Refactor high-complexity functions into smaller units');
    }
    
    return {
      patterns,
      antiPatterns,
      suggestions,
      technicalDebt
    };
  }
  
  /**
   * Analyze business logic and features
   */
  private static analyzeBusinessLogic(files: FileAnalysis[]) {
    const coreFeatures: string[] = [];
    const userFlows: string[] = [];
    const dataModels: string[] = [];
    const apiEndpoints: string[] = [];
    
    // Extract core features from file names and content
    files.forEach(file => {
      const pathSegments = file.path.split('/');
      
      // Identify core features
      if (file.path.includes('auth')) coreFeatures.push('Authentication');
      if (file.path.includes('payment') || file.path.includes('stripe')) coreFeatures.push('Payment Processing');
      if (file.path.includes('generation') || file.path.includes('ai')) coreFeatures.push('AI Generation');
      if (file.path.includes('admin')) coreFeatures.push('Admin Dashboard');
      if (file.path.includes('workspace')) coreFeatures.push('Workspace Management');
      
      // Identify user flows
      if (file.type === 'page') {
        userFlows.push(pathSegments[pathSegments.length - 1].replace('.tsx', '').replace('.jsx', ''));
      }
      
      // Identify data models
      if (file.path.includes('schema') || file.path.includes('types')) {
        file.interfaces.forEach(interfaceName => dataModels.push(interfaceName));
        file.classes.forEach(cls => dataModels.push(cls));
      }
      
      // Identify API endpoints
      if (file.type === 'api') {
        file.functions.forEach(func => apiEndpoints.push(`${file.path}:${func}`));
      }
    });
    
    return {
      coreFeatures: [...new Set(coreFeatures)],
      userFlows: [...new Set(userFlows)],
      dataModels: [...new Set(dataModels)],
      apiEndpoints: [...new Set(apiEndpoints)]
    };
  }
  
  /**
   * Get specific insights for agent context
   */
  static async getAgentContext(query: string): Promise<string> {
    console.log(`🧠 CODEBASE INTELLIGENCE: Generating context for query: ${query}`);
    
    try {
      const insights = await this.analyzeCodebase();
      
      // Generate contextual response based on query
      if (query.toLowerCase().includes('architecture')) {
        return this.formatArchitectureContext(insights);
      } else if (query.toLowerCase().includes('business') || query.toLowerCase().includes('feature')) {
        return this.formatBusinessContext(insights);
      } else if (query.toLowerCase().includes('technical') || query.toLowerCase().includes('code')) {
        return this.formatTechnicalContext(insights);
      } else {
        return this.formatGeneralContext(insights);
      }
    } catch (error) {
      console.error('🧠 CODEBASE INTELLIGENCE ERROR:', error);
      return 'Codebase analysis temporarily unavailable. Using basic context.';
    }
  }
  
  /**
   * Format architecture-focused context
   */
  private static formatArchitectureContext(insights: CodebaseInsight): string {
    return `
🏗️ **ARCHITECTURE OVERVIEW:**
- **Project Structure**: ${insights.projectStructure.totalFiles} files across ${Object.keys(insights.projectStructure.filesByType).length} categories
- **Patterns Detected**: ${insights.architecture.patterns.join(', ') || 'Standard web application'}
- **External Dependencies**: ${insights.dependencies.external.slice(0, 10).join(', ')}${insights.dependencies.external.length > 10 ? '...' : ''}

⚠️ **TECHNICAL CONSIDERATIONS:**
${insights.architecture.antiPatterns.length > 0 ? `- Anti-patterns: ${insights.architecture.antiPatterns.join(', ')}` : '- No major anti-patterns detected'}
${insights.architecture.suggestions.length > 0 ? `- Suggestions: ${insights.architecture.suggestions.join(', ')}` : ''}
`;
  }
  
  /**
   * Format business-focused context
   */
  private static formatBusinessContext(insights: CodebaseInsight): string {
    return `
💼 **BUSINESS FEATURES:**
- **Core Features**: ${insights.businessLogic.coreFeatures.join(', ') || 'Standard web features'}
- **User Flows**: ${insights.businessLogic.userFlows.slice(0, 5).join(', ')}${insights.businessLogic.userFlows.length > 5 ? '...' : ''}
- **API Endpoints**: ${insights.businessLogic.apiEndpoints.length} endpoints available
- **Data Models**: ${insights.businessLogic.dataModels.slice(0, 5).join(', ')}${insights.businessLogic.dataModels.length > 5 ? '...' : ''}

🎯 **BUSINESS CRITICAL FILES:**
- **Components**: ${insights.projectStructure.filesByType.component || 0} files
- **Pages**: ${insights.projectStructure.filesByType.page || 0} files  
- **APIs**: ${insights.projectStructure.filesByType.api || 0} files
`;
  }
  
  /**
   * Format technical-focused context
   */
  private static formatTechnicalContext(insights: CodebaseInsight): string {
    return `
🔧 **TECHNICAL OVERVIEW:**
- **Languages**: TypeScript, JavaScript, React
- **File Distribution**: ${Object.entries(insights.projectStructure.filesByType).map(([type, count]) => `${type}: ${count}`).join(', ')}
- **Largest Files**: ${insights.projectStructure.largestFiles.slice(0, 3).map(f => path.basename(f.path)).join(', ')}
- **Recent Changes**: ${insights.projectStructure.recentlyModified.slice(0, 3).map(f => path.basename(f.path)).join(', ')}

📦 **DEPENDENCIES:**
- **External**: ${insights.dependencies.external.length} packages
- **Key Libraries**: ${insights.dependencies.external.filter(d => ['react', 'express', 'drizzle', 'stripe', 'anthropic'].some(key => d.includes(key))).join(', ')}
`;
  }
  
  /**
   * Format general context
   */
  private static formatGeneralContext(insights: CodebaseInsight): string {
    return `
📊 **PROJECT OVERVIEW:**
- **Total Files**: ${insights.projectStructure.totalFiles}
- **Architecture**: ${insights.architecture.patterns.join(', ') || 'Standard web application'}
- **Core Features**: ${insights.businessLogic.coreFeatures.join(', ') || 'Standard web features'}
- **External Dependencies**: ${insights.dependencies.external.length} packages
- **Business Critical**: ${insights.projectStructure.largestFiles.filter(f => f.businessCritical).length} critical files identified

🎯 **KEY INSIGHTS:**
${insights.architecture.suggestions.length > 0 ? `- ${insights.architecture.suggestions[0]}` : '- Architecture is well-structured'}
${insights.architecture.antiPatterns.length > 0 ? `- ${insights.architecture.antiPatterns[0]}` : '- No major issues detected'}
`;
  }
  
  /**
   * Clear cache (for testing or forced refresh)
   */
  static clearCache(): void {
    this.cache = { data: null, timestamp: 0 };
    console.log('🧠 CODEBASE INTELLIGENCE: Cache cleared');
  }
}