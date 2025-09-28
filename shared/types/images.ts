/**
 * Image Processing and Storage Types for Maya-Only Architecture
 * S3 storage, CDN, optimization, and image generation types
 */

// === Core Image Types ===

export interface MayaImage {
  id: string;
  userId: string;
  filename: string;
  originalFilename: string;
  url: string;
  cdnUrl?: string;
  thumbnailUrl?: string;
  type: ImageType;
  category?: ImageCategory;
  format: ImageFormat;
  size: number; // bytes
  dimensions: ImageDimensions;
  metadata: ImageMetadata;
  processingStatus: ProcessingStatus;
  storage: StorageInfo;
  generation?: GenerationInfo;
  createdAt: Date;
  updatedAt: Date;
}

export type ImageType = 
  | 'user_upload'    // Original user-uploaded training photos
  | 'generated'      // AI-generated images
  | 'processed'      // Processed/optimized versions
  | 'thumbnail'      // Thumbnails
  | 'avatar'         // Profile pictures
  | 'background'     // Background images
  | 'template';      // Template images

export type ImageCategory = 
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
  | 'product'
  | 'headshot'
  | 'full_body';

export type ImageFormat = 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif' | 'heic' | 'raw';

export type ProcessingStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'optimizing'
  | 'uploading';

export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: string; // e.g., "16:9", "1:1", "4:3"
}

export interface ImageMetadata {
  exif?: ExifData;
  colors?: ColorPalette;
  faces?: FaceDetection[];
  objects?: ObjectDetection[];
  quality?: ImageQuality;
  contentType: string;
  compression?: CompressionInfo;
  ai?: AIMetadata;
}

export interface ExifData {
  camera?: string;
  lens?: string;
  settings?: {
    iso?: number;
    aperture?: string;
    shutterSpeed?: string;
    focalLength?: string;
  };
  location?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  timestamp?: Date;
  orientation?: number;
}

export interface ColorPalette {
  dominant: string[];
  palette: string[];
  average: string;
  vibrant?: string;
  muted?: string;
}

export interface FaceDetection {
  boundingBox: BoundingBox;
  confidence: number;
  landmarks?: FaceLandmark[];
  attributes?: FaceAttributes;
}

