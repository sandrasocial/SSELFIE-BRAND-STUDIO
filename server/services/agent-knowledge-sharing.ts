import { z } from 'zod';

export interface AgentInsight {
  id: string;
  agentName: string;
  category: 'technical' | 'design' | 'strategy' | 'optimization' | 'workflow' | 'quality';
  title: string;
  description: string;
  successMetrics: {
    taskId: string;
    completionTime: number;
    qualityScore: number;
    userSatisfaction: number;
  };
  applicableAgents: string[];
  tags: string[];
  createdAt: Date;
  usageCount: number;
  effectiveness: number; // 0-100
}

export interface StrategyPattern {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: string[];
  requiredTools: string[];
  successCriteria: string[];
  averageSuccessRate: number;
  recommendedFor: string[];
  createdBy: string;
  refinedBy: string[];
  usageHistory: {
    agentName: string;
    taskId: string;
    success: boolean;
    adaptations: string[];
    timestamp: Date;
  }[];
}

export interface CollectiveIntelligence {
  knowledgeBase: Map<string, AgentInsight>;
  strategyPatterns: Map<string, StrategyPattern>;
  crossAgentLearning: Map<string, string[]>; // agent -> learned from agents
  performanceCorrelations: Map<string, number>; // strategy -> success rate
  bestPractices: Map<string, string[]>; // category -> practices
}

export class AgentKnowledgeSharingService {
  private intelligence: CollectiveIntelligence;
  private learningThreshold = 0.8; // 80% success rate to consider sharing
  
  constructor() {
    this.intelligence = {
      knowledgeBase: new Map(),
      strategyPatterns: new Map(),
      crossAgentLearning: new Map(),
      performanceCorrelations: new Map(),
      bestPractices: new Map()
    };
    
    this.initializeFoundationalKnowledge();
  }

  /**
   * Initialize foundational knowledge base with Sandra's platform insights
   */
  private initializeFoundationalKnowledge(): void {
    // SSELFIE Platform Best Practices
    this.addBestPractice('design', [
      'Use Times New Roman typography for luxury editorial feel',
      'Maintain black/white/zinc color palette for sophistication',
      'Apply generous whitespace for editorial magazine layout',
      'Use spaced letter titles (T O T A L  U S E R S) for luxury branding',
      'Implement full-bleed hero images from authentic SSELFIE gallery'
    ]);

    this.addBestPractice('technical', [
      'Use TypeScript strict mode for type safety',
      'Implement proper error handling with try/catch blocks',
      'Create backup systems before major modifications',
      'Validate all modifications with pre/post verification',
      'Use Drizzle ORM for database operations'
    ]);

    this.addBestPractice('workflow', [
      'Coordinate with Elena for strategic oversight',
      'Test implementations in development before production',
      'Document all architectural changes in replit.md',
      'Follow file integration protocol for new components',
      'Maintain luxury standards throughout all implementations'
    ]);

    // Initialize proven strategy patterns
    this.createStrategyPattern({
      name: 'Luxury Component Creation',
      description: 'Create luxury UI components following SSELFIE design standards',
      category: 'design',
      steps: [
        'Analyze component requirements and luxury standards',
        'Create component with Times New Roman typography',
        'Implement black/white/zinc color scheme',
        'Add generous whitespace and editorial spacing',
        'Test component integration and responsiveness'
      ],
      requiredTools: ['str_replace_based_edit_tool', 'verification'],
      successCriteria: ['Luxury aesthetic achieved', 'Component integrates properly', 'Performance optimized'],
      recommendedFor: ['aria', 'victoria'],
      createdBy: 'aria'
    });

    this.createStrategyPattern({
      name: 'Enterprise Backend Development',
      description: 'Create scalable backend systems with proper architecture',
      category: 'technical',
      steps: [
        'Design API endpoints with proper TypeScript interfaces',
        'Implement service layer with business logic separation',
        'Add comprehensive error handling and validation',
        'Create database schemas with Drizzle ORM',
        'Test API endpoints and integration points'
      ],
      requiredTools: ['str_replace_based_edit_tool', 'comprehensive_agent_toolkit'],
      successCriteria: ['API endpoints functional', 'Error handling comprehensive', 'Performance optimized'],
      recommendedFor: ['zara', 'elena'],
      createdBy: 'zara'
    });
  }

