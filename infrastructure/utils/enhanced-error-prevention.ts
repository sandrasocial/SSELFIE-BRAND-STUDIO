import { MemoryLeakDetector } from './memory-leak-detector';
import { CircularDependencyChecker } from './circular-dependency-checker';
import { TypeCoverageMonitor } from './type-coverage-monitor';

export class EnhancedErrorPrevention {
  private memoryDetector: MemoryLeakDetector;
  private circularChecker: CircularDependencyChecker;
  private typeMonitor: TypeCoverageMonitor;

  constructor() {
    this.initializeMonitors();
    this.setupEventHandlers();
  }

  private initializeMonitors(): void {
    this.memoryDetector = new MemoryLeakDetector();
    this.circularChecker = new CircularDependencyChecker();
    this.typeMonitor = new TypeCoverageMonitor();
  }

  private setupEventHandlers(): void {
    this.memoryDetector.on('warning', (data) => {
      console.warn(data.message);
      // Alert agents
    });

    this.memoryDetector.on('critical', (data) => {
      console.error(data.message);
      // Alert agents and potentially take action
    });
  }

  async runFullCheck(): Promise<{
    memoryStatus: any;
    circularDeps: string[];
    typeCoverage: {
      coverage: number;
      issues: string[];
    };
  }> {
    const memoryStatus = process.memoryUsage();
    const circularDeps = await this.circularChecker.checkForCircularDependencies('./src');
    const typeCoverage = await this.typeMonitor.checkTypeCoverage();

    return {
      memoryStatus,
      circularDeps,
      typeCoverage
    };
  }
}