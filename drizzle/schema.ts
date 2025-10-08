import { pgTable, serial, varchar, text, boolean, jsonb, timestamp, integer, numeric, uniqueIndex, index, foreignKey, unique, uuid, check, json, real, inet, pgMaterializedView, bigint } from "drizzle-orm/pg-core"
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
}, (table) => {
	return {
		idxAgentSessionUnique: uniqueIndex("idx_agent_session_unique").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.agentId.asc().nullsLast().op("text_ops"), table.sessionId.asc().nullsLast().op("text_ops")),
		idxAgentSessionUpdated: index("idx_agent_session_updated").using("btree", table.updatedAt.asc().nullsLast().op("timestamp_ops")),
		idxAgentSessionUser: index("idx_agent_session_user").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.agentId.asc().nullsLast().op("text_ops")),
		agentSessionContextsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "agent_session_contexts_user_id_fkey"
		}).onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		brandOnboardingUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "brand_onboarding_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		brandOnboardingUserIdKey: unique("brand_onboarding_user_id_key").on(table.userId),
	}
});

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
}, (table) => {
	return {
		agentLearningUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "agent_learning_user_id_fkey"
		}).onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		brandbooksUserIdUnique: unique("brandbooks_user_id_unique").on(table.userId),
	}
});

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
}, (table) => {
	return {
		claudeMessagesConversationIdFkey: foreignKey({
			columns: [table.conversationId],
			foreignColumns: [claudeConversations.conversationId],
			name: "claude_messages_conversation_id_fkey"
		}),
		claudeMessagesContentNotEmpty: check("claude_messages_content_not_empty", sql`(content IS NOT NULL) AND (length(TRIM(BOTH FROM content)) > 0)`),
	}
});

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
}, (table) => {
	return {
		dashboardsUserIdUnique: unique("dashboards_user_id_unique").on(table.userId),
	}
});

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
}, (table) => {
	return {
		claudeConversationsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "claude_conversations_user_id_fkey"
		}).onDelete("cascade"),
		claudeConversationsConversationIdKey: unique("claude_conversations_conversation_id_key").on(table.conversationId),
	}
});

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
}, (table) => {
	return {
		domainsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "domains_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
		domainsDomainUnique: unique("domains_domain_unique").on(table.domain),
		domainsSubdomainUnique: unique("domains_subdomain_unique").on(table.subdomain),
	}
});

export const emailCaptures = pgTable("email_captures", {
	id: serial().primaryKey().notNull(),
	email: varchar().notNull(),
	plan: varchar().notNull(),
	source: varchar().notNull(),
	captured: timestamp({ mode: 'string' }).defaultNow(),
	converted: boolean().default(false),
	userId: varchar("user_id"),
}, (table) => {
	return {
		emailCapturesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_captures_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		generationTrackersUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "generation_trackers_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const inspirationPhotos = pgTable("inspiration_photos", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	imageUrl: varchar("image_url").notNull(),
	description: text(),
	tags: jsonb(),
	source: varchar().default('upload'),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		inspirationPhotosUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "inspiration_photos_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		uniqueSubscriberEmail: unique("unique_subscriber_email").on(table.email),
		uniqueSubscriberSourceId: unique("unique_subscriber_source_id").on(table.source, table.originalId),
	}
});

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
}, (table) => {
	return {
		idxMayaPersonalMemoryUpdated: index("idx_maya_personal_memory_updated").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.lastMemoryUpdate.asc().nullsLast().op("text_ops")),
		idxMayaPersonalMemoryUserId: index("idx_maya_personal_memory_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaPersonalMemoryPersonalBrandIdFkey: foreignKey({
			columns: [table.personalBrandId],
			foreignColumns: [userPersonalBrand.id],
			name: "maya_personal_memory_personal_brand_id_fkey"
		}).onDelete("cascade"),
		mayaPersonalMemoryUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_personal_memory_user_id_fkey"
		}).onDelete("cascade"),
		mayaPersonalMemoryUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_personal_memory_user_id_users_id_fk"
		}).onDelete("cascade"),
		mayaPersonalMemoryPersonalBrandIdUserPersonalBrandIdF: foreignKey({
			columns: [table.personalBrandId],
			foreignColumns: [userPersonalBrand.id],
			name: "maya_personal_memory_personal_brand_id_user_personal_brand_id_f"
		}).onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		idxGeneratedImagesSaved: index("idx_generated_images_saved").using("btree", table.saved.asc().nullsLast().op("bool_ops")).where(sql`(saved = true)`),
		idxGeneratedImagesUserCreated: index("idx_generated_images_user_created").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
		generatedImagesModelIdUserModelsIdFk: foreignKey({
			columns: [table.modelId],
			foreignColumns: [userModels.id],
			name: "generated_images_model_id_user_models_id_fk"
		}),
		generatedImagesUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "generated_images_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		projectsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "projects_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		savedPromptsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "saved_prompts_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		idxSelfieUploadsCreated: index("idx_selfie_uploads_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
		idxSelfieUploadsStatus: index("idx_selfie_uploads_status").using("btree", table.processingStatus.asc().nullsLast().op("text_ops")),
		idxSelfieUploadsUserId: index("idx_selfie_uploads_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		selfieUploadsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "selfie_uploads_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

export const session = pgTable("session", {
	sid: varchar().primaryKey().notNull(),
	sess: json().notNull(),
	expire: timestamp({ precision: 6, mode: 'string' }).notNull(),
});

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => {
	return {
		idxSessionExpire: index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
	}
});

