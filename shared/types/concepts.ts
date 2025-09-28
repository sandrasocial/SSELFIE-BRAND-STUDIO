/**
 * Concept System Types for Maya-Only Architecture  
 * Concept cards, generation, and concept management types
 */

import { ImageCategory, MayaImage } from './images.js';
import { BrandContext, MayaCategory } from './maya.js';

// === Core Concept Types ===

export interface Concept {
  id: string;
  title: string;
  description: string;
  category: MayaCategory;
  subcategory?: string;
  tags: string[];
  difficulty: ConceptDifficulty;
  prompt: ConceptPrompt;
  style: ConceptStyle;
  variations: ConceptVariation[];
  metadata: ConceptMetadata;
  performance: ConceptPerformance;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ConceptDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ConceptPrompt {
  base: string;
  enhanced?: string;
  negative?: string;
  triggers: string[];
  placeholders: PromptPlaceholder[];
  parameters: PromptParameters;
}

export interface PromptPlaceholder {
  name: string;
  description: string;
  type: PlaceholderType;
  required: boolean;
  defaultValue?: string;
  options?: string[];
  validation?: PlaceholderValidation;
}

export type PlaceholderType = 
  | 'text'
  | 'select'
  | 'multiselect'
  | 'number'
  | 'color'
  | 'style'
  | 'pose'
  | 'lighting'
  | 'clothing'
  | 'background';

export interface PlaceholderValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface PromptParameters {
  strength?: number;
  guidance?: number;
  steps?: number;
  seed?: number;
  aspectRatio?: string;
  quality?: 'draft' | 'standard' | 'high';
}

export interface ConceptStyle {
  name: string;
  description: string;
  aesthetic: StyleAesthetic;
  technical: TechnicalStyle;
  influences: string[];
  colorPalette?: string[];
  mood: string[];
}

export interface StyleAesthetic {
  era?: string; // e.g., "modern", "vintage", "retro"
  genre?: string; // e.g., "minimalist", "maximalist", "bohemian"
  mood?: string; // e.g., "dramatic", "soft", "energetic"
  composition?: string; // e.g., "centered", "rule-of-thirds", "dynamic"
}

export interface TechnicalStyle {
  lighting?: LightingStyle;
  camera?: CameraStyle;
  processing?: ProcessingStyle;
  rendering?: RenderingStyle;
}

export interface LightingStyle {
  type: 'natural' | 'studio' | 'ambient' | 'dramatic' | 'soft' | 'hard';
  direction?: 'front' | 'side' | 'back' | 'top' | 'bottom';
  quality?: 'soft' | 'hard' | 'diffused' | 'direct';
  temperature?: 'warm' | 'cool' | 'neutral';
  intensity?: 'low' | 'medium' | 'high';
}

export interface CameraStyle {
  angle?: 'eye-level' | 'high' | 'low' | 'dutch';
  distance?: 'close-up' | 'medium' | 'wide' | 'extreme-wide';
  perspective?: 'first-person' | 'third-person' | 'aerial' | 'worms-eye';
  lens?: 'wide' | 'normal' | 'telephoto' | 'macro';
  depth?: 'shallow' | 'medium' | 'deep';
}

export interface ProcessingStyle {
  contrast?: 'low' | 'medium' | 'high';
  saturation?: 'desaturated' | 'natural' | 'vibrant';
  sharpness?: 'soft' | 'natural' | 'sharp';
  noise?: 'clean' | 'film-grain' | 'digital-noise';
  filter?: string;
}

export interface RenderingStyle {
  realism?: 'photorealistic' | 'stylized' | 'artistic' | 'abstract';
  detail?: 'minimal' | 'moderate' | 'high' | 'ultra-detailed';
  texture?: 'smooth' | 'textured' | 'rough' | 'glossy';
  finish?: 'matte' | 'satin' | 'gloss' | 'metallic';
}

export interface ConceptVariation {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
  styleModifier?: Partial<ConceptStyle>;
  parameterOverrides?: Partial<PromptParameters>;
  difficulty?: ConceptDifficulty;
  tags: string[];
  isPopular?: boolean;
}

export interface ConceptMetadata {
  creator: string; // 'maya' | 'user' | 'community'
  version: string;
  license?: string;
  attribution?: string;
  references?: string[];
  inspiration?: string[];
  usageNotes?: string[];
  tips?: string[];
  commonIssues?: ConceptIssue[];
}

export interface ConceptIssue {
  description: string;
  solution: string;
  frequency: 'rare' | 'occasional' | 'common';
}

export interface ConceptPerformance {
  usage: ConceptUsageStats;
  quality: ConceptQualityMetrics;
  user: ConceptUserMetrics;
  technical: ConceptTechnicalMetrics;
}

export interface ConceptUsageStats {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  averageRating: number;
  uniqueUsers: number;
  popularityScore: number;
  trendingScore: number;
  lastUsed: Date;
}

export interface ConceptQualityMetrics {
  aestheticScore: number; // 0-1
  technicalScore: number; // 0-1
  consistencyScore: number; // 0-1
  innovationScore: number; // 0-1
  overallScore: number; // 0-1
  userSatisfaction: number; // 0-1
  expertReview?: ExpertReview;
}

export interface ExpertReview {
  reviewer: string;
  score: number;
  comments: string;
  pros: string[];
  cons: string[];
  recommendations: string[];
  reviewedAt: Date;
}

export interface ConceptUserMetrics {
  averageExperience: ConceptDifficulty;
  successRate: number; // 0-1
  completionRate: number; // 0-1
  retryRate: number; // 0-1
  shareRate: number; // 0-1
  bookmarkRate: number; // 0-1
}

export interface ConceptTechnicalMetrics {
  averageGenerationTime: number; // seconds
  averagePromptLength: number;
  averageSteps: number;
  memoryUsage: number; // MB
  successRate: number; // 0-1
  errorRate: number; // 0-1
  optimizationScore: number; // 0-1
}

// === Concept Collections ===

export interface ConceptCollection {
  id: string;
  name: string;
  description: string;
  category: CollectionCategory;
  concepts: string[]; // Concept IDs
  tags: string[];
  difficulty: ConceptDifficulty;
  curator: string; // User ID or 'maya'
  isOfficial: boolean;
  isFeatured: boolean;
  thumbnail?: string; // Image URL
  metadata: CollectionMetadata;
  statistics: CollectionStatistics;
  createdAt: Date;
  updatedAt: Date;
}

export type CollectionCategory = 
  | 'starter_pack'
  | 'industry_specific'
  | 'style_guide'
  | 'seasonal'
  | 'trending'
  | 'advanced'
  | 'experimental'
  | 'user_created';

export interface CollectionMetadata {
  estimatedTime: number; // minutes to complete all concepts
  skillsLearned: string[];
  prerequisites: string[];
  tools: string[];
  outcomes: string[];
  difficulty: ConceptDifficulty;
}

export interface CollectionStatistics {
  totalConcepts: number;
  completedBy: number; // number of users who completed all concepts
  averageRating: number;
  totalGenerations: number;
  successRate: number;
  popularityRank: number;
}

// === Concept Generation ===

export interface ConceptGeneration {
  id: string;
  userId: string;
  conceptId: string;
  variationId?: string;
  request: GenerationRequest;
  response?: GenerationResponse;
  status: GenerationStatus;
  progress: GenerationProgress;
  results: GenerationResult[];
  feedback?: GenerationFeedback;
  metadata: GenerationMetadata;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;
}

export type GenerationStatus = 
  | 'pending'
  | 'queued'
  | 'preparing'
  | 'generating'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface GenerationRequest {
  concept: Concept;
  variation?: ConceptVariation;
  customizations: ConceptCustomization;
  brandContext?: BrandContext;
  options: GenerationOptions;
}

export interface ConceptCustomization {
  promptModifiers: string[];
  styleOverrides: Partial<ConceptStyle>;
  parameterOverrides: Partial<PromptParameters>;
  placeholderValues: Record<string, unknown>;
}

export interface GenerationOptions {
  count: number;
  quality: 'draft' | 'standard' | 'high';
  includeVariations: boolean;
  saveToGallery: boolean;
  galleryName?: string;
  tags?: string[];
  isPrivate: boolean;
}

export interface GenerationResponse {
  images: MayaImage[];
  actualPrompt: string;
  enhancedPrompt?: string;
  parameters: PromptParameters;
  model: string;
  processingTime: number;
  cost?: number;
  warnings?: string[];
}

export interface GenerationProgress {
  stage: GenerationStage;
  percentage: number;
  currentStep: string;
  totalSteps: number;
  timeElapsed: number; // seconds
  timeRemaining: number; // seconds
  queuePosition?: number;
}

export type GenerationStage = 
  | 'queued'
  | 'preparing'
  | 'enhancing_prompt'
  | 'loading_model'
  | 'generating'
  | 'post_processing'
  | 'saving'
  | 'completed';

export interface GenerationResult {
  image: MayaImage;
  prompt: string;
  parameters: PromptParameters;
  seed: number;
  score: number; // Quality score 0-1
  issues?: string[];
  suggestions?: string[];
}

export interface GenerationFeedback {
  rating: number; // 1-5 stars
  comment?: string;
  liked: boolean;
  issues: FeedbackIssue[];
  suggestions: string[];
  wouldUseAgain: boolean;
  submittedAt: Date;
}

export interface FeedbackIssue {
  type: IssueType;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export type IssueType = 
  | 'quality'
  | 'accuracy'
  | 'style'
  | 'prompt'
  | 'technical'
  | 'performance'
  | 'usability';

export interface GenerationMetadata {
  userAgent?: string;
  deviceType?: string;
  location?: string;
  sessionId?: string;
  experimentGroup?: string;
  ab_test?: string;
  referrer?: string;
}

// === Concept Discovery ===

export interface ConceptDiscovery {
  trending: Concept[];
  recommended: ConceptRecommendation[];
  newArrivals: Concept[];
  categories: ConceptCategoryInfo[];
  collections: ConceptCollection[];
  personalized: PersonalizedConcepts;
}

export interface ConceptRecommendation {
  concept: Concept;
  reason: RecommendationReason;
  score: number; // 0-1
  context?: string;
}

export type RecommendationReason = 
  | 'similar_style'
  | 'same_category'
  | 'user_history'
  | 'trending'
  | 'brand_match'
  | 'skill_level'
  | 'completion_rate'
  | 'community_favorite';

export interface ConceptCategoryInfo {
  category: MayaCategory;
  count: number;
  featured: Concept[];
  trending: Concept[];
  difficulty: ConceptDifficulty;
  description: string;
  icon?: string;
}

export interface PersonalizedConcepts {
  basedOnHistory: Concept[];
  basedOnBrand: Concept[];
  basedOnSkillLevel: Concept[];
  basedOnPreferences: Concept[];
  nextSteps: Concept[];
  challenges: Concept[];
}

// === Concept Search ===

export interface ConceptSearch {
  query: string;
  filters: ConceptFilters;
  sorting: ConceptSorting;
  facets: ConceptFacet[];
  results: ConceptSearchResult[];
  suggestions: string[];
  totalResults: number;
  searchTime: number; // milliseconds
}

export interface ConceptFilters {
  categories?: MayaCategory[];
  difficulties?: ConceptDifficulty[];
  tags?: string[];
  styles?: string[];
  minRating?: number;
  maxGenerationTime?: number;
  isFree?: boolean;
  isPremium?: boolean;
  isOfficial?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ConceptSorting {
  field: ConceptSortField;
  direction: 'asc' | 'desc';
}

export type ConceptSortField = 
  | 'relevance'
  | 'popularity'
  | 'rating'
  | 'newest'
  | 'trending'
  | 'difficulty'
  | 'usage'
  | 'alphabetical';

export interface ConceptFacet {
  field: string;
  values: ConceptFacetValue[];
}

export interface ConceptFacetValue {
  value: string;
  count: number;
  selected: boolean;
}

export interface ConceptSearchResult {
  concept: Concept;
  relevance: number; // 0-1
  highlights: SearchHighlight[];
  matchedFields: string[];
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

// === API Request/Response Types ===

export interface CreateConceptRequest {
  title: string;
  description: string;
  category: MayaCategory;
  tags: string[];
  difficulty: ConceptDifficulty;
  prompt: ConceptPrompt;
  style: ConceptStyle;
  variations?: Omit<ConceptVariation, 'id'>[];
}

export interface UpdateConceptRequest {
  title?: string;
  description?: string;
  tags?: string[];
  difficulty?: ConceptDifficulty;
  prompt?: Partial<ConceptPrompt>;
  style?: Partial<ConceptStyle>;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface GenerateFromConceptRequest {
  conceptId: string;
  variationId?: string;
  customizations?: ConceptCustomization;
  options?: GenerationOptions;
}

export interface ConceptListRequest {
  category?: MayaCategory;
  difficulty?: ConceptDifficulty;
  tags?: string[];
  search?: string;
  featured?: boolean;
  active?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: ConceptSortField;
  sortOrder?: 'asc' | 'desc';
}

export interface ConceptListResponse {
  concepts: Concept[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
  facets?: ConceptFacet[];
}

// === Hook Types ===

export interface UseConceptReturn {
  concept: Concept | null;
  isLoading: boolean;
  error: string | null;
  generate: (request: GenerateFromConceptRequest) => Promise<ConceptGeneration>;
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  results: GenerationResult[];
  feedback: (feedback: GenerationFeedback) => Promise<void>;
}

export interface UseConceptListReturn {
  concepts: Concept[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  search: (query: string, filters?: ConceptFilters) => Promise<void>;
  clearSearch: () => void;
  refresh: () => Promise<void>;
}

export interface UseConceptDiscoveryReturn {
  discovery: ConceptDiscovery | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  trackView: (conceptId: string) => void;
  trackGeneration: (conceptId: string) => void;
}

export interface UseConceptCollectionReturn {
  collection: ConceptCollection | null;
  isLoading: boolean;
  error: string | null;
  addConcept: (conceptId: string) => Promise<void>;
  removeConcept: (conceptId: string) => Promise<void>;
  reorderConcepts: (conceptIds: string[]) => Promise<void>;
  updateCollection: (updates: Partial<ConceptCollection>) => Promise<void>;
}

// === Concept Analytics ===

export interface ConceptAnalytics {
  conceptId: string;
  period: AnalyticsPeriod;
  metrics: ConceptAnalyticsMetrics;
  trends: ConceptTrends;
  demographics: ConceptDemographics;
  performance: ConceptPerformanceAnalytics;
}

export interface AnalyticsPeriod {
  start: Date;
  end: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
}

export interface ConceptAnalyticsMetrics {
  views: number;
  generations: number;
  completions: number;
  shares: number;
  bookmarks: number;
  averageRating: number;
  conversionRate: number; // views to generations
  retentionRate: number; // users who come back
}

export interface ConceptTrends {
  popularity: TrendData[];
  quality: TrendData[];
  usage: TrendData[];
  satisfaction: TrendData[];
}

export interface TrendData {
  date: Date;
  value: number;
  change?: number; // percentage change from previous period
}

export interface ConceptDemographics {
  userLevels: Record<ConceptDifficulty, number>;
  userTypes: Record<string, number>;
  locations: Record<string, number>;
  devices: Record<string, number>;
  timeOfDay: Record<string, number>;
}

export interface ConceptPerformanceAnalytics {
  successRate: number;
  averageGenerationTime: number;
  errorRate: number;
  popularVariations: string[];
  commonCustomizations: Record<string, number>;
  userSatisfactionScore: number;
}