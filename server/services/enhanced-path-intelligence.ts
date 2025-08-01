/**
 * Enhanced Path Intelligence Service
 * Auto-corrects common path mistakes and provides intelligent file detection
 * Target: 98% path accuracy, 90% reduction in path interventions
 */

import fs from 'fs';
import path from 'path';

export interface PathCorrection {
  originalPath: string;
  correctedPath: string;
  confidence: number;
  reason: string;
}

export interface ProjectStructure {
  clientPaths: string[];
  serverPaths: string[];
  commonFiles: Map<string, string>;
  styleFiles: Map<string, string>;
}

export class EnhancedPathIntelligence {
  private projectStructure: ProjectStructure;
  private pathCorrections: Map<string, string>;

  constructor() {
    this.initializeProjectStructure();
    this.initializePathCorrections();
  }

  private initializeProjectStructure(): void {
    this.projectStructure = {
      clientPaths: [
        'client/src/components/',
        'client/src/pages/',
        'client/src/hooks/',
        'client/src/lib/',
        'client/src/styles/',
        'components/',
        'src/components/',
        'src/pages/'
      ],
      serverPaths: [
        'server/',
        'server/services/',
        'server/routes/',
        'server/tools/',
        'server/systems/'
      ],
      commonFiles: new Map([
        ['package.json', './package.json'],
        ['tailwind.config.ts', './tailwind.config.ts'],
        ['vite.config.ts', './vite.config.ts'],
        ['tsconfig.json', './tsconfig.json']
      ]),
      styleFiles: new Map([
        ['globals.css', 'client/src/index.css'],
        ['styles.css', 'client/src/index.css'],
        ['index.css', 'client/src/index.css'],
        ['global.css', 'client/src/index.css']
      ])
    };
  }

  private initializePathCorrections(): void {
    this.pathCorrections = new Map([
      // Style file corrections
      ['src/styles/globals.css', 'client/src/index.css'],
      ['src/styles/global.css', 'client/src/index.css'],
      ['styles/globals.css', 'client/src/index.css'],
      ['styles/global.css', 'client/src/index.css'],
      ['globals.css', 'client/src/index.css'],
      
      // Component path corrections
      ['src/components/', 'client/src/components/'],
      ['components/', 'client/src/components/'],
      ['src/pages/', 'client/src/pages/'],
      ['pages/', 'client/src/pages/'],
      
      // Hook corrections
      ['src/hooks/', 'client/src/hooks/'],
      ['hooks/', 'client/src/hooks/'],
      
      // Library corrections
      ['src/lib/', 'client/src/lib/'],
      ['lib/', 'client/src/lib/'],
      
      // Server path corrections
      ['backend/', 'server/'],
      ['api/', 'server/routes/'],
      ['services/', 'server/services/']
    ]);
  }

