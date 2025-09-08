import { personalBrandService, type PersonalBrandProfile } from './personal-brand-service';
import { mayaMemoryService } from './maya-memory-service';
import { PersonalityManager } from '../agents/personalities/personality-config';
import { LUXURY_VISUAL_TEMPLATES } from '../config/visual-brand-templates';

interface OnboardingStep {
  stepNumber: number;
  title: string;
  description: string;
  focus: string;
  questions: string[];
  quickButtons: string[];
}

interface OnboardingResponse {
  message: string;
  questions: string[];
  quickButtons: string[];
  stepGuidance: string;
  nextAction: 'continue' | 'complete_step' | 'complete_onboarding';
  currentStep: number;
  progress: number;
}

interface ConversationContext {
  userId: string;
  currentStep: number;
  completedSteps: number[];
  responses: Record<number, any>;
  personalBrandData: Partial<PersonalBrandProfile>;
}

/**
 * Onboarding Conversation Service
 * Manages the 6-step Maya onboarding flow with conversation intelligence
 */
export class OnboardingConversationService {
  
  // Define the 6-step onboarding flow
  private readonly ONBOARDING_STEPS: Record<number, OnboardingStep> = {
    1: {
      stepNumber: 1,
      title: "Welcome & Connection",
      description: "Getting to know your business and brand goals",
      focus: "Build connection and understand their story",
      questions: [
        "What brought you here today?",
        "Tell me about where you are in your journey right now?",
        "What's your biggest challenge when it comes to feeling confident?"
      ],
      quickButtons: [] // Maya AI now generates intelligent, contextual quick actions
    },
    
    2: {
      stepNumber: 2,
      title: "Current Situation",
      description: "Understanding where you are today",
      focus: "Understand their current situation and challenges",
      questions: [
        "What's your current situation like?",
        "What challenges are you facing right now?",
        "What's working well for you, and what isn't?"
      ],
      quickButtons: [] // Maya AI now generates intelligent, contextual quick actions
    },
    
    3: {
      stepNumber: 3,
      title: "Future Self Vision",
      description: "Exploring your dreams and goals",
      focus: "Help them visualize their powerful future self",
      questions: [
        "Close your eyes and imagine yourself 2 years from now, successful and confident. What do you see?",
        "What would your life look like if you achieved your biggest dreams?",
        "Who is the woman you're becoming?"
      ],
      quickButtons: [] // Maya AI now generates intelligent, contextual quick actions
    },
    
    4: {
      stepNumber: 4,
      title: "Business & Goals",
      description: "Understanding your professional world",
      focus: "Capture their business context and goals",
      questions: [
        "What are you building or wanting to build?",
        "Who do you serve or want to serve?",
        "What's your mission or what impact do you want to make?"
      ],
      quickButtons: [] // Maya AI now generates intelligent, contextual quick actions
    },
    
    5: {
      stepNumber: 5,
      title: "Visual Brand Identity Selection",
      description: "Discovering your luxury brand aesthetic",
      focus: "Help them select from 17 luxury visual templates that align with their business vision",
      questions: [
        "Now let's discover your visual brand aesthetic! I have luxury templates inspired by high-end Pinterest feeds. Each creates a completely different brand experience.",
        "Which visual aesthetic aligns with your business vision?",
        "What draws you to this aesthetic - the colors, the mood, or the business feeling it creates?"
      ],
      quickButtons: [] // Maya AI now generates intelligent, contextual quick actions
    },
    
    6: {
      stepNumber: 6,
      title: "Photo Goals & Vision",
      description: "Planning your visual storytelling",
      focus: "Understand how they want to use their photos",
      questions: [
        "Where will you use these photos?",
        "What story do you want your images to tell?",
        "How do you want people to feel when they see your photos?"
      ],
      quickButtons: [] // Maya AI now generates intelligent, contextual quick actions
    }
  };

