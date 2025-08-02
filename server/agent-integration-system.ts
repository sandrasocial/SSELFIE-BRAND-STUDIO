/**
 * AGENT INTEGRATION SYSTEM
 * Integrates implementation protocol with existing agent architecture
 * Created by Zara with Replit AI Agent coordination
 * 
 * This system hooks into agent conversations to trigger autonomous implementation
 */

import { executeAgentImplementation, ImplementationContext, ImplementationResult } from './agent-implementation-protocol';
import { promises as fs } from 'fs';
import path from 'path';

export interface AgentAction {
  type: 'file_created' | 'component_generated' | 'service_created' | 'route_needed';
  file: string;
  content: string;
  metadata: Record<string, any>;
}

export interface AgentSession {
  agentId: string;
  sessionId: string;
  actions: AgentAction[];
  implementationStatus: 'pending' | 'running' | 'completed' | 'failed';
  lastActivity: Date;
}

/**
 * AGENT INTEGRATION MONITOR
 * Monitors agent activities and triggers implementation protocol
 */
export class AgentIntegrationSystem {
  private sessions: Map<string, AgentSession> = new Map();
  private implementationQueue: Map<string, ImplementationContext> = new Map();

  /**
   * HOOK: Called when agent creates files
   * Automatically triggers implementation protocol
   */
  async onAgentFileCreation(agentId: string, sessionId: string, filePath: string, content: string): Promise<void> {
    console.log(`📋 INTEGRATION SYSTEM: Agent ${agentId} created file ${filePath}`);
    
    const session = this.getOrCreateSession(agentId, sessionId);
    session.actions.push({
      type: 'file_created',
      file: filePath,
      content,
      metadata: { timestamp: new Date().toISOString() }
    });

    // Check if this completes a logical unit of work
    if (this.shouldTriggerImplementation(session)) {
      await this.triggerImplementationProtocol(session);
    }
  }

  /**
   * HOOK: Called when agent generates components
   */
  async onAgentComponentGeneration(agentId: string, sessionId: string, componentName: string, filePath: string): Promise<void> {
    console.log(`🎨 INTEGRATION SYSTEM: Agent ${agentId} generated component ${componentName}`);
    
    const session = this.getOrCreateSession(agentId, sessionId);
    session.actions.push({
      type: 'component_generated',
      file: filePath,
      content: '',
      metadata: { componentName, timestamp: new Date().toISOString() }
    });

    // UI components typically need route integration
    if (this.isUIComponent(filePath)) {
      await this.triggerImplementationProtocol(session);
    }
  }

  /**
   * HOOK: Called when agent creates backend services
   */
  async onAgentServiceCreation(agentId: string, sessionId: string, serviceName: string, filePath: string): Promise<void> {
    console.log(`⚙️ INTEGRATION SYSTEM: Agent ${agentId} created service ${serviceName}`);
    
    const session = this.getOrCreateSession(agentId, sessionId);
    session.actions.push({
      type: 'service_created',
      file: filePath,
      content: '',
      metadata: { serviceName, timestamp: new Date().toISOString() }
    });

    // Backend services always need route integration
    await this.triggerImplementationProtocol(session);
  }

  /**
   * MAIN IMPLEMENTATION TRIGGER
   * Executes the complete 7-step implementation protocol
   */
  private async triggerImplementationProtocol(session: AgentSession): Promise<void> {
    if (session.implementationStatus === 'running') {
      console.log(`⏳ INTEGRATION SYSTEM: Implementation already running for ${session.agentId}`);
      return;
    }

    session.implementationStatus = 'running';
    console.log(`🚀 INTEGRATION SYSTEM: Triggering implementation protocol for ${session.agentId}`);

    try {
      const context: ImplementationContext = {
        agentId: session.agentId,
        sessionId: session.sessionId,
        createdFiles: session.actions.map(a => a.file),
        targetRoutes: this.extractTargetRoutes(session.actions),
        requestedFeatures: this.extractRequestedFeatures(session.actions),
        workingDirectory: process.cwd()
      };

      // Execute the complete implementation protocol
      const result: ImplementationResult = await executeAgentImplementation(context);

      if (result.success) {
        session.implementationStatus = 'completed';
        console.log(`✅ INTEGRATION SYSTEM: Implementation completed successfully for ${session.agentId}`);
        
        // Notify other systems of completion
        await this.broadcastImplementationSuccess(session, result);
      } else {
        session.implementationStatus = 'failed';
        console.log(`❌ INTEGRATION SYSTEM: Implementation failed for ${session.agentId}:`, result.errors);
        
        // Attempt recovery or notification
        await this.handleImplementationFailure(session, result);
      }

    } catch (error) {
      session.implementationStatus = 'failed';
      console.error(`💥 INTEGRATION SYSTEM: Implementation protocol error for ${session.agentId}:`, error);
    }
  }

  /**
   * INTELLIGENCE: Determine when to trigger implementation
   */
  private shouldTriggerImplementation(session: AgentSession): boolean {
    const recentActions = session.actions.filter(a => 
      (new Date().getTime() - new Date(a.metadata.timestamp).getTime()) < 60000 // Last minute
    );

    // Trigger if:
    // 1. Backend service created (always needs routes)
    // 2. Multiple related files created
    // 3. Component + service combination
    // 4. Explicit request for integration

    const hasBackendService = recentActions.some(a => a.type === 'service_created');
    const hasMultipleFiles = recentActions.length >= 2;
    const hasComponentAndService = recentActions.some(a => a.type === 'component_generated') && 
                                   recentActions.some(a => a.type === 'service_created');

    return hasBackendService || hasMultipleFiles || hasComponentAndService;
  }

  private isUIComponent(filePath: string): boolean {
    return filePath.includes('/components/') && (filePath.endsWith('.tsx') || filePath.endsWith('.jsx'));
  }

