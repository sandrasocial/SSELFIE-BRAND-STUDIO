/**
 * Maya-Only Core Architecture Types
 * Comprehensive type definitions for Maya AI system components
 */

import { BaseUser } from './base.js';

// === Core Maya Types ===

export interface MayaUser extends BaseUser {
  brandContext?: BrandContext;
  preferences?: UserPreferences;
  subscription?: UserSubscription;
  modelStatus?: UserModelStatus;
}

export interface BrandContext {
  industry?: string;
  targetAudience?: string;
  brandPersonality?: string[];
  stylePreferences?: string[];
  brandGuidelines?: string;
  contentTone?: 'professional' | 'casual' | 'luxury' | 'friendly' | 'authoritative';
  primaryPlatform?: 'linkedin' | 'instagram' | 'website' | 'multiple';
  businessType?: 'entrepreneur' | 'executive' | 'creative' | 'consultant' | 'other';
}

export interface UserPreferences {
  stylePreferences?: string[];
  brandGuidelines?: string;
  contentTone?: string;
  targetAudience?: string;
  preferredCategories?: MayaCategory[];
  communicationStyle?: 'concise' | 'detailed' | 'creative' | 'analytical';
}

export interface UserSubscription {
  plan: 'free' | 'premium' | 'professional' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  renewsAt?: Date;
  features: string[];
  credits?: {
    remaining: number;
    total: number;
    resetDate: Date;
  };
}

export interface UserModelStatus {
  isTrainingComplete: boolean;
  trainingProgress?: number;
  triggerWord?: string;
  modelVersion?: string;
  lastTrainingDate?: Date;
  totalPhotos?: number;
}

// === Maya Chat System ===

export interface MayaChat {
  id: string;
  userId: string;
  title: string;
  summary?: string;
  category: MayaCategory;
  messages: MayaChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  lastActivity: Date;
  isArchived?: boolean;
  metadata?: {
    sessionType?: 'onboarding' | 'consultation' | 'generation' | 'support';
    context?: Record<string, unknown>;
  };
}

export interface MayaChatMessage {
  id: string;
  chatId: string;
  role: 'user' | 'maya';
  content: string;
  conceptCards?: ConceptCard[];
  images?: string[];
  metadata?: {
    processingTime?: number;
    tokens?: number;
    model?: string;
    streamId?: string;
  };
  createdAt: Date;
  isStreaming?: boolean;
}

export interface ConceptCard {
  id: string;
  title: string;
  description: string;
  category: MayaCategory;
  fluxPrompt: string;
  fullPrompt?: string;
  style?: string;
  imageUrl?: string;
  generatedImages?: string[];
  isGenerating?: boolean;
  hasGenerated?: boolean;
  metadata?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime?: number;
    tags?: string[];
  };
}

// === Maya Categories ===

export type MayaCategory = 
  | 'business'
  | 'lifestyle' 
  | 'travel'
  | 'creative'
  | 'editorial'
  | 'casual'
  | 'professional'
  | 'luxury'
  | 'portrait'
  | 'flatlay'
  | 'product';

// === Maya API Types ===

export interface MayaChatRequest {
  message: string;
  chatId?: string;
  chatHistory?: MayaChatMessage[];
  context?: {
    userPreferences?: UserPreferences;
    brandContext?: BrandContext;
    sessionType?: string;
  };
}

export interface MayaChatResponse {
  message: MayaChatMessage;
  chat: MayaChat;
  suggestions?: string[];
  conceptCards?: ConceptCard[];
  metadata?: {
    agentName: string;
    agentType: string;
    timestamp: string;
  };
}

export interface MayaGenerateRequest {
  prompt: string;
  style?: string;
  category?: MayaCategory;
  count?: number;
  conceptName?: string;
  seed?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
  quality?: 'draft' | 'standard' | 'high';
}

export interface MayaGenerateResponse {
  images: string[];
  prompt: string;
  metadata: {
    modelUsed: string;
    processingTime: number;
    seed?: string;
    conceptId?: string;
  };
}

export interface MayaVideoRequest {
  imageUrl: string;
  duration?: number;
  style?: string;
  motion?: 'subtle' | 'moderate' | 'dynamic';
}

export interface MayaVideoResponse {
  videoUrl: string;
  duration: number;
  format: string;
  metadata: {
    processingTime: number;
    quality: string;
  };
}

// === Maya Onboarding ===

export interface MayaOnboardingStatus {
  step: 'welcome' | 'brand-questionnaire' | 'photo-upload' | 'training' | 'complete';
  completedSteps: string[];
  currentStepData?: Record<string, unknown>;
  brandQuestionnaire?: BrandQuestionnaire;
  photoUploadStatus?: PhotoUploadStatus;
  trainingStatus?: TrainingStatus;
}

export interface BrandQuestionnaire {
  businessType?: string;
  industry?: string;
  targetAudience?: string;
  brandPersonality?: string[];
  primaryPlatform?: string;
  stylePreferences?: string[];
  completedAt?: Date;
}

export interface PhotoUploadStatus {
  totalPhotos: number;
  processedPhotos: number;
  validPhotos: number;
  rejectedPhotos: string[];
  uploadedAt?: Date;
}

export interface TrainingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;
  triggerWord?: string;
  error?: string;
}

// === Maya Error Types ===

export interface MayaError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  context?: {
    userId?: string;
    chatId?: string;
    requestId?: string;
    timestamp: Date;
  };
}

// === Maya Memory & Context ===

export interface MayaMemory {
  userId: string;
  memories: MemoryEntry[];
  preferences: UserPreferences;
  brandContext: BrandContext;
  conversationHistory: ConversationSummary[];
  lastUpdated: Date;
}

export interface MemoryEntry {
  id: string;
  type: 'preference' | 'feedback' | 'style' | 'brand' | 'behavioral';
  content: string;
  weight: number; // Importance score 0-1
  createdAt: Date;
  lastAccessed: Date;
  source: 'chat' | 'generation' | 'feedback' | 'onboarding';
}

export interface ConversationSummary {
  chatId: string;
  summary: string;
  keyTopics: string[];
  decisions: string[];
  preferences: string[];
  createdAt: Date;
}

// === Maya Generation Pipeline ===

export interface MayaGenerationPipeline {
  id: string;
  userId: string;
  steps: PipelineStep[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: MayaGenerateRequest;
  output?: MayaGenerateResponse;
  error?: MayaError;
  createdAt: Date;
  completedAt?: Date;
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
}

// === Maya Performance & Analytics ===

export interface MayaPerformanceMetrics {
  responseTime: number;
  tokensUsed: number;
  memoryUsage: number;
  cacheHits: number;
  cacheMisses: number;
  errorRate: number;
  userSatisfactionScore?: number;
}

export interface MayaUsageStats {
  userId: string;
  chatsCount: number;
  messagesCount: number;
  imagesGenerated: number;
  videosGenerated: number;
  creditsUsed: number;
  sessionDuration: number;
  lastActiveAt: Date;
  periodStart: Date;
  periodEnd: Date;
}