/**
 * Tests for Video Storyboard Composition Service
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { composeStoryboard, getCompositionStatus, type StoryboardScene, type ComposeVideoOptions } from '../compose';

// Mock dependencies
jest.mock('../../storage.js', () => ({
  storage: {
    getUserProfile: jest.fn(),
    saveGeneratedVideo: jest.fn()
  }
}));

jest.mock('child_process', () => ({
  exec: jest.fn()
}));

jest.mock('fs/promises', () => ({
  writeFile: jest.fn(),
  unlink: jest.fn()
}));

jest.mock('../../veo-service.js', () => ({
  startVeoVideo: jest.fn(),
  getVeoStatus: jest.fn()
}));

const mockStorage = require('../../storage.js');
const mockExec = require('child_process').exec;
const mockVeoService = require('../../veo-service.js');

describe('Video Composition Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('composeStoryboard', () => {
    const validScenes: StoryboardScene[] = [
      {
        id: '1',
        motionPrompt: 'Slow cinematic zoom in on subject',
        duration: 5,
        imageUrl: 'https://example.com/image1.jpg'
      },
      {
        id: '2', 
        motionPrompt: 'Gentle pan left revealing environment',
        duration: 4,
        imageUrl: 'https://example.com/image2.jpg'
      }
    ];

    const validOptions: ComposeVideoOptions = {
      scenes: validScenes,
      userId: 'user_123',
      mode: 'sequential',
      format: '9:16'
    };

    it('should start storyboard composition successfully', async () => {
      // Mock VEO service success
      mockVeoService.startVeoVideo.mockResolvedValue({
        jobId: 'veo_job_123',
        provider: 'google'
      });

      mockStorage.storage.getUserProfile.mockResolvedValue({
        replicateModelId: 'user_lora_model'
      });

      const result = await composeStoryboard(validOptions);

      expect(result.status).toBe('pending');
      expect(result.jobId).toMatch(/^storyboard_/);
      expect(result.sceneJobs).toHaveLength(2);
      expect(result.sceneJobs![0].status).toBe('pending');
      expect(result.sceneJobs![1].status).toBe('pending');
    });

    it('should validate minimum scene count', async () => {
      const invalidOptions = {
        ...validOptions,
        scenes: [validScenes[0]] // Only one scene
      };

      const result = await composeStoryboard(invalidOptions);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('2-3 scenes');
    });

    it('should validate maximum scene count', async () => {
      const invalidOptions = {
        ...validOptions,
        scenes: [
          validScenes[0],
          validScenes[1],
          { ...validScenes[0], id: '3' },
          { ...validScenes[0], id: '4' } // 4 scenes - too many
        ]
      };

      const result = await composeStoryboard(invalidOptions);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('2-3 scenes');
    });

    it('should handle scene generation failures gracefully', async () => {
      // Mock first scene success, second scene failure
      mockVeoService.startVeoVideo
        .mockResolvedValueOnce({ jobId: 'veo_job_1', provider: 'google' })
        .mockRejectedValueOnce(new Error('VEO service unavailable'));

      mockStorage.storage.getUserProfile.mockResolvedValue(null);

      const result = await composeStoryboard(validOptions);

      expect(result.status).toBe('failed');
      expect(result.sceneJobs).toHaveLength(2);
      expect(result.sceneJobs![0].status).toBe('pending');
      expect(result.sceneJobs![1].status).toBe('failed');
    });

    it('should clamp scene durations to valid range', async () => {
      const scenesWithInvalidDuration = [
        { ...validScenes[0], duration: 0 }, // Too short
        { ...validScenes[1], duration: 15 } // Too long
      ];

      mockVeoService.startVeoVideo.mockResolvedValue({
        jobId: 'veo_job_123',
        provider: 'google'
      });

      const options = {
        ...validOptions,
        scenes: scenesWithInvalidDuration
      };

      const result = await composeStoryboard(options);

      expect(result.status).toBe('pending');
      // Duration should be clamped in the VEO scene format
      expect(mockVeoService.startVeoVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          scenes: expect.arrayContaining([
            expect.objectContaining({ duration: 1 }), // Clamped from 0
            expect.objectContaining({ duration: 12 }) // Clamped from 15
          ])
        })
      );
    });
  });

  describe('getCompositionStatus', () => {
    const mockSceneJobs = [
      { sceneIndex: 0, jobId: 'veo_job_1', status: 'pending' },
      { sceneIndex: 1, jobId: 'veo_job_2', status: 'pending' }
    ];

    it('should return failed status when scene jobs are missing', async () => {
      const result = await getCompositionStatus('storyboard_123', [], 'user_123');

      expect(result.status).toBe('failed');
      expect(result.error).toBe('No scene jobs found');
    });

    it('should check individual scene statuses', async () => {
      mockVeoService.getVeoStatus
        .mockResolvedValueOnce({ status: 'processing' })
        .mockResolvedValueOnce({ status: 'processing' });

      const result = await getCompositionStatus('storyboard_123', mockSceneJobs, 'user_123');

      expect(result.status).toBe('processing');
      expect(mockVeoService.getVeoStatus).toHaveBeenCalledTimes(2);
    });

    it('should return failed when any scene fails', async () => {
      mockVeoService.getVeoStatus
        .mockResolvedValueOnce({ status: 'succeeded', videoUrl: 'https://video1.mp4' })
        .mockResolvedValueOnce({ status: 'failed', error: 'Generation failed' });

      const result = await getCompositionStatus('storyboard_123', mockSceneJobs, 'user_123');

      expect(result.status).toBe('failed');
      expect(result.error).toContain('failed to generate');
    });

    it('should compose final video when all scenes complete', async () => {
      mockVeoService.getVeoStatus
        .mockResolvedValueOnce({ status: 'succeeded', videoUrl: 'https://video1.mp4' })
        .mockResolvedValueOnce({ status: 'succeeded', videoUrl: 'https://video2.mp4' });

      // Mock ffmpeg success (this would need more sophisticated mocking in real implementation)
      mockExec.mockImplementation((command: string, callback: Function) => {
        callback(null, 'Success', '');
      });

      const result = await getCompositionStatus('storyboard_123', mockSceneJobs, 'user_123');

      expect(result.status).toBe('completed');
      expect(result.composedVideoUrl).toBeDefined();
    });
  });

  describe('Scene Validation', () => {
    it('should handle empty motion prompts', async () => {
      const scenesWithEmpty = [
        { id: '1', motionPrompt: '', duration: 5 },
        { id: '2', motionPrompt: 'Valid prompt', duration: 5 }
      ];

      mockVeoService.startVeoVideo.mockResolvedValue({
        jobId: 'veo_job_123',
        provider: 'google'
      });

      const options = {
        scenes: scenesWithEmpty,
        userId: 'user_123',
        mode: 'sequential' as const,
        format: '9:16' as const
      };

      const result = await composeStoryboard(options);

      // Service should still attempt generation (validation might happen on frontend)
      expect(result.status).toBe('pending');
    });

    it('should handle missing image URLs gracefully', async () => {
      const scenesWithoutImages = [
        { id: '1', motionPrompt: 'Motion 1', duration: 5 },
        { id: '2', motionPrompt: 'Motion 2', duration: 5 }
      ];

      mockVeoService.startVeoVideo.mockResolvedValue({
        jobId: 'veo_job_123',
        provider: 'google'
      });

      const options = {
        scenes: scenesWithoutImages,
        userId: 'user_123',
        mode: 'sequential' as const,
        format: '9:16' as const
      };

      const result = await composeStoryboard(options);

      expect(result.status).toBe('pending');
      expect(mockVeoService.startVeoVideo).toHaveBeenCalledWith(
        expect.objectContaining({
          scenes: expect.arrayContaining([
            expect.objectContaining({ imageUrl: undefined })
          ])
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle storage profile loading failures', async () => {
      mockStorage.storage.getUserProfile.mockRejectedValue(new Error('Database error'));
      mockVeoService.startVeoVideo.mockResolvedValue({
        jobId: 'veo_job_123',
        provider: 'google'
      });

      const validOptions: ComposeVideoOptions = {
        scenes: [
          { id: '1', motionPrompt: 'Test motion', duration: 5 }
        ],
        userId: 'user_123',
        mode: 'sequential',
        format: '9:16'
      };

      // Should not throw, just log warning and continue without LoRA
      await expect(composeStoryboard(validOptions)).resolves.toBeDefined();
    });

    it('should handle service timeout scenarios', async () => {
      mockVeoService.startVeoVideo.mockImplementation(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const validOptions: ComposeVideoOptions = {
        scenes: [
          { id: '1', motionPrompt: 'Test motion', duration: 5 },
          { id: '2', motionPrompt: 'Test motion 2', duration: 5 }
        ],
        userId: 'user_123',
        mode: 'sequential',
        format: '9:16'
      };

      const result = await composeStoryboard(validOptions);

      expect(result.status).toBe('failed');
      expect(result.error).toContain('timeout');
    });
  });
});

