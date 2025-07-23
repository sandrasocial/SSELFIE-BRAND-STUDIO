/**
 * AGENT COORDINATION SYSTEM
 * Ensures all agents work together to modify existing files and integrate new components immediately
 */

export interface AgentCoordinationRequest {
  requestType: 'MODIFY_EXISTING' | 'CREATE_NEW' | 'REDESIGN';
  targetComponent: string;
  requestingAgent: string;
  description: string;
  files: string[];
  integrationNeeds: IntegrationNeed[];
}

export interface IntegrationNeed {
  type: 'ROUTING' | 'NAVIGATION' | 'IMPORT' | 'EXPORT' | 'PARENT_COMPONENT';
  file: string;
  action: string;
  dependencies: string[];
}

export interface CoordinationPlan {
  primaryAgent: string;
  supportingAgents: string[];
  fileOperations: FileOperation[];
  integrationSteps: IntegrationStep[];
  verificationSteps: VerificationStep[];
}

export interface FileOperation {
  type: 'CREATE' | 'MODIFY';
  file: string;
  agent: string;
  priority: number;
  dependencies: string[];
}

export interface IntegrationStep {
  step: string;
  agent: string;
  file: string;
  action: string;
  verifyAccess: boolean;
}

export interface VerificationStep {
  type: 'LIVE_PREVIEW' | 'ROUTING' | 'NAVIGATION' | 'IMPORTS';
  description: string;
  agent: string;
}

/**
 * Agent Coordination System
 */
export class AgentCoordinationSystem {
  
  /**
   * Coordinate agents to work on existing files instead of creating duplicates
   */
  static coordinateFileModification(request: AgentCoordinationRequest): CoordinationPlan {
    const plan: CoordinationPlan = {
      primaryAgent: request.requestingAgent,
      supportingAgents: [],
      fileOperations: [],
      integrationSteps: [],
      verificationSteps: []
    };

    if (request.requestType === 'MODIFY_EXISTING' || request.requestType === 'REDESIGN') {
      return this.createModificationPlan(request, plan);
    } else if (request.requestType === 'CREATE_NEW') {
      return this.createNewComponentPlan(request, plan);
    }

    return plan;
  }

  /**
   * Create plan for modifying existing files
   */
  private static createModificationPlan(request: AgentCoordinationRequest, plan: CoordinationPlan): CoordinationPlan {
    // Primary agent modifies the existing file
    plan.fileOperations.push({
      type: 'MODIFY',
      file: request.files[0],
      agent: request.requestingAgent,
      priority: 1,
      dependencies: []
    });

    // No routing changes needed for existing file modifications
    plan.verificationSteps.push({
      type: 'LIVE_PREVIEW',
      description: `Verify ${request.targetComponent} changes appear in Visual Editor`,
      agent: request.requestingAgent
    });

    return plan;
  }

  /**
   * Create plan for new components with immediate integration
   */
  private static createNewComponentPlan(request: AgentCoordinationRequest, plan: CoordinationPlan): CoordinationPlan {
    // Step 1: Create the component
    plan.fileOperations.push({
      type: 'CREATE',
      file: request.files[0],
      agent: request.requestingAgent,
      priority: 1,
      dependencies: []
    });

    // Step 2: Add routing (if needed)
    if (this.needsRouting(request)) {
      plan.integrationSteps.push({
        step: 'Add routing to App.tsx',
        agent: request.requestingAgent,
        file: 'client/src/App.tsx',
        action: `Import and add route for ${request.targetComponent}`,
        verifyAccess: true
      });

      // Support from Zara for routing integration
      plan.supportingAgents.push('zara');
    }

    // Step 3: Add navigation (if needed)
    if (this.needsNavigation(request)) {
      plan.integrationSteps.push({
        step: 'Add navigation links',
        agent: request.requestingAgent,
        file: 'client/src/components/Navigation.tsx',
        action: `Add ${request.targetComponent} to navigation menu`,
        verifyAccess: true
      });
    }

    // Step 4: Verify live preview access
    plan.verificationSteps.push(
      {
        type: 'ROUTING',
        description: `Verify ${request.targetComponent} is routable`,
        agent: request.requestingAgent
      },
      {
        type: 'LIVE_PREVIEW',
        description: `Confirm ${request.targetComponent} appears in Visual Editor dev preview`,
        agent: request.requestingAgent
      }
    );

    return plan;
  }

  /**
   * Check if component needs routing
   */
  private static needsRouting(request: AgentCoordinationRequest): boolean {
    return request.integrationNeeds.some(need => need.type === 'ROUTING') ||
           request.description.toLowerCase().includes('page') ||
           request.targetComponent.toLowerCase().includes('page');
  }

  /**
   * Check if component needs navigation
   */
  private static needsNavigation(request: AgentCoordinationRequest): boolean {
    return request.integrationNeeds.some(need => need.type === 'NAVIGATION') ||
           request.description.toLowerCase().includes('menu') ||
           request.description.toLowerCase().includes('nav');
  }

  /**
   * Generate agent communication message for coordination
   */
  static generateCoordinationMessage(plan: CoordinationPlan, request: AgentCoordinationRequest): string {
    let message = `🤝 **AGENT COORDINATION PLAN**\n\n`;
    message += `**Primary Agent:** ${plan.primaryAgent}\n`;
    message += `**Task:** ${request.description}\n`;
    message += `**Target:** ${request.targetComponent}\n\n`;

    if (plan.supportingAgents.length > 0) {
      message += `**Supporting Agents:** ${plan.supportingAgents.join(', ')}\n\n`;
    }

    message += `**File Operations:**\n`;
    plan.fileOperations.forEach((op, index) => {
      message += `${index + 1}. ${op.type} ${op.file} (${op.agent})\n`;
    });

    if (plan.integrationSteps.length > 0) {
      message += `\n**Integration Steps:**\n`;
      plan.integrationSteps.forEach((step, index) => {
        message += `${index + 1}. ${step.step} in ${step.file}\n`;
      });
    }

    message += `\n**Verification:**\n`;
    plan.verificationSteps.forEach((step, index) => {
      message += `${index + 1}. ${step.description}\n`;
    });

    message += `\n✅ **Result:** ${request.targetComponent} will be immediately accessible in Visual Editor dev preview`;

    return message;
  }
}

/**
 * Integration Protocol Rules for Agents
 */
export const AGENT_INTEGRATION_RULES = {
  // Rule 1: Always analyze before creating
  ANALYZE_BEFORE_CREATE: {
    description: "Check if files exist before creating new ones",
    tools: ["search_filesystem", "str_replace_based_edit_tool"],
    pattern: "ALWAYS check existing files first"
  },

  // Rule 2: Modify existing files for redesigns
  MODIFY_FOR_REDESIGNS: {
    description: "Use existing files for redesigns and improvements",
    keywords: ["redesign", "improve", "update", "enhance", "fix"],
    action: "MODIFY existing file, do NOT create new one"
  },

  // Rule 3: Immediate integration for new components
  IMMEDIATE_INTEGRATION: {
    description: "New components must be immediately accessible",
    requirements: [
      "Add to App.tsx routing if it's a page",
      "Update navigation if user needs access",
      "Import in parent component if it's a component",
      "Verify live preview accessibility"
    ]
  },

  // Rule 4: Agent communication for placement
  COORDINATE_PLACEMENT: {
    description: "Agents must communicate where components go",
    protocol: [
      "Announce file creation intentions",
      "Coordinate with other agents on placement",
      "Share integration requirements",
      "Verify successful integration"
    ]
  }
};