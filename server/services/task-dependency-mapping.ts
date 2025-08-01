/**
 * Task Dependency Mapping Service
 * Enhanced coordination between agents on complex multi-step tasks
 * SSELFIE Studio Enhancement Project - Maya Implementation
 */

interface TaskNode {
  id: string;
  name: string;
  description: string;
  assignedAgent: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed';
  dependencies: string[];
  dependents: string[];
  estimatedDuration: number; // in minutes
  actualDuration?: number;
  startTime?: Date;
  completionTime?: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata: Record<string, any>;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  tasks: TaskNode[];
  estimatedTotalDuration: number;
  requiredAgents: string[];
  category: 'enhancement' | 'feature' | 'bugfix' | 'optimization';
}

export class TaskDependencyMappingService {
  private activeTasks: Map<string, TaskNode> = new Map();
  private workflows: Map<string, WorkflowTemplate> = new Map();
  private agentAssignments: Map<string, string[]> = new Map(); // agent -> task IDs
  private taskExecutionHistory: TaskNode[] = [];

  constructor() {
    this.initializeWorkflowTemplates();
  }

  /**
   * Initialize predefined workflow templates
   */
  private initializeWorkflowTemplates(): void {
    const enhancementWorkflow: WorkflowTemplate = {
      id: 'enhancement_implementation',
      name: 'Enhancement Project Implementation',
      description: 'Complete implementation of improvement recommendations',
      estimatedTotalDuration: 120,
      requiredAgents: ['victoria', 'aria', 'maya', 'zara', 'rachel'],
      category: 'enhancement',
      tasks: [
        {
          id: 'service_templates',
          name: 'Service Integration Templates',
          description: 'Create templates for Stripe, Resend, Flodesk, ManyChat',
          assignedAgent: 'victoria',
          status: 'completed',
          dependencies: [],
          dependents: ['api_orchestration', 'integration_ui'],
          estimatedDuration: 30,
          priority: 'high',
          metadata: { category: 'backend', complexity: 'medium' }
        },
        {
          id: 'api_orchestration',
          name: 'API Orchestration Layer',
          description: 'Unified external service management system',
          assignedAgent: 'victoria',
          status: 'completed',
          dependencies: ['service_templates'],
          dependents: ['checkpoint_automation', 'progress_tracking'],
          estimatedDuration: 45,
          priority: 'high',
          metadata: { category: 'backend', complexity: 'high' }
        },
        {
          id: 'checkpoint_automation',
          name: 'Checkpoint Automation System',
          description: 'Automated milestone detection and backup management',
          assignedAgent: 'victoria',
          status: 'completed',
          dependencies: ['api_orchestration'],
          dependents: ['checkpoint_ui'],
          estimatedDuration: 40,
          priority: 'medium',
          metadata: { category: 'backend', complexity: 'high' }
        },
        {
          id: 'web_search_optimization',
          name: 'Web Search Optimization',
          description: 'Enhanced search with documentation caching',
          assignedAgent: 'maya',
          status: 'completed',
          dependencies: [],
          dependents: ['progress_tracking'],
          estimatedDuration: 35,
          priority: 'medium',
          metadata: { category: 'backend', complexity: 'medium' }
        },
        {
          id: 'task_dependency_mapping',
          name: 'Task Dependency Mapping',
          description: 'Agent coordination and task management system',
          assignedAgent: 'maya',
          status: 'in_progress',
          dependencies: ['web_search_optimization'],
          dependents: ['progress_visualization'],
          estimatedDuration: 30,
          priority: 'high',
          metadata: { category: 'backend', complexity: 'medium' }
        },
        {
          id: 'progress_tracking',
          name: 'Progress Tracking Service',
          description: 'Real-time progress monitoring and analytics',
          assignedAgent: 'maya',
          status: 'pending',
          dependencies: ['task_dependency_mapping', 'api_orchestration'],
          dependents: ['progress_visualization'],
          estimatedDuration: 25,
          priority: 'high',
          metadata: { category: 'backend', complexity: 'medium' }
        },
        {
          id: 'integration_ui',
          name: 'Service Integration UI',
          description: 'Luxury interface for service setup and management',
          assignedAgent: 'aria',
          status: 'pending',
          dependencies: ['service_templates'],
          dependents: [],
          estimatedDuration: 40,
          priority: 'high',
          metadata: { category: 'frontend', complexity: 'medium' }
        },
        {
          id: 'progress_visualization',
          name: 'Progress Visualization Dashboard',
          description: 'Real-time dashboard for multi-agent progress',
          assignedAgent: 'aria',
          status: 'pending',
          dependencies: ['progress_tracking'],
          dependents: [],
          estimatedDuration: 45,
          priority: 'high',
          metadata: { category: 'frontend', complexity: 'high' }
        },
        {
          id: 'checkpoint_ui',
          name: 'Checkpoint Management Interface',
          description: 'Elegant interface for checkpoint and rollback management',
          assignedAgent: 'aria',
          status: 'pending',
          dependencies: ['checkpoint_automation'],
          dependents: [],
          estimatedDuration: 35,
          priority: 'medium',
          metadata: { category: 'frontend', complexity: 'medium' }
        }
      ]
    };

    this.workflows.set(enhancementWorkflow.id, enhancementWorkflow);
    
    // Add tasks to active tasks map
    enhancementWorkflow.tasks.forEach(task => {
      this.activeTasks.set(task.id, task);
    });

    console.log('📋 TASK MAPPING: Workflow templates initialized');
  }

