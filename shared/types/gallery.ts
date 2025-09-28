/**
 * Gallery System Types for Maya-Only Architecture
 * Image galleries, collections, sharing, and organization types
 */

import { MayaImage, ImageCategory } from './images.js';
import { MayaUser } from './maya.js';

// === Core Gallery Types ===

export interface Gallery {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: GalleryType;
  visibility: GalleryVisibility;
  images: GalleryImage[];
  metadata: GalleryMetadata;
  layout: GalleryLayout;
  sorting: GallerySorting;
  filters: GalleryFilters;
  sharing: SharingConfig;
  statistics: GalleryStatistics;
  createdAt: Date;
  updatedAt: Date;
  lastViewedAt?: Date;
}

export type GalleryType = 
  | 'personal'      // User's personal gallery
  | 'project'       // Project-specific gallery
  | 'collection'    // Curated collection
  | 'campaign'      // Marketing campaign gallery
  | 'portfolio'     // Public portfolio
  | 'archive'       // Archived images
  | 'shared'        // Shared with others
  | 'favorites';    // User's favorites

export type GalleryVisibility = 'private' | 'public' | 'unlisted' | 'shared';

export interface GalleryImage {
  id: string;
  imageId: string;
  image: MayaImage;
  order: number;
  tags: string[];
  annotations: ImageAnnotation[];
  metadata: GalleryImageMetadata;
  addedAt: Date;
  addedBy: string; // User ID
}

export interface ImageAnnotation {
  id: string;
  type: AnnotationType;
  content: string;
  position?: AnnotationPosition;
  author: string; // User ID
  createdAt: Date;
  updatedAt?: Date;
}

export type AnnotationType = 'note' | 'comment' | 'tag' | 'rating' | 'correction';

export interface AnnotationPosition {
  x: number; // Percentage of image width
  y: number; // Percentage of image height
  width?: number;
  height?: number;
}

export interface GalleryImageMetadata {
  caption?: string;
  altText?: string;
  keywords: string[];
  category?: ImageCategory;
  rating?: number; // 1-5 stars
  isFeatured: boolean;
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
  lastViewedAt?: Date;
}

// === Gallery Organization ===

export interface GalleryMetadata {
  totalImages: number;
  totalSize: number; // bytes
  categories: CategoryCount[];
  tags: TagCount[];
  dateRange: {
    earliest: Date;
    latest: Date;
  };
  lastActivity: Date;
  isPublic: boolean;
  allowComments: boolean;
  allowDownloads: boolean;
}

export interface CategoryCount {
  category: ImageCategory;
  count: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface GalleryLayout {
  type: LayoutType;
  columns?: number;
  aspectRatio?: AspectRatio;
  spacing: number;
  showCaptions: boolean;
  showMetadata: boolean;
  enableZoom: boolean;
  enableFullscreen: boolean;
  theme: GalleryTheme;
}

export type LayoutType = 
  | 'grid'          // Regular grid layout
  | 'masonry'       // Pinterest-style masonry
  | 'carousel'      // Horizontal carousel
  | 'slideshow'     // Full-screen slideshow
  | 'list'          // List with thumbnails
  | 'magazine'      // Magazine-style layout
  | 'polaroid';     // Polaroid-style cards

export type AspectRatio = 'original' | '1:1' | '4:3' | '16:9' | '3:4' | '9:16';

export interface GalleryTheme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  borderRadius: number;
  shadows: boolean;
}

export interface GallerySorting {
  field: SortField;
  direction: 'asc' | 'desc';
  secondary?: {
    field: SortField;
    direction: 'asc' | 'desc';
  };
}

export type SortField = 
  | 'date_added'
  | 'date_created'
  | 'name'
  | 'size'
  | 'rating'
  | 'views'
  | 'downloads'
  | 'category'
  | 'custom_order';

export interface GalleryFilters {
  categories?: ImageCategory[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  sizeRange?: {
    min: number; // bytes
    max: number; // bytes
  };
  rating?: {
    min: number;
    max: number;
  };
  hasAnnotations?: boolean;
  isPublic?: boolean;
  addedBy?: string[]; // User IDs
}

// === Sharing and Collaboration ===

export interface SharingConfig {
  enabled: boolean;
  publicUrl?: string;
  slug: string;
  password?: string;
  expiresAt?: Date;
  permissions: SharingPermissions;
  analytics: SharingAnalytics;
  customization: SharingCustomization;
}

export interface SharingPermissions {
  canView: boolean;
  canDownload: boolean;
  canComment: boolean;
  canShare: boolean;
  canEdit: boolean;
  allowedUsers?: string[]; // User IDs or email addresses
  allowedDomains?: string[];
}

export interface SharingAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  downloads: number;
  shares: number;
  comments: number;
  lastAccessed?: Date;
  topReferrers: Referrer[];
  viewsByDate: ViewData[];
}

