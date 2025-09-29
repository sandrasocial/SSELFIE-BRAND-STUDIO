import { pgTable, serial, varchar, text, jsonb, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema.js";
export const userPersonalBrand = pgTable('user_personal_brand', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    transformationStory: text('transformation_story'),
    currentSituation: text('current_situation'),
    strugglesStory: text('struggles_story'),
    personalityTraits: jsonb('personality_traits').$type().default([]),
    dreamOutcome: text('dream_outcome'),
    futureVision: text('future_vision'),
    businessGoals: text('business_goals'),
    targetAudience: text('target_audience'),
    valuesAndMission: text('values_and_mission'),
    businessType: varchar('business_type'),
    brandVision: text('brand_vision'),
    uniqueValueProposition: text('unique_value_proposition'),
    professionalGoals: text('professional_goals'),
    photoUsageGoals: jsonb('photo_usage_goals').$type().default([]),
    contentCreationGoals: text('content_creation_goals'),
    professionalImageGoals: text('professional_image_goals'),
    onboardingStep: integer('onboarding_step').default(1),
    isCompleted: boolean('is_completed').default(false),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const userStyleProfile = pgTable('user_style_profile', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    personalBrandId: integer('personal_brand_id').references(() => userPersonalBrand.id, { onDelete: 'cascade' }),
    styleCategories: jsonb('style_categories').$type().default([]),
    colorPreferences: jsonb('color_preferences').$type().default({ primaryColors: [], accentColors: [], avoidColors: [] }),
    settingsPreferences: jsonb('settings_preferences').$type().default([]),
    locationVibes: jsonb('location_vibes').$type().default([]),
    clothingPreferences: jsonb('clothing_preferences').$type().default({ preferredStyles: [], favoriteItems: [], bodyTypeConsiderations: [], comfortLevel: 'moderate', occasionTypes: [] }),
    beautyPreferences: jsonb('beauty_preferences').$type().default({ makeupStyle: 'natural', hairPreferences: [], skinToneConsiderations: '', beautyComfortLevel: 'moderate' }),
    styleAvoidances: jsonb('style_avoidances').$type().default([]),
    boundariesAndLimits: text('boundaries_and_limits'),
    inspirationImages: jsonb('inspiration_images').$type().default([]),
    styleIcons: jsonb('style_icons').$type().default([]),
    brandReferences: jsonb('brand_references').$type().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const mayaPersonalMemory = pgTable('maya_personal_memory', {
    id: serial('id').primaryKey(),
    userId: varchar('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    personalBrandId: integer('personal_brand_id').references(() => userPersonalBrand.id, { onDelete: 'cascade' }),
    personalInsights: jsonb('personal_insights').$type().default({ coreMotivations: [], transformationJourney: '', strengthsIdentified: [], growthAreas: [], personalityNotes: '', communicationStyle: '' }),
    ongoingGoals: jsonb('ongoing_goals').$type().default({ shortTermGoals: [], longTermVision: [], milestonesToCelebrate: [], challengesToSupport: [] }),
    preferredTopics: jsonb('preferred_topics').$type().default([]),
    conversationStyle: jsonb('conversation_style').$type().default({ energyLevel: 'balanced', supportType: 'friend', communicationTone: 'encouraging', motivationApproach: 'support' }),
    personalizedStylingNotes: text('personalized_styling_notes'),
    successfulPromptPatterns: jsonb('successful_prompt_patterns').$type().default([]),
    userFeedbackPatterns: jsonb('user_feedback_patterns').$type().default({ lovedElements: [], dislikedElements: [], requestPatterns: [] }),
    lastMemoryUpdate: timestamp('last_memory_update').defaultNow().notNull(),
    memoryVersion: integer('memory_version').default(1),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const insertUserPersonalBrandSchema = createInsertSchema(userPersonalBrand).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    completedAt: true
});
export const insertUserStyleProfileSchema = createInsertSchema(userStyleProfile).omit({
    id: true,
    createdAt: true,
    updatedAt: true
});
export const insertMayaPersonalMemorySchema = createInsertSchema(mayaPersonalMemory).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    lastMemoryUpdate: true
});
export const personalBrandValidationSchema = z.object({
    transformationStory: z.string().min(50, "Please provide a more detailed transformation story").optional(),
    currentSituation: z.string().min(20, "Please describe your current situation").optional(),
    strugglesStory: z.string().min(20, "Please share your challenges").optional(),
    dreamOutcome: z.string().min(30, "Please describe your dream outcome").optional(),
    futureVision: z.string().min(30, "Please share your future vision").optional(),
    businessGoals: z.string().min(20, "Please describe your business goals").optional(),
    targetAudience: z.string().min(20, "Please describe your target audience").optional(),
    businessType: z.string().min(1, "Please select your business type").optional(),
    professionalGoals: z.string().min(20, "Please describe your professional goals").optional(),
});
export const styleProfileValidationSchema = z.object({
    styleCategories: z.array(z.string()).min(1, "Please select at least one style category"),
    colorPreferences: z.object({
        primaryColors: z.array(z.string()).min(1, "Please select at least one primary color"),
        accentColors: z.array(z.string()).optional(),
        avoidColors: z.array(z.string()).optional(),
        seasonalPalette: z.enum(['Spring', 'Summer', 'Autumn', 'Winter']).optional(),
    }),
    clothingPreferences: z.object({
        preferredStyles: z.array(z.string()).min(1, "Please select preferred styles"),
        comfortLevel: z.enum(['Conservative', 'Moderate', 'Bold']),
        occasionTypes: z.array(z.string()).min(1, "Please select occasion types"),
    }),
});
export const onboardingStepValidationSchema = z.object({
    step: z.number().min(1).max(6),
    personalBrandData: personalBrandValidationSchema.optional(),
    styleProfileData: styleProfileValidationSchema.optional(),
    isCompleted: z.boolean(),
});
export function calculateOnboardingProgress(personalBrand, styleProfile) {
    if (!personalBrand)
        return 0;
    const requiredFields = [
        'transformationStory',
        'currentSituation',
        'dreamOutcome',
        'businessGoals',
        'targetAudience'
    ];
    const completedFields = requiredFields.filter(field => personalBrand[field] &&
        personalBrand[field].length > 0);
    const baseProgress = (completedFields.length / requiredFields.length) * 70;
    if (styleProfile && styleProfile.styleCategories && styleProfile.styleCategories.length > 0) {
        return Math.min(100, baseProgress + 30);
    }
    return Math.round(baseProgress);
}
export function getNextOnboardingStep(personalBrand, styleProfile) {
    if (!personalBrand || !personalBrand.transformationStory)
        return 1;
    if (!personalBrand.dreamOutcome || !personalBrand.futureVision)
        return 2;
    if (!personalBrand.businessGoals || !personalBrand.targetAudience)
        return 3;
    if (!styleProfile || !styleProfile.styleCategories?.length)
        return 4;
    if (!styleProfile.colorPreferences?.primaryColors?.length)
        return 5;
    return 6;
}
export function validateStepCompletion(step, personalBrand, styleProfile) {
    switch (step) {
        case 1:
            return Boolean(personalBrand?.transformationStory && personalBrand.transformationStory.length > 20);
        case 2:
            return Boolean(personalBrand?.dreamOutcome && personalBrand.futureVision);
        case 3:
            return Boolean(personalBrand?.businessGoals && personalBrand.targetAudience);
        case 4:
            return Boolean(styleProfile?.styleCategories && styleProfile.styleCategories.length > 0);
        case 5:
            return Boolean(styleProfile?.colorPreferences?.primaryColors && styleProfile.colorPreferences.primaryColors.length > 0);
        case 6:
            return Boolean(personalBrand?.isCompleted);
        default:
            return false;
    }
}
export function generateOnboardingRecommendations(personalBrand) {
    const recommendations = [];
    if (!personalBrand?.transformationStory) {
        recommendations.push("Share your transformation story to help Maya understand your journey");
    }
    if (!personalBrand?.businessGoals) {
        recommendations.push("Define your business goals for better personalized styling");
    }
    if (!personalBrand?.targetAudience) {
        recommendations.push("Identify your target audience to create images that resonate");
    }
    if (personalBrand?.businessType === 'Other' || !personalBrand?.businessType) {
        recommendations.push("Specify your business type for industry-specific styling suggestions");
    }
    return recommendations;
}
//# sourceMappingURL=schema-maya-onboarding.js.map