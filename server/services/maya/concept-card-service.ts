/**
 * Maya Concept Card Service
 * Handles concept card extraction and management for Maya AI
 */

import { getDatabase, type IStorage } from '../../../shared/database-provider.js';

export interface ConceptCard {
  id: string;
  title: string;
  description: string;
  fluxPrompt: string;
  creativeLook: string;
  emoji: string;
  category?: string;
  tags?: string[];
  createdAt?: Date;
}

export interface ConceptCardRequest {
  userMessage: string;
  mayaResponse: string;
  conversationId?: string;
  userId: string;
}

export class MayaConceptCardService {
  private db: IStorage;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    console.log('✅ MAYA CONCEPT CARDS: Service initialized');
  }

  /**
   * Extract concept cards from Maya's response text
   */
  extractConceptCards(response: string): ConceptCard[] {
    const conceptCards: ConceptCard[] = [];
    
    try {
      // Look for concept card patterns in Maya's response
      // This is a simplified implementation - in production, this would use more sophisticated NLP
      
      // Pattern 1: Look for structured concept descriptions
      const conceptPattern = /\*\*([^*]+)\*\*[\s\S]*?(?=\*\*|$)/g;
      let match;
      let cardIndex = 1;
      
      while ((match = conceptPattern.exec(response)) !== null && cardIndex <= 5) {
        const title = match[1].trim();
        const fullMatch = match[0];
        
        // Extract description (text after the title)
        const descriptionMatch = fullMatch.match(/\*\*[^*]+\*\*\s*(.+)/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        
        // Generate FLUX prompt based on the concept
        const fluxPrompt = this.generateFluxPrompt(title, description);
        
        // Determine creative look and emoji
        const creativeLook = this.determineCreativeLook(title, description);
        const emoji = this.selectEmoji(title, creativeLook);
        
        conceptCards.push({
          id: `concept_${Date.now()}_${cardIndex}`,
          title: title.substring(0, 100), // Limit title length
          description: description.substring(0, 500), // Limit description length
          fluxPrompt,
          creativeLook,
          emoji,
          category: this.categorizeCard(title, description),
          tags: this.extractTags(title + ' ' + description),
          createdAt: new Date()
        });
        
        cardIndex++;
      }

      // Pattern 2: Look for numbered lists
      if (conceptCards.length === 0) {
        const numberedPattern = /(\d+\.\s*)([^\n\r]+)/g;
        let numberedMatch;
        let numberedIndex = 1;
        
        while ((numberedMatch = numberedPattern.exec(response)) !== null && numberedIndex <= 5) {
          const title = numberedMatch[2].trim();
          
          conceptCards.push({
            id: `concept_${Date.now()}_${numberedIndex}`,
            title: title.substring(0, 100),
            description: title,
            fluxPrompt: this.generateFluxPrompt(title, title),
            creativeLook: this.determineCreativeLook(title, title),
            emoji: this.selectEmoji(title, 'professional'),
            category: 'general',
            tags: this.extractTags(title),
            createdAt: new Date()
          });
          
          numberedIndex++;
        }
      }

      console.log(`✨ MAYA CONCEPT CARDS: Extracted ${conceptCards.length} concept cards`);
      return conceptCards;
      
    } catch (error) {
      console.error('❌ MAYA CONCEPT CARDS: Failed to extract concept cards:', error);
      return [];
    }
  }

  /**
   * Generate FLUX-optimized prompt for the concept
   */
  private generateFluxPrompt(title: string, description: string): string {
    // Create a professional, FLUX-optimized prompt
    const basePrompt = `Professional portrait photography, ${title.toLowerCase()}, ${description.toLowerCase()}`;
    const styleElements = [
      'high-quality professional photography',
      'studio lighting',
      'modern aesthetic',
      'clean composition',
      'sharp focus',
      'professional attire'
    ];
    
    return `${basePrompt}, ${styleElements.join(', ')}, 8k resolution, professional headshot`;
  }

  /**
   * Determine the creative look based on content
   */
  private determineCreativeLook(title: string, description: string): string {
    const content = (title + ' ' + description).toLowerCase();
    
    if (content.includes('luxury') || content.includes('elegant') || content.includes('sophisticated')) {
      return 'luxury';
    } else if (content.includes('creative') || content.includes('artistic') || content.includes('innovative')) {
      return 'creative';
    } else if (content.includes('business') || content.includes('corporate') || content.includes('professional')) {
      return 'professional';
    } else if (content.includes('modern') || content.includes('contemporary') || content.includes('tech')) {
      return 'modern';
    } else if (content.includes('classic') || content.includes('timeless') || content.includes('traditional')) {
      return 'classic';
    }
    
    return 'professional'; // Default
  }

  /**
   * Select appropriate emoji for the concept
   */
  private selectEmoji(title: string, creativeLook: string): string {
    const content = title.toLowerCase();
    
    // Content-based emoji selection
    if (content.includes('strategy') || content.includes('plan')) return '🎯';
    if (content.includes('brand') || content.includes('identity')) return '✨';
    if (content.includes('social') || content.includes('media')) return '📱';
    if (content.includes('network') || content.includes('connection')) return '🤝';
    if (content.includes('creative') || content.includes('design')) return '🎨';
    if (content.includes('leadership') || content.includes('executive')) return '👑';
    if (content.includes('innovation') || content.includes('tech')) return '💡';
    if (content.includes('growth') || content.includes('success')) return '📈';
    
    // Style-based emoji fallback
    switch (creativeLook) {
      case 'luxury': return '💎';
      case 'creative': return '🎨';
      case 'modern': return '🚀';
      case 'classic': return '🏛️';
      default: return '⭐';
    }
  }

  /**
   * Categorize the concept card
   */
  private categorizeCard(title: string, description: string): string {
    const content = (title + ' ' + description).toLowerCase();
    
    if (content.includes('brand') || content.includes('identity')) return 'branding';
    if (content.includes('social') || content.includes('media')) return 'social-media';
    if (content.includes('leadership') || content.includes('executive')) return 'leadership';
    if (content.includes('strategy') || content.includes('plan')) return 'strategy';
    if (content.includes('network') || content.includes('relationship')) return 'networking';
    if (content.includes('creative') || content.includes('design')) return 'creative';
    if (content.includes('professional') || content.includes('career')) return 'professional';
    
    return 'general';
  }

  /**
   * Extract relevant tags from the content
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const tagKeywords = [
      'professional', 'luxury', 'creative', 'modern', 'classic',
      'brand', 'strategy', 'leadership', 'social', 'network',
      'business', 'corporate', 'executive', 'innovative', 'elegant'
    ];
    
    const lowercaseContent = content.toLowerCase();
    
    tagKeywords.forEach(keyword => {
      if (lowercaseContent.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Limit to top 5 tags
    return tags.slice(0, 5);
  }

  /**
   * Save concept cards to database (if needed for persistence)
   */
  async saveConceptCards(cards: ConceptCard[], userId: string, conversationId?: string): Promise<void> {
    try {
      // This is a placeholder for future database persistence
      // Currently concept cards are generated on-the-fly
      console.log(`💾 MAYA CONCEPT CARDS: Would save ${cards.length} cards for user ${userId}`);
    } catch (error) {
      console.error('❌ MAYA CONCEPT CARDS: Failed to save concept cards:', error);
      throw error;
    }
  }

  /**
   * Get concept cards for a conversation (if stored in database)
   */
  async getConceptCards(conversationId: string): Promise<ConceptCard[]> {
    try {
      // This is a placeholder for future database retrieval
      // Currently concept cards are generated on-the-fly
      console.log(`🔍 MAYA CONCEPT CARDS: Would retrieve cards for conversation ${conversationId}`);
      return [];
    } catch (error) {
      console.error('❌ MAYA CONCEPT CARDS: Failed to get concept cards:', error);
      return [];
    }
  }
}

// Export singleton instance
export const mayaConceptCardService = new MayaConceptCardService();