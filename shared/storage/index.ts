/**
 * Storage System Main Entry Point
 * SSELFIE Platform - Storage & CDN
 */

// Core types and interfaces
export * from './types.js';
export * from './errors.js';
export * from './config.js';

// Storage clients
export { S3StorageClient } from './s3-client.js';
export { CDNClient } from './cdn-client.js';

// Main storage service
export { StorageService } from './storage-service.js';

// Re-export for convenience
export { storageConfig, getStorageConfig } from './config.js';
export { errorReporter } from './errors.js';