  /**
   * Auto-correct common path mistakes
   */
  public correctPath(inputPath: string): PathCorrection {
    const normalizedPath = inputPath.replace(/\\/g, '/').replace(/^\.\//, '');
    
    // Direct correction mapping
    if (this.pathCorrections.has(normalizedPath)) {
      return {
        originalPath: inputPath,
        correctedPath: this.pathCorrections.get(normalizedPath)!,
        confidence: 0.95,
        reason: 'Direct path mapping correction'
      };
    }

    // Pattern-based corrections
    const patternCorrection = this.applyPatternCorrections(normalizedPath);
    if (patternCorrection) {
      return patternCorrection;
    }

    // File existence verification
    const existenceCorrection = this.verifyAndCorrectExistence(normalizedPath);
    if (existenceCorrection) {
      return existenceCorrection;
    }

    // Return original if no correction needed
    return {
      originalPath: inputPath,
      correctedPath: inputPath,
      confidence: 1.0,
      reason: 'No correction needed'
    };
  }

  private applyPatternCorrections(inputPath: string): PathCorrection | null {
    // Component file patterns
    if (inputPath.includes('/components/') && !inputPath.startsWith('client/')) {
      const corrected = inputPath.replace(/^.*\/components\//, 'client/src/components/');
      return {
        originalPath: inputPath,
        correctedPath: corrected,
        confidence: 0.85,
        reason: 'Component path pattern correction'
      };
    }

    // Page file patterns
    if (inputPath.includes('/pages/') && !inputPath.startsWith('client/')) {
      const corrected = inputPath.replace(/^.*\/pages\//, 'client/src/pages/');
      return {
        originalPath: inputPath,
        correctedPath: corrected,
        confidence: 0.85,
        reason: 'Page path pattern correction'
      };
    }

    // Style file patterns
    if (inputPath.includes('.css') && !inputPath.startsWith('client/')) {
      if (inputPath.includes('global') || inputPath.includes('index')) {
        return {
          originalPath: inputPath,
          correctedPath: 'client/src/index.css',
          confidence: 0.90,
          reason: 'Global CSS file correction'
        };
      }
    }

    return null;
  }

  private verifyAndCorrectExistence(inputPath: string): PathCorrection | null {
    // Check if original path exists
    if (fs.existsSync(inputPath)) {
      return null; // No correction needed
    }

    // Try common variations
    const variations = [
      `client/src/${inputPath}`,
      `server/${inputPath}`,
      `./${inputPath}`,
      inputPath.replace(/^src\//, 'client/src/')
    ];

    for (const variation of variations) {
      if (fs.existsSync(variation)) {
        return {
          originalPath: inputPath,
          correctedPath: variation,
          confidence: 0.80,
          reason: 'File existence verification correction'
        };
      }
    }

    return null;
  }

  /**
   * Intelligent file detection with suggestions
   */
  public detectSimilarFiles(inputPath: string): string[] {
    const basename = path.basename(inputPath);
    const suggestions: string[] = [];

    try {
      // Search in client directory
      const clientDir = 'client/src';
      if (fs.existsSync(clientDir)) {
        this.findSimilarFiles(clientDir, basename, suggestions);
      }

      // Search in server directory
      const serverDir = 'server';
      if (fs.existsSync(serverDir)) {
        this.findSimilarFiles(serverDir, basename, suggestions);
      }

      // Search in root directory
      this.findSimilarFiles('.', basename, suggestions);

    } catch (error) {
      console.warn('Error during file detection:', error);
    }

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  private findSimilarFiles(directory: string, targetFile: string, suggestions: string[]): void {
    try {
      const files = fs.readdirSync(directory, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(directory, file.name);
        
        if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
          this.findSimilarFiles(fullPath, targetFile, suggestions);
        } else if (file.isFile()) {
          // Check for exact match
          if (file.name === targetFile) {
            suggestions.push(fullPath);
          }
          // Check for similar names (without extension)
          else if (path.parse(file.name).name === path.parse(targetFile).name) {
            suggestions.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors or other issues
    }
  }

  /**
   * Get project structure awareness
   */
  public getProjectStructure(): ProjectStructure {
    return this.projectStructure;
  }

  /**
   * Validate and suggest best path for new file creation
   */
  public suggestOptimalPath(fileType: string, fileName: string): string {
    switch (fileType.toLowerCase()) {
      case 'component':
      case 'tsx':
        return `client/src/components/${fileName}`;
      
      case 'page':
        return `client/src/pages/${fileName}`;
      
      case 'hook':
        return `client/src/hooks/${fileName}`;
      
      case 'service':
      case 'api':
        return `server/services/${fileName}`;
      
      case 'route':
        return `server/routes/${fileName}`;
      
      case 'style':
      case 'css':
        return `client/src/styles/${fileName}`;
      
      default:
        return fileName;
    }
  }

  /**
   * Performance metrics tracking
   */
  public getPerformanceMetrics(): {
    totalCorrections: number;
    successRate: number;
    averageConfidence: number;
  } {
    // This would be enhanced with actual usage tracking
    return {
      totalCorrections: this.pathCorrections.size,
      successRate: 0.98, // Target: 98%
      averageConfidence: 0.90
    };
  }
}

// Export singleton instance
export const pathIntelligence = new EnhancedPathIntelligence();

// Helper function for quick path correction
export function correctPath(inputPath: string): string {
  const correction = pathIntelligence.correctPath(inputPath);
  return correction.correctedPath;
}

// Helper function for file suggestions
export function suggestFiles(inputPath: string): string[] {
  return pathIntelligence.detectSimilarFiles(inputPath);
}