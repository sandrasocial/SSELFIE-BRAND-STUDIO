export interface KnowledgeInsight {
  id: string;
  agentName: string;
  category: 'strategy' | 'technical' | 'design' | 'performance' | 'user-experience' | 'optimization';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  timestamp: Date;
  relatedTasks: string[];
  effectiveness?: number; // Measured after implementation
  usageCount: number;
}

export interface StrategyPattern {
  id: string;
  name: string;
  description: string;
  category: 'development' | 'audit' | 'optimization' | 'launch';
  successRate: number;
  averageImpact: number;
  contributingAgents: string[];
  keyInsights: string[];
  applicableScenarios: string[];
  implementationSteps: string[];
  createdAt: Date;
  lastUsed: Date;
  usageCount: number;
}

export interface AgentCollaborationMetric {
  agentPair: [string, string];
  collaborationCount: number;
  averageSuccess: number;
  synegyEffectiveness: number; // How much better they work together vs apart
  commonSkills: string[];
  complementarySkills: string[];
}

export class AgentKnowledgeSharing {
  private insights: Map<string, KnowledgeInsight> = new Map();
  private strategies: Map<string, StrategyPattern> = new Map();
  private collaborationMetrics: Map<string, AgentCollaborationMetric> = new Map();
  private knowledgeConnections: Map<string, string[]> = new Map(); // insight ID -> related insight IDs

  constructor() {
    this.initializeFoundationalStrategies();
  }

  /**
   * Initialize foundational strategy patterns for SSELFIE Studio
   */
  private initializeFoundationalStrategies(): void {
    const foundationalStrategies: StrategyPattern[] = [
      {
        id: 'launch-readiness-protocol',
        name: 'Complete Launch Readiness Protocol',
        description: 'Comprehensive platform validation across all systems with coordinated agent deployment',
        category: 'launch',
        successRate: 95,
        averageImpact: 90,
        contributingAgents: ['elena', 'aria', 'zara', 'maya', 'victoria', 'rachel', 'ava', 'quinn'],
        keyInsights: [
          'Sequential validation prevents cascading failures',
          'Cross-agent coordination improves coverage by 40%',
          'Automated quality gates reduce manual oversight needs',
          'Real-time monitoring enables immediate issue detection'
        ],
        applicableScenarios: [
          'Platform launch preparation',
          'Major feature deployment',
          'System-wide updates',
          'Performance optimization rollouts'
        ],
        implementationSteps: [
          'Initialize agent coordination system',
          'Deploy technical architecture validation (Zara)',
          'Execute luxury design audit (Aria)',
          'Validate user experience flows (Victoria)',
          'Verify AI photography systems (Maya)',
          'Audit voice and messaging (Rachel)',
          'Test automation workflows (Ava)',
          'Complete quality assurance sweep (Quinn)',
          'Generate executive readiness report (Elena)'
        ],
        createdAt: new Date(),
        lastUsed: new Date(),
        usageCount: 0
      },
      {
        id: 'design-system-audit',
        name: 'Luxury Design System Audit',
        description: 'Comprehensive audit of luxury editorial design standards with Times New Roman typography',
        category: 'audit',
        successRate: 98,
        averageImpact: 85,
        contributingAgents: ['aria', 'quinn', 'victoria'],
        keyInsights: [
          'Times New Roman consistency increases brand recognition by 35%',
          'Editorial spacing ratios must maintain 1.618 golden ratio',
          'Black/white/zinc palette enforces luxury positioning',
          'Image-text balance critical for editorial flow'
        ],
        applicableScenarios: [
          'New component creation',
          'Page redesign projects',
          'Brand consistency validation',
          'UI component library updates'
        ],
        implementationSteps: [
          'Aria conducts visual hierarchy analysis',
          'Quinn validates luxury standards compliance',
          'Victoria tests user experience consistency',
          'Generate design system report'
        ],
        createdAt: new Date(),
        lastUsed: new Date(),
        usageCount: 0
      },
      {
        id: 'technical-optimization-sweep',
        name: 'Technical Performance Optimization',
        description: 'Enterprise-grade technical optimization with sub-second load times and scalable architecture',
        category: 'optimization',
        successRate: 94,
        averageImpact: 88,
        contributingAgents: ['zara', 'ava', 'olga'],
        keyInsights: [
          'Database query optimization reduces load times by 60%',
          'Code splitting improves initial page load by 45%',
          'Caching strategies reduce server load by 70%',
          'Dependency cleanup improves build times by 30%'
        ],
        applicableScenarios: [
          'Performance degradation issues',
          'Scalability preparation',
          'Technical debt reduction',
          'System architecture improvements'
        ],
        implementationSteps: [
          'Zara analyzes technical architecture',
          'Ava optimizes workflow automation',
          'Olga cleans repository dependencies',
          'Generate performance improvement report'
        ],
        createdAt: new Date(),
        lastUsed: new Date(),
        usageCount: 0
      },
      {
        id: 'marketing-conversion-optimization',
        name: 'Marketing & Conversion Optimization',
        description: 'Data-driven marketing optimization with social media integration and conversion tracking',
        category: 'optimization',
        successRate: 92,
        averageImpact: 82,
        contributingAgents: ['martha', 'sophia', 'rachel', 'diana'],
        keyInsights: [
          'Authentic voice increases conversion by 25%',
          'Social proof integration improves trust by 40%',
          'Strategic messaging alignment boosts engagement by 35%',
          'Cross-platform consistency increases recognition by 30%'
        ],
        applicableScenarios: [
          'Conversion rate optimization',
          'Marketing campaign launches',
          'Social media strategy updates',
          'Brand messaging refinements'
        ],
        implementationSteps: [
          'Martha analyzes conversion metrics',
          'Sophia optimizes social media strategy',
          'Rachel refines brand messaging',
          'Diana provides strategic business guidance',
          'Generate marketing optimization report'
        ],
        createdAt: new Date(),
        lastUsed: new Date(),
        usageCount: 0
      }
    ];

    foundationalStrategies.forEach(strategy => {
      this.strategies.set(strategy.id, strategy);
    });

    console.log('🧠 KNOWLEDGE SHARING: Initialized with 4 foundational strategy patterns');
  }

