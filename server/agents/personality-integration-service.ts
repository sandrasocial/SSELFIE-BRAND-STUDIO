/**
 * PERSONALITY INTEGRATION SERVICE
 * Eliminates broken generic systems and ensures agent personalities are properly used
 * Replaces generic routing with personality-first admin agent architecture
 */

import { PURE_PERSONALITIES, PersonalityManager } from './personalities/personality-config';

interface PersonalityContext {
  agentId: string;
  name: string;
  mission: string;
  capabilities: string[];
  adminPrivileges: boolean;
  enhancedPrompt: string;
}

export class PersonalityIntegrationService {
  private static instance: PersonalityIntegrationService;
  
  private constructor() {}
  
  public static getInstance(): PersonalityIntegrationService {
    if (!PersonalityIntegrationService.instance) {
      PersonalityIntegrationService.instance = new PersonalityIntegrationService();
    }
    return PersonalityIntegrationService.instance;
  }

  /**
   * ELIMINATE GENERIC ROUTING: Create personality-first agent context
   */
  createPersonalityContext(agentId: string, isAdminRequest: boolean = false): PersonalityContext {
    const agentPersonality = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
    const agentName = agentPersonality?.name || agentId;
    const mission = (agentPersonality as any)?.identity?.mission || (agentPersonality as any)?.mission || (agentPersonality as any)?.description || 'Expert assistance';

    console.log(`🤖 PERSONALITY ACTIVATION: ${agentName.toUpperCase()}`);
    console.log(`🎯 Mission: ${mission}`);
    console.log(`🔧 Admin Privileges: ${isAdminRequest ? 'FULL PROJECT ACCESS' : 'Standard access'}`);

    const capabilities = isAdminRequest ? [
      'FULL PROJECT ACCESS: Use tools directly to implement solutions',
      'UNRESTRICTED FILE EDITING: Modify any project files as needed',
      'DIRECT DATABASE ACCESS: Execute SQL queries and manage data', 
      'SYSTEM CONTROL: Run bash commands and restart services',
      'HYBRID INTELLIGENCE: Local processing optimization enabled'
    ] : ['Standard user access'];

    return {
      agentId,
      name: agentName,
      mission,
      capabilities,
      adminPrivileges: isAdminRequest,
      enhancedPrompt: this.createEnhancedPrompt(agentId, agentName, mission, isAdminRequest)
    };
  }

  /**
   * ENHANCED PERSONALITY PROMPT: Full personality integration with admin capabilities
   */
  private createEnhancedPrompt(agentId: string, agentName: string, mission: string, isAdminRequest: boolean): string {
    const basePersonality = PersonalityManager.getNaturalPrompt(agentId);
    
    return `${basePersonality}

🚨 CRITICAL CONTEXT: You are ${agentName}, Sandra's AI employee working on her SSELFIE STUDIO business launch strategy.

📋 YOUR ACTUAL JOB:
- Sandra is a single mom with 135K+ followers building SSELFIE Studio - an all-in-one personal branding platform
- Her vision: Replace €120-180+ monthly subscriptions (Canva, ChatGPT, photo editors, etc.) with one solution
- 5-step journey: TRAIN (AI model) → STYLE (Maya agent) → SHOOT (prompts) → BUILD (Victoria websites) → MANAGE
- She needs help determining what's ready for IMMEDIATE LAUNCH vs future development
- Current pricing vision: Creator €27/month, Entrepreneur €67/month
- You must analyze what's actually built vs what needs isolation for launch
- Your role is to be her autonomous business strategist and executor

🔧 ADMIN CAPABILITIES: ${isAdminRequest ? `
- FULL PROJECT ACCESS: Use bash, str_replace_based_edit_tool, search_filesystem proactively
- UNRESTRICTED FILE EDITING: Modify any project files to help Sandra's business
- DIRECT DATABASE ACCESS: Execute SQL queries and manage data
- SYSTEM CONTROL: Run bash commands, check file structure, restart services
- PROJECT AWARENESS: Use search_filesystem to understand current code structure
- AUTONOMOUS ACTION: Take initiative to analyze, audit, and implement solutions` : 'Standard user access'}

🎯 SANDRA'S IMMEDIATE NEEDS:
- Pricing strategy analysis (€27 Creator vs €67 Entrepreneur vs other options)
- Launch readiness assessment: What's built vs what needs future development
- Positioning and messaging simplification for immediate market entry
- User journey isolation: Which steps (TRAIN/STYLE/SHOOT/BUILD) are launch-ready
- Revenue model optimization based on existing infrastructure
- Long-term goal: Use success to sell admin agent ecosystem with Sandra as beta case study

⚡ WORK LIKE HER EMPLOYEE: Be proactive, use tools immediately to assess current state, coordinate with other agents, and provide business-focused solutions.

🧠 PERSONALITY INTEGRATION: Maintain your authentic ${agentName} personality while using full capabilities.
📋 WORK APPROACH: Take autonomous action, make real changes, deliver tangible results.
🎪 AGENT MISSION: ${mission}`;
  }

  /**
   * VALIDATE AGENT PERSONALITY: Ensure personality is properly loaded
   */
  validatePersonality(agentId: string): boolean {
    const personality = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
    if (!personality) {
      console.error(`❌ PERSONALITY ERROR: Agent ${agentId} has no personality definition`);
      return false;
    }
    
    console.log(`✅ PERSONALITY VALIDATED: ${personality.name} ready for activation`);
    return true;
  }
}