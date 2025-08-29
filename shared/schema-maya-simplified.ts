import { pgTable, serial, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// =============================================================================
// MAYA SIMPLIFIED ONBOARDING SCHEMA - 7 CORE FIELDS ONLY
// =============================================================================
// Simplified from 23+ complex fields to 7 essential fields that actually matter
// Preserves Maya's conversation intelligence while reducing complexity

// Simplified User Profile - Essential information only
export const userSimplifiedProfile = pgTable('user_simplified_profile', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // CORE PROFILE - 7 ESSENTIAL FIELDS
  transformationStory: text('transformation_story'), // "Tell us about your journey"
  currentSituation: text('current_situation'), // "Where are you now?"
  futureVision: text('future_vision'), // "Where do you want to be?"
  businessGoals: text('business_goals'), // "What are your goals?"
  businessType: varchar('business_type'), // "What do you do?" (dropdown)
  stylePreferences: text('style_preferences'), // "Describe your style"
  photoGoals: text('photo_goals'), // "How will you use these photos?"
  
  // SIMPLE PROGRESS TRACKING
  isCompleted: boolean('is_completed').default(false),
  
  // TIMESTAMPS
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// MAYA'S CONVERSATION SYSTEM PRESERVED - DO NOT CHANGE
// =============================================================================
// These tables are kept 100% intact to preserve Maya's conversational intelligence:
// - maya_chat_messages: Complete conversation history
// - maya_chats: Chat sessions
// - maya_personal_memory: Maya's AI memory system
// - extractAndSaveNaturalOnboardingData(): Natural conversation data extraction

// =============================================================================
// INSERT SCHEMAS - Drizzle-Zod Integration
// =============================================================================

export const insertUserSimplifiedProfileSchema = createInsertSchema(userSimplifiedProfile).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// =============================================================================
// TYPE EXPORTS - TypeScript Integration
// =============================================================================

// Select Types (full database records)
export type UserSimplifiedProfile = typeof userSimplifiedProfile.$inferSelect;

// Insert Types (for creating new records)
export type InsertUserSimplifiedProfile = typeof userSimplifiedProfile.$inferInsert;

// =============================================================================
// BUSINESS TYPE OPTIONS - Simple Dropdown
// =============================================================================

export const BUSINESS_TYPES = [
  'Coach/Consultant',
  'Entrepreneur',
  'Creative Professional', 
  'Corporate Executive',
  'Content Creator',
  'Real Estate Agent',
  'Healthcare Professional',
  'Legal Professional',
  'Financial Advisor',
  'Other'
] as const;

export type BusinessType = typeof BUSINESS_TYPES[number];

// =============================================================================
// SIMPLIFIED USER CONTEXT - 7 Fields Only
// =============================================================================

export interface SimplifiedUserContext {
  profile: UserSimplifiedProfile | null;
  hasCompletedProfile: boolean;
  // Maya's conversation intelligence remains completely intact
  mayaConversationHistory: any[]; // Preserved from maya_chat_messages
  mayaMemory: any; // Preserved from maya_personal_memory
}