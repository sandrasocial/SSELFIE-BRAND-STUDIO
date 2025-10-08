// =============================================================================
// MANUAL TYPE OVERRIDES FOR DRIZZLE ORM
// =============================================================================
// Due to corrupted type definitions in Drizzle ORM versions 0.33.0-0.44.6,
// we need to manually define the types that should be automatically inferred.

// =============================================================================
// USER TYPES - Manual Override
// =============================================================================

export interface User {
  // Core user fields - Stack Auth compatible
  id: string;
  stackAuthId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  profileImageUrl: string | null;
  
  // Stack Auth managed timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  
  // Business logic
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: string;
  role: string;
  monthlyGenerationLimit: number;
  generationsUsedThisMonth: number;
  mayaAiAccess: boolean;
  victoriaAiAccess: boolean;
  
  // Retraining access tracking
  hasRetrainingAccess: boolean;
  retrainingSessionId: string | null;
  retrainingPaidAt: Date | null;
  
  // Conversational onboarding tracking
  onboardingProgress: any;
  preferredOnboardingMode: string;
  
  // Essential profile data for Maya personalization
  gender: string | null;
  profession: string | null;
  brandStyle: string | null;
  photoGoals: string | null;
}

export interface InsertUser {
  id?: string;
  stackAuthId?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  profileImageUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date | null;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  plan?: string;
  role?: string;
  monthlyGenerationLimit?: number;
  generationsUsedThisMonth?: number;
  mayaAiAccess?: boolean;
  victoriaAiAccess?: boolean;
  hasRetrainingAccess?: boolean;
  retrainingSessionId?: string | null;
  retrainingPaidAt?: Date | null;
  onboardingProgress?: any;
  preferredOnboardingMode?: string;
  gender?: string | null;
  profession?: string | null;
  brandStyle?: string | null;
  photoGoals?: string | null;
}

// =============================================================================
// MAYA PROFILE TYPES - Manual Override
// =============================================================================

