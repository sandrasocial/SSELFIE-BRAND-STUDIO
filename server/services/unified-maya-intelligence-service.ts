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
      // Get Maya's personality configuration
      const systemPrompt = 'You are Maya, a luxury AI personal branding strategist who helps clients develop their personal brand through strategic conversation and creative visual concepts.';

      // Build conversation history
      const history = context?.previousMessages || [];

      // Generate Maya's response using Claude
      const claudeResponse = await this.claudeService.sendMessage(
        message,
        history,
        systemPrompt
      );

      // Extract concept cards directly from Claude response
      const conceptCards = this.extractConceptCards(claudeResponse.content);

      return {
        response: claudeResponse.content,
        conversationId: conversationId || `maya_${Date.now()}`,
        conceptCards: conceptCards,
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

  /**
   * Extract concept cards from Maya's response
   * Moved from maya-service.ts for centralized processing
   */
  private extractConceptCards(response: string): Array<{
    id: string;
    title: string;
    description: string;
    fluxPrompt: string;
    creativeLook: string;
    emoji: string;
  }> {
    const conceptCards = [];

    try {
      console.log('🔍 UNIFIED MAYA: Extracting concept cards from response:', response.substring(0, 500));
      
      // Split response by concept separators first
      const conceptSections = response.split(/---+/);
      
      for (const section of conceptSections) {
        if (section.trim().length < 50) continue; // Skip short sections
        
        // Enhanced regex pattern for more robust concept card extraction
        const emojiConceptPattern = /([^\w\s])\s*\*\*([^*]+)\*\*\s*\n([^*]+?)\s*\n\s*FLUX_PROMPT:\s*\[([^\]]+)\]/g;
        
        let match;
        while ((match = emojiConceptPattern.exec(section)) !== null) {
          const emoji = match[1].trim();
          const title = match[2].trim();
          let description = match[3].trim();
          let fluxPrompt = match[4].trim();
          
          // Clean up text
          description = description.replace(/\n+/g, ' ').trim();
          fluxPrompt = fluxPrompt.replace(/\[|\]/g, '').trim();
          
          if (title && description && title.length > 3 && description.length > 10) {
            console.log(`✅ UNIFIED MAYA: Found concept card - ${emoji} ${title}`);
            conceptCards.push({
              id: `concept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              title,
              description,
              fluxPrompt,
              creativeLook: 'Professional',
              emoji,
            });
          }
        }
      }

      console.log(`🎯 UNIFIED MAYA: Extracted ${conceptCards.length} concept cards total`);
      return conceptCards;

    } catch (error) {
      console.error('❌ UNIFIED MAYA: Error extracting concept cards:', error);
      return [];
    }
  }
}

export const unifiedMayaIntelligenceService = new UnifiedMayaIntelligenceService();