import { storage } from './storage';

// Plan configuration with usage limits and costs
export const PLAN_LIMITS = {
  'admin': {
    totalGenerations: null,
    monthlyGenerations: 999999, // Unlimited for admin
    cost: 0,
    description: 'Unlimited admin access',
    resetMonthly: false
  },
  'free': {
    totalGenerations: null,
    monthlyGenerations: 6, // 6 free images per month (allows 2 generations of 3 images each)
    cost: 0,
    description: '6 AI generations per month',
    resetMonthly: true
  },
  'FREE': {
    totalGenerations: null,
    monthlyGenerations: 6, // 6 free images per month (allows 2 generations of 3 images each)
    cost: 0,
    description: '6 AI generations per month',
    resetMonthly: true
  },
  'sselfie-studio': {
    totalGenerations: null,
    monthlyGenerations: 100, // €67/month for 100 AI images
    cost: 47,
    description: '100 AI generations per month + Maya AI chat',
    resetMonthly: true
  },
  'pro': {
    totalGenerations: null,
    monthlyGenerations: 100, // Pro plan with 100 images per month
    cost: 47,
    description: '100 AI generations per month + Maya AI + Victoria AI',
    resetMonthly: true
  },

  'ai-pack': {
    totalGenerations: 100,
    monthlyGenerations: null, // Legacy one-time purchase
    cost: 47,
    description: '100 AI generations (legacy plan)',
    resetMonthly: false
  },
  'studio-founding': {
    totalGenerations: null, // Unlimited lifetime but monthly limits
    monthlyGenerations: 100,
    cost: 97,
    description: '100 generations per month + Studio access',
    resetMonthly: true
  },
  'studio-standard': {
    totalGenerations: null,
    monthlyGenerations: 100,
    cost: 147,
    description: '100 generations per month + Priority support (legacy plan)',
    resetMonthly: true
  }
} as const;

// API costs tracking
export const API_COSTS = {
  'replicate_ai': 0.038, // Per generation (4 images)
  'claude_api': 0.015,   // Per conversation
  'openai_api': 0.020    // Per conversation
} as const;

export interface UsageCheck {
  canGenerate: boolean;
  remainingGenerations: number;
  totalUsed: number;
  totalAllowed: number;
  monthlyUsed?: number;
  monthlyAllowed?: number;
  resetDate?: Date;
  reason?: string;
}

export interface UsageUpdate {
  actionType: 'generation' | 'api_call' | 'sandra_chat' | 'training';
  resourceUsed: 'replicate_ai' | 'claude_api' | 'openai_api';
  cost: number;
  details?: any;
  generatedImageId?: number;
}

export class UsageService {
  
  // Initialize usage tracking for new user
  static async initializeUserUsage(userId: string, plan: string): Promise<UserUsage> {
    const planLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];
    if (!planLimits) {
      throw new Error(`Invalid plan: ${plan}`);
    }

