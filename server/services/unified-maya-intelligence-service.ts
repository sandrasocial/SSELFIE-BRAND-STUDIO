/**
 * Unified Maya Intelligence Service
 * Orchestrates Maya AI operations with intelligence and context awareness
 */

import { ClaudeApiServiceSimple } from './claude-api-service-simple.js';
import { MayaService } from './maya-service.js';
import { PersonalityManager } from '../agents/personalities/personality-config.js';
import { DatabaseStorage } from '../storage.js';

export interface MayaIntelligenceRequest {
  userId: string;
  message: string;
  conversationId?: string;
  context?: {
    previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>;
    userProfile?: any;
    brandContext?: any;
  };
}

export interface MayaIntelligenceResponse {
  response: string;
  conversationId: string;
  conceptCards?: Array<{
    id: string;
    title: string;
    description: string;
    fluxPrompt: string;
    creativeLook: string;
    emoji: string;
  }>;
  nextActions?: string[];
  confidence: number;
}

export class UnifiedMayaIntelligenceService {
  private claudeService: ClaudeApiServiceSimple;
  private mayaService: MayaService;
  private personalityManager: PersonalityManager;
  private storage: DatabaseStorage;

  constructor() {
    this.claudeService = new ClaudeApiServiceSimple();
    this.mayaService = new MayaService(new DatabaseStorage());
    this.personalityManager = new PersonalityManager();
    this.storage = new DatabaseStorage();
  }

