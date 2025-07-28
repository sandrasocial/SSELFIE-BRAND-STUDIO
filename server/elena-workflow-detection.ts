import { v4 as uuidv4 } from 'uuid';

interface WorkflowDetection {
  workflowId: string;
  workflowType: string;
  detectedAt: Date;
  confidence: number;
  assignedAgents: string[];
  tasks: WorkflowTask[];
  status: 'detected' | 'assigned' | 'in_progress' | 'completed';
  userId: string;
}

interface WorkflowTask {
  taskId: string;
  description: string;
  assignedAgent: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: string;
  status: 'pending' | 'in_progress' | 'completed';
}

class ElenaWorkflowDetection {
  private workflowPatterns = [
    // Design workflows
    { pattern: /create.*design|design.*component|build.*ui/i, type: 'design', agent: 'aria' },
    { pattern: /fix.*style|update.*css|change.*layout/i, type: 'design', agent: 'aria' },
    
    // Technical workflows  
    { pattern: /fix.*bug|implement.*feature|create.*api/i, type: 'technical', agent: 'zara' },
    { pattern: /database.*issue|server.*problem|performance/i, type: 'technical', agent: 'zara' },
    
    // UX workflows
    { pattern: /user.*experience|ux.*flow|improve.*usability/i, type: 'ux', agent: 'victoria' },
    { pattern: /user.*journey|conversion.*rate|optimize.*flow/i, type: 'ux', agent: 'victoria' },
    
    // Business workflows
    { pattern: /business.*strategy|revenue.*model|market.*analysis/i, type: 'business', agent: 'elena' },
    { pattern: /launch.*plan|go.*to.*market|competitor.*analysis/i, type: 'business', agent: 'elena' }
  ];

  private detectedWorkflows: Map<string, WorkflowDetection> = new Map();

  detectWorkflow(message: string, userId: string): WorkflowDetection | null {
    console.log('🧠 ELENA: Analyzing message for workflow patterns...');
    
    for (const pattern of this.workflowPatterns) {
      if (pattern.pattern.test(message)) {
        const workflowId = uuidv4();
        const workflow: WorkflowDetection = {
          workflowId,
          workflowType: pattern.type,
          detectedAt: new Date(),
          confidence: 0.85,
          assignedAgents: [pattern.agent],
          tasks: this.generateTasks(pattern.type, pattern.agent, message),
          status: 'detected',
          userId
        };

        this.detectedWorkflows.set(workflowId, workflow);
        
        console.log(`🎯 ELENA: Detected ${pattern.type} workflow, assigned to ${pattern.agent}`);
        return workflow;
      }
    }

    console.log('🧠 ELENA: No specific workflow pattern detected, continuing with general assistance');
    return null;
  }

  private generateTasks(workflowType: string, assignedAgent: string, message: string): WorkflowTask[] {
    const taskTemplates = {
      design: [
        { description: 'Analyze design requirements', priority: 'high' as const, duration: '15 minutes' },
        { description: 'Create luxury editorial design', priority: 'high' as const, duration: '30 minutes' },
        { description: 'Implement responsive layout', priority: 'medium' as const, duration: '20 minutes' }
      ],
      technical: [
        { description: 'Analyze technical requirements', priority: 'high' as const, duration: '10 minutes' },
        { description: 'Implement Swiss-precision code', priority: 'high' as const, duration: '45 minutes' },
        { description: 'Test and optimize performance', priority: 'medium' as const, duration: '15 minutes' }
      ],
      ux: [
        { description: 'Analyze user experience flow', priority: 'high' as const, duration: '20 minutes' },
        { description: 'Design premium user interaction', priority: 'high' as const, duration: '30 minutes' },
        { description: 'Optimize conversion points', priority: 'medium' as const, duration: '25 minutes' }
      ],
      business: [
        { description: 'Analyze business requirements', priority: 'high' as const, duration: '15 minutes' },
        { description: 'Develop strategic recommendations', priority: 'high' as const, duration: '40 minutes' },
        { description: 'Create implementation roadmap', priority: 'medium' as const, duration: '20 minutes' }
      ]
    };

    const templates = taskTemplates[workflowType as keyof typeof taskTemplates] || taskTemplates.business;
    
    return templates.map(template => ({
      taskId: uuidv4(),
      description: template.description,
      assignedAgent,
      priority: template.priority,
      estimatedDuration: template.duration,
      status: 'pending' as const
    }));
  }

