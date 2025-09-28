import { storage } from './storage.js';

// User usage type definition with proper null handling
export interface UserUsage {
  id: number;
  plan: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  currentPeriodStart: Date;
  currentPeriodEnd: Date | null;
  monthlyGenerationsAllowed: number;
  monthlyGenerationsUsed: number;
  totalCostIncurred: string;
  isLimitReached: boolean;
  lastGenerationAt: Date | null;
}

// Plan configuration with usage limits and costs - LUXURY AI PERSONAL BRANDING PLATFORM
export const PLAN_LIMITS = {
  'admin': {
    totalGenerations: null,
    monthlyGenerations: 999999, // Unlimited for admin
    cost: 0,
    description: 'Unlimited admin access',
    resetMonthly: false
  },
  'sselfie-studio': {
    totalGenerations: null,
    monthlyGenerations: 100, // €47/month for 100 AI images
    cost: 47,
    description: '100 AI generations per month + Maya AI personal brand strategist',
    resetMonthly: true
  }
} as const;

// Type guard for plan keys
export function isValidPlan(plan: string): plan is keyof typeof PLAN_LIMITS {
  return plan in PLAN_LIMITS;
}

// API costs tracking
export const API_COSTS = {
  'replicate_ai': 0.038, // Per generation (4 images)
  'claude_api': 0.015,   // Per conversation
  'openai_api': 0.020    // Per conversation
} as const;

// Type guard for API resource types
export function isValidApiResource(resource: string): resource is keyof typeof API_COSTS {
  return resource in API_COSTS;
}

export interface UsageCheck {
  canGenerate: boolean;
  remainingGenerations: number;
  totalUsed: number;
  totalAllowed: number;
  monthlyUsed?: number;
  monthlyAllowed?: number;
  resetDate?: Date;
  monthlyRemaining?: number;
  reason?: string;
}

export interface UsageUpdate {
  actionType: 'generation' | 'api_call' | 'sandra_chat' | 'training';
  resourceUsed: 'replicate_ai' | 'claude_api' | 'openai_api';
  cost: number;
  details?: Record<string, unknown>;
  generatedImageId?: number;
}

export class UsageService {
  
  // Initialize usage tracking for new user
  static async initializeUserUsage(userId: string, plan: string): Promise<UserUsage> {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!isValidPlan(plan)) {
      throw new Error(`Invalid plan: ${plan}. Valid plans are: ${Object.keys(PLAN_LIMITS).join(', ')}`);
    }

    const planLimits = PLAN_LIMITS[plan];
    const now = new Date();
    const periodEnd = planLimits.resetMonthly 
      ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      : null;