  /**
   * Process onboarding conversation message
   */
  async processOnboardingMessage(
    userId: string,
    message: string,
    currentStep: number = 1
  ): Promise<OnboardingResponse> {
    
    // Load current context
    const context = await this.loadConversationContext(userId, currentStep);
    
    // Get Maya's onboarding personality
    const mayaPersonality = this.buildMayaOnboardingPrompt(context);
    
    // Call Maya's intelligence for response
    const mayaResponse = await this.getMayaResponse(mayaPersonality, message, context);
    
    // Save conversation to memory
    await mayaMemoryService.saveMayaConversation(
      userId,
      message,
      mayaResponse.message,
      false // No image generation during onboarding
    );
    
    // Update personal brand data based on response
    await this.updatePersonalBrandData(userId, currentStep, message, mayaResponse);
    
    return mayaResponse;
  }

  /**
   * Complete current onboarding step and move to next
   */
  async completeOnboardingStep(
    userId: string,
    stepNumber: number,
    stepData: any
  ): Promise<{ nextStep: number; isCompleted: boolean }> {
    
    // Save step data to personal brand service
    await this.saveStepData(userId, stepNumber, stepData);
    
    // Update onboarding progress
    await personalBrandService.updateOnboardingProgress(userId, stepNumber + 1);
    
    const isCompleted = stepNumber >= 6;
    
    if (isCompleted) {
      // Complete the entire onboarding
      await personalBrandService.completePersonalBrandOnboarding(userId);
    }
    
    return {
      nextStep: Math.min(stepNumber + 1, 6),
      isCompleted
    };
  }

  /**
   * Get current onboarding status
   */
  async getOnboardingStatus(userId: string): Promise<{
    currentStep: number;
    isCompleted: boolean;
    progress: number;
    personalBrand?: PersonalBrandProfile;
  }> {
    
    const isCompleted = await personalBrandService.hasCompletedPersonalBrandOnboarding(userId);
    const currentStep = await personalBrandService.getOnboardingProgress(userId);
    const progress = this.calculateProgress(currentStep, isCompleted);
    
    let personalBrand;
    if (isCompleted) {
      personalBrand = await personalBrandService.getPersonalBrandProfile(userId);
    }
    
    return {
      currentStep,
      isCompleted,
      progress,
      personalBrand
    };
  }

  // ===== PRIVATE METHODS =====

  /**
   * Load conversation context for Maya
   */
  private async loadConversationContext(userId: string, currentStep: number): Promise<ConversationContext> {
    const personalBrandData = await personalBrandService.getPersonalBrandProfile(userId);
    const conversationHistory = await mayaMemoryService.getConversationHistory(userId, 5);
    
    return {
      userId,
      currentStep,
      completedSteps: this.getCompletedSteps(personalBrandData),
      responses: this.extractPreviousResponses(conversationHistory),
      personalBrandData
    };
  }