export const photoSelections = pgTable("photo_selections", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	selectedSelfieIds: jsonb("selected_selfie_ids").notNull(),
	selectedFlatlayCollection: varchar("selected_flatlay_collection").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		photoSelectionsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "photo_selections_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		styleguideTemplatesTemplateIdKey: unique("styleguide_templates_template_id_key").on(table.templateId),
	}
});

export const usageHistory = pgTable("usage_history", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	actionType: varchar("action_type").notNull(),
	resourceUsed: varchar("resource_used").notNull(),
	cost: numeric({ precision: 6, scale:  4 }).notNull(),
	details: jsonb(),
	generatedImageId: integer("generated_image_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		usageHistoryGeneratedImageIdGeneratedImagesIdFk: foreignKey({
			columns: [table.generatedImageId],
			foreignColumns: [generatedImages.id],
			name: "usage_history_generated_image_id_generated_images_id_fk"
		}),
		usageHistoryUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "usage_history_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		subscriptionsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "subscriptions_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		userProfilesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_profiles_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		userProfilesUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_profiles_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		idxUserPersonalBrandCompleted: index("idx_user_personal_brand_completed").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.isCompleted.asc().nullsLast().op("text_ops")),
		idxUserPersonalBrandUserId: index("idx_user_personal_brand_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		userPersonalBrandUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_personal_brand_user_id_fkey"
		}).onDelete("cascade"),
		userPersonalBrandUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_personal_brand_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		userLandingPagesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_landing_pages_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		userLandingPagesSlugKey: unique("user_landing_pages_slug_key").on(table.slug),
	}
});

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
}, (table) => {
	return {
		userSimplifiedProfileUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_simplified_profile_user_id_fkey"
		}).onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		userStyleguidesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_styleguides_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		idxUserUsageUserId: index("idx_user_usage_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		userUsageUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_usage_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		userWebsiteOnboardingUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_website_onboarding_user_id_fkey"
		}).onDelete("cascade"),
	}
});

export const victoriaChats = pgTable("victoria_chats", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	sessionId: varchar("session_id").notNull(),
	message: text().notNull(),
	sender: varchar().notNull(),
	messageType: varchar("message_type").default('text'),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		victoriaChatsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "victoria_chats_user_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		userModelsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_models_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
		userModelsUserIdUnique: unique("user_models_user_id_unique").on(table.userId),
		userModelsTriggerWordUnique: unique("user_models_trigger_word_unique").on(table.triggerWord),
	}
});

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
	onboardingProgress: jsonb("onboarding_progress").default({}),
	preferredOnboardingMode: varchar("preferred_onboarding_mode").default('conversational'),
	visualTemplate: varchar("visual_template"),
	brandColors: jsonb("brand_colors"),
	typographyPreferences: jsonb("typography_preferences"),
	feedAesthetic: varchar("feed_aesthetic"),
	stackAuthId: varchar("stack_auth_id", { length: 255 }),
	legacyUserId: varchar("legacy_user_id", { length: 255 }),
}, (table) => {
	return {
		idxLegacyUserId: index("idx_legacy_user_id").using("btree", table.legacyUserId.asc().nullsLast().op("text_ops")),
		idxUsersEmail: index("idx_users_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
		usersEmailUnique: unique("users_email_unique").on(table.email),
		usersStackAuthIdKey: unique("users_stack_auth_id_key").on(table.stackAuthId),
	}
});

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
}, (table) => {
	return {
		websitesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "websites_user_id_fkey"
		}).onDelete("cascade"),
		websitesSlugKey: unique("websites_slug_key").on(table.slug),
	}
});

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
}, (table) => {
	return {
		mayaChatMessagesChatIdFkey: foreignKey({
			columns: [table.chatId],
			foreignColumns: [mayaChats.id],
			name: "maya_chat_messages_chat_id_fkey"
		}).onDelete("cascade"),
		mayaChatMessagesRoleCheck: check("maya_chat_messages_role_check", sql`(role)::text = ANY ((ARRAY['user'::character varying, 'maya'::character varying, 'assistant'::character varying])::text[])`),
	}
});

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
}, (table) => {
	return {
		userStyleMemoryUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_style_memory_user_id_fkey"
		}).onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		promptAnalysisUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "prompt_analysis_user_id_fkey"
		}).onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		idxAiImagesUserId: index("idx_ai_images_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		aiImagesUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ai_images_user_id_users_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	}
});

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
}, (table) => {
	return {
		feedTemplatesUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feed_templates_user_id_fkey"
		}),
	}
});

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
}, (table) => {
	return {
		brandedPostsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "branded_posts_user_id_fkey"
		}),
		brandedPostsTemplateIdFkey: foreignKey({
			columns: [table.templateId],
			foreignColumns: [feedTemplates.id],
			name: "branded_posts_template_id_fkey"
		}),
	}
});

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
}, (table) => {
	return {
		feedCollectionsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feed_collections_user_id_fkey"
		}),
	}
});

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

