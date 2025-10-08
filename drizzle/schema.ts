import { pgTable, serial, varchar, text, boolean, jsonb, timestamp, integer, numeric, uniqueIndex, index, foreignKey, unique, uuid, json, real, inet } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const agentCapabilities = pgTable("agent_capabilities", {
	id: serial("id").primaryKey().notNull(),
	agentName: varchar("agent_name").notNull(),
	capabilityType: varchar("capability_type").notNull(),
	name: varchar("name").notNull(),
	description: text("description"),
	enabled: boolean("enabled").default(true),
	config: jsonb("config"),
	version: varchar("version").default(1),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const agentConversations = pgTable("agent_conversations", {
	id: serial("id").primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	userId: varchar("user_id").notNull(),
	userMessage: text("user_message").notNull(),
	agentResponse: text("agent_response").notNull(),
	devPreview: jsonb("dev_preview"),
	timestamp: timestamp("timestamp", { mode: 'string' }).defaultNow(),
	conversationTitle: varchar("conversation_title"),
	conversationData: jsonb("conversation_data"),
	messageCount: integer("message_count").default(0),
	lastAgentResponse: text("last_agent_response"),
	isActive: boolean("is_active").default(true),
	isStarred: boolean("is_starred").default(false),
	isArchived: boolean("is_archived").default(false),
	tags: jsonb("tags").default([]),
	parentThreadId: integer("parent_thread_id"),
	branchedFromMessageId: varchar("branched_from_message_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const agentKnowledgeBase = pgTable("agent_knowledge_base", {
	id: serial("id").primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	topic: varchar("topic").notNull(),
	content: text("content").notNull(),
	source: varchar("source").notNull(),
	confidence: numeric("confidence").notNull(),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
	tags: text("tags").array(),
});

export const agentSessionContexts = pgTable("agent_session_contexts", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
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
},
(table) => {
	return {
		idxAgentSessionUnique: uniqueIndex("idx_agent_session_unique").using("btree", table.userId, table.agentId, table.sessionId),
		idxAgentSessionUpdated: index("idx_agent_session_updated").using("btree", table.updatedAt),
		idxAgentSessionUser: index("idx_agent_session_user").using("btree", table.userId, table.agentId),
	}
});

export const agentPerformanceMetrics = pgTable("agent_performance_metrics", {
	id: serial("id").primaryKey().notNull(),
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
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
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
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	stylePreference: varchar("style_preference").default('editorial-luxury'),
	colorScheme: varchar("color_scheme").default('black-white-editorial'),
	typographyStyle: varchar("typography_style").default('times-editorial'),
	designPersonality: varchar("design_personality").default('sophisticated'),
	feedPersonality: varchar("feed_personality"),
	preferredTypography: varchar("preferred_typography"),
	brandMessagingStyle: varchar("brand_messaging_style"),
},
(table) => {
	return {
		brandOnboardingUserIdKey: unique("brand_onboarding_user_id_key").on(table.userId),
	}
});

export const agentTasks = pgTable("agent_tasks", {
	taskId: uuid("task_id").defaultRandom().primaryKey().notNull(),
	agentName: text("agent_name").notNull(),
	instruction: text("instruction").notNull(),
	conversationContext: jsonb("conversation_context"),
	priority: text("priority").default('medium'),
	completionCriteria: jsonb("completion_criteria"),
	qualityGates: jsonb("quality_gates"),
	estimatedDuration: integer("estimated_duration"),
	status: text("status").default('pending'),
	progress: integer("progress").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	executionData: jsonb("execution_data"),
	implementations: jsonb("implementations"),
	rollbackPlan: jsonb("rollback_plan"),
	validationResults: jsonb("validation_results"),
	results: jsonb("results"),
	validationStatus: text("validation_status"),
	errorLog: text("error_log"),
});

export const architectureAuditLog = pgTable("architecture_audit_log", {
	id: serial("id").primaryKey().notNull(),
	auditDate: timestamp("audit_date", { mode: 'string' }).defaultNow(),
	totalUsers: integer("total_users"),
	compliantUsers: integer("compliant_users"),
	violationsFound: text("violations_found").array(),
	violationsFixed: text("violations_fixed").array(),
	auditStatus: varchar("audit_status", { length: 50 }),
});

export const agentLearning = pgTable("agent_learning", {
	id: serial("id").primaryKey().notNull(),
	agentName: varchar("agent_name").notNull(),
	userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" } ),
	learningType: varchar("learning_type").notNull(),
	category: varchar("category"),
	data: jsonb("data").notNull(),
	confidence: numeric("confidence", { precision: 3, scale:  2 }).default('0.5'),
	frequency: integer("frequency").default(1),
	lastSeen: timestamp("last_seen", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	intelligenceLevel: integer("intelligence_level").default(7),
	memoryStrength: numeric("memory_strength", { precision: 3, scale:  2 }).default('0.7'),
});

export const brandbooks = pgTable("brandbooks", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	businessName: varchar("business_name").notNull(),
	tagline: varchar("tagline"),
	story: text("story"),
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
},
(table) => {
	return {
		brandbooksUserIdUnique: unique("brandbooks_user_id_unique").on(table.userId),
	}
});

export const claudeMessages = pgTable("claude_messages", {
	id: serial("id").primaryKey().notNull(),
	conversationId: varchar("conversation_id").notNull().references(() => claudeConversations.conversationId),
	role: varchar("role").notNull(),
	content: text("content").notNull(),
	metadata: jsonb("metadata"),
	toolCalls: jsonb("tool_calls"),
	toolResults: jsonb("tool_results"),
	timestamp: timestamp("timestamp", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const dashboards = pgTable("dashboards", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	config: jsonb("config").notNull(),
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
},
(table) => {
	return {
		dashboardsUserIdUnique: unique("dashboards_user_id_unique").on(table.userId),
	}
});

export const claudeConversations = pgTable("claude_conversations", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	agentName: varchar("agent_name").notNull(),
	conversationId: varchar("conversation_id").notNull(),
	title: varchar("title"),
	status: varchar("status").default('active'),
	lastMessageAt: timestamp("last_message_at", { mode: 'string' }).defaultNow(),
	messageCount: integer("message_count").default(0),
	context: jsonb("context"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	adminBypassEnabled: boolean("admin_bypass_enabled").default(false),
},
(table) => {
	return {
		claudeConversationsConversationIdKey: unique("claude_conversations_conversation_id_key").on(table.conversationId),
	}
});

export const domains = pgTable("domains", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	domain: varchar("domain").notNull(),
	subdomain: varchar("subdomain"),
	isVerified: boolean("is_verified").default(false),
	dnsRecords: jsonb("dns_records"),
	sslStatus: varchar("ssl_status").default('pending'),
	connectedTo: varchar("connected_to"),
	resourceId: integer("resource_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		domainsDomainUnique: unique("domains_domain_unique").on(table.domain),
		domainsSubdomainUnique: unique("domains_subdomain_unique").on(table.subdomain),
	}
});

export const emailCaptures = pgTable("email_captures", {
	id: serial("id").primaryKey().notNull(),
	email: varchar("email").notNull(),
	plan: varchar("plan").notNull(),
	source: varchar("source").notNull(),
	captured: timestamp("captured", { mode: 'string' }).defaultNow(),
	converted: boolean("converted").default(false),
	userId: varchar("user_id").references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
});

export const generationTrackers = pgTable("generation_trackers", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	predictionId: varchar("prediction_id"),
	prompt: text("prompt"),
	style: varchar("style"),
	status: varchar("status").default('pending'),
	imageUrls: text("image_urls"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const inspirationPhotos = pgTable("inspiration_photos", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	imageUrl: varchar("image_url").notNull(),
	description: text("description"),
	tags: jsonb("tags"),
	source: varchar("source").default('upload'),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const importedSubscribers = pgTable("imported_subscribers", {
	id: varchar("id").default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar("email"),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	source: varchar("source").notNull(),
	originalId: varchar("original_id").notNull(),
	status: varchar("status").notNull(),
	tags: jsonb("tags").default([]),
	customFields: jsonb("custom_fields").default({}),
	messengerData: jsonb("messenger_data"),
	importedAt: timestamp("imported_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		uniqueSubscriberEmail: unique("unique_subscriber_email").on(table.email),
		uniqueSubscriberSourceId: unique("unique_subscriber_source_id").on(table.source, table.originalId),
	}
});

export const mayaChats = pgTable("maya_chats", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	chatTitle: varchar("chat_title", { length: 500 }).notNull(),
	chatSummary: text("chat_summary"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	chatCategory: varchar("chat_category").default('Style Consultation'),
	lastActivity: timestamp("last_activity", { mode: 'string' }).defaultNow(),
});

export const landingPages = pgTable("landing_pages", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	template: varchar("template").notNull(),
	config: jsonb("config").notNull(),
	onboardingData: jsonb("onboarding_data"),
	isPublished: boolean("is_published").default(false),
	url: varchar("url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	customUrl: varchar("custom_url"),
	customDomain: varchar("custom_domain"),
	isLive: boolean("is_live").default(false),
	seoTitle: varchar("seo_title"),
	seoDescription: text("seo_description"),
});

export const mayaPersonalMemory = pgTable("maya_personal_memory", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ).references(() => users.id, { onDelete: "cascade" } ),
	personalBrandId: integer("personal_brand_id").references(() => userPersonalBrand.id, { onDelete: "cascade" } ).references(() => userPersonalBrand.id, { onDelete: "cascade" } ),
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
},
(table) => {
	return {
		idxMayaPersonalMemoryUpdated: index("idx_maya_personal_memory_updated").using("btree", table.userId, table.lastMemoryUpdate),
		idxMayaPersonalMemoryUserId: index("idx_maya_personal_memory_user_id").using("btree", table.userId),
	}
});

export const generatedImages = pgTable("generated_images", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	modelId: integer("model_id").references(() => userModels.id),
	category: varchar("category").notNull(),
	subcategory: varchar("subcategory").notNull(),
	prompt: text("prompt").notNull(),
	imageUrls: text("image_urls").notNull(),
	selectedUrl: text("selected_url"),
	saved: boolean("saved").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		idxGeneratedImagesSaved: index("idx_generated_images_saved").using("btree", table.saved).where(sql`(saved = true)`),
		idxGeneratedImagesUserCreated: index("idx_generated_images_user_created").using("btree", table.userId, table.createdAt),
	}
});

export const modelRecoveryLog = pgTable("model_recovery_log", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }),
	oldModelId: varchar("old_model_id", { length: 255 }),
	newModelId: varchar("new_model_id", { length: 255 }),
	recoveryStatus: varchar("recovery_status", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const projects = pgTable("projects", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar("name").notNull(),
	description: text("description"),
	status: varchar("status").default('draft'),
	templateId: varchar("template_id"),
	customDomain: varchar("custom_domain"),
	aiImagesGenerated: boolean("ai_images_generated").default(false),
	contentGenerated: boolean("content_generated").default(false),
	paymentSetup: boolean("payment_setup").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const savedPrompts = pgTable("saved_prompts", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	name: varchar("name").notNull(),
	description: text("description"),
	prompt: text("prompt").notNull(),
	camera: varchar("camera"),
	texture: varchar("texture"),
	collection: varchar("collection").default('My Prompts'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const sandraConversations = pgTable("sandra_conversations", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull(),
	message: text("message").notNull(),
	response: text("response").notNull(),
	userStylePreferences: jsonb("user_style_preferences"),
	suggestedPrompt: text("suggested_prompt"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const selfieUploads = pgTable("selfie_uploads", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	filename: varchar("filename").notNull(),
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
},
(table) => {
	return {
		idxSelfieUploadsCreated: index("idx_selfie_uploads_created").using("btree", table.createdAt),
		idxSelfieUploadsStatus: index("idx_selfie_uploads_status").using("btree", table.processingStatus),
		idxSelfieUploadsUserId: index("idx_selfie_uploads_user_id").using("btree", table.userId),
	}
});

export const session = pgTable("session", {
	sid: varchar("sid").primaryKey().notNull(),
	sess: json("sess").notNull(),
	expire: timestamp("expire", { precision: 6, mode: 'string' }).notNull(),
});

export const sessions = pgTable("sessions", {
	sid: varchar("sid").primaryKey().notNull(),
	sess: jsonb("sess").notNull(),
	expire: timestamp("expire", { mode: 'string' }).notNull(),
},
(table) => {
	return {
		idxSessionExpire: index("IDX_session_expire").using("btree", table.expire),
	}
});

export const photoSelections = pgTable("photo_selections", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	selectedSelfieIds: jsonb("selected_selfie_ids").notNull(),
	selectedFlatlayCollection: varchar("selected_flatlay_collection").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const styleguideTemplates = pgTable("styleguide_templates", {
	id: serial("id").primaryKey().notNull(),
	templateId: varchar("template_id").notNull(),
	name: varchar("name").notNull(),
	description: text("description"),
	colors: jsonb("colors").notNull(),
	typography: jsonb("typography").notNull(),
	styleProfile: jsonb("style_profile").notNull(),
	previewImage: varchar("preview_image"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		styleguideTemplatesTemplateIdKey: unique("styleguide_templates_template_id_key").on(table.templateId),
	}
});

export const usageHistory = pgTable("usage_history", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	actionType: varchar("action_type").notNull(),
	resourceUsed: varchar("resource_used").notNull(),
	cost: numeric("cost", { precision: 6, scale:  4 }).notNull(),
	details: jsonb("details"),
	generatedImageId: integer("generated_image_id").references(() => generatedImages.id),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const templates = pgTable("templates", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name").notNull(),
	description: text("description"),
	category: varchar("category"),
	previewImageUrl: varchar("preview_image_url"),
	templateData: jsonb("template_data"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	plan: varchar("plan").notNull(),
	status: varchar("status").notNull(),
	stripeSubscriptionId: varchar("stripe_subscription_id"),
	currentPeriodStart: timestamp("current_period_start", { mode: 'string' }),
	currentPeriodEnd: timestamp("current_period_end", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ).references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	fullName: varchar("full_name"),
	phone: varchar("phone"),
	location: varchar("location"),
	instagramHandle: varchar("instagram_handle"),
	websiteUrl: varchar("website_url"),
	bio: text("bio"),
	brandVibe: text("brand_vibe"),
	goals: text("goals"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const userPersonalBrand = pgTable("user_personal_brand", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ).references(() => users.id, { onDelete: "cascade" } ),
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
	name: text("name"),
},
(table) => {
	return {
		idxUserPersonalBrandCompleted: index("idx_user_personal_brand_completed").using("btree", table.userId, table.isCompleted),
		idxUserPersonalBrandUserId: index("idx_user_personal_brand_user_id").using("btree", table.userId),
	}
});

export const userLandingPages = pgTable("user_landing_pages", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	slug: varchar("slug").notNull(),
	title: varchar("title").notNull(),
	description: text("description"),
	htmlContent: text("html_content").notNull(),
	cssContent: text("css_content").notNull(),
	templateUsed: varchar("template_used"),
	isPublished: boolean("is_published").default(false),
	customDomain: varchar("custom_domain"),
	seoTitle: varchar("seo_title"),
	seoDescription: text("seo_description"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		userLandingPagesSlugKey: unique("user_landing_pages_slug_key").on(table.slug),
	}
});

export const userSimplifiedProfile = pgTable("user_simplified_profile", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
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
});

export const userStyleguides = pgTable("user_styleguides", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	templateId: varchar("template_id").notNull(),
	title: varchar("title").notNull(),
	colors: jsonb("colors").notNull(),
	typography: jsonb("typography").notNull(),
	content: jsonb("content").notNull(),
	aiImages: jsonb("ai_images"),
	moodboardImages: jsonb("moodboard_images"),
	status: varchar("status").default('draft'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const userUsage = pgTable("user_usage", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	plan: varchar("plan").notNull(),
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
},
(table) => {
	return {
		idxUserUsageUserId: index("idx_user_usage_user_id").using("btree", table.userId),
	}
});

export const userUploads = pgTable("user_uploads", {
	id: serial("id").primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	uploadCount: integer("upload_count").default(0),
	uploadStatus: varchar("upload_status", { length: 50 }),
	lastUpload: timestamp("last_upload", { mode: 'string' }),
	completed: boolean("completed").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const userWebsiteOnboarding = pgTable("user_website_onboarding", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	personalBrandName: varchar("personal_brand_name", { length: 255 }),
	story: text("story"),
	businessType: varchar("business_type", { length: 255 }),
	colorPreferences: jsonb("color_preferences").default({}),
	targetAudience: text("target_audience"),
	brandKeywords: jsonb("brand_keywords").default([]),
	goals: text("goals"),
	currentStep: varchar("current_step", { length: 255 }).default('story'::character varying),
	isCompleted: boolean("is_completed").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const victoriaChats = pgTable("victoria_chats", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	sessionId: varchar("session_id").notNull(),
	message: text("message").notNull(),
	sender: varchar("sender").notNull(),
	messageType: varchar("message_type").default('text'),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const userModels = pgTable("user_models", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
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
	modelType: varchar("model_type", { length: 255 }).default('flux-standard'::character varying),
	finetuneId: varchar("finetune_id", { length: 255 }),
	loraWeightsUrl: varchar("lora_weights_url"),
	trainingId: varchar("training_id"),
},
(table) => {
	return {
		userModelsUserIdUnique: unique("user_models_user_id_unique").on(table.userId),
		userModelsTriggerWordUnique: unique("user_models_trigger_word_unique").on(table.triggerWord),
	}
});

export const users = pgTable("users", {
	id: varchar("id").primaryKey().notNull(),
	email: varchar("email"),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	stripeCustomerId: varchar("stripe_customer_id"),
	stripeSubscriptionId: varchar("stripe_subscription_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	mayaAiAccess: boolean("maya_ai_access").default(true),
	victoriaAiAccess: boolean("victoria_ai_access").default(false),
	plan: varchar("plan").default('sselfie-studio'),
	role: varchar("role").default('user'),
	monthlyGenerationLimit: integer("monthly_generation_limit").default(100),
	generationsUsedThisMonth: integer("generations_used_this_month").default(0),
	authProvider: varchar("auth_provider").default('stack-auth'),
	stackAuthUserId: varchar("stack_auth_user_id"),
	displayName: varchar("display_name"),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	profileCompleted: boolean("profile_completed").default(false),
	onboardingStep: integer("onboarding_step").default(0),
	gender: varchar("gender"),
	profession: varchar("profession"),
	brandStyle: varchar("brand_style"),
	photoGoals: text("photo_goals"),
	hasRetrainingAccess: boolean("has_retraining_access").default(false),
	retrainingSessionId: varchar("retraining_session_id"),
	retrainingPaidAt: timestamp("retraining_paid_at", { mode: 'string' }),
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
	stackAuthId: varchar("stack_auth_id", { length: 255 }),
	legacyUserId: varchar("legacy_user_id", { length: 255 }),
},
(table) => {
	return {
		idxLegacyUserId: index("idx_legacy_user_id").using("btree", table.legacyUserId),
		idxUsersEmail: index("idx_users_email").using("btree", table.email),
		usersEmailUnique: unique("users_email_unique").on(table.email),
		usersStackAuthIdKey: unique("users_stack_auth_id_key").on(table.stackAuthId),
	}
});

export const websites = pgTable("websites", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	title: varchar("title").notNull(),
	slug: varchar("slug").notNull(),
	url: varchar("url"),
	status: varchar("status").default('draft').notNull(),
	content: jsonb("content").notNull(),
	templateId: varchar("template_id").default('victoria-editorial'),
	screenshotUrl: varchar("screenshot_url"),
	isPublished: boolean("is_published").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		websitesSlugKey: unique("websites_slug_key").on(table.slug),
	}
});

export const mayaChatMessages = pgTable("maya_chat_messages", {
	id: serial("id").primaryKey().notNull(),
	chatId: integer("chat_id").notNull().references(() => mayaChats.id, { onDelete: "cascade" } ),
	role: varchar("role", { length: 50 }).notNull(),
	content: text("content").notNull(),
	imagePreview: text("image_preview"),
	generatedPrompt: text("generated_prompt"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	conceptCards: text("concept_cards"),
	quickButtons: text("quick_buttons"),
	canGenerate: boolean("can_generate").default(false),
	originalStylingContext: text("original_styling_context"),
	conceptDescription: text("concept_description"),
	stylingDetails: jsonb("styling_details"),
});

export const playingWithNeon = pgTable("playing_with_neon", {
	id: serial("id").primaryKey().notNull(),
	name: text("name").notNull(),
	value: real("value"),
});

export const userStyleMemory = pgTable("user_style_memory", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
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
});

export const testPersistence = pgTable("test_persistence", {
	id: serial("id").primaryKey().notNull(),
	testData: varchar("test_data", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const stackAuthMigrationMarker = pgTable("stack_auth_migration_marker", {
	id: serial("id").primaryKey().notNull(),
	migrationTimestamp: timestamp("migration_timestamp", { mode: 'string' }).defaultNow(),
	migrationStatus: varchar("migration_status", { length: 50 }).default('COMPLETED'::character varying),
	stackAuthReady: boolean("stack_auth_ready").default(true),
	createdBy: varchar("created_by", { length: 50 }).default('SSELFIE_REPLIT_AGENT'::character varying),
});

export const promptAnalysis = pgTable("prompt_analysis", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	originalPrompt: text("original_prompt").notNull(),
	generatedPrompt: text("generated_prompt"),
	conceptTitle: text("concept_title"),
	category: varchar("category"),
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
});

export const aiImages = pgTable("ai_images", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	imageUrl: varchar("image_url").notNull(),
	prompt: text("prompt"),
	style: varchar("style"),
	isSelected: boolean("is_selected").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	predictionId: varchar("prediction_id"),
	generationStatus: varchar("generation_status").default('pending'),
	isFavorite: boolean("is_favorite").default(false),
	generatedPrompt: text("generated_prompt"),
	category: text("category").default('Lifestyle'),
	source: text("source").default('maya-chat'),
	supportsTextOverlay: boolean("supports_text_overlay").default(true),
	textOverlayAreas: jsonb("text_overlay_areas"),
},
(table) => {
	return {
		idxAiImagesUserId: index("idx_ai_images_user_id").using("btree", table.userId),
	}
});

export const feedTemplates = pgTable("feed_templates", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").references(() => users.id),
	name: varchar("name").notNull(),
	category: varchar("category").notNull(),
	description: text("description"),
	textOverlayStyle: jsonb("text_overlay_style"),
	colorPalette: jsonb("color_palette"),
	typographySettings: jsonb("typography_settings"),
	layoutConfig: jsonb("layout_config"),
	isPublic: boolean("is_public").default(false),
	usageCount: integer("usage_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const brandedPosts = pgTable("branded_posts", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").references(() => users.id),
	templateId: integer("template_id").references(() => feedTemplates.id),
	originalImageUrl: varchar("original_image_url").notNull(),
	processedImageUrl: varchar("processed_image_url"),
	textOverlay: text("text_overlay"),
	overlayPosition: varchar("overlay_position"),
	overlayStyle: jsonb("overlay_style"),
	socialPlatform: varchar("social_platform"),
	engagementData: jsonb("engagement_data"),
	isPublished: boolean("is_published").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const feedCollections = pgTable("feed_collections", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").references(() => users.id),
	name: varchar("name").notNull(),
	description: text("description"),
	postIds: jsonb("post_ids"),
	colorTheme: jsonb("color_theme"),
	brandGuidelines: jsonb("brand_guidelines"),
	targetPlatforms: jsonb("target_platforms"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const onboardingData = pgTable("onboarding_data", {
	id: serial("id").primaryKey().notNull(),
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
	completed: boolean("completed").default(false),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const approvalQueue = pgTable("approval_queue", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	agentId: varchar("agent_id").notNull(),
	contentType: varchar("content_type").notNull(),
	contentTitle: varchar("content_title").notNull(),
	contentPreview: text("content_preview").notNull(),
	fullContent: jsonb("full_content").notNull(),
	targetAudience: varchar("target_audience"),
	impactLevel: varchar("impact_level").default('medium'),
	estimatedCost: numeric("estimated_cost", { precision: 10, scale:  2 }),
	status: varchar("status").default('pending'),
	adminComments: text("admin_comments"),
	originalConversationId: varchar("original_conversation_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	approvedBy: varchar("approved_by"),
},
(table) => {
	return {
		idxApprovalQueueStatus: index("idx_approval_queue_status").using("btree", table.status, table.createdAt),
		idxApprovalQueueUser: index("idx_approval_queue_user").using("btree", table.userId, table.status),
	}
});

export const agentBudgets = pgTable("agent_budgets", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	agentId: varchar("agent_id"),
	budgetType: varchar("budget_type").notNull(),
	budgetLimit: numeric("budget_limit", { precision: 10, scale:  2 }).notNull(),
	currentSpend: numeric("current_spend", { precision: 10, scale:  2 }).default('0.00'),
	isActive: boolean("is_active").default(true),
	resetDate: timestamp("reset_date", { mode: 'string' }),
	alertThreshold: integer("alert_threshold").default(80),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const agentCostTracking = pgTable("agent_cost_tracking", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	agentId: varchar("agent_id").notNull(),
	conversationId: varchar("conversation_id"),
	apiCalls: integer("api_calls").default(0),
	tokensUsed: integer("tokens_used").default(0),
	estimatedCost: numeric("estimated_cost", { precision: 10, scale:  4 }).default('0.0000'),
	date: timestamp("date", { mode: 'string' }).defaultNow(),
	taskType: varchar("task_type"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		idxCostTrackingUserAgentDate: index("idx_cost_tracking_user_agent_date").using("btree", table.userId, table.agentId, table.date),
	}
});

export const agentHandoffRequests = pgTable("agent_handoff_requests", {
	id: serial("id").primaryKey().notNull(),
	fromAgentId: varchar("from_agent_id").notNull(),
	toTargetType: varchar("to_target_type").notNull(),
	toTargetId: varchar("to_target_id"),
	requestType: varchar("request_type").notNull(),
	contextSummary: text("context_summary").notNull(),
	urgencyLevel: varchar("urgency_level").default('normal'),
	conversationId: varchar("conversation_id"),
	originalTask: text("original_task"),
	currentProgress: jsonb("current_progress"),
	status: varchar("status").default('pending'),
	responseRequired: boolean("response_required").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
});

export const agentSessions = pgTable("agent_sessions", {
	id: serial("id").primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	conversationId: varchar("conversation_id"),
	status: varchar("status").default('active'),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
});

export const agentTrainingSessions = pgTable("agent_training_sessions", {
	id: serial("id").primaryKey().notNull(),
	agentId: varchar("agent_id").notNull(),
	sessionType: varchar("session_type").notNull(),
	trainingData: jsonb("training_data").notNull(),
	improvements: text("improvements"),
	performanceGain: numeric("performance_gain"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	trainedBy: varchar("trained_by"),
});

export const emailAccounts = pgTable("email_accounts", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	accountType: varchar("account_type").notNull(),
	email: varchar("email").notNull(),
	provider: varchar("provider").notNull(),
	displayName: varchar("display_name"),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	isActive: boolean("is_active").default(true),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const instagramMessages = pgTable("instagram_messages", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	platform: varchar("platform").notNull(),
	externalId: varchar("external_id").notNull(),
	fromUsername: varchar("from_username").notNull(),
	fromId: varchar("from_id").notNull(),
	message: text("message").notNull(),
	messageType: varchar("message_type").notNull(),
	receivedAt: timestamp("received_at", { mode: 'string' }).notNull(),
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
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const processedEmails = pgTable("processed_emails", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	accountId: integer("account_id").notNull().references(() => emailAccounts.id, { onDelete: "cascade" } ),
	externalId: varchar("external_id").notNull(),
	fromAddress: varchar("from_address").notNull(),
	toAddresses: jsonb("to_addresses").notNull(),
	subject: text("subject").notNull(),
	bodyPreview: text("body_preview"),
	receivedAt: timestamp("received_at", { mode: 'string' }).notNull(),
	category: varchar("category").notNull(),
	priority: varchar("priority").notNull(),
	needsResponse: boolean("needs_response").default(false),
	hasResponse: boolean("has_response").default(false),
	sentiment: varchar("sentiment").notNull(),
	tags: jsonb("tags"),
	aiSummary: text("ai_summary"),
	suggestedResponse: text("suggested_response"),
	isArchived: boolean("is_archived").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const userGeneratedWebsites = pgTable("user_generated_websites", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	onboardingId: integer("onboarding_id"),
	title: varchar("title").notNull(),
	subdomain: varchar("subdomain", { length: 63 }),
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
},
(table) => {
	return {
		userGeneratedWebsitesSubdomainKey: unique("user_generated_websites_subdomain_key").on(table.subdomain),
	}
});

export const websiteBuilderConversations = pgTable("website_builder_conversations", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	websiteId: integer("website_id").references(() => userGeneratedWebsites.id, { onDelete: "cascade" } ),
	onboardingId: integer("onboarding_id"),
	messages: jsonb("messages").default([]).notNull(),
	context: jsonb("context").default({}),
	lastActivity: timestamp("last_activity", { mode: 'string' }).defaultNow(),
	isActive: boolean("is_active").default(true),
	conversationType: varchar("conversation_type").default('onboarding'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const loraWeights = pgTable("lora_weights", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	trainingRunId: integer("training_run_id").notNull().references(() => trainingRuns.id, { onDelete: "cascade" } ),
	triggerWord: varchar("trigger_word").notNull(),
	baseModel: varchar("base_model").default('flux-dev').notNull(),
	s3Bucket: varchar("s3_bucket"),
	s3Key: varchar("s3_key"),
	fileSize: integer("file_size"),
	checksum: varchar("checksum"),
	rank: integer("rank").default(32),
	networkType: varchar("network_type").default('lora'),
	status: varchar("status").default('available'),
	defaultScales: jsonb("default_scales"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		statusIdx: index("lora_weights_status_idx").using("btree", table.status),
		trainingRunIdx: index("lora_weights_training_run_idx").using("btree", table.trainingRunId),
		triggerWordIdx: index("lora_weights_trigger_word_idx").using("btree", table.triggerWord),
		userIdIdx: index("lora_weights_user_id_idx").using("btree", table.userId),
	}
});

export const trainingRuns = pgTable("training_runs", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	trainingId: varchar("training_id").notNull(),
	status: varchar("status").notNull(),
	progress: integer("progress").default(0),
	baseModel: varchar("base_model").default('flux-dev'),
	parameters: jsonb("parameters"),
	startedAt: timestamp("started_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	datasetZipUrl: text("dataset_zip_url"),
	outputArtifactUrl: text("output_artifact_url"),
	error: text("error"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		statusIdx: index("training_runs_status_idx").using("btree", table.status),
		trainingIdIdx: index("training_runs_training_id_idx").using("btree", table.trainingId),
		userIdIdx: index("training_runs_user_id_idx").using("btree", table.userId),
	}
});

export const conceptCards = pgTable("concept_cards", {
	id: varchar("id").default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	conversationId: varchar("conversation_id"),
	clientId: varchar("client_id"),
	title: varchar("title").notNull(),
	description: text("description"),
	images: jsonb("images"),
	tags: jsonb("tags"),
	status: varchar("status").default('draft'),
	sortOrder: integer("sort_order").default(0),
	generatedImages: jsonb("generated_images"),
	isLoading: boolean("is_loading").default(false),
	isGenerating: boolean("is_generating").default(false),
	hasGenerated: boolean("has_generated").default(false),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		idxConceptCardsClientId: index("idx_concept_cards_client_id").using("btree", table.userId, table.clientId),
		idxConceptCardsConversation: index("idx_concept_cards_conversation").using("btree", table.conversationId),
		idxConceptCardsSort: index("idx_concept_cards_sort").using("btree", table.sortOrder),
		idxConceptCardsUser: index("idx_concept_cards_user").using("btree", table.userId),
	}
});

export const imageVariants = pgTable("image_variants", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	originalImageId: integer("original_image_id"),
	originalImageType: varchar("original_image_type").notNull(),
	imageUrl: varchar("image_url").notNull(),
	kind: varchar("kind").notNull(),
	prompt: text("prompt"),
	maskData: text("mask_data"),
	predictionId: varchar("prediction_id"),
	generationStatus: varchar("generation_status").default('pending'),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		idxImageVariantsKind: index("idx_image_variants_kind").using("btree", table.kind),
		idxImageVariantsOriginal: index("idx_image_variants_original").using("btree", table.originalImageId),
		idxImageVariantsStatus: index("idx_image_variants_status").using("btree", table.generationStatus),
		idxImageVariantsUser: index("idx_image_variants_user").using("btree", table.userId),
		idxImageVariantsUserId: index("idx_image_variants_user_id").using("btree", table.userId),
	}
});

export const generatedVideos = pgTable("generated_videos", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	imageId: integer("image_id"),
	imageSource: varchar("image_source").default('generated'),
	motionPrompt: text("motion_prompt").notNull(),
	videoUrl: varchar("video_url"),
	jobId: varchar("job_id").notNull(),
	status: varchar("status").default('pending'),
	estimatedTime: varchar("estimated_time"),
	progress: integer("progress").default(0),
	errorMessage: text("error_message"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
},
(table) => {
	return {
		jobIdIdx: index("generated_videos_job_id_idx").using("btree", table.jobId),
		statusIdx: index("generated_videos_status_idx").using("btree", table.status),
		userIdIdx: index("generated_videos_user_id_idx").using("btree", table.userId),
	}
});

export const liveSessions = pgTable("live_sessions", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	deckUrl: text("deck_url"),
	mentiUrl: text("menti_url"),
	ctaUrl: text("cta_url"),
	title: text("title").notNull(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const brandAssets = pgTable("brand_assets", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	kind: varchar("kind").notNull(),
	url: varchar("url").notNull(),
	filename: varchar("filename").notNull(),
	fileSize: integer("file_size"),
	meta: jsonb("meta"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		idxBrandAssetsKind: index("idx_brand_assets_kind").using("btree", table.kind),
		idxBrandAssetsUser: index("idx_brand_assets_user").using("btree", table.userId),
	}
});

export const hairLeads = pgTable("hair_leads", {
	id: serial("id").primaryKey().notNull(),
	navn: varchar("navn").notNull(),
	epost: varchar("epost").notNull(),
	telefon: varchar("telefon"),
	kilde: varchar("kilde").default('qr-code'),
	interesse: text("interesse"),
	levelpartnerSynced: boolean("levelpartner_synced").default(false),
	levelpartnerSyncedAt: timestamp("levelpartner_synced_at", { mode: 'string' }),
	status: varchar("status").default('new'),
	notater: text("notater"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		idxHairLeadsCreated: index("idx_hair_leads_created").using("btree", table.createdAt),
		idxHairLeadsEpost: index("idx_hair_leads_epost").using("btree", table.epost),
		idxHairLeadsKilde: index("idx_hair_leads_kilde").using("btree", table.kilde),
	}
});

export const schemaMigrationLog = pgTable("schema_migration_log", {
	id: serial("id").primaryKey().notNull(),
	phase: text("phase").notNull(),
	operation: text("operation").notNull(),
	status: text("status").notNull(),
	metadata: jsonb("metadata").default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const queryPerformanceLog = pgTable("query_performance_log", {
	id: serial("id").primaryKey().notNull(),
	queryHash: text("query_hash").notNull(),
	executionTime: integer("execution_time").notNull(),
	queryContext: text("query_context").notNull(),
	metadata: jsonb("metadata").default({}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const migrationVerification = pgTable("migration_verification", {
	id: serial("id").primaryKey().notNull(),
	sourceTable: text("source_table").notNull(),
	targetTable: text("target_table").notNull(),
	verificationType: text("verification_type").notNull(),
	sourceCount: integer("source_count"),
	targetCount: integer("target_count"),
	matchingRows: integer("matching_rows"),
	status: text("status").notNull(),
	discrepancies: jsonb("discrepancies"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const schemaSnapshot = pgTable("schema_snapshot", {
	id: serial("id").primaryKey().notNull(),
	tableName: text("table_name").notNull(),
	columnCount: integer("column_count").notNull(),
	rowCount: integer("row_count").notNull(),
	indexCount: integer("index_count").notNull(),
	foreignKeys: jsonb("foreign_keys").default([]).notNull(),
	schema: jsonb("schema").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const mayaSubscriptions = pgTable("maya_subscriptions", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	stripeCustomerId: varchar("stripe_customer_id"),
	stripeSubscriptionId: varchar("stripe_subscription_id"),
	plan: varchar("plan").notNull(),
	status: varchar("status").notNull(),
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
},
(table) => {
	return {
		idxMayaSubscriptionsStatus: index("idx_maya_subscriptions_status").using("btree", table.status),
		idxMayaSubscriptionsUser: index("idx_maya_subscriptions_user").using("btree", table.userId),
	}
});

export const mayaPayments = pgTable("maya_payments", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ).references(() => users.id, { onDelete: "cascade" } ),
	stripeSessionId: varchar("stripe_session_id"),
	stripePaymentIntentId: varchar("stripe_payment_intent_id"),
	amount: integer("amount").notNull(),
	currency: varchar("currency").default('eur'),
	status: varchar("status").default('pending'),
	paymentMethod: varchar("payment_method"),
	errorMessage: text("error_message"),
	customerEmail: varchar("customer_email"),
	description: text("description"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	succeededAt: timestamp("succeeded_at", { mode: 'string' }),
},
(table) => {
	return {
		idxMayaPaymentsSession: index("idx_maya_payments_session").using("btree", table.stripeSessionId),
		idxMayaPaymentsStatus: index("idx_maya_payments_status").using("btree", table.status),
		idxMayaPaymentsUser: index("idx_maya_payments_user").using("btree", table.userId),
		idxMayaPaymentsUserId: index("idx_maya_payments_user_id").using("btree", table.userId),
		mayaPaymentsStripeSessionIdKey: unique("maya_payments_stripe_session_id_key").on(table.stripeSessionId),
	}
});

export const mayaUsageTracking = pgTable("maya_usage_tracking", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	actionType: varchar("action_type").notNull(),
	resourceType: varchar("resource_type").notNull(),
	cost: numeric("cost", { precision: 10, scale:  4 }),
	quotaUsed: integer("quota_used").default(1),
	modelId: varchar("model_id"),
	promptTokens: integer("prompt_tokens"),
	completionTokens: integer("completion_tokens"),
	requestId: varchar("request_id"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		idxMayaUsageAction: index("idx_maya_usage_action").using("btree", table.actionType),
		idxMayaUsageDate: index("idx_maya_usage_date").using("btree", table.createdAt),
		idxMayaUsageUser: index("idx_maya_usage_user").using("btree", table.userId),
	}
});

export const mayaUsageBudgets = pgTable("maya_usage_budgets", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
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
},
(table) => {
	return {
		idxMayaBudgetsActive: index("idx_maya_budgets_active").using("btree", table.isActive),
		idxMayaBudgetsUser: index("idx_maya_budgets_user").using("btree", table.userId),
	}
});

export const userStyleProfile = pgTable("user_style_profile", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	personalBrandId: integer("personal_brand_id").references(() => userPersonalBrand.id, { onDelete: "cascade" } ),
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
},
(table) => {
	return {
		idxUserStyleProfileUserId: index("idx_user_style_profile_user_id").using("btree", table.userId),
	}
});

export const liveEvents = pgTable("live_events", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	sessionId: uuid("session_id").notNull().references(() => liveSessions.id, { onDelete: "cascade" } ),
	eventType: varchar("event_type").notNull(),
	meta: jsonb("meta").default({}),
	userAgent: text("user_agent"),
	ipAddress: inet("ip_address"),
	utmSource: varchar("utm_source"),
	utmCampaign: varchar("utm_campaign"),
	utmMedium: varchar("utm_medium"),
	utmContent: varchar("utm_content"),
	utmTerm: varchar("utm_term"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxLiveEventsAnalytics: index("idx_live_events_analytics").using("btree", table.sessionId, table.eventType, table.createdAt),
		idxLiveEventsCreatedAt: index("idx_live_events_created_at").using("btree", table.createdAt),
		idxLiveEventsSessionId: index("idx_live_events_session_id").using("btree", table.sessionId),
		idxLiveEventsSessionType: index("idx_live_events_session_type").using("btree", table.sessionId, table.eventType),
		idxLiveEventsType: index("idx_live_events_type").using("btree", table.eventType),
		idxLiveEventsUtmSource: index("idx_live_events_utm_source").using("btree", table.utmSource),
	}
});

export const legacyVictoriaChats = pgTable("legacy_victoria_chats", {
	id: integer("id"),
	userId: varchar("user_id"),
	sessionId: varchar("session_id"),
	message: text("message"),
	sender: varchar("sender"),
	messageType: varchar("message_type"),
	metadata: jsonb("metadata"),
	createdAt: timestamp("created_at", { mode: 'string' }),
});

export const legacyMigrations = pgTable("legacy_migrations", {
	id: serial("id").primaryKey().notNull(),
	tableName: text("table_name").notNull(),
	migratedAt: timestamp("migrated_at", { mode: 'string' }).defaultNow(),
	rowCount: integer("row_count"),
});

export const mayaProfile = pgTable("maya_profile", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	onboardingStatus: varchar("onboarding_status").default('pending'),
	onboardingStep: integer("onboarding_step").default(1),
	completedSteps: jsonb("completed_steps").default([]),
	preferences: jsonb("preferences").default({}),
	billingInfo: jsonb("billing_info").default({}),
	totalGenerations: integer("total_generations").default(0),
	monthlyGenerations: integer("monthly_generations").default(0),
	lastResetDate: timestamp("last_reset_date", { mode: 'string' }).defaultNow(),
	featureAccess: jsonb("feature_access").default({"basicGeneration":true}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxMayaProfileGenerations: index("idx_maya_profile_generations").using("btree", table.userId, table.monthlyGenerations),
		idxMayaProfileOnboarding: index("idx_maya_profile_onboarding").using("btree", table.userId, table.onboardingStatus),
		idxMayaProfileUserId: index("idx_maya_profile_user_id").using("btree", table.userId),
	}
});

export const mayaImages = pgTable("maya_images", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	url: varchar("url").notNull(),
	thumbnailUrl: varchar("thumbnail_url"),
	category: varchar("category"),
	subcategory: varchar("subcategory"),
	metadata: jsonb("metadata").default({}),
	isFavorite: boolean("is_favorite").default(false),
	isArchived: boolean("is_archived").default(false),
	rating: integer("rating"),
	viewCount: integer("view_count").default(0),
	shareCount: integer("share_count").default(0),
	downloadCount: integer("download_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxMayaImagesCategory: index("idx_maya_images_category").using("btree", table.userId, table.category),
		idxMayaImagesCreated: index("idx_maya_images_created").using("btree", table.createdAt),
		idxMayaImagesFavorites: index("idx_maya_images_favorites").using("btree", table.userId, table.isFavorite),
		idxMayaImagesUserId: index("idx_maya_images_user_id").using("btree", table.userId),
	}
});

export const mayaModels = pgTable("maya_models", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	modelType: varchar("model_type").notNull(),
	trainingStatus: varchar("training_status").notNull(),
	trainingProgress: integer("training_progress").default(0),
	metadata: jsonb("metadata").default({}),
	qualityScore: integer("quality_score"),
	usageCount: integer("usage_count").default(0),
	lastUsed: timestamp("last_used", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxMayaModelsStatus: index("idx_maya_models_status").using("btree", table.userId, table.trainingStatus),
		idxMayaModelsType: index("idx_maya_models_type").using("btree", table.userId, table.modelType),
		idxMayaModelsUserId: index("idx_maya_models_user_id").using("btree", table.userId),
	}
});

export const mayaConcepts = pgTable("maya_concepts", {
	id: serial("id").primaryKey().notNull(),
	userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	title: varchar("title").notNull(),
	description: text("description"),
	prompt: text("prompt"),
	type: varchar("type"),
	metadata: jsonb("metadata").default({}),
	usageCount: integer("usage_count").default(0),
	successRate: integer("success_rate"),
	avgRating: numeric("avg_rating", { precision: 3, scale:  2 }),
	status: varchar("status").default('active'),
	tags: jsonb("tags").default([]),
	isTemplate: boolean("is_template").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		idxMayaConceptsStatus: index("idx_maya_concepts_status").using("btree", table.status),
		idxMayaConceptsType: index("idx_maya_concepts_type").using("btree", table.userId, table.type),
		idxMayaConceptsUsage: index("idx_maya_concepts_usage").using("btree", table.usageCount),
		idxMayaConceptsUserId: index("idx_maya_concepts_user_id").using("btree", table.userId),
	}
});