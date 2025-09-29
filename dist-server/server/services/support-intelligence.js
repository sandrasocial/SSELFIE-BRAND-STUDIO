import { storage } from '../storage.js';
export class SupportIntelligenceService {
    static async getUserSupportContext(userId) {
        try {
            console.log(`🧠 PHASE 2: Gathering support intelligence for user ${userId}`);
            const user = await storage.getUser(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const subscription = await this.getSubscriptionContext(userId, user);
            const training = await this.getTrainingContext(userId);
            const usage = await this.getUsageContext(userId);
            const technical = await this.getTechnicalContext(userId);
            const context = {
                subscription,
                training,
                usage,
                technical
            };
            console.log(`🧠 PHASE 2: Support context gathered - Plan: ${subscription.plan}, Training: ${training.trainingStatus}, Usage: ${usage.recentGenerations}/${subscription.generationsTotal}`);
            return context;
        }
        catch (error) {
            console.error('❌ PHASE 2: Error gathering support context:', error);
            return this.getBasicSupportContext();
        }
    }
    static async getSubscriptionContext(userId, user) {
        try {
            const plan = user.subscriptionPlan || 'sselfie-studio';
            const status = user.subscriptionStatus || 'active';
            const usageInfo = await storage.getUserUsage(userId);
            const generationsUsed = usageInfo?.monthlyGenerationsUsed || 0;
            let generationsTotal = 100;
            if (user.subscriptionPlan === 'admin' || generationsUsed === -1) {
                generationsTotal = -1;
            }
            return {
                plan: plan,
                status: status,
                generationsUsed: generationsUsed,
                generationsTotal: generationsTotal,
                billingStatus: user.billingStatus || 'current',
                nextBilling: user.nextBilling ? new Date(user.nextBilling) : undefined
            };
        }
        catch (error) {
            console.error('❌ PHASE 2: Error getting subscription context:', error);
            return {
                plan: 'sselfie-studio',
                status: 'active',
                generationsUsed: 0,
                generationsTotal: 100,
                billingStatus: 'current'
            };
        }
    }
    static async getTrainingContext(userId) {
        try {
            const userModel = await storage.getUserModel(userId);
            const hasModel = !!userModel;
            let trainingStatus = 'no_model';
            let lastTrainingDate;
            let modelQuality;
            if (hasModel && userModel) {
                trainingStatus = userModel.trainingStatus || 'completed';
                lastTrainingDate = new Date(userModel.createdAt);
                modelQuality = userModel.trainingStatus === 'completed' ? 'good' : 'unknown';
                if (userModel.trainingStatus === 'training') {
                    trainingStatus = 'in_progress';
                }
                else if (userModel.trainingStatus === 'failed') {
                    trainingStatus = 'failed';
                }
                else if (userModel.trainingStatus === 'completed') {
                    trainingStatus = 'completed';
                }
            }
            return {
                hasModel,
                trainingStatus,
                lastTrainingDate,
                modelQuality
            };
        }
        catch (error) {
            console.error('❌ PHASE 2: Error getting training context:', error);
            return {
                hasModel: false,
                trainingStatus: 'unknown'
            };
        }
    }
    static async getUsageContext(userId) {
        try {
            const usageInfo = await storage.getUserUsage(userId);
            const recentGenerations = usageInfo?.monthlyGenerationsUsed || 0;
            const totalGenerations = usageInfo?.monthlyGenerationsUsed || 0;
            const mayaChats = await storage.getMayaChats(userId);
            const lastActivity = mayaChats.length > 0 ? mayaChats[0].lastActivity || mayaChats[0].createdAt : undefined;
            const favoriteStyles = await this.analyzeFavoriteStyles(userId);
            const commonIssues = await this.analyzeCommonIssues(userId);
            return {
                recentGenerations: recentGenerations,
                totalGenerations: totalGenerations || 0,
                lastActivity: lastActivity ? new Date(lastActivity) : undefined,
                favoriteStyles,
                commonIssues
            };
        }
        catch (error) {
            console.error('❌ PHASE 2: Error getting usage context:', error);
            return {
                recentGenerations: 0,
                totalGenerations: 0,
                favoriteStyles: [],
                commonIssues: []
            };
        }
    }
    static async getTechnicalContext(userId) {
        try {
            const trainingStatus = await storage.checkTrainingStatus(userId);
            const recentErrors = [];
            if (trainingStatus.needsRestart) {
                recentErrors.push(trainingStatus.reason);
            }
            const usageInfo = await storage.getUserUsage(userId);
            const lastSuccessful = usageInfo?.lastGenerationAt ? 'image_generation' : undefined;
            return {
                recentErrors: recentErrors,
                lastSuccessfulAction: lastSuccessful,
                connectionIssues: false
            };
        }
        catch (error) {
            console.error('❌ PHASE 2: Error getting technical context:', error);
            return {
                recentErrors: [],
                lastSuccessfulAction: undefined,
                connectionIssues: false
            };
        }
    }
    static async analyzeFavoriteStyles(userId) {
        try {
            return ['Business Professional', 'Lifestyle Casual'];
        }
        catch (error) {
            return [];
        }
    }
    static async analyzeCommonIssues(userId) {
        try {
            return [];
        }
        catch (error) {
            return [];
        }
    }
    static getBasicSupportContext() {
        return {
            subscription: {
                plan: 'sselfie-studio',
                status: 'active',
                generationsUsed: 0,
                generationsTotal: 100,
                billingStatus: 'current'
            },
            training: {
                hasModel: false,
                trainingStatus: 'unknown'
            },
            usage: {
                recentGenerations: 0,
                totalGenerations: 0,
                favoriteStyles: [],
                commonIssues: []
            },
            technical: {
                recentErrors: [],
                connectionIssues: false
            }
        };
    }
    static formatSupportContextForMaya(context) {
        const { subscription, training, usage, technical } = context;
        let contextText = `USER ACCOUNT CONTEXT:\n`;
        contextText += `Subscription: ${subscription.plan} plan (${subscription.status})\n`;
        contextText += `Usage: ${subscription.generationsUsed}/${subscription.generationsTotal === -1 ? 'unlimited' : subscription.generationsTotal} images this month\n`;
        contextText += `Billing: ${subscription.billingStatus}\n\n`;
        contextText += `TRAINING STATUS:\n`;
        if (training.hasModel) {
            contextText += `✅ Personal AI model: ${training.trainingStatus} (${training.modelQuality || 'good'} quality)\n`;
            if (training.lastTrainingDate) {
                contextText += `Last trained: ${training.lastTrainingDate.toLocaleDateString()}\n`;
            }
        }
        else {
            contextText += `❌ No personal AI model yet (${training.trainingStatus})\n`;
        }
        contextText += `\nUSAGE PATTERNS:\n`;
        contextText += `Recent activity: ${usage.recentGenerations} generations, total: ${usage.totalGenerations}\n`;
        if (usage.lastActivity) {
            contextText += `Last active: ${usage.lastActivity.toLocaleDateString()}\n`;
        }
        if (usage.favoriteStyles.length > 0) {
            contextText += `Favorite styles: ${usage.favoriteStyles.join(', ')}\n`;
        }
        if (technical.recentErrors.length > 0) {
            contextText += `\nRECENT ISSUES:\n`;
            technical.recentErrors.slice(0, 3).forEach(error => {
                contextText += `- ${error}\n`;
            });
        }
        return contextText;
    }
    static getMayaSupportSystemContext(userContext) {
        return `You are Maya, the intelligent support assistant for SSELFIE Studio, a premium AI personal branding platform.

CURRENT USER CONTEXT:
${userContext}

Your role is to provide helpful, professional support with complete knowledge of:
- User's subscription status and features
- Training progress and technical issues  
- Image generation usage and limits
- Account and billing questions
- Platform navigation and feature explanations

ESCALATION INTELLIGENCE:
- If issues are complex, technical, or require human judgment, suggest escalation
- For billing disputes, refunds, or account termination: escalate immediately
- For urgent technical issues affecting revenue: escalate with priority
- For feature requests or strategic guidance: escalate to Sandra
- Use the escalation trigger: "ESCALATE_TO_HUMAN" followed by reason

ESCALATION TRIGGERS:
- User mentions "refund", "cancel subscription", "billing issue"  
- Training fails multiple times despite troubleshooting
- User expresses frustration or urgency
- Complex technical integration questions
- Strategic business guidance requests

When escalating, format response as:
"I understand this needs personal attention. ESCALATE_TO_HUMAN: [brief reason]. Sandra will reach out to you directly within 24 hours with personalized assistance."

Keep responses concise but comprehensive, and always aim to resolve the user's question completely first before escalating.`;
    }
}
//# sourceMappingURL=support-intelligence.js.map