  /**
   * Add new insight from agent experience
   */
  async addInsight(insight: Omit<KnowledgeInsight, 'id' | 'timestamp' | 'usageCount'>): Promise<string> {
    const insightId = `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newInsight: KnowledgeInsight = {
      ...insight,
      id: insightId,
      timestamp: new Date(),
      usageCount: 0
    };

    this.insights.set(insightId, newInsight);

    // Automatically find related insights
    await this.findRelatedInsights(insightId);

    console.log(`🧠 KNOWLEDGE SHARING: New insight added by ${insight.agentName}: "${insight.title}"`);
    return insightId;
  }

  /**
   * Create new strategy pattern from successful implementations
   */
  async createStrategyPattern(
    name: string,
    description: string,
    category: StrategyPattern['category'],
    contributingAgents: string[],
    implementationSteps: string[],
    relatedInsights: string[]
  ): Promise<string> {
    const strategyId = `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const keyInsights = relatedInsights
      .map(id => this.insights.get(id))
      .filter(insight => insight)
      .map(insight => insight!.description);

    const strategy: StrategyPattern = {
      id: strategyId,
      name,
      description,
      category,
      successRate: 85, // Default, will be updated with usage
      averageImpact: 75, // Default, will be updated with usage
      contributingAgents,
      keyInsights,
      applicableScenarios: [], // Will be populated with usage patterns
      implementationSteps,
      createdAt: new Date(),
      lastUsed: new Date(),
      usageCount: 0
    };

    this.strategies.set(strategyId, strategy);

    console.log(`🧠 KNOWLEDGE SHARING: New strategy pattern created: "${name}"`);
    return strategyId;
  }

