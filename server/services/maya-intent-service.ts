/**
 * MAYA INTENT DETECTION & STATE MANAGEMENT SERVICE
 * The breakthrough solution to Maya's mode confusion
 * 
 * Maya's Operational Intelligence Framework:
 * - Detect user intent from message content
 * - Track onboarding data completeness  
 * - Determine appropriate response mode
 * - Seamlessly switch between onboarding/conversation/concepts
 */

export type UserIntent = 
  | 'onboarding'     // User needs to complete setup
  | 'conversation'   // User wants advice/chat
  | 'concepts'       // User wants photo concepts
  | 'generation';    // User wants to generate images

export type OnboardingStatus = 
  | 'incomplete'     // Missing essential data
  | 'partial'        // Has some data, needs more
  | 'complete';      // Ready for concept generation

export interface MayaState {
  userId: string;
  onboardingStatus: OnboardingStatus;
  dataCompleteness: DataCompleteness;
  lastIntent: UserIntent;
  conversationCount: number;
  conceptsGenerated: number;
  timestamp: number;
}

export interface DataCompleteness {
  hasGender: boolean;           // Critical for FLUX generation
  hasPreferredName: boolean;    // For personalization
  hasBusinessContext: boolean;  // For styling direction
  hasStylePreference: boolean;  // For concept generation
  completenessScore: number;    // 0-100% complete
}

export class MayaIntentService {
  
  /**
   * CORE INTELLIGENCE: Detect user intent from message content
   * This is Maya's breakthrough - she knows what users want!
   */
  public detectUserIntent(message: string, currentState: MayaState): UserIntent {
    const lowercaseMessage = message.toLowerCase().trim();
    
    // Priority 1: Onboarding completion (if data incomplete)
    if (currentState.onboardingStatus !== 'complete') {
      // Allow conversation during onboarding for questions
      const conversationKeywords = [
        'help', 'what', 'how', 'why', 'can you', 'advice', 'tell me',
        'explain', 'should i', 'recommend', 'suggest', 'think', 'opinion'
      ];
      
      const hasConversationIntent = conversationKeywords.some(keyword => 
        lowercaseMessage.includes(keyword)
      );
      
      return hasConversationIntent ? 'conversation' : 'onboarding';
    }
    
    // Priority 2: Photo generation requests
    const generationKeywords = [
      'generate', 'create', 'make', 'show me', 'build', 'produce',
      'photo', 'image', 'picture', 'shoot', 'portrait'
    ];
    
    const hasGenerationIntent = generationKeywords.some(keyword => 
      lowercaseMessage.includes(keyword)
    );
    
    if (hasGenerationIntent) {
      return 'generation';
    }
    
    // Priority 3: Concept card requests  
    const conceptKeywords = [
      'concept', 'idea', 'style', 'look', 'outfit', 'vibe',
      'inspiration', 'suggestion', 'option', 'possibilities',
      'business photos', 'professional shots', 'brand photos'
    ];
    
    const hasConceptIntent = conceptKeywords.some(keyword => 
      lowercaseMessage.includes(keyword)
    ) || lowercaseMessage.length < 20; // Short messages often want concepts
    
    if (hasConceptIntent) {
      return 'concepts';
    }
    
    // Default: Conversation mode for advice/questions
    return 'conversation';
  }
  
  /**
   * Check onboarding data completeness using existing user fields
   */
  public async getDataCompleteness(userId: string): Promise<DataCompleteness> {
    try {
      const { storage } = await import('../storage');
      const user = await storage.getUser(userId);
      
      if (!user) {
        return {
          hasGender: false,
          hasPreferredName: false, 
          hasBusinessContext: false,
          hasStylePreference: false,
          completenessScore: 0
        };
      }
      
      // Check data using our mapping to existing fields
      const hasGender = !!user.gender;
      const hasPreferredName = !!user.profession;      // stored in profession field
      const hasBusinessContext = !!user.brand_style;   // stored in brand_style field  
      const hasStylePreference = !!user.photo_goals;   // stored in photo_goals field
      
      const completedFields = [hasGender, hasPreferredName, hasBusinessContext, hasStylePreference]
        .filter(Boolean).length;
      const completenessScore = (completedFields / 4) * 100;
      
      return {
        hasGender,
        hasPreferredName,
        hasBusinessContext, 
        hasStylePreference,
        completenessScore
      };
      
    } catch (error) {
      console.error('❌ Failed to get data completeness:', error);
      return {
        hasGender: false,
        hasPreferredName: false,
        hasBusinessContext: false,
        hasStylePreference: false,
        completenessScore: 0
      };
    }
  }
  
  /**
   * Determine onboarding status from data completeness
   */
  public getOnboardingStatus(dataCompleteness: DataCompleteness): OnboardingStatus {
    if (dataCompleteness.completenessScore === 100) {
      return 'complete';
    } else if (dataCompleteness.completenessScore >= 50) {
      return 'partial'; 
    } else {
      return 'incomplete';
    }
  }
  
  /**
   * Get current Maya state for a user
   */
  public async getMayaState(userId: string): Promise<MayaState> {
    const dataCompleteness = await this.getDataCompleteness(userId);
    const onboardingStatus = this.getOnboardingStatus(dataCompleteness);
    
    return {
      userId,
      onboardingStatus,
      dataCompleteness,
      lastIntent: 'conversation', // Default
      conversationCount: 0,
      conceptsGenerated: 0, 
      timestamp: Date.now()
    };
  }
  
  /**
   * Maya's next action decision based on intent and state
   */
  public getNextAction(intent: UserIntent, state: MayaState): {
    action: 'show_onboarding' | 'provide_advice' | 'generate_concepts' | 'generate_images';
    message: string;
    requiresUI?: 'onboarding_cards' | 'concept_cards' | 'chat_only';
  } {
    
    // Handle onboarding intent
    if (intent === 'onboarding' || state.onboardingStatus !== 'complete') {
      return {
        action: 'show_onboarding',
        message: this.getOnboardingMessage(state.dataCompleteness),
        requiresUI: 'onboarding_cards'
      };
    }
    
    // Handle conversation intent (advice/questions)
    if (intent === 'conversation') {
      return {
        action: 'provide_advice',
        message: "I'm here to help! What would you like to know about your brand or photos?",
        requiresUI: 'chat_only'
      };
    }
    
    // Handle concept generation intent  
    if (intent === 'concepts') {
      return {
        action: 'generate_concepts',
        message: "Perfect! Let me create some stunning concept ideas for you! ✨",
        requiresUI: 'concept_cards'
      };
    }
    
    // Handle image generation intent
    return {
      action: 'generate_images', 
      message: "Let's create your photos! Choose a concept card to generate.",
      requiresUI: 'concept_cards'
    };
  }
  
  /**
   * Personalized onboarding messages based on data completeness
   */
  private getOnboardingMessage(dataCompleteness: DataCompleteness): string {
    if (dataCompleteness.completenessScore === 0) {
      return "Hi there! ✨ I'm Maya, your personal AI stylist. Let me get to know you so I can create perfect photos for your brand!";
    } else if (dataCompleteness.completenessScore < 50) {
      return "Great start! I just need a few more details to create photos that are perfectly you.";
    } else {
      return "Almost there! Just one more thing and we can start creating amazing photos together!";
    }
  }
}

export const mayaIntentService = new MayaIntentService();