export interface Referrer {
  source: string;
  views: number;
  percentage: number;
}

export interface ViewData {
  date: Date;
  views: number;
  uniqueVisitors: number;
}

export interface SharingCustomization {
  title?: string;
  description?: string;
  logoUrl?: string;
  brandColors?: {
    primary: string;
    secondary: string;
  };
  customCss?: string;
  watermark?: WatermarkConfig;
}

export interface WatermarkConfig {
  enabled: boolean;
  text?: string;
  logoUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number; // 0-1
  size: 'small' | 'medium' | 'large';
}

// === Gallery Statistics ===

export interface GalleryStatistics {
  images: {
    total: number;
    byCategory: Record<ImageCategory, number>;
    byMonth: MonthlyData[];
  };
  engagement: {
    totalViews: number;
    totalDownloads: number;
    totalShares: number;
    totalComments: number;
    averageRating: number;
  };
  storage: {
    totalSize: number; // bytes
    averageFileSize: number;
    largestFile: number;
    smallestFile: number;
  };
  activity: {
    lastUpdated: Date;
    lastViewed: Date;
    mostActiveDay: string;
    uploadFrequency: number; // images per week
  };
}

export interface MonthlyData {
  month: string; // YYYY-MM format
  count: number;
  size: number; // bytes
}

// === Gallery Collections ===

export interface GalleryCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  galleries: string[]; // Gallery IDs
  tags: string[];
  isPublic: boolean;
  thumbnail?: string; // Image ID
  createdAt: Date;
  updatedAt: Date;
}

export interface SmartCollection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  rules: CollectionRule[];
  autoUpdate: boolean;
  images: string[]; // Auto-populated image IDs
  lastUpdated: Date;
  createdAt: Date;
}

export interface CollectionRule {
  field: RuleField;
  condition: RuleCondition;
  value: unknown;
  logic?: 'AND' | 'OR';
}

export type RuleField = 
  | 'category'
  | 'tags'
  | 'date_created'
  | 'date_added'
  | 'size'
  | 'rating'
  | 'filename'
  | 'has_faces'
  | 'is_generated';

export type RuleCondition = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'between'
  | 'is_empty'
  | 'is_not_empty';

// === Search and Discovery ===

export interface GallerySearch {
  query: string;
  filters?: GalleryFilters;
  sorting?: GallerySorting;
  facets: SearchFacet[];
  suggestions: string[];
  results: SearchResult[];
  totalResults: number;
  searchTime: number; // milliseconds
}

export interface SearchFacet {
  field: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}

export interface SearchResult {
  galleryId: string;
  imageId: string;
  image: MayaImage;
  relevance: number; // 0-1 score
  highlights: SearchHighlight[];
}

export interface SearchHighlight {
  field: string;
  fragments: string[];
}

// === Export and Backup ===

