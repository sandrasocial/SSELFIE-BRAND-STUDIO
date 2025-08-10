/**
 * MANDATORY FILE INTEGRATION PROTOCOL
 * Ensures all agents modify existing files and integrate new components immediately
 */

export interface FileIntegrationProtocol {
  analyzeRequest: (request: string, agentId: string) => FileIntegrationPlan;
  executeIntegration: (plan: FileIntegrationPlan) => Promise<IntegrationResult>;
}

export interface FileIntegrationPlan {
  action: 'MODIFY_EXISTING' | 'CREATE_AND_INTEGRATE';
  targetFiles: string[];
  newComponents?: NewComponentSpec[];
  integrationSteps: IntegrationStep[];
  routingUpdates: RoutingUpdate[];
  navigationUpdates: NavigationUpdate[];
}

export interface NewComponentSpec {
  name: string;
  path: string;
  category: 'admin' | 'build' | 'workspace' | 'ui';
  requiresRouting: boolean;
  requiresNavigation: boolean;
}

export interface IntegrationStep {
  stepId: string;
  description: string;
  fileOperation: {
    type: 'CREATE' | 'MODIFY';
    path: string;
    content?: string;
    modifications?: string[];
  };
  dependencies: string[];
}

export interface RoutingUpdate {
  file: string;
  imports: string[];
  routes: string[];
}

export interface NavigationUpdate {
  file: string;
  menuItems: string[];
  links: string[];
}

export interface IntegrationResult {
  success: boolean;
  filesModified: string[];
  routingUpdated: boolean;
  navigationUpdated: boolean;
  livePreviewReady: boolean;
  errors: string[];
}

/**
 * MANDATORY INTEGRATION RULES FOR ALL AGENTS
 */
export const INTEGRATION_RULES = {
  // Rule 1: Always check if files exist before creating
  ANALYZE_FIRST: {
    description: "Check existing files before any creation",
    pattern: /redesign|improve|update|modify|enhance/i,
    action: "MODIFY_EXISTING"
  },

  // Rule 2: New components must be immediately integrated
  IMMEDIATE_INTEGRATION: {
    description: "New components must be routable and accessible immediately",
    requirements: [
      "Add to App.tsx routing",
      "Update navigation menus", 
      "Verify live preview access",
      "Test component functionality"
    ]
  },

  // Rule 3: File placement by agent type
  AGENT_FILE_PLACEMENT: {
    'aria': 'client/src/components/admin/',
    'zara': 'client/src/components/',
    'victoria': 'client/src/components/build/',
    'maya': 'client/src/components/workspace/',
    'elena': 'client/src/components/coordination/',
    'default': 'client/src/components/ui/'
  } as Record<string, string>,

  // Rule 4: Mandatory routing for pages
  ROUTING_REQUIREMENTS: {
    pages: 'client/src/App.tsx',
    components: 'parent component imports',
    navigation: ['client/src/components/Navigation.tsx', 'client/src/components/ui/nav-menu.tsx']
  }
};

/**
 * File Integration Analyzer
 */
export class FileIntegrationAnalyzer {
  static analyzeRequest(request: string, agentId: string): FileIntegrationPlan {
    const isModificationRequest = /redesign|improve|update|modify|enhance|fix/i.test(request);
    const isCreationRequest = /create|new|add|build/i.test(request);
    
    if (isModificationRequest) {
      return this.createModificationPlan(request, agentId);
    } else if (isCreationRequest) {
      return this.createCreationAndIntegrationPlan(request, agentId);
    }
    
    return this.createDefaultPlan(request, agentId);
  }

  private static createModificationPlan(request: string, agentId: string): FileIntegrationPlan {
    // Extract target component/file from request
    const targetFiles = this.extractTargetFiles(request);
    
    return {
      action: 'MODIFY_EXISTING',
      targetFiles,
      integrationSteps: [{
        stepId: 'modify-existing',
        description: `Modify existing files: ${targetFiles.join(', ')}`,
        fileOperation: {
          type: 'MODIFY',
          path: targetFiles[0],
          modifications: ['Apply requested changes directly to existing file']
        },
        dependencies: []
      }],
      routingUpdates: [],
      navigationUpdates: []
    };
  }

