export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  requiredSkills: string[];
  estimatedTime: number; // in minutes
  dependencies: string[];
  agentRecommendations?: string[];
}

export interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  parallelExecution: boolean;
  dependencies: string[];
  estimatedDuration: number; // in minutes
  tasks: WorkflowTask[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'audit' | 'optimization' | 'launch' | 'maintenance';
  estimatedDuration: number; // in minutes
  requiredAgents: string[];
  phases: WorkflowPhase[];
  successCriteria: string[];
  riskFactors: string[];
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  successRate: number;
}

export class AutonomousWorkflowTemplates {
  private templates: Map<string, WorkflowTemplate> = new Map();

  constructor() {
    this.initializeFoundationalTemplates();
  }

  /**
   * Initialize foundational workflow templates for SSELFIE Studio
   */
  private initializeFoundationalTemplates(): void {
    const templates: WorkflowTemplate[] = [
      {
        id: 'complete-launch-readiness',
        name: 'Complete Launch Readiness Protocol',
        description: 'Comprehensive platform validation and optimization across all systems',
        category: 'launch',
        estimatedDuration: 180, // 3 hours
        requiredAgents: ['elena', 'aria', 'zara', 'maya', 'victoria', 'rachel', 'ava', 'quinn'],
        phases: [
          {
            id: 'phase-1-system-architecture',
            name: 'System Architecture Validation',
            description: 'Validate technical architecture, performance, and scalability',
            parallelExecution: false,
            dependencies: [],
            estimatedDuration: 45,
            tasks: [
              {
                id: 'task-technical-audit',
                title: 'Complete Technical Architecture Audit',
                description: 'Comprehensive review of backend architecture, database performance, and code quality',
                priority: 'critical',
                complexity: 'enterprise',
                requiredSkills: ['backend', 'architecture', 'performance'],
                estimatedTime: 30,
                dependencies: [],
                agentRecommendations: ['zara']
              },
              {
                id: 'task-dependency-optimization',
                title: 'Repository and Dependency Optimization',
                description: 'Clean repository structure, optimize dependencies, and validate file organization',
                priority: 'high',
                complexity: 'moderate',
                requiredSkills: ['organization', 'maintenance', 'architecture-optimization'],
                estimatedTime: 15,
                dependencies: [],
                agentRecommendations: ['olga']
              }
            ]
          },
          {
            id: 'phase-2-design-experience',
            name: 'Design & User Experience Validation',
            description: 'Audit luxury design standards and user experience flows',
            parallelExecution: true,
            dependencies: ['phase-1-system-architecture'],
            estimatedDuration: 40,
            tasks: [
              {
                id: 'task-luxury-design-audit',
                title: 'Luxury Editorial Design System Audit',
                description: 'Validate Times New Roman typography, editorial spacing, and luxury brand consistency',
                priority: 'critical',
                complexity: 'complex',
                requiredSkills: ['luxury-design', 'editorial-layout', 'branding'],
                estimatedTime: 25,
                dependencies: [],
                agentRecommendations: ['aria']
              },
              {
                id: 'task-ux-flow-validation',
                title: 'User Experience Flow Validation',
                description: 'Test complete user journey from landing to BUILD workspace with conversion optimization',
                priority: 'high',
                complexity: 'complex',
                requiredSkills: ['ux-design', 'conversion-optimization', 'usability'],
                estimatedTime: 20,
                dependencies: [],
                agentRecommendations: ['victoria']
              },
              {
                id: 'task-maya-ai-integration',
                title: 'Maya AI Photography System Validation',
                description: 'Test AI photography generation, celebrity styling interface, and user workflow',
                priority: 'critical',
                complexity: 'complex',
                requiredSkills: ['ai-photography', 'flux-integration', 'user-experience'],
                estimatedTime: 15,
                dependencies: [],
                agentRecommendations: ['maya']
              }
            ]
          },
          {
            id: 'phase-3-content-automation',
            name: 'Content & Automation Systems',
            description: 'Validate voice consistency, automation workflows, and content systems',
            parallelExecution: true,
            dependencies: ['phase-2-design-experience'],
            estimatedDuration: 35,
            tasks: [
              {
                id: 'task-voice-consistency-audit',
                title: 'Brand Voice & Messaging Consistency',
                description: 'Audit Sandra\'s authentic voice across all customer touchpoints and messaging',
                priority: 'high',
                complexity: 'moderate',
                requiredSkills: ['copywriting', 'brand-voice', 'messaging'],
                estimatedTime: 20,
                dependencies: [],
                agentRecommendations: ['rachel']
              },
              {
                id: 'task-automation-workflow-validation',
                title: 'Automation Workflow Validation',
                description: 'Test all automated workflows, scalability systems, and process optimization',
                priority: 'high',
                complexity: 'complex',
                requiredSkills: ['automation', 'workflow-optimization', 'scalability'],
                estimatedTime: 25,
                dependencies: [],
                agentRecommendations: ['ava']
              }
            ]
          },
          {
            id: 'phase-4-quality-assurance',
            name: 'Quality Assurance & Testing',
            description: 'Comprehensive quality validation with luxury standards enforcement',
            parallelExecution: false,
            dependencies: ['phase-3-content-automation'],
            estimatedDuration: 30,
            tasks: [
              {
                id: 'task-luxury-standards-validation',
                title: 'Luxury Standards Quality Assurance',
                description: 'Swiss-precision validation of all luxury standards, performance metrics, and user experience quality',
                priority: 'critical',
                complexity: 'enterprise',
                requiredSkills: ['quality-assurance', 'luxury-standards', 'testing'],
                estimatedTime: 30,
                dependencies: ['task-technical-audit', 'task-luxury-design-audit', 'task-ux-flow-validation'],
                agentRecommendations: ['quinn']
              }
            ]
          },
          {
            id: 'phase-5-strategic-coordination',
            name: 'Strategic Coordination & Launch Report',
            description: 'Executive coordination and comprehensive launch readiness reporting',
            parallelExecution: false,
            dependencies: ['phase-4-quality-assurance'],
            estimatedDuration: 30,
            tasks: [
              {
                id: 'task-executive-coordination',
                title: 'Executive Launch Readiness Report',
                description: 'Comprehensive strategic analysis, readiness assessment, and launch recommendation',
                priority: 'critical',
                complexity: 'enterprise',
                requiredSkills: ['strategy', 'coordination', 'planning'],
                estimatedTime: 30,
                dependencies: ['task-luxury-standards-validation'],
                agentRecommendations: ['elena']
              }
            ]
          }
        ],
        successCriteria: [
          'All technical architecture passes performance benchmarks',
          'Luxury design standards maintain 100% consistency',
          'User experience flows achieve >95% conversion rates',
          'AI photography systems generate high-quality results',
          'Brand voice maintains authenticity across all touchpoints',
          'Automation workflows operate without manual intervention',
          'Quality assurance validates luxury positioning',
          'Executive report confirms launch readiness'
        ],
        riskFactors: [
          'Database performance degradation under load',
          'Design inconsistencies affecting brand perception',
          'User experience friction reducing conversions',
          'AI generation quality below luxury standards',
          'Voice inconsistency damaging brand authenticity',
          'Automation failures requiring manual intervention',
          'Quality issues affecting customer satisfaction'
        ],
        createdAt: new Date(),
        usageCount: 0,
        successRate: 95
      },
      {
        id: 'design-system-comprehensive-audit',
        name: 'Comprehensive Design System Audit',
        description: 'Deep luxury design system analysis with editorial standards validation',
        category: 'audit',
        estimatedDuration: 60,
        requiredAgents: ['aria', 'quinn', 'victoria'],
        phases: [
          {
            id: 'design-audit-phase-1',
            name: 'Visual Hierarchy Analysis',
            description: 'Analyze visual hierarchy, typography, and spacing consistency',
            parallelExecution: false,
            dependencies: [],
            estimatedDuration: 25,
            tasks: [
              {
                id: 'typography-audit',
                title: 'Times New Roman Typography Audit',
                description: 'Comprehensive audit of Times New Roman usage, spacing, and hierarchy',
                priority: 'critical',
                complexity: 'moderate',
                requiredSkills: ['luxury-design', 'editorial-layout', 'typography'],
                estimatedTime: 15,
                dependencies: [],
                agentRecommendations: ['aria']
              },
              {
                id: 'spacing-consistency-check',
                title: 'Editorial Spacing Consistency',
                description: 'Validate golden ratio spacing and editorial flow consistency',
                priority: 'high',
                complexity: 'moderate',
                requiredSkills: ['editorial-layout', 'design-systems'],
                estimatedTime: 10,
                dependencies: ['typography-audit'],
                agentRecommendations: ['aria']
              }
            ]
          },
          {
            id: 'design-audit-phase-2',
            name: 'Brand Consistency Validation',
            description: 'Validate brand consistency and luxury positioning',
            parallelExecution: true,
            dependencies: ['design-audit-phase-1'],
            estimatedDuration: 35,
            tasks: [
              {
                id: 'color-palette-validation',
                title: 'Black/White/Zinc Palette Validation',
                description: 'Ensure strict adherence to luxury color palette across all components',
                priority: 'high',
                complexity: 'moderate',
                requiredSkills: ['branding', 'luxury-standards'],
                estimatedTime: 15,
                dependencies: [],
                agentRecommendations: ['aria']
              },
              {
                id: 'ux-consistency-check',
                title: 'User Experience Consistency',
                description: 'Validate consistent user experience patterns across all interfaces',
                priority: 'high',
                complexity: 'moderate',
                requiredSkills: ['ux-design', 'consistency'],
                estimatedTime: 15,
                dependencies: [],
                agentRecommendations: ['victoria']
              },
              {
                id: 'luxury-standards-enforcement',
                title: 'Luxury Standards Quality Gate',
                description: 'Swiss-precision validation of all luxury positioning elements',
                priority: 'critical',
                complexity: 'complex',
                requiredSkills: ['luxury-standards', 'quality-assurance'],
                estimatedTime: 20,
                dependencies: ['color-palette-validation', 'ux-consistency-check'],
                agentRecommendations: ['quinn']
              }
            ]
          }
        ],
        successCriteria: [
          'Typography maintains consistent Times New Roman hierarchy',
          'Editorial spacing follows golden ratio principles',
          'Color palette strictly adheres to black/white/zinc luxury standards',
          'User experience patterns maintain consistency',
          'All elements pass luxury positioning validation'
        ],
        riskFactors: [
          'Typography inconsistencies affecting brand recognition',
          'Spacing violations breaking editorial flow',
          'Color deviations damaging luxury positioning',
          'UX inconsistencies reducing user confidence'
        ],
        createdAt: new Date(),
        usageCount: 0,
        successRate: 98
      },
      {
        id: 'technical-performance-optimization',
        name: 'Technical Performance Optimization',
        description: 'Enterprise-grade technical optimization and performance tuning',
        category: 'optimization',
        estimatedDuration: 90,
        requiredAgents: ['zara', 'ava', 'olga'],
        phases: [
          {
            id: 'perf-phase-1',
            name: 'Architecture Analysis',
            description: 'Deep technical architecture analysis and optimization planning',
            parallelExecution: false,
            dependencies: [],
            estimatedDuration: 30,
            tasks: [
              {
                id: 'architecture-deep-dive',
                title: 'Technical Architecture Deep Dive',
                description: 'Comprehensive analysis of backend architecture, database design, and scalability patterns',
                priority: 'critical',
                complexity: 'enterprise',
                requiredSkills: ['architecture', 'backend', 'scalability'],
                estimatedTime: 30,
                dependencies: [],
                agentRecommendations: ['zara']
              }
            ]
          },
          {
            id: 'perf-phase-2',
            name: 'Performance Optimization',
            description: 'Implementation of performance optimizations and workflow improvements',
            parallelExecution: true,
            dependencies: ['perf-phase-1'],
            estimatedDuration: 60,
            tasks: [
              {
                id: 'database-optimization',
                title: 'Database Query Optimization',
                description: 'Optimize database queries, indexing, and connection pooling for sub-second response times',
                priority: 'critical',
                complexity: 'enterprise',
                requiredSkills: ['database', 'performance', 'optimization'],
                estimatedTime: 25,
                dependencies: ['architecture-deep-dive'],
                agentRecommendations: ['zara']
              },
              {
                id: 'workflow-automation-optimization',
                title: 'Workflow Automation Optimization',
                description: 'Optimize automation workflows, reduce redundancy, and improve efficiency',
                priority: 'high',
                complexity: 'complex',
                requiredSkills: ['automation', 'workflow-optimization', 'efficiency'],
                estimatedTime: 20,
                dependencies: [],
                agentRecommendations: ['ava']
              },
              {
                id: 'repository-cleanup',
                title: 'Repository Structure Optimization',
                description: 'Clean repository structure, optimize dependencies, and improve build performance',
                priority: 'medium',
                complexity: 'moderate',
                requiredSkills: ['organization', 'dependency-management', 'maintenance'],
                estimatedTime: 15,
                dependencies: [],
                agentRecommendations: ['olga']
              }
            ]
          }
        ],
        successCriteria: [
          'Database queries execute in <500ms',
          'Page load times achieve <2 seconds',
          'Automation workflows operate with 99% reliability',
          'Repository structure follows best practices',
          'Build times reduced by >30%'
        ],
        riskFactors: [
          'Database optimization affecting data integrity',
          'Workflow changes disrupting existing processes',
          'Repository changes breaking dependencies'
        ],
        createdAt: new Date(),
        usageCount: 0,
        successRate: 94
      },
      {
        id: 'marketing-conversion-optimization',
        name: 'Marketing & Conversion Optimization',
        description: 'Data-driven marketing optimization with social media integration',
        category: 'optimization',
        estimatedDuration: 75,
        requiredAgents: ['martha', 'sophia', 'rachel', 'diana'],
        phases: [
          {
            id: 'marketing-phase-1',
            name: 'Analytics and Strategy',
            description: 'Comprehensive analytics review and strategy development',
            parallelExecution: true,
            dependencies: [],
            estimatedDuration: 30,
            tasks: [
              {
                id: 'conversion-analytics-audit',
                title: 'Conversion Analytics Deep Dive',
                description: 'Comprehensive analysis of conversion metrics, user behavior, and optimization opportunities',
                priority: 'critical',
                complexity: 'complex',
                requiredSkills: ['analytics', 'marketing', 'conversion-optimization'],
                estimatedTime: 20,
                dependencies: [],
                agentRecommendations: ['martha']
              },
              {
                id: 'strategic-business-alignment',
                title: 'Strategic Business Alignment',
                description: 'Align marketing initiatives with business strategy and growth objectives',
                priority: 'high',
                complexity: 'moderate',
                requiredSkills: ['business-strategy', 'strategic-analysis'],
                estimatedTime: 15,
                dependencies: [],
                agentRecommendations: ['diana']
              }
            ]
          },
          {
            id: 'marketing-phase-2',
            name: 'Content and Messaging Optimization',
            description: 'Optimize content strategy and brand messaging consistency',
            parallelExecution: true,
            dependencies: ['marketing-phase-1'],
            estimatedDuration: 45,
            tasks: [
              {
                id: 'brand-messaging-optimization',
                title: 'Brand Messaging Consistency Optimization',
                description: 'Optimize Sandra\'s authentic voice across all marketing touchpoints',
                priority: 'critical',
                complexity: 'moderate',
                requiredSkills: ['brand-voice', 'messaging', 'copywriting'],
                estimatedTime: 20,
                dependencies: ['strategic-business-alignment'],
                agentRecommendations: ['rachel']
              },
              {
                id: 'social-media-strategy-optimization',
                title: 'Social Media Strategy Optimization',
                description: 'Optimize social media strategy for 120K+ Instagram community growth and engagement',
                priority: 'high',
                complexity: 'complex',
                requiredSkills: ['social-media', 'community-management', 'engagement'],
                estimatedTime: 25,
                dependencies: ['conversion-analytics-audit'],
                agentRecommendations: ['sophia']
              }
            ]
          }
        ],
        successCriteria: [
          'Conversion rates increase by >15%',
          'Brand messaging maintains authentic voice consistency',
          'Social media engagement increases by >25%',
          'Marketing ROI improves by >20%',
          'Customer acquisition cost decreases by >10%'
        ],
        riskFactors: [
          'Messaging changes affecting brand authenticity',
          'Social media strategy disrupting community',
          'Conversion optimization reducing user experience quality'
        ],
        createdAt: new Date(),
        usageCount: 0,
        successRate: 92
      }
    ];

    // Store all templates
    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    console.log(`🔄 WORKFLOW TEMPLATES: Initialized with ${templates.length} foundational workflow templates`);
  }

