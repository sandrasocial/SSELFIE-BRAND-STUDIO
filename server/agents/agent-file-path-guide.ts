// Agent File Path Guide - Provides correct file structure guidance for all agents

export interface FilePathReference {
  category: string;
  files: Array<{
    name: string;
    path: string;
    size: string;
    description: string;
    priority: 'critical' | 'high' | 'medium';
  }>;
}

// COMPLETE AGENT SYSTEM FILES - All existing agent files for admin access
export const AGENT_SYSTEM_FILES: FilePathReference[] = [
  {
    category: "Core Agent Intelligence (Server-side)",
    files: [
      {
        name: "codebase-understanding-intelligence.ts",
        path: "server/agents/codebase-understanding-intelligence.ts",
        size: "19,563 bytes",
        description: "Main agent intelligence system for codebase understanding",
        priority: "critical"
      },
      {
        name: "agent-codebase-integration.ts",
        path: "server/agents/agent-codebase-integration.ts", 
        size: "26,779 bytes",
        description: "Agent codebase integration and analysis system",
        priority: "critical"
      },
      {
        name: "agent-learning-system.ts",
        path: "server/agents/agent-learning-system.ts",
        size: "7,947 bytes", 
        description: "Agent learning and adaptation system",
        priority: "high"
      },
      {
        name: "predictive-intelligence-system.ts",
        path: "server/agents/predictive-intelligence-system.ts",
        size: "16,381 bytes",
        description: "Predictive intelligence for agent decision making",
        priority: "high"
      }
    ]
  },
  {
    category: "Agent Tools and Capabilities",
    files: [
      {
        name: "agent-tool-usage-intelligence.ts", 
        path: "server/agents/agent-tool-usage-intelligence.ts",
        size: "7,872 bytes",
        description: "Tool usage intelligence and optimization",
        priority: "high"
      },
      {
        name: "agent-safety-protocols.ts",
        path: "server/agents/agent-safety-protocols.ts", 
        size: "2,158 bytes",
        description: "Agent safety and validation protocols",
        priority: "high"
      },
      {
        name: "agent-file-path-guide.ts",
        path: "server/agents/agent-file-path-guide.ts",
        size: "7,037 bytes",
        description: "This file - agent file path reference system", 
        priority: "medium"
      }
    ]
  },
  {
    category: "Context and Memory Management",
    files: [
      {
        name: "context-preservation-system.ts",
        path: "server/agents/context-preservation-system.ts",
        size: "9,760 bytes",
        description: "Agent context preservation and memory management",
        priority: "high"
      },
      {
        name: "ConversationManager.ts",
        path: "server/agents/ConversationManager.ts",
        size: "14,508 bytes", 
        description: "Conversation management and state tracking",
        priority: "high"
      },
      {
        name: "architectural-knowledge-base.ts",
        path: "server/agents/architectural-knowledge-base.ts",
        size: "5,394 bytes",
        description: "Architectural knowledge and patterns database",
        priority: "medium"
      }
    ]
  }
];

export const MEMBER_JOURNEY_FILE_MAP: FilePathReference[] = [
  {
    category: "Member Interface (Core Revenue Driver)",
    files: [
      {
        name: "workspace.tsx",
        path: "client/src/pages/workspace.tsx", 
        size: "516 lines (23,220 bytes)",
        description: "Main member workspace - core member interface",
        priority: "critical"
      }
    ]
  },
  {
    category: "Creation Flow (TRAIN → SHOOT → STYLE → BUILD)",
    files: [
      {
        name: "simple-training.tsx", 
        path: "client/src/pages/simple-training.tsx",
        size: "58,438 bytes",
        description: "TRAIN step - member training interface",
        priority: "critical"
      },
      {
        name: "ai-photoshoot.tsx",
        path: "client/src/pages/ai-photoshoot.tsx", 
        size: "96,558 bytes",
        description: "SHOOT step - AI photoshoot interface",
        priority: "critical"
      },
      {
        name: "build.tsx",
        path: "client/src/pages/build.tsx",
        size: "240 bytes", 
        description: "BUILD step - build interface",
        priority: "critical"
      },
      {
        name: "victoria-builder.tsx",
        path: "client/src/pages/victoria-builder.tsx",
        size: "30,806 bytes",
        description: "Advanced builder - enhanced build interface", 
        priority: "high"
      }
    ]
  },
  {
    category: "Discovery & Conversion", 
    files: [
      {
        name: "editorial-landing.tsx",
        path: "client/src/pages/editorial-landing.tsx",
        size: "26,195 bytes",
        description: "Main editorial landing experience",
        priority: "critical"
      },
      {
        name: "pricing.tsx", 
        path: "client/src/pages/pricing.tsx",
        size: "21,427 bytes",
        description: "Pricing and subscription plans",
        priority: "critical"
      },
      {
        name: "checkout.tsx",
        path: "client/src/pages/checkout.tsx", 
        size: "9,417 bytes",
        description: "Payment and checkout flow",
        priority: "high"
      },
      {
        name: "about.tsx",
        path: "client/src/pages/about.tsx",
        size: "13,159 bytes", 
        description: "About page and brand story",
        priority: "medium"
      }
    ]
  },
  {
    category: "Galleries & Asset Libraries",
    files: [
      {
        name: "sselfie-gallery.tsx",
        path: "client/src/pages/sselfie-gallery.tsx",
        size: "26,293 bytes",
        description: "Member photo gallery interface", 
        priority: "high"
      },
      {
        name: "flatlay-library.tsx", 
        path: "client/src/pages/flatlay-library.tsx",
        size: "5,987 bytes",
        description: "Member asset library interface",
        priority: "high"
      }
    ]
  }
];

