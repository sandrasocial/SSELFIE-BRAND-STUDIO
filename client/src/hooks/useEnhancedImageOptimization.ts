// Enhanced Image Optimization Hook
// Integrates with the new ImageProcessingService for consistent behavior

import { useCallback } from 'react';
import { imageProcessingService } from '../services/imageProcessing.js';
import { 
  ImageProcessingOptions, 
  ValidationRules, 
  DEFAULT_IMAGE_PROCESSING_OPTIONS,
  ErrorState
} from '../../../shared/types/client-training.js';

// Legacy interface for backwards compatibility
interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Enhanced Image Optimization Hook
 * Features: Client-side compression, format conversion, progressive loading, validation
 * Integrates with the new ImageProcessingService for consistent behavior
 */
export const useEnhancedImageOptimization = () => {
  // Enhanced image validation
  const validateImages = useCallback((
    files: File[], 
    rules?: ValidationRules
  ): ErrorState[] => {
    return imageProcessingService.validateImages(files, rules);
  }, []);

  // Compress and optimize image - Enhanced version
  const optimizeImage = useCallback(async (
    file: File, 
    options: ImageOptimizationOptions = {},
    onProgress?: (progress: number) => void
  ): Promise<Blob> => {
    // Convert legacy options to new format
    const processingOptions: ImageProcessingOptions = {
      maxWidth: options.maxWidth || DEFAULT_IMAGE_PROCESSING_OPTIONS.maxWidth,
      maxHeight: options.maxHeight || DEFAULT_IMAGE_PROCESSING_OPTIONS.maxHeight,
      quality: options.quality || DEFAULT_IMAGE_PROCESSING_OPTIONS.quality,
      format: options.format || DEFAULT_IMAGE_PROCESSING_OPTIONS.format
    };

    try {
      const base64Result = await imageProcessingService.compressImage(
        file, 
        processingOptions, 
        onProgress
      );
      
      // Convert base64 to Blob for backwards compatibility
      const response = await fetch(base64Result);
      return await response.blob();
    } catch (error) {
      throw error;
    }
  }, []);

  // Enhanced batch processing
  const batchOptimize = useCallback(async (
    files: File[],
    options: ImageOptimizationOptions = {},
    onProgress?: (completed: number, total: number, currentFile: string) => void
  ): Promise<Blob[]> => {
    // Convert legacy options to new format
    const processingOptions: ImageProcessingOptions = {
      maxWidth: options.maxWidth || DEFAULT_IMAGE_PROCESSING_OPTIONS.maxWidth,  
      maxHeight: options.maxHeight || DEFAULT_IMAGE_PROCESSING_OPTIONS.maxHeight,
      quality: options.quality || DEFAULT_IMAGE_PROCESSING_OPTIONS.quality,
      format: options.format || DEFAULT_IMAGE_PROCESSING_OPTIONS.format
    };

    try {
      const base64Results = await imageProcessingService.batchProcessImages(
        files,
        processingOptions,
        onProgress
      );

      // Convert base64 results to Blobs
      const blobPromises = base64Results.map(async (base64) => {
        const response = await fetch(base64);
        return await response.blob();
      });

      return await Promise.all(blobPromises);
    } catch (error) {
      throw error;
    }
  }, []);

  // Create thumbnail for preview
  const createThumbnail = useCallback(async (
    file: File,
    size: number = 150
  ): Promise<Blob> => {
    try {
      const base64Result = await imageProcessingService.createThumbnail(file, size);
      const response = await fetch(base64Result);
      return await response.blob();
    } catch (error) {
      throw error;
    }
  }, []);

  // Check WebP support
  const checkWebPSupport = useCallback((): boolean => {
    const canvas = document.createElement('canvas') as HTMLCanvasElement;
    return canvas.toDataURL('image/webp').indexOf('webp') > -1;
  }, []);

  // Progressive JPEG encoding - Legacy support
  const createProgressiveJPEG = useCallback(async (
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<Blob> => {
    // Note: Browser's canvas API doesn't support progressive JPEG encoding
    // This would typically be done server-side, but we can optimize quality
    return optimizeImage(file, {
      ...options,
      format: 'jpeg',
      quality: options.quality || 0.85
    });
  }, [optimizeImage]);

  // Get optimal format based on image content
  const getOptimalFormat = useCallback((file: File): 'jpeg' | 'webp' | 'png' => {
    const supportsWebP = checkWebPSupport();
    
    // If image has transparency, use PNG or WebP
    if (file.type === 'image/png') {
      return supportsWebP ? 'webp' : 'png';
    }
    
    // For photos, use WebP if supported, otherwise JPEG
    return supportsWebP ? 'webp' : 'jpeg';
  }, [checkWebPSupport]);

  // Get processing service for direct access
  const getImageProcessingService = useCallback(() => {
    return imageProcessingService;
  }, []);

  // Cleanup resources
  const cleanup = useCallback(() => {
    imageProcessingService.cleanup();
  }, []);

  return {
    // Enhanced methods
    validateImages,
    
    // Core methods
    optimizeImage,
    createThumbnail,
    checkWebPSupport,
    createProgressiveJPEG,
    batchOptimize,
    getOptimalFormat,
    cleanup,
    
    // Service access
    getImageProcessingService
  };
};

export default useEnhancedImageOptimization;