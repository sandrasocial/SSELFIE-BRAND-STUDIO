/**
 * PREDICTIVE INTELLIGENCE SYSTEM
 * Makes SSELFIE Studio agents proactive like Replit AI by anticipating next steps
 */

import { db } from '../../db';
import { eq, desc, and } from 'drizzle-orm';
import { claudeConversations, claudeMessages } from '@shared/schema';

interface UserPattern {
  userId: string;
  commonWorkflows: string[];
  preferredAgents: string[];
  typicalTaskSequences: TaskSequence[];
  workingHours: string[];
  projectPhases: ProjectPhase[];
  recentContext: string;
}

interface TaskSequence {
  sequence: string[];
  frequency: number;
  lastUsed: Date;
  context: string;
}

interface ProjectPhase {
  phase: string;
  typicalNextSteps: string[];
  associatedAgents: string[];
  estimatedDuration: string;
}

interface PredictiveInsight {
  type: 'NEXT_TASK' | 'WORKFLOW_SUGGESTION' | 'AGENT_RECOMMENDATION' | 'PROACTIVE_ACTION';
  confidence: number;
  suggestion: string;
  reasoning: string;
  agentId?: string;
  estimatedTime?: string;
  requiredTools?: string[];
}

export class PredictiveIntelligenceSystem {
  /**
   * ANALYZE USER PATTERNS - Core pattern recognition like Replit AI
   */
  static async analyzeUserPatterns(userId: string): Promise<UserPattern> {
    console.log(`🧠 PREDICTIVE: Analyzing patterns for user ${userId}`);
    
    try {
      // Get recent conversation history (last 50 messages)
      const recentMessages = await db
        .select()
        .from(claudeMessages)
        .innerJoin(claudeConversations, eq(claudeMessages.conversationId, claudeConversations.conversationId))
        .where(eq(claudeConversations.userId, userId))
        .orderBy(desc(claudeMessages.timestamp))
        .limit(50);

      const agentUsage = new Map<string, number>();
      const taskPatterns: string[] = [];
      const workflowSequences: TaskSequence[] = [];
      let recentContext = '';

      // Analyze agent preferences and task patterns
      recentMessages.forEach((msg: any, index: number) => {
        const agentId = msg.claudeConversations.agentName;
        const message = msg.claudeMessages.content;
        const response = msg.claudeMessages.role === 'assistant' ? msg.claudeMessages.content : '';

        // Track agent usage frequency
        agentUsage.set(agentId, (agentUsage.get(agentId) || 0) + 1);

        // Extract task patterns from messages
        if (message) {
          const taskKeywords = this.extractTaskKeywords(message);
          taskPatterns.push(...taskKeywords);
        }

        // Build context from recent conversations
        if (index < 5) {
          recentContext += `${agentId}: ${message} -> ${response?.substring(0, 100)}... `;
        }
      });

      // Identify common workflows
      const commonWorkflows = this.identifyWorkflows(taskPatterns);
      
      // Get preferred agents (top 5 most used)
      const preferredAgents = Array.from(agentUsage.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([agent]) => agent);

      // Analyze task sequences  
      const typicalTaskSequences = this.analyzeTaskSequences(recentMessages);

      // Determine current project phase
      const projectPhases = this.identifyProjectPhases(recentContext, taskPatterns);

      return {
        userId,
        commonWorkflows,
        preferredAgents,
        typicalTaskSequences,
        workingHours: [], // Could be enhanced with timestamp analysis
        projectPhases,
        recentContext: recentContext.substring(0, 500)
      };

    } catch (error) {
      console.error('❌ Pattern analysis failed:', error);
      return {
        userId,
        commonWorkflows: [],
        preferredAgents: [],
        typicalTaskSequences: [],
        workingHours: [],
        projectPhases: [],
        recentContext: ''
      };
    }
  }

