/**
 * Simple Essential Onboarding Service
 * Collects only essential data for Maya's styling intelligence
 * No AI processing during onboarding - quick data collection only
 */

interface EssentialOnboardingData {
  userId: string;
  gender: 'woman' | 'man' | 'prefer-not-to-say';  // Mandatory for FLUX trigger words
  preferredName: string;  // For Maya's warm personalization  
  primaryUse: 'business' | 'personal' | 'both';  // Usage context
  styleVibe: string;  // Simple initial style direction
}

interface OnboardingQuestion {
  id: string;
  question: string;
  type: 'select' | 'text';
  options?: Array<{ value: string; label: string; description?: string; icon?: string }>;
  required: boolean;
  mayaNote?: string;  // Maya's warm explanation
}

export class SimpleOnboardingService {
  
  // Essential 4-question onboarding flow
  private readonly ESSENTIAL_QUESTIONS: OnboardingQuestion[] = [
    {
      id: 'gender',
      question: "First, I need to know your pronouns so I can create the perfect photos for you!",
      type: 'select',
      options: [
        { 
          value: 'woman', 
          label: 'She/Her', 
          description: 'Photos optimized for feminine styling',
          icon: '👩'
        },
        { 
          value: 'man', 
          label: 'He/Him', 
          description: 'Photos optimized for masculine styling',
          icon: '👨'
        },
        { 
          value: 'prefer-not-to-say', 
          label: 'Prefer not to say', 
          description: 'I\'ll adapt based on your style preferences',
          icon: '✨'
        }
      ],
      required: true,
      mayaNote: "This helps me choose the right styling approach and technical settings for amazing photos!"
    },
    
    {
      id: 'preferredName',
      question: "What should I call you? I love making our conversations personal!",
      type: 'text',
      required: true,
      mayaNote: "I'll remember your name and use it throughout our styling journey together."
    },
    
    {
      id: 'primaryUse',
      question: "What are you planning to use these photos for?",
      type: 'select',
      options: [
        { 
          value: 'business', 
          label: 'Business & Professional', 
          description: 'LinkedIn, websites, speaking, networking',
          icon: '💼'
        },
        { 
          value: 'personal', 
          label: 'Personal & Social', 
          description: 'Social media, dating, personal brand',
          icon: '✨'
        },
        { 
          value: 'both', 
          label: 'Both Business & Personal', 
          description: 'I want photos for everything!',
          icon: '🌟'
        }
      ],
      required: true,
      mayaNote: "This helps me understand how to style you for the right impact and audience."
    },
    
    {
      id: 'styleVibe',
      question: "What style vibe speaks to you? (Don't worry, we can explore more as we go!)",
      type: 'select',
      options: [
        { value: 'elegant-minimalist', label: 'Elegant & Minimalist', icon: '🤍' },
        { value: 'bold-confident', label: 'Bold & Confident', icon: '🔥' },
        { value: 'warm-approachable', label: 'Warm & Approachable', icon: '☀️' },
        { value: 'creative-artistic', label: 'Creative & Artistic', icon: '🎨' },
        { value: 'luxury-sophisticated', label: 'Luxury & Sophisticated', icon: '💎' },
        { value: 'natural-authentic', label: 'Natural & Authentic', icon: '🌿' },
        { value: 'surprise-me', label: 'Surprise me, Maya!', icon: '✨' }
      ],
      required: false,
      mayaNote: "This gives me a starting point for your styling journey. We'll discover more as we create together!"
    }
  ];

  /**
   * Get the complete essential onboarding flow
   */
  public getEssentialQuestions(): OnboardingQuestion[] {
    return this.ESSENTIAL_QUESTIONS;
  }

  /**
   * Create Maya's warm welcome message for onboarding
   */
  public createWelcomeMessage(): string {
    return `Hey there! I'm Maya, your personal styling AI! 🌟

I'm so excited to help you create photos that make you feel absolutely amazing. Before we dive into the fun stuff, I need to ask you a few quick questions so I can customize everything perfectly for you.

This'll just take a minute, and then we can start creating some incredible photos together!`;
  }

