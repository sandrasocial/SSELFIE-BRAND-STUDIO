import { pgTable, serial, varchar, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// =============================================================================
// SIMPLE MAYA ONBOARDING SCHEMA
// =============================================================================
// Clean 4-question essential onboarding system
// Leverages existing users table structure for core data

// Simple Onboarding Completion Tracking
export const simpleOnboarding = pgTable('simple_onboarding', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // 4 Essential Questions Only - Core data for Maya's intelligence
  gender: varchar('gender').notNull(), // For FLUX trigger words (male/female/non-binary)
  preferredName: varchar('preferred_name').notNull(), // Maya's warm personalization
  primaryUse: varchar('primary_use').notNull(), // business/personal/both
  styleVibe: varchar('style_vibe').notNull(), // Simple initial direction
  
  // Simple completion tracking
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

// Validation for the 4 essential questions
export const simpleOnboardingAnswersSchema = z.object({
  gender: z.enum(['female', 'male', 'non-binary'], {
    required_error: "Gender selection is required for photo generation"
  }),
  preferredName: z.string().min(1, "Name is required").max(50, "Name too long"),
  primaryUse: z.enum(['business', 'personal', 'both'], {
    required_error: "Please select your primary use"
  }),
  styleVibe: z.enum([
    'Professional & Polished',
    'Creative & Artistic', 
    'Natural & Authentic',
    'Bold & Confident',
    'Elegant & Timeless'
  ], {
    required_error: "Please select your style direction"
  })
});

// Insert schema for database operations
export const insertSimpleOnboardingSchema = createInsertSchema(simpleOnboarding).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Select type (full database record)
export type SimpleOnboarding = typeof simpleOnboarding.$inferSelect;

// Insert type (for creating new records)
export type InsertSimpleOnboarding = typeof simpleOnboarding.$inferInsert;

// Answers type (for form validation)
export type SimpleOnboardingAnswers = z.infer<typeof simpleOnboardingAnswersSchema>;

// Complete user onboarding status
export interface UserOnboardingStatus {
  hasCompletedOnboarding: boolean;
  onboardingData: SimpleOnboarding | null;
  userId: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// Get FLUX trigger word based on gender
export function getFluxTriggerWord(gender: string): string {
  switch (gender) {
    case 'female': return 'woman';
    case 'male': return 'man';
    case 'non-binary': return 'person';
    default: return 'person';
  }
}

// Format style vibe for Maya's personality
export function formatStyleVibeForMaya(styleVibe: string): string {
  const vibeMap: Record<string, string> = {
    'Professional & Polished': 'professional, polished, business-ready looks',
    'Creative & Artistic': 'creative, artistic, expressive styling',
    'Natural & Authentic': 'natural, authentic, genuine beauty',
    'Bold & Confident': 'bold, confident, statement-making looks',
    'Elegant & Timeless': 'elegant, timeless, sophisticated styling'
  };
  
  return vibeMap[styleVibe] || 'personalized styling';
}