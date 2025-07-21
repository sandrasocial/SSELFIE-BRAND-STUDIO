/**
 * MANDATORY AGENT FILE INTEGRATION PROTOCOL
 * Prevents agents from creating new files when they should modify existing ones
 * Ensures all agent work integrates into the live application
 */

const fs = require('fs').promises;
const path = require('path');

class AgentFileIntegrationProtocol {
  
  constructor() {
    this.existingFiles = {
      'admin-dashboard': 'client/src/pages/admin-dashboard.tsx',
      'admin-dashboard-redesign': 'client/src/pages/admin-dashboard.tsx', // Same file!
      'user-profile': 'client/src/pages/user-profile.tsx',
      'build-feature': 'client/src/pages/build-feature.tsx',
      'workspace': 'client/src/pages/workspace.tsx',
      'landing': 'client/src/pages/landing.tsx'
    };

    this.mandatoryIntegrationRules = `
**🔗 MANDATORY AGENT FILE INTEGRATION PROTOCOL - PREVENT ORPHANED FILES**

CRITICAL: NEVER CREATE NEW FILES FOR EXISTING FEATURES - ALWAYS MODIFY EXISTING FILES

**STAGE 1: ANALYZE FIRST DECISION TREE**
Before creating ANY file, agents MUST check:
✅ Does this file already exist? → MODIFY existing file
❌ Is this genuinely new functionality? → CREATE new file + navigation

**STAGE 2: EXISTING FILE MAPPING**
- "Admin dashboard redesign" → MODIFY client/src/pages/admin-dashboard.tsx
- "User profile improvements" → MODIFY client/src/pages/user-profile.tsx  
- "Workspace enhancements" → MODIFY client/src/pages/workspace.tsx
- "Landing page updates" → MODIFY client/src/pages/landing.tsx
- "Build feature changes" → MODIFY client/src/pages/build-feature.tsx

**STAGE 3: INTEGRATION CHECKLIST (MANDATORY FOR ALL FILES)**
When modifying existing files:
1. ✅ Update the ACTUAL requested file (not a copy)
2. ✅ Preserve existing imports and structure
3. ✅ Test changes work in live preview
4. ✅ Ensure no broken references

When creating new files (ONLY if genuinely new):
1. ✅ Create file in correct location
2. ✅ Add routing to client/src/App.tsx
3. ✅ Update navigation components
4. ✅ Add imports where needed
5. ✅ Verify integration in live preview

**ABSOLUTE RULES:**
- NEVER create "admin-dashboard-redesigned.tsx" → ALWAYS modify "admin-dashboard.tsx"
- NEVER create duplicate files for existing features
- NEVER leave files orphaned without navigation
- ALWAYS integrate into live application immediately

**EXAMPLES:**
✅ CORRECT: "I need to redesign the admin dashboard" → Modify admin-dashboard.tsx
❌ WRONG: "I need to redesign the admin dashboard" → Create admin-dashboard-redesigned.tsx

✅ CORRECT: "Create a new blog system" → Create blog.tsx + add routing
❌ WRONG: "Improve user profile" → Create user-profile-improved.tsx

This protocol is MANDATORY. No exceptions.`;
  }

  /**
   * Determines if agent should modify existing file or create new one
   */
  async analyzeFileOperation(agentRequest, agentId) {
    console.log(`🔗 FILE INTEGRATION: Analyzing request for ${agentId}`);
    
    const request = agentRequest.toLowerCase();
    
    // Check for redesign/improvement keywords that should modify existing files
    const modifyKeywords = [
      'redesign', 'improve', 'enhance', 'update', 'fix', 'modify', 'change', 'edit'
    ];
    
    const pageKeywords = [
      'admin dashboard', 'user profile', 'workspace', 'landing page', 'build feature'
    ];
    
    const isModification = modifyKeywords.some(keyword => request.includes(keyword));
    const affectedPage = pageKeywords.find(page => request.includes(page));
    
    if (isModification && affectedPage) {
      const targetFile = this.getExistingFilePath(affectedPage);
      
      return {
        operation: 'MODIFY_EXISTING',
        targetFile,
        reason: `Request contains "${isModification}" for existing "${affectedPage}"`,
        instructions: `MODIFY ${targetFile} - DO NOT create new file`
      };
    }
    
    // Check if this is genuinely new functionality
    const createKeywords = ['create', 'build', 'add', 'new'];
    const isNewFeature = createKeywords.some(keyword => request.includes(keyword)) && !affectedPage;
    
    if (isNewFeature) {
      return {
        operation: 'CREATE_NEW',
        targetFile: null,
        reason: 'Request is for genuinely new functionality',
        instructions: 'CREATE new file + add routing + update navigation'
      };
    }
    
    return {
      operation: 'UNCLEAR',
      targetFile: null,
      reason: 'Cannot determine if this should modify existing or create new',
      instructions: 'ASK USER: Should this modify existing file or create new one?'
    };
  }

