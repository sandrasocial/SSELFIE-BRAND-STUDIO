/**
 * CDN Client for CloudFront/Vercel Edge Network
 * SSELFIE Platform - CDN Integration
 */

import { createHash, createSign } from 'crypto';
import type {
  CDNConfig,
  ICDNClient,
  CDNOptions,
  CDNInvalidationResult,
} from './types.js';
import {
  ConfigurationError,
  NetworkError,
  ValidationError,
  RetryHandler,
  errorReporter,
} from './errors.js';

// ============================================================================
// CDN Client Implementation
// ============================================================================

export class CDNClient implements ICDNClient {
  private readonly config: CDNConfig;

  constructor(config: CDNConfig) {
    this.config = config;
    this.validateConfig();
  }

  /**
   * Validate CDN configuration
   */
  private validateConfig(): void {
    if (!this.config.domain) {
      throw new ConfigurationError('CDN domain is required');
    }
    
    if (this.config.security.signedUrls && !this.config.security.privateKey) {
      throw new ConfigurationError('Private key is required for signed URLs');
    }
  }

  /**
   * Get CDN URL with optional transformations
   */
  getUrl(key: string, options: CDNOptions = {}): string {
    try {
      const baseUrl = `https://${this.config.domain}/${key}`;
      const url = new URL(baseUrl);
      
      // Add image transformation parameters
      if (options.width) {
        url.searchParams.set('w', options.width.toString());
      }
      
      if (options.height) {
        url.searchParams.set('h', options.height.toString());
      }
      
      if (options.quality && options.quality >= 1 && options.quality <= 100) {
        url.searchParams.set('q', options.quality.toString());
      }
      
      if (options.format) {
        url.searchParams.set('f', options.format);
      }
      
      if (options.fit) {
        url.searchParams.set('fit', options.fit);
      }

      // Generate signed URL if required
      if (options.signed && this.config.security.signedUrls) {
        const expires = options.expires || Math.floor(Date.now() / 1000) + 3600; // 1 hour default
        return this.generateSignedUrl(url.toString(), expires);
      }

      return url.toString();
      
    } catch (error) {
      throw new ValidationError(`Failed to generate CDN URL: ${error}`);
    }
  }

  /**
   * Invalidate CDN cache for specified keys
   */
  async invalidate(keys: string[]): Promise<CDNInvalidationResult> {
    if (!this.config.distributionId) {
      throw new ConfigurationError('Distribution ID is required for cache invalidation');
    }

    try {
      // For CloudFront integration
      if (this.isCloudFront()) {
        return await this.cloudFrontInvalidate(keys);
      }
      
      // For Vercel Edge Network
      if (this.isVercelEdge()) {
        return await this.vercelInvalidate(keys);
      }
      
      // Generic invalidation (webhook or API call)
      return await this.genericInvalidate(keys);
      
    } catch (error) {
      const networkError = new NetworkError(`CDN invalidation failed: ${error}`, error as Error);
      errorReporter.reportError(networkError);
      throw networkError;
    }
  }

  /**
   * Preload assets into CDN cache
   */
  async preload(keys: string[]): Promise<void> {
    try {
      // Preload by making HEAD requests to warm up the cache
      const preloadPromises = keys.map(key => this.preloadSingleAsset(key));
      
      await Promise.allSettled(preloadPromises);
      
    } catch (error) {
      const networkError = new NetworkError(`CDN preload failed: ${error}`, error as Error);
      errorReporter.reportError(networkError);
      throw networkError;
    }
  }

  /**
   * Generate signed URL with CloudFront private key
   */
  getSignedUrl(key: string, expires: number): string {
    if (!this.config.security.signedUrls) {
      throw new ConfigurationError('Signed URLs are not enabled');
    }
    
    const url = this.getUrl(key);
    return this.generateSignedUrl(url, expires);
  }

  /**
   * Get CDN cache statistics
   */
  async getCacheStats(): Promise<{ hitRate: number; requests: number; bandwidth: number }> {
    try {
      // This would integrate with CloudFront Analytics API or similar
      // For now, return mock data
      return {
        hitRate: 0.92, // 92% hit rate
        requests: 100000,
        bandwidth: 1024 * 1024 * 1024, // 1GB
      };
    } catch (error) {
      throw new NetworkError(`Failed to get cache stats: ${error}`, error as Error);
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Check if using CloudFront
   */
  private isCloudFront(): boolean {
    return this.config.domain.includes('.cloudfront.net') || !!this.config.distributionId;
  }

  /**
   * Check if using Vercel Edge Network
   */
  private isVercelEdge(): boolean {
    return this.config.domain.includes('.vercel.app') || this.config.domain.includes('.vercel.com');
  }

  /**
   * CloudFront cache invalidation
   */
  private async cloudFrontInvalidate(keys: string[]): Promise<CDNInvalidationResult> {
    // This would use AWS CloudFront SDK
    // For now, simulate the response
    const invalidationId = `I${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[CDN] CloudFront invalidation requested for ${keys.length} keys:`, keys);
    
    return {
      invalidationId,
      status: 'InProgress',
      paths: keys.map(key => `/${key}`),
      createTime: new Date(),
    };
  }

  /**
   * Vercel Edge Network cache invalidation
   */
  private async vercelInvalidate(keys: string[]): Promise<CDNInvalidationResult> {
    // This would use Vercel API
    // For now, simulate the response
    const invalidationId = `V${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[CDN] Vercel Edge invalidation requested for ${keys.length} keys:`, keys);
    
    return {
      invalidationId,
      status: 'InProgress',
      paths: keys,
      createTime: new Date(),
    };
  }

