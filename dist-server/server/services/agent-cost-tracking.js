import { db } from '../drizzle.js';
import { agentCostTracking, agentBudgets } from '../../shared/schema.js';
import { eq, and, gte, sql, sum } from 'drizzle-orm';
export class AgentCostTrackingService {
    static async trackAgentUsage(userId, agentId, conversationId, tokensUsed, taskType) {
        const estimatedCost = (tokensUsed * 0.000025);
        try {
            await db.insert(agentCostTracking).values({
                userId,
                agentId,
                conversationId,
                tokensUsed,
                estimatedCost: estimatedCost.toFixed(4),
                taskType
            });
            const budgetCheck = await this.checkBudgetLimits(userId, agentId, estimatedCost);
            await this.updateBudgetSpend(userId, agentId, estimatedCost);
            return budgetCheck;
        }
        catch (error) {
            console.error('❌ Cost tracking failed:', error);
            return { shouldPause: false, remaining: 1000 };
        }
    }
    static async checkBudgetLimits(userId, agentId, newCost) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const agentBudget = await db.select().from(agentBudgets)
                .where(and(eq(agentBudgets.userId, userId), eq(agentBudgets.agentId, agentId), eq(agentBudgets.budgetType, 'daily'), eq(agentBudgets.isActive, true))).limit(1);
            if (agentBudget.length > 0) {
                const currentSpend = parseFloat(agentBudget[0].currentSpend);
                const budgetLimit = parseFloat(agentBudget[0].budgetLimit);
                const newTotal = currentSpend + newCost;
                if (newTotal >= budgetLimit) {
                    return {
                        shouldPause: true,
                        reason: `Daily budget exceeded for ${agentId}`,
                        remaining: 0,
                        budgetLimit,
                        currentSpend: newTotal
                    };
                }
                else if (newTotal >= (budgetLimit * 0.8)) {
                    return {
                        shouldPause: false,
                        warning: true,
                        reason: `80% of daily budget used for ${agentId}`,
                        remaining: budgetLimit - newTotal,
                        budgetLimit,
                        currentSpend: newTotal
                    };
                }
                return {
                    shouldPause: false,
                    remaining: budgetLimit - newTotal,
                    budgetLimit,
                    currentSpend: newTotal
                };
            }
            const globalBudget = await db.select().from(agentBudgets)
                .where(and(eq(agentBudgets.userId, userId), sql `${agentBudgets.agentId} IS NULL`, eq(agentBudgets.budgetType, 'daily'), eq(agentBudgets.isActive, true))).limit(1);
            if (globalBudget.length > 0) {
                const currentSpend = parseFloat(globalBudget[0].currentSpend);
                const budgetLimit = parseFloat(globalBudget[0].budgetLimit);
                const newTotal = currentSpend + newCost;
                if (newTotal >= budgetLimit) {
                    return {
                        shouldPause: true,
                        reason: 'Daily global budget exceeded',
                        remaining: 0,
                        budgetLimit,
                        currentSpend: newTotal
                    };
                }
                return {
                    shouldPause: false,
                    remaining: budgetLimit - newTotal,
                    budgetLimit,
                    currentSpend: newTotal
                };
            }
            return { shouldPause: false, remaining: 1000 };
        }
        catch (error) {
            console.error('❌ Budget check failed:', error);
            return { shouldPause: false, remaining: 1000 };
        }
    }
    static async updateBudgetSpend(userId, agentId, cost) {
        try {
            await db.update(agentBudgets)
                .set({
                currentSpend: sql `${agentBudgets.currentSpend} + ${cost}`,
                updatedAt: new Date()
            })
                .where(and(eq(agentBudgets.userId, userId), eq(agentBudgets.agentId, agentId), eq(agentBudgets.budgetType, 'daily'), eq(agentBudgets.isActive, true)));
            await db.update(agentBudgets)
                .set({
                currentSpend: sql `${agentBudgets.currentSpend} + ${cost}`,
                updatedAt: new Date()
            })
                .where(and(eq(agentBudgets.userId, userId), sql `${agentBudgets.agentId} IS NULL`, eq(agentBudgets.budgetType, 'daily'), eq(agentBudgets.isActive, true)));
        }
        catch (error) {
            console.error('❌ Budget update failed:', error);
        }
    }
    static async getCostSummary(userId, timeframe = 'today') {
        try {
            const now = new Date();
            let startDate;
            switch (timeframe) {
                case 'today':
                    startDate = new Date(now);
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - 30);
                    break;
                default:
                    startDate = new Date(now);
                    startDate.setHours(0, 0, 0, 0);
            }
            const costs = await db
                .select({
                agentId: agentCostTracking.agentId,
                totalCost: sum(agentCostTracking.estimatedCost),
                totalTokens: sum(agentCostTracking.tokensUsed),
                apiCalls: sum(agentCostTracking.apiCalls)
            })
                .from(agentCostTracking)
                .where(and(eq(agentCostTracking.userId, userId), gte(agentCostTracking.date, startDate)))
                .groupBy(agentCostTracking.agentId);
            const budgets = await db.select().from(agentBudgets)
                .where(and(eq(agentBudgets.userId, userId), eq(agentBudgets.isActive, true)));
            const totalCost = costs.reduce((sum, cost) => sum + parseFloat(cost.totalCost || '0'), 0);
            const totalTokens = costs.reduce((sum, cost) => sum + Number(cost.totalTokens || 0), 0);
            const totalApiCalls = costs.reduce((sum, cost) => sum + Number(cost.apiCalls || 0), 0);
            return {
                timeframe,
                totalCost: totalCost.toFixed(4),
                totalTokens,
                totalApiCalls,
                costsByAgent: costs,
                budgets,
                activeAgents: costs.length
            };
        }
        catch (error) {
            console.error('❌ Cost summary failed:', error);
            return {
                timeframe,
                totalCost: '0.0000',
                totalTokens: 0,
                totalApiCalls: 0,
                costsByAgent: [],
                budgets: [],
                activeAgents: 0
            };
        }
    }
    static async createDefaultBudgets(userId) {
        try {
            await db.insert(agentBudgets).values({
                userId,
                agentId: null,
                budgetType: 'daily',
                budgetLimit: '10.00',
                currentSpend: '0.00',
                isActive: true,
                alertThreshold: 80
            });
            await db.insert(agentBudgets).values({
                userId,
                agentId: null,
                budgetType: 'monthly',
                budgetLimit: '200.00',
                currentSpend: '0.00',
                isActive: true,
                alertThreshold: 80
            });
            console.log(`✅ Created default budgets for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Failed to create default budgets:', error);
        }
    }
    static async resetDailyBudgets() {
        try {
            await db.update(agentBudgets)
                .set({
                currentSpend: '0.00',
                resetDate: new Date(),
                updatedAt: new Date()
            })
                .where(eq(agentBudgets.budgetType, 'daily'));
            console.log('✅ Daily budgets reset');
        }
        catch (error) {
            console.error('❌ Failed to reset daily budgets:', error);
        }
    }
    static async emergencyStopAllAgents(userId, reason) {
        try {
            await db.update(agentBudgets)
                .set({
                isActive: false,
                updatedAt: new Date()
            })
                .where(eq(agentBudgets.userId, userId));
            console.log(`🚨 EMERGENCY STOP: All agents for user ${userId} stopped - ${reason}`);
            return true;
        }
        catch (error) {
            console.error('❌ Emergency stop failed:', error);
            return false;
        }
    }
}
//# sourceMappingURL=agent-cost-tracking.js.map