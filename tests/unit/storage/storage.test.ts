/**
 * Storage System Unit Tests
 * SSELFIE Platform - Storage Tests
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StorageService } from '../../../shared/storage/storage-service';
import { S3StorageClient } from '../../../shared/storage/s3-client';
import { CDNClient } from '../../../shared/storage/cdn-client';

// Mock the dependencies
jest.mock('../../../shared/storage/s3-client');
jest.mock('../../../shared/storage/cdn-client');

const MockedS3StorageClient = S3StorageClient as jest.MockedClass<typeof S3StorageClient>;
const MockedCDNClient = CDNClient as jest.MockedClass<typeof CDNClient>;

describe('StorageService', () => {
  let storageService: StorageService;
  let mockS3Client: jest.Mocked<S3StorageClient>;
  let mockCDNClient: jest.Mocked<CDNClient>;

  const mockConfig = {
    s3: {
      region: 'us-east-1',
      bucket: 'test-bucket',
      maxRetries: 3,
      timeout: 30000,
      credentials: {
        accessKeyId: 'test-key',
        secretAccessKey: 'test-secret',
      },
    },
    cdn: {
      domain: 'cdn.example.com',
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
    features: {
      enableImageOptimization: true,
      enableCDN: true,
      enableUploadChunking: false,
      enableVirusScanning: false,
      enableMetadataStripping: true,
    },
    limits: {
      maxFileSize: 50 * 1024 * 1024,
      maxConcurrentUploads: 5,
      maxRetries: 3,
      timeoutMs: 30000,
    },
    monitoring: {
      enableMetrics: true,
      enableLogging: true,
      enableAlerting: false,
      metricsRetentionDays: 30,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockS3Client = new MockedS3StorageClient(mockConfig.s3) as jest.Mocked<S3StorageClient>;
    mockCDNClient = new MockedCDNClient(mockConfig.cdn) as jest.Mocked<CDNClient>;

    // Mock implementations
    MockedS3StorageClient.mockImplementation(() => mockS3Client);
    MockedCDNClient.mockImplementation(() => mockCDNClient);

    storageService = new StorageService(mockConfig);
  });

  describe('upload', () => {
    it('should upload file successfully', async () => {
      // Arrange
      const testBuffer = Buffer.from('test file content');
      const testKey = 'test/file.jpg';
      const options = {
        contentType: 'image/jpeg',
        maxSizeBytes: 10 * 1024 * 1024,
        allowedTypes: ['image/jpeg'],
      };

      const expectedResult = {
        key: testKey,
        url: 'https://s3.amazonaws.com/test-bucket/test/file.jpg',
        size: testBuffer.length,
        contentType: 'image/jpeg',
        etag: 'test-etag',
        metadata: {},
        timestamp: Date.now(),
      };

      mockS3Client.upload.mockResolvedValue(expectedResult);
      mockS3Client.getPublicUrl.mockReturnValue('https://s3.amazonaws.com/test-bucket/test/file.jpg');
      mockCDNClient.getUrl.mockReturnValue('https://cdn.example.com/test/file.jpg');

      // Act
      const result = await storageService.upload(testBuffer, testKey, options);

      // Assert
      expect(mockS3Client.upload).toHaveBeenCalledWith(testBuffer, testKey, options);
      expect(result).toEqual({
        ...expectedResult,
        cdnUrl: 'https://cdn.example.com/test/file.jpg',
      });
    });

    it('should handle upload errors', async () => {
      // Arrange
      const testBuffer = Buffer.from('test file content');
      const testKey = 'test/file.jpg';
      const options = {
        contentType: 'image/jpeg',
        maxSizeBytes: 10 * 1024 * 1024,
        allowedTypes: ['image/jpeg'],
      };

      const uploadError = new Error('Upload failed');
      mockS3Client.upload.mockRejectedValue(uploadError);

      // Act & Assert
      await expect(storageService.upload(testBuffer, testKey, options))
        .rejects.toThrow('Upload failed');
    });

    it('should generate thumbnail when requested', async () => {
      // Arrange
      const testBuffer = Buffer.from('test image content');
      const testKey = 'test/image.jpg';
      const options = {
        contentType: 'image/jpeg',
        maxSizeBytes: 10 * 1024 * 1024,
        allowedTypes: ['image/jpeg'],
        generateThumbnail: true,
      };

      const uploadResult = {
        key: testKey,
        url: 'https://s3.amazonaws.com/test-bucket/test/image.jpg',
        size: testBuffer.length,
        contentType: 'image/jpeg',
        etag: 'test-etag',
        metadata: {},
        timestamp: Date.now(),
      };

      mockS3Client.upload.mockResolvedValue(uploadResult);
      mockS3Client.exists.mockResolvedValue(true);
      mockS3Client.getPublicUrl.mockReturnValue('https://s3.amazonaws.com/test-bucket/test/image.jpg');
      mockCDNClient.getUrl.mockReturnValue('https://cdn.example.com/test/image.jpg');

      // Act
      const result = await storageService.upload(testBuffer, testKey, options);

      // Assert
      expect(mockS3Client.upload).toHaveBeenCalledTimes(2); // Main file + thumbnail
      expect(result.thumbnailUrl).toBeDefined();
    });
  });

  describe('download', () => {
    it('should download file successfully', async () => {
      // Arrange
      const testKey = 'test/file.jpg';
      const testBuffer = Buffer.from('test file content');

      mockS3Client.download.mockResolvedValue(testBuffer);

      // Act
      const result = await storageService.download(testKey);

      // Assert
      expect(mockS3Client.download).toHaveBeenCalledWith(testKey, {});
      expect(result).toEqual(testBuffer);
    });

    it('should handle download errors', async () => {
      // Arrange
      const testKey = 'test/file.jpg';
      const downloadError = new Error('File not found');

      mockS3Client.download.mockRejectedValue(downloadError);

      // Act & Assert
      await expect(storageService.download(testKey))
        .rejects.toThrow('File not found');
    });
  });

  describe('delete', () => {
    it('should delete file and thumbnail successfully', async () => {
      // Arrange
      const testKey = 'test/file.jpg';
      const thumbnailKey = 'test/file_thumb.jpg';

      mockS3Client.delete.mockResolvedValue(undefined);
      mockS3Client.exists.mockResolvedValue(true);
      mockCDNClient.invalidate.mockResolvedValue({
        invalidationId: 'test-invalidation',
        status: 'InProgress',
        paths: [testKey, thumbnailKey],
        createTime: new Date(),
      });

      // Act
      await storageService.delete(testKey);

      // Assert
      expect(mockS3Client.delete).toHaveBeenCalledWith(testKey);
      expect(mockS3Client.delete).toHaveBeenCalledWith(thumbnailKey);
      expect(mockCDNClient.invalidate).toHaveBeenCalledWith([testKey, thumbnailKey]);
    });
  });

  describe('getUrl', () => {
    it('should return CDN URL when CDN is enabled', () => {
      // Arrange
      const testKey = 'test/file.jpg';
      const options = { width: 300, height: 200 };
      const expectedUrl = 'https://cdn.example.com/test/file.jpg?w=300&h=200';

      mockCDNClient.getUrl.mockReturnValue(expectedUrl);

      // Act
      const result = storageService.getUrl(testKey, options);

      // Assert
      expect(mockCDNClient.getUrl).toHaveBeenCalledWith(testKey, options);
      expect(result).toBe(expectedUrl);
    });

    it('should return S3 URL when CDN is disabled', () => {
      // Arrange
      const testKey = 'test/file.jpg';
      const disabledCDNConfig = {
        ...mockConfig,
        features: { ...mockConfig.features, enableCDN: false },
      };

      const serviceWithoutCDN = new StorageService(disabledCDNConfig);
      mockS3Client.getPublicUrl.mockReturnValue('https://s3.amazonaws.com/test-bucket/test/file.jpg');

      // Act
      const result = serviceWithoutCDN.getUrl(testKey);

      // Assert
      expect(result).toBe('https://s3.amazonaws.com/test-bucket/test/file.jpg');
    });
  });

  describe('getResponsiveUrls', () => {
    it('should return responsive URLs from CDN', () => {
      // Arrange
      const testKey = 'test/image.jpg';
      const expectedUrls = {
        original: 'https://cdn.example.com/test/image.jpg',
        large: 'https://cdn.example.com/test/image.jpg?w=1920&q=85',
        medium: 'https://cdn.example.com/test/image.jpg?w=1024&q=80',
        small: 'https://cdn.example.com/test/image.jpg?w=640&q=75',
        thumbnail: 'https://cdn.example.com/test/image.jpg?w=200&h=200&q=70',
      };

      mockCDNClient.getResponsiveUrls.mockReturnValue(expectedUrls);

      // Act
      const result = storageService.getResponsiveUrls(testKey);

      // Assert
      expect(mockCDNClient.getResponsiveUrls).toHaveBeenCalledWith(testKey, {});
      expect(result).toEqual(expectedUrls);
    });
  });

  describe('uploadBatch', () => {
    it('should upload multiple files successfully', async () => {
      // Arrange
      const files = [
        {
          file: Buffer.from('file 1 content'),
          key: 'test/file1.jpg',
          options: { contentType: 'image/jpeg', maxSizeBytes: 1024, allowedTypes: ['image/jpeg'] },
        },
        {
          file: Buffer.from('file 2 content'),
          key: 'test/file2.jpg',
          options: { contentType: 'image/jpeg', maxSizeBytes: 1024, allowedTypes: ['image/jpeg'] },
        },
      ];

      const uploadResults = files.map(({ key }, index) => ({
        key,
        url: `https://s3.amazonaws.com/test-bucket/${key}`,
        size: `file ${index + 1} content`.length,
        contentType: 'image/jpeg',
        etag: `test-etag-${index + 1}`,
        metadata: {},
        timestamp: Date.now(),
      }));

      mockS3Client.upload
        .mockResolvedValueOnce(uploadResults[0])
        .mockResolvedValueOnce(uploadResults[1]);

      const progressCallback = jest.fn();

      // Act
      const results = await storageService.uploadBatch(files, progressCallback);

      // Assert
      expect(results).toHaveLength(2);
      expect(progressCallback).toHaveBeenCalledWith(1, 2);
      expect(progressCallback).toHaveBeenCalledWith(2, 2);
    });
  });

  describe('metrics', () => {
    it('should track upload metrics', async () => {
      // Arrange
      const testBuffer = Buffer.from('test content');
      const testKey = 'test/file.jpg';
      const options = {
        contentType: 'image/jpeg',
        maxSizeBytes: 1024,
        allowedTypes: ['image/jpeg'],
      };

      const uploadResult = {
        key: testKey,
        url: 'https://s3.amazonaws.com/test-bucket/test/file.jpg',
        size: testBuffer.length,
        contentType: 'image/jpeg',
        etag: 'test-etag',
        metadata: {},
        timestamp: Date.now(),
      };

      mockS3Client.upload.mockResolvedValue(uploadResult);

      // Act
      await storageService.upload(testBuffer, testKey, options);
      const metrics = storageService.getMetrics();

      // Assert
      expect(metrics.uploads.total).toBe(1);
      expect(metrics.uploads.successful).toBe(1);
      expect(metrics.uploads.failed).toBe(0);
      expect(metrics.uploads.totalSize).toBe(testBuffer.length);
    });

    it('should track failed upload metrics', async () => {
      // Arrange
      const testBuffer = Buffer.from('test content');
      const testKey = 'test/file.jpg';
      const options = {
        contentType: 'image/jpeg',
        maxSizeBytes: 1024,
        allowedTypes: ['image/jpeg'],
      };

      mockS3Client.upload.mockRejectedValue(new Error('Upload failed'));

      // Act
      try {
        await storageService.upload(testBuffer, testKey, options);
      } catch (error) {
        // Expected to fail
      }

      const metrics = storageService.getMetrics();

      // Assert
      expect(metrics.uploads.total).toBe(1);
      expect(metrics.uploads.successful).toBe(0);
      expect(metrics.uploads.failed).toBe(1);
    });
  });
});