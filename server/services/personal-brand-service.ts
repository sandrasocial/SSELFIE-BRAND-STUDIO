import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import {
  onboardingData,
  brandOnboarding,
  userProfiles,
  type OnboardingData,
  type BrandOnboarding,
  type UserProfile,
  type InsertOnboardingData,
  type InsertBrandOnboarding,
  type InsertUserProfile,
} from "../../shared/schema";

// Enhanced personal brand data types for Maya onboarding
export interface PersonalBrandStory {
  currentSituation: string;
  strugglesStory: string;
  transformationJourney: string;
  dreamOutcome: string;
  whyStarted?: string;
}

export interface BusinessGoals {
  businessType: string;
  businessGoals: string;
  targetAudience: string;
  primaryOffer?: string;
  primaryOfferPrice?: string;
  secondaryOffer?: string;
  problemYouSolve?: string;
  uniqueApproach?: string;
}

export interface StylePreferences {
  styleCategories: string[];
  colorPreferences: string[];
  settingsPreferences: string[];
  avoidances: string[];
  brandPersonality?: string;
  stylePreference?: string;
  colorScheme?: string;
}

export interface PersonalBrandProfile {
  // Story & Identity
  personalStory: PersonalBrandStory;
  
  // Business Context
  businessContext: BusinessGoals;
  
  // Visual Preferences  
  styleProfile: StylePreferences;
  
  // Contact & Links
  contactInfo: {
    instagramHandle?: string;
    websiteUrl?: string;
    email?: string;
    location?: string;
  };
  
  // Maya-specific insights
  personalityTraits?: string[];
  valuesAndMission?: string;
  brandVision?: string;
  
  // Completion status
  completedAt?: Date;
  currentStep?: number;
}

export class PersonalBrandService {
  
  /**
   * Create comprehensive personal brand profile from onboarding responses
   */
  async createPersonalBrandProfile(
    userId: string, 
    brandData: Partial<PersonalBrandProfile>
  ): Promise<PersonalBrandProfile> {
    
    // Update existing onboarding data with story elements
    if (brandData.personalStory || brandData.businessContext) {
      const existingOnboarding = await this.getExistingOnboardingData(userId);
      
      const onboardingUpdate: Partial<OnboardingData> = {
        brandStory: brandData.personalStory?.transformationJourney || existingOnboarding?.brandStory,
        personalMission: brandData.personalStory?.dreamOutcome || existingOnboarding?.personalMission,
        businessGoals: brandData.businessContext?.businessGoals || existingOnboarding?.businessGoals,
        targetAudience: brandData.businessContext?.targetAudience || existingOnboarding?.targetAudience,
        businessType: brandData.businessContext?.businessType || existingOnboarding?.businessType,
        brandVoice: brandData.personalityTraits?.join(", ") || existingOnboarding?.brandVoice,
        stylePreferences: brandData.styleProfile?.styleCategories?.join(", ") || existingOnboarding?.stylePreferences,
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      };

      await this.updateOnboardingData(userId, onboardingUpdate);
    }
    
    // Update/create brand onboarding with detailed information
    if (brandData.businessContext || brandData.contactInfo) {
      const brandOnboardingData: Partial<BrandOnboarding> = {
        businessName: brandData.businessContext?.businessType || "Personal Brand",
        tagline: brandData.personalStory?.dreamOutcome || "",
        personalStory: brandData.personalStory?.transformationJourney || "",
        whyStarted: brandData.personalStory?.whyStarted || "",
        targetClient: brandData.businessContext?.targetAudience || "",
        problemYouSolve: brandData.businessContext?.problemYouSolve || "",
        uniqueApproach: brandData.businessContext?.uniqueApproach || "",
        primaryOffer: brandData.businessContext?.primaryOffer || "",
        primaryOfferPrice: brandData.businessContext?.primaryOfferPrice || "",
        secondaryOffer: brandData.businessContext?.secondaryOffer || "",
        instagramHandle: brandData.contactInfo?.instagramHandle || "",
        websiteUrl: brandData.contactInfo?.websiteUrl || "",
        email: brandData.contactInfo?.email || "",
        location: brandData.contactInfo?.location || "",
        brandPersonality: brandData.styleProfile?.brandPersonality || "sophisticated",
        brandValues: brandData.valuesAndMission || "",
        stylePreference: brandData.styleProfile?.stylePreference || "editorial-luxury",
        colorScheme: brandData.styleProfile?.colorScheme || "black-white-editorial",
        updatedAt: new Date()
      };

      await this.saveBrandOnboarding(userId, brandOnboardingData);
    }
    
    // Update user profile with contact information
    if (brandData.contactInfo) {
      const profileUpdate: Partial<UserProfile> = {
        instagramHandle: brandData.contactInfo.instagramHandle,
        websiteUrl: brandData.contactInfo.websiteUrl,
        location: brandData.contactInfo.location,
        brandVibe: brandData.styleProfile?.brandPersonality,
        goals: brandData.businessContext?.businessGoals,
        updatedAt: new Date()
      };

      await this.updateUserProfile(userId, profileUpdate);
    }
    
    return this.getPersonalBrandProfile(userId);
  }
  
