import { ClaudeApiServiceRebuilt } from '../services/claude-api-service-rebuilt';

export interface TaskDependency {
  taskId: string;
  dependsOn: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime: number; // in minutes
  agentSpecialty: string[];
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'blocked';
}

export interface AgentWorkload {
  agentId: string;
  currentTasks: number;
  maxCapacity: number;
  specialties: string[];
  averageTaskTime: number;
  lastTaskAssigned: Date | null;
  efficiency: number; // 0-1 scale
}

export interface DelegationDecision {
  taskId: string;
  assignedAgent: string;
  reasoning: string;
  dependencies: string[];
  estimatedCompletion: Date;
  priority: TaskDependency['priority'];
}

class ElenaDelegationSystem {
  private taskQueue: TaskDependency[] = [];
  private agentWorkloads: Map<string, AgentWorkload> = new Map();
  private taskHistory: Map<string, any[]> = new Map();
  
  constructor() {
    this.initializeAgentWorkloads();
  }
  
  /**
   * Initialize agent workload tracking
   */
  private initializeAgentWorkloads(): void {
    const agents: AgentWorkload[] = [
      {
        agentId: 'aria',
        currentTasks: 0,
        maxCapacity: 3,
        specialties: ['ui', 'ux', 'design', 'components', 'frontend'],
        averageTaskTime: 45,
        lastTaskAssigned: null,
        efficiency: 0.9
      },
      {
        agentId: 'zara',
        currentTasks: 0,
        maxCapacity: 4,
        specialties: ['backend', 'api', 'database', 'architecture', 'technical'],
        averageTaskTime: 60,
        lastTaskAssigned: null,
        efficiency: 0.95
      },
      {
        agentId: 'maya',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['ai', 'ml', 'image-generation', 'prompts', 'claude'],
        averageTaskTime: 30,
        lastTaskAssigned: null,
        efficiency: 0.85
      },
      {
        agentId: 'victoria',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['website-builder', 'templates', 'business-setup'],
        averageTaskTime: 90,
        lastTaskAssigned: null,
        efficiency: 0.8
      },
      {
        agentId: 'olga',
        currentTasks: 0,
        maxCapacity: 3,
        specialties: ['deployment', 'optimization', 'cleanup', 'organization'],
        averageTaskTime: 35,
        lastTaskAssigned: null,
        efficiency: 0.9
      }
    ];
    
    agents.forEach(agent => {
      this.agentWorkloads.set(agent.agentId, agent);
    });
    
    console.log('👥 ELENA DELEGATION: Initialized workload tracking for', agents.length, 'agents');
  }
  
  /**
   * Elena's intelligent task delegation with dependency mapping
   */
  async delegateTask(
    taskDescription: string,
    userId: string,
    priority: TaskDependency['priority'] = 'medium',
    dependencies: string[] = [],
    requiredSpecialties: string[] = []
  ): Promise<DelegationDecision> {
    try {
      console.log('🎯 ELENA DELEGATION: Analyzing task for intelligent assignment');
      console.log('📋 Task:', taskDescription);
      console.log('⚡ Priority:', priority);
      console.log('🔗 Dependencies:', dependencies);
      
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      // Create task dependency object
      const task: TaskDependency = {
        taskId,
        dependsOn: dependencies,
        priority,
        estimatedTime: this.estimateTaskTime(taskDescription, requiredSpecialties),
        agentSpecialty: requiredSpecialties.length > 0 ? requiredSpecialties : this.analyzeRequiredSpecialties(taskDescription),
        status: 'pending'
      };
      
      // Add to task queue
      this.taskQueue.push(task);
      
      // Find optimal agent assignment
      const assignment = await this.findOptimalAgent(task);
      
      // Update agent workload
      this.updateAgentWorkload(assignment.assignedAgent, task);
      
      // Mark task as assigned
      task.status = 'assigned';
      
      console.log('✅ ELENA DELEGATION: Task assigned successfully');
      console.log('🤖 Assigned Agent:', assignment.assignedAgent);
      console.log('🧠 Reasoning:', assignment.reasoning);
      
      return assignment;
      
    } catch (error) {
      console.error('❌ ELENA DELEGATION ERROR:', error);
      throw new Error(`Failed to delegate task: ${error}`);
    }
  }
  
