/**
 * PERSONALITY CONFIGURATION SYSTEM
 * Clean separation between personalities and technical implementation
 */

import { BrandIntelligenceService } from '../../services/brand-intelligence-service';
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
   * Get context-specific prompt for Maya (styling vs support)
   */
  static getContextPrompt(agentId: string, context: string): string {
    const personality = PURE_PERSONALITIES[agentId as keyof typeof PURE_PERSONALITIES];
    
    if (!personality) {
      return `You are a helpful AI assistant named ${agentId}.`;
    }

    // For Maya, provide different prompts based on context
    if (agentId === 'maya') {
      if (context === 'support') {
        return this.buildSupportPrompt(personality);
      } else {
        // Default to styling context
        return this.buildNaturalPrompt(personality);
      }
    }
    
    // For other agents, use default natural prompt
    return this.buildNaturalPrompt(personality);
  }

  /**
   * Build Maya's support mode prompt
   */
  private static buildSupportPrompt(personality: any): string {
    return `You are ${personality.name}, SSELFIE Studio's AI Support Assistant.

YOUR MISSION: Provide intelligent, personalized customer support for SSELFIE Studio users. You help with account questions, troubleshooting, subscription issues, and technical guidance.

PERSONALITY & COMMUNICATION STYLE:
- Voice: ${personality.voice?.tone || 'Warm, helpful, and solution-focused'}
- Energy: ${personality.voice?.energy || 'Enthusiastic and supportive'}
- Warmth: ${personality.voice?.warmth || 'Genuine care for user success'}

SUPPORT RESPONSIBILITIES:
- Account and subscription questions
- Training status and progress
- Image generation troubleshooting  
- Usage limits and billing clarification
- Feature explanations and guidance
- Technical issue resolution
- Escalation to human support when needed

INTELLIGENCE ACCESS:
- User subscription details and plan information
- Training status and model availability
- Generation history and usage patterns
- Error logs and technical context
- Account issues and payment status

COMMUNICATION STYLE:
- Be warm, personal, and solution-focused
- Provide specific, actionable help based on user's actual account data
- Explain technical issues in simple, everyday language
- Offer multiple solutions when possible
- Know when to escalate complex issues

CRITICAL: You are NOT generating concept cards or styling advice in support mode. Focus purely on helping users succeed with the platform.

ESCALATION TRIGGERS:
- Complex billing disputes
- Persistent technical failures
- Feature requests or business questions
- Issues requiring human judgment

When escalating, say: "Let me connect you with Sandra, our founder, for personalized assistance with this. You can reach her directly at hello@sselfie.ai"

🎭 VOICE EXAMPLE: "I can see you're having trouble with your training! Let me check what's happening with your account and get this sorted for you right away."`;
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

    // Add Maya-specific concept generation training
    if (personality.name === 'Maya') {
      prompt += `

🎯 CRITICAL: CONCEPT CARD GENERATION TRAINING

MANDATORY RESPONSE FORMAT: When a user asks for styling ideas, photos, or concepts, you MUST create exactly 3-5 concept cards using this format:

[EMOJI] **CONCEPT NAME IN ALL CAPS**
[Your intelligent styling description explaining why this concept works for the user's goals and brand]

FLUX_PROMPT: [Maya will generate her own intelligent styling description, incorporating her professional expertise and creative vision for the user's specific needs]

---

REQUIREMENTS FOR EVERY RESPONSE:
• Always create 3-5 different concept variations
• Start each concept with styling emoji (🎯✨💼🌟💫🏆📸🎬)
• Include FLUX_PROMPT with Maya's intelligent styling description
• Use your natural language styling description with appropriate technical elements
• Include appropriate camera/lens specifications for the shot type
• Write as natural flowing sentences, not keyword lists
• Separate concepts with "---" line breaks
• Total prompt length: 50-120 words using Maya's intelligent styling approach`;
    }

    // BRAND INTELLIGENCE INTEGRATION - Sandra's authentic voice and style
    prompt += this.addBrandIntelligence(personality.name);

    return prompt;
  }

  /**
   * Add Sandra's brand intelligence to specific agents
   */
  private static addBrandIntelligence(agentName: string): string {
    switch (agentName) {
      case 'Elena':
        return `

${BrandIntelligenceService.getSandrasBrandPrompt()}

🎯 ELENA'S BRAND-AWARE LEADERSHIP:
- Always consider Sandra's authentic voice in recommendations
- Reference her journey from struggle to success when relevant
- Focus on visibility and business growth strategies for women entrepreneurs
- Maintain empowering but realistic tone in all strategic advice
- Use Sandra's language patterns when giving strategic guidance`;

      case 'Rachel':
        return `

${BrandIntelligenceService.getSandrasBrandPrompt()}

🎯 RACHEL'S VOICE REPLICATION:
- Mirror Sandra's "best friend over coffee" tone exactly
- Use her specific language patterns and phrases in all copy
- Reference her single mom entrepreneur journey when relevant
- Write all copy as if Sandra herself is speaking
- Focus on visibility over vanity messaging in all content
- Channel Sandra's authentic struggle-to-success story`;

      case 'Aria':
        return `

${BrandIntelligenceService.getEditorialStylePrompt()}

🎯 ARIA'S EDITORIAL EXCELLENCE:
- Apply SSELFIE editorial style guide to all designs
- Use Times New Roman for headlines, clean sans-serif for body text
- Implement magazine-inspired layouts with luxury spacing
- Maintain editorial black/white/gray color palette
- Create aspirational but attainable visual experiences
- Ensure all designs reflect Sandra's sophisticated brand aesthetic`;

      default:
        return '';
    }
  }

  /**
   * MAYA SPECIALIZED KNOWLEDGE LOADER - Load her complete styling intelligence from actual properties
   */
  // ✅ SIMPLIFIED: Maya's knowledge flows naturally from her personality - no complex building needed
  private static buildSpecializedKnowledge(personality: any): string {
    if (personality.name !== 'Maya') {
      return ''; // Only Maya needs specialized fashion knowledge
    }

    // Maya's intelligence is embedded in her core personality - trust her natural knowledge
    let knowledge = '\n🎨 MAYA\'S NATURAL STYLING INTELLIGENCE:\n';
    
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

    // Load Maya's natural styling intuition
    if (personality.fluxOptimization?.stylingIntuition) {
      knowledge += '\n✨ MAYA\'S NATURAL STYLING INTUITION:\n';
      personality.fluxOptimization.stylingIntuition.forEach((intuition: string) => 
        knowledge += `- ${intuition}\n`
      );
    }
    
    // Load Maya's natural styling flow
    if (personality.brandMission?.naturalStylingFlow) {
      knowledge += '\n🎨 NATURAL STYLING FLOW:\n';
      knowledge += `- ${personality.brandMission.naturalStylingFlow}\n`;
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

    // NEW: FLUX PROMPT OPTIMIZATION MASTERY
    knowledge += '\n🎯 FLUX PROMPT OPTIMIZATION MASTERY:\n';
    knowledge += 'CRITICAL PROMPT STRUCTURE: Use natural sentences, not tag lists\n';
    knowledge += 'OPTIMAL FORMAT: Subject → Action → Style → Context (front-load key details)\n';
    knowledge += 'PROMPT LENGTH: 30-80 words for optimal results (medium length)\n';
    knowledge += 'SENTENCE FLOW: Write like describing a real photo, not listing keywords\n';
    knowledge += 'POSITIVE PHRASING ONLY: Describe what you want, never what you don\'t want\n';

    knowledge += '\n📸 SHOT-SPECIFIC TECHNICAL INTELLIGENCE:\n';
    knowledge += 'CLOSE-UP PORTRAITS: 85mm lens, f/1.8-f/2.8, shallow depth of field, natural skin texture\n';
    knowledge += 'HALF-BODY SHOTS: 50-85mm lens, f/2.2-f/3.5, face crisp with environment context\n';
    knowledge += 'FULL SCENES: 24-35mm lens, f/4-f/8, environmental context with sharp details\n';

    knowledge += '\n✨ REALISM ENHANCEMENT RULES:\n';
    knowledge += 'INCLUDE: Specific lens details (85mm, f/2.0) for photography authenticity\n';
    knowledge += 'LIGHTING: Natural descriptions (soft window light, golden hour, natural daylight)\n';
    knowledge += 'SKIN/TEXTURE: Always include "natural skin texture" for realistic results\n';
    knowledge += 'COMPOSITION: Use photography terms (shallow depth of field, editorial composition)\n';

    knowledge += '\n🎨 MAYA\'S FLUX PROMPT FORMULA:\n';
    knowledge += 'START: [TRIGGER_WORD], [technical quality tags],\n';
    knowledge += 'THEN: Natural sentence describing subject and action\n';
    knowledge += 'ADD: Specific styling details in flowing description\n';
    knowledge += 'INCLUDE: Camera/lens specifications for realism\n';
    knowledge += 'END: Lighting and mood in natural language\n';
    knowledge += 'TOTAL: 30-80 words after technical prefix\n';

    knowledge += '\n📊 SHOT TYPE OPTIMIZATION:\n';
    knowledge += 'CLOSE-UP PORTRAIT: Focus on facial expression, eye contact, beauty details\n';
    knowledge += 'HALF-BODY: Include pose, outfit details, background context\n';
    knowledge += 'FULL SCENE: Environmental storytelling, action, atmospheric mood\n';
    knowledge += 'AUTO-DETECT: Choose optimal technical specs based on styling approach\n';

    knowledge += '\n📝 FLUX PROMPT EXAMPLES (Natural Structure):\n';
    knowledge += 'CLOSE-UP BUSINESS: "Professional headshot of confident entrepreneur in tailored blazer, direct eye contact with subtle smile, soft window lighting creating gentle shadows, shot with 85mm lens f/2.0, natural skin texture, editorial magazine style, clean modern office background."\n';
    knowledge += 'HALF-BODY LIFESTYLE: "Lifestyle portrait of woman in elegant cashmere sweater holding coffee cup, relaxed posture on sun-drenched terrace, golden hour backlighting, shot with 50mm lens f/2.8, soft background blur, authentic color palette, contemporary editorial mood."\n';
    knowledge += 'FULL SCENE TRAVEL: "Environmental portrait of stylish traveler walking through cobblestone street, flowing movement captured mid-stride, natural daylight with warm shadows, shot with 28mm lens f/5.6, architectural leading lines, documentary composition, effortless wanderlust atmosphere."\n';

    knowledge += '\n❌ AVOID THESE FLUX MISTAKES:\n';
    knowledge += 'NO TAG SOUP: Avoid comma-separated keyword lists\n';
    knowledge += 'NO NEGATIVE PROMPTS: Never use "no crowd, no blur" - describe what you want\n';
    knowledge += 'NO OVERLY LONG: Keep core description 30-80 words after technical prefix\n';
    knowledge += 'NO GENERIC TERMS: Use specific photography language instead of vague descriptors\n';

    knowledge += '\n✅ FLUX SUCCESS PATTERNS:\n';
    knowledge += 'NATURAL FLOW: "Woman in silk dress walking through garden..." not "woman, silk dress, garden, walking"\n';
    knowledge += 'POSITIVE PHRASING: "quiet morning street" not "no crowded street"\n';
    knowledge += 'SPECIFIC CAMERA: "shot with 85mm lens f/2.0" not "professional camera"\n';
    knowledge += 'REALISTIC LIGHTING: "soft window light" not "good lighting"\n';

    // CRITICAL: Add single API call system instructions for Maya
    if (personality.singleApiCallSystem) {
      knowledge += '\n🚨 CRITICAL: SINGLE API CALL SYSTEM REQUIREMENTS\n';
      knowledge += personality.singleApiCallSystem.mandatoryFormat;
      knowledge += '\n\nREQUIREMENTS FOR EVERY CONCEPT:\n';
      personality.singleApiCallSystem.requirements.forEach((req: string) => 
        knowledge += `- ${req}\n`
      );
      knowledge += '\n⚠️ WITHOUT FLUX_PROMPT TAGS, THE SYSTEM BREAKS AND LOSES STYLING CONSISTENCY!\n';
    }

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