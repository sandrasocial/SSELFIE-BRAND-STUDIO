/**
 * CONTENT CREATION WORKFLOW TEMPLATE
 * Multi-agent workflow for creating comprehensive content campaigns
 */

// Workflow template interface
interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  estimatedTotalDuration: number;
  requiredAgents: string[];
  category: string;
  tasks: any[];
}

export const CONTENT_CREATION_WORKFLOW: WorkflowTemplate = {
  id: 'content_creation_campaign',
  name: 'Content Creation Campaign',
  description: 'Multi-agent workflow for creating comprehensive content campaigns including visual strategy, design, copy, and social distribution',
  estimatedTotalDuration: 180, // 3 hours
  requiredAgents: ['elena', 'maya', 'aria', 'rachel', 'sophia', 'quinn'],
  category: 'enhancement',
  tasks: [
    {
      id: 'content_strategy',
      name: 'Content Strategy & Visual Concept',
      description: 'Define content goals, target audience, and visual strategy for campaign',
      assignedAgent: 'elena',
      status: 'pending',
      dependencies: [],
      dependents: ['visual_concept', 'brand_messaging'],
      estimatedDuration: 30,
      priority: 'high',
      metadata: { 
        category: 'strategy', 
        complexity: 'medium',
        deliverables: ['Content brief', 'Target audience analysis', 'Campaign goals']
      }
    },
    {
      id: 'visual_concept',
      name: 'Visual Concept & Style Direction',
      description: 'Create visual concept, mood boards, and style direction for content campaign',
      assignedAgent: 'maya',
      status: 'pending',
      dependencies: ['content_strategy'],
      dependents: ['design_implementation'],
      estimatedDuration: 45,
      priority: 'high',
      metadata: { 
        category: 'creative', 
        complexity: 'high',
        deliverables: ['Visual concept', 'Style guide', 'Image prompts']
      }
    },
    {
      id: 'design_implementation',
      name: 'Design Implementation & Visual Assets',
      description: 'Create visual assets, graphics, and design implementations based on concept',
      assignedAgent: 'aria',
      status: 'pending',
      dependencies: ['visual_concept'],
      dependents: ['content_qa', 'copy_creation'],
      estimatedDuration: 60,
      priority: 'high',
      metadata: { 
        category: 'design', 
        complexity: 'high',
        deliverables: ['Visual assets', 'Design templates', 'Brand-compliant graphics']
      }
    },
    {
      id: 'brand_messaging',
      name: 'Brand Messaging Strategy',
      description: 'Develop key messages, tone, and voice strategy for campaign content',
      assignedAgent: 'rachel',
      status: 'pending',
      dependencies: ['content_strategy'],
      dependents: ['copy_creation'],
      estimatedDuration: 35,
      priority: 'medium',
      metadata: { 
        category: 'messaging', 
        complexity: 'medium',
        deliverables: ['Messaging framework', 'Key messages', 'Voice guidelines']
      }
    },
    {
      id: 'copy_creation',
      name: 'Content Copywriting & Messaging',
      description: 'Write compelling copy for all content pieces in Sandra\'s authentic voice',
      assignedAgent: 'rachel',
      status: 'pending',
      dependencies: ['brand_messaging', 'design_implementation'],
      dependents: ['content_qa', 'social_strategy'],
      estimatedDuration: 40,
      priority: 'high',
      metadata: { 
        category: 'content', 
        complexity: 'medium',
        deliverables: ['Campaign copy', 'Social captions', 'Email content']
      }
    },
    {
      id: 'content_qa',
      name: 'Content Quality Assurance',
      description: 'Review all content for quality, brand consistency, and luxury experience standards',
      assignedAgent: 'quinn',
      status: 'pending',
      dependencies: ['design_implementation', 'copy_creation'],
      dependents: ['social_strategy'],
      estimatedDuration: 25,
      priority: 'high',
      metadata: { 
        category: 'qa', 
        complexity: 'low',
        deliverables: ['QA report', 'Content approval', 'Improvement recommendations']
      }
    },
    {
      id: 'social_strategy',
      name: 'Social Media Distribution Strategy',
      description: 'Create social media strategy and distribution plan for maximum engagement',
      assignedAgent: 'sophia',
      status: 'pending',
      dependencies: ['content_qa'],
      dependents: ['campaign_launch'],
      estimatedDuration: 30,
      priority: 'medium',
      metadata: { 
        category: 'social', 
        complexity: 'medium',
        deliverables: ['Social strategy', 'Content calendar', 'Hashtag strategy']
      }
    },
    {
      id: 'campaign_launch',
      name: 'Campaign Launch Coordination',
      description: 'Coordinate final campaign launch across all channels and platforms',
      assignedAgent: 'elena',
      status: 'pending',
      dependencies: ['social_strategy'],
      dependents: [],
      estimatedDuration: 20,
      priority: 'critical',
      metadata: { 
        category: 'coordination', 
        complexity: 'low',
        deliverables: ['Launch timeline', 'Go-live coordination', 'Success metrics']
      }
    }
  ]
};

/**
 * CONTENT CREATION WORKFLOW EXECUTION STEPS
 */
export const CONTENT_CREATION_EXECUTION_STEPS = [
  {
    step: 1,
    description: 'Elena defines content strategy and campaign goals',
    agents: ['elena'],
    duration: 30,
    type: 'parallel'
  },
  {
    step: 2,
    description: 'Maya creates visual concept while Rachel develops messaging strategy',
    agents: ['maya', 'rachel'],
    duration: 45,
    type: 'parallel'
  },
  {
    step: 3,
    description: 'Aria implements design based on Maya\'s concept',
    agents: ['aria'],
    duration: 60,
    type: 'sequential'
  },
  {
    step: 4,
    description: 'Rachel writes copy based on messaging strategy and design assets',
    agents: ['rachel'],
    duration: 40,
    type: 'sequential'
  },
  {
    step: 5,
    description: 'Quinn reviews all content for quality and brand consistency',
    agents: ['quinn'],
    duration: 25,
    type: 'sequential'
  },
  {
    step: 6,
    description: 'Sophia creates social distribution strategy',
    agents: ['sophia'],
    duration: 30,
    type: 'sequential'
  },
  {
    step: 7,
    description: 'Elena coordinates final campaign launch',
    agents: ['elena'],
    duration: 20,
    type: 'sequential'
  }
];

/**
 * CONTENT CREATION SUCCESS METRICS
 */
export const CONTENT_CREATION_METRICS = {
  qualityTargets: {
    designConsistency: 95, // %
    brandVoiceAccuracy: 98, // %
    visualAppeal: 90, // %
    messageClarity: 95 // %
  },
  performanceTargets: {
    totalExecutionTime: 180, // minutes
    agentUtilization: 85, // %
    parallelEfficiency: 70, // %
    dependencyManagement: 95 // %
  },
  businessTargets: {
    contentEngagement: 15, // % increase
    brandConsistency: 98, // %
    campaignCompletion: 100, // %
    clientSatisfaction: 95 // %
  }
};