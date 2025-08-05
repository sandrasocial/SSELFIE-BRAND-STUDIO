/**
 * INTELLIGENT TASK DISTRIBUTOR
 * Core system for distributing tasks to admin agents intelligently
 * Critical missing piece for Sandra's agent orchestration
 */

export interface TaskDistributionRequest {
  agents: string[];
  tasks: AgentTask[];
  workflowType: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface AgentTask {
  id: string;
  description: string;
  assignedAgent: string;
  dependencies: string[];
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface TaskAssignment {
  agentName: string;
  tasks: AgentTask[];
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dependencies: string[];
}

export interface TaskDistributionResult {
  success: boolean;
  assignments: TaskAssignment[];
  totalEstimatedDuration: number;
  distributionStrategy: string;
  loadBalance: number;
}

export interface DeploymentStatus {
  deploymentId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  completedTasks: number;
  totalTasks: number;
  activeAgents: string[];
  estimatedTimeRemaining: number;
}

export class IntelligentTaskDistributor {
  private static instance: IntelligentTaskDistributor;
  private deployments = new Map<string, DeploymentStatus>();
  private agentCapabilities = {
    elena: ['coordination', 'strategy', 'workflow_management'],
    aria: ['ui_design', 'luxury_design', 'frontend', 'components'],
    zara: ['backend', 'architecture', 'technical_implementation', 'debugging'],
    olga: ['cleanup', 'organization', 'deployment', 'optimization'],
    maya: ['ai_integration', 'image_generation', 'prompt_engineering'],
    victoria: ['ux_design', 'user_flows', 'interface_design'],
    rachel: ['content', 'copywriting', 'voice_consistency'],
    ava: ['automation', 'integration', 'workflow_automation'],
    quinn: ['quality_assurance', 'testing', 'validation']
  };

  private constructor() {}

  public static getInstance(): IntelligentTaskDistributor {
    if (!IntelligentTaskDistributor.instance) {
      IntelligentTaskDistributor.instance = new IntelligentTaskDistributor();
    }
    return IntelligentTaskDistributor.instance;
  }

  /**
   * INTELLIGENT TASK DISTRIBUTION
   * Assigns tasks to agents based on capabilities and workload
   */
  async distributeTasks(request: TaskDistributionRequest): Promise<TaskDistributionResult> {
    console.log(`🧠 TASK DISTRIBUTOR: Analyzing ${request.tasks.length} tasks for ${request.agents.length} agents`);

    const assignments: TaskAssignment[] = [];
    let totalDuration = 0;

    // Analyze agent capabilities and current workload
    const agentWorkloads = this.calculateAgentWorkloads(request.agents);
    
    // Sort tasks by priority and dependencies
    const sortedTasks = this.sortTasksByDependencies(request.tasks);

    // Distribute tasks intelligently
    for (const task of sortedTasks) {
      const bestAgent = this.findBestAgentForTask(task, request.agents, agentWorkloads);
      
      // Find or create assignment for this agent
      let assignment = assignments.find(a => a.agentName === bestAgent);
      if (!assignment) {
        assignment = {
          agentName: bestAgent,
          tasks: [],
          estimatedDuration: 0,
          priority: request.priority,
          dependencies: []
        };
        assignments.push(assignment);
      }

      // Add task to assignment
      assignment.tasks.push(task);
      assignment.estimatedDuration += task.estimatedDuration;
      assignment.dependencies.push(...task.dependencies);
      
      // Update workload tracking
      agentWorkloads[bestAgent] += task.estimatedDuration;
      totalDuration += task.estimatedDuration;
      
      console.log(`📋 ASSIGNED: "${task.description}" → ${bestAgent} (${task.estimatedDuration}min)`);
    }

    // Calculate load balance (lower is better)
    const maxWorkload = Math.max(...Object.values(agentWorkloads));
    const minWorkload = Math.min(...Object.values(agentWorkloads));
    const loadBalance = maxWorkload > 0 ? (maxWorkload - minWorkload) / maxWorkload : 1;

    const result: TaskDistributionResult = {
      success: true,
      assignments,
      totalEstimatedDuration: totalDuration,
      distributionStrategy: 'capability_based_with_load_balancing',
      loadBalance
    };

    console.log(`✅ TASK DISTRIBUTOR: Created ${assignments.length} assignments, ${totalDuration}min total`);
    console.log(`⚖️ LOAD BALANCE: ${(loadBalance * 100).toFixed(1)}% (lower is better)`);

    return result;
  }

  /**
   * FIND BEST AGENT FOR TASK
   * Intelligent agent selection based on capabilities and workload
   */
  private findBestAgentForTask(task: AgentTask, availableAgents: string[], workloads: Record<string, number>): string {
    let bestAgent = availableAgents[0];
    let bestScore = -1;

    for (const agent of availableAgents) {
      const capabilities = this.agentCapabilities[agent as keyof typeof this.agentCapabilities] || [];
      const workload = workloads[agent] || 0;

      // Calculate capability match score
      const capabilityScore = this.calculateCapabilityMatch(task.description, capabilities);
      
      // Calculate workload factor (prefer less loaded agents)
      const workloadFactor = Math.max(0, 1 - (workload / 120)); // 120 min = heavy workload
      
      // Priority boost for high priority tasks
      const priorityBoost = task.priority === 'critical' ? 0.3 : 
                           task.priority === 'high' ? 0.2 : 
                           task.priority === 'medium' ? 0.1 : 0;

      const totalScore = capabilityScore * 0.6 + workloadFactor * 0.3 + priorityBoost;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  /**
   * CALCULATE CAPABILITY MATCH
   * Score how well an agent's capabilities match a task
   */
  private calculateCapabilityMatch(taskDescription: string, capabilities: string[]): number {
    const taskWords = taskDescription.toLowerCase().split(/\s+/);
    let matches = 0;

    for (const capability of capabilities) {
      const capabilityWords = capability.split('_');
      for (const capWord of capabilityWords) {
        if (taskWords.some(word => word.includes(capWord) || capWord.includes(word))) {
          matches++;
        }
      }
    }

    return Math.min(1.0, matches / Math.max(1, capabilities.length));
  }

  /**
   * CALCULATE AGENT WORKLOADS
   * Track current workload for each agent
   */
  private calculateAgentWorkloads(agents: string[]): Record<string, number> {
    const workloads: Record<string, number> = {};
    
    for (const agent of agents) {
      workloads[agent] = 0; // Start with 0, could be enhanced to track actual workloads
    }

    return workloads;
  }

  /**
   * SORT TASKS BY DEPENDENCIES
   * Topological sort to handle task dependencies
   */
  private sortTasksByDependencies(tasks: AgentTask[]): AgentTask[] {
    const sorted: AgentTask[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (task: AgentTask) => {
      if (visiting.has(task.id)) {
        console.warn(`⚠️ CIRCULAR DEPENDENCY detected for task: ${task.id}`);
        return;
      }
      if (visited.has(task.id)) return;

      visiting.add(task.id);

      // Visit dependencies first (handle undefined dependencies)
      const dependencies = task.dependencies || [];
      for (const depId of dependencies) {
        const depTask = tasks.find(t => t.id === depId);
        if (depTask) {
          visit(depTask);
        }
      }

      visiting.delete(task.id);
      visited.add(task.id);
      sorted.push(task);
    };

    for (const task of tasks) {
      visit(task);
    }

    return sorted;
  }

  /**
   * GET DEPLOYMENT STATUS
   * Track deployment progress
   */
  async getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus> {
    const status = this.deployments.get(deploymentId);
    
    if (!status) {
      return {
        deploymentId,
        status: 'failed',
        progress: 0,
        completedTasks: 0,
        totalTasks: 0,
        activeAgents: [],
        estimatedTimeRemaining: 0
      };
    }

    return status;
  }

  /**
   * UPDATE DEPLOYMENT PROGRESS
   * Update deployment status as tasks complete
   */
  async updateDeploymentProgress(deploymentId: string, completedTasks: number, totalTasks: number): Promise<void> {
    const status = this.deployments.get(deploymentId);
    if (status) {
      status.completedTasks = completedTasks;
      status.totalTasks = totalTasks;
      status.progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      status.status = completedTasks >= totalTasks ? 'completed' : 'in_progress';
      status.estimatedTimeRemaining = Math.max(0, (totalTasks - completedTasks) * 10); // 10 min per task estimate
    }
  }
}

export const intelligentTaskDistributor = new IntelligentTaskDistributor();