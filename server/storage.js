"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
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
        trainingCoachingStarted: false,
        trainingCoachingCompleted: false,
        trainingCoachingPhase: '',
        trainingCoachingStep: 0,
        brandStrategyContext: {},
        generationsUsedThisMonth: 0,
        hasRetrainingAccess: false,
        retrainingSessionId: '',
        retrainingPaidAt: null,
        stripeCustomerId: '',
        stripeSubscriptionId: '',
        ...overrides
    };
}
const schema_js_1 = require("../shared/schema.js");
const schema_maya_js_1 = require("../shared/schema-maya.js");
const drizzle_js_1 = require("./drizzle.js");
/// <reference path="types/global.d.ts" />
const drizzle_orm_1 = require("drizzle-orm");
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
class DatabaseStorage {
    // User operations (required for Replit Auth)
    async getUser(id) {
        const [user] = await drizzle_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, id));
        return user;
    }
    async getUserByEmail(email) {
        const [user] = await drizzle_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email));
        return user;
    }
    // Link existing user account to Stack Auth ID (safer approach - preserve original ID)
    async linkStackAuthId(existingUserId, stackAuthId) {
        console.log(`🔗 Linking existing user ${existingUserId} to Stack Auth ID ${stackAuthId}`);
        // Add Stack Auth ID to existing user while preserving original ID and all relationships
        const [linkedUser] = await drizzle_js_1.db
            .update(schema_js_1.users)
            .set({
            stackAuthId: stackAuthId, // Store Stack Auth ID in separate column
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, existingUserId))
            .returning();
        console.log(`✅ Successfully linked user to Stack Auth ID: ${linkedUser.email}`);
        return linkedUser;
    }
    // Get user by Stack Auth ID (for linked accounts)
    async getUserByStackAuthId(stackAuthId) {
        const [user] = await drizzle_js_1.db.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.stackAuthId, stackAuthId));
        return user;
    }
    async createUser(userData) {
        console.log('🔄 Creating new user:', userData.email);
        let finalUserData = getDefaultUserFields(userData);
        // Special admin setup for ssa@ssasocial.com
        if (finalUserData.email === 'ssa@ssasocial.com') {
            finalUserData.role = 'admin';
            finalUserData.monthlyGenerationLimit = -1; // Unlimited
            finalUserData.plan = 'sselfie-studio';
            finalUserData.mayaAiAccess = true;
            finalUserData.victoriaAiAccess = true;
            console.log('👑 Setting admin privileges for ssa@ssasocial.com');
        }
        const [user] = await drizzle_js_1.db
            .insert(schema_js_1.users)
            .values({
            ...finalUserData,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        console.log('✅ Created new user:', user.id, user.email);
        return user;
    }
    async getAllUsers() {
        const allUsers = await drizzle_js_1.db.select().from(schema_js_1.users).orderBy((0, drizzle_orm_1.desc)(schema_js_1.users.createdAt));
        return allUsers;
    }
    async upsertUser(userData) {
        console.log('🔄 Upserting user:', userData.id, userData.email);
        let finalUserData = getDefaultUserFields(userData);
        // Special admin setup for ssa@ssasocial.com
        if (finalUserData.email === 'ssa@ssasocial.com') {
            finalUserData.role = 'admin';
            finalUserData.monthlyGenerationLimit = -1; // Unlimited
            finalUserData.plan = 'sselfie-studio';
            finalUserData.mayaAiAccess = true;
            finalUserData.victoriaAiAccess = true;
            console.log('👑 Setting admin privileges for ssa@ssasocial.com');
        }
        // First try to find existing user by ID
        const existingUser = await this.getUser(finalUserData.id);
        if (existingUser) {
            console.log('✅ Found existing user by ID, updating...');
            const [user] = await drizzle_js_1.db
                .update(schema_js_1.users)
                .set({
                ...finalUserData,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, finalUserData.id))
                .returning();
            return user;
        }
        // If not found by ID, check by email and update that record with new ID
        if (finalUserData.email) {
            const [userByEmail] = await drizzle_js_1.db
                .select()
                .from(schema_js_1.users)
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.email, finalUserData.email));
            if (userByEmail) {
                console.log('✅ Found existing user by email, updating with new Stack Auth ID...');
                // Update the existing user record with the new Stack Auth ID
                const [updatedUser] = await drizzle_js_1.db
                    .update(schema_js_1.users)
                    .set({
                    ...finalUserData,
                    id: finalUserData.id,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_js_1.users.email, finalUserData.email))
                    .returning();
                return updatedUser;
            }
        }
        // User doesn't exist by ID or email, create new one
        console.log('🆕 Creating new user...');
        try {
            const [user] = await drizzle_js_1.db
                .insert(schema_js_1.users)
                .values(finalUserData)
                .returning();
            return user;
        }
        catch (error) {
            // If duplicate key error on email, try to return existing user
            const e = error;
            if (e?.code === '23505' && e?.constraint === 'users_email_unique') {
                console.log('🔄 Duplicate email constraint, fetching existing user...');
                const [existingUser] = await drizzle_js_1.db
                    .select()
                    .from(schema_js_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_js_1.users.email, finalUserData.email || ''));
                if (existingUser) {
                    return existingUser;
                }
            }
            throw error;
        }
    }
    async updateUserProfile(userId, updates) {
        const [updatedUser] = await drizzle_js_1.db
            .update(schema_js_1.users)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
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
        console.log('🔄 Syncing Stack Auth user:', userData.id, userData.email);
        return this.upsertUser(userData);
    }
    // 🔄 PHASE 3: Update user retraining access after payment
    async updateUserRetrainingAccess(userId, retrainingData) {
        const [updatedUser] = await drizzle_js_1.db
            .update(schema_js_1.users)
            .set({
            hasRetrainingAccess: retrainingData.hasRetrainingAccess,
            retrainingSessionId: retrainingData.retrainingSessionId,
            retrainingPaidAt: retrainingData.retrainingPaidAt,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
            .returning();
        return updatedUser;
    }
    // User Profile operations
    async getUserProfile(userId) {
        const [profile] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.userProfiles)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userProfiles.userId, userId));
        return profile;
    }
    async upsertUserProfile(data) {
        // Check if profile exists
        const existingProfile = await this.getUserProfile(data.userId);
        if (existingProfile) {
            // Update existing profile
            const [profile] = await drizzle_js_1.db
                .update(schema_js_1.userProfiles)
                .set({ ...data, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_js_1.userProfiles.userId, data.userId))
                .returning();
            return profile;
        }
        else {
            // Insert new profile
            const [profile] = await drizzle_js_1.db
                .insert(schema_js_1.userProfiles)
                .values(data)
                .returning();
            return profile;
        }
    }
    // Onboarding operations
    async getOnboardingData(userId) {
        const [data] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.onboardingData)
            .where((0, drizzle_orm_1.eq)(schema_js_1.onboardingData.userId, userId));
        return data;
    }
    async saveOnboardingData(data) {
        const [saved] = await drizzle_js_1.db.insert(schema_js_1.onboardingData).values(data).returning();
        return saved;
    }
    async updateOnboardingData(userId, data) {
        const [updated] = await drizzle_js_1.db
            .update(schema_js_1.onboardingData)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.onboardingData.userId, userId))
            .returning();
        return updated;
    }
    // AI Image operations
    async getAIImages(userId) {
        // Direct lookup first
        let images = await drizzle_js_1.db
            .select()
            .from(schema_js_1.aiImages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.aiImages.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.aiImages.createdAt));
        if (images.length === 0) {
            // For Stack Auth users, check by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                images = await drizzle_js_1.db
                    .select()
                    .from(schema_js_1.aiImages)
                    .where((0, drizzle_orm_1.eq)(schema_js_1.aiImages.userId, linkedUser.id))
                    .orderBy((0, drizzle_orm_1.desc)(schema_js_1.aiImages.createdAt));
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
        const [saved] = await drizzle_js_1.db.insert(schema_js_1.aiImages).values(imageData).returning();
        return saved;
    }
    async getAIImage(userId, imageId) {
        const [image] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.aiImages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.aiImages.id, imageId), (0, drizzle_orm_1.eq)(schema_js_1.aiImages.userId, userId)));
        return image;
    }
    async deleteAIImage(userId, imageId) {
        const result = await drizzle_js_1.db
            .delete(schema_js_1.aiImages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.aiImages.id, imageId), (0, drizzle_orm_1.eq)(schema_js_1.aiImages.userId, userId)));
        // drizzle returns object; presence of a result is enough
        return Boolean(result.rowCount ?? true);
    }
    async updateAIImage(id, data) {
        const [updated] = await drizzle_js_1.db
            .update(schema_js_1.aiImages)
            .set({ ...data })
            .where((0, drizzle_orm_1.eq)(schema_js_1.aiImages.id, id))
            .returning();
        return updated;
    }
    // Generated Images operations (NEW ENHANCED GALLERY - primary table)
    async getGeneratedImages(userId) {
        // Direct lookup first
        let images = await drizzle_js_1.db
            .select()
            .from(schema_js_1.generatedImages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.generatedImages.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generatedImages.createdAt));
        if (images.length === 0) {
            // For Stack Auth users, check by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                images = await drizzle_js_1.db
                    .select()
                    .from(schema_js_1.generatedImages)
                    .where((0, drizzle_orm_1.eq)(schema_js_1.generatedImages.userId, linkedUser.id))
                    .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generatedImages.createdAt));
            }
        }
        return images;
    }
    async saveGeneratedImage(data) {
        const [saved] = await drizzle_js_1.db.insert(schema_js_1.generatedImages).values(data).returning();
        return saved;
    }
    async updateGeneratedImage(id, data) {
        const [updated] = await drizzle_js_1.db
            .update(schema_js_1.generatedImages)
            .set({ ...data })
            .where((0, drizzle_orm_1.eq)(schema_js_1.generatedImages.id, id))
            .returning();
        return updated;
    }
    // Generated Videos operations (VEO 3 video generation)
    async getGeneratedVideos(userId) {
        // Direct lookup first
        let videos = await drizzle_js_1.db
            .select()
            .from(schema_js_1.generatedVideos)
            .where((0, drizzle_orm_1.eq)(schema_js_1.generatedVideos.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generatedVideos.createdAt));
        if (videos.length === 0) {
            // For Stack Auth users, check by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                videos = await drizzle_js_1.db
                    .select()
                    .from(schema_js_1.generatedVideos)
                    .where((0, drizzle_orm_1.eq)(schema_js_1.generatedVideos.userId, linkedUser.id))
                    .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generatedVideos.createdAt));
            }
        }
        return videos;
    }
    async saveGeneratedVideo(data) {
        const [saved] = await drizzle_js_1.db.insert(schema_js_1.generatedVideos).values(data).returning();
        return saved;
    }
    async updateGeneratedVideo(id, data) {
        const [updated] = await drizzle_js_1.db
            .update(schema_js_1.generatedVideos)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.generatedVideos.id, id))
            .returning();
        return updated;
    }
    async getGeneratedVideoByJobId(jobId) {
        const [video] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.generatedVideos)
            .where((0, drizzle_orm_1.eq)(schema_js_1.generatedVideos.jobId, jobId));
        return video;
    }
    async getUserVideosByStatus(userId, status) {
        if (status) {
            return await drizzle_js_1.db
                .select()
                .from(schema_js_1.generatedVideos)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.generatedVideos.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.generatedVideos.status, status)))
                .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generatedVideos.createdAt));
        }
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.generatedVideos)
            .where((0, drizzle_orm_1.eq)(schema_js_1.generatedVideos.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generatedVideos.createdAt));
    }
    // 🔑 Generation Tracker Methods - for temp preview workflow ONLY
    async createGenerationTracker(data) {
        const [tracker] = await drizzle_js_1.db
            .insert(schema_js_1.generationTrackers)
            .values(data)
            .returning();
        return tracker;
    }
    async saveGenerationTracker(data) {
        const [tracker] = await drizzle_js_1.db
            .insert(schema_js_1.generationTrackers)
            .values(data)
            .returning();
        return tracker;
    }
    async updateGenerationTracker(id, updates) {
        const [updatedTracker] = await drizzle_js_1.db
            .update(schema_js_1.generationTrackers)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.generationTrackers.id, id))
            .returning();
        if (!updatedTracker) {
            throw new Error(`Generation tracker with id ${id} not found`);
        }
        return updatedTracker;
    }
    async getGenerationTracker(id) {
        const [tracker] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.generationTrackers)
            .where((0, drizzle_orm_1.eq)(schema_js_1.generationTrackers.id, id));
        return tracker;
    }
    async getCompletedGenerationTrackersForUser(userId, hoursBack) {
        const timeThreshold = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.generationTrackers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.generationTrackers.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.generationTrackers.status, 'completed'), (0, drizzle_orm_1.gte)(schema_js_1.generationTrackers.createdAt, timeThreshold)))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generationTrackers.createdAt));
    }
    async getUserGenerationTrackers(userId) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.generationTrackers)
            .where((0, drizzle_orm_1.eq)(schema_js_1.generationTrackers.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generationTrackers.createdAt));
    }
    async getProcessingGenerationTrackers() {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.generationTrackers)
            .where((0, drizzle_orm_1.eq)(schema_js_1.generationTrackers.status, 'processing'))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.generationTrackers.createdAt));
    }
    // User Model operations - with dual ID support for Stack Auth migration
    async getUserModel(userId) {
        // Direct lookup first
        let [model] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, userId));
        if (!model) {
            // For Stack Auth users, also check by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                [model] = await drizzle_js_1.db
                    .select()
                    .from(schema_js_1.userModels)
                    .where((0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, linkedUser.id));
            }
        }
        return model;
    }
    async getUserModelByUserId(userId) {
        // Alias for getUserModel - same functionality with dual ID support
        return this.getUserModel(userId);
    }
    async getUserModelById(modelId) {
        const [model] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userModels.id, modelId));
        return model;
    }
    // 🔥 BULLETPROOF: Get user model with aggressive Stack Auth ID and email linking
    async getUserModelByStackAuthAndEmail(stackAuthId, email) {
        console.log('🔍 Bulletproof user lookup:', {
            stackAuthId: stackAuthId.substring(0, 8) + '...',
            email
        });
        try {
            // Find existing user by Stack Auth ID (primary) OR by Email (for new Stack logins)
            let userRecord = await drizzle_js_1.db.query.users.findFirst({
                where: (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_js_1.users.stackAuthId, stackAuthId), (0, drizzle_orm_1.eq)(schema_js_1.users.email, email))
            });
            if (userRecord && !userRecord.stackAuthId) {
                // Found existing user by email, but they are unlinked. Link them now.
                console.log('🔗 Found user by email but unlinked. Linking to Stack Auth ID now.', {
                    userId: userRecord.id,
                    email: userRecord.email
                });
                userRecord = await drizzle_js_1.db.update(schema_js_1.users)
                    .set({
                    stackAuthId: stackAuthId,
                    updatedAt: new Date(),
                    lastLoginAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userRecord.id))
                    .returning().then(res => res[0]);
                console.log('✅ Successfully linked user to Stack Auth ID');
            }
            else if (userRecord && userRecord.stackAuthId) {
                // Update last login for existing linked user
                userRecord = await drizzle_js_1.db.update(schema_js_1.users)
                    .set({
                    lastLoginAt: new Date(),
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userRecord.id))
                    .returning().then(res => res[0]);
            }
            if (!userRecord) {
                console.log('❌ No user found by Stack Auth ID or email');
                return { user: undefined, model: undefined };
            }
            // Now get the user model for this user
            let userModel = await drizzle_js_1.db.query.userModels.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, userRecord.id)
            });
            console.log('✅ Bulletproof lookup result:', {
                foundUser: !!userRecord,
                foundModel: !!userModel,
                trainingStatus: userModel?.trainingStatus || 'none',
                userEmail: userRecord.email
            });
            return {
                user: userRecord,
                model: userModel
            };
        }
        catch (error) {
            console.error('❌ Bulletproof user lookup failed:', error);
            return { user: undefined, model: undefined };
        }
    }
    async createUserModel(data) {
        console.log('Creating user model with data:', data);
        const [model] = await drizzle_js_1.db.insert(schema_js_1.userModels).values([data]).returning();
        return model;
    }
    async updateUserModel(userId, data) {
        // Try direct update first
        let [updated] = await drizzle_js_1.db
            .update(schema_js_1.userModels)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, userId))
            .returning();
        if (!updated) {
            // For Stack Auth users, try updating by linked original user ID
            const linkedUser = await this.getUserByStackAuthId(userId);
            if (linkedUser) {
                [updated] = await drizzle_js_1.db
                    .update(schema_js_1.userModels)
                    .set({ ...data, updatedAt: new Date() })
                    .where((0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, linkedUser.id))
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
        console.log(`🗑️ CLEANUP: Deleting all failed training data for user ${userId}`);
        // Delete in correct order to avoid foreign key constraints
        await drizzle_js_1.db.delete(schema_js_1.generationTrackers).where((0, drizzle_orm_1.eq)(schema_js_1.generationTrackers.userId, userId));
        await drizzle_js_1.db.delete(schema_js_1.aiImages).where((0, drizzle_orm_1.eq)(schema_js_1.aiImages.userId, userId));
        await drizzle_js_1.db.delete(schema_js_1.userModels).where((0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, userId));
        console.log(`✅ CLEANUP: All training data deleted for user ${userId} - ready for fresh start`);
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
            console.log('✅ User model already exists for user:', userId);
            return existingModel;
        }
        // For new user models, use the original user ID (not Stack Auth ID)
        const user = await this.getUser(userId);
        const actualUserId = user?.id || userId;
        // Create new user model that requires actual training
        console.log('🔄 Creating new user model for user:', actualUserId);
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
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userModels.trainingStatus, status))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.userModels.createdAt));
    }
    async deleteUserModel(userId) {
        console.log(`🗑️ Deleting user model for user: ${userId}`);
        await drizzle_js_1.db.delete(schema_js_1.userModels).where((0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, userId));
    }
    async getAllInProgressTrainings() {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userModels.trainingStatus, 'training'))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.userModels.createdAt));
    }
    // ✅ LORA MIGRATION: Get all users with completed training for LoRA extraction
    async getAllCompletedTrainings() {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userModels.trainingStatus, 'completed'))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.userModels.createdAt));
    }
    async getMonthlyRetrainCount(userId, month, year) {
        // Get start and end dates for the month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        // Count models created this month (retraining creates new models)
        const models = await drizzle_js_1.db
            .select()
            .from(schema_js_1.userModels)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, userId), (0, drizzle_orm_1.gte)(schema_js_1.userModels.createdAt, startDate), (0, drizzle_orm_1.lte)(schema_js_1.userModels.createdAt, endDate)));
        return models.length;
    }
    // Add methods to work with actual database columns
    async getUserModelByDatabaseUserId(userId) {
        const result = await drizzle_js_1.db.select().from(schema_js_1.userModels).where((0, drizzle_orm_1.eq)(schema_js_1.userModels.userId, userId));
        return result[0];
    }
    // Selfie Upload operations
    async getSelfieUploads(userId) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.selfieUploads)
            .where((0, drizzle_orm_1.eq)(schema_js_1.selfieUploads.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.selfieUploads.createdAt));
    }
    async saveSelfieUpload(data) {
        const [saved] = await drizzle_js_1.db.insert(schema_js_1.selfieUploads).values([data]).returning();
        return saved;
    }
    // Subscription operations
    async getSubscription(userId) {
        const [subscription] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.userId, userId));
        return subscription;
    }
    async getUserSubscription(userId) {
        const [subscription] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.userId, userId));
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
        const [subscription] = await drizzle_js_1.db.insert(schema_js_1.subscriptions).values([data]).returning();
        return subscription;
    }
    // Usage operations
    async getUserUsage(userId) {
        const [usage] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.userUsage)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userUsage.userId, userId));
        return usage;
    }
    async createUserUsage(data) {
        const [usage] = await drizzle_js_1.db.insert(schema_js_1.userUsage).values(data).returning();
        return usage;
    }
    async updateUserUsage(userId, data) {
        const [updated] = await drizzle_js_1.db
            .update(schema_js_1.userUsage)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.userUsage.userId, userId))
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
        const [chat] = await drizzle_js_1.db
            .insert(schema_js_1.victoriaChats)
            .values([data])
            .returning();
        return chat;
    }
    async getVictoriaChats(userId) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.victoriaChats)
            .where((0, drizzle_orm_1.eq)(schema_js_1.victoriaChats.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.victoriaChats.createdAt));
    }
    async getVictoriaChatsBySession(userId, sessionId) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.victoriaChats)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.victoriaChats.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.victoriaChats.sessionId, sessionId)))
            .orderBy(schema_js_1.victoriaChats.createdAt);
    }
    // Photo selections operations
    async savePhotoSelections(data) {
        const [selection] = await drizzle_js_1.db
            .insert(schema_js_1.photoSelections)
            .values([data])
            .onConflictDoUpdate({
            target: schema_js_1.photoSelections.userId,
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
        const [selection] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.photoSelections)
            .where((0, drizzle_orm_1.eq)(schema_js_1.photoSelections.userId, userId));
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
        const [page] = await drizzle_js_1.db
            .insert(schema_js_1.landingPages)
            .values([data])
            .returning();
        return page;
    }
    async getLandingPages(userId) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.landingPages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.landingPages.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.landingPages.createdAt));
    }
    // Landing pages operations
    async createUserLandingPage(data) {
        const [page] = await drizzle_js_1.db
            .insert(schema_js_1.userLandingPages)
            .values([data])
            .returning();
        return page;
    }
    async getUserLandingPages(userId) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.userLandingPages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userLandingPages.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.userLandingPages.updatedAt));
    }
    async getUserLandingPageBySlug(slug) {
        const [page] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.userLandingPages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.userLandingPages.slug, slug));
        return page;
    }
    async updateUserLandingPage(id, data) {
        const [updated] = await drizzle_js_1.db
            .update(schema_js_1.userLandingPages)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.userLandingPages.id, id))
            .returning();
        return updated;
    }
    // Email Capture operations
    // Brand onboarding operations
    async saveBrandOnboarding(data) {
        const [saved] = await drizzle_js_1.db
            .insert(schema_js_1.brandOnboarding)
            .values(data)
            .onConflictDoUpdate({
            target: schema_js_1.brandOnboarding.userId,
            set: {
                ...data,
                updatedAt: new Date(),
            },
        })
            .returning();
        return saved;
    }
    async getBrandOnboarding(userId) {
        const [data] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.brandOnboarding)
            .where((0, drizzle_orm_1.eq)(schema_js_1.brandOnboarding.userId, userId));
        return data;
    }
    // Agent Conversations (unified with claudeConversations/claudeMessages)
    async saveAgentConversation(agentId, userId, userMessage, agentResponse, fileOperations, conversationId) {
        // Create or get conversation - USE STABLE ID per agent per user
        const convId = conversationId || `admin_${agentId}_${userId}`;
        let conversation = await drizzle_js_1.db.query.claudeConversations.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.conversationId, convId)
        });
        if (!conversation) {
            [conversation] = await drizzle_js_1.db.insert(schema_js_1.claudeConversations).values({
                userId,
                agentName: agentId,
                conversationId: convId,
                title: `Admin chat with ${agentId}`,
                lastMessageAt: new Date(),
                messageCount: 0
            }).returning();
        }
        // Save user message
        await drizzle_js_1.db.insert(schema_js_1.claudeMessages).values({
            conversationId: convId,
            role: 'user',
            content: userMessage,
            metadata: fileOperations ? { fileOperations } : null
        });
        // Save agent response  
        await drizzle_js_1.db.insert(schema_js_1.claudeMessages).values({
            conversationId: convId,
            role: 'assistant',
            content: agentResponse,
            metadata: fileOperations ? { fileOperations } : null
        });
        // Update conversation metadata
        await drizzle_js_1.db.update(schema_js_1.claudeConversations)
            .set({
            lastMessageAt: new Date(),
            messageCount: (0, drizzle_orm_1.sql) `${schema_js_1.claudeConversations.messageCount} + 2`
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.conversationId, convId));
        return conversation;
    }
    async getAgentConversations(agentId, userId) {
        // Get all conversations for this agent and user
        const conversations = await drizzle_js_1.db.select()
            .from(schema_js_1.claudeConversations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.agentName, agentId), (0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.userId, userId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from the most recent conversation
        const messages = await drizzle_js_1.db.select()
            .from(schema_js_1.claudeMessages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.claudeMessages.conversationId, conversations[0].conversationId))
            .orderBy(schema_js_1.claudeMessages.timestamp);
        return messages;
    }
    async getAgentConversationHistory(agentId, userId, conversationId) {
        if (conversationId) {
            // Get specific conversation
            const messages = await drizzle_js_1.db.select()
                .from(schema_js_1.claudeMessages)
                .where((0, drizzle_orm_1.eq)(schema_js_1.claudeMessages.conversationId, conversationId))
                .orderBy(schema_js_1.claudeMessages.timestamp);
            return messages.map(msg => ({
                role: msg.role === 'assistant' ? 'ai' : msg.role,
                content: msg.content
            }));
        }
        // Get all conversations for this agent and user
        const conversations = await drizzle_js_1.db.select()
            .from(schema_js_1.claudeConversations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.agentName, agentId), (0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.userId, userId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from most recent conversation
        const messages = await drizzle_js_1.db.select()
            .from(schema_js_1.claudeMessages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.claudeMessages.conversationId, conversations[0].conversationId))
            .orderBy(schema_js_1.claudeMessages.timestamp);
        return messages.map(msg => ({
            role: msg.role === 'assistant' ? 'ai' : msg.role,
            content: msg.content
        }));
    }
    async getAllAgentConversations(userId) {
        // Get all agent conversations for this user
        const conversations = await drizzle_js_1.db.select()
            .from(schema_js_1.claudeConversations)
            .where((0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from all conversations
        const conversationIds = conversations.map(c => c.conversationId);
        const messages = await drizzle_js_1.db.select()
            .from(schema_js_1.claudeMessages)
            .where((0, drizzle_orm_1.sql) `${schema_js_1.claudeMessages.conversationId} = ANY(${conversationIds})`)
            .orderBy(schema_js_1.claudeMessages.timestamp);
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
            console.log(`💾 Agent memory saved for ${agentId} with ${enhancedMemoryData.conversationHistory?.length || 0} conversation messages`);
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
            const conversation = await drizzle_js_1.db.query.claudeConversations.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.agentName, agentId), (0, drizzle_orm_1.eq)(schema_js_1.claudeConversations.userId, userId))
            });
            if (conversation) {
                // Delete memory messages (where content is '**CONVERSATION_MEMORY**')
                await drizzle_js_1.db.delete(schema_js_1.claudeMessages)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.claudeMessages.conversationId, conversation.conversationId), (0, drizzle_orm_1.eq)(schema_js_1.claudeMessages.content, '**CONVERSATION_MEMORY**')));
            }
            console.log(`🧹 Agent memory cleared for ${agentId}`);
        }
        catch (error) {
            console.error('Failed to clear agent memory:', error);
            throw error;
        }
    }
    // Email Capture operations
    async captureEmail(data) {
        const [capture] = await drizzle_js_1.db
            .insert(schema_js_1.emailCaptures)
            .values(data)
            .returning();
        return capture;
    }
    // Maya chat operations
    async getMayaChats(userId) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.mayaChats)
            .where((0, drizzle_orm_1.eq)(schema_js_1.mayaChats.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.mayaChats.lastActivity || schema_js_1.mayaChats.createdAt));
    }
    // Get all Maya chats (for analytics)
    async getAllMayaChats() {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.mayaChats)
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.mayaChats.lastActivity || schema_js_1.mayaChats.createdAt));
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
        const [chat] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.mayaChats)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.mayaChats.id, parseInt(chatId)), (0, drizzle_orm_1.eq)(schema_js_1.mayaChats.userId, userId)));
        return chat;
    }
    // Create new Maya chat
    async createMayaChat(userId, data) {
        const [chat] = await drizzle_js_1.db
            .insert(schema_js_1.mayaChats)
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
        const [chat] = await drizzle_js_1.db
            .insert(schema_js_1.mayaChats)
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
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.mayaChatMessages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.mayaChatMessages.chatId, parseInt(chatId)))
            .orderBy((0, drizzle_orm_1.asc)(schema_js_1.mayaChatMessages.createdAt));
    }
    // Save Maya message
    async saveMayaMessage(chatId, userId, data) {
        const [message] = await drizzle_js_1.db
            .insert(schema_js_1.mayaChatMessages)
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
        await drizzle_js_1.db
            .update(schema_js_1.mayaChatMessages)
            .set({ content: updates.content })
            .where((0, drizzle_orm_1.eq)(schema_js_1.mayaChatMessages.id, parseInt(messageId)));
    }
    // Legacy method - use createMayaChat(userId, data) instead
    async createMayaChatLegacy(data) {
        const [chat] = await drizzle_js_1.db
            .insert(schema_js_1.mayaChats)
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
        const [updatedUser] = await drizzle_js_1.db
            .update(schema_js_1.users)
            .set({
            ...planSettings,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
            .returning();
        return updatedUser;
    }
    // Legacy method - use getMayaChatMessages(chatId, userId) instead
    async getMayaChatMessagesLegacy(chatId) {
        const messages = await drizzle_js_1.db
            .select()
            .from(schema_js_1.mayaChatMessages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.mayaChatMessages.chatId, chatId))
            .orderBy(schema_js_1.mayaChatMessages.createdAt);
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
                    console.log(`💾 DATABASE RETRIEVAL: Retrieved ${conceptsWithPrompts.length} concept cards with preserved fullPrompt fields`);
                    conceptsWithPrompts.forEach((card, index) => {
                        const title = card.title || '';
                        const fullPromptLen = card.fullPrompt?.length || 0;
                        console.log(`  📋 Retrieved concept ${index + 1}: "${title}" - fullPrompt: ${fullPromptLen} chars`);
                    });
                }
            }
            return processedMsg;
        });
    }
    // REMOVED: getAllMayaChatMessages method to prevent session mixing
    // Use getMayaChatMessages(chatId) for session-specific loading
    async createMayaChatMessage(data) {
        console.log(`📝 MAYA MESSAGE: Saving ${data.role} message with concept cards: ${data.conceptCards ? 'YES' : 'NO'}`);
        // CRITICAL: Ensure fullPrompt field is preserved in concept cards
        if (data.conceptCards && Array.isArray(data.conceptCards)) {
            const conceptsWithPrompts = data.conceptCards.filter((card) => 'fullPrompt' in card && card.fullPrompt);
            if (conceptsWithPrompts.length > 0) {
                console.log(`💾 DATABASE STORAGE: Preserving ${conceptsWithPrompts.length} concept cards with embedded fullPrompt fields`);
                conceptsWithPrompts.forEach((card, index) => {
                    const title = card.title || '';
                    const fullPromptLen = card.fullPrompt?.length || 0;
                    console.log(`  📋 Concept ${index + 1}: "${title}" - fullPrompt: ${fullPromptLen} chars`);
                });
            }
        }
        const [message] = await drizzle_js_1.db
            .insert(schema_js_1.mayaChatMessages)
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
        console.log(`🔍 CONCEPT RETRIEVAL: Searching for concept ID "${conceptId}"`);
        // Search through Maya chat messages for concept cards with matching ID
        const messages = await drizzle_js_1.db
            .select()
            .from(schema_js_1.mayaChatMessages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.mayaChatMessages.role, 'maya'))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.mayaChatMessages.createdAt));
        // Look through each message's conceptCards for the matching conceptId
        for (const message of messages) {
            if (message.conceptCards && Array.isArray(message.conceptCards)) {
                const conceptCard = message.conceptCards.find((card) => card.id === conceptId);
                if (conceptCard) {
                    const title = conceptCard.title || '';
                    const fullPrompt = conceptCard.fullPrompt;
                    console.log(`✅ CONCEPT FOUND: "${title}" with fullPrompt: ${!!fullPrompt} (${fullPrompt?.length || 0} chars)`);
                    return conceptCard;
                }
            }
        }
        console.log(`⚠️ CONCEPT NOT FOUND: No concept found with ID "${conceptId}"`);
        return undefined;
    }
    async updateMayaChatMessage(messageId, data) {
        await drizzle_js_1.db
            .update(schema_js_1.mayaChatMessages)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_js_1.mayaChatMessages.id, messageId));
    }
    // Get generation tracker by prediction ID for website generator
    async getGenerationTrackerByPredictionId(predictionId) {
        const [tracker] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.generationTrackers)
            .where((0, drizzle_orm_1.eq)(schema_js_1.generationTrackers.predictionId, predictionId));
        return tracker;
    }
    // Admin operations
    async setUserAsAdmin(email) {
        try {
            const [user] = await drizzle_js_1.db
                .update(schema_js_1.users)
                .set({
                role: 'admin',
                monthlyGenerationLimit: -1, // Unlimited
                plan: 'sselfie-studio',
                mayaAiAccess: true,
                victoriaAiAccess: true,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email))
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
            const [user] = await drizzle_js_1.db
                .select({ role: schema_js_1.users.role })
                .from(schema_js_1.users)
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId));
            return user?.role === 'admin';
        }
        catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
    async hasUnlimitedGenerations(userId) {
        try {
            const [user] = await drizzle_js_1.db
                .select({
                role: schema_js_1.users.role,
                monthlyGenerationLimit: schema_js_1.users.monthlyGenerationLimit
            })
                .from(schema_js_1.users)
                .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId));
            return user?.role === 'admin' || user?.monthlyGenerationLimit === -1;
        }
        catch (error) {
            console.error('Error checking unlimited generations:', error);
            return false;
        }
    }
    async updateSubscription(id, updates) {
        const [subscription] = await drizzle_js_1.db
            .update(schema_js_1.subscriptions)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.subscriptions.id, id))
            .returning();
        return subscription;
    }
    // LoRA Training and Weights Management
    async createTrainingRun(trainingRun) {
        const [run] = await drizzle_js_1.db.insert(schema_js_1.trainingRuns).values(trainingRun).returning();
        return run;
    }
    async getTrainingRun(id) {
        const [run] = await drizzle_js_1.db.select().from(schema_js_1.trainingRuns).where((0, drizzle_orm_1.eq)(schema_js_1.trainingRuns.id, id));
        return run;
    }
    async getTrainingRunByTrainingId(trainingId) {
        const [run] = await drizzle_js_1.db.select().from(schema_js_1.trainingRuns).where((0, drizzle_orm_1.eq)(schema_js_1.trainingRuns.trainingId, trainingId));
        return run;
    }
    async updateTrainingRun(id, updates) {
        const [run] = await drizzle_js_1.db.update(schema_js_1.trainingRuns).set(updates).where((0, drizzle_orm_1.eq)(schema_js_1.trainingRuns.id, id)).returning();
        return run;
    }
    async listUserTrainingRuns(userId) {
        return drizzle_js_1.db.select().from(schema_js_1.trainingRuns).where((0, drizzle_orm_1.eq)(schema_js_1.trainingRuns.userId, userId)).orderBy((0, drizzle_orm_1.desc)(schema_js_1.trainingRuns.createdAt));
    }
    async createLoraWeight(weight) {
        const [loraWeight] = await drizzle_js_1.db.insert(schema_js_1.loraWeights).values(weight).returning();
        return loraWeight;
    }
    async getLoraWeight(id) {
        const [weight] = await drizzle_js_1.db.select().from(schema_js_1.loraWeights).where((0, drizzle_orm_1.eq)(schema_js_1.loraWeights.id, id));
        return weight;
    }
    async getUserActiveLoraWeight(userId) {
        // Get the most recent available LoRA weight for the user
        const [weight] = await drizzle_js_1.db.select().from(schema_js_1.loraWeights)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.loraWeights.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.loraWeights.status, 'available')))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.loraWeights.createdAt))
            .limit(1);
        return weight;
    }
    async listUserLoraWeights(userId) {
        return drizzle_js_1.db.select().from(schema_js_1.loraWeights).where((0, drizzle_orm_1.eq)(schema_js_1.loraWeights.userId, userId)).orderBy((0, drizzle_orm_1.desc)(schema_js_1.loraWeights.createdAt));
    }
    async updateLoraWeight(id, updates) {
        const [weight] = await drizzle_js_1.db.update(schema_js_1.loraWeights).set(updates).where((0, drizzle_orm_1.eq)(schema_js_1.loraWeights.id, id)).returning();
        return weight;
    }
    async setActiveLoraWeight(userId, weightId) {
        // Mark all user's weights as archived, then set the selected one as available
        await drizzle_js_1.db.update(schema_js_1.loraWeights).set({ status: 'archived' }).where((0, drizzle_orm_1.eq)(schema_js_1.loraWeights.userId, userId));
        await drizzle_js_1.db.update(schema_js_1.loraWeights).set({ status: 'available' }).where((0, drizzle_orm_1.eq)(schema_js_1.loraWeights.id, weightId));
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
        console.log(`✅ LoRA WEIGHTS STORED: User ${data.userId}, scales=${JSON.stringify(mayaScales)}`);
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
        const result = await drizzle_js_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_js_1.users);
        return Number(result[0]?.count || 0);
    }
    async getAIImageCount() {
        const result = await drizzle_js_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_js_1.aiImages);
        return Number(result[0]?.count || 0);
    }
    async getAgentConversationCount() {
        const result = await drizzle_js_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_js_1.claudeMessages);
        return Number(result[0]?.count || 0);
    }
    // HYBRID BACKEND ARCHITECTURE: Implementation of conversation and concept card operations
    // Conversation operations
    async createConversation(data) {
        const [conversation] = await drizzle_js_1.db
            .insert(schema_js_1.conversations)
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
        const [conversation] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.conversations)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversations.id, id));
        return conversation;
    }
    async getUserConversations(userId, agentName) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_js_1.conversations.userId, userId)];
        if (agentName) {
            conditions.push((0, drizzle_orm_1.eq)(schema_js_1.conversations.agentName, agentName));
        }
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.conversations)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.conversations.updatedAt));
    }
    async updateConversation(id, updates) {
        const [conversation] = await drizzle_js_1.db
            .update(schema_js_1.conversations)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversations.id, id))
            .returning();
        return conversation;
    }
    async archiveConversation(id) {
        return this.updateConversation(id, { status: 'archived' });
    }
    // Message operations
    async createMessage(data) {
        const [message] = await drizzle_js_1.db
            .insert(schema_js_1.messages)
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
        const baseQuery = drizzle_js_1.db
            .select()
            .from(schema_js_1.messages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.messages.conversationId, conversationId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.messages.createdAt));
        if (limit) {
            return await baseQuery.limit(limit);
        }
        return await baseQuery;
    }
    async getLastMessages(conversationId, count) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.messages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.messages.conversationId, conversationId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.messages.createdAt))
            .limit(count);
    }
    async getMessagesAfter(conversationId, messageId) {
        const targetMessage = await drizzle_js_1.db
            .select()
            .from(schema_js_1.messages)
            .where((0, drizzle_orm_1.eq)(schema_js_1.messages.id, messageId));
        if (!targetMessage.length)
            return [];
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.messages)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.messages.conversationId, conversationId), (0, drizzle_orm_1.gte)(schema_js_1.messages.createdAt, targetMessage[0].createdAt)))
            .orderBy(schema_js_1.messages.createdAt);
    }
    // Conversation summary operations
    async upsertConversationSummary(data) {
        const existing = await this.getConversationSummary(data.conversationId);
        if (existing) {
            const [summary] = await drizzle_js_1.db
                .update(schema_js_1.conversationSummaries)
                .set({
                ...data,
                summary: data.summary || '',
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_js_1.conversationSummaries.conversationId, data.conversationId))
                .returning();
            return summary;
        }
        else {
            const [summary] = await drizzle_js_1.db
                .insert(schema_js_1.conversationSummaries)
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
        const [summary] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.conversationSummaries)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversationSummaries.conversationId, conversationId));
        return summary;
    }
    async updateConversationSummary(conversationId, summary, lastMessageId, messageCount) {
        const [updated] = await drizzle_js_1.db
            .update(schema_js_1.conversationSummaries)
            .set({
            summary,
            lastMessageId,
            messageCount,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_js_1.conversationSummaries.conversationId, conversationId))
            .returning();
        return updated;
    }
    // Concept card operations (with idempotency)
    async createConceptCard(data) {
        // Check for idempotency using clientId
        if (data.clientId && data.userId) {
            const existing = await this.getConceptCardByClientId(data.userId, data.clientId);
            if (existing) {
                return existing;
            }
        }
        const [conceptCard] = await drizzle_js_1.db
            .insert(schema_js_1.conceptCards)
            .values({
            ...data,
            userId: data.userId || '',
            title: data.title || 'Untitled Concept'
        })
            .returning();
        return conceptCard;
    }
    async getConceptCard(id) {
        const [conceptCard] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.conceptCards)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conceptCards.id, id));
        return conceptCard;
    }
    async getConceptCardByClientId(userId, clientId) {
        const [conceptCard] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.conceptCards)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.conceptCards.userId, userId), (0, drizzle_orm_1.eq)(schema_js_1.conceptCards.clientId, clientId)));
        return conceptCard;
    }
    async getUserConceptCards(userId, conversationId) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_js_1.conceptCards.userId, userId)];
        if (conversationId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_js_1.conceptCards.conversationId, conversationId));
        }
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.conceptCards)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy(schema_js_1.conceptCards.sortOrder, (0, drizzle_orm_1.desc)(schema_js_1.conceptCards.createdAt));
    }
    async updateConceptCard(id, updates) {
        const [conceptCard] = await drizzle_js_1.db
            .update(schema_js_1.conceptCards)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.conceptCards.id, id))
            .returning();
        return conceptCard;
    }
    async updateConceptCardGeneration(id, generatedImages, isLoading, isGenerating, hasGenerated) {
        return this.updateConceptCard(id, {
            generatedImages,
            isLoading,
            isGenerating,
            hasGenerated
        });
    }
    async deleteConceptCard(id) {
        await drizzle_js_1.db
            .delete(schema_js_1.conceptCards)
            .where((0, drizzle_orm_1.eq)(schema_js_1.conceptCards.id, id));
    }
    // Brand Assets operations (P3-C feature)
    async getBrandAssets(userId) {
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.brandAssets)
            .where((0, drizzle_orm_1.eq)(schema_js_1.brandAssets.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.brandAssets.createdAt));
    }
    async saveBrandAsset(data) {
        // Ensure required fields are present
        if (!data.url || !data.userId || !data.filename) {
            throw new Error('Missing required fields: url, userId, filename');
        }
        const [asset] = await drizzle_js_1.db
            .insert(schema_js_1.brandAssets)
            .values(data)
            .returning();
        return asset;
    }
    async deleteBrandAsset(assetId, userId) {
        const result = await drizzle_js_1.db
            .delete(schema_js_1.brandAssets)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.brandAssets.id, assetId), (0, drizzle_orm_1.eq)(schema_js_1.brandAssets.userId, userId)));
        return result.rowCount > 0;
    }
    async getBrandAsset(assetId, userId) {
        const [asset] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.brandAssets)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.brandAssets.id, assetId), (0, drizzle_orm_1.eq)(schema_js_1.brandAssets.userId, userId)));
        return asset;
    }
    // Image Variants operations (for non-destructive placement)
    async saveImageVariant(data) {
        // Ensure required fields are present
        if (!data.userId || !data.originalImageId || !data.variantUrl) {
            throw new Error('Missing required fields: userId, originalImageId, variantUrl');
        }
        const [variant] = await drizzle_js_1.db
            .insert(schema_js_1.imageVariants)
            .values(data)
            .returning();
        return variant;
    }
    async getImageVariants(userId, originalImageId) {
        const conditions = [(0, drizzle_orm_1.eq)(schema_js_1.imageVariants.userId, userId)];
        if (originalImageId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_js_1.imageVariants.originalImageId, originalImageId));
        }
        return await drizzle_js_1.db
            .select()
            .from(schema_js_1.imageVariants)
            .where((0, drizzle_orm_1.and)(...conditions))
            .orderBy((0, drizzle_orm_1.desc)(schema_js_1.imageVariants.createdAt));
    }
    async getImageVariant(variantId, userId) {
        const [variant] = await drizzle_js_1.db
            .select()
            .from(schema_js_1.imageVariants)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.imageVariants.id, variantId), (0, drizzle_orm_1.eq)(schema_js_1.imageVariants.userId, userId)));
        return variant;
    }
    async updateImageVariant(variantId, updates) {
        const [variant] = await drizzle_js_1.db
            .update(schema_js_1.imageVariants)
            .set(updates)
            .where((0, drizzle_orm_1.eq)(schema_js_1.imageVariants.id, variantId))
            .returning();
        return variant;
    }
    // Test database connection
    async testConnection() {
        try {
            await drizzle_js_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
            return true;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
    // Create usage history record
    async createUsageHistory(data) {
        // This would typically insert into a usage_history table
        // For now, we'll just log it
        console.log('Usage history:', data);
    }
    // Get user usage history
    async getUserUsageHistory() {
        // This would typically query a usage_history table
        // For now, return empty array
        return [];
    }
    // User style memory methods
    async getUserStyleMemory(userId) {
        const [memory] = await drizzle_js_1.db.select().from(schema_js_1.userStyleMemory).where((0, drizzle_orm_1.eq)(schema_js_1.userStyleMemory.userId, userId));
        return memory;
    }
    async createUserStyleMemory(data) {
        // Ensure required fields exist
        const payload = data;
        const [memory] = await drizzle_js_1.db.insert(schema_js_1.userStyleMemory).values(payload).returning();
        return memory;
    }
    async updateUserStyleMemory(userId, data) {
        const [memory] = await drizzle_js_1.db
            .update(schema_js_1.userStyleMemory)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_js_1.userStyleMemory.userId, userId))
            .returning();
        return memory;
    }
    // Maya Profile operations
    async getMayaProfile(userId) {
        const [profile] = await drizzle_js_1.db
            .select()
            .from(schema_maya_js_1.mayaProfile)
            .where((0, drizzle_orm_1.eq)(schema_maya_js_1.mayaProfile.userId, userId));
        return profile;
    }
    async insertMayaProfile(data) {
        const [profile] = await drizzle_js_1.db
            .insert(schema_maya_js_1.mayaProfile)
            .values(data)
            .returning();
        return profile;
    }
    async updateMayaProfile(userId, updates) {
        const [profile] = await drizzle_js_1.db
            .update(schema_maya_js_1.mayaProfile)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_maya_js_1.mayaProfile.userId, userId))
            .returning();
        return profile;
    }
    // Maya Images operations
    async insertMayaImage(data) {
        const [image] = await drizzle_js_1.db
            .insert(schema_maya_js_1.mayaImages)
            .values(data)
            .returning();
        return image;
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