export interface GalleryExport {
  id: string;
  galleryId: string;
  userId: string;
  format: ExportFormat;
  status: ExportStatus;
  options: ExportOptions;
  result?: ExportResult;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export type ExportFormat = 'zip' | 'pdf' | 'html' | 'json' | 'csv';
export type ExportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface ExportOptions {
  includeMetadata: boolean;
  includeAnnotations: boolean;
  imageFormat?: 'original' | 'jpeg' | 'png' | 'webp';
  imageQuality?: number; // 0-100
  maxImageSize?: number; // pixels
  organizeFolders: boolean;
  includePrivate: boolean;
}

export interface ExportResult {
  filename: string;
  downloadUrl: string;
  size: number; // bytes
  expiresAt: Date;
  fileCount: number;
}

// === API Request/Response Types ===

export interface CreateGalleryRequest {
  name: string;
  description?: string;
  type: GalleryType;
  visibility: GalleryVisibility;
  layout?: Partial<GalleryLayout>;
  sharing?: Partial<SharingConfig>;
}

export interface UpdateGalleryRequest {
  name?: string;
  description?: string;
  visibility?: GalleryVisibility;
  layout?: Partial<GalleryLayout>;
  sharing?: Partial<SharingConfig>;
}

export interface AddImagesToGalleryRequest {
  imageIds: string[];
  tags?: string[];
  annotations?: Omit<ImageAnnotation, 'id' | 'author' | 'createdAt'>[];
}

export interface GalleryListRequest {
  userId?: string;
  type?: GalleryType;
  visibility?: GalleryVisibility;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: SortField;
  sortOrder?: 'asc' | 'desc';
}

export interface GalleryListResponse {
  galleries: Gallery[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface ShareGalleryRequest {
  permissions: SharingPermissions;
  customization?: SharingCustomization;
  expiresAt?: Date;
  password?: string;
}

export interface ShareGalleryResponse {
  publicUrl: string;
  slug: string;
  shareableLink: string;
  embedCode?: string;
}

// === Hook Types ===

export interface UseGalleryReturn {
  gallery: Gallery | null;
  isLoading: boolean;
  error: string | null;
  updateGallery: (updates: UpdateGalleryRequest) => Promise<void>;
  addImages: (request: AddImagesToGalleryRequest) => Promise<void>;
  removeImages: (imageIds: string[]) => Promise<void>;
  reorderImages: (imageIds: string[]) => Promise<void>;
  deleteGallery: () => Promise<void>;
  shareGallery: (request: ShareGalleryRequest) => Promise<ShareGalleryResponse>;
}

export interface UseGalleryListReturn {
  galleries: Gallery[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  createGallery: (request: CreateGalleryRequest) => Promise<Gallery>;
  deleteGallery: (id: string) => Promise<void>;
}

export interface UseGallerySearchReturn {
  results: SearchResult[];
  facets: SearchFacet[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, filters?: GalleryFilters) => Promise<void>;
  clearSearch: () => void;
  totalResults: number;
  searchTime: number;
}

export interface UseGalleryExportReturn {
  exports: GalleryExport[];
  isLoading: boolean;
  error: string | null;
  createExport: (galleryId: string, format: ExportFormat, options: ExportOptions) => Promise<GalleryExport>;
  downloadExport: (exportId: string) => Promise<void>;
  deleteExport: (exportId: string) => Promise<void>;
}

// === Gallery Templates ===

export interface GalleryTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  layout: GalleryLayout;
  theme: GalleryTheme;
  features: string[];
  preview: string; // Image URL
  isPremium: boolean;
  isPopular: boolean;
  createdAt: Date;
}

export type TemplateCategory = 
  | 'portfolio'
  | 'business'
  | 'personal'
  | 'photography'
  | 'art'
  | 'fashion'
  | 'architecture'
  | 'product'
  | 'travel'
  | 'wedding';

// === Gallery Widgets ===

export interface GalleryWidget {
  id: string;
  type: WidgetType;
  galleryId: string;
  config: WidgetConfig;
  embedCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type WidgetType = 
  | 'slideshow'
  | 'grid'
  | 'carousel'
  | 'single_image'
  | 'mosaic'
  | 'lightbox';

export interface WidgetConfig {
  width?: number;
  height?: number;
  autoplay?: boolean;
  showControls?: boolean;
  showTitles?: boolean;
  transition?: string;
  speed?: number;
  responsive?: boolean;
  customCss?: string;
}

// === Gallery Backup ===

export interface GalleryBackup {
  id: string;
  userId: string;
  galleryIds: string[];
  status: BackupStatus;
  type: BackupType;
  schedule?: BackupSchedule;
  storage: BackupStorage;
  encryption: BackupEncryption;
  retention: BackupRetention;
  createdAt: Date;
  lastBackup?: Date;
  nextBackup?: Date;
}

export type BackupStatus = 'active' | 'paused' | 'failed' | 'completed';
export type BackupType = 'manual' | 'scheduled' | 'automatic';

export interface BackupSchedule {
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  timezone: string;
  daysOfWeek?: number[]; // 0-6, Sunday is 0
  dayOfMonth?: number; // 1-31
}

export interface BackupStorage {
  provider: 'aws_s3' | 'google_cloud' | 'azure' | 'local';
  location: string;
  credentials?: Record<string, string>;
}

export interface BackupEncryption {
  enabled: boolean;
  algorithm?: string;
  keyId?: string;
}

export interface BackupRetention {
  keepDays: number;
  keepWeeks: number;
  keepMonths: number;
  keepYears: number;
}