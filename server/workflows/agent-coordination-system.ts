import { Request, Response } from 'express';
import { db } from '../db';
import { claudeConversations, claudeMessages } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

interface WorkflowStage {
  id: string;
  name: string;
  primaryAgent: string;
  supportingAgents: string[];
  outputs: string[];
  nextStages: string[];
}

interface AgentHandoff {
  fromAgent: string;
  toAgent: string;
  context: any;
  completedTasks: string[];
  nextActions: string[];
  timestamp: Date;
  performanceMetrics?: {
    responseTime: number;
    memoryUsage: number;
    successRate: number;
  };
  errorState?: {
    hasError: boolean;
    errorMessage?: string;
    recoveryAttempts: number;
  };
}

export class AgentCoordinationSystem {
  private static workflowStages: Record<string, WorkflowStage> = {
    'design_concept': {
      id: 'design_concept',
      name: 'Design Concept Creation',
      primaryAgent: 'victoria',
      supportingAgents: ['rachel'],
      outputs: ['design_mockup', 'style_guidelines'],
      nextStages: ['technical_implementation', 'content_creation']
    },
    'technical_implementation': {
      id: 'technical_implementation',
      name: 'Technical Development',
      primaryAgent: 'maya',
      supportingAgents: ['victoria', 'wilma'],
      outputs: ['working_code', 'component_files'],
      nextStages: ['quality_assurance', 'automation_setup']
    },
    'content_creation': {
      id: 'content_creation',
      name: 'Content & Voice Development',
      primaryAgent: 'rachel',
      supportingAgents: ['sophia'],
      outputs: ['copy_content', 'voice_guidelines'],
      nextStages: ['social_media_strategy', 'marketing_campaigns']
    },
    'automation_setup': {
      id: 'automation_setup',
      name: 'Automation & Workflow Setup',
      primaryAgent: 'ava',
      supportingAgents: ['wilma', 'maya'],
      outputs: ['automation_workflows', 'integration_config'],
      nextStages: ['quality_assurance', 'deployment_prep']
    },
    'quality_assurance': {
      id: 'quality_assurance',
      name: 'Quality Control & Testing',
      primaryAgent: 'quinn',
      supportingAgents: ['maya', 'victoria'],
      outputs: ['test_results', 'quality_report'],
      nextStages: ['deployment_prep', 'optimization']
    },
    'social_media_strategy': {
      id: 'social_media_strategy',
      name: 'Social Media & Community',
      primaryAgent: 'sophia',
      supportingAgents: ['rachel', 'martha'],
      outputs: ['content_calendar', 'engagement_strategy'],
      nextStages: ['marketing_campaigns', 'optimization']
    },
    'marketing_campaigns': {
      id: 'marketing_campaigns',
      name: 'Marketing & Revenue Optimization',
      primaryAgent: 'martha',
      supportingAgents: ['sophia', 'diana'],
      outputs: ['campaign_strategy', 'revenue_optimization'],
      nextStages: ['strategic_planning', 'optimization']
    },
    'strategic_planning': {
      id: 'strategic_planning',
      name: 'Strategic Direction & Coordination',
      primaryAgent: 'diana',
      supportingAgents: ['martha', 'wilma'],
      outputs: ['strategic_blueprint', 'coordination_plan'],
      nextStages: ['optimization', 'workflow_optimization']
    },
    'workflow_optimization': {
      id: 'workflow_optimization',
      name: 'Process & Workflow Optimization',
      primaryAgent: 'wilma',
      supportingAgents: ['diana', 'ava'],
      outputs: ['workflow_blueprint', 'optimization_plan'],
      nextStages: ['deployment_prep', 'strategic_planning']
    },
    'deployment_prep': {
      id: 'deployment_prep',
      name: 'Deployment Preparation',
      primaryAgent: 'maya',
      supportingAgents: ['quinn', 'wilma'],
      outputs: ['deployment_package', 'launch_checklist'],
      nextStages: ['optimization']
    },
    'optimization': {
      id: 'optimization',
      name: 'Continuous Optimization',
      primaryAgent: 'wilma',
      supportingAgents: ['diana', 'martha'],
      outputs: ['performance_metrics', 'improvement_plan'],
      nextStages: ['strategic_planning', 'workflow_optimization']
    }
  };