  /**
   * Store essential onboarding data (no AI processing)
   * Uses existing user table fields - safe approach with no schema changes
   */
  public async storeEssentialData(data: EssentialOnboardingData): Promise<void> {
    // Import storage at runtime to avoid circular dependencies
    const { storage } = await import('../storage');
    
    console.log('📝 Storing essential onboarding data to existing user table:', {
      userId: data.userId,
      gender: data.gender,
      preferredName: data.preferredName,
      primaryUse: data.primaryUse,
      styleVibe: data.styleVibe
    });
    
    // Map to existing user table fields (safe - no schema changes needed!)
    const userUpdates = {
      gender: data.gender,                    // maps to users.gender
      profession: data.preferredName,        // repurpose users.profession for preferredName
      brand_style: data.primaryUse,          // repurpose users.brand_style for primaryUse  
      photo_goals: data.styleVibe,           // repurpose users.photo_goals for styleVibe
      onboarding_step: 4,                    // mark as completed (4 questions done)
      profile_completed: true                // onboarding is complete
    };

    try {
      // Update existing user record - no new tables needed!
      await storage.updateUserProfile(data.userId, userUpdates);
      console.log('✅ Essential onboarding data saved to existing user table successfully');
    } catch (error) {
      console.error('❌ Failed to store essential onboarding data:', error);
      throw error;
    }
  }

  /**
   * Mark onboarding as complete and prepare Maya for styling
   */
  public async completeOnboarding(userId: string): Promise<string> {
    // Update user onboarding status
    console.log('✅ Onboarding complete for user:', userId);
    
    return `Perfect! I've got everything I need to create amazing photos for you. 

Let's start styling! What kind of photos are you in the mood for today? Just tell me what you're thinking, and I'll create some gorgeous concept cards for you to choose from.`;
  }

  /**
   * Get Maya's gender-appropriate styling approach
   */
  public getStylingApproach(gender: string): {
    triggerWords: string[];
    stylingNotes: string[];
  } {
    switch (gender) {
      case 'woman':
        return {
          triggerWords: ['woman', 'she', 'her', 'feminine'],
          stylingNotes: [
            'Focus on feminine styling and poses',
            'Consider jewelry, makeup, and hair styling',
            'Emphasize elegant and confident postures'
          ]
        };
      case 'man':
        return {
          triggerWords: ['man', 'he', 'him', 'masculine'],
          stylingNotes: [
            'Focus on masculine styling and poses',
            'Consider grooming, accessories, and professional looks',
            'Emphasize strong and confident postures'
          ]
        };
      default:
        return {
          triggerWords: ['person', 'individual', 'they'],
          stylingNotes: [
            'Adapt styling based on user preferences',
            'Focus on personal style expression',
            'Emphasize authentic and confident presentation'
          ]
        };
    }
  }

  /**
   * Save onboarding answers (route-compatible method)
   * This method is called by the API routes
   */
  public async saveOnboardingAnswers(userId: string, answers: Record<string, string>) {
    try {
      console.log('💾 SIMPLE ONBOARDING: Processing answers for user', userId);
      
      // Convert answers to EssentialOnboardingData format
      const essentialData: EssentialOnboardingData = {
        userId,
        gender: answers.gender as 'woman' | 'man' | 'prefer-not-to-say',
        preferredName: answers.preferredName,
        primaryUse: answers.primaryUse as 'business' | 'personal' | 'both',
        styleVibe: answers.styleVibe
      };

      // Store the data using existing user table fields
      await this.storeEssentialData(essentialData);
      
      return {
        success: true,
        message: `Perfect, ${answers.preferredName}! I've got everything I need. Ready to create some stunning ${answers.primaryUse} photos with ${answers.styleVibe} vibes? Let's make magic happen! ✨`
      };
      
    } catch (error) {
      console.error('❌ SIMPLE ONBOARDING: Failed to save answers:', error);
      return {
        success: false,
        message: "Oops! I had trouble saving your preferences. Let's try again!",
        error: error.message
      };
    }
  }

  /**
   * Check if user has completed onboarding
   */
  public async checkOnboardingStatus(userId: string): Promise<{ 
    onboardingComplete: boolean; 
    userData?: any 
  }> {
    try {
      const { storage } = await import('../storage');
      const user = await storage.getUser(userId);
      
      if (!user) {
        return { onboardingComplete: false };
      }

      // Check if user has completed our 4-question onboarding
      const hasEssentialData = user.gender && user.profession && user.brand_style && user.photo_goals;
      const isComplete = hasEssentialData && user.profile_completed && user.onboarding_step >= 4;
      
      return {
        onboardingComplete: !!isComplete,
        userData: isComplete ? {
          gender: user.gender,
          preferredName: user.profession,  // stored in profession field
          primaryUse: user.brand_style,     // stored in brand_style field
          styleVibe: user.photo_goals       // stored in photo_goals field
        } : undefined
      };
      
    } catch (error) {
      console.error('❌ Failed to check onboarding status:', error);
      return { onboardingComplete: false };
    }
  }
}

export const simpleOnboardingService = new SimpleOnboardingService();