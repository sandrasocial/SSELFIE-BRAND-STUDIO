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
import { users, userProfiles, onboardingData, aiImages, generatedImages, generationTrackers, userModels, selfieUploads, subscriptions, userUsage, victoriaChats, photoSelections, landingPages, brandOnboarding, userLandingPages, emailCaptures, mayaChats, mayaChatMessages, userStyleMemory, generatedVideos, claudeConversations, claudeMessages, trainingRuns, loraWeights, conversations, messages, conversationSummaries, conceptCards, brandAssets, imageVariants, } from "../shared/schema.js";
import { db } from "./drizzle.js";
import { eq, and, desc, asc, gte, lte, sql } from "drizzle-orm";
export class DatabaseStorage {
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user;
    }
    async linkStackAuthId(existingUserId, stackAuthId) {
        console.log(`🔗 Linking existing user ${existingUserId} to Stack Auth ID ${stackAuthId}`);
        const [linkedUser] = await db
            .update(users)
            .set({
            stackAuthId: stackAuthId,
            updatedAt: new Date()
        })
            .where(eq(users.id, existingUserId))
            .returning();
        console.log(`✅ Successfully linked user to Stack Auth ID: ${linkedUser.email}`);
        return linkedUser;
    }
    async getUserByStackAuthId(stackAuthId) {
        const [user] = await db.select().from(users).where(eq(users.stackAuthId, stackAuthId));
        return user;
    }
    async createUser(userData) {
        console.log('🔄 Creating new user:', userData.email);
        let finalUserData = getDefaultUserFields(userData);
        if (finalUserData.email === 'ssa@ssasocial.com') {
            finalUserData.role = 'admin';
            finalUserData.monthlyGenerationLimit = -1;
            finalUserData.plan = 'sselfie-studio';
            finalUserData.mayaAiAccess = true;
            finalUserData.victoriaAiAccess = true;
            console.log('👑 Setting admin privileges for ssa@ssasocial.com');
        }
        const [user] = await db
            .insert(users)
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
        const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
        return allUsers;
    }
    async upsertUser(userData) {
        console.log('🔄 Upserting user:', userData.id, userData.email);
        let finalUserData = getDefaultUserFields(userData);
        if (finalUserData.email === 'ssa@ssasocial.com') {
            finalUserData.role = 'admin';
            finalUserData.monthlyGenerationLimit = -1;
            finalUserData.plan = 'sselfie-studio';
            finalUserData.mayaAiAccess = true;
            finalUserData.victoriaAiAccess = true;
            console.log('👑 Setting admin privileges for ssa@ssasocial.com');
        }
        const existingUser = await this.getUser(finalUserData.id);
        if (existingUser) {
            console.log('✅ Found existing user by ID, updating...');
            const [user] = await db
                .update(users)
                .set({
                ...finalUserData,
                updatedAt: new Date(),
            })
                .where(eq(users.id, finalUserData.id))
                .returning();
            return user;
        }
        if (finalUserData.email) {
            const [userByEmail] = await db
                .select()
                .from(users)
                .where(eq(users.email, finalUserData.email));
            if (userByEmail) {
                console.log('✅ Found existing user by email, updating with new Stack Auth ID...');
                const [updatedUser] = await db
                    .update(users)
                    .set({
                    ...finalUserData,
                    id: finalUserData.id,
                    updatedAt: new Date(),
                })
                    .where(eq(users.email, finalUserData.email))
                    .returning();
                return updatedUser;
            }
        }
        console.log('🆕 Creating new user...');
        try {
            const [user] = await db
                .insert(users)
                .values(finalUserData)
                .returning();
            return user;
        }
        catch (error) {
            const e = error;
            if (e?.code === '23505' && e?.constraint === 'users_email_unique') {
                console.log('🔄 Duplicate email constraint, fetching existing user...');
                const [existingUser] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, finalUserData.email || ''));
                if (existingUser) {
                    return existingUser;
                }
            }
            throw error;
        }
    }
    async updateUserProfile(userId, updates) {
        const [updatedUser] = await db
            .update(users)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(users.id, userId))
            .returning();
        return updatedUser;
    }
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
    async getUserProfile(userId) {
        const [profile] = await db
            .select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, userId));
        return profile;
    }
    async upsertUserProfile(data) {
        const existingProfile = await this.getUserProfile(data.userId);
        if (existingProfile) {
            const [profile] = await db
                .update(userProfiles)
                .set({ ...data, updatedAt: new Date() })
                .where(eq(userProfiles.userId, data.userId))
                .returning();
            return profile;
        }
        else {
            const [profile] = await db
                .insert(userProfiles)
                .values(data)
                .returning();
            return profile;
        }
    }
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
    async getAIImages(userId) {
        let images = await db
            .select()
            .from(aiImages)
            .where(eq(aiImages.userId, userId))
            .orderBy(desc(aiImages.createdAt));
        if (images.length === 0) {
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
    async getGeneratedImages(userId) {
        let images = await db
            .select()
            .from(generatedImages)
            .where(eq(generatedImages.userId, userId))
            .orderBy(desc(generatedImages.createdAt));
        if (images.length === 0) {
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
    async getGeneratedVideos(userId) {
        let videos = await db
            .select()
            .from(generatedVideos)
            .where(eq(generatedVideos.userId, userId))
            .orderBy(desc(generatedVideos.createdAt));
        if (videos.length === 0) {
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
    async getUserModel(userId) {
        let [model] = await db
            .select()
            .from(userModels)
            .where(eq(userModels.userId, userId));
        if (!model) {
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
        return this.getUserModel(userId);
    }
    async getUserModelById(modelId) {
        const [model] = await db
            .select()
            .from(userModels)
            .where(eq(userModels.id, modelId));
        return model;
    }
    async createUserModel(data) {
        console.log('Creating user model with data:', data);
        const [model] = await db.insert(userModels).values([data]).returning();
        return model;
    }
    async updateUserModel(userId, data) {
        let [updated] = await db
            .update(userModels)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(userModels.userId, userId))
            .returning();
        if (!updated) {
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
    async deleteFailedTrainingData(userId) {
        console.log(`🗑️ CLEANUP: Deleting all failed training data for user ${userId}`);
        await db.delete(generationTrackers).where(eq(generationTrackers.userId, userId));
        await db.delete(aiImages).where(eq(aiImages.userId, userId));
        await db.delete(userModels).where(eq(userModels.userId, userId));
        console.log(`✅ CLEANUP: All training data deleted for user ${userId} - ready for fresh start`);
    }
    async checkTrainingStatus(userId) {
        const model = await this.getUserModel(userId);
        if (!model) {
            return { needsRestart: false, reason: 'Ready to start training' };
        }
        if (model.trainingStatus === 'failed') {
            return { needsRestart: true, reason: 'Training failed - please restart with new images' };
        }
        if (model.trainingStatus === 'training' && model.startedAt) {
            const hoursAgo = (Date.now() - new Date(model.startedAt).getTime()) / (1000 * 60 * 60);
            if (hoursAgo > 2) {
                return { needsRestart: true, reason: 'Training appears stuck - please restart' };
            }
        }
        return { needsRestart: false, reason: 'Training is proceeding normally' };
    }
    async ensureUserModel(userId) {
        const existingModel = await this.getUserModel(userId);
        if (existingModel) {
            console.log('✅ User model already exists for user:', userId);
            return existingModel;
        }
        const user = await this.getUser(userId);
        const actualUserId = user?.id || userId;
        console.log('🔄 Creating new user model for user:', actualUserId);
        const triggerWord = `user${actualUserId}`;
        const modelData = {
            userId: actualUserId,
            triggerWord,
            trainingStatus: 'not_started',
            modelName: `${actualUserId}-selfie-lora`,
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
        console.log(`🗑️ Deleting user model for user: ${userId}`);
        await db.delete(userModels).where(eq(userModels.userId, userId));
    }
    async getAllInProgressTrainings() {
        return await db
            .select()
            .from(userModels)
            .where(eq(userModels.trainingStatus, 'training'))
            .orderBy(desc(userModels.createdAt));
    }
    async getAllCompletedTrainings() {
        return await db
            .select()
            .from(userModels)
            .where(eq(userModels.trainingStatus, 'completed'))
            .orderBy(desc(userModels.createdAt));
    }
    async getMonthlyRetrainCount(userId, month, year) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        const models = await db
            .select()
            .from(userModels)
            .where(and(eq(userModels.userId, userId), gte(userModels.createdAt, startDate), lte(userModels.createdAt, endDate)));
        return models.length;
    }
    async getUserModelByDatabaseUserId(userId) {
        const result = await db.select().from(userModels).where(eq(userModels.userId, userId));
        return result[0];
    }
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
    async getFlatlayCollections() {
        return [
            {
                name: 'Luxury Minimal',
                images: [
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
    async getUserPlan(userId) {
        const user = await this.getUser(userId);
        return user?.plan || 'basic';
    }
    async hasMayaAIAccess(userId) {
        const user = await this.getUser(userId);
        const userModel = await this.getUserModel(userId);
        const hasTrainedModel = userModel?.trainingStatus === 'completed';
        return hasTrainedModel || user?.role === 'admin' || false;
    }
    async hasVictoriaAIAccess(userId) {
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
        if (user?.role === 'admin') {
            return {
                allowed: 999999,
                used: user?.generationsUsedThisMonth || 0
            };
        }
        const monthlyLimit = user?.monthlyGenerationLimit || 30;
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
        const photoSelections = await this.getPhotoSelections(userId);
        if (!photoSelections || !Array.isArray(photoSelections.selectedSelfieIds) || !photoSelections.selectedSelfieIds?.length) {
            return [];
        }
        const userImages = await this.getAIImages(userId);
        const selectedIds = photoSelections.selectedSelfieIds;
        const selectedImages = userImages.filter(img => selectedIds.includes(img.id));
        return selectedImages.map(img => ({
            id: img.id,
            url: img.imageUrl,
            description: img.prompt || 'Selected inspiration photo'
        }));
    }
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
    async saveAgentConversation(agentId, userId, userMessage, agentResponse, fileOperations, conversationId) {
        const convId = conversationId || `admin_${agentId}_${userId}`;
        let conversation = await db.query.claudeConversations.findFirst({
            where: eq(claudeConversations.conversationId, convId)
        });
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
        await db.insert(claudeMessages).values({
            conversationId: convId,
            role: 'user',
            content: userMessage,
            metadata: fileOperations ? { fileOperations } : null
        });
        await db.insert(claudeMessages).values({
            conversationId: convId,
            role: 'assistant',
            content: agentResponse,
            metadata: fileOperations ? { fileOperations } : null
        });
        await db.update(claudeConversations)
            .set({
            lastMessageAt: new Date(),
            messageCount: sql `${claudeConversations.messageCount} + 2`
        })
            .where(eq(claudeConversations.conversationId, convId));
        return conversation;
    }
    async getAgentConversations(agentId, userId) {
        const conversations = await db.select()
            .from(claudeConversations)
            .where(and(eq(claudeConversations.agentName, agentId), eq(claudeConversations.userId, userId)))
            .orderBy(desc(claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        const messages = await db.select()
            .from(claudeMessages)
            .where(eq(claudeMessages.conversationId, conversations[0].conversationId))
            .orderBy(claudeMessages.timestamp);
        return messages;
    }
    async getAgentConversationHistory(agentId, userId, conversationId) {
        if (conversationId) {
            const messages = await db.select()
                .from(claudeMessages)
                .where(eq(claudeMessages.conversationId, conversationId))
                .orderBy(claudeMessages.timestamp);
            return messages.map(msg => ({
                role: msg.role === 'assistant' ? 'ai' : msg.role,
                content: msg.content
            }));
        }
        const conversations = await db.select()
            .from(claudeConversations)
            .where(and(eq(claudeConversations.agentName, agentId), eq(claudeConversations.userId, userId)))
            .orderBy(desc(claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
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
        const conversations = await db.select()
            .from(claudeConversations)
            .where(eq(claudeConversations.userId, userId))
            .orderBy(desc(claudeConversations.lastMessageAt));
        if (conversations.length === 0)
            return [];
        const conversationIds = conversations.map(c => c.conversationId);
        const messages = await db.select()
            .from(claudeMessages)
            .where(sql `${claudeMessages.conversationId} = ANY(${conversationIds})`)
            .orderBy(claudeMessages.timestamp);
        return messages;
    }
    async getSandraConversations() {
        return [];
    }
    async saveSandraConversation(data) {
        return data;
    }
    async saveAgentMemory(agentId, userId, memoryData) {
        try {
            const base = (typeof memoryData === 'object' && memoryData !== null) ? memoryData : {};
            const conversationHistory = Array.isArray(base.conversationHistory) ? base.conversationHistory : [];
            const enhancedMemoryData = {
                ...base,
                conversationHistory,
                lastSaved: new Date().toISOString()
            };
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
            const memoryEntry = conversations
                .filter(msg => msg.role === 'user' && msg.content === '**CONVERSATION_MEMORY**')
                .sort((a, b) => {
                const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                return dateB - dateA;
            })[0];
            if (memoryEntry) {
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
            const conversation = await db.query.claudeConversations.findFirst({
                where: and(eq(claudeConversations.agentName, agentId), eq(claudeConversations.userId, userId))
            });
            if (conversation) {
                await db.delete(claudeMessages)
                    .where(and(eq(claudeMessages.conversationId, conversation.conversationId), eq(claudeMessages.content, '**CONVERSATION_MEMORY**')));
            }
            console.log(`🧹 Agent memory cleared for ${agentId}`);
        }
        catch (error) {
            console.error('Failed to clear agent memory:', error);
            throw error;
        }
    }
    async captureEmail(data) {
        const [capture] = await db
            .insert(emailCaptures)
            .values(data)
            .returning();
        return capture;
    }
    async getMayaChats(userId) {
        return await db
            .select()
            .from(mayaChats)
            .where(eq(mayaChats.userId, userId))
            .orderBy(desc(mayaChats.lastActivity || mayaChats.createdAt));
    }
    async getAllMayaChats() {
        return await db
            .select()
            .from(mayaChats)
            .orderBy(desc(mayaChats.lastActivity || mayaChats.createdAt));
    }
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
    async getMayaChat(chatId, userId) {
        const [chat] = await db
            .select()
            .from(mayaChats)
            .where(and(eq(mayaChats.id, parseInt(chatId)), eq(mayaChats.userId, userId)));
        return chat;
    }
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
        await this.saveMayaMessage(chat.id.toString(), userId, {
            message: data.message,
            role: 'user'
        });
        await this.saveMayaMessage(chat.id.toString(), userId, {
            message: data.response,
            role: 'assistant'
        });
        return chat.id.toString();
    }
    async getMayaChatMessages(chatId, userId) {
        return await db
            .select()
            .from(mayaChatMessages)
            .where(eq(mayaChatMessages.chatId, parseInt(chatId)))
            .orderBy(asc(mayaChatMessages.createdAt));
    }
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
    async updateMayaMessage(messageId, userId, updates) {
        await db
            .update(mayaChatMessages)
            .set({ content: updates.content })
            .where(eq(mayaChatMessages.id, parseInt(messageId)));
    }
    async createMayaChatLegacy(data) {
        const [chat] = await db
            .insert(mayaChats)
            .values(data)
            .returning();
        return chat;
    }
    async upgradeUserToPremium(userId, plan) {
        return this.upgradeUserPlan(userId, plan);
    }
    async upgradeUserPlan(userId, plan) {
        let planSettings;
        if (plan === 'basic') {
            planSettings = {
                plan: 'basic',
                monthlyGenerationLimit: 30,
                mayaAiAccess: true,
                victoriaAiAccess: false,
            };
        }
        else if (plan === 'full-access') {
            planSettings = {
                plan: 'full-access',
                monthlyGenerationLimit: 100,
                mayaAiAccess: true,
                victoriaAiAccess: true,
            };
        }
        else {
            planSettings = {
                plan: plan,
                monthlyGenerationLimit: plan === 'images-only' ? 30 : 100,
                mayaAiAccess: true,
                victoriaAiAccess: plan !== 'images-only',
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
    async getMayaChatMessagesLegacy(chatId) {
        const messages = await db
            .select()
            .from(mayaChatMessages)
            .where(eq(mayaChatMessages.chatId, chatId))
            .orderBy(mayaChatMessages.createdAt);
        return messages.map(msg => {
            const processedMsg = {
                ...msg,
                imagePreview: msg.imagePreview ? JSON.parse(msg.imagePreview) : null,
                conceptCards: msg.conceptCards ? msg.conceptCards : null,
                quickButtons: msg.quickButtons ? JSON.parse(msg.quickButtons) : null,
            };
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
    async createMayaChatMessage(data) {
        console.log(`📝 MAYA MESSAGE: Saving ${data.role} message with concept cards: ${data.conceptCards ? 'YES' : 'NO'}`);
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
        const [message] = await db
            .insert(mayaChatMessages)
            .values(data)
            .returning();
        return message;
    }
    async saveMayaChatMessage(data) {
        return this.createMayaChatMessage(data);
    }
    async getMayaConceptById(conceptId) {
        console.log(`🔍 CONCEPT RETRIEVAL: Searching for concept ID "${conceptId}"`);
        const messages = await db
            .select()
            .from(mayaChatMessages)
            .where(eq(mayaChatMessages.role, 'maya'))
            .orderBy(desc(mayaChatMessages.createdAt));
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
        await db
            .update(mayaChatMessages)
            .set(data)
            .where(eq(mayaChatMessages.id, messageId));
    }
    async getGenerationTrackerByPredictionId(predictionId) {
        const [tracker] = await db
            .select()
            .from(generationTrackers)
            .where(eq(generationTrackers.predictionId, predictionId));
        return tracker;
    }
    async setUserAsAdmin(email) {
        try {
            const [user] = await db
                .update(users)
                .set({
                role: 'admin',
                monthlyGenerationLimit: -1,
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
        await db.update(loraWeights).set({ status: 'archived' }).where(eq(loraWeights.userId, userId));
        await db.update(loraWeights).set({ status: 'available' }).where(eq(loraWeights.id, weightId));
    }
    async storeLoRAWeights(data) {
        const urlParts = data.weightsUrl.replace('https://', '').split('/');
        const s3Bucket = urlParts[0].split('.s3.amazonaws.com')[0];
        const s3Key = urlParts.slice(1).join('/');
        const triggerWord = `user${data.userId.replace(/[^a-zA-Z0-9]/g, '')}`;
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
        const mayaScales = {
            closeUpPortrait: 0.9,
            halfBodyShot: 1.0,
            fullScenery: 0.85,
            creativeOptimized: 1.1
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
            rank: 32,
            networkType: 'lora',
            status: 'available',
            defaultScales: mayaScales,
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
        if (!targetMessage.length)
            return [];
        return await db
            .select()
            .from(messages)
            .where(and(eq(messages.conversationId, conversationId), gte(messages.createdAt, targetMessage[0].createdAt)))
            .orderBy(messages.createdAt);
    }
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
    async createConceptCard(data) {
        if (data.clientId && data.userId) {
            const existing = await this.getConceptCardByClientId(data.userId, data.clientId);
            if (existing) {
                return existing;
            }
        }
        const [conceptCard] = await db
            .insert(conceptCards)
            .values({
            ...data,
            userId: data.userId || '',
            title: data.title || 'Untitled Concept'
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
            .orderBy(conceptCards.sortOrder, desc(conceptCards.createdAt));
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
        return this.updateConceptCard(id, {
            generatedImages,
            isLoading,
            isGenerating,
            hasGenerated
        });
    }
    async deleteConceptCard(id) {
        await db
            .delete(conceptCards)
            .where(eq(conceptCards.id, id));
    }
    async getBrandAssets(userId) {
        return await db
            .select()
            .from(brandAssets)
            .where(eq(brandAssets.userId, userId))
            .orderBy(desc(brandAssets.createdAt));
    }
    async saveBrandAsset(data) {
        if (!data.url || !data.userId || !data.filename) {
            throw new Error('Missing required fields: url, userId, filename');
        }
        const [asset] = await db
            .insert(brandAssets)
            .values(data)
            .returning();
        return asset;
    }
    async deleteBrandAsset(assetId, userId) {
        const result = await db
            .delete(brandAssets)
            .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)));
        return result.rowCount > 0;
    }
    async getBrandAsset(assetId, userId) {
        const [asset] = await db
            .select()
            .from(brandAssets)
            .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)));
        return asset;
    }
    async saveImageVariant(data) {
        if (!data.userId || !data.originalImageId || !data.variantUrl) {
            throw new Error('Missing required fields: userId, originalImageId, variantUrl');
        }
        const [variant] = await db
            .insert(imageVariants)
            .values(data)
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
    async testConnection() {
        try {
            await db.execute(sql `SELECT 1`);
            return true;
        }
        catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }
    async createUsageHistory(data) {
        console.log('Usage history:', data);
    }
    async getUserUsageHistory() {
        return [];
    }
    async getUserStyleMemory(userId) {
        const [memory] = await db.select().from(userStyleMemory).where(eq(userStyleMemory.userId, userId));
        return memory;
    }
    async createUserStyleMemory(data) {
        const payload = data;
        const [memory] = await db.insert(userStyleMemory).values(payload).returning();
        return memory;
    }
    async updateUserStyleMemory(userId, data) {
        const [memory] = await db
            .update(userStyleMemory)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(userStyleMemory.userId, userId))
            .returning();
        return memory;
    }
}
export const storage = new DatabaseStorage();
//# sourceMappingURL=storage.js.map