  /**
   * GENERATE PREDICTIVE INSIGHTS - Like Replit AI's proactive suggestions
   */
  static async generatePredictiveInsights(userId: string, currentMessage: string, agentId: string): Promise<PredictiveInsight[]> {
    console.log(`🔮 PREDICTIVE: Generating insights for ${agentId} interaction`);
    
    const patterns = await this.analyzeUserPatterns(userId);
    const insights: PredictiveInsight[] = [];

    // 1. NEXT TASK PREDICTION (High Priority)
    const nextTaskInsight = this.predictNextTask(patterns, currentMessage, agentId);
    if (nextTaskInsight) insights.push(nextTaskInsight);

    // 2. WORKFLOW SUGGESTIONS (Medium Priority)
    const workflowInsight = this.suggestWorkflow(patterns, currentMessage);
    if (workflowInsight) insights.push(workflowInsight);

    // 3. AGENT RECOMMENDATIONS (Medium Priority)
    const agentInsight = this.recommendAgent(patterns, currentMessage, agentId);
    if (agentInsight) insights.push(agentInsight);

    // 4. PROACTIVE ACTIONS (Low Priority but High Impact)
    const proactiveInsight = this.suggestProactiveAction(patterns, currentMessage, agentId);
    if (proactiveInsight) insights.push(proactiveInsight);

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * PREDICT NEXT TASK - Core Replit AI capability
   */
  private static predictNextTask(patterns: UserPattern, currentMessage: string, agentId: string): PredictiveInsight | null {
    const message = currentMessage.toLowerCase();
    
    // SSELFIE Studio specific task prediction patterns
    const taskPredictions: Array<{pattern: string, nextTask: string, confidence: number, agent: string}> = [
      // Admin Dashboard Patterns
      { pattern: 'admin dashboard', nextTask: 'Add metrics cards and user analytics display', confidence: 0.85, agent: 'victoria' },
      { pattern: 'luxury editorial', nextTask: 'Apply Times New Roman typography and dark moody styling', confidence: 0.90, agent: 'aria' },
      { pattern: 'navigation', nextTask: 'Add responsive menu and breadcrumb navigation', confidence: 0.80, agent: 'victoria' },
      
      // Image Generation Patterns
      { pattern: 'maya', nextTask: 'Test image generation with different prompts and styles', confidence: 0.75, agent: 'quinn' },
      { pattern: 'image generation', nextTask: 'Optimize prompts for better quality and consistency', confidence: 0.70, agent: 'maya' },
      { pattern: 'photoshoot', nextTask: 'Create additional style variations and poses', confidence: 0.80, agent: 'maya' },
      
      // Development Patterns  
      { pattern: 'create component', nextTask: 'Add TypeScript interfaces and proper styling', confidence: 0.85, agent: 'zara' },
      { pattern: 'fix error', nextTask: 'Test the fix and add error handling', confidence: 0.90, agent: 'quinn' },
      { pattern: 'database', nextTask: 'Run migrations and test data operations', confidence: 0.80, agent: 'zara' },
      
      // Business Patterns
      { pattern: 'pricing', nextTask: 'Create payment integration and subscription management', confidence: 0.75, agent: 'ava' },
      { pattern: 'user flow', nextTask: 'Design onboarding sequence and user guidance', confidence: 0.80, agent: 'victoria' },
      { pattern: 'social media', nextTask: 'Plan content calendar and engagement strategy', confidence: 0.70, agent: 'sophia' },
      
      // Workflow Patterns
      { pattern: 'workflow', nextTask: 'Monitor execution progress and coordinate next steps', confidence: 0.85, agent: 'elena' },
      { pattern: 'team coordination', nextTask: 'Assign specific tasks to appropriate agents', confidence: 0.80, agent: 'elena' }
    ];

    // Find matching prediction
    for (const prediction of taskPredictions) {
      if (message.includes(prediction.pattern)) {
        return {
          type: 'NEXT_TASK',
          confidence: prediction.confidence,
          suggestion: prediction.nextTask,
          reasoning: `Based on your work with ${prediction.pattern}, the typical next step is ${prediction.nextTask}`,
          agentId: prediction.agent,
          estimatedTime: '5-15 minutes'
        };
      }
    }

    // Fallback: Analyze recent task sequences
    const recentTasks = patterns.typicalTaskSequences.find(seq => 
      seq.sequence.some(task => message.includes(task.toLowerCase()))
    );

    if (recentTasks && recentTasks.sequence.length > 1) {
      const currentIndex = recentTasks.sequence.findIndex(task => 
        message.includes(task.toLowerCase())
      );
      
      if (currentIndex >= 0 && currentIndex < recentTasks.sequence.length - 1) {
        const nextTask = recentTasks.sequence[currentIndex + 1];
        return {
          type: 'NEXT_TASK',
          confidence: 0.65,
          suggestion: `Continue with: ${nextTask}`,
          reasoning: `Based on your typical workflow pattern, ${nextTask} usually follows`,
          estimatedTime: '10-20 minutes'
        };
      }
    }

    return null;
  }

  /**
   * SUGGEST WORKFLOW - Elena's coordination intelligence
   */
  private static suggestWorkflow(patterns: UserPattern, currentMessage: string): PredictiveInsight | null {
    const message = currentMessage.toLowerCase();
    
    // Complex task detection for workflow suggestions
    const complexTasks = [
      { keywords: ['redesign', 'admin', 'dashboard'], workflow: 'Admin Dashboard Redesign Workflow', agents: ['aria', 'victoria', 'zara', 'quinn'] },
      { keywords: ['image', 'generation', 'optimization'], workflow: 'AI Image Quality Enhancement Workflow', agents: ['maya', 'quinn', 'zara'] },
      { keywords: ['user', 'experience', 'onboarding'], workflow: 'User Experience Optimization Workflow', agents: ['victoria', 'ava', 'quinn', 'rachel'] },
      { keywords: ['social', 'media', 'content'], workflow: 'Social Media Content Strategy Workflow', agents: ['sophia', 'rachel', 'martha'] },
      { keywords: ['business', 'launch', 'marketing'], workflow: 'Business Launch Preparation Workflow', agents: ['elena', 'martha', 'ava', 'diana'] }
    ];

    for (const task of complexTasks) {
      if (task.keywords.every(keyword => message.includes(keyword))) {
        return {
          type: 'WORKFLOW_SUGGESTION',
          confidence: 0.80,
          suggestion: `Create ${task.workflow} with ${task.agents.length} coordinated agents`,
          reasoning: `This appears to be a complex task that would benefit from coordinated agent collaboration`,
          agentId: 'elena',
          estimatedTime: '30-60 minutes',
          requiredTools: ['agent coordination', 'file operations', 'testing']
        };
      }
    }

    return null;
  }

  /**
   * RECOMMEND AGENT - Smart agent routing
   */
  private static recommendAgent(patterns: UserPattern, currentMessage: string, currentAgentId: string): PredictiveInsight | null {
    const message = currentMessage.toLowerCase();
    
    // Agent expertise mapping
    const agentExpertise: Record<string, string[]> = {
      'aria': ['design', 'visual', 'luxury', 'editorial', 'branding', 'aesthetics'],
      'victoria': ['ui', 'ux', 'interface', 'user experience', 'navigation', 'responsive'],
      'zara': ['code', 'development', 'typescript', 'technical', 'database', 'api'],
      'maya': ['image', 'generation', 'ai', 'photography', 'styling', 'prompts'],
      'rachel': ['copy', 'content', 'voice', 'messaging', 'brand voice', 'writing'],
      'ava': ['automation', 'workflow', 'integration', 'business logic', 'processes'],
      'quinn': ['testing', 'quality', 'qa', 'performance', 'validation', 'debugging'],
      'sophia': ['social', 'instagram', 'community', 'engagement', 'content strategy'],
      'martha': ['marketing', 'ads', 'campaigns', 'revenue', 'optimization', 'analytics'],
      'elena': ['coordination', 'strategy', 'workflow', 'team management', 'planning']
    };

    // Find better agent match
    let bestAgent = currentAgentId;
    let bestScore = 0;
    
    for (const [agentId, keywords] of Object.entries(agentExpertise)) {
      if (agentId === currentAgentId) continue;
      
      const score = keywords.reduce((acc, keyword) => {
        return acc + (message.includes(keyword) ? 1 : 0);
      }, 0);
      
      if (score > bestScore) {
        bestAgent = agentId;
        bestScore = score;
      }
    }

    if (bestAgent !== currentAgentId && bestScore > 0) {
      return {
        type: 'AGENT_RECOMMENDATION',
        confidence: Math.min(0.90, 0.60 + (bestScore * 0.15)),
        suggestion: `${bestAgent} might be better for this task`,
        reasoning: `${bestAgent} specializes in ${agentExpertise[bestAgent].slice(0, 3).join(', ')} which matches your request`,
        agentId: bestAgent,
        estimatedTime: '5-10 minutes for handoff'
      };
    }

    return null;
  }

  /**
   * SUGGEST PROACTIVE ACTION - Replit AI's proactive capabilities
   */
  private static suggestProactiveAction(patterns: UserPattern, currentMessage: string, agentId: string): PredictiveInsight | null {
    const message = currentMessage.toLowerCase();
    
    // Proactive action patterns
    const proactiveActions = [
      {
        trigger: ['error', 'broken', 'not working'],
        action: 'Run diagnostic check and identify root cause',
        confidence: 0.85,
        reasoning: 'Proactively diagnosing issues helps resolve problems faster'
      },
      {
        trigger: ['create', 'new', 'component'],
        action: 'Set up TypeScript interfaces and basic styling structure',
        confidence: 0.75,
        reasoning: 'Setting up proper structure saves time and ensures consistency'
      },
      {
        trigger: ['design', 'visual', 'layout'],
        action: 'Apply SSELFIE luxury brand guidelines and editorial styling',
        confidence: 0.80,
        reasoning: 'Consistent brand application maintains premium quality'
      },
      {
        trigger: ['database', 'schema', 'migration'],
        action: 'Backup current data and prepare rollback plan',
        confidence: 0.90,
        reasoning: 'Safety measures prevent data loss during schema changes'
      }
    ];

    for (const action of proactiveActions) {
      if (action.trigger.some(trigger => message.includes(trigger))) {
        return {
          type: 'PROACTIVE_ACTION',
          confidence: action.confidence,
          suggestion: action.action,
          reasoning: action.reasoning,
          agentId: agentId,
          estimatedTime: '2-5 minutes'
        };
      }
    }

    return null;
  }

  /**
   * UTILITY METHODS
   */
  private static extractTaskKeywords(message: string): string[] {
    const keywords = message.toLowerCase().match(/\b(create|fix|update|design|build|test|deploy|optimize|add|remove|modify|enhance)\b/g);
    return keywords || [];
  }

  private static identifyWorkflows(taskPatterns: string[]): string[] {
    // Analyze patterns to identify common workflows
    const workflows = new Set<string>();
    
    if (taskPatterns.includes('design') && taskPatterns.includes('create')) {
      workflows.add('Design & Development Workflow');
    }
    if (taskPatterns.includes('test') && taskPatterns.includes('fix')) {
      workflows.add('Quality Assurance Workflow');
    }
    if (taskPatterns.includes('update') && taskPatterns.includes('optimize')) {
      workflows.add('Enhancement Workflow');
    }
    
    return Array.from(workflows);
  }

  private static analyzeTaskSequences(conversations: any[]): TaskSequence[] {
    // Simplified task sequence analysis
    return [
      {
        sequence: ['design', 'create', 'test', 'deploy'],
        frequency: 5,
        lastUsed: new Date(),
        context: 'typical development workflow'
      }
    ];
  }

  private static identifyProjectPhases(recentContext: string, taskPatterns: string[]): ProjectPhase[] {
    const phases: ProjectPhase[] = [];
    
    if (recentContext.includes('admin dashboard') || recentContext.includes('design')) {
      phases.push({
        phase: 'Admin Dashboard Development',
        typicalNextSteps: ['Add navigation', 'Implement metrics', 'Style with luxury theme'],
        associatedAgents: ['aria', 'victoria', 'zara'],
        estimatedDuration: '2-3 hours'
      });
    }
    
    if (recentContext.includes('image generation') || recentContext.includes('maya')) {
      phases.push({
        phase: 'AI Image Generation Optimization',
        typicalNextSteps: ['Test prompts', 'Optimize parameters', 'Quality validation'],
        associatedAgents: ['maya', 'quinn'],
        estimatedDuration: '1-2 hours'
      });
    }
    
    return phases;
  }
}