import fs from 'fs';
import path from 'path';

interface FileRegistry {
  files: {
    [key: string]: {
      path: string;
      lastModified: Date;
      hash: string;
    }
  };
}

class FileTracker {
  private static instance: FileTracker;
  private registryPath: string = '.file-registry.json';
  private registry: FileRegistry;

  private constructor() {
    this.registry = this.loadRegistry();
  }

  public static getInstance(): FileTracker {
    if (!FileTracker.instance) {
      FileTracker.instance = new FileTracker();
    }
    return FileTracker.instance;
  }

  private loadRegistry(): FileRegistry {
    try {
      if (fs.existsSync(this.registryPath)) {
        const data = fs.readFileSync(this.registryPath, 'utf8');
        return JSON.parse(data);
      }
      return { files: {} };
    } catch (error) {
      console.error('Error loading registry:', error);
      return { files: {} };
    }
  }

  private saveRegistry(): void {
    try {
      fs.writeFileSync(this.registryPath, JSON.stringify(this.registry, null, 2));
    } catch (error) {
      console.error('Error saving registry:', error);
    }
  }

  public isFileTracked(filePath: string): boolean {
    return !!this.registry.files[filePath];
  }

  public trackFile(filePath: string): void {
    if (!this.isFileTracked(filePath)) {
      this.registry.files[filePath] = {
        path: filePath,
        lastModified: new Date(),
        hash: this.calculateFileHash(filePath)
      };
      this.saveRegistry();
    }
  }

  private calculateFileHash(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return require('crypto').createHash('md5').update(content).digest('hex');
    } catch (error) {
      console.error('Error calculating file hash:', error);
      return '';
    }
  }

  public hasFileChanged(filePath: string): boolean {
    if (!this.isFileTracked(filePath)) {
      return true;
    }

    const currentHash = this.calculateFileHash(filePath);
    return this.registry.files[filePath].hash !== currentHash;
  }

  public cleanupUnusedFiles(): string[] {
    const removedFiles: string[] = [];
    
    for (const filePath in this.registry.files) {
      if (!fs.existsSync(filePath)) {
        delete this.registry.files[filePath];
        removedFiles.push(filePath);
      }
    }

    if (removedFiles.length > 0) {
      this.saveRegistry();
    }

    return removedFiles;
  }
}

export const fileTracker = FileTracker.getInstance();