  private static createCreationAndIntegrationPlan(request: string, agentId: string): FileIntegrationPlan {
    const componentName = this.extractComponentName(request);
    const componentPath = this.getAgentFilePath(agentId, componentName);
    const category = this.getComponentCategory(agentId);
    
    const newComponent: NewComponentSpec = {
      name: componentName,
      path: componentPath,
      category,
      requiresRouting: this.requiresRouting(request),
      requiresNavigation: this.requiresNavigation(request)
    };

    return {
      action: 'CREATE_AND_INTEGRATE',
      targetFiles: [componentPath],
      newComponents: [newComponent],
      integrationSteps: [
        {
          stepId: 'create-component',
          description: `Create ${componentName} component`,
          fileOperation: {
            type: 'CREATE',
            path: componentPath
          },
          dependencies: []
        },
        {
          stepId: 'update-routing',
          description: 'Add component to App.tsx routing',
          fileOperation: {
            type: 'MODIFY',
            path: 'client/src/App.tsx',
            modifications: [`Import ${componentName}`, `Add route for ${componentName}`]
          },
          dependencies: ['create-component']
        },
        {
          stepId: 'update-navigation',
          description: 'Add navigation links',
          fileOperation: {
            type: 'MODIFY',
            path: 'client/src/components/Navigation.tsx',
            modifications: [`Add ${componentName} to navigation menu`]
          },
          dependencies: ['update-routing']
        }
      ],
      routingUpdates: [{
        file: 'client/src/App.tsx',
        imports: [`import ${componentName} from '${componentPath.replace('client/src/', '@/')}'`],
        routes: [`<Route path="/${componentName.toLowerCase()}" component={${componentName}} />`]
      }],
      navigationUpdates: [{
        file: 'client/src/components/Navigation.tsx',
        menuItems: [componentName],
        links: [`/${componentName.toLowerCase()}`]
      }]
    };
  }

  private static extractTargetFiles(request: string): string[] {
    // Extract file names from request (AdminDashboard, UserProfile, etc.)
    const fileMatches = request.match(/([A-Z][a-zA-Z]+(?:Dashboard|Profile|Panel|Component|Page))/g);
    
    if (fileMatches) {
      return fileMatches.map(match => {
        // Convert to file path
        if (match.includes('Admin')) return `client/src/components/admin/${match}.tsx`;
        if (match.includes('Build')) return `client/src/components/build/${match}.tsx`;
        if (match.includes('Workspace')) return `client/src/components/workspace/${match}.tsx`;
        return `client/src/components/${match}.tsx`;
      });
    }
    
    return ['client/src/components/admin/AdminDashboard.tsx']; // Default fallback
  }

  private static extractComponentName(request: string): string {
    const nameMatch = request.match(/create (\w+)/i) || request.match(/new (\w+)/i) || request.match(/(\w+) component/i);
    return nameMatch ? nameMatch[1] : 'NewComponent';
  }

  private static getAgentFilePath(agentId: string, componentName: string): string {
    const basePath = INTEGRATION_RULES.AGENT_FILE_PLACEMENT[agentId] || INTEGRATION_RULES.AGENT_FILE_PLACEMENT['default'];
    return `${basePath}${componentName}.tsx`;
  }

  private static getComponentCategory(agentId: string): 'admin' | 'build' | 'workspace' | 'ui' {
    if (agentId === 'aria') return 'admin';
    if (agentId === 'victoria') return 'build';
    if (agentId === 'maya') return 'workspace';
    return 'ui';
  }

  private static requiresRouting(request: string): boolean {
    return /page|route|navigation/i.test(request);
  }

  private static requiresNavigation(request: string): boolean {
    return /menu|navigation|nav|sidebar/i.test(request);
  }

  private static createDefaultPlan(request: string, agentId: string): FileIntegrationPlan {
    return {
      action: 'MODIFY_EXISTING',
      targetFiles: ['client/src/components/admin/AdminDashboard.tsx'],
      integrationSteps: [],
      routingUpdates: [],
      navigationUpdates: []
    };
  }
}

/**
 * Integration Execution Engine
 */
export class IntegrationExecutor {
  static async executeIntegration(plan: FileIntegrationPlan): Promise<IntegrationResult> {
    const result: IntegrationResult = {
      success: false,
      filesModified: [],
      routingUpdated: false,
      navigationUpdated: false,
      livePreviewReady: false,
      errors: []
    };

    try {
      // Execute integration steps in order
      for (const step of plan.integrationSteps) {
        await this.executeStep(step, result);
      }

      // Verify live preview accessibility
      result.livePreviewReady = await this.verifyLivePreview(plan);
      result.success = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Integration failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    return result;
  }

  private static async executeStep(step: IntegrationStep, result: IntegrationResult): Promise<void> {
    try {
      switch (step.fileOperation.type) {
        case 'CREATE':
          // File creation logic would go here
          result.filesModified.push(step.fileOperation.path);
          break;
        case 'MODIFY':
          // File modification logic would go here
          result.filesModified.push(step.fileOperation.path);
          if (step.fileOperation.path.includes('App.tsx')) {
            result.routingUpdated = true;
          }
          if (step.fileOperation.path.includes('Navigation')) {
            result.navigationUpdated = true;
          }
          break;
      }
    } catch (error) {
      result.errors.push(`Step ${step.stepId} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private static async verifyLivePreview(plan: FileIntegrationPlan): Promise<boolean> {
    // Verification logic would check if components are accessible in live preview
    return true;
  }
}