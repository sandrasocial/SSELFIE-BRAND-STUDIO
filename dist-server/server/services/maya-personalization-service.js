import { storage } from '../storage.js';
export class MayaPersonalizationService {
    async getUserPersonalizationContext(userId) {
        try {
            const user = await storage.getUser(userId);
            if (!user) {
                console.warn(`🔍 Maya Personalization: User ${userId} not found`);
                return null;
            }
            const subscriptionData = {
                plan: user.plan || 'sselfie-studio',
                planDisplayName: 'SSELFIE Studio',
                monthlyPrice: 47,
                monthlyUsed: user.generationsUsedThisMonth || 0,
                monthlyLimit: user.monthlyGenerationLimit || 100,
                isAdmin: user.monthlyGenerationLimit === -1,
                nextBillingDate: user.subscriptionRenewDate || new Date(),
                subscriptionActive: user.monthlyGenerationLimit > 0 || user.monthlyGenerationLimit === -1,
                accountType: user.monthlyGenerationLimit === -1 ? 'Admin Account' : 'SSELFIE Studio Member',
                features: [
                    'Personal AI model training',
                    `${user.monthlyGenerationLimit === -1 ? 'Unlimited' : user.monthlyGenerationLimit || 100} monthly professional photos`,
                    'Maya AI photographer access',
                    'Brand photo gallery',
                    'Style customization'
                ]
            };
            const profileData = {
                name: user.displayName || `${user.firstName} ${user.lastName}`,
                email: user.email || '',
                firstName: user.firstName,
                lastName: user.lastName,
                profession: user.profession,
                brandStyle: user.brandStyle,
                photoGoals: user.photoGoals,
                joinedDate: user.createdAt
            };
            const remainingGenerations = user.monthlyGenerationLimit === -1
                ? -1
                : (user.monthlyGenerationLimit || 100) - (user.generationsUsedThisMonth || 0);
            const usagePercentage = user.monthlyGenerationLimit === -1
                ? 0
                : ((user.generationsUsedThisMonth || 0) / (user.monthlyGenerationLimit || 100)) * 100;
            const usageStats = {
                generationsThisMonth: user.generationsUsedThisMonth || 0,
                remainingGenerations: Math.max(remainingGenerations, 0),
                usagePercentage: Math.min(usagePercentage, 100),
                canGenerate: user.monthlyGenerationLimit === -1 || remainingGenerations > 0
            };
            console.log(`✅ Maya Personalization: Context loaded for ${user.email}`, {
                plan: subscriptionData.plan,
                monthlyUsed: subscriptionData.monthlyUsed,
                monthlyLimit: subscriptionData.monthlyLimit,
                canGenerate: usageStats.canGenerate
            });
            return {
                userId,
                subscriptionData,
                profileData,
                usageStats
            };
        }
        catch (error) {
            console.error('❌ Maya Personalization Service error:', error);
            return null;
        }
    }
    generatePersonalizedGreeting(context) {
        const { profileData, subscriptionData, usageStats } = context;
        const name = profileData.firstName || profileData.name || profileData.email?.split('@')[0] || 'there';
        const usageText = subscriptionData.isAdmin
            ? 'unlimited generations'
            : `${usageStats.remainingGenerations} generations remaining this month`;
        if (profileData.profession) {
            return `Welcome back ${name}! As a ${profileData.profession}, you have ${usageText}. What professional photos shall we create today?`;
        }
        return `Hi ${name}! You have ${usageText}. Ready to create some stunning professional photos?`;
    }
    generateBioSuggestions(context) {
        const { profileData } = context;
        const suggestions = [
            `Professional ${profileData.profession || 'entrepreneur'} creating authentic brand presence`,
            `Passionate about ${profileData.brandStyle || 'professional excellence'} and visual storytelling`,
            `Building meaningful connections through ${profileData.photoGoals || 'compelling professional imagery'}`
        ];
        return suggestions;
    }
    generateBrandingContent(context) {
        const { profileData } = context;
        return {
            brandVoice: profileData.brandStyle || 'Professional, authentic, and approachable',
            visualStyle: `${profileData.brandStyle || 'Modern professional'} aesthetic with ${profileData.photoGoals || 'compelling visual storytelling'}`,
            targetAudience: `Professionals seeking ${profileData.profession || 'business'} services and authentic brand connections`
        };
    }
}
export const mayaPersonalizationService = new MayaPersonalizationService();
//# sourceMappingURL=maya-personalization-service.js.map