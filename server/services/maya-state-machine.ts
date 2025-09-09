/**
 * MAYA STATE MACHINE - Operational Intelligence System
 * The breakthrough solution to Maya's mode confusion
 * 
 * Orchestrates:
 * - Intent detection from user messages  
 * - Visual onboarding flow management
 * - Conversation vs concept generation modes
 * - Seamless state transitions
 */

import { mayaIntentService, type UserIntent, type MayaState } from './maya-intent-service';
import { simpleOnboardingService } from './simple-onboarding-service';
import { PersonalityManager } from '../agents/personalities/personality-config';

export type MayaMode = 'onboarding' | 'conversation' | 'concepts';

export interface MayaResponse {
  mode: MayaMode;
  message: string;
  conceptCards?: any[];
  onboardingUI?: {
    type: 'visual_cards';
    currentStep: string;
    data: any;
  };
  quickActions?: string[];
  requiresUserInput?: boolean;
}

export interface MayaContext {
  userId: string;
  currentState: MayaState;
  conversationHistory: any[];
  lastUserMessage: string;
}

export class MayaStateMachine {
  
  /**
   * CORE INTELLIGENCE: Process user message and determine Maya's response
   * This is the breakthrough - Maya knows exactly what to do!
   */
  public async processUserMessage(
    userId: string, 
    message: string, 
    conversationHistory: any[] = []
  ): Promise<MayaResponse> {
    
    try {
      console.log(`🧠 Maya State Machine: Processing message for user ${userId}`);
      console.log(`📝 Message: "${message}"`);
      
      // Step 1: Get current Maya state
      const currentState = await mayaIntentService.getMayaState(userId);
      console.log(`📊 Current state: ${currentState.onboardingStatus}, completeness: ${currentState.dataCompleteness.completenessScore}%`);
      
      // Step 2: Detect user intent
      const userIntent = mayaIntentService.detectUserIntent(message, currentState);
      console.log(`🎯 Detected intent: ${userIntent}`);
      
      // Step 3: Get Maya's recommended action
      const nextAction = mayaIntentService.getNextAction(userIntent, currentState);
      console.log(`🚀 Next action: ${nextAction.action}`);
      
      // Step 4: Execute the appropriate response
      return await this.executeResponse(nextAction, {
        userId,
        currentState,
        conversationHistory,
        lastUserMessage: message
      });
      
    } catch (error) {
      console.error('❌ Maya State Machine error:', error);
      return {
        mode: 'conversation',
        message: "I'm having a small technical moment! Let's try that again. What can I help you with?",
        requiresUserInput: true
      };
    }
  }
  
  /**
   * Execute Maya's response based on the recommended action
   */
  private async executeResponse(
    nextAction: { action: string; message: string; requiresUI?: string },
    context: MayaContext
  ): Promise<MayaResponse> {
    
    switch (nextAction.action) {
      
      case 'show_onboarding':
        return await this.handleOnboardingMode(context);
      
      case 'provide_advice':
        return await this.handleConversationMode(context);
      
      case 'generate_concepts':
        return await this.handleConceptMode(context);
      
      case 'generate_images':
        return await this.handleGenerationMode(context);
      
      default:
        return {
          mode: 'conversation',
          message: nextAction.message,
          requiresUserInput: true
        };
    }
  }
  
  /**
   * Handle onboarding mode - show visual onboarding cards
   */
  private async handleOnboardingMode(context: MayaContext): Promise<MayaResponse> {
    console.log('🎨 Maya: Entering onboarding mode');
    
    const { dataCompleteness } = context.currentState;
    let currentStep = 'welcome';
    
    // Determine which step to show based on data completeness
    if (!dataCompleteness.hasGender) {
      currentStep = 'gender';
    } else if (!dataCompleteness.hasPreferredName) {
      currentStep = 'name';
    } else if (!dataCompleteness.hasBusinessContext) {
      currentStep = 'use';
    } else if (!dataCompleteness.hasStylePreference) {
      currentStep = 'style';
    }
    
    // Get personalized onboarding message
    const message = await this.getPersonalizedOnboardingMessage(dataCompleteness);
    
    return {
      mode: 'onboarding',
      message,
      onboardingUI: {
        type: 'visual_cards',
        currentStep,
        data: {
          completenessScore: dataCompleteness.completenessScore,
          hasGender: dataCompleteness.hasGender,
          hasPreferredName: dataCompleteness.hasPreferredName,
          hasBusinessContext: dataCompleteness.hasBusinessContext,
          hasStylePreference: dataCompleteness.hasStylePreference
        }
      },
      requiresUserInput: true
    };
  }
  