  /**
   * Find optimal agent for task assignment
   */
  private async findOptimalAgent(task: TaskDependency): Promise<DelegationDecision> {
    const candidates: Array<{agent: AgentWorkload, score: number, reasoning: string}> = [];
    
    for (const [agentId, workload] of Array.from(this.agentWorkloads.entries())) {
      if (workload.currentTasks >= workload.maxCapacity) {
        continue; // Agent at capacity
      }
      
      let score = 0;
      let reasoning = `Agent ${agentId} evaluation: `;
      
      // Specialty match scoring
      const specialtyMatches = task.agentSpecialty.filter(specialty => 
        workload.specialties.some((agentSpecialty: string) => 
          agentSpecialty.includes(specialty.toLowerCase()) || 
          specialty.toLowerCase().includes(agentSpecialty)
        )
      );
      
      const specialtyScore = (specialtyMatches.length / task.agentSpecialty.length) * 40;
      score += specialtyScore;
      reasoning += `Specialty match: ${specialtyScore.toFixed(1)}/40, `;
      
      // Workload balancing
      const workloadRatio = workload.currentTasks / workload.maxCapacity;
      const workloadScore = (1 - workloadRatio) * 25;
      score += workloadScore;
      reasoning += `Workload: ${workloadScore.toFixed(1)}/25, `;
      
      // Efficiency scoring
      const efficiencyScore = workload.efficiency * 20;
      score += efficiencyScore;
      reasoning += `Efficiency: ${efficiencyScore.toFixed(1)}/20, `;
      
      // Priority bonus for specialized agents
      if (task.priority === 'critical' && workload.efficiency > 0.9) {
        score += 10;
        reasoning += `Critical priority bonus: +10, `;
      }
      
      // Time since last assignment (load balancing)
      const timeSinceLastTask = workload.lastTaskAssigned ? 
        Date.now() - workload.lastTaskAssigned.getTime() : 
        24 * 60 * 60 * 1000; // 24 hours if never assigned
      
      const timeBonus = Math.min(timeSinceLastTask / (60 * 60 * 1000), 5); // Max 5 points for 5+ hours
      score += timeBonus;
      reasoning += `Time bonus: ${timeBonus.toFixed(1)}/5`;
      
      candidates.push({
        agent: workload,
        score,
        reasoning: reasoning + ` = Total: ${score.toFixed(1)}`
      });
    }
    
    if (candidates.length === 0) {
      throw new Error('No available agents for task assignment');
    }
    
    // Sort by score (highest first)
    candidates.sort((a, b) => b.score - a.score);
    const bestCandidate = candidates[0];
    
    // Calculate estimated completion time
    const estimatedCompletion = new Date();
    estimatedCompletion.setMinutes(
      estimatedCompletion.getMinutes() + 
      task.estimatedTime + 
      (bestCandidate.agent.currentTasks * 15) // Queue delay
    );
    
    return {
      taskId: task.taskId,
      assignedAgent: bestCandidate.agent.agentId,
      reasoning: bestCandidate.reasoning,
      dependencies: task.dependsOn,
      estimatedCompletion,
      priority: task.priority
    };
  }
  
  /**
   * Analyze task description to determine required specialties
   */
  private analyzeRequiredSpecialties(taskDescription: string): string[] {
    const description = taskDescription.toLowerCase();
    const specialties: string[] = [];
    
    // UI/UX related
    if (description.includes('ui') || description.includes('ux') || 
        description.includes('design') || description.includes('component') ||
        description.includes('frontend') || description.includes('interface')) {
      specialties.push('ui', 'design');
    }
    
    // Backend related
    if (description.includes('api') || description.includes('backend') || 
        description.includes('server') || description.includes('database') ||
        description.includes('route') || description.includes('service')) {
      specialties.push('backend', 'api');
    }
    
    // AI related
    if (description.includes('ai') || description.includes('claude') || 
        description.includes('image') || description.includes('generation') ||
        description.includes('ml') || description.includes('prompt')) {
      specialties.push('ai', 'ml');
    }
    
    // Business setup related
    if (description.includes('website') || description.includes('business') || 
        description.includes('template') || description.includes('builder')) {
      specialties.push('website-builder', 'business-setup');
    }
    
    // Deployment related
    if (description.includes('deploy') || description.includes('optimization') || 
        description.includes('cleanup') || description.includes('organization')) {
      specialties.push('deployment', 'optimization');
    }
    
    // Default to technical if no specific match
    if (specialties.length === 0) {
      specialties.push('technical');
    }
    
    return Array.from(new Set(specialties)); // Remove duplicates
  }
  
