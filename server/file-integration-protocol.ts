// SSELFIE STUDIO - STANDARDIZED FILE INTEGRATION PROTOCOL
// Eliminates conflicting file creation patterns across all agents

export interface FileIntegrationRule {
  existingPath: string;
  description: string;
  requiredActions: string[];
}

export const EXISTING_FILE_MAPPING: Record<string, FileIntegrationRule> = {
  'admin-dashboard': {
    existingPath: 'client/src/components/admin/admin-dashboard.tsx',
    description: 'Admin dashboard redesign/improvements',
    requiredActions: ['MODIFY existing file', 'Update navigation if needed', 'Test functionality']
  },
  'user-profile': {
    existingPath: 'client/src/pages/user-profile.tsx',
    description: 'User profile enhancements',
    requiredActions: ['MODIFY existing file', 'Update imports', 'Preserve user data']
  },
  'workspace': {
    existingPath: 'client/src/pages/workspace.tsx',
    description: 'Workspace interface improvements',
    requiredActions: ['MODIFY existing file', 'Update components', 'Test UI changes']
  },
  'landing': {
    existingPath: 'client/src/pages/landing.tsx',
    description: 'Landing page updates',
    requiredActions: ['MODIFY existing file', 'Update hero/content', 'Test responsive design']
  },
  'build-feature': {
    existingPath: 'client/src/pages/build-feature.tsx',
    description: 'Build feature enhancements',
    requiredActions: ['MODIFY existing file', 'Update workflow', 'Test generation system']
  }
};

export const FILE_INTEGRATION_PROTOCOL = `
## 🔗 MANDATORY FILE INTEGRATION PROTOCOL

**CRITICAL RULE: NEVER CREATE DUPLICATE FILES FOR EXISTING FEATURES**

### STAGE 1: ANALYZE FIRST DECISION TREE
Before creating ANY file, agents MUST:
✅ Check if functionality already exists → MODIFY existing file
❌ Only create new files for genuinely new features

### STAGE 2: EXISTING FILE MAPPING
${Object.entries(EXISTING_FILE_MAPPING).map(([key, rule]) => 
  `- "${key}" requests → MODIFY ${rule.existingPath}`
).join('\n')}

### STAGE 3: 5-STEP INTEGRATION CHECKLIST (MANDATORY)
1. ✅ **Update Routing**: Add routes to client/src/App.tsx if new page
2. ✅ **Update Parent Components**: Import and use components where needed  
3. ✅ **Update Navigation**: Add links to relevant navigation components
4. ✅ **Verify Imports**: Ensure all TypeScript imports are valid
5. ✅ **Test Integration**: Confirm file works in live preview

### STAGE 4: ARCHITECTURE COMPLIANCE
- Components: client/src/components/[category]/
- Pages: client/src/pages/
- Utilities: client/src/lib/
- Types: shared/schema.ts

### STAGE 5: INTEGRATION VERIFICATION
✅ File accessible in UI
✅ Navigation links functional
✅ No TypeScript errors
✅ Live preview working
`;

export class FileIntegrationProtocolEnforcer {
  static validateRequest(requestType: string, filePath: string): {
    isValid: boolean;
    error?: string;
    correctAction?: string;
    severity: 'LOW' | 'HIGH' | 'CRITICAL';
  } {
    const request = requestType.toLowerCase();
    
    // Check for duplicate admin dashboard files
    if (filePath.includes('admin-dashboard-redesigned') || 
        filePath.includes('admin-dashboard-new') ||
        filePath.includes('admin-dashboard-v2')) {
      return {
        isValid: false,
        error: 'CRITICAL: Agent attempting to create duplicate admin dashboard file',
        correctAction: 'MODIFY client/src/components/admin/admin-dashboard.tsx instead',
        severity: 'CRITICAL'
      };
    }

    // Check for other duplicate patterns
    const duplicatePatterns = [
      { pattern: /user-profile-(redesigned|new|improved|v2)/, correct: 'client/src/pages/user-profile.tsx' },
      { pattern: /workspace-(redesigned|new|improved|v2)/, correct: 'client/src/pages/workspace.tsx' },
      { pattern: /landing-(redesigned|new|improved|v2)/, correct: 'client/src/pages/landing.tsx' }
    ];
    
    for (const { pattern, correct } of duplicatePatterns) {
      if (pattern.test(filePath)) {
        return {
          isValid: false,
          error: `Agent attempting duplicate file creation: ${filePath}`,
          correctAction: `MODIFY ${correct} instead`,
          severity: 'HIGH'
        };
      }
    }
    
    return {
      isValid: true,
      severity: 'LOW'
    };
  }

  static getIntegrationRequirements(filePath: string): string[] {
    const requirements = [
      'Update App.tsx routing if this is a new page',
      'Import component in parent where it will be used',
      'Add navigation links if user-accessible',
      'Verify TypeScript compilation',
      'Test in live preview'
    ];

    // Add specific requirements based on file type
    if (filePath.includes('pages/')) {
      requirements.unshift('This is a page - MUST add routing to App.tsx');
    }
    
    if (filePath.includes('components/')) {
      requirements.unshift('This is a component - MUST import in parent component');
    }

    return requirements;
  }

  static generateComplianceReport(): {
    protocolVersion: string;
    enforcementActive: boolean;
    preventedDuplicates: number;
    integrationRate: number;
  } {
    return {
      protocolVersion: '2.1.0',
      enforcementActive: true,
      preventedDuplicates: 0, // Will be tracked in implementation
      integrationRate: 100
    };
  }
}

export const INTEGRATION_SUCCESS_CRITERIA = {
  fileCreated: 'File exists and is accessible',
  routingAdded: 'Route added to App.tsx (for pages)',
  navigationUpdated: 'Navigation links functional',
  importsValid: 'No TypeScript compilation errors',
  livePreview: 'File works in development preview',
  userAccessible: 'Users can navigate to and use the feature'
};