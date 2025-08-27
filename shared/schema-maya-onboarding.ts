import { pgTable, serial, varchar, text, jsonb, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

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
  personalityTraits: jsonb('personality_traits').$type<string[]>().default([]), // Core personality characteristics
  
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
  photoUsageGoals: jsonb('photo_usage_goals').$type<string[]>().default([]), // Social media, website, marketing, etc.
  contentCreationGoals: text('content_creation_goals'), // What content they'll create
  professionalImageGoals: text('professional_image_goals'), // How photos support their goals
  
  // Progress Tracking
  onboardingStep: integer('onboarding_step').default(1), // Current step (1-6)
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Style Profile - Comprehensive style preferences and visual identity
export const userStyleProfile = pgTable('user_style_profile', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  personalBrandId: integer('personal_brand_id').references(() => userPersonalBrand.id, { onDelete: 'cascade' }),
  
  // Style Categories & Preferences
  styleCategories: jsonb('style_categories').$type<string[]>().default([]), // Editorial, Minimalist, Boho, Corporate, etc.
  colorPreferences: jsonb('color_preferences').$type<{
    primaryColors: string[];
    accentColors: string[];
    avoidColors: string[];
    seasonalPalette?: string;
  }>().default({ primaryColors: [], accentColors: [], avoidColors: [] }),
  
  // Settings & Environments
  settingsPreferences: jsonb('settings_preferences').$type<string[]>().default([]), // Office, home, outdoor, studio, etc.
  locationVibes: jsonb('location_vibes').$type<string[]>().default([]), // Luxury, natural, urban, cozy, etc.
  
  // Clothing & Fashion Preferences
  clothingPreferences: jsonb('clothing_preferences').$type<{
    preferredStyles: string[];
    favoriteItems: string[];
    bodyTypeConsiderations: string[];
    comfortLevel: string; // Conservative, moderate, bold
    occasionTypes: string[]; // Business, casual, formal, creative
  }>().default({ preferredStyles: [], favoriteItems: [], bodyTypeConsiderations: [], comfortLevel: 'moderate', occasionTypes: [] }),
  
  // Beauty & Grooming Preferences
  beautyPreferences: jsonb('beauty_preferences').$type<{
    makeupStyle: string; // Natural, polished, glamorous, minimal
    hairPreferences: string[];
    skinToneConsiderations: string;
    beautyComfortLevel: string;
  }>().default({ makeupStyle: 'natural', hairPreferences: [], skinToneConsiderations: '', beautyComfortLevel: 'moderate' }),
  
  // Avoidances & Boundaries
  styleAvoidances: jsonb('style_avoidances').$type<string[]>().default([]), // What they absolutely don't want
  boundariesAndLimits: text('boundaries_and_limits'), // Personal or cultural considerations
  
  // Inspiration & References
  inspirationImages: jsonb('inspiration_images').$type<string[]>().default([]), // URLs or descriptions of inspiring looks
  styleIcons: jsonb('style_icons').$type<string[]>().default([]), // People whose style they admire
  brandReferences: jsonb('brand_references').$type<string[]>().default([]), // Brands they love or aspire to
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Maya Personal Memory - Maya's personalized understanding of each user
export const mayaPersonalMemory = pgTable('maya_personal_memory', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  personalBrandId: integer('personal_brand_id').references(() => userPersonalBrand.id, { onDelete: 'cascade' }),
  
  // Maya's Personal Insights About User
  personalInsights: jsonb('personal_insights').$type<{
    coreMotivations: string[];
    transformationJourney: string;
    strengthsIdentified: string[];
    growthAreas: string[];
    personalityNotes: string;
    communicationStyle: string;
  }>().default({ coreMotivations: [], transformationJourney: '', strengthsIdentified: [], growthAreas: [], personalityNotes: '', communicationStyle: '' }),
  
  // Ongoing Goals & Progress
  ongoingGoals: jsonb('ongoing_goals').$type<{
    shortTermGoals: string[];
    longTermVision: string[];
    milestonesToCelebrate: string[];
    challengesToSupport: string[];
  }>().default({ shortTermGoals: [], longTermVision: [], milestonesToCelebrate: [], challengesToSupport: [] }),
  
  // Conversation Preferences
  preferredTopics: jsonb('preferred_topics').$type<string[]>().default([]), // Business, style, personal growth, etc.
  conversationStyle: jsonb('conversation_style').$type<{
    energyLevel: string; // High-energy, calm, balanced
    supportType: string; // Cheerleader, strategist, friend
    communicationTone: string; // Direct, gentle, encouraging
    motivationApproach: string; // Push, support, collaborate
  }>().default({ energyLevel: 'balanced', supportType: 'friend', communicationTone: 'encouraging', motivationApproach: 'support' }),
  
  // Maya's Style Intelligence for This User
  personalizedStylingNotes: text('personalized_styling_notes'), // Maya's notes on what works for this user
  successfulPromptPatterns: jsonb('successful_prompt_patterns').$type<string[]>().default([]), // Prompts that generated great results
  userFeedbackPatterns: jsonb('user_feedback_patterns').$type<{
    lovedElements: string[];
    dislikedElements: string[];
    requestPatterns: string[];
  }>().default({ lovedElements: [], dislikedElements: [], requestPatterns: [] }),
  
  // Memory Management
  lastMemoryUpdate: timestamp('last_memory_update').defaultNow(),
  memoryVersion: integer('memory_version').default(1), // For memory evolution tracking
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
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