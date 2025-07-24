/**
 * AGENT CRASH PREVENTION SYSTEM
 * Mandatory validation for all agents to prevent application crashes
 * Updates all agent personalities with bulletproof safety protocols
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const fsPromises = fs.promises;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AgentCrashPrevention {
  
  constructor() {
    this.mandatorySafetyProtocols = `
**🛡️ MANDATORY AGENT SAFETY PROTOCOLS - PREVENT ALL APPLICATION CRASHES**

CRITICAL: ALL AGENTS MUST FOLLOW THESE PROTOCOLS BEFORE CREATING/MODIFYING FILES

**🔗 FILE INTEGRATION PROTOCOL - ANALYZE FIRST DECISION TREE**
Before creating ANY file, agents MUST check:
✅ Does this file already exist? → MODIFY existing file
❌ Is this genuinely new functionality? → CREATE new file + navigation

EXAMPLES:
✅ CORRECT: "Redesign admin dashboard" → MODIFY client/src/pages/admin-dashboard.tsx
❌ WRONG: "Redesign admin dashboard" → CREATE admin-dashboard-redesigned.tsx

✅ CORRECT: "Improve user profile" → MODIFY client/src/pages/user-profile.tsx  
❌ WRONG: "Improve user profile" → CREATE user-profile-improved.tsx

NEVER create duplicate files for existing features - ALWAYS modify the existing file!

**STAGE 1: PRE-CREATION VALIDATION**
- NEVER use \`useUser\` hook → ALWAYS use \`useAuth\` from "@/hooks/use-auth"
- NEVER use \`AdminHero\` component → ALWAYS use \`AdminHeroSection\`
- NEVER use relative imports (../) → ALWAYS use absolute imports (@/)
- ALWAYS check JSX syntax for unclosed tags before creating files

**STAGE 2: MANDATORY IMPORT VALIDATION**
✅ CORRECT: \`import { useAuth } from "@/hooks/use-auth";\`
❌ WRONG: \`import { useUser } from "@/hooks/use-user";\`

✅ CORRECT: \`import AdminHeroSection from "@/components/admin/AdminHeroSection";\`
❌ WRONG: \`import AdminHero from "@/components/admin/AdminHero";\`

✅ CORRECT: \`import { Button } from "@/components/ui/button";\`
❌ WRONG: \`import { Button } from "../components/ui/button";\`

**STAGE 3: JSX STRUCTURE VALIDATION**
- Count opening and closing tags → MUST match exactly
- Verify all components have proper closing tags
- Check for incomplete ternary operators
- Validate proper React component structure

**STAGE 4: COMPONENT REFERENCE VALIDATION**
✅ CORRECT: \`const { user } = useAuth();\`
❌ WRONG: \`const { user } = useUser();\`

✅ CORRECT: \`<AdminHeroSection />\`
❌ WRONG: \`<AdminHero />\`

**STAGE 5: EMERGENCY DETECTION PATTERNS**
IF you detect ANY of these patterns in your code:
- \`useUser\` anywhere in file → STOP and fix to \`useAuth\`
- \`AdminHero\` without \`Section\` → STOP and fix to \`AdminHeroSection\`
- \`import\` with \`../\` → STOP and fix to \`@/\`
- Unclosed JSX tags → STOP and add missing closing tags
- Missing return statements → STOP and add proper return

**ABSOLUTE REQUIREMENTS:**
1. VALIDATE imports before creating any file
2. TEST JSX structure for syntax errors
3. VERIFY component references exist
4. CHECK for proper hook usage
5. CONFIRM file will not crash application

**IF VALIDATION FAILS:**
- DO NOT create the file
- FIX all issues first
- RE-VALIDATE before proceeding
- ONLY create files that pass ALL validation

**ZERO TOLERANCE POLICY:**
- No broken imports allowed
- No syntax errors allowed  
- No missing components allowed
- No application crashes allowed

This is MANDATORY for ALL agents. No exceptions.`;
  }

  /**
   * Updates all agent personalities with mandatory safety protocols
   */
  async updateAllAgentSafety() {
    console.log('🛡️ CRASH PREVENTION: Updating all agent personalities with mandatory safety protocols');
    
    try {
      // Read current agent personalities
      const agentPersonalitiesPath = path.join(__dirname, 'agent-personalities.ts');
      const content = await fsPromises.readFile(agentPersonalitiesPath, 'utf8');
      
      // Add safety protocols to each agent
      const agents = ['elena', 'aria', 'zara', 'maya', 'rachel', 'ava', 'quinn', 'sophia', 'martha', 'diana', 'wilma', 'olga', 'flux'];
      
      let updatedContent = content;
      
      agents.forEach(agentId => {
        // Find agent personality section
        const agentSectionRegex = new RegExp(`case '${agentId}':[\\s\\S]*?break;`, 'i');
        const match = updatedContent.match(agentSectionRegex);
        
        if (match) {
          const originalSection = match[0];
          
          // Only add safety protocols if not already present
          if (!originalSection.includes('MANDATORY AGENT SAFETY PROTOCOLS')) {
            const updatedSection = originalSection.replace(
              /instructions: `([\\s\\S]*?)`/,
              `instructions: \`$1

${this.mandatorySafetyProtocols}\``
            );
            
            updatedContent = updatedContent.replace(originalSection, updatedSection);
            console.log(`✅ CRASH PREVENTION: Added safety protocols to ${agentId}`);
          } else {
            console.log(`ℹ️ CRASH PREVENTION: ${agentId} already has safety protocols`);
          }
        }
      });
      
      // Write updated content
      await fsPromises.writeFile(agentPersonalitiesPath, updatedContent, 'utf8');
      console.log('✅ CRASH PREVENTION: All agent personalities updated with mandatory safety protocols');
      
      return { success: true, agentsUpdated: agents.length };
      
    } catch (error) {
      console.error('❌ CRASH PREVENTION: Failed to update agent personalities:', error);
      throw error;
    }
  }

  /**
   * Validates agent response for dangerous patterns
   */
  validateAgentResponse(agentId, response) {
    const dangerousPatterns = [
      { pattern: /useUser/g, severity: 'CRITICAL', message: 'Agent used banned useUser hook' },
      { pattern: /AdminHero(?!Section)/g, severity: 'CRITICAL', message: 'Agent used non-existent AdminHero component' },
      { pattern: /import.*\.\.\//, severity: 'HIGH', message: 'Agent used relative imports' },
      { pattern: /<[A-Z]\w*[^>]*(?<!\/)\s*$/gm, severity: 'HIGH', message: 'Agent created unclosed JSX tag' }
    ];
    
    const violations = [];
    
    dangerousPatterns.forEach(({ pattern, severity, message }) => {
      const matches = response.match(pattern);
      if (matches) {
        violations.push({
          agent: agentId,
          severity,
          message,
          count: matches.length,
          pattern: pattern.toString()
        });
      }
    });
    
    return {
      isValid: violations.length === 0,
      violations,
      riskLevel: violations.some(v => v.severity === 'CRITICAL') ? 'CRITICAL' : 
                 violations.some(v => v.severity === 'HIGH') ? 'HIGH' : 'LOW'
    };
  }

  /**
   * Emergency intervention for dangerous agent responses
   */
  emergencyIntervention(agentId, response, violations) {
    console.log(`🚨 EMERGENCY INTERVENTION: Agent ${agentId} created ${violations.length} dangerous patterns`);
    
    let fixedResponse = response;
    
    // Apply emergency fixes
    fixedResponse = fixedResponse.replace(/useUser/g, 'useAuth');
    fixedResponse = fixedResponse.replace(/AdminHero(?!Section)/g, 'AdminHeroSection');
    fixedResponse = fixedResponse.replace(/from\s*['"]\.\.\/lib\/hooks['"]/, 'from "@/hooks/use-auth"');
    fixedResponse = fixedResponse.replace(/from\s*['"]\.\.\/components\/admin\/AdminHero['"]/, 'from "@/components/admin/AdminHeroSection"');
    
    violations.forEach(violation => {
      console.log(`  🔧 FIXED: ${violation.message} (${violation.count} instances)`);
    });
    
    return {
      originalResponse: response,
      fixedResponse,
      fixesApplied: violations.length,
      intervention: true
    };
  }
}

export default new AgentCrashPrevention();