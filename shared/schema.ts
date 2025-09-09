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
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Stack Auth (Stack Auth manages sessions automatically)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Agent session contexts for persistent memory between user sessions
export const agentSessionContexts = pgTable("agent_session_contexts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  agentId: varchar("agent_id").notNull(),
  sessionId: varchar("session_id").notNull(),
  contextData: jsonb("context_data").notNull(), // Conversation history, memory, state
  workflowState: varchar("workflow_state").default("ready"), // ready, active, paused, completed
  lastInteraction: timestamp("last_interaction").defaultNow(),
  memorySnapshot: jsonb("memory_snapshot"), // Consolidated memory for quick restoration
  adminBypass: boolean("admin_bypass").default(false), // Admin bypass for enhanced context access
  unlimitedContext: boolean("unlimited_context").default(false), // Unlimited memory access for admin agents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_agent_session_user").on(table.userId, table.agentId),
  index("idx_agent_session_updated").on(table.updatedAt),
]);

// User storage table for Stack Auth integration
export const users = pgTable("users", {
  // Core user fields - Stack Auth compatible
  id: varchar("id").primaryKey().notNull(), // Stack Auth uses string IDs
  stackAuthId: varchar("stack_auth_id").unique(), // For linking existing users to Stack Auth
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  displayName: varchar("display_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Stack Auth managed timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  
  // Business logic - preserved from existing system
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  plan: varchar("plan").default("sselfie-studio"), // sselfie-studio for €47/month, admin for unlimited
  role: varchar("role").default("user"), // user, admin
  monthlyGenerationLimit: integer("monthly_generation_limit").default(100), // 100 for sselfie-studio plan, unlimited (-1) for admin
  generationsUsedThisMonth: integer("generations_used_this_month").default(0),
  mayaAiAccess: boolean("maya_ai_access").default(true), // Available on both tiers
  victoriaAiAccess: boolean("victoria_ai_access").default(false), // Only for full-access tier
  
  // 🔄 PHASE 3: Retraining access tracking
  hasRetrainingAccess: boolean("has_retraining_access").default(false),
  retrainingSessionId: varchar("retraining_session_id"),
  retrainingPaidAt: timestamp("retraining_paid_at"),
  
  // Conversational onboarding tracking - Maya handles incomplete profiles gracefully
  onboardingProgress: jsonb("onboarding_progress").default('{}'), // Store conversational progress without blocking
  preferredOnboardingMode: varchar("preferred_onboarding_mode").default("conversational"), // conversational, guided, completed
  
  // Essential profile data for Maya personalization
  gender: varchar("gender"), // "man" | "woman" | "non-binary" - CRITICAL for image generation
  profession: varchar("profession"), // User's business/profession
  brandStyle: varchar("brand_style"), // "professional" | "creative" | "lifestyle" | "luxury"
  photoGoals: text("photo_goals"), // What they want photos for (business use case)
  
  // Training-time coaching system for brand strategy discovery
  trainingCoachingStarted: boolean("training_coaching_started").default(false),
  trainingCoachingCompleted: boolean("training_coaching_completed").default(false),
  trainingCoachingPhase: varchar("training_coaching_phase"), // businessGoals, platformStrategy, brandPositioning, completed
  trainingCoachingStep: integer("training_coaching_step").default(0),
  brandStrategyContext: jsonb("brand_strategy_context"), // Stores coaching responses and brand strategy insights
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Email management for Ava agent
export const emailAccounts = pgTable("email_accounts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  accountType: varchar("account_type").notNull(), // 'personal' or 'business'
  email: varchar("email").notNull(),
  provider: varchar("provider").notNull(), // 'gmail', 'outlook', 'other'
  displayName: varchar("display_name"),
  accessToken: text("access_token"), // Encrypted
  refreshToken: text("refresh_token"), // Encrypted
  isActive: boolean("is_active").default(true),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const processedEmails = pgTable("processed_emails", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  accountId: integer("account_id").references(() => emailAccounts.id, { onDelete: "cascade" }).notNull(),
  externalId: varchar("external_id").notNull(), // Email ID from provider
  fromAddress: varchar("from_address").notNull(),
  toAddresses: jsonb("to_addresses").notNull(),
  subject: text("subject").notNull(),
  bodyPreview: text("body_preview"),
  receivedAt: timestamp("received_at").notNull(),
  category: varchar("category").notNull(), // 'urgent', 'customer', 'business', 'personal', 'marketing', 'spam'
  priority: varchar("priority").notNull(), // 'high', 'medium', 'low'
  needsResponse: boolean("needs_response").default(false),
  hasResponse: boolean("has_response").default(false),
  sentiment: varchar("sentiment").notNull(), // 'positive', 'neutral', 'negative'
  tags: jsonb("tags"), // Array of tags
  aiSummary: text("ai_summary"),
  suggestedResponse: text("suggested_response"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_processed_emails_user").on(table.userId),
  index("idx_processed_emails_account").on(table.accountId),
  index("idx_processed_emails_category").on(table.category),
  index("idx_processed_emails_priority").on(table.priority),
]);

// Instagram/ManyChat message management for Ava agent
export const instagramMessages = pgTable("instagram_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  platform: varchar("platform").notNull(), // 'instagram' or 'manychat'
  externalId: varchar("external_id").notNull(), // Message ID from platform
  fromUsername: varchar("from_username").notNull(),
  fromId: varchar("from_id").notNull(),
  message: text("message").notNull(),
  messageType: varchar("message_type").notNull(), // 'text', 'image', 'video', 'story_reply'
  receivedAt: timestamp("received_at").notNull(),
  category: varchar("category").notNull(), // 'customer_inquiry', 'general', 'collaboration', 'spam', 'urgent'
  priority: varchar("priority").notNull(), // 'high', 'medium', 'low'
  sentiment: varchar("sentiment").notNull(), // 'positive', 'neutral', 'negative'
  needsResponse: boolean("needs_response").default(false),
  hasResponse: boolean("has_response").default(false),
  isBusinessOpportunity: boolean("is_business_opportunity").default(false),
  tags: jsonb("tags"), // Array of tags
  aiSummary: text("ai_summary"),
  suggestedResponse: text("suggested_response"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_instagram_messages_user").on(table.userId),
  index("idx_instagram_messages_platform").on(table.platform),
  index("idx_instagram_messages_category").on(table.category),
  index("idx_instagram_messages_priority").on(table.priority),
]);

// Website schema for Victoria website builder
export const websites = pgTable("websites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  title: varchar("title").notNull(),
  slug: varchar("slug").notNull().unique(), // URL slug for preview
  url: varchar("url"), // Generated URL
  status: varchar("status").notNull().default("draft"), // draft, published, archived
  content: jsonb("content").notNull(), // Website content data
  templateId: varchar("template_id").default("victoria-editorial"),
  screenshotUrl: varchar("screenshot_url"), // Screenshot for preview
  isPublished: boolean("is_published").default(false),
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
  generatedPrompt: text("generated_prompt"), // The actual FLUX prompt used for generation
  style: varchar("style"), // editorial, business, lifestyle, luxury
  category: varchar("category"), // Business, Fashion, Lifestyle, Travel - NEW FIELD
  source: varchar("source").default("workspace"), // maya-chat, workspace, gallery-edit
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

// Claude API agent memory and learning tables
export const claudeConversations = pgTable("claude_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  agentName: varchar("agent_name").notNull(), // elena, aria, maya, etc
  conversationId: varchar("conversation_id").notNull().unique(), // unique session identifier
  title: varchar("title"),
  status: varchar("status").default("active"), // active, archived
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  messageCount: integer("message_count").default(0),
  context: jsonb("context"), // conversation context and preferences
  adminBypassEnabled: boolean("admin_bypass_enabled").default(false), // Admin token bypass for native tools
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Claude API messages table for detailed conversation history
export const claudeMessages = pgTable("claude_messages", {
  id: serial("id").primaryKey(),
  conversationId: varchar("conversation_id").references(() => claudeConversations.conversationId, { onDelete: "cascade" }).notNull(),
  role: varchar("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // tool calls, attachments, etc
  toolCalls: jsonb("tool_calls"), // Claude tool execution data
  toolResults: jsonb("tool_results"), // Tool execution results
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Agent learning data table for continuous improvement
export const agentLearning = pgTable("agent_learning", {
  id: serial("id").primaryKey(),
  agentName: varchar("agent_name").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
  learningType: varchar("learning_type").notNull(), // preference, pattern, skill, context
  category: varchar("category"), // design, technical, communication, etc
  data: jsonb("data").notNull(), // learning content
  confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.5"), // 0.0 to 1.0
  frequency: integer("frequency").default(1), // how often this pattern occurs
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent capabilities and tools table
export const agentCapabilities = pgTable("agent_capabilities", {
  id: serial("id").primaryKey(),
  agentName: varchar("agent_name").notNull(),
  capabilityType: varchar("capability_type").notNull(), // tool, knowledge, skill
  name: varchar("name").notNull(),
  description: text("description"),
  enabled: boolean("enabled").default(true),
  config: jsonb("config"), // capability configuration
  version: varchar("version").default("1.0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});



// Agent conversations table for chat persistence with threading support
export const agentConversations = pgTable("agent_conversations", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  userMessage: text("user_message").notNull(),
  agentResponse: text("agent_response").notNull(),
  devPreview: jsonb("dev_preview"),
  timestamp: timestamp("timestamp").defaultNow(),
  
  // Enhanced conversation threading and management fields
  conversationTitle: varchar("conversation_title"),
  conversationData: jsonb("conversation_data"), // Store full conversation history
  messageCount: integer("message_count").default(0),
  lastAgentResponse: text("last_agent_response"),
  isActive: boolean("is_active").default(true),
  isStarred: boolean("is_starred").default(false),
  isArchived: boolean("is_archived").default(false),
  tags: jsonb("tags").default('[]'), // Array of string tags
  
  // Threading support
  parentThreadId: integer("parent_thread_id"),
  branchedFromMessageId: varchar("branched_from_message_id"),
  
  // Enhanced timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User AI Models table for individual trained models - Enhanced for FLUX Pro
export const userModels = pgTable("user_models", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull().unique(), // One model per user
  trainingId: varchar("training_id"), // Replicate training ID (separate from model path)
  replicateModelId: varchar("replicate_model_id"), // Final model path only (e.g., sandrasocial/user123-selfie-lora)
  replicateVersionId: varchar("replicate_version_id"), // The actual trained model version to use
  trainedModelPath: varchar("trained_model_path"), // sandrasocial/{modelName}
  // REMOVED: loraWeightsUrl - packaged models have LoRA built-in
  triggerWord: varchar("trigger_word").notNull().unique(),
  trainingStatus: varchar("training_status").default('pending'), // pending, training, completed, failed, luxury_training, luxury_completed
  modelName: varchar("model_name"),
  // FLUX Pro luxury fields for premium users
  isLuxury: boolean("is_luxury").default(false), // Premium FLUX Pro model
  finetuneId: varchar("finetune_id"), // FLUX Pro finetune ID for ultra-realistic generation
  modelType: varchar("model_type").default('flux-dev'), // flux-dev or flux-pro
  trainingProgress: integer("training_progress").default(0), // 0-100%
  estimatedCompletionTime: timestamp("estimated_completion_time"),
  failureReason: text("failure_reason"),
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
  // Design Preferences (from Zara's audit)
  stylePreference: varchar("style_preference").default("editorial-luxury"),
  colorScheme: varchar("color_scheme").default("black-white-editorial"),
  typographyStyle: varchar("typography_style").default("times-editorial"),
  designPersonality: varchar("design_personality").default("sophisticated"),
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

// Maya Personal Brand data for onboarding - SIMPLIFIED 8 FIELDS
export const userPersonalBrand = pgTable("user_personal_brand", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Personal details - 8 core fields only
  name: text("name"),
  transformationStory: text("transformation_story"),
  currentSituation: text("current_situation"),
  futureVision: text("future_vision"),
  businessGoals: text("business_goals"),
  businessType: varchar("business_type"),
  stylePreferences: text("style_preferences"),
  photoGoals: text("photo_goals"),
  
  // System fields
  onboardingStep: integer("onboarding_step").default(1),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maya Personal Memory data for personalized interactions
export const mayaPersonalMemory = pgTable("maya_personal_memory", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  personalInsights: jsonb("personal_insights"),
  ongoingGoals: jsonb("ongoing_goals"),
  conversationStyle: jsonb("conversation_style"),
  userFeedbackPatterns: jsonb("user_feedback_patterns"),
  preferredTopics: jsonb("preferred_topics"),
  personalizedStylingNotes: text("personalized_styling_notes"),
  successfulPromptPatterns: jsonb("successful_prompt_patterns"),
  lastMemoryUpdate: timestamp("last_memory_update").defaultNow(),
  memoryVersion: integer("memory_version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Style Memory for learning preferences and patterns - ✨ PHASE 4.3 ENHANCED
export const userStyleMemory = pgTable("user_style_memory", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Preference tracking
  preferredCategories: jsonb("preferred_categories").default('[]'), // ["Business", "Lifestyle", etc.]
  favoritePromptPatterns: jsonb("favorite_prompt_patterns").default('[]'), // Successful prompt structures
  colorPreferences: jsonb("color_preferences").default('[]'), // Preferred color palettes
  settingPreferences: jsonb("setting_preferences").default('[]'), // Indoor, outdoor, urban, etc.
  stylingKeywords: jsonb("styling_keywords").default('[]'), // Words that resonate with user
  
  // Learning metrics
  totalInteractions: integer("total_interactions").default(0),
  totalFavorites: integer("total_favorites").default(0),
  averageSessionLength: integer("average_session_length").default(0), // in minutes
  mostActiveHours: jsonb("most_active_hours").default('[]'), // Time patterns
  
  // Success patterns
  highPerformingPrompts: jsonb("high_performing_prompts").default('[]'), // Prompts that got favorited
  rejectedPrompts: jsonb("rejected_prompts").default('[]'), // Prompts user didn't like
  
  // PHASE 4.3: Enhanced fields temporarily disabled for database compatibility
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Prompt Analysis for tracking successful patterns (zero risk - just logging)
export const promptAnalysis = pgTable("prompt_analysis", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Prompt details
  originalPrompt: text("original_prompt").notNull(),
  generatedPrompt: text("generated_prompt"), // The FLUX prompt used
  conceptTitle: text("concept_title"),
  category: varchar("category"), // Business, Lifestyle, etc.
  
  // User interaction data
  wasGenerated: boolean("was_generated").default(false),
  wasFavorited: boolean("was_favorited").default(false),
  wasSaved: boolean("was_saved").default(false),
  viewDuration: integer("view_duration"), // How long user looked at result
  
  // Technical analysis
  promptLength: integer("prompt_length"),
  keywordDensity: jsonb("keyword_density").default('{}'), // Word frequency analysis
  technicalSpecs: jsonb("technical_specs").default('{}'), // Camera, lighting, etc.
  
  // Performance metrics
  generationTime: integer("generation_time"), // How long it took to generate
  successScore: decimal("success_score", { precision: 3, scale: 2 }).default("0.0"), // 0.0 to 1.0 based on user actions
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Maya Chat History tables - STEP 3.1: Performance Optimized
export const mayaChats = pgTable("maya_chats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  chatTitle: varchar("chat_title").notNull(),
  chatSummary: text("chat_summary"),
  chatCategory: varchar("chat_category").default("Style Consultation"),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  // STEP 3.1: Performance indexes for optimal query performance
  userIdIdx: index("maya_chats_user_id_idx").on(table.userId),
  lastActivityIdx: index("maya_chats_last_activity_idx").on(table.lastActivity),
  categoryIdx: index("maya_chats_category_idx").on(table.chatCategory),
  userActivityIdx: index("maya_chats_user_activity_idx").on(table.userId, table.lastActivity),
}));

export const mayaChatMessages = pgTable("maya_chat_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => mayaChats.id).notNull(),
  role: varchar("role").notNull(), // 'user' or 'maya'
  content: text("content").notNull(),
  imagePreview: text("image_preview"), // JSON array of image URLs
  generatedPrompt: text("generated_prompt"),
  conceptCards: jsonb("concept_cards"), // ENHANCED: JSON array of concept cards with enhanced context
  quickButtons: text("quick_buttons"), // JSON array of quick action buttons
  canGenerate: boolean("can_generate").default(false), // Whether this message can generate images
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  // STEP 3.1: Performance indexes for optimal message retrieval
  chatIdIdx: index("maya_chat_messages_chat_id_idx").on(table.chatId),
  createdAtIdx: index("maya_chat_messages_created_at_idx").on(table.createdAt),
  roleIdx: index("maya_chat_messages_role_idx").on(table.role),
  chatRoleIdx: index("maya_chat_messages_chat_role_idx").on(table.chatId, table.role),
  canGenerateIdx: index("maya_chat_messages_can_generate_idx").on(table.canGenerate),
}));





// Schema exports
export const upsertUserSchema = createInsertSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
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
export const insertUserPersonalBrandSchema = createInsertSchema(userPersonalBrand).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMayaPersonalMemorySchema = createInsertSchema(mayaPersonalMemory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserStyleMemorySchema = createInsertSchema(userStyleMemory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPromptAnalysisSchema = createInsertSchema(promptAnalysis).omit({ id: true, createdAt: true });
export const insertMayaChatSchema = createInsertSchema(mayaChats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMayaChatMessageSchema = createInsertSchema(mayaChatMessages).omit({ id: true, createdAt: true });
export const insertGenerationTrackerSchema = createInsertSchema(generationTrackers).omit({ id: true, createdAt: true });
export const insertAgentConversationSchema = createInsertSchema(agentConversations).omit({ id: true, timestamp: true });
export const insertWebsiteSchema = createInsertSchema(websites).omit({ id: true, createdAt: true, updatedAt: true });

// Claude API schemas
export const insertClaudeConversationSchema = createInsertSchema(claudeConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClaudeMessageSchema = createInsertSchema(claudeMessages).omit({ id: true, createdAt: true, timestamp: true });
export const insertAgentLearningSchema = createInsertSchema(agentLearning).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAgentCapabilitySchema = createInsertSchema(agentCapabilities).omit({ id: true, createdAt: true, updatedAt: true });





// Type exports  
export type InsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Website types
export type Website = typeof websites.$inferSelect;
export type InsertWebsite = typeof websites.$inferInsert;
export type UserPersonalBrand = typeof userPersonalBrand.$inferSelect;
export type InsertUserPersonalBrand = typeof userPersonalBrand.$inferInsert;
export type MayaPersonalMemory = typeof mayaPersonalMemory.$inferSelect;
export type InsertMayaPersonalMemory = typeof mayaPersonalMemory.$inferInsert;
export type MayaChat = typeof mayaChats.$inferSelect;
export type InsertMayaChat = typeof mayaChats.$inferInsert;
export type MayaChatMessage = typeof mayaChatMessages.$inferSelect;
export type InsertMayaChatMessage = typeof mayaChatMessages.$inferInsert;
export type GenerationTracker = typeof generationTrackers.$inferSelect;
export type InsertGenerationTracker = typeof generationTrackers.$inferInsert;
// User profiles table schema already defined at top of file

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertBrandOnboarding = typeof brandOnboarding.$inferInsert;
export type BrandOnboarding = typeof brandOnboarding.$inferSelect;
// Website types already defined above at lines 750-751
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type InsertProject = typeof projects.$inferInsert;
export type UserStyleMemory = typeof userStyleMemory.$inferSelect;
export type InsertUserStyleMemory = typeof userStyleMemory.$inferInsert;
export type PromptAnalysis = typeof promptAnalysis.$inferSelect;
export type InsertPromptAnalysis = typeof promptAnalysis.$inferInsert;

// Claude API types
export type ClaudeConversation = typeof claudeConversations.$inferSelect;
export type InsertClaudeConversation = typeof claudeConversations.$inferInsert;
export type ClaudeMessage = typeof claudeMessages.$inferSelect;
export type InsertClaudeMessage = typeof claudeMessages.$inferInsert;
export type AgentLearning = typeof agentLearning.$inferSelect;
export type InsertAgentLearning = typeof agentLearning.$inferInsert;
export type AgentCapability = typeof agentCapabilities.$inferSelect;
export type InsertAgentCapability = typeof agentCapabilities.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertAiImage = typeof aiImages.$inferInsert;
export type AiImage = typeof aiImages.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertOnboardingData = typeof onboardingData.$inferInsert;
export type OnboardingData = typeof onboardingData.$inferSelect;
export type InsertSelfieUpload = typeof selfieUploads.$inferInsert;
export type SelfieUpload = typeof selfieUploads.$inferSelect;
export type InsertUserModel = typeof userModels.$inferInsert;
export type UserModel = typeof userModels.$inferSelect;
export type InsertGeneratedImage = typeof generatedImages.$inferInsert;
export type GeneratedImage = typeof generatedImages.$inferSelect;
export type InsertVictoriaChat = typeof victoriaChats.$inferInsert;
export type VictoriaChat = typeof victoriaChats.$inferSelect;
export type InsertPhotoSelection = typeof photoSelections.$inferInsert;
export type PhotoSelection = typeof photoSelections.$inferSelect;
export type InsertLandingPage = typeof landingPages.$inferInsert;
export type LandingPage = typeof landingPages.$inferSelect;
export type InsertUserLandingPage = typeof userLandingPages.$inferInsert;
export type UserLandingPage = typeof userLandingPages.$inferSelect;
export type InsertAgentConversation = typeof agentConversations.$inferInsert;
export type AgentConversation = typeof agentConversations.$inferSelect;










// Email capture table for lead generation
export const emailCaptures = pgTable('email_captures', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  plan: varchar('plan', { length: 50 }).notNull().default('free'),
  source: varchar('source', { length: 100 }).notNull().default('landing_page'),
  captured: timestamp('captured').defaultNow(),
  converted: boolean('converted').default(false),
  userId: varchar('user_id').references(() => users.id), // Added missing field from database
});

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

// BUILD FEATURE TABLES

// User Website Onboarding - stores user preferences for website generation
export const userWebsiteOnboarding = pgTable('user_website_onboarding', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  personalBrandName: varchar('personal_brand_name'), // Personal brand name
  story: text('story'), // User's personal/business story
  businessType: varchar('business_type'), // Type of business (coach, consultant, etc.)
  colorPreferences: jsonb('color_preferences').default({}), // Color scheme preferences
  targetAudience: text('target_audience'), // Who they serve
  brandKeywords: jsonb('brand_keywords').default([]), // Key brand terms
  goals: text('goals'), // What they want to achieve
  currentStep: varchar('current_step').default('story'), // Onboarding progress
  isCompleted: boolean('is_completed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// User Generated Websites - stores the actual generated websites
export const userGeneratedWebsites = pgTable('user_generated_websites', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  onboardingId: integer('onboarding_id').references(() => userWebsiteOnboarding.id, { onDelete: 'cascade' }),
  title: varchar('title').notNull(), // Website title
  subdomain: varchar('subdomain', { length: 63 }).unique(), // Unique subdomain (max 63 chars)
  htmlContent: text('html_content').notNull(), // Generated HTML
  cssContent: text('css_content').notNull(), // Generated CSS
  jsContent: text('js_content').default(''), // Optional JavaScript
  metadata: jsonb('metadata').default({}), // SEO metadata, social tags, etc.
  isPublished: boolean('is_published').default(false),
  status: varchar('status').default('draft'), // draft, published, archived
  templateUsed: varchar('template_used'), // Which template was used as base
  customizations: jsonb('customizations').default({}), // User customizations
  analytics: jsonb('analytics').default({}), // Visit stats, etc.
  seoScore: integer('seo_score').default(0), // SEO optimization score
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  publishedAt: timestamp('published_at'),
});

// Website Builder Conversations - stores BUILD Victoria chat conversations
export const websiteBuilderConversations = pgTable('website_builder_conversations', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  websiteId: integer('website_id').references(() => userGeneratedWebsites.id, { onDelete: 'cascade' }),
  onboardingId: integer('onboarding_id').references(() => userWebsiteOnboarding.id, { onDelete: 'cascade' }),
  messages: jsonb('messages').notNull().default([]), // Chat message history
  context: jsonb('context').default({}), // Conversation context (current step, user preferences, etc.)
  lastActivity: timestamp('last_activity').defaultNow(),
  isActive: boolean('is_active').default(true),
  conversationType: varchar('conversation_type').default('onboarding'), // onboarding, editing, support
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// BUILD feature insert schemas
export const insertUserWebsiteOnboardingSchema = createInsertSchema(userWebsiteOnboarding).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserGeneratedWebsitesSchema = createInsertSchema(userGeneratedWebsites).omit({ id: true, createdAt: true, updatedAt: true, publishedAt: true });
export const insertWebsiteBuilderConversationsSchema = createInsertSchema(websiteBuilderConversations).omit({ id: true, createdAt: true, updatedAt: true, lastActivity: true });

// BUILD feature type exports
export type UserWebsiteOnboarding = typeof userWebsiteOnboarding.$inferSelect;
export type InsertUserWebsiteOnboarding = z.infer<typeof insertUserWebsiteOnboardingSchema>;
export type UserGeneratedWebsite = typeof userGeneratedWebsites.$inferSelect;

// Imported subscribers table for email list migration
export const importedSubscribers = pgTable("imported_subscribers", {
  id: varchar("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  source: varchar("source").notNull(), // 'flodesk' | 'manychat'
  originalId: varchar("original_id").notNull(),
  status: varchar("status").notNull(), // 'active' | 'unsubscribed'
  tags: jsonb("tags").$type<string[]>().default([]),
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default({}),
  messengerData: jsonb("messenger_data"),
  importedAt: timestamp("imported_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type ImportedSubscriber = typeof importedSubscribers.$inferSelect;
export type InsertImportedSubscriber = typeof importedSubscribers.$inferInsert;
export type InsertUserGeneratedWebsite = z.infer<typeof insertUserGeneratedWebsitesSchema>;
export type WebsiteBuilderConversation = typeof websiteBuilderConversations.$inferSelect;
export type InsertWebsiteBuilderConversation = z.infer<typeof insertWebsiteBuilderConversationsSchema>;



// AGENT BRIDGE SYSTEM TABLES
// Luxury agent-to-agent communication and task execution tracking

export const agentTasks = pgTable('agent_tasks', {
  taskId: uuid('task_id').primaryKey().defaultRandom(),
  agentName: text('agent_name').notNull(),
  instruction: text('instruction').notNull(),
  conversationContext: jsonb('conversation_context').$type<string[]>(),
  priority: text('priority').$type<'high' | 'medium' | 'low'>().default('medium'),
  completionCriteria: jsonb('completion_criteria').$type<string[]>(),
  qualityGates: jsonb('quality_gates').$type<string[]>(),
  estimatedDuration: integer('estimated_duration').notNull(), // in minutes
  status: text('status').default('received'),
  progress: integer('progress').default(0),
  implementations: jsonb('implementations'),
  rollbackPlan: jsonb('rollback_plan').$type<string[]>(),
  validationResults: jsonb('validation_results'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at')
});

export type AgentTaskDB = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

export const agentKnowledgeBase = pgTable("agent_knowledge_base", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  topic: varchar("topic").notNull(),
  content: text("content").notNull(),
  source: varchar("source").notNull(), // 'conversation', 'training', 'documentation', 'experience'
  confidence: decimal("confidence").notNull(), // 0.0 to 1.0
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  tags: text("tags").array(), // For categorization
});

export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  taskType: varchar("task_type").notNull(),
  successRate: decimal("success_rate").notNull(),
  averageTime: integer("average_time").default(0), // in milliseconds
  userSatisfactionScore: decimal("user_satisfaction_score").default("0"),
  totalTasks: integer("total_tasks").default(0),
  improvementTrend: varchar("improvement_trend").default('stable'), // 'improving', 'stable', 'declining'
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const agentTrainingSessions = pgTable("agent_training_sessions", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  sessionType: varchar("session_type").notNull(), // 'manual', 'automatic', 'feedback'
  trainingData: jsonb("training_data").notNull(),
  improvements: text("improvements"),
  performanceGain: decimal("performance_gain"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  trainedBy: varchar("trained_by"), // User ID who initiated training
});

// PHASE 1: COST CONTROL & MONITORING SYSTEM
// Agent cost tracking and budgets for Sandra's Empire Control

export const agentCostTracking = pgTable("agent_cost_tracking", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  agentId: varchar("agent_id").notNull(),
  conversationId: varchar("conversation_id"),
  apiCalls: integer("api_calls").default(0),
  tokensUsed: integer("tokens_used").default(0),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 4 }).default("0.0000"),
  date: timestamp("date").defaultNow(),
  taskType: varchar("task_type"), // "chat", "file_edit", "analysis", etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_cost_tracking_user_agent_date").on(table.userId, table.agentId, table.date),
]);

// Daily/monthly budget controls
export const agentBudgets = pgTable("agent_budgets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  agentId: varchar("agent_id"),
  budgetType: varchar("budget_type").notNull(), // "daily", "monthly"
  budgetLimit: decimal("budget_limit", { precision: 10, scale: 2 }).notNull(),
  currentSpend: decimal("current_spend", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").default(true),
  resetDate: timestamp("reset_date"),
  alertThreshold: integer("alert_threshold").default(80), // Alert at 80% of budget
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Additional Agent Learning Schemas
export const insertAgentKnowledgeBaseSchemaOnly = createInsertSchema(agentKnowledgeBase);
export type InsertAgentKnowledgeBaseOnly = z.infer<typeof insertAgentKnowledgeBaseSchemaOnly>;
export type AgentKnowledgeBaseType = typeof agentKnowledgeBase.$inferSelect;

export const insertAgentKnowledgeBaseSchema = createInsertSchema(agentKnowledgeBase);
export type InsertAgentKnowledgeBase = z.infer<typeof insertAgentKnowledgeBaseSchema>;
export type AgentKnowledgeBase = typeof agentKnowledgeBase.$inferSelect;

export const insertAgentPerformanceMetricsSchema = createInsertSchema(agentPerformanceMetrics);
export type InsertAgentPerformanceMetrics = z.infer<typeof insertAgentPerformanceMetricsSchema>;
export type AgentPerformanceMetrics = typeof agentPerformanceMetrics.$inferSelect;

export const insertAgentTrainingSessionsSchema = createInsertSchema(agentTrainingSessions);
export type InsertAgentTrainingSession = z.infer<typeof insertAgentTrainingSessionsSchema>;
export type AgentTrainingSession = typeof agentTrainingSessions.$inferSelect;

// Cost tracking type exports
export const insertAgentCostTrackingSchema = createInsertSchema(agentCostTracking);
export type InsertAgentCostTracking = z.infer<typeof insertAgentCostTrackingSchema>;
export type AgentCostTracking = typeof agentCostTracking.$inferSelect;

export const insertAgentBudgetsSchema = createInsertSchema(agentBudgets);
export type InsertAgentBudgets = z.infer<typeof insertAgentBudgetsSchema>;
export type AgentBudgets = typeof agentBudgets.$inferSelect;

// PHASE 2: APPROVAL WORKFLOW SYSTEM - Sandra's Content Control

// Approval queue for customer-facing content
export const approvalQueue = pgTable("approval_queue", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  agentId: varchar("agent_id").notNull(),
  contentType: varchar("content_type").notNull(), // "email", "social_post", "ad_campaign", "website_change"
  contentTitle: varchar("content_title").notNull(),
  contentPreview: text("content_preview").notNull(),
  fullContent: jsonb("full_content").notNull(),
  targetAudience: varchar("target_audience"),
  impactLevel: varchar("impact_level").default("medium"), // "low", "medium", "high", "critical"
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  status: varchar("status").default("pending"), // "pending", "approved", "rejected", "modified"
  adminComments: text("admin_comments"),
  originalConversationId: varchar("original_conversation_id"),
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  approvedBy: varchar("approved_by"),
}, (table) => [
  index("idx_approval_queue_status").on(table.status, table.createdAt),
  index("idx_approval_queue_user").on(table.userId, table.status),
]);

// Agent pause/handoff requests
export const agentHandoffRequests = pgTable("agent_handoff_requests", {
  id: serial("id").primaryKey(),
  fromAgentId: varchar("from_agent_id").notNull(),
  toTargetType: varchar("to_target_type").notNull(), // "sandra", "agent", "approval_queue"
  toTargetId: varchar("to_target_id"), // Sandra's ID or another agent ID
  requestType: varchar("request_type").notNull(), // "approval_needed", "guidance_required", "decision_needed"
  contextSummary: text("context_summary").notNull(),
  urgencyLevel: varchar("urgency_level").default("normal"), // "low", "normal", "high", "urgent"
  conversationId: varchar("conversation_id"),
  originalTask: text("original_task"),
  currentProgress: jsonb("current_progress"),
  status: varchar("status").default("pending"), // "pending", "assigned", "completed", "escalated"
  responseRequired: boolean("response_required").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Agent sessions tracking table for emergency controls
export const agentSessions = pgTable("agent_sessions", {
  id: serial("id").primaryKey(),
  agentId: varchar("agent_id").notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  conversationId: varchar("conversation_id"),
  status: varchar("status").default("active"), // "active", "paused", "emergency_paused", "completed"
  startedAt: timestamp("started_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Approval workflow type exports
export const insertApprovalQueueSchema = createInsertSchema(approvalQueue);
export type InsertApprovalQueue = z.infer<typeof insertApprovalQueueSchema>;
export type ApprovalQueue = typeof approvalQueue.$inferSelect;

export const insertAgentHandoffRequestsSchema = createInsertSchema(agentHandoffRequests);
export type InsertAgentHandoffRequests = z.infer<typeof insertAgentHandoffRequestsSchema>;
export type AgentHandoffRequests = typeof agentHandoffRequests.$inferSelect;

export const insertAgentSessionsSchema = createInsertSchema(agentSessions);
export type InsertAgentSessions = z.infer<typeof insertAgentSessionsSchema>;
export type AgentSessions = typeof agentSessions.$inferSelect;

export type InsertUsageHistory = typeof usageHistory.$inferInsert;

// Export styleguide tables and types  
export { userStyleguides, styleguideTemplates } from "./styleguide-schema";
export type { UserStyleguide, StyleguideTemplate, InsertUserStyleguide, InsertStyleguideTemplate } from "./styleguide-schema";

// Website management schema types
// MISSING TABLE DEFINITIONS - Adding to resolve database schema mismatches

// Architecture audit tracking table
export const architectureAuditLog = pgTable("architecture_audit_log", {
  id: serial("id").primaryKey(),
  auditDate: timestamp("audit_date").defaultNow(),
  totalUsers: integer("total_users"),
  compliantUsers: integer("compliant_users"),
  violationsFound: text("violations_found").array(),
  violationsFixed: text("violations_fixed").array(),
  auditStatus: varchar("audit_status"),
});

// Brand identity management table
export const brandbooks = pgTable("brandbooks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  businessName: varchar("business_name").notNull(),
  tagline: varchar("tagline"),
  story: text("story"),
  primaryFont: varchar("primary_font").default("Times New Roman"),
  secondaryFont: varchar("secondary_font").default("Inter"),
  primaryColor: varchar("primary_color").default("#0a0a0a"),
  secondaryColor: varchar("secondary_color").default("#ffffff"),
  accentColor: varchar("accent_color").default("#f5f5f5"),
  logoType: varchar("logo_type").notNull(),
  logoUrl: varchar("logo_url"),
  logoPrompt: text("logo_prompt"),
  moodboardStyle: varchar("moodboard_style").notNull(),
  voiceTone: text("voice_tone"),
  voicePersonality: text("voice_personality"),
  keyPhrases: text("key_phrases"),
  isPublished: boolean("is_published").default(false),
  brandbookUrl: varchar("brandbook_url"),
  templateType: varchar("template_type").default("minimal-executive"),
  customDomain: varchar("custom_domain"),
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User dashboard configurations table
export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  config: jsonb("config").notNull(),
  onboardingData: jsonb("onboarding_data"),
  templateType: varchar("template_type").notNull(),
  quickLinks: jsonb("quick_links"),
  customUrl: varchar("custom_url"),
  isPublished: boolean("is_published").default(false),
  backgroundColor: varchar("background_color").default("#ffffff"),
  accentColor: varchar("accent_color").default("#0a0a0a"),
  isLive: boolean("is_live").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User photo inspiration table
export const inspirationPhotos = pgTable("inspiration_photos", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  imageUrl: varchar("image_url").notNull(),
  description: text("description"),
  tags: jsonb("tags"),
  source: varchar("source").default("upload"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI model recovery tracking table
export const modelRecoveryLog = pgTable("model_recovery_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  oldModelId: varchar("old_model_id"),
  newModelId: varchar("new_model_id"),
  recoveryStatus: varchar("recovery_status"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sandra admin chat history table
export const sandraConversations = pgTable("sandra_conversations", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  userStylePreferences: jsonb("user_style_preferences"),
  suggestedPrompt: text("suggested_prompt"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User saved prompts table  
export const savedPrompts = pgTable("saved_prompts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  camera: varchar("camera"),
  texture: varchar("texture"),
  collection: varchar("collection"),
  createdAt: timestamp("created_at").defaultNow(),
});

// PHASE 3: DYNAMIC PERSONALIZATION ENGINE - User Style Evolution Tracking
export const userStyleEvolution = pgTable("user_style_evolution", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  
  // Adaptation tracking
  learningProgress: jsonb("learning_progress").default('{}'),
  styleEvolutionPath: jsonb("style_evolution_path").default('[]'),
  feedbackPatterns: jsonb("feedback_patterns").default('{}'),
  contextualPreferences: jsonb("contextual_preferences").default('{}'),
  
  // Contemporary elements
  trendAdaptation: jsonb("trend_adaptation").default('{}'),
  culturalContext: jsonb("cultural_context").default('{}'),
  sustainabilityPreferences: jsonb("sustainability_preferences").default('{}'),
  
  lastAdaptation: timestamp("last_adaptation").defaultNow(),
  createdAt: timestamp("created_at").defaultNow()
});

// Real-time Context Tracking  
export const mayaContextSessions = pgTable("maya_context_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  sessionId: varchar("session_id").notNull(),
  
  // Session context
  currentMood: varchar("current_mood"),
  stylingGoals: jsonb("styling_goals").default('[]'),
  contextualCues: jsonb("contextual_cues").default('{}'),
  adaptationTriggers: jsonb("adaptation_triggers").default('[]'),
  
  sessionStarted: timestamp("session_started").defaultNow(),
  lastInteraction: timestamp("last_interaction").defaultNow()
});

// Insert schemas for missing tables
export const insertArchitectureAuditLogSchema = createInsertSchema(architectureAuditLog).omit({ id: true, auditDate: true });
export const insertBrandbookSchema = createInsertSchema(brandbooks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDashboardSchema = createInsertSchema(dashboards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInspirationPhotoSchema = createInsertSchema(inspirationPhotos).omit({ id: true, createdAt: true });
export const insertModelRecoveryLogSchema = createInsertSchema(modelRecoveryLog).omit({ id: true, createdAt: true });
export const insertSandraConversationSchema = createInsertSchema(sandraConversations).omit({ id: true, createdAt: true });
export const insertSavedPromptSchema = createInsertSchema(savedPrompts).omit({ id: true, createdAt: true });
export const insertUserStyleEvolutionSchema = createInsertSchema(userStyleEvolution).omit({ id: true, createdAt: true, lastAdaptation: true });
export const insertMayaContextSessionSchema = createInsertSchema(mayaContextSessions).omit({ id: true, sessionStarted: true, lastInteraction: true });

// Type exports for missing tables
export type ArchitectureAuditLog = typeof architectureAuditLog.$inferSelect;
export type InsertArchitectureAuditLog = z.infer<typeof insertArchitectureAuditLogSchema>;
export type Brandbook = typeof brandbooks.$inferSelect;
export type InsertBrandbook = z.infer<typeof insertBrandbookSchema>;
export type Dashboard = typeof dashboards.$inferSelect;
export type InsertDashboard = z.infer<typeof insertDashboardSchema>;
export type InspirationPhoto = typeof inspirationPhotos.$inferSelect;
export type InsertInspirationPhoto = z.infer<typeof insertInspirationPhotoSchema>;
export type ModelRecoveryLog = typeof modelRecoveryLog.$inferSelect;
export type InsertModelRecoveryLog = z.infer<typeof insertModelRecoveryLogSchema>;
export type SandraConversation = typeof sandraConversations.$inferSelect;
export type InsertSandraConversation = z.infer<typeof insertSandraConversationSchema>;
export type SavedPrompt = typeof savedPrompts.$inferSelect;
export type InsertSavedPrompt = z.infer<typeof insertSavedPromptSchema>;
export type UserStyleEvolution = typeof userStyleEvolution.$inferSelect;
export type InsertUserStyleEvolution = z.infer<typeof insertUserStyleEvolutionSchema>;
export type MayaContextSession = typeof mayaContextSessions.$inferSelect;
export type InsertMayaContextSession = z.infer<typeof insertMayaContextSessionSchema>;

// Note: Website type already defined above at line 502
// Note: styleguide_templates and user_styleguides are imported from styleguide-schema.ts
// Note: agentTasks, emailCaptures, and userWebsiteOnboarding are already defined earlier in this file