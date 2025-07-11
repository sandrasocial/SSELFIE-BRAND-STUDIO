import {
  users,
  onboardingData,
  aiImages,
  userModels,
  selfieUploads,
  subscriptions,
  userUsage,
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
} from "@shared/schema-simplified";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Onboarding operations
  getOnboardingData(userId: string): Promise<OnboardingData | undefined>;
  saveOnboardingData(data: InsertOnboardingData): Promise<OnboardingData>;
  updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData>;
  
  // AI Image operations
  getAIImages(userId: string): Promise<AIImage[]>;
  saveAIImage(data: InsertAIImage): Promise<AIImage>;
  
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

  // Onboarding operations
  async getOnboardingData(userId: string): Promise<OnboardingData | undefined> {
    const [data] = await db
      .select()
      .from(onboardingData)
      .where(eq(onboardingData.userId, userId));
    return data;
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

  async saveAIImage(data: InsertAIImage): Promise<AIImage> {
    const [saved] = await db.insert(aiImages).values(data).returning();
    return saved;
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
}

export const storage = new DatabaseStorage();