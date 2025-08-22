import { claudeApiServiceSimple } from '../services/claude-api-service-simple';

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

export class ElenaDelegationSystem {
  private static instance: ElenaDelegationSystem;
  
  static getInstance(): ElenaDelegationSystem {
    if (!this.instance) {
      this.instance = new ElenaDelegationSystem();
    }
    return this.instance;
  }
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
        agentId: 'elena',
        currentTasks: 0,
        maxCapacity: 5,
        specialties: ['coordination', 'strategy', 'delegation', 'project-management', 'oversight'],
        averageTaskTime: 30,
        lastTaskAssigned: null,
        efficiency: 0.95
      },
      {
        agentId: 'zara',
        currentTasks: 0,
        maxCapacity: 4,
        specialties: ['frontend_architecture', 'ui_design', 'user_experience', 'technical_implementation'],
        averageTaskTime: 60,
        lastTaskAssigned: null,
        efficiency: 0.95
      },
      {
        agentId: 'maya',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['style', 'styling', 'fashion', 'aesthetic', 'visual-style'],
        averageTaskTime: 30,
        lastTaskAssigned: null,
        efficiency: 0.85
      },
      {
        agentId: 'aria',
        currentTasks: 0,
        maxCapacity: 3,
        specialties: ['design', 'ux', 'ui', 'digital-design', 'visual-design', 'components'],
        averageTaskTime: 45,
        lastTaskAssigned: null,
        efficiency: 0.9
      },
      {
        agentId: 'victoria',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['frontend', 'website-development', 'web-development', 'frontend-development'],
        averageTaskTime: 90,
        lastTaskAssigned: null,
        efficiency: 0.8
      },
      {
        agentId: 'quinn',
        currentTasks: 0,
        maxCapacity: 3,
        specialties: ['qa', 'testing', 'quality-assurance', 'debugging', 'validation', 'quality-control'],
        averageTaskTime: 40,
        lastTaskAssigned: null,
        efficiency: 0.9
      },
      {
        agentId: 'rachel',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['copywriting', 'voice-replication', 'brand-messaging', 'content'],
        averageTaskTime: 35,
        lastTaskAssigned: null,
        efficiency: 0.85
      },
      {
        agentId: 'sophia',
        currentTasks: 0,
        maxCapacity: 3,
        specialties: ['social-media', 'community-growth', 'content-strategy', 'engagement', 'social-media-management'],
        averageTaskTime: 25,
        lastTaskAssigned: null,
        efficiency: 0.85
      },
      {
        agentId: 'olga',
        currentTasks: 0,
        maxCapacity: 3,
        specialties: ['repo-organization', 'project-organization', 'cleanup', 'file-management', 'structure'],
        averageTaskTime: 35,
        lastTaskAssigned: null,
        efficiency: 0.9
      },
      {
        agentId: 'atlas',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['system_monitoring', 'performance_optimization', 'analytics', 'infrastructure'],
        averageTaskTime: 50,
        lastTaskAssigned: null,
        efficiency: 0.8
      },
      {
        agentId: 'diana',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['business-coaching', 'strategy', 'personal-brand-scaling', 'business-guidance', 'growth-strategy'],
        averageTaskTime: 45,
        lastTaskAssigned: null,
        efficiency: 0.85
      },
      {
        agentId: 'martha',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['ads', 'promotion', 'advertising', 'marketing-campaigns', 'paid-promotion'],
        averageTaskTime: 55,
        lastTaskAssigned: null,
        efficiency: 0.8
      },
      {
        agentId: 'ava',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['automation', 'email-automation', 'content-automation', 'make', 'manychat', 'social-media-automation'],
        averageTaskTime: 30,
        lastTaskAssigned: null,
        efficiency: 0.85
      },
      {
        agentId: 'flux',
        currentTasks: 0,
        maxCapacity: 1,
        specialties: ['flux-lora', 'replicate-models', 'model-training', 'black-forest-labs', 'image-generation'],
        averageTaskTime: 20,
        lastTaskAssigned: null,
        efficiency: 0.9
      },
      {
        agentId: 'nova',
        currentTasks: 0,
        maxCapacity: 2,
        specialties: ['customer_success', 'user_onboarding', 'support_optimization', 'user_experience'],
        averageTaskTime: 35,
        lastTaskAssigned: null,
        efficiency: 0.9
      }
    ];
    
    agents.forEach(agent => {
      this.agentWorkloads.set(agent.agentId, agent);
    });
    
    console.log('👥 ELENA DELEGATION: Initialized workload tracking for', agents.length, 'agents');
    console.log('✨ ECOSYSTEM COMPLETE: All 14 agents now tracked with specializations and capacity limits');
  }
  
  /**
   * Get current agent workloads for coordination bridge
   */
  getAgentWorkloads(): Map<string, AgentWorkload> {
    return this.agentWorkloads;
  }

  /**
   * Delegate task with ActiveTask interface for coordination bridge
   */
  async delegateTask(task: any): Promise<DelegationDecision> {
    return this.delegateTaskLegacy(
      task.taskDescription,
      'admin',
      task.priority,
      task.dependencies || [],
      []
    );
  }

  /**
   * CRITICAL FIX: Elena must research existing files before delegating
   * Prevents agents from creating duplicates by directing them to existing files
   */
  async delegateTaskLegacy(
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
      
      // CRITICAL FIX: Transform task description to work on existing files
      const correctedTaskDescription = this.preventDuplicateFileCreation(taskDescription);
      console.log('🔧 CORRECTED TASK:', correctedTaskDescription);
      
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      // Create task dependency object
      const task: TaskDependency = {
        taskId,
        dependsOn: dependencies,
        priority,
        estimatedTime: this.estimateTaskTime(correctedTaskDescription, requiredSpecialties),
        agentSpecialty: requiredSpecialties.length > 0 ? requiredSpecialties : this.analyzeRequiredSpecialties(correctedTaskDescription),
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
  public async findOptimalAgent(task: TaskDependency): Promise<DelegationDecision> {
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
  public analyzeRequiredSpecialties(taskDescription: string): string[] {
    const description = taskDescription.toLowerCase();
    const specialties: string[] = [];
    
    // COPYWRITING & CONTENT (HIGH PRIORITY - Check first)
    if (description.includes('copywriting') || description.includes('copy') || 
        description.includes('messaging') || description.includes('headline') ||
        description.includes('value proposition') || description.includes('content strategy') ||
        description.includes('brand messaging') || description.includes('voice') ||
        description.includes('cta') || description.includes('call-to-action')) {
      specialties.push('copywriting', 'brand-messaging', 'content');
    }
    
    // VISUAL DESIGN (UI/UX)
    if (description.includes('visual') || description.includes('design') || 
        description.includes('ui') || description.includes('ux') || 
        description.includes('component') || description.includes('frontend') || 
        description.includes('interface') || description.includes('branding') ||
        description.includes('color') || description.includes('layout')) {
      specialties.push('ui', 'design', 'components');
    }
    
    // BACKEND & TECHNICAL
    if (description.includes('api') || description.includes('backend') || 
        description.includes('server') || description.includes('database') ||
        description.includes('route') || description.includes('service') ||
        description.includes('schema') || description.includes('technical')) {
      specialties.push('backend', 'api', 'technical');
    }
    
    // AI & IMAGE GENERATION (Only for actual AI tasks)
    if (description.includes('ai generation') || description.includes('image generation') || 
        description.includes('claude') || description.includes('flux') ||
        description.includes('model training') || description.includes('prompt engineering')) {
      specialties.push('ai', 'ml', 'image-generation');
    }
    
    // BUSINESS COACHING & STRATEGY (Diana)
    if (description.includes('business coaching') || description.includes('business strategy') || 
        description.includes('personal brand scaling') || description.includes('growth strategy') ||
        description.includes('business guidance') || description.includes('scaling')) {
      specialties.push('business-coaching', 'strategy', 'personal-brand-scaling');
    }
    
    // QA & TESTING (Quinn)
    if (description.includes('testing') || description.includes('qa') || 
        description.includes('quality') || description.includes('validation') ||
        description.includes('debugging') || description.includes('quality assurance')) {
      specialties.push('qa', 'testing', 'validation');
    }
    
    // REPO ORGANIZATION (Olga)
    if (description.includes('repo') || description.includes('organization') || 
        description.includes('cleanup') || description.includes('file management') ||
        description.includes('project organization') || description.includes('structure')) {
      specialties.push('repo-organization', 'project-organization', 'cleanup');
    }
    
    // SOCIAL MEDIA (Sophia)
    if (description.includes('social media') || description.includes('community') || 
        description.includes('engagement') || description.includes('social') ||
        description.includes('social media management')) {
      specialties.push('social-media', 'engagement', 'social-media-management');
    }
    
    // ADS & PROMOTION (Martha)
    if (description.includes('ads') || description.includes('promotion') || 
        description.includes('advertising') || description.includes('marketing campaigns') ||
        description.includes('paid promotion')) {
      specialties.push('ads', 'promotion', 'advertising');
    }
    
    // AUTOMATION (Ava)
    if (description.includes('automation') || description.includes('email automation') || 
        description.includes('content automation') || description.includes('make') ||
        description.includes('manychat') || description.includes('social media automation')) {
      specialties.push('automation', 'email-automation', 'content-automation');
    }
    
    // WORKFLOW AUTOMATION (Wilma)
    if (description.includes('workflow') || description.includes('process automation') || 
        description.includes('workflow design') || description.includes('workflow automation')) {
      specialties.push('workflow-design', 'process-automation', 'workflow-automation');
    }
    
    // STYLE & FASHION (Maya)
    if (description.includes('style') || description.includes('styling') || 
        description.includes('fashion') || description.includes('aesthetic') ||
        description.includes('visual style')) {
      specialties.push('style', 'styling', 'fashion', 'aesthetic');
    }
    
    // FRONTEND & WEBSITE DEVELOPMENT (Victoria)
    if (description.includes('frontend') || description.includes('website development') || 
        description.includes('web development') || description.includes('website building') ||
        description.includes('landing page') || description.includes('web page') ||
        description.includes('website template') || description.includes('web template')) {
      specialties.push('frontend', 'website-development', 'web-development');
    }
    
    // FLUX & MODEL TRAINING (Flux)
    if (description.includes('flux') || description.includes('replicate') || 
        description.includes('model training') || description.includes('black forest') ||
        description.includes('lora') || description.includes('image generation')) {
      specialties.push('flux-lora', 'replicate-models', 'model-training');
    }
    
    // Default to coordination if no specific match
    if (specialties.length === 0) {
      specialties.push('coordination');
    }
    
    return Array.from(new Set(specialties)); // Remove duplicates
  }
  
  /**
   * Estimate task completion time based on description and specialties
   */
  public estimateTaskTime(taskDescription: string, specialties: string[]): number {
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
   * CRITICAL FIX: Prevent agents from creating duplicate files
   * Transform task descriptions to work on existing files
   */
  private preventDuplicateFileCreation(taskDescription: string): string {
    const task = taskDescription.toLowerCase();
    
    // Landing page duplication prevention
    if (task.includes('landing') || task.includes('editorial')) {
      if (task.includes('create') || task.includes('build') || task.includes('implement')) {
        return taskDescription.replace(
          /create|build|implement/gi, 
          'UPDATE existing client/src/pages/landing.tsx to enhance'
        ) + ' - DO NOT create new editorial-landing.tsx files. Use React+Wouter framework (wouter Link, react-helmet Helmet).';
      }
    }
    
    // Gallery page duplication prevention
    if (task.includes('gallery') || task.includes('photos')) {
      if (task.includes('create') || task.includes('redesign')) {
        return taskDescription.replace(
          /create|redesign/gi,
          'UPDATE existing client/src/pages/sselfie-gallery.tsx to enhance'
        ) + ' - Work on existing gallery page, do not create duplicates.';
      }
    }
    
    // Maya page duplication prevention
    if (task.includes('maya') || task.includes('style consultation')) {
      if (task.includes('create') || task.includes('build')) {
        return taskDescription.replace(
          /create|build/gi,
          'UPDATE existing client/src/pages/maya.tsx to enhance'
        ) + ' - Work on existing Maya page, do not create duplicates.';
      }
    }
    
    // Workspace duplication prevention
    if (task.includes('workspace') || task.includes('dashboard')) {
      if (task.includes('create') || task.includes('redesign')) {
        return taskDescription.replace(
          /create|redesign/gi,
          'UPDATE existing client/src/pages/workspace.tsx to enhance'
        ) + ' - Work on existing workspace page, do not create duplicates.';
      }
    }
    
    // Component duplication prevention
    if (task.includes('component') && (task.includes('create') || task.includes('build'))) {
      return taskDescription.replace(
        /create|build/gi,
        'First check if similar component exists using search tool, then UPDATE existing OR create only if truly new'
      ) + ' - Avoid duplicates by searching existing components first.';
    }
    
    // General duplication prevention
    if (task.includes('create') || task.includes('build') || task.includes('implement')) {
      return 'First use search tool to find existing files, then ' + 
             taskDescription.replace(/create|build|implement/gi, 'UPDATE existing') + 
             ' - Only create new if no existing file serves the purpose. Use React+Wouter framework patterns.';
    }
    
    return taskDescription + ' - Check existing project structure first, work on existing files when possible.';
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