/**
 * Maya Personalization Service
 * 
 * Connects Maya AI to real user data for personalized responses instead of generic templates.
 * Enables Maya to access subscription info, usage stats, profile data for intelligent content generation.
 */

import { storage } from '../storage';

export interface UserPersonalizationContext {
  userId: string;
  subscriptionData: {
    plan: string;
    planDisplayName: string;
    monthlyPrice: number;
    monthlyUsed: number;
    monthlyLimit: number;
    isAdmin: boolean;
    nextBillingDate?: Date;
    subscriptionActive: boolean;
    accountType: string;
    features: string[];
  };
  profileData: {
    name?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profession?: string;
    brandStyle?: string;
    photoGoals?: string;
    joinedDate?: Date;
  };
  usageStats: {
    generationsThisMonth: number;
    remainingGenerations: number;
    usagePercentage: number;
    canGenerate: boolean;
  };
}

export class MayaPersonalizationService {
  
  /**
   * Get comprehensive user context for Maya's personalized responses
   */
  async getUserPersonalizationContext(userId: string): Promise<UserPersonalizationContext | null> {
    try {
      // Get user from database
      const user = await storage.getUser(userId);
      if (!user) {
        console.warn(`🔍 Maya Personalization: User ${userId} not found`);
        return null;
      }

      // Build subscription context
      const subscriptionData = {
        plan: user.plan || 'sselfie-studio',
        planDisplayName: 'SSELFIE Studio',
        monthlyPrice: 47,
        monthlyUsed: user.monthlyGenerationsUsed || 0,
        monthlyLimit: user.monthlyGenerationLimit || 100,
        isAdmin: user.monthlyGenerationLimit === -1,
        nextBillingDate: user.subscriptionRenewDate,
        subscriptionActive: user.monthlyGenerationLimit > 0 || user.monthlyGenerationLimit === -1,
        accountType: user.monthlyGenerationLimit === -1 ? 'Admin Account' : 'SSELFIE Studio Member',
        features: [
          'Personal AI model training',
          `${user.monthlyGenerationLimit === -1 ? 'Unlimited' : user.monthlyGenerationLimit || 100} monthly professional photos`,
          'Maya AI photographer access',
          'Brand photo gallery',
          'Style customization'
        ]
      };

      // Build profile context
      const profileData = {
        name: user.name,
        email: user.email || '',
        firstName: user.firstName,
        lastName: user.lastName,
        profession: user.profession,
        brandStyle: user.brandStyle,
        photoGoals: user.photoGoals,
        joinedDate: user.createdAt
      };

      // Build usage context
      const remainingGenerations = user.monthlyGenerationLimit === -1 
        ? -1 
        : (user.monthlyGenerationLimit || 100) - (user.monthlyGenerationsUsed || 0);
        
      const usagePercentage = user.monthlyGenerationLimit === -1 
        ? 0 
        : ((user.monthlyGenerationsUsed || 0) / (user.monthlyGenerationLimit || 100)) * 100;

      const usageStats = {
        generationsThisMonth: user.monthlyGenerationsUsed || 0,
        remainingGenerations: Math.max(remainingGenerations, 0),
        usagePercentage: Math.min(usagePercentage, 100),
        canGenerate: user.monthlyGenerationLimit === -1 || remainingGenerations > 0
      };

      console.log(`✅ Maya Personalization: Context loaded for ${user.email}`, {
        plan: subscriptionData.plan,
        monthlyUsed: subscriptionData.monthlyUsed,
        monthlyLimit: subscriptionData.monthlyLimit,
        canGenerate: usageStats.canGenerate
      });

      return {
        userId,
        subscriptionData,
        profileData,
        usageStats
      };

    } catch (error) {
      console.error('❌ Maya Personalization Service error:', error);
      return null;
    }
  }

  /**
   * Generate personalized greeting based on user context
   */
  generatePersonalizedGreeting(context: UserPersonalizationContext): string {
    const { profileData, subscriptionData, usageStats } = context;
    
    const name = profileData.firstName || profileData.name || profileData.email?.split('@')[0] || 'there';
    const usageText = subscriptionData.isAdmin 
      ? 'unlimited generations'
      : `${usageStats.remainingGenerations} generations remaining this month`;
    
    if (profileData.profession) {
      return `Welcome back ${name}! As a ${profileData.profession}, you have ${usageText}. What professional photos shall we create today?`;
    }
    
    return `Hi ${name}! You have ${usageText}. Ready to create some stunning professional photos?`;
  }

  /**
   * Generate personalized bio content suggestions
   */
  generateBioSuggestions(context: UserPersonalizationContext): string[] {
    const { profileData } = context;
    
    const suggestions = [
      `Professional ${profileData.profession || 'entrepreneur'} creating authentic brand presence`,
      `Passionate about ${profileData.brandStyle || 'professional excellence'} and visual storytelling`,
      `Building meaningful connections through ${profileData.photoGoals || 'compelling professional imagery'}`
    ];

    return suggestions;
  }

  /**
   * Generate personalized branding content
   */
  generateBrandingContent(context: UserPersonalizationContext): {
    brandVoice: string;
    visualStyle: string;
    targetAudience: string;
  } {
    const { profileData } = context;
    
    return {
      brandVoice: profileData.brandStyle || 'Professional, authentic, and approachable',
      visualStyle: `${profileData.brandStyle || 'Modern professional'} aesthetic with ${profileData.photoGoals || 'compelling visual storytelling'}`,
      targetAudience: `Professionals seeking ${profileData.profession || 'business'} services and authentic brand connections`
    };
  }
}

// Export singleton instance
export const mayaPersonalizationService = new MayaPersonalizationService();