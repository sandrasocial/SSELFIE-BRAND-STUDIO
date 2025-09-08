import { pgTable, serial, varchar, text, boolean, jsonb, timestamp, integer, numeric, uniqueIndex, index, foreignKey, unique, uuid, check, json, real, pgMaterializedView, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const agentCapabilities = pgTable("agent_capabilities", {
	id: serial().primaryKey().notNull(),
	agentName: varchar("agent_name").notNull(),
	capabilityType: varchar("capability_type").notNull(),
	name: varchar().notNull(),
	description: text(),
	enabled: boolean().default(true),
	config: jsonb(),
	version: varchar().default('1.0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const agentConversations = pgTable("agent_conversations", {
	id: serial().primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	userId: varchar("user_id").notNull(),
	userMessage: text("user_message").notNull(),
	agentResponse: text("agent_response").notNull(),
	devPreview: jsonb("dev_preview"),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
	conversationTitle: varchar("conversation_title"),
	conversationData: jsonb("conversation_data"),
	messageCount: integer("message_count").default(0),
	lastAgentResponse: text("last_agent_response"),
	isActive: boolean("is_active").default(true),
	isStarred: boolean("is_starred").default(false),
	isArchived: boolean("is_archived").default(false),
	tags: jsonb().default([]),
	parentThreadId: integer("parent_thread_id"),
	branchedFromMessageId: varchar("branched_from_message_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const agentKnowledgeBase = pgTable("agent_knowledge_base", {
	id: serial().primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	topic: varchar().notNull(),
	content: text().notNull(),
	source: varchar().notNull(),
	confidence: numeric().notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
	tags: text().array(),
});

export const agentSessionContexts = pgTable("agent_session_contexts", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	agentId: varchar("agent_id").notNull(),
	sessionId: varchar("session_id").notNull(),
	contextData: jsonb("context_data").notNull(),
	workflowState: varchar("workflow_state").default('ready'),
	lastInteraction: timestamp("last_interaction", { mode: 'string' }).defaultNow(),
	memorySnapshot: jsonb("memory_snapshot"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	adminBypass: boolean("admin_bypass").default(false),
	unlimitedContext: boolean("unlimited_context").default(false),
}, (table) => [
	uniqueIndex("idx_agent_session_unique").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.agentId.asc().nullsLast().op("text_ops"), table.sessionId.asc().nullsLast().op("text_ops")),
	index("idx_agent_session_updated").using("btree", table.updatedAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_agent_session_user").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.agentId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "agent_session_contexts_user_id_fkey"
		}).onDelete("cascade"),
]);

export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
	id: serial().primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	taskType: varchar("task_type").notNull(),
	successRate: numeric("success_rate").notNull(),
	averageTime: integer("average_time").default(0),
	userSatisfactionScore: numeric("user_satisfaction_score").default('0'),
	totalTasks: integer("total_tasks").default(0),
	improvementTrend: varchar("improvement_trend").default('stable'),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
});

