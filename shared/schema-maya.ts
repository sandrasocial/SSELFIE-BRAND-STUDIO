import { pgTable, serial, varchar, text, jsonb, boolean, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema.js";

// =============================================================================
// MAYA CORE SCHEMA - Complete Database Structure
// =============================================================================
// This file defines all Maya-related database tables and their TypeScript types
// Includes comprehensive type interfaces, Zod validation schemas, and utility types

// =============================================================================
// MAYA MODELS TABLE - AI Model Training and Management
// =============================================================================

export const mayaModels = pgTable('maya_models', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Model Configuration
  modelType: varchar('model_type').notNull(), // 'flux', 'replicate', 'custom'
  trainingStatus: varchar('training_status').notNull(), // 'pending', 'training', 'completed', 'failed'
  trainingProgress: integer('training_progress').default(0), // 0-100 percentage
  
  // Model Metadata
  metadata: jsonb('metadata').default({}),
  
  // Model Performance
  qualityScore: integer('quality_score'), // 1-100 quality rating
  usageCount: integer('usage_count').default(0),
  lastUsed: timestamp('last_used'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================  
// MAYA IMAGES TABLE - Generated and User Images
// =============================================================================

export const mayaImages = pgTable('maya_images', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Image Storage
  url: varchar('url').notNull(),
  thumbnailUrl: varchar('thumbnail_url'),
  
  // Image Classification
  category: varchar('category'), // 'portrait', 'lifestyle', 'product', 'concept'
  subcategory: varchar('subcategory'), // More specific categorization
  
  // Image Metadata
  metadata: jsonb('metadata').default({}),
  
  // User Interaction
  isFavorite: boolean('is_favorite').default(false),
  isArchived: boolean('is_archived').default(false),
  rating: integer('rating'), // 1-5 user rating
  
  // Usage Tracking
  viewCount: integer('view_count').default(0),
  shareCount: integer('share_count').default(0),
  downloadCount: integer('download_count').default(0),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// MAYA CONCEPTS TABLE - Creative Concepts and Prompts  
// =============================================================================

export const mayaConcepts = pgTable('maya_concepts', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Concept Definition
  title: varchar('title').notNull(),
  description: text('description'),
  prompt: text('prompt'),
  type: varchar('type'), // 'portrait', 'flatlay', 'lifestyle', 'brand'
  
  // Concept Details
  metadata: jsonb('metadata').default({}),
  
  // Performance Tracking
  usageCount: integer('usage_count').default(0),
  successRate: integer('success_rate'), // Percentage of successful generations
  avgRating: decimal('avg_rating'), // Average user rating
  
  // Status and Organization
  status: varchar('status').default('active'), // 'active', 'archived', 'draft'
  tags: jsonb('tags').default([]),
  isTemplate: boolean('is_template').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// MAYA PAYMENTS TABLE - Stripe Integration and Billing
// =============================================================================

export const mayaPayments = pgTable('maya_payments', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Stripe Integration
  stripeSessionId: varchar('stripe_session_id'),
  stripeCustomerId: varchar('stripe_customer_id'),
  stripeSubscriptionId: varchar('stripe_subscription_id'),
  
  // Subscription Details
  subscriptionStatus: varchar('subscription_status'), // 'active', 'canceled', 'past_due', 'unpaid'
  planType: varchar('plan_type'), // 'basic', 'pro', 'enterprise'
  billingCycle: varchar('billing_cycle'), // 'monthly', 'yearly'
  
  // Payment Information
  amount: integer('amount'), // Amount in cents
  currency: varchar('currency').default('usd'),
  
  // Payment Metadata
  metadata: jsonb('metadata').default({}),
  
  // Status Tracking
  isActive: boolean('is_active').default(true),
  trialEndsAt: timestamp('trial_ends_at'),
  subscriptionEndsAt: timestamp('subscription_ends_at'),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// MAYA PROFILE TABLE - User Preferences and Settings
// =============================================================================

export const mayaProfile = pgTable('maya_profile', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Onboarding Status
  onboardingStatus: varchar('onboarding_status').default('pending'), // 'pending', 'in_progress', 'completed'
  onboardingStep: integer('onboarding_step').default(1),
  completedSteps: jsonb('completed_steps').default([]),
  
  // User Preferences
  preferences: jsonb('preferences').default({}),
  
  // Billing Information
  billingInfo: jsonb('billing_info').default({}),  // Usage Statistics
  totalGenerations: integer('total_generations').default(0),
  monthlyGenerations: integer('monthly_generations').default(0),
  lastResetDate: timestamp('last_reset_date').defaultNow(),
  
  // Feature Access
  featureAccess: jsonb('feature_access').default({}),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// =============================================================================
// ZOD VALIDATION SCHEMAS - Type-Safe Data Validation
// =============================================================================

// Maya Models Schemas
export const insertMayaModelsSchema = createInsertSchema(mayaModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectMayaModelsSchema = createSelectSchema(mayaModels);

// Maya Images Schemas  
export const insertMayaImagesSchema = createInsertSchema(mayaImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectMayaImagesSchema = createSelectSchema(mayaImages);

// Maya Concepts Schemas
export const insertMayaConceptsSchema = createInsertSchema(mayaConcepts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectMayaConceptsSchema = createSelectSchema(mayaConcepts);

// Maya Payments Schemas
export const insertMayaPaymentsSchema = createInsertSchema(mayaPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectMayaPaymentsSchema = createSelectSchema(mayaPayments);

// Maya Profile Schemas
export const insertMayaProfileSchema = createInsertSchema(mayaProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectMayaProfileSchema = createSelectSchema(mayaProfile);

// =============================================================================
// TYPESCRIPT TYPE EXPORTS - For Application Use
// =============================================================================

// Select Types (full database records)
export type MayaModel = typeof mayaModels.$inferSelect;
export type MayaImage = typeof mayaImages.$inferSelect;
export type MayaConcept = typeof mayaConcepts.$inferSelect;
export type MayaPayment = typeof mayaPayments.$inferSelect;
export type MayaProfile = typeof mayaProfile.$inferSelect;

// Insert Types (for creating new records)
export type InsertMayaModel = typeof mayaModels.$inferInsert;
export type InsertMayaImage = typeof mayaImages.$inferInsert;
export type InsertMayaConcept = typeof mayaConcepts.$inferInsert;
export type InsertMayaPayment = typeof mayaPayments.$inferInsert;
export type InsertMayaProfile = typeof mayaProfile.$inferInsert;

// =============================================================================
// UTILITY TYPES AND ENUMS - For Frontend Components
// =============================================================================

// Model Training Status
export type ModelTrainingStatus = 'pending' | 'training' | 'completed' | 'failed';

// Image Categories
export type ImageCategory = 'portrait' | 'lifestyle' | 'product' | 'concept';

// Concept Types
export type ConceptType = 'portrait' | 'flatlay' | 'lifestyle' | 'brand';

// Subscription Plans
export type SubscriptionPlan = 'basic' | 'pro' | 'enterprise';

// Subscription Status
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'unpaid';

// Onboarding Status
export type OnboardingStatus = 'pending' | 'in_progress' | 'completed';

// =============================================================================
// HELPER FUNCTIONS - Utility Functions for Maya Operations
// =============================================================================

// Generate unique model identifier
export function generateModelId(userId: string, modelType: string): string {
  return `${userId}_${modelType}_${Date.now()}`;
}

// Validate image metadata
export function validateImageMetadata(metadata: Record<string, unknown>): boolean {
  const required = ['dimensions', 'format'];
  return required.every(field => field in metadata);
}

// Calculate concept success rate
export function calculateConceptSuccessRate(usageCount: number, successfulGenerations: number): number {
  if (usageCount === 0) return 0;
  return Math.round((successfulGenerations / usageCount) * 100);
}

// Format subscription plan display name
export function formatPlanName(planType: SubscriptionPlan): string {
  const planNames = {
    basic: 'Basic Plan',
    pro: 'Professional Plan',
    enterprise: 'Enterprise Plan'
  };
  return planNames[planType] || planType;
}

// =============================================================================
// VALIDATION HELPERS - Custom Zod Validators
// =============================================================================

// Model metadata validator
export const modelMetadataSchema = z.object({
  trainingImages: z.array(z.string()).optional(),
  modelParameters: z.record(z.any()).optional(),
  trainingLogs: z.array(z.string()).optional(),
  errorDetails: z.string().optional(),
  modelVersion: z.string().optional(),
  capabilities: z.array(z.string()).optional(),
});

// Image metadata validator
export const imageMetadataSchema = z.object({
  dimensions: z.object({
    width: z.number(),
    height: z.number()
  }).optional(),
  fileSize: z.number().optional(),
  format: z.string().optional(),
  prompt: z.string().optional(),
  model: z.string().optional(),
  generationParams: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  colorPalette: z.array(z.string()).optional(),
});

// Concept metadata validator
export const conceptMetadataSchema = z.object({
  styleElements: z.array(z.string()).optional(),
  colorScheme: z.array(z.string()).optional(),
  mood: z.string().optional(),
  settings: z.array(z.string()).optional(),
  props: z.array(z.string()).optional(),
  lighting: z.string().optional(),
  composition: z.string().optional(),
  inspirationSources: z.array(z.string()).optional(),
});

// User preferences validator
export const userPreferencesSchema = z.object({
  communicationStyle: z.enum(['casual', 'professional', 'friendly']).optional(),
  generationSettings: z.object({
    defaultQuality: z.string().optional(),
    preferredAspectRatio: z.string().optional(),
    autoSave: z.boolean().optional(),
  }).optional(),
  privacySettings: z.object({
    shareGenerations: z.boolean().optional(),
    allowDataCollection: z.boolean().optional(),
  }).optional(),
  notificationSettings: z.object({
    emailUpdates: z.boolean().optional(),
    trainingComplete: z.boolean().optional(),
    newFeatures: z.boolean().optional(),
  }).optional(),
});