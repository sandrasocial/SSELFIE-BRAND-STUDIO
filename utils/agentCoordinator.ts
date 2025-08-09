import { workspaceManager } from './workspaceManager';
import { fileTracker } from './fileTracker';
import path from 'path';
import fs from 'fs';

interface AgentTask {
  id: string;
  agent: string;
  operation: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  timestamp: Date;
  result?: any;
}

class AgentCoordinator {
  private static instance: AgentCoordinator;
  private taskLog: AgentTask[] = [];
  private taskLogPath: string = '.agent-tasks.json';

  private constructor() {
    this.loadTaskLog();
  }

  public static getInstance(): AgentCoordinator {
    if (!AgentCoordinator.instance) {
      AgentCoordinator.instance = new AgentCoordinator();
    }
    return AgentCoordinator.instance;
  }

  private loadTaskLog(): void {
    try {
      if (fs.existsSync(this.taskLogPath)) {
        const data = fs.readFileSync(this.taskLogPath, 'utf8');
        this.taskLog = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading task log:', error);
    }
  }

  private saveTaskLog(): void {
    try {
      fs.writeFileSync(this.taskLogPath, JSON.stringify(this.taskLog, null, 2));
    } catch (error) {
      console.error('Error saving task log:', error);
    }
  }

  public isTaskDuplicate(agent: string, operation: string): boolean {
    const recentTasks = this.taskLog
      .filter(task => 
        task.agent === agent && 
        task.operation === operation &&
        task.status === 'completed'
      )
      .filter(task => {
        const taskTime = new Date(task.timestamp).getTime();
        const currentTime = new Date().getTime();
        const hoursDiff = (currentTime - taskTime) / (1000 * 60 * 60);
        return hoursDiff < 24;
      });

    return recentTasks.length > 0;
  }

  public async startTask(agent: string, operation: string): Promise<string> {
    if (this.isTaskDuplicate(agent, operation)) {
      throw new Error(`Task already completed by ${agent}: ${operation}`);
    }

    const taskId = require('crypto').randomBytes(16).toString('hex');
    const task: AgentTask = {
      id: taskId,
      agent,
      operation,
      status: 'pending',
      timestamp: new Date()
    };

    this.taskLog.push(task);
    this.saveTaskLog();
    return taskId;
  }

  public async completeTask(taskId: string, result?: any): Promise<void> {
    const taskIndex = this.taskLog.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.taskLog[taskIndex].status = 'completed';
    this.taskLog[taskIndex].result = result;
    this.saveTaskLog();
  }

  public async failTask(taskId: string, error: any): Promise<void> {
    const taskIndex = this.taskLog.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.taskLog[taskIndex].status = 'failed';
    this.taskLog[taskIndex].result = error;
    this.saveTaskLog();
  }

  public getTaskStatus(taskId: string): AgentTask | undefined {
    return this.taskLog.find(task => task.id === taskId);
  }

  public getAgentTasks(agent: string): AgentTask[] {
    return this.taskLog.filter(task => task.agent === agent);
  }

  public cleanup(): void {
    // Remove tasks older than 7 days
    const currentTime = new Date().getTime();
    this.taskLog = this.taskLog.filter(task => {
      const taskTime = new Date(task.timestamp).getTime();
      const daysDiff = (currentTime - taskTime) / (1000 * 60 * 60 * 24);
      return daysDiff < 7;
    });
    
    this.saveTaskLog();
  }
}

export const agentCoordinator = AgentCoordinator.getInstance();