export const brandOnboarding = pgTable("brand_onboarding", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	businessName: varchar("business_name").notNull(),
	tagline: text().notNull(),
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
	email: varchar().notNull(),
	location: varchar(),
	brandPersonality: varchar("brand_personality").notNull(),
	brandValues: text("brand_values"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	stylePreference: varchar("style_preference").default('editorial-luxury'),
	colorScheme: varchar("color_scheme").default('black-white-editorial'),
	typographyStyle: varchar("typography_style").default('times-editorial'),
	designPersonality: varchar("design_personality").default('sophisticated'),
	feedPersonality: varchar("feed_personality"),
	preferredTypography: varchar("preferred_typography"),
	brandMessagingStyle: varchar("brand_messaging_style"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "brand_onboarding_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("brand_onboarding_user_id_key").on(table.userId),
]);

export const agentTasks = pgTable("agent_tasks", {
	taskId: uuid("task_id").defaultRandom().primaryKey().notNull(),
	agentName: text("agent_name").notNull(),
	instruction: text().notNull(),
	conversationContext: jsonb("conversation_context"),
	priority: text().default('medium'),
	completionCriteria: jsonb("completion_criteria"),
	qualityGates: jsonb("quality_gates"),
	estimatedDuration: integer("estimated_duration"),
	status: text().default('pending'),
	progress: integer().default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	executionData: jsonb("execution_data"),
	implementations: jsonb(),
	rollbackPlan: jsonb("rollback_plan"),
	validationResults: jsonb("validation_results"),
	results: jsonb(),
	validationStatus: text("validation_status"),
	errorLog: text("error_log"),
});

export const architectureAuditLog = pgTable("architecture_audit_log", {
	id: serial().primaryKey().notNull(),
	auditDate: timestamp("audit_date", { mode: 'string' }).defaultNow(),
	totalUsers: integer("total_users"),
	compliantUsers: integer("compliant_users"),
	violationsFound: text("violations_found").array(),
	violationsFixed: text("violations_fixed").array(),
	auditStatus: varchar("audit_status", { length: 50 }),
});

export const agentLearning = pgTable("agent_learning", {
	id: serial().primaryKey().notNull(),
	agentName: varchar("agent_name").notNull(),
	userId: varchar("user_id"),
	learningType: varchar("learning_type").notNull(),
	category: varchar(),
	data: jsonb().notNull(),
	confidence: numeric({ precision: 3, scale:  2 }).default('0.5'),
	frequency: integer().default(1),
	lastSeen: timestamp("last_seen", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	intelligenceLevel: integer("intelligence_level").default(7),
	memoryStrength: numeric("memory_strength", { precision: 3, scale:  2 }).default('0.7'),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "agent_learning_user_id_fkey"
		}).onDelete("cascade"),
]);

export const brandbooks = pgTable("brandbooks", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	businessName: varchar("business_name").notNull(),
	tagline: varchar(),
	story: text(),
	primaryFont: varchar("primary_font").default('Times New Roman'),
	secondaryFont: varchar("secondary_font").default('Inter'),
	primaryColor: varchar("primary_color").default('#0a0a0a'),
	secondaryColor: varchar("secondary_color").default('#ffffff'),
	accentColor: varchar("accent_color").default('#f5f5f5'),
	logoType: varchar("logo_type").notNull(),
	logoUrl: varchar("logo_url"),
	logoPrompt: text("logo_prompt"),
	moodboardStyle: varchar("moodboard_style").notNull(),
	voiceTone: text("voice_tone"),
	voicePersonality: text("voice_personality"),
	keyPhrases: text("key_phrases"),
	isPublished: boolean("is_published").default(false),
	brandbookUrl: varchar("brandbook_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	templateType: varchar("template_type").default('minimal-executive'),
	customDomain: varchar("custom_domain"),
	isLive: boolean("is_live").default(false),
}, (table) => [
	unique("brandbooks_user_id_unique").on(table.userId),
]);

export const claudeMessages = pgTable("claude_messages", {
	id: serial().primaryKey().notNull(),
	conversationId: varchar("conversation_id").notNull(),
	role: varchar().notNull(),
	content: text().notNull(),
	metadata: jsonb(),
	toolCalls: jsonb("tool_calls"),
	toolResults: jsonb("tool_results"),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.conversationId],
			foreignColumns: [claudeConversations.conversationId],
			name: "claude_messages_conversation_id_fkey"
		}),
	check("claude_messages_content_not_empty", sql`(content IS NOT NULL) AND (length(TRIM(BOTH FROM content)) > 0)`),
]);

export const dashboards = pgTable("dashboards", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	config: jsonb().notNull(),
	onboardingData: jsonb("onboarding_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	templateType: varchar("template_type").notNull(),
	quickLinks: jsonb("quick_links"),
	customUrl: varchar("custom_url"),
	isPublished: boolean("is_published").default(false),
	backgroundColor: varchar("background_color").default('#ffffff'),
	accentColor: varchar("accent_color").default('#0a0a0a'),
	isLive: boolean("is_live").default(false),
}, (table) => [
	unique("dashboards_user_id_unique").on(table.userId),
]);

