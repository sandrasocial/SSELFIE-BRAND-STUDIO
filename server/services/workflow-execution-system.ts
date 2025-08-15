/**
 * WORKFLOW EXECUTION SYSTEM - Missing component for coordinated multi-agent workflows
 * This manages the execution of complex workflows involving multiple agents
 */

import { multiAgentCoordinator } from './multi-agent-coordinator';
import { taskExecutionEngine } from './task-execution-engine';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { WorkflowPersistence } from '../workflows/active/workflow-persistence';

export interface WorkflowStep {
  id: string;
  agentId: string;
  instruction: string;
  dependsOn?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // in minutes
  status: 'pending' | 'active' | 'completed' | 'failed';
  result?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  coordinatorAgent: string;
  userId: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'active' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  results: Record<string, any>;
}

export class WorkflowExecutionSystem {
  private static instance: WorkflowExecutionSystem;
  private activeWorkflows: Map<string, WorkflowDefinition> = new Map();
  private workflowQueues: Map<string, WorkflowDefinition[]> = new Map();

  constructor() {
    console.log('🎯 WORKFLOW EXECUTION SYSTEM: Initialized');
  }

  static getInstance(): WorkflowExecutionSystem {
    if (!WorkflowExecutionSystem.instance) {
      WorkflowExecutionSystem.instance = new WorkflowExecutionSystem();
    }
    return WorkflowExecutionSystem.instance;
  }