  /**
   * Retrieve complete personal brand profile
   */
  async getPersonalBrandProfile(userId: string): Promise<PersonalBrandProfile> {
    const [onboarding, brandOnboarding, profile] = await Promise.all([
      this.getExistingOnboardingData(userId),
      this.getExistingBrandOnboarding(userId),
      this.getExistingUserProfile(userId)
    ]);
    
    return {
      personalStory: {
        currentSituation: this.extractCurrentSituation(onboarding, brandOnboarding),
        strugglesStory: this.extractStrugglesStory(onboarding, brandOnboarding),
        transformationJourney: onboarding?.brandStory || brandOnboarding?.personalStory || "",
        dreamOutcome: onboarding?.personalMission || brandOnboarding?.tagline || "",
        whyStarted: brandOnboarding?.whyStarted || ""
      },
      
      businessContext: {
        businessType: onboarding?.businessType || brandOnboarding?.businessName || "",
        businessGoals: onboarding?.businessGoals || "",
        targetAudience: onboarding?.targetAudience || brandOnboarding?.targetClient || "",
        primaryOffer: brandOnboarding?.primaryOffer || "",
        primaryOfferPrice: brandOnboarding?.primaryOfferPrice || "",
        secondaryOffer: brandOnboarding?.secondaryOffer || "",
        problemYouSolve: brandOnboarding?.problemYouSolve || "",
        uniqueApproach: brandOnboarding?.uniqueApproach || ""
      },
      
      styleProfile: {
        styleCategories: this.parseStringArray(onboarding?.stylePreferences),
        colorPreferences: this.extractColorPreferences(brandOnboarding),
        settingsPreferences: [],
        avoidances: [],
        brandPersonality: brandOnboarding?.brandPersonality || profile?.brandVibe || "",
        stylePreference: brandOnboarding?.stylePreference || "",
        colorScheme: brandOnboarding?.colorScheme || ""
      },
      
      contactInfo: {
        instagramHandle: profile?.instagramHandle || brandOnboarding?.instagramHandle || "",
        websiteUrl: profile?.websiteUrl || brandOnboarding?.websiteUrl || "",
        email: brandOnboarding?.email || "",
        location: profile?.location || brandOnboarding?.location || ""
      },
      
      personalityTraits: this.parseStringArray(onboarding?.brandVoice),
      valuesAndMission: brandOnboarding?.brandValues || "",
      brandVision: profile?.goals || "",
      
      completedAt: onboarding?.completedAt || brandOnboarding?.createdAt,
      currentStep: onboarding?.currentStep || 1
    };
  }
  