  static async initiateWorkflow(projectType: string, userId: string, requirements: any): Promise<string> {
    const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Determine starting stage based on project type
    let startingStage = 'design_concept';
    if (projectType === 'technical') startingStage = 'technical_implementation';
    if (projectType === 'content') startingStage = 'content_creation';
    if (projectType === 'strategy') startingStage = 'strategic_planning';
    
    // Store workflow initiation
    const convId = `workflow_${workflowId}`;
    await db.insert(claudeConversations).values({
      userId,
      agentName: 'system',
      conversationId: convId,
      title: `Workflow ${workflowId}`,
      status: 'active'
    });
    await db.insert(claudeMessages).values({
      conversationId: convId,
      role: 'system',
      content: JSON.stringify({
        workflowId,
        projectType,
        currentStage: startingStage,
        requirements,
        status: 'initiated',
        stages: this.workflowStages
      }),
      metadata: { type: 'workflow_initiation', workflowStage: startingStage }
    });

    return workflowId;
  }

  static async executeHandoff(handoff: AgentHandoff, userId: string, workflowId: string): Promise<void> {
    // Store handoff information
    const convId = `handoff_${workflowId}_${Date.now()}`;
    await db.insert(claudeConversations).values({
      userId,
      agentName: 'system',
      conversationId: convId,
      title: `Handoff ${handoff.fromAgent} to ${handoff.toAgent}`,
      status: 'active'
    });
    await db.insert(claudeMessages).values({
      conversationId: convId,
      role: 'system',
      content: JSON.stringify({
        type: 'agent_handoff',
        workflowId,
        fromAgent: handoff.fromAgent,
        toAgent: handoff.toAgent,
        context: handoff.context,
        completedTasks: handoff.completedTasks,
        nextActions: handoff.nextActions,
        timestamp: handoff.timestamp
      }),
      metadata: { type: 'handoff', workflowStage: 'handoff' }
    });

    // Notify next agent with context
    console.log(`🔄 AGENT HANDOFF: ${handoff.fromAgent} → ${handoff.toAgent}`);
    console.log(`📋 Context: ${JSON.stringify(handoff.context, null, 2)}`);
    console.log(`✅ Completed: ${handoff.completedTasks.join(', ')}`);
    console.log(`🎯 Next Actions: ${handoff.nextActions.join(', ')}`);
  }

  static async getWorkflowStatus(workflowId: string, userId: string): Promise<any> {
    const conversations = await db
      .select()
      .from(claudeConversations)
      .innerJoin(claudeMessages, eq(claudeMessages.conversationId, claudeConversations.conversationId))
      .where(
        and(
          eq(claudeConversations.userId, userId),
          eq(claudeConversations.title, `Workflow ${workflowId}`)
        )
      )
      .orderBy(desc(claudeMessages.timestamp));

    return {
      workflowId,
      conversations: conversations.map(c => ({
        agent: c.claude_conversations.agentName,
        stage: c.claude_messages.metadata?.workflowStage,
        data: JSON.parse(c.claude_messages.content || '{}'),
        timestamp: c.claude_messages.timestamp
      }))
    };
  }

