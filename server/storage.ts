import {
  users,
  projects,
  aiImages,
  templates,
  subscriptions,
  onboardingData,
  selfieUploads,
  userModels,
  generatedImages,
  brandbooks,
  userProfiles,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type AiImage,
  type InsertAiImage,
  type Template,
  type InsertTemplate,
  type Subscription,
  type InsertSubscription,
  type OnboardingData,
  type InsertOnboardingData,
  type SelfieUpload,
  type InsertSelfieUpload,
  type UserModel,
  type InsertUserModel,
  type GeneratedImage,
  type InsertGeneratedImage,
  type Brandbook,
  type InsertBrandbook,
  type UserProfile,
  type InsertUserProfile,
  dashboards,
  type Dashboard,
  type UpsertDashboard,
  landingPages,
  type LandingPage,
  type UpsertLandingPage,
  userUsage,
  usageHistory,
  type UserUsage,
  type InsertUserUsage,
  type UsageHistory,
  type InsertUsageHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Project operations
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project>;
  
  // AI Images operations
  getUserAiImages(userId: string): Promise<AiImage[]>;
  createAiImage(aiImage: InsertAiImage): Promise<AiImage>;
  getAiImage(id: number): Promise<AiImage | undefined>;
  updateAiImage(id: number, updates: Partial<AiImage>): Promise<AiImage>;
  deleteAiImage(id: number): Promise<void>;
  
  // Template operations
  getActiveTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  
  // Subscription operations
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;
  
  // Onboarding operations
  getUserOnboardingData(userId: string): Promise<OnboardingData | undefined>;
  createOnboardingData(data: InsertOnboardingData): Promise<OnboardingData>;
  updateOnboardingData(userId: string, updates: Partial<OnboardingData>): Promise<OnboardingData>;
  
  // Selfie upload operations
  getUserSelfieUploads(userId: string): Promise<SelfieUpload[]>;
  createSelfieUpload(upload: InsertSelfieUpload): Promise<SelfieUpload>;
  updateSelfieUpload(id: number, updates: Partial<SelfieUpload>): Promise<SelfieUpload>;
  
  // User model operations
  getUserModel(id: number): Promise<UserModel | undefined>;
  getUserModelByUserId(userId: string): Promise<UserModel | undefined>;
  createUserModel(model: InsertUserModel): Promise<UserModel>;
  updateUserModel(userId: string, updates: Partial<UserModel>): Promise<UserModel>;
  updateUserModelById(id: number, updates: Partial<UserModel>): Promise<UserModel>;
  
  // Generated image operations
  getUserGeneratedImages(userId: string): Promise<GeneratedImage[]>;
  createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage>;
  updateGeneratedImage(id: number, updates: Partial<GeneratedImage>): Promise<GeneratedImage>;
  saveGeneratedImage(id: number, selectedUrl: string): Promise<GeneratedImage>;
  
  // Brandbook operations
  getUserBrandbook(userId: string): Promise<Brandbook | undefined>;
  createBrandbook(brandbook: InsertBrandbook): Promise<Brandbook>;
  updateBrandbook(userId: string, updates: Partial<Brandbook>): Promise<Brandbook>;
  
  // Dashboard operations
  saveDashboard(userId: string, dashboardData: any): Promise<Dashboard>;
  getDashboard(userId: string): Promise<Dashboard | undefined>;
  
  // Landing page operations
  saveLandingPage(userId: string, landingPageData: any): Promise<LandingPage>;
  getLandingPage(userId: string): Promise<LandingPage | undefined>;
  getUserLandingPages(userId: string): Promise<LandingPage[]>;
  
  // Usage tracking operations
  getUserUsage(userId: string): Promise<UserUsage | undefined>;
  createUserUsage(usage: InsertUserUsage): Promise<UserUsage>;
  updateUserUsage(userId: string, updates: Partial<UserUsage>): Promise<UserUsage>;
  createUsageHistory(history: InsertUsageHistory): Promise<UsageHistory>;
  getUserUsageHistory(userId: string, days?: number): Promise<UsageHistory[]>;
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

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async updateUserProfile(userId: string, updates: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    // First try to update existing profile
    const [existingProfile] = await db
      .update(userProfiles)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    if (existingProfile) {
      return existingProfile;
    }

    // If no existing profile, create a new one
    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        id: `profile_${userId}`,
        userId,
        ...updates,
      })
      .returning();

    return newProfile;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Project operations
  async getUserProjects(userId: string): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.userId, userId))
      .orderBy(desc(projects.createdAt));
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [newProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return newProject;
  }

  async updateProject(id: number, updates: Partial<Project>): Promise<Project> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }

  // AI Images operations
  async getUserAiImages(userId: string): Promise<AiImage[]> {
    return await db
      .select()
      .from(aiImages)
      .where(eq(aiImages.userId, userId))
      .orderBy(desc(aiImages.createdAt));
  }

  async createAiImage(aiImage: InsertAiImage): Promise<AiImage> {
    const [newAiImage] = await db
      .insert(aiImages)
      .values(aiImage)
      .returning();
    return newAiImage;
  }

  async getAiImage(id: number): Promise<AiImage | undefined> {
    const [image] = await db.select().from(aiImages).where(eq(aiImages.id, id));
    return image;
  }

  async updateAiImage(id: number, updates: Partial<AiImage>): Promise<AiImage> {
    const [image] = await db
      .update(aiImages)
      .set(updates)
      .where(eq(aiImages.id, id))
      .returning();
    return image;
  }

  async deleteAiImage(id: number): Promise<void> {
    await db.delete(aiImages).where(eq(aiImages.id, id));
  }

  // Template operations
  async getActiveTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isActive, true))
      .orderBy(desc(templates.createdAt));
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, id));
    return template;
  }

  // Subscription operations
  async getUserSubscription(userId: string): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, 'active')))
      .orderBy(desc(subscriptions.createdAt));
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }

  // Onboarding operations
  async getUserOnboardingData(userId: string): Promise<OnboardingData | undefined> {
    const [data] = await db
      .select()
      .from(onboardingData)
      .where(eq(onboardingData.userId, userId));
    return data;
  }

  async createOnboardingData(data: InsertOnboardingData): Promise<OnboardingData> {
    const [onboarding] = await db
      .insert(onboardingData)
      .values(data)
      .returning();
    return onboarding;
  }

  async updateOnboardingData(userId: string, updates: Partial<OnboardingData>): Promise<OnboardingData> {
    const [onboarding] = await db
      .update(onboardingData)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(onboardingData.userId, userId))
      .returning();
    return onboarding;
  }

  // Selfie upload operations
  async getUserSelfieUploads(userId: string): Promise<SelfieUpload[]> {
    return await db
      .select()
      .from(selfieUploads)
      .where(eq(selfieUploads.userId, userId))
      .orderBy(desc(selfieUploads.createdAt));
  }

  async createSelfieUpload(upload: InsertSelfieUpload): Promise<SelfieUpload> {
    const [selfie] = await db
      .insert(selfieUploads)
      .values(upload)
      .returning();
    return selfie;
  }

  async updateSelfieUpload(id: number, updates: Partial<SelfieUpload>): Promise<SelfieUpload> {
    const [selfie] = await db
      .update(selfieUploads)
      .set(updates)
      .where(eq(selfieUploads.id, id))
      .returning();
    return selfie;
  }

  // User model operations
  async getUserModel(id: number): Promise<UserModel | undefined> {
    const [model] = await db.select().from(userModels).where(eq(userModels.id, id));
    return model;
  }

  async getUserModelByUserId(userId: string): Promise<UserModel | undefined> {
    const [model] = await db.select().from(userModels).where(eq(userModels.userId, userId));
    return model;
  }

  async createUserModel(modelData: InsertUserModel): Promise<UserModel> {
    const [model] = await db.insert(userModels)
      .values(modelData)
      .returning();
    return model;
  }

  async updateUserModel(userId: string, updates: Partial<UserModel>): Promise<UserModel> {
    const [model] = await db.update(userModels)
      .set(updates)
      .where(eq(userModels.userId, userId))
      .returning();
    return model;
  }

  async updateUserModelById(id: number, updates: Partial<UserModel>): Promise<UserModel> {
    const [model] = await db.update(userModels)
      .set(updates)
      .where(eq(userModels.id, id))
      .returning();
    return model;
  }

  // Generated image operations
  async getUserGeneratedImages(userId: string): Promise<GeneratedImage[]> {
    return await db.select().from(generatedImages)
      .where(eq(generatedImages.userId, userId))
      .orderBy(desc(generatedImages.createdAt));
  }

  async createGeneratedImage(imageData: InsertGeneratedImage): Promise<GeneratedImage> {
    const [image] = await db.insert(generatedImages)
      .values(imageData)
      .returning();
    return image;
  }

  async updateGeneratedImage(id: number, updates: Partial<GeneratedImage>): Promise<GeneratedImage> {
    const [image] = await db.update(generatedImages)
      .set(updates)
      .where(eq(generatedImages.id, id))
      .returning();
    return image;
  }

  async saveGeneratedImage(id: number, selectedUrl: string): Promise<GeneratedImage> {
    const [image] = await db.update(generatedImages)
      .set({ selectedUrl, saved: true })
      .where(eq(generatedImages.id, id))
      .returning();
    return image;
  }

  // Brandbook operations
  async getUserBrandbook(userId: string): Promise<Brandbook | undefined> {
    const [brandbook] = await db
      .select()
      .from(brandbooks)
      .where(eq(brandbooks.userId, userId));
    return brandbook;
  }

  async createBrandbook(brandbookData: InsertBrandbook): Promise<Brandbook> {
    const [brandbook] = await db
      .insert(brandbooks)
      .values(brandbookData)
      .returning();
    return brandbook;
  }

  async updateBrandbook(userId: string, updates: Partial<Brandbook>): Promise<Brandbook> {
    const [brandbook] = await db
      .update(brandbooks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(brandbooks.userId, userId))
      .returning();
    return brandbook;
  }

  // Dashboard operations
  async saveDashboard(userId: string, dashboardData: any): Promise<Dashboard> {
    const [dashboard] = await db
      .insert(dashboards)
      .values({
        user_id: userId,
        config: dashboardData.config,
        onboarding_data: dashboardData.onboardingData,
      })
      .onConflictDoUpdate({
        target: [dashboards.userId],
        set: {
          config: dashboardData.config,
          onboarding_data: dashboardData.onboardingData,
          updated_at: new Date(),
        },
      })
      .returning();
    return dashboard;
  }

  async getDashboard(userId: string): Promise<Dashboard | undefined> {
    const [dashboard] = await db.select().from(dashboards).where(eq(dashboards.userId, userId));
    return dashboard;
  }

  // Landing page operations
  async saveLandingPage(userId: string, landingPageData: any): Promise<LandingPage> {
    const [landingPage] = await db
      .insert(landingPages)
      .values({
        userId,
        template: landingPageData.template,
        config: landingPageData.config,
        onboardingData: landingPageData.onboardingData,
        isPublished: false,
      })
      .returning();
    return landingPage;
  }

  async getLandingPage(userId: string): Promise<LandingPage | undefined> {
    const [landingPage] = await db.select().from(landingPages).where(eq(landingPages.userId, userId));
    return landingPage;
  }

  async getUserLandingPages(userId: string): Promise<LandingPage[]> {
    return await db.select().from(landingPages).where(eq(landingPages.userId, userId)).orderBy(desc(landingPages.createdAt));
  }

  // Usage tracking operations
  async getUserUsage(userId: string): Promise<UserUsage | undefined> {
    const [usage] = await db.select().from(userUsage).where(eq(userUsage.userId, userId));
    return usage;
  }

  async createUserUsage(usage: InsertUserUsage): Promise<UserUsage> {
    const [created] = await db.insert(userUsage).values(usage).returning();
    return created;
  }

  async updateUserUsage(userId: string, updates: Partial<UserUsage>): Promise<UserUsage> {
    const [updated] = await db
      .update(userUsage)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userUsage.userId, userId))
      .returning();
    return updated;
  }

  async createUsageHistory(history: InsertUsageHistory): Promise<UsageHistory> {
    const [created] = await db.insert(usageHistory).values(history).returning();
    return created;
  }

  async getUserUsageHistory(userId: string, days?: number): Promise<UsageHistory[]> {
    let query = db.select().from(usageHistory).where(eq(usageHistory.userId, userId));
    
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      query = db.select().from(usageHistory).where(and(eq(usageHistory.userId, userId), gte(usageHistory.createdAt, cutoffDate)));
    }
    
    return await query.orderBy(desc(usageHistory.createdAt));
  }
}

export const storage = new DatabaseStorage();