export class AgentFilePathGuide {
  /**
   * Get correct file path for common file references (not just member journey)
   */
  static getCommonPath(reference: string): string | null {
    const pathMap: Record<string, string> = {
      // Member journey files
      'workspace': 'client/src/pages/workspace.tsx',
      'train': 'client/src/pages/simple-training.tsx', 
      'training': 'client/src/pages/simple-training.tsx',
      'shoot': 'client/src/pages/ai-photoshoot.tsx',
      'photoshoot': 'client/src/pages/ai-photoshoot.tsx',
      'build': 'client/src/pages/build.tsx',
      'builder': 'client/src/pages/victoria-builder.tsx',
      'gallery': 'client/src/pages/sselfie-gallery.tsx',
      'flatlay': 'client/src/pages/flatlay-library.tsx',
      'landing': 'client/src/pages/editorial-landing.tsx',
      'pricing': 'client/src/pages/pricing.tsx',
      'checkout': 'client/src/pages/checkout.tsx',
      
      // Admin files
      'admin': 'client/src/pages/admin/',
      'admin-dashboard': 'client/src/pages/admin-dashboard.tsx',
      'admin-consulting': 'client/src/pages/admin-consulting-agents.tsx',
      'admin-business': 'client/src/pages/admin-business-overview.tsx',
      
      // Agent system files
      'agents': 'server/agents/',
      'agent-system': 'server/agents/',
      'tools': 'server/tools/',
      'routes': 'server/routes/'
    };
    
    return pathMap[reference.toLowerCase()] || null;
  }
  
  /**
   * Provide path correction suggestions for common mistakes
   */
  static suggestCorrectPath(attemptedPath: string): string {
    // Common directory mistakes agents make
    const corrections: Record<string, string> = {
      'client/src/pages/member/': 'Individual files at client/src/pages/ (no member subdirectory)',
      'client/src/pages/workspace/': 'client/src/pages/workspace.tsx (single file, not directory)',
      'client/src/pages/training/': 'client/src/pages/simple-training.tsx (single file)', 
      'client/src/pages/gallery/': 'client/src/pages/sselfie-gallery.tsx (single file)',
      'pages/member/': 'client/src/pages/ (individual .tsx files)',
      '**/member/**': 'client/src/pages/ (files are at root level)'
    };
    
    for (const [mistake, correction] of Object.entries(corrections)) {
      if (attemptedPath.includes(mistake.replace('*', ''))) {
        return correction;
      }
    }
    
    return 'Check client/src/pages/ for individual .tsx files (no subdirectories)';
  }
  
  /**
   * Get all important files (not just member journey) for comprehensive access
   */
  static getAllImportantFiles(): string[] {
    const memberFiles = MEMBER_JOURNEY_FILE_MAP
      .flatMap(category => category.files)
      .filter(file => file.priority === 'critical' || file.priority === 'high') 
      .map(file => file.path);
      
    const adminFiles = [
      'client/src/pages/admin-dashboard.tsx',
      'client/src/pages/admin-consulting-agents.tsx',
      'client/src/pages/admin-business-overview.tsx'
    ];
    
    const agentFiles = [
      'server/agents/',
      'server/tools/',
      'server/routes/'
    ];
    
    return [...memberFiles, ...adminFiles, ...agentFiles];
  }
  
  /**
   * Get only member journey files (for backwards compatibility)
   */
  static getAllMemberJourneyFiles(): string[] {
    return MEMBER_JOURNEY_FILE_MAP
      .flatMap(category => category.files)
      .filter(file => file.priority === 'critical' || file.priority === 'high') 
      .map(file => file.path);
  }
  
  /**
   * Validate if a path exists in the expected structure
   */
  static validateMemberJourneyPath(path: string): { valid: boolean; suggestion?: string } {
    const allValidPaths = MEMBER_JOURNEY_FILE_MAP
      .flatMap(category => category.files)
      .map(file => file.path);
      
    if (allValidPaths.includes(path)) {
      return { valid: true };
    }
    
    return {
      valid: false,
      suggestion: this.suggestCorrectPath(path)
    };
  }
  
  /**
   * Get agent system files guide for admin access - CRITICAL FOR AGENT ACCESS
   */
  static getAgentSystemGuide(): string {
    let guide = `
# 🤖 AGENT SYSTEM FILE ACCESS GUIDE
## All existing agent files with correct paths:

`;

    AGENT_SYSTEM_FILES.forEach(category => {
      guide += `### ${category.category}\n`;
      category.files.forEach(file => {
        guide += `- **${file.name}** (${file.priority})\n`;
        guide += `  Path: \`${file.path}\`\n`;
        guide += `  Size: ${file.size}\n`; 
        guide += `  ${file.description}\n\n`;
      });
    });

    guide += `
## 🚀 QUICK ACCESS COMMANDS:
- Use str_replace_based_edit_tool with exact paths above
- Example: str_replace_based_edit_tool view server/agents/codebase-understanding-intelligence.ts
- All paths start from project root (no leading ./)

## 🔍 SEARCH TIP: 
- Search for "agent" to find all agent-related files
- Use direct_file_access with path "server/agents" to list all agent files

## ⚠️ IMPORTANT: 
- File "admin-agent.ts" does NOT exist
- Use existing files listed above instead
`;

    return guide;
  }
}