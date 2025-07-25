import { AgentImplementationRequest } from '../tools/agent_implementation_toolkit';
import { CONSULTING_AGENT_PERSONALITIES } from '../agent-personalities-consulting';

export interface TaskRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  requiredSkills: string[];
  estimatedTime: number; // in minutes
  dependencies: string[];
  deadline?: Date;
}

export interface AgentCapability {
  agentName: string;
  specializations: string[];
  currentLoad: number; // 0-100
  averageTaskTime: number;
  successRate: number;
  isAvailable: boolean;
  maxConcurrentTasks: number;
  currentTasks: string[];
}

export interface TaskAssignment {
  taskId: string;
  agentName: string;
  confidence: number;
  estimatedCompletion: Date;
  reasoning: string[];
  backupAgents: string[];
}

export interface WorkflowOptimization {
  parallelTasks: string[][];
  sequentialPhases: string[][];
  criticalPath: string[];
  estimatedTotalTime: number;
  resourceUtilization: Record<string, number>;
}

export class IntelligentTaskDistributor {
  private agentCapabilities: Map<string, AgentCapability> = new Map();
  private taskQueue: TaskRequirement[] = [];
  private activeAssignments: Map<string, TaskAssignment> = new Map();

  constructor() {
    this.initializeAgentCapabilities();
  }

  /**
   * Initialize agent capabilities based on personalities
   */
  private initializeAgentCapabilities(): void {
    const capabilities: Record<string, AgentCapability> = {
      elena: {
        agentName: 'elena',
        specializations: ['coordination', 'strategy', 'workflow-orchestration', 'monitoring', 'leadership'],
        currentLoad: 0,
        averageTaskTime: 20,
        successRate: 95,
        isAvailable: true,
        maxConcurrentTasks: 3,
        currentTasks: []
      },
      aria: {
        agentName: 'aria',
        specializations: ['luxury-design', 'ui-components', 'editorial-layout', 'visual-storytelling', 'branding'],
        currentLoad: 0,
        averageTaskTime: 30,
        successRate: 98,
        isAvailable: true,
        maxConcurrentTasks: 2,
        currentTasks: []
      },
      zara: {
        agentName: 'zara',
        specializations: ['backend-development', 'architecture', 'performance', 'databases', 'apis'],
        currentLoad: 0,
        averageTaskTime: 45,
        successRate: 97,
        isAvailable: true,
        maxConcurrentTasks: 2,
        currentTasks: []
      },
      maya: {
        agentName: 'maya',
        specializations: ['ai-photography', 'image-generation', 'flux-integration', 'celebrity-styling', 'visual-ai'],
        currentLoad: 0,
        averageTaskTime: 25,
        successRate: 96,
        isAvailable: true,
        maxConcurrentTasks: 3,
        currentTasks: []
      },
      victoria: {
        agentName: 'victoria',
        specializations: ['ux-design', 'user-experience', 'interface-design', 'usability', 'conversion-optimization'],
        currentLoad: 0,
        averageTaskTime: 35,
        successRate: 94,
        isAvailable: true,
        maxConcurrentTasks: 2,
        currentTasks: []
      },
      rachel: {
        agentName: 'rachel',
        specializations: ['copywriting', 'voice-consistency', 'content-strategy', 'messaging', 'brand-voice'],
        currentLoad: 0,
        averageTaskTime: 20,
        successRate: 99,
        isAvailable: true,
        maxConcurrentTasks: 4,
        currentTasks: []
      },
      ava: {
        agentName: 'ava',
        specializations: ['automation', 'workflow-optimization', 'business-processes', 'integration', 'efficiency'],
        currentLoad: 0,
        averageTaskTime: 30,
        successRate: 93,
        isAvailable: true,
        maxConcurrentTasks: 3,
        currentTasks: []
      },
      quinn: {
        agentName: 'quinn',
        specializations: ['quality-assurance', 'testing', 'luxury-standards', 'validation', 'perfection'],
        currentLoad: 0,
        averageTaskTime: 25,
        successRate: 100,
        isAvailable: true,
        maxConcurrentTasks: 4,
        currentTasks: []
      },
      sophia: {
        agentName: 'sophia',
        specializations: ['social-media', 'community-management', 'engagement', 'growth-strategy', 'content-planning'],
        currentLoad: 0,
        averageTaskTime: 20,
        successRate: 92,
        isAvailable: true,
        maxConcurrentTasks: 3,
        currentTasks: []
      },
      martha: {
        agentName: 'martha',
        specializations: ['marketing', 'advertising', 'conversion-optimization', 'analytics', 'performance-marketing'],
        currentLoad: 0,
        averageTaskTime: 25,
        successRate: 94,
        isAvailable: true,
        maxConcurrentTasks: 3,
        currentTasks: []
      },
      diana: {
        agentName: 'diana',
        specializations: ['business-strategy', 'coaching', 'decision-making', 'planning', 'growth-strategy'],
        currentLoad: 0,
        averageTaskTime: 30,
        successRate: 96,
        isAvailable: true,
        maxConcurrentTasks: 2,
        currentTasks: []
      },
      wilma: {
        agentName: 'wilma',
        specializations: ['workflow-design', 'process-optimization', 'efficiency', 'automation-blueprints', 'scalability'],
        currentLoad: 0,
        averageTaskTime: 35,
        successRate: 95,
        isAvailable: true,
        maxConcurrentTasks: 2,
        currentTasks: []
      },
      olga: {
        agentName: 'olga',
        specializations: ['repository-organization', 'file-management', 'architecture-cleanup', 'documentation', 'maintenance'],
        currentLoad: 0,
        averageTaskTime: 15,
        successRate: 98,
        isAvailable: true,
        maxConcurrentTasks: 5,
        currentTasks: []
      }
    };

    Object.values(capabilities).forEach(cap => {
      this.agentCapabilities.set(cap.agentName, cap);
    });
  }