export const approvalQueue = pgTable("approval_queue", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	agentId: varchar("agent_id").notNull(),
	contentType: varchar("content_type").notNull(),
	contentTitle: varchar("content_title").notNull(),
	contentPreview: text("content_preview").notNull(),
	fullContent: jsonb("full_content").notNull(),
	targetAudience: varchar("target_audience"),
	impactLevel: varchar("impact_level").default('medium'),
	estimatedCost: numeric("estimated_cost", { precision: 10, scale:  2 }),
	status: varchar().default('pending'),
	adminComments: text("admin_comments"),
	originalConversationId: varchar("original_conversation_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	approvedBy: varchar("approved_by"),
}, (table) => {
	return {
		idxApprovalQueueStatus: index("idx_approval_queue_status").using("btree", table.status.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
		idxApprovalQueueUser: index("idx_approval_queue_user").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.status.asc().nullsLast().op("text_ops")),
		approvalQueueUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "approval_queue_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const agentBudgets = pgTable("agent_budgets", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	agentId: varchar("agent_id"),
	budgetType: varchar("budget_type").notNull(),
	budgetLimit: numeric("budget_limit", { precision: 10, scale:  2 }).notNull(),
	currentSpend: numeric("current_spend", { precision: 10, scale:  2 }).default('0.00'),
	isActive: boolean("is_active").default(true),
	resetDate: timestamp("reset_date", { mode: 'string' }),
	alertThreshold: integer("alert_threshold").default(80),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		agentBudgetsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "agent_budgets_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const agentCostTracking = pgTable("agent_cost_tracking", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	agentId: varchar("agent_id").notNull(),
	conversationId: varchar("conversation_id"),
	apiCalls: integer("api_calls").default(0),
	tokensUsed: integer("tokens_used").default(0),
	estimatedCost: numeric("estimated_cost", { precision: 10, scale:  4 }).default('0.0000'),
	date: timestamp({ mode: 'string' }).defaultNow(),
	taskType: varchar("task_type"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		idxCostTrackingUserAgentDate: index("idx_cost_tracking_user_agent_date").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.agentId.asc().nullsLast().op("timestamp_ops"), table.date.asc().nullsLast().op("text_ops")),
		agentCostTrackingUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "agent_cost_tracking_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const agentHandoffRequests = pgTable("agent_handoff_requests", {
	id: serial().primaryKey().notNull(),
	fromAgentId: varchar("from_agent_id").notNull(),
	toTargetType: varchar("to_target_type").notNull(),
	toTargetId: varchar("to_target_id"),
	requestType: varchar("request_type").notNull(),
	contextSummary: text("context_summary").notNull(),
	urgencyLevel: varchar("urgency_level").default('normal'),
	conversationId: varchar("conversation_id"),
	originalTask: text("original_task"),
	currentProgress: jsonb("current_progress"),
	status: varchar().default('pending'),
	responseRequired: boolean("response_required").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
});

export const agentSessions = pgTable("agent_sessions", {
	id: serial().primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	userId: varchar("user_id").notNull(),
	conversationId: varchar("conversation_id"),
	status: varchar().default('active'),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
}, (table) => {
	return {
		agentSessionsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "agent_sessions_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const agentTrainingSessions = pgTable("agent_training_sessions", {
	id: serial().primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	sessionType: varchar("session_type").notNull(),
	trainingData: jsonb("training_data").notNull(),
	improvements: text(),
	performanceGain: numeric("performance_gain"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	trainedBy: varchar("trained_by"),
});

export const emailAccounts = pgTable("email_accounts", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	accountType: varchar("account_type").notNull(),
	email: varchar().notNull(),
	provider: varchar().notNull(),
	displayName: varchar("display_name"),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	isActive: boolean("is_active").default(true),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		emailAccountsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_accounts_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const instagramMessages = pgTable("instagram_messages", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	platform: varchar().notNull(),
	externalId: varchar("external_id").notNull(),
	fromUsername: varchar("from_username").notNull(),
	fromId: varchar("from_id").notNull(),
	message: text().notNull(),
	messageType: varchar("message_type").notNull(),
	receivedAt: timestamp("received_at", { mode: 'string' }).notNull(),
	category: varchar().notNull(),
	priority: varchar().notNull(),
	sentiment: varchar().notNull(),
	needsResponse: boolean("needs_response").default(false),
	hasResponse: boolean("has_response").default(false),
	isBusinessOpportunity: boolean("is_business_opportunity").default(false),
	tags: jsonb(),
	aiSummary: text("ai_summary"),
	suggestedResponse: text("suggested_response"),
	isArchived: boolean("is_archived").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		instagramMessagesUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "instagram_messages_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const processedEmails = pgTable("processed_emails", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	accountId: integer("account_id").notNull(),
	externalId: varchar("external_id").notNull(),
	fromAddress: varchar("from_address").notNull(),
	toAddresses: jsonb("to_addresses").notNull(),
	subject: text().notNull(),
	bodyPreview: text("body_preview"),
	receivedAt: timestamp("received_at", { mode: 'string' }).notNull(),
	category: varchar().notNull(),
	priority: varchar().notNull(),
	needsResponse: boolean("needs_response").default(false),
	hasResponse: boolean("has_response").default(false),
	sentiment: varchar().notNull(),
	tags: jsonb(),
	aiSummary: text("ai_summary"),
	suggestedResponse: text("suggested_response"),
	isArchived: boolean("is_archived").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		processedEmailsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "processed_emails_user_id_users_id_fk"
		}).onDelete("cascade"),
		processedEmailsAccountIdEmailAccountsIdFk: foreignKey({
			columns: [table.accountId],
			foreignColumns: [emailAccounts.id],
			name: "processed_emails_account_id_email_accounts_id_fk"
		}).onDelete("cascade"),
	}
});

