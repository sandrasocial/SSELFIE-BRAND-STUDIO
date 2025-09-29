import { storage } from '../storage.js';
import { personalBrandService } from './personal-brand-service.js';
export class UnifiedMayaContextService {
    contextCache = {};
    CACHE_DURATION_MS = 5 * 60 * 1000;
    async getUnifiedMayaContext(userId, sessionId) {
        const cacheKey = `${userId}_${sessionId || 'default'}`;
        const cached = this.contextCache[cacheKey];
        if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION_MS) {
            console.log(`⚡ UNIFIED CONTEXT: Cache hit for user ${userId}`);
            return cached.data;
        }
        console.log(`🔄 UNIFIED CONTEXT: Loading fresh context for user ${userId}`);
        const startTime = Date.now();
        try {
            const [user, personalBrandData] = await Promise.all([
                storage.getUser(userId),
                this.getPersonalBrandDataOptimized(userId)
            ]);
            if (!user) {
                console.warn(`⚠️ UNIFIED CONTEXT: User ${userId} not found`);
                return this.createEmptyContext(userId, cacheKey);
            }
            const unifiedContext = await this.buildUnifiedContext(userId, user, personalBrandData, sessionId, cacheKey);
            this.contextCache[cacheKey] = {
                data: unifiedContext,
                timestamp: Date.now()
            };
            const loadTime = Date.now() - startTime;
            console.log(`✅ UNIFIED CONTEXT: Complete context loaded in ${loadTime}ms for ${user.email}`);
            return unifiedContext;
        }
        catch (error) {
            console.error(`❌ UNIFIED CONTEXT: Failed to load context for user ${userId}:`, error);
            return this.createEmptyContext(userId, cacheKey);
        }
    }
    async getPersonalBrandDataOptimized(userId) {
        try {
            return await personalBrandService.getPersonalBrandProfile(userId);
        }
        catch (error) {
            console.warn(`⚠️ UNIFIED CONTEXT: Personal brand data unavailable for ${userId}:`, error);
            return null;
        }
    }
    async buildUnifiedContext(userId, user, personalBrandData, sessionId, cacheKey) {
        const remainingGenerations = user.monthlyGenerationLimit === -1
            ? -1
            : Math.max((user.monthlyGenerationLimit || 100) - (user.monthlyGenerationsUsed || 0), 0);
        const usagePercentage = user.monthlyGenerationLimit === -1
            ? 0
            : Math.min(((user.monthlyGenerationsUsed || 0) / (user.monthlyGenerationLimit || 100)) * 100, 100);
        const subscription = {
            plan: user.plan || 'sselfie-studio',
            planDisplayName: 'SSELFIE Studio',
            monthlyPrice: 47,
            monthlyUsed: user.monthlyGenerationsUsed || 0,
            monthlyLimit: user.monthlyGenerationLimit || 100,
            isAdmin: user.monthlyGenerationLimit === -1,
            nextBillingDate: user.subscriptionRenewDate,
            subscriptionActive: user.monthlyGenerationLimit > 0 || user.monthlyGenerationLimit === -1,
            accountType: user.monthlyGenerationLimit === -1 ? 'Admin Account' : 'SSELFIE Studio Member',
            features: [
                'Personal AI model training',
                `${user.monthlyGenerationLimit === -1 ? 'Unlimited' : user.monthlyGenerationLimit || 100} monthly professional photos`,
                'Maya AI photographer access',
                'Brand photo gallery',
                'Style customization'
            ],
            canGenerate: user.monthlyGenerationLimit === -1 || remainingGenerations > 0,
            remainingGenerations: remainingGenerations === -1 ? 999999 : remainingGenerations,
            usagePercentage
        };
        const profile = {
            name: user.name,
            email: user.email || '',
            firstName: user.firstName,
            lastName: user.lastName,
            profession: user.profession,
            brandStyle: user.brandStyle,
            photoGoals: user.photoGoals,
            joinedDate: user.createdAt
        };
        const displayName = user.firstName || user.name || user.email?.split('@')[0] || 'there';
        const isNewUser = !personalBrandData?.completedAt;
        const needsOnboarding = !personalBrandData?.completedAt || (personalBrandData?.currentStep || 0) < 6;
        return {
            userId,
            userExists: true,
            subscription,
            profile,
            personalBrand: personalBrandData,
            conversationHistory: [],
            contextualIntelligence: null,
            displayName,
            isNewUser,
            needsOnboarding,
            cacheTimestamp: Date.now(),
            cacheKey: cacheKey || `${userId}_default`
        };
    }
    createEmptyContext(userId, cacheKey) {
        return {
            userId,
            userExists: false,
            subscription: {
                plan: 'none',
                planDisplayName: 'No Plan',
                monthlyPrice: 0,
                monthlyUsed: 0,
                monthlyLimit: 0,
                isAdmin: false,
                subscriptionActive: false,
                accountType: 'No Account',
                features: [],
                canGenerate: false,
                remainingGenerations: 0,
                usagePercentage: 0
            },
            profile: {
                email: '',
                firstName: 'Guest'
            },
            personalBrand: null,
            conversationHistory: [],
            contextualIntelligence: null,
            displayName: 'Guest',
            isNewUser: true,
            needsOnboarding: true,
            cacheTimestamp: Date.now(),
            cacheKey
        };
    }
    async getSubscriptionContext(userId) {
        const context = await this.getUnifiedMayaContext(userId);
        return context.userExists ? context.subscription : null;
    }
    async getProfileContext(userId) {
        const context = await this.getUnifiedMayaContext(userId);
        return context.userExists ? context.profile : null;
    }
    clearUserCache(userId) {
        const keysToDelete = Object.keys(this.contextCache).filter(key => key.startsWith(userId));
        keysToDelete.forEach(key => delete this.contextCache[key]);
        console.log(`🗑️ UNIFIED CONTEXT: Cleared cache for user ${userId}`);
    }
    getCacheStats() {
        const totalCached = Object.keys(this.contextCache).length;
        return {
            totalCached,
            cacheHitRate: 0,
            avgLoadTime: 0
        };
    }
    cleanupCache() {
        const now = Date.now();
        const expiredKeys = Object.keys(this.contextCache).filter(key => (now - this.contextCache[key].timestamp) > this.CACHE_DURATION_MS);
        expiredKeys.forEach(key => delete this.contextCache[key]);
        if (expiredKeys.length > 0) {
            console.log(`🧹 UNIFIED CONTEXT: Cleaned up ${expiredKeys.length} expired cache entries`);
        }
    }
}
export const unifiedMayaContextService = new UnifiedMayaContextService();
setInterval(() => {
    unifiedMayaContextService.cleanupCache();
}, 10 * 60 * 1000);
//# sourceMappingURL=unified-maya-context-service.js.map