  /**
   * Save personal brand story from onboarding conversation
   */
  async savePersonalBrandStory(
    userId: string, 
    story: PersonalBrandStory
  ): Promise<void> {
    const onboardingUpdate: Partial<OnboardingData> = {
      brandStory: story.transformationJourney,
      personalMission: story.dreamOutcome,
      updatedAt: new Date()
    };
    
    await this.updateOnboardingData(userId, onboardingUpdate);
    
    // Also update brand onboarding for detailed storage
    const brandUpdate: Partial<BrandOnboarding> = {
      personalStory: story.transformationJourney,
      tagline: story.dreamOutcome,
      whyStarted: story.whyStarted,
      updatedAt: new Date()
    };
    
    await this.saveBrandOnboarding(userId, brandUpdate);
  }
  
  /**
   * Save business context from onboarding conversation  
   */
  async saveBusinessContext(
    userId: string,
    business: BusinessGoals
  ): Promise<void> {
    const onboardingUpdate: Partial<OnboardingData> = {
      businessGoals: business.businessGoals,
      targetAudience: business.targetAudience,
      businessType: business.businessType,
      updatedAt: new Date()
    };
    
    await this.updateOnboardingData(userId, onboardingUpdate);
    
    // Detailed business context in brand onboarding
    const brandUpdate: Partial<BrandOnboarding> = {
      businessName: business.businessType,
      targetClient: business.targetAudience,
      primaryOffer: business.primaryOffer,
      primaryOfferPrice: business.primaryOfferPrice,
      secondaryOffer: business.secondaryOffer,
      problemYouSolve: business.problemYouSolve,
      uniqueApproach: business.uniqueApproach,
      updatedAt: new Date()
    };
    
    await this.saveBrandOnboarding(userId, brandUpdate);
  }
  
  /**
   * Save style preferences from onboarding conversation
   */
  async saveStylePreferences(
    userId: string,
    style: StylePreferences
  ): Promise<void> {
    const onboardingUpdate: Partial<OnboardingData> = {
      stylePreferences: style.styleCategories.join(", "),
      brandVoice: style.brandPersonality,
      updatedAt: new Date()
    };
    
    await this.updateOnboardingData(userId, onboardingUpdate);
    
    // Detailed style preferences in brand onboarding
    const brandUpdate: Partial<BrandOnboarding> = {
      brandPersonality: style.brandPersonality || "sophisticated",
      stylePreference: style.stylePreference || "editorial-luxury",
      colorScheme: style.colorScheme || "black-white-editorial",
      updatedAt: new Date()
    };
    
    await this.saveBrandOnboarding(userId, brandUpdate);
    
    // Update user profile brand vibe
    const profileUpdate: Partial<UserProfile> = {
      brandVibe: style.brandPersonality,
      updatedAt: new Date()
    };
    
    await this.updateUserProfile(userId, profileUpdate);
  }
  
  /**
   * Mark onboarding as completed
   */
  async completePersonalBrandOnboarding(userId: string): Promise<PersonalBrandProfile> {
    const onboardingUpdate: Partial<OnboardingData> = {
      completed: true,
      completedAt: new Date(),
      currentStep: 6, // Final step
      updatedAt: new Date()
    };
    
    await this.updateOnboardingData(userId, onboardingUpdate);
    
    return this.getPersonalBrandProfile(userId);
  }
  
  /**
   * Check if user has completed personal brand onboarding
   */
  async hasCompletedPersonalBrandOnboarding(userId: string): Promise<boolean> {
    const onboarding = await this.getExistingOnboardingData(userId);
    return onboarding?.completed || false;
  }
  
  /**
   * Get onboarding progress (1-6 steps)
   */
  async getOnboardingProgress(userId: string): Promise<number> {
    const onboarding = await this.getExistingOnboardingData(userId);
    return onboarding?.currentStep || 1;
  }
  