export const userGeneratedWebsites = pgTable("user_generated_websites", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	onboardingId: integer("onboarding_id"),
	title: varchar().notNull(),
	subdomain: varchar({ length: 63 }),
	customDomain: varchar("custom_domain"),
	isPublished: boolean("is_published").default(false),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	htmlContent: text("html_content"),
	cssContent: text("css_content"),
	jsContent: text("js_content"),
	designData: jsonb("design_data"),
	seoMeta: jsonb("seo_meta"),
	analyticsId: varchar("analytics_id"),
	lastBackup: timestamp("last_backup", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		userGeneratedWebsitesUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_generated_websites_user_id_users_id_fk"
		}).onDelete("cascade"),
		userGeneratedWebsitesSubdomainKey: unique("user_generated_websites_subdomain_key").on(table.subdomain),
	}
});

export const websiteBuilderConversations = pgTable("website_builder_conversations", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	websiteId: integer("website_id"),
	onboardingId: integer("onboarding_id"),
	messages: jsonb().default([]).notNull(),
	context: jsonb().default({}),
	lastActivity: timestamp("last_activity", { mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true),
	conversationType: varchar("conversation_type").default('onboarding'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		websiteBuilderConversationsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "website_builder_conversations_user_id_users_id_fk"
		}).onDelete("cascade"),
		websiteBuilderConversationsWebsiteIdUserGeneratedWebsite: foreignKey({
			columns: [table.websiteId],
			foreignColumns: [userGeneratedWebsites.id],
			name: "website_builder_conversations_website_id_user_generated_website"
		}).onDelete("cascade"),
	}
});

