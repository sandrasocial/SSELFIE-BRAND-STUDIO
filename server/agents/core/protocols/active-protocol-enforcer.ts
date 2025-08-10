/**
 * CONSOLIDATED AGENT PROTOCOL ENFORCEMENT SYSTEM
 * Ensures all agents follow established protocols during execution
 * Created: August 10, 2025 - Response to agent protocol violations
 * Updated: August 10, 2025 - Consolidated with agent-protocol-enforcer for file validation
 */

import { FileIntegrationAnalyzer, INTEGRATION_RULES } from './mandatory-file-integration-protocol';
import { AGENT_SAFETY_PROTOCOLS } from './agent-safety-protocols';
import { AgentProtocolValidator } from '../validators/agent-protocol-validator';

export interface AgentTask {
  agentId: string;
  taskDescription: string;
  targetComponents?: string[];
  timestamp: number;
}

export interface ProtocolViolation {
  violationType: 'DUPLICATE_CREATION' | 'NO_INTEGRATION' | 'ORPHAN_COMPONENT' | 'IGNORE_EXISTING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  requiredActions: string[];
}

export interface ProtocolValidationResult {
  isValid: boolean;
  violations: ProtocolViolation[];
  approvedActions: string[];
  blockedActions: string[];
}

/**
 * ACTIVE PROTOCOL ENFORCER
 * Validates agent actions before execution
 */
export class ActiveProtocolEnforcer {
  
  /**
   * CRITICAL: Validate agent task before execution
   */
  static validateAgentTask(task: AgentTask): ProtocolValidationResult {
    const violations: ProtocolViolation[] = [];
    const approvedActions: string[] = [];
    const blockedActions: string[] = [];
    
    // 1. Check for component duplication
    const duplicateViolation = this.checkForDuplication(task);
    if (duplicateViolation) violations.push(duplicateViolation);
    
    // 2. Check for required integration
    const integrationViolation = this.checkIntegrationRequirements(task);
    if (integrationViolation) violations.push(integrationViolation);
    
    // 3. Check existing component enhancement vs new creation
    const enhancementCheck = this.checkEnhancementFirst(task);
    if (enhancementCheck.violation) violations.push(enhancementCheck.violation);
    
    // 4. Validate agent specialization compliance
    const specializationViolation = this.checkAgentSpecialization(task);
    if (specializationViolation) violations.push(specializationViolation);
    
    // Determine if task is valid
    const criticalViolations = violations.filter(v => v.severity === 'CRITICAL');
    const isValid = criticalViolations.length === 0;
    
    if (isValid) {
      approvedActions.push(`✅ Agent ${task.agentId} approved for: ${task.taskDescription}`);
    } else {
      blockedActions.push(`❌ Agent ${task.agentId} BLOCKED due to protocol violations`);
    }
    
    return {
      isValid,
      violations,
      approvedActions,
      blockedActions
    };
  }
  
  /**
   * Check if agent is trying to create components that already exist
   */
  private static checkForDuplication(task: AgentTask): ProtocolViolation | null {
    const { taskDescription, agentId } = task;
    
    // Keywords indicating creation when enhancement should be used
    const creationKeywords = ['create', 'new', 'build', 'make'];
    const componentKeywords = ['imageSelector', 'brandCustomizer', 'previewWindow', 'livePreview'];
    
    const isCreating = creationKeywords.some(keyword => 
      taskDescription.toLowerCase().includes(keyword)
    );
    
    const targetsExistingComponent = componentKeywords.some(keyword =>
      taskDescription.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isCreating && targetsExistingComponent) {
      return {
        violationType: 'DUPLICATE_CREATION',
        severity: 'CRITICAL',
        description: `Agent ${agentId} attempting to create components that already exist`,
        requiredActions: [
          'STOP creation of new components',
          'ENHANCE existing components instead',
          'USE existing: BrandCustomizer.tsx, ImageSelector.tsx, PreviewWindow.tsx, LivePreview.tsx'
        ]
      };
    }
    
    return null;
  }
  