export interface MayaProfile {
  id: number;
  userId: string;
  onboardingStatus: string | null;
  onboardingStep: number | null;
  completedSteps: any;
  preferences: any;
  totalGenerations: number | null;
  monthlyGenerations: number | null;
  lastResetDate: Date | null;
  featureAccess: any;
  billingInfo: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertMayaProfile {
  id?: number;
  userId: string;
  onboardingStatus?: string | null;
  onboardingStep?: number | null;
  completedSteps?: any;
  preferences?: any;
  totalGenerations?: number | null;
  monthlyGenerations?: number | null;
  lastResetDate?: Date | null;
  featureAccess?: any;
  billingInfo?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

// =============================================================================
// CONVERSATION TYPES - Manual Override
// =============================================================================

export interface ClaudeConversation {
  id: number;
  userId: string;
  agentName: string;
  conversationId: string;
  title: string | null;
  status: string | null;
  lastMessageAt: Date | null;
  messageCount: number;
  context: any;
  adminBypassEnabled: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertClaudeConversation {
  id?: number;
  userId: string;
  agentName: string;
  conversationId?: string;
  title?: string | null;
  status?: string | null;
  lastMessageAt?: Date | null;
  messageCount?: number;
  context?: any;
  adminBypassEnabled?: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Alternative conversation type used by agentConversations table
export interface AgentConversation {
  id: string;
  userId: string;
  agentName: string;
  title: string | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertAgentConversation {
  id?: string;
  userId: string;
  agentName: string;
  title?: string | null;
  status?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Alias for generic Conversation type - using AgentConversation since that's what storage returns
export type Conversation = AgentConversation;
export type InsertConversation = InsertAgentConversation;

// =============================================================================
// CONVERSATION SUMMARY TYPES - Manual Override
// =============================================================================

export interface ConversationSummary {
  id: string;
  conversationId: string;
  summary: string;
  lastMessageId: string | null;
  messageCount: number | null;
  updatedAt: Date | null;
}

export interface InsertConversationSummary {
  id?: string;
  conversationId: string;
  summary: string;
  lastMessageId?: string | null;
  messageCount?: number | null;
  updatedAt?: Date | null;
}

// =============================================================================
// GENERATION TRACKER TYPES - Manual Override
// =============================================================================

export interface GenerationTracker {
  id: number;
  userId: string;
  predictionId: string | null;
  prompt: string | null;
  style: string | null;
  status: string | null;
  imageUrls: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertGenerationTracker {
  id?: number;
  userId: string;
  predictionId?: string | null;
  prompt?: string | null;
  style?: string | null;
  status?: string | null;
  imageUrls?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// =============================================================================
// CONCEPT CARD TYPES - Manual Override 
// =============================================================================

export interface ConceptCard {
  id: string;
  userId: string;
  conversationId: string | null;
  clientId: string | null;
  title: string;
  description: string | null;
  images: any;
  tags: string[];
  status: string | null;
  sortOrder: number | null;
  generatedImages: any;
  isLoading: boolean | null;
  isGenerating: boolean | null;
  hasGenerated: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface InsertConceptCard {
  id?: string;
  userId: string;
  conversationId?: string | null;
  clientId?: string | null;
  title: string;
  description?: string | null;
  images?: any;
  tags?: string[];
  status?: string | null;
  sortOrder?: number | null;
  generatedImages?: any;
  isLoading?: boolean | null;
  isGenerating?: boolean | null;
  hasGenerated?: boolean | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// =============================================================================
// AI IMAGE TYPES - Manual Override
// =============================================================================

export interface AiImage {
  id: number;
  userId: string;
  imageUrl: string;
  prompt: string | null;
  generatedPrompt: string | null;
  style: string | null;
  category: string | null;
  source: string | null;
  predictionId: string | null;
  generationStatus: string | null;
  isSelected: boolean | null;
  isFavorite: boolean | null;
  createdAt: Date | null;
}

export interface InsertAiImage {
  id?: number;
  userId: string;
  imageUrl: string;
  prompt?: string | null;
  generatedPrompt?: string | null;
  style?: string | null;
  category?: string | null;
  source?: string | null;
  predictionId?: string | null;
  generationStatus?: string | null;
  isSelected?: boolean | null;
  isFavorite?: boolean | null;
  createdAt?: Date | null;
}

// =============================================================================
// USER MODEL TYPES - Manual Override
// =============================================================================

export interface UserModel {
  id: number;
  userId: string;
  trainingId: string | null;
  replicateModelId: string | null;
  replicateVersionId: string | null;
  trainedModelPath: string | null;
  triggerWord: string;
  trainingStatus: string | null;
  modelName: string | null;
  isLuxury: boolean | null;
  finetuneId: string | null;
  modelType: string | null;
  trainingProgress: number | null;
  estimatedCompletionTime: Date | null;
  failureReason: string | null;
  startedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  completedAt: Date | null;
}

export interface InsertUserModel {
  id?: number;
  userId: string;
  trainingId?: string | null;
  replicateModelId?: string | null;
  replicateVersionId?: string | null;
  trainedModelPath?: string | null;
  triggerWord: string;
  trainingStatus?: string | null;
  modelName?: string | null;
  isLuxury?: boolean | null;
  finetuneId?: string | null;
  modelType?: string | null;
  trainingProgress?: number | null;
  estimatedCompletionTime?: Date | null;
  failureReason?: string | null;
  startedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  completedAt?: Date | null;
}

// =============================================================================
// MAYA IMAGE TYPES - Manual Override
// =============================================================================

export interface MayaImage {
  id: number;
  userId: string;
  url: string;
  thumbnailUrl: string | null;
  category: string | null;
  subcategory: string | null;
  metadata: any;
  isFavorite: boolean | null;
  isArchived: boolean | null;
  rating: number | null;
  viewCount: number | null;
  shareCount: number | null;
  downloadCount: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertMayaImage {
  id?: number;
  userId: string;
  url: string;
  thumbnailUrl?: string | null;
  category?: string | null;
  subcategory?: string | null;
  metadata?: any;
  isFavorite?: boolean | null;
  isArchived?: boolean | null;
  rating?: number | null;
  viewCount?: number | null;
  shareCount?: number | null;
  downloadCount?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// =============================================================================
// BRAND ASSET TYPES - Manual Override
// =============================================================================

export interface BrandAsset {
  id: number;
  userId: string;
  url: string;
  category: string;
  predictionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsertBrandAsset {
  id?: number;
  userId: string;
  url: string;
  category: string;
  predictionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// =============================================================================
// EXPORT OVERRIDES TO REPLACE BROKEN DRIZZLE TYPES
// =============================================================================

// These interfaces are already exported above and will override the broken
// Drizzle ORM inferred types when imported in other files.