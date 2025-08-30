import {
  users,
  userProfiles,
  onboardingData,
  aiImages,
  generatedImages,
  generationTrackers,
  userModels,
  selfieUploads,
  subscriptions,
  userUsage,
  victoriaChats,
  photoSelections,
  landingPages,
  brandOnboarding,
  userLandingPages,
  emailCaptures,
  mayaChats,
  mayaChatMessages,
  type User,
  type InsertUser,
  type UserProfile,
  type InsertUserProfile,
  type OnboardingData,
  type InsertOnboardingData,
  type AiImage,
  type InsertAiImage,
  type GeneratedImage,
  type InsertGeneratedImage,
  type GenerationTracker,
  type InsertGenerationTracker,
  type UserModel,
  type InsertUserModel,
  type SelfieUpload,
  type InsertSelfieUpload,
  type Subscription,
  type InsertSubscription,
  type UserUsage,
  type InsertUserUsage,
  type VictoriaChat,
  type InsertVictoriaChat,
  type PhotoSelection,
  type InsertPhotoSelection,
  type LandingPage,
  type InsertLandingPage,
  type BrandOnboarding,
  type InsertBrandOnboarding,
  type UserLandingPage,
  type InsertUserLandingPage,
  type EmailCapture,
  type InsertEmailCapture,
  type MayaChat,
  type InsertMayaChat,
  type MayaChatMessage,
  type InsertMayaChatMessage,
  claudeConversations,
  claudeMessages,
  type ClaudeConversation,
  type ClaudeMessage,
  type InsertClaudeConversation,
  type InsertClaudeMessage,
} from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Google OAuth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;

  // User Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(data: InsertUserProfile): Promise<UserProfile>;

  // Onboarding operations
  getOnboardingData(userId: string): Promise<OnboardingData | undefined>;
  saveOnboardingData(data: InsertOnboardingData): Promise<OnboardingData>;
  updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData>;

  // AI Image operations (GALLERY ONLY - permanent S3 URLs) - Legacy support
  getAIImages(userId: string): Promise<AiImage[]>;
  saveAIImage(data: InsertAiImage): Promise<AiImage>;

  // Generated Images operations (NEW ENHANCED GALLERY - primary table)
  getGeneratedImages(userId: string): Promise<GeneratedImage[]>;
  saveGeneratedImage(data: InsertGeneratedImage): Promise<GeneratedImage>;
  updateGeneratedImage(id: number, data: Partial<GeneratedImage>): Promise<GeneratedImage>;

  // Generation Tracker operations (TEMP PREVIEW ONLY - for Maya chat)
  createGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker>;
  saveGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker>;
  updateGenerationTracker(id: number, updates: Partial<GenerationTracker>): Promise<GenerationTracker>;
  getGenerationTracker(id: number): Promise<GenerationTracker | undefined>;
  getUserGenerationTrackers(userId: string): Promise<GenerationTracker[]>;
  getCompletedGenerationTrackersForUser(userId: string, hoursBack: number): Promise<GenerationTracker[]>;
  getProcessingGenerationTrackers(): Promise<GenerationTracker[]>; // CRITICAL FIX: Missing interface method
  updateAIImage(id: number, data: Partial<AiImage>): Promise<AiImage>;

  // User Model operations
  getUserModel(userId: string): Promise<UserModel | undefined>;
  getUserModelByUserId(userId: string): Promise<UserModel | undefined>;
  getUserModelById(modelId: number): Promise<UserModel | undefined>;
  createUserModel(data: InsertUserModel): Promise<UserModel>;
  updateUserModel(userId: string, data: Partial<UserModel>): Promise<UserModel>;
  ensureUserModel(userId: string): Promise<UserModel>;
  deleteFailedTrainingData(userId: string): Promise<void>;
  checkTrainingStatus(userId: string): Promise<{ needsRestart: boolean; reason: string }>;
  deleteUserModel(userId: string): Promise<void>;
  getMonthlyRetrainCount(userId: string, month: number, year: number): Promise<number>;
  getAllInProgressTrainings(): Promise<UserModel[]>;

  // Selfie Upload operations
  getSelfieUploads(userId: string): Promise<SelfieUpload[]>;
  saveSelfieUpload(data: InsertSelfieUpload): Promise<SelfieUpload>;

  // Subscription operations
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;

  // User plan upgrade operations
  upgradeUserToPremium(userId: string, plan: string): Promise<User>;
  upgradeUserPlan(userId: string, plan: string): Promise<User>;

  // Usage operations
  getUserUsage(userId: string): Promise<UserUsage | undefined>;
  createUserUsage(data: InsertUserUsage): Promise<UserUsage>;
  updateUserUsage(userId: string, data: Partial<UserUsage>): Promise<UserUsage>;



  // Victoria chat operations
  createVictoriaChat(data: InsertVictoriaChat): Promise<VictoriaChat>;
  getVictoriaChats(userId: string): Promise<VictoriaChat[]>;
  getVictoriaChatsBySession(userId: string, sessionId: string): Promise<VictoriaChat[]>;

  // Maya chat operations
  getMayaChats(userId: string): Promise<MayaChat[]>;
  createMayaChat(data: InsertMayaChat): Promise<MayaChat>;
  getMayaChatMessages(chatId: number): Promise<MayaChatMessage[]>;
  // REMOVED: getAllMayaChatMessages to prevent session mixing
  createMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage>;
  saveMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage>; // CRITICAL FIX: Missing method
  updateMayaChatMessage(messageId: number, updates: Partial<{ imagePreview: string; generatedPrompt: string }>): Promise<void>;

  // Photo selections operations
  savePhotoSelections(data: InsertPhotoSelection): Promise<PhotoSelection>;
  getPhotoSelections(userId: string): Promise<PhotoSelection | undefined>;
  getInspirationPhotos(userId: string): Promise<any[]>;

  // Sandra AI conversation operations
  getSandraConversations(userId: string): Promise<any[]>;
  saveSandraConversation(data: any): Promise<any>;

  // Agent conversation operations
  saveAgentConversation(agentId: string, userId: string, userMessage: string, agentResponse: string, fileOperations: any[], conversationId?: string): Promise<ClaudeConversation>;
  getAgentConversations(agentId: string, userId: string): Promise<ClaudeMessage[]>;
  getAgentConversationHistory(agentId: string, userId: string, conversationId?: string): Promise<any[]>;
  getAllAgentConversations(userId: string): Promise<ClaudeMessage[]>;
  
  // Agent memory operations
  saveAgentMemory(agentId: string, userId: string, memoryData: any): Promise<void>;
  getAgentMemory(agentId: string, userId: string): Promise<any | null>;
  clearAgentMemory(agentId: string, userId: string): Promise<void>;

  // Landing page operations
  createLandingPage(data: InsertLandingPage): Promise<LandingPage>;
  getLandingPages(userId: string): Promise<LandingPage[]>;

  // User landing pages operations (live hosting)
  createUserLandingPage(data: InsertUserLandingPage): Promise<UserLandingPage>;
  getUserLandingPages(userId: string): Promise<UserLandingPage[]>;
  getUserLandingPageBySlug(slug: string): Promise<UserLandingPage | undefined>;
  updateUserLandingPage(id: number, data: Partial<UserLandingPage>): Promise<UserLandingPage | undefined>;

  // Email Capture operations
  captureEmail(data: InsertEmailCapture): Promise<EmailCapture>;

  // Admin operations
  setUserAsAdmin(email: string): Promise<User | null>;
  isUserAdmin(userId: string): Promise<boolean>;
  hasUnlimitedGenerations(userId: string): Promise<boolean>;

  // Admin dashboard count operations
  getUserCount(): Promise<number>;
  getAIImageCount(): Promise<number>;
  getAgentConversationCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
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
      const [user] = await db
        .update(users)
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
        .where(eq(users.id, userData.id))
        .returning();
      return user;
    }

    // If not found by ID, check by email and update that record with new ID
    if (userData.email) {
      const [userByEmail] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));

      if (userByEmail) {
        console.log('✅ Found existing user by email, updating with new Replit ID...');
        // Update the existing user record with the new Replit ID
        const [updatedUser] = await db
          .update(users)
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
          .where(eq(users.email, userData.email))
          .returning();
        return updatedUser;
      }
    }

    // User doesn't exist by ID or email, create new one
    console.log('🆕 Creating new user...');
    try {
      const [user] = await db
        .insert(users)
        .values(userData)
        .returning();
      return user;
    } catch (error: any) {
      // If duplicate key error on email, try to return existing user
      if (error?.code === '23505' && error?.constraint === 'users_email_unique') {
        console.log('🔄 Duplicate email constraint, fetching existing user...');
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, userData.email || ''));
        if (existingUser) {
          return existingUser;
        }
      }
      throw error;
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // User Profile operations
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async upsertUserProfile(data: InsertUserProfile): Promise<UserProfile> {
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
    } else {
      // Insert new profile
      const [profile] = await db
        .insert(userProfiles)
        .values(data)
        .returning();
      return profile;
    }
  }

  // Onboarding operations
  async getOnboardingData(userId: string): Promise<OnboardingData | undefined> {
    const [data] = await db
      .select()
      .from(onboardingData)
      .where(eq(onboardingData.userId, userId));
    return data;
  }



  async saveOnboardingData(data: InsertOnboardingData): Promise<OnboardingData> {
    const [saved] = await db.insert(onboardingData).values(data as any).returning();
    return saved;
  }

  async updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData> {
    const [updated] = await db
      .update(onboardingData)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(onboardingData.userId, userId))
      .returning();
    return updated;
  }

  // AI Image operations
  async getAIImages(userId: string): Promise<AiImage[]> {
    return await db
      .select()
      .from(aiImages)
      .where(eq(aiImages.userId, userId))
      .orderBy(desc(aiImages.createdAt));
  }

  async saveAIImage(data: InsertAiImage): Promise<AiImage> {
    // Remove project_id from data since we're not using projects table
    const { projectId, ...imageData } = data as any;
    const [saved] = await db.insert(aiImages).values(imageData).returning();
    return saved;
  }

  async updateAIImage(id: number, data: Partial<AiImage>): Promise<AiImage> {
    const [updated] = await db
      .update(aiImages)
      .set({ ...data })
      .where(eq(aiImages.id, id))
      .returning();
    return updated;
  }

  // Generated Images operations (NEW ENHANCED GALLERY - primary table)
  async getGeneratedImages(userId: string): Promise<GeneratedImage[]> {
    return await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt));
  }

  async saveGeneratedImage(data: InsertGeneratedImage): Promise<GeneratedImage> {
    const [saved] = await db.insert(generatedImages).values(data).returning();
    return saved;
  }

  async updateGeneratedImage(id: number, data: Partial<GeneratedImage>): Promise<GeneratedImage> {
    const [updated] = await db
      .update(generatedImages)
      .set({ ...data })
      .where(eq(generatedImages.id, id))
      .returning();
    return updated;
  }

  // 🔑 Generation Tracker Methods - for temp preview workflow ONLY
  async createGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker> {
    const [tracker] = await db
      .insert(generationTrackers)
      .values(data as any)
      .returning();
    return tracker;
  }

  async saveGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker> {
    const [tracker] = await db
      .insert(generationTrackers)
      .values(data as any)
      .returning();
    return tracker;
  }

  async updateGenerationTracker(id: number, updates: Partial<GenerationTracker>): Promise<GenerationTracker> {
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

  async getGenerationTracker(id: number): Promise<GenerationTracker | undefined> {
    const [tracker] = await db
      .select()
      .from(generationTrackers)
      .where(eq(generationTrackers.id, id));
    return tracker;
  }

  async getCompletedGenerationTrackersForUser(userId: string, hoursBack: number): Promise<GenerationTracker[]> {
    const timeThreshold = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    return await db
      .select()
      .from(generationTrackers)
      .where(
        and(
          eq(generationTrackers.userId, userId),
          eq(generationTrackers.status, 'completed'),
          gte(generationTrackers.createdAt, timeThreshold)
        )
      )
      .orderBy(desc(generationTrackers.createdAt));
  }

  async getUserGenerationTrackers(userId: string): Promise<GenerationTracker[]> {
    return await db
      .select()
      .from(generationTrackers)
      .where(eq(generationTrackers.userId, userId))
      .orderBy(desc(generationTrackers.createdAt));
  }

  async getProcessingGenerationTrackers(): Promise<GenerationTracker[]> {
    return await db
      .select()
      .from(generationTrackers)
      .where(eq(generationTrackers.status, 'processing'))
      .orderBy(desc(generationTrackers.createdAt));
  }

  // User Model operations
  async getUserModel(userId: string): Promise<UserModel | undefined> {
    const [model] = await db
      .select()
      .from(userModels)
      .where(eq(userModels.userId, userId));
    return model;
  }

  async getUserModelByUserId(userId: string): Promise<UserModel | undefined> {
    // Alias for getUserModel - same functionality
    return this.getUserModel(userId);
  }

  async getUserModelById(modelId: number): Promise<UserModel | undefined> {
    const [model] = await db
      .select()
      .from(userModels)
      .where(eq(userModels.id, modelId));
    return model;
  }

  async createUserModel(data: InsertUserModel): Promise<UserModel> {
    console.log('Creating user model with data:', data);
    const [model] = await db.insert(userModels).values([data]).returning();
    return model;
  }

  async updateUserModel(userId: string, data: Partial<UserModel>): Promise<UserModel> {
    const [updated] = await db
      .update(userModels)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userModels.userId, userId))
      .returning();
    return updated;
  }

  // 🚨 CRITICAL: Clean up failed training data completely
  async deleteFailedTrainingData(userId: string): Promise<void> {
    console.log(`🗑️ CLEANUP: Deleting all failed training data for user ${userId}`);
    
    // Delete in correct order to avoid foreign key constraints
    await db.delete(generationTrackers).where(eq(generationTrackers.userId, userId));
    await db.delete(aiImages).where(eq(aiImages.userId, userId));
    await db.delete(userModels).where(eq(userModels.userId, userId));
    
    console.log(`✅ CLEANUP: All training data deleted for user ${userId} - ready for fresh start`);
  }

  // 🔍 Check if user needs to restart training due to failure
  async checkTrainingStatus(userId: string): Promise<{ needsRestart: boolean; reason: string }> {
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

  async ensureUserModel(userId: string): Promise<UserModel> {
    // Check if user model already exists
    const existingModel = await this.getUserModel(userId);
    if (existingModel) {
      console.log('✅ User model already exists for user:', userId);
      return existingModel;
    }

    // Create new user model that requires actual training
    console.log('🔄 Creating new user model for user:', userId);
    const triggerWord = `user${userId}`;
    const modelData: InsertUserModel = {
      userId,
      triggerWord,
      trainingStatus: 'not_started', // User must complete training
      modelName: `${userId}-selfie-lora`, // Consistent with training service
    };

    return await this.createUserModel(modelData);
  }

  async getUserModelsByStatus(status: string): Promise<UserModel[]> {
    return await db
      .select()
      .from(userModels)
      .where(eq(userModels.trainingStatus, status))
      .orderBy(desc(userModels.createdAt));
  }

  async deleteUserModel(userId: string): Promise<void> {
    console.log(`🗑️ Deleting user model for user: ${userId}`);
    await db.delete(userModels).where(eq(userModels.userId, userId));
  }

  async getAllInProgressTrainings(): Promise<UserModel[]> {
    return await db
      .select()
      .from(userModels)
      .where(eq(userModels.trainingStatus, 'training'))
      .orderBy(desc(userModels.createdAt));
  }

  async getMonthlyRetrainCount(userId: string, month: number, year: number): Promise<number> {
    // Get start and end dates for the month
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    // Count models created this month (retraining creates new models)
    const models = await db
      .select()
      .from(userModels)
      .where(and(
        eq(userModels.userId, userId),
        gte(userModels.createdAt, startDate),
        lte(userModels.createdAt, endDate)
      ));

    return models.length;
  }

  // Add methods to work with actual database columns
  async getUserModelByDatabaseUserId(userId: string): Promise<any> {
    const result = await db.select().from(userModels).where(eq(userModels.userId, userId));
    return result[0];
  }

  // Selfie Upload operations
  async getSelfieUploads(userId: string): Promise<SelfieUpload[]> {
    return await db
      .select()
      .from(selfieUploads)
      .where(eq(selfieUploads.userId, userId))
      .orderBy(desc(selfieUploads.createdAt));
  }

  async saveSelfieUpload(data: InsertSelfieUpload): Promise<SelfieUpload> {
    const [saved] = await db.insert(selfieUploads).values([data]).returning();
    return saved;
  }

  // Subscription operations
  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
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

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values([data]).returning();
    return subscription;
  }

  // Usage operations
  async getUserUsage(userId: string): Promise<UserUsage | undefined> {
    const [usage] = await db
      .select()
      .from(userUsage)
      .where(eq(userUsage.userId, userId));
    return usage;
  }

  async createUserUsage(data: InsertUserUsage): Promise<UserUsage> {
    const [usage] = await db.insert(userUsage).values(data).returning();
    return usage;
  }

  async updateUserUsage(userId: string, data: Partial<UserUsage>): Promise<UserUsage> {
    const [updated] = await db
      .update(userUsage)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userUsage.userId, userId))
      .returning();
    return updated;
  }

  // Plan-based access control methods
  async getUserPlan(userId: string): Promise<string | null> {
    const user = await this.getUser(userId);
    return user?.plan || 'basic'; // Default to basic plan
  }

  async hasMayaAIAccess(userId: string): Promise<boolean> {
    // Maya AI requires trained model on both basic and full-access tiers
    const user = await this.getUser(userId);
    const userModel = await this.getUserModel(userId);
    const hasTrainedModel = userModel?.trainingStatus === 'completed';
    return hasTrainedModel || user?.role === 'admin' || false;
  }

  async hasVictoriaAIAccess(userId: string): Promise<boolean> {
    // Victoria AI requires full-access tier + trained model
    const user = await this.getUser(userId);
    const userModel = await this.getUserModel(userId);
    const hasTrainedModel = userModel?.trainingStatus === 'completed';
    const hasFullAccess = user?.plan === 'full-access' || user?.role === 'admin';
    return hasFullAccess && (hasTrainedModel || user?.role === 'admin');
  }

  async hasSandraAIAccess(userId: string): Promise<boolean> {
    const usage = await this.getUserUsage(userId);
    return usage?.plan === 'admin' || false;
  }

  async getGenerationLimits(userId: string): Promise<{ allowed: number; used: number }> {
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

  async isFreePlan(userId: string): Promise<boolean> {
    const plan = await this.getUserPlan(userId);
    return plan === 'free' || plan === null;
  }

  async isAdminUser(userId: string): Promise<boolean> {
    const plan = await this.getUserPlan(userId);
    return plan === 'admin';
  }

  // Photoshoot sessions removed - not implemented in schema

  // Removed session methods - use existing getAIImages() instead



  // Victoria chat operations
  async createVictoriaChat(data: InsertVictoriaChat): Promise<VictoriaChat> {
    const [chat] = await db
      .insert(victoriaChats)
      .values([data])
      .returning();
    return chat;
  }

  async getVictoriaChats(userId: string): Promise<VictoriaChat[]> {
    return await db
      .select()
      .from(victoriaChats)
      .where(eq(victoriaChats.userId, userId))
      .orderBy(desc(victoriaChats.createdAt));
  }

  async getVictoriaChatsBySession(userId: string, sessionId: string): Promise<VictoriaChat[]> {
    return await db
      .select()
      .from(victoriaChats)
      .where(and(eq(victoriaChats.userId, userId), eq(victoriaChats.sessionId, sessionId)))
      .orderBy(victoriaChats.createdAt);
  }

  // Photo selections operations
  async savePhotoSelections(data: InsertPhotoSelection): Promise<PhotoSelection> {
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

  async getPhotoSelections(userId: string): Promise<PhotoSelection | undefined> {
    const [selection] = await db
      .select()
      .from(photoSelections)
      .where(eq(photoSelections.userId, userId));
    return selection;
  }

  async getInspirationPhotos(userId: string): Promise<any[]> {
    // Get user's selected photos from photo selections
    const photoSelections = await this.getPhotoSelections(userId);
    if (!photoSelections || !Array.isArray((photoSelections as any).selectedSelfieIds) || !(photoSelections as any).selectedSelfieIds.length) {
      return [];
    }

    // Get the actual images from AI images table
    const userImages = await this.getAIImages(userId);
    const selectedImages = userImages.filter(img => 
      (photoSelections as any).selectedSelfieIds.includes(img.id)
    );

    return selectedImages.map(img => ({
      id: img.id,
      url: img.imageUrl,
      description: img.prompt || 'Selected inspiration photo'
    }));
  }

  // Landing page operations
  async createLandingPage(data: InsertLandingPage): Promise<LandingPage> {
    const [page] = await db
      .insert(landingPages)
      .values([data])
      .returning();
    return page;
  }

  async getLandingPages(userId: string): Promise<LandingPage[]> {
    return await db
      .select()
      .from(landingPages)
      .where(eq(landingPages.userId, userId))
      .orderBy(desc(landingPages.createdAt));
  }

  // Landing pages operations
  async createUserLandingPage(data: InsertUserLandingPage): Promise<UserLandingPage> {
    const [page] = await db
      .insert(userLandingPages)
      .values([data])
      .returning();
    return page;
  }

  async getUserLandingPages(userId: string): Promise<UserLandingPage[]> {
    return await db
      .select()
      .from(userLandingPages)
      .where(eq(userLandingPages.userId, userId))
      .orderBy(desc(userLandingPages.updatedAt));
  }

  async getUserLandingPageBySlug(slug: string): Promise<UserLandingPage | undefined> {
    const [page] = await db
      .select()
      .from(userLandingPages)
      .where(eq(userLandingPages.slug, slug));
    return page;
  }

  async updateUserLandingPage(id: number, data: Partial<UserLandingPage>): Promise<UserLandingPage | undefined> {
    const [updated] = await db
      .update(userLandingPages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userLandingPages.id, id))
      .returning();
    return updated;
  }

  // Email Capture operations

  // Brand onboarding operations
  async saveBrandOnboarding(data: InsertBrandOnboarding): Promise<BrandOnboarding> {
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

  async getBrandOnboarding(userId: string): Promise<BrandOnboarding | undefined> {
    const [data] = await db
      .select()
      .from(brandOnboarding)
      .where(eq(brandOnboarding.userId, userId));
    return data;
  }

  // Agent Conversations (unified with claudeConversations/claudeMessages)
  async saveAgentConversation(agentId: string, userId: string, userMessage: string, agentResponse: string, fileOperations?: any[], conversationId?: string): Promise<ClaudeConversation> {
    // Create or get conversation - USE STABLE ID per agent per user
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
        messageCount: sql`${claudeConversations.messageCount} + 2`
      })
      .where(eq(claudeConversations.conversationId, convId));
      
    return conversation;
  }

  async getAgentConversations(agentId: string, userId: string): Promise<ClaudeMessage[]> {
    // Get all conversations for this agent and user
    const conversations = await db.select()
      .from(claudeConversations)
      .where(and(
        eq(claudeConversations.agentName, agentId),
        eq(claudeConversations.userId, userId)
      ))
      .orderBy(desc(claudeConversations.lastMessageAt));
    
    if (conversations.length === 0) return [];
    
    // Get messages from the most recent conversation
    const messages = await db.select()
      .from(claudeMessages)
      .where(eq(claudeMessages.conversationId, conversations[0].conversationId))
      .orderBy(claudeMessages.timestamp);
      
    return messages;
  }

  async getAgentConversationHistory(agentId: string, userId: string, conversationId?: string): Promise<any[]> {
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
      .where(and(
        eq(claudeConversations.agentName, agentId),
        eq(claudeConversations.userId, userId)
      ))
      .orderBy(desc(claudeConversations.lastMessageAt));
    
    if (conversations.length === 0) return [];
    
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

  async getAllAgentConversations(userId: string): Promise<ClaudeMessage[]> {
    // Get all agent conversations for this user
    const conversations = await db.select()
      .from(claudeConversations)
      .where(eq(claudeConversations.userId, userId))
      .orderBy(desc(claudeConversations.lastMessageAt));
    
    if (conversations.length === 0) return [];
    
    // Get messages from all conversations
    const conversationIds = conversations.map(c => c.conversationId);
    const messages = await db.select()
      .from(claudeMessages)
      .where(sql`${claudeMessages.conversationId} = ANY(${conversationIds})`)
      .orderBy(claudeMessages.timestamp);
      
    return messages;
  }

  // Sandra AI conversation operations (minimal implementation)
  async getSandraConversations(userId: string): Promise<any[]> {
    // For now, return empty array - could implement full conversation storage later
    return [];
  }

  async saveSandraConversation(data: any): Promise<any> {
    // For now, just return the data - could implement full conversation storage later
    return data;
  }

  // Agent memory operations - Complete implementation
  async saveAgentMemory(agentId: string, userId: string, memoryData: any): Promise<void> {
    try {
      // ENHANCED: Include full conversation history in memory data
      const enhancedMemoryData = {
        ...memoryData,
        conversationHistory: memoryData.conversationHistory || [],
        lastSaved: new Date().toISOString()
      };
      
      // Save memory as special conversation entry
      await this.saveAgentConversation(
        agentId,
        userId,
        '**CONVERSATION_MEMORY**',
        JSON.stringify(enhancedMemoryData),
        []
      );
      console.log(`💾 Agent memory saved for ${agentId} with ${enhancedMemoryData.conversationHistory?.length || 0} conversation messages`);
    } catch (error) {
      console.error('Failed to save agent memory:', error);
      throw error;
    }
  }

  async getAgentMemory(agentId: string, userId: string): Promise<any | null> {
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
        const memoryResponse = conversations.find(msg => 
          msg.role === 'assistant' && 
          Math.abs(
            (msg.timestamp ? new Date(msg.timestamp).getTime() : 0) - 
            (memoryEntry.timestamp ? new Date(memoryEntry.timestamp).getTime() : 0)
          ) < 1000
        );
        
        if (memoryResponse && memoryResponse.content) {
          return JSON.parse(memoryResponse.content);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to retrieve agent memory:', error);
      return null;
    }
  }

  async clearAgentMemory(agentId: string, userId: string): Promise<void> {
    try {
      // Find memory conversation
      const conversation = await db.query.claudeConversations.findFirst({
        where: and(
          eq(claudeConversations.agentName, agentId),
          eq(claudeConversations.userId, userId)
        )
      });
      
      if (conversation) {
        // Delete memory messages (where content is '**CONVERSATION_MEMORY**')
        await db.delete(claudeMessages)
          .where(and(
            eq(claudeMessages.conversationId, conversation.conversationId),
            eq(claudeMessages.content, '**CONVERSATION_MEMORY**')
          ));
      }
      
      console.log(`🧹 Agent memory cleared for ${agentId}`);
    } catch (error) {
      console.error('Failed to clear agent memory:', error);
      throw error;
    }
  }

  // Email Capture operations
  async captureEmail(data: InsertEmailCapture): Promise<EmailCapture> {
    const [capture] = await db
      .insert(emailCaptures)
      .values(data)
      .returning();
    return capture;
  }

  // Maya chat operations
  async getMayaChats(userId: string): Promise<MayaChat[]> {
    return await db
      .select()
      .from(mayaChats)
      .where(eq(mayaChats.userId, userId))
      .orderBy(desc(mayaChats.lastActivity || mayaChats.createdAt));
  }

  // Get Maya chats by category for organized display
  async getMayaChatsByCategory(userId: string): Promise<{ [key: string]: MayaChat[] }> {
    const chats = await this.getMayaChats(userId);
    
    const categorizedChats: { [key: string]: MayaChat[] } = {
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
      } else {
        categorizedChats["Style Consultation"].push(chat);
      }
    });

    return categorizedChats;
  }

  async createMayaChat(data: InsertMayaChat): Promise<MayaChat> {
    const [chat] = await db
      .insert(mayaChats)
      .values(data)
      .returning();
    return chat;
  }

  // User plan upgrade operations
  async upgradeUserToPremium(userId: string, plan: string): Promise<User> {
    return this.upgradeUserPlan(userId, plan);
  }

  async upgradeUserPlan(userId: string, plan: string): Promise<User> {
    // Determine the plan settings based on new pricing structure
    let planSettings: Partial<User>;
    
    if (plan === 'basic') {
      planSettings = {
        plan: 'basic',
        monthlyGenerationLimit: 30,
        mayaAiAccess: true,
        victoriaAiAccess: false,
        // flatlayLibraryAccess and websiteBuilderAccess removed - not in schema
      };
    } else if (plan === 'full-access') {
      planSettings = {
        plan: 'full-access',
        monthlyGenerationLimit: 100,
        mayaAiAccess: true,
        victoriaAiAccess: true,
        // flatlayLibraryAccess and websiteBuilderAccess removed - not in schema
      };
    } else {
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

  async getMayaChatMessages(chatId: number): Promise<MayaChatMessage[]> {
    const messages = await db
      .select()
      .from(mayaChatMessages)
      .where(eq(mayaChatMessages.chatId, chatId))
      .orderBy(mayaChatMessages.createdAt);
    
    // Parse JSON fields for frontend compatibility
    return messages.map(msg => ({
      ...msg,
      imagePreview: msg.imagePreview ? JSON.parse(msg.imagePreview) : null,
      conceptCards: msg.conceptCards ? msg.conceptCards : null, // ENHANCED: conceptCards now stored as JSONB
      quickButtons: msg.quickButtons ? JSON.parse(msg.quickButtons) : null,
    }));
  }

  // REMOVED: getAllMayaChatMessages method to prevent session mixing
  // Use getMayaChatMessages(chatId) for session-specific loading

  async createMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage> {
    console.log(`📝 MAYA MESSAGE: Saving ${data.role} message with concept cards: ${data.conceptCards ? 'YES' : 'NO'}`);
    const [message] = await db
      .insert(mayaChatMessages)
      .values(data)
      .returning();
    return message;
  }

  // CRITICAL FIX: Missing saveMayaChatMessage method causing GenerationCompletionMonitor failure
  async saveMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage> {
    return this.createMayaChatMessage(data);
  }



  async updateMayaChatMessage(messageId: number, data: Partial<{ imagePreview: string; generatedPrompt: string }>): Promise<void> {
    await db
      .update(mayaChatMessages)
      .set(data)
      .where(eq(mayaChatMessages.id, messageId));
  }

  // Get generation tracker by prediction ID for website generator
  async getGenerationTrackerByPredictionId(predictionId: string): Promise<GenerationTracker | undefined> {
    const [tracker] = await db
      .select()
      .from(generationTrackers)
      .where(eq(generationTrackers.predictionId, predictionId));
    return tracker;
  }

  // Admin operations
  async setUserAsAdmin(email: string): Promise<User | null> {
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
    } catch (error) {
      console.error('Error setting user as admin:', error);
      return null;
    }
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId));
      return user?.role === 'admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async hasUnlimitedGenerations(userId: string): Promise<boolean> {
    try {
      const [user] = await db
        .select({ 
          role: users.role,
          monthlyGenerationLimit: users.monthlyGenerationLimit 
        })
        .from(users)
        .where(eq(users.id, userId));
      return user?.role === 'admin' || user?.monthlyGenerationLimit === -1;
    } catch (error) {
      console.error('Error checking unlimited generations:', error);
      return false;
    }
  }



  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  // Additional storage methods can be added here as needed

  // Admin dashboard count operations
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(users);
    return Number(result[0]?.count || 0);
  }

  async getAIImageCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(aiImages);
    return Number(result[0]?.count || 0);
  }

  async getAgentConversationCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(claudeMessages);
    return Number(result[0]?.count || 0);
  }
}

export const storage = new DatabaseStorage();