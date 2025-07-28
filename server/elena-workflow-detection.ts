/**
 * ELENA WORKFLOW DETECTION SERVICE
 * 
 * Elena's intelligent workflow detection system that monitors for workflow triggers
 * and automatically assigns tasks to appropriate agents like Aria.
 */

import { db } from './db';
import { agentConversations } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import { unifiedAgentSystem } from './unified-agent-system';
import { AgentCoordinationSystem } from './workflows/agent-coordination-system';

interface WorkflowTrigger {
  type: 'user_request' | 'scheduled' | 'system_event';
  content: string;
  userId: string;
  timestamp: Date;
  context?: any;
}

interface DetectedWorkflow {
  workflowType: string;
  primaryAgent: string;
  supportingAgents: string[];
  taskDescription: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: string;
}

export class ElenaWorkflowDetection {
  private static instance: ElenaWorkflowDetection;
  
  // Elena's workflow detection patterns
  private static workflowPatterns = {
    'design_showcase': {
      keywords: ['design', 'showcase', 'visual', 'ui', 'mockup', 'prototype'],
      primaryAgent: 'aria',
      supportingAgents: ['victoria'],
      priority: 'medium' as const,
      estimatedDuration: '2-4 hours'
    },
    'technical_implementation': {
      keywords: ['implement', 'code', 'develop', 'build', 'technical', 'api'],
      primaryAgent: 'maya',
      supportingAgents: ['aria', 'wilma'],
      priority: 'high' as const,
      estimatedDuration: '4-8 hours'
    },
    'content_creation': {
      keywords: ['content', 'copy', 'write', 'blog', 'article', 'voice'],
      primaryAgent: 'rachel',
      supportingAgents: ['sophia'],
      priority: 'medium' as const,
      estimatedDuration: '2-3 hours'
    },
    'workflow_optimization': {
      keywords: ['optimize', 'workflow', 'process', 'efficiency', 'automate'],
      primaryAgent: 'wilma',
      supportingAgents: ['ava', 'diana'],
      priority: 'high' as const,
      estimatedDuration: '3-6 hours'
    },
    'social_strategy': {
      keywords: ['social', 'media', 'community', 'engagement', 'content calendar'],
      primaryAgent: 'sophia',
      supportingAgents: ['rachel', 'martha'],
      priority: 'medium' as const,
      estimatedDuration: '2-4 hours'
    },
    'marketing_campaign': {
      keywords: ['marketing', 'campaign', 'revenue', 'conversion', 'analytics'],
      primaryAgent: 'martha',
      supportingAgents: ['sophia', 'diana'],
      priority: 'high' as const,
      estimatedDuration: '4-6 hours'
    }
  };

  private constructor() {
    this.startWorkflowMonitoring();
  }

  static getInstance(): ElenaWorkflowDetection {
    if (!ElenaWorkflowDetection.instance) {
      ElenaWorkflowDetection.instance = new ElenaWorkflowDetection();
    }
    return ElenaWorkflowDetection.instance;
  }

