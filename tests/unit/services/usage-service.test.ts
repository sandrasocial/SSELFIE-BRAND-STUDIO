/**
 * Usage Service Tests
 * Comprehensive tests for the UsageService class functionality
 */

import { UsageService, isValidPlan, isValidApiResource, PLAN_LIMITS, API_COSTS } from '../../../server/usage-service.js';
import { storage } from '../../../server/storage.js';

// Mock the storage module
jest.mock('../../../server/storage.js', () => ({
  storage: {
    getUser: jest.fn(),
    getUserUsage: jest.fn(),
    createUserUsage: jest.fn(),
    updateUserUsage: jest.fn(),
    createUsageHistory: jest.fn(),
    getUserUsageHistory: jest.fn()
  }
}));

const mockStorage = storage as jest.Mocked<typeof storage>;

describe('UsageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Type Guards', () => {
    describe('isValidPlan', () => {
      it('should return true for valid plans', () => {
        expect(isValidPlan('admin')).toBe(true);
        expect(isValidPlan('sselfie-studio')).toBe(true);
      });

      it('should return false for invalid plans', () => {
        expect(isValidPlan('invalid-plan')).toBe(false);
        expect(isValidPlan('')).toBe(false);
        expect(isValidPlan('ai-pack')).toBe(false); // Legacy plan
      });
    });

    describe('isValidApiResource', () => {
      it('should return true for valid API resources', () => {
        expect(isValidApiResource('replicate_ai')).toBe(true);
        expect(isValidApiResource('claude_api')).toBe(true);
        expect(isValidApiResource('openai_api')).toBe(true);
      });

      it('should return false for invalid API resources', () => {
        expect(isValidApiResource('invalid-resource')).toBe(false);
        expect(isValidApiResource('')).toBe(false);
      });
    });
  });

  describe('initializeUserUsage', () => {
    it('should initialize usage for valid user and plan', async () => {
      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 0,
        totalCostIncurred: '0.0000',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        isLimitReached: false,
        lastGenerationAt: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      };

      mockStorage.createUserUsage.mockResolvedValue(mockUsage as any);

      const result = await UsageService.initializeUserUsage('user123', 'sselfie-studio');

      expect(result).toEqual(mockUsage);
      expect(mockStorage.createUserUsage).toHaveBeenCalledWith({
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 0,
        totalCostIncurred: '0.0000',
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        isLimitReached: false,
        lastGenerationAt: null
      });
    });

    it('should throw error for empty user ID', async () => {
      await expect(UsageService.initializeUserUsage('', 'sselfie-studio'))
        .rejects.toThrow('User ID is required');
    });

    it('should throw error for invalid plan', async () => {
      await expect(UsageService.initializeUserUsage('user123', 'invalid-plan'))
        .rejects.toThrow('Invalid plan: invalid-plan. Valid plans are: admin, sselfie-studio');
    });

    it('should handle storage errors gracefully', async () => {
      mockStorage.createUserUsage.mockRejectedValue(new Error('Database error'));

      await expect(UsageService.initializeUserUsage('user123', 'sselfie-studio'))
        .rejects.toThrow('Failed to initialize user usage tracking');
    });
  });

  describe('checkUsageLimit', () => {
    it('should return error for empty user ID', async () => {
      const result = await UsageService.checkUsageLimit('');

      expect(result).toEqual({
        canGenerate: false,
        remainingGenerations: 0,
        totalUsed: 0,
        totalAllowed: 0,
        reason: 'User ID is required'
      });
    });

    it('should grant unlimited access to admin users', async () => {
      const mockUser = {
        id: 'admin123',
        email: 'sandra@sselfie.ai',
        role: 'user'
      };

      mockStorage.getUser.mockResolvedValue(mockUser as any);

      const result = await UsageService.checkUsageLimit('admin123');

      expect(result).toEqual({
        canGenerate: true,
        remainingGenerations: 999999,
        totalUsed: 0,
        totalAllowed: 999999,
        reason: 'Admin: Unlimited access'
      });
    });

    it('should grant unlimited access to users with admin role', async () => {
      const mockUser = {
        id: 'admin123',
        email: 'test@example.com',
        role: 'admin'
      };

      mockStorage.getUser.mockResolvedValue(mockUser as any);

      const result = await UsageService.checkUsageLimit('admin123');

      expect(result).toEqual({
        canGenerate: true,
        remainingGenerations: 999999,
        totalUsed: 0,
        totalAllowed: 999999,
        reason: 'Admin: Unlimited access'
      });
    });

    it('should initialize usage for new users', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 0,
        totalCostIncurred: '0.0000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        isLimitReached: false,
        lastGenerationAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockStorage.getUser.mockResolvedValue(mockUser as any);
      mockStorage.getUserUsage.mockResolvedValueOnce(null).mockResolvedValueOnce(mockUsage as any);
      mockStorage.createUserUsage.mockResolvedValue(mockUsage as any);

      const result = await UsageService.checkUsageLimit('user123');

      expect(result.canGenerate).toBe(true);
      expect(result.remainingGenerations).toBe(100);
      expect(result.totalAllowed).toBe(100);
    });

    it('should return correct usage for existing user with remaining generations', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 30,
        totalCostIncurred: '1.5000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isLimitReached: false,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockStorage.getUser.mockResolvedValue(mockUser as any);
      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);

      const result = await UsageService.checkUsageLimit('user123');

      expect(result).toEqual({
        canGenerate: true,
        remainingGenerations: 70,
        totalUsed: 30,
        totalAllowed: 100,
        monthlyUsed: 30,
        monthlyAllowed: 100,
        monthlyRemaining: 70,
        resetDate: mockUsage.currentPeriodEnd,
        reason: undefined
      });
    });

    it('should return limit reached for user at monthly limit', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 100,
        totalCostIncurred: '3.8000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isLimitReached: true,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockStorage.getUser.mockResolvedValue(mockUser as any);
      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);

      const result = await UsageService.checkUsageLimit('user123');

      expect(result).toEqual({
        canGenerate: false,
        remainingGenerations: 0,
        totalUsed: 100,
        totalAllowed: 100,
        monthlyUsed: 100,
        monthlyAllowed: 100,
        monthlyRemaining: 0,
        resetDate: mockUsage.currentPeriodEnd,
        reason: 'Monthly limit reached. Resets next period.'
      });
    });

    it('should handle invalid plan gracefully', async () => {
      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'invalid-plan',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 30,
        totalCostIncurred: '1.5000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        isLimitReached: false,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockStorage.getUser.mockResolvedValue(mockUser as any);
      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);

      const result = await UsageService.checkUsageLimit('user123');

      expect(result).toEqual({
        canGenerate: false,
        remainingGenerations: 0,
        totalUsed: 30,
        totalAllowed: 0,
        reason: 'Invalid plan configuration'
      });
    });
  });

  describe('recordUsage', () => {
    it('should record usage successfully', async () => {
      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 30,
        totalCostIncurred: '1.5000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        isLimitReached: false,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const usageUpdate = {
        actionType: 'generation' as const,
        resourceUsed: 'replicate_ai' as const,
        cost: 0.038,
        details: { imageCount: 4 },
        generatedImageId: 123
      };

      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);
      mockStorage.createUsageHistory.mockResolvedValue(undefined);
      mockStorage.updateUserUsage.mockResolvedValue(undefined);

      await UsageService.recordUsage('user123', usageUpdate);

      expect(mockStorage.createUsageHistory).toHaveBeenCalledWith({
        userId: 'user123',
        actionType: 'generation',
        resourceUsed: 'replicate_ai',
        cost: '0.038',
        details: { imageCount: 4 },
        generatedImageId: 123
      });

      expect(mockStorage.updateUserUsage).toHaveBeenCalledWith('user123', {
        totalCostIncurred: '1.5380',
        lastGenerationAt: expect.any(Date),
        monthlyGenerationsUsed: 31,
        isLimitReached: false
      });
    });

    it('should throw error for empty user ID', async () => {
      const usageUpdate = {
        actionType: 'generation' as const,
        resourceUsed: 'replicate_ai' as const,
        cost: 0.038
      };

      await expect(UsageService.recordUsage('', usageUpdate))
        .rejects.toThrow('User ID is required');
    });

    it('should throw error for invalid resource', async () => {
      const usageUpdate = {
        actionType: 'generation' as const,
        resourceUsed: 'invalid-resource' as any,
        cost: 0.038
      };

      await expect(UsageService.recordUsage('user123', usageUpdate))
        .rejects.toThrow('Invalid resource type: invalid-resource');
    });

    it('should throw error for negative cost', async () => {
      const usageUpdate = {
        actionType: 'generation' as const,
        resourceUsed: 'replicate_ai' as const,
        cost: -0.038
      };

      await expect(UsageService.recordUsage('user123', usageUpdate))
        .rejects.toThrow('Cost cannot be negative');
    });

    it('should not count training actions against generation limits', async () => {
      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 30,
        totalCostIncurred: '1.5000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        isLimitReached: false,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const usageUpdate = {
        actionType: 'training' as const,
        resourceUsed: 'replicate_ai' as const,
        cost: 0.038
      };

      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);
      mockStorage.createUsageHistory.mockResolvedValue(undefined);
      mockStorage.updateUserUsage.mockResolvedValue(undefined);

      await UsageService.recordUsage('user123', usageUpdate);

      expect(mockStorage.updateUserUsage).toHaveBeenCalledWith('user123', {
        totalCostIncurred: '1.5380',
        lastGenerationAt: expect.any(Date)
        // Note: monthlyGenerationsUsed should NOT be updated for training
      });
    });
  });

  describe('resetMonthlyUsage', () => {
    it('should reset monthly usage successfully', async () => {
      mockStorage.updateUserUsage.mockResolvedValue(undefined);

      await UsageService.resetMonthlyUsage('user123');

      expect(mockStorage.updateUserUsage).toHaveBeenCalledWith('user123', {
        monthlyGenerationsUsed: 0,
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        isLimitReached: false
      });
    });

    it('should throw error for empty user ID', async () => {
      await expect(UsageService.resetMonthlyUsage(''))
        .rejects.toThrow('User ID is required');
    });
  });

  describe('getUserStats', () => {
    it('should return user stats successfully', async () => {
      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 30,
        totalCostIncurred: '1.5000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        isLimitReached: false,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      const mockHistory = [
        { actionType: 'generation', resourceUsed: 'replicate_ai', cost: '0.038' }
      ];

      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);
      mockStorage.getUser.mockResolvedValue(mockUser as any);
      mockStorage.getUserUsageHistory.mockResolvedValue(mockHistory as any);

      const result = await UsageService.getUserStats('user123');

      expect(result).toMatchObject({
        plan: 'sselfie-studio',
        planLimits: PLAN_LIMITS['sselfie-studio'],
        totalCostIncurred: 1.5,
        lastGenerationAt: mockUsage.lastGenerationAt,
        recentActivity: mockHistory,
        createdAt: mockUsage.createdAt
      });
    });

    it('should return null for empty user ID', async () => {
      const result = await UsageService.getUserStats('');
      expect(result).toBeNull();
    });

    it('should return null if user usage not found', async () => {
      mockStorage.getUserUsage.mockResolvedValue(null);

      const result = await UsageService.getUserStats('user123');
      expect(result).toBeNull();
    });
  });

  describe('getUserCostAnalysis', () => {
    it('should return cost analysis successfully', async () => {
      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 30,
        totalCostIncurred: '1.5000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        isLimitReached: false,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockHistory = [
        { resourceUsed: 'replicate_ai', cost: '1.0000' },
        { resourceUsed: 'claude_api', cost: '0.5000' }
      ];

      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);
      mockStorage.getUserUsageHistory.mockResolvedValue(mockHistory as any);

      const result = await UsageService.getUserCostAnalysis('user123');

      expect(result).toMatchObject({
        userId: 'user123',
        plan: 'sselfie-studio',
        totalGenerations: 30,
        totalCost: 1.5,
        planRevenue: 47,
        profitMargin: 45.5,
        profitPercentage: '96.8%',
        costBreakdown: {
          replicate_ai: 1.0,
          claude_api: 0.5,
          openai_api: 0
        },
        isHealthy: true
      });
    });

    it('should return null for empty user ID', async () => {
      const result = await UsageService.getUserCostAnalysis('');
      expect(result).toBeNull();
    });
  });

  describe('checkUpgradeRecommendation', () => {
    it('should return upgrade recommendation for high usage', async () => {
      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 95,
        totalCostIncurred: '3.5000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        isLimitReached: false,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);
      mockStorage.getUser.mockResolvedValue(mockUser as any);

      const result = await UsageService.checkUpgradeRecommendation('user123');

      expect(result).toEqual({
        shouldUpgrade: false,
        reason: 'High usage detected',
        message: 'You\'re getting great value from your plan! Consider upgrading your photo selection strategy with Maya for even better results.'
      });
    });

    it('should return no upgrade for normal usage', async () => {
      const mockUsage = {
        id: 1,
        userId: 'user123',
        plan: 'sselfie-studio',
        monthlyGenerationsAllowed: 100,
        monthlyGenerationsUsed: 50,
        totalCostIncurred: '1.9000',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        isLimitReached: false,
        lastGenerationAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        role: 'user'
      };

      mockStorage.getUserUsage.mockResolvedValue(mockUsage as any);
      mockStorage.getUser.mockResolvedValue(mockUser as any);

      const result = await UsageService.checkUpgradeRecommendation('user123');

      expect(result).toEqual({ shouldUpgrade: false });
    });

    it('should return no upgrade for empty user ID', async () => {
      const result = await UsageService.checkUpgradeRecommendation('');
      expect(result).toEqual({ shouldUpgrade: false });
    });
  });
});