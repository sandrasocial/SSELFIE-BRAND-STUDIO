import { fileTracker } from './fileTracker';
import { createFileIfNotExists, appendToFileIfNotExists } from './fileManagement';
import path from 'path';
import fs from 'fs';

interface WorkspaceOperation {
  type: 'create' | 'modify' | 'delete';
  path: string;
  content?: string;
  timestamp: Date;
}

class WorkspaceManager {
  private static instance: WorkspaceManager;
  private operationsLog: WorkspaceOperation[] = [];
  private operationsLogPath: string = '.workspace-operations.json';

  private constructor() {
    this.loadOperationsLog();
  }

  public static getInstance(): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager();
    }
    return WorkspaceManager.instance;
  }

  private loadOperationsLog(): void {
    try {
      if (fs.existsSync(this.operationsLogPath)) {
        const data = fs.readFileSync(this.operationsLogPath, 'utf8');
        this.operationsLog = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading operations log:', error);
    }
  }

  private saveOperationsLog(): void {
    try {
      fs.writeFileSync(this.operationsLogPath, JSON.stringify(this.operationsLog, null, 2));
    } catch (error) {
      console.error('Error saving operations log:', error);
    }
  }

  public isOperationDuplicate(operation: Omit<WorkspaceOperation, 'timestamp'>): boolean {
    const recentOperations = this.operationsLog
      .filter(op => op.type === operation.type && op.path === operation.path)
      .filter(op => {
        const opTime = new Date(op.timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - opTime) / (1000 * 60 * 60);
        return hoursDiff < 24;
      });

    if (operation.type === 'create') {
      return recentOperations.length > 0;
    }

    if (operation.type === 'modify' && operation.content) {
      return recentOperations.some(op => op.content === operation.content);
    }

    return false;
  }

  public logOperation(operation: Omit<WorkspaceOperation, 'timestamp'>): void {
    const fullOperation: WorkspaceOperation = {
      ...operation,
      timestamp: new Date()
    };
    
    this.operationsLog.push(fullOperation);
    this.saveOperationsLog();
  }

  public async createFile(filePath: string, content: string): Promise<boolean> {
    if (this.isOperationDuplicate({ type: 'create', path: filePath, content })) {
      console.log(`File creation skipped (duplicate): ${filePath}`);
      return false;
    }

    const created = createFileIfNotExists(filePath, content);
    if (created) {
      this.logOperation({ type: 'create', path: filePath, content });
      fileTracker.trackFile(filePath);
    }
    return created;
  }

  public async modifyFile(filePath: string, content: string, searchPattern: string): Promise<boolean> {
    if (this.isOperationDuplicate({ type: 'modify', path: filePath, content })) {
      console.log(`File modification skipped (duplicate): ${filePath}`);
      return false;
    }

    const modified = appendToFileIfNotExists(filePath, content, searchPattern);
    if (modified) {
      this.logOperation({ type: 'modify', path: filePath, content });
      fileTracker.trackFile(filePath);
    }
    return modified;
  }

  public getRecentOperations(hours: number = 24): WorkspaceOperation[] {
    const currentTime = new Date().getTime();
    return this.operationsLog.filter(op => {
      const opTime = new Date(op.timestamp).getTime();
      const hoursDiff = (currentTime - opTime) / (1000 * 60 * 60);
      return hoursDiff < hours;
    });
  }

  public cleanup(): void {
    // Remove operations older than 7 days
    const currentTime = new Date().getTime();
    this.operationsLog = this.operationsLog.filter(op => {
      const opTime = new Date(op.timestamp).getTime();
      const daysDiff = (currentTime - opTime) / (1000 * 60 * 60 * 24);
      return daysDiff < 7;
    });
    
    this.saveOperationsLog();
    fileTracker.cleanupUnusedFiles();
  }
}

export const workspaceManager = WorkspaceManager.getInstance();