import { ClaudeApiServiceSimple } from './claude-api-service-simple.js';
import { enforceGender, normalizeGender } from '../utils/gender-prompt.js';
import { PersonalityManager } from '../agents/personalities/personality-config.js';
export class MayaOptimizationService {
    static claudeService = new ClaudeApiServiceSimple();
    static promptCache = new Map();
    static PROMPT_CACHE_TTL = 15 * 60 * 1000;
    static async generateOptimizedConcepts(userMessage, enhancedPersonality, userId, conversationId, config = {
        includeEmbeddedPrompts: true,
        includeConceptGeneration: true,
        includeConversation: true,
        maxConcepts: 4
    }) {
        try {
            console.log('🚀 PHASE 4.1: Starting optimized single API call for concept generation');
            const optimizationApplied = [];
            const cacheKey = this.generatePromptCacheKey(userMessage, userId);
            const cachedPrompt = this.promptCache.get(cacheKey);
            if (cachedPrompt && Date.now() - cachedPrompt.timestamp < this.PROMPT_CACHE_TTL) {
                console.log('⚡ CACHE HIT: Using cached optimized prompt');
                optimizationApplied.push('prompt_cache_hit');
            }
            const optimizedPrompt = this.buildSingleCallPrompt(enhancedPersonality, userMessage, config);
            const startTime = Date.now();
            const mayaResponse = await this.claudeService.sendMessage([{
                    role: 'user',
                    content: optimizedPrompt
                }]);
            const apiDuration = Date.now() - startTime;
            console.log(`✅ PHASE 4.1: Single API call completed in ${apiDuration}ms`);
            optimizationApplied.push('single_api_call');
            const parsedResult = await this.parseOptimizedResponse(mayaResponse, config, userId);
            if (parsedResult.concepts.length > 0) {
                this.promptCache.set(cacheKey, {
                    prompt: optimizedPrompt,
                    timestamp: Date.now()
                });
                optimizationApplied.push('prompt_cached');
            }
            console.log(`🎯 PHASE 4.1: Generated ${parsedResult.concepts.length} concepts with ${optimizationApplied.length} optimizations`);
            return {
                concepts: parsedResult.concepts,
                conversationalResponse: parsedResult.conversationalResponse,
                apiCallsUsed: 1,
                optimizationApplied,
                cacheHit: !!cachedPrompt
            };
        }
        catch (error) {
            console.error('❌ PHASE 4.1 OPTIMIZATION ERROR:', error);
            return {
                concepts: [],
                conversationalResponse: "I'm excited to help you create amazing photos! Let me know what style you're looking for.",
                apiCallsUsed: 1,
                optimizationApplied: ['fallback_used'],
                cacheHit: false
            };
        }
    }
    static buildSingleCallPrompt(enhancedPersonality, userMessage, config) {
        return `${enhancedPersonality}

🎯 OPTIMIZED SINGLE API CALL - Generate ALL outputs in one response:

USER REQUEST: "${userMessage}"

REQUIRED OUTPUT FORMAT (include ALL sections):

1. CONVERSATIONAL_RESPONSE:
[Your natural, engaging response to the user]

2. STYLING_CONCEPTS: ${config.maxConcepts} concept cards
${config.includeConceptGeneration ? `
Format each concept as:
🌟 **CONCEPT NAME**
[User-facing description of the styling concept and approach]
FLUX_PROMPT: [Complete FLUX-optimized generation prompt]

Example:
✨ **EXECUTIVE CONFIDENCE**
A powerful professional look featuring structured blazers and confident poses that communicate leadership authority.
FLUX_PROMPT: Professional woman in tailored charcoal blazer with architectural shoulders, confident direct gaze, studio lighting with soft shadows, half-body composition showing executive presence, minimal jewelry, natural makeup emphasizing confidence, neutral background

` : ''}

3. PERSONALIZATION_INSIGHTS:
[Key personalization observations about the user's style preferences]

4. GENERATION_GUIDANCE:
[Technical guidance for image generation optimization]

OPTIMIZATION REQUIREMENTS:
- Natural conversational flow while including all technical components
- Embedded FLUX prompts for zero additional API calls
- Contemporary 2025 fashion intelligence
- User-specific personalization
- Complete response in single API call

Generate comprehensive response now:`;
    }
    static async parseOptimizedResponse(response, config, userId) {
        const concepts = [];
        let conversationalResponse = '';
        try {
            const conversationMatch = response.match(/CONVERSATIONAL_RESPONSE:\s*(.*?)(?=\n\d+\.|$)/s);
            conversationalResponse = conversationMatch ? conversationMatch[1].trim() : response;
            if (config.includeConceptGeneration) {
                const conceptPattern = /([\p{Emoji_Presentation}\p{Extended_Pictographic}])\s*\*\*([^*\n]{8,50})\*\*\n(.*?)(?=FLUX_PROMPT:\s*(.*?)(?=\n[\p{Emoji_Presentation}\p{Extended_Pictographic}]|\n\n|$))/gsu;
                let match;
                let conceptNumber = 1;
                while ((match = conceptPattern.exec(response)) !== null && concepts.length < config.maxConcepts) {
                    const emoji = match[1];
                    const conceptName = `${emoji} ${match[2].trim()}`;
                    const description = match[3].trim();
                    const fluxPromptMatch = response.substring(match.index + match[0].length).match(/FLUX_PROMPT:\s*(.*?)(?=\n[\p{Emoji_Presentation}\p{Extended_Pictographic}]|\n\n|$)/s);
                    const embeddedPrompt = fluxPromptMatch ? fluxPromptMatch[1].trim() : null;
                    if (embeddedPrompt) {
                        let finalPrompt = embeddedPrompt;
                        if (userId) {
                            try {
                                const { storage } = await import('../storage.js');
                                const user = await storage.getUser(userId);
                                const userModel = await storage.getUserModelByUserId(userId);
                                if (user?.gender && userModel?.triggerWord) {
                                    const secureGender = normalizeGender(user.gender);
                                    if (secureGender) {
                                        const enforced = enforceGender(userModel.triggerWord, finalPrompt, secureGender);
                                        if (enforced !== finalPrompt) {
                                            console.log(`✅ GENDER ENFORCED IN CONCEPT: ${conceptName}`);
                                            finalPrompt = enforced;
                                        }
                                    }
                                }
                            }
                            catch (genderError) {
                                console.log('⚠️ Gender enforcement failed for concept (non-blocking):', genderError instanceof Error ? genderError.message : genderError);
                            }
                        }
                        concepts.push({
                            id: `optimized_concept_${conceptNumber++}`,
                            title: conceptName,
                            description: description,
                            originalContext: description,
                            fullPrompt: finalPrompt,
                            canGenerate: true,
                            isGenerating: false,
                            optimization: 'single_api_call_embedded'
                        });
                        console.log(`✅ PARSED OPTIMIZED CONCEPT: ${conceptName} with embedded prompt`);
                    }
                }
            }
            console.log(`🎯 OPTIMIZATION PARSING: ${concepts.length} concepts extracted from single API call`);
        }
        catch (error) {
            console.error('❌ OPTIMIZATION PARSING ERROR:', error);
            conversationalResponse = response;
        }
        return { concepts, conversationalResponse };
    }
    static generatePromptCacheKey(userMessage, userId) {
        const content = `${userMessage}_${userId}`;
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return `opt_${Math.abs(hash).toString(36)}`;
    }
    static async createOptimizedPromptFromConcept(conceptName, triggerWord, userId, context, category) {
        try {
            console.log('🔧 PHASE 4.1: Creating optimized prompt for concept');
            const baseMayaPersonality = PersonalityManager.getNaturalPrompt('maya');
            const optimizedPrompt = `${baseMayaPersonality}

🎯 OPTIMIZED PROMPT GENERATION - Single focused output:

CONCEPT: "${conceptName}"
TRIGGER WORD: "${triggerWord}"
CONTEXT: "${context}"
${category ? `CATEGORY: "${category}"` : ''}

Generate ONLY the FLUX-optimized image generation prompt.
No conversation, no explanations - just the technical prompt:

Requirements:
- Start with trigger word
- Natural language description (not keywords)
- Contemporary 2025 styling intelligence
- Rich, flowing descriptions with scene, lighting, and styling details
- 150-300+ words encouraged for comprehensive prompts
- Professional photography specifications
- Include atmospheric and contextual elements for storytelling

FLUX PROMPT:`;
            const response = await this.claudeService.sendMessage([{
                    role: 'user',
                    content: optimizedPrompt
                }]);
            const cleanPrompt = response.replace(/^FLUX PROMPT:\s*/i, '').trim();
            let finalPrompt = `${triggerWord}, ${cleanPrompt}`;
            try {
                const { storage } = await import('../storage.js');
                const user = await storage.getUser(userId);
                const secureGender = normalizeGender(user?.gender);
                if (secureGender) {
                    const enforced = enforceGender(triggerWord, finalPrompt, secureGender);
                    if (enforced !== finalPrompt) {
                        console.log('✅ GENDER ENFORCED IN OPTIMIZED PROMPT');
                        finalPrompt = enforced;
                    }
                }
                else {
                    console.log('⚠️ GENDER NOT AVAILABLE FOR USER DURING OPTIMIZED PROMPT ENFORCEMENT');
                }
            }
            catch (gErr) {
                console.log('⚠️ GENDER ENFORCEMENT FAILED (non-blocking):', gErr instanceof Error ? gErr.message : gErr);
            }
            console.log('✅ PHASE 4.1: Optimized prompt generated successfully');
            return finalPrompt;
        }
        catch (error) {
            console.error('❌ OPTIMIZED PROMPT GENERATION ERROR:', error);
            return `${triggerWord}, professional photo of a person in ${conceptName} style`;
        }
    }
    static cleanupOptimizationCaches() {
        const now = Date.now();
        for (const [key, value] of this.promptCache.entries()) {
            if (now - value.timestamp > this.PROMPT_CACHE_TTL) {
                this.promptCache.delete(key);
            }
        }
    }
    static getOptimizationStats() {
        return {
            promptCacheSize: this.promptCache.size,
            promptCacheTTL: this.PROMPT_CACHE_TTL,
            optimization: 'single_api_call_architecture'
        };
    }
}
setInterval(() => {
    MayaOptimizationService.cleanupOptimizationCaches();
}, 5 * 60 * 1000);
//# sourceMappingURL=maya-optimization-service.js.map