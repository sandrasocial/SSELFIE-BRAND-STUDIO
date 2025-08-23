/**
 * PATH ENFORCER & BOUNDARY VALIDATION SYSTEM
 * Prevents chaos by enforcing strict path rules and agent boundaries
 */

import { AGENT_BOUNDARIES, PROTECTED_ZONES, PATH_RULES } from './agent-workspace';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  enforcedRules: string[];
}

export class PathEnforcer {
  static validateAgentAccess(agentName: string, requestedPath: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      enforcedRules: []
    };

    // Check if agent exists
    const agent = AGENT_BOUNDARIES[agentName];
    if (!agent) {
      result.isValid = false;
      result.errors.push(`Unknown agent: ${agentName}`);
      return result;
    }

    // Check protected zones first (CRITICAL)
    const isProtectedZone = Object.values(PROTECTED_ZONES).flat().some(zone => 
      requestedPath.startsWith(zone)
    );
    
    if (isProtectedZone) {
      result.isValid = false;
      result.errors.push(`PROTECTED ZONE: ${requestedPath} is in a protected zone and cannot be modified`);
      result.enforcedRules.push('Protected zone enforcement');
      return result;
    }

    // Check agent restrictions
    const isRestricted = agent.restrictedPaths.some(path => 
      requestedPath.startsWith(path)
    );
    
    if (isRestricted) {
      result.isValid = false;
      result.errors.push(`RESTRICTED ACCESS: ${agentName} cannot access ${requestedPath}`);
      result.enforcedRules.push('Agent boundary enforcement');
      return result;
    }

    // Check if path is in allowed paths
    const isAllowed = agent.allowedPaths.some(path => 
      requestedPath.startsWith(path)
    );
    
    if (!isAllowed) {
      result.isValid = false;
      result.errors.push(`UNAUTHORIZED PATH: ${requestedPath} is not in ${agentName}'s allowed paths`);
      result.enforcedRules.push('Agent workspace boundary');
      return result;
    }

    // TypeScript enforcement
    if (PATH_RULES.enforceTypeScript && requestedPath.endsWith('.js')) {
      result.warnings.push('Consider using TypeScript (.ts) instead of JavaScript (.js)');
      result.enforcedRules.push('TypeScript preference');
    }

    result.enforcedRules.push('Path validation passed');
    return result;
  }

  static getAgentNavigationGuide(agentName: string): string {
    const agent = AGENT_BOUNDARIES[agentName];
    if (!agent) return `Unknown agent: ${agentName}`;

    return `
🤖 AGENT WORKSPACE GUIDE - ${agent.name}

📁 ALLOWED PATHS:
${agent.allowedPaths.map(path => `  ✅ ${path}`).join('\n')}

🚫 RESTRICTED PATHS:
${agent.restrictedPaths.map(path => `  ❌ ${path}`).join('\n')}

⚡ CAPABILITIES:
${agent.capabilities.map(cap => `  🔧 ${cap}`).join('\n')}

🔍 REQUIRED CHECKS:
${agent.requiredChecks.map(check => `  📋 ${check}`).join('\n')}

🛡️ PROTECTED ZONES (NEVER MODIFY):
${Object.entries(PROTECTED_ZONES).map(([zone, paths]) => 
  `  🔒 ${zone}:\n${paths.map(path => `      - ${path}`).join('\n')}`
).join('\n')}
    `;
  }

  static preventDuplicates(filePath: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      enforcedRules: []
    };

    // Check for common duplicate patterns
    const duplicatePatterns = [
      'copy',
      'duplicate',
      'backup',
      'old',
      'new',
      'temp',
      '2',
      '3'
    ];

    const fileName = filePath.split('/').pop()?.toLowerCase() || '';
    const hasDuplicatePattern = duplicatePatterns.some(pattern => 
      fileName.includes(pattern)
    );

    if (hasDuplicatePattern) {
      result.warnings.push(`Potential duplicate file detected: ${filePath}`);
      result.enforcedRules.push('Duplicate prevention check');
    }

    return result;
  }

  static validateOwnership(agentName: string, filePath: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      enforcedRules: []
    };

    // Define file ownership patterns
    const ownershipMap = {
      'maya': ['/styling/', '/maya', '/fashion/'],
      'elena': ['/agents/', '/workflows/', '/coordination/'],
      'zara': ['/components/', '/ui/', '/frontend/'],
      'rachel': ['/content/', '/copy/', '/marketing/'],
      'victoria': ['/pages/', '/website/', '/builder/'],
      'olga': ['/organization/', '/cleanup/', '/docs/'],
      'diana': ['/business/', '/strategy/', '/revenue/'],
      'sophia': ['/social/', '/community/', '/campaigns/'],
      'quinn': ['/testing/', '/qa/', '/quality/'],
      'aria': ['/design/', '/ux/', '/visual/'],
      'ava': ['/automation/', '/workflows/', '/tasks/'],
      'martha': ['/advertising/', '/promotion/', '/ads/'],
      'flux': ['/training/', '/models/', '/ai/'],
      'atlas': ['/monitoring/', '/performance/', '/logs/'],
      'nova': ['/support/', '/onboarding/', '/success/']
    };

    const agentOwnership = ownershipMap[agentName] || [];
    const isOwnedByAgent = agentOwnership.some(pattern => 
      filePath.includes(pattern)
    );

    if (!isOwnedByAgent) {
      // Check if file is owned by another agent
      const otherOwner = Object.entries(ownershipMap).find(([owner, patterns]) => 
        owner !== agentName && patterns.some(pattern => filePath.includes(pattern))
      );

      if (otherOwner) {
        result.warnings.push(`File ownership: ${filePath} appears to be owned by ${otherOwner[0]}`);
        result.enforcedRules.push('Ownership awareness');
      }
    }

    return result;
  }
}

export const WORKSPACE_GUIDE = {
  newFeature: {
    startHere: '/client/src/features/',
    requiresTypes: true,
    ownershipCheck: true,
    steps: [
      '1. Define types in /shared/types/',
      '2. Create component in appropriate agent workspace',
      '3. Add to routing in /client/src/App.tsx',
      '4. Update documentation'
    ]
  },
  modifyExisting: {
    checkOwnership: true,
    requireApproval: true,
    updateDocs: true,
    steps: [
      '1. Verify agent has access to target files',
      '2. Check if file is owned by another agent',
      '3. Validate changes don\'t break protected systems',
      '4. Update related documentation'
    ]
  },
  organizationWork: {
    agentRequired: 'olga',
    safePaths: ['/tools/', '/docs/', '/scripts/'],
    protectedPaths: PROTECTED_ZONES,
    steps: [
      '1. Analyze current structure',
      '2. Create backup plan',
      '3. Execute changes safely',
      '4. Validate no breakage'
    ]
  }
};

export const BOUNDARY_RULES = {
  preventCrossAccess: true,
  enforceOwnership: true,
  requireApproval: true,
  trackChanges: true,
  protectRevenue: true,
  preserveUserData: true
};