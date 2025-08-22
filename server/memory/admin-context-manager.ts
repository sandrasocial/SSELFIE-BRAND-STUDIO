/**
 * ADMIN CONTEXT MANAGER - PHASE 2 PROJECT AWARENESS
 * Provides admin agents with project structure understanding and protection rules
 */

interface ProjectContext {
  projectStructure: {
    coreRevenueSystems: string;
    adminDevelopmentZone: string;
    existingSystems: string[];
    avoidConflicts: string[];
  };
  lastContextUpdate: Date;
  agentName: string;
  userId: string;
  currentTask: string;
  adminPrivileges: boolean;
  memories: any[];
  timestamp: Date;
}

export class AdminContextManager {
  private static instance: AdminContextManager;
  private contextCache = new Map<string, ProjectContext>();

  private constructor() {}

  public static getInstance(): AdminContextManager {
    if (!AdminContextManager.instance) {
      AdminContextManager.instance = new AdminContextManager();
    }
    return AdminContextManager.instance;
  }

  getProjectContextForAgent(agentName: string): ProjectContext | null {
    return this.contextCache.get(agentName) || null;
  }
}