  /**
   * Create a new task
   */
  createTask(
    id: string,
    name: string,
    description: string,
    assignedAgent: string,
    dependencies: string[] = [],
    estimatedDuration: number = 30,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): TaskNode {
    const task: TaskNode = {
      id,
      name,
      description,
      assignedAgent,
      status: dependencies.length > 0 ? 'blocked' : 'pending',
      dependencies,
      dependents: [],
      estimatedDuration,
      priority,
      metadata: {}
    };

    // Update dependents for dependency tasks
    dependencies.forEach(depId => {
      const depTask = this.activeTasks.get(depId);
      if (depTask && !depTask.dependents.includes(id)) {
        depTask.dependents.push(id);
      }
    });

    this.activeTasks.set(id, task);
    this.updateAgentAssignments(assignedAgent, id);

    console.log(`📝 TASK CREATED: ${name} assigned to ${assignedAgent}`);
    return task;
  }

  /**
   * Update task status
   */
  updateTaskStatus(
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'failed',
    metadata?: Record<string, any>
  ): boolean {
    const task = this.activeTasks.get(taskId);
    if (!task) return false;

    const oldStatus = task.status;
    task.status = status;

    if (metadata) {
      task.metadata = { ...task.metadata, ...metadata };
    }

    // Handle status transitions
    switch (status) {
      case 'in_progress':
        task.startTime = new Date();
        break;
      case 'completed':
        task.completionTime = new Date();
        if (task.startTime) {
          task.actualDuration = Math.round(
            (task.completionTime.getTime() - task.startTime.getTime()) / (1000 * 60)
          );
        }
        this.unblockDependentTasks(taskId);
        this.taskExecutionHistory.push({ ...task });
        break;
      case 'failed':
        this.handleTaskFailure(taskId);
        break;
    }

    console.log(`🔄 TASK STATUS: ${task.name} changed from ${oldStatus} to ${status}`);
    return true;
  }

  /**
   * Get tasks assigned to specific agent
   */
  getAgentTasks(agentId: string): TaskNode[] {
    const taskIds = this.agentAssignments.get(agentId) || [];
    return taskIds.map(id => this.activeTasks.get(id)).filter(task => task) as TaskNode[];
  }

