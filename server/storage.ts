import {
  users,
  userProfiles,
  onboardingData,
  aiImages,
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
  type UpsertUser,
  type UserProfile,
  type InsertUserProfile,
  type OnboardingData,
  type InsertOnboardingData,
  type AiImage,
  type InsertAiImage,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Google OAuth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
  
  // User Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(data: InsertUserProfile): Promise<UserProfile>;
  
  // Onboarding operations
  getOnboardingData(userId: string): Promise<OnboardingData | undefined>;
  saveOnboardingData(data: InsertOnboardingData): Promise<OnboardingData>;
  updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData>;
  
  // AI Image operations (GALLERY ONLY - permanent S3 URLs)
  getAIImages(userId: string): Promise<AiImage[]>;
  getUserAIImages(userId: string): Promise<AiImage[]>;
  saveAIImage(data: InsertAiImage): Promise<AiImage>;
  
  // Generation Tracker operations (TEMP PREVIEW ONLY)
  createGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker>;
  updateGenerationTracker(id: number, updates: Partial<GenerationTracker>): Promise<GenerationTracker>;
  getGenerationTracker(id: number): Promise<GenerationTracker | undefined>;
  getUserGenerationTrackers(userId: string): Promise<GenerationTracker[]>;
  updateAIImage(id: number, data: Partial<AiImage>): Promise<AiImage>;
  
  // User Model operations
  getUserModel(userId: string): Promise<UserModel | undefined>;
  getUserModelByUserId(userId: string): Promise<UserModel | undefined>;
  createUserModel(data: InsertUserModel): Promise<UserModel>;
  updateUserModel(userId: string, data: Partial<UserModel>): Promise<UserModel>;
  ensureUserModel(userId: string): Promise<UserModel>;
  deleteUserModel(userId: string): Promise<void>;
  getMonthlyRetrainCount(userId: string, month: number, year: number): Promise<number>;
  
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
  createMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage>;
  
  // Photo selections operations
  savePhotoSelections(data: InsertPhotoSelection): Promise<PhotoSelection>;
  getPhotoSelections(userId: string): Promise<PhotoSelection | undefined>;
  getInspirationPhotos(userId: string): Promise<any[]>;
  
  // Sandra AI conversation operations
  getSandraConversations(userId: string): Promise<any[]>;
  saveSandraConversation(data: any): Promise<any>;
  
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

  async upsertUser(userData: UpsertUser): Promise<User> {
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
    } catch (error) {
      // If duplicate key error on email, try to return existing user
      if (error.code === '23505' && error.constraint === 'users_email_unique') {
        console.log('🔄 Duplicate email constraint, fetching existing user...');
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, userData.email));
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

  async getUserOnboardingData(userId: string): Promise<OnboardingData | undefined> {
    return this.getOnboardingData(userId);
  }

  async saveOnboardingData(data: InsertOnboardingData): Promise<OnboardingData> {
    const [saved] = await db.insert(onboardingData).values(data).returning();
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
  async getAIImages(userId: string): Promise<AIImage[]> {
    return await db
      .select()
      .from(aiImages)
      .where(eq(aiImages.userId, userId))
      .orderBy(desc(aiImages.createdAt));
  }

  async getUserAIImages(userId: string): Promise<AIImage[]> {
    // Alias for getAIImages - same functionality
    return this.getAIImages(userId);
  }

  async saveAIImage(data: InsertAIImage): Promise<AIImage> {
    // Remove project_id from data since we're not using projects table
    const { projectId, ...imageData } = data as any;
    const [saved] = await db.insert(aiImages).values(imageData).returning();
    return saved;
  }

  async createAIImage(data: InsertAIImage): Promise<AIImage> {
    // Alias for saveAIImage for compatibility
    return this.saveAIImage(data);
  }

  async updateAIImage(id: number, data: Partial<AiImage>): Promise<AiImage> {
    const [updated] = await db
      .update(aiImages)
      .set({ ...data })
      .where(eq(aiImages.id, id))
      .returning();
    return updated;
  }

  // 🔑 Generation Tracker Methods - for temp preview workflow ONLY
  async createGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker> {
    const [tracker] = await db
      .insert(generationTrackers)
      .values(data)
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

  async getUserGenerationTrackers(userId: string): Promise<GenerationTracker[]> {
    return await db
      .select()
      .from(generationTrackers)
      .where(eq(generationTrackers.userId, userId))
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

  async createUserModel(data: InsertUserModel): Promise<UserModel> {
    console.log('Creating user model with data:', data);
    const [model] = await db.insert(userModels).values(data).returning();
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

  async ensureUserModel(userId: string): Promise<UserModel> {
    // Check if user model already exists
    const existingModel = await this.getUserModel(userId);
    if (existingModel) {
      console.log('✅ User model already exists for user:', userId);
      return existingModel;
    }

    // Create new user model
    console.log('🔄 Creating new user model for user:', userId);
    const triggerWord = `user${userId}_${Date.now()}`;
    const modelData: InsertUserModel = {
      userId,
      triggerWord,
      trainingStatus: 'pending',
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
    const [saved] = await db.insert(selfieUploads).values(data).returning();
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
    const [subscription] = await db.insert(subscriptions).values(data).returning();
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
    const subscription = await this.getSubscription(userId);
    return subscription?.plan || 'free'; // Default to free if no subscription
  }

  async hasMayaAIAccess(userId: string): Promise<boolean> {
    // Maya AI (photographer) is accessible to everyone
    return true;
  }

  async hasVictoriaAIAccess(userId: string): Promise<boolean> {
    // Victoria AI (brand strategist) is locked for free users - premium only
    const usage = await this.getUserUsage(userId);
    return usage?.plan === 'admin' || usage?.plan === 'sselfie-studio'; // Admin and paid users get Victoria access
  }

  async hasSandraAIAccess(userId: string): Promise<boolean> {
    const usage = await this.getUserUsage(userId);
    return usage?.plan === 'admin' || usage?.sandraAIAccess || false;
  }

  async getGenerationLimits(userId: string): Promise<{ allowed: number; used: number }> {
    const usage = await this.getUserUsage(userId);
    const plan = await this.getUserPlan(userId);
    
    // Admin users get unlimited access
    if (plan === 'admin') {
      return {
        allowed: 999999,
        used: usage?.monthlyGenerationsUsed || 0
      };
    }
    
    // Default limits based on plan
    const defaultAllowed = plan === 'free' ? 5 : 100;
    
    return {
      allowed: usage?.monthlyGenerationsAllowed || defaultAllowed,
      used: usage?.monthlyGenerationsUsed || 0
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

  // Photoshoot session operations
  async savePhotoshootSession(data: InsertPhotoshootSession): Promise<PhotoshootSession> {
    // First deactivate any existing active sessions for this user
    await db
      .update(photoshootSessions)
      .set({ isActive: false })
      .where(eq(photoshootSessions.userId, data.userId));
    
    // Create new active session
    const [session] = await db.insert(photoshootSessions).values(data).returning();
    return session;
  }

  async getActivePhotoshootSession(userId: string): Promise<PhotoshootSession | undefined> {
    const [session] = await db
      .select()
      .from(photoshootSessions)
      .where(and(
        eq(photoshootSessions.userId, userId),
        eq(photoshootSessions.isActive, true)
      ))
      .orderBy(desc(photoshootSessions.createdAt));
    return session;
  }

  async deactivatePhotoshootSession(userId: string): Promise<void> {
    await db
      .update(photoshootSessions)
      .set({ isActive: false })
      .where(eq(photoshootSessions.userId, userId));
  }

  // Removed session methods - use existing getAIImages() instead



  // Victoria chat operations
  async createVictoriaChat(data: InsertVictoriaChat): Promise<VictoriaChat> {
    const [chat] = await db
      .insert(victoriaChats)
      .values(data)
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
      .values(data)
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
    if (!photoSelections?.selectedSelfieIds?.length) {
      return [];
    }

    // Get the actual images from AI images table
    const userImages = await this.getAIImages(userId);
    const selectedImages = userImages.filter(img => 
      photoSelections.selectedSelfieIds.includes(img.id)
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
      .values(data)
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
      .values(data)
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

  // Flatlay Collections operations for Victoria landing pages (NO STOCK PHOTOS)
  async getFlatlayCollections(): Promise<Array<{ name: string; images: string[]; description: string; }>> {
    // Return real flatlay collections from Sandra's approved image library
    return [
      {
        name: "Luxury Minimal",
        description: "Clean, minimalist flatlays with luxury products",
        images: [
          "/api/images/flatlays/luxury-minimal-1.jpg",
          "/api/images/flatlays/luxury-minimal-2.jpg",
          "/api/images/flatlays/luxury-minimal-3.jpg",
          "/api/images/flatlays/luxury-minimal-4.jpg"
        ]
      },
      {
        name: "Editorial Magazine",
        description: "Magazine-style flatlays with editorial elements",
        images: [
          "/api/images/flatlays/editorial-1.jpg",
          "/api/images/flatlays/editorial-2.jpg",
          "/api/images/flatlays/editorial-3.jpg",
          "/api/images/flatlays/editorial-4.jpg"
        ]
      },
      {
        name: "Business Professional",
        description: "Professional business flatlays for corporate brands",
        images: [
          "/api/images/flatlays/business-1.jpg",
          "/api/images/flatlays/business-2.jpg",
          "/api/images/flatlays/business-3.jpg",
          "/api/images/flatlays/business-4.jpg"
        ]
      },
      {
        name: "Wellness & Mindset",
        description: "Wellness and mindset flatlays for healing brands",
        images: [
          "/api/images/flatlays/wellness-1.jpg",
          "/api/images/flatlays/wellness-2.jpg",
          "/api/images/flatlays/wellness-3.jpg",
          "/api/images/flatlays/wellness-4.jpg"
        ]
      }
    ];
  }

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

  // Sandra AI conversation operations (minimal implementation)
  async getSandraConversations(userId: string): Promise<any[]> {
    // For now, return empty array - could implement full conversation storage later
    return [];
  }

  async saveSandraConversation(data: any): Promise<any> {
    // For now, just return the data - could implement full conversation storage later
    return data;
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
      .orderBy(desc(mayaChats.createdAt));
  }

  async createMayaChat(data: InsertMayaChat): Promise<MayaChat> {
    const [chat] = await db
      .insert(mayaChats)
      .values(data)
      .returning();
    return chat;
  }

  async getMayaChatMessages(chatId: number): Promise<MayaChatMessage[]> {
    return await db
      .select()
      .from(mayaChatMessages)
      .where(eq(mayaChatMessages.chatId, chatId))
      .orderBy(mayaChatMessages.createdAt);
  }

  async createMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage> {
    const [message] = await db
      .insert(mayaChatMessages)
      .values(data)
      .returning();
    return message;
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

  // Missing subscription methods implementation
  async getSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId));
    return subscription;
  }

  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    return this.getSubscription(userId);
  }

  async createSubscription(data: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(data)
      .returning();
    return subscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  // User plan upgrade method
  async upgradeUserToPremium(userId: string, plan: string): Promise<User> {
    console.log(`🔄 Upgrading user ${userId} to plan: ${plan}`);
    
    // Update user plan
    const [updatedUser] = await db
      .update(users)
      .set({ 
        plan: plan,
        monthlyGenerationLimit: plan === 'sselfie-studio' ? 100 : 100, // 100 generations for premium
        mayaAiAccess: true,
        victoriaAiAccess: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    // Create or update subscription record
    const existingSubscription = await this.getSubscription(userId);
    
    if (existingSubscription) {
      await this.updateSubscription(existingSubscription.id, {
        plan: plan,
        status: 'active'
      });
    } else {
      await this.createSubscription({
        userId,
        plan,
        status: 'active'
      });
    }

    console.log(`✅ User ${userId} successfully upgraded to ${plan}`);
    return updatedUser;
  }
}

export const storage = new DatabaseStorage();