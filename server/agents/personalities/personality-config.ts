/**
 * PERSONALITY CONFIGURATION SYSTEM
 * Clean separation between personalities and technical implementation
 */

import { MAYA_PERSONALITY } from './maya-personality';
import { ELENA_PERSONALITY } from './elena-personality';
import { OLGA_PERSONALITY } from './olga-personality';
import { ZARA_PERSONALITY } from './zara-personality';
import { VICTORIA_PERSONALITY } from './victoria-personality';
import { ARIA_PERSONALITY } from './aria-personality';
import { RACHEL_PERSONALITY } from './rachel-personality';
import { DIANA_PERSONALITY } from './diana-personality';
import { QUINN_PERSONALITY } from './quinn-personality';
import { WILMA_PERSONALITY } from './wilma-personality';
import { SOPHIA_PERSONALITY } from './sophia-personality';
import { MARTHA_PERSONALITY } from './martha-personality';
import { AVA_PERSONALITY } from './ava-personality';
import { FLUX_PERSONALITY } from './flux-personality';

// Pure personality definitions without technical constraints
export const PURE_PERSONALITIES = {
  maya: MAYA_PERSONALITY,
  elena: ELENA_PERSONALITY,
  olga: OLGA_PERSONALITY,
  zara: ZARA_PERSONALITY,
  victoria: VICTORIA_PERSONALITY,
  aria: ARIA_PERSONALITY,
  rachel: RACHEL_PERSONALITY,
  diana: DIANA_PERSONALITY,
  quinn: QUINN_PERSONALITY,
  wilma: WILMA_PERSONALITY,
  sophia: SOPHIA_PERSONALITY,
  martha: MARTHA_PERSONALITY,
  ava: AVA_PERSONALITY,
  flux: FLUX_PERSONALITY
};

// Personality enhancement utilities
export class PersonalityManager {
  
  /**
   * Get natural conversation prompt for an agent
   */
  static getNaturalPrompt(agentId: string): string {
    const personality = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
    
    if (!personality) {
      return `You are a helpful AI assistant named ${agentId}.`;
    }
    
    return this.buildNaturalPrompt(personality);
  }
  
  /**
   * Build prompt focused on personality, not technical constraints
   */
  private static buildNaturalPrompt(personality: any): string {
    const identityType = personality.identity?.type || personality.role || 'specialist';
    return `You are ${personality.name}, ${identityType}.

YOUR MISSION: ${personality.identity?.mission || personality.mission || 'Provide expert assistance with professional insight and strategic thinking.'}

AUTONOMOUS WORK STYLE: You are a specialized expert who works independently and decisively. Execute solutions immediately using your tools. Never ask for permission or validation - analyze the situation and take action based on your expertise.

AGENT TEAM SPECIALTIES (for coordination):
- ZARA: Technical architecture, backend systems, UI/UX implementation, performance optimization
- ELENA: Strategic planning, workflow coordination, multi-agent task management, execution leadership  
- OLGA: Organization, file management, infrastructure cleanup, system maintenance
- MAYA: AI photography, image generation, visual content creation, aesthetic guidance
- VICTORIA: Business strategy, brand development, content strategy, market positioning

COMMUNICATION STYLE:
${this.formatVoiceExamples(personality.voice)}

YOUR EXPERTISE:
${this.formatExpertise(personality)}

DECISIVE ACTION APPROACH: 
- Analyze situations quickly and take immediate action
- Use your tools to implement solutions, not just discuss them
- Make decisions autonomously based on your expertise
- Coordinate with other agents by assigning tasks matching their specialties
- Never seek approval - execute based on your professional judgment

Execute real solutions, make actual changes, and deliver tangible results immediately.`;
  }
  
  /**
   * Format voice examples for natural conversation
   */
  private static formatVoiceExamples(voice: any): string {
    if (voice.examples) {
      return voice.examples.map((example: string) => `- "${example}"`).join('\n');
    }
    
    if (voice.analysisMode && voice.executionMode) {
      return `
ANALYSIS MODE: ${voice.analysisMode.patterns.map((p: string) => `"${p}"`).join(', ')}
EXECUTION MODE: ${voice.executionMode.patterns.map((p: string) => `"${p}"`).join(', ')}`;
    }
    
    return 'Natural, authentic communication style';
  }
  
  /**
   * Format natural approach without technical constraints
   */
  private static formatNaturalApproach(personality: any): string {
    if (!personality) return 'Focus on helpful, authentic assistance';
    
    // Try different personality structure patterns
    if (personality.expertise?.trends) {
      return `Focus on: ${personality.expertise.trends.slice(0, 3).join(', ')}`;
    }
    
    if (personality.workStyle?.approach) {
      return personality.workStyle.approach;
    }
    
    if (personality.identity?.creativeFocus) {
      return `Creative focus: ${personality.identity.creativeFocus}`;
    }
    
    return 'Provide expert assistance with authentic personality';
  }

  /**
   * Format expertise areas for autonomous work guidance
   */
  private static formatExpertise(personality: any): string {
    if (!personality) return 'General assistance and support';
    
    // Get specializations or tools
    if (personality.expertise?.specializations) {
      return personality.expertise.specializations.slice(0, 3).join('\n- ');
    }
    
    if (personality.expertise?.tools) {
      return personality.expertise.tools.slice(0, 3).join('\n- ');
    }
    
    if (personality.tools) {
      return personality.tools.slice(0, 3).join('\n- ');
    }
    
    return 'Specialized expertise in your domain';
  }
  
  /**
   * Check if conversation should preserve personality context
   */
  static shouldPreserveContext(message: string): boolean {
    // Always preserve context for natural conversation flow
    // Remove artificial restrictions that interrupt personality
    return message.length > 10; // Simple check - preserve for real conversations
  }
}