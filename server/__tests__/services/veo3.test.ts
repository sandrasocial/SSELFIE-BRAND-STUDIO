/**
 * VEO 3 Service Tests
 * Tests for the VEO 3 video generation service
 */

import fetch from 'node-fetch';
import { generateVeo3Video, getVeo3Status, getQualityPreset } from '../../services/video/veo3';

// Mock node-fetch
jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('VEO 3 Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default environment variables
    process.env.GOOGLE_API_KEY = 'test-google-api-key';
    process.env.VEO3_ENABLED = '1';
  });

  afterEach(() => {
    delete process.env.GOOGLE_API_KEY;
    delete process.env.VEO3_ENABLED;
    delete process.env.VEO3_MODEL;
  });

  describe('Quality Presets', () => {
    test('should return correct preview preset', () => {
      const preset = getQualityPreset('preview');
      
      expect(preset).toEqual({
        maxDurationSeconds: 5,
        resolution: '720p',
        steps: 20,
        description: 'Fast preview generation (5s max, lower quality)'
      });
    });

    test('should return correct production preset', () => {
      const preset = getQualityPreset('production');
      
      expect(preset).toEqual({
        maxDurationSeconds: 30,
        resolution: '1080p',
        steps: 50,
        description: 'High-quality production video (30s max, full quality)'
      });
    });
  });

  describe('generateVeo3Video', () => {
    const mockOptions = {
      motionPrompt: 'A person walking through a serene forest',
      mode: 'preview' as const,
      userId: 'test-user-123',
      aspectRatio: '9:16' as const
    };

    test('should throw error if Google API key is missing', async () => {
      delete process.env.GOOGLE_API_KEY;

      await expect(generateVeo3Video(mockOptions))
        .rejects
        .toThrow('Google VEO 3 not configured: missing GOOGLE_API_KEY');
    });

    test('should successfully generate video with basic options', async () => {
      // Mock model discovery
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            models: [{ name: 'models/veo-3.0-generate-001' }]
          })
        } as any)
        // Mock video generation
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            name: 'operations/test-job-123'
          })
        } as any);

      const result = await generateVeo3Video(mockOptions);

      expect(result).toEqual({
        jobId: 'operations/test-job-123',
        provider: 'google',
        estimatedTime: '30-90 seconds'
      });

      // Verify the generation request payload
      const generationCall = mockFetch.mock.calls[1];
      const payload = JSON.parse(generationCall[1]?.body as string);
      
      expect(payload).toEqual({
        prompt: { text: mockOptions.motionPrompt },
        config: {
          aspectRatio: 'PORTRAIT',
          durationSeconds: 5,
          quality: 'MEDIUM',
          frameRate: 24
        }
      });
    });

    test('should include init image URL when provided', async () => {
      const optionsWithImage = {
        ...mockOptions,
        initImageUrl: 'https://example.com/image.jpg'
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ models: [{ name: 'models/veo-3.0-generate-001' }] })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ name: 'operations/test-job-123' })
        } as any);

      await generateVeo3Video(optionsWithImage);

      const generationCall = mockFetch.mock.calls[1];
      const payload = JSON.parse(generationCall[1]?.body as string);
      
      expect(payload.config.imageUrl).toBe('https://example.com/image.jpg');
    });

    test('should return audio warning when audio script provided', async () => {
      const optionsWithAudio = {
        ...mockOptions,
        audioScript: 'This is a test audio script'
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ models: [{ name: 'models/veo-3.0-generate-001' }] })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ name: 'operations/test-job-123' })
        } as any);

      const result = await generateVeo3Video(optionsWithAudio);

      expect(result.audioWarning).toBe(
        'Audio script provided but VEO 3 does not currently support direct audio generation. The script has been saved for future reference.'
      );
    });

    test('should use production settings for production mode', async () => {
      const productionOptions = {
        ...mockOptions,
        mode: 'production' as const
      };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ models: [{ name: 'models/veo-3.0-generate-001' }] })
        } as any)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ name: 'operations/test-job-123' })
        } as any);

      const result = await generateVeo3Video(productionOptions);

      expect(result.estimatedTime).toBe('3-8 minutes');

      const generationCall = mockFetch.mock.calls[1];
      const payload = JSON.parse(generationCall[1]?.body as string);
      
      expect(payload.config).toEqual({
        aspectRatio: 'PORTRAIT',
        durationSeconds: 30,
        quality: 'HIGH',
        frameRate: 30
      });
    });

    test('should handle API errors gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ models: [{ name: 'models/veo-3.0-generate-001' }] })
        } as any)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: () => Promise.resolve('Internal Server Error')
        } as any);

      await expect(generateVeo3Video(mockOptions))
        .rejects
        .toThrow('VEO 3 generation failed (500): Internal Server Error');
    });

    test('should fallback to default models if discovery fails', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ name: 'operations/test-job-123' })
        } as any);

      const result = await generateVeo3Video(mockOptions);

      expect(result.jobId).toBe('operations/test-job-123');
      
      // Should have tried the first fallback model
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('veo-3.0-generate-001'),
        expect.any(Object)
      );
    });
  });

  describe('getVeo3Status', () => {
    const mockJobId = 'operations/test-job-123';
    const mockUserId = 'test-user-123';

    test('should return failed status if Google API key is missing', async () => {
      delete process.env.GOOGLE_API_KEY;

      const result = await getVeo3Status(mockJobId, mockUserId);

      expect(result).toEqual({
        status: 'failed',
        error: 'Google VEO 3 not configured'
      });
    });

    test('should return processing status for incomplete job', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          done: false,
          metadata: { progressPercent: 45 }
        })
      } as any);

      const result = await getVeo3Status(mockJobId, mockUserId);

      expect(result).toEqual({
        status: 'processing',
        progress: 45,
        estimatedTime: '2-5 minutes remaining'
      });
    });

    test('should return completed status with video URL', async () => {
      const mockVideoUrl = 'https://example.com/video.mp4';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          done: true,
          response: {
            video: { uri: mockVideoUrl }
          }
        })
      } as any);

      const result = await getVeo3Status(mockJobId, mockUserId);

      expect(result).toEqual({
        status: 'completed',
        progress: 100,
        videoUrl: mockVideoUrl,
        completedAt: expect.any(String)
      });
    });

    test('should return failed status for API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          done: true,
          error: { message: 'Generation failed due to content policy' }
        })
      } as any);

      const result = await getVeo3Status(mockJobId, mockUserId);

      expect(result).toEqual({
        status: 'failed',
        error: 'Generation failed due to content policy',
        completedAt: expect.any(String)
      });
    });

    test('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network timeout'));

      const result = await getVeo3Status(mockJobId, mockUserId);

      expect(result).toEqual({
        status: 'failed',
        error: 'Network timeout'
      });
    });

    test('should auto-prefix operation ID', async () => {
      const jobIdWithoutPrefix = 'test-job-123';
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          done: true,
          response: { video: { uri: 'https://example.com/video.mp4' } }
        })
      } as any);

      await getVeo3Status(jobIdWithoutPrefix, mockUserId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`operations/${jobIdWithoutPrefix}`),
        undefined
      );
    });
  });
});