  /**
   * Check if new components will be properly integrated
   */
  private static checkIntegrationRequirements(task: AgentTask): ProtocolViolation | null {
    const { taskDescription, agentId } = task;
    
    const isCreatingNewComponent = /create.*component|new.*component|build.*component/i.test(taskDescription);
    const mentionsIntegration = /routing|navigation|import|connect/i.test(taskDescription);
    
    if (isCreatingNewComponent && !mentionsIntegration) {
      return {
        violationType: 'NO_INTEGRATION',
        severity: 'HIGH',
        description: `Agent ${agentId} creating component without integration plan`,
        requiredActions: [
          'ADD component to App.tsx routing',
          'UPDATE navigation menus',
          'ENSURE component is accessible in UI',
          'TEST component functionality'
        ]
      };
    }
    
    return null;
  }
  
  /**
   * Check if agent should enhance existing instead of creating new
   */
  private static checkEnhancementFirst(task: AgentTask): { violation: ProtocolViolation | null } {
    const { taskDescription, agentId } = task;
    
    // Map of existing components that should be enhanced, not recreated
    const existingComponents: Record<string, string> = {
      'imageSelector': 'client/src/components/onboarding/ImageSelector.tsx',
      'brandCustomizer': 'client/src/components/onboarding/BrandCustomizer.tsx', 
      'previewWindow': 'client/src/components/preview/PreviewWindow.tsx',
      'livePreview': 'client/src/components/build/LivePreview.tsx',
      'realImageSelection': 'client/src/components/onboarding/RealImageSelection.tsx'
    };
    
    const targetComponent = Object.keys(existingComponents).find(component =>
      taskDescription.toLowerCase().includes(component.toLowerCase())
    );
    
    if (targetComponent && /create|new|build/i.test(taskDescription)) {
      return {
        violation: {
          violationType: 'IGNORE_EXISTING',
          severity: 'CRITICAL',
          description: `Agent ${agentId} ignoring existing ${targetComponent} component`,
          requiredActions: [
            `ENHANCE existing file: ${existingComponents[targetComponent]}`,
            'DO NOT create duplicate components',
            'IMPROVE existing functionality instead',
            'FOLLOW "modify existing first" protocol'
          ]
        }
      };
    }
    
    return { violation: null };
  }
  
  /**
   * Check if agent is following their specialization
   */
  private static checkAgentSpecialization(task: AgentTask): ProtocolViolation | null {
    const { agentId, taskDescription } = task;
    
    // Agent specialization rules from multi-agent-coordination.md
    const agentRoles = {
      'aria': 'Luxury UX Designer - enhance existing UI, not recreate',
      'zara': 'Technical implementation and optimization',
      'victoria': 'Business strategy and website building',
      'maya': 'AI photography and styling guidance',
      'elena': 'Master coordinator and workflow orchestration'
    };
    
    const agentRole = agentRoles[agentId as keyof typeof agentRoles];
    
    if (agentId === 'aria' && /create.*component|new.*component/i.test(taskDescription)) {
      return {
        violationType: 'IGNORE_EXISTING',
        severity: 'HIGH',
        description: `Aria should enhance existing UI components, not create new ones`,
        requiredActions: [
          'FOCUS on enhancing existing components',
          'IMPROVE styling and UX of current components',
          'DO NOT create duplicate components'
        ]
      };
    }
    
    return null;
  }
  
  /**
   * CONSOLIDATED FILE VALIDATION (from agent-protocol-enforcer)
   * Validates file creation and modification for protocol compliance
   */
  static async validateFileCreation(
    fileContent: string,
    filePath: string
  ): Promise<{ canProceed: boolean; errors?: string[]; fixedContent?: string }> {
    const isComponent = filePath.includes('/components/') || filePath.endsWith('.tsx');
    const validation = isComponent 
      ? AgentProtocolValidator.validateComponent(fileContent)
      : AgentProtocolValidator.validateSourceCode(fileContent);

    if (!validation.isValid) {
      const fixedContent = AgentProtocolValidator.autoFixImports(fileContent);
      const revalidation = isComponent
        ? AgentProtocolValidator.validateComponent(fixedContent)
        : AgentProtocolValidator.validateSourceCode(fixedContent);

      if (revalidation.isValid) {
        return { canProceed: true, fixedContent };
      }
      return { canProceed: false, errors: validation.errors };
    }
    return { canProceed: true };
  }

