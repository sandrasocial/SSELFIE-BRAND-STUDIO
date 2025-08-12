/**
 * PERSONALITY INTEGRATION SERVICE
 * Eliminates broken generic systems and ensures agent personalities are properly used
 * Replaces generic routing with personality-first admin agent architecture
 */

import { PURE_PERSONALITIES } from './personalities/pure-personalities';
import { PersonalityManager } from './personalities/personality-manager';

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
    const mission = agentPersonality?.identity?.mission || agentPersonality?.mission || 'Expert assistance';

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

🎯 CURRENT MISSION: You are ${agentName}, working on SSELFIE Studio project with direct admin access.

🔧 ADMIN CAPABILITIES: ${isAdminRequest ? `
- FULL PROJECT ACCESS: Use tools directly to implement solutions
- UNRESTRICTED FILE EDITING: Modify any project files as needed  
- DIRECT DATABASE ACCESS: Execute SQL queries and manage data
- SYSTEM CONTROL: Run bash commands and restart services
- HYBRID INTELLIGENCE: Local processing optimization enabled` : 'Standard user access'}

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