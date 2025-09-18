/**
 * Inpainting Service Tests
 */

import { SDInpaintService } from '../../services/inpaint/sd_inpaint';

// Mock dependencies
jest.mock('../../storage');
jest.mock('../../model-training-service');

describe('SDInpaintService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variables
    process.env.INPAINT_ENABLED = '1';
    process.env.REPLICATE_API_TOKEN = 'test-token';
  });

  describe('startInpainting', () => {
    it('should validate required parameters', async () => {
      const request = {
        imageUrl: '',
        maskPngBase64: 'test-mask',
        prompt: 'test prompt',
        userId: 'user123',
        originalImageId: 1,
        originalImageType: 'ai_image' as const
      };

      const result = await SDInpaintService.startInpainting(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required parameters');
    });

    it('should check if inpainting is enabled', async () => {
      process.env.INPAINT_ENABLED = '0';

      const request = {
        imageUrl: 'http://example.com/image.jpg',
        maskPngBase64: 'test-mask',
        prompt: 'test prompt',
        userId: 'user123',
        originalImageId: 1,
        originalImageType: 'ai_image' as const
      };

      const result = await SDInpaintService.startInpainting(request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Inpainting feature is not enabled');
    });
  });

  describe('checkInpaintStatus', () => {
    it('should handle prediction status checking', async () => {
      // Mock fetch for successful status check
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          status: 'processing'
        })
      });

      const result = await SDInpaintService.checkInpaintStatus('prediction123', 1);

      expect(result.status).toBe('processing');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.replicate.com/v1/predictions/prediction123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Token test-token'
          })
        })
      );
    });
  });
});