    try {
      return await storage.createUserUsage({
        userId,
        plan,
        monthlyGenerationsAllowed: planLimits.monthlyGenerations,
        monthlyGenerationsUsed: 0,
        totalCostIncurred: "0.0000",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        isLimitReached: false,
        lastGenerationAt: null
      });
    } catch (error) {
      console.error(`Failed to initialize usage for user ${userId}:`, error);
      throw new Error('Failed to initialize user usage tracking');
    }
  }

  // Check if user can generate images
  static async checkUsageLimit(userId: string): Promise<UsageCheck> {
    if (!userId) {
      return {
        canGenerate: false,
        remainingGenerations: 0,
        totalUsed: 0,
        totalAllowed: 0,
        reason: 'User ID is required'
      };
    }

    try {
      // CRITICAL: Check if user is admin first
      const user = await storage.getUser(userId);
      const adminEmails = ['ssa@ssasocial.com', 'sandrajonna@gmail.com', 'sandra@sselfie.ai'];
      
      // Admin users get unlimited access
      if (user && (adminEmails.includes(user.email) || user.role === 'admin')) {
        console.log(`👑 Admin user detected: ${user.email} - granting unlimited access`);
        return {
          canGenerate: true,
          remainingGenerations: 999999,
          totalUsed: 0,
          totalAllowed: 999999,
          reason: 'Admin: Unlimited access'
        };
      }
      
      let usage = await storage.getUserUsage(userId);
      
      // Auto-initialize usage for new users with sselfie-studio plan
      if (!usage) {
        await this.initializeUserUsage(userId, 'sselfie-studio');
        usage = await storage.getUserUsage(userId);
        if (!usage) {
          throw new Error('Failed to initialize user usage');
        }
      }

      if (!isValidPlan(usage.plan)) {
        console.warn(`Invalid plan detected for user ${userId}: ${usage.plan}`);
        return {
          canGenerate: false,
          remainingGenerations: 0,
          totalUsed: usage.monthlyGenerationsUsed ?? 0,
          totalAllowed: 0,
          reason: 'Invalid plan configuration'
        };
      }

      const planLimits = PLAN_LIMITS[usage.plan];
      const now = new Date();

      // Check if monthly limits need to be reset
      if (planLimits.resetMonthly && usage.currentPeriodEnd && now > usage.currentPeriodEnd) {
        await this.resetMonthlyUsage(userId);
        // Refresh usage data after reset
        const refreshedUsage = await storage.getUserUsage(userId);
        if (refreshedUsage) {
          Object.assign(usage, refreshedUsage);
        }
      }

      // Legacy ai-pack plans are migrated to sselfie-studio
      if (usage.plan === 'ai-pack') {
        console.log(`Migrating legacy ai-pack user ${userId} to sselfie-studio plan`);
        await this.initializeUserUsage(userId, 'sselfie-studio');
        usage = await storage.getUserUsage(userId);
        if (!usage) {
          throw new Error('Failed to migrate user plan');
        }
      }

      // For Studio plans (monthly limits)
      if (usage.monthlyGenerationsAllowed) {
        const monthlyUsed = usage.monthlyGenerationsUsed ?? 0;
        const monthlyRemaining = usage.monthlyGenerationsAllowed - monthlyUsed;
        return {
          canGenerate: monthlyRemaining > 0,
          remainingGenerations: monthlyRemaining,
          totalUsed: monthlyUsed,
          totalAllowed: usage.monthlyGenerationsAllowed,
          monthlyUsed,
          monthlyAllowed: usage.monthlyGenerationsAllowed,
          monthlyRemaining,
          resetDate: usage.currentPeriodEnd ?? undefined,
          reason: monthlyRemaining <= 0 ? 'Monthly limit reached. Resets next period.' : undefined
        };
      }

      return {
        canGenerate: false,
        remainingGenerations: 0,
        totalUsed: usage.monthlyGenerationsUsed ?? 0,
        totalAllowed: 0,
        reason: 'Invalid plan configuration'
      };
    } catch (error) {
      console.error(`Error checking usage limit for user ${userId}:`, error);
      return {
        canGenerate: false,
        remainingGenerations: 0,
        totalUsed: 0,
        totalAllowed: 0,
        reason: 'Error checking usage limits'
      };
    }
  }

  // Record usage when user generates images
  static async recordUsage(userId: string, update: UsageUpdate): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!isValidApiResource(update.resourceUsed)) {
      throw new Error(`Invalid resource type: ${update.resourceUsed}`);
    }

    if (update.cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    try {
      const usage = await storage.getUserUsage(userId);
      if (!usage) {
        throw new Error('User usage not found');
      }

      // Record in usage history (skip if table doesn't exist)
      try {
        await storage.createUsageHistory({
          userId,
          actionType: update.actionType,
          resourceUsed: update.resourceUsed,
          cost: update.cost.toString(),
          details: update.details,
          generatedImageId: update.generatedImageId
        });
      } catch (error) {
        console.log('Usage history recording skipped (table may not exist):', (error as Error).message);
      }

      // Update usage counters
      const updates: Record<string, unknown> = {
        totalCostIncurred: (parseFloat(usage.totalCostIncurred) + update.cost).toFixed(4),
        lastGenerationAt: new Date()
      };

      // Only count 'generation' actions against limits, NOT 'training'
      if (update.actionType === 'generation') {
        const currentMonthlyUsed = usage.monthlyGenerationsUsed ?? 0;
        updates.monthlyGenerationsUsed = currentMonthlyUsed + 1;
        
        if (usage.monthlyGenerationsAllowed) {
          updates.monthlyGenerationsUsed = currentMonthlyUsed + 1;
        }

        // Check if limit is reached
        if (isValidPlan(usage.plan)) {
          const planLimits = PLAN_LIMITS[usage.plan];
          // All plans use monthly limits in new single-tier model
          if (planLimits.resetMonthly) {
            const newMonthlyUsed = updates.monthlyGenerationsUsed as number;
            updates.isLimitReached = newMonthlyUsed >= (usage.monthlyGenerationsAllowed ?? 0);
          }
        }
      }
      // Training actions are tracked in history but don't count against generation limits

      await storage.updateUserUsage(userId, updates);
    } catch (error) {
      console.error(`Failed to record usage for user ${userId}:`, error);
      throw new Error('Failed to record usage');
    }
  }

  // Reset monthly usage for Studio plans
  static async resetMonthlyUsage(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      const now = new Date();
      const nextPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      await storage.updateUserUsage(userId, {
        monthlyGenerationsUsed: 0,
        currentPeriodStart: now,
        currentPeriodEnd: nextPeriodEnd,
        isLimitReached: false
      });
    } catch (error) {
      console.error(`Failed to reset monthly usage for user ${userId}:`, error);
      throw new Error('Failed to reset monthly usage');
    }
  }

  // Get usage statistics for dashboard
  static async getUserStats(userId: string): Promise<Record<string, unknown> | null> {
    if (!userId) {
      return null;
    }

    try {
      const usage = await storage.getUserUsage(userId);
      if (!usage) return null;

      if (!isValidPlan(usage.plan)) {
        console.warn(`Invalid plan for user ${userId}: ${usage.plan}`);
        return null;
      }

      const planLimits = PLAN_LIMITS[usage.plan];
      const usageCheck = await this.checkUsageLimit(userId);
      
      // Get recent usage history
      const recentHistory = await storage.getUserUsageHistory(userId, 30); // Last 30 days

      return {
        plan: usage.plan,
        planLimits,
        usage: usageCheck,
        totalCostIncurred: parseFloat(usage.totalCostIncurred),
        lastGenerationAt: usage.lastGenerationAt,
        recentActivity: recentHistory,
        createdAt: usage.createdAt
      };
    } catch (error) {
      console.error(`Failed to get user stats for ${userId}:`, error);
      return null;
    }
  }

  // Admin function to get user costs (for Sandra's admin dashboard)
  static async getUserCostAnalysis(userId: string): Promise<Record<string, unknown> | null> {
    if (!userId) {
      return null;
    }

    try {
      const usage = await storage.getUserUsage(userId);
      const history = await storage.getUserUsageHistory(userId);
      
      if (!usage) return null;

      if (!isValidPlan(usage.plan)) {
        console.warn(`Invalid plan for cost analysis user ${userId}: ${usage.plan}`);
        return null;
      }

      const totalCost = parseFloat(usage.totalCostIncurred);
      const planRevenue = PLAN_LIMITS[usage.plan].cost;
      const profitMargin = planRevenue - totalCost;
      const profitPercentage = planRevenue > 0 ? ((profitMargin / planRevenue) * 100).toFixed(1) : '0.0';

      return {
        userId,
        plan: usage.plan,
        totalGenerations: usage.monthlyGenerationsUsed ?? 0,
        totalCost,
        planRevenue,
        profitMargin,
        profitPercentage: `${profitPercentage}%`,
        costBreakdown: this.analyzeCostBreakdown(history ?? []),
        isHealthy: profitMargin > 0
      };
    } catch (error) {
      console.error(`Failed to get cost analysis for user ${userId}:`, error);
      return null;
    }
  }

  // Analyze cost breakdown by resource type
  private static analyzeCostBreakdown(history: Array<{ resourceUsed: string; cost: string }>): Record<string, number> {
    const breakdown = {
      replicate_ai: 0,
      claude_api: 0,
      openai_api: 0
    };

    history.forEach(record => {
      if (isValidApiResource(record.resourceUsed)) {
        breakdown[record.resourceUsed] += parseFloat(record.cost);
      }
    });

    return breakdown;
  }

  // Check if user needs to upgrade (for upselling)
  static async checkUpgradeRecommendation(userId: string): Promise<Record<string, unknown>> {
    if (!userId) {
      return { shouldUpgrade: false };
    }

    try {
      const usage = await storage.getUserUsage(userId);
      if (!usage) return { shouldUpgrade: false };

      const usageCheck = await this.checkUsageLimit(userId);
      
      // Single-tier model: Users on sselfie-studio plan who need optimization advice
      if (usage.plan === 'sselfie-studio' && usage.monthlyGenerationsUsed && usage.monthlyGenerationsUsed >= 90) {
        return {
          shouldUpgrade: false,
          reason: 'High usage detected',
          message: 'You\'re getting great value from your plan! Consider upgrading your photo selection strategy with Maya for even better results.'
        };
      }

      return { shouldUpgrade: false };
    } catch (error) {
      console.error(`Failed to check upgrade recommendation for user ${userId}:`, error);
      return { shouldUpgrade: false };
    }
  }
}