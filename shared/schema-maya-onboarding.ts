import { pgTable, serial, varchar, text, jsonb, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema.js";

// =============================================================================
// MAYA ONBOARDING SCHEMA - NEW TABLES ONLY
// =============================================================================
// These tables extend the existing Maya system without modifying current schema
// Supports comprehensive personal brand discovery and "Future Self" transformation

// User Personal Brand - Core transformation story and vision
export const userPersonalBrand = pgTable('user_personal_brand', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Current Situation Discovery (Steps 1-2)
  transformationStory: text('transformation_story'), // User's complete story of where they are now
  currentSituation: text('current_situation'), // Current challenges and starting point
  strugglesStory: text('struggles_story'), // What they're overcoming/have overcome
  personalityTraits: jsonb('personality_traits').default([]), // Core personality characteristics
  
  // Future Self Visioning (Steps 3-4)
  dreamOutcome: text('dream_outcome'), // Clear vision of future successful self
  futureVision: text('future_vision'), // How they see themselves transformed
  businessGoals: text('business_goals'), // Professional aspirations and timeline
  targetAudience: text('target_audience'), // Who they serve/want to serve
  valuesAndMission: text('values_and_mission'), // Core values and personal mission
  
  // Business & Brand Context (Step 5)
  businessType: varchar('business_type'), // Coach, consultant, entrepreneur, etc.
  brandVision: text('brand_vision'), // How they want to be perceived
  uniqueValueProposition: text('unique_value_proposition'), // What makes them different
  professionalGoals: text('professional_goals'), // Career/business objectives
  
  // Photo Usage & Intent (Step 6)
  photoUsageGoals: jsonb('photo_usage_goals').default([]), // Social media, website, marketing, etc.
  contentCreationGoals: text('content_creation_goals'), // What content they'll create
  professionalImageGoals: text('professional_image_goals'), // How photos support their goals
  
  // Progress Tracking
  onboardingStep: integer('onboarding_step').default(1), // Current step (1-6)
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Style Profile - Comprehensive style preferences and visual identity
export const userStyleProfile = pgTable('user_style_profile', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  personalBrandId: integer('personal_brand_id').references(() => userPersonalBrand.id, { onDelete: 'cascade' }),
  
  // Style Categories & Preferences
  styleCategories: jsonb('style_categories').default([]), // Editorial, Minimalist, Boho, Corporate, etc.
  colorPreferences: jsonb('color_preferences').default({ primaryColors: [], accentColors: [], avoidColors: [] }),
  
  // Settings & Environments
  settingsPreferences: jsonb('settings_preferences').default([]), // Office, home, outdoor, studio, etc.
  locationVibes: jsonb('location_vibes').default([]), // Luxury, natural, urban, cozy, etc.
  
  // Clothing & Fashion Preferences
  clothingPreferences: jsonb('clothing_preferences').default({ preferredStyles: [], favoriteItems: [], bodyTypeConsiderations: [], comfortLevel: 'moderate', occasionTypes: [] }),
  
  // Beauty & Grooming Preferences
  beautyPreferences: jsonb('beauty_preferences').default({ makeupStyle: 'natural', hairPreferences: [], skinToneConsiderations: '', beautyComfortLevel: 'moderate' }),
  
  // Avoidances & Boundaries
  styleAvoidances: jsonb('style_avoidances').default([]), // What they absolutely don't want
  boundariesAndLimits: text('boundaries_and_limits'), // Personal or cultural considerations
  
  // Inspiration & References
  inspirationImages: jsonb('inspiration_images').default([]), // URLs or descriptions of inspiring looks
  styleIcons: jsonb('style_icons').default([]), // People whose style they admire
  brandReferences: jsonb('brand_references').default([]), // Brands they love or aspire to
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Maya Personal Memory - Maya's personalized understanding of each user
export const mayaPersonalMemory = pgTable('maya_personal_memory', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  personalBrandId: integer('personal_brand_id').references(() => userPersonalBrand.id, { onDelete: 'cascade' }),
  
  // Maya's Personal Insights About User
  personalInsights: jsonb('personal_insights').default({ coreMotivations: [], transformationJourney: '', strengthsIdentified: [], growthAreas: [], personalityNotes: '', communicationStyle: '' }),
  
  // Ongoing Goals & Progress
  ongoingGoals: jsonb('ongoing_goals').default({ shortTermGoals: [], longTermVision: [], milestonesToCelebrate: [], challengesToSupport: [] }),
  
  // Conversation Preferences
  preferredTopics: jsonb('preferred_topics').default([]), // Business, style, personal growth, etc.
  conversationStyle: jsonb('conversation_style').default({ energyLevel: 'balanced', supportType: 'friend', communicationTone: 'encouraging', motivationApproach: 'support' }),
  
  // Maya's Style Intelligence for This User
  personalizedStylingNotes: text('personalized_styling_notes'), // Maya's notes on what works for this user
  successfulPromptPatterns: jsonb('successful_prompt_patterns').default([]), // Prompts that generated great results
  userFeedbackPatterns: jsonb('user_feedback_patterns').default({ lovedElements: [], dislikedElements: [], requestPatterns: [] }),
  
  // Memory Management
  lastMemoryUpdate: timestamp('last_memory_update').defaultNow().notNull(),
  memoryVersion: integer('memory_version').default(1), // For memory evolution tracking
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// INSERT SCHEMAS - Drizzle-Zod Integration
// =============================================================================

export const insertUserPersonalBrandSchema = createInsertSchema(userPersonalBrand).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  completedAt: true 
});

export const insertUserStyleProfileSchema = createInsertSchema(userStyleProfile).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertMayaPersonalMemorySchema = createInsertSchema(mayaPersonalMemory).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastMemoryUpdate: true 
});