  /**
   * Generic cache invalidation via webhook or API
   */
  private async genericInvalidate(keys: string[]): Promise<CDNInvalidationResult> {
    const invalidationId = `G${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`[CDN] Generic invalidation requested for ${keys.length} keys:`, keys);
    
    return {
      invalidationId,
      status: 'Completed',
      paths: keys,
      createTime: new Date(),
    };
  }

  /**
   * Preload single asset
   */
  private async preloadSingleAsset(key: string): Promise<void> {
    try {
      const url = this.getUrl(key);
      
      await RetryHandler.withRetry(
        async () => {
          const response = await fetch(url, { method: 'HEAD' });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        },
        { maxRetries: 2, baseDelay: 1000 }
      );
      
      console.log(`[CDN] Preloaded asset: ${key}`);
      
    } catch (error) {
      console.warn(`[CDN] Failed to preload asset ${key}:`, error);
      // Don't throw - preload failures shouldn't break the operation
    }
  }

  /**
   * Generate signed URL using CloudFront private key
   */
  private generateSignedUrl(url: string, expires: number): string {
    if (!this.config.security.privateKey || !this.config.security.privateKeyId) {
      throw new ConfigurationError('Private key and key pair ID are required for signed URLs');
    }

    try {
      // Create policy statement
      const policy = {
        Statement: [
          {
            Resource: url,
            Condition: {
              DateLessThan: {
                'AWS:EpochTime': expires,
              },
            },
          },
        ],
      };

      const policyString = JSON.stringify(policy);
      const policyBase64 = Buffer.from(policyString)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      // Sign the policy
      const signature = createSign('RSA-SHA1')
        .update(policyString)
        .sign(this.config.security.privateKey, 'base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

      // Build signed URL
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}Expires=${expires}&Signature=${signature}&Key-Pair-Id=${this.config.security.privateKeyId}`;
      
    } catch (error) {
      throw new ValidationError(`Failed to generate signed URL: ${error}`);
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get optimal image format based on browser support
   */
  getOptimalFormat(userAgent: string = ''): 'avif' | 'webp' | 'jpeg' {
    if (userAgent.includes('Chrome/') && parseInt(userAgent.split('Chrome/')[1]) >= 85) {
      return 'avif';
    }
    
    if (userAgent.includes('Chrome/') || userAgent.includes('Firefox/') || userAgent.includes('Edge/')) {
      return 'webp';
    }
    
    return 'jpeg';
  }

  /**
   * Generate responsive image URLs
   */
  getResponsiveUrls(key: string, options: CDNOptions = {}): {
    original: string;
    large: string;
    medium: string;
    small: string;
    thumbnail: string;
  } {
    const baseOptions = { ...options };
    
    return {
      original: this.getUrl(key, baseOptions),
      large: this.getUrl(key, { ...baseOptions, width: 1920, quality: 85 }),
      medium: this.getUrl(key, { ...baseOptions, width: 1024, quality: 80 }),
      small: this.getUrl(key, { ...baseOptions, width: 640, quality: 75 }),
      thumbnail: this.getUrl(key, { ...baseOptions, width: 200, height: 200, fit: 'cover', quality: 70 }),
    };
  }

  /**
   * Generate srcSet for responsive images
   */
  generateSrcSet(key: string, options: CDNOptions = {}): string {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    
    return widths
      .map(width => {
        const url = this.getUrl(key, { ...options, width });
        return `${url} ${width}w`;
      })
      .join(', ');
  }

  /**
   * Get cache control header for asset type
   */
  getCacheControl(key: string): string {
    // Determine asset type from extension
    const ext = key.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'avif':
        return `public, max-age=${this.config.caching.images}, stale-while-revalidate=86400`;
      
      case 'css':
      case 'js':
        return `public, max-age=${this.config.caching.staticAssets}, immutable`;
      
      case 'html':
        return `public, max-age=${this.config.caching.api}, must-revalidate`;
      
      default:
        return `public, max-age=${this.config.caching.images}`;
    }
  }

  /**
   * Update CDN configuration
   */
  updateConfig(newConfig: Partial<CDNConfig>): void {
    Object.assign(this.config, newConfig);
    this.validateConfig();
  }

  /**
   * Get current CDN configuration
   */
  getConfig(): CDNConfig {
    return { ...this.config };
  }
}