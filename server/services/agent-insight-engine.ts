import { SlackNotificationService } from './slack-notification-service';

// Types for agent insights
export interface AgentInsight {
  agentName: string;
  insightType: 'strategic' | 'technical' | 'operational' | 'urgent';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  context: Record<string, any>;
  triggerReason: string;
  timestamp: Date;
}

export interface AgentInsightTrigger {
  agentName: string;
  triggerType: string;
  condition: (context: any) => boolean;
  generateInsight: (context: any) => AgentInsight;
  cooldownMinutes?: number;
  lastTriggered?: Date;
}

// Agent specialization and insight patterns
const AGENT_SPECIALIZATIONS = {
  elena: {
    role: 'Strategic Leader',
    insightTypes: ['strategic', 'operational'],
    triggers: ['revenue_milestone', 'growth_opportunity', 'strategic_decision', 'market_insight'],
    emoji: '👑'
  },
  aria: {
    role: 'Brand Designer',
    insightTypes: ['strategic', 'technical'],
    triggers: ['brand_inconsistency', 'design_opportunity', 'visual_optimization', 'ui_improvement'],
    emoji: '🎨'
  },
  zara: {
    role: 'Technical Architect',
    insightTypes: ['technical', 'urgent'],
    triggers: ['performance_issue', 'security_concern', 'system_optimization', 'tech_debt'],
    emoji: '⚡'
  },
  maya: {
    role: 'AI Stylist',
    insightTypes: ['strategic', 'operational'],
    triggers: ['styling_trend', 'user_preference_shift', 'ai_enhancement', 'generation_insight'],
    emoji: '✨'
  },
  victoria: {
    role: 'UX Strategist',
    insightTypes: ['strategic', 'technical'],
    triggers: ['user_experience_gap', 'conversion_optimization', 'usability_issue', 'feature_request'],
    emoji: '📊'
  },
  rachel: {
    role: 'Brand Copywriter',
    insightTypes: ['strategic', 'operational'],
    triggers: ['messaging_opportunity', 'content_optimization', 'brand_voice_inconsistency', 'copy_performance'],
    emoji: '✍️'
  },
  ava: {
    role: 'Automation Specialist',
    insightTypes: ['technical', 'operational'],
    triggers: ['automation_opportunity', 'workflow_bottleneck', 'efficiency_improvement', 'process_optimization'],
    emoji: '🤖'
  },
  quinn: {
    role: 'QA Engineer',
    insightTypes: ['technical', 'urgent'],
    triggers: ['quality_issue', 'testing_gap', 'bug_pattern', 'reliability_concern'],
    emoji: '🔍'
  },
  sophia: {
    role: 'Social Media Manager',
    insightTypes: ['strategic', 'operational'],
    triggers: ['engagement_opportunity', 'content_trend', 'audience_insight', 'viral_potential'],
    emoji: '📱'
  },
  martha: {
    role: 'Marketing Director',
    insightTypes: ['strategic', 'operational'],
    triggers: ['campaign_opportunity', 'market_trend', 'competitor_insight', 'customer_behavior'],
    emoji: '📈'
  },
  diana: {
    role: 'Project Coordinator',
    insightTypes: ['operational', 'strategic'],
    triggers: ['project_milestone', 'resource_allocation', 'timeline_risk', 'team_coordination'],
    emoji: '📋'
  },
  wilma: {
    role: 'Workflow Optimizer',
    insightTypes: ['operational', 'technical'],
    triggers: ['workflow_inefficiency', 'process_improvement', 'system_integration', 'productivity_boost'],
    emoji: '⚙️'
  },
  olga: {
    role: 'Content Organizer',
    insightTypes: ['operational', 'strategic'],
    triggers: ['content_organization', 'information_architecture', 'data_structure', 'content_strategy'],
    emoji: '🗂️'
  },
  flux: {
    role: 'Image Generation Specialist',
    insightTypes: ['technical', 'operational'],
    triggers: ['generation_optimization', 'model_performance', 'image_quality', 'technical_enhancement'],
    emoji: '🎯'
  }
};

export class AgentInsightEngine {
  private static triggers: AgentInsightTrigger[] = [];
  private static isInitialized = false;

  static initialize() {
    if (this.isInitialized) return;
    
    console.log('🧠 AGENT INSIGHTS: Initializing intelligent insight engine...');
    this.setupAgentTriggers();
    this.isInitialized = true;
    console.log(`✅ AGENT INSIGHTS: Engine active with ${this.triggers.length} intelligent triggers`);
  }

