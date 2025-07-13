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

// User subscriptions table - two-tier pricing system
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: varchar("plan").notNull(), // 'sselfie-studio' ($29) or 'sselfie-studio-pro' ($67)
  status: varchar("status").notNull(), // active, cancelled, expired
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User usage tracking table - plan-based limits
export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: varchar("plan").notNull(), // 'sselfie-studio' or 'sselfie-studio-pro'
  monthlyGenerationsAllowed: integer("monthly_generations_allowed").notNull(), // 100 for Studio, 300 for Pro
  monthlyGenerationsUsed: integer("monthly_generations_used").default(0),
  sandraAIAccess: boolean("sandra_ai_access").default(false), // false for Studio, true for Pro
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  lastGenerationAt: timestamp("last_generation_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Current photoshoot session images - persist until user generates new ones
export const photoshootSessions = pgTable("photoshoot_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionId: varchar("session_id").notNull(), // unique session identifier
  
  imageUrls: jsonb("image_urls").notNull(), // array of image URLs from current generation
  prompt: text("prompt"),
  style: varchar("style"),
  
  isActive: boolean("is_active").default(true), // false when user generates new images
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Saved prompts library table
export const savedPrompts = pgTable("saved_prompts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  camera: varchar("camera"),
  texture: varchar("texture"),
  collection: varchar("collection").default("My Prompts"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inspiration photos uploaded by users for style reference
export const inspirationPhotos = pgTable("inspiration_photos", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  imageUrl: varchar("image_url").notNull(),
  description: text("description"), // User's description of what they like about the image
  tags: jsonb("tags"), // Array of style tags extracted from the image
  source: varchar("source").default("upload"), // upload, pinterest, url
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
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

// Maya Chat History
export const mayaChats = pgTable("maya_chats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  chatTitle: varchar("chat_title").notNull(),
  chatSummary: text("chat_summary"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mayaChatMessages = pgTable("maya_chat_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => mayaChats.id).notNull(),
  role: varchar("role").notNull(), // 'user' or 'maya'
  content: text("content").notNull(),
  imagePreview: text("image_preview"), // JSON array of image URLs
  generatedPrompt: text("generated_prompt"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type MayaChat = typeof mayaChats.$inferSelect;
export type InsertMayaChat = typeof mayaChats.$inferInsert;
export type MayaChatMessage = typeof mayaChatMessages.$inferSelect;
export type InsertMayaChatMessage = typeof mayaChatMessages.$inferInsert;
export type SandraConversation = typeof sandraConversations.$inferSelect;
export type InsertSandraConversation = typeof sandraConversations.$inferInsert;
export type PhotoshootSession = typeof photoshootSessions.$inferSelect;
export type InsertPhotoshootSession = typeof photoshootSessions.$inferInsert;
export type SavedPrompt = typeof savedPrompts.$inferSelect;
export type InsertSavedPrompt = typeof savedPrompts.$inferInsert;
export type InspirationPhoto = typeof inspirationPhotos.$inferSelect;
export type InsertInspirationPhoto = typeof inspirationPhotos.$inferInsert;

// Insert schemas with Zod validation
export const insertOnboardingDataSchema = createInsertSchema(onboardingData);
export const insertAIImageSchema = createInsertSchema(aiImages);
export const insertUserModelSchema = createInsertSchema(userModels);
export const insertSelfieUploadSchema = createInsertSchema(selfieUploads);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertUserUsageSchema = createInsertSchema(userUsage);
export const insertSandraConversationSchema = createInsertSchema(sandraConversations);
export const insertPhotoshootSessionSchema = createInsertSchema(photoshootSessions);
export const insertSavedPromptSchema = createInsertSchema(savedPrompts);
export const insertInspirationPhotoSchema = createInsertSchema(inspirationPhotos);