  /**
   * Capture successful strategy from agent execution
   */
  captureAgentInsight(
    agentName: string,
    taskDetails: any,
    successMetrics: AgentInsight['successMetrics'],
    strategy: string[]
  ): void {
    const insight: AgentInsight = {
      id: `insight-${Date.now()}-${agentName}`,
      agentName,
      category: this.categorizeTask(taskDetails),
      title: `${agentName} ${taskDetails.type} Success Pattern`,
      description: `Successful approach for ${taskDetails.description}`,
      successMetrics,
      applicableAgents: this.determineApplicableAgents(agentName, taskDetails),
      tags: this.extractTags(taskDetails, strategy),
      createdAt: new Date(),
      usageCount: 0,
      effectiveness: this.calculateInitialEffectiveness(successMetrics)
    };

    this.intelligence.knowledgeBase.set(insight.id, insight);
    
    // Update cross-agent learning
    this.updateCrossAgentLearning(agentName, insight);
    
    console.log(`💡 KNOWLEDGE: Captured insight from ${agentName} - ${insight.title}`);
  }

  /**
   * Share successful strategies across agents
   */
  shareStrategyWithAgents(strategyId: string, targetAgents: string[]): string[] {
    const strategy = this.intelligence.strategyPatterns.get(strategyId);
    if (!strategy) return [];

    const sharedWith: string[] = [];

    targetAgents.forEach(agentName => {
      if (this.shouldShareStrategy(strategy, agentName)) {
        // Add to agent's learned strategies
        const learnedFrom = this.intelligence.crossAgentLearning.get(agentName) || [];
        if (!learnedFrom.includes(strategy.createdBy)) {
          learnedFrom.push(strategy.createdBy);
          this.intelligence.crossAgentLearning.set(agentName, learnedFrom);
          sharedWith.push(agentName);
        }
      }
    });

    console.log(`🤝 KNOWLEDGE: Shared strategy "${strategy.name}" with agents: ${sharedWith.join(', ')}`);
    return sharedWith;
  }

  /**
   * Get recommendations for agent based on task
   */
  getRecommendationsForAgent(agentName: string, taskType: string): {
    insights: AgentInsight[];
    strategies: StrategyPattern[];
    bestPractices: string[];
  } {
    // Find relevant insights
    const insights = Array.from(this.intelligence.knowledgeBase.values())
      .filter(insight => 
        insight.applicableAgents.includes(agentName) ||
        insight.category === this.categorizeTaskType(taskType)
      )
      .sort((a, b) => b.effectiveness - a.effectiveness)
      .slice(0, 5);

    // Find relevant strategies
    const strategies = Array.from(this.intelligence.strategyPatterns.values())
      .filter(strategy => 
        strategy.recommendedFor.includes(agentName) ||
        strategy.category === this.categorizeTaskType(taskType)
      )
      .sort((a, b) => b.averageSuccessRate - a.averageSuccessRate)
      .slice(0, 3);

    // Get best practices for task category
    const category = this.categorizeTaskType(taskType);
    const bestPractices = this.intelligence.bestPractices.get(category) || [];

    return { insights, strategies, bestPractices };
  }

