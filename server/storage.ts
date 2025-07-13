import {
  users,
  onboardingData,
  aiImages,
  userModels,
  selfieUploads,
  subscriptions,
  userUsage,
  sandraConversations,
  photoshootSessions,
  savedPrompts,
  inspirationPhotos,
  type User,
  type UpsertUser,
  type OnboardingData,
  type InsertOnboardingData,
  type AIImage,
  type InsertAIImage,
  type UserModel,
  type InsertUserModel,
  type SelfieUpload,
  type InsertSelfieUpload,
  type Subscription,
  type InsertSubscription,
  type UserUsage,
  type InsertUserUsage,
  type SandraConversation,
  type InsertSandraConversation,
  type PhotoshootSession,
  type InsertPhotoshootSession,
  type SavedPrompt,
  type InsertSavedPrompt,
  type InspirationPhoto,
  type InsertInspirationPhoto,
} from "@shared/schema-simplified";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
  
  // Onboarding operations
  getOnboardingData(userId: string): Promise<OnboardingData | undefined>;
  saveOnboardingData(data: InsertOnboardingData): Promise<OnboardingData>;
  updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData>;
  
  // AI Image operations
  getAIImages(userId: string): Promise<AIImage[]>;
  getUserAIImages(userId: string): Promise<AIImage[]>;
  saveAIImage(data: InsertAIImage): Promise<AIImage>;
  updateAIImage(id: number, data: Partial<AIImage>): Promise<AIImage>;
  
  // User Model operations
  getUserModel(userId: string): Promise<UserModel | undefined>;
  getUserModelByUserId(userId: string): Promise<UserModel | undefined>;
  createUserModel(data: InsertUserModel): Promise<UserModel>;
  updateUserModel(userId: string, data: Partial<UserModel>): Promise<UserModel>;
  
  // Selfie Upload operations
  getSelfieUploads(userId: string): Promise<SelfieUpload[]>;
  saveSelfieUpload(data: InsertSelfieUpload): Promise<SelfieUpload>;
  
  // Subscription operations
  getSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  
  // Usage operations
  getUserUsage(userId: string): Promise<UserUsage | undefined>;
  createUserUsage(data: InsertUserUsage): Promise<UserUsage>;
  updateUserUsage(userId: string, data: Partial<UserUsage>): Promise<UserUsage>;
  
  // Sandra AI conversation operations
  getSandraConversations(userId: string): Promise<SandraConversation[]>;
  saveSandraConversation(data: InsertSandraConversation): Promise<SandraConversation>;
  
  // Saved prompts operations
  savePromptToLibrary(data: InsertSavedPrompt): Promise<SavedPrompt>;
  getSavedPrompts(userId: string): Promise<SavedPrompt[]>;
  
  // Inspiration photos operations
  saveInspirationPhoto(data: InsertInspirationPhoto): Promise<InspirationPhoto>;
  getInspirationPhotos(userId: string): Promise<InspirationPhoto[]>;
  deleteInspirationPhoto(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
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

  async updateAIImage(id: number, data: Partial<AIImage>): Promise<AIImage> {
    const [updated] = await db
      .update(aiImages)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiImages.id, id))
      .returning();
    return updated;
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
    // Victoria AI (brand strategist) is accessible to everyone
    return true;
  }

  async hasSandraAIAccess(userId: string): Promise<boolean> {
    const usage = await this.getUserUsage(userId);
    return usage?.sandraAIAccess || false;
  }

  async getGenerationLimits(userId: string): Promise<{ allowed: number; used: number }> {
    const usage = await this.getUserUsage(userId);
    const plan = await this.getUserPlan(userId);
    
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

  // Sandra AI conversation operations
  async getSandraConversations(userId: string): Promise<SandraConversation[]> {
    return await db
      .select()
      .from(sandraConversations)
      .where(eq(sandraConversations.userId, userId))
      .orderBy(desc(sandraConversations.createdAt));
  }

  async saveSandraConversation(data: InsertSandraConversation): Promise<SandraConversation> {
    const [conversation] = await db.insert(sandraConversations).values(data).returning();
    return conversation;
  }

  // Saved prompts operations
  async savePromptToLibrary(data: InsertSavedPrompt): Promise<SavedPrompt> {
    const [savedPrompt] = await db
      .insert(savedPrompts)
      .values(data)
      .returning();
    return savedPrompt;
  }

  async getSavedPrompts(userId: string): Promise<SavedPrompt[]> {
    return await db
      .select()
      .from(savedPrompts)
      .where(eq(savedPrompts.userId, userId))
      .orderBy(desc(savedPrompts.createdAt));
  }

  // Inspiration photos operations
  async saveInspirationPhoto(data: InsertInspirationPhoto): Promise<InspirationPhoto> {
    const [photo] = await db
      .insert(inspirationPhotos)
      .values(data)
      .returning();
    return photo;
  }

  async getInspirationPhotos(userId: string): Promise<InspirationPhoto[]> {
    return await db
      .select()
      .from(inspirationPhotos)
      .where(and(eq(inspirationPhotos.userId, userId), eq(inspirationPhotos.isActive, true)))
      .orderBy(desc(inspirationPhotos.createdAt));
  }

  async deleteInspirationPhoto(id: number, userId: string): Promise<void> {
    await db
      .update(inspirationPhotos)
      .set({ isActive: false })
      .where(and(eq(inspirationPhotos.id, id), eq(inspirationPhotos.userId, userId)));
  }
}

export const storage = new DatabaseStorage();