  /**
   * Execute a complete workflow with multiple agents
   */
  async executeWorkflow(workflow: WorkflowDefinition): Promise<boolean> {
    try {
      console.log(`🚀 WORKFLOW EXECUTION: Starting "${workflow.name}" with ${workflow.steps.length} steps`);

      // Mark workflow as active
      workflow.status = 'active';
      workflow.startedAt = new Date();
      this.activeWorkflows.set(workflow.id, workflow);

      // Execute steps based on dependencies
      const executionQueue = this.buildExecutionQueue(workflow.steps);
      
      for (const stepBatch of executionQueue) {
        console.log(`🔄 WORKFLOW BATCH: Executing ${stepBatch.length} parallel steps`);
        
        // Execute all steps in this batch in parallel
        const batchPromises = stepBatch.map(step => this.executeWorkflowStep(workflow.id, step));
        const batchResults = await Promise.allSettled(batchPromises);

        // Check if any step failed
        const failedSteps = batchResults.filter(result => result.status === 'rejected');
        if (failedSteps.length > 0) {
          console.error(`❌ WORKFLOW BATCH FAILED: ${failedSteps.length} steps failed`);
          workflow.status = 'failed';
          this.activeWorkflows.set(workflow.id, workflow);
          return false;
        }

        // Update workflow progress
        const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
        const progressPercent = Math.round((completedSteps / workflow.steps.length) * 100);
        console.log(`📊 WORKFLOW PROGRESS: ${workflow.name} - ${progressPercent}% complete`);
      }

      // Mark workflow as completed
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      this.activeWorkflows.set(workflow.id, workflow);

      console.log(`✅ WORKFLOW COMPLETED: "${workflow.name}" in ${this.getWorkflowDuration(workflow)} minutes`);
      return true;

    } catch (error) {
      console.error(`❌ WORKFLOW EXECUTION FAILED: ${workflow.name}`, error);
      workflow.status = 'failed';
      this.activeWorkflows.set(workflow.id, workflow);
      return false;
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(workflowId: string, step: WorkflowStep): Promise<boolean> {
    try {
      console.log(`🎯 STEP EXECUTION: ${step.id} for ${step.agentId.toUpperCase()}`);

      step.status = 'active';
      step.startedAt = new Date();

      // Create enhanced instruction with workflow context
      const workflowContext = `
🔄 WORKFLOW STEP EXECUTION

**Workflow ID:** ${workflowId}
**Step ID:** ${step.id}
**Agent:** ${step.agentId.toUpperCase()}
**Priority:** ${step.priority.toUpperCase()}

**STEP INSTRUCTION:**
${step.instruction}

**WORKFLOW CONTEXT:** This is part of a coordinated multi-agent workflow. Complete your assigned step and coordinate with other agents as needed.

**DEPENDENCIES:** ${step.dependsOn ? step.dependsOn.join(', ') : 'None'}

EXECUTE THIS STEP NOW.
`;

      // Execute through task execution engine
      const taskRequest = {
        id: `${workflowId}_${step.id}`,
        agentId: step.agentId,
        instruction: workflowContext,
        priority: step.priority,
        userId: this.activeWorkflows.get(workflowId)?.userId || 'system',
        status: 'active' as const,
        progress: 0,
        workflowId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const taskResult = await taskExecutionEngine.executeTask(taskRequest);

      if (taskResult.success) {
        step.status = 'completed';
        step.completedAt = new Date();
        step.result = taskResult.result;
        console.log(`✅ STEP COMPLETED: ${step.id} for ${step.agentId.toUpperCase()}`);
        return true;
      } else {
        step.status = 'failed';
        console.error(`❌ STEP FAILED: ${step.id} for ${step.agentId}`, taskResult.error);
        return false;
      }

    } catch (error) {
      console.error(`❌ STEP EXECUTION ERROR: ${step.id}`, error);
      step.status = 'failed';
      return false;
    }
  }

  /**
   * Build execution queue based on dependencies
   */
  private buildExecutionQueue(steps: WorkflowStep[]): WorkflowStep[][] {
    const queue: WorkflowStep[][] = [];
    const completed = new Set<string>();
    const remaining = [...steps];

    while (remaining.length > 0) {
      // Find steps that can be executed (no pending dependencies)
      const readySteps = remaining.filter(step => {
        if (!step.dependsOn) return true;
        return step.dependsOn.every(dep => completed.has(dep));
      });

      if (readySteps.length === 0) {
        console.warn('⚠️ WORKFLOW DEADLOCK: No steps can be executed due to dependencies');
        break;
      }

      // Add ready steps to queue
      queue.push(readySteps);

      // Mark steps as completed and remove from remaining
      readySteps.forEach(step => {
        completed.add(step.id);
        const index = remaining.indexOf(step);
        if (index > -1) {
          remaining.splice(index, 1);
        }
      });
    }

    return queue;
  }

  /**
   * Create a new workflow from template
   */
  createWorkflow(
    name: string,
    description: string,
    coordinatorAgent: string,
    userId: string,
    steps: Omit<WorkflowStep, 'status' | 'startedAt' | 'completedAt'>[]
  ): WorkflowDefinition {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const workflow: WorkflowDefinition = {
      id: workflowId,
      name,
      description,
      steps: steps.map(step => ({
        ...step,
        status: 'pending' as const
      })),
      coordinatorAgent,
      userId,
      priority: 'medium',
      status: 'pending',
      createdAt: new Date(),
      results: {}
    };

    console.log(`📋 WORKFLOW CREATED: "${name}" with ${steps.length} steps`);
    return workflow;
  }

  /**
   * Queue a workflow for execution
   */
  queueWorkflow(workflow: WorkflowDefinition): void {
    const coordinator = workflow.coordinatorAgent;
    
    if (!this.workflowQueues.has(coordinator)) {
      this.workflowQueues.set(coordinator, []);
    }

    this.workflowQueues.get(coordinator)!.push(workflow);
    console.log(`📥 WORKFLOW QUEUED: "${workflow.name}" for ${coordinator.toUpperCase()}`);
  }

  /**
   * Start processing workflows for a coordinator
   */
  async processWorkflowQueue(coordinatorAgent: string): Promise<void> {
    const queue = this.workflowQueues.get(coordinatorAgent);
    if (!queue || queue.length === 0) {
      return;
    }

    console.log(`🔄 PROCESSING QUEUE: ${queue.length} workflows for ${coordinatorAgent.toUpperCase()}`);

    const workflow = queue.shift()!;
    const success = await this.executeWorkflow(workflow);

    if (success) {
      console.log(`✅ QUEUE SUCCESS: "${workflow.name}" completed for ${coordinatorAgent}`);
    } else {
      console.error(`❌ QUEUE FAILURE: "${workflow.name}" failed for ${coordinatorAgent}`);
    }

    // Continue processing queue
    if (queue.length > 0) {
      setTimeout(() => this.processWorkflowQueue(coordinatorAgent), 1000);
    }
  }

  /**
   * Get active workflows
   */
  getActiveWorkflows(): WorkflowDefinition[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  /**
   * Get workflow duration in minutes
   */
  private getWorkflowDuration(workflow: WorkflowDefinition): number {
    if (!workflow.startedAt || !workflow.completedAt) return 0;
    return Math.round((workflow.completedAt.getTime() - workflow.startedAt.getTime()) / (1000 * 60));
  }

  /**
   * Cancel a workflow
   */
  async cancelWorkflow(workflowId: string): Promise<boolean> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return false;

    workflow.status = 'failed';
    workflow.completedAt = new Date();
    
    // Cancel any active steps
    for (const step of workflow.steps) {
      if (step.status === 'active') {
        await taskExecutionEngine.cancelTask(`${workflowId}_${step.id}`);
        step.status = 'failed';
      }
    }

    console.log(`🚫 WORKFLOW CANCELLED: "${workflow.name}"`);
    return true;
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(): {
    active: number;
    queued: number;
    completed: number;
    failed: number;
  } {
    const active = this.activeWorkflows.size;
    const queued = Array.from(this.workflowQueues.values()).reduce((sum, queue) => sum + queue.length, 0);
    
    return {
      active,
      queued,
      completed: 0, // Would need database query for historical data
      failed: 0 // Would need database query for historical data
    };
  }
}

// Export singleton instance
export const workflowExecutionSystem = WorkflowExecutionSystem.getInstance();