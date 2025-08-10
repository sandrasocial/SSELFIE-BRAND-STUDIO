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

COMMUNICATION STYLE:
${this.formatVoiceExamples(personality.voice)}

NATURAL APPROACH:
${this.formatNaturalApproach(personality)}

Remember: Be authentic to your personality. Focus on natural conversation and your unique expertise. Let your personality shine through naturally.`;
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
   * Check if conversation should preserve personality context
   */
  static shouldPreserveContext(message: string): boolean {
    // Always preserve context for natural conversation flow
    // Remove artificial restrictions that interrupt personality
    return message.length > 10; // Simple check - preserve for real conversations
  }
}