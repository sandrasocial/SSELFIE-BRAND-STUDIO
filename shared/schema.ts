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
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Google OAuth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Google OAuth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  plan: varchar("plan").default("free"), // free, sselfie-studio
  role: varchar("role").default("user"), // user, admin, founder
  monthlyGenerationLimit: integer("monthly_generation_limit").default(5), // 5 for free, 100 for paid, unlimited (-1) for admin
  generationsUsedThisMonth: integer("generations_used_this_month").default(0),
  mayaAiAccess: boolean("maya_ai_access").default(true),
  victoriaAiAccess: boolean("victoria_ai_access").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User profile table for additional profile information
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  fullName: varchar("full_name"),
  phone: varchar("phone"),
  location: varchar("location"),
  instagramHandle: varchar("instagram_handle"),
  websiteUrl: varchar("website_url"),
  bio: text("bio"),
  brandVibe: text("brand_vibe"),
  goals: text("goals"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User projects/brands table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  status: varchar("status").default("draft"), // draft, published, archived
  templateId: varchar("template_id"),
  customDomain: varchar("custom_domain"),
  aiImagesGenerated: boolean("ai_images_generated").default(false),
  contentGenerated: boolean("content_generated").default(false),
  paymentSetup: boolean("payment_setup").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Generation tracking table - for temp preview ONLY (not gallery)
export const generationTrackers = pgTable("generation_trackers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  predictionId: varchar("prediction_id"),
  prompt: text("prompt"),
  style: varchar("style"),
  status: varchar("status").default("pending"), // pending, processing, completed, failed, canceled, timeout
  imageUrls: text("image_urls"), // JSON array of temp URLs for preview only
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI generated images table - GALLERY ONLY (permanent S3 URLs)
export const aiImages = pgTable("ai_images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  imageUrl: varchar("image_url").notNull(),
  prompt: text("prompt"),
  style: varchar("style"), // editorial, business, lifestyle, luxury
  predictionId: varchar("prediction_id"), // FLUX model prediction tracking
  generationStatus: varchar("generation_status").default("pending"), // pending, processing, completed, failed
  isSelected: boolean("is_selected").default(false),
  isFavorite: boolean("is_favorite").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Templates table
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category"), // luxury, minimal, editorial, etc.
  previewImageUrl: varchar("preview_image_url"),
  templateData: jsonb("template_data"), // JSON structure of the template
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plan: varchar("plan").notNull(), // "free" or "sselfie-studio"
  status: varchar("status").notNull(), // active, cancelled, expired
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User usage tracking table
export const userUsage = pgTable("user_usage", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  plan: varchar("plan").notNull(), // "free" or "sselfie-studio"
  // AI Generation limits and usage
  monthlyGenerationsAllowed: integer("monthly_generations_allowed").notNull(), // 5 for free, 100 for paid
  monthlyGenerationsUsed: integer("monthly_generations_used").default(0),
  // Access controls removed - handled by plan type instead
  // Cost tracking
  totalCostIncurred: decimal("total_cost_incurred", { precision: 10, scale: 4 }).default("0.0000"), // Track actual API costs
  // Period tracking for monthly limits
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  // Status tracking
  isLimitReached: boolean("is_limit_reached").default(false),
  lastGenerationAt: timestamp("last_generation_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Usage history for detailed tracking
export const usageHistory = pgTable("usage_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  actionType: varchar("action_type").notNull(), // 'generation', 'api_call', 'sandra_chat'
  resourceUsed: varchar("resource_used").notNull(), // 'replicate_ai', 'claude_api', 'openai_api'
  cost: decimal("cost", { precision: 6, scale: 4 }).notNull(), // Actual cost in USD
  details: jsonb("details"), // Store generation params, prompts, etc.
  generatedImageId: integer("generated_image_id").references(() => generatedImages.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Onboarding data table - simplified for streamlined vision
export const onboardingData = pgTable("onboarding_data", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Step 1: Brand Story
  brandStory: text("brand_story"),
  personalMission: text("personal_mission"),
  
  // Step 2: Business Goals
  businessGoals: text("business_goals"),
  targetAudience: text("target_audience"),
  businessType: varchar("business_type"),
  
  // Step 3: Voice & Style
  brandVoice: text("brand_voice"),
  stylePreferences: varchar("style_preferences"),
  
  // Step 4: AI Training
  selfieUploadStatus: varchar("selfie_upload_status").default("pending"), // pending, processing, completed
  aiTrainingStatus: varchar("ai_training_status").default("not_started"), // not_started, in_progress, completed
  
  // Progress tracking
  currentStep: integer("current_step").default(1),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Selfie uploads table
export const selfieUploads = pgTable("selfie_uploads", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  filename: varchar("filename").notNull(),
  originalUrl: varchar("original_url").notNull(),
  processedUrl: varchar("processed_url"),
  processingStatus: varchar("processing_status").default("pending"), // pending, processing, completed, failed
  aiModelOutput: jsonb("ai_model_output"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User AI Models table for individual trained models
export const userModels = pgTable("user_models", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(), // One model per user
  replicateModelId: varchar("replicate_model_id"),
  replicateVersionId: varchar("replicate_version_id"), // The actual trained model version to use
  trainedModelPath: varchar("trained_model_path"), // sandrasocial/{modelName}
  triggerWord: varchar("trigger_word").notNull().unique(),
  trainingStatus: varchar("training_status").default('pending'), // pending, training, completed, failed
  modelName: varchar("model_name"),
  startedAt: timestamp("started_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at")
});

// Image categories and generation tracking
export const generatedImages = pgTable("generated_images", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  modelId: integer("model_id").references(() => userModels.id),
  category: varchar("category").notNull(), // Lifestyle, Editorial, Portrait, etc.
  subcategory: varchar("subcategory").notNull(), // Working, Travel, etc.
  prompt: text("prompt").notNull(),
  imageUrls: text("image_urls").notNull(), // JSON array of 4 URLs
  selectedUrl: text("selected_url"), // User's choice
  saved: boolean("saved").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Victoria AI chat conversations
export const victoriaChats = pgTable("victoria_chats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionId: varchar("session_id").notNull(), // Group related messages
  message: text("message").notNull(),
  sender: varchar("sender").notNull(), // 'user' or 'victoria'
  messageType: varchar("message_type").default("text"), // text, template_suggestion, photo_selection
  metadata: jsonb("metadata"), // Store template data, photo selections, etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// Photo selections for landing page builder
export const photoSelections = pgTable("photo_selections", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  selectedSelfieIds: jsonb("selected_selfie_ids").notNull(), // Array of AI image IDs
  selectedFlatlayCollection: varchar("selected_flatlay_collection").notNull(), // Collection name
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Landing page templates and user customizations
export const landingPages = pgTable("landing_pages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  templateName: varchar("template_name").notNull(),
  customizations: jsonb("customizations"), // Colors, fonts, layout changes
  content: jsonb("content"), // Text content, headlines, descriptions
  photoSelections: jsonb("photo_selections"), // Selected photos for each section
  isPublished: boolean("is_published").default(false),
  publishedUrl: varchar("published_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand onboarding data for template auto-population
export const brandOnboarding = pgTable("brand_onboarding", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(), // One per user
  // Personal Brand Story
  businessName: varchar("business_name").notNull(),
  tagline: text("tagline").notNull(),
  personalStory: text("personal_story").notNull(),
  whyStarted: text("why_started"),
  // Target Client & Positioning
  targetClient: text("target_client").notNull(),
  problemYouSolve: text("problem_you_solve").notNull(),
  uniqueApproach: text("unique_approach").notNull(),
  // Offers & Services
  primaryOffer: varchar("primary_offer").notNull(),
  primaryOfferPrice: varchar("primary_offer_price").notNull(),
  secondaryOffer: varchar("secondary_offer"),
  secondaryOfferPrice: varchar("secondary_offer_price"),
  freeResource: text("free_resource"),
  // Contact & Links
  instagramHandle: varchar("instagram_handle"),
  websiteUrl: varchar("website_url"),
  email: varchar("email").notNull(),
  location: varchar("location"),
  // Brand Personality
  brandPersonality: varchar("brand_personality").notNull(),
  brandValues: text("brand_values"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User landing pages table for live hosting
export const userLandingPages = pgTable("user_landing_pages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  slug: varchar("slug").notNull().unique(), // username or custom slug
  title: varchar("title").notNull(),
  description: text("description"),
  htmlContent: text("html_content").notNull(),
  cssContent: text("css_content").notNull(),
  templateUsed: varchar("template_used"),
  isPublished: boolean("is_published").default(false),
  customDomain: varchar("custom_domain"),
  seoTitle: varchar("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maya Chat History tables
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



// Schema exports
export const upsertUserSchema = createInsertSchema(users);
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiImageSchema = createInsertSchema(aiImages).omit({ id: true, createdAt: true });
export const insertTemplateSchema = createInsertSchema(templates).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOnboardingDataSchema = createInsertSchema(onboardingData).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSelfieUploadSchema = createInsertSchema(selfieUploads).omit({ id: true, createdAt: true });
export const insertUserModelSchema = createInsertSchema(userModels).omit({ id: true, createdAt: true });
export const insertGeneratedImageSchema = createInsertSchema(generatedImages).omit({ id: true, createdAt: true });
export const insertVictoriaChatSchema = createInsertSchema(victoriaChats).omit({ id: true, createdAt: true });
export const insertPhotoSelectionSchema = createInsertSchema(photoSelections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLandingPageSchema = createInsertSchema(landingPages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBrandOnboardingSchema = createInsertSchema(brandOnboarding).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserLandingPageSchema = createInsertSchema(userLandingPages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMayaChatSchema = createInsertSchema(mayaChats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMayaChatMessageSchema = createInsertSchema(mayaChatMessages).omit({ id: true, createdAt: true });





// Type exports
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type MayaChat = typeof mayaChats.$inferSelect;
export type InsertMayaChat = typeof mayaChats.$inferInsert;
export type MayaChatMessage = typeof mayaChatMessages.$inferSelect;
export type InsertMayaChatMessage = typeof mayaChatMessages.$inferInsert;
// User profiles table schema already defined at top of file

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertBrandOnboarding = z.infer<typeof insertBrandOnboardingSchema>;
export type BrandOnboarding = typeof brandOnboarding.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertAiImage = z.infer<typeof insertAiImageSchema>;
export type AiImage = typeof aiImages.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertOnboardingData = z.infer<typeof insertOnboardingDataSchema>;
export type OnboardingData = typeof onboardingData.$inferSelect;
export type InsertSelfieUpload = z.infer<typeof insertSelfieUploadSchema>;
export type SelfieUpload = typeof selfieUploads.$inferSelect;
export type InsertUserModel = z.infer<typeof insertUserModelSchema>;
export type UserModel = typeof userModels.$inferSelect;
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertVictoriaChat = z.infer<typeof insertVictoriaChatSchema>;
export type VictoriaChat = typeof victoriaChats.$inferSelect;
export type InsertPhotoSelection = z.infer<typeof insertPhotoSelectionSchema>;
export type PhotoSelection = typeof photoSelections.$inferSelect;
export type InsertLandingPage = z.infer<typeof insertLandingPageSchema>;
export type LandingPage = typeof landingPages.$inferSelect;
export type InsertBrandOnboarding = z.infer<typeof insertBrandOnboardingSchema>;
export type BrandOnboarding = typeof brandOnboarding.$inferSelect;
export type InsertUserLandingPage = z.infer<typeof insertUserLandingPageSchema>;
export type UserLandingPage = typeof userLandingPages.$inferSelect;

// Generation tracker schemas and types
export const insertGenerationTrackerSchema = createInsertSchema(generationTrackers).omit({ id: true, createdAt: true, updatedAt: true });
export type GenerationTracker = typeof generationTrackers.$inferSelect;
export type InsertGenerationTracker = z.infer<typeof insertGenerationTrackerSchema>;








// Email capture table for lead generation
export const emailCaptures = pgTable("email_captures", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull(),
  plan: varchar("plan").notNull(), // free, sselfie-studio
  source: varchar("source").notNull(), // landing_page, pricing_page, etc
  captured: timestamp("captured").defaultNow(),
  converted: boolean("converted").default(false),
  userId: varchar("user_id").references(() => users.id), // Set after user signs up
});

export const insertEmailCaptureSchema = createInsertSchema(emailCaptures).omit({ id: true, createdAt: true });
export type EmailCapture = typeof emailCaptures.$inferSelect;
export type InsertEmailCapture = typeof emailCaptures.$inferInsert;

// Domain management table
export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  domain: varchar("domain").notNull().unique(), // user's custom domain
  subdomain: varchar("subdomain").unique(), // username.sselfie.com
  isVerified: boolean("is_verified").default(false),
  dnsRecords: jsonb("dns_records"), // Required DNS settings
  sslStatus: varchar("ssl_status").default("pending"), // pending, active, failed
  connectedTo: varchar("connected_to"), // 'styleguide', 'landing-page'
  resourceId: integer("resource_id"), // ID of connected resource
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Domain = typeof domains.$inferSelect;
export type UpsertDomain = typeof domains.$inferInsert;

// Usage tracking types
export type UserUsage = typeof userUsage.$inferSelect;
export type InsertUserUsage = typeof userUsage.$inferInsert;
export type UsageHistory = typeof usageHistory.$inferSelect;
export type InsertUsageHistory = typeof usageHistory.$inferInsert;

// Export styleguide tables and types  
export { userStyleguides, styleguideTemplates } from "./styleguide-schema";
export type { UserStyleguide, StyleguideTemplate, InsertUserStyleguide, InsertStyleguideTemplate } from "./styleguide-schema";
