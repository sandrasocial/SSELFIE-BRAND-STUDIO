import { EventEmitter } from 'events';
import { agentConfigs, AgentConfig, errorHandling } from '../config/agent-system-config';
import { agentPerformanceMonitor } from '../services/agent-performance-monitor';

interface AgentState {
  agentId: string;
  status: 'idle' | 'working' | 'error';
  currentTask?: string;
  lastActive: Date;
  errorCount: number;
}

class AgentStateManager extends EventEmitter {
  private static instance: AgentStateManager;
  private agentStates: Map<string, AgentState> = new Map();
  
  private constructor() {
    super();
    this.initializeAgentStates();
  }

  static getInstance(): AgentStateManager {
    if (!AgentStateManager.instance) {
      AgentStateManager.instance = new AgentStateManager();
    }
    return AgentStateManager.instance;
  }

  private initializeAgentStates(): void {
    Object.keys(agentConfigs).forEach(agentId => {
      this.agentStates.set(agentId, {
        agentId,
        status: 'idle',
        lastActive: new Date(),
        errorCount: 0
      });
    });
  }

  async startTask(agentId: string, taskId: string): Promise<boolean> {
    const state = this.agentStates.get(agentId);
    if (!state) return false;

    if (state.status !== 'idle') {
      throw new Error(`Agent ${agentId} is not available`);
    }

    state.status = 'working';
    state.currentTask = taskId;
    state.lastActive = new Date();
    this.emit('taskStarted', { agentId, taskId });
    return true;
  }

  async completeTask(agentId: string, taskId: string, success: boolean): Promise<void> {
    const state = this.agentStates.get(agentId);
    if (!state || state.currentTask !== taskId) return;

    if (!success) {
      state.errorCount++;
      state.status = 'error';
      this.emit('taskError', { agentId, taskId });
      
      if (state.errorCount >= errorHandling.maxRetries) {
        this.emit('agentDisabled', { agentId, reason: 'Too many errors' });
      }
    } else {
      // CRITICAL FIX: Maintain task context for a grace period
      state.status = 'idle';
      state.errorCount = 0;
      
      // Keep task context for 5 minutes after completion
      setTimeout(() => {
        const currentState = this.agentStates.get(agentId);
        if (currentState && currentState.currentTask === taskId) {
          currentState.currentTask = undefined;
          this.emit('contextCleared', { agentId, taskId });
        }
      }, 300000); // 5 minute grace period
      
      this.emit('taskCompleted', { agentId, taskId });
    }

    state.lastActive = new Date();
  }

  getAgentState(agentId: string): AgentState | null {
    return this.agentStates.get(agentId) || null;
  }

  getAvailableAgents(): string[] {
    const available: string[] = [];
    this.agentStates.forEach((state, agentId) => {
      if (state.status === 'idle') {
        available.push(agentId);
      }
    });
    return available;
  }

  resetErrorCount(agentId: string): void {
    const state = this.agentStates.get(agentId);
    if (state) {
      state.errorCount = 0;
      state.status = 'idle';
      this.emit('agentReset', { agentId });
    }
  }

  getSystemStatus(): {
    activeAgents: number;
    errorStates: number;
    totalTasks: number;
  } {
    let activeAgents = 0;
    let errorStates = 0;
    let totalTasks = 0;

    this.agentStates.forEach(state => {
      if (state.status === 'working') activeAgents++;
      if (state.status === 'error') errorStates++;
      if (state.currentTask) totalTasks++;
    });

    return { activeAgents, errorStates, totalTasks };
  }
}

export const agentStateManager = AgentStateManager.getInstance();