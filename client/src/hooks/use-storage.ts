import { useState, useCallback } from 'react';
import { StorageResult } from '../lib/storage/EnhancedStorage.js';
import { useFeatureFlag } from './use-feature-flag.js';
import { infrastructureFlags } from '../../shared/feature-flags.js';

interface UseStorageOptions {
  onProgress?: (progress: number) => void;
  onError?: (error: string) => void;
}

interface UseStorageResult {
  upload: (file: File, path: string, metadata?: Record<string, string>) => Promise<StorageResult>;
  download: (path: string) => Promise<Blob>;
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useStorage(options: UseStorageOptions = {}): UseStorageResult {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [useNewStorage] = useFeatureFlag(infrastructureFlags.NEW_STORAGE_SYSTEM);

  const upload = useCallback(async (
    file: File,
    path: string,
    metadata?: Record<string, string>
  ): Promise<StorageResult> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Use enhanced or legacy storage based on feature flag
      const storage = useNewStorage
        ? window.__ENHANCED_STORAGE__
        : window.__LEGACY_STORAGE__;

      if (!storage) {
        throw new Error('Storage system not initialized');
      }

      const result = await storage.upload(file, path, metadata);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setProgress(100);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsUploading(false);
    }
  }, [useNewStorage, options]);

  const download = useCallback(async (path: string): Promise<Blob> => {
    try {
      const storage = useNewStorage
        ? window.__ENHANCED_STORAGE__
        : window.__LEGACY_STORAGE__;

      if (!storage) {
        throw new Error('Storage system not initialized');
      }

      return storage.download(path);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      options.onError?.(errorMessage);
      return new Blob(['Download failed']);
    }
  }, [useNewStorage, options]);

  return {
    upload,
    download,
    isUploading,
    progress,
    error
  };
}