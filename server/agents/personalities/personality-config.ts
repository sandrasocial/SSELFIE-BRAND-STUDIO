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

    // Add Maya-specific emoji styling system
    if (personality.name === 'Maya' && personality.stylingIntelligence?.emojiStylingSystem) {
      const emojiSystem = personality.stylingIntelligence.emojiStylingSystem;
      prompt += `

✨ CRITICAL: EMOJI STYLING SYSTEM FOR CONCEPT TITLES
You MUST include styling emojis at the start of EVERY concept title you create. This is not optional.

REQUIRED EMOJIS AND THEIR MEANINGS:
✨ = Glamorous elegance, luxury styling
💫 = Dreamy sophistication, ethereal beauty  
🔥 = Bold confidence, power styling
🌟 = Star quality, elevated luxury
💎 = High-end refinement, precious luxury
🌅 = Natural beauty, organic sophistication
🏢 = Business authority, professional power
💼 = Executive elegance, corporate chic
🌊 = Flowing grace, fluid movements
👑 = Regal sophistication, queen energy
💃 = Dynamic energy, movement, dance
📸 = Photo-ready perfection, camera-optimized
🎬 = Cinematic drama, storytelling

MANDATORY FORMAT EXAMPLES:
🏢 **Executive Power Meeting**
✨ **Glamorous Evening Sophistication**
🔥 **Bold Conference Commander**
💫 **Dreamy Lifestyle Goddess**

ABSOLUTE REQUIREMENT: NO CONCEPT TITLES WITHOUT EMOJIS! The system depends on emoji-first concept titles for styling intelligence.`;
    }

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
    
    // Load Maya's ACTUAL outfit formulas (effortlessGlam, businessBabe, etc.)
    if (personality.outfitFormulas) {
      knowledge += '\nOUTFIT FORMULAS - Maya\'s Professional Styling Combinations:\n';
      Object.entries(personality.outfitFormulas).forEach(([category, formulas]: [string, any]) => {
        knowledge += `${category.toUpperCase()}:\n`;
        formulas.forEach((formula: string) => knowledge += `- ${formula}\n`);
      });
    }

    // Load Maya's hair & beauty expertise
    if (personality.hairAndBeauty) {
      knowledge += '\nHAIR & BEAUTY EXPERTISE - Editorial Styling Knowledge:\n';
      Object.entries(personality.hairAndBeauty).forEach(([category, techniques]: [string, any]) => {
        knowledge += `${category.toUpperCase()}:\n`;
        techniques.forEach((technique: string) => knowledge += `- ${technique}\n`);
      });
    }

    // Load Maya's sophisticated photo locations
    if (personality.photoLocations) {
      knowledge += '\nSOPHISTICATED PHOTO LOCATIONS - Editorial Quality Spaces:\n';
      Object.entries(personality.photoLocations).forEach(([category, locations]: [string, any]) => {
        knowledge += `${category.toUpperCase()}:\n`;
        locations.forEach((location: string) => knowledge += `- ${location}\n`);
      });
    }

    // Load Maya's color intelligence
    if (personality.colorIntelligence) {
      knowledge += '\nCOLOR INTELLIGENCE - Editorial Palettes & Combinations:\n';
      Object.entries(personality.colorIntelligence).forEach(([category, colors]: [string, any]) => {
        knowledge += `${category.toUpperCase()}:\n`;
        colors.forEach((color: string) => knowledge += `- ${color}\n`);
      });
    }

    // Load Maya's photography expertise
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

    // Load Maya's technical expertise for advanced prompt creation
    if (personality.technicalExpertise) {
      knowledge += '\nTECHNICAL EXPERTISE - Camera & Lighting Mastery:\n';
      Object.entries(personality.technicalExpertise).forEach(([category, expertise]: [string, any]) => {
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

    // Load Maya's professional background for styling context
    if (personality.professionalBackground) {
      knowledge += '\nPROFESSIONAL BACKGROUND - Real Industry Experience:\n';
      Object.entries(personality.professionalBackground).forEach(([category, experience]: [string, any]) => {
        knowledge += `${category.toUpperCase()}:\n`;
        experience.forEach((exp: string) => knowledge += `- ${exp}\n`);
      });
    }

    // Load Maya's category-specific styling approaches
    if (personality.categories) {
      const categoryCount = Object.keys(personality.categories).length;
      console.log(`🎨 MAYA CATEGORIES LOADING: Found ${categoryCount} categories`);
      
      knowledge += '\n🎨 MAYA\'S CATEGORY STYLING APPROACHES:\n';
      Object.entries(personality.categories).forEach(([category, config]: [string, any]) => {
        if (config.stylingApproach && config.stylingApproach.length > 0) {
          console.log(`✅ MAYA CATEGORY: ${category} - ${config.stylingApproach.length} styling approaches`);
          knowledge += `\n${category.toUpperCase()} STYLING:\n`;
          config.stylingApproach.forEach((approach: string) => 
            knowledge += `- ${approach}\n`
          );
        }
      });
      knowledge += '\n⚡ USE THESE SPECIFIC STYLING APPROACHES when creating prompts for each category.\n';
      console.log(`🎯 MAYA PERSONALITY COMPLETE: Categories loaded successfully into knowledge base`);
    } else {
      console.error(`❌ MAYA CATEGORIES MISSING: personality.categories not found`);
    }

    knowledge += '\n⚡ CRITICAL: Use this COMPLETE styling intelligence when creating prompts. You have Maya\'s actual outfit formulas, editorial color palettes, sophisticated locations, hair/beauty expertise, photography mastery, professional background, AND category-specific styling approaches. Apply this knowledge creatively to generate diverse, professional styling concepts.\n';
    
    // NEW: Add context enhancement rules (moved from route-level)
    knowledge += '\n🎯 CONTEXT ENHANCEMENT INTELLIGENCE:\n';
    knowledge += '- Analyze user personal brand context from conversation history\n';
    knowledge += '- Extract styling reasoning from previous responses\n';
    knowledge += '- Maintain consistency across concept creation and generation\n';
    knowledge += '- Use category-specific intelligence for targeted styling\n';
    knowledge += '- Provide personalized styling expertise for subscriber transformation journey\n';
    knowledge += '- Help users achieve their business transformation goals through visual branding\n';
    
    // NEW: Add single API call optimization
    knowledge += '\n⚡ SINGLE API OPTIMIZATION:\n';
    knowledge += '- Create complete styling vision in single response\n';
    knowledge += '- Generate both concept descriptions AND detailed prompts\n';
    knowledge += '- Eliminate need for secondary prompt generation calls\n';
    knowledge += '- Embed FLUX-ready prompts directly in concept creation\n';
    
    // NEW: Add immediate concept generation rules
    knowledge += '\n🚫 IMMEDIATE CONCEPT GENERATION:\n';
    knowledge += '- When user requests categories/concepts, generate specific styling concepts IMMEDIATELY\n';
    knowledge += '- NO repetitive questions - use conversation history and create concepts\n';
    knowledge += '- Each concept must include: outfit formula, hair/makeup, location, mood\n';
    knowledge += '- Present 3-5 complete styling scenarios ready for generation\n';
    knowledge += '- Use styling expertise to be specific about colors, textures, silhouettes\n';

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