  /**
   * Estimate task completion time based on description and specialties
   */
  private estimateTaskTime(taskDescription: string, specialties: string[]): number {
    let baseTime = 30; // 30 minutes base
    
    const description = taskDescription.toLowerCase();
    
    // Complexity factors
    if (description.includes('complex') || description.includes('advanced')) {
      baseTime += 30;
    }
    
    if (description.includes('integration') || description.includes('system')) {
      baseTime += 20;
    }
    
    if (description.includes('database') || description.includes('schema')) {
      baseTime += 25;
    }
    
    if (description.includes('ui') && description.includes('ux')) {
      baseTime += 35; // UI/UX work takes longer
    }
    
    // Multiple specialties increase complexity
    baseTime += (specialties.length - 1) * 10;
    
    return Math.min(baseTime, 120); // Cap at 2 hours
  }
  
  /**
   * Update agent workload after task assignment
   */
  private updateAgentWorkload(agentId: string, task: TaskDependency): void {
    const workload = this.agentWorkloads.get(agentId);
    if (workload) {
      workload.currentTasks += 1;
      workload.lastTaskAssigned = new Date();
      
      // Update task history
      const history = this.taskHistory.get(agentId) || [];
      history.push({
        taskId: task.taskId,
        assignedAt: new Date(),
        estimatedTime: task.estimatedTime,
        priority: task.priority
      });
      this.taskHistory.set(agentId, history);
      
      console.log(`📊 WORKLOAD UPDATE: ${agentId} now has ${workload.currentTasks}/${workload.maxCapacity} tasks`);
    }
  }
  
  /**
   * Mark task as completed and update agent availability
   */
  async taskCompleted(taskId: string, agentId: string, actualTime?: number): Promise<void> {
    const workload = this.agentWorkloads.get(agentId);
    if (workload && workload.currentTasks > 0) {
      workload.currentTasks -= 1;
      
      // Update efficiency based on actual vs estimated time
      if (actualTime) {
        const task = this.taskQueue.find(t => t.taskId === taskId);
        if (task) {
          const efficiency = Math.min(task.estimatedTime / actualTime, 1.0);
          workload.efficiency = (workload.efficiency * 0.8) + (efficiency * 0.2); // Weighted average
        }
      }
      
      // Update task status
      const task = this.taskQueue.find(t => t.taskId === taskId);
      if (task) {
        task.status = 'completed';
      }
      
      console.log(`✅ TASK COMPLETED: ${taskId} by ${agentId}, new workload: ${workload.currentTasks}/${workload.maxCapacity}`);
    }
  }
  
  /**
   * Get current delegation status
   */
  getDelegationStatus(): {
    totalTasks: number;
    pendingTasks: number;
    activeTasks: number;
    completedTasks: number;
    agentWorkloads: Record<string, AgentWorkload>;
  } {
    const pendingTasks = this.taskQueue.filter(t => t.status === 'pending').length;
    const activeTasks = this.taskQueue.filter(t => t.status === 'assigned' || t.status === 'in_progress').length;
    const completedTasks = this.taskQueue.filter(t => t.status === 'completed').length;
    
    const workloads: Record<string, AgentWorkload> = {};
    this.agentWorkloads.forEach((workload, agentId) => {
      workloads[agentId] = { ...workload };
    });
    
    return {
      totalTasks: this.taskQueue.length,
      pendingTasks,
      activeTasks,
      completedTasks,
      agentWorkloads: workloads
    };
  }
  
  /**
   * Clear completed tasks from queue (cleanup)
   */
  cleanupCompletedTasks(): number {
    const initialLength = this.taskQueue.length;
    this.taskQueue = this.taskQueue.filter(task => task.status !== 'completed');
    const removedCount = initialLength - this.taskQueue.length;
    
    if (removedCount > 0) {
      console.log(`🧹 ELENA DELEGATION: Cleaned up ${removedCount} completed tasks`);
    }
    
    return removedCount;
  }
}

export const elenaDelegationSystem = new ElenaDelegationSystem();