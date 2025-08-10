export class CircularDependencyChecker {
  private visited: Set<string> = new Set();
  private stack: Set<string> = new Set();
  private dependencies: Map<string, string[]> = new Map();

  async checkForCircularDependencies(startFile: string): Promise<string[]> {
    this.visited.clear();
    this.stack.clear();
    
    const circles = await this.detectCircular(startFile);
    if (circles.length > 0) {
      console.error('🔄 Circular Dependencies Detected:', circles);
    }
    return circles;
  }

  private async detectCircular(file: string): Promise<string[]> {
    if (this.stack.has(file)) {
      return Array.from(this.stack);
    }
    
    if (this.visited.has(file)) {
      return [];
    }

    this.visited.add(file);
    this.stack.add(file);

    const deps = this.dependencies.get(file) || [];
    const circles: string[] = [];

    for (const dep of deps) {
      const result = await this.detectCircular(dep);
      if (result.length > 0) {
        circles.push(...result);
      }
    }

    this.stack.delete(file);
    return circles;
  }
}