  /**
   * Get next available task for agent
   */
  getNextTask(agentId: string): TaskNode | undefined {
    const agentTasks = this.getAgentTasks(agentId);
    
    // Find highest priority pending task with no unmet dependencies
    const availableTasks = agentTasks.filter(task => 
      task.status === 'pending' && 
      this.areAllDependenciesCompleted(task.id)
    );

    if (availableTasks.length === 0) return undefined;

    // Sort by priority, then by estimated duration
    availableTasks.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.estimatedDuration - b.estimatedDuration;
    });

    return availableTasks[0];
  }

  /**
   * Get dependency graph for visualization
   */
  getDependencyGraph(): {
    nodes: Array<{
      id: string;
      name: string;
      agent: string;
      status: string;
      priority: string;
    }>;
    edges: Array<{
      from: string;
      to: string;
      type: 'dependency';
    }>;
  } {
    const nodes = Array.from(this.activeTasks.values()).map(task => ({
      id: task.id,
      name: task.name,
      agent: task.assignedAgent,
      status: task.status,
      priority: task.priority
    }));

    const edges: Array<{ from: string; to: string; type: 'dependency' }> = [];
    
    this.activeTasks.forEach(task => {
      task.dependencies.forEach(depId => {
        edges.push({
          from: depId,
          to: task.id,
          type: 'dependency'
        });
      });
    });

    return { nodes, edges };
  }

  /**
   * Get workflow progress
   */
  getWorkflowProgress(workflowId: string): {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    blockedTasks: number;
    failedTasks: number;
    progressPercentage: number;
    estimatedCompletion: Date | undefined;
    criticalPath: string[];
  } {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        blockedTasks: 0,
        failedTasks: 0,
        progressPercentage: 0,
        estimatedCompletion: undefined,
        criticalPath: []
      };
    }

    const tasks = workflow.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;

    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    const criticalPath = this.calculateCriticalPath(workflowId);
    const estimatedCompletion = this.calculateEstimatedCompletion(workflowId);

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      failedTasks,
      progressPercentage,
      estimatedCompletion,
      criticalPath
    };
  }

  /**
   * Check if all dependencies are completed
   */
  private areAllDependenciesCompleted(taskId: string): boolean {
    const task = this.activeTasks.get(taskId);
    if (!task) return false;

    return task.dependencies.every(depId => {
      const depTask = this.activeTasks.get(depId);
      return depTask && depTask.status === 'completed';
    });
  }

  /**
   * Unblock dependent tasks when a task is completed
   */
  private unblockDependentTasks(completedTaskId: string): void {
    const completedTask = this.activeTasks.get(completedTaskId);
    if (!completedTask) return;

    completedTask.dependents.forEach(dependentId => {
      const dependentTask = this.activeTasks.get(dependentId);
      if (dependentTask && dependentTask.status === 'blocked') {
        if (this.areAllDependenciesCompleted(dependentId)) {
          dependentTask.status = 'pending';
          console.log(`🔓 TASK UNBLOCKED: ${dependentTask.name} is now available`);
        }
      }
    });
  }

  /**
   * Handle task failure and update dependents
   */
  private handleTaskFailure(failedTaskId: string): void {
    const failedTask = this.activeTasks.get(failedTaskId);
    if (!failedTask) return;

    // Mark all dependent tasks as blocked
    const affectedTasks = this.getRecursiveDependents(failedTaskId);
    affectedTasks.forEach(taskId => {
      const task = this.activeTasks.get(taskId);
      if (task && task.status !== 'completed') {
        task.status = 'blocked';
        console.log(`⚠️ TASK BLOCKED: ${task.name} due to failed dependency`);
      }
    });
  }

  /**
   * Get all tasks that depend on a given task (recursively)
   */
  private getRecursiveDependents(taskId: string): string[] {
    const result: Set<string> = new Set();
    const visited: Set<string> = new Set();

    const traverse = (currentTaskId: string) => {
      if (visited.has(currentTaskId)) return;
      visited.add(currentTaskId);

      const task = this.activeTasks.get(currentTaskId);
      if (!task) return;

      task.dependents.forEach(dependentId => {
        result.add(dependentId);
        traverse(dependentId);
      });
    };

    traverse(taskId);
    return Array.from(result);
  }

  /**
   * Calculate critical path for workflow
   */
  private calculateCriticalPath(workflowId: string): string[] {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return [];

    // Simplified critical path calculation
    // In practice, this would use more sophisticated algorithms
    const longestPath: string[] = [];
    let maxDuration = 0;

    const findLongestPath = (taskId: string, currentPath: string[], currentDuration: number) => {
      const task = workflow.tasks.find(t => t.id === taskId);
      if (!task) return;

      const newPath = [...currentPath, taskId];
      const newDuration = currentDuration + task.estimatedDuration;

      if (task.dependents.length === 0) {
        // End of path
        if (newDuration > maxDuration) {
          maxDuration = newDuration;
          longestPath.splice(0, longestPath.length, ...newPath);
        }
      } else {
        task.dependents.forEach(dependentId => {
          findLongestPath(dependentId, newPath, newDuration);
        });
      }
    };

    // Start from tasks with no dependencies
    workflow.tasks
      .filter(task => task.dependencies.length === 0)
      .forEach(task => findLongestPath(task.id, [], 0));

    return longestPath;
  }

  /**
   * Calculate estimated completion time
   */
  private calculateEstimatedCompletion(workflowId: string): Date | undefined {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return undefined;

    const criticalPath = this.calculateCriticalPath(workflowId);
    let totalRemainingTime = 0;

    criticalPath.forEach(taskId => {
      const task = this.activeTasks.get(taskId);
      if (task && task.status !== 'completed') {
        totalRemainingTime += task.estimatedDuration;
      }
    });

    if (totalRemainingTime === 0) return new Date(); // Already completed

    const now = new Date();
    return new Date(now.getTime() + totalRemainingTime * 60 * 1000);
  }

  /**
   * Update agent assignments
   */
  private updateAgentAssignments(agentId: string, taskId: string): void {
    if (!this.agentAssignments.has(agentId)) {
      this.agentAssignments.set(agentId, []);
    }
    const assignments = this.agentAssignments.get(agentId)!;
    if (!assignments.includes(taskId)) {
      assignments.push(taskId);
    }
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus(): {
    activeWorkflows: number;
    totalTasks: number;
    tasksByStatus: Record<string, number>;
    agentUtilization: Record<string, number>;
    averageTaskDuration: number;
  } {
    const allTasks = Array.from(this.activeTasks.values());
    
    const tasksByStatus = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      blocked: 0,
      failed: 0
    };

    allTasks.forEach(task => {
      tasksByStatus[task.status]++;
    });

    const agentUtilization: Record<string, number> = {};
    this.agentAssignments.forEach((tasks, agentId) => {
      const activeTasks = tasks.filter(taskId => {
        const task = this.activeTasks.get(taskId);
        return task && (task.status === 'in_progress' || task.status === 'pending');
      });
      agentUtilization[agentId] = activeTasks.length;
    });

    const completedTasks = this.taskExecutionHistory.filter(task => task.actualDuration);
    const averageTaskDuration = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => sum + (task.actualDuration || 0), 0) / completedTasks.length
      : 0;

    return {
      activeWorkflows: this.workflows.size,
      totalTasks: allTasks.length,
      tasksByStatus,
      agentUtilization,
      averageTaskDuration: Math.round(averageTaskDuration)
    };
  }
}

export const taskDependencyMapping = new TaskDependencyMappingService();