// =============================================================================
// TYPE EXPORTS - TypeScript Integration
// =============================================================================

// Select Types (full database records)
export type UserPersonalBrand = typeof userPersonalBrand.$inferSelect;
export type UserStyleProfile = typeof userStyleProfile.$inferSelect;
export type MayaPersonalMemory = typeof mayaPersonalMemory.$inferSelect;

// Insert Types (for creating new records)
export type InsertUserPersonalBrand = typeof userPersonalBrand.$inferInsert;
export type InsertUserStyleProfile = typeof userStyleProfile.$inferInsert;
export type InsertMayaPersonalMemory = typeof mayaPersonalMemory.$inferInsert;

// =============================================================================
// HELPER TYPES - For Frontend Components
// =============================================================================

// Onboarding step validation
export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

// Style category options (can be expanded)
export type StyleCategory = 
  | 'Editorial' 
  | 'Minimalist' 
  | 'Boho' 
  | 'Corporate' 
  | 'Creative' 
  | 'Luxury' 
  | 'Casual Chic' 
  | 'Bold & Confident';

// Color palette structure
export interface ColorPalette {
  primaryColors: string[];
  accentColors: string[];
  avoidColors: string[];
  seasonalPalette?: 'Spring' | 'Summer' | 'Autumn' | 'Winter';
}

// Complete user context for Maya
export interface MayaUserContext {
  personalBrand: UserPersonalBrand | null;
  styleProfile: UserStyleProfile | null;
  mayaMemory: MayaPersonalMemory | null;
  hasCompletedOnboarding: boolean;
  currentOnboardingStep: OnboardingStep;
}

// =============================================================================
// ADDITIONAL VALIDATION SCHEMAS - Enhanced Zod Validation
// =============================================================================

// Personal brand validation with enhanced rules
export const personalBrandValidationSchema = z.object({
  transformationStory: z.string().min(50, "Please provide a more detailed transformation story").optional(),
  currentSituation: z.string().min(20, "Please describe your current situation").optional(),
  strugglesStory: z.string().min(20, "Please share your challenges").optional(),
  dreamOutcome: z.string().min(30, "Please describe your dream outcome").optional(),
  futureVision: z.string().min(30, "Please share your future vision").optional(),
  businessGoals: z.string().min(20, "Please describe your business goals").optional(),
  targetAudience: z.string().min(20, "Please describe your target audience").optional(),
  businessType: z.string().min(1, "Please select your business type").optional(),
  professionalGoals: z.string().min(20, "Please describe your professional goals").optional(),
});

// Style profile validation with detailed constraints
export const styleProfileValidationSchema = z.object({
  styleCategories: z.array(z.string()).min(1, "Please select at least one style category"),
  colorPreferences: z.object({
    primaryColors: z.array(z.string()).min(1, "Please select at least one primary color"),
    accentColors: z.array(z.string()).optional(),
    avoidColors: z.array(z.string()).optional(),
    seasonalPalette: z.enum(['Spring', 'Summer', 'Autumn', 'Winter']).optional(),
  }),
  clothingPreferences: z.object({
    preferredStyles: z.array(z.string()).min(1, "Please select preferred styles"),
    comfortLevel: z.enum(['Conservative', 'Moderate', 'Bold']),
    occasionTypes: z.array(z.string()).min(1, "Please select occasion types"),
  }),
});

// Complete onboarding step validation
export const onboardingStepValidationSchema = z.object({
  step: z.number().min(1).max(6),
  personalBrandData: personalBrandValidationSchema.optional(),
  styleProfileData: styleProfileValidationSchema.optional(),
  isCompleted: z.boolean(),
});

// =============================================================================
// UTILITY FUNCTIONS - Helper Functions for Onboarding
// =============================================================================