  /**
   * Learn from cross-agent collaboration
   */
  learnFromCollaboration(
    collaboratingAgents: string[],
    taskResult: any,
    collaborationPatterns: string[]
  ): void {
    if (taskResult.success && collaboratingAgents.length > 1) {
      // Create collaborative strategy pattern
      const collaborationStrategy: StrategyPattern = {
        id: `collab-${Date.now()}`,
        name: `${collaboratingAgents.join('+')} Collaboration`,
        description: `Successful collaboration pattern between ${collaboratingAgents.join(', ')}`,
        category: 'workflow',
        steps: collaborationPatterns,
        requiredTools: ['coordination', 'communication'],
        successCriteria: ['Task completed successfully', 'Agents coordinated effectively'],
        averageSuccessRate: 85,
        recommendedFor: collaboratingAgents,
        createdBy: 'system',
        refinedBy: [],
        usageHistory: [{
          agentName: 'collaboration',
          taskId: taskResult.taskId,
          success: true,
          adaptations: [],
          timestamp: new Date()
        }]
      };

      this.intelligence.strategyPatterns.set(collaborationStrategy.id, collaborationStrategy);
      
      console.log(`🎯 KNOWLEDGE: Learned collaboration pattern: ${collaborationStrategy.name}`);
    }
  }

  /**
   * Update strategy effectiveness based on usage
   */
  updateStrategyEffectiveness(
    strategyId: string,
    agentName: string,
    taskId: string,
    success: boolean,
    adaptations: string[] = []
  ): void {
    const strategy = this.intelligence.strategyPatterns.get(strategyId);
    if (!strategy) return;

    // Add usage history
    strategy.usageHistory.push({
      agentName,
      taskId,
      success,
      adaptations,
      timestamp: new Date()
    });

    // Recalculate success rate
    const totalUsages = strategy.usageHistory.length;
    const successfulUsages = strategy.usageHistory.filter(h => h.success).length;
    strategy.averageSuccessRate = (successfulUsages / totalUsages) * 100;

    // Learn from adaptations
    if (adaptations.length > 0 && success) {
      adaptations.forEach(adaptation => {
        if (!strategy.steps.includes(adaptation)) {
          strategy.steps.push(adaptation);
          strategy.refinedBy.push(agentName);
        }
      });
    }

    console.log(`📊 KNOWLEDGE: Updated strategy effectiveness - ${strategy.name}: ${strategy.averageSuccessRate}%`);
  }

  /**
   * Get collective intelligence summary
   */
  getIntelligenceSummary(): any {
    const totalInsights = this.intelligence.knowledgeBase.size;
    const totalStrategies = this.intelligence.strategyPatterns.size;
    const avgEffectiveness = this.calculateAverageEffectiveness();
    const topPerformingAgents = this.getTopPerformingAgents();
    const knowledgeConnections = this.getKnowledgeConnections();

    return {
      metrics: {
        totalInsights,
        totalStrategies,
        avgEffectiveness,
        knowledgeConnections
      },
      topPerformingAgents,
      recentInsights: this.getRecentInsights(5),
      mostUsedStrategies: this.getMostUsedStrategies(3),
      crossAgentLearning: Object.fromEntries(this.intelligence.crossAgentLearning)
    };
  }

  // PRIVATE HELPER METHODS

  private categorizeTask(taskDetails: any): AgentInsight['category'] {
    if (taskDetails.type?.includes('design') || taskDetails.type?.includes('ui')) return 'design';
    if (taskDetails.type?.includes('backend') || taskDetails.type?.includes('api')) return 'technical';
    if (taskDetails.type?.includes('strategy') || taskDetails.type?.includes('planning')) return 'strategy';
    if (taskDetails.type?.includes('workflow') || taskDetails.type?.includes('process')) return 'workflow';
    if (taskDetails.type?.includes('quality') || taskDetails.type?.includes('testing')) return 'quality';
    return 'optimization';
  }

  private categorizeTaskType(taskType: string): string {
    if (taskType.includes('design') || taskType.includes('ui')) return 'design';
    if (taskType.includes('backend') || taskType.includes('api')) return 'technical';
    if (taskType.includes('strategy') || taskType.includes('planning')) return 'strategy';
    if (taskType.includes('workflow') || taskType.includes('process')) return 'workflow';
    if (taskType.includes('quality') || taskType.includes('testing')) return 'quality';
    return 'optimization';
  }