  static async optimizeAgentUtilization(userId: string): Promise<any> {
    // Analyze agent performance and utilization
    const recentConversations = await db
      .select()
      .from(claudeConversations)
      .innerJoin(claudeMessages, eq(claudeMessages.conversationId, claudeConversations.conversationId))
      .where(eq(claudeConversations.userId, userId))
      .orderBy(desc(claudeMessages.timestamp))
      .limit(100);

    const agentStats = recentConversations.reduce((stats, conv) => {
      const agent = conv.claude_conversations.agentName;
      if (!stats[agent]) {
        stats[agent] = {
          totalConversations: 0,
          totalMessages: 0,
          stages: [],
          avgResponseTime: 0,
          specialties: [],
          utilizationScore: 0
        };
      }
      
      stats[agent].totalConversations++;
      stats[agent].totalMessages += 1;
      const workflowStage = conv.claude_messages.metadata?.workflowStage;
      if (workflowStage) stats[agent].stages.push(workflowStage);
      
      return stats;
    }, {} as any);

    // Calculate utilization scores
    Object.keys(agentStats).forEach(agent => {
      const stats = agentStats[agent];
      stats.utilizationScore = Math.min(100, (stats.totalConversations * 10) + (stats.totalMessages * 2));
      stats.efficiency = stats.totalMessages / Math.max(1, stats.totalConversations);
    });

    return {
      agentStats,
      recommendations: this.generateOptimizationRecommendations(agentStats),
      timestamp: new Date()
    };
  }

  private static generateOptimizationRecommendations(agentStats: any): string[] {
    const recommendations = [];
    
    // Check for underutilized agents
    Object.entries(agentStats).forEach(([agent, stats]: [string, any]) => {
      if (stats.utilizationScore < 20) {
        recommendations.push(`Consider increasing ${agent}'s involvement in workflows`);
      }
      if (stats.efficiency < 2) {
        recommendations.push(`${agent} may need workflow optimization for better efficiency`);
      }
    });

    // Suggest workflow improvements
    const totalAgents = Object.keys(agentStats).length;
    if (totalAgents < 5) {
      recommendations.push("Consider utilizing more specialized agents for complex projects");
    }

    return recommendations;
  }

  static getWorkflowStages(): Record<string, WorkflowStage> {
    return this.workflowStages;
  }

  static getAgentSpecialties(): Record<string, string[]> {
    return {
      victoria: ['UI/UX Design', 'Visual Identity', 'Brand Design', 'Component Creation'],
      maya: ['Full-Stack Development', 'Architecture', 'Database Design', 'API Integration'],
      rachel: ['Content Strategy', 'Voice & Tone', 'Copy Writing', 'Brand Messaging'],
      ava: ['Process Automation', 'Workflow Design', 'Integration Setup', 'Email Marketing'],
      quinn: ['Quality Assurance', 'Testing', 'Performance Optimization', 'Brand Compliance'],
      sophia: ['Social Media Strategy', 'Community Building', 'Content Calendar', 'Engagement'],
      martha: ['Performance Marketing', 'Revenue Optimization', 'Campaign Strategy', 'Analytics'],
      diana: ['Strategic Planning', 'Business Development', 'Team Coordination', 'Decision Making'],
      wilma: ['Process Optimization', 'System Architecture', 'Efficiency Analysis', 'Scaling Strategy']
    };
  }
}

// Enhanced workflow coordination endpoint
export async function coordinateAgents(req: Request, res: Response) {
  try {
    const { action, workflowId, agentId, context } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    switch (action) {
      case 'initiate_workflow':
        const newWorkflowId = await AgentCoordinationSystem.initiateWorkflow(
          context.projectType,
          userId,
          context.requirements
        );
        res.json({ workflowId: newWorkflowId, status: 'initiated' });
        break;

      case 'execute_handoff':
        await AgentCoordinationSystem.executeHandoff(context.handoff, userId, workflowId);
        res.json({ status: 'handoff_completed' });
        break;

      case 'get_workflow_status':
        const status = await AgentCoordinationSystem.getWorkflowStatus(workflowId, userId);
        res.json(status);
        break;

      case 'optimize_utilization':
        const optimization = await AgentCoordinationSystem.optimizeAgentUtilization(userId);
        res.json(optimization);
        break;

      case 'get_workflow_stages':
        res.json({ stages: AgentCoordinationSystem.getWorkflowStages() });
        break;

      case 'get_agent_specialties':
        res.json({ specialties: AgentCoordinationSystem.getAgentSpecialties() });
        break;

      default:
        res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Agent coordination error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}