export interface ObjectDetection {
  label: string;
  confidence: number;
  boundingBox: BoundingBox;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceLandmark {
  type: string;
  x: number;
  y: number;
}

export interface FaceAttributes {
  age?: number;
  gender?: string;
  emotion?: string;
  glasses?: boolean;
  smile?: number;
}

export interface ImageQuality {
  score: number; // 0-1
  issues?: string[];
  blur?: number;
  brightness?: number;
  contrast?: number;
  noise?: number;
}

export interface CompressionInfo {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  algorithm: string;
}

export interface AIMetadata {
  model?: string;
  prompt?: string;
  seed?: number;
  steps?: number;
  guidance?: number;
  style?: string;
  negativePrompt?: string;
  generationTime?: number;
  conceptId?: string;
}

// === Storage Information ===

export interface StorageInfo {
  provider: 'aws_s3' | 'cloudflare_r2' | 'local';
  bucket: string;
  key: string;
  region?: string;
  publicUrl: string;
  permanentUrl?: string;
  cdnUrl?: string;
  backups?: BackupInfo[];
  encryption?: EncryptionInfo;
}

export interface BackupInfo {
  provider: string;
  location: string;
  createdAt: Date;
  verified: boolean;
}

export interface EncryptionInfo {
  algorithm: string;
  keyId: string;
  encrypted: boolean;
}

// === Generation Information ===

export interface GenerationInfo {
  requestId: string;
  prompt: string;
  model: string;
  parameters: GenerationParameters;
  conceptCard?: {
    id: string;
    title: string;
    category: ImageCategory;
  };
  processingTime: number;
  cost?: number;
  batchId?: string;
  variations?: string[]; // IDs of other images in the same generation batch
}

export interface GenerationParameters {
  seed?: number;
  steps?: number;
  guidance?: number;
  style?: string;
  aspectRatio?: string;
  quality?: 'draft' | 'standard' | 'high';
  negativePrompt?: string;
  strength?: number; // For image-to-image
  init_image?: string; // For image-to-image
}

// === Image Processing Pipeline ===

export interface ImageProcessingJob {
  id: string;
  userId: string;
  imageId: string;
  type: ProcessingJobType;
  status: ProcessingStatus;
  input: ProcessingInput;
  output?: ProcessingOutput;
  steps: ProcessingStep[];
  priority: 'low' | 'normal' | 'high' | 'urgent';
  estimatedDuration?: number; // seconds
  actualDuration?: number;
  error?: ProcessingError;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export type ProcessingJobType = 
  | 'upload'
  | 'optimization'
  | 'resize'
  | 'format_conversion'
  | 'thumbnail_generation'
  | 'face_detection'
  | 'object_detection'
  | 'quality_analysis'
  | 'color_analysis'
  | 'ai_generation'
  | 'background_removal'
  | 'upscaling';

export interface ProcessingInput {
  sourceUrl: string;
  targetFormat?: ImageFormat;
  targetDimensions?: ImageDimensions;
  quality?: number; // 0-100
  parameters?: Record<string, unknown>;
}

export interface ProcessingOutput {
  urls: string[];
  metadata: ImageMetadata;
  performance: ProcessingPerformance;
}

export interface ProcessingStep {
  name: string;
  status: ProcessingStatus;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  output?: Record<string, unknown>;
  error?: string;
}

export interface ProcessingError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  retryCount: number;
}

export interface ProcessingPerformance {
  cpuTime: number;
  memoryUsage: number;
  networkTime: number;
  storageOperations: number;
}

// === Upload and Batch Operations ===

export interface ImageUpload {
  id: string;
  userId: string;
  files: UploadFile[];
  status: UploadStatus;
  type: UploadType;
  progress: UploadProgress;
  options: UploadOptions;
  results?: UploadResult[];
  error?: UploadError;
  createdAt: Date;
  completedAt?: Date;
}

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
export type UploadType = 'training' | 'generation' | 'avatar' | 'reference';

export interface UploadFile {
  name: string;
  size: number;
  type: string;
  file?: File; // Browser File object
  data?: ArrayBuffer; // For server-side processing
  preview?: string; // Data URL for preview
}

export interface UploadProgress {
  totalFiles: number;
  uploadedFiles: number;
  processedFiles: number;
  totalBytes: number;
  uploadedBytes: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

export interface UploadOptions {
  maxFileSize?: number;
  allowedFormats?: ImageFormat[];
  autoOptimize?: boolean;
  generateThumbnails?: boolean;
  extractMetadata?: boolean;
  detectFaces?: boolean;
  validateQuality?: boolean;
  category?: ImageCategory;
}

export interface UploadResult {
  originalFile: UploadFile;
  image: MayaImage;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  validationResults?: ValidationResult[];
}

export interface ValidationResult {
  type: ValidationType;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  details?: Record<string, unknown>;
}

export type ValidationType = 
  | 'file_size'
  | 'file_format'
  | 'image_dimensions'
  | 'image_quality'
  | 'face_detection'
  | 'content_safety'
  | 'duplicate_detection';

export interface UploadError {
  code: string;
  message: string;
  files?: string[]; // Failed file names
  details?: Record<string, unknown>;
}

// === Image Collections and Galleries ===

export interface ImageCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: CollectionType;
  images: string[]; // Image IDs
  thumbnail?: string; // Representative image ID
  privacy: 'private' | 'public' | 'shared';
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type CollectionType = 'gallery' | 'album' | 'project' | 'training_set' | 'generated_batch';

export interface ImageGallery extends ImageCollection {
  layout: GalleryLayout;
  sorting: GallerySorting;
  filters: GalleryFilters;
  sharing: SharingSettings;
}

export interface GalleryLayout {
  type: 'grid' | 'masonry' | 'carousel' | 'list';
  columns?: number;
  aspectRatio?: string;
  spacing?: number;
}

export interface GallerySorting {
  field: 'created_at' | 'updated_at' | 'size' | 'name' | 'quality_score';
  direction: 'asc' | 'desc';
}

export interface GalleryFilters {
  categories?: ImageCategory[];
  formats?: ImageFormat[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number;
    max: number;
  };
  tags?: string[];
  hasGeneration?: boolean;
}

export interface SharingSettings {
  enabled: boolean;
  publicUrl?: string;
  password?: string;
  expiresAt?: Date;
  downloadEnabled: boolean;
  permissions: string[];
}

// === CDN and Optimization ===

export interface CDNConfig {
  provider: 'cloudflare' | 'cloudfront' | 'fastly';
  baseUrl: string;
  zones: CDNZone[];
  caching: CachingConfig;
  optimization: OptimizationConfig;
}

export interface CDNZone {
  id: string;
  name: string;
  domain: string;
  regions: string[];
  enabled: boolean;
}

export interface CachingConfig {
  defaultTtl: number; // seconds
  browserTtl: number;
  edgeTtl: number;
  bypassCache: boolean;
  cacheByDevice: boolean;
}

export interface OptimizationConfig {
  autoWebP: boolean;
  autoAVIF: boolean;
  compression: {
    jpeg: number; // quality 0-100
    png: boolean; // lossless compression
    webp: number; // quality 0-100
  };
  resizing: {
    enabled: boolean;
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  };
}

// === API Request/Response Types ===

export interface ImageUploadRequest {
  files: File[];
  type: UploadType;
  category?: ImageCategory;
  options?: UploadOptions;
}

export interface ImageUploadResponse {
  uploadId: string;
  urls: string[];
  status: UploadStatus;
  results?: UploadResult[];
  error?: UploadError;
}

export interface ImageGenerationRequest {
  prompt: string;
  count?: number;
  style?: string;
  category?: ImageCategory;
  parameters?: GenerationParameters;
  conceptId?: string;
}

export interface ImageGenerationResponse {
  jobId: string;
  images: MayaImage[];
  status: ProcessingStatus;
  estimatedTime?: number;
  error?: ProcessingError;
}

export interface ImageListRequest {
  userId?: string;
  type?: ImageType;
  category?: ImageCategory;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'size' | 'name';
  sortOrder?: 'asc' | 'desc';
  filters?: {
    dateRange?: { start: Date; end: Date };
    sizeRange?: { min: number; max: number };
    tags?: string[];
  };
}

export interface ImageListResponse {
  images: MayaImage[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

// === Hook Types ===

export interface UseImageUploadReturn {
  upload: (request: ImageUploadRequest) => Promise<ImageUploadResponse>;
  isUploading: boolean;
  progress: UploadProgress | null;
  error: UploadError | null;
  results: UploadResult[];
  reset: () => void;
}

export interface UseImageGenerationReturn {
  generate: (request: ImageGenerationRequest) => Promise<ImageGenerationResponse>;
  isGenerating: boolean;
  progress: number;
  error: ProcessingError | null;
  results: MayaImage[];
  cancel: () => void;
}

export interface UseImageGalleryReturn {
  images: MayaImage[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  updateImage: (id: string, updates: Partial<MayaImage>) => Promise<void>;
}

// === Storage Service Types ===

export interface StorageService {
  upload: (file: File, options?: StorageUploadOptions) => Promise<StorageUploadResult>;
  download: (key: string) => Promise<ArrayBuffer>;
  delete: (key: string) => Promise<void>;
  getSignedUrl: (key: string, expiresIn?: number) => Promise<string>;
  copy: (sourceKey: string, destinationKey: string) => Promise<void>;
  move: (sourceKey: string, destinationKey: string) => Promise<void>;
  exists: (key: string) => Promise<boolean>;
  getMetadata: (key: string) => Promise<Record<string, unknown>>;
}

export interface StorageUploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  encryption?: boolean;
  acl?: 'private' | 'public-read' | 'public-read-write';
}

export interface StorageUploadResult {
  key: string;
  url: string;
  size: number;
  etag: string;
  metadata?: Record<string, unknown>;
}