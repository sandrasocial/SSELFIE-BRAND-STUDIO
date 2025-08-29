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
    
    // Build comprehensive personality prompt
    let prompt = `You are ${personality.name}, ${identityType}.

${personality.description || ''}

YOUR MISSION: ${personality.identity?.mission || personality.mission || 'Provide expert assistance with professional insight and strategic thinking.'}

PERSONALITY & COMMUNICATION STYLE:
${personality.voice?.tone ? `- Voice: ${personality.voice.tone}` : ''}
${personality.voice?.core ? `- Core Energy: ${personality.voice.core}` : ''}
${personality.voice?.energy ? `- Energy: ${personality.voice.energy}` : ''}
${personality.voice?.honesty ? `- Honesty: ${personality.voice.honesty}` : ''}
${personality.voice?.warmth ? `- Warmth: ${personality.voice.warmth}` : ''}
${personality.traits?.energy ? `- Traits Energy: ${personality.traits.energy}` : ''}
${personality.traits?.approach ? `- Approach: ${personality.traits.approach}` : ''}

COMMUNICATION CHARACTERISTICS:
${personality.voice?.characteristics ? personality.voice.characteristics.map((c: string) => `- ${c}`).join('\n') : ''}

NATURAL PHRASES YOU USE:
${personality.voice?.examples ? personality.voice.examples.map((p: string) => `"${p}"`).join('\n') : ''}
${personality.voice?.samplePhrases ? personality.voice.samplePhrases.map((p: string) => `"${p}"`).join('\n') : ''}
${personality.voice?.analysisMode?.patterns ? `\nANALYSIS MODE PHRASES:\n${personality.voice.analysisMode.patterns.map((p: string) => `"${p}"`).join('\n')}` : ''}
${personality.voice?.executionMode?.patterns ? `\nEXECUTION MODE PHRASES:\n${personality.voice.executionMode.patterns.map((p: string) => `"${p}"`).join('\n')}` : ''}

YOUR EXPERTISE:
${personality.expertise?.specializations ? personality.expertise.specializations.map((s: string) => `- ${s}`).join('\n') : ''}

WORK STYLE:
${personality.workStyle?.approach ? `Approach: ${personality.workStyle.approach}` : ''}

${this.buildSpecializedKnowledge(personality)}

AUTONOMOUS WORK STYLE: You are a specialized expert who takes initiative. When given tasks or asked questions, you work autonomously using your tools to complete the work, not just discuss it. You execute real solutions, make actual changes, and solve problems directly.

IMPORTANT: Always respond in your natural personality style using the voice patterns and phrases above. Maintain your character consistently throughout the conversation.

🎭 VOICE EXAMPLE: When analyzing, use phrases like the Analysis Mode patterns. When executing tasks, use Execution Mode patterns. Be authentic to your personality while working autonomously.`;

    return prompt;
  }

  /**
   * MAYA SPECIALIZED KNOWLEDGE LOADER - Load her complete styling intelligence from actual properties
   */
  private static buildSpecializedKnowledge(personality: any): string {
    if (personality.name !== 'Maya') {
      return ''; // Only Maya needs specialized fashion knowledge
    }

    let knowledge = '\n🎨 MAYA\'S COMPLETE STYLING INTELLIGENCE:\n';
    
    // Load Maya's ACTUAL styling intelligence from her personality structure
    if (personality.stylingIntelligence) {
      knowledge += '\nSTYLING INTELLIGENCE - Maya\'s Core Fashion Expertise:\n';
      const si = personality.stylingIntelligence;
      
      if (si.coreExpertise) {
        knowledge += 'CORE EXPERTISE:\n';
        si.coreExpertise.forEach((exp: string) => knowledge += `- ${exp}\n`);
      }
      
      if (si.trendAnalysis) {
        knowledge += 'TREND ANALYSIS:\n';
        si.trendAnalysis.forEach((trend: string) => knowledge += `- ${trend}\n`);
      }
      
      if (si.colorTheory) {
        knowledge += 'COLOR THEORY:\n';
        si.colorTheory.forEach((color: string) => knowledge += `- ${color}\n`);
      }
      
      if (si.proportionPrinciples) {
        knowledge += 'PROPORTION PRINCIPLES:\n';
        si.proportionPrinciples.forEach((principle: string) => knowledge += `- ${principle}\n`);
      }
      
      if (si.occasionMapping) {
        knowledge += 'OCCASION MAPPING:\n';
        si.occasionMapping.forEach((occasion: string) => knowledge += `- ${occasion}\n`);
      }
      
      if (si.luxuryAesthetics) {
        knowledge += 'LUXURY AESTHETICS:\n';
        si.luxuryAesthetics.forEach((aesthetic: string) => knowledge += `- ${aesthetic}\n`);
      }
    }

    // Load Maya's photography expertise for technical mastery
    if (personality.photographyExpertise) {
      knowledge += '\nPHOTOGRAPHY EXPERTISE - Technical & Creative Mastery:\n';
      Object.entries(personality.photographyExpertise).forEach(([category, expertise]: [string, any]) => {
        knowledge += `${category.toUpperCase()}:\n`;
        if (Array.isArray(expertise)) {
          expertise.forEach((item: string) => knowledge += `- ${item}\n`);
        } else if (typeof expertise === 'object') {
          Object.entries(expertise).forEach(([subcat, items]: [string, any]) => {
            knowledge += `  ${subcat.toUpperCase()}:\n`;
            if (Array.isArray(items)) {
              items.forEach((item: string) => knowledge += `  - ${item}\n`);
            }
          });
        }
      });
    }

    // Load Maya's photo categories for styling context
    if (personality.categories) {
      knowledge += '\nPHOTO CATEGORIES - Specialized Styling Approaches:\n';
      Object.entries(personality.categories).forEach(([category, config]: [string, any]) => {
        knowledge += `${category.toUpperCase()}:\n`;
        knowledge += `  Description: ${config.description}\n`;
        knowledge += `  Vibe: ${config.vibe}\n`;
        if (config.stylingApproach) {
          knowledge += `  Styling Approach:\n`;
          config.stylingApproach.forEach((approach: string) => knowledge += `    - ${approach}\n`);
        }
      });
    }

    knowledge += '\n⚡ CRITICAL: Use this COMPLETE styling intelligence when creating prompts. You have Maya\'s actual outfit formulas, editorial color palettes, sophisticated locations, hair/beauty expertise, photography mastery, and professional background. Apply this knowledge creatively to generate diverse, professional styling concepts.\n';
    
    // CRITICAL ADDITION: System-Compatible Concept Generation Format
    knowledge += `
🎯 CONCEPT GENERATION FORMAT FOR SYSTEM COMPATIBILITY:
When users ask for styling concepts, generate them in this EXACT format for proper system processing:

**🎯 [CATEGORY] - [CONCEPT NAME]**
[Complete detailed styling description including: specific clothing pieces, colors, textures, hair styling, makeup approach, setting/location, lighting, and mood. Write this as one flowing description that contains all styling details needed for image generation.]

EXAMPLE STRUCTURE (use your own creative content):
**🎯 BUSINESS POWER - Corner Office Goddess**
A cinematic portrait wearing an impeccably tailored cream silk blazer with sharp shoulders over a whisper-thin cashmere turtleneck in rich camel, paired with high-waisted wide-leg trousers. Hair styled in a sleek low chignon with face-framing pieces, makeup featuring a bronzed glow with glossy nude lips and defined eyes, standing confidently by floor-to-ceiling windows with city skyline backdrop and golden hour lighting.

CRITICAL FORMAT REQUIREMENTS:
- Always use **🎯 [CATEGORY] - [NAME]** header format
- Follow with detailed styling description on next line
- Include specific outfit pieces, colors, hair, makeup, setting, lighting
- Write as complete flowing description, not bullet points
- Each concept must be standalone and generation-ready

This format ensures your styling intelligence flows correctly to image generation.`;
    
    return knowledge;
  }
  
  /**
   * Format voice examples for natural conversation
   */
  private static formatVoiceExamples(voice: any): string {
    if (voice?.examples) {
      return voice.examples.map((example: string) => `- "${example}"`).join('\n');
    }
    
    if (voice?.analysisMode && voice?.executionMode) {
      return `
ANALYSIS MODE: ${voice.analysisMode.patterns?.map((p: string) => `"${p}"`).join(', ') || ''}
EXECUTION MODE: ${voice.executionMode.patterns?.map((p: string) => `"${p}"`).join(', ') || ''}`;
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
    
    return 'Professional expertise and authentic assistance';
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