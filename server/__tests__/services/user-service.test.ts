/**
 * User Service Tests
 * Tests for the UserService class functionality
 */

import { UserService } from '../../services/user-service';
import { storage } from '../../storage';

// Mock the storage module
jest.mock('../../storage', () => ({
  storage: {
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    createUser: jest.fn(),
    updateUserProfile: jest.fn()
  }
}));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      };

      mockStorage.getUser.mockResolvedValue(mockUser as any);

      const result = await userService.getUser('user123');

      expect(result).toEqual({
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: 'Test',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: 'https://example.com/avatar.jpg',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02')
      });
      expect(mockStorage.getUser).toHaveBeenCalledWith('user123');
    });

    it('should return null when user not found', async () => {
      mockStorage.getUser.mockResolvedValue(null);

      const result = await userService.getUser('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw error when userId is empty', async () => {
      await expect(userService.getUser('')).rejects.toThrow('User ID is required');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Updated User',
        firstName: 'Updated',
        lastName: 'User',
        gender: 'woman',
        profileImageUrl: 'https://example.com/new-avatar.jpg',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-03')
      };

      mockStorage.updateUserProfile.mockResolvedValue(undefined);
      mockStorage.getUser.mockResolvedValue(mockUser as any);

      const updates = {
        displayName: 'Updated User',
        firstName: 'Updated',
        lastName: 'User',
        gender: 'woman',
        profileImageUrl: 'https://example.com/new-avatar.jpg'
      };

      const result = await userService.updateUserProfile('user123', updates);

      expect(mockStorage.updateUserProfile).toHaveBeenCalledWith('user123', {
        ...updates,
        updatedAt: expect.any(Date)
      });
      expect(result).toEqual(mockUser);
    });

    it('should validate gender values', async () => {
      await expect(
        userService.updateUserProfile('user123', { gender: 'invalid' })
      ).rejects.toThrow('Invalid gender value. Must be "man", "woman", or "other"');
    });

    it('should throw error when userId is empty', async () => {
      await expect(
        userService.updateUserProfile('', { displayName: 'Test' })
      ).rejects.toThrow('User ID is required');
    });
  });

  describe('createUser', () => {
    it('should create new user successfully', async () => {
      const mockUser = {
        id: 'user123',
        email: 'new@example.com',
        displayName: 'new',
        firstName: 'New',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: undefined,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      };

      mockStorage.createUser.mockResolvedValue(mockUser as any);

      const result = await userService.createUser('new@example.com', {
        firstName: 'New',
        lastName: 'User',
        gender: 'other'
      });

      expect(mockStorage.createUser).toHaveBeenCalledWith({
        id: expect.stringMatching(/^user_\d+_[a-z0-9]+$/),
        email: 'new@example.com',
        displayName: 'new',
        firstName: 'New',
        lastName: 'User',
        gender: 'other',
        profileImageUrl: undefined,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when email is empty', async () => {
      await expect(userService.createUser('')).rejects.toThrow('Email is required');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
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

      mockStorage.getUserByEmail.mockResolvedValue(mockUser as any);

      const result = await userService.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockStorage.getUserByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return null when user not found by email', async () => {
      mockStorage.getUserByEmail.mockResolvedValue(null);

      const result = await userService.getUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should throw error when email is empty', async () => {
      await expect(userService.getUserByEmail('')).rejects.toThrow('Email is required');
    });
  });
});