  async processMessage(request: MayaIntelligenceRequest): Promise<MayaIntelligenceResponse> {
    const { userId, message, conversationId, context } = request;

    try {
      // 🎯 INTENT DETECTION: Check if user wants to generate images
      const imageGenerationIntent = this.detectImageGenerationIntent(message);
      
      if (imageGenerationIntent.isGenerationRequest) {
        console.log(`🎨 MAYA: Image generation intent detected - ${imageGenerationIntent.requestType}`);
        
        // Check if user has a trained model
        const userModel = await this.storage.getUserModelByUserId(userId);
        
        console.log(`🎯 MAYA: User model check for ${userId}:`, {
          modelExists: !!userModel,
          trainingStatus: userModel?.trainingStatus,
          triggerWord: userModel?.triggerWord,
          replicateModelId: userModel?.replicateModelId
        });
        
        if (!userModel || userModel.trainingStatus !== 'completed') {
          // Guide user to complete model training first
          const trainingGuidanceResponse = this.generateTrainingGuidanceResponse(message, imageGenerationIntent);
          
          // Save the conversation
          const mayaProcessedData = await this.mayaService.processAndSaveChat(userId, {
            message,
            conversationId,
            mayaResponseContent: trainingGuidanceResponse
          });

          return {
            response: trainingGuidanceResponse,
            conversationId: mayaProcessedData.conversationId,
            conceptCards: [],
            nextActions: ['Complete model training', 'Upload photos for training'],
            confidence: 0.95
          };
        }

        // User has trained model - provide generation guidance with concept cards
        const fullGenerationResponse = this.generateImageGenerationGuidanceResponse(message, imageGenerationIntent, userModel);
        const location = this.extractLocation(message);
        const cleanDisplayResponse = this.generateCleanDisplayResponse(message, imageGenerationIntent, location);
        
        console.log(`🎨 MAYA UNIFIED: Generated response for ${userId}:`, {
          fullResponseLength: fullGenerationResponse.length,
          cleanResponseLength: cleanDisplayResponse.length,
          hasFluxPrompt: fullGenerationResponse.includes('FLUX_PROMPT:'),
          fluxPromptCount: (fullGenerationResponse.match(/FLUX_PROMPT:/g) || []).length,
          preview: cleanDisplayResponse.substring(0, 200)
        });
        
        // Pass the FULL response to mayaService for concept card extraction
        const mayaProcessedData = await this.mayaService.processAndSaveChat(userId, {
          message,
          conversationId,
          mayaResponseContent: fullGenerationResponse
        });

        return {
          response: cleanDisplayResponse,
          conversationId: mayaProcessedData.conversationId,
          conceptCards: mayaProcessedData.conceptCards,
          nextActions: ['Generate images', 'Explore style variations', 'View gallery'],
          confidence: 0.98
        };
      }

      // Regular conversation flow - no generation intent detected
      // Get Maya's personality configuration with full creative intelligence
      const systemPrompt = PersonalityManager.getNaturalPrompt('maya');

      // Build conversation history
      const history = context?.previousMessages || [];

      // Single call to Claude API
      const claudeResponse = await this.claudeService.sendMessage(
        message,
        history,
        systemPrompt
      );

      // Pass the response to mayaService for processing and database storage
      const mayaProcessedData = await this.mayaService.processAndSaveChat(userId, {
        message,
        conversationId,
        mayaResponseContent: claudeResponse.content
      });

      return {
        response: claudeResponse.content,
        conversationId: mayaProcessedData.conversationId,
        conceptCards: mayaProcessedData.conceptCards,
        nextActions: this.generateNextActions(claudeResponse.content),
        confidence: this.calculateConfidence(claudeResponse.content, context)
      };
    } catch (error) {
      console.error('Maya Intelligence Service error:', error);
      throw new Error(`Maya processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBrandStrategy(userId: string, userInput: string): Promise<any> {
    // Use the existing Maya service for brand strategy generation
    return this.mayaService.processChat(userId, {
      message: `Help me develop a brand strategy: ${userInput}`,
      history: []
    });
  }

  async analyzeUserContext(userId: string): Promise<any> {
    // Analyze user's previous conversations and brand development
    try {
      const userProfile = await this.storage.getUser(userId);
      const conversations = await this.storage.getMayaChats(userId);
      
      return {
        userProfile,
        conversationSummary: conversations.slice(0, 5), // Last 5 conversations
        brandMaturity: this.assessBrandMaturity(conversations),
        recommendations: this.generateRecommendations(userProfile, conversations)
      };
    } catch (error) {
      console.error('Context analysis error:', error);
      return null;
    }
  }

  private generateNextActions(response: string): string[] {
    // Simple heuristic to suggest next actions based on Maya's response
    const actions = [];
    
    if (response.toLowerCase().includes('brand')) {
      actions.push('Explore brand identity options');
    }
    if (response.toLowerCase().includes('image') || response.toLowerCase().includes('photo')) {
      actions.push('Generate concept images');
    }
    if (response.toLowerCase().includes('strategy')) {
      actions.push('Develop detailed strategy');
    }
    
    return actions.length > 0 ? actions : ['Continue conversation'];
  }

  private calculateConfidence(response: string, context?: any): number {
    // Simple confidence calculation based on response characteristics
    let confidence = 0.7; // Base confidence
    
    if (response.length > 100) confidence += 0.1;
    if (context?.previousMessages?.length > 0) confidence += 0.1;
    if (response.includes('specific') || response.includes('detailed')) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private assessBrandMaturity(conversations: any[]): 'beginner' | 'developing' | 'advanced' {
    if (!conversations || conversations.length === 0) return 'beginner';
    if (conversations.length < 5) return 'beginner';
    if (conversations.length < 15) return 'developing';
    return 'advanced';
  }

  private generateRecommendations(userProfile: any, conversations: any[]): string[] {
    const recommendations = [];
    
    if (!conversations || conversations.length === 0) {
      recommendations.push('Start with brand discovery conversation');
    } else if (conversations.length < 3) {
      recommendations.push('Explore your visual identity');
    } else {
      recommendations.push('Create your signature brand assets');
    }
    
    return recommendations;
  }

  /**
   * Detect if user message contains image generation intent
   */
  private detectImageGenerationIntent(message: string): {
    isGenerationRequest: boolean;
    requestType: 'create' | 'generate' | 'make' | 'shoot' | 'photo' | 'general';
    confidence: number;
    extractedContext?: string;
  } {
    const lowercaseMessage = message.toLowerCase();
    
    // High confidence generation patterns
    const highConfidencePatterns = [
      /(?:can you |please |could you )?(?:create|generate|make|produce|design) (?:some |an? |my )?(?:image|photo|picture|shot|portrait|headshot)s?/i,
      /(?:i want|i need|i'd like) (?:some |an? |my )?(?:image|photo|picture|shot|portrait|headshot)s?/i,
      /(?:take|shoot) (?:some |an? |my )?(?:photo|picture|shot|portrait|headshot)s?/i,
      /(?:create|generate|make) (?:some |an? )?(?:content|visuals|assets|creative)/i,
      /(?:make me|create me|generate me) (?:some |an? )?(?:creative|visual|photo|image)/i
    ];

    // Medium confidence patterns
    const mediumConfidencePatterns = [
      /(?:image|photo|picture|shot|portrait|headshot)s? (?:of me|for me)/i,
      /(?:in |wearing |with ).+(?:style|look|outfit|aesthetic)/i,
      /(?:professional|creative|artistic|lifestyle|fashion) (?:image|photo|picture|shot)/i,
      /(?:norway|location|place|setting|background)/i
    ];

    // Check high confidence patterns
    for (const pattern of highConfidencePatterns) {
      if (pattern.test(message)) {
        return {
          isGenerationRequest: true,
          requestType: this.extractRequestType(message),
          confidence: 0.95,
          extractedContext: message
        };
      }
    }

    // Check medium confidence patterns
    for (const pattern of mediumConfidencePatterns) {
      if (pattern.test(message)) {
        return {
          isGenerationRequest: true,
          requestType: this.extractRequestType(message),
          confidence: 0.75,
          extractedContext: message
        };
      }
    }

    return {
      isGenerationRequest: false,
      requestType: 'general',
      confidence: 0
    };
  }

  /**
   * Extract the type of generation request
   */
  private extractRequestType(message: string): 'create' | 'generate' | 'make' | 'shoot' | 'photo' | 'general' {
    if (/create/i.test(message)) return 'create';
    if (/generate/i.test(message)) return 'generate';
    if (/make/i.test(message)) return 'make';
    if (/shoot|take/i.test(message)) return 'shoot';
    if (/photo|picture|image/i.test(message)) return 'photo';
    return 'general';
  }

  /**
   * Generate response when user needs to complete training first
   */
  private generateTrainingGuidanceResponse(message: string, intent: any): string {
    return `Hello! I'm Maya, your AI Creative Director at SSELFIE Studio. 🎨

I absolutely LOVE your vision! I can see you want to create some stunning visuals, and I'm here to make that happen. However, I need your personal model to be trained first so I can create images that truly capture YOUR unique essence.

Here's what we need to do:

**🎯 Complete Your Model Training:**
• Upload 15-25 high-quality photos of yourself
• Include variety: different angles, lighting, expressions
• Clear, well-lit images work best for training

**✨ Once Training is Complete:**
I'll be able to create personalized images using your exact features, including:
• Professional headshots and portraits
• Lifestyle and creative concepts
• Location-based shoots (like the Norway concept you mentioned!)
• 11 different signature aesthetic styles

**💫 Why This Matters:**
Your personal LoRA model ensures every image I create features YOUR face authentically. No generic results - just stunning, personalized content that's uniquely you.

Ready to get started with your model training? Upload your photos and let's create something extraordinary together! 

Once your model is ready, just ask me again about creating images, and I'll have everything needed to bring your vision to life! 🌟`;
  }

  /**
   * Generate response when user can create images with concept cards
   */
  private generateImageGenerationGuidanceResponse(message: string, intent: any, userModel: any): string {
    // Extract location or styling context from the original message
    const location = this.extractLocation(message);
    const style = this.extractStyleContext(message);
    
    // Select appropriate creative looks from Maya's personality system
    const conceptCards = this.generateCreativeConcepts(message, location, style, userModel);
    
    // FULL RESPONSE (for backend extraction) - includes concept cards with FLUX_PROMPT
    const fullResponse = `Hello gorgeous! I'm Maya, your AI Creative Director, and I'm SO excited to create some stunning visuals with you! ✨

Your personal model is trained and ready - which means I can create images that perfectly capture YOUR unique beauty and style.

${location ? `I absolutely LOVE the ${location} concept you mentioned! ` : ''}Let me design some fabulous concept cards perfectly tailored to your vision:

${conceptCards}

**💫 Ready to Generate?**
• Click the heart ❤️ on any concept card to generate images
• I'll create 2-4 stunning variations of your chosen concept
• Each image will be personalized using your trained model
• Images save automatically to your gallery

Which concept speaks to your vision? Let's create something extraordinary! 🎨`;

    return fullResponse;
  }

  /**
   * Generate clean display response without concept card details
   */
  private generateCleanDisplayResponse(message: string, intent: any, location: string | null): string {
    return `Hello gorgeous! I'm Maya, your AI Creative Director, and I'm SO excited to create some stunning visuals with you! ✨

Your personal model is trained and ready - which means I can create images that perfectly capture YOUR unique beauty and style.

${location ? `I absolutely LOVE the ${location} concept you mentioned! ` : ''}I've created some fabulous concept cards perfectly tailored to your vision. Each concept captures a different aesthetic style that would look absolutely stunning on you.

**💫 Ready to Generate?**
• Click the heart ❤️ on any concept card to generate images
• I'll create 2-4 stunning variations of your chosen concept
• Each image will be personalized using your trained model
• Images save automatically to your gallery

Which concept speaks to your vision? Let's create something extraordinary! 🎨`;
  }

  /**
   * Generate creative concept cards using Maya's sophisticated CreativeLook system
   */
  private generateCreativeConcepts(message: string, location: string | null, style: string | null, userModel: any): string {
    const triggerWord = userModel.triggerWord || 'sandra';
    
    // Maya's 11 signature Creative Looks from her personality system
    const creativeLooks = {
      scandinavianMinimalist: {
        name: 'SCANDINAVIAN MINIMALIST',
        emoji: '🤍',
        description: 'Clean Nordic aesthetic with soft natural lighting and understated elegance',
        colors: 'Soft whites, warm beiges, muted grays',
        fabrics: 'Cashmere, linen, organic cotton',
        accessories: 'Delicate gold jewelry, minimalist watches',
        styling: 'Effortless, natural, serene expression'
      },
      urbanMoody: {
        name: 'URBAN MOODY',
        emoji: '🖤',
        description: 'Dramatic city aesthetic with bold contrasts and sophisticated edge',
        colors: 'Deep blacks, charcoal grays, rich burgundy',
        fabrics: 'Leather, structured wool, silk',
        accessories: 'Statement jewelry, structured bags',
        styling: 'Confident pose, dramatic lighting, urban backdrop'
      },
      highEndCoastal: {
        name: 'HIGH-END COASTAL',
        emoji: '🌊',
        description: 'Luxurious seaside elegance with flowing textures and ocean-inspired tones',
        colors: 'Ocean blues, pearl whites, sandy beiges',
        fabrics: 'Flowing silk, cashmere wraps, linen',
        accessories: 'Pearl jewelry, sun hats, elegant scarves',
        styling: 'Windswept hair, natural glow, coastal setting'
      },
      editorialAvantGarde: {
        name: 'EDITORIAL AVANT-GARDE',
        emoji: '🎭',
        description: 'High-fashion editorial with bold creative elements and artistic vision',
        colors: 'Bold contrasts, metallic accents, artistic palette',
        fabrics: 'Structured silks, architectural details, unique textures',
        accessories: 'Statement pieces, artistic elements, bold jewelry',
        styling: 'Dramatic pose, creative lighting, artistic expression'
      },
      classicTimeless: {
        name: 'CLASSIC TIMELESS',
        emoji: '💎',
        description: 'Elegant traditional aesthetic with refined sophistication and heritage appeal',
        colors: 'Navy blue, pearl white, rich cream',
        fabrics: 'Fine wool, silk, cashmere, tweed',
        accessories: 'Pearl jewelry, classic handbags, timeless pieces',
        styling: 'Poised expression, classic pose, refined setting'
      }
    };

    // Select 3 most appropriate looks based on context
    let selectedLooks = [];

    if (location?.toLowerCase().includes('norway') || location?.toLowerCase().includes('scandina')) {
      selectedLooks.push(creativeLooks.scandinavianMinimalist);
      selectedLooks.push(creativeLooks.highEndCoastal);
      selectedLooks.push(creativeLooks.classicTimeless);
    } else if (style === 'professional' || style === 'editorial') {
      selectedLooks.push(creativeLooks.editorialAvantGarde);
      selectedLooks.push(creativeLooks.classicTimeless);
      selectedLooks.push(creativeLooks.urbanMoody);
    } else {
      // Default selection for general requests
      selectedLooks.push(creativeLooks.scandinavianMinimalist);
      selectedLooks.push(creativeLooks.urbanMoody);
      selectedLooks.push(creativeLooks.highEndCoastal);
    }

    // Generate concept cards using Maya's fashion expertise
    return selectedLooks.map(look => {
      const locationContext = location ? `, beautiful ${location} setting` : '';
      
      return `---

${look.emoji} **${look.name}**
${look.description}. ${look.styling} with perfect attention to ${look.colors.toLowerCase()} color palette and ${look.fabrics.toLowerCase()} textures.
FLUX_PROMPT: [Professional fashion portrait of ${triggerWord}, ${look.name.toLowerCase().replace('_', ' ')} aesthetic${locationContext}, ${look.styling.toLowerCase()}, ${look.colors.toLowerCase()}, ${look.fabrics.toLowerCase()}, high-end photography, perfect lighting, elegant composition, luxury fashion editorial style]`;
    }).join('\n');
  }

  /**
   * Extract location context from message
   */
  private extractLocation(message: string): string | null {
    const locationPatterns = [
      /in ([a-z]+(?:\s+[a-z]+)*)/i,
      /at ([a-z]+(?:\s+[a-z]+)*)/i,
      /([a-z]+(?:\s+[a-z]+)*) (?:style|aesthetic|look)/i
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const location = match[1].toLowerCase();
        // Filter out common non-location words
        if (!['me', 'my', 'the', 'some', 'any', 'this', 'that'].includes(location)) {
          return match[1];
        }
      }
    }

    return null;
  }

  /**
   * Extract style context from message
   */
  private extractStyleContext(message: string): string | null {
    const styleKeywords = [
      'professional', 'casual', 'formal', 'creative', 'artistic', 'fashion',
      'lifestyle', 'editorial', 'minimalist', 'luxury', 'modern', 'classic'
    ];

    for (const keyword of styleKeywords) {
      if (message.toLowerCase().includes(keyword)) {
        return keyword;
      }
    }

    return null;
  }

  /**
   * Clean response for display by removing FLUX_PROMPT lines
   */
  private cleanResponseForDisplay(response: string): string {
    // Remove FLUX_PROMPT lines from the display
    return response
      .split('\n')
      .filter(line => !line.trim().startsWith('FLUX_PROMPT:'))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Clean up multiple newlines
      .trim();
  }

  async getUnifiedStyleIntelligence(userId: string, context: any, mode: string): Promise<any> {
    // Get user context and brand intelligence
    const userContext = await this.analyzeUserContext(userId);
    
    return {
      userProfile: userContext?.userProfile,
      brandContext: userContext?.brandMaturity,
      styleRecommendations: userContext?.recommendations || [],
      conversationHistory: userContext?.conversationSummary || [],
      confidence: this.calculateConfidence('unified intelligence', context),
      mode,
      timestamp: new Date().toISOString()
    };
  }


}

export const unifiedMayaIntelligenceService = new UnifiedMayaIntelligenceService();