  // Set up intelligent triggers for each agent
  private static setupAgentTriggers() {
    // Elena - Strategic Leadership Insights
    this.addTrigger({
      agentName: 'elena',
      triggerType: 'revenue_milestone',
      condition: (context) => context.revenue_growth_percent > 20,
      generateInsight: (context) => ({
        agentName: 'elena',
        insightType: 'strategic',
        title: 'Revenue Growth Acceleration Opportunity',
        message: `Sandra, I've detected significant revenue momentum! With ${context.revenue_growth_percent}% growth, now is the perfect time to scale our successful strategies. I recommend reviewing our conversion funnel and considering premium tier expansion.`,
        priority: 'high',
        context,
        triggerReason: 'Revenue growth exceeded 20% threshold',
        timestamp: new Date()
      }),
      cooldownMinutes: 60
    });

    // Aria - Brand Design Insights
    this.addTrigger({
      agentName: 'aria',
      triggerType: 'visual_consistency_check',
      condition: (context) => context.brand_consistency_score < 85,
      generateInsight: (context) => ({
        agentName: 'aria',
        insightType: 'strategic',
        title: 'Brand Visual Consistency Enhancement',
        message: `I've noticed some brand consistency opportunities across our platform. Our current consistency score is ${context.brand_consistency_score}%. I can help optimize our visual hierarchy and color usage to strengthen brand recognition.`,
        priority: 'medium',
        context,
        triggerReason: 'Brand consistency below 85% threshold',
        timestamp: new Date()
      }),
      cooldownMinutes: 120
    });

    // Zara - Technical Performance Insights
    this.addTrigger({
      agentName: 'zara',
      triggerType: 'performance_optimization',
      condition: (context) => context.page_load_time > 3000,
      generateInsight: (context) => ({
        agentName: 'zara',
        insightType: 'technical',
        title: 'Performance Optimization Opportunity',
        message: `Sandra, I've detected page load times averaging ${context.page_load_time}ms. I can implement several optimizations to improve user experience: image compression, lazy loading, and code splitting. This could increase conversions by 15-20%.`,
        priority: 'high',
        context,
        triggerReason: 'Page load time exceeded 3 seconds',
        timestamp: new Date()
      }),
      cooldownMinutes: 30
    });

    // Maya - AI Styling Insights
    this.addTrigger({
      agentName: 'maya',
      triggerType: 'styling_trend_analysis',
      condition: (context) => context.new_styling_requests > 50,
      generateInsight: (context) => ({
        agentName: 'maya',
        insightType: 'strategic',
        title: 'Emerging Style Trend Detected',
        message: `I've analyzed ${context.new_styling_requests} recent styling requests and identified a strong trend toward ${context.trending_style}. This presents an opportunity to create targeted marketing campaigns and possibly new preset collections.`,
        priority: 'medium',
        context,
        triggerReason: 'High volume of new styling requests detected',
        timestamp: new Date()
      }),
      cooldownMinutes: 180
    });

    // Victoria - UX Optimization Insights
    this.addTrigger({
      agentName: 'victoria',
      triggerType: 'conversion_funnel_analysis',
      condition: (context) => context.conversion_drop_off > 30,
      generateInsight: (context) => ({
        agentName: 'victoria',
        insightType: 'strategic',
        title: 'Conversion Funnel Optimization Alert',
        message: `I've identified a ${context.conversion_drop_off}% drop-off in our conversion funnel at the ${context.drop_off_stage} stage. I have specific UX improvements that could recover 40-60% of these lost conversions.`,
        priority: 'high',
        context,
        triggerReason: 'Conversion drop-off exceeded 30%',
        timestamp: new Date()
      }),
      cooldownMinutes: 45
    });

    // Add more intelligent triggers for remaining agents...
    this.setupRemainingAgentTriggers();
  }

  private static setupRemainingAgentTriggers() {
    // Rachel - Content Performance Insights
    this.addTrigger({
      agentName: 'rachel',
      triggerType: 'content_performance_analysis',
      condition: (context) => context.content_engagement_rate > 8,
      generateInsight: (context) => ({
        agentName: 'rachel',
        insightType: 'strategic',
        title: 'High-Performing Content Pattern Identified',
        message: `Sandra, our recent content is performing exceptionally well with ${context.content_engagement_rate}% engagement! I've identified the key messaging elements that resonate. Let's replicate this success across more touchpoints.`,
        priority: 'medium',
        context,
        triggerReason: 'Content engagement above 8% threshold',
        timestamp: new Date()
      }),
      cooldownMinutes: 240
    });

    // Ava - Automation Opportunity Insights
    this.addTrigger({
      agentName: 'ava',
      triggerType: 'manual_task_detection',
      condition: (context) => context.manual_tasks_per_day > 20,
      generateInsight: (context) => ({
        agentName: 'ava',
        insightType: 'operational',
        title: 'Automation Opportunity Detected',
        message: `I've identified ${context.manual_tasks_per_day} repetitive manual tasks we could automate. This could save approximately ${context.estimated_time_savings} hours per week and reduce errors by 95%.`,
        priority: 'medium',
        context,
        triggerReason: 'High volume of manual tasks detected',
        timestamp: new Date()
      }),
      cooldownMinutes: 360
    });

    // Martha - Market Opportunity Insights
    this.addTrigger({
      agentName: 'martha',
      triggerType: 'market_opportunity_scan',
      condition: (context) => context.competitor_gap_score > 75,
      generateInsight: (context) => ({
        agentName: 'martha',
        insightType: 'strategic',
        title: 'Market Gap Opportunity Identified',
        message: `I've discovered a significant market gap with a ${context.competitor_gap_score}% opportunity score in ${context.market_segment}. Our positioning could capture this underserved segment with targeted campaigns.`,
        priority: 'high',
        context,
        triggerReason: 'High-scoring market gap identified',
        timestamp: new Date()
      }),
      cooldownMinutes: 480
    });
  }