  /**
   * Handle conversation mode - Maya provides advice/answers
   */
  private async handleConversationMode(context: MayaContext): Promise<MayaResponse> {
    console.log('💬 Maya: Entering conversation mode');
    
    // Use Maya's personality for conversation response
    const conversationContext = `
User is asking: "${context.lastUserMessage}"

User's current setup: 
- Onboarding ${context.currentState.onboardingStatus}
- Data completeness: ${context.currentState.dataCompleteness.completenessScore}%
- Has generated ${context.currentState.conceptsGenerated} concepts

Maya should provide helpful advice while gently encouraging concept generation when appropriate.
    `;
    
    try {
      const mayaResponse = await PersonalityManager.getNaturalPrompt('maya', {
        content: context.lastUserMessage,
        context: conversationContext,
        requestType: 'conversation'
      });
      
      // Add subtle concept generation nudge if user is ready
      const quickActions: string[] = [];
      if (context.currentState.onboardingStatus === 'complete') {
        quickActions.push('Create photo concepts', 'Show style inspirations', 'Generate images');
      }
      
      return {
        mode: 'conversation',
        message: mayaResponse.content,
        quickActions: quickActions.length > 0 ? quickActions : undefined,
        requiresUserInput: true
      };
      
    } catch (error) {
      console.error('❌ Maya conversation error:', error);
      return {
        mode: 'conversation',
        message: "I'd love to help with that! What specifically are you thinking about with your brand photos?",
        requiresUserInput: true
      };
    }
  }
  
  /**
   * Handle concept generation mode - Maya creates concept cards
   */
  private async handleConceptMode(context: MayaContext): Promise<MayaResponse> {
    console.log('✨ Maya: Entering concept generation mode');
    
    // Only allow concept generation if onboarding is complete
    if (context.currentState.onboardingStatus !== 'complete') {
      return {
        mode: 'onboarding',
        message: "I'd love to create concepts for you! Let me just finish getting to know your style first. This ensures your photos are perfectly you! ✨",
        onboardingUI: {
          type: 'visual_cards',
          currentStep: 'welcome',
          data: context.currentState.dataCompleteness
        },
        requiresUserInput: true
      };
    }
    
    try {
      // Use Maya's personality for concept generation
      const conceptContext = `
User wants photo concepts. 
User message: "${context.lastUserMessage}"

Generate 3-5 concept cards with variety:
- Mix business/personal/lifestyle concepts
- Use user's completed onboarding data for personalization
- Each concept should have title, description, and FLUX-optimized prompt
- Make concepts inspiring and actionable
      `;
      
      const mayaResponse = await PersonalityManager.getNaturalPrompt('maya', {
        content: context.lastUserMessage,
        context: conceptContext,
        requestType: 'concept_generation'
      });
      
      return {
        mode: 'concepts',
        message: mayaResponse.content,
        conceptCards: mayaResponse.conceptCards || [],
        quickActions: ['Generate from concept', 'Create more ideas', 'Customize concepts'],
        requiresUserInput: false
      };
      
    } catch (error) {
      console.error('❌ Maya concept generation error:', error);
      return {
        mode: 'concepts',
        message: "Let me create some amazing concept ideas for you! ✨",
        conceptCards: [],
        requiresUserInput: false
      };
    }
  }
  
  /**
   * Handle image generation mode
   */
  private async handleGenerationMode(context: MayaContext): Promise<MayaResponse> {
    console.log('📸 Maya: Entering generation mode');
    
    return {
      mode: 'concepts',
      message: "Perfect! Choose any concept card to generate your photos. I'll create stunning images that perfectly match your style! 📸",
      quickActions: ['View gallery', 'Create more concepts', 'Adjust style'],
      requiresUserInput: false
    };
  }
  
  /**
   * Complete onboarding with visual card data
   */
  public async completeOnboarding(userId: string, onboardingData: any): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('✅ Maya State Machine: Completing onboarding for user', userId);
      
      // Save onboarding data using the simple service
      const result = await simpleOnboardingService.saveOnboardingAnswers(userId, {
        gender: onboardingData.gender,
        preferredName: onboardingData.preferredName,
        primaryUse: onboardingData.primaryUse,
        styleVibe: onboardingData.styleVibe
      });
      
      if (result.success) {
        console.log('🎉 Maya: Onboarding completed successfully');
        return {
          success: true,
          message: `Perfect, ${onboardingData.preferredName}! I've got everything I need. Ready to create some stunning ${onboardingData.primaryUse} photos with ${onboardingData.styleVibe} vibes? Let's make magic happen! ✨`
        };
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('❌ Maya: Failed to complete onboarding:', error);
      return {
        success: false,
        message: "I had a small issue saving your preferences. Let's try that last step again!"
      };
    }
  }
  
  /**
   * Get personalized onboarding message based on data completeness
   */
  private async getPersonalizedOnboardingMessage(dataCompleteness: any): Promise<string> {
    if (dataCompleteness.completenessScore === 0) {
      return "Hi there! ✨ I'm Maya, your personal AI stylist. Let me get to know you so I can create perfect photos for your brand!";
    } else if (dataCompleteness.completenessScore < 50) {
      return "Great start! I just need a few more details to create photos that are perfectly you.";
    } else if (dataCompleteness.completenessScore < 100) {
      return "Almost there! Just one more thing and we can start creating amazing photos together!";
    } else {
      return "You're all set! Ready to create some incredible photos?";
    }
  }
}

export const mayaStateMachine = new MayaStateMachine();