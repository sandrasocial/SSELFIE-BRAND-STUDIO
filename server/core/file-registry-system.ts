import * as fs from 'fs';
import * as path from 'path';

export class FileRegistrySystem {
  private static instance: FileRegistrySystem;
  private registryMap: Map<string, string> = new Map();
  private readonly registryFile = 'file-registry.json';

  private constructor() {
    this.loadRegistry();
  }

  static getInstance(): FileRegistrySystem {
    if (!FileRegistrySystem.instance) {
      FileRegistrySystem.instance = new FileRegistrySystem();
    }
    return FileRegistrySystem.instance;
  }

  private loadRegistry() {
    try {
      if (fs.existsSync(this.registryFile)) {
        const data = fs.readFileSync(this.registryFile, 'utf8');
        const parsed = JSON.parse(data);
        this.registryMap = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading registry:', error);
    }
  }

  private saveRegistry() {
    try {
      const obj = Object.fromEntries(this.registryMap);
      fs.writeFileSync(this.registryFile, JSON.stringify(obj, null, 2));
    } catch (error) {
      console.error('Error saving registry:', error);
    }
  }

  fileExists(filename: string): boolean {
    return this.registryMap.has(filename);
  }

  getFilePath(filename: string): string | null {
    return this.registryMap.get(filename) || null;
  }

  registerFile(filename: string, filepath: string) {
    this.registryMap.set(filename, filepath);
    this.saveRegistry();
  }

  getAllRegisteredFiles(): Map<string, string> {
    return new Map(this.registryMap);
  }
}