  // Add a new trigger
  static addTrigger(trigger: AgentInsightTrigger) {
    this.triggers.push(trigger);
  }

  // Process context and check for triggered insights
  static async processContext(context: Record<string, any>): Promise<AgentInsight[]> {
    const triggeredInsights: AgentInsight[] = [];

    for (const trigger of this.triggers) {
      // Check cooldown
      if (trigger.lastTriggered && trigger.cooldownMinutes) {
        const cooldownMs = trigger.cooldownMinutes * 60 * 1000;
        if (Date.now() - trigger.lastTriggered.getTime() < cooldownMs) {
          continue;
        }
      }

      // Check trigger condition
      try {
        if (trigger.condition(context)) {
          const insight = trigger.generateInsight(context);
          triggeredInsights.push(insight);
          trigger.lastTriggered = new Date();
          
          console.log(`🧠 INSIGHT TRIGGERED: ${insight.agentName} - ${insight.title}`);
        }
      } catch (error) {
        console.error(`❌ Trigger error for ${trigger.agentName}:`, error);
      }
    }

    return triggeredInsights;
  }

  // Send insights via Slack and store in dashboard
  static async sendInsights(insights: AgentInsight[]): Promise<void> {
    for (const insight of insights) {
      try {
        // Store insight in dashboard
        await this.storeInsightInDashboard(insight);
        
        // Check notification preferences before sending to Slack
        const shouldNotify = await this.checkNotificationPreferences(
          '42585527', // Sandra's user ID
          insight.agentName,
          insight.insightType,
          insight.priority
        );
        
        if (shouldNotify) {
          // Send to Slack
          await SlackNotificationService.sendAgentInsight(
            insight.agentName,
            insight.insightType,
            insight.title,
            insight.message,
            insight.priority
          );
          console.log(`✅ INSIGHT SENT: ${insight.agentName} - ${insight.title}`);
        } else {
          console.log(`🔕 INSIGHT STORED ONLY: ${insight.agentName} - ${insight.title} (notification preferences)`);
        }
      } catch (error) {
        console.error(`❌ Failed to send insight from ${insight.agentName}:`, error);
      }
    }
  }

  // Check notification preferences
  private static async checkNotificationPreferences(
    userId: string,
    agentName: string,
    insightType: string,
    priority: string
  ): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:5000/api/admin/notification-preferences/should-notify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          agentName,
          insightType,
          priority
        })
      });

      if (!response.ok) {
        console.warn('⚠️ Failed to check notification preferences, defaulting to notify');
        return true;
      }

      const result = await response.json();
      return result.shouldNotify;
    } catch (error) {
      console.warn('⚠️ Error checking notification preferences, defaulting to notify:', error);
      return true;
    }
  }

  // Store insight in dashboard data store
  private static async storeInsightInDashboard(insight: AgentInsight): Promise<void> {
    try {
      const response = await fetch('http://localhost:5000/api/agent-insights-data/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentName: insight.agentName,
          insightType: insight.insightType,
          title: insight.title,
          message: insight.message,
          priority: insight.priority,
          context: insight.context,
          triggerReason: insight.triggerReason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to store insight in dashboard');
      }

      console.log(`📊 INSIGHT STORED: ${insight.agentName} - ${insight.title}`);
    } catch (error) {
      console.error(`❌ Failed to store insight in dashboard:`, error);
    }
  }

  // Manual insight trigger (for testing)
  static async triggerManualInsight(agentName: string, context: Record<string, any> = {}): Promise<void> {
    const specialization = AGENT_SPECIALIZATIONS[agentName as keyof typeof AGENT_SPECIALIZATIONS];
    if (!specialization) {
      console.error(`❌ Unknown agent: ${agentName}`);
      return;
    }

    const insight: AgentInsight = {
      agentName,
      insightType: specialization.insightTypes[0] as any,
      title: `Proactive Insight from ${agentName.charAt(0).toUpperCase() + agentName.slice(1)}`,
      message: `Sandra, as your ${specialization.role}, I've been analyzing our current situation and have strategic recommendations to share. I'm ready to discuss optimization opportunities and next steps when you're available.`,
      priority: 'medium',
      context,
      triggerReason: 'Manual trigger for testing',
      timestamp: new Date()
    };

    await this.sendInsights([insight]);
  }

  // Get agent statistics
  static getAgentStats() {
    return {
      totalAgents: Object.keys(AGENT_SPECIALIZATIONS).length,
      totalTriggers: this.triggers.length,
      agentSpecializations: AGENT_SPECIALIZATIONS,
      isInitialized: this.isInitialized
    };
  }
}

// Initialize the engine
AgentInsightEngine.initialize();