/**
 * WORKFLOW PERSISTENCE SYSTEM
 * Enables agents to access and track their assigned workflow tasks
 */

import fs from 'fs';
import path from 'path';

export interface ActiveTask {
  taskId: string;
  assignedAgent: string;
  coordinatorAgent: string;
  taskDescription: string;
  workflowContext: string;
  expectedDeliverables: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'assigned' | 'in_progress' | 'completed' | 'blocked';
  assignedAt: Date;
  workflowType?: string;
  workflowTemplate?: any;
}

export interface WorkflowSession {
  sessionId: string;
  name: string;
  description: string;
  coordinatorAgent: string;
  assignedTasks: ActiveTask[];
  created: Date;
  status: 'active' | 'completed' | 'paused';
}

export class WorkflowPersistence {
  private static WORKFLOW_DIR = path.join(process.cwd(), 'server/workflows/active');
  
  static {
    // Ensure workflows directory exists
    if (!fs.existsSync(this.WORKFLOW_DIR)) {
      fs.mkdirSync(this.WORKFLOW_DIR, { recursive: true });
    }
  }
  
  /**
   * Create a new workflow session
   */
  static createWorkflowSession(
    name: string,
    description: string,
    coordinatorAgent: string
  ): WorkflowSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: WorkflowSession = {
      sessionId,
      name,
      description,
      coordinatorAgent,
      assignedTasks: [],
      created: new Date(),
      status: 'active'
    };
    