  private extractTargetRoutes(actions: AgentAction[]): string[] {
    const routes: string[] = [];
    
    actions.forEach(action => {
      if (action.type === 'service_created') {
        routes.push('server/routes.ts');
      }
      if (action.type === 'component_generated') {
        routes.push('client/src/App.tsx');
      }
    });

    return Array.from(new Set(routes)); // Remove duplicates
  }

  private extractRequestedFeatures(actions: AgentAction[]): string[] {
    return actions.map(action => action.metadata.componentName || action.metadata.serviceName).filter(Boolean);
  }

  private getOrCreateSession(agentId: string, sessionId: string): AgentSession {
    const key = `${agentId}-${sessionId}`;
    
    if (!this.sessions.has(key)) {
      this.sessions.set(key, {
        agentId,
        sessionId,
        actions: [],
        implementationStatus: 'pending',
        lastActivity: new Date()
      });
    }

    const session = this.sessions.get(key)!;
    session.lastActivity = new Date();
    return session;
  }

  private async broadcastImplementationSuccess(session: AgentSession, result: ImplementationResult): Promise<void> {
    // Notify other agents of successful implementation
    console.log(`📢 BROADCAST: Agent ${session.agentId} completed autonomous implementation`);
    
    // Update system status
    await this.updateSystemStatus(session.agentId, 'implementation_completed', {
      completedSteps: result.completedSteps.length,
      totalSteps: 7,
      validations: result.validationResults.length
    });
  }

  private async handleImplementationFailure(session: AgentSession, result: ImplementationResult): Promise<void> {
    console.log(`🔧 RECOVERY: Attempting recovery for ${session.agentId} implementation failure`);
    
    // Log detailed failure analysis
    await this.logImplementationFailure(session, result);
    
    // Attempt auto-recovery for common issues
    const recoveryAttempted = await this.attemptAutoRecovery(session, result);
    
    if (!recoveryAttempted) {
      console.log(`💥 RECOVERY FAILED: Manual intervention required for ${session.agentId}`);
    }
  }

  private async updateSystemStatus(agentId: string, event: string, metadata: Record<string, any>): Promise<void> {
    // Update system-wide status tracking
    const statusUpdate = {
      agentId,
      event,
      timestamp: new Date().toISOString(),
      metadata
    };

    // In a real implementation, this might update a database or emit events
    console.log(`📊 STATUS UPDATE:`, statusUpdate);
  }

  private async logImplementationFailure(session: AgentSession, result: ImplementationResult): Promise<void> {
    const failureLog = {
      agentId: session.agentId,
      sessionId: session.sessionId,
      timestamp: new Date().toISOString(),
      errors: result.errors,
      completedSteps: result.completedSteps,
      failurePoint: result.errors[0]?.step || 'unknown'
    };

    console.log(`💥 IMPLEMENTATION FAILURE LOG:`, failureLog);
    
    // Save to failure log file
    try {
      const logPath = `implementation-failures-${new Date().toISOString().split('T')[0]}.json`;
      const existingLog = await this.readJsonFile(logPath) || [];
      existingLog.push(failureLog);
      await fs.writeFile(logPath, JSON.stringify(existingLog, null, 2));
    } catch (error) {
      console.error('Failed to save implementation failure log:', error);
    }
  }

  private async attemptAutoRecovery(session: AgentSession, result: ImplementationResult): Promise<boolean> {
    // Attempt automatic recovery based on error types
    for (const error of result.errors) {
      if (error.autoFixable) {
        console.log(`🔧 AUTO-RECOVERY: Attempting fix for ${error.type} error`);
        
        const fixed = await this.applyAutoFix(error);
        if (fixed) {
          console.log(`✅ AUTO-RECOVERY: Fixed ${error.type} error`);
          
          // Retry implementation after fix
          await this.triggerImplementationProtocol(session);
          return true;
        }
      }
    }

    return false;
  }

  private async applyAutoFix(error: any): Promise<boolean> {
    // Apply automatic fixes for common errors
    switch (error.type) {
      case 'syntax':
        return await this.fixSyntaxError(error);
      case 'dependency':
        return await this.fixDependencyError(error);
      case 'route':
        return await this.fixRouteError(error);
      default:
        return false;
    }
  }

  private async fixSyntaxError(error: any): Promise<boolean> {
    // Auto-fix common syntax errors
    return false; // Placeholder
  }

  private async fixDependencyError(error: any): Promise<boolean> {
    // Auto-fix dependency issues
    return false; // Placeholder
  }

  private async fixRouteError(error: any): Promise<boolean> {
    // Auto-fix route integration issues
    return false; // Placeholder
  }

  private async readJsonFile(filePath: string): Promise<any> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * PUBLIC API: Get implementation status for an agent
   */
  getImplementationStatus(agentId: string, sessionId: string): string {
    const session = this.sessions.get(`${agentId}-${sessionId}`);
    return session?.implementationStatus || 'pending';
  }

  /**
   * PUBLIC API: Get all active sessions
   */
  getActiveSessions(): AgentSession[] {
    return Array.from(this.sessions.values()).filter(s => 
      s.implementationStatus === 'running' || 
      (new Date().getTime() - s.lastActivity.getTime()) < 300000 // Active in last 5 minutes
    );
  }

  /**
   * PUBLIC API: Force implementation for an agent session
   */
  async forceImplementation(agentId: string, sessionId: string): Promise<ImplementationResult | null> {
    const session = this.sessions.get(`${agentId}-${sessionId}`);
    if (!session) return null;

    await this.triggerImplementationProtocol(session);
    return null; // Result will be available via status check
  }
}

// Export singleton instance
export const agentIntegrationSystem = new AgentIntegrationSystem();