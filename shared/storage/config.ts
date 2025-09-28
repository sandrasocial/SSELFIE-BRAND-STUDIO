/**
 * Storage Configuration Management
 * SSELFIE Platform - Storage Config
 */

import { z } from 'zod';
import type { StorageSystemConfig, S3Config, CDNConfig } from './types.js';

// ============================================================================
// Environment Variable Schema
// ============================================================================

const StorageEnvSchema = z.object({
  // S3 Configuration
  AWS_S3_BUCKET: z.string().min(1, 'AWS_S3_BUCKET is required'),
  AWS_S3_REGION: z.string().min(1, 'AWS_S3_REGION is required').default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().min(1, 'AWS_ACCESS_KEY_ID is required'),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, 'AWS_SECRET_ACCESS_KEY is required'),
  AWS_S3_ENDPOINT: z.string().optional(),
  
  // CDN Configuration
  CDN_DOMAIN: z.string().optional().default(''),
  CDN_DISTRIBUTION_ID: z.string().optional(),
  CDN_KEY_PAIR_ID: z.string().optional(),
  CDN_PRIVATE_KEY: z.string().optional(),
  
  // Feature Flags
  STORAGE_IMAGE_OPTIMIZATION: z.enum(['true', 'false']).default('true'),
  STORAGE_CDN_ENABLED: z.enum(['true', 'false']).default('true'),
  STORAGE_UPLOAD_CHUNKING: z.enum(['true', 'false']).default('true'),
  STORAGE_VIRUS_SCANNING: z.enum(['true', 'false']).default('false'),
  STORAGE_METADATA_STRIPPING: z.enum(['true', 'false']).default('true'),
  
  // Limits
  STORAGE_MAX_FILE_SIZE: z.string().default('50MB'),
  STORAGE_MAX_CONCURRENT_UPLOADS: z.string().default('5'),
  STORAGE_MAX_RETRIES: z.string().default('3'),
  STORAGE_TIMEOUT_MS: z.string().default('30000'),
  
  // Monitoring
  STORAGE_ENABLE_METRICS: z.enum(['true', 'false']).default('true'),
  STORAGE_ENABLE_LOGGING: z.enum(['true', 'false']).default('true'),
  STORAGE_ENABLE_ALERTING: z.enum(['true', 'false']).default('false'),
  STORAGE_METRICS_RETENTION_DAYS: z.string().default('30'),
});

type StorageEnv = z.infer<typeof StorageEnvSchema>;

// ============================================================================
// Configuration Builder
// ============================================================================

export class StorageConfigManager {
  private static instance: StorageConfigManager;
  private config: StorageSystemConfig | null = null;
  private validated = false;

  private constructor() {}

  static getInstance(): StorageConfigManager {
    if (!StorageConfigManager.instance) {
      StorageConfigManager.instance = new StorageConfigManager();
    }
    return StorageConfigManager.instance;
  }

  /**
   * Load and validate configuration from environment variables
   */
  loadConfig(): StorageSystemConfig {
    if (this.config && this.validated) {
      return this.config;
    }

    try {
      const env = StorageEnvSchema.parse(process.env);
      this.config = this.buildConfig(env);
      this.validated = true;
      return this.config;
    } catch (error) {
      throw new Error(`Storage configuration validation failed: ${error}`);
    }
  }

