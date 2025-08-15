import { Project, TypeChecker } from 'ts-morph';

export class TypeCoverageMonitor {
  private project: Project;
  private warningThreshold: number = 85; // Warn if type coverage falls below 85%

  constructor() {
    this.project = new Project({
      tsConfigFilePath: 'tsconfig.json'
    });
  }

  async checkTypeCoverage(): Promise<{
    coverage: number;
    issues: string[];
  }> {
    const sourceFiles = this.project.getSourceFiles();
    const issues: string[] = [];
    let totalNodes = 0;
    let typedNodes = 0;

    for (const sourceFile of sourceFiles) {
      sourceFile.forEachDescendant(node => {
        totalNodes++;
        if (node.getType().isAny() || node.getType().isUnknown()) {
          issues.push(
            `⚠️ Implicit any/unknown at ${sourceFile.getFilePath()}:${node.getStartLineNumber()}`
          );
        } else {
          typedNodes++;
        }
      });
    }

    const coverage = (typedNodes / totalNodes) * 100;
    
    if (coverage < this.warningThreshold) {
      console.warn(`🚨 Type coverage (${coverage.toFixed(2)}%) below threshold!`);
    }

    return {
      coverage,
      issues
    };
  }
}