  /**
   * Analyze task and assign to optimal agent
   */
  async assignOptimalAgent(task: TaskRequirement): Promise<TaskAssignment> {
    const candidates = this.findSuitableAgents(task);
    const bestAgent = this.selectBestAgent(candidates, task);
    
    const assignment: TaskAssignment = {
      taskId: task.id,
      agentName: bestAgent.agentName,
      confidence: bestAgent.confidence,
      estimatedCompletion: this.calculateCompletionTime(bestAgent.agentName, task),
      reasoning: bestAgent.reasoning,
      backupAgents: candidates.slice(1, 3).map(c => c.agentName)
    };

    // Update agent load
    const agent = this.agentCapabilities.get(bestAgent.agentName);
    if (agent) {
      agent.currentTasks.push(task.id);
      agent.currentLoad = Math.min(100, agent.currentLoad + (task.estimatedTime / agent.averageTaskTime) * 20);
    }

    this.activeAssignments.set(task.id, assignment);
    return assignment;
  }

  /**
   * Find agents suitable for a task
   */
  private findSuitableAgents(task: TaskRequirement): Array<{agentName: string, confidence: number, reasoning: string[]}> {
    const candidates: Array<{agentName: string, confidence: number, reasoning: string[]}> = [];

    this.agentCapabilities.forEach((capability, agentName) => {
      if (!capability.isAvailable || capability.currentLoad >= 90) {
        return; // Skip overloaded or unavailable agents
      }

      const matchScore = this.calculateSkillMatch(capability, task);
      const loadPenalty = capability.currentLoad / 100 * 0.2;
      const successBonus = capability.successRate / 100 * 0.1;
      
      const confidence = Math.max(0, Math.min(100, matchScore - loadPenalty + successBonus));
      
      if (confidence > 30) { // Minimum threshold
        const reasoning = this.generateAssignmentReasoning(capability, task, matchScore);
        candidates.push({ agentName, confidence, reasoning });
      }
    });

    // Sort by confidence descending
    return candidates.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate skill match between agent and task
   */
  private calculateSkillMatch(capability: AgentCapability, task: TaskRequirement): number {
    let score = 0;
    const totalSkills = task.requiredSkills.length;

    task.requiredSkills.forEach(skill => {
      const matches = capability.specializations.filter(spec => 
        spec.includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(spec.toLowerCase()) ||
        this.getSkillSynonyms(skill).some(synonym => 
          capability.specializations.some(spec => spec.includes(synonym))
        )
      );
      
      if (matches.length > 0) {
        score += 100 / totalSkills; // Equal weight for each skill
      }
    });

    // Complexity bonus/penalty
    const complexityMultiplier = this.getComplexityMultiplier(capability.agentName, task.complexity);
    score *= complexityMultiplier;

    // Priority urgency factor
    if (task.priority === 'critical') score *= 1.2;
    else if (task.priority === 'high') score *= 1.1;

    return Math.min(100, score);
  }

  /**
   * Get skill synonyms for better matching
   */
  private getSkillSynonyms(skill: string): string[] {
    const synonymMap: Record<string, string[]> = {
      'frontend': ['ui', 'interface', 'client', 'react', 'component'],
      'backend': ['api', 'server', 'database', 'service'],
      'design': ['ui', 'ux', 'visual', 'branding', 'luxury'],
      'content': ['copy', 'writing', 'messaging', 'voice'],
      'automation': ['workflow', 'process', 'efficiency'],
      'quality': ['testing', 'validation', 'assurance'],
      'strategy': ['planning', 'coordination', 'management'],
      'ai': ['generation', 'model', 'intelligence', 'flux']
    };

    return synonymMap[skill.toLowerCase()] || [];
  }

  /**
   * Get complexity multiplier for agent
   */
  private getComplexityMultiplier(agentName: string, complexity: string): number {
    const complexityPreferences: Record<string, Record<string, number>> = {
      'zara': { 'enterprise': 1.3, 'complex': 1.2, 'moderate': 1.0, 'simple': 0.8 },
      'elena': { 'enterprise': 1.2, 'complex': 1.2, 'moderate': 1.1, 'simple': 0.9 },
      'aria': { 'enterprise': 0.9, 'complex': 1.1, 'moderate': 1.2, 'simple': 1.0 },
      'quinn': { 'enterprise': 1.1, 'complex': 1.1, 'moderate': 1.1, 'simple': 1.1 }
    };

    return complexityPreferences[agentName]?.[complexity] || 1.0;
  }

  /**
   * Select the best agent from candidates
   */
  private selectBestAgent(candidates: Array<{agentName: string, confidence: number, reasoning: string[]}>, task: TaskRequirement): {agentName: string, confidence: number, reasoning: string[]} {
    if (candidates.length === 0) {
      // Fallback to least loaded agent
      const fallbackAgent = Array.from(this.agentCapabilities.entries())
        .filter(([, cap]) => cap.isAvailable)
        .sort((a, b) => a[1].currentLoad - b[1].currentLoad)[0];
      
      return {
        agentName: fallbackAgent[0],
        confidence: 50,
        reasoning: ['No perfect match found', 'Assigned to least loaded available agent']
      };
    }

    return candidates[0];
  }

  /**
   * Generate reasoning for assignment
   */
  private generateAssignmentReasoning(capability: AgentCapability, task: TaskRequirement, matchScore: number): string[] {
    const reasoning: string[] = [];

    if (matchScore > 80) {
      reasoning.push(`Perfect skill match: ${capability.specializations.filter(s => 
        task.requiredSkills.some(req => s.includes(req.toLowerCase()))
      ).join(', ')}`);
    } else if (matchScore > 60) {
      reasoning.push(`Good skill alignment with agent specializations`);
    }

    if (capability.successRate > 95) {
      reasoning.push(`High success rate: ${capability.successRate}%`);
    }

    if (capability.currentLoad < 30) {
      reasoning.push('Agent has low current workload');
    }

    if (task.priority === 'critical' && capability.specializations.includes('quality-assurance')) {
      reasoning.push('Critical task assigned to quality-focused agent');
    }

    return reasoning;
  }

  /**
   * Calculate estimated completion time
   */
  private calculateCompletionTime(agentName: string, task: TaskRequirement): Date {
    const agent = this.agentCapabilities.get(agentName);
    if (!agent) return new Date(Date.now() + task.estimatedTime * 60000);

    const adjustedTime = task.estimatedTime * (1 + agent.currentLoad / 100);
    return new Date(Date.now() + adjustedTime * 60000);
  }

  /**
   * Optimize workflow for multiple tasks
   */
  optimizeWorkflow(tasks: TaskRequirement[]): WorkflowOptimization {
    const dependencies = this.analyzeDependencies(tasks);
    const parallelGroups = this.identifyParallelTasks(tasks, dependencies);
    const criticalPath = this.calculateCriticalPath(tasks, dependencies);
    
    return {
      parallelTasks: parallelGroups,
      sequentialPhases: this.createSequentialPhases(tasks, dependencies),
      criticalPath,
      estimatedTotalTime: this.calculateTotalTime(criticalPath, tasks),
      resourceUtilization: this.calculateResourceUtilization(tasks)
    };
  }

  /**
   * Analyze task dependencies
   */
  private analyzeDependencies(tasks: TaskRequirement[]): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();
    
    tasks.forEach(task => {
      dependencies.set(task.id, task.dependencies || []);
    });

    return dependencies;
  }