  /**
   * Start Elena's continuous workflow monitoring
   */
  private startWorkflowMonitoring() {
    console.log('🧠 ELENA: Workflow detection system activated');
    
    // Monitor database for new conversations that might trigger workflows
    setInterval(async () => {
      await this.scanForWorkflowTriggers();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Scan for potential workflow triggers
   */
  private async scanForWorkflowTriggers() {
    try {
      // Get recent conversations from the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const recentConversations = await db
        .select()
        .from(agentConversations)
        .where(
          and(
            eq(agentConversations.agentName, 'sandra'), // Sandra's requests
            // Add timestamp filter when available
          )
        )
        .orderBy(desc(agentConversations.timestamp))
        .limit(10);

      for (const conversation of recentConversations) {
        const trigger: WorkflowTrigger = {
          type: 'user_request',
          content: JSON.stringify(conversation.conversationData),
          userId: conversation.userId,
          timestamp: conversation.timestamp,
          context: conversation.conversationData
        };

        await this.analyzeAndTriggerWorkflow(trigger);
      }
    } catch (error) {
      console.error('❌ Elena workflow scanning error:', error);
    }
  }

  /**
   * Elena's intelligent workflow analysis and triggering
   */
  async analyzeAndTriggerWorkflow(trigger: WorkflowTrigger): Promise<void> {
    console.log('🔍 ELENA: Analyzing potential workflow trigger...');
    
    const detectedWorkflow = this.detectWorkflowType(trigger.content);
    
    if (detectedWorkflow) {
      console.log(`🎯 ELENA: Detected ${detectedWorkflow.workflowType} workflow`);
      console.log(`👤 Primary Agent: ${detectedWorkflow.primaryAgent}`);
      console.log(`🤝 Supporting Agents: ${detectedWorkflow.supportingAgents.join(', ')}`);
      
      // Initiate the workflow through the coordination system
      const workflowId = await AgentCoordinationSystem.initiateWorkflow(
        detectedWorkflow.workflowType,
        trigger.userId,
        {
          originalTrigger: trigger.content,
          detectedWorkflow,
          elenaAnalysis: {
            confidence: this.calculateConfidence(trigger.content, detectedWorkflow),
            reasoning: this.generateReasoning(trigger.content, detectedWorkflow),
            timestamp: new Date()
          }
        }
      );

      // Assign task to primary agent
      await this.assignTaskToAgent(
        detectedWorkflow.primaryAgent,
        detectedWorkflow.taskDescription,
        trigger.userId,
        workflowId,
        detectedWorkflow
      );

      console.log(`✅ ELENA: Workflow ${workflowId} initiated and assigned to ${detectedWorkflow.primaryAgent}`);
    } else {
      console.log('💭 ELENA: No clear workflow pattern detected, monitoring continues...');
    }
  }

  /**
   * Detect workflow type from content using Elena's pattern recognition
   */
  private detectWorkflowType(content: string): DetectedWorkflow | null {
    const contentLower = content.toLowerCase();
    
    for (const [workflowType, pattern] of Object.entries(ElenaWorkflowDetection.workflowPatterns)) {
      const matchCount = pattern.keywords.filter(keyword => 
        contentLower.includes(keyword)
      ).length;
      
      // Require at least 2 keyword matches for confidence
      if (matchCount >= 2) {
        return {
          workflowType,
          primaryAgent: pattern.primaryAgent,
          supportingAgents: pattern.supportingAgents,
          taskDescription: this.generateTaskDescription(workflowType, content),
          priority: pattern.priority,
          estimatedDuration: pattern.estimatedDuration
        };
      }
    }
    
    return null;
  }

  /**
   * Generate specific task description based on workflow type and content
   */
  private generateTaskDescription(workflowType: string, content: string): string {
    const taskTemplates = {
      'design_showcase': 'Create design showcase based on requirements',
      'technical_implementation': 'Implement technical solution with proper architecture',
      'content_creation': 'Develop content strategy and create engaging copy',
      'workflow_optimization': 'Analyze and optimize current workflow processes',
      'social_strategy': 'Design social media strategy and content calendar',
      'marketing_campaign': 'Create marketing campaign with revenue optimization'
    };

    return taskTemplates[workflowType as keyof typeof taskTemplates] || 'Execute assigned workflow task';
  }

  /**
   * Assign task to specific agent through unified system
   */
  private async assignTaskToAgent(
    agentId: string,
    taskDescription: string,
    userId: string,
    workflowId: string,
    workflow: DetectedWorkflow
  ): Promise<void> {
    const agentMessage = `🎯 ELENA WORKFLOW ASSIGNMENT

**Workflow ID:** ${workflowId}
**Task:** ${taskDescription}
**Priority:** ${workflow.priority.toUpperCase()}
**Estimated Duration:** ${workflow.estimatedDuration}

**Supporting Agents:** ${workflow.supportingAgents.join(', ')}

**Elena's Analysis:**
This workflow was automatically detected and assigned based on content analysis. Please proceed with the task and coordinate with supporting agents as needed.

**Next Steps:**
1. Acknowledge task assignment
2. Begin work on the specified task
3. Coordinate with supporting agents if needed
4. Report progress through the workflow system

Ready to begin? Please confirm task assignment and start working.`;

    try {
      await unifiedAgentSystem.executeAgent({
        agentId,
        message: agentMessage,
        conversationId: `workflow_${workflowId}`,
        enforceTools: true
      });

      console.log(`📤 ELENA: Task assigned to ${agentId} for workflow ${workflowId}`);
    } catch (error) {
      console.error(`❌ ELENA: Failed to assign task to ${agentId}:`, error);
    }
  }

  /**
   * Calculate confidence score for workflow detection
   */
  private calculateConfidence(content: string, workflow: DetectedWorkflow): number {
    const pattern = ElenaWorkflowDetection.workflowPatterns[workflow.workflowType as keyof typeof ElenaWorkflowDetection.workflowPatterns];
    const contentLower = content.toLowerCase();
    
    const matchCount = pattern.keywords.filter(keyword => 
      contentLower.includes(keyword)
    ).length;
    
    return Math.min(100, (matchCount / pattern.keywords.length) * 100);
  }

  /**
   * Generate reasoning for workflow detection
   */
  private generateReasoning(content: string, workflow: DetectedWorkflow): string {
    const pattern = ElenaWorkflowDetection.workflowPatterns[workflow.workflowType as keyof typeof ElenaWorkflowDetection.workflowPatterns];
    const contentLower = content.toLowerCase();
    
    const matchedKeywords = pattern.keywords.filter(keyword => 
      contentLower.includes(keyword)
    );
    
    return `Detected ${workflow.workflowType} workflow based on keywords: ${matchedKeywords.join(', ')}. Assigned to ${workflow.primaryAgent} with ${workflow.supportingAgents.join(', ')} as supporting agents.`;
  }

  /**
   * Manual workflow trigger (for direct invocation)
   */
  async triggerWorkflow(content: string, userId: string, workflowType?: string): Promise<string | null> {
    console.log('🎯 ELENA: Manual workflow trigger received');
    
    const trigger: WorkflowTrigger = {
      type: 'user_request',
      content,
      userId,
      timestamp: new Date()
    };

    if (workflowType) {
      // Direct workflow type specified
      const pattern = ElenaWorkflowDetection.workflowPatterns[workflowType as keyof typeof ElenaWorkflowDetection.workflowPatterns];
      if (pattern) {
        const workflow: DetectedWorkflow = {
          workflowType,
          primaryAgent: pattern.primaryAgent,
          supportingAgents: pattern.supportingAgents,
          taskDescription: this.generateTaskDescription(workflowType, content),
          priority: pattern.priority,
          estimatedDuration: pattern.estimatedDuration
        };

        const workflowId = await AgentCoordinationSystem.initiateWorkflow(
          workflowType,
          userId,
          { originalTrigger: content, detectedWorkflow: workflow }
        );

        await this.assignTaskToAgent(
          workflow.primaryAgent,
          workflow.taskDescription,
          userId,
          workflowId,
          workflow
        );

        return workflowId;
      }
    } else {
      // Auto-detect workflow type
      await this.analyzeAndTriggerWorkflow(trigger);
    }

    return null;
  }

  /**
   * Get Elena's workflow detection status
   */
  getDetectionStatus() {
    return {
      system: 'elena_workflow_detection',
      active: true,
      patterns: Object.keys(ElenaWorkflowDetection.workflowPatterns),
      monitoring: 'continuous',
      last_scan: new Date(),
      confidence_threshold: 'minimum_2_keywords'
    };
  }
}

// Export singleton instance
export const elenaWorkflowDetection = ElenaWorkflowDetection.getInstance();