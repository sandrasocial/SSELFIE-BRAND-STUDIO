/**
 * PHASE 1.3: ARCHIVE SYSTEM ANALYSIS & MIGRATION - IMPLEMENTATION DETECTOR
 * Systematically extracted from archive files per user instructions
 * 
 * STEP 1.1 ✅ COMPLETED: Located implementation detection systems in archive files  
 * STEP 1.2 ✅ COMPLETED: Extracted core logic patterns from agent-file-integration-protocol.js
 * STEP 1.3 ✅ IMPLEMENTING: Creating systematic file integration protocol system
 */

import type { Express } from "express";

export interface AgentImplementationRequest {
  agentId: string;
  message: string;
  requestType: 'MODIFY_EXISTING' | 'CREATE_NEW';
  targetFile?: string;
  confidence: number;
  reasoning: string[];
}

export interface FileIntegrationResult {
  operation: 'MODIFY_EXISTING' | 'CREATE_NEW' | 'BLOCK';
  targetFile?: string;
  allowed: boolean;
  instructions: string[];
  reason: string;
  error?: string;
}

/**
 * PHASE 1.3: FILE INTEGRATION PROTOCOL ENFORCER
 * Extracted from archive/agent-integrations/agent-file-integration-protocol.js
 */
export class Phase1ArchiveFileIntegrationProtocol {
  
  // Archive Pattern: Existing file mapping for modification detection
  private static readonly EXISTING_FILE_MAPPING = {
    'admin dashboard': {
      existingPath: 'client/src/components/admin/admin-dashboard.tsx',
      description: 'Sandra\'s admin command center',
      requiredActions: [
        'MODIFY existing admin-dashboard.tsx directly',
        'Update imports if adding new components',
        'Test changes appear in live preview'
      ]
    },
    'workspace': {
      existingPath: 'client/src/pages/workspace.tsx',
      description: 'Main user workspace interface',
      requiredActions: [
        'MODIFY existing workspace.tsx directly',
        'Preserve user data and session state',
        'Maintain luxury design patterns'
      ]
    },
    'landing page': {
      existingPath: 'client/src/pages/landing.tsx',
      description: 'Public landing page with hero and gallery',
      requiredActions: [
        'MODIFY existing landing.tsx directly',
        'Preserve marketing conversion elements',
        'Maintain SSELFIE brand styling'
      ]
    },
    'user profile': {
      existingPath: 'client/src/pages/user-profile.tsx',
      description: 'User account and subscription management',
      requiredActions: [
        'MODIFY existing user-profile.tsx directly',
        'Preserve authentication and billing logic',
        'Update UI components in place'
      ]
    }
  };

  /**
   * Archive Pattern: Direct file modification instruction system
   */
  static getDirectModificationInstructions(): string {
    return `
🚨 CRITICAL: DIRECT FILE MODIFICATION REQUIRED

When Sandra asks to "redesign the dashboard" or "modify this page":

❌ WRONG: Create separate files like "admin-dashboard-redesigned.tsx"
✅ CORRECT: Modify the ACTUAL file "admin-dashboard.tsx" directly

IMPLEMENTATION RULES:
1. **Identify Target File**: If Sandra says "redesign the dashboard", work on client/src/pages/admin-dashboard.tsx
2. **Direct Modification**: Replace existing content with new design, don't create new files
3. **Backup First**: Always create backup before modifying (filename.tsx.backup)
4. **Live Preview**: Modifications appear immediately in Sandra's live preview
5. **Integration Required**: If creating components, immediately add imports to target file

WORKFLOW EXAMPLE:
Sandra: "Redesign the dashboard"
Agent: 
1. Create backup: admin-dashboard.tsx.backup
2. Modify admin-dashboard.tsx directly with new design
3. Ensure all imports are updated
4. Test that changes appear in live preview

NO MORE SEPARATE FILES - WORK DIRECTLY ON WHAT SANDRA REQUESTS!
`;
  }