  /**
   * Identify tasks that can run in parallel
   */
  private identifyParallelTasks(tasks: TaskRequirement[], dependencies: Map<string, string[]>): string[][] {
    const parallelGroups: string[][] = [];
    const processed = new Set<string>();

    while (processed.size < tasks.length) {
      const currentGroup: string[] = [];
      
      tasks.forEach(task => {
        if (processed.has(task.id)) return;
        
        const deps = dependencies.get(task.id) || [];
        const canRun = deps.every(dep => processed.has(dep));
        
        if (canRun) {
          currentGroup.push(task.id);
        }
      });

      if (currentGroup.length > 0) {
        parallelGroups.push(currentGroup);
        currentGroup.forEach(id => processed.add(id));
      } else {
        break; // Prevent infinite loop
      }
    }

    return parallelGroups;
  }

  /**
   * Calculate critical path
   */
  private calculateCriticalPath(tasks: TaskRequirement[], dependencies: Map<string, string[]>): string[] {
    // Simplified critical path calculation
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const longestPath: string[] = [];
    let maxDuration = 0;

    // Find the task with longest dependency chain
    tasks.forEach(task => {
      const path = this.getTaskPath(task.id, taskMap, dependencies);
      const duration = path.reduce((sum, id) => sum + (taskMap.get(id)?.estimatedTime || 0), 0);
      
      if (duration > maxDuration) {
        maxDuration = duration;
        longestPath.splice(0, longestPath.length, ...path);
      }
    });

    return longestPath;
  }

