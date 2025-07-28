export interface TaskRequirement {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  requiredSkills: string[];
  estimatedTime: number;
  dependencies: string[];
  phaseIndex?: number;
}

export interface AgentCapability {
  agentName: string;
  specializations: string[];
  currentLoad: number;
  maxConcurrentTasks: number;
  averageTaskTime: number;
  successRate: number;
  isAvailable: boolean;
  currentTasks: string[];
  skillLevels: Record<string, number>; // skill -> proficiency level (1-100)
}

export interface TaskAssignment {
  taskId: string;
  agentName: string;
  confidence: number;
  estimatedDuration: number;
  assignedAt: Date;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
}

export class IntelligentTaskDistributor {
  private agentCapabilities: Map<string, AgentCapability> = new Map();
  private taskAssignments: Map<string, TaskAssignment> = new Map();
  private taskHistory: TaskAssignment[] = [];

  constructor() {
    this.initializeAgentCapabilities();
  }

  /**
   * Initialize agent capabilities with Sandra's 13-agent roster
   */
  private initializeAgentCapabilities(): void {
    const agents: AgentCapability[] = [
      {
        agentName: 'elena',
        specializations: ['strategy', 'coordination', 'planning', 'autonomous-monitoring'],
        currentLoad: 0,
        maxConcurrentTasks: 5,
        averageTaskTime: 30,
        successRate: 98,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'strategy': 95,
          'coordination': 98,
          'planning': 92,
          'autonomous-monitoring': 88,
          'team-management': 90
        }
      },
      {
        agentName: 'aria',
        specializations: ['luxury-design', 'editorial-layout', 'branding', 'visual-storytelling'],
        currentLoad: 0,
        maxConcurrentTasks: 3,
        averageTaskTime: 45,
        successRate: 96,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'luxury-design': 98,
          'editorial-layout': 95,
          'branding': 92,
          'visual-storytelling': 90,
          'ui-design': 85
        }
      },
      {
        agentName: 'zara',
        specializations: ['backend', 'architecture', 'performance', 'technical-optimization'],
        currentLoad: 0,
        maxConcurrentTasks: 4,
        averageTaskTime: 60,
        successRate: 97,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'backend': 95,
          'architecture': 98,
          'performance': 94,
          'technical-optimization': 92,
          'database': 88,
          'scalability': 90
        }
      },
      {
        agentName: 'maya',
        specializations: ['ai-photography', 'flux-integration', 'celebrity-styling', 'user-experience'],
        currentLoad: 0,
        maxConcurrentTasks: 3,
        averageTaskTime: 40,
        successRate: 94,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'ai-photography': 98,
          'flux-integration': 95,
          'celebrity-styling': 92,
          'user-experience': 88,
          'interface-design': 85
        }
      },
      {
        agentName: 'victoria',
        specializations: ['ux-design', 'conversion-optimization', 'interface-design', 'usability'],
        currentLoad: 0,
        maxConcurrentTasks: 4,
        averageTaskTime: 35,
        successRate: 95,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'ux-design': 96,
          'conversion-optimization': 94,
          'interface-design': 90,
          'usability': 92,
          'user-research': 85
        }
      },
      {
        agentName: 'rachel',
        specializations: ['copywriting', 'brand-voice', 'messaging', 'content-strategy'],
        currentLoad: 0,
        maxConcurrentTasks: 4,
        averageTaskTime: 25,
        successRate: 97,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'copywriting': 98,
          'brand-voice': 95,
          'messaging': 94,
          'content-strategy': 90,
          'storytelling': 88
        }
      },
      {
        agentName: 'ava',
        specializations: ['automation', 'workflow-optimization', 'scalability', 'process-design'],
        currentLoad: 0,
        maxConcurrentTasks: 3,
        averageTaskTime: 50,
        successRate: 93,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'automation': 96,
          'workflow-optimization': 94,
          'scalability': 92,
          'process-design': 90,
          'integration': 88
        }
      },
      {
        agentName: 'quinn',
        specializations: ['quality-assurance', 'luxury-standards', 'testing', 'validation'],
        currentLoad: 0,
        maxConcurrentTasks: 5,
        averageTaskTime: 20,
        successRate: 99,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'quality-assurance': 99,
          'luxury-standards': 96,
          'testing': 94,
          'validation': 95,
          'performance-testing': 90
        }
      },
      {
        agentName: 'sophia',
        specializations: ['social-media', 'community-management', 'engagement', 'content-planning'],
        currentLoad: 0,
        maxConcurrentTasks: 4,
        averageTaskTime: 30,
        successRate: 92,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'social-media': 95,
          'community-management': 92,
          'engagement': 90,
          'content-planning': 88,
          'influencer-strategy': 85
        }
      },
      {
        agentName: 'martha',
        specializations: ['marketing', 'conversion-optimization', 'analytics', 'campaign-management'],
        currentLoad: 0,
        maxConcurrentTasks: 3,
        averageTaskTime: 40,
        successRate: 94,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'marketing': 96,
          'conversion-optimization': 94,
          'analytics': 92,
          'campaign-management': 90,
          'performance-tracking': 88
        }
      },
      {
        agentName: 'diana',
        specializations: ['business-strategy', 'planning', 'decision-making', 'coaching'],
        currentLoad: 0,
        maxConcurrentTasks: 3,
        averageTaskTime: 45,
        successRate: 96,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'business-strategy': 98,
          'planning': 95,
          'decision-making': 94,
          'coaching': 92,
          'strategic-analysis': 90
        }
      },
      {
        agentName: 'wilma',
        specializations: ['workflow-design', 'efficiency', 'process-optimization', 'automation'],
        currentLoad: 0,
        maxConcurrentTasks: 4,
        averageTaskTime: 35,
        successRate: 95,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'workflow-design': 96,
          'efficiency': 94,
          'process-optimization': 92,
          'automation': 88,
          'systems-thinking': 90
        }
      },
      {
        agentName: 'olga',
        specializations: ['organization', 'maintenance', 'cleanup', 'architecture-optimization'],
        currentLoad: 0,
        maxConcurrentTasks: 4,
        averageTaskTime: 25,
        successRate: 97,
        isAvailable: true,
        currentTasks: [],
        skillLevels: {
          'organization': 98,
          'maintenance': 95,
          'cleanup': 96,
          'architecture-optimization': 90,
          'dependency-management': 88
        }
      }
    ];

    agents.forEach(agent => {
      this.agentCapabilities.set(agent.agentName, agent);
    });
  }

  /**
   * Assign optimal agent to a task using intelligent matching
   */
  async assignOptimalAgent(task: TaskRequirement): Promise<TaskAssignment> {
    const availableAgents = Array.from(this.agentCapabilities.values())
      .filter(agent => agent.isAvailable && agent.currentLoad < agent.maxConcurrentTasks);

    if (availableAgents.length === 0) {
      throw new Error('No available agents for task assignment');
    }

    // Calculate agent-task compatibility scores
    const agentScores = availableAgents.map(agent => {
      const score = this.calculateTaskAgentCompatibility(task, agent);
      return { agent, score };
    });

    // Sort by compatibility score (descending)
    agentScores.sort((a, b) => b.score - a.score);

    const bestAgent = agentScores[0].agent;
    const confidence = agentScores[0].score;

    // Create task assignment
    const assignment: TaskAssignment = {
      taskId: task.id,
      agentName: bestAgent.agentName,
      confidence,
      estimatedDuration: this.estimateTaskDuration(task, bestAgent),
      assignedAt: new Date(),
      status: 'assigned',
      phaseIndex: 0 // Will be set properly during deployment planning
    };

    // Update agent load
    bestAgent.currentLoad += 1;
    bestAgent.currentTasks.push(task.id);

    // Store assignment
    this.taskAssignments.set(task.id, assignment);

    console.log(`🎯 TASK DISTRIBUTOR: Assigned "${task.title}" to ${bestAgent.agentName} (confidence: ${Math.round(confidence)}%)`);

    return assignment;
  }

  /**
   * Calculate compatibility score between task and agent
   */
  private calculateTaskAgentCompatibility(task: TaskRequirement, agent: AgentCapability): number {
    let score = 0;
    let maxPossibleScore = 0;

    // Skill matching (70% of score)
    for (const skill of task.requiredSkills) {
      maxPossibleScore += 70;
      if (agent.skillLevels[skill]) {
        score += agent.skillLevels[skill] * 0.7;
      } else if (agent.specializations.includes(skill)) {
        score += 50; // Base score for specialization match
      }
    }

    // Load balancing (15% of score)
    const loadScore = Math.max(0, 100 - (agent.currentLoad / agent.maxConcurrentTasks * 100));
    score += loadScore * 0.15;
    maxPossibleScore += 15;

    // Success rate (10% of score)
    score += agent.successRate * 0.1;
    maxPossibleScore += 10;

    // Task complexity vs agent capability (5% of score)
    const complexityBonus = this.getComplexityBonus(task.complexity, agent);
    score += complexityBonus * 0.05;
    maxPossibleScore += 5;

    return maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
  }

  /**
   * Get complexity bonus for agent handling specific task complexity
   */
  private getComplexityBonus(complexity: string, agent: AgentCapability): number {
    const complexityMap = {
      'simple': 20,
      'moderate': 40,
      'complex': 70,
      'enterprise': 100
    };

    const agentComplexityCapability = Math.max(...Object.values(agent.skillLevels));
    const taskComplexityRequirement = complexityMap[complexity as keyof typeof complexityMap] || 50;

    return Math.max(0, Math.min(100, agentComplexityCapability - taskComplexityRequirement + 50));
  }

  /**
   * Estimate task duration based on task and agent
   */
  private estimateTaskDuration(task: TaskRequirement, agent: AgentCapability): number {
    const baseTime = task.estimatedTime;
    const agentEfficiency = agent.averageTaskTime / 30; // Normalize to base 30min
    const complexityMultiplier = {
      'simple': 0.8,
      'moderate': 1.0,
      'complex': 1.5,
      'enterprise': 2.2
    }[task.complexity] || 1.0;

    return Math.round(baseTime * agentEfficiency * complexityMultiplier);
  }

  /**
   * Complete task assignment
   */
  async completeTask(taskId: string, success: boolean): Promise<void> {
    const assignment = this.taskAssignments.get(taskId);
    if (!assignment) return;

    const agent = this.agentCapabilities.get(assignment.agentName);
    if (!agent) return;

    // Update assignment status
    assignment.status = success ? 'completed' : 'failed';

    // Update agent load and success rate
    agent.currentLoad = Math.max(0, agent.currentLoad - 1);
    agent.currentTasks = agent.currentTasks.filter(id => id !== taskId);

    // Update agent success rate (rolling average)
    const currentSuccessCount = Math.round(agent.successRate);
    const newSuccessCount = success ? currentSuccessCount + 1 : currentSuccessCount;
    agent.successRate = Math.min(100, newSuccessCount);

    // Move to history
    this.taskHistory.push({ ...assignment });
    this.taskAssignments.delete(taskId);

    console.log(`✅ TASK DISTRIBUTOR: Task ${taskId} ${success ? 'completed' : 'failed'} by ${assignment.agentName}`);
  }

  /**
   * Get current agent status
   */
  getAgentStatus(): AgentCapability[] {
    return Array.from(this.agentCapabilities.values());
  }

  /**
   * Get task assignment history
   */
  getTaskHistory(): TaskAssignment[] {
    return this.taskHistory;
  }

  /**
   * Get current active assignments
   */
  getActiveAssignments(): TaskAssignment[] {
    return Array.from(this.taskAssignments.values());
  }

  /**
   * Force agent availability (for emergency situations)
   */
  setAgentAvailability(agentName: string, isAvailable: boolean): boolean {
    const agent = this.agentCapabilities.get(agentName);
    if (!agent) return false;

    agent.isAvailable = isAvailable;
    console.log(`🔄 TASK DISTRIBUTOR: ${agentName} availability set to ${isAvailable}`);
    return true;
  }

  /**
   * Get load balancing recommendations
   */
  getLoadBalancingRecommendations(): { agentName: string; load: number; recommendation: string }[] {
    return Array.from(this.agentCapabilities.values()).map(agent => {
      const loadPercentage = (agent.currentLoad / agent.maxConcurrentTasks) * 100;
      let recommendation = 'optimal';

      if (loadPercentage > 80) {
        recommendation = 'high-load-redistribute';
      } else if (loadPercentage < 20) {
        recommendation = 'underutilized-assign-more';
      } else if (loadPercentage > 60) {
        recommendation = 'moderate-load-monitor';
      }

      return {
        agentName: agent.agentName,
        load: Math.round(loadPercentage),
        recommendation
      };
    });
  }
}

// Export singleton instance
export const intelligentTaskDistributor = new IntelligentTaskDistributor();