  /**
   * Build Maya's onboarding personality prompt
   */
  private buildMayaOnboardingPrompt(context: ConversationContext): string {
    const step = this.ONBOARDING_STEPS[context.currentStep];
    const baseMayaPersonality = PersonalityManager.getNaturalPrompt('maya');
    
    return `${baseMayaPersonality}

🌟 MAYA'S ONBOARDING MODE - PERSONAL BRAND DISCOVERY JOURNEY

You're guiding her through discovering her personal brand and professional vision. Use your natural styling expertise to help her clarify her brand direction and photo goals.

CURRENT ONBOARDING CONTEXT:
- Step: ${step.stepNumber}/6 - ${step.title}
- Focus: ${step.focus}
- Description: ${step.description}

ONBOARDING FLOW RULES:
1. STAY ON CURRENT STEP: Don't jump ahead to future topics
2. CLEAR INSTRUCTIONS: Always mention users can "click a suggestion below or share your own thoughts"
3. STEP COMPLETION: When you have enough information for this step, guide them to the next step
4. PROGRESS TRACKING: Reference their progress through the 6 steps when appropriate

PERSONAL BRAND CONTEXT WE'VE DISCOVERED:
${this.formatPersonalBrandContext(context.personalBrandData)}

CONVERSATION APPROACH FOR THIS STEP:
${step.questions.join('\n- ')}

${context.currentStep === 5 ? this.getVisualTemplateOptions() : ''}

MAYA'S AUTHENTIC VOICE (USE HER NATURAL PERSONALITY):
- Follow Maya's established voice patterns from her personality config
- Maintain her natural styling expertise and warm professionalism
- Use her characteristic phrases and energy level
- Keep her authentic conversation style - not artificially enthusiastic
- Reference specific details they've shared to show you're listening
- Help them see their powerful future self through her genuine expertise
- CLEAR GUIDANCE: In EVERY response, include the phrase "You can click one of my suggestions below or share your own thoughts - whatever feels right!"
- STEP PROGRESSION: Stay focused on the current step only, don't jump to future topics
- STEP TRANSITIONS: When ready to move to next step, clearly say "I think we're ready for step X" and explain what's coming next

RESPONSE FORMAT REQUIREMENTS:
You MUST respond with valid JSON in this exact format:
{
  "message": "Your warm, encouraging response + guidance about clicking suggestions or sharing thoughts",
  "questions": ["Follow-up question 1", "Follow-up question 2"],
  "quickButtons": ["Contextual action 1", "Contextual action 2", "Contextual action 3"],
  "stepGuidance": "Brief guidance about current step ${step.stepNumber}/6",
  "nextAction": "continue",
  "currentStep": ${step.stepNumber},
  "progress": ${this.calculateProgress(context.currentStep, false)}
}

🎯 INTELLIGENT QUICK ACTIONS:
For quickButtons, generate 3-4 contextual, personalized options based on:
- What they just shared with you
- Natural next steps in the conversation
- Specific to their situation, NOT generic templates
- Written conversationally, as if you're suggesting the next thing to explore

Examples of GOOD quick actions:
- "Tell me about your coaching business"
- "I need LinkedIn authority photos" 
- "Help me see my CEO future self"
- "What about behind-the-scenes content"

Examples of BAD quick actions (never use these):
- Generic templates or category labels
- Assumptions about personal situations
- One-size-fits-all responses

Remember: You're helping her clarify her brand direction and photo goals using your styling expertise. Keep the conversation focused and professional while maintaining your natural warmth.`;
  }

