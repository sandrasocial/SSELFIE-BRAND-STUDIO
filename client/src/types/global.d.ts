import { StorageProvider } from '../lib/storage/EnhancedStorage';

declare global {
  interface Window {
    __ENHANCED_STORAGE__?: StorageProvider;
    __LEGACY_STORAGE__?: StorageProvider;
    __FEATURE_FLAGS__?: Record<string, boolean>;
  }
}