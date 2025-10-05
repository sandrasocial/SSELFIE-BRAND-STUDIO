"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertSubscriptionSchema = exports.insertTemplateSchema = exports.insertAiImageSchema = exports.insertProjectSchema = exports.insertHairLeadSchema = exports.insertUserProfileSchema = exports.insertUserSchema = exports.upsertUserSchema = exports.liveEvents = exports.liveSessions = exports.loraWeights = exports.trainingRuns = exports.mayaChatMessages = exports.mayaChats = exports.promptAnalysis = exports.userStyleMemory = exports.mayaPersonalMemory = exports.userPersonalBrand = exports.userLandingPages = exports.brandOnboarding = exports.landingPages = exports.photoSelections = exports.victoriaChats = exports.videoStoryboards = exports.generatedVideos = exports.generatedImages = exports.userModels = exports.selfieUploads = exports.onboardingData = exports.usageHistory = exports.userUsage = exports.subscriptions = exports.agentConversations = exports.agentCapabilities = exports.agentLearning = exports.claudeMessages = exports.claudeConversations = exports.templates = exports.aiImages = exports.generationTrackers = exports.projects = exports.hairLeads = exports.userProfiles = exports.websites = exports.instagramMessages = exports.processedEmails = exports.emailAccounts = exports.users = exports.agentSessionContexts = exports.sessions = void 0;
exports.insertApprovalQueueSchema = exports.agentSessions = exports.agentHandoffRequests = exports.approvalQueue = exports.insertAgentBudgetsSchema = exports.insertAgentCostTrackingSchema = exports.insertAgentTrainingSessionsSchema = exports.insertAgentPerformanceMetricsSchema = exports.insertAgentKnowledgeBaseSchema = exports.agentBudgets = exports.agentCostTracking = exports.agentTrainingSessions = exports.agentPerformanceMetrics = exports.agentKnowledgeBase = exports.agentTasks = exports.importedSubscribers = exports.insertWebsiteBuilderConversationsSchema = exports.insertUserGeneratedWebsitesSchema = exports.insertUserWebsiteOnboardingSchema = exports.websiteBuilderConversations = exports.userGeneratedWebsites = exports.userWebsiteOnboarding = exports.domains = exports.emailCaptures = exports.insertAgentCapabilitySchema = exports.insertAgentLearningSchema = exports.insertClaudeMessageSchema = exports.insertClaudeConversationSchema = exports.insertWebsiteSchema = exports.insertAgentConversationSchema = exports.insertLoraWeightSchema = exports.insertTrainingRunSchema = exports.insertGenerationTrackerSchema = exports.insertMayaChatMessageSchema = exports.insertMayaChatSchema = exports.insertPromptAnalysisSchema = exports.insertUserStyleMemorySchema = exports.insertMayaPersonalMemorySchema = exports.insertUserPersonalBrandSchema = exports.insertUserLandingPageSchema = exports.insertLiveEventSchema = exports.insertLiveSessionSchema = exports.insertBrandOnboardingSchema = exports.insertLandingPageSchema = exports.insertPhotoSelectionSchema = exports.insertVictoriaChatSchema = exports.insertGeneratedImageSchema = exports.insertUserModelSchema = exports.insertSelfieUploadSchema = exports.insertOnboardingDataSchema = void 0;
exports.insertImageVariantSchema = exports.insertBrandAssetSchema = exports.insertConceptCardSchema = exports.insertConversationSummarySchema = exports.insertMessageSchema = exports.insertConversationSchema = exports.insertMayaContextSessionSchema = exports.insertUserStyleEvolutionSchema = exports.insertSavedPromptSchema = exports.insertSandraConversationSchema = exports.insertModelRecoveryLogSchema = exports.insertInspirationPhotoSchema = exports.insertDashboardSchema = exports.insertBrandbookSchema = exports.insertArchitectureAuditLogSchema = exports.conceptCards = exports.conversationSummaries = exports.messages = exports.conversations = exports.mayaContextSessions = exports.userStyleEvolution = exports.savedPrompts = exports.sandraConversations = exports.modelRecoveryLog = exports.inspirationPhotos = exports.dashboards = exports.brandbooks = exports.architectureAuditLog = exports.styleguideTemplates = exports.userStyleguides = exports.imageVariants = exports.brandAssets = exports.insertAgentSessionsSchema = exports.insertAgentHandoffRequestsSchema = void 0;
/// <reference path="../server/types/global.d.ts" />
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const ulid_1 = require("ulid");
const node_crypto_1 = require("node:crypto");
// Session storage table for Stack Auth (Stack Auth manages sessions automatically)
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sid: (0, pg_core_1.varchar)("sid").primaryKey(),
    sess: (0, pg_core_1.jsonb)("sess").notNull(),
    expire: (0, pg_core_1.timestamp)("expire").notNull(),
});
// Agent session contexts for persistent memory between user sessions
exports.agentSessionContexts = (0, pg_core_1.pgTable)("agent_session_contexts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    sessionId: (0, pg_core_1.varchar)("session_id").notNull(),
    contextData: (0, pg_core_1.jsonb)("context_data").notNull(), // Conversation history, memory, state
    workflowState: (0, pg_core_1.varchar)("workflow_state").default("ready"), // ready, active, paused, completed
    lastInteraction: (0, pg_core_1.timestamp)("last_interaction").defaultNow().notNull(),
    memorySnapshot: (0, pg_core_1.jsonb)("memory_snapshot"), // Consolidated memory for quick restoration
    adminBypass: (0, pg_core_1.boolean)("admin_bypass").default(false), // Admin bypass for enhanced context access
    unlimitedContext: (0, pg_core_1.boolean)("unlimited_context").default(false), // Unlimited memory access for admin agents
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// User storage table for Stack Auth integration
exports.users = (0, pg_core_1.pgTable)("users", {
    // Core user fields - Stack Auth compatible
    id: (0, pg_core_1.varchar)("id").primaryKey().notNull(), // Stack Auth uses string IDs
    stackAuthId: (0, pg_core_1.varchar)("stack_auth_id").unique(), // For linking existing users to Stack Auth
    email: (0, pg_core_1.varchar)("email").unique(),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    displayName: (0, pg_core_1.varchar)("display_name"),
    profileImageUrl: (0, pg_core_1.varchar)("profile_image_url"),
    // Stack Auth managed timestamps
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at"),
    // Business logic - preserved from existing system
    stripeCustomerId: (0, pg_core_1.varchar)("stripe_customer_id"),
    stripeSubscriptionId: (0, pg_core_1.varchar)("stripe_subscription_id"),
    plan: (0, pg_core_1.varchar)("plan").default("sselfie-studio"), // sselfie-studio for €47/month, admin for unlimited
    role: (0, pg_core_1.varchar)("role").default("user"), // user, admin
    monthlyGenerationLimit: (0, pg_core_1.integer)("monthly_generation_limit").default(100), // 100 for sselfie-studio plan, unlimited (-1) for admin
    generationsUsedThisMonth: (0, pg_core_1.integer)("generations_used_this_month").default(0),
    mayaAiAccess: (0, pg_core_1.boolean)("maya_ai_access").default(true), // Available on both tiers
    victoriaAiAccess: (0, pg_core_1.boolean)("victoria_ai_access").default(false), // Only for full-access tier
    // 🔄 PHASE 3: Retraining access tracking
    hasRetrainingAccess: (0, pg_core_1.boolean)("has_retraining_access").default(false),
    retrainingSessionId: (0, pg_core_1.varchar)("retraining_session_id"),
    retrainingPaidAt: (0, pg_core_1.timestamp)("retraining_paid_at"),
    // Conversational onboarding tracking - Maya handles incomplete profiles gracefully
    onboardingProgress: (0, pg_core_1.jsonb)("onboarding_progress").default('{}'), // Store conversational progress without blocking
    preferredOnboardingMode: (0, pg_core_1.varchar)("preferred_onboarding_mode").default("conversational"), // conversational, guided, completed
    // Essential profile data for Maya personalization
    gender: (0, pg_core_1.varchar)("gender"), // "man" | "woman" | "non-binary" - CRITICAL for image generation
    profession: (0, pg_core_1.varchar)("profession"), // User's business/profession
    brandStyle: (0, pg_core_1.varchar)("brand_style"), // "professional" | "creative" | "lifestyle" | "luxury"
    photoGoals: (0, pg_core_1.text)("photo_goals"), // What they want photos for (business use case)
    // Training-time coaching system for brand strategy discovery
    trainingCoachingStarted: (0, pg_core_1.boolean)("training_coaching_started").default(false),
    trainingCoachingCompleted: (0, pg_core_1.boolean)("training_coaching_completed").default(false),
    trainingCoachingPhase: (0, pg_core_1.varchar)("training_coaching_phase"), // businessGoals, platformStrategy, brandPositioning, completed
    trainingCoachingStep: (0, pg_core_1.integer)("training_coaching_step").default(0),
    brandStrategyContext: (0, pg_core_1.jsonb)("brand_strategy_context"), // Stores coaching responses and brand strategy insights
});
// Email management for Ava agent
exports.emailAccounts = (0, pg_core_1.pgTable)("email_accounts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    accountType: (0, pg_core_1.varchar)("account_type").notNull(), // 'personal' or 'business'
    email: (0, pg_core_1.varchar)("email").notNull(),
    provider: (0, pg_core_1.varchar)("provider").notNull(), // 'gmail', 'outlook', 'other'
    displayName: (0, pg_core_1.varchar)("display_name"),
    accessToken: (0, pg_core_1.text)("access_token"), // Encrypted
    refreshToken: (0, pg_core_1.text)("refresh_token"), // Encrypted
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    lastSyncAt: (0, pg_core_1.timestamp)("last_sync_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.processedEmails = (0, pg_core_1.pgTable)("processed_emails", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    accountId: (0, pg_core_1.integer)("account_id").references(() => exports.emailAccounts.id, { onDelete: "cascade" }).notNull(),
    externalId: (0, pg_core_1.varchar)("external_id").notNull(), // Email ID from provider
    fromAddress: (0, pg_core_1.varchar)("from_address").notNull(),
    toAddresses: (0, pg_core_1.jsonb)("to_addresses").notNull(),
    subject: (0, pg_core_1.text)("subject").notNull(),
    bodyPreview: (0, pg_core_1.text)("body_preview"),
    receivedAt: (0, pg_core_1.timestamp)("received_at").notNull(),
    category: (0, pg_core_1.varchar)("category").notNull(), // 'urgent', 'customer', 'business', 'personal', 'marketing', 'spam'
    priority: (0, pg_core_1.varchar)("priority").notNull(), // 'high', 'medium', 'low'
    needsResponse: (0, pg_core_1.boolean)("needs_response").default(false),
    hasResponse: (0, pg_core_1.boolean)("has_response").default(false),
    sentiment: (0, pg_core_1.varchar)("sentiment").notNull(), // 'positive', 'neutral', 'negative'
    tags: (0, pg_core_1.jsonb)("tags"), // Array of tags
    aiSummary: (0, pg_core_1.text)("ai_summary"),
    suggestedResponse: (0, pg_core_1.text)("suggested_response"),
    isArchived: (0, pg_core_1.boolean)("is_archived").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Instagram/ManyChat message management for Ava agent
exports.instagramMessages = (0, pg_core_1.pgTable)("instagram_messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    platform: (0, pg_core_1.varchar)("platform").notNull(), // 'instagram' or 'manychat'
    externalId: (0, pg_core_1.varchar)("external_id").notNull(), // Message ID from platform
    fromUsername: (0, pg_core_1.varchar)("from_username").notNull(),
    fromId: (0, pg_core_1.varchar)("from_id").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    messageType: (0, pg_core_1.varchar)("message_type").notNull(), // 'text', 'image', 'video', 'story_reply'
    receivedAt: (0, pg_core_1.timestamp)("received_at").notNull(),
    category: (0, pg_core_1.varchar)("category").notNull(), // 'customer_inquiry', 'general', 'collaboration', 'spam', 'urgent'
    priority: (0, pg_core_1.varchar)("priority").notNull(), // 'high', 'medium', 'low'
    sentiment: (0, pg_core_1.varchar)("sentiment").notNull(), // 'positive', 'neutral', 'negative'
    needsResponse: (0, pg_core_1.boolean)("needs_response").default(false),
    hasResponse: (0, pg_core_1.boolean)("has_response").default(false),
    isBusinessOpportunity: (0, pg_core_1.boolean)("is_business_opportunity").default(false),
    tags: (0, pg_core_1.jsonb)("tags"), // Array of tags
    aiSummary: (0, pg_core_1.text)("ai_summary"),
    suggestedResponse: (0, pg_core_1.text)("suggested_response"),
    isArchived: (0, pg_core_1.boolean)("is_archived").default(false),
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
// Hair leads table for QR code signups (Norwegian market)
exports.hairLeads = (0, pg_core_1.pgTable)("hair_leads", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    navn: (0, pg_core_1.varchar)("navn").notNull(), // Name in Norwegian
    epost: (0, pg_core_1.varchar)("epost").notNull(), // Email in Norwegian
    telefon: (0, pg_core_1.varchar)("telefon"), // Phone number (optional)
    kilde: (0, pg_core_1.varchar)("kilde").default("qr-code"), // Source: qr-code, landing-page, etc
    interesse: (0, pg_core_1.text)("interesse"), // Interest/comments (optional)
    levelpartnerSynced: (0, pg_core_1.boolean)("levelpartner_synced").default(false), // For future LevelPartner integration
    levelpartnerSyncedAt: (0, pg_core_1.timestamp)("levelpartner_synced_at"),
    status: (0, pg_core_1.varchar)("status").default("new"), // new, contacted, converted, unsubscribed
    notater: (0, pg_core_1.text)("notater"), // Notes in Norwegian
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
    generatedPrompt: (0, pg_core_1.text)("generated_prompt"), // The actual FLUX prompt used for generation
    style: (0, pg_core_1.varchar)("style"), // editorial, business, lifestyle, luxury
    category: (0, pg_core_1.varchar)("category"), // Business, Fashion, Lifestyle, Travel - NEW FIELD
    source: (0, pg_core_1.varchar)("source").default("workspace"), // maya-chat, workspace, gallery-edit
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
    confidence: (0, pg_core_1.decimal)("confidence").default("0.5"), // 0.0 to 1.0
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
    totalCostIncurred: (0, pg_core_1.decimal)("total_cost_incurred").default("0.0000"), // Track actual API costs
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
    cost: (0, pg_core_1.decimal)("cost").notNull(), // Actual cost in USD
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
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User AI Models table for individual trained models - Enhanced for FLUX Pro
exports.userModels = (0, pg_core_1.pgTable)("user_models", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull().unique(), // One model per user
    trainingId: (0, pg_core_1.varchar)("training_id"), // Replicate training ID (separate from model path)
    replicateModelId: (0, pg_core_1.varchar)("replicate_model_id"), // Final model path only (e.g., sandrasocial/user123-selfie-lora)
    replicateVersionId: (0, pg_core_1.varchar)("replicate_version_id"), // The actual trained model version to use
    trainedModelPath: (0, pg_core_1.varchar)("trained_model_path"), // sandrasocial/{modelName}
    // REMOVED: loraWeightsUrl - packaged models have LoRA built-in
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
// Generated Videos table (for VEO 3 video generation)
exports.generatedVideos = (0, pg_core_1.pgTable)("generated_videos", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    imageId: (0, pg_core_1.integer)("image_id"), // Source image for video generation
    imageSource: (0, pg_core_1.varchar)("image_source").default("generated"), // 'generated' or 'legacy'
    motionPrompt: (0, pg_core_1.text)("motion_prompt").notNull(),
    videoUrl: (0, pg_core_1.varchar)("video_url"), // Final video URL when completed
    jobId: (0, pg_core_1.varchar)("job_id").notNull(), // VEO generation job ID
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, processing, completed, failed
    estimatedTime: (0, pg_core_1.varchar)("estimated_time"), // e.g., "2-5 minutes"
    progress: (0, pg_core_1.integer)("progress").default(0), // 0-100
    errorMessage: (0, pg_core_1.text)("error_message"),
    saved: (0, pg_core_1.boolean)("saved").default(false), // User saved to favorites
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
});
// Video Storyboards table (for multi-scene video composition)
exports.videoStoryboards = (0, pg_core_1.pgTable)("video_storyboards", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    scenes: (0, pg_core_1.jsonb)("scenes").notNull(), // Array of {motionPrompt, duration, style?, imageId?}
    mode: (0, pg_core_1.varchar)("mode").default("sequential"), // sequential, parallel
    composedVideoUrl: (0, pg_core_1.varchar)("composed_video_url"), // Final composed video URL
    status: (0, pg_core_1.varchar)("status").default("pending"), // pending, processing, completed, failed
    progress: (0, pg_core_1.integer)("progress").default(0), // 0-100
    jobId: (0, pg_core_1.varchar)("job_id"), // Composition job ID for tracking
    errorMessage: (0, pg_core_1.text)("error_message"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
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
    // Design Preferences (from Zara'.js's audit)
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
// Maya Personal Brand data for onboarding - SIMPLIFIED 8 FIELDS
exports.userPersonalBrand = (0, pg_core_1.pgTable)("user_personal_brand", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    // Personal details - 8 core fields only
    name: (0, pg_core_1.text)("name"),
    transformationStory: (0, pg_core_1.text)("transformation_story"),
    currentSituation: (0, pg_core_1.text)("current_situation"),
    futureVision: (0, pg_core_1.text)("future_vision"),
    businessGoals: (0, pg_core_1.text)("business_goals"),
    businessType: (0, pg_core_1.varchar)("business_type"),
    stylePreferences: (0, pg_core_1.text)("style_preferences"),
    photoGoals: (0, pg_core_1.text)("photo_goals"),
    // System fields
    onboardingStep: (0, pg_core_1.integer)("onboarding_step").default(1),
    isCompleted: (0, pg_core_1.boolean)("is_completed").default(false),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Maya Personal Memory data for personalized interactions
exports.mayaPersonalMemory = (0, pg_core_1.pgTable)("maya_personal_memory", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    personalInsights: (0, pg_core_1.jsonb)("personal_insights"),
    ongoingGoals: (0, pg_core_1.jsonb)("ongoing_goals"),
    conversationStyle: (0, pg_core_1.jsonb)("conversation_style"),
    userFeedbackPatterns: (0, pg_core_1.jsonb)("user_feedback_patterns"),
    preferredTopics: (0, pg_core_1.jsonb)("preferred_topics"),
    personalizedStylingNotes: (0, pg_core_1.text)("personalized_styling_notes"),
    successfulPromptPatterns: (0, pg_core_1.jsonb)("successful_prompt_patterns"),
    lastMemoryUpdate: (0, pg_core_1.timestamp)("last_memory_update").defaultNow(),
    memoryVersion: (0, pg_core_1.integer)("memory_version").default(1),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// User Style Memory for learning preferences and patterns - ✨ PHASE 4.3 ENHANCED
exports.userStyleMemory = (0, pg_core_1.pgTable)("user_style_memory", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    // Preference tracking
    preferredCategories: (0, pg_core_1.jsonb)("preferred_categories").default('[]'), // ["Business", "Lifestyle", etc.]
    favoritePromptPatterns: (0, pg_core_1.jsonb)("favorite_prompt_patterns").default('[]'), // Successful prompt structures
    colorPreferences: (0, pg_core_1.jsonb)("color_preferences").default('[]'), // Preferred color palettes
    settingPreferences: (0, pg_core_1.jsonb)("setting_preferences").default('[]'), // Indoor, outdoor, urban, etc.
    stylingKeywords: (0, pg_core_1.jsonb)("styling_keywords").default('[]'), // Words that resonate with user
    // Learning metrics
    totalInteractions: (0, pg_core_1.integer)("total_interactions").default(0),
    totalFavorites: (0, pg_core_1.integer)("total_favorites").default(0),
    averageSessionLength: (0, pg_core_1.integer)("average_session_length").default(0), // in minutes
    mostActiveHours: (0, pg_core_1.jsonb)("most_active_hours").default('[]'), // Time patterns
    // Success patterns
    highPerformingPrompts: (0, pg_core_1.jsonb)("high_performing_prompts").default('[]'), // Prompts that got favorited
    rejectedPrompts: (0, pg_core_1.jsonb)("rejected_prompts").default('[]'), // Prompts user didn't like
    // PHASE 4.3: Enhanced fields temporarily disabled for database compatibility
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Prompt Analysis for tracking successful patterns (zero risk - just logging)
exports.promptAnalysis = (0, pg_core_1.pgTable)("prompt_analysis", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    // Prompt details
    originalPrompt: (0, pg_core_1.text)("original_prompt").notNull(),
    generatedPrompt: (0, pg_core_1.text)("generated_prompt"), // The FLUX prompt used
    conceptTitle: (0, pg_core_1.text)("concept_title"),
    category: (0, pg_core_1.varchar)("category"), // Business, Lifestyle, etc.
    // User interaction data
    wasGenerated: (0, pg_core_1.boolean)("was_generated").default(false),
    wasFavorited: (0, pg_core_1.boolean)("was_favorited").default(false),
    wasSaved: (0, pg_core_1.boolean)("was_saved").default(false),
    viewDuration: (0, pg_core_1.integer)("view_duration"), // How long user looked at result
    // Technical analysis
    promptLength: (0, pg_core_1.integer)("prompt_length"),
    keywordDensity: (0, pg_core_1.jsonb)("keyword_density").default('{}'), // Word frequency analysis
    technicalSpecs: (0, pg_core_1.jsonb)("technical_specs").default('{}'), // Camera, lighting, etc.
    // Performance metrics
    generationTime: (0, pg_core_1.integer)("generation_time"), // How long it took to generate
    successScore: (0, pg_core_1.decimal)("success_score").default("0.0"), // 0.0 to 1.0 based on user actions
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Maya Chat History tables - STEP 3.1: Performance Optimized
exports.mayaChats = (0, pg_core_1.pgTable)("maya_chats", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").notNull(),
    chatTitle: (0, pg_core_1.varchar)("chat_title").notNull(),
    chatSummary: (0, pg_core_1.text)("chat_summary"),
    chatCategory: (0, pg_core_1.varchar)("chat_category").default("Style Consultation"),
    lastActivity: (0, pg_core_1.timestamp)("last_activity").defaultNow(),
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
    conceptCards: (0, pg_core_1.jsonb)("concept_cards"), // ENHANCED: JSON array of concept cards with enhanced context
    quickButtons: (0, pg_core_1.text)("quick_buttons"), // JSON array of quick action buttons
    canGenerate: (0, pg_core_1.boolean)("can_generate").default(false), // Whether this message can generate images
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// LoRA Training & Weights Storage Tables
// Tracks individual training runs and their extracted LoRA weights
exports.trainingRuns = (0, pg_core_1.pgTable)("training_runs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    trainingId: (0, pg_core_1.varchar)("training_id").notNull(), // Replicate training ID
    status: (0, pg_core_1.varchar)("status").notNull(), // 'started', 'training', 'completed', 'failed'
    progress: (0, pg_core_1.integer)("progress").default(0), // 0-100
    baseModel: (0, pg_core_1.varchar)("base_model").default("flux-dev"),
    parameters: (0, pg_core_1.jsonb)("parameters"), // Training params: steps, lr, rank, resolution, etc.
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow(),
    completedAt: (0, pg_core_1.timestamp)("completed_at"),
    datasetZipUrl: (0, pg_core_1.text)("dataset_zip_url"), // S3 URL of training images
    outputArtifactUrl: (0, pg_core_1.text)("output_artifact_url"), // Replicate output URL
    error: (0, pg_core_1.text)("error"), // Error message if failed
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
exports.loraWeights = (0, pg_core_1.pgTable)("lora_weights", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    trainingRunId: (0, pg_core_1.integer)("training_run_id").references(() => exports.trainingRuns.id, { onDelete: "cascade" }).notNull(),
    triggerWord: (0, pg_core_1.varchar)("trigger_word").notNull(),
    baseModel: (0, pg_core_1.varchar)("base_model").notNull().default("flux-dev"),
    // Object Storage Details for .safetensors file
    s3Bucket: (0, pg_core_1.varchar)("s3_bucket"),
    s3Key: (0, pg_core_1.varchar)("s3_key"), // Path to .safetensors file in object storage
    fileSize: (0, pg_core_1.integer)("file_size"), // File size in bytes
    checksum: (0, pg_core_1.varchar)("checksum"), // File integrity verification
    // LoRA Technical Details
    rank: (0, pg_core_1.integer)("rank").default(32), // LoRA rank used in training
    networkType: (0, pg_core_1.varchar)("network_type").default("lora"), // "lora", "locon", etc.
    status: (0, pg_core_1.varchar)("status").default("available"), // 'available', 'archived', 'failed'
    // Maya's Intelligent Scaling Defaults per shot type
    defaultScales: (0, pg_core_1.jsonb)("default_scales"), // { closeUpPortrait: 1.0, halfBodyShot: 0.9, fullScenery: 0.85 }
    metadata: (0, pg_core_1.jsonb)("metadata"), // Additional LoRA metadata
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Live Sessions - For Stage Mode interactive presentations
exports.liveSessions = (0, pg_core_1.pgTable)("live_sessions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    deckUrl: (0, pg_core_1.text)("deck_url"),
    mentiUrl: (0, pg_core_1.text)("menti_url"),
    ctaUrl: (0, pg_core_1.text)("cta_url"),
    title: (0, pg_core_1.text)("title").notNull(),
    createdBy: (0, pg_core_1.uuid)("created_by").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
// Live Events - For Stage Mode analytics and tracking
exports.liveEvents = (0, pg_core_1.pgTable)("live_events", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    sessionId: (0, pg_core_1.uuid)("session_id").references(() => exports.liveSessions.id, { onDelete: "cascade" }).notNull(),
    eventType: (0, pg_core_1.varchar)("event_type").notNull(), // 'qr_view', 'cta_click', 'signup_success', 'reaction', 'state_change'
    meta: (0, pg_core_1.jsonb)("meta").default({}),
    userAgent: (0, pg_core_1.text)("user_agent"),
    ipAddress: (0, pg_core_1.text)("ip_address"), // Using text instead of inet for broader compatibility
    utmSource: (0, pg_core_1.varchar)("utm_source"),
    utmCampaign: (0, pg_core_1.varchar)("utm_campaign"),
    utmMedium: (0, pg_core_1.varchar)("utm_medium"),
    utmContent: (0, pg_core_1.varchar)("utm_content"),
    utmTerm: (0, pg_core_1.varchar)("utm_term"),
    createdAt: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
});
// Schema exports
exports.upsertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({ createdAt: true, updatedAt: true });
exports.insertUserProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertHairLeadSchema = zod_1.z.object({
    navn: zod_1.z.string(),
    epost: zod_1.z.string().email(),
    telefon: zod_1.z.string().optional(),
    kilde: zod_1.z.string().default("qr-code"),
    interesse: zod_1.z.string().optional(),
    levelpartnerSynced: zod_1.z.boolean().default(false),
    levelpartnerSyncedAt: zod_1.z.date().optional(),
    status: zod_1.z.string().default("new"),
    notater: zod_1.z.string().optional(),
});
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
exports.insertLiveSessionSchema = zod_1.z.object({
    deckUrl: zod_1.z.string().optional(),
    mentiUrl: zod_1.z.string().optional(),
    ctaUrl: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    createdBy: zod_1.z.string().uuid(),
});
exports.insertLiveEventSchema = zod_1.z.object({
    sessionId: zod_1.z.string().uuid(),
    eventType: zod_1.z.string(),
    meta: zod_1.z.record(zod_1.z.any()).optional().default({}),
    userAgent: zod_1.z.string().optional(),
    ipAddress: zod_1.z.string().optional(),
    utmSource: zod_1.z.string().optional(),
    utmCampaign: zod_1.z.string().optional(),
    utmMedium: zod_1.z.string().optional(),
    utmContent: zod_1.z.string().optional(),
    utmTerm: zod_1.z.string().optional(),
});
exports.insertUserLandingPageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userLandingPages).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertUserPersonalBrandSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userPersonalBrand).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertMayaPersonalMemorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaPersonalMemory).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertUserStyleMemorySchema = (0, drizzle_zod_1.createInsertSchema)(exports.userStyleMemory).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertPromptAnalysisSchema = (0, drizzle_zod_1.createInsertSchema)(exports.promptAnalysis).omit({ id: true, createdAt: true });
exports.insertMayaChatSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaChats).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertMayaChatMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaChatMessages).omit({ id: true, createdAt: true });
exports.insertGenerationTrackerSchema = (0, drizzle_zod_1.createInsertSchema)(exports.generationTrackers).omit({ id: true, createdAt: true });
exports.insertTrainingRunSchema = (0, drizzle_zod_1.createInsertSchema)(exports.trainingRuns).omit({ id: true, createdAt: true, updatedAt: true });
exports.insertLoraWeightSchema = (0, drizzle_zod_1.createInsertSchema)(exports.loraWeights).omit({ id: true, createdAt: true, updatedAt: true });
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
exports.insertUserWebsiteOnboardingSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    personalBrandName: zod_1.z.string().optional(),
    story: zod_1.z.string().optional(),
    businessType: zod_1.z.string().optional(),
    colorPreferences: zod_1.z.record(zod_1.z.any()).default({}),
    targetAudience: zod_1.z.string().optional(),
    brandKeywords: zod_1.z.array(zod_1.z.string()).default([]),
    goals: zod_1.z.string().optional(),
    currentStep: zod_1.z.string().default('story'),
    isCompleted: zod_1.z.boolean().default(false)
});
exports.insertUserGeneratedWebsitesSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    onboardingId: zod_1.z.number().optional(),
    title: zod_1.z.string(),
    subdomain: zod_1.z.string().optional(),
    htmlContent: zod_1.z.string(),
    cssContent: zod_1.z.string(),
    jsContent: zod_1.z.string().default(''),
    metadata: zod_1.z.record(zod_1.z.any()).default({}),
    isPublished: zod_1.z.boolean().default(false),
    status: zod_1.z.string().default('draft'),
    templateUsed: zod_1.z.string().optional(),
    customizations: zod_1.z.record(zod_1.z.any()).default({}),
    analytics: zod_1.z.record(zod_1.z.any()).default({}),
    seoScore: zod_1.z.number().default(0)
});
exports.insertWebsiteBuilderConversationsSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    websiteId: zod_1.z.number().optional(),
    onboardingId: zod_1.z.number().optional(),
    messages: zod_1.z.array(zod_1.z.any()).default([]),
    context: zod_1.z.record(zod_1.z.any()).default({}),
    isActive: zod_1.z.boolean().default(true),
    conversationType: zod_1.z.string().default('onboarding')
});
// Imported subscribers table for email list migration
exports.importedSubscribers = (0, pg_core_1.pgTable)("imported_subscribers", {
    id: (0, pg_core_1.varchar)("id").primaryKey().$defaultFn(() => (0, node_crypto_1.randomUUID)()),
    email: (0, pg_core_1.varchar)("email"),
    firstName: (0, pg_core_1.varchar)("first_name"),
    lastName: (0, pg_core_1.varchar)("last_name"),
    source: (0, pg_core_1.varchar)("source").notNull(), // 'flodesk' | 'manychat'
    originalId: (0, pg_core_1.varchar)("original_id").notNull(),
    status: (0, pg_core_1.varchar)("status").notNull(), // 'active' | 'unsubscribed'
    tags: (0, pg_core_1.jsonb)("tags").default([]),
    customFields: (0, pg_core_1.jsonb)("custom_fields").default({}),
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
    conversationContext: (0, pg_core_1.jsonb)('conversation_context'),
    priority: (0, pg_core_1.text)('priority').default('medium'),
    completionCriteria: (0, pg_core_1.jsonb)('completion_criteria'),
    qualityGates: (0, pg_core_1.jsonb)('quality_gates'),
    estimatedDuration: (0, pg_core_1.integer)('estimated_duration').notNull(), // in minutes
    status: (0, pg_core_1.text)('status').default('received'),
    progress: (0, pg_core_1.integer)('progress').default(0),
    implementations: (0, pg_core_1.jsonb)('implementations'),
    rollbackPlan: (0, pg_core_1.jsonb)('rollback_plan'),
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
// PHASE 1: COST CONTROL & MONITORING SYSTEM
// Agent cost tracking and budgets for Sandra's Empire Control
exports.agentCostTracking = (0, pg_core_1.pgTable)("agent_cost_tracking", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    conversationId: (0, pg_core_1.varchar)("conversation_id"),
    apiCalls: (0, pg_core_1.integer)("api_calls").default(0),
    tokensUsed: (0, pg_core_1.integer)("tokens_used").default(0),
    estimatedCost: (0, pg_core_1.decimal)("estimated_cost").default("0.0000"),
    date: (0, pg_core_1.timestamp)("date").defaultNow(),
    taskType: (0, pg_core_1.varchar)("task_type"), // "chat", "file_edit", "analysis", etc.
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Daily/monthly budget controls
exports.agentBudgets = (0, pg_core_1.pgTable)("agent_budgets", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    agentId: (0, pg_core_1.varchar)("agent_id"),
    budgetType: (0, pg_core_1.varchar)("budget_type").notNull(), // "daily", "monthly"
    budgetLimit: (0, pg_core_1.decimal)("budget_limit").notNull(),
    currentSpend: (0, pg_core_1.decimal)("current_spend").default("0.00"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    resetDate: (0, pg_core_1.timestamp)("reset_date"),
    alertThreshold: (0, pg_core_1.integer)("alert_threshold").default(80), // Alert at 80% of budget
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Additional Agent Learning Schemas
exports.insertAgentKnowledgeBaseSchema = zod_1.z.object({
    agentId: zod_1.z.string(),
    topic: zod_1.z.string(),
    content: zod_1.z.string(),
    source: zod_1.z.string(),
    confidence: zod_1.z.number(),
    tags: zod_1.z.array(zod_1.z.string()).optional()
});
exports.insertAgentPerformanceMetricsSchema = zod_1.z.object({
    agentId: zod_1.z.string(),
    taskType: zod_1.z.string(),
    successRate: zod_1.z.number(),
    averageTime: zod_1.z.number().default(0),
    userSatisfactionScore: zod_1.z.number().default(0),
    totalTasks: zod_1.z.number().default(0),
    improvementTrend: zod_1.z.string().default('stable')
});
exports.insertAgentTrainingSessionsSchema = zod_1.z.object({
    agentId: zod_1.z.string(),
    sessionType: zod_1.z.string(),
    trainingData: zod_1.z.record(zod_1.z.any()),
    improvements: zod_1.z.string().optional(),
    performanceGain: zod_1.z.number().optional(),
    trainedBy: zod_1.z.string().optional()
});
// Cost tracking type exports
exports.insertAgentCostTrackingSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    agentId: zod_1.z.string(),
    conversationId: zod_1.z.string().optional(),
    apiCalls: zod_1.z.number().default(0),
    tokensUsed: zod_1.z.number().default(0),
    estimatedCost: zod_1.z.number().default(0),
    taskType: zod_1.z.string().optional()
});
exports.insertAgentBudgetsSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    agentId: zod_1.z.string().optional(),
    budgetType: zod_1.z.string(),
    budgetLimit: zod_1.z.number(),
    currentSpend: zod_1.z.number().default(0),
    isActive: zod_1.z.boolean().default(true),
    resetDate: zod_1.z.date().optional(),
    alertThreshold: zod_1.z.number().default(80)
});
// PHASE 2: APPROVAL WORKFLOW SYSTEM - Sandra's Content Control
// Approval queue for customer-facing content
exports.approvalQueue = (0, pg_core_1.pgTable)("approval_queue", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    contentType: (0, pg_core_1.varchar)("content_type").notNull(), // "email", "social_post", "ad_campaign", "website_change"
    contentTitle: (0, pg_core_1.varchar)("content_title").notNull(),
    contentPreview: (0, pg_core_1.text)("content_preview").notNull(),
    fullContent: (0, pg_core_1.jsonb)("full_content").notNull(),
    targetAudience: (0, pg_core_1.varchar)("target_audience"),
    impactLevel: (0, pg_core_1.varchar)("impact_level").default("medium"), // "low", "medium", "high", "critical"
    estimatedCost: (0, pg_core_1.decimal)("estimated_cost"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // "pending", "approved", "rejected", "modified"
    adminComments: (0, pg_core_1.text)("admin_comments"),
    originalConversationId: (0, pg_core_1.varchar)("original_conversation_id"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    reviewedAt: (0, pg_core_1.timestamp)("reviewed_at"),
    approvedBy: (0, pg_core_1.varchar)("approved_by"),
});
// Agent pause/handoff requests
exports.agentHandoffRequests = (0, pg_core_1.pgTable)("agent_handoff_requests", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    fromAgentId: (0, pg_core_1.varchar)("from_agent_id").notNull(),
    toTargetType: (0, pg_core_1.varchar)("to_target_type").notNull(), // "sandra", "agent", "approval_queue"
    toTargetId: (0, pg_core_1.varchar)("to_target_id"), // Sandra's ID or another agent ID
    requestType: (0, pg_core_1.varchar)("request_type").notNull(), // "approval_needed", "guidance_required", "decision_needed"
    contextSummary: (0, pg_core_1.text)("context_summary").notNull(),
    urgencyLevel: (0, pg_core_1.varchar)("urgency_level").default("normal"), // "low", "normal", "high", "urgent"
    conversationId: (0, pg_core_1.varchar)("conversation_id"),
    originalTask: (0, pg_core_1.text)("original_task"),
    currentProgress: (0, pg_core_1.jsonb)("current_progress"),
    status: (0, pg_core_1.varchar)("status").default("pending"), // "pending", "assigned", "completed", "escalated"
    responseRequired: (0, pg_core_1.boolean)("response_required").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    respondedAt: (0, pg_core_1.timestamp)("responded_at"),
});
// Agent sessions tracking table for emergency controls
exports.agentSessions = (0, pg_core_1.pgTable)("agent_sessions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    agentId: (0, pg_core_1.varchar)("agent_id").notNull(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    conversationId: (0, pg_core_1.varchar)("conversation_id"),
    status: (0, pg_core_1.varchar)("status").default("active"), // "active", "paused", "emergency_paused", "completed"
    startedAt: (0, pg_core_1.timestamp)("started_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
    endedAt: (0, pg_core_1.timestamp)("ended_at"),
});
// Approval workflow type exports
exports.insertApprovalQueueSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    agentId: zod_1.z.string(),
    contentType: zod_1.z.string(),
    contentTitle: zod_1.z.string(),
    contentPreview: zod_1.z.string(),
    fullContent: zod_1.z.record(zod_1.z.any()),
    targetAudience: zod_1.z.string().optional(),
    impactLevel: zod_1.z.string().default("medium"),
    estimatedCost: zod_1.z.number().optional(),
    status: zod_1.z.string().default("pending"),
    adminComments: zod_1.z.string().optional(),
    originalConversationId: zod_1.z.string().optional(),
    reviewedAt: zod_1.z.date().optional(),
    approvedBy: zod_1.z.string().optional()
});
exports.insertAgentHandoffRequestsSchema = zod_1.z.object({
    fromAgentId: zod_1.z.string(),
    toTargetType: zod_1.z.string(),
    toTargetId: zod_1.z.string().optional(),
    requestType: zod_1.z.string(),
    contextSummary: zod_1.z.string(),
    urgencyLevel: zod_1.z.string().default("normal"),
    conversationId: zod_1.z.string().optional(),
    originalTask: zod_1.z.string().optional(),
    currentProgress: zod_1.z.record(zod_1.z.any()).optional(),
    status: zod_1.z.string().default("pending"),
    responseRequired: zod_1.z.boolean().default(true),
    respondedAt: zod_1.z.date().optional()
});
exports.insertAgentSessionsSchema = zod_1.z.object({
    agentId: zod_1.z.string(),
    userId: zod_1.z.string(),
    conversationId: zod_1.z.string().optional(),
    status: zod_1.z.string().default("active"),
    endedAt: zod_1.z.date().optional()
});
// Brand Assets table for P3-C feature
exports.brandAssets = (0, pg_core_1.pgTable)("brand_assets", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    kind: (0, pg_core_1.varchar)("kind").notNull(), // 'logo' | 'product'
    url: (0, pg_core_1.varchar)("url").notNull(), // S3 URL of the uploaded asset
    filename: (0, pg_core_1.varchar)("filename").notNull(),
    fileSize: (0, pg_core_1.integer)("file_size"), // File size in bytes
    meta: (0, pg_core_1.jsonb)("meta"), // Additional metadata (dimensions, etc.)
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Image Variants table for non-destructive brand asset placement
exports.imageVariants = (0, pg_core_1.pgTable)("image_variants", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    originalImageId: (0, pg_core_1.integer)("original_image_id").references(() => exports.aiImages.id, { onDelete: "cascade" }).notNull(),
    variantUrl: (0, pg_core_1.varchar)("variant_url").notNull(), // S3 URL of the variant image
    variantType: (0, pg_core_1.varchar)("variant_type").notNull(), // 'brand_placement', 'inpaint', 'overlay'
    brandAssetId: (0, pg_core_1.integer)("brand_asset_id").references(() => exports.brandAssets.id),
    placementData: (0, pg_core_1.jsonb)("placement_data"), // Position, scale, etc.
    processingStatus: (0, pg_core_1.varchar)("processing_status").default("pending"), // pending, processing, completed, failed
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Export styleguide tables and types  
var styleguide_schema_js_1 = require("./styleguide-schema.js");
Object.defineProperty(exports, "userStyleguides", { enumerable: true, get: function () { return styleguide_schema_js_1.userStyleguides; } });
Object.defineProperty(exports, "styleguideTemplates", { enumerable: true, get: function () { return styleguide_schema_js_1.styleguideTemplates; } });
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
// PHASE 3: DYNAMIC PERSONALIZATION ENGINE - User Style Evolution Tracking
exports.userStyleEvolution = (0, pg_core_1.pgTable)("user_style_evolution", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    // Adaptation tracking
    learningProgress: (0, pg_core_1.jsonb)("learning_progress").default('{}'),
    styleEvolutionPath: (0, pg_core_1.jsonb)("style_evolution_path").default('[]'),
    feedbackPatterns: (0, pg_core_1.jsonb)("feedback_patterns").default('{}'),
    contextualPreferences: (0, pg_core_1.jsonb)("contextual_preferences").default('{}'),
    // Contemporary elements
    trendAdaptation: (0, pg_core_1.jsonb)("trend_adaptation").default('{}'),
    culturalContext: (0, pg_core_1.jsonb)("cultural_context").default('{}'),
    sustainabilityPreferences: (0, pg_core_1.jsonb)("sustainability_preferences").default('{}'),
    lastAdaptation: (0, pg_core_1.timestamp)("last_adaptation").defaultNow(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow()
});
// Real-time Context Tracking  
exports.mayaContextSessions = (0, pg_core_1.pgTable)("maya_context_sessions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id).notNull(),
    sessionId: (0, pg_core_1.varchar)("session_id").notNull(),
    // Session context
    currentMood: (0, pg_core_1.varchar)("current_mood"),
    stylingGoals: (0, pg_core_1.jsonb)("styling_goals").default('[]'),
    contextualCues: (0, pg_core_1.jsonb)("contextual_cues").default('{}'),
    adaptationTriggers: (0, pg_core_1.jsonb)("adaptation_triggers").default('[]'),
    sessionStarted: (0, pg_core_1.timestamp)("session_started").defaultNow(),
    lastInteraction: (0, pg_core_1.timestamp)("last_interaction").defaultNow()
});
// HYBRID BACKEND ARCHITECTURE: Maya Conversations and Concept Cards
// New conversation system for Maya context preservation
exports.conversations = (0, pg_core_1.pgTable)("conversations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().$defaultFn(() => (0, ulid_1.ulid)()), // ULID for stable React keys
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    agentName: (0, pg_core_1.varchar)("agent_name").notNull().default("maya"), // maya, victoria, etc.
    title: (0, pg_core_1.varchar)("title"),
    status: (0, pg_core_1.varchar)("status").default("active"), // active, archived
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Messages for detailed conversation history  
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.varchar)("id").primaryKey().$defaultFn(() => (0, ulid_1.ulid)()), // ULID for React keys
    conversationId: (0, pg_core_1.varchar)("conversation_id").references(() => exports.conversations.id, { onDelete: "cascade" }).notNull(),
    role: (0, pg_core_1.varchar)("role").notNull(), // 'user', 'assistant', 'system'
    content: (0, pg_core_1.text)("content").notNull(),
    meta: (0, pg_core_1.jsonb)("meta"), // attachments, tool calls, etc.
    tokenCount: (0, pg_core_1.integer)("token_count").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Conversation summaries for performance (rolling summaries)
exports.conversationSummaries = (0, pg_core_1.pgTable)("conversation_summaries", {
    id: (0, pg_core_1.varchar)("id").primaryKey().$defaultFn(() => (0, ulid_1.ulid)()),
    conversationId: (0, pg_core_1.varchar)("conversation_id").references(() => exports.conversations.id, { onDelete: "cascade" }).notNull().unique(),
    summary: (0, pg_core_1.text)("summary").notNull(),
    lastMessageId: (0, pg_core_1.varchar)("last_message_id").references(() => exports.messages.id),
    messageCount: (0, pg_core_1.integer)("message_count").default(0),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Concept cards with proper backend persistence
exports.conceptCards = (0, pg_core_1.pgTable)("concept_cards", {
    id: (0, pg_core_1.varchar)("id").primaryKey().$defaultFn(() => (0, ulid_1.ulid)()), // ULID ensures unique React keys
    userId: (0, pg_core_1.varchar)("user_id").references(() => exports.users.id, { onDelete: "cascade" }).notNull(),
    conversationId: (0, pg_core_1.varchar)("conversation_id").references(() => exports.conversations.id, { onDelete: "cascade" }),
    clientId: (0, pg_core_1.varchar)("client_id"), // For idempotency on create
    title: (0, pg_core_1.varchar)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    images: (0, pg_core_1.jsonb)("images").default('[]'), // Array of image URLs
    tags: (0, pg_core_1.text)("tags").array().default([]), // String array for tags
    status: (0, pg_core_1.varchar)("status").default("draft"), // draft, final
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    generatedImages: (0, pg_core_1.jsonb)("generated_images"), // Generated image URLs
    isLoading: (0, pg_core_1.boolean)("is_loading").default(false),
    isGenerating: (0, pg_core_1.boolean)("is_generating").default(false),
    hasGenerated: (0, pg_core_1.boolean)("has_generated").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow(),
});
// Insert schemas for missing tables
exports.insertArchitectureAuditLogSchema = zod_1.z.object({
    totalUsers: zod_1.z.number().optional(),
    compliantUsers: zod_1.z.number().optional(),
    violationsFound: zod_1.z.array(zod_1.z.string()).optional(),
    violationsFixed: zod_1.z.array(zod_1.z.string()).optional(),
    auditStatus: zod_1.z.string().optional()
});
exports.insertBrandbookSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    businessName: zod_1.z.string(),
    tagline: zod_1.z.string().optional(),
    story: zod_1.z.string().optional(),
    primaryFont: zod_1.z.string().default("Times New Roman"),
    secondaryFont: zod_1.z.string().default("Inter"),
    primaryColor: zod_1.z.string().default("#0a0a0a"),
    secondaryColor: zod_1.z.string().default("#ffffff"),
    accentColor: zod_1.z.string().default("#f5f5f5"),
    logoType: zod_1.z.string(),
    logoUrl: zod_1.z.string().optional(),
    logoPrompt: zod_1.z.string().optional(),
    moodboardStyle: zod_1.z.string(),
    voiceTone: zod_1.z.string().optional(),
    voicePersonality: zod_1.z.string().optional(),
    keyPhrases: zod_1.z.string().optional(),
    isPublished: zod_1.z.boolean().default(false),
    brandbookUrl: zod_1.z.string().optional(),
    templateType: zod_1.z.string().default("minimal-executive"),
    customDomain: zod_1.z.string().optional(),
    isLive: zod_1.z.boolean().default(false)
});
exports.insertDashboardSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    config: zod_1.z.record(zod_1.z.any()),
    onboardingData: zod_1.z.record(zod_1.z.any()).optional(),
    templateType: zod_1.z.string(),
    quickLinks: zod_1.z.record(zod_1.z.any()).optional(),
    customUrl: zod_1.z.string().optional(),
    isPublished: zod_1.z.boolean().default(false),
    backgroundColor: zod_1.z.string().default("#ffffff"),
    accentColor: zod_1.z.string().default("#0a0a0a"),
    isLive: zod_1.z.boolean().default(false)
});
exports.insertInspirationPhotoSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    imageUrl: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    tags: zod_1.z.record(zod_1.z.any()).optional(),
    source: zod_1.z.string().default("upload"),
    isActive: zod_1.z.boolean().default(true)
});
exports.insertModelRecoveryLogSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    oldModelId: zod_1.z.string().optional(),
    newModelId: zod_1.z.string().optional(),
    recoveryStatus: zod_1.z.string().optional()
});
exports.insertSandraConversationSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    message: zod_1.z.string(),
    response: zod_1.z.string(),
    userStylePreferences: zod_1.z.record(zod_1.z.any()).optional(),
    suggestedPrompt: zod_1.z.string().optional()
});
exports.insertSavedPromptSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    name: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    prompt: zod_1.z.string(),
    camera: zod_1.z.string().optional(),
    texture: zod_1.z.string().optional(),
    collection: zod_1.z.string().optional()
});
exports.insertUserStyleEvolutionSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    learningProgress: zod_1.z.record(zod_1.z.any()).default({}),
    styleEvolutionPath: zod_1.z.array(zod_1.z.any()).default([]),
    feedbackPatterns: zod_1.z.record(zod_1.z.any()).default({}),
    contextualPreferences: zod_1.z.record(zod_1.z.any()).default({}),
    trendAdaptation: zod_1.z.record(zod_1.z.any()).default({}),
    culturalContext: zod_1.z.record(zod_1.z.any()).default({}),
    sustainabilityPreferences: zod_1.z.record(zod_1.z.any()).default({})
});
exports.insertMayaContextSessionSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    sessionId: zod_1.z.string(),
    currentMood: zod_1.z.string().optional(),
    stylingGoals: zod_1.z.array(zod_1.z.any()).default([]),
    contextualCues: zod_1.z.record(zod_1.z.any()).default({}),
    adaptationTriggers: zod_1.z.array(zod_1.z.any()).default([])
});
// New hybrid backend insert schemas
exports.insertConversationSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    agentName: zod_1.z.string().default("maya"),
    title: zod_1.z.string().optional(),
    status: zod_1.z.string().default("active")
});
exports.insertMessageSchema = zod_1.z.object({
    conversationId: zod_1.z.string(),
    role: zod_1.z.string(),
    content: zod_1.z.string(),
    meta: zod_1.z.record(zod_1.z.any()).optional(),
    tokenCount: zod_1.z.number().default(0)
});
exports.insertConversationSummarySchema = zod_1.z.object({
    conversationId: zod_1.z.string(),
    summary: zod_1.z.string(),
    lastMessageId: zod_1.z.string().optional(),
    messageCount: zod_1.z.number().default(0)
});
exports.insertConceptCardSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    conversationId: zod_1.z.string().optional(),
    clientId: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.any()).default([]),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    status: zod_1.z.string().default("draft"),
    sortOrder: zod_1.z.number().default(0),
    generatedImages: zod_1.z.record(zod_1.z.any()).optional(),
    isLoading: zod_1.z.boolean().default(false),
    isGenerating: zod_1.z.boolean().default(false),
    hasGenerated: zod_1.z.boolean().default(false)
});
// Brand Assets schemas
exports.insertBrandAssetSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    kind: zod_1.z.enum(['logo', 'product']),
    url: zod_1.z.string(),
    filename: zod_1.z.string(),
    fileSize: zod_1.z.number().optional(),
    meta: zod_1.z.record(zod_1.z.any()).optional()
});
exports.insertImageVariantSchema = zod_1.z.object({
    userId: zod_1.z.string(),
    originalImageId: zod_1.z.number(),
    variantUrl: zod_1.z.string(),
    variantType: zod_1.z.string(),
    brandAssetId: zod_1.z.number().optional(),
    placementData: zod_1.z.record(zod_1.z.any()).optional(),
    processingStatus: zod_1.z.string().default("pending")
});
// export type InsertHairLead = z.infer<typeof insertHairLeadSchema>;
// Note: Website type already defined above at line 502
// Note: styleguide_templates and user_styleguides are imported from styleguide-schema.ts
// Note: agentTasks, emailCaptures, and userWebsiteOnboarding are already defined earlier in this file
