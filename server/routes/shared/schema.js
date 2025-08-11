"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertClaudeMessageSchema = exports.insertClaudeConversationSchema = exports.insertWebsiteSchema = exports.insertAgentConversationSchema = exports.insertGenerationTrackerSchema = exports.insertMayaChatMessageSchema = exports.insertMayaChatSchema = exports.insertUserLandingPageSchema = exports.insertBrandOnboardingSchema = exports.insertLandingPageSchema = exports.insertPhotoSelectionSchema = exports.insertVictoriaChatSchema = exports.insertGeneratedImageSchema = exports.insertUserModelSchema = exports.insertSelfieUploadSchema = exports.insertOnboardingDataSchema = exports.insertSubscriptionSchema = exports.insertTemplateSchema = exports.insertAiImageSchema = exports.insertProjectSchema = exports.insertUserProfileSchema = exports.upsertUserSchema = exports.mayaChatMessages = exports.mayaChats = exports.userLandingPages = exports.brandOnboarding = exports.landingPages = exports.photoSelections = exports.victoriaChats = exports.generatedImages = exports.userModels = exports.selfieUploads = exports.onboardingData = exports.usageHistory = exports.userUsage = exports.subscriptions = exports.agentConversations = exports.agentCapabilities = exports.agentLearning = exports.claudeMessages = exports.claudeConversations = exports.templates = exports.aiImages = exports.generationTrackers = exports.projects = exports.userProfiles = exports.websites = exports.users = exports.agentSessionContexts = exports.sessions = void 0;
exports.insertSavedPromptSchema = exports.insertSandraConversationSchema = exports.insertModelRecoveryLogSchema = exports.insertInspirationPhotoSchema = exports.insertDashboardSchema = exports.insertBrandbookSchema = exports.insertArchitectureAuditLogSchema = exports.savedPrompts = exports.sandraConversations = exports.modelRecoveryLog = exports.inspirationPhotos = exports.dashboards = exports.brandbooks = exports.architectureAuditLog = exports.styleguideTemplates = exports.userStyleguides = exports.insertAgentTrainingSessionsSchema = exports.insertAgentPerformanceMetricsSchema = exports.insertAgentKnowledgeBaseSchema = exports.insertAgentKnowledgeBaseSchemaOnly = exports.agentTrainingSessions = exports.agentPerformanceMetrics = exports.agentKnowledgeBase = exports.agentTasks = exports.importedSubscribers = exports.insertWebsiteBuilderConversationsSchema = exports.insertUserGeneratedWebsitesSchema = exports.insertUserWebsiteOnboardingSchema = exports.websiteBuilderConversations = exports.userGeneratedWebsites = exports.userWebsiteOnboarding = exports.domains = exports.emailCaptures = exports.insertAgentCapabilitySchema = exports.insertAgentLearningSchema = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
// Session storage table for Replit OAuth
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
}, (table) => [(0, pg_core_1.index)("IDX_session_expire").on(table.expire)]);
// Agent session contexts for persistent memory between user sessions
exports.agentSessionContexts = (0, pg_core_1.pgTable)("agent_session_contexts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    sessionId: (0, pg_core_1.varchar)("session_id").notNull(),
    contextData: (0, pg_core_1.jsonb)("context_data").notNull(), // Conversation history, memory, state
    workflowState: (0, pg_core_1.varchar)("workflow_state").default("ready"), // ready, active, paused, completed
    lastInteraction: (0, pg_core_1.timestamp)("last_interaction").defaultNow(),
    memorySnapshot: (0, pg_core_1.jsonb)("memory_snapshot"), // Consolidated memory for quick restoration
    adminBypass: (0, pg_core_1.boolean)("admin_bypass").default(false), // Admin bypass for enhanced context access
    unlimitedContext: (0, pg_core_1.boolean)("unlimited_context").default(false), // Unlimited memory access for admin agents
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
}, (table) => [
    (0, pg_core_1.index)("idx_agent_session_user").on(table.userId, table.agentId),
    (0, pg_core_1.index)("idx_agent_session_updated").on(table.updatedAt),
]);
// User storage table for Replit OAuth
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.varchar)("id").primaryKey().notNull(),
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    stripeCustomerId: (0, pg_core_1.varchar)("stripe_customer_id"),
    stripeSubscriptionId: (0, pg_core_1.varchar)("stripe_subscription_id"),
    plan: (0, pg_core_1.varchar)("plan").default("free"), // basic, full-access (no more images-only)
    role: (0, pg_core_1.varchar)("role").default("user"), // user, admin, founder
    monthlyGenerationLimit: (0, pg_core_1.integer)("monthly_generation_limit").default(5), // 30 for basic, 100 for full-access, unlimited (-1) for admin
    generationsUsedThisMonth: (0, pg_core_1.integer)("generations_used_this_month").default(0),
    mayaAiAccess: (0, pg_core_1.boolean)("maya_ai_access").default(true), // Available on both tiers
    victoriaAiAccess: (0, pg_core_1.boolean)("victoria_ai_access").default(false), // Only for full-access tier
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Website schema for Victoria website builder
exports.websites = (0, pg_core_1.pgTable)("websites", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    title: (0, pg_core_1.varchar)("title").notNull(),
    slug: (0, pg_core_1.varchar)("slug").notNull().unique(), // URL slug for preview
    url: (0, pg_core_1.varchar)("url"), // Generated URL
    status: (0, pg_core_1.varchar)("status").notNull().default("draft"), // draft, published, archived
    content: (0, pg_core_1.jsonb)("content").notNull(), // Website content data
    templateId: (0, pg_core_1.varchar)("template_id").default("victoria-editorial"),
    screenshotUrl: (0, pg_core_1.varchar)("screenshot_url"), // Screenshot for preview
    isPublished: (0, pg_core_1.boolean)("is_published").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User profile table for additional profile information
exports.userProfiles = (0, pg_core_1.pgTable)("user_profiles", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    fullName: (0, pg_core_1.varchar)("full_name"),
    phone: (0, pg_core_1.varchar)("phone"),
    location: (0, pg_core_1.varchar)("location"),
    instagramHandle: (0, pg_core_1.varchar)("instagram_handle"),
    websiteUrl: (0, pg_core_1.varchar)("website_url"),
    bio: (0, pg_core_1.text)("bio"),
    brandVibe: (0, pg_core_1.text)("brand_vibe"),
    goals: (0, pg_core_1.text)("goals"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User projects/brands table
exports.projects = (0, pg_core_1.pgTable)("projects", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    status: (0, pg_core_1.varchar)("status").default("draft"), // draft, published, archived
    templateId: (0, pg_core_1.varchar)("template_id"),
    customDomain: (0, pg_core_1.varchar)("custom_domain"),
    aiImagesGenerated: (0, pg_core_1.boolean)("ai_images_generated").default(false),
    contentGenerated: (0, pg_core_1.boolean)("content_generated").default(false),
    paymentSetup: (0, pg_core_1.boolean)("payment_setup").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Generation tracking table - for temp preview ONLY (not gallery)
exports.generationTrackers = (0, pg_core_1.pgTable)("generation_trackers", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    predictionId: (0, pg_core_1.varchar)("prediction_id"),
    prompt: (0, pg_core_1.text)("prompt"),
    style: (0, pg_core_1.varchar)("style"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, processing, completed, failed, canceled, timeout
    imageUrls: (0, pg_core_1.text)("image_urls"), // JSON array of temp URLs for preview only
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// AI generated images table - GALLERY ONLY (permanent S3 URLs)
exports.aiImages = (0, pg_core_1.pgTable)("ai_images", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    imageUrl: (0, pg_core_1.varchar)("image_url").notNull(),
    prompt: (0, pg_core_1.text)("prompt"),
    style: (0, pg_core_1.varchar)("style"), // editorial, business, lifestyle, luxury
    predictionId: (0, pg_core_1.varchar)("prediction_id"), // FLUX model prediction tracking
    generationStatus: (0, pg_core_1.varchar)("generation_status").default("pending"), // pending, processing, completed, failed
    isSelected: (0, pg_core_1.boolean)("is_selected").default(false),
    isFavorite: (0, pg_core_1.boolean)("is_favorite").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Templates table
exports.templates = (0, pg_core_1.pgTable)("templates", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category"), // luxury, minimal, editorial, etc.
    previewImageUrl: (0, pg_core_1.varchar)("preview_image_url"),
    templateData: (0, pg_core_1.jsonb)("template_data"), // JSON structure of the template
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Claude API agent memory and learning tables
exports.claudeConversations = (0, pg_core_1.pgTable)("claude_conversations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    agentName: (0, pg_core_1.varchar)("agent_name").notNull(), // elena, aria, maya, etc
    conversationId: (0, pg_core_1.varchar)("conversation_id").notNull().unique(), // unique session identifier
    title: (0, pg_core_1.varchar)("title"),
    status: (0, pg_core_1.varchar)("status").default("active"), // active, archived
    lastMessageAt: (0, pg_core_1.timestamp)("last_message_at").defaultNow(),
    messageCount: (0, pg_core_1.integer)("message_count").default(0),
    context: (0, pg_core_1.jsonb)("context"), // conversation context and preferences
    adminBypassEnabled: (0, pg_core_1.boolean)("admin_bypass_enabled").default(false), // Admin token bypass for native tools
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Claude API messages table for detailed conversation history
exports.claudeMessages = (0, pg_core_1.pgTable)("claude_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    conversationId: (0, pg_core_1.varchar)("conversation_id").references(() => exports.claudeConversations.conversationId, { onDelete: "cascade" }).notNull(),
    role: (0, pg_core_1.varchar)("role").notNull(), // user, assistant, system
    content: (0, pg_core_1.text)("content").notNull(),
    metadata: (0, pg_core_1.jsonb)("metadata"), // tool calls, attachments, etc
    toolCalls: (0, pg_core_1.jsonb)("tool_calls"), // Claude tool execution data
    toolResults: (0, pg_core_1.jsonb)("tool_results"), // Tool execution results
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Agent learning data table for continuous improvement
exports.agentLearning = (0, pg_core_1.pgTable)("agent_learning", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    agentName: (0, pg_core_1.varchar)("agent_name").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }),
    learningType: (0, pg_core_1.varchar)("learning_type").notNull(), // preference, pattern, skill, context
    category: (0, pg_core_1.varchar)("category"), // design, technical, communication, etc
    data: (0, pg_core_1.jsonb)("data").notNull(), // learning content
    confidence: (0, pg_core_1.decimal)("confidence", { precision: 3, scale: 2 }).default("0.5"), // 0.0 to 1.0
    frequency: (0, pg_core_1.integer)("frequency").default(1), // how often this pattern occurs
    lastSeen: (0, pg_core_1.timestamp)("last_seen").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Agent capabilities and tools table
exports.agentCapabilities = (0, pg_core_1.pgTable)("agent_capabilities", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    agentName: (0, pg_core_1.varchar)("agent_name").notNull(),
    capabilityType: (0, pg_core_1.varchar)("capability_type").notNull(), // tool, knowledge, skill
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    enabled: (0, pg_core_1.boolean)("enabled").default(true),
    config: (0, pg_core_1.jsonb)("config"), // capability configuration
    version: (0, pg_core_1.varchar)("version").default("1.0"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Agent conversations table for chat persistence with threading support
exports.agentConversations = (0, pg_core_1.pgTable)("agent_conversations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    userMessage: (0, pg_core_1.text)("user_message").notNull(),
    agentResponse: (0, pg_core_1.text)("agent_response").notNull(),
    devPreview: (0, pg_core_1.jsonb)("dev_preview"),
    timestamp: (0, pg_core_1.timestamp)("timestamp").defaultNow(),
    // Enhanced conversation threading and management fields
    conversationTitle: (0, pg_core_1.varchar)("conversation_title"),
    conversationData: (0, pg_core_1.jsonb)("conversation_data"), // Store full conversation history
    messageCount: (0, pg_core_1.integer)("message_count").default(0),
    lastAgentResponse: (0, pg_core_1.text)("last_agent_response"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    isStarred: (0, pg_core_1.boolean)("is_starred").default(false),
    isArchived: (0, pg_core_1.boolean)("is_archived").default(false),
    tags: (0, pg_core_1.jsonb)("tags").default('[]'), // Array of string tags
    // Threading support
    parentThreadId: (0, pg_core_1.integer)("parent_thread_id"),
    branchedFromMessageId: (0, pg_core_1.varchar)("branched_from_message_id"),
    // Enhanced timestamps
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User subscriptions table
exports.subscriptions = (0, pg_core_1.pgTable)("subscriptions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    plan: (0, pg_core_1.varchar)("plan").notNull(), // "free" or "sselfie-studio"
    status: (0, pg_core_1.varchar)("status").notNull(), // active, cancelled, expired
    stripeSubscriptionId: (0, pg_core_1.varchar)("stripe_subscription_id"),
    currentPeriodStart: (0, pg_core_1.timestamp)("current_period_start"),
    currentPeriodEnd: (0, pg_core_1.timestamp)("current_period_end"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User usage tracking table
exports.userUsage = (0, pg_core_1.pgTable)("user_usage", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    plan: (0, pg_core_1.varchar)("plan").notNull(), // "free" or "sselfie-studio"
    // AI Generation limits and usage
    monthlyGenerationsAllowed: (0, pg_core_1.integer)("monthly_generations_allowed").notNull(), // 5 for free, 100 for paid
    monthlyGenerationsUsed: (0, pg_core_1.integer)("monthly_generations_used").default(0),
    // Access controls removed - handled by plan type instead
    // Cost tracking
    totalCostIncurred: (0, pg_core_1.decimal)("total_cost_incurred", { precision: 10, scale: 4 }).default("0.0000"), // Track actual API costs
    // Period tracking for monthly limits
    currentPeriodStart: (0, pg_core_1.timestamp)("current_period_start"),
    currentPeriodEnd: (0, pg_core_1.timestamp)("current_period_end"),
    // Status tracking
    isLimitReached: (0, pg_core_1.boolean)("is_limit_reached").default(false),
    lastGenerationAt: (0, pg_core_1.timestamp)("last_generation_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Usage history for detailed tracking
exports.usageHistory = (0, pg_core_1.pgTable)("usage_history", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    actionType: (0, pg_core_1.varchar)("action_type").notNull(), // 'generation', 'api_call', 'sandra_chat'
    resourceUsed: (0, pg_core_1.varchar)("resource_used").notNull(), // 'replicate_ai', 'claude_api', 'openai_api'
    cost: (0, pg_core_1.decimal)("cost", { precision: 6, scale: 4 }).notNull(), // Actual cost in USD
    details: (0, pg_core_1.jsonb)("details"), // Store generation params, prompts, etc.
    generatedImageId: (0, pg_core_1.integer)("generated_image_id").references(() => exports.generatedImages.id),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Onboarding data table - simplified for streamlined vision
exports.onboardingData = (0, pg_core_1.pgTable)("onboarding_data", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    // Step 1: Brand Story
    brandStory: (0, pg_core_1.text)("brand_story"),
    personalMission: (0, pg_core_1.text)("personal_mission"),
    // Step 2: Business Goals
    businessGoals: (0, pg_core_1.text)("business_goals"),
    targetAudience: (0, pg_core_1.text)("target_audience"),
    businessType: (0, pg_core_1.varchar)("business_type"),
    // Step 3: Voice & Style
    brandVoice: (0, pg_core_1.text)("brand_voice"),
    stylePreferences: (0, pg_core_1.varchar)("style_preferences"),
    // Step 4: AI Training
    selfieUploadStatus: (0, pg_core_1.varchar)("selfie_upload_status").default("pending"), // pending, processing, completed
    aiTrainingStatus: (0, pg_core_1.varchar)("ai_training_status").default("not_started"), // not_started, in_progress, completed
    // Progress tracking
    currentStep: (0, pg_core_1.integer)("current_step").default(1),
    completed: (0, pg_core_1.boolean)("completed").default(false),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Selfie uploads table
exports.selfieUploads = (0, pg_core_1.pgTable)("selfie_uploads", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    filename: (0, pg_core_1.varchar)("filename").notNull(),
    originalUrl: (0, pg_core_1.varchar)("original_url").notNull(),
    processedUrl: (0, pg_core_1.varchar)("processed_url"),
    processingStatus: (0, pg_core_1.varchar)("processing_status").default("pending"), // pending, processing, completed, failed
    aiModelOutput: (0, pg_core_1.jsonb)("ai_model_output"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// User AI Models table for individual trained models - Enhanced for FLUX Pro
exports.userModels = (0, pg_core_1.pgTable)("user_models", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull().unique(), // One model per user
    replicateModelId: (0, pg_core_1.varchar)("replicate_model_id"),
    replicateVersionId: (0, pg_core_1.varchar)("replicate_version_id"), // The actual trained model version to use
    trainedModelPath: (0, pg_core_1.varchar)("trained_model_path"), // sandrasocial/{modelName}
    triggerWord: (0, pg_core_1.varchar)("trigger_word").notNull().unique(),
    trainingStatus: (0, pg_core_1.varchar)("training_status").default('pending'), // pending, training, completed, failed, luxury_training, luxury_completed
    modelName: (0, pg_core_1.varchar)("model_name"),
    // FLUX Pro luxury fields for premium users
    isLuxury: (0, pg_core_1.boolean)("is_luxury").default(false), // Premium FLUX Pro model
    finetuneId: (0, pg_core_1.varchar)("finetune_id"), // FLUX Pro finetune ID for ultra-realistic generation
    modelType: (0, pg_core_1.varchar)("model_type").default('flux-dev'), // flux-dev or flux-pro
    trainingProgress: (0, pg_core_1.integer)("training_progress").default(0), // 0-100%
    estimatedCompletionTime: (0, pg_core_1.timestamp)("estimated_completion_time"),
    failureReason: (0, pg_core_1.text)("failure_reason"),
    startedAt: (0, pg_core_1.timestamp)("started_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at")
});
// Image categories and generation tracking
exports.generatedImages = (0, pg_core_1.pgTable)("generated_images", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    modelId: (0, pg_core_1.integer)("model_id").references(() => exports.userModels.id),
    category: (0, pg_core_1.varchar)("category").notNull(), // Lifestyle, Editorial, Portrait, etc.
    subcategory: (0, pg_core_1.varchar)("subcategory").notNull(), // Working, Travel, etc.
    prompt: (0, pg_core_1.text)("prompt").notNull(),
    imageUrls: (0, pg_core_1.text)("image_urls").notNull(), // JSON array of 4 URLs
    selectedUrl: (0, pg_core_1.text)("selected_url"), // User's choice
    saved: (0, pg_core_1.boolean)("saved").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// Victoria AI chat conversations
exports.victoriaChats = (0, pg_core_1.pgTable)("victoria_chats", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    sessionId: (0, pg_core_1.varchar)("session_id").notNull(), // Group related messages
    message: (0, pg_core_1.text)("message").notNull(),
    sender: (0, pg_core_1.varchar)("sender").notNull(), // 'user' or 'victoria'
    messageType: (0, pg_core_1.varchar)("message_type").default("text"), // text, template_suggestion, photo_selection
    metadata: (0, pg_core_1.jsonb)("metadata"), // Store template data, photo selections, etc.
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Photo selections for landing page builder
exports.photoSelections = (0, pg_core_1.pgTable)("photo_selections", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    selectedSelfieIds: (0, pg_core_1.jsonb)("selected_selfie_ids").notNull(), // Array of AI image IDs
    selectedFlatlayCollection: (0, pg_core_1.varchar)("selected_flatlay_collection").notNull(), // Collection name
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Landing page templates and user customizations
exports.landingPages = (0, pg_core_1.pgTable)("landing_pages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    templateName: (0, pg_core_1.varchar)("template_name").notNull(),
    customizations: (0, pg_core_1.jsonb)("customizations"), // Colors, fonts, layout changes
    content: (0, pg_core_1.jsonb)("content"), // Text content, headlines, descriptions
    photoSelections: (0, pg_core_1.jsonb)("photo_selections"), // Selected photos for each section
    isPublished: (0, pg_core_1.boolean)("is_published").default(false),
    publishedUrl: (0, pg_core_1.varchar)("published_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Brand onboarding data for template auto-population
exports.brandOnboarding = (0, pg_core_1.pgTable)("brand_onboarding", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull().unique(), // One per user
    // Personal Brand Story
    businessName: (0, pg_core_1.varchar)("business_name").notNull(),
    tagline: (0, pg_core_1.text)("tagline").notNull(),
    personalStory: (0, pg_core_1.text)("personal_story").notNull(),
    whyStarted: (0, pg_core_1.text)("why_started"),
    // Target Client & Positioning
    targetClient: (0, pg_core_1.text)("target_client").notNull(),
    problemYouSolve: (0, pg_core_1.text)("problem_you_solve").notNull(),
    uniqueApproach: (0, pg_core_1.text)("unique_approach").notNull(),
    // Offers & Services
    primaryOffer: (0, pg_core_1.varchar)("primary_offer").notNull(),
    primaryOfferPrice: (0, pg_core_1.varchar)("primary_offer_price").notNull(),
    secondaryOffer: (0, pg_core_1.varchar)("secondary_offer"),
    secondaryOfferPrice: (0, pg_core_1.varchar)("secondary_offer_price"),
    freeResource: (0, pg_core_1.text)("free_resource"),
    // Contact & Links
    instagramHandle: (0, pg_core_1.varchar)("instagram_handle"),
    websiteUrl: (0, pg_core_1.varchar)("website_url"),
    email: (0, pg_core_1.varchar)("email").notNull(),
    location: (0, pg_core_1.varchar)("location"),
    // Brand Personality
    brandPersonality: (0, pg_core_1.varchar)("brand_personality").notNull(),
    brandValues: (0, pg_core_1.text)("brand_values"),
    // Design Preferences (from Zara's audit)
    stylePreference: (0, pg_core_1.varchar)("style_preference").default("editorial-luxury"),
    colorScheme: (0, pg_core_1.varchar)("color_scheme").default("black-white-editorial"),
    typographyStyle: (0, pg_core_1.varchar)("typography_style").default("times-editorial"),
    designPersonality: (0, pg_core_1.varchar)("design_personality").default("sophisticated"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User landing pages table for live hosting
exports.userLandingPages = (0, pg_core_1.pgTable)("user_landing_pages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    slug: (0, pg_core_1.varchar)("slug").notNull().unique(), // username or custom slug
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    htmlContent: (0, pg_core_1.text)("html_content").notNull(),
    cssContent: (0, pg_core_1.text)("css_content").notNull(),
    templateUsed: (0, pg_core_1.varchar)("template_used"),
    isPublished: (0, pg_core_1.boolean)("is_published").default(false),
    customDomain: (0, pg_core_1.varchar)("custom_domain"),
    seoTitle: (0, pg_core_1.varchar)("seo_title"),
    seoDescription: (0, pg_core_1.text)("seo_description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Maya Chat History tables
exports.mayaChats = (0, pg_core_1.pgTable)("maya_chats", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    chatTitle: (0, pg_core_1.varchar)("chat_title").notNull(),
    chatSummary: (0, pg_core_1.text)("chat_summary"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.mayaChatMessages = (0, pg_core_1.pgTable)("maya_chat_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    chatId: (0, pg_core_1.integer)("chat_id").references(() => exports.mayaChats.id).notNull(),
    role: (0, pg_core_1.varchar)("role").notNull(), // 'user' or 'maya'
    content: (0, pg_core_1.text)("content").notNull(),
    imagePreview: (0, pg_core_1.text)("image_preview"), // JSON array of image URLs
    generatedPrompt: (0, pg_core_1.text)("generated_prompt"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Schema exports
exports.upsertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.insertUserProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertProjectSchema = (0, drizzle_zod_1.createInsertSchema)(exports.projects).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertAiImageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.aiImages).omit({ id: true, createdAt: true });
exports.insertTemplateSchema = (0, drizzle_zod_1.createInsertSchema)(exports.templates).omit({ id: true, createdAt: true });
exports.insertSubscriptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertOnboardingDataSchema = (0, drizzle_zod_1.createInsertSchema)(exports.onboardingData).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertSelfieUploadSchema = (0, drizzle_zod_1.createInsertSchema)(exports.selfieUploads).omit({ id: true, createdAt: true });
exports.insertUserModelSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userModels).omit({ id: true, createdAt: true });
exports.insertGeneratedImageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.generatedImages).omit({ id: true, createdAt: true });
exports.insertVictoriaChatSchema = (0, drizzle_zod_1.createInsertSchema)(exports.victoriaChats).omit({ id: true, createdAt: true });
exports.insertPhotoSelectionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.photoSelections).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertLandingPageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.landingPages).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertBrandOnboardingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.brandOnboarding).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertUserLandingPageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userLandingPages).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertMayaChatSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaChats).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertMayaChatMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaChatMessages).omit({ id: true, createdAt: true });
exports.insertGenerationTrackerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.generationTrackers).omit({ id: true, createdAt: true });
exports.insertAgentConversationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentConversations).omit({ id: true, timestamp: true });
exports.insertWebsiteSchema = (0, drizzle_zod_1.createInsertSchema)(exports.websites).omit({ id: true, createdAt: true, updatedAt: true });
// Claude API schemas
exports.insertClaudeConversationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.claudeConversations).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertClaudeMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.claudeMessages).omit({ id: true, createdAt: true, timestamp: true });
exports.insertAgentLearningSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentLearning).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertAgentCapabilitySchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentCapabilities).omit({ id: true, createdAt: true, updatedAt: true });
// Email capture table for lead generation
exports.emailCaptures = (0, pg_core_1.pgTable)('email_captures', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    plan: (0, pg_core_1.varchar)('plan', { length: 50 }).notNull().default('free'),
    source: (0, pg_core_1.varchar)('source', { length: 100 }).notNull().default('landing_page'),
    captured: (0, pg_core_1.timestamp)('captured').defaultNow(),
    converted: (0, pg_core_1.boolean)('converted').default(false),
    userId: (0, pg_core_1.varchar)('user_id').references(() => exports.users.id), // Added missing field from database
});
// Domain management table
exports.domains = (0, pg_core_1.pgTable)("domains", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    domain: (0, pg_core_1.varchar)("domain").notNull().unique(), // user's custom domain
    subdomain: (0, pg_core_1.varchar)("subdomain").unique(), // username.sselfie.com
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false),
    dnsRecords: (0, pg_core_1.jsonb)("dns_records"), // Required DNS settings
    sslStatus: (0, pg_core_1.varchar)("ssl_status").default("pending"), // pending, active, failed
    connectedTo: (0, pg_core_1.varchar)("connected_to"), // 'styleguide', 'landing-page'
    resourceId: (0, pg_core_1.integer)("resource_id"), // ID of connected resource
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// BUILD FEATURE TABLES
// User Website Onboarding - stores user preferences for website generation
exports.userWebsiteOnboarding = (0, pg_core_1.pgTable)('user_website_onboarding', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    personalBrandName: (0, pg_core_1.varchar)('personal_brand_name'), // Personal brand name
    story: (0, pg_core_1.text)('story'), // User's personal/business story
    businessType: (0, pg_core_1.varchar)('business_type'), // Type of business (coach, consultant, etc.)
    colorPreferences: (0, pg_core_1.jsonb)('color_preferences').default({}), // Color scheme preferences
    targetAudience: (0, pg_core_1.text)('target_audience'), // Who they serve
    brandKeywords: (0, pg_core_1.jsonb)('brand_keywords').default([]), // Key brand terms
    goals: (0, pg_core_1.text)('goals'), // What they want to achieve
    currentStep: (0, pg_core_1.varchar)('current_step').default('story'), // Onboarding progress
    isCompleted: (0, pg_core_1.boolean)('is_completed').default(false),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// User Generated Websites - stores the actual generated websites
exports.userGeneratedWebsites = (0, pg_core_1.pgTable)('user_generated_websites', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    onboardingId: (0, pg_core_1.integer)('onboarding_id').references(() => exports.userWebsiteOnboarding.id, { onDelete: 'cascade' }),
    title: (0, pg_core_1.varchar)('title').notNull(), // Website title
    subdomain: (0, pg_core_1.varchar)('subdomain', { length: 63 }).unique(), // Unique subdomain (max 63 chars)
    htmlContent: (0, pg_core_1.text)('html_content').notNull(), // Generated HTML
    cssContent: (0, pg_core_1.text)('css_content').notNull(), // Generated CSS
    jsContent: (0, pg_core_1.text)('js_content').default(''), // Optional JavaScript
    metadata: (0, pg_core_1.jsonb)('metadata').default({}), // SEO metadata, social tags, etc.
    isPublished: (0, pg_core_1.boolean)('is_published').default(false),
    status: (0, pg_core_1.varchar)('status').default('draft'), // draft, published, archived
    templateUsed: (0, pg_core_1.varchar)('template_used'), // Which template was used as base
    customizations: (0, pg_core_1.jsonb)('customizations').default({}), // User customizations
    analytics: (0, pg_core_1.jsonb)('analytics').default({}), // Visit stats, etc.
    seoScore: (0, pg_core_1.integer)('seo_score').default(0), // SEO optimization score
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    publishedAt: (0, pg_core_1.timestamp)('published_at'),
});
// Website Builder Conversations - stores BUILD Victoria chat conversations
exports.websiteBuilderConversations = (0, pg_core_1.pgTable)('website_builder_conversations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').references(() => exports.users.id, { onDelete: 'cascade' }).notNull(),
    websiteId: (0, pg_core_1.integer)('website_id').references(() => exports.userGeneratedWebsites.id, { onDelete: 'cascade' }),
    onboardingId: (0, pg_core_1.integer)('onboarding_id').references(() => exports.userWebsiteOnboarding.id, { onDelete: 'cascade' }),
    messages: (0, pg_core_1.jsonb)('messages').notNull().default([]), // Chat message history
    context: (0, pg_core_1.jsonb)('context').default({}), // Conversation context (current step, user preferences, etc.)
    lastActivity: (0, pg_core_1.timestamp)('last_activity').defaultNow(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    conversationType: (0, pg_core_1.varchar)('conversation_type').default('onboarding'), // onboarding, editing, support
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// BUILD feature insert schemas
exports.insertUserWebsiteOnboardingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userWebsiteOnboarding).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertUserGeneratedWebsitesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userGeneratedWebsites).omit({ id: true, createdAt: true, updatedAt: true, publishedAt: true });
exports.insertWebsiteBuilderConversationsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.websiteBuilderConversations).omit({ id: true, createdAt: true, updatedAt: true, lastActivity: true });
// Imported subscribers table for email list migration
exports.importedSubscribers = (0, pg_core_1.pgTable)("imported_subscribers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: (0, pg_core_1.varchar)("email"),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    source: (0, pg_core_1.varchar)("source").notNull(), // 'flodesk' | 'manychat'
    originalId: (0, pg_core_1.varchar)("original_id").notNull(),
    status: (0, pg_core_1.varchar)("status").notNull(), // 'active' | 'unsubscribed'
    tags: (0, pg_core_1.jsonb)("tags").$type().default([]),
    customFields: (0, pg_core_1.jsonb)("custom_fields").$type().default({}),
    messengerData: (0, pg_core_1.jsonb)("messenger_data"),
    importedAt: (0, pg_core_1.timestamp)("imported_at").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow()
});
// AGENT BRIDGE SYSTEM TABLES
// Luxury agent-to-agent communication and task execution tracking
exports.agentTasks = (0, pg_core_1.pgTable)('agent_tasks', {
    taskId: (0, pg_core_1.uuid)('task_id').primaryKey().defaultRandom(),
    agentName: (0, pg_core_1.text)('agent_name').notNull(),
    instruction: (0, pg_core_1.text)('instruction').notNull(),
    conversationContext: (0, pg_core_1.jsonb)('conversation_context').$type(),
    priority: (0, pg_core_1.text)('priority').$type().default('medium'),
    completionCriteria: (0, pg_core_1.jsonb)('completion_criteria').$type(),
    qualityGates: (0, pg_core_1.jsonb)('quality_gates').$type(),
    estimatedDuration: (0, pg_core_1.integer)('estimated_duration').notNull(), // in minutes
    status: (0, pg_core_1.text)('status').default('received'),
    progress: (0, pg_core_1.integer)('progress').default(0),
    implementations: (0, pg_core_1.jsonb)('implementations'),
    rollbackPlan: (0, pg_core_1.jsonb)('rollback_plan').$type(),
    validationResults: (0, pg_core_1.jsonb)('validation_results'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    completedAt: (0, pg_core_1.timestamp)('completed_at')
});
exports.agentKnowledgeBase = (0, pg_core_1.pgTable)("agent_knowledge_base", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    topic: (0, pg_core_1.varchar)("topic").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    source: (0, pg_core_1.varchar)("source").notNull(), // 'conversation', 'training', 'documentation', 'experience'
    confidence: (0, pg_core_1.decimal)("confidence").notNull(), // 0.0 to 1.0
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow().notNull(),
    tags: (0, pg_core_1.text)("tags").array(), // For categorization
});
exports.agentPerformanceMetrics = (0, pg_core_1.pgTable)("agent_performance_metrics", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    taskType: (0, pg_core_1.varchar)("task_type").notNull(),
    successRate: (0, pg_core_1.decimal)("success_rate").notNull(),
    averageTime: (0, pg_core_1.integer)("average_time").default(0), // in milliseconds
    userSatisfactionScore: (0, pg_core_1.decimal)("user_satisfaction_score").default("0"),
    totalTasks: (0, pg_core_1.integer)("total_tasks").default(0),
    improvementTrend: (0, pg_core_1.varchar)("improvement_trend").default('stable'), // 'improving', 'stable', 'declining'
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow().notNull(),
});
exports.agentTrainingSessions = (0, pg_core_1.pgTable)("agent_training_sessions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    sessionType: (0, pg_core_1.varchar)("session_type").notNull(), // 'manual', 'automatic', 'feedback'
    trainingData: (0, pg_core_1.jsonb)("training_data").notNull(),
    improvements: (0, pg_core_1.text)("improvements"),
    performanceGain: (0, pg_core_1.decimal)("performance_gain"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    trainedBy: (0, pg_core_1.varchar)("trained_by"), // User ID who initiated training
});
// Additional Agent Learning Schemas
exports.insertAgentKnowledgeBaseSchemaOnly = (0, drizzle_zod_1.createInsertSchema)(exports.agentKnowledgeBase);
exports.insertAgentKnowledgeBaseSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentKnowledgeBase);
exports.insertAgentPerformanceMetricsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentPerformanceMetrics);
exports.insertAgentTrainingSessionsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.agentTrainingSessions);
// Export styleguide tables and types  
var styleguide_schema_1 = require("./styleguide-schema");
Object.defineProperty(exports, "userStyleguides", { enumerable: true, get: function () { return styleguide_schema_1.userStyleguides; } });
Object.defineProperty(exports, "styleguideTemplates", { enumerable: true, get: function () { return styleguide_schema_1.styleguideTemplates; } });
// Website management schema types
// MISSING TABLE DEFINITIONS - Adding to resolve database schema mismatches
// Architecture audit tracking table
exports.architectureAuditLog = (0, pg_core_1.pgTable)("architecture_audit_log", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    auditDate: (0, pg_core_1.timestamp)("audit_date").defaultNow(),
    totalUsers: (0, pg_core_1.integer)("total_users"),
    compliantUsers: (0, pg_core_1.integer)("compliant_users"),
    violationsFound: (0, pg_core_1.text)("violations_found").array(),
    violationsFixed: (0, pg_core_1.text)("violations_fixed").array(),
    auditStatus: (0, pg_core_1.varchar)("audit_status"),
});
// Brand identity management table
exports.brandbooks = (0, pg_core_1.pgTable)("brandbooks", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    businessName: (0, pg_core_1.varchar)("business_name").notNull(),
    tagline: (0, pg_core_1.varchar)("tagline"),
    story: (0, pg_core_1.text)("story"),
    primaryFont: (0, pg_core_1.varchar)("primary_font").default("Times New Roman"),
    secondaryFont: (0, pg_core_1.varchar)("secondary_font").default("Inter"),
    primaryColor: (0, pg_core_1.varchar)("primary_color").default("#0a0a0a"),
    secondaryColor: (0, pg_core_1.varchar)("secondary_color").default("#ffffff"),
    accentColor: (0, pg_core_1.varchar)("accent_color").default("#f5f5f5"),
    logoType: (0, pg_core_1.varchar)("logo_type").notNull(),
    logoUrl: (0, pg_core_1.varchar)("logo_url"),
    logoPrompt: (0, pg_core_1.text)("logo_prompt"),
    moodboardStyle: (0, pg_core_1.varchar)("moodboard_style").notNull(),
    voiceTone: (0, pg_core_1.text)("voice_tone"),
    voicePersonality: (0, pg_core_1.text)("voice_personality"),
    keyPhrases: (0, pg_core_1.text)("key_phrases"),
    isPublished: (0, pg_core_1.boolean)("is_published").default(false),
    brandbookUrl: (0, pg_core_1.varchar)("brandbook_url"),
    templateType: (0, pg_core_1.varchar)("template_type").default("minimal-executive"),
    customDomain: (0, pg_core_1.varchar)("custom_domain"),
    isLive: (0, pg_core_1.boolean)("is_live").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User dashboard configurations table
exports.dashboards = (0, pg_core_1.pgTable)("dashboards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    config: (0, pg_core_1.jsonb)("config").notNull(),
    onboardingData: (0, pg_core_1.jsonb)("onboarding_data"),
    templateType: (0, pg_core_1.varchar)("template_type").notNull(),
    quickLinks: (0, pg_core_1.jsonb)("quick_links"),
    customUrl: (0, pg_core_1.varchar)("custom_url"),
    isPublished: (0, pg_core_1.boolean)("is_published").default(false),
    backgroundColor: (0, pg_core_1.varchar)("background_color").default("#ffffff"),
    accentColor: (0, pg_core_1.varchar)("accent_color").default("#0a0a0a"),
    isLive: (0, pg_core_1.boolean)("is_live").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User photo inspiration table
exports.inspirationPhotos = (0, pg_core_1.pgTable)("inspiration_photos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    imageUrl: (0, pg_core_1.varchar)("image_url").notNull(),
    description: (0, pg_core_1.text)("description"),
    tags: (0, pg_core_1.jsonb)("tags"),
    source: (0, pg_core_1.varchar)("source").default("upload"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// AI model recovery tracking table
exports.modelRecoveryLog = (0, pg_core_1.pgTable)("model_recovery_log", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    oldModelId: (0, pg_core_1.varchar)("old_model_id"),
    newModelId: (0, pg_core_1.varchar)("new_model_id"),
    recoveryStatus: (0, pg_core_1.varchar)("recovery_status"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Sandra admin chat history table
exports.sandraConversations = (0, pg_core_1.pgTable)("sandra_conversations", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    response: (0, pg_core_1.text)("response").notNull(),
    userStylePreferences: (0, pg_core_1.jsonb)("user_style_preferences"),
    suggestedPrompt: (0, pg_core_1.text)("suggested_prompt"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// User saved prompts table  
exports.savedPrompts = (0, pg_core_1.pgTable)("saved_prompts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    name: (0, pg_core_1.varchar)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    prompt: (0, pg_core_1.text)("prompt").notNull(),
    camera: (0, pg_core_1.varchar)("camera"),
    texture: (0, pg_core_1.varchar)("texture"),
    collection: (0, pg_core_1.varchar)("collection"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Insert schemas for missing tables
exports.insertArchitectureAuditLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.architectureAuditLog).omit({ id: true, auditDate: true });
exports.insertBrandbookSchema = (0, drizzle_zod_1.createInsertSchema)(exports.brandbooks).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertDashboardSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dashboards).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertInspirationPhotoSchema = (0, drizzle_zod_1.createInsertSchema)(exports.inspirationPhotos).omit({ id: true, createdAt: true });
exports.insertModelRecoveryLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.modelRecoveryLog).omit({ id: true, createdAt: true });
exports.insertSandraConversationSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sandraConversations).omit({ id: true, createdAt: true });
exports.insertSavedPromptSchema = (0, drizzle_zod_1.createInsertSchema)(exports.savedPrompts).omit({ id: true, createdAt: true });
// Note: Website type already defined above at line 502
// Note: styleguide_templates and user_styleguides are imported from styleguide-schema.ts
// Note: agentTasks, emailCaptures, and userWebsiteOnboarding are already defined earlier in this file