  /**
   * Get task dependency path
   */
  private getTaskPath(taskId: string, taskMap: Map<string, TaskRequirement>, dependencies: Map<string, string[]>): string[] {
    const visited = new Set<string>();
    const path: string[] = [];

    const traverse = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const deps = dependencies.get(id) || [];
      deps.forEach(depId => traverse(depId));
      path.push(id);
    };

    traverse(taskId);
    return path;
  }

  /**
   * Create sequential phases
   */
  private createSequentialPhases(tasks: TaskRequirement[], dependencies: Map<string, string[]>): string[][] {
    return this.identifyParallelTasks(tasks, dependencies);
  }

  /**
   * Calculate total workflow time
   */
  private calculateTotalTime(criticalPath: string[], tasks: TaskRequirement[]): number {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    return criticalPath.reduce((sum, id) => sum + (taskMap.get(id)?.estimatedTime || 0), 0);
  }

  /**
   * Calculate resource utilization
   */
  private calculateResourceUtilization(tasks: TaskRequirement[]): Record<string, number> {
    const utilization: Record<string, number> = {};
    
    this.agentCapabilities.forEach((capability, agentName) => {
      const assignedTasks = tasks.filter(task => 
        task.requiredSkills.some(skill => 
          capability.specializations.some(spec => spec.includes(skill.toLowerCase()))
        )
      );
      
      const totalTime = assignedTasks.reduce((sum, task) => sum + task.estimatedTime, 0);
      utilization[agentName] = Math.min(100, totalTime / capability.averageTaskTime * 10);
    });

    return utilization;
  }

  /**
   * Handle task conflicts
   */
  resolveTaskConflicts(conflictingTasks: string[]): { resolution: string; reassignments: TaskAssignment[] } {
    const reassignments: TaskAssignment[] = [];
    
    // Simple conflict resolution: reassign based on priority
    conflictingTasks.forEach(taskId => {
      const assignment = this.activeAssignments.get(taskId);
      if (assignment) {
        // Find alternative agent
        const task = this.taskQueue.find(t => t.id === taskId);
        if (task && assignment.backupAgents.length > 0) {
          const newAgent = assignment.backupAgents[0];
          assignment.agentName = newAgent;
          assignment.estimatedCompletion = this.calculateCompletionTime(newAgent, task);
          reassignments.push(assignment);
        }
      }
    });

    return {
      resolution: `Reassigned ${reassignments.length} conflicting tasks to backup agents`,
      reassignments
    };
  }

  /**
   * Get agent status
   */
  getAgentStatus(): AgentCapability[] {
    return Array.from(this.agentCapabilities.values());
  }

  /**
   * Update agent availability
   */
  updateAgentAvailability(agentName: string, isAvailable: boolean): void {
    const agent = this.agentCapabilities.get(agentName);
    if (agent) {
      agent.isAvailable = isAvailable;
    }
  }

  /**
   * Complete task and update agent status
   */
  completeTask(taskId: string, success: boolean, actualTime: number): void {
    const assignment = this.activeAssignments.get(taskId);
    if (!assignment) return;

    const agent = this.agentCapabilities.get(assignment.agentName);
    if (agent) {
      // Update performance metrics
      agent.currentTasks = agent.currentTasks.filter(id => id !== taskId);
      agent.currentLoad = Math.max(0, agent.currentLoad - 20);
      
      // Update success rate
      const totalTasks = agent.currentTasks.length + 1;
      agent.successRate = ((agent.successRate * (totalTasks - 1)) + (success ? 100 : 0)) / totalTasks;
      
      // Update average time
      agent.averageTaskTime = ((agent.averageTaskTime * (totalTasks - 1)) + actualTime) / totalTasks;
    }

    this.activeAssignments.delete(taskId);
  }
}

// Export singleton instance
export const intelligentTaskDistributor = new IntelligentTaskDistributor();