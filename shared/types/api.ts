// Central API Types Export
// This file exports all API-related types for consistent imports

// Re-export Maya API types
export * from './maya-api.js';

// Re-export Gallery API types (rename conflicting types)
export {
  ImageMetadata,
  GalleryImage,
  CategoryData,
  GalleryError,
  GetGalleryImagesRequest,
  UpdateImageRequest,
  DeleteImageRequest,
  BatchUpdateImagesRequest,
  GalleryImagesResponse,
  ImageUploadResponse,
  ImageProcessingResponse,
  ImageResizeOptions,
  ImageFilterOptions,
  ImageProcessingRequest
} from './gallery-api.js';

// Re-export Profile API types (avoid UserPreferences conflict)
export {
  SubscriptionDetails,
  UserProfile,
  UserPreferences as ProfileUserPreferences,
  ProfileError,
  UpdateProfileRequest,
  UpdatePreferencesRequest,
  ChangePasswordRequest,
  UpdateSubscriptionRequest,
  ProfileResponse,
  PreferencesResponse,
  SubscriptionResponse,
  UsageResponse,
  ProfileUpdateResponse,
  ProfileValidationResult,
  PreferencesValidationResult
} from './profile-api.js';

// Re-export Training API types (avoid TrainingStatus conflict)
export {
  TrainingStatus as ApiTrainingStatus,
  TrainingConfiguration,
  TrainingData,
  TrainingImage,
  TrainingError,
  TrainingMetrics,
  StartTrainingRequest,
  UpdateTrainingRequest,
  CancelTrainingRequest,
  ValidateImagesRequest,
  TrainingResponse,
  TrainingListResponse,
  ImageValidationResponse,
  TrainingProgressResponse,
  ModelResponse,
  TrainingValidationResult,
  ImageRequirements
} from './training-api.js';

// Common API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: unknown;
}

export interface ApiValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

// Common request types
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
  search?: string;
  filters?: Record<string, unknown>;
}

export interface BaseApiRequest extends PaginationParams, SortParams, SearchParams {}

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Status codes
export enum ApiStatusCode {
  OK = 200,
  Created = 201,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,
  ValidationError = 422,
  InternalServerError = 500,
  ServiceUnavailable = 503,
}

// Error types for consistent error handling
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  MAYA_ERROR = 'MAYA_ERROR',
  TRAINING_ERROR = 'TRAINING_ERROR',
  GALLERY_ERROR = 'GALLERY_ERROR',
  PROFILE_ERROR = 'PROFILE_ERROR',
}