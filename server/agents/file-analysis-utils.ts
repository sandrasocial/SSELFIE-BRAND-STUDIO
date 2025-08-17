// File Analysis Utilities for Olga Organizer
// Advanced dependency mapping and safe cleanup detection

import { promises as fs } from 'fs';
import * as path from 'path';

export interface FileAnalysis {
  filePath: string;
  fileType: 'component' | 'utility' | 'test' | 'config' | 'asset' | 'documentation';
  dependencies: string[];
  dependents: string[];
  isUsed: boolean;
  isSafeToArchive: boolean;
  suggestedLocation: string;
}

export interface DependencyMap {
  [filePath: string]: {
    imports: string[];
    exports: string[];
    usedBy: string[];
  };
}

export class FileAnalyzer {
  private rootDir: string;
  private dependencyMap: DependencyMap = {};

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async analyzeDependencies(): Promise<DependencyMap> {
    const allFiles = await this.getAllFiles();
    
    for (const file of allFiles) {
      if (this.isAnalyzableFile(file)) {
        await this.analyzeFile(file);
      }
    }

    // Build reverse dependency map
    this.buildReverseDependencies();
    
    return this.dependencyMap;
  }

  private async getAllFiles(): Promise<string[]> {
    const files: string[] = [];
    
    async function scanDirectory(dir: string): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    }

    await scanDirectory(this.rootDir);
    return files;
  }

  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', '.sselfie-backups'];
    return skipDirs.includes(dirName);
  }

  private isAnalyzableFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    return ['.ts', '.tsx', '.js', '.jsx'].includes(ext);
  }

  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const imports = this.extractImports(content);
      const exports = this.extractExports(content);

      this.dependencyMap[filePath] = {
        imports,
        exports,
        usedBy: []
      };
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
    }
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    
    // Match import statements
    const importRegex = /import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (importPath.startsWith('.') || importPath.startsWith('@/')) {
        imports.push(importPath);
      }
    }

    return imports;
  }

  private extractExports(content: string): string[] {
    const exports: string[] = [];
    
    // Match export statements
    const exportPatterns = [
      /export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/g,
      /export\s+\{\s*([^}]+)\s*\}/g,
      /export\s+default\s+(\w+)/g
    ];

    for (const pattern of exportPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          if (match[1].includes(',')) {
            // Handle multiple exports
            const multipleExports = match[1].split(',').map(exp => exp.trim());
            exports.push(...multipleExports);
          } else {
            exports.push(match[1]);
          }
        }
      }
    }

    return exports;
  }

  private buildReverseDependencies(): void {
    for (const [filePath, fileData] of Object.entries(this.dependencyMap)) {
      for (const importPath of fileData.imports) {
        const resolvedPath = this.resolveImportPath(importPath, filePath);
        if (resolvedPath && this.dependencyMap[resolvedPath]) {
          this.dependencyMap[resolvedPath].usedBy.push(filePath);
        }
      }
    }
  }

  private resolveImportPath(importPath: string, fromFile: string): string | null {
    try {
      if (importPath.startsWith('@/')) {
        // Handle alias imports
        const relativePath = importPath.replace('@/', 'client/src/');
        return path.resolve(this.rootDir, relativePath);
      } else if (importPath.startsWith('.')) {
        // Handle relative imports
        const dir = path.dirname(fromFile);
        return path.resolve(dir, importPath);
      }
    } catch (error) {
      console.error(`Error resolving import path ${importPath} from ${fromFile}:`, error);
    }
    
    return null;
  }

  async identifyOrphanedFiles(): Promise<string[]> {
    const orphanedFiles: string[] = [];
    
    for (const [filePath, fileData] of Object.entries(this.dependencyMap)) {
      if (fileData.usedBy.length === 0 && !this.isEntryPoint(filePath)) {
        orphanedFiles.push(filePath);
      }
    }

    return orphanedFiles;
  }

  private isEntryPoint(filePath: string): boolean {
    const entryPoints = [
      'main.tsx',
      'index.tsx',
      'App.tsx',
      'index.ts',
      'server.ts',
      'routes.ts'
    ];
    
    const fileName = path.basename(filePath);
    return entryPoints.includes(fileName);
  }

  async categorizeFiles(): Promise<{ [category: string]: string[] }> {
    const categories = {
      components: [] as string[],
      utilities: [] as string[],
      tests: [] as string[],
      configs: [] as string[],
      assets: [] as string[],
      documentation: [] as string[]
    };

    const allFiles = await this.getAllFiles();

    for (const file of allFiles) {
      const category = this.categorizeFile(file);
      if (categories[category]) {
        categories[category].push(file);
      }
    }

    return categories;
  }

  private categorizeFile(filePath: string): string {
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);

    // Test files
    if (fileName.includes('.test.') || fileName.includes('.spec.') || dirName.includes('test')) {
      return 'tests';
    }

    // Component files
    if (fileName.endsWith('.tsx') && (dirName.includes('component') || dirName.includes('page'))) {
      return 'components';
    }

    // Utility files
    if (fileName.endsWith('.ts') && (dirName.includes('util') || dirName.includes('lib') || dirName.includes('helper'))) {
      return 'utilities';
    }

    // Config files
    if (fileName.includes('config') || fileName.includes('.json') || fileName.includes('.env')) {
      return 'configs';
    }

    // Documentation
    if (fileName.endsWith('.md') || fileName.endsWith('.txt')) {
      return 'documentation';
    }

    // Assets
    if (fileName.match(/\.(png|jpg|jpeg|gif|svg|ico|webp)$/)) {
      return 'assets';
    }

    return 'utilities';
  }
}

export async function createSafeArchiveStructure(rootDir: string): Promise<void> {
  const archiveDirs = [
    'archive',
    'archive/deprecated-components',
    'archive/test-files',
    'archive/unused-utilities',
    'archive/old-configurations',
    'archive/backups'
  ];

  for (const dir of archiveDirs) {
    const fullPath = path.join(rootDir, dir);
    try {
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error) {
      console.error(`Error creating archive directory ${fullPath}:`, error);
    }
  }
}

export default FileAnalyzer;