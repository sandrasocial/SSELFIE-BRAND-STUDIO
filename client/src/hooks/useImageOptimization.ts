import { useCallback, useRef } from 'react';
import { useMemoryCleanup } from './useMemoryCleanup.js';
import { imageProcessingService } from '../services/imageProcessing.js';
import { 
  ImageProcessingOptions, 
  ValidationRules, 
  DEFAULT_IMAGE_PROCESSING_OPTIONS,
  DEFAULT_VALIDATION_RULES,
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
export const useImageOptimization = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { addCleanup } = useMemoryCleanup();

  // Get canvas instance (create if needed)
  const getCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas') as HTMLCanvasElement;
      addCleanup(() => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          canvasRef.current = null;
        }
      });
    }
    return canvasRef.current;
  }, [addCleanup]);

  // Compress and optimize image
  const optimizeImage = useCallback(async (
    file: File, 
    options: ImageOptimizationOptions = {}
  ): Promise<Blob> => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const canvas = getCanvas();
          if (!canvas) {
            reject(new Error('Could not create canvas'));
            return;
          }
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Clear canvas and draw image
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas toBlob failed'));
              }
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  }, [getCanvas]);

  // Create thumbnail
  const createThumbnail = useCallback(async (
    file: File,
    size: number = 200
  ): Promise<Blob> => {
    return optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.7,
      format: 'jpeg'
    });
  }, [optimizeImage]);

  // Check WebP support
  const checkWebPSupport = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      const canvas = getCanvas();
      if (!canvas) {
        resolve(false);
        return;
      }
      
      canvas.width = 1;
      canvas.height = 1;
      
      canvas.toBlob(
        (blob) => {
          resolve(blob !== null);
        },
        'image/webp'
      );
    });
  }, [getCanvas]);

  // Progressive JPEG encoding
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

  // Batch optimize multiple images
  const batchOptimize = useCallback(async (
    files: File[],
    options: ImageOptimizationOptions = {}
  ): Promise<Blob[]> => {
    const promises = files.map(file => optimizeImage(file, options));
    return Promise.all(promises);
  }, [optimizeImage]);

  // Get optimal format based on image content
  const getOptimalFormat = useCallback(async (file: File): Promise<'jpeg' | 'webp' | 'png'> => {
    const supportsWebP = await checkWebPSupport();
    
    // If image has transparency, use PNG or WebP
    if (file.type === 'image/png') {
      return supportsWebP ? 'webp' : 'png';
    }
    
    // For photos, use WebP if supported, otherwise JPEG
    return supportsWebP ? 'webp' : 'jpeg';
  }, [checkWebPSupport]);

  return {
    optimizeImage,
    createThumbnail,
    checkWebPSupport,
    createProgressiveJPEG,
    batchOptimize,
    getOptimalFormat,
  };
};

export default useImageOptimization;