// Calculate onboarding completion percentage
export function calculateOnboardingProgress(personalBrand: UserPersonalBrand | null, styleProfile: UserStyleProfile | null): number {
  if (!personalBrand) return 0;
  
  const requiredFields = [
    'transformationStory',
    'currentSituation', 
    'dreamOutcome',
    'businessGoals',
    'targetAudience'
  ];
  
  const completedFields = requiredFields.filter(field => 
    personalBrand[field as keyof UserPersonalBrand] && 
    (personalBrand[field as keyof UserPersonalBrand] as string).length > 0
  );
  
  const baseProgress = (completedFields.length / requiredFields.length) * 70; // 70% for personal brand
  
  if (styleProfile && (styleProfile.styleCategories as any[]) && (styleProfile.styleCategories as any[]).length > 0) {
    return Math.min(100, baseProgress + 30); // Add 30% for style profile
  }
  
  return Math.round(baseProgress);
}

// Determine next onboarding step
export function getNextOnboardingStep(personalBrand: UserPersonalBrand | null, styleProfile: UserStyleProfile | null): OnboardingStep {
  if (!personalBrand || !personalBrand.transformationStory) return 1;
  if (!personalBrand.dreamOutcome || !personalBrand.futureVision) return 2;
  if (!personalBrand.businessGoals || !personalBrand.targetAudience) return 3;
  if (!styleProfile || !(styleProfile.styleCategories as any[])?.length) return 4;
  if (!(styleProfile.colorPreferences as any)?.primaryColors?.length) return 5;
  return 6;
}

// Validate onboarding step completion
export function validateStepCompletion(step: OnboardingStep, personalBrand: UserPersonalBrand | null, styleProfile: UserStyleProfile | null): boolean {
  switch (step) {
    case 1:
      return Boolean(personalBrand?.transformationStory && personalBrand.transformationStory.length > 20);
    case 2:
      return Boolean(personalBrand?.dreamOutcome && personalBrand.futureVision);
    case 3:
      return Boolean(personalBrand?.businessGoals && personalBrand.targetAudience);
    case 4:
      return Boolean(styleProfile?.styleCategories && (styleProfile.styleCategories as any[]).length > 0);
    case 5:
      return Boolean((styleProfile?.colorPreferences as any)?.primaryColors && (styleProfile.colorPreferences as any).primaryColors.length > 0);
    case 6:
      return Boolean(personalBrand?.isCompleted);
    default:
      return false;
  }
}

// Generate personalized onboarding recommendations
export function generateOnboardingRecommendations(personalBrand: UserPersonalBrand | null): string[] {
  const recommendations: string[] = [];
  
  if (!personalBrand?.transformationStory) {
    recommendations.push("Share your transformation story to help Maya understand your journey");
  }
  
  if (!personalBrand?.businessGoals) {
    recommendations.push("Define your business goals for better personalized styling");
  }
  
  if (!personalBrand?.targetAudience) {
    recommendations.push("Identify your target audience to create images that resonate");
  }
  
  if (personalBrand?.businessType === 'Other' || !personalBrand?.businessType) {
    recommendations.push("Specify your business type for industry-specific styling suggestions");
  }
  
  return recommendations;
}

// =============================================================================
// ADVANCED TYPE HELPERS - Enhanced TypeScript Types
// =============================================================================

// Partial onboarding data for step-by-step updates
export type PartialPersonalBrand = Partial<InsertUserPersonalBrand>;
export type PartialStyleProfile = Partial<InsertUserStyleProfile>;

// Onboarding form data types
export interface OnboardingFormData {
  step1: {
    transformationStory: string;
    currentSituation: string;
    strugglesStory?: string;
  };
  step2: {
    dreamOutcome: string;
    futureVision: string;
    personalityTraits: string[];
  };
  step3: {
    businessGoals: string;
    targetAudience: string;
    businessType: string;
    professionalGoals: string;
  };
  step4: {
    styleCategories: StyleCategory[];
    settingsPreferences: string[];
    locationVibes: string[];
  };
  step5: {
    colorPreferences: ColorPalette;
    clothingPreferences: {
      preferredStyles: string[];
      comfortLevel: 'Conservative' | 'Moderate' | 'Bold';
      occasionTypes: string[];
    };
  };
  step6: {
    finalReview: boolean;
    agreedToTerms: boolean;
  };
}

// Maya conversation enhancement types
export interface MayaConversationContext {
  userContext: MayaUserContext;
  conversationHistory: any[];
  currentTopic: string;
  personalityAdaptation: {
    communicationStyle: string;
    supportLevel: string;
    motivationApproach: string;
  };
}

// Enhanced error handling for onboarding
export interface OnboardingError {
  step: OnboardingStep;
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

// Progress tracking interface
export interface OnboardingProgress {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  totalSteps: number;
  percentageComplete: number;
  estimatedTimeRemaining: number; // in minutes
  recommendations: string[];
}