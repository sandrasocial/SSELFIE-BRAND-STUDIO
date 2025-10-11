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

  userStyleMemory,
  agentConversations,
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
  generatedVideos,
  type GeneratedVideo,
  type InsertGeneratedVideo,
  videoStoryboards,
  type VideoStoryboard,
  type InsertVideoStoryboard,
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

  claudeConversations,
  claudeMessages,
  type ClaudeConversation,
  type ClaudeMessage,
  trainingRuns,
  loraWeights,
  type TrainingRun,
  type InsertTrainingRun,
  type LoraWeight,
  type InsertLoraWeight,
  // New hybrid backend types
  conversations,
  messages,
  conversationSummaries,
  conceptCards,
  type Conversation,
  // type InsertConversation,
  type Message,
  // type InsertMessage,
  type ConversationSummary,
  // type InsertConversationSummary,
  type ConceptCard,
  // type InsertConceptCard,
  // Brand Assets types
  brandAssets,
  imageVariants,
  mayaChats,
  mayaChatMessages,
  mayaProfile,
  mayaImages,
  mayaConcepts,
  type BrandAsset,
  // type InsertBrandAsset,
  type ImageVariant,
  // type InsertImageVariant,
  type MayaChat,
  type InsertMayaChat,
  type MayaChatMessage,
  type InsertMayaChatMessage,
  type MayaProfile,
  type InsertMayaProfile,
  type MayaImage,
  type InsertMayaImage,
  type MayaConcept,
  type InsertMayaConcept,
} from "../shared/schema.js";

// Maya imports now available from main schema (emergency deployment fix)
import { db } from "./drizzle.js";
/// <reference path="types/global.d.ts" />
import { eq, and, or, desc, asc, gte, lte, sql } from "drizzle-orm";
import { type MayaChatCreateInput } from '../shared/types/chat.js';