  /**
   * Get Maya's response using Claude API
   */
  private async getMayaResponse(
    systemPrompt: string,
    userMessage: string,
    context: ConversationContext
  ): Promise<OnboardingResponse> {
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const responseText = data.content[0].text;

      // Parse JSON response
      try {
        const parsedResponse = JSON.parse(responseText);
        
        // Validate response structure
        return {
          message: parsedResponse.message || "I'm here to help you discover your amazing future self!",
          questions: Array.isArray(parsedResponse.questions) ? parsedResponse.questions : [],
          quickButtons: Array.isArray(parsedResponse.quickButtons) ? parsedResponse.quickButtons : [],
          stepGuidance: parsedResponse.stepGuidance || this.ONBOARDING_STEPS[context.currentStep].description,
          nextAction: parsedResponse.nextAction || 'continue',
          currentStep: context.currentStep,
          progress: this.calculateProgress(context.currentStep, false)
        };
        
      } catch (parseError) {
        console.error('Maya JSON parsing error:', parseError);
        
        // Fallback response if JSON parsing fails
        return this.createFallbackResponse(responseText, context);
      }
      
    } catch (error) {
      console.error('Maya onboarding conversation error:', error);
      return this.createFallbackResponse("I'm having trouble connecting right now, but I'm so excited to help you discover your future self!", context);
    }
  }

  /**
   * Create fallback response when API fails
   */
  private createFallbackResponse(message: string, context: ConversationContext): OnboardingResponse {
    const step = this.ONBOARDING_STEPS[context.currentStep];
    
    return {
      message: message || "I'm here to help you see your amazing future self! Tell me more about your journey.",
      questions: step.questions.slice(0, 2),
      quickButtons: [], // No fallback templates - Maya should generate her own intelligent suggestions
      stepGuidance: step.description,
      nextAction: 'continue',
      currentStep: context.currentStep,
      progress: this.calculateProgress(context.currentStep, false)
    };
  }

  /**
   * Update personal brand data based on conversation
   */
  private async updatePersonalBrandData(
    userId: string,
    currentStep: number,
    userMessage: string,
    mayaResponse: OnboardingResponse
  ): Promise<void> {
    
    // Extract insights from the conversation based on current step
    const insights = this.extractStepInsights(currentStep, userMessage);
    
    if (Object.keys(insights).length === 0) return;
    
    // Save insights based on step
    switch (currentStep) {
      case 1:
      case 2:
        // Story and current situation
        if (insights.transformationJourney || insights.currentSituation || insights.strugglesStory) {
          await personalBrandService.savePersonalBrandStory(userId, {
            currentSituation: insights.currentSituation || '',
            strugglesStory: insights.strugglesStory || '',
            transformationJourney: insights.transformationJourney || '',
            dreamOutcome: insights.dreamOutcome || ''
          });
        }
        break;
        
      case 3:
        // Future vision and dream outcome
        if (insights.dreamOutcome || insights.futureVision) {
          await personalBrandService.savePersonalBrandStory(userId, {
            currentSituation: '',
            strugglesStory: '',
            transformationJourney: '',
            dreamOutcome: insights.dreamOutcome || insights.futureVision || ''
          });
        }
        break;
        
      case 4:
        // Business context and goals
        if (insights.businessGoals || insights.targetAudience || insights.businessType) {
          await personalBrandService.saveBusinessContext(userId, {
            businessType: insights.businessType || '',
            businessGoals: insights.businessGoals || '',
            targetAudience: insights.targetAudience || '',
            primaryOffer: insights.primaryOffer,
            primaryOfferPrice: insights.primaryOfferPrice,
            secondaryOffer: insights.secondaryOffer,
            problemYouSolve: insights.problemYouSolve,
            uniqueApproach: insights.uniqueApproach
          });
        }
        break;
        
      case 5:
        // Visual brand identity - template selection
        await this.handleVisualTemplateSelection(userId, userMessage);
        break;
    }
  }

  /**
   * Save step data to appropriate service
   */
  private async saveStepData(userId: string, stepNumber: number, data: any): Promise<void> {
    // Update onboarding progress
    await personalBrandService.updateOnboardingProgress(userId, stepNumber);
    
    // Save step-specific data
    switch (stepNumber) {
      case 1:
      case 2:
      case 3:
        if (data.personalStory) {
          await personalBrandService.savePersonalBrandStory(userId, data.personalStory);
        }
        break;
        
      case 4:
        if (data.businessContext) {
          await personalBrandService.saveBusinessContext(userId, data.businessContext);
        }
        break;
        
      case 5:
        if (data.styleProfile) {
          await personalBrandService.saveStylePreferences(userId, data.styleProfile);
        }
        break;
        
      case 6:
        // Complete onboarding
        await personalBrandService.completePersonalBrandOnboarding(userId);
        break;
    }
  }

  /**
   * Extract insights from user message based on current step
   * NOTE: This analyzes USER INPUT only - not for image generation prompts
   * Maya's AI intelligence handles all prompt generation through Claude API
   */
  private extractStepInsights(stepNumber: number, message: string): any {
    const insights: any = {};
    const lowerMessage = message.toLowerCase();
    
    switch (stepNumber) {
      case 1:
      case 2:
        // Extract story elements
        if (lowerMessage.includes('single mom') || lowerMessage.includes('divorce')) {
          insights.currentSituation = 'Single mom rebuilding life after major life change';
          insights.strugglesStory = 'Navigating single motherhood and personal transformation';
        }
        if (lowerMessage.includes('starting over') || lowerMessage.includes('rock bottom')) {
          insights.transformationJourney = 'Starting over and rebuilding from the ground up';
        }
        if (lowerMessage.includes('business') || lowerMessage.includes('entrepreneur')) {
          insights.currentSituation = 'Building a business while managing other responsibilities';
        }
        break;
        
      case 3:
        // Extract future vision
        if (lowerMessage.includes('ceo') || lowerMessage.includes('leader')) {
          insights.dreamOutcome = 'Becoming a confident CEO and business leader';
        }
        if (lowerMessage.includes('confident') || lowerMessage.includes('powerful')) {
          insights.dreamOutcome = 'Feeling confident and powerful in my own skin';
        }
        if (lowerMessage.includes('successful') || lowerMessage.includes('thriving')) {
          insights.dreamOutcome = 'Living a successful, thriving life on my own terms';
        }
        break;
        
      case 4:
        // Extract business context
        if (lowerMessage.includes('coach') || lowerMessage.includes('coaching')) {
          insights.businessType = 'Coaching';
          insights.businessGoals = 'Help others through coaching services';
        }
        if (lowerMessage.includes('consultant') || lowerMessage.includes('consulting')) {
          insights.businessType = 'Consulting';
        }
        if (lowerMessage.includes('women') || lowerMessage.includes('moms')) {
          insights.targetAudience = 'Women and mothers seeking transformation';
        }
        break;
        
      case 5:
        // Extract style preferences
        if (lowerMessage.includes('professional') || lowerMessage.includes('polished')) {
          insights.styleCategories = ['professional', 'polished'];
          insights.brandPersonality = 'professional';
        }
        if (lowerMessage.includes('luxury') || lowerMessage.includes('sophisticated')) {
          insights.styleCategories = ['luxury', 'sophisticated'];
          insights.stylePreference = 'editorial-luxury';
        }
        if (lowerMessage.includes('black') || lowerMessage.includes('neutral')) {
          insights.colorPreferences = ['black', 'neutral', 'monochrome'];
          insights.colorScheme = 'black-white-editorial';
        }
        break;
    }
    
    return insights;
  }

  /**
   * Format personal brand context for Maya
   */
  private formatPersonalBrandContext(personalBrand: Partial<PersonalBrandProfile>): string {
    const context = [];
    
    if (personalBrand.personalStory?.transformationJourney) {
      context.push(`Transformation Story: ${personalBrand.personalStory.transformationJourney}`);
    }
    
    if (personalBrand.personalStory?.currentSituation) {
      context.push(`Current Situation: ${personalBrand.personalStory.currentSituation}`);
    }
    
    if (personalBrand.personalStory?.dreamOutcome) {
      context.push(`Dream Outcome: ${personalBrand.personalStory.dreamOutcome}`);
    }
    
    if (personalBrand.businessContext?.businessType) {
      context.push(`Business: ${personalBrand.businessContext.businessType}`);
    }
    
    if (personalBrand.businessContext?.targetAudience) {
      context.push(`Target Audience: ${personalBrand.businessContext.targetAudience}`);
    }
    
    if (personalBrand.styleProfile?.styleCategories?.length) {
      context.push(`Style Preferences: ${personalBrand.styleProfile.styleCategories.join(', ')}`);
    }
    
    return context.length > 0 ? context.join('\n') : 'No personal brand context discovered yet - this is the beginning of their journey.';
  }

  /**
   * Get completed steps from personal brand data
   */
  private getCompletedSteps(personalBrand: PersonalBrandProfile): number[] {
    const completed = [];
    
    if (personalBrand.personalStory?.transformationJourney) completed.push(1);
    if (personalBrand.personalStory?.currentSituation) completed.push(2);
    if (personalBrand.personalStory?.dreamOutcome) completed.push(3);
    if (personalBrand.businessContext?.businessType) completed.push(4);
    if (personalBrand.styleProfile?.styleCategories?.length) completed.push(5);
    if (personalBrand.completedAt) completed.push(6);
    
    return completed;
  }

  /**
   * Extract previous responses from conversation history
   */
  private extractPreviousResponses(history: Array<{role: string, content: string}>): Record<number, any> {
    // Simple extraction - could be enhanced with more sophisticated parsing
    return {};
  }

  /**
   * Calculate onboarding progress percentage
   */
  private calculateProgress(currentStep: number, isCompleted: boolean): number {
    if (isCompleted) return 100;
    return Math.min((currentStep - 1) * 16.67, 83.33); // Each step is ~16.67%, max 83.33% until completed
  }

  /**
   * Handle visual template selection in step 5
   */
  private async handleVisualTemplateSelection(userId: string, userMessage: string): Promise<void> {
    console.log('🎨 VISUAL TEMPLATE: Processing template selection for user:', userId);
    console.log('🎨 USER MESSAGE:', userMessage);
    
    // Detect template selection from user message
    const selectedTemplate = this.detectTemplateSelection(userMessage);
    
    if (selectedTemplate) {
      console.log('🎨 TEMPLATE DETECTED:', selectedTemplate.id, selectedTemplate.name);
      
      // Save selected template to user profile
      try {
        await personalBrandService.saveVisualTemplate(userId, {
          templateId: selectedTemplate.id,
          templateName: selectedTemplate.name,
          selectedAt: new Date().toISOString()
        });
        
        console.log('✅ TEMPLATE SAVED: Visual template saved successfully');
      } catch (error) {
        console.error('❌ TEMPLATE SAVE ERROR:', error);
      }
    } else {
      console.log('🔍 TEMPLATE: No specific template detected, continuing conversation');
    }
  }

  /**
   * Detect which visual template user selected
   */
  private detectTemplateSelection(message: string): any {
    const lowercaseMessage = message.toLowerCase();
    
    // Check each template for mentions
    for (const template of LUXURY_VISUAL_TEMPLATES) {
      const templateName = template.name.toLowerCase();
      const templateId = template.id.toLowerCase();
      
      // Check for direct name mentions
      if (lowercaseMessage.includes(templateName) || lowercaseMessage.includes(templateId)) {
        return template;
      }
      
      // Check for color/description keywords
      if (template.id === 'estetica-luxury' && (lowercaseMessage.includes('black') || lowercaseMessage.includes('brown') || lowercaseMessage.includes('elegant'))) {
        return template;
      }
      
      if (template.id === 'nature-luxo' && (lowercaseMessage.includes('green') || lowercaseMessage.includes('natural') || lowercaseMessage.includes('organic'))) {
        return template;
      }
      
      if (template.id === 'dark-luxury' && (lowercaseMessage.includes('dark') || lowercaseMessage.includes('charcoal') || lowercaseMessage.includes('modern'))) {
        return template;
      }
      
      if (template.id === 'red-luxury' && (lowercaseMessage.includes('red') || lowercaseMessage.includes('bold'))) {
        return template;
      }
      
      if (template.id === 'white-gold' && (lowercaseMessage.includes('white') || lowercaseMessage.includes('gold') || lowercaseMessage.includes('minimal'))) {
        return template;
      }
      
      if (template.id === 'rose-luxo' && (lowercaseMessage.includes('rose') || lowercaseMessage.includes('blush') || lowercaseMessage.includes('romantic'))) {
        return template;
      }
    }
    
    return null;
  }

  /**
   * Get visual template options for Maya in step 5
   */
  private getVisualTemplateOptions(): string {
    const templates = LUXURY_VISUAL_TEMPLATES.slice(0, 6); // Show first 6 main templates
    
    return `🎨 VISUAL TEMPLATE OPTIONS TO PRESENT:
${templates.map(template => `
• **${template.name}** (${template.id})
  Description: ${template.description}
  Colors: ${template.colorPalette.primary}, ${template.colorPalette.secondary}, ${template.colorPalette.accent}
  Best for: ${template.businessAlignment.join(', ')}
`).join('')}

TEMPLATE PRESENTATION RULES:
- Present these as conversational options, not a formal list
- Connect templates to their business context discovered in earlier steps
- Help them visualize how each template aligns with their brand goals
- When they show interest in a template, explain why it's perfect for their business
- Use the template names and descriptions naturally in conversation`;
  }
}

// Export singleton instance
export const onboardingConversationService = new OnboardingConversationService();