export const loraWeights = pgTable("lora_weights", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	trainingRunId: integer("training_run_id").notNull(),
	triggerWord: varchar("trigger_word").notNull(),
	baseModel: varchar("base_model").default('flux-dev').notNull(),
	s3Bucket: varchar("s3_bucket"),
	s3Key: varchar("s3_key"),
	fileSize: integer("file_size"),
	checksum: varchar(),
	rank: integer().default(32),
	networkType: varchar("network_type").default('lora'),
	status: varchar().default('available'),
	defaultScales: jsonb("default_scales"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		statusIdx: index("lora_weights_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
		trainingRunIdx: index("lora_weights_training_run_idx").using("btree", table.trainingRunId.asc().nullsLast().op("int4_ops")),
		triggerWordIdx: index("lora_weights_trigger_word_idx").using("btree", table.triggerWord.asc().nullsLast().op("text_ops")),
		userIdIdx: index("lora_weights_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		loraWeightsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "lora_weights_user_id_fkey"
		}).onDelete("cascade"),
		loraWeightsTrainingRunIdFkey: foreignKey({
			columns: [table.trainingRunId],
			foreignColumns: [trainingRuns.id],
			name: "lora_weights_training_run_id_fkey"
		}).onDelete("cascade"),
	}
});

export const trainingRuns = pgTable("training_runs", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	trainingId: varchar("training_id").notNull(),
	status: varchar().notNull(),
	progress: integer().default(0),
	baseModel: varchar("base_model").default('flux-dev'),
	parameters: jsonb(),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	datasetZipUrl: text("dataset_zip_url"),
	outputArtifactUrl: text("output_artifact_url"),
	error: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		statusIdx: index("training_runs_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
		trainingIdIdx: index("training_runs_training_id_idx").using("btree", table.trainingId.asc().nullsLast().op("text_ops")),
		userIdIdx: index("training_runs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		trainingRunsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "training_runs_user_id_fkey"
		}).onDelete("cascade"),
	}
});

export const conceptCards = pgTable("concept_cards", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	conversationId: varchar("conversation_id"),
	clientId: varchar("client_id"),
	title: varchar().notNull(),
	description: text(),
	images: jsonb(),
	tags: jsonb(),
	status: varchar().default('draft'),
	sortOrder: integer("sort_order").default(0),
	generatedImages: jsonb("generated_images"),
	isLoading: boolean("is_loading").default(false),
	isGenerating: boolean("is_generating").default(false),
	hasGenerated: boolean("has_generated").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		idxConceptCardsClientId: index("idx_concept_cards_client_id").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.clientId.asc().nullsLast().op("text_ops")),
		idxConceptCardsConversation: index("idx_concept_cards_conversation").using("btree", table.conversationId.asc().nullsLast().op("text_ops")),
		idxConceptCardsSort: index("idx_concept_cards_sort").using("btree", table.sortOrder.asc().nullsLast().op("int4_ops")),
		idxConceptCardsUser: index("idx_concept_cards_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	}
});

