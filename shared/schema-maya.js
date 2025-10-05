"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPreferencesSchema = exports.conceptMetadataSchema = exports.imageMetadataSchema = exports.modelMetadataSchema = exports.selectMayaProfileSchema = exports.insertMayaProfileSchema = exports.selectMayaPaymentsSchema = exports.insertMayaPaymentsSchema = exports.selectMayaConceptsSchema = exports.insertMayaConceptsSchema = exports.selectMayaImagesSchema = exports.insertMayaImagesSchema = exports.selectMayaModelsSchema = exports.insertMayaModelsSchema = exports.mayaProfile = exports.mayaPayments = exports.mayaConcepts = exports.mayaImages = exports.mayaModels = void 0;
exports.generateModelId = generateModelId;
exports.validateImageMetadata = validateImageMetadata;
exports.calculateConceptSuccessRate = calculateConceptSuccessRate;
exports.formatPlanName = formatPlanName;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
const schema_js_1 = require("./schema.js");
// =============================================================================
// MAYA CORE SCHEMA - Complete Database Structure
// =============================================================================
// This file defines all Maya-related database tables and their TypeScript types
// Includes comprehensive type interfaces, Zod validation schemas, and utility types
// =============================================================================
// MAYA MODELS TABLE - AI Model Training and Management
// =============================================================================
exports.mayaModels = (0, pg_core_1.pgTable)('maya_models', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').references(() => schema_js_1.users.id, { onDelete: 'cascade' }).notNull(),
    // Model Configuration
    modelType: (0, pg_core_1.varchar)('model_type').notNull(), // 'flux', 'replicate', 'custom'
    trainingStatus: (0, pg_core_1.varchar)('training_status').notNull(), // 'pending', 'training', 'completed', 'failed'
    trainingProgress: (0, pg_core_1.integer)('training_progress').default(0), // 0-100 percentage
    // Model Metadata
    metadata: (0, pg_core_1.jsonb)('metadata').default({}),
    // Model Performance
    qualityScore: (0, pg_core_1.integer)('quality_score'), // 1-100 quality rating
    usageCount: (0, pg_core_1.integer)('usage_count').default(0),
    lastUsed: (0, pg_core_1.timestamp)('last_used'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// =============================================================================  
// MAYA IMAGES TABLE - Generated and User Images
// =============================================================================
exports.mayaImages = (0, pg_core_1.pgTable)('maya_images', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').references(() => schema_js_1.users.id, { onDelete: 'cascade' }).notNull(),
    // Image Storage
    url: (0, pg_core_1.varchar)('url').notNull(),
    thumbnailUrl: (0, pg_core_1.varchar)('thumbnail_url'),
    // Image Classification
    category: (0, pg_core_1.varchar)('category'), // 'portrait', 'lifestyle', 'product', 'concept'
    subcategory: (0, pg_core_1.varchar)('subcategory'), // More specific categorization
    // Image Metadata
    metadata: (0, pg_core_1.jsonb)('metadata').default({}),
    // User Interaction
    isFavorite: (0, pg_core_1.boolean)('is_favorite').default(false),
    isArchived: (0, pg_core_1.boolean)('is_archived').default(false),
    rating: (0, pg_core_1.integer)('rating'), // 1-5 user rating
    // Usage Tracking
    viewCount: (0, pg_core_1.integer)('view_count').default(0),
    shareCount: (0, pg_core_1.integer)('share_count').default(0),
    downloadCount: (0, pg_core_1.integer)('download_count').default(0),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// =============================================================================
// MAYA CONCEPTS TABLE - Creative Concepts and Prompts  
// =============================================================================
exports.mayaConcepts = (0, pg_core_1.pgTable)('maya_concepts', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').references(() => schema_js_1.users.id, { onDelete: 'cascade' }).notNull(),
    // Concept Definition
    title: (0, pg_core_1.varchar)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    prompt: (0, pg_core_1.text)('prompt'),
    type: (0, pg_core_1.varchar)('type'), // 'portrait', 'flatlay', 'lifestyle', 'brand'
    // Concept Details
    metadata: (0, pg_core_1.jsonb)('metadata').default({}),
    // Performance Tracking
    usageCount: (0, pg_core_1.integer)('usage_count').default(0),
    successRate: (0, pg_core_1.integer)('success_rate'), // Percentage of successful generations
    avgRating: (0, pg_core_1.decimal)('avg_rating'), // Average user rating
    // Status and Organization
    status: (0, pg_core_1.varchar)('status').default('active'), // 'active', 'archived', 'draft'
    tags: (0, pg_core_1.jsonb)('tags').default([]),
    isTemplate: (0, pg_core_1.boolean)('is_template').default(false),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// =============================================================================
// MAYA PAYMENTS TABLE - Stripe Integration and Billing
// =============================================================================
exports.mayaPayments = (0, pg_core_1.pgTable)('maya_payments', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').references(() => schema_js_1.users.id, { onDelete: 'cascade' }).notNull(),
    // Stripe Integration
    stripeSessionId: (0, pg_core_1.varchar)('stripe_session_id'),
    stripeCustomerId: (0, pg_core_1.varchar)('stripe_customer_id'),
    stripeSubscriptionId: (0, pg_core_1.varchar)('stripe_subscription_id'),
    // Subscription Details
    subscriptionStatus: (0, pg_core_1.varchar)('subscription_status'), // 'active', 'canceled', 'past_due', 'unpaid'
    planType: (0, pg_core_1.varchar)('plan_type'), // 'basic', 'pro', 'enterprise'
    billingCycle: (0, pg_core_1.varchar)('billing_cycle'), // 'monthly', 'yearly'
    // Payment Information
    amount: (0, pg_core_1.integer)('amount'), // Amount in cents
    currency: (0, pg_core_1.varchar)('currency').default('usd'),
    // Payment Metadata
    metadata: (0, pg_core_1.jsonb)('metadata').default({}),
    // Status Tracking
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    trialEndsAt: (0, pg_core_1.timestamp)('trial_ends_at'),
    subscriptionEndsAt: (0, pg_core_1.timestamp)('subscription_ends_at'),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// =============================================================================
// MAYA PROFILE TABLE - User Preferences and Settings
// =============================================================================
exports.mayaProfile = (0, pg_core_1.pgTable)('maya_profile', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.varchar)('user_id').references(() => schema_js_1.users.id, { onDelete: 'cascade' }).notNull(),
    // Onboarding Status
    onboardingStatus: (0, pg_core_1.varchar)('onboarding_status').default('pending'), // 'pending', 'in_progress', 'completed'
    onboardingStep: (0, pg_core_1.integer)('onboarding_step').default(1),
    completedSteps: (0, pg_core_1.jsonb)('completed_steps').default([]),
    // User Preferences
    preferences: (0, pg_core_1.jsonb)('preferences').default({}),
    // Billing Information
    billingInfo: (0, pg_core_1.jsonb)('billing_info').default({}), // Usage Statistics
    totalGenerations: (0, pg_core_1.integer)('total_generations').default(0),
    monthlyGenerations: (0, pg_core_1.integer)('monthly_generations').default(0),
    lastResetDate: (0, pg_core_1.timestamp)('last_reset_date').defaultNow(),
    // Feature Access
    featureAccess: (0, pg_core_1.jsonb)('feature_access').default({}),
    // Timestamps
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
// =============================================================================
// ZOD VALIDATION SCHEMAS - Type-Safe Data Validation
// =============================================================================
// Maya Models Schemas
exports.insertMayaModelsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaModels).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.selectMayaModelsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.mayaModels);
// Maya Images Schemas  
exports.insertMayaImagesSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaImages).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.selectMayaImagesSchema = (0, drizzle_zod_1.createSelectSchema)(exports.mayaImages);
// Maya Concepts Schemas
exports.insertMayaConceptsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaConcepts).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.selectMayaConceptsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.mayaConcepts);
// Maya Payments Schemas
exports.insertMayaPaymentsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaPayments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.selectMayaPaymentsSchema = (0, drizzle_zod_1.createSelectSchema)(exports.mayaPayments);
// Maya Profile Schemas
exports.insertMayaProfileSchema = (0, drizzle_zod_1.createInsertSchema)(exports.mayaProfile).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
exports.selectMayaProfileSchema = (0, drizzle_zod_1.createSelectSchema)(exports.mayaProfile);
// =============================================================================
// HELPER FUNCTIONS - Utility Functions for Maya Operations
// =============================================================================
// Generate unique model identifier
function generateModelId(userId, modelType) {
    return `${userId}_${modelType}_${Date.now()}`;
}
// Validate image metadata
function validateImageMetadata(metadata) {
    const required = ['dimensions', 'format'];
    return required.every(field => field in metadata);
}
// Calculate concept success rate
function calculateConceptSuccessRate(usageCount, successfulGenerations) {
    if (usageCount === 0)
        return 0;
    return Math.round((successfulGenerations / usageCount) * 100);
}
// Format subscription plan display name
function formatPlanName(planType) {
    const planNames = {
        basic: 'Basic Plan',
        pro: 'Professional Plan',
        enterprise: 'Enterprise Plan'
    };
    return planNames[planType] || planType;
}
// =============================================================================
// VALIDATION HELPERS - Custom Zod Validators
// =============================================================================
// Model metadata validator
exports.modelMetadataSchema = zod_1.z.object({
    trainingImages: zod_1.z.array(zod_1.z.string()).optional(),
    modelParameters: zod_1.z.record(zod_1.z.any()).optional(),
    trainingLogs: zod_1.z.array(zod_1.z.string()).optional(),
    errorDetails: zod_1.z.string().optional(),
    modelVersion: zod_1.z.string().optional(),
    capabilities: zod_1.z.array(zod_1.z.string()).optional(),
});
// Image metadata validator
exports.imageMetadataSchema = zod_1.z.object({
    dimensions: zod_1.z.object({
        width: zod_1.z.number(),
        height: zod_1.z.number()
    }).optional(),
    fileSize: zod_1.z.number().optional(),
    format: zod_1.z.string().optional(),
    prompt: zod_1.z.string().optional(),
    model: zod_1.z.string().optional(),
    generationParams: zod_1.z.record(zod_1.z.any()).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    colorPalette: zod_1.z.array(zod_1.z.string()).optional(),
});
// Concept metadata validator
exports.conceptMetadataSchema = zod_1.z.object({
    styleElements: zod_1.z.array(zod_1.z.string()).optional(),
    colorScheme: zod_1.z.array(zod_1.z.string()).optional(),
    mood: zod_1.z.string().optional(),
    settings: zod_1.z.array(zod_1.z.string()).optional(),
    props: zod_1.z.array(zod_1.z.string()).optional(),
    lighting: zod_1.z.string().optional(),
    composition: zod_1.z.string().optional(),
    inspirationSources: zod_1.z.array(zod_1.z.string()).optional(),
});
// User preferences validator
exports.userPreferencesSchema = zod_1.z.object({
    communicationStyle: zod_1.z.enum(['casual', 'professional', 'friendly']).optional(),
    generationSettings: zod_1.z.object({
        defaultQuality: zod_1.z.string().optional(),
        preferredAspectRatio: zod_1.z.string().optional(),
        autoSave: zod_1.z.boolean().optional(),
    }).optional(),
    privacySettings: zod_1.z.object({
        shareGenerations: zod_1.z.boolean().optional(),
        allowDataCollection: zod_1.z.boolean().optional(),
    }).optional(),
    notificationSettings: zod_1.z.object({
        emailUpdates: zod_1.z.boolean().optional(),
        trainingComplete: zod_1.z.boolean().optional(),
        newFeatures: zod_1.z.boolean().optional(),
    }).optional(),
});
