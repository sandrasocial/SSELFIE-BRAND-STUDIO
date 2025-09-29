import { pgTable, text, varchar, timestamp, jsonb, index, serial, boolean, integer, decimal, uuid, } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { ulid } from "ulid";
import { randomUUID } from 'node:crypto';
export const sessions = pgTable("sessions", {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
}, (table) => [index("IDX_session_expire").on(table.expire)]);
export const agentSessionContexts = pgTable("agent_session_contexts", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    agentId: varchar("agent_id").notNull(),
    sessionId: varchar("session_id").notNull(),
    contextData: jsonb("context_data").notNull(),
    workflowState: varchar("workflow_state").default("ready"),
    lastInteraction: timestamp("last_interaction").defaultNow().notNull(),
    memorySnapshot: jsonb("memory_snapshot"),
    adminBypass: boolean("admin_bypass").default(false),
    unlimitedContext: boolean("unlimited_context").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
    index("idx_agent_session_user").on(table.userId, table.agentId),
    index("idx_agent_session_updated").on(table.updatedAt),
]);
export const users = pgTable("users", {
    id: varchar("id").primaryKey().notNull(),
    stackAuthId: varchar("stack_auth_id").unique(),
    email: varchar("email").unique(),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    displayName: varchar("display_name"),
    profileImageUrl: varchar("profile_image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at"),
    stripeCustomerId: varchar("stripe_customer_id"),
    stripeSubscriptionId: varchar("stripe_subscription_id"),
    plan: varchar("plan").default("sselfie-studio"),
    role: varchar("role").default("user"),
    monthlyGenerationLimit: integer("monthly_generation_limit").default(100),
    generationsUsedThisMonth: integer("generations_used_this_month").default(0),
    mayaAiAccess: boolean("maya_ai_access").default(true),
    victoriaAiAccess: boolean("victoria_ai_access").default(false),
    hasRetrainingAccess: boolean("has_retraining_access").default(false),
    retrainingSessionId: varchar("retraining_session_id"),
    retrainingPaidAt: timestamp("retraining_paid_at"),
    onboardingProgress: jsonb("onboarding_progress").default('{}'),
    preferredOnboardingMode: varchar("preferred_onboarding_mode").default("conversational"),
    gender: varchar("gender"),
    profession: varchar("profession"),
    brandStyle: varchar("brand_style"),
    photoGoals: text("photo_goals"),
    trainingCoachingStarted: boolean("training_coaching_started").default(false),
    trainingCoachingCompleted: boolean("training_coaching_completed").default(false),
    trainingCoachingPhase: varchar("training_coaching_phase"),
    trainingCoachingStep: integer("training_coaching_step").default(0),
    brandStrategyContext: jsonb("brand_strategy_context"),
});
export const emailAccounts = pgTable("email_accounts", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    accountType: varchar("account_type").notNull(),
    email: varchar("email").notNull(),
    provider: varchar("provider").notNull(),
    displayName: varchar("display_name"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    isActive: boolean("is_active").default(true),
    lastSyncAt: timestamp("last_sync_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const processedEmails = pgTable("processed_emails", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    accountId: integer("account_id").references(() => emailAccounts.id, { onDelete: "cascade" }).notNull(),
    externalId: varchar("external_id").notNull(),
    fromAddress: varchar("from_address").notNull(),
    toAddresses: jsonb("to_addresses").notNull(),
    subject: text("subject").notNull(),
    bodyPreview: text("body_preview"),
    receivedAt: timestamp("received_at").notNull(),
    category: varchar("category").notNull(),
    priority: varchar("priority").notNull(),
    needsResponse: boolean("needs_response").default(false),
    hasResponse: boolean("has_response").default(false),
    sentiment: varchar("sentiment").notNull(),
    tags: jsonb("tags"),
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
export const instagramMessages = pgTable("instagram_messages", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    platform: varchar("platform").notNull(),
    externalId: varchar("external_id").notNull(),
    fromUsername: varchar("from_username").notNull(),
    fromId: varchar("from_id").notNull(),
    message: text("message").notNull(),
    messageType: varchar("message_type").notNull(),
    receivedAt: timestamp("received_at").notNull(),
    category: varchar("category").notNull(),
    priority: varchar("priority").notNull(),
    sentiment: varchar("sentiment").notNull(),
    needsResponse: boolean("needs_response").default(false),
    hasResponse: boolean("has_response").default(false),
    isBusinessOpportunity: boolean("is_business_opportunity").default(false),
    tags: jsonb("tags"),
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
export const websites = pgTable("websites", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    title: varchar("title").notNull(),
    slug: varchar("slug").notNull().unique(),
    url: varchar("url"),
    status: varchar("status").notNull().default("draft"),
    content: jsonb("content").notNull(),
    templateId: varchar("template_id").default("victoria-editorial"),
    screenshotUrl: varchar("screenshot_url"),
    isPublished: boolean("is_published").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
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
export const hairLeads = pgTable("hair_leads", {
    id: serial("id").primaryKey(),
    navn: varchar("navn").notNull(),
    epost: varchar("epost").notNull(),
    telefon: varchar("telefon"),
    kilde: varchar("kilde").default("qr-code"),
    interesse: text("interesse"),
    levelpartnerSynced: boolean("levelpartner_synced").default(false),
    levelpartnerSyncedAt: timestamp("levelpartner_synced_at"),
    status: varchar("status").default("new"),
    notater: text("notater"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_hair_leads_epost").on(table.epost),
    index("idx_hair_leads_created").on(table.createdAt),
    index("idx_hair_leads_kilde").on(table.kilde),
]);
export const projects = pgTable("projects", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name").notNull(),
    description: text("description"),
    status: varchar("status").default("draft"),
    templateId: varchar("template_id"),
    customDomain: varchar("custom_domain"),
    aiImagesGenerated: boolean("ai_images_generated").default(false),
    contentGenerated: boolean("content_generated").default(false),
    paymentSetup: boolean("payment_setup").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const generationTrackers = pgTable("generation_trackers", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    predictionId: varchar("prediction_id"),
    prompt: text("prompt"),
    style: varchar("style"),
    status: varchar("status").default("pending"),
    imageUrls: text("image_urls"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const aiImages = pgTable("ai_images", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    imageUrl: varchar("image_url").notNull(),
    prompt: text("prompt"),
    generatedPrompt: text("generated_prompt"),
    style: varchar("style"),
    category: varchar("category"),
    source: varchar("source").default("workspace"),
    predictionId: varchar("prediction_id"),
    generationStatus: varchar("generation_status").default("pending"),
    isSelected: boolean("is_selected").default(false),
    isFavorite: boolean("is_favorite").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});
export const templates = pgTable("templates", {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull(),
    description: text("description"),
    category: varchar("category"),
    previewImageUrl: varchar("preview_image_url"),
    templateData: jsonb("template_data"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
});
export const claudeConversations = pgTable("claude_conversations", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    agentName: varchar("agent_name").notNull(),
    conversationId: varchar("conversation_id").notNull().unique(),
    title: varchar("title"),
    status: varchar("status").default("active"),
    lastMessageAt: timestamp("last_message_at").defaultNow(),
    messageCount: integer("message_count").default(0),
    context: jsonb("context"),
    adminBypassEnabled: boolean("admin_bypass_enabled").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const claudeMessages = pgTable("claude_messages", {
    id: serial("id").primaryKey(),
    conversationId: varchar("conversation_id").references(() => claudeConversations.conversationId, { onDelete: "cascade" }).notNull(),
    role: varchar("role").notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata"),
    toolCalls: jsonb("tool_calls"),
    toolResults: jsonb("tool_results"),
    timestamp: timestamp("timestamp").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
});
export const agentLearning = pgTable("agent_learning", {
    id: serial("id").primaryKey(),
    agentName: varchar("agent_name").notNull(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }),
    learningType: varchar("learning_type").notNull(),
    category: varchar("category"),
    data: jsonb("data").notNull(),
    confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.5"),
    frequency: integer("frequency").default(1),
    lastSeen: timestamp("last_seen").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const agentCapabilities = pgTable("agent_capabilities", {
    id: serial("id").primaryKey(),
    agentName: varchar("agent_name").notNull(),
    capabilityType: varchar("capability_type").notNull(),
    name: varchar("name").notNull(),
    description: text("description"),
    enabled: boolean("enabled").default(true),
    config: jsonb("config"),
    version: varchar("version").default("1.0"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const agentConversations = pgTable("agent_conversations", {
    id: serial("id").primaryKey(),
    agentId: varchar("agent_id").notNull(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    userMessage: text("user_message").notNull(),
    agentResponse: text("agent_response").notNull(),
    devPreview: jsonb("dev_preview"),
    timestamp: timestamp("timestamp").defaultNow(),
    conversationTitle: varchar("conversation_title"),
    conversationData: jsonb("conversation_data"),
    messageCount: integer("message_count").default(0),
    lastAgentResponse: text("last_agent_response"),
    isActive: boolean("is_active").default(true),
    isStarred: boolean("is_starred").default(false),
    isArchived: boolean("is_archived").default(false),
    tags: jsonb("tags").default('[]'),
    parentThreadId: integer("parent_thread_id"),
    branchedFromMessageId: varchar("branched_from_message_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    plan: varchar("plan").notNull(),
    status: varchar("status").notNull(),
    stripeSubscriptionId: varchar("stripe_subscription_id"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const userUsage = pgTable("user_usage", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    plan: varchar("plan").notNull(),
    monthlyGenerationsAllowed: integer("monthly_generations_allowed").notNull(),
    monthlyGenerationsUsed: integer("monthly_generations_used").default(0),
    totalCostIncurred: decimal("total_cost_incurred", { precision: 10, scale: 4 }).default("0.0000"),
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    isLimitReached: boolean("is_limit_reached").default(false),
    lastGenerationAt: timestamp("last_generation_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const usageHistory = pgTable("usage_history", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    actionType: varchar("action_type").notNull(),
    resourceUsed: varchar("resource_used").notNull(),
    cost: decimal("cost", { precision: 6, scale: 4 }).notNull(),
    details: jsonb("details"),
    generatedImageId: integer("generated_image_id").references(() => generatedImages.id),
    createdAt: timestamp("created_at").defaultNow(),
});
export const onboardingData = pgTable("onboarding_data", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    brandStory: text("brand_story"),
    personalMission: text("personal_mission"),
    businessGoals: text("business_goals"),
    targetAudience: text("target_audience"),
    businessType: varchar("business_type"),
    brandVoice: text("brand_voice"),
    stylePreferences: varchar("style_preferences"),
    selfieUploadStatus: varchar("selfie_upload_status").default("pending"),
    aiTrainingStatus: varchar("ai_training_status").default("not_started"),
    currentStep: integer("current_step").default(1),
    completed: boolean("completed").default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const selfieUploads = pgTable("selfie_uploads", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    filename: varchar("filename").notNull(),
    originalUrl: varchar("original_url").notNull(),
    processedUrl: varchar("processed_url"),
    processingStatus: varchar("processing_status").default("pending"),
    aiModelOutput: jsonb("ai_model_output"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const userModels = pgTable("user_models", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull().unique(),
    trainingId: varchar("training_id"),
    replicateModelId: varchar("replicate_model_id"),
    replicateVersionId: varchar("replicate_version_id"),
    trainedModelPath: varchar("trained_model_path"),
    triggerWord: varchar("trigger_word").notNull().unique(),
    trainingStatus: varchar("training_status").default('pending'),
    modelName: varchar("model_name"),
    isLuxury: boolean("is_luxury").default(false),
    finetuneId: varchar("finetune_id"),
    modelType: varchar("model_type").default('flux-dev'),
    trainingProgress: integer("training_progress").default(0),
    estimatedCompletionTime: timestamp("estimated_completion_time"),
    failureReason: text("failure_reason"),
    startedAt: timestamp("started_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    completedAt: timestamp("completed_at")
});
export const generatedImages = pgTable("generated_images", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    modelId: integer("model_id").references(() => userModels.id),
    category: varchar("category").notNull(),
    subcategory: varchar("subcategory").notNull(),
    prompt: text("prompt").notNull(),
    imageUrls: text("image_urls").notNull(),
    selectedUrl: text("selected_url"),
    saved: boolean("saved").default(false),
    createdAt: timestamp("created_at").defaultNow()
});
export const generatedVideos = pgTable("generated_videos", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    imageId: integer("image_id"),
    imageSource: varchar("image_source").default("generated"),
    motionPrompt: text("motion_prompt").notNull(),
    videoUrl: varchar("video_url"),
    jobId: varchar("job_id").notNull(),
    status: varchar("status").default("pending"),
    estimatedTime: varchar("estimated_time"),
    progress: integer("progress").default(0),
    errorMessage: text("error_message"),
    saved: boolean("saved").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    completedAt: timestamp("completed_at"),
}, (table) => [
    index("generated_videos_user_id_idx").on(table.userId),
    index("generated_videos_job_id_idx").on(table.jobId),
    index("generated_videos_status_idx").on(table.status),
]);
export const videoStoryboards = pgTable("video_storyboards", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    scenes: jsonb("scenes").notNull(),
    mode: varchar("mode").default("sequential"),
    composedVideoUrl: varchar("composed_video_url"),
    status: varchar("status").default("pending"),
    progress: integer("progress").default(0),
    jobId: varchar("job_id"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    completedAt: timestamp("completed_at"),
}, (table) => [
    index("video_storyboards_user_id_idx").on(table.userId),
    index("video_storyboards_status_idx").on(table.status),
]);
export const victoriaChats = pgTable("victoria_chats", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    sessionId: varchar("session_id").notNull(),
    message: text("message").notNull(),
    sender: varchar("sender").notNull(),
    messageType: varchar("message_type").default("text"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const photoSelections = pgTable("photo_selections", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    selectedSelfieIds: jsonb("selected_selfie_ids").notNull(),
    selectedFlatlayCollection: varchar("selected_flatlay_collection").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const landingPages = pgTable("landing_pages", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    templateName: varchar("template_name").notNull(),
    customizations: jsonb("customizations"),
    content: jsonb("content"),
    photoSelections: jsonb("photo_selections"),
    isPublished: boolean("is_published").default(false),
    publishedUrl: varchar("published_url"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const brandOnboarding = pgTable("brand_onboarding", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull().unique(),
    businessName: varchar("business_name").notNull(),
    tagline: text("tagline").notNull(),
    personalStory: text("personal_story").notNull(),
    whyStarted: text("why_started"),
    targetClient: text("target_client").notNull(),
    problemYouSolve: text("problem_you_solve").notNull(),
    uniqueApproach: text("unique_approach").notNull(),
    primaryOffer: varchar("primary_offer").notNull(),
    primaryOfferPrice: varchar("primary_offer_price").notNull(),
    secondaryOffer: varchar("secondary_offer"),
    secondaryOfferPrice: varchar("secondary_offer_price"),
    freeResource: text("free_resource"),
    instagramHandle: varchar("instagram_handle"),
    websiteUrl: varchar("website_url"),
    email: varchar("email").notNull(),
    location: varchar("location"),
    brandPersonality: varchar("brand_personality").notNull(),
    brandValues: text("brand_values"),
    stylePreference: varchar("style_preference").default("editorial-luxury"),
    colorScheme: varchar("color_scheme").default("black-white-editorial"),
    typographyStyle: varchar("typography_style").default("times-editorial"),
    designPersonality: varchar("design_personality").default("sophisticated"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const userLandingPages = pgTable("user_landing_pages", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    slug: varchar("slug").notNull().unique(),
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
export const userPersonalBrand = pgTable("user_personal_brand", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    name: text("name"),
    transformationStory: text("transformation_story"),
    currentSituation: text("current_situation"),
    futureVision: text("future_vision"),
    businessGoals: text("business_goals"),
    businessType: varchar("business_type"),
    stylePreferences: text("style_preferences"),
    photoGoals: text("photo_goals"),
    onboardingStep: integer("onboarding_step").default(1),
    isCompleted: boolean("is_completed").default(false),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
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
export const userStyleMemory = pgTable("user_style_memory", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    preferredCategories: jsonb("preferred_categories").default('[]'),
    favoritePromptPatterns: jsonb("favorite_prompt_patterns").default('[]'),
    colorPreferences: jsonb("color_preferences").default('[]'),
    settingPreferences: jsonb("setting_preferences").default('[]'),
    stylingKeywords: jsonb("styling_keywords").default('[]'),
    totalInteractions: integer("total_interactions").default(0),
    totalFavorites: integer("total_favorites").default(0),
    averageSessionLength: integer("average_session_length").default(0),
    mostActiveHours: jsonb("most_active_hours").default('[]'),
    highPerformingPrompts: jsonb("high_performing_prompts").default('[]'),
    rejectedPrompts: jsonb("rejected_prompts").default('[]'),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const promptAnalysis = pgTable("prompt_analysis", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    originalPrompt: text("original_prompt").notNull(),
    generatedPrompt: text("generated_prompt"),
    conceptTitle: text("concept_title"),
    category: varchar("category"),
    wasGenerated: boolean("was_generated").default(false),
    wasFavorited: boolean("was_favorited").default(false),
    wasSaved: boolean("was_saved").default(false),
    viewDuration: integer("view_duration"),
    promptLength: integer("prompt_length"),
    keywordDensity: jsonb("keyword_density").default('{}'),
    technicalSpecs: jsonb("technical_specs").default('{}'),
    generationTime: integer("generation_time"),
    successScore: decimal("success_score", { precision: 3, scale: 2 }).default("0.0"),
    createdAt: timestamp("created_at").defaultNow(),
});
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
    userIdIdx: index("maya_chats_user_id_idx").on(table.userId),
    lastActivityIdx: index("maya_chats_last_activity_idx").on(table.lastActivity),
    categoryIdx: index("maya_chats_category_idx").on(table.chatCategory),
    userActivityIdx: index("maya_chats_user_activity_idx").on(table.userId, table.lastActivity),
}));
export const mayaChatMessages = pgTable("maya_chat_messages", {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").references(() => mayaChats.id).notNull(),
    role: varchar("role").notNull(),
    content: text("content").notNull(),
    imagePreview: text("image_preview"),
    generatedPrompt: text("generated_prompt"),
    conceptCards: jsonb("concept_cards"),
    quickButtons: text("quick_buttons"),
    canGenerate: boolean("can_generate").default(false),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    chatIdIdx: index("maya_chat_messages_chat_id_idx").on(table.chatId),
    createdAtIdx: index("maya_chat_messages_created_at_idx").on(table.createdAt),
    roleIdx: index("maya_chat_messages_role_idx").on(table.role),
    chatRoleIdx: index("maya_chat_messages_chat_role_idx").on(table.chatId, table.role),
    canGenerateIdx: index("maya_chat_messages_can_generate_idx").on(table.canGenerate),
}));
export const trainingRuns = pgTable("training_runs", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    trainingId: varchar("training_id").notNull(),
    status: varchar("status").notNull(),
    progress: integer("progress").default(0),
    baseModel: varchar("base_model").default("flux-dev"),
    parameters: jsonb("parameters"),
    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at"),
    datasetZipUrl: text("dataset_zip_url"),
    outputArtifactUrl: text("output_artifact_url"),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("training_runs_user_id_idx").on(table.userId),
    statusIdx: index("training_runs_status_idx").on(table.status),
    trainingIdIdx: index("training_runs_training_id_idx").on(table.trainingId),
}));
export const loraWeights = pgTable("lora_weights", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    trainingRunId: integer("training_run_id").references(() => trainingRuns.id, { onDelete: "cascade" }).notNull(),
    triggerWord: varchar("trigger_word").notNull(),
    baseModel: varchar("base_model").notNull().default("flux-dev"),
    s3Bucket: varchar("s3_bucket"),
    s3Key: varchar("s3_key"),
    fileSize: integer("file_size"),
    checksum: varchar("checksum"),
    rank: integer("rank").default(32),
    networkType: varchar("network_type").default("lora"),
    status: varchar("status").default("available"),
    defaultScales: jsonb("default_scales"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("lora_weights_user_id_idx").on(table.userId),
    statusIdx: index("lora_weights_status_idx").on(table.status),
    trainingRunIdx: index("lora_weights_training_run_idx").on(table.trainingRunId),
    triggerWordIdx: index("lora_weights_trigger_word_idx").on(table.triggerWord),
}));
export const liveSessions = pgTable("live_sessions", {
    id: uuid("id").primaryKey().defaultRandom(),
    deckUrl: text("deck_url"),
    mentiUrl: text("menti_url"),
    ctaUrl: text("cta_url"),
    title: text("title").notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    createdByIdx: index("idx_live_sessions_created_by").on(table.createdBy),
    createdAtIdx: index("idx_live_sessions_created_at").on(table.createdAt),
    titleIdx: index("idx_live_sessions_title").on(table.title),
}));
export const liveEvents = pgTable("live_events", {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").references(() => liveSessions.id, { onDelete: "cascade" }).notNull(),
    eventType: varchar("event_type").notNull(),
    meta: jsonb("meta").default({}),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    utmSource: varchar("utm_source"),
    utmCampaign: varchar("utm_campaign"),
    utmMedium: varchar("utm_medium"),
    utmContent: varchar("utm_content"),
    utmTerm: varchar("utm_term"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    sessionIdIdx: index("idx_live_events_session_id").on(table.sessionId),
    eventTypeIdx: index("idx_live_events_type").on(table.eventType),
    createdAtIdx: index("idx_live_events_created_at").on(table.createdAt),
    sessionTypeIdx: index("idx_live_events_session_type").on(table.sessionId, table.eventType),
    utmSourceIdx: index("idx_live_events_utm_source").on(table.utmSource),
    analyticsIdx: index("idx_live_events_analytics").on(table.sessionId, table.eventType, table.createdAt),
}));
export const upsertUserSchema = createInsertSchema(users);
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertHairLeadSchema = z.object({
    navn: z.string(),
    epost: z.string().email(),
    telefon: z.string().optional(),
    kilde: z.string().default("qr-code"),
    interesse: z.string().optional(),
    levelpartnerSynced: z.boolean().default(false),
    levelpartnerSyncedAt: z.date().optional(),
    status: z.string().default("new"),
    notater: z.string().optional(),
});
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
export const insertLiveSessionSchema = z.object({
    deckUrl: z.string().optional(),
    mentiUrl: z.string().optional(),
    ctaUrl: z.string().optional(),
    title: z.string(),
    createdBy: z.string().uuid(),
});
export const insertLiveEventSchema = z.object({
    sessionId: z.string().uuid(),
    eventType: z.string(),
    meta: z.record(z.any()).optional().default({}),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
    utmSource: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmMedium: z.string().optional(),
    utmContent: z.string().optional(),
    utmTerm: z.string().optional(),
});
export const insertUserLandingPageSchema = createInsertSchema(userLandingPages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserPersonalBrandSchema = createInsertSchema(userPersonalBrand).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMayaPersonalMemorySchema = createInsertSchema(mayaPersonalMemory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserStyleMemorySchema = createInsertSchema(userStyleMemory).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPromptAnalysisSchema = createInsertSchema(promptAnalysis).omit({ id: true, createdAt: true });
export const insertMayaChatSchema = createInsertSchema(mayaChats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMayaChatMessageSchema = createInsertSchema(mayaChatMessages).omit({ id: true, createdAt: true });
export const insertGenerationTrackerSchema = createInsertSchema(generationTrackers).omit({ id: true, createdAt: true });
export const insertTrainingRunSchema = createInsertSchema(trainingRuns).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLoraWeightSchema = createInsertSchema(loraWeights).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAgentConversationSchema = createInsertSchema(agentConversations).omit({ id: true, timestamp: true });
export const insertWebsiteSchema = createInsertSchema(websites).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClaudeConversationSchema = createInsertSchema(claudeConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertClaudeMessageSchema = createInsertSchema(claudeMessages).omit({ id: true, createdAt: true, timestamp: true });
export const insertAgentLearningSchema = createInsertSchema(agentLearning).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAgentCapabilitySchema = createInsertSchema(agentCapabilities).omit({ id: true, createdAt: true, updatedAt: true });
export const emailCaptures = pgTable('email_captures', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    plan: varchar('plan', { length: 50 }).notNull().default('free'),
    source: varchar('source', { length: 100 }).notNull().default('landing_page'),
    captured: timestamp('captured').defaultNow(),
    converted: boolean('converted').default(false),
    userId: varchar('user_id').references(() => users.id),
});
export const domains = pgTable("domains", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    domain: varchar("domain").notNull().unique(),
    subdomain: varchar("subdomain").unique(),
    isVerified: boolean("is_verified").default(false),
    dnsRecords: jsonb("dns_records"),
    sslStatus: varchar("ssl_status").default("pending"),
    connectedTo: varchar("connected_to"),
    resourceId: integer("resource_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const userWebsiteOnboarding = pgTable('user_website_onboarding', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    personalBrandName: varchar('personal_brand_name'),
    story: text('story'),
    businessType: varchar('business_type'),
    colorPreferences: jsonb('color_preferences').default({}),
    targetAudience: text('target_audience'),
    brandKeywords: jsonb('brand_keywords').default([]),
    goals: text('goals'),
    currentStep: varchar('current_step').default('story'),
    isCompleted: boolean('is_completed').default(false),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
export const userGeneratedWebsites = pgTable('user_generated_websites', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    onboardingId: integer('onboarding_id').references(() => userWebsiteOnboarding.id, { onDelete: 'cascade' }),
    title: varchar('title').notNull(),
    subdomain: varchar('subdomain', { length: 63 }).unique(),
    htmlContent: text('html_content').notNull(),
    cssContent: text('css_content').notNull(),
    jsContent: text('js_content').default(''),
    metadata: jsonb('metadata').default({}),
    isPublished: boolean('is_published').default(false),
    status: varchar('status').default('draft'),
    templateUsed: varchar('template_used'),
    customizations: jsonb('customizations').default({}),
    analytics: jsonb('analytics').default({}),
    seoScore: integer('seo_score').default(0),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    publishedAt: timestamp('published_at'),
});
export const websiteBuilderConversations = pgTable('website_builder_conversations', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    websiteId: integer('website_id').references(() => userGeneratedWebsites.id, { onDelete: 'cascade' }),
    onboardingId: integer('onboarding_id').references(() => userWebsiteOnboarding.id, { onDelete: 'cascade' }),
    messages: jsonb('messages').notNull().default([]),
    context: jsonb('context').default({}),
    lastActivity: timestamp('last_activity').defaultNow(),
    isActive: boolean('is_active').default(true),
    conversationType: varchar('conversation_type').default('onboarding'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});
export const insertUserWebsiteOnboardingSchema = z.object({
    userId: z.string(),
    personalBrandName: z.string().optional(),
    story: z.string().optional(),
    businessType: z.string().optional(),
    colorPreferences: z.record(z.any()).default({}),
    targetAudience: z.string().optional(),
    brandKeywords: z.array(z.string()).default([]),
    goals: z.string().optional(),
    currentStep: z.string().default('story'),
    isCompleted: z.boolean().default(false)
});
export const insertUserGeneratedWebsitesSchema = z.object({
    userId: z.string(),
    onboardingId: z.number().optional(),
    title: z.string(),
    subdomain: z.string().optional(),
    htmlContent: z.string(),
    cssContent: z.string(),
    jsContent: z.string().default(''),
    metadata: z.record(z.any()).default({}),
    isPublished: z.boolean().default(false),
    status: z.string().default('draft'),
    templateUsed: z.string().optional(),
    customizations: z.record(z.any()).default({}),
    analytics: z.record(z.any()).default({}),
    seoScore: z.number().default(0)
});
export const insertWebsiteBuilderConversationsSchema = z.object({
    userId: z.string(),
    websiteId: z.number().optional(),
    onboardingId: z.number().optional(),
    messages: z.array(z.any()).default([]),
    context: z.record(z.any()).default({}),
    isActive: z.boolean().default(true),
    conversationType: z.string().default('onboarding')
});
export const importedSubscribers = pgTable("imported_subscribers", {
    id: varchar("id").primaryKey().$defaultFn(() => randomUUID()),
    email: varchar("email"),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    source: varchar("source").notNull(),
    originalId: varchar("original_id").notNull(),
    status: varchar("status").notNull(),
    tags: jsonb("tags").$type().default([]),
    customFields: jsonb("custom_fields").$type().default({}),
    messengerData: jsonb("messenger_data"),
    importedAt: timestamp("imported_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
});
export const agentTasks = pgTable('agent_tasks', {
    taskId: uuid('task_id').primaryKey().defaultRandom(),
    agentName: text('agent_name').notNull(),
    instruction: text('instruction').notNull(),
    conversationContext: jsonb('conversation_context').$type(),
    priority: text('priority').$type().default('medium'),
    completionCriteria: jsonb('completion_criteria').$type(),
    qualityGates: jsonb('quality_gates').$type(),
    estimatedDuration: integer('estimated_duration').notNull(),
    status: text('status').default('received'),
    progress: integer('progress').default(0),
    implementations: jsonb('implementations'),
    rollbackPlan: jsonb('rollback_plan').$type(),
    validationResults: jsonb('validation_results'),
    createdAt: timestamp('created_at').defaultNow(),
    completedAt: timestamp('completed_at')
});
export const agentKnowledgeBase = pgTable("agent_knowledge_base", {
    id: serial("id").primaryKey(),
    agentId: varchar("agent_id").notNull(),
    topic: varchar("topic").notNull(),
    content: text("content").notNull(),
    source: varchar("source").notNull(),
    confidence: decimal("confidence").notNull(),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
    tags: text("tags").array(),
});
export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
    id: serial("id").primaryKey(),
    agentId: varchar("agent_id").notNull(),
    taskType: varchar("task_type").notNull(),
    successRate: decimal("success_rate").notNull(),
    averageTime: integer("average_time").default(0),
    userSatisfactionScore: decimal("user_satisfaction_score").default("0"),
    totalTasks: integer("total_tasks").default(0),
    improvementTrend: varchar("improvement_trend").default('stable'),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
export const agentTrainingSessions = pgTable("agent_training_sessions", {
    id: serial("id").primaryKey(),
    agentId: varchar("agent_id").notNull(),
    sessionType: varchar("session_type").notNull(),
    trainingData: jsonb("training_data").notNull(),
    improvements: text("improvements"),
    performanceGain: decimal("performance_gain"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    trainedBy: varchar("trained_by"),
});
export const agentCostTracking = pgTable("agent_cost_tracking", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    agentId: varchar("agent_id").notNull(),
    conversationId: varchar("conversation_id"),
    apiCalls: integer("api_calls").default(0),
    tokensUsed: integer("tokens_used").default(0),
    estimatedCost: decimal("estimated_cost", { precision: 10, scale: 4 }).default("0.0000"),
    date: timestamp("date").defaultNow(),
    taskType: varchar("task_type"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("idx_cost_tracking_user_agent_date").on(table.userId, table.agentId, table.date),
]);
export const agentBudgets = pgTable("agent_budgets", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    agentId: varchar("agent_id"),
    budgetType: varchar("budget_type").notNull(),
    budgetLimit: decimal("budget_limit", { precision: 10, scale: 2 }).notNull(),
    currentSpend: decimal("current_spend", { precision: 10, scale: 2 }).default("0.00"),
    isActive: boolean("is_active").default(true),
    resetDate: timestamp("reset_date"),
    alertThreshold: integer("alert_threshold").default(80),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertAgentKnowledgeBaseSchema = z.object({
    agentId: z.string(),
    topic: z.string(),
    content: z.string(),
    source: z.string(),
    confidence: z.number(),
    tags: z.array(z.string()).optional()
});
export const insertAgentPerformanceMetricsSchema = z.object({
    agentId: z.string(),
    taskType: z.string(),
    successRate: z.number(),
    averageTime: z.number().default(0),
    userSatisfactionScore: z.number().default(0),
    totalTasks: z.number().default(0),
    improvementTrend: z.string().default('stable')
});
export const insertAgentTrainingSessionsSchema = z.object({
    agentId: z.string(),
    sessionType: z.string(),
    trainingData: z.record(z.any()),
    improvements: z.string().optional(),
    performanceGain: z.number().optional(),
    trainedBy: z.string().optional()
});
export const insertAgentCostTrackingSchema = z.object({
    userId: z.string(),
    agentId: z.string(),
    conversationId: z.string().optional(),
    apiCalls: z.number().default(0),
    tokensUsed: z.number().default(0),
    estimatedCost: z.number().default(0),
    taskType: z.string().optional()
});
export const insertAgentBudgetsSchema = z.object({
    userId: z.string(),
    agentId: z.string().optional(),
    budgetType: z.string(),
    budgetLimit: z.number(),
    currentSpend: z.number().default(0),
    isActive: z.boolean().default(true),
    resetDate: z.date().optional(),
    alertThreshold: z.number().default(80)
});
export const approvalQueue = pgTable("approval_queue", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    agentId: varchar("agent_id").notNull(),
    contentType: varchar("content_type").notNull(),
    contentTitle: varchar("content_title").notNull(),
    contentPreview: text("content_preview").notNull(),
    fullContent: jsonb("full_content").notNull(),
    targetAudience: varchar("target_audience"),
    impactLevel: varchar("impact_level").default("medium"),
    estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
    status: varchar("status").default("pending"),
    adminComments: text("admin_comments"),
    originalConversationId: varchar("original_conversation_id"),
    createdAt: timestamp("created_at").defaultNow(),
    reviewedAt: timestamp("reviewed_at"),
    approvedBy: varchar("approved_by"),
}, (table) => [
    index("idx_approval_queue_status").on(table.status, table.createdAt),
    index("idx_approval_queue_user").on(table.userId, table.status),
]);
export const agentHandoffRequests = pgTable("agent_handoff_requests", {
    id: serial("id").primaryKey(),
    fromAgentId: varchar("from_agent_id").notNull(),
    toTargetType: varchar("to_target_type").notNull(),
    toTargetId: varchar("to_target_id"),
    requestType: varchar("request_type").notNull(),
    contextSummary: text("context_summary").notNull(),
    urgencyLevel: varchar("urgency_level").default("normal"),
    conversationId: varchar("conversation_id"),
    originalTask: text("original_task"),
    currentProgress: jsonb("current_progress"),
    status: varchar("status").default("pending"),
    responseRequired: boolean("response_required").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    respondedAt: timestamp("responded_at"),
});
export const agentSessions = pgTable("agent_sessions", {
    id: serial("id").primaryKey(),
    agentId: varchar("agent_id").notNull(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    conversationId: varchar("conversation_id"),
    status: varchar("status").default("active"),
    startedAt: timestamp("started_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    endedAt: timestamp("ended_at"),
});
export const insertApprovalQueueSchema = z.object({
    userId: z.string(),
    agentId: z.string(),
    contentType: z.string(),
    contentTitle: z.string(),
    contentPreview: z.string(),
    fullContent: z.record(z.any()),
    targetAudience: z.string().optional(),
    impactLevel: z.string().default("medium"),
    estimatedCost: z.number().optional(),
    status: z.string().default("pending"),
    adminComments: z.string().optional(),
    originalConversationId: z.string().optional(),
    reviewedAt: z.date().optional(),
    approvedBy: z.string().optional()
});
export const insertAgentHandoffRequestsSchema = z.object({
    fromAgentId: z.string(),
    toTargetType: z.string(),
    toTargetId: z.string().optional(),
    requestType: z.string(),
    contextSummary: z.string(),
    urgencyLevel: z.string().default("normal"),
    conversationId: z.string().optional(),
    originalTask: z.string().optional(),
    currentProgress: z.record(z.any()).optional(),
    status: z.string().default("pending"),
    responseRequired: z.boolean().default(true),
    respondedAt: z.date().optional()
});
export const insertAgentSessionsSchema = z.object({
    agentId: z.string(),
    userId: z.string(),
    conversationId: z.string().optional(),
    status: z.string().default("active"),
    endedAt: z.date().optional()
});
export const brandAssets = pgTable("brand_assets", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    kind: varchar("kind").notNull(),
    url: varchar("url").notNull(),
    filename: varchar("filename").notNull(),
    fileSize: integer("file_size"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("idx_brand_assets_user").on(table.userId),
    index("idx_brand_assets_kind").on(table.kind),
]);
export const imageVariants = pgTable("image_variants", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    originalImageId: integer("original_image_id").references(() => aiImages.id, { onDelete: "cascade" }).notNull(),
    variantUrl: varchar("variant_url").notNull(),
    variantType: varchar("variant_type").notNull(),
    brandAssetId: integer("brand_asset_id").references(() => brandAssets.id),
    placementData: jsonb("placement_data"),
    processingStatus: varchar("processing_status").default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("idx_image_variants_user").on(table.userId),
    index("idx_image_variants_original").on(table.originalImageId),
    index("idx_image_variants_asset").on(table.brandAssetId),
]);
export { userStyleguides, styleguideTemplates } from "./styleguide-schema.js";
export const architectureAuditLog = pgTable("architecture_audit_log", {
    id: serial("id").primaryKey(),
    auditDate: timestamp("audit_date").defaultNow(),
    totalUsers: integer("total_users"),
    compliantUsers: integer("compliant_users"),
    violationsFound: text("violations_found").array(),
    violationsFixed: text("violations_fixed").array(),
    auditStatus: varchar("audit_status"),
});
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
export const modelRecoveryLog = pgTable("model_recovery_log", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    oldModelId: varchar("old_model_id"),
    newModelId: varchar("new_model_id"),
    recoveryStatus: varchar("recovery_status"),
    createdAt: timestamp("created_at").defaultNow(),
});
export const sandraConversations = pgTable("sandra_conversations", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    message: text("message").notNull(),
    response: text("response").notNull(),
    userStylePreferences: jsonb("user_style_preferences"),
    suggestedPrompt: text("suggested_prompt"),
    createdAt: timestamp("created_at").defaultNow(),
});
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
export const userStyleEvolution = pgTable("user_style_evolution", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    learningProgress: jsonb("learning_progress").default('{}'),
    styleEvolutionPath: jsonb("style_evolution_path").default('[]'),
    feedbackPatterns: jsonb("feedback_patterns").default('{}'),
    contextualPreferences: jsonb("contextual_preferences").default('{}'),
    trendAdaptation: jsonb("trend_adaptation").default('{}'),
    culturalContext: jsonb("cultural_context").default('{}'),
    sustainabilityPreferences: jsonb("sustainability_preferences").default('{}'),
    lastAdaptation: timestamp("last_adaptation").defaultNow(),
    createdAt: timestamp("created_at").defaultNow()
});
export const mayaContextSessions = pgTable("maya_context_sessions", {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").references(() => users.id).notNull(),
    sessionId: varchar("session_id").notNull(),
    currentMood: varchar("current_mood"),
    stylingGoals: jsonb("styling_goals").default('[]'),
    contextualCues: jsonb("contextual_cues").default('{}'),
    adaptationTriggers: jsonb("adaptation_triggers").default('[]'),
    sessionStarted: timestamp("session_started").defaultNow(),
    lastInteraction: timestamp("last_interaction").defaultNow()
});
export const conversations = pgTable("conversations", {
    id: varchar("id").primaryKey().$defaultFn(() => ulid()),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    agentName: varchar("agent_name").notNull().default("maya"),
    title: varchar("title"),
    status: varchar("status").default("active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_conversations_user_agent").on(table.userId, table.agentName),
    index("idx_conversations_updated").on(table.updatedAt),
]);
export const messages = pgTable("messages", {
    id: varchar("id").primaryKey().$defaultFn(() => ulid()),
    conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull(),
    role: varchar("role").notNull(),
    content: text("content").notNull(),
    meta: jsonb("meta"),
    tokenCount: integer("token_count").default(0),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
    index("idx_messages_conversation_time").on(table.conversationId, table.createdAt),
    index("idx_messages_role").on(table.role),
]);
export const conversationSummaries = pgTable("conversation_summaries", {
    id: varchar("id").primaryKey().$defaultFn(() => ulid()),
    conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "cascade" }).notNull().unique(),
    summary: text("summary").notNull(),
    lastMessageId: varchar("last_message_id").references(() => messages.id),
    messageCount: integer("message_count").default(0),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_summaries_updated").on(table.updatedAt),
]);
export const conceptCards = pgTable("concept_cards", {
    id: varchar("id").primaryKey().$defaultFn(() => ulid()),
    userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    conversationId: varchar("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),
    clientId: varchar("client_id"),
    title: varchar("title").notNull(),
    description: text("description"),
    images: jsonb("images").default('[]'),
    tags: text("tags").array().default([]),
    status: varchar("status").default("draft"),
    sortOrder: integer("sort_order").default(0),
    generatedImages: jsonb("generated_images"),
    isLoading: boolean("is_loading").default(false),
    isGenerating: boolean("is_generating").default(false),
    hasGenerated: boolean("has_generated").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
    index("idx_concept_cards_user").on(table.userId),
    index("idx_concept_cards_conversation").on(table.conversationId),
    index("idx_concept_cards_client_id").on(table.userId, table.clientId),
    index("idx_concept_cards_sort").on(table.sortOrder),
]);
export const insertArchitectureAuditLogSchema = z.object({
    totalUsers: z.number().optional(),
    compliantUsers: z.number().optional(),
    violationsFound: z.array(z.string()).optional(),
    violationsFixed: z.array(z.string()).optional(),
    auditStatus: z.string().optional()
});
export const insertBrandbookSchema = z.object({
    userId: z.string(),
    businessName: z.string(),
    tagline: z.string().optional(),
    story: z.string().optional(),
    primaryFont: z.string().default("Times New Roman"),
    secondaryFont: z.string().default("Inter"),
    primaryColor: z.string().default("#0a0a0a"),
    secondaryColor: z.string().default("#ffffff"),
    accentColor: z.string().default("#f5f5f5"),
    logoType: z.string(),
    logoUrl: z.string().optional(),
    logoPrompt: z.string().optional(),
    moodboardStyle: z.string(),
    voiceTone: z.string().optional(),
    voicePersonality: z.string().optional(),
    keyPhrases: z.string().optional(),
    isPublished: z.boolean().default(false),
    brandbookUrl: z.string().optional(),
    templateType: z.string().default("minimal-executive"),
    customDomain: z.string().optional(),
    isLive: z.boolean().default(false)
});
export const insertDashboardSchema = z.object({
    userId: z.string(),
    config: z.record(z.any()),
    onboardingData: z.record(z.any()).optional(),
    templateType: z.string(),
    quickLinks: z.record(z.any()).optional(),
    customUrl: z.string().optional(),
    isPublished: z.boolean().default(false),
    backgroundColor: z.string().default("#ffffff"),
    accentColor: z.string().default("#0a0a0a"),
    isLive: z.boolean().default(false)
});
export const insertInspirationPhotoSchema = z.object({
    userId: z.string(),
    imageUrl: z.string(),
    description: z.string().optional(),
    tags: z.record(z.any()).optional(),
    source: z.string().default("upload"),
    isActive: z.boolean().default(true)
});
export const insertModelRecoveryLogSchema = z.object({
    userId: z.string(),
    oldModelId: z.string().optional(),
    newModelId: z.string().optional(),
    recoveryStatus: z.string().optional()
});
export const insertSandraConversationSchema = z.object({
    userId: z.string(),
    message: z.string(),
    response: z.string(),
    userStylePreferences: z.record(z.any()).optional(),
    suggestedPrompt: z.string().optional()
});
export const insertSavedPromptSchema = z.object({
    userId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    prompt: z.string(),
    camera: z.string().optional(),
    texture: z.string().optional(),
    collection: z.string().optional()
});
export const insertUserStyleEvolutionSchema = z.object({
    userId: z.string(),
    learningProgress: z.record(z.any()).default({}),
    styleEvolutionPath: z.array(z.any()).default([]),
    feedbackPatterns: z.record(z.any()).default({}),
    contextualPreferences: z.record(z.any()).default({}),
    trendAdaptation: z.record(z.any()).default({}),
    culturalContext: z.record(z.any()).default({}),
    sustainabilityPreferences: z.record(z.any()).default({})
});
export const insertMayaContextSessionSchema = z.object({
    userId: z.string(),
    sessionId: z.string(),
    currentMood: z.string().optional(),
    stylingGoals: z.array(z.any()).default([]),
    contextualCues: z.record(z.any()).default({}),
    adaptationTriggers: z.array(z.any()).default([])
});
export const insertConversationSchema = z.object({
    userId: z.string(),
    agentName: z.string().default("maya"),
    title: z.string().optional(),
    status: z.string().default("active")
});
export const insertMessageSchema = z.object({
    conversationId: z.string(),
    role: z.string(),
    content: z.string(),
    meta: z.record(z.any()).optional(),
    tokenCount: z.number().default(0)
});
export const insertConversationSummarySchema = z.object({
    conversationId: z.string(),
    summary: z.string(),
    lastMessageId: z.string().optional(),
    messageCount: z.number().default(0)
});
export const insertConceptCardSchema = z.object({
    userId: z.string(),
    conversationId: z.string().optional(),
    clientId: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    images: z.array(z.any()).default([]),
    tags: z.array(z.string()).default([]),
    status: z.string().default("draft"),
    sortOrder: z.number().default(0),
    generatedImages: z.record(z.any()).optional(),
    isLoading: z.boolean().default(false),
    isGenerating: z.boolean().default(false),
    hasGenerated: z.boolean().default(false)
});
export const insertBrandAssetSchema = z.object({
    userId: z.string(),
    kind: z.enum(['logo', 'product']),
    url: z.string(),
    filename: z.string(),
    fileSize: z.number().optional(),
    meta: z.record(z.any()).optional()
});
export const insertImageVariantSchema = z.object({
    userId: z.string(),
    originalImageId: z.number(),
    variantUrl: z.string(),
    variantType: z.string(),
    brandAssetId: z.number().optional(),
    placementData: z.record(z.any()).optional(),
    processingStatus: z.string().default("pending")
});
//# sourceMappingURL=schema.js.map