export const imageVariants = pgTable("image_variants", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	originalImageId: integer("original_image_id"),
	originalImageType: varchar("original_image_type").notNull(),
	imageUrl: varchar("image_url").notNull(),
	kind: varchar().notNull(),
	prompt: text(),
	maskData: text("mask_data"),
	predictionId: varchar("prediction_id"),
	generationStatus: varchar("generation_status").default('pending'),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		idxImageVariantsKind: index("idx_image_variants_kind").using("btree", table.kind.asc().nullsLast().op("text_ops")),
		idxImageVariantsOriginal: index("idx_image_variants_original").using("btree", table.originalImageId.asc().nullsLast().op("int4_ops")),
		idxImageVariantsStatus: index("idx_image_variants_status").using("btree", table.generationStatus.asc().nullsLast().op("text_ops")),
		idxImageVariantsUser: index("idx_image_variants_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		idxImageVariantsUserId: index("idx_image_variants_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		imageVariantsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "image_variants_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const generatedVideos = pgTable("generated_videos", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	imageId: integer("image_id"),
	imageSource: varchar("image_source").default('generated'),
	motionPrompt: text("motion_prompt").notNull(),
	videoUrl: varchar("video_url"),
	jobId: varchar("job_id").notNull(),
	status: varchar().default('pending'),
	estimatedTime: varchar("estimated_time"),
	progress: integer().default(0),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
}, (table) => {
	return {
		jobIdIdx: index("generated_videos_job_id_idx").using("btree", table.jobId.asc().nullsLast().op("text_ops")),
		statusIdx: index("generated_videos_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
		userIdIdx: index("generated_videos_user_id_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		generatedVideosUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "generated_videos_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const liveSessions = pgTable("live_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	deckUrl: text("deck_url"),
	mentiUrl: text("menti_url"),
	ctaUrl: text("cta_url"),
	title: text().notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const brandAssets = pgTable("brand_assets", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	kind: varchar().notNull(),
	url: varchar().notNull(),
	filename: varchar().notNull(),
	fileSize: integer("file_size"),
	meta: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		idxBrandAssetsKind: index("idx_brand_assets_kind").using("btree", table.kind.asc().nullsLast().op("text_ops")),
		idxBrandAssetsUser: index("idx_brand_assets_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		brandAssetsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "brand_assets_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const hairLeads = pgTable("hair_leads", {
	id: serial().primaryKey().notNull(),
	navn: varchar().notNull(),
	epost: varchar().notNull(),
	telefon: varchar(),
	kilde: varchar().default('qr-code'),
	interesse: text(),
	levelpartnerSynced: boolean("levelpartner_synced").default(false),
	levelpartnerSyncedAt: timestamp("levelpartner_synced_at", { mode: 'string' }),
	status: varchar().default('new'),
	notater: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		idxHairLeadsCreated: index("idx_hair_leads_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
		idxHairLeadsEpost: index("idx_hair_leads_epost").using("btree", table.epost.asc().nullsLast().op("text_ops")),
		idxHairLeadsKilde: index("idx_hair_leads_kilde").using("btree", table.kilde.asc().nullsLast().op("text_ops")),
	}
});

export const schemaMigrationLog = pgTable("schema_migration_log", {
	id: serial().primaryKey().notNull(),
	phase: text().notNull(),
	operation: text().notNull(),
	status: text().notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const queryPerformanceLog = pgTable("query_performance_log", {
	id: serial().primaryKey().notNull(),
	queryHash: text("query_hash").notNull(),
	executionTime: integer("execution_time").notNull(),
	queryContext: text("query_context").notNull(),
	metadata: jsonb().default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const migrationVerification = pgTable("migration_verification", {
	id: serial().primaryKey().notNull(),
	sourceTable: text("source_table").notNull(),
	targetTable: text("target_table").notNull(),
	verificationType: text("verification_type").notNull(),
	sourceCount: integer("source_count"),
	targetCount: integer("target_count"),
	matchingRows: integer("matching_rows"),
	status: text().notNull(),
	discrepancies: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const schemaSnapshot = pgTable("schema_snapshot", {
	id: serial().primaryKey().notNull(),
	tableName: text("table_name").notNull(),
	columnCount: integer("column_count").notNull(),
	rowCount: integer("row_count").notNull(),
	indexCount: integer("index_count").notNull(),
	foreignKeys: jsonb("foreign_keys").default([]).notNull(),
	schema: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const mayaSubscriptions = pgTable("maya_subscriptions", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	stripeCustomerId: varchar("stripe_customer_id"),
	stripeSubscriptionId: varchar("stripe_subscription_id"),
	plan: varchar().notNull(),
	status: varchar().notNull(),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
	generationsPerMonth: integer("generations_per_month").default(100),
	generationsUsed: integer("generations_used").default(0),
	generationsRemaining: integer("generations_remaining"),
	storyStudioEnabled: boolean("story_studio_enabled").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
}, (table) => {
	return {
		idxMayaSubscriptionsStatus: index("idx_maya_subscriptions_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
		idxMayaSubscriptionsUser: index("idx_maya_subscriptions_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaSubscriptionsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_subscriptions_user_id_fkey"
		}).onDelete("cascade"),
	}
});

export const mayaPayments = pgTable("maya_payments", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	stripeSessionId: varchar("stripe_session_id"),
	stripePaymentIntentId: varchar("stripe_payment_intent_id"),
	amount: integer().notNull(),
	currency: varchar().default('eur'),
	status: varchar().default('pending'),
	paymentMethod: varchar("payment_method"),
	errorMessage: text("error_message"),
	customerEmail: varchar("customer_email"),
	description: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	succeededAt: timestamp("succeeded_at", { mode: 'string' }),
}, (table) => {
	return {
		idxMayaPaymentsSession: index("idx_maya_payments_session").using("btree", table.stripeSessionId.asc().nullsLast().op("text_ops")),
		idxMayaPaymentsStatus: index("idx_maya_payments_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
		idxMayaPaymentsUser: index("idx_maya_payments_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		idxMayaPaymentsUserId: index("idx_maya_payments_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaPaymentsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_payments_user_id_fkey"
		}).onDelete("cascade"),
		mayaPaymentsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_payments_user_id_users_id_fk"
		}).onDelete("cascade"),
		mayaPaymentsStripeSessionIdKey: unique("maya_payments_stripe_session_id_key").on(table.stripeSessionId),
	}
});

export const mayaUsageTracking = pgTable("maya_usage_tracking", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	actionType: varchar("action_type").notNull(),
	resourceType: varchar("resource_type").notNull(),
	cost: numeric({ precision: 10, scale:  4 }),
	quotaUsed: integer("quota_used").default(1),
	modelId: varchar("model_id"),
	promptTokens: integer("prompt_tokens"),
	completionTokens: integer("completion_tokens"),
	requestId: varchar("request_id"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		idxMayaUsageAction: index("idx_maya_usage_action").using("btree", table.actionType.asc().nullsLast().op("text_ops")),
		idxMayaUsageDate: index("idx_maya_usage_date").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
		idxMayaUsageUser: index("idx_maya_usage_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaUsageTrackingUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_usage_tracking_user_id_fkey"
		}).onDelete("cascade"),
	}
});

export const mayaUsageBudgets = pgTable("maya_usage_budgets", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	budgetType: varchar("budget_type").notNull(),
	generationLimit: integer("generation_limit").notNull(),
	resetDate: timestamp("reset_date", { mode: 'string' }),
	currentUsage: integer("current_usage").default(0),
	isLimitReached: boolean("is_limit_reached").default(false),
	alertThreshold: integer("alert_threshold").default(80),
	isActive: boolean("is_active").default(true),
	isOverridden: boolean("is_overridden").default(false),
	overrideReason: text("override_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		idxMayaBudgetsActive: index("idx_maya_budgets_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
		idxMayaBudgetsUser: index("idx_maya_budgets_user").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaUsageBudgetsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_usage_budgets_user_id_fkey"
		}).onDelete("cascade"),
	}
});

export const userStyleProfile = pgTable("user_style_profile", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	personalBrandId: integer("personal_brand_id"),
	styleCategories: jsonb("style_categories").default([]),
	colorPreferences: jsonb("color_preferences").default({"avoidColors":[],"accentColors":[],"primaryColors":[]}),
	settingsPreferences: jsonb("settings_preferences").default([]),
	locationVibes: jsonb("location_vibes").default([]),
	clothingPreferences: jsonb("clothing_preferences").default({"comfortLevel":"moderate","favoriteItems":[],"occasionTypes":[],"preferredStyles":[],"bodyTypeConsiderations":[]}),
	beautyPreferences: jsonb("beauty_preferences").default({"makeupStyle":"natural","hairPreferences":[],"beautyComfortLevel":"moderate","skinToneConsiderations":""}),
	styleAvoidances: jsonb("style_avoidances").default([]),
	boundariesAndLimits: text("boundaries_and_limits"),
	inspirationImages: jsonb("inspiration_images").default([]),
	styleIcons: jsonb("style_icons").default([]),
	brandReferences: jsonb("brand_references").default([]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => {
	return {
		idxUserStyleProfileUserId: index("idx_user_style_profile_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		userStyleProfileUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_style_profile_user_id_users_id_fk"
		}).onDelete("cascade"),
		userStyleProfilePersonalBrandIdUserPersonalBrandIdFk: foreignKey({
			columns: [table.personalBrandId],
			foreignColumns: [userPersonalBrand.id],
			name: "user_style_profile_personal_brand_id_user_personal_brand_id_fk"
		}).onDelete("cascade"),
	}
});

export const liveEvents = pgTable("live_events", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id").notNull(),
	eventType: varchar("event_type").notNull(),
	meta: jsonb().default({}),
	userAgent: text("user_agent"),
	ipAddress: inet("ip_address"),
	utmSource: varchar("utm_source"),
	utmCampaign: varchar("utm_campaign"),
	utmMedium: varchar("utm_medium"),
	utmContent: varchar("utm_content"),
	utmTerm: varchar("utm_term"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		idxLiveEventsAnalytics: index("idx_live_events_analytics").using("btree", table.sessionId.asc().nullsLast().op("text_ops"), table.eventType.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("uuid_ops")),
		idxLiveEventsCreatedAt: index("idx_live_events_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamptz_ops")),
		idxLiveEventsSessionId: index("idx_live_events_session_id").using("btree", table.sessionId.asc().nullsLast().op("uuid_ops")),
		idxLiveEventsSessionType: index("idx_live_events_session_type").using("btree", table.sessionId.asc().nullsLast().op("text_ops"), table.eventType.asc().nullsLast().op("text_ops")),
		idxLiveEventsType: index("idx_live_events_type").using("btree", table.eventType.asc().nullsLast().op("text_ops")),
		idxLiveEventsUtmSource: index("idx_live_events_utm_source").using("btree", table.utmSource.asc().nullsLast().op("text_ops")),
		liveEventsSessionIdLiveSessionsIdFk: foreignKey({
			columns: [table.sessionId],
			foreignColumns: [liveSessions.id],
			name: "live_events_session_id_live_sessions_id_fk"
		}).onDelete("cascade"),
	}
});

export const legacyVictoriaChats = pgTable("legacy_victoria_chats", {
	id: integer(),
	userId: varchar("user_id"),
	sessionId: varchar("session_id"),
	message: text(),
	sender: varchar(),
	messageType: varchar("message_type"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }),
});

export const legacyMigrations = pgTable("legacy_migrations", {
	id: serial().primaryKey().notNull(),
	tableName: text("table_name").notNull(),
	migratedAt: timestamp("migrated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	rowCount: integer("row_count"),
});

export const mayaProfile = pgTable("maya_profile", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	onboardingStatus: varchar("onboarding_status").default('pending'),
	onboardingStep: integer("onboarding_step").default(1),
	completedSteps: jsonb("completed_steps").default([]),
	preferences: jsonb().default({}),
	billingInfo: jsonb("billing_info").default({}),
	totalGenerations: integer("total_generations").default(0),
	monthlyGenerations: integer("monthly_generations").default(0),
	lastResetDate: timestamp("last_reset_date", { mode: 'string' }).defaultNow(),
	featureAccess: jsonb("feature_access").default({"basicGeneration":true}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		idxMayaProfileGenerations: index("idx_maya_profile_generations").using("btree", table.userId.asc().nullsLast().op("int4_ops"), table.monthlyGenerations.asc().nullsLast().op("text_ops")),
		idxMayaProfileOnboarding: index("idx_maya_profile_onboarding").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.onboardingStatus.asc().nullsLast().op("text_ops")),
		idxMayaProfileUserId: index("idx_maya_profile_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaProfileUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_profile_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const mayaImages = pgTable("maya_images", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	url: varchar().notNull(),
	thumbnailUrl: varchar("thumbnail_url"),
	category: varchar(),
	subcategory: varchar(),
	metadata: jsonb().default({}),
	isFavorite: boolean("is_favorite").default(false),
	isArchived: boolean("is_archived").default(false),
	rating: integer(),
	viewCount: integer("view_count").default(0),
	shareCount: integer("share_count").default(0),
	downloadCount: integer("download_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		idxMayaImagesCategory: index("idx_maya_images_category").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.category.asc().nullsLast().op("text_ops")),
		idxMayaImagesCreated: index("idx_maya_images_created").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
		idxMayaImagesFavorites: index("idx_maya_images_favorites").using("btree", table.userId.asc().nullsLast().op("bool_ops"), table.isFavorite.asc().nullsLast().op("text_ops")),
		idxMayaImagesUserId: index("idx_maya_images_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaImagesUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_images_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const mayaModels = pgTable("maya_models", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	modelType: varchar("model_type").notNull(),
	trainingStatus: varchar("training_status").notNull(),
	trainingProgress: integer("training_progress").default(0),
	metadata: jsonb().default({}),
	qualityScore: integer("quality_score"),
	usageCount: integer("usage_count").default(0),
	lastUsed: timestamp("last_used", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		idxMayaModelsStatus: index("idx_maya_models_status").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.trainingStatus.asc().nullsLast().op("text_ops")),
		idxMayaModelsType: index("idx_maya_models_type").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.modelType.asc().nullsLast().op("text_ops")),
		idxMayaModelsUserId: index("idx_maya_models_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaModelsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_models_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const mayaConcepts = pgTable("maya_concepts", {
	id: serial().primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	title: varchar().notNull(),
	description: text(),
	prompt: text(),
	type: varchar(),
	metadata: jsonb().default({}),
	usageCount: integer("usage_count").default(0),
	successRate: integer("success_rate"),
	avgRating: numeric("avg_rating", { precision: 3, scale:  2 }),
	status: varchar().default('active'),
	tags: jsonb().default([]),
	isTemplate: boolean("is_template").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => {
	return {
		idxMayaConceptsStatus: index("idx_maya_concepts_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
		idxMayaConceptsType: index("idx_maya_concepts_type").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.type.asc().nullsLast().op("text_ops")),
		idxMayaConceptsUsage: index("idx_maya_concepts_usage").using("btree", table.usageCount.asc().nullsLast().op("int4_ops")),
		idxMayaConceptsUserId: index("idx_maya_concepts_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
		mayaConceptsUserIdUsersIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "maya_concepts_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
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