  /**
   * Get workflow template by ID
   */
  getTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates by category
   */
  getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.category === category)
      .sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values())
      .sort((a, b) => {
        // Sort by success rate * usage count for popularity
        const scoreA = a.successRate * (a.usageCount + 1);
        const scoreB = b.successRate * (b.usageCount + 1);
        return scoreB - scoreA;
      });
  }

  /**
   * Find optimal template for requirements
   */
  findOptimalTemplate(
    category: WorkflowTemplate['category'],
    availableAgents: string[],
    maxDuration?: number,
    complexity: 'simple' | 'moderate' | 'complex' | 'enterprise' = 'moderate'
  ): WorkflowTemplate | null {
    const candidates = this.getTemplatesByCategory(category)
      .filter(template => {
        // Check duration constraint
        if (maxDuration && template.estimatedDuration > maxDuration) {
          return false;
        }

        // Check agent availability (need at least 60% of required agents)
        const requiredAgents = template.requiredAgents;
        const availableRequiredAgents = requiredAgents.filter(agent => 
          availableAgents.includes(agent)
        );
        const availabilityRatio = availableRequiredAgents.length / requiredAgents.length;
        return availabilityRatio >= 0.6;
      })
      .sort((a, b) => {
        // Sort by success rate weighted by agent availability
        const aAvailability = a.requiredAgents.filter(agent => availableAgents.includes(agent)).length / a.requiredAgents.length;
        const bAvailability = b.requiredAgents.filter(agent => availableAgents.includes(agent)).length / b.requiredAgents.length;
        
        const aScore = a.successRate * aAvailability;
        const bScore = b.successRate * bAvailability;
        
        return bScore - aScore;
      });

    return candidates.length > 0 ? candidates[0] : null;
  }

  /**
   * Create custom template from requirements
   */
  createCustomTemplate(
    name: string,
    description: string,
    category: WorkflowTemplate['category'],
    requiredAgents: string[],
    customTasks: WorkflowTask[]
  ): string {
    const templateId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Organize tasks into phases based on dependencies and complexity
    const phases = this.organizeTasksIntoPhases(customTasks);
    const estimatedDuration = phases.reduce((sum, phase) => sum + phase.estimatedDuration, 0);

    const template: WorkflowTemplate = {
      id: templateId,
      name,
      description,
      category,
      estimatedDuration,
      requiredAgents,
      phases,
      successCriteria: [],
      riskFactors: [],
      createdAt: new Date(),
      usageCount: 0,
      successRate: 85 // Default for new templates
    };

    this.templates.set(templateId, template);

    console.log(`🔄 WORKFLOW TEMPLATES: Created custom template "${name}" (${phases.length} phases, ${estimatedDuration}min)`);
    return templateId;
  }

  /**
   * Update template success metrics
   */
  updateTemplateMetrics(templateId: string, success: boolean, actualDuration?: number): void {
    const template = this.templates.get(templateId);
    if (!template) return;

    // Update usage count
    template.usageCount += 1;
    template.lastUsed = new Date();

    // Update success rate (rolling average)
    const totalAttempts = template.usageCount;
    const currentSuccesses = Math.round((template.successRate / 100) * (totalAttempts - 1));
    const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;
    template.successRate = (newSuccesses / totalAttempts) * 100;

    // Update estimated duration if actual duration provided
    if (actualDuration) {
      // Use weighted average (70% historical, 30% new data)
      template.estimatedDuration = Math.round(
        template.estimatedDuration * 0.7 + actualDuration * 0.3
      );
    }

    console.log(`🔄 WORKFLOW TEMPLATES: Updated "${template.name}" metrics - Success: ${Math.round(template.successRate)}%`);
  }

  /**
   * Organize tasks into logical phases
   */
  private organizeTasksIntoPhases(tasks: WorkflowTask[]): WorkflowPhase[] {
    const phases: WorkflowPhase[] = [];
    const processedTasks = new Set<string>();
    const taskMap = new Map(tasks.map(task => [task.id, task]));

    let phaseIndex = 0;
    while (processedTasks.size < tasks.length) {
      const currentPhaseTasks: WorkflowTask[] = [];
      
      // Find tasks with no unprocessed dependencies
      for (const task of tasks) {
        if (processedTasks.has(task.id)) continue;
        
        const unprocessedDependencies = task.dependencies.filter(dep => !processedTasks.has(dep));
        if (unprocessedDependencies.length === 0) {
          currentPhaseTasks.push(task);
        }
      }

      if (currentPhaseTasks.length === 0) {
        // Break circular dependencies by taking tasks with minimum dependencies
        const remainingTasks = tasks.filter(task => !processedTasks.has(task.id));
        const minDependencies = Math.min(...remainingTasks.map(task => task.dependencies.length));
        const nextTask = remainingTasks.find(task => task.dependencies.length === minDependencies);
        if (nextTask) {
          currentPhaseTasks.push(nextTask);
        }
      }

      // Create phase
      const phase: WorkflowPhase = {
        id: `phase-${phaseIndex + 1}`,
        name: `Phase ${phaseIndex + 1}`,
        description: `Execute ${currentPhaseTasks.length} task(s)`,
        parallelExecution: currentPhaseTasks.length > 1,
        dependencies: phaseIndex > 0 ? [`phase-${phaseIndex}`] : [],
        estimatedDuration: Math.max(...currentPhaseTasks.map(task => task.estimatedTime)),
        tasks: currentPhaseTasks
      };

      phases.push(phase);
      
      // Mark tasks as processed
      currentPhaseTasks.forEach(task => processedTasks.add(task.id));
      phaseIndex++;
    }

    return phases;
  }

  /**
   * Get template statistics
   */
  getTemplateStatistics(): {
    totalTemplates: number;
    templatesByCategory: Record<string, number>;
    averageSuccessRate: number;
    mostUsedTemplate: string;
    newestTemplate: string;
  } {
    const templates = Array.from(this.templates.values());
    
    const templatesByCategory = templates.reduce((acc, template) => {
      acc[template.category] = (acc[template.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageSuccessRate = templates.length > 0 
      ? templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length 
      : 0;

    const mostUsed = templates.sort((a, b) => b.usageCount - a.usageCount)[0];
    const newest = templates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    return {
      totalTemplates: templates.length,
      templatesByCategory,
      averageSuccessRate: Math.round(averageSuccessRate),
      mostUsedTemplate: mostUsed?.name || 'None',
      newestTemplate: newest?.name || 'None'
    };
  }
}

// Export singleton instance
export const autonomousWorkflowTemplates = new AutonomousWorkflowTemplates();