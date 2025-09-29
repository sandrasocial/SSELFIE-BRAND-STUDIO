import { pgTable, serial, varchar, text, jsonb, boolean, timestamp, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema.js";
export const mayaModels = pgTable('maya_models', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    modelType: varchar('model_type').notNull(),
    trainingStatus: varchar('training_status').notNull(),
    trainingProgress: integer('training_progress').default(0),
    metadata: jsonb('metadata').$type().default({}),
    qualityScore: integer('quality_score'),
    usageCount: integer('usage_count').default(0),
    lastUsed: timestamp('last_used'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const mayaImages = pgTable('maya_images', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    url: varchar('url').notNull(),
    thumbnailUrl: varchar('thumbnail_url'),
    category: varchar('category'),
    subcategory: varchar('subcategory'),
    metadata: jsonb('metadata').$type().default({}),
    isFavorite: boolean('is_favorite').default(false),
    isArchived: boolean('is_archived').default(false),
    rating: integer('rating'),
    viewCount: integer('view_count').default(0),
    shareCount: integer('share_count').default(0),
    downloadCount: integer('download_count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const mayaConcepts = pgTable('maya_concepts', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    title: varchar('title').notNull(),
    description: text('description'),
    prompt: text('prompt'),
    type: varchar('type'),
    metadata: jsonb('metadata').$type().default({}),
    usageCount: integer('usage_count').default(0),
    successRate: integer('success_rate'),
    avgRating: decimal('avg_rating', { precision: 3, scale: 2 }),
    status: varchar('status').default('active'),
    tags: jsonb('tags').$type().default([]),
    isTemplate: boolean('is_template').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const mayaPayments = pgTable('maya_payments', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    stripeSessionId: varchar('stripe_session_id'),
    stripeCustomerId: varchar('stripe_customer_id'),
    stripeSubscriptionId: varchar('stripe_subscription_id'),
    subscriptionStatus: varchar('subscription_status'),
    planType: varchar('plan_type'),
    billingCycle: varchar('billing_cycle'),
    amount: integer('amount'),
    currency: varchar('currency').default('usd'),
    metadata: jsonb('metadata').$type().default({}),
    isActive: boolean('is_active').default(true),
    trialEndsAt: timestamp('trial_ends_at'),
    subscriptionEndsAt: timestamp('subscription_ends_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const mayaProfile = pgTable('maya_profile', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    onboardingStatus: varchar('onboarding_status').default('pending'),
    onboardingStep: integer('onboarding_step').default(1),
    completedSteps: jsonb('completed_steps').$type().default([]),
    preferences: jsonb('preferences').$type().default({}),
    billingInfo: jsonb('billing_info').$type().default({}),
    totalGenerations: integer('total_generations').default(0),
    monthlyGenerations: integer('monthly_generations').default(0),
    lastResetDate: timestamp('last_reset_date').defaultNow(),
    featureAccess: jsonb('feature_access').$type().default({}),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const insertMayaModelsSchema = createInsertSchema(mayaModels).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectMayaModelsSchema = createSelectSchema(mayaModels);
export const insertMayaImagesSchema = createInsertSchema(mayaImages).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectMayaImagesSchema = createSelectSchema(mayaImages);
export const insertMayaConceptsSchema = createInsertSchema(mayaConcepts).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectMayaConceptsSchema = createSelectSchema(mayaConcepts);
export const insertMayaPaymentsSchema = createInsertSchema(mayaPayments).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectMayaPaymentsSchema = createSelectSchema(mayaPayments);
export const insertMayaProfileSchema = createInsertSchema(mayaProfile).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const selectMayaProfileSchema = createSelectSchema(mayaProfile);
export function generateModelId(userId, modelType) {
    return `${userId}_${modelType}_${Date.now()}`;
}
export function validateImageMetadata(metadata) {
    const required = ['dimensions', 'format'];
    return required.every(field => field in metadata);
}
export function calculateConceptSuccessRate(usageCount, successfulGenerations) {
    if (usageCount === 0)
        return 0;
    return Math.round((successfulGenerations / usageCount) * 100);
}
export function formatPlanName(planType) {
    const planNames = {
        basic: 'Basic Plan',
        pro: 'Professional Plan',
        enterprise: 'Enterprise Plan'
    };
    return planNames[planType] || planType;
}
export const modelMetadataSchema = z.object({
    trainingImages: z.array(z.string()).optional(),
    modelParameters: z.record(z.any()).optional(),
    trainingLogs: z.array(z.string()).optional(),
    errorDetails: z.string().optional(),
    modelVersion: z.string().optional(),
    capabilities: z.array(z.string()).optional(),
});
export const imageMetadataSchema = z.object({
    dimensions: z.object({
        width: z.number(),
        height: z.number()
    }).optional(),
    fileSize: z.number().optional(),
    format: z.string().optional(),
    prompt: z.string().optional(),
    model: z.string().optional(),
    generationParams: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
    colorPalette: z.array(z.string()).optional(),
});
export const conceptMetadataSchema = z.object({
    styleElements: z.array(z.string()).optional(),
    colorScheme: z.array(z.string()).optional(),
    mood: z.string().optional(),
    settings: z.array(z.string()).optional(),
    props: z.array(z.string()).optional(),
    lighting: z.string().optional(),
    composition: z.string().optional(),
    inspirationSources: z.array(z.string()).optional(),
});
export const userPreferencesSchema = z.object({
    communicationStyle: z.enum(['casual', 'professional', 'friendly']).optional(),
    generationSettings: z.object({
        defaultQuality: z.string().optional(),
        preferredAspectRatio: z.string().optional(),
        autoSave: z.boolean().optional(),
    }).optional(),
    privacySettings: z.object({
        shareGenerations: z.boolean().optional(),
        allowDataCollection: z.boolean().optional(),
    }).optional(),
    notificationSettings: z.object({
        emailUpdates: z.boolean().optional(),
        trainingComplete: z.boolean().optional(),
        newFeatures: z.boolean().optional(),
    }).optional(),
});
//# sourceMappingURL=schema-maya.js.map