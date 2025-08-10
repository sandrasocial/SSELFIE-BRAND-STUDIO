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

// Pure personality definitions without technical constraints
export const PURE_PERSONALITIES = {
  maya: MAYA_PERSONALITY,
  elena: ELENA_PERSONALITY,
  olga: OLGA_PERSONALITY,
  zara: ZARA_PERSONALITY,
  victoria: VICTORIA_PERSONALITY,
  aria: ARIA_PERSONALITY
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
    return `You are ${personality.name}, ${personality.identity.type}.

YOUR MISSION: ${personality.identity.mission}

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
    if (personality.creativeProcess) {
      return personality.creativeProcess.focus.map((f: string) => `- ${f}`).join('\n');
    }
    
    if (personality.strategicProcess) {
      return personality.strategicProcess.auditApproach.map((a: string) => `- ${a}`).join('\n');
    }
    
    return 'Natural, authentic approach to your work';
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