  /**
   * Archive Pattern: Implementation request detection with confidence scoring
   */
  static detectImplementationRequest(agentId: string, message: string): AgentImplementationRequest {
    const result: AgentImplementationRequest = {
      agentId: agentId.toLowerCase(),
      message,
      requestType: 'CREATE_NEW',
      confidence: 0,
      reasoning: []
    };

    // Archive Pattern: Implementation keywords that indicate action vs advice
    const implementationKeywords = [
      'create', 'build', 'implement', 'generate', 'make', 'develop', 'code',
      'fix', 'update', 'modify', 'refactor', 'redesign', 'optimize',
      'set up', 'setup', 'configure', 'install', 'deploy', 'launch'
    ];

    const fileOperationKeywords = [
      'file', 'component', 'page', 'route', 'api', 'database', 'schema', 'config',
      'style', 'css', 'html', 'tsx', 'ts', 'js', 'json', 'package'
    ];

    const systemActionKeywords = [
      'system', 'server', 'backend', 'frontend', 'production', 'deploy', 'test',
      'debug', 'monitor', 'performance', 'security', 'authentication'
    ];

    const messageLower = message.toLowerCase();
    
    // Archive Pattern: Confidence scoring
    let confidence = 0;
    
    if (implementationKeywords.some(keyword => messageLower.includes(keyword))) {
      confidence += 25;
      result.reasoning.push('Implementation keyword detected');
    }
    
    if (fileOperationKeywords.some(keyword => messageLower.includes(keyword))) {
      confidence += 20;
      result.reasoning.push('File operation keyword detected');
    }
    
    if (systemActionKeywords.some(keyword => messageLower.includes(keyword))) {
      confidence += 15;
      result.reasoning.push('System action keyword detected');
    }

    // Archive Pattern: Code patterns increase confidence
    if (/\.(js|ts|jsx|tsx|css|html|json|md)/.test(message)) {
      confidence += 15;
      result.reasoning.push('File extension detected');
    }

    if (/```/.test(message) || /`[^`]+`/.test(message)) {
      confidence += 10;
      result.reasoning.push('Code block detected');
    }

    // Archive Pattern: Directive language
    if (/please|can you|could you|need to|want to|should|must/.test(messageLower)) {
      confidence += 5;
      result.reasoning.push('Directive language detected');
    }

    result.confidence = confidence;
    
    return result;
  }

  /**
   * Archive Pattern: File operation analysis for existing vs new file determination
   */
  static analyzeFileOperation(message: string, agentId: string): FileIntegrationResult {
    console.log(`🔗 PHASE 1.3: Analyzing file operation for ${agentId}`);
    
    const messageLower = message.toLowerCase();
    
    // Archive Pattern: Check for redesign/improvement keywords that should modify existing files
    const modifyKeywords = [
      'redesign', 'improve', 'enhance', 'update', 'fix', 'modify', 'change', 'edit'
    ];
    
    const pageKeywords = Object.keys(this.EXISTING_FILE_MAPPING);
    
    const isModification = modifyKeywords.some(keyword => messageLower.includes(keyword));
    const affectedPage = pageKeywords.find(page => messageLower.includes(page));
    
    if (isModification && affectedPage) {
      const mapping = this.EXISTING_FILE_MAPPING[affectedPage as keyof typeof this.EXISTING_FILE_MAPPING];
      
      return {
        operation: 'MODIFY_EXISTING',
        targetFile: mapping.existingPath,
        allowed: true,
        reason: `Request contains modification keyword for existing "${affectedPage}"`,
        instructions: [
          `🎯 MODIFY EXISTING FILE: ${mapping.existingPath}`,
          `📋 Description: ${mapping.description}`,
          ...mapping.requiredActions.map(action => `✅ ${action}`)
        ]
      };
    }
    
    // Archive Pattern: Check if this is genuinely new functionality
    const createKeywords = ['create', 'build', 'add', 'new'];
    const isNewFeature = createKeywords.some(keyword => messageLower.includes(keyword)) && !affectedPage;
    
    if (isNewFeature) {
      return {
        operation: 'CREATE_NEW',
        allowed: true,
        reason: 'New feature creation detected',
        instructions: [
          '🆕 CREATE NEW FILE: Determine appropriate location',
          '🔗 ADD ROUTING: Update App.tsx with routes',
          '🧭 UPDATE NAVIGATION: Add links to new functionality',
          '🧪 TEST INTEGRATION: Verify file works in live preview'
        ]
      };
    }
    
    // Archive Pattern: Default to conversation mode for unclear requests
    return {
      operation: 'CREATE_NEW',
      allowed: true,
      reason: 'Default creation mode - no specific patterns detected',
      instructions: [
        '💬 CONVERSATION MODE: Clarify requirements with user',
        '🎯 IDENTIFY TARGET: Determine if modifying existing or creating new',
        '📋 GATHER SPECS: Understand full scope before implementation'
      ]
    };
  }

  /**
   * Archive Pattern: Enhanced system prompt building with file integration requirements
   */
  static buildEnhancedSystemPrompt(agentId: string, basePrompt: string, integrationResult: FileIntegrationResult): string {
    let enhancedPrompt = basePrompt;
    
    if (integrationResult.operation === 'MODIFY_EXISTING') {
      enhancedPrompt += `\n\n${this.getDirectModificationInstructions()}`;
      
      enhancedPrompt += `\n\n🎯 TARGET FILE IDENTIFIED: ${integrationResult.targetFile}
MANDATORY REQUIREMENTS:
${integrationResult.instructions.join('\n')}

CRITICAL: Work on the ACTUAL file Sandra requested. NO separate redesigned versions!`;
    } else if (integrationResult.operation === 'CREATE_NEW') {
      enhancedPrompt += `\n\n🆕 NEW FILE CREATION MODE
INTEGRATION CHECKLIST:
${integrationResult.instructions.join('\n')}

Remember: New files must be properly integrated into the application with routing and navigation!`;
    }
    
    return enhancedPrompt;
  }
}

/**
 * Archive Pattern: Tool choice configuration for implementation enforcement
 */
export class Phase1ToolChoiceEnforcement {
  
  static shouldEnforceToolChoice(request: AgentImplementationRequest): boolean {
    // Archive Pattern: Confidence threshold for tool enforcement
    return request.confidence >= 60; // High confidence threshold for tool forcing
  }
  
  static buildToolChoiceConfig(enforce: boolean): object {
    if (enforce) {
      return {
        tool_choice: {
          type: "tool",
          name: "str_replace_based_edit_tool"
        }
      };
    }
    return {};
  }
}

// Export singleton instance for integration
export const phase1ArchiveImplementationDetector = {
  Phase1ArchiveFileIntegrationProtocol,
  Phase1ToolChoiceEnforcement
};