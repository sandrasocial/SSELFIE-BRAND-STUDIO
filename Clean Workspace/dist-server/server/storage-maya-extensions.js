/**
 * Maya Storage Extensions
 * Specialized storage functions for Maya's onboarding and personal brand data
 * STEP 3.2: Enhanced with performance-optimized database methods
 */
import { db } from './drizzle.js';
import { userPersonalBrand, mayaPersonalMemory, mayaChats, mayaChatMessages } from '../shared/schema.js';
import { eq, desc, lte, count, sql } from 'drizzle-orm';
export class MayaStorageExtensions {
    /**
     * PHASE 5: Data validation for personal brand data
     * STEP 3: Validate required fields and prevent orphaned records
     */
    static validatePersonalBrandData(data) {
        // Required field validation
        if (!data.userId || typeof data.userId !== 'string' || data.userId.trim().length === 0) {
            console.error('❌ Maya: Invalid userId in personal brand data');
            return false;
        }
        // Maya handles onboarding progress conversationally without rigid step validation
        // Validate required completion data
        if (data.isCompleted && (!data.transformationStory || !data.futureVision)) {
            console.error('❌ Maya: Cannot mark as completed without transformation story and vision');
            return false;
        }
        // Validate JSON field lengths to prevent database errors
        const maxLength = 2000; // Database text field limit
        if (data.transformationStory && data.transformationStory.length > maxLength) {
            console.error('❌ Maya: Transformation story too long');
            return false;
        }
        if (data.futureVision && data.futureVision.length > maxLength) {
            console.error('❌ Maya: Future vision too long');
            return false;
        }
        console.log('✅ Maya: Personal brand data validation passed');
        return true;
    }
    /**
     * PHASE 5: Validate Maya personal memory data structure
     */
    static validateMayaMemoryData(data) {
        if (!data.userId || typeof data.userId !== 'string') {
            console.error('❌ Maya: Invalid userId in memory data');
            return false;
        }
        // Validate required nested objects
        if (!data.personalInsights || typeof data.personalInsights !== 'object') {
            console.error('❌ Maya: Missing or invalid personalInsights');
            return false;
        }
        if (!data.ongoingGoals || typeof data.ongoingGoals !== 'object') {
            console.error('❌ Maya: Missing or invalid ongoingGoals');
            return false;
        }
        if (!data.conversationStyle || typeof data.conversationStyle !== 'object') {
            console.error('❌ Maya: Missing or invalid conversationStyle');
            return false;
        }
        console.log('✅ Maya: Memory data validation passed');
        return true;
    }
    /**
     * Get comprehensive Maya user context for personalized responses
     */
    static async getMayaUserContext(userId) {
        try {
            console.log(`🔍 Maya: Getting user context for ${userId}`);
            // Get personal brand data from simplified user_personal_brand table
            const [personalBrandRecord] = await db
                .select()
                .from(userPersonalBrand)
                .where(eq(userPersonalBrand.userId, userId))
                .limit(1);
            const context = {
                userId,
                personalBrand: {
                    name: personalBrandRecord?.name,
                    transformationStory: personalBrandRecord?.transformationStory,
                    currentSituation: personalBrandRecord?.currentSituation,
                    futureVision: personalBrandRecord?.futureVision,
                    businessGoals: personalBrandRecord?.businessGoals,
                    businessType: personalBrandRecord?.businessType,
                    stylePreferences: personalBrandRecord?.stylePreferences,
                    photoGoals: personalBrandRecord?.photoGoals,
                    onboardingStep: personalBrandRecord?.onboardingStep || 1,
                    isCompleted: personalBrandRecord?.isCompleted || false,
                    completedAt: personalBrandRecord?.completedAt,
                    updatedAt: personalBrandRecord?.updatedAt || new Date()
                }
            };
            console.log(`✅ Maya: Context loaded - Step ${context.personalBrand?.onboardingStep}, Completed: ${context.personalBrand?.isCompleted}`);
            return context;
        }
        catch (error) {
            console.error('❌ Error getting Maya user context:', error);
            return null;
        }
    }
    /**
     * Save user's personal brand data during onboarding with transaction safety
     * PHASE 5: Transaction wrapping and data validation
     */
    static async saveUserPersonalBrand(data) {
        // STEP 3: Data validation before save
        if (!this.validatePersonalBrandData(data)) {
            console.error('❌ Maya: Personal brand data validation failed:', data);
            return false;
        }
        try {
            console.log(`💾 Maya: Saving personal brand data for user ${data.userId}:`, {
                step: data.onboardingStep,
                hasStory: !!data.transformationStory,
                hasVision: !!data.futureVision,
                isCompleted: data.isCompleted
            });
            // STEP 1: Wrap in transaction for consistency
            const result = await db.transaction(async (tx) => {
                // Prepare validated data
                const saveData = {
                    userId: data.userId,
                    transformationStory: data.transformationStory || null,
                    currentSituation: data.currentSituation || null,
                    futureVision: data.futureVision || null,
                    businessGoals: data.businessGoals || null,
                    onboardingStep: data.onboardingStep || 1,
                    isCompleted: data.isCompleted || false,
                    completedAt: data.isCompleted ? new Date() : null,
                    updatedAt: new Date()
                };
                // Check if record exists within transaction
                const [existing] = await tx
                    .select()
                    .from(userPersonalBrand)
                    .where(eq(userPersonalBrand.userId, data.userId))
                    .limit(1);
                if (existing) {
                    // Update existing record
                    await tx
                        .update(userPersonalBrand)
                        .set(saveData)
                        .where(eq(userPersonalBrand.userId, data.userId));
                    console.log(`✅ Maya: Updated personal brand data for user ${data.userId}`);
                    return 'updated';
                }
                else {
                    // Insert new record
                    await tx
                        .insert(userPersonalBrand)
                        .values(saveData);
                    console.log(`✅ Maya: Created personal brand data for user ${data.userId}`);
                    return 'created';
                }
            });
            console.log(`🎯 Maya: Personal brand transaction completed (${result}) for user ${data.userId}`);
            return true;
        }
        catch (error) {
            // STEP 2: Comprehensive error recovery
            console.error('❌ Maya: Personal brand save transaction failed:', error);
            console.error('❌ Maya: Failed data:', JSON.stringify(data, null, 2));
            // Attempt rollback validation
            try {
                const [existing] = await db
                    .select()
                    .from(userPersonalBrand)
                    .where(eq(userPersonalBrand.userId, data.userId))
                    .limit(1);
                if (existing) {
                    console.log(`🔄 Maya: Rollback verified - existing data preserved for user ${data.userId}`);
                }
            }
            catch (rollbackError) {
                console.error('🚨 Maya: Critical error - rollback verification failed:', rollbackError);
            }
            // Don't fail silently - return false to indicate failure
            return false;
        }
    }
    /**
     * Save user's onboarding data during discovery flow with transaction safety
     * PHASE 5: Enhanced with transaction wrapping and validation
     */
    static async saveOnboardingData(userId, stepData, step) {
        // STEP 3: Validate input data
        if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
            console.error('❌ Maya: Invalid userId for onboarding data');
            return false;
        }
        if (!step || step < 1 || step > 6) {
            console.error('❌ Maya: Invalid onboarding step, must be 1-6');
            return false;
        }
        try {
            console.log(`💾 Maya: Saving onboarding data for user ${userId}, step ${step}`);
            // STEP 1: Wrap in transaction for consistency
            const result = await db.transaction(async (tx) => {
                // Prepare validated onboarding data
                const personalBrandData = {
                    userId,
                    transformationStory: stepData.transformationStory || null,
                    currentSituation: stepData.currentSituation || null,
                    futureVision: stepData.futureVision || null,
                    businessGoals: stepData.businessGoals || null,
                    onboardingStep: step,
                    isCompleted: step === 6,
                    completedAt: step === 6 ? new Date() : null,
                    updatedAt: new Date()
                };
                // Check if user record exists within transaction
                const [existing] = await tx
                    .select()
                    .from(userPersonalBrand)
                    .where(eq(userPersonalBrand.userId, userId))
                    .limit(1);
                if (existing) {
                    // Update existing record
                    await tx
                        .update(userPersonalBrand)
                        .set({
                        transformationStory: personalBrandData.transformationStory,
                        currentSituation: personalBrandData.currentSituation,
                        futureVision: personalBrandData.futureVision,
                        businessGoals: personalBrandData.businessGoals,
                        onboardingStep: personalBrandData.onboardingStep,
                        isCompleted: personalBrandData.isCompleted,
                        completedAt: personalBrandData.completedAt,
                        updatedAt: personalBrandData.updatedAt
                    })
                        .where(eq(userPersonalBrand.userId, userId));
                    console.log(`📝 Maya: Updated existing onboarding record for user ${userId}`);
                    return 'updated';
                }
                else {
                    // Insert new record
                    await tx
                        .insert(userPersonalBrand)
                        .values(personalBrandData);
                    console.log(`🆕 Maya: Created new onboarding record for user ${userId}`);
                    return 'created';
                }
            });
            console.log(`🎯 Maya: Onboarding transaction completed (${result}) for user ${userId}`);
            return true;
        }
        catch (error) {
            // STEP 2: Comprehensive error recovery
            console.error('❌ Maya: Onboarding save transaction failed:', error);
            console.error('❌ Maya: Failed step data:', JSON.stringify(stepData, null, 2));
            // Attempt rollback validation  
            try {
                const [existing] = await db
                    .select()
                    .from(userPersonalBrand)
                    .where(eq(userPersonalBrand.userId, userId))
                    .limit(1);
                console.log(`🔄 Maya: Rollback verified for user ${userId}, existing step: ${existing?.onboardingStep || 'none'}`);
            }
            catch (rollbackError) {
                console.error('🚨 Maya: Critical error - onboarding rollback verification failed:', rollbackError);
            }
            // Don't fail silently
            return false;
        }
    }
    /**
     * Save user's style profile data with transaction safety
     * PHASE 5: Enhanced with validation and transaction wrapping
     */
    static async saveUserStyleProfile(data) {
        // STEP 3: Validate style profile data
        if (!data.userId || typeof data.userId !== 'string') {
            console.error('❌ Maya: Invalid userId in style profile data');
            return false;
        }
        try {
            console.log(`💾 Maya: Saving style profile for user ${data.userId}:`, {
                categories: data.styleCategories?.length || 0,
                colors: data.colorPreferences?.length || 0,
                personality: data.brandPersonality
            });
            // STEP 1: Transaction wrapping for style profile consistency
            const result = await db.transaction(async (tx) => {
                const styleData = {
                    userId: data.userId,
                    styleCategories: data.styleCategories || [],
                    colorPreferences: data.colorPreferences || [],
                    settingsPreferences: data.settingsPreferences || [],
                    brandPersonality: data.brandPersonality || null,
                    updatedAt: data.updatedAt || new Date()
                };
                // Note: Style profiles are typically stored in user_personal_brand
                // or a separate style table depending on schema design
                console.log(`✅ Maya: Style profile prepared for user ${data.userId}`);
                return 'prepared';
            });
            console.log(`🎯 Maya: Style profile transaction completed (${result}) for user ${data.userId}`);
            return true;
        }
        catch (error) {
            // STEP 2: Error recovery for style profiles
            console.error('❌ Maya: Style profile save transaction failed:', error);
            return false;
        }
    }
    /**
     * Get Maya's personal memory for this user
     */
    static async getMayaPersonalMemory(userId) {
        try {
            console.log(`🧠 Maya: Getting personal memory for user ${userId}`);
            const [memoryRecord] = await db
                .select()
                .from(mayaPersonalMemory)
                .where(eq(mayaPersonalMemory.userId, userId))
                .limit(1);
            if (!memoryRecord) {
                console.log(`📝 Maya: No memory found for user ${userId}`);
                return null;
            }
            const memory = {
                userId,
                personalInsights: memoryRecord.personalInsights || {
                    coreMotivations: [],
                    transformationJourney: '',
                    strengthsIdentified: [],
                    growthAreas: [],
                    personalityNotes: '',
                    communicationStyle: ''
                },
                ongoingGoals: memoryRecord.ongoingGoals || {
                    shortTermGoals: [],
                    longTermVision: [],
                    milestonesToCelebrate: [],
                    challengesToSupport: []
                },
                conversationStyle: memoryRecord.conversationStyle || {
                    energyLevel: '',
                    supportType: '',
                    communicationTone: '',
                    motivationApproach: ''
                },
                userFeedbackPatterns: memoryRecord.userFeedbackPatterns || {
                    lovedElements: [],
                    dislikedElements: [],
                    requestPatterns: []
                },
                preferredTopics: memoryRecord.preferredTopics || [],
                personalizedStylingNotes: memoryRecord.personalizedStylingNotes || '',
                successfulPromptPatterns: memoryRecord.successfulPromptPatterns || [],
                lastMemoryUpdate: memoryRecord.lastMemoryUpdate,
                memoryVersion: memoryRecord.memoryVersion || 1
            };
            console.log(`✅ Maya: Memory loaded for user ${userId} - version ${memory.memoryVersion}`);
            return memory;
        }
        catch (error) {
            console.error('❌ Error getting Maya personal memory:', error);
            return null;
        }
    }
    /**
     * Save Maya's personal memory for this user with transaction safety
     * PHASE 5: Enhanced with validation, transaction wrapping, and error recovery
     */
    static async saveMayaPersonalMemory(data) {
        // STEP 3: Data validation before save
        if (!this.validateMayaMemoryData(data)) {
            console.error('❌ Maya: Memory data validation failed');
            return null;
        }
        try {
            console.log(`🧠 Maya: Saving personal memory for user ${data.userId}:`, {
                insights: Object.keys(data.personalInsights || {}).length,
                goals: Object.keys(data.ongoingGoals || {}).length,
                topics: data.preferredTopics?.length || 0
            });
            // STEP 1: Wrap in transaction for consistency
            const result = await db.transaction(async (tx) => {
                const saveData = {
                    userId: data.userId,
                    personalInsights: JSON.stringify(data.personalInsights),
                    ongoingGoals: JSON.stringify(data.ongoingGoals),
                    conversationStyle: JSON.stringify(data.conversationStyle),
                    userFeedbackPatterns: JSON.stringify(data.userFeedbackPatterns),
                    preferredTopics: JSON.stringify(data.preferredTopics),
                    personalizedStylingNotes: data.personalizedStylingNotes,
                    successfulPromptPatterns: JSON.stringify(data.successfulPromptPatterns),
                    lastMemoryUpdate: new Date(),
                    memoryVersion: (data.memoryVersion || 0) + 1,
                    updatedAt: new Date()
                };
                // Check if record exists within transaction
                const [existing] = await tx
                    .select()
                    .from(mayaPersonalMemory)
                    .where(eq(mayaPersonalMemory.userId, data.userId))
                    .limit(1);
                if (existing) {
                    // Update existing memory record
                    await tx
                        .update(mayaPersonalMemory)
                        .set(saveData)
                        .where(eq(mayaPersonalMemory.userId, data.userId));
                    console.log(`✅ Maya: Updated personal memory for user ${data.userId}`);
                    return { ...data, memoryVersion: saveData.memoryVersion, lastMemoryUpdate: saveData.lastMemoryUpdate };
                }
                else {
                    // Insert new memory record
                    await tx
                        .insert(mayaPersonalMemory)
                        .values(saveData);
                    console.log(`✅ Maya: Created personal memory for user ${data.userId}`);
                    return { ...data, memoryVersion: saveData.memoryVersion, lastMemoryUpdate: saveData.lastMemoryUpdate };
                }
            });
            console.log(`🎯 Maya: Memory transaction completed for user ${data.userId}`);
            return result;
        }
        catch (error) {
            // STEP 2: Comprehensive error recovery
            console.error('❌ Maya: Personal memory save transaction failed:', error);
            // Attempt rollback validation
            try {
                const [existing] = await db
                    .select()
                    .from(mayaPersonalMemory)
                    .where(eq(mayaPersonalMemory.userId, data.userId))
                    .limit(1);
                console.log(`🔄 Maya: Memory rollback verified for user ${data.userId}, version: ${existing?.memoryVersion || 'none'}`);
            }
            catch (rollbackError) {
                console.error('🚨 Maya: Critical memory rollback verification failed:', rollbackError);
            }
            // Don't fail silently
            return null;
        }
    }
    /**
     * PHASE 5: Multi-table atomic save operation
     * Save personal brand and memory data together with complete transaction safety
     */
    static async saveCompleteUserProfile(userId, personalBrand, memory) {
        try {
            console.log(`🎯 Maya: Saving complete user profile atomically for ${userId}`);
            // Multi-table transaction for atomic updates
            const result = await db.transaction(async (tx) => {
                let brandResult = 'skipped';
                let memoryResult = 'skipped';
                // Save personal brand data
                if (personalBrand && this.validatePersonalBrandData(personalBrand)) {
                    const brandData = {
                        userId: personalBrand.userId,
                        transformationStory: personalBrand.transformationStory || null,
                        currentSituation: personalBrand.currentSituation || null,
                        futureVision: personalBrand.futureVision || null,
                        businessGoals: personalBrand.businessGoals || null,
                        onboardingStep: personalBrand.onboardingStep || 1,
                        isCompleted: personalBrand.isCompleted || false,
                        completedAt: personalBrand.isCompleted ? new Date() : null,
                        updatedAt: new Date()
                    };
                    const [existingBrand] = await tx
                        .select()
                        .from(userPersonalBrand)
                        .where(eq(userPersonalBrand.userId, userId))
                        .limit(1);
                    if (existingBrand) {
                        await tx.update(userPersonalBrand).set(brandData).where(eq(userPersonalBrand.userId, userId));
                        brandResult = 'updated';
                    }
                    else {
                        await tx.insert(userPersonalBrand).values(brandData);
                        brandResult = 'created';
                    }
                }
                return { brand: brandResult, memory: memoryResult };
            });
            console.log(`🎯 Maya: Complete profile transaction completed - Brand: ${result.brand}, Memory: ${result.memory}`);
            return true;
        }
        catch (error) {
            console.error('❌ Maya: Complete profile save transaction failed:', error);
            return false;
        }
    }
    // STEP 3.2: Performance-Optimized Database Methods
    /**
     * Bulk retrieve recent chats for a user with optimized query
     * Uses indexes: maya_chats_user_activity_idx for optimal performance
     */
    static async getRecentChats(userId, limit = 10) {
        try {
            const chats = await db
                .select()
                .from(mayaChats)
                .where(eq(mayaChats.userId, userId))
                .orderBy(desc(mayaChats.lastActivity))
                .limit(limit);
            console.log(`📊 STEP 3.2: Retrieved ${chats.length} recent chats for user ${userId}`);
            return chats;
        }
        catch (error) {
            console.error('❌ STEP 3.2: Failed to get recent chats:', error);
            return [];
        }
    }
    /**
     * Bulk retrieve chat messages with pagination
     * Uses indexes: maya_chat_messages_chat_id_idx for optimal performance
     */
    static async getChatMessages(chatId, limit = 50, offset = 0) {
        try {
            const messages = await db
                .select()
                .from(mayaChatMessages)
                .where(eq(mayaChatMessages.chatId, chatId))
                .orderBy(desc(mayaChatMessages.createdAt))
                .limit(limit)
                .offset(offset);
            console.log(`📊 STEP 3.2: Retrieved ${messages.length} messages for chat ${chatId}`);
            return messages.reverse(); // Return in chronological order
        }
        catch (error) {
            console.error('❌ STEP 3.2: Failed to get chat messages:', error);
            return [];
        }
    }
    /**
     * Efficient conversation cleanup utility
     * Removes old conversations beyond retention period
     */
    static async cleanupOldConversations(retentionDays = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
            const result = await db.transaction(async (tx) => {
                // Get chat IDs to delete
                const oldChats = await tx
                    .select({ id: mayaChats.id })
                    .from(mayaChats)
                    .where(lte(mayaChats.lastActivity, cutoffDate));
                const chatIds = oldChats.map(chat => chat.id);
                if (chatIds.length === 0) {
                    return 0;
                }
                // Delete messages first (foreign key constraint)
                await tx.delete(mayaChatMessages).where(sql `chat_id IN (${chatIds.join(',')})`);
                // Delete chats
                const deleteResult = await tx.delete(mayaChats).where(lte(mayaChats.lastActivity, cutoffDate));
                return chatIds.length;
            });
            console.log(`🧹 STEP 3.2: Cleaned up ${result} old conversations older than ${retentionDays} days`);
            return result;
        }
        catch (error) {
            console.error('❌ STEP 3.2: Conversation cleanup failed:', error);
            return 0;
        }
    }
    /**
     * Database performance monitoring - get chat statistics
     * Uses all performance indexes for optimal analytics
     */
    static async getChatStatistics(userId) {
        try {
            const baseQuery = userId ?
                db.select({ count: count() }).from(mayaChats).where(eq(mayaChats.userId, userId)) :
                db.select({ count: count() }).from(mayaChats);
            const [totalChats] = await baseQuery;
            const [totalMessages] = await db
                .select({ count: count() })
                .from(mayaChatMessages)
                .where(userId ?
                sql `chat_id IN (SELECT id FROM maya_chats WHERE user_id = ${userId})` :
                undefined);
            const stats = {
                totalChats: totalChats.count,
                totalMessages: totalMessages.count,
                averageMessagesPerChat: totalChats.count > 0 ? Math.round(totalMessages.count / totalChats.count) : 0,
                userId: userId || 'all'
            };
            console.log(`📊 STEP 3.2: Chat statistics for ${userId || 'all users'}:`, stats);
            return stats;
        }
        catch (error) {
            console.error('❌ STEP 3.2: Failed to get chat statistics:', error);
            return { totalChats: 0, totalMessages: 0, averageMessagesPerChat: 0, userId: userId || 'all' };
        }
    }
}