  private determineApplicableAgents(sourceAgent: string, taskDetails: any): string[] {
    const category = this.categorizeTask(taskDetails);
    const agentSpecializations: Record<string, string[]> = {
      'design': ['aria', 'victoria', 'maya'],
      'technical': ['zara', 'elena', 'olga'],
      'strategy': ['elena', 'diana', 'wilma'],
      'workflow': ['elena', 'ava', 'wilma'],
      'quality': ['quinn', 'elena'],
      'optimization': ['zara', 'ava', 'elena']
    };

    return agentSpecializations[category] || [];
  }

  private extractTags(taskDetails: any, strategy: string[]): string[] {
    const tags: string[] = [];
    const text = `${taskDetails.description} ${strategy.join(' ')}`.toLowerCase();
    
    const tagPatterns = {
      'luxury': ['luxury', 'editorial', 'chanel', 'sophisticated'],
      'performance': ['performance', 'optimization', 'speed', 'efficiency'],
      'scalability': ['scalable', 'enterprise', 'production'],
      'automation': ['automation', 'workflow', 'process'],
      'integration': ['integration', 'coordination', 'collaboration']
    };

    Object.entries(tagPatterns).forEach(([tag, patterns]) => {
      if (patterns.some(pattern => text.includes(pattern))) {
        tags.push(tag);
      }
    });

    return tags;
  }

  private calculateInitialEffectiveness(metrics: AgentInsight['successMetrics']): number {
    return (metrics.qualityScore + metrics.userSatisfaction) / 2;
  }

  private updateCrossAgentLearning(agentName: string, insight: AgentInsight): void {
    insight.applicableAgents.forEach(targetAgent => {
      if (targetAgent !== agentName) {
        const learned = this.intelligence.crossAgentLearning.get(targetAgent) || [];
        if (!learned.includes(agentName)) {
          learned.push(agentName);
          this.intelligence.crossAgentLearning.set(targetAgent, learned);
        }
      }
    });
  }

  private shouldShareStrategy(strategy: StrategyPattern, agentName: string): boolean {
    return strategy.averageSuccessRate >= this.learningThreshold &&
           strategy.recommendedFor.includes(agentName);
  }

  private createStrategyPattern(pattern: Omit<StrategyPattern, 'id' | 'averageSuccessRate' | 'refinedBy' | 'usageHistory'>): void {
    const strategyPattern: StrategyPattern = {
      ...pattern,
      id: `strategy-${Date.now()}`,
      averageSuccessRate: 85, // Initial baseline
      refinedBy: [],
      usageHistory: []
    };

    this.intelligence.strategyPatterns.set(strategyPattern.id, strategyPattern);
  }

  private addBestPractice(category: string, practices: string[]): void {
    this.intelligence.bestPractices.set(category, practices);
  }

  private calculateAverageEffectiveness(): number {
    const insights = Array.from(this.intelligence.knowledgeBase.values());
    if (insights.length === 0) return 0;
    
    return insights.reduce((sum, insight) => sum + insight.effectiveness, 0) / insights.length;
  }

  private getTopPerformingAgents(): string[] {
    const agentPerformance = new Map<string, number>();
    
    Array.from(this.intelligence.knowledgeBase.values()).forEach(insight => {
      const current = agentPerformance.get(insight.agentName) || 0;
      agentPerformance.set(insight.agentName, current + insight.effectiveness);
    });

    return Array.from(agentPerformance.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([agent]) => agent);
  }

  private getKnowledgeConnections(): number {
    return Array.from(this.intelligence.crossAgentLearning.values())
      .reduce((total, connections) => total + connections.length, 0);
  }

  private getRecentInsights(count: number): AgentInsight[] {
    return Array.from(this.intelligence.knowledgeBase.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, count);
  }

  private getMostUsedStrategies(count: number): StrategyPattern[] {
    return Array.from(this.intelligence.strategyPatterns.values())
      .sort((a, b) => b.usageHistory.length - a.usageHistory.length)
      .slice(0, count);
  }
}

// Export singleton instance
export const agentKnowledgeSharing = new AgentKnowledgeSharingService();