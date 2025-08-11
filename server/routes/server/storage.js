"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("@shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
class DatabaseStorage {
    // User operations (required for Replit Auth)
    async getUser(id) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return user;
    }
    async getUserByEmail(email) {
        const [user] = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        return user;
    }
    async getAllUsers() {
        const allUsers = await db_1.db.select().from(schema_1.users).orderBy((0, drizzle_orm_1.desc)(schema_1.users.createdAt));
        return allUsers;
    }
    async upsertUser(userData) {
        console.log('🔄 Upserting user:', userData.id, userData.email);
        // Special admin setup for ssa@ssasocial.com
        if (userData.email === 'ssa@ssasocial.com') {
            userData.role = 'admin';
            userData.monthlyGenerationLimit = -1; // Unlimited
            userData.plan = 'sselfie-studio';
            userData.mayaAiAccess = true;
            userData.victoriaAiAccess = true;
            console.log('👑 Setting admin privileges for ssa@ssasocial.com');
        }
        // First try to find existing user by ID
        let existingUser = await this.getUser(userData.id);
        if (existingUser) {
            console.log('✅ Found existing user by ID, updating...');
            const [user] = await db_1.db
                .update(schema_1.users)
                .set({
                firstName: userData.firstName,
                lastName: userData.lastName,
                profileImageUrl: userData.profileImageUrl,
                role: userData.role,
                monthlyGenerationLimit: userData.monthlyGenerationLimit,
                plan: userData.plan,
                mayaAiAccess: userData.mayaAiAccess,
                victoriaAiAccess: userData.victoriaAiAccess,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userData.id))
                .returning();
            return user;
        }
        // If not found by ID, check by email and update that record with new ID
        if (userData.email) {
            const [userByEmail] = await db_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, userData.email));
            if (userByEmail) {
                console.log('✅ Found existing user by email, updating with new Replit ID...');
                // Update the existing user record with the new Replit ID
                const [updatedUser] = await db_1.db
                    .update(schema_1.users)
                    .set({
                    id: userData.id, // Update to new Replit user ID
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    profileImageUrl: userData.profileImageUrl,
                    role: userData.role,
                    monthlyGenerationLimit: userData.monthlyGenerationLimit,
                    plan: userData.plan,
                    mayaAiAccess: userData.mayaAiAccess,
                    victoriaAiAccess: userData.victoriaAiAccess,
                    updatedAt: new Date(),
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.email, userData.email))
                    .returning();
                return updatedUser;
            }
        }
        // User doesn't exist by ID or email, create new one
        console.log('🆕 Creating new user...');
        try {
            const [user] = await db_1.db
                .insert(schema_1.users)
                .values(userData)
                .returning();
            return user;
        }
        catch (error) {
            // If duplicate key error on email, try to return existing user
            if (error?.code === '23505' && error?.constraint === 'users_email_unique') {
                console.log('🔄 Duplicate email constraint, fetching existing user...');
                const [existingUser] = await db_1.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.email, userData.email || ''));
                if (existingUser) {
                    return existingUser;
                }
            }
            throw error;
        }
    }
    async updateUserProfile(userId, updates) {
        const [updatedUser] = await db_1.db
            .update(schema_1.users)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .returning();
        return updatedUser;
    }
    // User Profile operations
    async getUserProfile(userId) {
        const [profile] = await db_1.db
            .select()
            .from(schema_1.userProfiles)
            .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.userId, userId));
        return profile;
    }
    async upsertUserProfile(data) {
        // Check if profile exists
        const existingProfile = await this.getUserProfile(data.userId);
        if (existingProfile) {
            // Update existing profile
            const [profile] = await db_1.db
                .update(schema_1.userProfiles)
                .set({ ...data, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.userProfiles.userId, data.userId))
                .returning();
            return profile;
        }
        else {
            // Insert new profile
            const [profile] = await db_1.db
                .insert(schema_1.userProfiles)
                .values(data)
                .returning();
            return profile;
        }
    }
    // Onboarding operations
    async getOnboardingData(userId) {
        const [data] = await db_1.db
            .select()
            .from(schema_1.onboardingData)
            .where((0, drizzle_orm_1.eq)(schema_1.onboardingData.userId, userId));
        return data;
    }
    async saveOnboardingData(data) {
        const [saved] = await db_1.db.insert(schema_1.onboardingData).values(data).returning();
        return saved;
    }
    async updateOnboardingData(userId, data) {
        const [updated] = await db_1.db
            .update(schema_1.onboardingData)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.onboardingData.userId, userId))
            .returning();
        return updated;
    }
    // AI Image operations
    async getAIImages(userId) {
        return await db_1.db
            .select()
            .from(schema_1.aiImages)
            .where((0, drizzle_orm_1.eq)(schema_1.aiImages.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.aiImages.createdAt));
    }
    async saveAIImage(data) {
        // Remove project_id from data since we're not using projects table
        const { projectId, ...imageData } = data;
        const [saved] = await db_1.db.insert(schema_1.aiImages).values(imageData).returning();
        return saved;
    }
    async updateAIImage(id, data) {
        const [updated] = await db_1.db
            .update(schema_1.aiImages)
            .set({ ...data })
            .where((0, drizzle_orm_1.eq)(schema_1.aiImages.id, id))
            .returning();
        return updated;
    }
    // 🔑 Generation Tracker Methods - for temp preview workflow ONLY
    async createGenerationTracker(data) {
        const [tracker] = await db_1.db
            .insert(schema_1.generationTrackers)
            .values(data)
            .returning();
        return tracker;
    }
    async saveGenerationTracker(data) {
        const [tracker] = await db_1.db
            .insert(schema_1.generationTrackers)
            .values(data)
            .returning();
        return tracker;
    }
    async updateGenerationTracker(id, updates) {
        const [updatedTracker] = await db_1.db
            .update(schema_1.generationTrackers)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.generationTrackers.id, id))
            .returning();
        if (!updatedTracker) {
            throw new Error(`Generation tracker with id ${id} not found`);
        }
        return updatedTracker;
    }
    async getGenerationTracker(id) {
        const [tracker] = await db_1.db
            .select()
            .from(schema_1.generationTrackers)
            .where((0, drizzle_orm_1.eq)(schema_1.generationTrackers.id, id));
        return tracker;
    }
    async getCompletedGenerationTrackersForUser(userId, hoursBack) {
        const timeThreshold = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
        return await db_1.db
            .select()
            .from(schema_1.generationTrackers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.generationTrackers.userId, userId), (0, drizzle_orm_1.eq)(schema_1.generationTrackers.status, 'completed'), (0, drizzle_orm_1.gte)(schema_1.generationTrackers.createdAt, timeThreshold)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.generationTrackers.createdAt));
    }
    async getUserGenerationTrackers(userId) {
        return await db_1.db
            .select()
            .from(schema_1.generationTrackers)
            .where((0, drizzle_orm_1.eq)(schema_1.generationTrackers.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.generationTrackers.createdAt));
    }
    async getProcessingGenerationTrackers() {
        return await db_1.db
            .select()
            .from(schema_1.generationTrackers)
            .where((0, drizzle_orm_1.eq)(schema_1.generationTrackers.status, 'processing'))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.generationTrackers.createdAt));
    }
    // User Model operations
    async getUserModel(userId) {
        const [model] = await db_1.db
            .select()
            .from(schema_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_1.userModels.userId, userId));
        return model;
    }
    async getUserModelByUserId(userId) {
        // Alias for getUserModel - same functionality
        return this.getUserModel(userId);
    }
    async getUserModelById(modelId) {
        const [model] = await db_1.db
            .select()
            .from(schema_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_1.userModels.id, modelId));
        return model;
    }
    async createUserModel(data) {
        console.log('Creating user model with data:', data);
        const [model] = await db_1.db.insert(schema_1.userModels).values(data).returning();
        return model;
    }
    async updateUserModel(userId, data) {
        const [updated] = await db_1.db
            .update(schema_1.userModels)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.userModels.userId, userId))
            .returning();
        return updated;
    }
    // 🚨 CRITICAL: Clean up failed training data completely
    async deleteFailedTrainingData(userId) {
        console.log(`🗑️ CLEANUP: Deleting all failed training data for user ${userId}`);
        // Delete in correct order to avoid foreign key constraints
        await db_1.db.delete(schema_1.generationTrackers).where((0, drizzle_orm_1.eq)(schema_1.generationTrackers.userId, userId));
        await db_1.db.delete(schema_1.aiImages).where((0, drizzle_orm_1.eq)(schema_1.aiImages.userId, userId));
        await db_1.db.delete(schema_1.userModels).where((0, drizzle_orm_1.eq)(schema_1.userModels.userId, userId));
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
        // Check if user model already exists
        const existingModel = await this.getUserModel(userId);
        if (existingModel) {
            console.log('✅ User model already exists for user:', userId);
            return existingModel;
        }
        // Create new user model that requires actual training
        console.log('🔄 Creating new user model for user:', userId);
        const triggerWord = `user${userId}`;
        const modelData = {
            userId,
            triggerWord,
            trainingStatus: 'not_started', // User must complete training
            modelName: `${userId}-selfie-lora`, // Consistent with training service
        };
        return await this.createUserModel(modelData);
    }
    async getUserModelsByStatus(status) {
        return await db_1.db
            .select()
            .from(schema_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_1.userModels.trainingStatus, status))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.userModels.createdAt));
    }
    async deleteUserModel(userId) {
        console.log(`🗑️ Deleting user model for user: ${userId}`);
        await db_1.db.delete(schema_1.userModels).where((0, drizzle_orm_1.eq)(schema_1.userModels.userId, userId));
    }
    async getAllInProgressTrainings() {
        return await db_1.db
            .select()
            .from(schema_1.userModels)
            .where((0, drizzle_orm_1.eq)(schema_1.userModels.trainingStatus, 'training'))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.userModels.createdAt));
    }
    async getMonthlyRetrainCount(userId, month, year) {
        // Get start and end dates for the month
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        // Count models created this month (retraining creates new models)
        const models = await db_1.db
            .select()
            .from(schema_1.userModels)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userModels.userId, userId), (0, drizzle_orm_1.gte)(schema_1.userModels.createdAt, startDate), (0, drizzle_orm_1.lte)(schema_1.userModels.createdAt, endDate)));
        return models.length;
    }
    // Add methods to work with actual database columns
    async getUserModelByDatabaseUserId(userId) {
        const result = await db_1.db.select().from(schema_1.userModels).where((0, drizzle_orm_1.eq)(schema_1.userModels.userId, userId));
        return result[0];
    }
    // Selfie Upload operations
    async getSelfieUploads(userId) {
        return await db_1.db
            .select()
            .from(schema_1.selfieUploads)
            .where((0, drizzle_orm_1.eq)(schema_1.selfieUploads.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.selfieUploads.createdAt));
    }
    async saveSelfieUpload(data) {
        const [saved] = await db_1.db.insert(schema_1.selfieUploads).values(data).returning();
        return saved;
    }
    // Subscription operations
    async getSubscription(userId) {
        const [subscription] = await db_1.db
            .select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId));
        return subscription;
    }
    async getUserSubscription(userId) {
        const [subscription] = await db_1.db
            .select()
            .from(schema_1.subscriptions)
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.userId, userId));
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
        const [subscription] = await db_1.db.insert(schema_1.subscriptions).values(data).returning();
        return subscription;
    }
    // Usage operations
    async getUserUsage(userId) {
        const [usage] = await db_1.db
            .select()
            .from(schema_1.userUsage)
            .where((0, drizzle_orm_1.eq)(schema_1.userUsage.userId, userId));
        return usage;
    }
    async createUserUsage(data) {
        const [usage] = await db_1.db.insert(schema_1.userUsage).values(data).returning();
        return usage;
    }
    async updateUserUsage(userId, data) {
        const [updated] = await db_1.db
            .update(schema_1.userUsage)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.userUsage.userId, userId))
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
        const [chat] = await db_1.db
            .insert(schema_1.victoriaChats)
            .values(data)
            .returning();
        return chat;
    }
    async getVictoriaChats(userId) {
        return await db_1.db
            .select()
            .from(schema_1.victoriaChats)
            .where((0, drizzle_orm_1.eq)(schema_1.victoriaChats.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.victoriaChats.createdAt));
    }
    async getVictoriaChatsBySession(userId, sessionId) {
        return await db_1.db
            .select()
            .from(schema_1.victoriaChats)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.victoriaChats.userId, userId), (0, drizzle_orm_1.eq)(schema_1.victoriaChats.sessionId, sessionId)))
            .orderBy(schema_1.victoriaChats.createdAt);
    }
    // Photo selections operations
    async savePhotoSelections(data) {
        const [selection] = await db_1.db
            .insert(schema_1.photoSelections)
            .values(data)
            .onConflictDoUpdate({
            target: schema_1.photoSelections.userId,
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
        const [selection] = await db_1.db
            .select()
            .from(schema_1.photoSelections)
            .where((0, drizzle_orm_1.eq)(schema_1.photoSelections.userId, userId));
        return selection;
    }
    async getInspirationPhotos(userId) {
        // Get user's selected photos from photo selections
        const photoSelections = await this.getPhotoSelections(userId);
        if (!photoSelections || !Array.isArray(photoSelections.selectedSelfieIds) || !photoSelections.selectedSelfieIds.length) {
            return [];
        }
        // Get the actual images from AI images table
        const userImages = await this.getAIImages(userId);
        const selectedImages = userImages.filter(img => photoSelections.selectedSelfieIds.includes(img.id));
        return selectedImages.map(img => ({
            id: img.id,
            url: img.imageUrl,
            description: img.prompt || 'Selected inspiration photo'
        }));
    }
    // Landing page operations
    async createLandingPage(data) {
        const [page] = await db_1.db
            .insert(schema_1.landingPages)
            .values(data)
            .returning();
        return page;
    }
    async getLandingPages(userId) {
        return await db_1.db
            .select()
            .from(schema_1.landingPages)
            .where((0, drizzle_orm_1.eq)(schema_1.landingPages.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.landingPages.createdAt));
    }
    // Landing pages operations
    async createUserLandingPage(data) {
        const [page] = await db_1.db
            .insert(schema_1.userLandingPages)
            .values(data)
            .returning();
        return page;
    }
    async getUserLandingPages(userId) {
        return await db_1.db
            .select()
            .from(schema_1.userLandingPages)
            .where((0, drizzle_orm_1.eq)(schema_1.userLandingPages.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.userLandingPages.updatedAt));
    }
    async getUserLandingPageBySlug(slug) {
        const [page] = await db_1.db
            .select()
            .from(schema_1.userLandingPages)
            .where((0, drizzle_orm_1.eq)(schema_1.userLandingPages.slug, slug));
        return page;
    }
    async updateUserLandingPage(id, data) {
        const [updated] = await db_1.db
            .update(schema_1.userLandingPages)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.userLandingPages.id, id))
            .returning();
        return updated;
    }
    // Email Capture operations
    // Brand onboarding operations
    async saveBrandOnboarding(data) {
        const [saved] = await db_1.db
            .insert(schema_1.brandOnboarding)
            .values(data)
            .onConflictDoUpdate({
            target: schema_1.brandOnboarding.userId,
            set: {
                ...data,
                updatedAt: new Date(),
            },
        })
            .returning();
        return saved;
    }
    async getBrandOnboarding(userId) {
        const [data] = await db_1.db
            .select()
            .from(schema_1.brandOnboarding)
            .where((0, drizzle_orm_1.eq)(schema_1.brandOnboarding.userId, userId));
        return data;
    }
    // Agent Conversations (unified with claudeConversations/claudeMessages)
    async saveAgentConversation(agentId, userId, userMessage, agentResponse, fileOperations, conversationId) {
        // Create or get conversation - USE STABLE ID per agent per user
        const convId = conversationId || `admin_${agentId}_${userId}`;
        let conversation = await db_1.db.query.claudeConversations.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.claudeConversations.conversationId, convId)
        });
        if (!conversation) {
            [conversation] = await db_1.db.insert(schema_1.claudeConversations).values({
                userId,
                agentName: agentId,
                conversationId: convId,
                title: `Admin chat with ${agentId}`,
                lastMessageAt: new Date(),
                messageCount: 0
            }).returning();
        }
        // Save user message
        await db_1.db.insert(schema_1.claudeMessages).values({
            conversationId: convId,
            role: 'user',
            content: userMessage,
            metadata: fileOperations ? { fileOperations } : null
        });
        // Save agent response  
        await db_1.db.insert(schema_1.claudeMessages).values({
            conversationId: convId,
            role: 'assistant',
            content: agentResponse,
            metadata: fileOperations ? { fileOperations } : null
        });
        // Update conversation metadata
        await db_1.db.update(schema_1.claudeConversations)
            .set({
            lastMessageAt: new Date(),
            messageCount: (0, drizzle_orm_1.sql) `${schema_1.claudeConversations.messageCount} + 2`
        })
            .where((0, drizzle_orm_1.eq)(schema_1.claudeConversations.conversationId, convId));
        return conversation;
    }
    async getAgentConversations(agentId, userId) {
        // Get all conversations for this agent and user
        const conversations = await db_1.db.select()
            .from(schema_1.claudeConversations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.claudeConversations.agentName, agentId), (0, drizzle_orm_1.eq)(schema_1.claudeConversations.userId, userId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from the most recent conversation
        const messages = await db_1.db.select()
            .from(schema_1.claudeMessages)
            .where((0, drizzle_orm_1.eq)(schema_1.claudeMessages.conversationId, conversations[0].conversationId))
            .orderBy(schema_1.claudeMessages.timestamp);
        return messages;
    }
    async getAgentConversationHistory(agentId, userId, conversationId) {
        if (conversationId) {
            // Get specific conversation
            const messages = await db_1.db.select()
                .from(schema_1.claudeMessages)
                .where((0, drizzle_orm_1.eq)(schema_1.claudeMessages.conversationId, conversationId))
                .orderBy(schema_1.claudeMessages.timestamp);
            return messages.map(msg => ({
                role: msg.role === 'assistant' ? 'ai' : msg.role,
                content: msg.content
            }));
        }
        // Get all conversations for this agent and user
        const conversations = await db_1.db.select()
            .from(schema_1.claudeConversations)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.claudeConversations.agentName, agentId), (0, drizzle_orm_1.eq)(schema_1.claudeConversations.userId, userId)))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from most recent conversation
        const messages = await db_1.db.select()
            .from(schema_1.claudeMessages)
            .where((0, drizzle_orm_1.eq)(schema_1.claudeMessages.conversationId, conversations[0].conversationId))
            .orderBy(schema_1.claudeMessages.timestamp);
        return messages.map(msg => ({
            role: msg.role === 'assistant' ? 'ai' : msg.role,
            content: msg.content
        }));
    }
    async getAllAgentConversations(userId) {
        // Get all agent conversations for this user
        const conversations = await db_1.db.select()
            .from(schema_1.claudeConversations)
            .where((0, drizzle_orm_1.eq)(schema_1.claudeConversations.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        // Get messages from all conversations
        const conversationIds = conversations.map(c => c.conversationId);
        const messages = await db_1.db.select()
            .from(schema_1.claudeMessages)
            .where((0, drizzle_orm_1.sql) `${schema_1.claudeMessages.conversationId} = ANY(${conversationIds})`)
            .orderBy(schema_1.claudeMessages.timestamp);
        return messages;
    }
    // Sandra AI conversation operations (minimal implementation)
    async getSandraConversations(userId) {
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
            const enhancedMemoryData = {
                ...memoryData,
                conversationHistory: memoryData.conversationHistory || [],
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
            const conversation = await db_1.db.query.claudeConversations.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.claudeConversations.agentName, agentId), (0, drizzle_orm_1.eq)(schema_1.claudeConversations.userId, userId))
            });
            if (conversation) {
                // Delete memory messages (where content is '**CONVERSATION_MEMORY**')
                await db_1.db.delete(schema_1.claudeMessages)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.claudeMessages.conversationId, conversation.conversationId), (0, drizzle_orm_1.eq)(schema_1.claudeMessages.content, '**CONVERSATION_MEMORY**')));
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
        const [capture] = await db_1.db
            .insert(schema_1.emailCaptures)
            .values(data)
            .returning();
        return capture;
    }
    // Maya chat operations
    async getMayaChats(userId) {
        return await db_1.db
            .select()
            .from(schema_1.mayaChats)
            .where((0, drizzle_orm_1.eq)(schema_1.mayaChats.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.mayaChats.createdAt));
    }
    async createMayaChat(data) {
        const [chat] = await db_1.db
            .insert(schema_1.mayaChats)
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
        const [updatedUser] = await db_1.db
            .update(schema_1.users)
            .set({
            ...planSettings,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId))
            .returning();
        return updatedUser;
    }
    async getMayaChatMessages(chatId) {
        return await db_1.db
            .select()
            .from(schema_1.mayaChatMessages)
            .where((0, drizzle_orm_1.eq)(schema_1.mayaChatMessages.chatId, chatId))
            .orderBy(schema_1.mayaChatMessages.createdAt);
    }
    // REMOVED: getAllMayaChatMessages method to prevent session mixing
    // Use getMayaChatMessages(chatId) for session-specific loading
    async createMayaChatMessage(data) {
        const [message] = await db_1.db
            .insert(schema_1.mayaChatMessages)
            .values(data)
            .returning();
        return message;
    }
    // CRITICAL FIX: Missing saveMayaChatMessage method causing GenerationCompletionMonitor failure
    async saveMayaChatMessage(data) {
        return this.createMayaChatMessage(data);
    }
    async updateMayaChatMessage(messageId, data) {
        await db_1.db
            .update(schema_1.mayaChatMessages)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.mayaChatMessages.id, messageId));
    }
    // Get generation tracker by prediction ID for website generator
    async getGenerationTrackerByPredictionId(predictionId) {
        const [tracker] = await db_1.db
            .select()
            .from(schema_1.generationTrackers)
            .where((0, drizzle_orm_1.eq)(schema_1.generationTrackers.predictionId, predictionId));
        return tracker;
    }
    // Admin operations
    async setUserAsAdmin(email) {
        try {
            const [user] = await db_1.db
                .update(schema_1.users)
                .set({
                role: 'admin',
                monthlyGenerationLimit: -1, // Unlimited
                plan: 'sselfie-studio',
                mayaAiAccess: true,
                victoriaAiAccess: true,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
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
            const [user] = await db_1.db
                .select({ role: schema_1.users.role })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            return user?.role === 'admin';
        }
        catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }
    async hasUnlimitedGenerations(userId) {
        try {
            const [user] = await db_1.db
                .select({
                role: schema_1.users.role,
                monthlyGenerationLimit: schema_1.users.monthlyGenerationLimit
            })
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, userId));
            return user?.role === 'admin' || user?.monthlyGenerationLimit === -1;
        }
        catch (error) {
            console.error('Error checking unlimited generations:', error);
            return false;
        }
    }
    async updateSubscription(id, updates) {
        const [subscription] = await db_1.db
            .update(schema_1.subscriptions)
            .set({ ...updates, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.subscriptions.id, id))
            .returning();
        return subscription;
    }
    // Additional storage methods can be added here as needed
    // Admin dashboard count operations
    async getUserCount() {
        const result = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.users);
        return Number(result[0]?.count || 0);
    }
    async getAIImageCount() {
        const result = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.aiImages);
        return Number(result[0]?.count || 0);
    }
    async getAgentConversationCount() {
        const result = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.claudeMessages);
        return Number(result[0]?.count || 0);
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