  /**
   * Update onboarding step progress
   */
  async updateOnboardingProgress(userId: string, step: number): Promise<void> {
    const onboardingUpdate: Partial<OnboardingData> = {
      currentStep: step,
      updatedAt: new Date()
    };
    
    await this.updateOnboardingData(userId, onboardingUpdate);
  }
  
  // ===== PRIVATE DATABASE HELPER METHODS =====
  
  private async getExistingOnboardingData(userId: string): Promise<OnboardingData | undefined> {
    const [data] = await db
      .select()
      .from(onboardingData)
      .where(eq(onboardingData.userId, userId));
    return data;
  }
  
  private async updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData> {
    // Check if onboarding data exists
    const existing = await this.getExistingOnboardingData(userId);
    
    if (existing) {
      const [updated] = await db
        .update(onboardingData)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(onboardingData.userId, userId))
        .returning();
      return updated;
    } else {
      // Create new onboarding data
      const [created] = await db
        .insert(onboardingData)
        .values({
          userId,
          ...data,
          currentStep: data.currentStep || 1,
          completed: data.completed || false
        } as InsertOnboardingData)
        .returning();
      return created;
    }
  }
  
  private async getExistingBrandOnboarding(userId: string): Promise<BrandOnboarding | undefined> {
    const [data] = await db
      .select()
      .from(brandOnboarding)
      .where(eq(brandOnboarding.userId, userId));
    return data;
  }
  
  private async saveBrandOnboarding(userId: string, data: Partial<BrandOnboarding>): Promise<BrandOnboarding> {
    const existing = await this.getExistingBrandOnboarding(userId);
    
    if (existing) {
      const [updated] = await db
        .update(brandOnboarding)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(brandOnboarding.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(brandOnboarding)
        .values({
          userId,
          businessName: data.businessName || "Personal Brand",
          tagline: data.tagline || "",
          personalStory: data.personalStory || "",
          targetClient: data.targetClient || "",
          problemYouSolve: data.problemYouSolve || "",
          uniqueApproach: data.uniqueApproach || "",
          primaryOffer: data.primaryOffer || "",
          primaryOfferPrice: data.primaryOfferPrice || "",
          email: data.email || "",
          brandPersonality: data.brandPersonality || "sophisticated",
          ...data
        } as InsertBrandOnboarding)
        .returning();
      return created;
    }
  }
  
  private async getExistingUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }
  
  private async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const existing = await this.getExistingUserProfile(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userProfiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userProfiles)
        .values({
          userId,
          ...data
        } as InsertUserProfile)
        .returning();
      return created;
    }
  }
  
  // ===== PRIVATE UTILITY METHODS =====
  
  private extractCurrentSituation(
    onboarding?: OnboardingData, 
    brandData?: BrandOnboarding
  ): string {
    // Combine available data to understand current situation
    const business = onboarding?.businessType || brandData?.businessName || "";
    const struggles = brandData?.problemYouSolve || "";
    return `${business}${struggles ? ` - ${struggles}` : ""}`.trim();
  }
  
  private extractStrugglesStory(
    onboarding?: OnboardingData,
    brandData?: BrandOnboarding  
  ): string {
    return brandData?.whyStarted || onboarding?.brandStory || "";
  }
  
  private parseStringArray(value?: string | null): string[] {
    if (!value) return [];
    return value.split(",").map(item => item.trim()).filter(item => item.length > 0);
  }
  
  private extractColorPreferences(brandData?: BrandOnboarding): string[] {
    if (!brandData?.colorScheme) return [];
    
    // Parse color scheme into individual preferences
    const scheme = brandData.colorScheme.toLowerCase();
    if (scheme.includes("black") && scheme.includes("white")) {
      return ["black", "white", "monochrome"];
    }
    if (scheme.includes("warm")) {
      return ["warm tones", "brown", "cream", "gold"];
    }
    if (scheme.includes("cool")) {
      return ["cool tones", "blue", "gray", "silver"];
    }
    
    return [brandData.colorScheme];
  }
}

// Export singleton instance
export const personalBrandService = new PersonalBrandService();