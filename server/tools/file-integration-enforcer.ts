// SSELFIE STUDIO - FILE INTEGRATION ENFORCEMENT TOOL
// Universal tool to prevent conflicting file creation patterns

import { FileIntegrationProtocolEnforcer, EXISTING_FILE_MAPPING } from '../file-integration-protocol';
import path from 'path';

interface AgentRequest {
  agentId: string;
  message: string;
  requestType: string;
  filePath?: string;
}

interface EnforcementResult {
  allowed: boolean;
  action: 'MODIFY' | 'CREATE' | 'BLOCK';
  targetFile?: string;
  error?: string;
  instructions: string[];
}

export class FileIntegrationEnforcer {
  
  static enforceIntegrationProtocol(request: AgentRequest): EnforcementResult {
    console.log(`🔗 INTEGRATION ENFORCER: Checking ${request.agentId} request for compliance`);
    
    const { agentId, message, requestType, filePath } = request;
    const messageText = message.toLowerCase();
    
    // Detect existing feature modification patterns
    const existingFeatures = Object.keys(EXISTING_FILE_MAPPING);
    
    for (const feature of existingFeatures) {
      if (messageText.includes(feature) && 
          (messageText.includes('redesign') || 
           messageText.includes('improve') || 
           messageText.includes('enhance') ||
           messageText.includes('update'))) {
        
        const mapping = EXISTING_FILE_MAPPING[feature];
        return {
          allowed: true,
          action: 'MODIFY',
          targetFile: mapping.existingPath,
          instructions: [
            `🎯 MODIFY EXISTING FILE: ${mapping.existingPath}`,
            `📋 Description: ${mapping.description}`,
            ...mapping.requiredActions.map(action => `✅ ${action}`)
          ]
        };
      }
    }
    
    // Check for duplicate file creation attempts
    if (filePath) {
      const validation = FileIntegrationProtocolEnforcer.validateRequest(requestType, filePath);
      
      if (!validation.isValid) {
        return {
          allowed: false,
          action: 'BLOCK',
          error: validation.error,
          instructions: [
            `🚫 BLOCKED: ${validation.error}`,
            `✅ CORRECT ACTION: ${validation.correctAction}`,
            `⚠️  SEVERITY: ${validation.severity}`
          ]
        };
      }
    }
    
    // Allow new file creation with integration requirements
    return {
      allowed: true,
      action: 'CREATE',
      targetFile: filePath,
      instructions: [
        '✅ New file creation approved',
        '🔗 MANDATORY: Follow 5-step integration checklist',
        '📋 1. Update routing (App.tsx) if this is a page',
        '📋 2. Import component in parent component',
        '📋 3. Add navigation links if user-accessible',
        '📋 4. Verify TypeScript compilation',
        '📋 5. Test in live preview'
      ]
    };
  }
  
  static analyzeRequestPatterns(message: string): {
    isFileRequest: boolean;
    isExistingFeature: boolean;
    detectedFeature?: string;
    suggestedAction: string;
  } {
    const messageText = message.toLowerCase();
    
    // Detect file-related requests
    const fileKeywords = ['create', 'build', 'design', 'implement', 'make', 'add'];
    const isFileRequest = fileKeywords.some(keyword => messageText.includes(keyword));
    
    // Detect existing feature modifications
    const existingFeatures = Object.keys(EXISTING_FILE_MAPPING);
    const detectedFeature = existingFeatures.find(feature => messageText.includes(feature));
    
    let suggestedAction = 'CREATE';
    if (detectedFeature && (messageText.includes('redesign') || 
                           messageText.includes('improve') || 
                           messageText.includes('enhance'))) {
      suggestedAction = 'MODIFY';
    }
    
    return {
      isFileRequest,
      isExistingFeature: !!detectedFeature,
      detectedFeature,
      suggestedAction
    };
  }
  
  static generateIntegrationInstructions(filePath: string, action: 'MODIFY' | 'CREATE'): string[] {
    const instructions = [];
    
    if (action === 'MODIFY') {
      instructions.push(
        '🔧 MODIFICATION PROTOCOL:',
        '✅ Open existing file using str_replace_based_edit_tool',
        '✅ Preserve existing imports and structure',
        '✅ Make targeted improvements only',
        '✅ Test changes work in live preview',
        '✅ Verify no TypeScript errors'
      );
    } else {
      instructions.push(
        '🆕 CREATION PROTOCOL:',
        '✅ Create file using str_replace_based_edit_tool',
        '✅ Add proper TypeScript types and imports',
        '✅ Follow SSELFIE luxury design standards'
      );
      
      if (filePath.includes('pages/')) {
        instructions.push('🚨 PAGE DETECTED: MUST add routing to App.tsx');
      }
      
      if (filePath.includes('components/')) {
        instructions.push('🚨 COMPONENT DETECTED: MUST import in parent component');
      }
      
      instructions.push(
        '✅ Update navigation if user-accessible',
        '✅ Test integration in live preview',
        '✅ Verify all functionality works'
      );
    }
    
    return instructions;
  }
  
  static trackViolations(agentId: string, violation: string): void {
    console.log(`🚨 INTEGRATION VIOLATION: Agent ${agentId} - ${violation}`);
    // Could be extended to track metrics for optimization
  }
  
  static generateComplianceReport(): {
    totalRequests: number;
    blockedRequests: number;
    modificationRedirects: number;
    newFileCreations: number;
    complianceRate: number;
  } {
    // Basic reporting structure - could be enhanced with real tracking
    return {
      totalRequests: 0,
      blockedRequests: 0,
      modificationRedirects: 0,
      newFileCreations: 0,
      complianceRate: 100
    };
  }
}

// Helper function to detect common duplicate file patterns
export const DUPLICATE_FILE_PATTERNS = [
  { pattern: /admin-dashboard-(redesigned|new|v2|improved)/, correct: 'admin-dashboard.tsx' },
  { pattern: /user-profile-(redesigned|new|v2|improved)/, correct: 'user-profile.tsx' },
  { pattern: /workspace-(redesigned|new|v2|improved)/, correct: 'workspace.tsx' },
  { pattern: /landing-(redesigned|new|v2|improved)/, correct: 'landing.tsx' },
  { pattern: /build-feature-(redesigned|new|v2|improved)/, correct: 'build-feature.tsx' }
];

export const INTEGRATION_ENFORCEMENT_CONFIG = {
  version: '2.1.0',
  enforcement: 'ACTIVE',
  preventDuplicates: true,
  requireIntegration: true,
  trackViolations: true
};