    const now = new Date();
    const periodEnd = planLimits.resetMonthly 
      ? new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
      : null;

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
  }

  // Check if user can generate images
  static async checkUsageLimit(userId: string): Promise<UsageCheck> {
    // CRITICAL: Check if user is admin first
    const user = await storage.getUser(userId);
    // FIXED: Use consistent admin emails across all services - REAL EMAIL ONLY
    const adminEmails = ['ssa@ssasocial.com'];
    
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
    
    // Auto-initialize usage for new users with FREE plan
    if (!usage) {
      await this.initializeUserUsage(userId, 'FREE');
      usage = await storage.getUserUsage(userId);
      if (!usage) {
        throw new Error('Failed to initialize user usage');
      }
    }

    const planLimits = PLAN_LIMITS[usage.plan as keyof typeof PLAN_LIMITS];
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

    // For AI Pack (one-time purchase)
    if (usage.plan === 'ai-pack') {
      const remaining = usage.totalGenerationsAllowed - usage.totalGenerationsUsed;
      return {
        canGenerate: remaining > 0,
        remainingGenerations: remaining,
        totalUsed: usage.totalGenerationsUsed,
        totalAllowed: usage.totalGenerationsAllowed,
        reason: remaining <= 0 ? 'AI Pack limit reached. Upgrade to Studio for monthly generations.' : undefined
      };
    }

    // For Studio plans (monthly limits)
    if (usage.monthlyGenerationsAllowed) {
      const monthlyRemaining = usage.monthlyGenerationsAllowed - (usage.monthlyGenerationsUsed || 0);
      return {
        canGenerate: monthlyRemaining > 0,
        remainingGenerations: monthlyRemaining,
        totalUsed: usage.totalGenerationsUsed,
        totalAllowed: usage.totalGenerationsAllowed || 999999,
        monthlyUsed: usage.monthlyGenerationsUsed || 0,
        monthlyAllowed: usage.monthlyGenerationsAllowed,
        resetDate: usage.currentPeriodEnd || undefined,
        reason: monthlyRemaining <= 0 ? 'Monthly limit reached. Resets next period.' : undefined
      };
    }

    return {
      canGenerate: false,
      remainingGenerations: 0,
      totalUsed: usage.totalGenerationsUsed,
      totalAllowed: 0,
      reason: 'Invalid plan configuration'
    };
  }

  // Record usage when user generates images
  static async recordUsage(userId: string, update: UsageUpdate): Promise<void> {
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
      console.log('Usage history recording skipped (table may not exist):', error.message);
    }

    // Update usage counters
    const updates: any = {
      totalCostIncurred: (parseFloat(usage.totalCostIncurred) + update.cost).toFixed(4),
      lastGenerationAt: new Date()
    };

    // Only count 'generation' actions against limits, NOT 'training'
    if (update.actionType === 'generation') {
      updates.totalGenerationsUsed = usage.totalGenerationsUsed + 1;
      
      if (usage.monthlyGenerationsAllowed) {
        updates.monthlyGenerationsUsed = (usage.monthlyGenerationsUsed || 0) + 1;
      }

      // Check if limit is reached
      const planLimits = PLAN_LIMITS[usage.plan as keyof typeof PLAN_LIMITS];
      if (usage.plan === 'ai-pack') {
        updates.isLimitReached = updates.totalGenerationsUsed >= usage.totalGenerationsAllowed;
      } else if (planLimits.resetMonthly) {
        updates.isLimitReached = updates.monthlyGenerationsUsed >= (usage.monthlyGenerationsAllowed || 0);
      }
    }
    // Training actions are tracked in history but don't count against generation limits

    await storage.updateUserUsage(userId, updates);
  }

  // Reset monthly usage for Studio plans
  static async resetMonthlyUsage(userId: string): Promise<void> {
    const now = new Date();
    const nextPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    await storage.updateUserUsage(userId, {
      monthlyGenerationsUsed: 0,
      currentPeriodStart: now,
      currentPeriodEnd: nextPeriodEnd,
      isLimitReached: false
    });
  }

  // Get usage statistics for dashboard
  static async getUserStats(userId: string): Promise<any> {
    const usage = await storage.getUserUsage(userId);
    if (!usage) return null;

    const planLimits = PLAN_LIMITS[usage.plan as keyof typeof PLAN_LIMITS];
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
  }

  // Admin function to get user costs (for Sandra's admin dashboard)
  static async getUserCostAnalysis(userId: string): Promise<any> {
    const usage = await storage.getUserUsage(userId);
    const history = await storage.getUserUsageHistory(userId);
    
    if (!usage) return null;

    const totalCost = parseFloat(usage.totalCostIncurred);
    const planRevenue = PLAN_LIMITS[usage.plan as keyof typeof PLAN_LIMITS].cost;
    const profitMargin = planRevenue - totalCost;
    const profitPercentage = ((profitMargin / planRevenue) * 100).toFixed(1);

    return {
      userId,
      plan: usage.plan,
      totalGenerations: usage.totalGenerationsUsed,
      totalCost,
      planRevenue,
      profitMargin,
      profitPercentage: `${profitPercentage}%`,
      costBreakdown: this.analyzeCostBreakdown(history),
      isHealthy: profitMargin > 0
    };
  }

  // Analyze cost breakdown by resource type
  private static analyzeCostBreakdown(history: any[]): any {
    const breakdown = {
      replicate_ai: 0,
      claude_api: 0,
      openai_api: 0
    };

    history.forEach(record => {
      if (breakdown.hasOwnProperty(record.resourceUsed)) {
        breakdown[record.resourceUsed as keyof typeof breakdown] += parseFloat(record.cost);
      }
    });

    return breakdown;
  }

  // Check if user needs to upgrade (for upselling)
  static async checkUpgradeRecommendation(userId: string): Promise<any> {
    const usage = await storage.getUserUsage(userId);
    if (!usage) return null;

    const usageCheck = await this.checkUsageLimit(userId);
    
    // AI Pack users who are close to limit
    if (usage.plan === 'ai-pack' && usageCheck.remainingGenerations <= 20) {
      return {
        shouldUpgrade: true,
        reason: 'AI Pack limit almost reached',
        recommendedPlan: 'studio-founding',
        message: 'Upgrade to Studio Founding for 100 monthly generations + complete business platform!'
      };
    }

    // Studio users who consistently hit monthly limits
    if (usage.plan === 'studio-founding' && usage.monthlyGenerationsUsed && usage.monthlyGenerationsUsed >= 90) {
      return {
        shouldUpgrade: true,
        reason: 'Monthly limit consistently reached',
        recommendedPlan: 'studio-standard',
        message: 'Upgrade to SSELFIE Studio for 100 monthly generations + Maya AI + Victoria AI!'
      };
    }

    return { shouldUpgrade: false };
  }
}