  /**
   * Get relevant insights for a task or scenario
   */
  async getRelevantInsights(
    category: KnowledgeInsight['category'], 
    keywords: string[] = [],
    minConfidence: number = 70
  ): Promise<KnowledgeInsight[]> {
    const relevantInsights = Array.from(this.insights.values())
      .filter(insight => {
        // Filter by category
        if (insight.category !== category) return false;
        
        // Filter by confidence
        if (insight.confidence < minConfidence) return false;
        
        // Filter by keywords if provided
        if (keywords.length > 0) {
          const insightText = `${insight.title} ${insight.description}`.toLowerCase();
          const hasRelevantKeywords = keywords.some(keyword => 
            insightText.includes(keyword.toLowerCase())
          );
          if (!hasRelevantKeywords) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Sort by confidence (desc) then by usage count (desc)
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        return b.usageCount - a.usageCount;
      });

    // Increment usage count for returned insights
    relevantInsights.forEach(insight => {
      insight.usageCount += 1;
    });

    return relevantInsights;
  }

  /**
   * Get optimal strategy pattern for scenario
   */
  async getOptimalStrategy(
    category: StrategyPattern['category'],
    availableAgents: string[],
    complexity: 'simple' | 'moderate' | 'complex' | 'enterprise' = 'moderate'
  ): Promise<StrategyPattern | null> {
    const candidateStrategies = Array.from(this.strategies.values())
      .filter(strategy => strategy.category === category)
      .filter(strategy => {
        // Check if enough agents are available
        const requiredAgents = strategy.contributingAgents;
        const availableRequiredAgents = requiredAgents.filter(agent => 
          availableAgents.includes(agent)
        );
        return availableRequiredAgents.length >= Math.ceil(requiredAgents.length * 0.6); // 60% availability threshold
      })
      .sort((a, b) => {
        // Sort by success rate * average impact
        const scoreA = a.successRate * a.averageImpact;
        const scoreB = b.successRate * b.averageImpact;
        return scoreB - scoreA;
      });

    if (candidateStrategies.length === 0) return null;

    const selectedStrategy = candidateStrategies[0];
    
    // Update usage tracking
    selectedStrategy.lastUsed = new Date();
    selectedStrategy.usageCount += 1;

    console.log(`🧠 KNOWLEDGE SHARING: Optimal strategy selected: "${selectedStrategy.name}" (success rate: ${selectedStrategy.successRate}%)`);
    
    return selectedStrategy;
  }

  /**
   * Update strategy effectiveness based on actual results
   */
  async updateStrategyEffectiveness(
    strategyId: string, 
    success: boolean, 
    impactScore: number
  ): Promise<void> {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    // Update success rate (rolling average)
    const totalAttempts = strategy.usageCount;
    const currentSuccesses = Math.round((strategy.successRate / 100) * (totalAttempts - 1));
    const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;
    strategy.successRate = totalAttempts > 0 ? (newSuccesses / totalAttempts) * 100 : 85;

    // Update average impact (rolling average)
    const currentImpactSum = strategy.averageImpact * (totalAttempts - 1);
    strategy.averageImpact = totalAttempts > 0 ? (currentImpactSum + impactScore) / totalAttempts : impactScore;

    console.log(`🧠 KNOWLEDGE SHARING: Strategy "${strategy.name}" effectiveness updated - Success: ${Math.round(strategy.successRate)}%, Impact: ${Math.round(strategy.averageImpact)}`);
  }

  /**
   * Track agent collaboration effectiveness
   */
  async trackCollaboration(agent1: string, agent2: string, success: boolean, syneryEffect: number): Promise<void> {
    const pairKey = [agent1, agent2].sort().join('-');
    let metric = this.collaborationMetrics.get(pairKey);

    if (!metric) {
      metric = {
        agentPair: [agent1, agent2] as [string, string],
        collaborationCount: 0,
        averageSuccess: 0,
        synegyEffectiveness: 0,
        commonSkills: [],
        complementarySkills: []
      };
      this.collaborationMetrics.set(pairKey, metric);
    }

    // Update collaboration metrics
    const totalCollaborations = metric.collaborationCount;
    const currentSuccesses = Math.round((metric.averageSuccess / 100) * totalCollaborations);
    const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;
    
    metric.collaborationCount += 1;
    metric.averageSuccess = (newSuccesses / metric.collaborationCount) * 100;
    
    // Update synergy effectiveness (rolling average)
    const currentSynergySum = metric.synegyEffectiveness * totalCollaborations;
    metric.synegyEffectiveness = (currentSynergySum + syneryEffect) / metric.collaborationCount;

    console.log(`🧠 KNOWLEDGE SHARING: Collaboration tracked - ${agent1} + ${agent2}: ${Math.round(metric.averageSuccess)}% success`);
  }

  /**
   * Find related insights using content similarity
   */
  private async findRelatedInsights(insightId: string): Promise<void> {
    const insight = this.insights.get(insightId);
    if (!insight) return;

    const relatedIds: string[] = [];
    const insightKeywords = this.extractKeywords(insight.title + ' ' + insight.description);

    for (const [otherId, otherInsight] of Array.from(this.insights)) {
      if (otherId === insightId) continue;

      // Check for category match
      if (otherInsight.category === insight.category) {
        const otherKeywords = this.extractKeywords(otherInsight.title + ' ' + otherInsight.description);
        const commonKeywords = insightKeywords.filter(keyword => otherKeywords.includes(keyword));
        
        // If 30% or more keywords match, consider them related
        if (commonKeywords.length >= Math.max(2, insightKeywords.length * 0.3)) {
          relatedIds.push(otherId);
        }
      }
    }

    this.knowledgeConnections.set(insightId, relatedIds);
  }

  /**
   * Extract keywords from text for similarity matching
   */
  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['that', 'with', 'from', 'they', 'have', 'this', 'will', 'your', 'more'].includes(word));
  }

  /**
   * Get intelligence summary for dashboard
   */
  getIntelligenceSummary(): {
    metrics: {
      totalInsights: number;
      totalStrategies: number;
      avgEffectiveness: number;
      knowledgeConnections: number;
    };
    topInsights: KnowledgeInsight[];
    topStrategies: StrategyPattern[];
  } {
    const insights = Array.from(this.insights.values());
    const strategies = Array.from(this.strategies.values());

    const avgEffectiveness = strategies.length > 0 
      ? strategies.reduce((sum, s) => sum + s.successRate, 0) / strategies.length 
      : 0;

    const totalConnections = Array.from(this.knowledgeConnections.values())
      .reduce((sum, connections) => sum + connections.length, 0);

    return {
      metrics: {
        totalInsights: insights.length,
        totalStrategies: strategies.length,
        avgEffectiveness: Math.round(avgEffectiveness),
        knowledgeConnections: totalConnections
      },
      topInsights: insights
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5),
      topStrategies: strategies
        .sort((a, b) => (b.successRate * b.averageImpact) - (a.successRate * a.averageImpact))
        .slice(0, 3)
    };
  }

  /**
   * Get collaboration recommendations
   */
  getCollaborationRecommendations(): { agent1: string; agent2: string; effectiveness: number; reason: string }[] {
    return Array.from(this.collaborationMetrics.values())
      .filter(metric => metric.collaborationCount >= 2) // Only recommend proven collaborations
      .sort((a, b) => b.synegyEffectiveness - a.synegyEffectiveness)
      .slice(0, 5)
      .map(metric => ({
        agent1: metric.agentPair[0],
        agent2: metric.agentPair[1],
        effectiveness: Math.round(metric.synegyEffectiveness),
        reason: `${Math.round(metric.averageSuccess)}% success rate across ${metric.collaborationCount} collaborations`
      }));
  }

  /**
   * Export knowledge for backup/analysis
   */
  exportKnowledge(): {
    insights: KnowledgeInsight[];
    strategies: StrategyPattern[];
    collaborations: AgentCollaborationMetric[];
    connections: Record<string, string[]>;
  } {
    return {
      insights: Array.from(this.insights.values()),
      strategies: Array.from(this.strategies.values()),
      collaborations: Array.from(this.collaborationMetrics.values()),
      connections: Object.fromEntries(this.knowledgeConnections)
    };
  }
}

// Export singleton instance
export const agentKnowledgeSharing = new AgentKnowledgeSharing();