export const claudeConversations = pgTable("claude_conversations", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	agentName: varchar("agent_name").notNull(),
	conversationId: varchar("conversation_id").notNull(),
	title: varchar(),
	status: varchar().default('active'),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }).defaultNow(),
	messageCount: integer("message_count").default(0),
	context: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	adminBypassEnabled: boolean("admin_bypass_enabled").default(false),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "claude_conversations_user_id_fkey"
		}).onDelete("cascade"),
	unique("claude_conversations_conversation_id_key").on(table.conversationId),
]);

export const domains = pgTable("domains", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	domain: varchar().notNull(),
	subdomain: varchar(),
	isVerified: boolean("is_verified").default(false),
	dnsRecords: jsonb("dns_records"),
	sslStatus: varchar("ssl_status").default('pending'),
	connectedTo: varchar("connected_to"),
	resourceId: integer("resource_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "domains_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("domains_domain_unique").on(table.domain),
	unique("domains_subdomain_unique").on(table.subdomain),
]);

export const emailCaptures = pgTable("email_captures", {
	id: serial().primaryKey().notNull(),
	email: varchar().notNull(),
	plan: varchar().notNull(),
	source: varchar().notNull(),
	captured: timestamp({ mode: 'string' }).defaultNow(),
	converted: boolean().default(false),
	userId: varchar("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_captures_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const generationTrackers = pgTable("generation_trackers", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	predictionId: varchar("prediction_id"),
	prompt: text(),
	style: varchar(),
	status: varchar().default('pending'),
	imageUrls: text("image_urls"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "generation_trackers_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const inspirationPhotos = pgTable("inspiration_photos", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	imageUrl: varchar("image_url").notNull(),
	description: text(),
	tags: jsonb(),
	source: varchar().default('upload'),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "inspiration_photos_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const importedSubscribers = pgTable("imported_subscribers", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	source: varchar().notNull(),
	originalId: varchar("original_id").notNull(),
	status: varchar().notNull(),
	tags: jsonb().default([]),
	customFields: jsonb("custom_fields").default({}),
	messengerData: jsonb("messenger_data"),
	importedAt: timestamp("imported_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("unique_subscriber_email").on(table.email),
	unique("unique_subscriber_source_id").on(table.source, table.originalId),
]);

export const mayaChats = pgTable("maya_chats", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	chatTitle: varchar("chat_title", { length: 500 }).notNull(),
	chatSummary: text("chat_summary"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	chatCategory: varchar("chat_category").default('Style Consultation'),
	lastActivity: timestamp("last_activity", { mode: 'string' }).defaultNow(),
});

export const landingPages = pgTable("landing_pages", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	template: varchar().notNull(),
	config: jsonb().notNull(),
	onboardingData: jsonb("onboarding_data"),
	isPublished: boolean("is_published").default(false),
	url: varchar(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	customUrl: varchar("custom_url"),
	customDomain: varchar("custom_domain"),
	isLive: boolean("is_live").default(false),
	seoTitle: varchar("seo_title"),
	seoDescription: text("seo_description"),
});

export const mayaPersonalMemory = pgTable("maya_personal_memory", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	personalBrandId: integer("personal_brand_id"),
	personalInsights: jsonb("personal_insights").default({"growthAreas":[],"coreMotivations":[],"personalityNotes":"","communicationStyle":"","strengthsIdentified":[],"transformationJourney":""}),
	ongoingGoals: jsonb("ongoing_goals").default({"longTermVision":[],"shortTermGoals":[],"challengesToSupport":[],"milestonesToCelebrate":[]}),
	preferredTopics: jsonb("preferred_topics").default([]),
	conversationStyle: jsonb("conversation_style").default({"energyLevel":"balanced","supportType":"friend","communicationTone":"encouraging","motivationApproach":"support"}),
	personalizedStylingNotes: text("personalized_styling_notes"),
	successfulPromptPatterns: jsonb("successful_prompt_patterns").default([]),
	userFeedbackPatterns: jsonb("user_feedback_patterns").default({"lovedElements":[],"requestPatterns":[],"dislikedElements":[]}),
	lastMemoryUpdate: timestamp("last_memory_update", { mode: 'string' }).defaultNow(),
	memoryVersion: integer("memory_version").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_maya_personal_memory_updated").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.lastMemoryUpdate.asc().nullsLast().op("text_ops")),
	index("idx_maya_personal_memory_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.personalBrandId],
			foreignColumns: [userPersonalBrand.id],
			name: "maya_personal_memory_personal_brand_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_personal_memory_user_id_fkey"
		}).onDelete("cascade"),
]);

export const generatedImages = pgTable("generated_images", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	modelId: integer("model_id"),
	category: varchar().notNull(),
	subcategory: varchar().notNull(),
	prompt: text().notNull(),
	imageUrls: text("image_urls").notNull(),
	selectedUrl: text("selected_url"),
	saved: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_generated_images_saved").using("btree", table.saved.asc().nullsLast().op("bool_ops")).where(sql`(saved = true)`),
	index("idx_generated_images_user_created").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	foreignKey({
			columns: [table.modelId],
			foreignColumns: [userModels.id],
			name: "generated_images_model_id_user_models_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "generated_images_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const modelRecoveryLog = pgTable("model_recovery_log", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	oldModelId: varchar("old_model_id", { length: 255 }),
	newModelId: varchar("new_model_id", { length: 255 }),
	recoveryStatus: varchar("recovery_status", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	name: varchar().notNull(),
	description: text(),
	status: varchar().default('draft'),
	templateId: varchar("template_id"),
	customDomain: varchar("custom_domain"),
	aiImagesGenerated: boolean("ai_images_generated").default(false),
	contentGenerated: boolean("content_generated").default(false),
	paymentSetup: boolean("payment_setup").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "projects_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const savedPrompts = pgTable("saved_prompts", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	name: varchar().notNull(),
	description: text(),
	prompt: text().notNull(),
	camera: varchar(),
	texture: varchar(),
	collection: varchar().default('My Prompts'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_prompts_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const sandraConversations = pgTable("sandra_conversations", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	message: text().notNull(),
	response: text().notNull(),
	userStylePreferences: jsonb("user_style_preferences"),
	suggestedPrompt: text("suggested_prompt"),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const selfieUploads = pgTable("selfie_uploads", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	filename: varchar().notNull(),
	originalUrl: varchar("original_url").notNull(),
	processedUrl: varchar("processed_url"),
	processingStatus: varchar("processing_status").default('pending'),
	aiModelOutput: jsonb("ai_model_output"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	uploadProgress: jsonb("upload_progress"),
	validationStatus: varchar("validation_status", { length: 50 }),
	errorDetails: jsonb("error_details"),
	guidedStepCompletion: jsonb("guided_step_completion"),
}, (table) => [
	index("idx_selfie_uploads_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_selfie_uploads_status").using("btree", table.processingStatus.asc().nullsLast().op("text_ops")),
	index("idx_selfie_uploads_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "selfie_uploads_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
});

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const photoSelections = pgTable("photo_selections", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	selectedSelfieIds: jsonb("selected_selfie_ids").notNull(),
	selectedFlatlayCollection: varchar("selected_flatlay_collection").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "photo_selections_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const styleguideTemplates = pgTable("styleguide_templates", {
	id: serial().primaryKey().notNull(),
	templateId: varchar("template_id").notNull(),
	name: varchar().notNull(),
	description: text(),
	colors: jsonb().notNull(),
	typography: jsonb().notNull(),
	styleProfile: jsonb("style_profile").notNull(),
	previewImage: varchar("preview_image"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("styleguide_templates_template_id_key").on(table.templateId),
]);

export const usageHistory = pgTable("usage_history", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	actionType: varchar("action_type").notNull(),
	resourceUsed: varchar("resource_used").notNull(),
	cost: numeric({ precision: 6, scale:  4 }).notNull(),
	details: jsonb(),
	generatedImageId: integer("generated_image_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.generatedImageId],
			foreignColumns: [generatedImages.id],
			name: "usage_history_generated_image_id_generated_images_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "usage_history_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const templates = pgTable("templates", {
	id: serial().primaryKey().notNull(),
	name: varchar().notNull(),
	description: text(),
	category: varchar(),
	previewImageUrl: varchar("preview_image_url"),
	templateData: jsonb("template_data"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	plan: varchar().notNull(),
	status: varchar().notNull(),
	stripeSubscriptionId: varchar("stripe_subscription_id"),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userProfiles = pgTable("user_profiles", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	fullName: varchar("full_name"),
	phone: varchar(),
	location: varchar(),
	instagramHandle: varchar("instagram_handle"),
	websiteUrl: varchar("website_url"),
	bio: text(),
	brandVibe: text("brand_vibe"),
	goals: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_profiles_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_profiles_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userPersonalBrand = pgTable("user_personal_brand", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	transformationStory: text("transformation_story"),
	currentSituation: text("current_situation"),
	futureVision: text("future_vision"),
	businessGoals: text("business_goals"),
	businessType: varchar("business_type"),
	onboardingStep: integer("onboarding_step").default(1),
	isCompleted: boolean("is_completed").default(false),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	stylePreferences: text("style_preferences"),
	photoGoals: text("photo_goals"),
	name: text(),
}, (table) => [
	index("idx_user_personal_brand_completed").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.isCompleted.asc().nullsLast().op("text_ops")),
	index("idx_user_personal_brand_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_personal_brand_user_id_fkey"
		}).onDelete("cascade"),
]);

export const userLandingPages = pgTable("user_landing_pages", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	slug: varchar().notNull(),
	title: varchar().notNull(),
	description: text(),
	htmlContent: text("html_content").notNull(),
	cssContent: text("css_content").notNull(),
	templateUsed: varchar("template_used"),
	isPublished: boolean("is_published").default(false),
	customDomain: varchar("custom_domain"),
	seoTitle: varchar("seo_title"),
	seoDescription: text("seo_description"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_landing_pages_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("user_landing_pages_slug_key").on(table.slug),
]);

export const userSimplifiedProfile = pgTable("user_simplified_profile", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	transformationStory: text("transformation_story"),
	currentSituation: text("current_situation"),
	futureVision: text("future_vision"),
	businessGoals: text("business_goals"),
	businessType: varchar("business_type"),
	stylePreferences: text("style_preferences"),
	photoGoals: text("photo_goals"),
	isCompleted: boolean("is_completed").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_simplified_profile_user_id_fkey"
		}).onDelete("cascade"),
]);

export const userStyleguides = pgTable("user_styleguides", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	templateId: varchar("template_id").notNull(),
	title: varchar().notNull(),
	colors: jsonb().notNull(),
	typography: jsonb().notNull(),
	content: jsonb().notNull(),
	aiImages: jsonb("ai_images"),
	moodboardImages: jsonb("moodboard_images"),
	status: varchar().default('draft'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_styleguides_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userUsage = pgTable("user_usage", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	plan: varchar().notNull(),
	totalGenerationsAllowed: integer("total_generations_allowed"),
	totalGenerationsUsed: integer("total_generations_used").default(0),
	monthlyGenerationsAllowed: integer("monthly_generations_allowed"),
	monthlyGenerationsUsed: integer("monthly_generations_used").default(0),
	totalCostIncurred: numeric("total_cost_incurred", { precision: 10, scale:  4 }).default('0.0000'),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	isLimitReached: boolean("is_limit_reached").default(false),
	lastGenerationAt: timestamp("last_generation_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_user_usage_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_usage_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userUploads = pgTable("user_uploads", {
	id: serial().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	uploadCount: integer("upload_count").default(0),
	uploadStatus: varchar("upload_status", { length: 50 }),
	lastUpload: timestamp("last_upload", { mode: 'string' }),
	completed: boolean().default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
});

export const userWebsiteOnboarding = pgTable("user_website_onboarding", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	personalBrandName: varchar("personal_brand_name", { length: 255 }),
	story: text(),
	businessType: varchar("business_type", { length: 255 }),
	colorPreferences: jsonb("color_preferences").default({}),
	targetAudience: text("target_audience"),
	brandKeywords: jsonb("brand_keywords").default([]),
	goals: text(),
	currentStep: varchar("current_step", { length: 255 }).default('story'),
	isCompleted: boolean("is_completed").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_website_onboarding_user_id_fkey"
		}).onDelete("cascade"),
]);

export const victoriaChats = pgTable("victoria_chats", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	sessionId: varchar("session_id").notNull(),
	message: text().notNull(),
	sender: varchar().notNull(),
	messageType: varchar("message_type").default('text'),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "victoria_chats_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const userModels = pgTable("user_models", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	replicateModelId: varchar("replicate_model_id"),
	triggerWord: varchar("trigger_word").notNull(),
	trainingStatus: varchar("training_status").default('pending'),
	modelName: varchar("model_name"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	replicateVersionId: varchar("replicate_version_id"),
	trainingProgress: integer("training_progress").default(0),
	estimatedCompletionTime: timestamp("estimated_completion_time", { mode: 'string' }),
	failureReason: text("failure_reason"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	trainedModelPath: varchar("trained_model_path", { length: 255 }),
	startedAt: timestamp("started_at", { mode: 'string' }),
	isLuxury: boolean("is_luxury").default(false),
	modelType: varchar("model_type", { length: 255 }).default('flux-standard'),
	finetuneId: varchar("finetune_id", { length: 255 }),
	loraWeightsUrl: varchar("lora_weights_url"),
	trainingId: varchar("training_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_models_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	unique("user_models_user_id_unique").on(table.userId),
	unique("user_models_trigger_word_unique").on(table.triggerWord),
]);

export const users = pgTable("users", {
	id: varchar().primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	stripeCustomerId: varchar("stripe_customer_id"),
	stripeSubscriptionId: varchar("stripe_subscription_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	mayaAiAccess: boolean("maya_ai_access").default(true),
	victoriaAiAccess: boolean("victoria_ai_access").default(false),
	plan: varchar().default('sselfie-studio'),
	role: varchar().default('user'),
	monthlyGenerationLimit: integer("monthly_generation_limit").default(100),
	generationsUsedThisMonth: integer("generations_used_this_month").default(0),
	authProvider: varchar("auth_provider").default('stack-auth'),
	stackAuthUserId: varchar("stack_auth_user_id"),
	displayName: varchar("display_name"),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	profileCompleted: boolean("profile_completed").default(false),
	onboardingStep: integer("onboarding_step").default(0),
	gender: varchar(),
	profession: varchar(),
	brandStyle: varchar("brand_style"),
	photoGoals: text("photo_goals"),
	hasRetrainingAccess: boolean("has_retraining_access").default(false),
	retrainingSessionId: varchar("retraining_session_id"),
	retrainingPaidAt: timestamp("retraining_paid_at", { mode: 'string' }),
	stackAuthId: varchar("stack_auth_id"),
	trainingCoachingStarted: boolean("training_coaching_started").default(false),
	trainingCoachingCompleted: boolean("training_coaching_completed").default(false),
	trainingCoachingPhase: varchar("training_coaching_phase"),
	trainingCoachingStep: integer("training_coaching_step").default(0),
	brandStrategyContext: jsonb("brand_strategy_context"),
	onboardingProgress: jsonb("onboarding_progress").default({}),
	preferredOnboardingMode: varchar("preferred_onboarding_mode").default('conversational'),
	visualTemplate: varchar("visual_template"),
	brandColors: jsonb("brand_colors"),
	typographyPreferences: jsonb("typography_preferences"),
	feedAesthetic: varchar("feed_aesthetic"),
}, (table) => [
	index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	unique("users_email_unique").on(table.email),
	unique("users_stack_auth_id_key").on(table.stackAuthId),
]);

export const websites = pgTable("websites", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	title: varchar().notNull(),
	slug: varchar().notNull(),
	url: varchar(),
	status: varchar().default('draft').notNull(),
	content: jsonb().notNull(),
	templateId: varchar("template_id").default('victoria-editorial'),
	screenshotUrl: varchar("screenshot_url"),
	isPublished: boolean("is_published").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "websites_user_id_fkey"
		}).onDelete("cascade"),
	unique("websites_slug_key").on(table.slug),
]);

export const mayaChatMessages = pgTable("maya_chat_messages", {
	id: serial().primaryKey().notNull(),
	chatId: integer("chat_id").notNull(),
	role: varchar({ length: 50 }).notNull(),
	content: text().notNull(),
	imagePreview: text("image_preview"),
	generatedPrompt: text("generated_prompt"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	conceptCards: text("concept_cards"),
	quickButtons: text("quick_buttons"),
	canGenerate: boolean("can_generate").default(false),
	originalStylingContext: text("original_styling_context"),
	conceptDescription: text("concept_description"),
	stylingDetails: jsonb("styling_details"),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [mayaChats.id],
			name: "maya_chat_messages_chat_id_fkey"
		}).onDelete("cascade"),
	check("maya_chat_messages_role_check", sql`(role)::text = ANY ((ARRAY['user'::character varying, 'maya'::character varying, 'assistant'::character varying])::text[])`),
]);

export const playingWithNeon = pgTable("playing_with_neon", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	value: real(),
});

export const userStyleMemory = pgTable("user_style_memory", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	preferredCategories: jsonb("preferred_categories").default([]),
	favoritePromptPatterns: jsonb("favorite_prompt_patterns").default([]),
	colorPreferences: jsonb("color_preferences").default([]),
	settingPreferences: jsonb("setting_preferences").default([]),
	stylingKeywords: jsonb("styling_keywords").default([]),
	totalInteractions: integer("total_interactions").default(0),
	totalFavorites: integer("total_favorites").default(0),
	averageSessionLength: integer("average_session_length").default(0),
	mostActiveHours: jsonb("most_active_hours").default([]),
	highPerformingPrompts: jsonb("high_performing_prompts").default([]),
	rejectedPrompts: jsonb("rejected_prompts").default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_style_memory_user_id_fkey"
		}).onDelete("cascade"),
]);

export const testPersistence = pgTable("test_persistence", {
	id: serial().primaryKey().notNull(),
	testData: varchar("test_data", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const stackAuthMigrationMarker = pgTable("stack_auth_migration_marker", {
	id: serial().primaryKey().notNull(),
	migrationTimestamp: timestamp("migration_timestamp", { mode: 'string' }).defaultNow(),
	migrationStatus: varchar("migration_status", { length: 50 }).default('COMPLETED'),
	stackAuthReady: boolean("stack_auth_ready").default(true),
	createdBy: varchar("created_by", { length: 50 }).default('SSELFIE_REPLIT_AGENT'),
});

export const promptAnalysis = pgTable("prompt_analysis", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	originalPrompt: text("original_prompt").notNull(),
	generatedPrompt: text("generated_prompt"),
	conceptTitle: text("concept_title"),
	category: varchar(),
	wasGenerated: boolean("was_generated").default(false),
	wasFavorited: boolean("was_favorited").default(false),
	wasSaved: boolean("was_saved").default(false),
	viewDuration: integer("view_duration"),
	promptLength: integer("prompt_length"),
	keywordDensity: jsonb("keyword_density").default({}),
	technicalSpecs: jsonb("technical_specs").default({}),
	generationTime: integer("generation_time"),
	successScore: numeric("success_score", { precision: 3, scale:  2 }).default('0.0'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "prompt_analysis_user_id_fkey"
		}).onDelete("cascade"),
]);

export const aiImages = pgTable("ai_images", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	imageUrl: varchar("image_url").notNull(),
	prompt: text(),
	style: varchar(),
	isSelected: boolean("is_selected").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	predictionId: varchar("prediction_id"),
	generationStatus: varchar("generation_status").default('pending'),
	isFavorite: boolean("is_favorite").default(false),
	generatedPrompt: text("generated_prompt"),
	category: text().default('Lifestyle'),
	source: text().default('maya-chat'),
	supportsTextOverlay: boolean("supports_text_overlay").default(true),
	textOverlayAreas: jsonb("text_overlay_areas"),
}, (table) => [
	index("idx_ai_images_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ai_images_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const feedTemplates = pgTable("feed_templates", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id"),
	name: varchar().notNull(),
	category: varchar().notNull(),
	description: text(),
	textOverlayStyle: jsonb("text_overlay_style"),
	colorPalette: jsonb("color_palette"),
	typographySettings: jsonb("typography_settings"),
	layoutConfig: jsonb("layout_config"),
	isPublic: boolean("is_public").default(false),
	usageCount: integer("usage_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feed_templates_user_id_fkey"
		}),
]);

export const brandedPosts = pgTable("branded_posts", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id"),
	templateId: integer("template_id"),
	originalImageUrl: varchar("original_image_url").notNull(),
	processedImageUrl: varchar("processed_image_url"),
	textOverlay: text("text_overlay"),
	overlayPosition: varchar("overlay_position"),
	overlayStyle: jsonb("overlay_style"),
	socialPlatform: varchar("social_platform"),
	engagementData: jsonb("engagement_data"),
	isPublished: boolean("is_published").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "branded_posts_user_id_fkey"
		}),
	foreignKey({
			columns: [table.templateId],
			foreignColumns: [feedTemplates.id],
			name: "branded_posts_template_id_fkey"
		}),
]);