  async assignTasks(workflowId: string, tasks: WorkflowTask[], userId: string) {
    const workflow = this.detectedWorkflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    workflow.tasks = tasks;
    workflow.status = 'assigned';
    
    console.log(`🎯 ELENA: Tasks assigned for workflow ${workflowId}`);
    
    // Here you would integrate with your agent execution system
    // For now, we'll just log the assignment
    for (const task of tasks) {
      console.log(`📋 Task assigned to ${task.assignedAgent}: ${task.description}`);
    }

    return { success: true, workflowId, tasksAssigned: tasks.length };
  }

  getWorkflowStatus(workflowId: string) {
    const workflow = this.detectedWorkflows.get(workflowId);
    if (!workflow) {
      return { error: 'Workflow not found' };
    }

    return {
      workflowId: workflow.workflowId,
      type: workflow.workflowType,
      status: workflow.status,
      assignedAgents: workflow.assignedAgents,
      tasks: workflow.tasks,
      detectedAt: workflow.detectedAt
    };
  }

  getDetectionStatus() {
    return {
      patterns: this.workflowPatterns.map(p => p.type),
      activeWorkflows: this.detectedWorkflows.size,
      isActive: true
    };
  }

  getAllWorkflows(userId?: string) {
    const workflows = Array.from(this.detectedWorkflows.values());
    if (userId) {
      return workflows.filter(w => w.userId === userId);
    }
    return workflows;
  }

  async triggerWorkflow(content: string, userId: string, workflowType?: string): Promise<string> {
    console.log('🚀 ELENA: Triggering workflow detection...');
    
    // Detect workflow from content
    const detectedWorkflow = this.detectWorkflow(content, userId);
    
    if (!detectedWorkflow) {
      console.log('🧠 ELENA: No workflow pattern detected, creating general task');
      // Create a general workflow if no specific pattern detected
      const workflowId = uuidv4();
      const generalWorkflow: WorkflowDetection = {
        workflowId,
        workflowType: workflowType || 'general',
        detectedAt: new Date(),
        confidence: 0.5,
        assignedAgents: ['aria'], // Default to Aria for general tasks
        tasks: [{
          taskId: uuidv4(),
          description: content,
          assignedAgent: 'aria',
          priority: 'medium',
          estimatedDuration: '30 minutes',
          status: 'pending'
        }],
        status: 'detected',
        userId
      };
      
      this.detectedWorkflows.set(workflowId, generalWorkflow);
      
      // Assign tasks to agents via unified system
      await this.assignTasksToAgents(generalWorkflow);
      
      return workflowId;
    }
    
    // Assign detected workflow tasks to agents
    await this.assignTasksToAgents(detectedWorkflow);
    
    return detectedWorkflow.workflowId;
  }

  private async assignTasksToAgents(workflow: WorkflowDetection) {
    console.log(`🎯 ELENA: Assigning ${workflow.tasks.length} tasks to agents...`);
    
    try {
      // Import the unified agent system
      const { unifiedAgentSystem } = await import('./unified-agent-system');
      
      // Assign each task to the appropriate agent
      for (const task of workflow.tasks) {
        console.log(`📋 ELENA: Assigning task to ${task.assignedAgent}: ${task.description}`);
        
        // Send task to agent via unified system
        await unifiedAgentSystem.sendTaskToAgent(
          task.assignedAgent,
          task.description,
          workflow.userId,
          {
            workflowId: workflow.workflowId,
            taskId: task.taskId,
            priority: task.priority,
            estimatedDuration: task.estimatedDuration
          }
        );
        
        // Update task status
        task.status = 'in_progress';
      }
      
      // Update workflow status
      workflow.status = 'assigned';
      console.log(`✅ ELENA: All tasks assigned for workflow ${workflow.workflowId}`);
      
    } catch (error) {
      console.error('❌ ELENA: Error assigning tasks to agents:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const elenaWorkflowDetection = new ElenaWorkflowDetection();