    this.saveWorkflowSession(session);
    return session;
  }
  
  /**
   * Get tasks assigned to a specific agent
   */
  static getAgentTasks(agentName: string): ActiveTask[] {
    try {
      const sessions = this.getAllWorkflowSessions();
      const agentTasks: ActiveTask[] = [];
      
      sessions.forEach(session => {
        session.assignedTasks.forEach(task => {
          if (task.assignedAgent === agentName && task.status !== 'completed') {
            agentTasks.push(task);
          }
        });
      });
      
      return agentTasks;
    } catch (error) {
      console.error('Error getting agent tasks:', error);
      return [];
    }
  }

  /**
   * Get handoff tasks (placeholder for now)
   */
  static getHandoffTasks(agentName?: string): any[] {
    // For now, return empty array - handoffs are handled through direct coordination
    return [];
  }

  /**
   * Get all workflow sessions
   */
  static getAllWorkflowSessions(): WorkflowSession[] {
    try {
      const sessionFiles = fs.readdirSync(this.WORKFLOW_DIR).filter(f => f.endsWith('.json'));
      return sessionFiles.map(file => {
        const content = fs.readFileSync(path.join(this.WORKFLOW_DIR, file), 'utf8');
        return JSON.parse(content);
      });
    } catch (error) {
      console.error('Error reading workflow sessions:', error);
      return [];
    }
  }

  /**
   * Add a task to a workflow session
   */
  static addTaskToWorkflow(
    sessionId: string,
    assignedAgent: string,
    coordinatorAgent: string,
    taskDescription: string,
    workflowContext: string,
    expectedDeliverables: string[],
    priority: 'high' | 'medium' | 'low' = 'medium',
    workflowType?: string,
    workflowTemplate?: any
  ): ActiveTask {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: ActiveTask = {
      taskId,
      assignedAgent,
      coordinatorAgent,
      taskDescription,
      workflowContext,
      expectedDeliverables,
      priority,
      status: 'assigned',
      assignedAt: new Date(),
      workflowType,
      workflowTemplate
    };
    
    // Load existing session
    const session = this.getWorkflowSession(sessionId);
    if (session) {
      session.assignedTasks.push(task);
      this.saveWorkflowSession(session);
    }
    
    // Also save individual task file for quick access
    this.saveAgentTask(assignedAgent, task);
    
    return task;
  }
  
  /**
   * Get workflow session by ID
   */
  static getWorkflowSession(sessionId: string): WorkflowSession | null {
    try {
      const filePath = path.join(this.WORKFLOW_DIR, `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`Failed to load workflow session ${sessionId}:`, error);
    }
    return null;
  }
  
  /**
   * Save workflow session to file
   */
  static saveWorkflowSession(session: WorkflowSession): void {
    try {
      const filePath = path.join(this.WORKFLOW_DIR, `${session.sessionId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    } catch (error) {
      console.error(`Failed to save workflow session ${session.sessionId}:`, error);
    }
  }
  
  /**
   * Save individual agent task for quick access
   */
  static saveAgentTask(agentName: string, task: ActiveTask): void {
    try {
      const agentDir = path.join(this.WORKFLOW_DIR, 'agents', agentName);
      if (!fs.existsSync(agentDir)) {
        fs.mkdirSync(agentDir, { recursive: true });
      }
      
      const filePath = path.join(agentDir, `${task.taskId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(task, null, 2));
    } catch (error) {
      console.error(`Failed to save agent task for ${agentName}:`, error);
    }
  }
  
  /**
   * Get all active workflows
   */
  static getActiveWorkflows(): WorkflowSession[] {
    try {
      const workflows: WorkflowSession[] = [];
      const files = fs.readdirSync(this.WORKFLOW_DIR).filter(file => 
        file.endsWith('.json') && !file.startsWith('agents/')
      );
      
      for (const file of files) {
        try {
          const filePath = path.join(this.WORKFLOW_DIR, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const workflow = JSON.parse(data);
          if (workflow.status === 'active') {
            workflows.push(workflow);
          }
        } catch (error) {
          console.error(`Failed to load workflow ${file}:`, error);
        }
      }
      return workflows;
    } catch (error) {
      console.error('Failed to get active workflows:', error);
      return [];
    }
  }

  /**
   * Get all active tasks across all agents
   */
  static getAllActiveTasks(): ActiveTask[] {
    const allTasks: ActiveTask[] = [];
    try {
      const agentsDir = path.join(this.WORKFLOW_DIR, 'agents');
      if (!fs.existsSync(agentsDir)) {
        return [];
      }
      
      const agentDirs = fs.readdirSync(agentsDir).filter(item => 
        fs.statSync(path.join(agentsDir, item)).isDirectory()
      );
      
      for (const agentName of agentDirs) {
        const tasks = this.getAgentTasks(agentName);
        allTasks.push(...tasks);
      }
    } catch (error) {
      console.error('Failed to get all active tasks:', error);
    }
    return allTasks;
  }

  /**
   * Get all active tasks for an agent
   */
  static getAgentTasks(agentName: string): ActiveTask[] {
    try {
      const agentDir = path.join(this.WORKFLOW_DIR, 'agents', agentName);
      if (!fs.existsSync(agentDir)) {
        return [];
      }
      
      const taskFiles = fs.readdirSync(agentDir).filter(file => file.endsWith('.json'));
      const tasks: ActiveTask[] = [];
      
      for (const file of taskFiles) {
        try {
          const filePath = path.join(agentDir, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const task = JSON.parse(data);
          
          // Only return active tasks
          if (task.status === 'assigned' || task.status === 'in_progress') {
            tasks.push(task);
          }
        } catch (error) {
          console.error(`Failed to load task file ${file}:`, error);
        }
      }
      
      return tasks.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
    } catch (error) {
      console.error(`Failed to get tasks for agent ${agentName}:`, error);
      return [];
    }
  }
  
  /**
   * Update task status
   */
  static updateTaskStatus(taskId: string, status: ActiveTask['status'], agentName?: string): void {
    try {
      // Find and update in agent's individual task file
      if (agentName) {
        const agentDir = path.join(this.WORKFLOW_DIR, 'agents', agentName);
        const taskFile = path.join(agentDir, `${taskId}.json`);
        
        if (fs.existsSync(taskFile)) {
          const data = fs.readFileSync(taskFile, 'utf8');
          const task = JSON.parse(data);
          task.status = status;
          fs.writeFileSync(taskFile, JSON.stringify(task, null, 2));
        }
      }
      
      // Also update in workflow sessions
      const sessionFiles = fs.readdirSync(this.WORKFLOW_DIR).filter(file => file.startsWith('session_') && file.endsWith('.json'));
      
      for (const file of sessionFiles) {
        try {
          const filePath = path.join(this.WORKFLOW_DIR, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const session = JSON.parse(data);
          
          const task = session.assignedTasks.find((t: ActiveTask) => t.taskId === taskId);
          if (task) {
            task.status = status;
            fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
            break;
          }
        } catch (error) {
          console.error(`Failed to update task in session file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error(`Failed to update task status for ${taskId}:`, error);
    }
  }
  
  /**
   * Get all active workflow sessions
   */
  static getActiveWorkflowSessions(): WorkflowSession[] {
    try {
      const sessionFiles = fs.readdirSync(this.WORKFLOW_DIR).filter(file => file.startsWith('session_') && file.endsWith('.json'));
      const sessions: WorkflowSession[] = [];
      
      for (const file of sessionFiles) {
        try {
          const filePath = path.join(this.WORKFLOW_DIR, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const session = JSON.parse(data);
          
          if (session.status === 'active') {
            sessions.push(session);
          }
        } catch (error) {
          console.error(`Failed to load session file ${file}:`, error);
        }
      }
      
      return sessions.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    } catch (error) {
      console.error('Failed to get active workflow sessions:', error);
      return [];
    }
  }
  
  /**
   * Clean up completed or old tasks
   */
  static cleanupOldTasks(daysOld: number = 7): void {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const agentsDir = path.join(this.WORKFLOW_DIR, 'agents');
      if (!fs.existsSync(agentsDir)) return;
      
      const agentDirs = fs.readdirSync(agentsDir);
      
      for (const agentDir of agentDirs) {
        const agentPath = path.join(agentsDir, agentDir);
        if (!fs.statSync(agentPath).isDirectory()) continue;
        
        const taskFiles = fs.readdirSync(agentPath).filter(file => file.endsWith('.json'));
        
        for (const file of taskFiles) {
          try {
            const filePath = path.join(agentPath, file);
            const data = fs.readFileSync(filePath, 'utf8');
            const task = JSON.parse(data);
            
            const taskDate = new Date(task.assignedAt);
            if (taskDate < cutoffDate && (task.status === 'completed' || task.status === 'blocked')) {
              fs.unlinkSync(filePath);
            }
          } catch (error) {
            console.error(`Failed to process task file ${file}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old tasks:', error);
    }
  }
}