  /**
   * CONSOLIDATED PROTOCOL ENFORCEMENT (from agent-protocol-enforcer)
   */
  static async enforceProtocols(
    agentId: string,
    action: 'create' | 'modify',
    filePath: string,
    content: string
  ): Promise<{ success: boolean; message: string; fixedContent?: string; }> {
    try {
      const validation = await this.validateFileCreation(content, filePath);
      if (!validation.canProceed) {
        return {
          success: false,
          message: `Protocol violation by agent ${agentId}:\n${validation.errors?.join('\n')}`,
        };
      }
      if (validation.fixedContent) {
        return {
          success: true,
          message: 'Content auto-fixed to meet protocols',
          fixedContent: validation.fixedContent
        };
      }
      return { success: true, message: 'Content meets all safety protocols' };
    } catch (error) {
      return {
        success: false,
        message: `Protocol enforcement error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Generate protocol compliance report for agents
   */
  static generateComplianceGuide(agentId: string): string {
    return `
🤖 AGENT PROTOCOL COMPLIANCE GUIDE - ${agentId.toUpperCase()}

BEFORE STARTING ANY TASK:
✅ 1. CHECK if components already exist
✅ 2. ENHANCE existing components instead of creating new
✅ 3. INTEGRATE any new components immediately (routing + navigation)
✅ 4. FOLLOW your specialization role
✅ 5. TEST functionality before completion

EXISTING COMPONENTS TO ENHANCE (NOT RECREATE):
- BrandCustomizer.tsx ➜ Already has full customization interface
- ImageSelector.tsx ➜ Already has photo selection functionality  
- PreviewWindow.tsx ➜ Already has mobile/desktop toggle
- LivePreview.tsx ➜ Already has real-time preview system
- RealImageSelection.tsx ➜ Already connects to real user data

YOUR ROLE: ${this.getAgentRole(agentId)}

❌ CRITICAL VIOLATIONS TO AVOID:
- Creating components that already exist
- Making orphan components without integration
- Ignoring existing functionality
- Working outside your specialization

✅ APPROVED ACTIONS:
- Enhance existing component styling
- Improve existing component functionality  
- Add features to existing components
- Optimize existing component performance

PROTOCOL ENFORCER: Active validation system will block non-compliant tasks.
`;
  }
  
  private static getAgentRole(agentId: string): string {
    const roles = {
      'aria': 'Luxury UX Designer - enhance existing UI, improve styling, optimize UX',
      'zara': 'Technical Mastermind - code optimization, performance, deployment',
      'victoria': 'Business Strategy - website building, brand development',
      'maya': 'AI Photography - styling guidance, image generation',
      'elena': 'Master Coordinator - workflow orchestration, agent management'
    };
    
    return roles[agentId as keyof typeof roles] || 'Specialized agent - follow established protocols';
  }
}

/**
 * REAL-TIME PROTOCOL MONITOR
 * Tracks agent compliance in real-time
 */
class ProtocolMonitor {
  private static violations: ProtocolViolation[] = [];
  
  static logViolation(agentId: string, violation: ProtocolViolation): void {
    const timestampedViolation = {
      ...violation,
      agentId,
      timestamp: Date.now()
    };
    
    this.violations.push(timestampedViolation as any);
    
    console.log(`🚨 PROTOCOL VIOLATION: Agent ${agentId} - ${violation.description}`);
    console.log(`🔧 REQUIRED ACTIONS:`, violation.requiredActions);
  }
  
  static getViolationReport(): any[] {
    return this.violations;
  }
  
  static clearViolations(): void {
    this.violations = [];
  }
}

export { ActiveProtocolEnforcer as Enforcer, ProtocolMonitor };