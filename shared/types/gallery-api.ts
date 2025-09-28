// Gallery API Type Definitions
// Based on User Journey Doc Section 6

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  createdAt: Date;
  prompt?: string;
  style?: string;
  model?: string;
  seed?: string;
}

export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  category: string;
  metadata: ImageMetadata;
  isSelected?: boolean;
  isFavorite?: boolean;
  userId: string;
}

export interface CategoryData {
  name: string;
  count: number;
  preview: string[];
}

export interface GalleryError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Request types
export interface GetGalleryImagesRequest {
  category?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'category';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface UpdateImageRequest {
  imageId: string;
  metadata?: Partial<ImageMetadata>;
  isSelected?: boolean;
  isFavorite?: boolean;
  category?: string;
}

export interface DeleteImageRequest {
  imageId: string;
}

export interface BatchUpdateImagesRequest {
  imageIds: string[];
  updates: {
    isSelected?: boolean;
    isFavorite?: boolean;
    category?: string;
  };
}

// Response types
export interface GalleryImagesResponse {
  images: GalleryImage[];
  total: number;
  categories: CategoryData[];
  hasMore: boolean;
}

export interface ImageUploadResponse {
  image: GalleryImage;
  uploadUrl?: string;
}

export interface ImageProcessingResponse {
  imageId: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: GalleryImage;
  error?: GalleryError;
}

// Image processing utilities types
export interface ImageResizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ImageFilterOptions {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  blur?: number;
}

export interface ImageProcessingRequest {
  imageId: string;
  operations: {
    resize?: ImageResizeOptions;
    filter?: ImageFilterOptions;
    crop?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}