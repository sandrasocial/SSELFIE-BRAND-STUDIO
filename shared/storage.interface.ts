import {
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
  type GeneratedVideo,
  type InsertGeneratedVideo,
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
  type MayaChat,
  type InsertMayaChat,
  type MayaChatMessage,
  type InsertMayaChatMessage,
  type EmailCapture,
  type InsertEmailCapture,
  type ClaudeConversation,
  type ClaudeMessage,
  type BrandAsset,
  type InsertBrandAsset,
  type ImageVariant,
  type InsertImageVariant,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type ConversationSummary,
  type InsertConversationSummary,
  type ConceptCard,
  type InsertConceptCard,
} from './schema.js';

import {
  type MayaChatCreateInput,
  type AgentMemoryData,
  type BrandAssetCreateInput,
  type ImageVariantCreateInput
} from './types.js';

// Storage interface for data persistence
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByStackAuthId(stackAuthId: string): Promise<User | undefined>;
  linkStackAuthId(existingUserId: string, stackAuthId: string): Promise<User>;
  createUser(userData: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  upsertUser(user: InsertUser): Promise<User>;
  updateUserProfile(userId: string, updates: Partial<User>): Promise<User>;
  syncStackAuthUser(stackUser: { id: string; primaryEmail?: string; displayName?: string; profileImageUrl?: string }): Promise<User>;
  updateUserRetrainingAccess(userId: string, retrainingData: { hasRetrainingAccess: boolean; retrainingSessionId: string; retrainingPaidAt: Date }): Promise<User>;

  // User Profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  upsertUserProfile(data: InsertUserProfile): Promise<UserProfile>;

  // Onboarding operations
  getOnboardingData(userId: string): Promise<OnboardingData | undefined>;
  saveOnboardingData(data: InsertOnboardingData): Promise<OnboardingData>;
  updateOnboardingData(userId: string, data: Partial<OnboardingData>): Promise<OnboardingData>;

  // AI Image operations
  getAIImages(userId: string): Promise<AiImage[]>;
  getAIImage(userId: string, imageId: number): Promise<AiImage | undefined>;
  saveAIImage(data: InsertAiImage): Promise<AiImage>;
  deleteAIImage(userId: string, imageId: number): Promise<boolean>;
  updateAIImage(id: number, data: Partial<AiImage>): Promise<AiImage>;

  // Generated Images operations
  getGeneratedImages(userId: string): Promise<GeneratedImage[]>;
  saveGeneratedImage(data: InsertGeneratedImage): Promise<GeneratedImage>;
  updateGeneratedImage(id: number, data: Partial<GeneratedImage>): Promise<GeneratedImage>;

  // Generated Videos operations
  getGeneratedVideos(userId: string): Promise<GeneratedVideo[]>;
  saveGeneratedVideo(data: InsertGeneratedVideo): Promise<GeneratedVideo>;
  updateGeneratedVideo(id: number, data: Partial<GeneratedVideo>): Promise<GeneratedVideo>;
  getGeneratedVideoByJobId(jobId: string): Promise<GeneratedVideo | undefined>;
  getUserVideosByStatus(userId: string, status?: string): Promise<GeneratedVideo[]>;

  // Generation Tracker operations
  createGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker>;
  saveGenerationTracker(data: InsertGenerationTracker): Promise<GenerationTracker>;
  updateGenerationTracker(id: number, updates: Partial<GenerationTracker>): Promise<GenerationTracker>;
  getGenerationTracker(id: number): Promise<GenerationTracker | undefined>;
  getUserGenerationTrackers(userId: string): Promise<GenerationTracker[]>;
  getCompletedGenerationTrackersForUser(userId: string, hoursBack: number): Promise<GenerationTracker[]>;
  getProcessingGenerationTrackers(): Promise<GenerationTracker[]>;

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
  getAllCompletedTrainings(): Promise<UserModel[]>;

  // Selfie Upload operations
  getSelfieUploads(userId: string): Promise<SelfieUpload[]>;
  saveSelfieUpload(data: InsertSelfieUpload): Promise<SelfieUpload>;

  // Subscription operations
  getSubscription(userId: string): Promise<Subscription | undefined>;
  getUserSubscription(userId: string): Promise<Subscription | undefined>;
  createSubscription(data: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, updates: Partial<Subscription>): Promise<Subscription>;

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
  saveMayaMessage(chatId: string, userId: string, data: { message: string; role: string }): Promise<string>;
  updateMayaMessage(messageId: string, userId: string, updates: { content: string }): Promise<void>;
  createMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage>;
  saveMayaChatMessage(data: InsertMayaChatMessage): Promise<MayaChatMessage>;
  updateMayaChatMessage(messageId: number, data: Partial<{ imagePreview: string; generatedPrompt: string }>): Promise<void>;
  getMayaConceptById(conceptId: string): Promise<Record<string, unknown> | undefined>;

  // Photo selections operations
  savePhotoSelections(data: InsertPhotoSelection): Promise<PhotoSelection>;
  getPhotoSelections(userId: string): Promise<PhotoSelection | undefined>;
  getInspirationPhotos(userId: string): Promise<Array<{ id: number; url: string; description: string }>>;

  // Agent conversations and memory
  saveAgentConversation(agentId: string, userId: string, userMessage: string, agentResponse: string, fileOperations?: unknown[], conversationId?: string): Promise<ClaudeConversation>;
  getAgentConversations(agentId: string, userId: string): Promise<ClaudeMessage[]>;
  getAgentConversationHistory(agentId: string, userId: string, conversationId?: string): Promise<Array<{ role: string; content: string }>>;
  getAllAgentConversations(userId: string): Promise<ClaudeMessage[]>;
  
  // Agent memory operations
  saveAgentMemory(agentId: string, userId: string, memoryData: AgentMemoryData): Promise<void>;
  getAgentMemory(agentId: string, userId: string): Promise<AgentMemoryData | null>;
  clearAgentMemory(agentId: string, userId: string): Promise<void>;

  // Landing page operations
  createLandingPage(data: InsertLandingPage): Promise<LandingPage>;
  getLandingPages(userId: string): Promise<LandingPage[]>;

  // User landing pages operations
  createUserLandingPage(data: InsertUserLandingPage): Promise<UserLandingPage>;
  getUserLandingPages(userId: string): Promise<UserLandingPage[]>;
  getUserLandingPageBySlug(slug: string): Promise<UserLandingPage | undefined>;
  updateUserLandingPage(id: number, data: Partial<UserLandingPage>): Promise<UserLandingPage | undefined>;

  // Email Capture operations
  captureEmail(data: InsertEmailCapture): Promise<EmailCapture>;

  // Brand Assets operations
  getBrandAssets(userId: string): Promise<BrandAsset[]>;
  saveBrandAsset(data: InsertBrandAsset): Promise<BrandAsset>;
  deleteBrandAsset(assetId: number, userId: string): Promise<boolean>;
  getBrandAsset(assetId: number, userId: string): Promise<BrandAsset | undefined>;

  // Image Variants operations
  saveImageVariant(data: InsertImageVariant): Promise<ImageVariant>;
  getImageVariants(userId: string, originalImageId?: number): Promise<ImageVariant[]>;
  getImageVariant(variantId: number, userId: string): Promise<ImageVariant | undefined>;
  updateImageVariant(variantId: number, updates: Partial<ImageVariant>): Promise<ImageVariant>;

  // Admin operations
  setUserAsAdmin(email: string): Promise<User | null>;
  isUserAdmin(userId: string): Promise<boolean>;
  hasUnlimitedGenerations(userId: string): Promise<boolean>;

  // Plan operations
  upgradeUserToPremium(userId: string, plan: string): Promise<User>;
  upgradeUserPlan(userId: string, plan: string): Promise<User>;
}