  /**
   * Get current configuration (throws if not loaded)
   */
  getConfig(): StorageSystemConfig {
    if (!this.config || !this.validated) {
      throw new Error('Storage configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  /**
   * Build configuration object from validated environment
   */
  private buildConfig(env: StorageEnv): StorageSystemConfig {
    return {
      s3: this.buildS3Config(env),
      cdn: this.buildCDNConfig(env),
      features: {
        enableImageOptimization: env.STORAGE_IMAGE_OPTIMIZATION === 'true',
        enableCDN: env.STORAGE_CDN_ENABLED === 'true' && !!env.CDN_DOMAIN,
        enableUploadChunking: env.STORAGE_UPLOAD_CHUNKING === 'true',
        enableVirusScanning: env.STORAGE_VIRUS_SCANNING === 'true',
        enableMetadataStripping: env.STORAGE_METADATA_STRIPPING === 'true',
      },
      limits: {
        maxFileSize: this.parseSize(env.STORAGE_MAX_FILE_SIZE),
        maxConcurrentUploads: parseInt(env.STORAGE_MAX_CONCURRENT_UPLOADS, 10),
        maxRetries: parseInt(env.STORAGE_MAX_RETRIES, 10),
        timeoutMs: parseInt(env.STORAGE_TIMEOUT_MS, 10),
      },
      monitoring: {
        enableMetrics: env.STORAGE_ENABLE_METRICS === 'true',
        enableLogging: env.STORAGE_ENABLE_LOGGING === 'true',
        enableAlerting: env.STORAGE_ENABLE_ALERTING === 'true',
        metricsRetentionDays: parseInt(env.STORAGE_METRICS_RETENTION_DAYS, 10),
      },
    };
  }

  /**
   * Build S3 configuration
   */
  private buildS3Config(env: StorageEnv): S3Config {
    return {
      region: env.AWS_S3_REGION,
      bucket: env.AWS_S3_BUCKET,
      endpoint: env.AWS_S3_ENDPOINT,
      maxRetries: parseInt(env.STORAGE_MAX_RETRIES, 10),
      timeout: parseInt(env.STORAGE_TIMEOUT_MS, 10),
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    };
  }

  /**
   * Build CDN configuration
   */
  private buildCDNConfig(env: StorageEnv): CDNConfig {
    return {
      domain: env.CDN_DOMAIN || '',
      distributionId: env.CDN_DISTRIBUTION_ID,
      ttl: 86400, // 24 hours default
      security: {
        allowedOrigins: ['*'], // Configure as needed
        signedUrls: !!env.CDN_PRIVATE_KEY,
        privateKeyId: env.CDN_KEY_PAIR_ID,
        privateKey: env.CDN_PRIVATE_KEY,
      },
      caching: {
        staticAssets: 31536000, // 1 year
        images: 86400,          // 1 day
        api: 300,               // 5 minutes
      },
    };
  }

  /**
   * Parse size string (e.g., "50MB", "1GB") to bytes
   */
  private parseSize(sizeString: string): number {
    const units: Record<string, number> = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };

    const match = sizeString.match(/^(\d+)([A-Z]{1,2})$/i);
    if (!match) {
      throw new Error(`Invalid size format: ${sizeString}`);
    }

    const [, value, unit] = match;
    const multiplier = units[unit.toUpperCase()];
    
    if (!multiplier) {
      throw new Error(`Unknown size unit: ${unit}`);
    }

    return parseInt(value, 10) * multiplier;
  }

  /**
   * Get configuration for legacy compatibility
   */
  getLegacyConfig() {
    const config = this.getConfig();
    return {
      s3Config: {
        region: config.s3.region,
        credentials: config.s3.credentials,
      },
      bucketName: config.s3.bucket,
      maxRetries: config.limits.maxRetries,
      retryDelay: 2000,
    };
  }

  /**
   * Validate current configuration
   */
  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const config = this.getConfig();
      
      // Validate S3 configuration
      if (!config.s3.bucket) {
        errors.push('S3 bucket name is required');
      }
      
      if (!config.s3.credentials.accessKeyId) {
        errors.push('AWS access key ID is required');
      }
      
      if (!config.s3.credentials.secretAccessKey) {
        errors.push('AWS secret access key is required');
      }

      // Validate CDN configuration if enabled
      if (config.features.enableCDN && !config.cdn.domain) {
        errors.push('CDN domain is required when CDN is enabled');
      }

      // Validate limits
      if (config.limits.maxFileSize <= 0) {
        errors.push('Max file size must be greater than 0');
      }

      if (config.limits.maxConcurrentUploads <= 0) {
        errors.push('Max concurrent uploads must be greater than 0');
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        valid: false,
        errors: [`Configuration validation error: ${error}`],
      };
    }
  }
}

// ============================================================================
// Singleton Instance & Exports
// ============================================================================

export const storageConfig = StorageConfigManager.getInstance();

// Default configurations for different environments
export const defaultConfigs = {
  development: {
    features: {
      enableImageOptimization: true,
      enableCDN: false,
      enableUploadChunking: false,
      enableVirusScanning: false,
      enableMetadataStripping: false,
    },
    limits: {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxConcurrentUploads: 2,
      maxRetries: 2,
      timeoutMs: 15000,
    },
    monitoring: {
      enableMetrics: false,
      enableLogging: true,
      enableAlerting: false,
      metricsRetentionDays: 7,
    },
  },
  production: {
    features: {
      enableImageOptimization: true,
      enableCDN: true,
      enableUploadChunking: true,
      enableVirusScanning: true,
      enableMetadataStripping: true,
    },
    limits: {
      maxFileSize: 50 * 1024 * 1024, // 50MB
      maxConcurrentUploads: 5,
      maxRetries: 3,
      timeoutMs: 30000,
    },
    monitoring: {
      enableMetrics: true,
      enableLogging: true,
      enableAlerting: true,
      metricsRetentionDays: 30,
    },
  },
};

// Helper function to get config with fallback
export function getStorageConfig(): StorageSystemConfig {
  try {
    return storageConfig.loadConfig();
  } catch (error) {
    console.warn('Failed to load storage config from environment, using defaults:', error);
    
    // Return development defaults if config loading fails
    const env = process.env.NODE_ENV || 'development';
    const defaults = defaultConfigs[env as keyof typeof defaultConfigs] || defaultConfigs.development;
    
    return {
      s3: {
        region: process.env.AWS_S3_REGION || 'us-east-1',
        bucket: process.env.AWS_S3_BUCKET || 'sselfie-assets-dev',
        maxRetries: defaults.limits.maxRetries,
        timeout: defaults.limits.timeoutMs,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
      },
      cdn: {
        domain: process.env.CDN_DOMAIN || '',
        ttl: 86400,
        security: {
          allowedOrigins: ['*'],
          signedUrls: false,
        },
        caching: {
          staticAssets: 31536000,
          images: 86400,
          api: 300,
        },
      },
      ...defaults,
    } as StorageSystemConfig;
  }
}