// Utility: Default user fields for onboarding/business logic
function getDefaultUserFields(overrides: any = {}): InsertUser {
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

// Interface for storage operations
export interface IStorage {
  // User operations (Stack Auth integration)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: InsertUser): Promise<User>; // For Stack Auth sync
  linkStackAuthId(existingUserId: string, stackAuthId: string): Promise<User>; // Link existing user to Stack Auth
  getUserByStackAuthId(stackAuthId: string): Promise<User | undefined>; // Get user by Stack Auth ID
  getAllUsers(): Promise<User[]>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
  syncStackAuthUser(stackUser: { id: string; primaryEmail?: string; displayName?: string; profileImageUrl?: string }): Promise<User>;
  // 🔄 PHASE 3: Retraining access management
  updateUserRetrainingAccess(userId: string, retrainingData: { hasRetrainingAccess: boolean; retrainingSessionId: string; retrainingPaidAt: Date }): Promise<User>;

  // User Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(data: InsertUserProfile): Promise<UserProfile>;

  // Onboarding operations
  getOnboardingData(userId: string): Promise<OnboardingData | undefined>;
  saveOnboardingData(data: InsertOnboardingData): Promise<OnboardingData>;
  updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData>;

  // AI Image operations (GALLERY ONLY - permanent S3 URLs) - Legacy support
  getAIImages(userId: string): Promise<AiImage[]>;
  getAIImage(userId: string, imageId: number): Promise<AiImage | undefined>; // P3-C: Get single AI image
  saveAIImage(data: InsertAiImage): Promise<AiImage>;

  // Generated Images operations (NEW ENHANCED GALLERY - primary table)
  getGeneratedImages(userId: string): Promise<GeneratedImage[]>;
  saveGeneratedImage(data: InsertGeneratedImage): Promise<GeneratedImage>;
  updateGeneratedImage(id: number, data: Partial<GeneratedImage>): Promise<GeneratedImage>;

  // Generated Videos operations (VEO 3 video generation)
  getGeneratedVideos(userId: string): Promise<GeneratedVideo[]>;
  saveGeneratedVideo(data: InsertGeneratedVideo): Promise<GeneratedVideo>;
  updateGeneratedVideo(id: number, data: Partial<GeneratedVideo>): Promise<GeneratedVideo>;
  getGeneratedVideoByJobId(jobId: string): Promise<GeneratedVideo | undefined>;
  getUserVideosByStatus(userId: string, status?: string): Promise<GeneratedVideo[]>;

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
  // 🔥 BULLETPROOF: Get user model with aggressive Stack Auth ID and email linking
  getUserModelByStackAuthAndEmail(stackAuthId: string, email: string): Promise<{ user: User | undefined; model: UserModel | undefined }>;
  createUserModel(data: InsertUserModel): Promise<UserModel>;
  updateUserModel(userId: string, data: Partial<UserModel>): Promise<UserModel>;
  ensureUserModel(userId: string): Promise<UserModel>;
  deleteFailedTrainingData(userId: string): Promise<void>;
  checkTrainingStatus(userId: string): Promise<{ needsRestart: boolean; reason: string }>;
  deleteUserModel(userId: string): Promise<void>;
  getMonthlyRetrainCount(userId: string, month: number, year: number): Promise<number>;
  getAllInProgressTrainings(): Promise<UserModel[]>;
  getAllCompletedTrainings(): Promise<UserModel[]>; // ✅ LORA MIGRATION: Get completed training users

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
  getMayaChat(chatId: string, userId: string): Promise<MayaChat | undefined>;
  createMayaChat(userId: string, data: MayaChatCreateInput): Promise<string>;
  saveMayaChat(userId: string, data: { message: string; response: string; conceptCards: Array<Record<string, unknown>>; context: Record<string, unknown> }): Promise<string>;
  getMayaChatMessages(chatId: string, userId: string): Promise<MayaChatMessage[]>;
  saveMayaMessage(chatId: string, userId: string, data: { message: string; role: string; conceptCards?: any[] }): Promise<string>;
  updateMayaMessage(messageId: string, userId: string, updates: { content: string }): Promise<void>;
  // REMOVED: getAllMayaChatMessages to prevent session mixing
  createMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage>;
  saveMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage>; // CRITICAL FIX: Missing method
  updateMayaChatMessage(messageId: number, updates: Partial<{ imagePreview: string; generatedPrompt: string }>): Promise<void>;
  getMayaConceptById(conceptId: string): Promise<Record<string, unknown> | undefined>; // CRITICAL FIX: Add missing concept retrieval method

  // Photo selections operations
  savePhotoSelections(data: InsertPhotoSelection): Promise<PhotoSelection>;
  getPhotoSelections(userId: string): Promise<PhotoSelection | undefined>;
  getInspirationPhotos(userId: string): Promise<Array<{ id: number; url: string; description: string }>>;

  // Sandra AI conversation operations
  getSandraConversations(userId: string): Promise<unknown[]>;
  saveSandraConversation(data: unknown): Promise<unknown>;

  // Agent conversation operations
  saveAgentConversation(agentId: string, userId: string, userMessage: string, agentResponse: string, fileOperations: unknown[], conversationId?: string): Promise<ClaudeConversation>;
  getAgentConversations(agentId: string, userId: string): Promise<ClaudeMessage[]>;
  getAgentConversationHistory(agentId: string, userId: string, conversationId?: string): Promise<Array<{ role: string; content: string }>>;
  getAllAgentConversations(userId: string): Promise<ClaudeMessage[]>;
  
  // Agent memory operations
  saveAgentMemory(agentId: string, userId: string, memoryData: unknown): Promise<void>;
  getAgentMemory(agentId: string, userId: string): Promise<Record<string, unknown> | null>;
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

  // ✅ RESTORED: LoRA Weight operations
  storeLoRAWeights(data: {
    userId: string;
    trainingId: string;
    weightsUrl: string;
    checksum: string;
    fileSize: number;
    extractedAt: Date;
  }): Promise<void>;
  getLoRAWeights(userId: string): Promise<{ s3Bucket: string; s3Key: string } | undefined>;

  // LoRA Training and Weights Management
  createTrainingRun(trainingRun: InsertTrainingRun): Promise<TrainingRun>;
  getTrainingRun(id: number): Promise<TrainingRun | undefined>;
  getTrainingRunByTrainingId(trainingId: string): Promise<TrainingRun | undefined>;
  updateTrainingRun(id: number, updates: Partial<TrainingRun>): Promise<TrainingRun>;
  listUserTrainingRuns(userId: string): Promise<TrainingRun[]>;
  
  createLoraWeight(weight: InsertLoraWeight): Promise<LoraWeight>;
  getLoraWeight(id: number): Promise<LoraWeight | undefined>;
  getUserActiveLoraWeight(userId: string): Promise<LoraWeight | undefined>;
  listUserLoraWeights(userId: string): Promise<LoraWeight[]>;
  updateLoraWeight(id: number, updates: Partial<LoraWeight>): Promise<LoraWeight>;
  setActiveLoraWeight(userId: string, weightId: number): Promise<void>;

  // Admin operations
  setUserAsAdmin(email: string): Promise<User | null>;
  isUserAdmin(userId: string): Promise<boolean>;
  hasUnlimitedGenerations(userId: string): Promise<boolean>;

  // Admin dashboard count operations
  getUserCount(): Promise<number>;
  getAIImageCount(): Promise<number>;
  getAgentConversationCount(): Promise<number>;

  // HYBRID BACKEND ARCHITECTURE: New conversation and concept card operations
  // Conversation operations
  createConversation(data: any): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string, agentName?: string): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation>;
  archiveConversation(id: string): Promise<Conversation>;

  // Message operations
  createMessage(data: any): Promise<Message>;
  getConversationMessages(conversationId: string, limit?: number): Promise<Message[]>;
  getLastMessages(conversationId: string, count: number): Promise<Message[]>;
  getMessagesAfter(conversationId: string, messageId: string): Promise<Message[]>;

  // Conversation summary operations
  upsertConversationSummary(data: any): Promise<ConversationSummary>;
  getConversationSummary(conversationId: string): Promise<ConversationSummary | undefined>;
  updateConversationSummary(conversationId: string, summary: string, lastMessageId: string, messageCount: number): Promise<ConversationSummary>;

  // Concept card operations (with idempotency)
  createConceptCard(data: any): Promise<ConceptCard>;
  getConceptCard(id: string): Promise<ConceptCard | undefined>;
  getConceptCardByClientId(userId: string, clientId: string): Promise<ConceptCard | undefined>;
  getUserConceptCards(userId: string, conversationId?: string): Promise<ConceptCard[]>;
  updateConceptCard(id: string, updates: Partial<ConceptCard>): Promise<ConceptCard>;
  updateConceptCardGeneration(id: string, generatedImages: unknown[], isLoading: boolean, isGenerating: boolean, hasGenerated: boolean): Promise<ConceptCard>;
  deleteConceptCard(id: string): Promise<void>;

  // Brand Assets operations (P3-C feature)
  getBrandAssets(userId: string): Promise<BrandAsset[]>;
  saveBrandAsset(data: any): Promise<BrandAsset>;
  deleteBrandAsset(assetId: number, userId: string): Promise<boolean>;
  getBrandAsset(assetId: number, userId: string): Promise<BrandAsset | undefined>;

  // Image Variants operations (for non-destructive placement)
  saveImageVariant(data: any): Promise<ImageVariant>;
  getImageVariants(userId: string, originalImageId?: number): Promise<ImageVariant[]>;
  getImageVariant(variantId: number, userId: string): Promise<ImageVariant | undefined>;
  updateImageVariant(variantId: number, updates: Partial<ImageVariant>): Promise<ImageVariant>;

  // Maya Profile operations
  getMayaProfile(userId: string): Promise<MayaProfile | undefined>;
  insertMayaProfile(data: InsertMayaProfile): Promise<MayaProfile>;
  updateMayaProfile(userId: string, updates: Partial<MayaProfile>): Promise<MayaProfile>;

  // Maya Images operations
  insertMayaImage(data: InsertMayaImage): Promise<MayaImage>;

  // Maya Concepts operations
  insertMayaConcept(data: InsertMayaConcept): Promise<MayaConcept>;

  // Maya Profile sync operations
  ensureMayaProfile(userId: string): Promise<MayaProfile>;
}

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // Link existing user account to Stack Auth ID (safer approach - preserve original ID)
  async linkStackAuthId(existingUserId: string, stackAuthId: string): Promise<User> {
    
    // Add Stack Auth ID to existing user while preserving original ID and all relationships
    const [linkedUser] = await db
      .update(users)
      .set({
        stackAuthId: stackAuthId, // Store Stack Auth ID in separate column
        updatedAt: new Date(),
        lastLoginAt: new Date()
      } as any)
      .where(eq(users.id, existingUserId))
      .returning();
    
    // 🔥 CRITICAL FIX: Ensure Maya profile and user model exist for linked users
    await this.ensureMayaProfile(linkedUser.id);
    await this.ensureUserModel(linkedUser.id);
    
    return linkedUser;
  }
  
  // Get user by Stack Auth ID (for linked accounts)
  async getUserByStackAuthId(stackAuthId: string): Promise<User | undefined> {
    // Import cache inside function to avoid circular dependencies
    console.log(`🔍 USER LOOKUP: Starting getUserByStackAuthId for ${stackAuthId.substring(0, 8)}...`);
    const { userCache } = await import('./_utils/user-cache.js');
    
    // Check cache first
    const cached = userCache.get(stackAuthId);
    if (cached !== null) {
      console.log(`🚀 USER CACHE: Cache ${cached ? 'HIT' : 'HIT (null)'} for ${stackAuthId.substring(0, 8)}...`);
      return cached;
    }
    
    console.log(`🔍 USER CACHE: Cache MISS for ${stackAuthId.substring(0, 8)}..., querying database`);
    
    // Cache miss - query database
    console.log(`💾 USER CACHE: Cache miss for ${stackAuthId.substring(0, 8)}, querying database`);
    const [user] = await db.select().from(users).where(eq(users.stackAuthId, stackAuthId));
    
    // Store in cache
    userCache.set(stackAuthId, user);
    console.log(`✅ USER CACHE: Stored ${user ? 'user' : 'null'} for ${stackAuthId.substring(0, 8)}`);
    
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const finalUserData = getDefaultUserFields(userData) as any;
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
      } as any)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    return allUsers;
  }

  async upsertUser(userData: InsertUser): Promise<User> {
    const finalUserData = getDefaultUserFields(userData) as any;
    // Special admin setup for ssa@ssasocial.com
    if (finalUserData.email === 'ssa@ssasocial.com') {
      finalUserData.role = 'admin';
      finalUserData.monthlyGenerationLimit = -1; // Unlimited
      finalUserData.plan = 'sselfie-studio';
     
      finalUserData.mayaAiAccess = true;
     
      finalUserData.victoriaAiAccess = true;
    }
    
    let user: User;
    
    // First try to find existing user by ID
    const existingUser = await this.getUser(finalUserData.id);
    if (existingUser) {
      const [updatedUser] = await db
        .update(users)
        .set({
          ...finalUserData,
          updatedAt: new Date(),
        } as any)
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
          } as any)
          .where(eq(users.email, finalUserData.email))
          .returning();
        user = updatedUser;
      } else {
        // User doesn't exist by ID or email, create new one
        try {
          const [newUser] = await db
            .insert(users)
            .values(finalUserData)
            .returning();
          user = newUser;
        } catch (error: unknown) {
          // If duplicate key error on email, try to return existing user
          const e = error as { code?: string; constraint?: string };
          if (e?.code === '23505' && e?.constraint === 'users_email_unique') {
            const [existingUser] = await db
              .select()
              .from(users)
              .where(eq(users.email, finalUserData.email || ''));
            if (existingUser) {
              user = existingUser;
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }
    } else {
      throw new Error('Cannot create user without email');
    }

    // 🔥 CRITICAL FIX: Auto-create Maya profile for every new user
    await this.ensureMayaProfile(user.id);
    
    return user;
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Stack Auth user synchronization
  async syncStackAuthUser(stackUser: { id: string; primaryEmail?: string; displayName?: string; profileImageUrl?: string }): Promise<User> {
   
    const userData: InsertUser = {
      id: stackUser.id,
      email: stackUser.primaryEmail || '',
      displayName: stackUser.displayName,
      profileImageUrl: stackUser.profileImageUrl,
      firstName: stackUser.displayName?.split(' ')[0],
      lastName: stackUser.displayName?.split(' ').slice(1).join(' '),
    } as any;
    
    return this.upsertUser(userData);
  }

  // 🔄 PHASE 3: Update user retraining access after payment
  async updateUserRetrainingAccess(userId: string, retrainingData: { hasRetrainingAccess: boolean; retrainingSessionId: string; retrainingPaidAt: Date }): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        hasRetrainingAccess: retrainingData.hasRetrainingAccess,
        retrainingSessionId: retrainingData.retrainingSessionId,
        retrainingPaidAt: retrainingData.retrainingPaidAt,
        updatedAt: new Date() 
      } as any)
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
        .set({ ...data, updatedAt: new Date() } as any)
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
    const [saved] = await db.insert(onboardingData).values(data).returning();
    return saved;
  }

  async updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData> {
    const [updated] = await db
      .update(onboardingData)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(onboardingData.userId, userId))
      .returning();
    return updated;
  }

  // AI Image operations
  async getAIImages(userId: string): Promise<AiImage[]> {
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

  async getUserAIImages(userId: string): Promise<AiImage[]> {
    return this.getAIImages(userId);
  }

  async saveAIImage(data: InsertAiImage): Promise<AiImage> {
    // Remove project_id from data since we're not using projects table
    const imageData = { ...(data as InsertAiImage) } as InsertAiImage & Record<string, unknown>;
    delete (imageData as Record<string, unknown>)['projectId'];
    const [saved] = await db.insert(aiImages).values(imageData as InsertAiImage).returning();
    return saved;
  }

  async getAIImage(userId: string, imageId: number): Promise<AiImage | undefined> {
    const [image] = await db
      .select()
      .from(aiImages)
      .where(and(eq(aiImages.id, imageId), eq(aiImages.userId, userId)));
    return image;
  }

  async deleteAIImage(userId: string, imageId: number): Promise<boolean> {
    const result = await db
      .delete(aiImages)
      .where(and(eq(aiImages.id, imageId), eq(aiImages.userId, userId)));
    // drizzle returns object; presence of a result is enough
    return Boolean((result as unknown as { rowCount?: number }).rowCount ?? true);
  }
  async updateAIImage(id: number, data: Partial<AiImage>): Promise<AiImage> {
    const [updated] = await db
      .update(aiImages)
      .set({ ...data } as any)
      .where(eq(aiImages.id, id))
      .returning();
    return updated;
  }

  async updateAIImageByPredictionId(predictionId: string, data: Partial<AiImage>): Promise<AiImage | null> {
    const [updated] = await db
      .update(aiImages)
      .set({ ...data } as any)
      .where(eq(aiImages.predictionId, predictionId))
      .returning();
    return updated || null;
  }

  // Generated Images operations (NEW ENHANCED GALLERY - primary table)
  async getGeneratedImages(userId: string): Promise<GeneratedImage[]> {
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

  async saveGeneratedImage(data: InsertGeneratedImage): Promise<GeneratedImage> {
    const [saved] = await db.insert(generatedImages).values(data).returning();
    return saved;
  }

  async updateGeneratedImage(id: number, data: Partial<GeneratedImage>): Promise<GeneratedImage> {
    const [updated] = await db
      .update(generatedImages)
      .set({ ...data } as any)
      .where(eq(generatedImages.id, id))
      .returning();
    return updated;
  }

  // Generated Videos operations (VEO 3 video generation)
  async getGeneratedVideos(userId: string): Promise<GeneratedVideo[]> {
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

  async saveGeneratedVideo(data: InsertGeneratedVideo): Promise<GeneratedVideo> {
    const [saved] = await db.insert(generatedVideos).values(data).returning();
    return saved;
  }

  async updateGeneratedVideo(id: number, data: Partial<GeneratedVideo>): Promise<GeneratedVideo> {
    const [updated] = await db
      .update(generatedVideos)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(generatedVideos.id, id))
      .returning();
    return updated;
  }

  async getGeneratedVideoByJobId(jobId: string): Promise<GeneratedVideo | undefined> {
    const [video] = await db
      .select()
      .from(generatedVideos)
      .where(eq(generatedVideos.jobId, jobId));
    return video;
  }

  async getUserVideosByStatus(userId: string, status?: string): Promise<GeneratedVideo[]> {
    if (status) {
      return await db
        .select()
        .from(generatedVideos)
        .where(and(
          eq(generatedVideos.userId, userId),
          eq(generatedVideos.status, status)
        ))
        .orderBy(desc(generatedVideos.createdAt));
    }
    
    return await db
      .select()
      .from(generatedVideos)
      .where(eq(generatedVideos.userId, userId))
      .orderBy(desc(generatedVideos.createdAt));
  }

  // 🔑 Generation Tracker Methods - for temp preview workflow ONLY
  async createGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker> {
    const [tracker] = await db
      .insert(generationTrackers)
      .values(data)
      .returning();
    return tracker;
  }

  async saveGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker> {
    const [tracker] = await db
      .insert(generationTrackers)
      .values(data)
      .returning();
    return tracker;
  }

  async updateGenerationTracker(id: number, updates: Partial<GenerationTracker>): Promise<GenerationTracker> {
    const [updatedTracker] = await db
      .update(generationTrackers)
      .set({ ...updates, updatedAt: new Date() } as any)
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

  // User Model operations - with dual ID support for Stack Auth migration
  async getUserModel(userId: string): Promise<UserModel | undefined> {
    // Import cache inside function to avoid circular dependencies
    console.log(`🔍 MODEL LOOKUP: Starting getUserModel for ${userId.substring(0, 8)}...`);
    const { userCache } = await import('./_utils/user-cache.js');
    
    // Check cache first
    const cached = userCache.getModel(userId);
    if (cached !== null) {
      console.log(`🚀 MODEL CACHE: Cache ${cached ? 'hit' : 'hit (null)'} for ${userId.substring(0, 8)}`);
      return cached;
    }
    
    console.log(`💾 MODEL CACHE: Cache miss for ${userId.substring(0, 8)}, querying database`);
    
    // Optimized single query with JOIN to avoid nested Stack Auth lookups
    // This uses the new performance indexes for efficient querying
    const result = await db
      .select({
        id: userModels.id,
        userId: userModels.userId,
        trainingId: userModels.trainingId,
        replicateModelId: userModels.replicateModelId,
        replicateVersionId: userModels.replicateVersionId,
        trainedModelPath: userModels.trainedModelPath,
        triggerWord: userModels.triggerWord,
        trainingStatus: userModels.trainingStatus,
        modelName: userModels.modelName,
        isLuxury: userModels.isLuxury,
        finetuneId: userModels.finetuneId,
        modelType: userModels.modelType,
        trainingProgress: userModels.trainingProgress,
        estimatedCompletionTime: userModels.estimatedCompletionTime,
        failureReason: userModels.failureReason,
        startedAt: userModels.startedAt,
        createdAt: userModels.createdAt,
        updatedAt: userModels.updatedAt,
        completedAt: userModels.completedAt
      })
      .from(userModels)
      .leftJoin(users, eq(users.id, userModels.userId))
      .where(
        or(
          eq(userModels.userId, userId),           // Direct user ID match
          eq(users.stackAuthId, userId)            // Stack Auth ID match via users table
        )
      )
      .limit(1);
    
    const model = result[0];
    
    // Store in cache
    userCache.setModel(userId, model);
    console.log(`✅ MODEL CACHE: Stored ${model ? 'model' : 'null'} for ${userId.substring(0, 8)}`);
    
    return model;
  }

  async getUserModelByUserId(userId: string): Promise<UserModel | undefined> {
    // Alias for getUserModel - same functionality with dual ID support
    return this.getUserModel(userId);
  }

  async getUserModelById(modelId: number): Promise<UserModel | undefined> {
    const [model] = await db
      .select()
      .from(userModels)
      .where(eq(userModels.id, modelId));
    return model;
  }

  // 🔥 BULLETPROOF: Get user model with aggressive Stack Auth ID and email linking
  async getUserModelByStackAuthAndEmail(stackAuthId: string, email: string): Promise<{ user: User | undefined; model: UserModel | undefined }> {
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
        .where(or(
          eq(users.stackAuthId, stackAuthId), 
          eq(users.email, email) 
        ))
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
          } as any)
          .where(eq(users.id, result.userId));
          
        // Update result with new values
        result.userStackAuthId = stackAuthId;
        result.userLastLoginAt = new Date();
        result.userUpdatedAt = new Date();
          
      } else if (needsLoginUpdate) {
        // Update last login for existing linked user
        await db.update(users)
          .set({ 
            lastLoginAt: new Date(),
            updatedAt: new Date()
          } as any)
          .where(eq(users.id, result.userId));
          
        // Update result with new values
        result.userLastLoginAt = new Date();
        result.userUpdatedAt = new Date();
      }

      // Reconstruct user object
      const userRecord: User = {
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
      let userModel: UserModel | null = null;
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

    } catch (error) {
      console.error('❌ Bulletproof user lookup failed:', error);
      return { user: undefined, model: undefined };
    }
  }

  async createUserModel(data: InsertUserModel): Promise<UserModel> {
    const [model] = await db.insert(userModels).values([data]).returning();
    return model;
  }

  async updateUserModel(userId: string, data: Partial<UserModel>): Promise<UserModel> {
    // Try direct update first
    let [updated] = await db
      .update(userModels)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq(userModels.userId, userId))
      .returning();
    
    if (!updated) {
      // For Stack Auth users, try updating by linked original user ID
      const linkedUser = await this.getUserByStackAuthId(userId);
      if (linkedUser) {
        [updated] = await db
          .update(userModels)
          .set({ ...data, updatedAt: new Date() } as any)
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
  async deleteFailedTrainingData(userId: string): Promise<void> {
    
    // Delete in correct order to avoid foreign key constraints
    await db.delete(generationTrackers).where(eq(generationTrackers.userId, userId));
    await db.delete(aiImages).where(eq(aiImages.userId, userId));
    await db.delete(userModels).where(eq(userModels.userId, userId));
    
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
    const modelData: InsertUserModel = {
      userId: actualUserId,
      triggerWord,
      trainingStatus: 'not_started', // User must complete training
      modelName: `${actualUserId}-selfie-lora`, // Consistent with training service
    } as any;

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
    await db.delete(userModels).where(eq(userModels.userId, userId));
  }

  async getAllInProgressTrainings(): Promise<UserModel[]> {
    return await db
      .select()
      .from(userModels)
      .where(eq(userModels.trainingStatus, 'training'))
      .orderBy(desc(userModels.createdAt));
  }

  // ✅ LORA MIGRATION: Get all users with completed training for LoRA extraction
  async getAllCompletedTrainings(): Promise<UserModel[]> {
    return await db
      .select()
      .from(userModels)
      .where(eq(userModels.trainingStatus, 'completed'))
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
  async getUserModelByDatabaseUserId(userId: string): Promise<unknown> {
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
      .set({ ...data, updatedAt: new Date() } as any)
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
        } as any,
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

  async getInspirationPhotos(userId: string): Promise<Array<{ id: number; url: string; description: string }>> {
    // Get user's selected photos from photo selections
    const photoSelections = await this.getPhotoSelections(userId);
    // selectedSelfieIds is JSON array in schema; guard at runtime
    if (!photoSelections || !Array.isArray((photoSelections as unknown as { selectedSelfieIds?: number[] }).selectedSelfieIds) || !(photoSelections as unknown as { selectedSelfieIds?: number[] }).selectedSelfieIds?.length) {
      return [];
    }

    // Get the actual images from AI images table
    const userImages = await this.getAIImages(userId);
    const selectedIds = (photoSelections as unknown as { selectedSelfieIds: number[] }).selectedSelfieIds;
    const selectedImages = userImages.filter(img => selectedIds.includes(img.id));

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
      .set({ ...data, updatedAt: new Date() } as any)
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
        } as any,
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
      } as any).returning();
    }
    
    // Save user message
    await db.insert(claudeMessages).values({
      conversationId: convId,
      role: 'user',
      content: userMessage,
      metadata: fileOperations ? { fileOperations } : null
      } as any);
    
    // Save agent response  
    await db.insert(claudeMessages).values({
      conversationId: convId,
      role: 'assistant', 
      content: agentResponse,
      metadata: fileOperations ? { fileOperations } : null
      } as any);
    
    // Update conversation metadata
    await db.update(claudeConversations)
      .set({ 
        lastMessageAt: new Date(),
        messageCount: sql`${claudeConversations.messageCount} + 2`
      } as any)
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

  async getAgentConversationHistory(agentId: string, userId: string, conversationId?: string): Promise<Array<{ role: string; content: string }>> {
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
  async getSandraConversations(): Promise<unknown[]> {
    // For now, return empty array - could implement full conversation storage later
    return [];
  }

  async saveSandraConversation(data: unknown): Promise<unknown> {
    // For now, just return the data - could implement full conversation storage later
    return data;
  }

  // Agent memory operations - Complete implementation
  async saveAgentMemory(agentId: string, userId: string, memoryData: unknown): Promise<void> {
    try {
      // ENHANCED: Include full conversation history in memory data
      const base = (typeof memoryData === 'object' && memoryData !== null) ? (memoryData as Record<string, unknown>) : {};
      const conversationHistory = Array.isArray((base as { conversationHistory?: unknown[] }).conversationHistory) ? (base as { conversationHistory?: unknown[] }).conversationHistory : [];
      const enhancedMemoryData = {
        ...base,
        conversationHistory,
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
      const conversationRecords = await db
        .select()
        .from(claudeConversations)
        .where(and(
          eq(claudeConversations.agentName, agentId),
          eq(claudeConversations.userId, userId)
        ))
        .limit(1);
      
      const conversation = conversationRecords[0] || null;
      
      if (conversation) {
        // Delete memory messages (where content is '**CONVERSATION_MEMORY**')
        await db.delete(claudeMessages)
          .where(and(
            eq(claudeMessages.conversationId, conversation.conversationId),
            eq(claudeMessages.content, '**CONVERSATION_MEMORY**')
          ));
      }
      
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

  // Get all Maya chats (for analytics)
  async getAllMayaChats(): Promise<MayaChat[]> {
    return await db
      .select()
      .from(mayaChats)
      .orderBy(desc(mayaChats.lastActivity || mayaChats.createdAt));
  }

  // Get Maya chats by category for organized display
  async getMayaChatsByCategory(userId: string): Promise<Record<string, MayaChat[]>> {
    const chats = await this.getMayaChats(userId);
    
    const categorizedChats: Record<string, MayaChat[]> = {
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

  // Get specific Maya chat
  async getMayaChat(chatId: string, userId: string): Promise<MayaChat | undefined> {
    const [chat] = await db
      .select()
      .from(mayaChats)
      .where(and(eq(mayaChats.id, parseInt(chatId)), eq(mayaChats.userId, userId)));
    return chat;
  }

  // Create new Maya chat
  async createMayaChat(userId: string, data: MayaChatCreateInput): Promise<string> {
    const [chat] = await db
      .insert(mayaChats)
      .values({
        userId,
        chatTitle: data.chatTitle || data.title || 'New Maya Chat',
        chatCategory: 'Style Consultation',
        lastActivity: new Date()
      } as any)
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
  async saveMayaChat(userId: string, data: { message: string; response: string; conceptCards: any[]; context: any }): Promise<string> {
    console.log(`💾 STORAGE: Starting saveMayaChat for user ${userId}`);
    
    try {
      const [chat] = await db
        .insert(mayaChats)
        .values({
          userId,
          chatTitle: 'New Maya Chat',
          chatCategory: 'Style Consultation',
          lastActivity: new Date()
        } as any)
        .returning();
      
      console.log(`✅ STORAGE: Chat created with ID ${chat.id}`);
      
      // Save user message
      await this.saveMayaMessage(chat.id.toString(), userId, {
        message: data.message,
        role: 'user'
      });
      
      // Save Maya response WITH concept cards
      console.log(`💾 STORAGE: Saving Maya response with ${data.conceptCards?.length || 0} concept cards`);
      console.log(`🔍 STORAGE CONCEPT CARDS:`, JSON.stringify(data.conceptCards, null, 2));
      try {
        await this.saveMayaMessage(chat.id.toString(), userId, {
          message: data.response,
          role: 'assistant',
          conceptCards: data.conceptCards
        });
        console.log(`✅ STORAGE: Maya message saved successfully`);
      } catch (error) {
        console.error('❌ STORAGE: Error saving Maya response message:', error);
        // Try saving without concept cards as fallback
        console.log(`🔄 STORAGE: Attempting fallback save without concept cards`);
        await this.saveMayaMessage(chat.id.toString(), userId, {
          message: data.response,
          role: 'assistant'
        });
        console.log(`✅ STORAGE: Fallback save successful`);
      }
      
      return chat.id.toString();
    } catch (error) {
      console.error('❌ STORAGE: Error in saveMayaChat:', error);
      throw error;
    }
  }

  // Get Maya chat messages
  async getMayaChatMessages(chatId: string, userId: string): Promise<MayaChatMessage[]> {
    return await db
      .select()
      .from(mayaChatMessages)
      .where(eq(mayaChatMessages.chatId, parseInt(chatId)))
      .orderBy(asc(mayaChatMessages.createdAt));
  }

  // Save Maya message
  async saveMayaMessage(chatId: string, userId: string, data: { message: string; role: string; conceptCards?: any[] }): Promise<string> {
    // Validate and sanitize concept cards
    let conceptCards = null;
    if (data.conceptCards && Array.isArray(data.conceptCards) && data.conceptCards.length > 0) {
      try {
        // Ensure concept cards are valid JSON objects and clean them
        conceptCards = data.conceptCards
          .filter(card => card && typeof card === 'object' && card.title && card.prompt)
          .map(card => ({
            title: String(card.title || '').trim(),
            prompt: String(card.prompt || '').trim(),
            ...(card.emoji && { emoji: String(card.emoji).trim() })
          }))
          .filter(card => card.title && card.prompt); // Remove any that became empty
        
        // Test JSON serialization
        JSON.stringify(conceptCards);
        console.log(`💾 STORAGE: Validated ${conceptCards.length} concept cards`);
        
        if (conceptCards.length === 0) {
          conceptCards = null;
        }
      } catch (error) {
        console.error('❌ STORAGE: Error validating concept cards:', error);
        console.error('❌ STORAGE: Original data:', JSON.stringify(data.conceptCards, null, 2));
        conceptCards = null;
      }
    }

    try {
      const [message] = await db
        .insert(mayaChatMessages)
        .values({
          chatId: parseInt(chatId),
          content: data.message,
          role: data.role as 'user' | 'assistant',
          conceptCards: conceptCards,
          createdAt: new Date()
        } as any)
        .returning();
      
      console.log(`✅ STORAGE: Message saved with ID ${message.id}, conceptCards: ${conceptCards ? 'YES' : 'NO'}`);
      return message.id.toString();
    } catch (error) {
      console.error('❌ STORAGE: Database error saving Maya message:', error);
      console.error('❌ STORAGE: Attempted data:', { chatId, role: data.role, conceptCardsLength: Array.isArray(conceptCards) ? conceptCards.length : 0 });
      throw error;
    }
  }

  // Update Maya message
  async updateMayaMessage(messageId: string, userId: string, updates: { content: string }): Promise<void> {
    await db
      .update(mayaChatMessages)
      .set({ content: updates.content } as any)
      .where(eq(mayaChatMessages.id, parseInt(messageId)));
  }

  // Legacy method - use createMayaChat(userId, data) instead
  async createMayaChatLegacy(data: InsertMayaChat): Promise<MayaChat> {
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
      } as any)
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  // Legacy method - use getMayaChatMessages(chatId, userId) instead
  async getMayaChatMessagesLegacy(chatId: number): Promise<MayaChatMessage[]> {
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
        conceptCards: msg.conceptCards ? (msg.conceptCards as unknown) : null, // ENHANCED: conceptCards stored as JSONB with fullPrompt preserved
        quickButtons: msg.quickButtons ? JSON.parse(msg.quickButtons) : null,
      };
      
      // CRITICAL: Verify fullPrompt field preservation in retrieved concept cards
      if (processedMsg.conceptCards && Array.isArray(processedMsg.conceptCards)) {
        const conceptsWithPrompts = (processedMsg.conceptCards as Array<Record<string, unknown>>).filter((card) => 'fullPrompt' in card && (card as { fullPrompt?: string }).fullPrompt);
        if (conceptsWithPrompts.length > 0) {
          conceptsWithPrompts.forEach((card, index: number) => {
            const title = (card as { title?: string }).title || '';
            const fullPromptLen = (card as { fullPrompt?: string }).fullPrompt?.length || 0;
          });
        }
      }
      
      return processedMsg;
    });
  }

  // REMOVED: getAllMayaChatMessages method to prevent session mixing
  // Use getMayaChatMessages(chatId) for session-specific loading

  async createMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage> {
    
    // CRITICAL: Ensure fullPrompt field is preserved in concept cards
    // @ts-ignore - Complex message data structure with dynamic properties
    if (data.conceptCards && Array.isArray(data.conceptCards)) {
      // @ts-ignore - Complex message data structure with dynamic properties
      const conceptsWithPrompts = (data.conceptCards as Array<Record<string, unknown>>).filter((card) => 'fullPrompt' in card && card.fullPrompt);
      if (conceptsWithPrompts.length > 0) {
        conceptsWithPrompts.forEach((card, index: number) => {
          const title = (card as { title?: string }).title || '';
          const fullPromptLen = (card as { fullPrompt?: string }).fullPrompt?.length || 0;
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
  async saveMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage> {
    return this.createMayaChatMessage(data);
  }

  // CRITICAL FIX: Add missing getMayaConceptById method for generation system
  async getMayaConceptById(conceptId: string): Promise<Record<string, unknown> | undefined> {
    
    // Search through Maya chat messages for concept cards with matching ID
    const messages = await db
      .select()
      .from(mayaChatMessages)
      .where(eq(mayaChatMessages.role, 'maya'))
      .orderBy(desc(mayaChatMessages.createdAt));
    
    // Look through each message's conceptCards for the matching conceptId
    for (const message of messages) {
      if (message.conceptCards && Array.isArray(message.conceptCards)) {
        const conceptCard = (message.conceptCards as Array<Record<string, unknown>>).find((card) => (card as { id?: string }).id === conceptId);
        if (conceptCard) {
          const title = (conceptCard as { title?: string }).title || '';
          const fullPrompt = (conceptCard as { fullPrompt?: string }).fullPrompt;
          return conceptCard as Record<string, unknown>;
        }
      }
    }
    
    return undefined;
  }



  async updateMayaChatMessage(messageId: number, data: Partial<{ imagePreview: string; generatedPrompt: string }>): Promise<void> {
   
    await db
      .update(mayaChatMessages)
      .set(data as any)
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
        } as any)
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
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(subscriptions.id, id))
      .returning();
    return subscription;
  }

  // LoRA Training and Weights Management
  async createTrainingRun(trainingRun: InsertTrainingRun): Promise<TrainingRun> {
    const [run] = await db.insert(trainingRuns).values(trainingRun).returning();
    return run;
  }

  async getTrainingRun(id: number): Promise<TrainingRun | undefined> {
    const [run] = await db.select().from(trainingRuns).where(eq(trainingRuns.id, id));
    return run;
  }

  async getTrainingRunByTrainingId(trainingId: string): Promise<TrainingRun | undefined> {
    const [run] = await db.select().from(trainingRuns).where(eq(trainingRuns.trainingId, trainingId));
    return run;
  }

  async updateTrainingRun(id: number, updates: Partial<TrainingRun>): Promise<TrainingRun> {
    const [run] = await db.update(trainingRuns).set(updates).where(eq(trainingRuns.id, id)).returning();
    return run;
  }

  async listUserTrainingRuns(userId: string): Promise<TrainingRun[]> {
    return db.select().from(trainingRuns).where(eq(trainingRuns.userId, userId)).orderBy(desc(trainingRuns.createdAt));
  }

  async createLoraWeight(weight: InsertLoraWeight): Promise<LoraWeight> {
    const [loraWeight] = await db.insert(loraWeights).values(weight).returning();
    return loraWeight;
  }

  async getLoraWeight(id: number): Promise<LoraWeight | undefined> {
    const [weight] = await db.select().from(loraWeights).where(eq(loraWeights.id, id));
    return weight;
  }

  async getUserActiveLoraWeight(userId: string): Promise<LoraWeight | undefined> {
    // Get the most recent available LoRA weight for the user
    const [weight] = await db.select().from(loraWeights)
      .where(and(eq(loraWeights.userId, userId), eq(loraWeights.status, 'available')))
      .orderBy(desc(loraWeights.createdAt))
      .limit(1);
    return weight;
  }

  async listUserLoraWeights(userId: string): Promise<LoraWeight[]> {
    return db.select().from(loraWeights).where(eq(loraWeights.userId, userId)).orderBy(desc(loraWeights.createdAt));
  }

  async updateLoraWeight(id: number, updates: Partial<LoraWeight>): Promise<LoraWeight> {
    const [weight] = await db.update(loraWeights).set(updates).where(eq(loraWeights.id, id)).returning();
    return weight;
  }

  async setActiveLoraWeight(userId: string, weightId: number): Promise<void> {
    // Mark all user's weights as archived, then set the selected one as available
    await db.update(loraWeights).set({ status: 'archived' } as any).where(eq(loraWeights.userId, userId));
    await db.update(loraWeights).set({ status: 'available' } as any).where(eq(loraWeights.id, weightId));
  }

  // ✅ RESTORED: Simple LoRA weights storage method
  async storeLoRAWeights(data: {
    userId: string;
    trainingId: string;
    weightsUrl: string;
    checksum: string;
    fileSize: number;
    extractedAt: Date;
  }): Promise<void> {
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
      } as any);
    }
    
    // Create LoRA weight record with Maya's intelligent scaling defaults
    const mayaScales = {
      closeUpPortrait: 0.9,  // From Maya personality
      halfBodyShot: 1.0,     // From Maya personality  
      fullScenery: 0.85,     // From Maya personality
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
    } as any);
    
  }

  async getLoRAWeights(userId: string): Promise<{ s3Bucket: string; s3Key: string } | undefined> {
    const weight = await this.getUserActiveLoraWeight(userId);
    if (!weight) return undefined;
    return { s3Bucket: (weight as any).s3Bucket, s3Key: (weight as any).s3Key };
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

  // HYBRID BACKEND ARCHITECTURE: Implementation of conversation and concept card operations
  
  // Conversation operations
  async createConversation(data: any): Promise<Conversation> {
    const [conversation] = await db
      .insert(agentConversations)
      .values({
        agentId: data.agentName || 'maya',
        userId: data.userId || '',
        userMessage: '', // Initial empty message
        agentResponse: '', // Initial empty response
        conversationTitle: data.title || 'New Conversation',
        isActive: true,
        messageCount: 0
      } as any)
      .returning();
    return {
      id: conversation.id.toString(),
      userId: conversation.userId,
      agentName: conversation.agentId,
      title: conversation.conversationTitle,
      status: conversation.isActive ? 'active' : 'inactive',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    } as Conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(agentConversations)
      .where(eq(agentConversations.id, parseInt(id)));
    
    if (!conversation) return undefined;
    
    return {
      id: conversation.id.toString(),
      userId: conversation.userId,
      agentName: conversation.agentId,
      title: conversation.conversationTitle,
      status: conversation.isActive ? 'active' : 'inactive',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    } as Conversation;
  }

  async getUserConversations(userId: string, agentName?: string): Promise<Conversation[]> {
    const conditions = [eq(agentConversations.userId, userId)];
    if (agentName) {
      conditions.push(eq(agentConversations.agentId, agentName));
    }
    
    const results = await db
      .select()
      .from(agentConversations)
      .where(and(...conditions))
      .orderBy(desc(agentConversations.updatedAt));
    
    return results.map(conversation => ({
      id: conversation.id.toString(),
      userId: conversation.userId,
      agentName: conversation.agentId,
      title: conversation.conversationTitle,
      status: conversation.isActive ? 'active' : 'inactive',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    })) as Conversation[];
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation> {
    const [conversation] = await db
      .update(agentConversations)
      .set({ 
        conversationTitle: updates.title,
        isActive: updates.status === 'active',
        updatedAt: new Date() 
      } as any)
      .where(eq(agentConversations.id, parseInt(id)))
      .returning();
    
    return {
      id: conversation.id.toString(),
      userId: conversation.userId,
      agentName: conversation.agentId,
      title: conversation.conversationTitle,
      status: conversation.isActive ? 'active' : 'inactive',
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    } as Conversation;
  }

  async archiveConversation(id: string): Promise<Conversation> {
    return this.updateConversation(id, { status: 'archived' });
  }

  // Message operations
  async createMessage(data: any): Promise<Message> {
    // FIXED: This method is for regular conversation messages, NOT Maya chat messages
    // Maya messages should use createMayaChatMessage() instead
    const [message] = await db
      .insert(messages)
      .values({
        conversationId: data.conversationId || '',
        role: data.role || 'user',
        content: data.content || '',
        meta: null
      } as any)
      .returning();
    return {
      id: message.id.toString(),
      conversationId: data.conversationId,
      role: message.role,
      content: message.content,
      meta: null,
      tokenCount: 0,
      createdAt: message.createdAt
    } as Message;
  }

  async getConversationMessages(conversationId: string, limit?: number): Promise<Message[]> {
    const baseQuery = db
      .select()
      .from(mayaChatMessages)
      .where(eq(mayaChatMessages.chatId, parseInt(conversationId)))
      .orderBy(desc(mayaChatMessages.createdAt));
    
    const results = await (limit ? baseQuery.limit(limit) : baseQuery);
    
    return results.map(msg => ({
      id: msg.id.toString(),
      conversationId: conversationId,
      role: msg.role,
      content: msg.content,
      meta: msg.conceptCards || null,
      tokenCount: 0,
      createdAt: msg.createdAt
    })) as Message[];
  }

  async getLastMessages(conversationId: string, count: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(count);
  }

  async getMessagesAfter(conversationId: string, messageId: string): Promise<Message[]> {
    const targetMessage = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));
    
    if (!targetMessage.length || !targetMessage[0].createdAt) return [];
    
    return await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.conversationId, conversationId),
          gte(messages.createdAt, targetMessage[0].createdAt!)
        )
      )
      .orderBy(messages.createdAt);
  }

  // Conversation summary operations
  async upsertConversationSummary(data: any): Promise<ConversationSummary> {
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
    } else {
      const [summary] = await db
        .insert(conversationSummaries)
        .values({
          ...data,
          conversationId: data.conversationId || '',
          summary: data.summary || ''
      } as any)
        .returning();
      return summary;
    }
  }

  async getConversationSummary(conversationId: string): Promise<ConversationSummary | undefined> {
    const [summary] = await db
      .select()
      .from(conversationSummaries)
      .where(eq(conversationSummaries.conversationId, conversationId));
    return summary;
  }

  async updateConversationSummary(conversationId: string, summary: string, lastMessageId: string, messageCount: number): Promise<ConversationSummary> {
    const [updated] = await db
      .update(conversationSummaries)
      .set({ 
        summary, 
        lastMessageId, 
        messageCount, 
        updatedAt: new Date() 
      } as any)
      .where(eq(conversationSummaries.conversationId, conversationId))
      .returning();
    return updated;
  }

  // Concept card operations (with idempotency)
  async createConceptCard(data: any): Promise<ConceptCard> {
    const [conceptCard] = await db
      .insert(conceptCards)
      .values({
        ...data,
        userId: data.userId || '',
        clientId: data.clientId || '',
        title: data.title || '',
        conversationId: data.conversationId || '',
        status: data.status || 'draft'
      } as any)
      .onConflictDoUpdate({
        target: [conceptCards.userId, conceptCards.clientId],
        set: {
          ...data,
          updatedAt: new Date()
        } as any
      })
      .returning();
    return conceptCard;
  }

  async getConceptCard(id: string): Promise<ConceptCard | undefined> {
    const [conceptCard] = await db
      .select()
      .from(conceptCards)
      .where(eq(conceptCards.id, id));
    return conceptCard;
  }

  async getConceptCardByClientId(userId: string, clientId: string): Promise<ConceptCard | undefined> {
    const [conceptCard] = await db
      .select()
      .from(conceptCards)
      .where(and(
        eq(conceptCards.userId, userId),
        eq(conceptCards.clientId, clientId)
      ));
    return conceptCard;
  }

  async getUserConceptCards(userId: string, conversationId?: string): Promise<ConceptCard[]> {
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

  async updateConceptCard(id: string, updates: Partial<ConceptCard>): Promise<ConceptCard> {
    const [conceptCard] = await db
      .update(conceptCards)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(conceptCards.id, id))
      .returning();
    return conceptCard;
  }

  async updateConceptCardGeneration(id: string, generatedImages: unknown[], isLoading: boolean, isGenerating: boolean, hasGenerated: boolean): Promise<ConceptCard> {
    const [conceptCard] = await db
      .update(conceptCards)
      .set({
        generatedImages,
        isLoading,
        isGenerating,
        hasGenerated,
        updatedAt: new Date()
      } as any)
      .where(eq(conceptCards.id, id))
      .returning();
    return conceptCard;
  }

  async deleteConceptCard(id: string): Promise<void> {
    await db.delete(conceptCards).where(eq(conceptCards.id, id));
  }

  // Brand Assets operations (P3-C feature)
  async getBrandAssets(userId: string): Promise<BrandAsset[]> {
    return await db
      .select()
      .from(brandAssets)
      .where(eq(brandAssets.userId, userId))
      .orderBy(desc(brandAssets.createdAt));
  }

  async saveBrandAsset(data: any): Promise<BrandAsset> {
    const [asset] = await db
      .insert(brandAssets)
      .values({
        ...data,
        userId: data.userId || '',
        kind: data.kind || 'logo',
        url: data.url || '',
        filename: data.filename || '',
        fileSize: data.fileSize || 0
      } as any)
      .returning();
    return asset;
  }

  async deleteBrandAsset(assetId: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(brandAssets)
      .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)));
    return Boolean((result as unknown as { rowCount?: number }).rowCount ?? true);
  }

  async getBrandAsset(assetId: number, userId: string): Promise<BrandAsset | undefined> {
    const [asset] = await db
      .select()
      .from(brandAssets)
      .where(and(eq(brandAssets.id, assetId), eq(brandAssets.userId, userId)));
    return asset;
  }

  // Image Variants operations (for non-destructive placement)
  async saveImageVariant(data: any): Promise<ImageVariant> {
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
      } as any)
      .returning();
    return variant;
  }

  async getImageVariants(userId: string, originalImageId?: number): Promise<ImageVariant[]> {
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

  async getImageVariant(variantId: number, userId: string): Promise<ImageVariant | undefined> {
    const [variant] = await db
      .select()
      .from(imageVariants)
      .where(and(eq(imageVariants.id, variantId), eq(imageVariants.userId, userId)));
    return variant;
  }

  async updateImageVariant(variantId: number, updates: Partial<ImageVariant>): Promise<ImageVariant> {
    const [variant] = await db
      .update(imageVariants)
      .set(updates)
      .where(eq(imageVariants.id, variantId))
      .returning();
    return variant;
  }

  // Maya Profile operations
  async getMayaProfile(userId: string): Promise<MayaProfile | undefined> {
    const [profile] = await db
      .select()
      .from(mayaProfile)
      .where(eq(mayaProfile.userId, userId));
    return profile;
  }

  async insertMayaProfile(data: InsertMayaProfile): Promise<MayaProfile> {
    const [profile] = await db
      .insert(mayaProfile)
      .values(data)
      .returning();
    return profile;
  }

  async updateMayaProfile(userId: string, updates: Partial<MayaProfile>): Promise<MayaProfile> {
    const [profile] = await db
      .update(mayaProfile)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(mayaProfile.userId, userId))
      .returning();
    return profile;
  }

  // Maya Images operations
  async insertMayaImage(data: InsertMayaImage): Promise<MayaImage> {
    const [image] = await db
      .insert(mayaImages)
      .values(data)
      .returning();
    return image;
  }

  // Maya Concepts operations
  async insertMayaConcept(data: InsertMayaConcept): Promise<MayaConcept> {
    const [concept] = await db
      .insert(mayaConcepts)
      .values(data)
      .returning();
    return concept;
  }

  // 🔥 CRITICAL FIX: Ensure Maya profile exists for user synchronization
  async ensureMayaProfile(userId: string): Promise<MayaProfile> {
    try {
      // Check if Maya profile already exists
      const existingProfile = await this.getMayaProfile(userId);
      if (existingProfile) {
        return existingProfile;
      }

      // Create new Maya profile with default settings
      const defaultProfile: InsertMayaProfile = {
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
      } as any;

      return await this.insertMayaProfile(defaultProfile);
    } catch (error) {
      console.error('❌ Failed to ensure Maya profile for user:', userId, error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();