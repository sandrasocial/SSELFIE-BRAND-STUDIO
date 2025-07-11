import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Onboarding data table - simplified for €97 SSELFIE Studio
export const onboardingData = pgTable("onboarding_data", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Brand Story
  brandStory: text("brand_story"),
  personalMission: text("personal_mission"),
  
  // Business Goals
  businessGoals: text("business_goals"),
  targetAudience: text("target_audience"),
  businessType: varchar("business_type"),
  
  // Voice & Style
  brandVoice: text("brand_voice"),
  stylePreferences: varchar("style_preferences"),
  
  // AI Training Status
  aiTrainingStatus: varchar("ai_training_status").default("not_started"), // not_started, in_progress, completed
  
  // Progress tracking
  currentStep: integer("current_step").default(1),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sandra AI conversation history table
export const sandraConversations = pgTable("sandra_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  userStylePreferences: jsonb("user_style_preferences"), // Extracted style info
  suggestedPrompt: text("suggested_prompt"),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI generated images table
export const aiImages = pgTable("ai_images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  imageUrl: varchar("image_url").notNull(),
  prompt: text("prompt"),
  style: varchar("style"), // editorial, business, lifestyle, luxury
  predictionId: varchar("prediction_id"), // FLUX model prediction tracking
  generationStatus: varchar("generation_status").default("pending"), // pending, processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// User AI Models table for individual trained models
export const userModels = pgTable("user_models", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(), // One model per user
  modelName: varchar("model_name").notNull(), // e.g., "sandrasocial/sandra-selfie-lora"
  triggerWord: varchar("trigger_word").notNull(), // e.g., "user42585527"
  trainingStatus: varchar("training_status").default("not_started"), // not_started, training, completed, failed
  replicateModelId: varchar("replicate_model_id"), // Replicate model ID
  replicateVersionId: varchar("replicate_version_id"), // Replicate version ID
  trainingProgress: integer("training_progress").default(0), // 0-100%
  estimatedCompletionTime: timestamp("estimated_completion_time"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Selfie uploads table
export const selfieUploads = pgTable("selfie_uploads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: varchar("filename").notNull(),
  originalUrl: varchar("original_url").notNull(),
  processingStatus: varchar("processing_status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// User subscriptions table - simplified to single €97 product
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: varchar("plan").notNull().default("sselfie-studio"), // Single product: €97 SSELFIE Studio
  status: varchar("status").notNull(), // active, cancelled, expired
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User usage tracking table - simplified for 300 monthly generations
export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  monthlyGenerationsAllowed: integer("monthly_generations_allowed").default(300), // 300 monthly for €97 Studio
  monthlyGenerationsUsed: integer("monthly_generations_used").default(0),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  lastGenerationAt: timestamp("last_generation_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type definitions
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type OnboardingData = typeof onboardingData.$inferSelect;
export type InsertOnboardingData = typeof onboardingData.$inferInsert;
export type AIImage = typeof aiImages.$inferSelect;
export type InsertAIImage = typeof aiImages.$inferInsert;
export type UserModel = typeof userModels.$inferSelect;
export type InsertUserModel = typeof userModels.$inferInsert;
export type SelfieUpload = typeof selfieUploads.$inferSelect;
export type InsertSelfieUpload = typeof selfieUploads.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type UserUsage = typeof userUsage.$inferSelect;
export type InsertUserUsage = typeof userUsage.$inferInsert;
export type SandraConversation = typeof sandraConversations.$inferSelect;
export type InsertSandraConversation = typeof sandraConversations.$inferInsert;

// Insert schemas with Zod validation
export const insertOnboardingDataSchema = createInsertSchema(onboardingData);
export const insertAIImageSchema = createInsertSchema(aiImages);
export const insertUserModelSchema = createInsertSchema(userModels);
export const insertSelfieUploadSchema = createInsertSchema(selfieUploads);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertUserUsageSchema = createInsertSchema(userUsage);
export const insertSandraConversationSchema = createInsertSchema(sandraConversations);