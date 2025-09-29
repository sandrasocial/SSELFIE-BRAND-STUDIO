import { storage } from './storage.js';
export const PLAN_LIMITS = {
    'admin': {
        totalGenerations: null,
        monthlyGenerations: 999999,
        cost: 0,
        description: 'Unlimited admin access',
        resetMonthly: false
    },
    'sselfie-studio': {
        totalGenerations: null,
        monthlyGenerations: 100,
        cost: 47,
        description: '100 AI generations per month + Maya AI personal brand strategist',
        resetMonthly: true
    }
};
export function isValidPlan(plan) {
    return plan in PLAN_LIMITS;
}
export const API_COSTS = {
    'replicate_ai': 0.038,
    'claude_api': 0.015,
    'openai_api': 0.020
};
export function isValidApiResource(resource) {
    return resource in API_COSTS;
}
export class UsageService {
    static async initializeUserUsage(userId, plan) {
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
        }
        catch (error) {
            console.error(`Failed to initialize usage for user ${userId}:`, error);
            throw new Error('Failed to initialize user usage tracking');
        }
    }
    static async checkUsageLimit(userId) {
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
            const user = await storage.getUser(userId);
            const adminEmails = ['ssa@ssasocial.com', 'sandrajonna@gmail.com', 'sandra@sselfie.ai'];
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
            if (planLimits.resetMonthly && usage.currentPeriodEnd && now > usage.currentPeriodEnd) {
                await this.resetMonthlyUsage(userId);
                const refreshedUsage = await storage.getUserUsage(userId);
                if (refreshedUsage) {
                    Object.assign(usage, refreshedUsage);
                }
            }
            if (usage.plan === 'ai-pack') {
                console.log(`Migrating legacy ai-pack user ${userId} to sselfie-studio plan`);
                await this.initializeUserUsage(userId, 'sselfie-studio');
                usage = await storage.getUserUsage(userId);
                if (!usage) {
                    throw new Error('Failed to migrate user plan');
                }
            }
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
        }
        catch (error) {
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
    static async recordUsage(userId, update) {
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
            try {
                await storage.createUsageHistory({
                    userId,
                    action: update.actionType,
                    cost: update.cost,
                    details: update.details
                });
            }
            catch (error) {
                console.log('Usage history recording skipped (table may not exist):', error.message);
            }
            const updates = {
                totalCostIncurred: (parseFloat(usage.totalCostIncurred) + update.cost).toFixed(4),
                lastGenerationAt: new Date()
            };
            if (update.actionType === 'generation') {
                const currentMonthlyUsed = usage.monthlyGenerationsUsed ?? 0;
                updates.monthlyGenerationsUsed = currentMonthlyUsed + 1;
                if (usage.monthlyGenerationsAllowed) {
                    updates.monthlyGenerationsUsed = currentMonthlyUsed + 1;
                }
                if (isValidPlan(usage.plan)) {
                    const planLimits = PLAN_LIMITS[usage.plan];
                    if (planLimits.resetMonthly) {
                        const newMonthlyUsed = updates.monthlyGenerationsUsed;
                        updates.isLimitReached = newMonthlyUsed >= (usage.monthlyGenerationsAllowed ?? 0);
                    }
                }
            }
            await storage.updateUserUsage(userId, updates);
        }
        catch (error) {
            console.error(`Failed to record usage for user ${userId}:`, error);
            throw new Error('Failed to record usage');
        }
    }
    static async resetMonthlyUsage(userId) {
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
        }
        catch (error) {
            console.error(`Failed to reset monthly usage for user ${userId}:`, error);
            throw new Error('Failed to reset monthly usage');
        }
    }
    static async getUserStats(userId) {
        if (!userId) {
            return null;
        }
        try {
            const usage = await storage.getUserUsage(userId);
            if (!usage)
                return null;
            if (!isValidPlan(usage.plan)) {
                console.warn(`Invalid plan for user ${userId}: ${usage.plan}`);
                return null;
            }
            const planLimits = PLAN_LIMITS[usage.plan];
            const usageCheck = await this.checkUsageLimit(userId);
            const recentHistory = await storage.getUserUsageHistory(userId);
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
        catch (error) {
            console.error(`Failed to get user stats for ${userId}:`, error);
            return null;
        }
    }
    static async getUserCostAnalysis(userId) {
        if (!userId) {
            return null;
        }
        try {
            const usage = await storage.getUserUsage(userId);
            const history = await storage.getUserUsageHistory(userId);
            if (!usage)
                return null;
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
        }
        catch (error) {
            console.error(`Failed to get cost analysis for user ${userId}:`, error);
            return null;
        }
    }
    static analyzeCostBreakdown(history) {
        const breakdown = {
            replicate_ai: 0,
            claude_api: 0,
            openai_api: 0
        };
        if (Array.isArray(history)) {
            history.forEach(record => {
                if (record && typeof record === 'object' && 'resourceUsed' in record && 'cost' in record) {
                    const typedRecord = record;
                    if (isValidApiResource(typedRecord.resourceUsed)) {
                        breakdown[typedRecord.resourceUsed] += parseFloat(typedRecord.cost);
                    }
                }
            });
        }
        return breakdown;
    }
    static async checkUpgradeRecommendation(userId) {
        if (!userId) {
            return { shouldUpgrade: false };
        }
        try {
            const usage = await storage.getUserUsage(userId);
            if (!usage)
                return { shouldUpgrade: false };
            const usageCheck = await this.checkUsageLimit(userId);
            if (usage.plan === 'sselfie-studio' && usage.monthlyGenerationsUsed && usage.monthlyGenerationsUsed >= 90) {
                return {
                    shouldUpgrade: false,
                    reason: 'High usage detected',
                    message: 'You\'re getting great value from your plan! Consider upgrading your photo selection strategy with Maya for even better results.'
                };
            }
            return { shouldUpgrade: false };
        }
        catch (error) {
            console.error(`Failed to check upgrade recommendation for user ${userId}:`, error);
            return { shouldUpgrade: false };
        }
    }
}
//# sourceMappingURL=usage-service.js.map