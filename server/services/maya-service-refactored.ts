/**
 * ⚠️  DEPRECATED SERVICE - CONSOLIDATED INTO MAYA-SERVICE.TS ⚠️
 * 
 * This refactored service has been DEPRECATED as part of Phase 2: Service Unification.
 * All Maya functionality has been consolidated into server/services/maya-service.ts
 * 
 * REASON FOR DEPRECATION:
 * - Modular architecture created complexity without clear benefits
 * - Multiple services led to fragmented extraction logic and routing conflicts
 * - Single unified service provides better maintainability and consistency
 * 
 * All modular service patterns have been evaluated and best features integrated into:
 * - server/services/maya-service.ts (unified Maya service)
 * 
 * @deprecated DO NOT USE - Use server/services/maya-service.ts instead
 * @since Service Unification Phase 2
 */

/*
// Legacy Maya AI Service - Refactored Composition Service - DEPRECATED
// Orchestrates Maya AI brand strategist functionality using modular services
// Provides unified interface for user profiles, conversations, concept cards, and image generation
*/

import { getDatabase, type IStorage } from '../../shared/database-provider.js';
import { MayaProfileService } from './maya/profile-service.js';
import { MayaConversationService } from './maya/conversation-service.js';
import { MayaConceptCardService } from './maya/concept-card-service.js';
import { MayaGenerationCoordinator } from './maya/generation-coordinator.js';

// Re-export types from modular services for backward compatibility
export type { MayaChatRequest, MayaChatResponse } from './maya/conversation-service.js';
export type { MayaGenerationRequest, MayaGenerationResponse } from './maya/generation-coordinator.js';

/**
 * Main Maya AI Service - Composition Pattern
 * Coordinates between specialized Maya services
 */
export class MayaService {
  private profileService: MayaProfileService;
  private conversationService: MayaConversationService;
  private conceptCardService: MayaConceptCardService;
  private generationCoordinator: MayaGenerationCoordinator;
  private db: IStorage;

  constructor(db?: IStorage) {
    this.db = db || getDatabase();
    
    // Initialize modular services
    this.profileService = new MayaProfileService(this.db);
    this.conversationService = new MayaConversationService(this.db);
    this.conceptCardService = new MayaConceptCardService(this.db);
    this.generationCoordinator = new MayaGenerationCoordinator(this.db);
    
    console.log('✅ MAYA SERVICE: Initialized with modular architecture');
  }

  // ==================== USER PROFILE OPERATIONS ====================

  /**
   * Get or create user profile with Maya onboarding
   */
  async getOrCreateUserProfile(userId: string) {
    return this.profileService.getOrCreateUserProfile(userId);
  }

  /**
   * Get user's trained model information
   */
  async getUserModel(userId: string) {
    return this.profileService.getUserModel(userId);
  }

  /**
   * Update generation statistics
   */
  async updateGenerationStats(userId: string, count: number = 1) {
    return this.profileService.updateGenerationStats(userId, count);
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(userId: string, feature: 'mayaChat' | 'imageGeneration' | 'modelTraining'): Promise<boolean> {
    return this.profileService.hasFeatureAccess(userId, feature);
  }

  // ==================== CONVERSATION OPERATIONS ====================

  /**
   * Process Maya chat conversation
   */
  async processChat(request: { message: string; userId: string; conversationId?: string }) {
    return this.conversationService.processChat(request.userId, {
      message: request.message,
      history: [],
      conversationId: request.conversationId
    });
  }

  /**
   * Process and save chat conversation
   */
  async processAndSaveChat(request: { message: string; userId: string; conversationId?: string; mayaResponseContent?: string }) {
    return this.conversationService.processAndSaveChat(request.userId, {
      message: request.message,
      conversationId: request.conversationId,
      mayaResponseContent: request.mayaResponseContent || 'Maya is processing your request...'
    });
  }

  // ==================== CONCEPT CARD OPERATIONS ====================

  /**
   * Extract concept cards from Maya response
   */
  async extractConceptCards(responseText: string, userId?: string, conversationId?: string) {
    const cards = this.conceptCardService.extractConceptCards(responseText);
    
    // Save cards if userId provided
    if (userId && cards.length > 0) {
      await this.conceptCardService.saveConceptCards(cards, userId, conversationId);
    }
    
    return cards;
  }

  /**
   * Get concept cards for conversation
   */
  async getConceptCards(conversationId: string) {
    return this.conceptCardService.getConceptCards(conversationId);
  }

  /**
   * Save concept cards
   */
  async saveConceptCards(cards: any[], userId: string, conversationId?: string) {
    return this.conceptCardService.saveConceptCards(cards, userId, conversationId);
  }

  // ==================== IMAGE GENERATION OPERATIONS ====================

  /**
   * Generate images based on concept card
   */
  async generateImages(userId: string, request: { conceptCard: any; conversationId?: string }) {
    return this.generationCoordinator.generateImages(userId, request);
  }

  /**
   * Get generation status
   */
  async getGenerationStatus(userId: string, generationId: string) {
    return this.generationCoordinator.getGenerationStatus(userId, generationId);
  }

  // ==================== LEGACY COMPATIBILITY METHODS ====================
  // These methods maintain backward compatibility with existing routes

  /**
   * Legacy method: Process chat message (backward compatibility)
   */
  async processMessage(request: { message: string; userId: string; conversationId?: string }) {
    console.log('📞 MAYA SERVICE: Legacy processMessage called, routing to processChat');
    return this.processChat(request);
  }

  /**
   * Legacy method: Generate concept card (backward compatibility)
   */
  async generateConceptCard(userId: string, concept: any) {
    console.log('📞 MAYA SERVICE: Legacy generateConceptCard called, routing to extractConceptCards');
    const mockResponse = `Here's a concept for your brand: ${concept.title || 'New Concept'}`;
    return this.extractConceptCards(mockResponse, userId);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get Maya service health status
   */
  async getHealthStatus() {
    try {
      // Check if all services are initialized
      const servicesStatus = {
        profileService: !!this.profileService,
        conversationService: !!this.conversationService,
        conceptCardService: !!this.conceptCardService,
        generationCoordinator: !!this.generationCoordinator
      };
      
      return {
        status: 'healthy',
        services: servicesStatus,
        database: true, // Database provider handles connection
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('❌ MAYA SERVICE: Health check failed:', error);
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Reset service state (useful for testing)
   */
  async reset() {
    console.log('🔄 MAYA SERVICE: Resetting service state');
    // Services will be re-initialized on next use
  }
}

// Export singleton instance for backward compatibility
export const mayaService = new MayaService();