  /**
   * Gets the correct existing file path for a page
   */
  getExistingFilePath(pageType) {
    const mapping = {
      'admin dashboard': 'client/src/pages/admin-dashboard.tsx',
      'user profile': 'client/src/pages/user-profile.tsx',
      'workspace': 'client/src/pages/workspace.tsx',
      'landing page': 'client/src/pages/landing.tsx',
      'build feature': 'client/src/pages/build-feature.tsx'
    };
    
    return mapping[pageType] || null;
  }

  /**
   * Validates that agent is following integration protocol
   */
  validateAgentFileOperation(filePath, agentRequest) {
    const request = agentRequest.toLowerCase();
    
    // Critical validation: Prevent duplicate admin dashboard files
    if (filePath.includes('admin-dashboard-redesigned') || filePath.includes('admin-dashboard-new')) {
      return {
        isValid: false,
        error: 'CRITICAL: Agent trying to create duplicate admin dashboard file',
        correctAction: 'MODIFY client/src/pages/admin-dashboard.tsx instead',
        severity: 'CRITICAL'
      };
    }
    
    // Check for other duplicate file patterns
    const duplicatePatterns = [
      { pattern: /user-profile-(redesigned|new|improved)/, correct: 'client/src/pages/user-profile.tsx' },
      { pattern: /workspace-(redesigned|new|improved)/, correct: 'client/src/pages/workspace.tsx' },
      { pattern: /landing-(redesigned|new|improved)/, correct: 'client/src/pages/landing.tsx' }
    ];
    
    for (const { pattern, correct } of duplicatePatterns) {
      if (pattern.test(filePath)) {
        return {
          isValid: false,
          error: `Agent trying to create duplicate file: ${filePath}`,
          correctAction: `MODIFY ${correct} instead`,
          severity: 'HIGH'
        };
      }
    }
    
    return {
      isValid: true,
      message: 'File operation follows integration protocol'
    };
  }

  /**
   * Enforces integration protocol for all agents
   */
  async enforceIntegrationProtocol(agentId, agentResponse) {
    console.log(`🔗 PROTOCOL ENFORCEMENT: Checking ${agentId} response for integration compliance`);
    
    // Look for file creation patterns in agent response
    const filePatterns = [
      /client\/src\/pages\/admin-dashboard-redesigned\.tsx/g,
      /client\/src\/pages\/admin-dashboard-new\.tsx/g,
      /client\/src\/pages\/user-profile-improved\.tsx/g,
      /admin-dashboard-redesigned/g
    ];
    
    let violations = [];
    let fixedResponse = agentResponse;
    
    filePatterns.forEach(pattern => {
      const matches = agentResponse.match(pattern);
      if (matches) {
        violations.push({
          pattern: pattern.toString(),
          count: matches.length,
          severity: 'CRITICAL'
        });
        
        // Auto-fix the response
        fixedResponse = fixedResponse.replace(
          /admin-dashboard-redesigned/g, 
          'admin-dashboard'
        );
        fixedResponse = fixedResponse.replace(
          /client\/src\/pages\/admin-dashboard-redesigned\.tsx/g,
          'client/src/pages/admin-dashboard.tsx'
        );
      }
    });
    
    if (violations.length > 0) {
      console.log(`🚨 INTEGRATION VIOLATION: Agent ${agentId} tried to create duplicate files`);
      violations.forEach(v => {
        console.log(`  ❌ ${v.pattern} (${v.count} instances)`);
      });
      console.log(`🔧 AUTO-FIXED: Redirected to modify existing files`);
      
      return {
        originalResponse: agentResponse,
        fixedResponse,
        violations,
        protocolEnforced: true
      };
    }
    
    return {
      response: agentResponse,
      violations: [],
      protocolEnforced: false
    };
  }
}

module.exports = new AgentFileIntegrationProtocol();