export const feedCollections = pgTable("feed_collections", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id"),
	name: varchar().notNull(),
	description: text(),
	postIds: jsonb("post_ids"),
	colorTheme: jsonb("color_theme"),
	brandGuidelines: jsonb("brand_guidelines"),
	targetPlatforms: jsonb("target_platforms"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feed_collections_user_id_fkey"
		}),
]);

export const onboardingData = pgTable("onboarding_data", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	brandStory: text("brand_story"),
	personalMission: text("personal_mission"),
	businessGoals: text("business_goals"),
	targetAudience: text("target_audience"),
	businessType: varchar("business_type"),
	brandVoice: varchar("brand_voice"),
	stylePreferences: text("style_preferences"),
	selfieUploadStatus: varchar("selfie_upload_status").default('not_started'),
	aiTrainingStatus: varchar("ai_training_status").default('not_started'),
	currentStep: integer("current_step").default(1),
	completed: boolean().default(false),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});
export const userGenerationStats = pgMaterializedView("user_generation_stats", {	userId: varchar("user_id"),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	totalGenerations: bigint("total_generations", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	savedGenerations: bigint("saved_generations", { mode: "number" }),
	lastGenerationDate: timestamp("last_generation_date", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	generationsLast30Days: bigint("generations_last_30_days", { mode: "number" }),
}).as(sql`SELECT user_id, count(*) AS total_generations, count( CASE WHEN saved = true THEN 1 ELSE NULL::integer END) AS saved_generations, max(created_at) AS last_generation_date, count( CASE WHEN created_at >= (CURRENT_DATE - '30 days'::interval) THEN 1 ELSE NULL::integer END) AS generations_last_30_days FROM generated_images GROUP BY user_id`);