/**
 * React Hook for Storage Operations
 * SSELFIE Platform - Client Storage Hook
 */

import { useState, useCallback, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

// ============================================================================
// Types
// ============================================================================

export interface UploadOptions {
  contentType: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  metadata?: Record<string, string>;
  optimize?: boolean;
  optimizationStrategy?: string;
  generateThumbnail?: boolean;
  validateImage?: boolean;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
  thumbnailUrl?: string;
  cdnUrl?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StorageError {
  code: string;
  message: string;
  type: string;
}

// ============================================================================
// Storage Hook
// ============================================================================

export function useStorage() {
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const abortControllerRef = useRef<Record<string, AbortController>>({});

  /**
   * Upload single file
   */
  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      key,
      options = {} as UploadOptions,
    }: {
      file: File;
      key: string;
      options?: UploadOptions;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      formData.append('options', JSON.stringify(options));

      // Create abort controller for this upload
      const abortController = new AbortController();
      abortControllerRef.current[key] = abortController;

      try {
        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Upload failed');
        }

        const result: UploadResult = await response.json();
        
        // Clean up progress and abort controller
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        delete abortControllerRef.current[key];

        return result;
      } catch (error) {
        // Clean up on error
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
        delete abortControllerRef.current[key];
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
    },
  });

  /**
   * Upload multiple files with progress tracking
   */
  const uploadBatch = useCallback(
    async (
      files: Array<{ file: File; key: string; options?: UploadOptions }>,
      onProgress?: (completed: number, total: number) => void
    ): Promise<UploadResult[]> => {
      const results: UploadResult[] = [];
      const total = files.length;

      for (let i = 0; i < files.length; i++) {
        const { file, key, options } = files[i];
        
        try {
          const result = await uploadMutation.mutateAsync({ file, key, options });
          results.push(result);
        } catch (error) {
          console.error(`Failed to upload ${key}:`, error);
          // Continue with other files
        }

        if (onProgress) {
          onProgress(i + 1, total);
        }
      }

      return results;
    },
    [uploadMutation]
  );

  /**
   * Cancel upload
   */
  const cancelUpload = useCallback((key: string) => {
    const abortController = abortControllerRef.current[key];
    if (abortController) {
      abortController.abort();
      delete abortControllerRef.current[key];
      
      setUploadProgress(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  }, []);

  /**
   * Delete file
   */
  const deleteMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch(`/api/storage/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Delete failed');
      }

      return { key };
    },
  });

  /**
   * Get file URL with CDN optimization
   */
  const getUrl = useCallback(
    (key: string, options: { width?: number; height?: number; quality?: number; format?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (options.width) searchParams.set('w', options.width.toString());
      if (options.height) searchParams.set('h', options.height.toString());
      if (options.quality) searchParams.set('q', options.quality.toString());
      if (options.format) searchParams.set('f', options.format);

      const queryString = searchParams.toString();
      return `/api/storage/url/${encodeURIComponent(key)}${queryString ? `?${queryString}` : ''}`;
    },
    []
  );

  /**
   * Get responsive image URLs
   */
  const getResponsiveUrls = useCallback((key: string) => {
    return {
      original: getUrl(key),
      large: getUrl(key, { width: 1920, quality: 85 }),
      medium: getUrl(key, { width: 1024, quality: 80 }),
      small: getUrl(key, { width: 640, quality: 75 }),
      thumbnail: getUrl(key, { width: 200, height: 200, quality: 70 }),
    };
  }, [getUrl]);

  /**
   * Generate srcSet for responsive images
   */
  const generateSrcSet = useCallback(
    (key: string, options: { quality?: number; format?: string } = {}) => {
      const widths = [320, 640, 768, 1024, 1280, 1920];
      
      return widths
        .map(width => {
          const url = getUrl(key, { ...options, width });
          return `${url} ${width}w`;
        })
        .join(', ');
    },
    [getUrl]
  );

  return {
    // Upload operations
    upload: uploadMutation.mutate,
    uploadAsync: uploadMutation.mutateAsync,
    uploadBatch,
    cancelUpload,
    
    // Delete operations
    delete: deleteMutation.mutate,
    deleteAsync: deleteMutation.mutateAsync,
    
    // URL generation
    getUrl,
    getResponsiveUrls,
    generateSrcSet,
    
    // State
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    uploadProgress,
    
    // Errors
    uploadError: uploadMutation.error as StorageError | null,
    deleteError: deleteMutation.error as StorageError | null,
  };
}

// ============================================================================
// Storage Query Hook
// ============================================================================

export function useStorageQuery(key: string | null) {
  return useQuery({
    queryKey: ['storage', 'file', key],
    queryFn: async () => {
      if (!key) return null;
      
      const response = await fetch(`/api/storage/info/${encodeURIComponent(key)}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to get file info');
      }
      
      return response.json();
    },
    enabled: !!key,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Storage Metrics Hook
// ============================================================================

export function useStorageMetrics() {
  return useQuery({
    queryKey: ['storage', 'metrics'],
    queryFn: async () => {
      const response = await fetch('/api/storage/metrics');
      
      if (!response.ok) {
        throw new Error('Failed to get storage metrics');
      }
      
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

// ============================================================================
// File Validation Hook
// ============================================================================

export function useFileValidation() {
  const [validationResults, setValidationResults] = useState<Record<string, {
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>>({});

  const validateFile = useCallback(async (file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
    validateImage?: boolean;
  } = {}) => {
    const fileId = `${file.name}_${file.size}_${file.lastModified}`;
    
    try {
      // Basic validation
      const errors: string[] = [];
      const warnings: string[] = [];

      // Size validation
      if (options.maxSize && file.size > options.maxSize) {
        errors.push(`File size ${Math.round(file.size / 1024 / 1024)} MB exceeds maximum ${Math.round(options.maxSize / 1024 / 1024)} MB`);
      }

      // Type validation
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} is not allowed`);
      }

      // Image-specific validation
      if (options.validateImage && file.type.startsWith('image/')) {
        // This would typically involve reading the file and validating dimensions, etc.
        // For now, just basic checks
        if (file.size < 1024) {
          warnings.push('Image file is very small, quality may be poor');
        }
      }

      const result = {
        valid: errors.length === 0,
        errors,
        warnings,
      };

      setValidationResults(prev => ({
        ...prev,
        [fileId]: result,
      }));

      return result;
    } catch (error) {
      const result = {
        valid: false,
        errors: [`Validation failed: ${error}`],
        warnings: [],
      };

      setValidationResults(prev => ({
        ...prev,
        [fileId]: result,
      }));

      return result;
    }
  }, []);

  const clearValidation = useCallback((file: File) => {
    const fileId = `${file.name}_${file.size}_${file.lastModified}`;
    setValidationResults(prev => {
      const updated = { ...prev };
      delete updated[fileId];
      return updated;
    });
  }, []);

  return {
    validateFile,
    clearValidation,
    validationResults,
  };
}