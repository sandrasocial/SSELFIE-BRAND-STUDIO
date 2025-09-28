/**
 * CDN Integration Tests
 * SSELFIE Platform - CDN Integration Tests
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CDNClient } from '../../shared/storage/cdn-client';

describe('CDN Integration Tests', () => {
  let cdnClient: CDNClient;

  const testConfig = {
    domain: 'test-cdn.example.com',
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
  };

  beforeAll(() => {
    cdnClient = new CDNClient(testConfig);
  });

  describe('URL Generation', () => {
    it('should generate basic CDN URL', () => {
      // Arrange
      const key = 'images/test.jpg';

      // Act
      const url = cdnClient.getUrl(key);

      // Assert
      expect(url).toBe('https://test-cdn.example.com/images/test.jpg');
    });

    it('should generate CDN URL with transformations', () => {
      // Arrange
      const key = 'images/test.jpg';
      const options = {
        width: 800,
        height: 600,
        quality: 85,
        format: 'webp' as const,
        fit: 'cover' as const,
      };

      // Act
      const url = cdnClient.getUrl(key, options);

      // Assert
      expect(url).toContain('w=800');
      expect(url).toContain('h=600');
      expect(url).toContain('q=85');
      expect(url).toContain('f=webp');
      expect(url).toContain('fit=cover');
    });

    it('should generate responsive URLs', () => {
      // Arrange
      const key = 'images/hero.jpg';

      // Act
      const urls = cdnClient.getResponsiveUrls(key);

      // Assert
      expect(urls.original).toBe('https://test-cdn.example.com/images/hero.jpg');
      expect(urls.large).toContain('w=1920');
      expect(urls.medium).toContain('w=1024');
      expect(urls.small).toContain('w=640');
      expect(urls.thumbnail).toContain('w=200');
      expect(urls.thumbnail).toContain('h=200');
    });

    it('should generate srcSet for responsive images', () => {
      // Arrange
      const key = 'images/product.jpg';

      // Act
      const srcSet = cdnClient.generateSrcSet(key, { quality: 90 });

      // Assert
      expect(srcSet).toContain('320w');
      expect(srcSet).toContain('640w');
      expect(srcSet).toContain('1024w');
      expect(srcSet).toContain('1920w');
      expect(srcSet).toContain('q=90');
    });
  });

  describe('Format Detection', () => {
    it('should detect optimal format for modern browsers', () => {
      // Arrange
      const modernUserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

      // Act
      const format = cdnClient.getOptimalFormat(modernUserAgent);

      // Assert
      expect(['avif', 'webp']).toContain(format);
    });

    it('should fallback to JPEG for older browsers', () => {
      // Arrange
      const oldUserAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; rv:11.0) like Gecko';

      // Act
      const format = cdnClient.getOptimalFormat(oldUserAgent);

      // Assert
      expect(format).toBe('jpeg');
    });
  });

  describe('Cache Control', () => {
    it('should generate appropriate cache control for images', () => {
      // Arrange
      const imageKey = 'photos/image.jpg';

      // Act
      const cacheControl = cdnClient.getCacheControl(imageKey);

      // Assert
      expect(cacheControl).toContain('public');
      expect(cacheControl).toContain('max-age=86400'); // 1 day for images
      expect(cacheControl).toContain('stale-while-revalidate');
    });

    it('should generate appropriate cache control for static assets', () => {
      // Arrange
      const cssKey = 'assets/styles.css';

      // Act
      const cacheControl = cdnClient.getCacheControl(cssKey);

      // Assert
      expect(cacheControl).toContain('public');
      expect(cacheControl).toContain('max-age=31536000'); // 1 year for static assets
      expect(cacheControl).toContain('immutable');
    });

    it('should generate appropriate cache control for HTML', () => {
      // Arrange
      const htmlKey = 'pages/index.html';

      // Act
      const cacheControl = cdnClient.getCacheControl(htmlKey);

      // Assert
      expect(cacheControl).toContain('public');
      expect(cacheControl).toContain('max-age=300'); // 5 minutes for API/HTML
      expect(cacheControl).toContain('must-revalidate');
    });
  });

  describe('Configuration', () => {
    it('should validate configuration on creation', () => {
      // Arrange
      const invalidConfig = {
        domain: '', // Invalid empty domain
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
      };

      // Act & Assert
      expect(() => new CDNClient(invalidConfig)).toThrow('CDN domain is required');
    });

    it('should allow configuration updates', () => {
      // Arrange
      const newConfig = {
        domain: 'new-cdn.example.com',
      };

      // Act
      cdnClient.updateConfig(newConfig);
      const updatedConfig = cdnClient.getConfig();

      // Assert
      expect(updatedConfig.domain).toBe('new-cdn.example.com');
    });
  });

  describe('Error Handling', () => {
    it('should handle URL generation errors gracefully', () => {
      // Arrange
      const invalidKey = ''; // Empty key

      // Act & Assert
      expect(() => cdnClient.getUrl(invalidKey)).not.toThrow();
    });
  });

  describe('Mock Operations', () => {
    it('should simulate cache invalidation', async () => {
      // Arrange
      const keys = ['images/test1.jpg', 'images/test2.jpg'];

      // Act
      const result = await cdnClient.invalidate(keys);

      // Assert
      expect(result.invalidationId).toBeDefined();
      expect(result.status).toBe('InProgress');
      expect(result.paths).toEqual(['/images/test1.jpg', '/images/test2.jpg']);
      expect(result.createTime).toBeInstanceOf(Date);
    });

    it('should simulate preloading assets', async () => {
      // Arrange
      const keys = ['images/hero.jpg', 'images/banner.jpg'];

      // Act & Assert
      await expect(cdnClient.preload(keys)).resolves.not.toThrow();
    });

    it('should return mock cache statistics', async () => {
      // Act
      const stats = await cdnClient.getCacheStats();

      // Assert
      expect(stats).toHaveProperty('hitRate');
      expect(stats).toHaveProperty('requests');
      expect(stats).toHaveProperty('bandwidth');
      expect(typeof stats.hitRate).toBe('number');
      expect(typeof stats.requests).toBe('number');
      expect(typeof stats.bandwidth).toBe('number');
    });
  });
});