// Agent Tool Usage Intelligence System
// This defines when Visual Editor agents should use tools vs conversational responses

export interface ToolUsagePattern {
  trigger: string[];
  tool: string;
  example: string;
  reasoning: string;
}

export const AGENT_TOOL_INTELLIGENCE = {
  
  // IMMEDIATE TOOL USAGE - Action-oriented requests like Replit AI
  IMMEDIATE_ACTION_PATTERNS: [
    {
      trigger: ['create', 'build', 'make', 'generate', 'add'],
      tool: 'str_replace_based_edit_tool',
      example: 'Create a new landing page',
      reasoning: 'User wants something built - use tools immediately like Replit AI'
    },
    {
      trigger: ['modify', 'update', 'change', 'fix', 'edit', 'improve'],
      tool: 'str_replace_based_edit_tool', 
      example: 'Fix the admin dashboard',
      reasoning: 'User wants changes made - make them directly like Replit AI'
    },
    {
      trigger: ['show me', 'let me see', 'view the', 'display'],
      tool: 'str_replace_based_edit_tool',
      example: 'Show me the navigation code',
      reasoning: 'User wants to see code - view files immediately'
    },
    {
      trigger: ['find', 'locate', 'where is', 'search for'],
      tool: 'search_filesystem',
      example: 'Find all navigation components',
      reasoning: 'User needs location info - search immediately'
    },
    {
      trigger: ['test', 'run', 'check', 'verify', 'build'],
      tool: 'bash',
      example: 'Test the application',
      reasoning: 'User wants functionality tested - run commands'
    }
  ],

  // CONVERSATIONAL FIRST - Relationship-building requests
  CONVERSATIONAL_PATTERNS: [
    {
      trigger: ['help with', 'need advice', 'what do you think', 'suggestions'],
      tool: 'none',
      example: 'I need help with the landing page',
      reasoning: 'User wants consultation - respond conversationally first, then ask for specifics'
    },
    {
      trigger: ['how are', 'status', 'progress', 'going'],
      tool: 'none', 
      example: 'How is everything going?',
      reasoning: 'User checking in - conversational response only'
    },
    {
      trigger: ['what should', 'do you recommend', 'best approach'],
      tool: 'none',
      example: 'What should I do about the design?',
      reasoning: 'User wants advice - give recommendations conversationally'
    }
  ],

  // ELENA SPECIFIC PATTERNS - Strategic coordination
  ELENA_PATTERNS: [
    {
      trigger: ['analyze', 'audit', 'review', 'assess'],
      tool: 'search_filesystem',
      example: 'Analyze the admin dashboard',
      reasoning: 'Elena needs to understand current state before coordinating'
    },
    {
      trigger: ['coordinate', 'manage', 'organize'],
      tool: 'none',
      example: 'Coordinate the team for this project',
      reasoning: 'Elena coordinates through conversation and agent assignment'
    }
  ]
};

export function getToolUsageRecommendation(userMessage: string, agentId: string): {
  shouldUseTool: boolean;
  recommendedTool?: string;
  reasoning: string;
  conversationalFirst?: boolean;
} {
  const message = userMessage.toLowerCase();
  
  // Check for immediate action patterns (like Replit AI)
  for (const pattern of AGENT_TOOL_INTELLIGENCE.IMMEDIATE_ACTION_PATTERNS) {
    if (pattern.trigger.some(trigger => message.includes(trigger))) {
      return {
        shouldUseTool: true,
        recommendedTool: pattern.tool,
        reasoning: `Action-oriented request detected: "${pattern.trigger.find(t => message.includes(t))}" - Use ${pattern.tool} immediately like Replit AI agents`
      };
    }
  }
  
  // Check for Elena-specific patterns
  if (agentId === 'elena') {
    for (const pattern of AGENT_TOOL_INTELLIGENCE.ELENA_PATTERNS) {
      if (pattern.trigger.some(trigger => message.includes(trigger))) {
        return {
          shouldUseTool: pattern.tool !== 'none',
          recommendedTool: pattern.tool !== 'none' ? pattern.tool : undefined,
          reasoning: `Elena strategic request: Use ${pattern.tool || 'conversation'} to ${pattern.reasoning}`
        };
      }
    }
  }
  
  // Check for conversational patterns
  for (const pattern of AGENT_TOOL_INTELLIGENCE.CONVERSATIONAL_PATTERNS) {
    if (pattern.trigger.some(trigger => message.includes(trigger))) {
      return {
        shouldUseTool: false,
        reasoning: `Conversational request detected: "${pattern.trigger.find(t => message.includes(t))}" - Respond conversationally first, then ask for specifics`,
        conversationalFirst: true
      };
    }
  }
  
  // Default: if user mentions specific files or technical terms, use tools
  const technicalTerms = ['component', 'page', 'file', 'code', 'function', 'class', '.tsx', '.ts', '.js'];
  if (technicalTerms.some(term => message.includes(term))) {
    return {
      shouldUseTool: true,
      recommendedTool: 'str_replace_based_edit_tool',
      reasoning: 'Technical terms detected - likely needs file access'
    };
  }
  
  // Default to conversational for unclear requests
  return {
    shouldUseTool: false,
    reasoning: 'Unclear request - start with conversational response and clarification',
    conversationalFirst: true
  };
}

// ALL AGENTS HAVE UNLIMITED ACCESS - No tool restrictions
export const AGENT_SPECIFIC_TOOLS = {
  elena: {
    primary: ['search_filesystem', 'str_replace_based_edit_tool', 'bash', 'web_search'],
    description: 'Elena has UNLIMITED ACCESS to all tools for strategic coordination and implementation'
  },
  aria: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Aria has UNLIMITED ACCESS to all tools for luxury design and direct implementation'
  },
  zara: {
    primary: ['str_replace_based_edit_tool', 'bash', 'search_filesystem', 'web_search'],
    description: 'Zara has UNLIMITED ACCESS to all tools for technical implementation and testing'
  },
  rachel: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Rachel has UNLIMITED ACCESS to all tools for voice consistency and content creation'
  },
  maya: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Maya has UNLIMITED ACCESS to all tools for AI photography implementation'
  },
  victoria: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Victoria has UNLIMITED ACCESS to all tools for UX implementation'
  },
  ava: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Ava has UNLIMITED ACCESS to all tools for automation implementation'
  },
  quinn: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Quinn has UNLIMITED ACCESS to all tools for quality assurance implementation'
  },
  sophia: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Sophia has UNLIMITED ACCESS to all tools for social media feature implementation'
  },
  martha: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Martha has UNLIMITED ACCESS to all tools for marketing implementation'
  },
  diana: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Diana has UNLIMITED ACCESS to all tools for business strategy implementation'
  },
  wilma: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Wilma has UNLIMITED ACCESS to all tools for workflow implementation'
  },
  olga: {
    primary: ['str_replace_based_edit_tool', 'search_filesystem', 'bash', 'web_search'],
    description: 'Olga has UNLIMITED ACCESS to all tools for repository organization implementation'
  }
};