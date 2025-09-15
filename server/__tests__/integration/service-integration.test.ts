/**
 * Service Integration Tests
 * Tests for service layer interactions and data flow
 */

import { UserService } from '../../services/user-service';
import { aiGenerationService } from '../../services/ai-generation-service';
import { storage } from '../../storage';

// Mock the storage module
jest.mock('../../storage', () => ({
  storage: {
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserProfile: jest.fn(),
    getUserVideosByStatus: jest.fn(),
    getMayaChats: jest.fn()
  }
}));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('Service Integration Tests', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('User Service Integration', () => {
    it('should create user and then retrieve user data', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      // Mock createUser
      mockStorage.createUser.mockResolvedValue(mockUser as any);
      
      // Mock getUser
      mockStorage.getUser.mockResolvedValue(mockUser as any);

      // Test user creation
      const createdUser = await userService.createUser('test@example.com', {
        firstName: 'Test',
        lastName: 'User',
        gender: 'other'
      });

      expect(createdUser).toEqual(mockUser);
      expect(mockStorage.createUser).toHaveBeenCalledWith({
        id: expect.stringMatching(/^user_\d+_[a-z0-9]+$/),
        email: 'test@example.com',
        displayName: 'test',
        firstName: 'Test',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });

      // Test user retrieval
      const retrievedUser = await userService.getUser('user123');
      expect(retrievedUser).toEqual(mockUser);
      expect(mockStorage.getUser).toHaveBeenCalledWith('user123');
    });

    it('should handle user profile update workflow', async () => {
      const originalUser = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      const updatedUser = {
        ...originalUser,
        displayName: 'Updated User',
        firstName: 'Updated',
        lastName: 'User',
        gender: 'woman',
        updatedAt: new Date('2023-01-02')
      };

      // Mock updateUserProfile
      mockStorage.updateUserProfile.mockResolvedValue(undefined);
      mockStorage.getUser.mockResolvedValue(updatedUser as any);

      // Test profile update
      const result = await userService.updateUserProfile('user123', {
        displayName: 'Updated User',
        firstName: 'Updated',
        lastName: 'User',
        gender: 'woman'
      });

      expect(result).toEqual(updatedUser);
      expect(mockStorage.updateUserProfile).toHaveBeenCalledWith('user123', {
        displayName: 'Updated User',
        firstName: 'Updated',
        lastName: 'User',
        gender: 'woman',
        updatedAt: expect.any(Date)
      });
    });
  });

  describe('AI Generation Service Integration', () => {
    it('should handle complete story generation workflow', async () => {
      const userId = 'user123';
      const concept = 'A magical adventure';

      // Test story draft
      const draftResult = await aiGenerationService.generateStoryDraft({ 
        userId, 
        concept 
      });
      expect(draftResult).toEqual({
        draftId: expect.stringMatching(/^draft_\d+_[a-z0-9]+$/),
        status: 'completed'
      });

      // Test full story generation
      const storyResult = await aiGenerationService.generateStory({ 
        userId,
        concept, 
        style: 'fantasy', 
        length: 'medium' 
      });
      expect(storyResult).toEqual({
        storyId: expect.stringMatching(/^story_\d+_[a-z0-9]+$/),
        status: 'completed'
      });

      // Test generation status check
      const statusResult = await aiGenerationService.getGenerationStatus('story123');
      expect(statusResult).toEqual({
        status: 'completed',
        progress: 100
      });
    });

    it('should handle video generation from story workflow', async () => {
      const userId = 'user123';
      const story = 'A magical tale of adventure';
      const style = 'cinematic';
      const duration = 30;

      // Test video generation from story
      const videoResult = await aiGenerationService.generateVideoFromStory({ 
        userId,
        prompt: story, 
        style, 
        duration 
      });
      expect(videoResult).toEqual({
        videoId: expect.stringMatching(/^video_\d+_[a-z0-9]+$/),
        status: 'processing'
      });
    });

    it('should handle Victoria AI content generation workflow', async () => {
      const userId = 'user123';
      const prompt = 'Create a modern website';
      const style = 'minimalist';
      const businessType = 'tech';

      // Test image generation (using available method)
      const imageResult = await aiGenerationService.generateImages({ 
        userId,
        prompt, 
        style, 
        count: 3 
      });
      expect(imageResult).toEqual({
        jobId: expect.stringMatching(/^image_job_\d+_[a-z0-9]+$/),
        status: 'processing'
      });
    });
  });

  describe('Cross-Service Integration', () => {
    it('should handle user creation followed by AI content generation', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      // Mock user creation
      mockStorage.createUser.mockResolvedValue(mockUser as any);

      // Create user
      const user = await userService.createUser('test@example.com', {
        firstName: 'Test',
        lastName: 'User',
        gender: 'other'
      });

      expect(user).toEqual(mockUser);

      // Generate AI content for the user
      const aiResult = await aiGenerationService.generateStoryDraft({ 
        userId: user.id, 
        concept: 'A test story' 
      });
      expect(aiResult).toEqual({
        draftId: expect.stringMatching(/^draft_\d+_[a-z0-9]+$/),
        status: 'completed'
      });
    });
  });
});
