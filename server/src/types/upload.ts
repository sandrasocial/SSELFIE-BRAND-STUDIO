export interface ImageUpload {
  file: File;
  preview: string;
  name: string;
  size: number;
  type: string;
  dimensions: {
    width: number;
    height: number;
  };
}

export interface UploadProgress {
  currentStep: number;
  totalImages: number;
  uploadedImages: number;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  image?: ImageUpload;
}

export interface UploadMetadata {
  dimensions: {
    width: number;
    height: number;
  };
  type: string;
  userId?: string;
  uploadedAt?: Date;
}