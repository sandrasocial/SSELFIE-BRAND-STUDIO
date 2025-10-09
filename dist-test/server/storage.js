import { users, userProfiles, onboardingData, aiImages, generatedImages, generationTrackers, userModels, selfieUploads, subscriptions, userUsage, victoriaChats, photoSelections, landingPages, brandOnboarding, userLandingPages, emailCaptures, mayaChats, mayaChatMessages, generatedVideos, claudeConversations, claudeMessages, trainingRuns, loraWeights, 
// New hybrid backend types
conversations, messages, conversationSummaries, conceptCards, 
// type InsertConceptCard,
// Brand Assets types
brandAssets, imageVariants,
// type InsertImageVariant,
 } from "../shared/schema.js";
import { mayaProfile, mayaImages, mayaConcepts } from "../shared/schema-maya.js";
import { db } from "./drizzle.js";
/// <reference path="types/global.d.ts" />
import { eq, and, or, desc, asc, gte, lte, sql } from "drizzle-orm";
// Utility: Default user fields for onboarding/business logic
function getDefaultUserFields(overrides = {}) {
    return {
        id: overrides.id ?? '',
        stackAuthId: overrides.stackAuthId ?? '',
        email: overrides.email ?? '',
        firstName: overrides.firstName ?? '',
        lastName: overrides.lastName ?? '',
        displayName: overrides.displayName ?? '',
        profileImageUrl: overrides.profileImageUrl ?? '',
        createdAt: overrides.createdAt ?? new Date(),
        updatedAt: overrides.updatedAt ?? new Date(),
        lastLoginAt: overrides.lastLoginAt ?? new Date(),
        plan: 'sselfie-studio',
        role: 'user',
        monthlyGenerationLimit: 100,
        mayaAiAccess: true,
        victoriaAiAccess: false,
        preferredOnboardingMode: 'conversational',
        onboardingProgress: {},
        gender: '',
        profession: '',
        brandStyle: '',
        photoGoals: '',
        generationsUsedThisMonth: 0,
        hasRetrainingAccess: false,
        retrainingSessionId: '',
        retrainingPaidAt: null,
        stripeCustomerId: '',
        stripeSubscriptionId: '',
        ...overrides
    };
}
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
export class DatabaseStorage {
    // User operations (required for Replit Auth)
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    }
    // Link existing user account to Stack Auth ID (safer approach - preserve original ID)
    async linkStackAuthId(existingUserId, stackAuthId) {
        // Add Stack Auth ID to existing user while preserving original ID and all relationships
        const [linkedUser] = await db
            .update(users)
            .set({
            stackAuthId: stackAuthId, // Store Stack Auth ID in separate column
            updatedAt: new Date(),
            lastLoginAt: new Date()
        })
            .where(eq(users.id, existingUserId))
            .returning();
        // 🔥 CRITICAL FIX: Ensure Maya profile and user model exist for linked users
        await this.ensureMayaProfile(linkedUser.id);
        await this.ensureUserModel(linkedUser.id);
        return linkedUser;
    }
    // Get user by Stack Auth ID (for linked accounts)
    async getUserByStackAuthId(stackAuthId) {
        const [user] = await db.select().from(users).where(eq(users.stackAuthId, stackAuthId));
        return user;
    }
    async createUser(userData) {
        const finalUserData = getDefaultUserFields(userData);
        // Special admin setup for ssa@ssasocial.com
        if (finalUserData.email === 'ssa@ssasocial.com') {
            finalUserData.role = 'admin';
            finalUserData.monthlyGenerationLimit = -1; // Unlimited
            finalUserData.plan = 'sselfie-studio';
            finalUserData.mayaAiAccess = true;
            finalUserData.victoriaAiAccess = true;
        }
        const [user] = await db
            .insert(users)
            // @ts-ignore - Drizzle ORM 0.36.0 insert type inference is broken
            .values({
            ...finalUserData,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        return user;
    }
    async getAllUsers() {
        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
        return allUsers;
    }
    async upsertUser(userData) {
        const finalUserData = getDefaultUserFields(userData);
        // Special admin setup for ssa@ssasocial.com
        if (finalUserData.email === 'ssa@ssasocial.com') {
            finalUserData.role = 'admin';
            finalUserData.monthlyGenerationLimit = -1; // Unlimited
            finalUserData.plan = 'sselfie-studio';
            finalUserData.mayaAiAccess = true;
            finalUserData.victoriaAiAccess = true;
        }
        let user;
        // First try to find existing user by ID
        const existingUser = await this.getUser(finalUserData.id);
        if (existingUser) {
            const [updatedUser] = await db
                .update(users)
                .set({
                ...finalUserData,
                updatedAt: new Date(),
            })
                .where(eq(users.id, finalUserData.id))
                .returning();
            user = updatedUser;
        }
        // If not found by ID, check by email and update that record with new ID
        else if (finalUserData.email) {
            const [userByEmail] = await db
                .select()
                .from(users)
                .where(eq(users.email, finalUserData.email));
            if (userByEmail) {
                // Update the existing user record with the new Stack Auth ID
                const [updatedUser] = await db
                    .update(users)
                    .set({
                    ...finalUserData,
                    id: finalUserData.id,
                    updatedAt: new Date(),
                })
                    .where(eq(users.email, finalUserData.email))
                    .returning();
                user = updatedUser;
            }
            else {
                // User doesn't exist by ID or email, create new one
                try {
                    const [newUser] = await db
                        .insert(users)
                        .values(finalUserData)
                        .returning();
                    user = newUser;
                }
                catch (error) {
                    // If duplicate key error on email, try to return existing user
                    const e = error;
                    if (e?.code === '23505' && e?.constraint === 'users_email_unique') {
                        const [existingUser] = await db
                            .select()
                            .from(users)
                            .where(eq(users.email, finalUserData.email || ''));
                        if (existingUser) {
                            user = existingUser;
                        }
                        else {
                            throw error;
                        }
                    }
                    else {
                        throw error;
                    }
                }
            }
        }
        else {
            throw new Error('Cannot create user without email');
        }
        // 🔥 CRITICAL FIX: Auto-create Maya profile for every new user
        await this.ensureMayaProfile(user.id);
        return user;
    }
    async updateUserProfile(userId, updates) {
        const [updatedUser] = await db
            .update(users)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    }
    // Stack Auth user synchronization
    async syncStackAuthUser(stackUser) {
        const userData = {
            id: stackUser.id,
            email: stackUser.primaryEmail || '',
            displayName: stackUser.displayName,
            profileImageUrl: stackUser.profileImageUrl,
            firstName: stackUser.displayName?.split(' ')[0],
            lastName: stackUser.displayName?.split(' ').slice(1).join(' '),
        };
        return this.upsertUser(userData);
    }
    // 🔄 PHASE 3: Update user retraining access after payment
    async updateUserRetrainingAccess(userId, retrainingData) {
        const [updatedUser] = await db
            .update(users)
            .set({
            hasRetrainingAccess: retrainingData.hasRetrainingAccess,
            retrainingSessionId: retrainingData.retrainingSessionId,
            retrainingPaidAt: retrainingData.retrainingPaidAt,
            updatedAt: new Date()
        })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    }
    // User Profile operations
    async getUserProfile(userId) {
        const [profile] = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));
        return profile;
    }
    async upsertUserProfile(data) {
        // Check if profile exists
        const existingProfile = await this.getUserProfile(data.userId);
        if (existingProfile) {
            // Update existing profile
            const [profile] = await db
                .update(userProfiles)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(userProfiles.userId, data.userId))
                .returning();
            return profile;
        }
        else {
            // Insert new profile
            const [profile] = await db
                .insert(userProfiles)
                .values(data)
                .returning();
            return profile;
        }
    }
    // Onboarding operations
    async getOnboardingData(userId) {
        const [data] = await db
            .select()
            .from(onboardingData)
            .where(eq(onboardingData.userId, userId));
        return data;
    }
    async saveOnboardingData(data) {
        const [saved] = await db.insert(onboardingData).values(data).returning();
        return saved;
    }
    async updateOnboardingData(userId, data) {
        const [updated] = await db
            .update(onboardingData)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(onboardingData.userId, userId))
            .returning();
        return updated;
    }
    // AI Image operations
    async getAIImages(userId) {
        // Direct lookup first
        let images = await db
            .select()
            .from(aiImages)
            .where(eq(aiImages.userId, userId))
            .orderBy(desc(aiImages.createdAt));
        if (images.length === 0) {
            // For Stack Auth users, check by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                images = await db
                    .select()
                    .from(aiImages)
                    .where(eq(aiImages.userId, linkedUser.id))
                    .orderBy(desc(aiImages.createdAt));
            }
        }
        return images;
    }
    async getUserAIImages(userId) {
        return this.getAIImages(userId);
    }
    async saveAIImage(data) {
        // Remove project_id from data since we're not using projects table
        const imageData = { ...data };
        delete imageData['projectId'];
        const [saved] = await db.insert(aiImages).values(imageData).returning();
        return saved;
    }
    async getAIImage(userId, imageId) {
        const [image] = await db
            .select()
            .from(aiImages)
            .where(and(eq(aiImages.id, imageId), eq(aiImages.userId, userId)));
        return image;
    }
    async deleteAIImage(userId, imageId) {
        const result = await db
            .delete(aiImages)
            .where(and(eq(aiImages.id, imageId), eq(aiImages.userId, userId)));
        // drizzle returns object; presence of a result is enough
        return Boolean(result.rowCount ?? true);
    }
    async updateAIImage(id, data) {
        const [updated] = await db
            .update(aiImages)
            .set({ ...data })
            .where(eq(aiImages.id, id))
            .returning();
        return updated;
    }
    // Generated Images operations (NEW ENHANCED GALLERY - primary table)
    async getGeneratedImages(userId) {
        // Direct lookup first
        let images = await db
            .select()
            .from(generatedImages)
            .where(eq(generatedImages.userId, userId))
            .orderBy(desc(generatedImages.createdAt));
        if (images.length === 0) {
            // For Stack Auth users, check by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                images = await db
                    .select()
                    .from(generatedImages)
                    .where(eq(generatedImages.userId, linkedUser.id))
                    .orderBy(desc(generatedImages.createdAt));
            }
        }
        return images;
    }
    async saveGeneratedImage(data) {
        const [saved] = await db.insert(generatedImages).values(data).returning();
        return saved;
    }
    async updateGeneratedImage(id, data) {
        const [updated] = await db
            .update(generatedImages)
            .set({ ...data })
            .where(eq(generatedImages.id, id))
            .returning();
        return updated;
    }
    // Generated Videos operations (VEO 3 video generation)
    async getGeneratedVideos(userId) {
        // Direct lookup first
        let videos = await db
            .select()
            .from(generatedVideos)
            .where(eq(generatedVideos.userId, userId))
            .orderBy(desc(generatedVideos.createdAt));
        if (videos.length === 0) {
            // For Stack Auth users, check by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                videos = await db
                    .select()
                    .from(generatedVideos)
                    .where(eq(generatedVideos.userId, linkedUser.id))
                    .orderBy(desc(generatedVideos.createdAt));
            }
        }
        return videos;
    }
    async saveGeneratedVideo(data) {
        const [saved] = await db.insert(generatedVideos).values(data).returning();
        return saved;
    }
    async updateGeneratedVideo(id, data) {
        const [updated] = await db
            .update(generatedVideos)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(generatedVideos.id, id))
            .returning();
        return updated;
    }
    async getGeneratedVideoByJobId(jobId) {
        const [video] = await db
            .select()
            .from(generatedVideos)
            .where(eq(generatedVideos.jobId, jobId));
        return video;
    }
    async getUserVideosByStatus(userId, status) {
        if (status) {
            return await db
                .select()
                .from(generatedVideos)
                .where(and(eq(generatedVideos.userId, userId), eq(generatedVideos.status, status)))
                .orderBy(desc(generatedVideos.createdAt));
        }
        return await db
            .select()
            .from(generatedVideos)
            .where(eq(generatedVideos.userId, userId))
            .orderBy(desc(generatedVideos.createdAt));
    }
    // 🔑 Generation Tracker Methods - for temp preview workflow ONLY
    async createGenerationTracker(data) {
        const [tracker] = await db
            .insert(generationTrackers)
            .values(data)
            .returning();
        return tracker;
    }
    async saveGenerationTracker(data) {
        const [tracker] = await db
            .insert(generationTrackers)
            .values(data)
            .returning();
        return tracker;
    }
    async updateGenerationTracker(id, updates) {
        const [updatedTracker] = await db
            .update(generationTrackers)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(generationTrackers.id, id))
            .returning();
        if (!updatedTracker) {
            throw new Error(`Generation tracker with id ${id} not found`);
        }
        return updatedTracker;
    }
    async getGenerationTracker(id) {
        const [tracker] = await db
            .select()
            .from(generationTrackers)
            .where(eq(generationTrackers.id, id));
        return tracker;
    }
    async getCompletedGenerationTrackersForUser(userId, hoursBack) {
        const timeThreshold = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
        return await db
            .select()
            .from(generationTrackers)
            .where(and(eq(generationTrackers.userId, userId), eq(generationTrackers.status, 'completed'), gte(generationTrackers.createdAt, timeThreshold)))
            .orderBy(desc(generationTrackers.createdAt));
    }
    async getUserGenerationTrackers(userId) {
        return await db
            .select()
            .from(generationTrackers)
            .where(eq(generationTrackers.userId, userId))
            .orderBy(desc(generationTrackers.createdAt));
    }
    async getProcessingGenerationTrackers() {
        return await db
            .select()
            .from(generationTrackers)
            .where(eq(generationTrackers.status, 'processing'))
            .orderBy(desc(generationTrackers.createdAt));
    }
    // User Model operations - with dual ID support for Stack Auth migration
    async getUserModel(userId) {
        // Direct lookup first
        let [model] = await db
            .select()
            .from(userModels)
            .where(eq(userModels.userId, userId));
        if (!model) {
            // For Stack Auth users, also check by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                [model] = await db
                    .select()
                    .from(userModels)
                    .where(eq(userModels.userId, linkedUser.id));
            }
        }
        return model;
    }
    async getUserModelByUserId(userId) {
        // Alias for getUserModel - same functionality with dual ID support
        return this.getUserModel(userId);
    }
    async getUserModelById(modelId) {
        const [model] = await db
            .select()
            .from(userModels)
            .where(eq(userModels.id, modelId));
        return model;
    }
    // 🔥 BULLETPROOF: Get user model with aggressive Stack Auth ID and email linking
    async getUserModelByStackAuthAndEmail(stackAuthId, email) {
        console.log('🔥 BULLETPROOF: Attempting optimized user lookup with:', {
            stackAuthId: stackAuthId.substring(0, 8) + '...',
            email
        });
        try {
            // OPTIMIZATION: Single query with LEFT JOIN to get both user and model data
            const results = await db
                .select({
                // User fields
                userId: users.id,
                userStackAuthId: users.stackAuthId,
                userEmail: users.email,
                userFirstName: users.firstName,
                userLastName: users.lastName,
                userDisplayName: users.displayName,
                userProfileImageUrl: users.profileImageUrl,
                userCreatedAt: users.createdAt,
                userUpdatedAt: users.updatedAt,
                userLastLoginAt: users.lastLoginAt,
                userStripeCustomerId: users.stripeCustomerId,
                userStripeSubscriptionId: users.stripeSubscriptionId,
                userPlan: users.plan,
                userRole: users.role,
                userMonthlyGenerationLimit: users.monthlyGenerationLimit,
                userGenerationsUsedThisMonth: users.generationsUsedThisMonth,
                userMayaAiAccess: users.mayaAiAccess,
                userVictoriaAiAccess: users.victoriaAiAccess,
                userHasRetrainingAccess: users.hasRetrainingAccess,
                userRetrainingSessionId: users.retrainingSessionId,
                userRetrainingPaidAt: users.retrainingPaidAt,
                userOnboardingProgress: users.onboardingProgress,
                userPreferredOnboardingMode: users.preferredOnboardingMode,
                userGender: users.gender,
                userProfession: users.profession,
                userBrandStyle: users.brandStyle,
                userPhotoGoals: users.photoGoals,
                // Model fields (nullable)
                modelId: userModels.id,
                modelTrainingId: userModels.trainingId,
                modelReplicateModelId: userModels.replicateModelId,
                modelReplicateVersionId: userModels.replicateVersionId,
                modelTrainedModelPath: userModels.trainedModelPath,
                modelTriggerWord: userModels.triggerWord,
                modelTrainingStatus: userModels.trainingStatus,
                modelModelName: userModels.modelName,
                modelIsLuxury: userModels.isLuxury,
                modelFinetuneId: userModels.finetuneId,
                modelModelType: userModels.modelType,
                modelTrainingProgress: userModels.trainingProgress,
                modelEstimatedCompletionTime: userModels.estimatedCompletionTime,
                modelFailureReason: userModels.failureReason,
                modelStartedAt: userModels.startedAt,
                modelCreatedAt: userModels.createdAt,
                modelUpdatedAt: userModels.updatedAt,
                modelCompletedAt: userModels.completedAt,
            })
                .from(users)
                .leftJoin(userModels, eq(users.id, userModels.userId))
                .where(or(eq(users.stackAuthId, stackAuthId), eq(users.email, email)))
                .limit(1);
            let result = results[0] || null;
            if (!result) {
                return { user: undefined, model: undefined };
            }
            // Check if we need to link Stack Auth ID
            const needsLinking = result.userId && !result.userStackAuthId && result.userEmail === email;
            const needsLoginUpdate = result.userId && result.userStackAuthId === stackAuthId;
            if (needsLinking) {
                console.log('🔗 Linking existing user to Stack Auth:', {
                    userId: result.userId,
                    email: result.userEmail
                });
                // Update user with Stack Auth ID
                await db.update(users)
                    .set({
                    stackAuthId: stackAuthId,
                    updatedAt: new Date(),
                    lastLoginAt: new Date()
                })
                    .where(eq(users.id, result.userId));
                // Update result with new values
                result.userStackAuthId = stackAuthId;
                result.userLastLoginAt = new Date();
                result.userUpdatedAt = new Date();
            }
            else if (needsLoginUpdate) {
                // Update last login for existing linked user
                await db.update(users)
                    .set({
                    lastLoginAt: new Date(),
                    updatedAt: new Date()
                })
                    .where(eq(users.id, result.userId));
                // Update result with new values
                result.userLastLoginAt = new Date();
                result.userUpdatedAt = new Date();
            }
            // Reconstruct user object
            const userRecord = {
                id: result.userId,
                stackAuthId: result.userStackAuthId,
                email: result.userEmail,
                firstName: result.userFirstName,
                lastName: result.userLastName,
                displayName: result.userDisplayName,
                profileImageUrl: result.userProfileImageUrl,
                createdAt: result.userCreatedAt,
                updatedAt: result.userUpdatedAt,
                lastLoginAt: result.userLastLoginAt,
                stripeCustomerId: result.userStripeCustomerId,
                stripeSubscriptionId: result.userStripeSubscriptionId,
                plan: result.userPlan,
                role: result.userRole,
                monthlyGenerationLimit: result.userMonthlyGenerationLimit,
                generationsUsedThisMonth: result.userGenerationsUsedThisMonth,
                mayaAiAccess: result.userMayaAiAccess,
                victoriaAiAccess: result.userVictoriaAiAccess,
                hasRetrainingAccess: result.userHasRetrainingAccess,
                retrainingSessionId: result.userRetrainingSessionId,
                retrainingPaidAt: result.userRetrainingPaidAt,
                onboardingProgress: result.userOnboardingProgress,
                preferredOnboardingMode: result.userPreferredOnboardingMode,
                gender: result.userGender,
                profession: result.userProfession,
                brandStyle: result.userBrandStyle,
                photoGoals: result.userPhotoGoals,
            };
            // Reconstruct model object if it exists
            let userModel = null;
            if (result.modelId) {
                userModel = {
                    id: result.modelId,
                    userId: result.userId,
                    trainingId: result.modelTrainingId,
                    replicateModelId: result.modelReplicateModelId,
                    replicateVersionId: result.modelReplicateVersionId,
                    trainedModelPath: result.modelTrainedModelPath,
                    triggerWord: result.modelTriggerWord || '',
                    trainingStatus: result.modelTrainingStatus,
                    modelName: result.modelModelName,
                    isLuxury: result.modelIsLuxury,
                    finetuneId: result.modelFinetuneId,
                    modelType: result.modelModelType,
                    trainingProgress: result.modelTrainingProgress,
                    estimatedCompletionTime: result.modelEstimatedCompletionTime,
                    failureReason: result.modelFailureReason,
                    startedAt: result.modelStartedAt,
                    createdAt: result.modelCreatedAt,
                    updatedAt: result.modelUpdatedAt,
                    completedAt: result.modelCompletedAt,
                };
            }
            console.log('✅ User lookup result:', {
                foundUser: !!userRecord,
                foundModel: !!userModel,
                trainingStatus: userModel?.trainingStatus || 'none',
                userEmail: userRecord.email
            });
            return {
                user: userRecord,
                model: userModel || undefined
            };
        }
        catch (error) {
            console.error('❌ Bulletproof user lookup failed:', error);
            return { user: undefined, model: undefined };
        }
    }
    async createUserModel(data) {
        const [model] = await db.insert(userModels).values([data]).returning();
        return model;
    }
    async updateUserModel(userId, data) {
        // Try direct update first
        let [updated] = await db
            .update(userModels)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(userModels.userId, userId))
            .returning();
        if (!updated) {
            // For Stack Auth users, try updating by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                [updated] = await db
                    .update(userModels)
                    .set({ ...data, updatedAt: new Date() })
                    .where(eq(userModels.userId, linkedUser.id))
                    .returning();
            }
        }
        if (!updated) {
            throw new Error(`User model not found for user: ${userId}`);
        }
        return updated;
    }
    // 🚨 CRITICAL: Clean up failed training data completely
    async deleteFailedTrainingData(userId) {
        // Delete in correct order to avoid foreign key constraints
        await db.delete(generationTrackers).where(eq(generationTrackers.userId, userId));
        await db.delete(aiImages).where(eq(aiImages.userId, userId));
        await db.delete(userModels).where(eq(userModels.userId, userId));
    }
    // 🔍 Check if user needs to restart training due to failure
    async checkTrainingStatus(userId) {
        const model = await this.getUserModel(userId);
        // 🔧 FIX: Only show restart UI if there's actually FAILED training data
        // New users with no model should go through normal training flow
        if (!model) {
            return { needsRestart: false, reason: 'Ready to start training' };
        }
        if (model.trainingStatus === 'failed') {
            return { needsRestart: true, reason: 'Training failed - please restart with new images' };
        }
        if (model.trainingStatus === 'training' && model.startedAt) {
            // Check if training has been stuck for more than 2 hours
            const hoursAgo = (Date.now() - new Date(model.startedAt).getTime()) / (1000 * 60 * 60);
            if (hoursAgo > 2) {
                return { needsRestart: true, reason: 'Training appears stuck - please restart' };
            }
        }
        return { needsRestart: false, reason: 'Training is proceeding normally' };
    }
    async ensureUserModel(userId) {
        // Check if user model already exists (with dual ID support)
        const existingModel = await this.getUserModel(userId);
        if (existingModel) {
            return existingModel;
        }
        // For new user models, use the original user ID (not Stack Auth ID)
        const user = await this.getUser(userId);
        const actualUserId = user?.id || userId;
        // Create new user model that requires actual training
        const triggerWord = `user${actualUserId}`;
        const modelData = {
            userId: actualUserId,
            triggerWord,
            trainingStatus: 'not_started', // User must complete training
            modelName: `${actualUserId}-selfie-lora`, // Consistent with training service
        };
        return await this.createUserModel(modelData);
    }
    async getUserModelsByStatus(status) {
        return await db
            .select()
            .from(userModels)
            .where(eq(userModels.trainingStatus, status))
            .orderBy(desc(userModels.createdAt));
    }
    async deleteUserModel(userId) {
        await db.delete(userModels).where(eq(userModels.userId, userId));
    }
    async getAllInProgressTrainings() {
        return await db
            .select()
            .from(userModels)
            .where(eq(userModels.trainingStatus, 'training'))
            .orderBy(desc(userModels.createdAt));
    }
    // ✅ LORA MIGRATION: Get all users with completed training for LoRA extraction
    async getAllCompletedTrainings() {
        return await db
            .select()
            .from(userModels)
            .where(eq(userModels.trainingStatus, 'completed'))
            .orderBy(desc(userModels.createdAt));
    }
    async getMonthlyRetrainCount(userId, month, year) {
        // Get start and end dates for the month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        // Count models created this month (retraining creates new models)
        const models = await db
            .select()
            .from(userModels)
            .where(and(eq(userModels.userId, userId), gte(userModels.createdAt, startDate), lte(userModels.createdAt, endDate)));
        return models.length;
    }
    // Add methods to work with actual database columns
    async getUserModelByDatabaseUserId(userId) {
        const result = await db.select().from(userModels).where(eq(userModels.userId, userId));
        return result[0];
    }
    // Selfie Upload operations
    async getSelfieUploads(userId) {
        return await db
            .select()
            .from(selfieUploads)
            .where(eq(selfieUploads.userId, userId))
            .orderBy(desc(selfieUploads.createdAt));
    }
    async saveSelfieUpload(data) {
        const [saved] = await db.insert(selfieUploads).values([data]).returning();
        return saved;
    }
    // Subscription operations
    async getSubscription(userId) {
        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId));
        return subscription;
    }
    async getUserSubscription(userId) {
        const [subscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.userId, userId));
        return subscription;
    }
    // Flatlay Collections - NEVER USE STOCK PHOTOS
    async getFlatlayCollections() {
        // Return curated flatlay collections from actual flatlay gallery
        // This should pull from a real flatlay gallery, not stock photos
        return [
            {
                name: 'Luxury Minimal',
                images: [
                    // These would be actual flatlay gallery URLs from your library
                    '/api/flatlay-gallery/luxury-minimal-1.jpg',
                    '/api/flatlay-gallery/luxury-minimal-2.jpg',
                    '/api/flatlay-gallery/luxury-minimal-3.jpg'
                ]
            },
            {
                name: 'Editorial Magazine',
                images: [
                    '/api/flatlay-gallery/editorial-1.jpg',
                    '/api/flatlay-gallery/editorial-2.jpg',
                    '/api/flatlay-gallery/editorial-3.jpg'
                ]
            },
            {
                name: 'Business Professional',
                images: [
                    '/api/flatlay-gallery/business-1.jpg',
                    '/api/flatlay-gallery/business-2.jpg',
                    '/api/flatlay-gallery/business-3.jpg'
                ]
            }
        ];
    }
    async createSubscription(data) {
        const [subscription] = await db.insert(subscriptions).values([data]).returning();
        return subscription;
    }
    // Usage operations
    async getUserUsage(userId) {
        const [usage] = await db
            .select()
            .from(userUsage)
            .where(eq(userUsage.userId, userId));
        return usage;
    }
    async createUserUsage(data) {
        const [usage] = await db.insert(userUsage).values(data).returning();
        return usage;
    }
    async updateUserUsage(userId, data) {
        const [updated] = await db
            .update(userUsage)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(userUsage.userId, userId))
            .returning();
        return updated;
    }
    // Plan-based access control methods
    async getUserPlan(userId) {
        const user = await this.getUser(userId);
        return user?.plan || 'basic'; // Default to basic plan
    }
    async hasMayaAIAccess(userId) {
        // Maya AI requires trained model on both basic and full-access tiers
        const user = await this.getUser(userId);
        const userModel = await this.getUserModel(userId);
        const hasTrainedModel = userModel?.trainingStatus === 'completed';
        return hasTrainedModel || user?.role === 'admin' || false;
    }
    async hasVictoriaAIAccess(userId) {
        // Victoria AI requires full-access tier + trained model
        const user = await this.getUser(userId);
        const userModel = await this.getUserModel(userId);
        const hasTrainedModel = userModel?.trainingStatus === 'completed';
        const hasFullAccess = user?.plan === 'full-access' || user?.role === 'admin';
        return hasFullAccess && (hasTrainedModel || user?.role === 'admin');
    }
    async hasSandraAIAccess(userId) {
        const usage = await this.getUserUsage(userId);
        return usage?.plan === 'admin' || false;
    }
    async getGenerationLimits(userId) {
        const user = await this.getUser(userId);
        // Admin users get unlimited access
        if (user?.role === 'admin') {
            return {
                allowed: 999999,
                used: user?.generationsUsedThisMonth || 0
            };
        }
        // Generation limits based on plan
        const monthlyLimit = user?.monthlyGenerationLimit || 30; // Default to basic plan
        return {
            allowed: monthlyLimit,
            used: user?.generationsUsedThisMonth || 0
        };
    }
    async isFreePlan(userId) {
        const plan = await this.getUserPlan(userId);
        return plan === 'free' || plan === null;
    }
    async isAdminUser(userId) {
        const plan = await this.getUserPlan(userId);
        return plan === 'admin';
    }
    // Photoshoot sessions removed - not implemented in schema
    // Removed session methods - use existing getAIImages() instead
    // Victoria chat operations
    async createVictoriaChat(data) {
        const [chat] = await db
            .insert(victoriaChats)
            .values([data])
            .returning();
        return chat;
    }
    async getVictoriaChats(userId) {
        return await db
            .select()
            .from(victoriaChats)
            .where(eq(victoriaChats.userId, userId))
            .orderBy(desc(victoriaChats.createdAt));
    }
    async getVictoriaChatsBySession(userId, sessionId) {
        return await db
            .select()
            .from(victoriaChats)
            .where(and(eq(victoriaChats.userId, userId), eq(victoriaChats.sessionId, sessionId)))
            .orderBy(victoriaChats.createdAt);
    }
    // Photo selections operations
    async savePhotoSelections(data) {
        const [selection] = await db
            .insert(photoSelections)
            .values([data])
            .onConflictDoUpdate({
            target: photoSelections.userId,
            set: {
                selectedSelfieIds: data.selectedSelfieIds,
                selectedFlatlayCollection: data.selectedFlatlayCollection,
                updatedAt: new Date(),
            },
        })
            .returning();
        return selection;
    }
    async getPhotoSelections(userId) {
        const [selection] = await db
            .select()
            .from(photoSelections)
            .where(eq(photoSelections.userId, userId));
        return selection;
    }
    async getInspirationPhotos(userId) {
        // Get user's selected photos from photo selections
        const photoSelections = await this.getPhotoSelections(userId);
        // selectedSelfieIds is JSON array in schema; guard at runtime
        if (!photoSelections || !Array.isArray(photoSelections.selectedSelfieIds) || !photoSelections.selectedSelfieIds?.length) {
            return [];
        }
        // Get the actual images from AI images table
        const userImages = await this.getAIImages(userId);
        const selectedIds = photoSelections.selectedSelfieIds;
        const selectedImages = userImages.filter(img => selectedIds.includes(img.id));
        return selectedImages.map(img => ({
            id: img.id,
            url: img.imageUrl,
            description: img.prompt || 'Selected inspiration photo'
        }));
    }
    // Landing page operations
    async createLandingPage(data) {
        const [page] = await db
            .insert(landingPages)
            .values([data])
            .returning();
        return page;
    }
    async getLandingPages(userId) {
        return await db
            .select()
            .from(landingPages)
            .where(eq(landingPages.userId, userId))
            .orderBy(desc(landingPages.createdAt));
    }
    // Landing pages operations
    async createUserLandingPage(data) {
        const [page] = await db
            .insert(userLandingPages)
            .values([data])
            .returning();
        return page;
    }
    async getUserLandingPages(userId) {
        return await db
            .select()
            .from(userLandingPages)
            .where(eq(userLandingPages.userId, userId))
            .orderBy(desc(userLandingPages.updatedAt));
    }
    async getUserLandingPageBySlug(slug) {
        const [page] = await db
            .select()
            .from(userLandingPages)
            .where(eq(userLandingPages.slug, slug));
        return page;
    }
    async updateUserLandingPage(id, data) {
        const [updated] = await db
            .update(userLandingPages)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(userLandingPages.id, id))
            .returning();
        return updated;
    }
    // Email Capture operations
    // Brand onboarding operations
    async saveBrandOnboarding(data) {
        const [saved] = await db
            .insert(brandOnboarding)
            .values(data)
            .onConflictDoUpdate({
            target: brandOnboarding.userId,
            set: {
                ...data,
                updatedAt: new Date(),
            },
        })
            .returning();
        return saved;
    }
    async getBrandOnboarding(userId) {
        const [data] = await db
            .select()
            .from(brandOnboarding)
            .where(eq(brandOnboarding.userId, userId));
        return data;
    }
    // Agent Conversations (unified with claudeConversations/claudeMessages)
    async saveAgentConversation(agentId, userId, userMessage, agentResponse, fileOperations, conversationId) {
        // Create or get conversation - USE STABLE ID per agent per user
        const convId = conversationId || `admin_${agentId}_${userId}`;
        const conversationRecords = await db
            .select()
            .from(claudeConversations)
            .where(eq(claudeConversations.conversationId, convId))
            .limit(1);
        let conversation = conversationRecords[0] || null;
        if (!conversation) {
            [conversation] = await db.insert(claudeConversations).values({
                userId,
                agentName: agentId,
                conversationId: convId,
                title: `Admin chat with ${agentId}`,
                lastMessageAt: new Date(),
                messageCount: 0
            }).returning();
        }
        // Save user message
        await db.insert(claudeMessages).values({
            conversationId: convId,
            role: 'user',
            content: userMessage,
            metadata: fileOperations ? { fileOperations } : null
        });
        // Save agent response  
        await db.insert(claudeMessages).values({
            conversationId: convId,
            role: 'assistant',
            content: agentResponse,
            metadata: fileOperations ? { fileOperations } : null
        });
        // Update conversation metadata
        await db.update(claudeConversations)
            .set({
            lastMessageAt: new Date(),
            messageCount: sql `${claudeConversations.messageCount} + 2`
        })
            .where(eq(claudeConversations.conversationId, convId));
        return conversation;
    }
    async getAgentConversations(agentId, userId) {
        // Get all conversations for this agent and user
        const conversations = await db.select()
            .from(claudeConversations)
            .where(and(eq(claudeConversations.agentName, agentId), eq(claudeConversations.userId, userId)))
            .orderBy(desc(claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from the most recent conversation
        const messages = await db.select()
            .from(claudeMessages)
            .where(eq(claudeMessages.conversationId, conversations[0].conversationId))
            .orderBy(claudeMessages.timestamp);
        return messages;
    }
    async getAgentConversationHistory(agentId, userId, conversationId) {
        if (conversationId) {
            // Get specific conversation
            const messages = await db.select()
                .from(claudeMessages)
                .where(eq(claudeMessages.conversationId, conversationId))
                .orderBy(claudeMessages.timestamp);
            return messages.map(msg => ({
                role: msg.role === 'assistant' ? 'ai' : msg.role,
                content: msg.content
            }));
        }
        // Get all conversations for this agent and user
        const conversations = await db.select()
            .from(claudeConversations)
            .where(and(eq(claudeConversations.agentName, agentId), eq(claudeConversations.userId, userId)))
            .orderBy(desc(claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from most recent conversation
        const messages = await db.select()
            .from(claudeMessages)
            .where(eq(claudeMessages.conversationId, conversations[0].conversationId))
            .orderBy(claudeMessages.timestamp);
        return messages.map(msg => ({
            role: msg.role === 'assistant' ? 'ai' : msg.role,
            content: msg.content
        }));
    }
    async getAllAgentConversations(userId) {
        // Get all agent conversations for this user
        const conversations = await db.select()
            .from(claudeConversations)
            .where(eq(claudeConversations.userId, userId))
            .orderBy(desc(claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from all conversations
        const conversationIds = conversations.map(c => c.conversationId);
        const messages = await db.select()
            .from(claudeMessages)
            .where(sql `${claudeMessages.conversationId} = ANY(${conversationIds})`)
            .orderBy(claudeMessages.timestamp);
        return messages;
    }
    // Sandra AI conversation operations (minimal implementation)
    async getSandraConversations() {
        // For now, return empty array - could implement full conversation storage later
        return [];
    }
    async saveSandraConversation(data) {
        // For now, just return the data - could implement full conversation storage later
        return data;
    }
    // Agent memory operations - Complete implementation
    async saveAgentMemory(agentId, userId, memoryData) {
        try {
            // ENHANCED: Include full conversation history in memory data
            const base = (typeof memoryData === 'object' && memoryData !== null) ? memoryData : {};
            const conversationHistory = Array.isArray(base.conversationHistory) ? base.conversationHistory : [];
            const enhancedMemoryData = {
                ...base,
                conversationHistory,
                lastSaved: new Date().toISOString()
            };
            // Save memory as special conversation entry
            await this.saveAgentConversation(agentId, userId, '**CONVERSATION_MEMORY**', JSON.stringify(enhancedMemoryData), []);
        }
        catch (error) {
            console.error('Failed to save agent memory:', error);
            throw error;
        }
    }
    async getAgentMemory(agentId, userId) {
        try {
            const conversations = await this.getAgentConversations(agentId, userId);
            // Find the most recent memory entry (user message was '**CONVERSATION_MEMORY**')
            const memoryEntry = conversations
                .filter(msg => msg.role === 'user' && msg.content === '**CONVERSATION_MEMORY**')
                .sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return dateB - dateA;
            })[0];
            if (memoryEntry) {
                // Find the corresponding assistant response
                const memoryResponse = conversations.find(msg => msg.role === 'assistant' &&
                    Math.abs((msg.timestamp ? new Date(msg.timestamp).getTime() : 0) -
                        (memoryEntry.timestamp ? new Date(memoryEntry.timestamp).getTime() : 0)) < 1000);
                if (memoryResponse && memoryResponse.content) {
                    return JSON.parse(memoryResponse.content);
                }
            }
            return null;
        }
        catch (error) {
            console.error('Failed to retrieve agent memory:', error);
            return null;
        }
    }
    async clearAgentMemory(agentId, userId) {
        try {
            // Find memory conversation
            const conversationRecords = await db
                .select()
                .from(claudeConversations)
                .where(and(eq(claudeConversations.agentName, agentId), eq(claudeConversations.userId, userId)))
                .limit(1);
            const conversation = conversationRecords[0] || null;
            if (conversation) {
                // Delete memory messages (where content is '**CONVERSATION_MEMORY**')
                await db.delete(claudeMessages)
                    .where(and(eq(claudeMessages.conversationId, conversation.conversationId), eq(claudeMessages.content, '**CONVERSATION_MEMORY**')));
            }
        }
        catch (error) {
            console.error('Failed to clear agent memory:', error);
            throw error;
        }
    }
    // Email Capture operations
    async captureEmail(data) {
        const [capture] = await db
            .insert(emailCaptures)
            .values(data)
            .returning();
        return capture;
    }
    // Maya chat operations
    async getMayaChats(userId) {
        return await db
            .select()
            .from(mayaChats)
            .where(eq(mayaChats.userId, userId))
            .orderBy(desc(mayaChats.lastActivity || mayaChats.createdAt));
    }
    // Get all Maya chats (for analytics)
    async getAllMayaChats() {
        return await db
            .select()
            .from(mayaChats)
            .orderBy(desc(mayaChats.lastActivity || mayaChats.createdAt));
    }
    // Get Maya chats by category for organized display
    async getMayaChatsByCategory(userId) {
        const chats = await this.getMayaChats(userId);
        const categorizedChats = {
            "Photo Generation": [],
            "Professional & Business": [],
            "Elegant & Luxury": [],
            "Casual & Everyday": [],
            "Date & Evening": [],
            "Vacation & Travel": [],
            "Style Consultation": []
        };
        chats.forEach(chat => {
            const category = chat.chatCategory || "Style Consultation";
            if (categorizedChats[category]) {
                categorizedChats[category].push(chat);
            }
            else {
                categorizedChats["Style Consultation"].push(chat);
            }
        });
        return categorizedChats;
    }
    // Get specific Maya chat
    async getMayaChat(chatId, userId) {
        const [chat] = await db
            .select()
            .from(mayaChats)
            .where(and(eq(mayaChats.id, parseInt(chatId)), eq(mayaChats.userId, userId)));
        return chat;
    }
    // Create new Maya chat
    async createMayaChat(userId, data) {
        const [chat] = await db
            .insert(mayaChats)
            .values({
            userId,
            chatTitle: data.title,
            chatCategory: 'Style Consultation',
            lastActivity: new Date()
        })
            .returning();
        if (data.initialMessage) {
            await this.saveMayaMessage(chat.id.toString(), userId, {
                message: data.initialMessage,
                role: 'user'
            });
        }
        return chat.id.toString();
    }
    // Save Maya chat with message and response
    async saveMayaChat(userId, data) {
        const [chat] = await db
            .insert(mayaChats)
            .values({
            userId,
            chatTitle: 'New Maya Chat',
            chatCategory: 'Style Consultation',
            lastActivity: new Date()
        })
            .returning();
        // Save user message
        await this.saveMayaMessage(chat.id.toString(), userId, {
            message: data.message,
            role: 'user'
        });
        // Save Maya response
        await this.saveMayaMessage(chat.id.toString(), userId, {
            message: data.response,
            role: 'assistant'
        });
        return chat.id.toString();
    }
    // Get Maya chat messages
    async getMayaChatMessages(chatId, userId) {
        return await db
            .select()
            .from(mayaChatMessages)
            .where(eq(mayaChatMessages.chatId, parseInt(chatId)))
            .orderBy(asc(mayaChatMessages.createdAt));
    }
    // Save Maya message
    async saveMayaMessage(chatId, userId, data) {
        const [message] = await db
            .insert(mayaChatMessages)
            .values({
            chatId: parseInt(chatId),
            content: data.message,
            role: data.role,
            createdAt: new Date()
        })
            .returning();
        return message.id.toString();
    }
    // Update Maya message
    async updateMayaMessage(messageId, userId, updates) {
        await db
            .update(mayaChatMessages)
            .set({ content: updates.content })
            .where(eq(mayaChatMessages.id, parseInt(messageId)));
    }
    // Legacy method - use createMayaChat(userId, data) instead
    async createMayaChatLegacy(data) {
        const [chat] = await db
            .insert(mayaChats)
            .values(data)
            .returning();
        return chat;
    }
    // User plan upgrade operations
    async upgradeUserToPremium(userId, plan) {
        return this.upgradeUserPlan(userId, plan);
    }
    async upgradeUserPlan(userId, plan) {
        // Determine the plan settings based on new pricing structure
        let planSettings;
        if (plan === 'basic') {
            planSettings = {
                plan: 'basic',
                monthlyGenerationLimit: 30,
                mayaAiAccess: true,
                victoriaAiAccess: false,
                // flatlayLibraryAccess and websiteBuilderAccess removed - not in schema
            };
        }
        else if (plan === 'full-access') {
            planSettings = {
                plan: 'full-access',
                monthlyGenerationLimit: 100,
                mayaAiAccess: true,
                victoriaAiAccess: true,
                // flatlayLibraryAccess and websiteBuilderAccess removed - not in schema
            };
        }
        else {
            // Legacy support for old plans
            planSettings = {
                plan: plan,
                monthlyGenerationLimit: plan === 'images-only' ? 30 : 100,
                mayaAiAccess: true,
                victoriaAiAccess: plan !== 'images-only',
                // flatlayLibraryAccess and websiteBuilderAccess removed - not in schema
            };
        }
        const [updatedUser] = await db
            .update(users)
            .set({
            ...planSettings,
            updatedAt: new Date()
        })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    }
    // Legacy method - use getMayaChatMessages(chatId, userId) instead
    async getMayaChatMessagesLegacy(chatId) {
        const messages = await db
            .select()
            .from(mayaChatMessages)
            .where(eq(mayaChatMessages.chatId, chatId))
            .orderBy(mayaChatMessages.createdAt);
        // Parse JSON fields for frontend compatibility and verify fullPrompt preservation
        return messages.map(msg => {
            const processedMsg = {
                ...msg,
                imagePreview: msg.imagePreview ? JSON.parse(msg.imagePreview) : null,
                conceptCards: msg.conceptCards ? msg.conceptCards : null, // ENHANCED: conceptCards stored as JSONB with fullPrompt preserved
                quickButtons: msg.quickButtons ? JSON.parse(msg.quickButtons) : null,
            };
            // CRITICAL: Verify fullPrompt field preservation in retrieved concept cards
            if (processedMsg.conceptCards && Array.isArray(processedMsg.conceptCards)) {
                const conceptsWithPrompts = processedMsg.conceptCards.filter((card) => 'fullPrompt' in card && card.fullPrompt);
                if (conceptsWithPrompts.length > 0) {
                    conceptsWithPrompts.forEach((card, index) => {
                        const title = card.title || '';
                        const fullPromptLen = card.fullPrompt?.length || 0;
                    });
                }
            }
            return processedMsg;
        });
    }
    // REMOVED: getAllMayaChatMessages method to prevent session mixing
    // Use getMayaChatMessages(chatId) for session-specific loading
    async createMayaChatMessage(data) {
        // CRITICAL: Ensure fullPrompt field is preserved in concept cards
        // @ts-ignore - Complex message data structure with dynamic properties
        if (data.conceptCards && Array.isArray(data.conceptCards)) {
            // @ts-ignore - Complex message data structure with dynamic properties
            const conceptsWithPrompts = data.conceptCards.filter((card) => 'fullPrompt' in card && card.fullPrompt);
            if (conceptsWithPrompts.length > 0) {
                conceptsWithPrompts.forEach((card, index) => {
                    const title = card.title || '';
                    const fullPromptLen = card.fullPrompt?.length || 0;
                });
            }
        }
        const [message] = await db
            .insert(mayaChatMessages)
            .values(data)
            .returning();
        return message;
    }
    // CRITICAL FIX: Missing saveMayaChatMessage method causing GenerationCompletionMonitor failure
    async saveMayaChatMessage(data) {
        return this.createMayaChatMessage(data);
    }
    // CRITICAL FIX: Add missing getMayaConceptById method for generation system
    async getMayaConceptById(conceptId) {
        // Search through Maya chat messages for concept cards with matching ID
        const messages = await db
            .select()
            .from(mayaChatMessages)
            .where(eq(mayaChatMessages.role, 'maya'))
            .orderBy(desc(mayaChatMessages.createdAt));
        // Look through each message's conceptCards for the matching conceptId
        for (const message of messages) {
            if (message.conceptCards && Array.isArray(message.conceptCards)) {
                const conceptCard = message.conceptCards.find((card) => card.id === conceptId);
                if (conceptCard) {
                    const title = conceptCard.title || '';
                    const fullPrompt = conceptCard.fullPrompt;
                    return conceptCard;
                }
            }
        }
        return undefined;
    }
    async updateMayaChatMessage(messageId, data) {
        await db
            .update(mayaChatMessages)
            .set(data)
            .where(eq(mayaChatMessages.id, messageId));
    }
    // Get generation tracker by prediction ID for website generator
    async getGenerationTrackerByPredictionId(predictionId) {
        const [tracker] = await db
            .select()
            .from(generationTrackers)
            .where(eq(generationTrackers.predictionId, predictionId));
        return tracker;
    }
    // Admin operations
    async setUserAsAdmin(email) {
        try {
            const [user] = await db
                .update(users)
                .set({
                role: 'admin',
                monthlyGenerationLimit: -1, // Unlimited
                plan: 'sselfie-studio',
                mayaAiAccess: true,
                victoriaAiAccess: true,
                updatedAt: new Date()
            })
                .where(eq(users.email, email))
                .returning();
            return user || null;
        }
        catch (error) {
            console.error('Error setting user as admin:', error);
            return null;
        }
    }
    async isUserAdmin(userId) {
        try {
            const [user] = await db
                .select({ role: users.role })
                .from(users)
                .where(eq(users.id, userId));
            return user?.role === 'admin';
        }
        catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
    async hasUnlimitedGenerations(userId) {
        try {
            const [user] = await db
                .select({
                role: users.role,
                monthlyGenerationLimit: users.monthlyGenerationLimit
            })
                .from(users)
                .where(eq(users.id, userId));
            return user?.role === 'admin' || user?.monthlyGenerationLimit === -1;
        }
        catch (error) {
            console.error('Error checking unlimited generations:', error);
            return false;
        }
    }
    async updateSubscription(id, updates) {
        const [subscription] = await db
            .update(subscriptions)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(subscriptions.id, id))
            .returning();
        return subscription;
    }
    // LoRA Training and Weights Management
    async createTrainingRun(trainingRun) {
        const [run] = await db.insert(trainingRuns).values(trainingRun).returning();
        return run;
    }
    async getTrainingRun(id) {
        const [run] = await db.select().from(trainingRuns).where(eq(trainingRuns.id, id));
        return run;
    }
    async getTrainingRunByTrainingId(trainingId) {
        const [run] = await db.select().from(trainingRuns).where(eq(trainingRuns.trainingId, trainingId));
        return run;
    }
    async updateTrainingRun(id, updates) {
        const [run] = await db.update(trainingRuns).set(updates).where(eq(trainingRuns.id, id)).returning();
        return run;
    }
    async listUserTrainingRuns(userId) {
        return db.select().from(trainingRuns).where(eq(trainingRuns.userId, userId)).orderBy(desc(trainingRuns.createdAt));
    }
    async createLoraWeight(weight) {
        const [loraWeight] = await db.insert(loraWeights).values(weight).returning();
        return loraWeight;
    }
    async getLoraWeight(id) {
        const [weight] = await db.select().from(loraWeights).where(eq(loraWeights.id, id));
        return weight;
    }
    async getUserActiveLoraWeight(userId) {
        // Get the most recent available LoRA weight for the user
        const [weight] = await db.select().from(loraWeights)
            .where(and(eq(loraWeights.userId, userId), eq(loraWeights.status, 'available')))
            .orderBy(desc(loraWeights.createdAt))
            .limit(1);
        return weight;
    }
    async listUserLoraWeights(userId) {
        return db.select().from(loraWeights).where(eq(loraWeights.userId, userId)).orderBy(desc(loraWeights.createdAt));
    }
    async updateLoraWeight(id, updates) {
        const [weight] = await db.update(loraWeights).set(updates).where(eq(loraWeights.id, id)).returning();
        return weight;
    }
    async setActiveLoraWeight(userId, weightId) {
        // Mark all user's weights as archived, then set the selected one as available
        await db.update(loraWeights).set({ status: 'archived' }).where(eq(loraWeights.userId, userId));
        await db.update(loraWeights).set({ status: 'available' }).where(eq(loraWeights.id, weightId));
    }
    // ✅ RESTORED: Simple LoRA weights storage method
    async storeLoRAWeights(data) {
        // Extract S3 bucket and key from URL for proper storage
        const urlParts = data.weightsUrl.replace('https://', '').split('/');
        const s3Bucket = urlParts[0].split('.s3.amazonaws.com')[0];
        const s3Key = urlParts.slice(1).join('/');
        // Generate trigger word for this user
        const triggerWord = `user${data.userId.replace(/[^a-zA-Z0-9]/g, '')}`;
        // Find or create training run record
        let trainingRun = await this.getTrainingRunByTrainingId(data.trainingId);
        if (!trainingRun) {
            trainingRun = await this.createTrainingRun({
                userId: data.userId,
                trainingId: data.trainingId,
                status: 'completed',
                baseModel: 'flux-dev',
                completedAt: data.extractedAt
            });
        }
        // Create LoRA weight record with Maya's intelligent scaling defaults
        const mayaScales = {
            closeUpPortrait: 0.9, // From Maya personality
            halfBodyShot: 1.0, // From Maya personality  
            fullScenery: 0.85, // From Maya personality
            creativeOptimized: 1.1 // From Maya personality - the key 1.1 value!
        };
        await this.createLoraWeight({
            userId: data.userId,
            trainingRunId: trainingRun.id,
            triggerWord: triggerWord,
            baseModel: 'flux-dev',
            s3Bucket: s3Bucket,
            s3Key: s3Key,
            fileSize: data.fileSize,
            checksum: data.checksum,
            rank: 32, // Standard LoRA rank
            networkType: 'lora',
            status: 'available',
            defaultScales: mayaScales, // Maya's intelligent scaling per shot type
            metadata: {
                extractedAt: data.extractedAt,
                originalUrl: data.weightsUrl
            }
        });
    }
    async getLoRAWeights(userId) {
        const weight = await this.getUserActiveLoraWeight(userId);
        if (!weight)
            return undefined;
        return { s3Bucket: weight.s3Bucket, s3Key: weight.s3Key };
    }
    // Additional storage methods can be added here as needed
    // Admin dashboard count operations
    async getUserCount() {
        const result = await db.select({ count: sql `count(*)` }).from(users);
        return Number(result[0]?.count || 0);
    }
    async getAIImageCount() {
        const result = await db.select({ count: sql `count(*)` }).from(aiImages);
        return Number(result[0]?.count || 0);
    }
    async getAgentConversationCount() {
        const result = await db.select({ count: sql `count(*)` }).from(claudeMessages);
        return Number(result[0]?.count || 0);
    }
    // HYBRID BACKEND ARCHITECTURE: Implementation of conversation and concept card operations
    // Conversation operations
    async createConversation(data) {
        const [conversation] = await db
            .insert(conversations)
            .values({
            ...data,
            userId: data.userId || '',
            agentName: data.agentName || 'maya',
            title: data.title || 'New Conversation',
            status: data.status || 'active'
        })
            .returning();
        return conversation;
    }
    async getConversation(id) {
        const [conversation] = await db
            .select()
            .from(conversations)
            .where(eq(conversations.id, id));
        return conversation;
    }
    async getUserConversations(userId, agentName) {
        const conditions = [eq(conversations.userId, userId)];
        if (agentName) {
            conditions.push(eq(conversations.agentName, agentName));
        }
        return await db
            .select()
            .from(conversations)
            .where(and(...conditions))
            .orderBy(desc(conversations.updatedAt));
    }
    async updateConversation(id, updates) {
        const [conversation] = await db
            .update(conversations)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(conversations.id, id))
            .returning();
        return conversation;
    }
    async archiveConversation(id) {
        return this.updateConversation(id, { status: 'archived' });
    }
    // Message operations
    async createMessage(data) {
        const [message] = await db
            .insert(messages)
            .values({
            ...data,
            role: data.role || 'user',
            content: data.content || '',
            conversationId: data.conversationId || ''
        })
            .returning();
        return message;
    }
    async getConversationMessages(conversationId, limit) {
        const baseQuery = db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.createdAt));
        if (limit) {
            return await baseQuery.limit(limit);
        }
        return await baseQuery;
    }
    async getLastMessages(conversationId, count) {
        return await db
            .select()
            .from(messages)
            .where(eq(messages.conversationId, conversationId))
            .orderBy(desc(messages.createdAt))
            .limit(count);
    }
    async getMessagesAfter(conversationId, messageId) {
        const targetMessage = await db
            .select()
            .from(messages)
            .where(eq(messages.id, messageId));
        if (!targetMessage.length || !targetMessage[0].createdAt)
            return [];
        return await db
            .select()
            .from(messages)
            .where(and(eq(messages.conversationId, conversationId), gte(messages.createdAt, targetMessage[0].createdAt)))
            .orderBy(messages.createdAt);
    }
    // Conversation summary operations
    async upsertConversationSummary(data) {
        const existing = await this.getConversationSummary(data.conversationId);
        if (existing) {
            const [summary] = await db
                .update(conversationSummaries)
                .set({
                ...data,
                summary: data.summary || '',
                updatedAt: new Date()
            })
                .where(eq(conversationSummaries.conversationId, data.conversationId))
                .returning();
            return summary;
        }
        else {
            const [summary] = await db
                .insert(conversationSummaries)
                .values({
                ...data,
                conversationId: data.conversationId || '',
                summary: data.summary || ''
            })
                .returning();
            return summary;
        }
    }
    async getConversationSummary(conversationId) {
        const [summary] = await db
            .select()
            .from(conversationSummaries)
            .where(eq(conversationSummaries.conversationId, conversationId));
        return summary;
    }
    async updateConversationSummary(conversationId, summary, lastMessageId, messageCount) {
        const [updated] = await db
            .update(conversationSummaries)
            .set({
            summary,
            lastMessageId,
            messageCount,
            updatedAt: new Date()
        })
            .where(eq(conversationSummaries.conversationId, conversationId))
            .returning();
        return updated;
    }
    // Concept card operations (with idempotency)
    async createConceptCard(data) {
        const [conceptCard] = await db
            .insert(conceptCards)
            .values({
            ...data,
            userId: data.userId || '',
            clientId: data.clientId || '',
            title: data.title || '',
            conversationId: data.conversationId || '',
            status: data.status || 'draft'
        })
            .onConflictDoUpdate({
            target: [conceptCards.userId, conceptCards.clientId],
            set: {
                ...data,
                updatedAt: new Date()
            }
        })
            .returning();
        return conceptCard;
    }
    async getConceptCard(id) {
        const [conceptCard] = await db
            .select()
            .from(conceptCards)
            .where(eq(conceptCards.id, id));
        return conceptCard;
    }
    async getConceptCardByClientId(userId, clientId) {
        const [conceptCard] = await db
            .select()
            .from(conceptCards)
            .where(and(eq(conceptCards.userId, userId), eq(conceptCards.clientId, clientId)));
        return conceptCard;
    }
    async getUserConceptCards(userId, conversationId) {
        const conditions = [eq(conceptCards.userId, userId)];
        if (conversationId) {
            conditions.push(eq(conceptCards.conversationId, conversationId));
        }
        return await db
            .select()
            .from(conceptCards)
            .where(and(...conditions))
            .orderBy(desc(conceptCards.updatedAt));
    }
    async updateConceptCard(id, updates) {
        const [conceptCard] = await db
            .update(conceptCards)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(conceptCards.id, id))
            .returning();
        return conceptCard;
    }
    async updateConceptCardGeneration(id, generatedImages, isLoading, isGenerating, hasGenerated) {
        const [conceptCard] = await db
            .update(conceptCards)
            .set({
            generatedImages,
            isLoading,
            isGenerating,
            hasGenerated,
            updatedAt: new Date()
        })
            .where(eq(conceptCards.id, id))
            .returning();
        return conceptCard;
    }
    async deleteConceptCard(id) {
        await db.delete(conceptCards).where(eq(conceptCards.id, id));
    }
    // Brand Assets operations (P3-C feature)
    async getBrandAssets(userId) {
        return await db
            .select()
            .from(brandAssets)
            .where(eq(brandAssets.userId, userId))
            .orderBy(desc(brandAssets.createdAt));
    }
    async saveBrandAsset(data) {
        const [asset] = await db
            .insert(brandAssets)
            .values({
            ...data,
            userId: data.userId || '',
            kind: data.kind || 'logo',
            url: data.url || '',
            filename: data.filename || '',
            fileSize: data.fileSize || 0
        })
            .returning();
        return asset;
    }
    async deleteBrandAsset(assetId, userId) {
        const result = await db
            .delete(brandAssets)
            .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)));
        return Boolean(result.rowCount ?? true);
    }
    async getBrandAsset(assetId, userId) {
        const [asset] = await db
            .select()
            .from(brandAssets)
            .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)));
        return asset;
    }
    // Image Variants operations (for non-destructive placement)
    async saveImageVariant(data) {
        const [variant] = await db
            .insert(imageVariants)
            .values({
            ...data,
            userId: data.userId || '',
            originalImageId: data.originalImageId || 0,
            variantUrl: data.variantUrl || '',
            variantType: data.variantType || 'placement',
            brandAssetId: data.brandAssetId || undefined,
            placementData: data.placementData || {}
        })
            .returning();
        return variant;
    }
    async getImageVariants(userId, originalImageId) {
        const conditions = [eq(imageVariants.userId, userId)];
        if (originalImageId) {
            conditions.push(eq(imageVariants.originalImageId, originalImageId));
        }
        return await db
            .select()
            .from(imageVariants)
            .where(and(...conditions))
            .orderBy(desc(imageVariants.createdAt));
    }
    async getImageVariant(variantId, userId) {
        const [variant] = await db
            .select()
            .from(imageVariants)
            .where(and(eq(imageVariants.id, variantId), eq(imageVariants.userId, userId)));
        return variant;
    }
    async updateImageVariant(variantId, updates) {
        const [variant] = await db
            .update(imageVariants)
            .set(updates)
            .where(eq(imageVariants.id, variantId))
            .returning();
        return variant;
    }
    // Maya Profile operations
    async getMayaProfile(userId) {
        const [profile] = await db
            .select()
            .from(mayaProfile)
            .where(eq(mayaProfile.userId, userId));
        return profile;
    }
    async insertMayaProfile(data) {
        const [profile] = await db
            .insert(mayaProfile)
            .values(data)
            .returning();
        return profile;
    }
    async updateMayaProfile(userId, updates) {
        const [profile] = await db
            .update(mayaProfile)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(mayaProfile.userId, userId))
            .returning();
        return profile;
    }
    // Maya Images operations
    async insertMayaImage(data) {
        const [image] = await db
            .insert(mayaImages)
            .values(data)
            .returning();
        return image;
    }
    // Maya Concepts operations
    async insertMayaConcept(data) {
        const [concept] = await db
            .insert(mayaConcepts)
            .values(data)
            .returning();
        return concept;
    }
    // 🔥 CRITICAL FIX: Ensure Maya profile exists for user synchronization
    async ensureMayaProfile(userId) {
        try {
            // Check if Maya profile already exists
            const existingProfile = await this.getMayaProfile(userId);
            if (existingProfile) {
                return existingProfile;
            }
            // Create new Maya profile with default settings
            const defaultProfile = {
                userId,
                onboardingStatus: 'pending',
                onboardingStep: 1,
                completedSteps: [],
                preferences: {},
                billingInfo: {},
                totalGenerations: 0,
                monthlyGenerations: 0,
                lastResetDate: new Date(),
                featureAccess: {
                    mayaChat: true,
                    imageGeneration: true,
                    modelTraining: true
                }
            };
            return await this.insertMayaProfile(defaultProfile);
        }
        catch (error) {
            console.error('❌ Failed to ensure Maya profile for user:', userId, error);
            throw error;
        }
    }
}
export const storage = new DatabaseStorage();
