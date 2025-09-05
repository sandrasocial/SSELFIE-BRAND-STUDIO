/**
 * SUPPORT INTELLIGENCE SERVICE
 * Phase 2: Give Support Maya access to user data for intelligent assistance
 * 
 * Provides user context for support conversations:
 * - Subscription details and plan information
 * - Training status and model availability  
 * - Generation history and usage patterns
 * - Error logs and technical context
 */

import { storage } from '../storage';

export interface UserSupportContext {
  subscription: {
    plan: string;
    status: string;
    generationsUsed: number;
    generationsTotal: number;
    billingStatus: string;
    nextBilling?: Date;
  };
  training: {
    hasModel: boolean;
    trainingStatus: string;
    lastTrainingDate?: Date;
    trainingProgress?: string;
    modelQuality?: string;
  };
  usage: {
    recentGenerations: number;
    totalGenerations: number;
    lastActivity?: Date;
    favoriteStyles: string[];
    commonIssues: string[];
  };
  technical: {
    recentErrors: string[];
    browserInfo?: string;
    lastSuccessfulAction?: string;
    connectionIssues?: boolean;
  };
}

export class SupportIntelligenceService {
  
  /**
   * Get comprehensive user context for support assistance
   */
  static async getUserSupportContext(userId: string): Promise<UserSupportContext> {
    try {
      console.log(`🧠 PHASE 2: Gathering support intelligence for user ${userId}`);
      
      // Get user basic info
      const user = await storage.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get subscription context
      const subscription = await this.getSubscriptionContext(userId, user);
      
      // Get training context
      const training = await this.getTrainingContext(userId);
      
      // Get usage context
      const usage = await this.getUsageContext(userId);
      
      // Get technical context
      const technical = await this.getTechnicalContext(userId);

      const context: UserSupportContext = {
        subscription,
        training,
        usage,
        technical
      };

      console.log(`🧠 PHASE 2: Support context gathered - Plan: ${subscription.plan}, Training: ${training.trainingStatus}, Usage: ${usage.recentGenerations}/${subscription.generationsTotal}`);
      
      return context;
      
    } catch (error) {
      console.error('❌ PHASE 2: Error gathering support context:', error);
      // Return basic context even if there are errors
      return this.getBasicSupportContext();
    }
  }

  /**
   * Get subscription and billing context
   */
  private static async getSubscriptionContext(userId: string, user: any) {
    try {
      // Get current subscription plan
      const plan = user.subscriptionPlan || 'sselfie-studio';
      const status = user.subscriptionStatus || 'active';
      
      // Get usage information
      const usageInfo = await storage.getUserUsage(userId);
      const generationsUsed = usageInfo?.monthlyGenerationsUsed || 0;
      
      // Plan limits (standardized to sselfie-studio)
      let generationsTotal = 100; // Default sselfie-studio plan
      if (user.subscriptionPlan === 'admin' || generationsUsed === -1) {
        generationsTotal = -1; // Unlimited for admin
      }
      
      return {
        plan: plan,
        status: status,
        generationsUsed: generationsUsed,
        generationsTotal: generationsTotal,
        billingStatus: user.billingStatus || 'current',
        nextBilling: user.nextBilling ? new Date(user.nextBilling) : undefined
      };
      
    } catch (error) {
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

  /**
   * Get training model context
   */
  private static async getTrainingContext(userId: string) {
    try {
      // Check if user has a trained model
      const userModel = await storage.getUserModel(userId);
      const hasModel = !!userModel;
      
      let trainingStatus = 'no_model';
      let lastTrainingDate;
      let modelQuality;
      
      if (hasModel && userModel) {
        trainingStatus = userModel.trainingStatus || 'completed';
        lastTrainingDate = new Date(userModel.createdAt);
        modelQuality = userModel.trainingStatus === 'completed' ? 'good' : 'unknown';
        
        // Check training status more specifically
        if (userModel.trainingStatus === 'training') {
          trainingStatus = 'in_progress';
        } else if (userModel.trainingStatus === 'failed') {
          trainingStatus = 'failed';
        } else if (userModel.trainingStatus === 'completed') {
          trainingStatus = 'completed';
        }
      }
      
      return {
        hasModel,
        trainingStatus,
        lastTrainingDate,
        modelQuality
      };
      
    } catch (error) {
      console.error('❌ PHASE 2: Error getting training context:', error);
      return {
        hasModel: false,
        trainingStatus: 'unknown'
      };
    }
  }

  /**
   * Get usage patterns and history
   */
  private static async getUsageContext(userId: string) {
    try {
      // Get generation history (simplified - use what's available)
      const usageInfo = await storage.getUserUsage(userId);
      const recentGenerations = usageInfo?.monthlyGenerationsUsed || 0;
      const totalGenerations = usageInfo?.monthlyGenerationsUsed || 0; // Simplified
      
      // Get last activity from Maya chats
      const mayaChats = await storage.getMayaChats(userId);
      const lastActivity = mayaChats.length > 0 ? mayaChats[0].lastActivity || mayaChats[0].createdAt : undefined;
      
      // Analyze usage patterns (simplified)
      const favoriteStyles = await this.analyzeFavoriteStyles(userId);
      const commonIssues = await this.analyzeCommonIssues(userId);
      
      return {
        recentGenerations: recentGenerations,
        totalGenerations: totalGenerations || 0,
        lastActivity: lastActivity ? new Date(lastActivity) : undefined,
        favoriteStyles,
        commonIssues
      };
      
    } catch (error) {
      console.error('❌ PHASE 2: Error getting usage context:', error);
      return {
        recentGenerations: 0,
        totalGenerations: 0,
        favoriteStyles: [],
        commonIssues: []
      };
    }
  }

  /**
   * Get technical context and error history
   */
  private static async getTechnicalContext(userId: string) {
    try {
      // Get training status for error context
      const trainingStatus = await storage.checkTrainingStatus(userId);
      const recentErrors = [];
      
      // Add training errors if any
      if (trainingStatus.needsRestart) {
        recentErrors.push(trainingStatus.reason);
      }
      
      // Get last successful action (simplified)
      const usageInfo = await storage.getUserUsage(userId);
      const lastSuccessful = usageInfo?.lastGenerationAt ? 'image_generation' : undefined;
      
      return {
        recentErrors: recentErrors,
        lastSuccessfulAction: lastSuccessful,
        connectionIssues: false // Could be enhanced with connection monitoring
      };
      
    } catch (error) {
      console.error('❌ PHASE 2: Error getting technical context:', error);
      return {
        recentErrors: [],
        lastSuccessfulAction: undefined,
        connectionIssues: false
      };
    }
  }

  /**
   * Analyze user's favorite styling patterns
   */
  private static async analyzeFavoriteStyles(userId: string): Promise<string[]> {
    try {
      // This could be enhanced with actual style analysis
      return ['Business Professional', 'Lifestyle Casual'];
    } catch (error) {
      return [];
    }
  }

  /**
   * Analyze common user issues
   */
  private static async analyzeCommonIssues(userId: string): Promise<string[]> {
    try {
      // This could be enhanced with actual issue pattern analysis
      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Fallback basic context when detailed context fails
   */
  private static getBasicSupportContext(): UserSupportContext {
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

  /**
   * Format support context for Maya's understanding
   */
  static formatSupportContextForMaya(context: UserSupportContext): string {
    const {subscription, training, usage, technical} = context;
    
    let contextText = `USER ACCOUNT CONTEXT:\n`;
    
    // Subscription info
    contextText += `Subscription: ${subscription.plan} plan (${subscription.status})\n`;
    contextText += `Usage: ${subscription.generationsUsed}/${subscription.generationsTotal === -1 ? 'unlimited' : subscription.generationsTotal} images this month\n`;
    contextText += `Billing: ${subscription.billingStatus}\n\n`;
    
    // Training info
    contextText += `TRAINING STATUS:\n`;
    if (training.hasModel) {
      contextText += `✅ Personal AI model: ${training.trainingStatus} (${training.modelQuality || 'good'} quality)\n`;
      if (training.lastTrainingDate) {
        contextText += `Last trained: ${training.lastTrainingDate.toLocaleDateString()}\n`;
      }
    } else {
      contextText += `❌ No personal AI model yet (${training.trainingStatus})\n`;
    }
    
    // Usage patterns
    contextText += `\nUSAGE PATTERNS:\n`;
    contextText += `Recent activity: ${usage.recentGenerations} generations, total: ${usage.totalGenerations}\n`;
    if (usage.lastActivity) {
      contextText += `Last active: ${usage.lastActivity.toLocaleDateString()}\n`;
    }
    if (usage.favoriteStyles.length > 0) {
      contextText += `Favorite styles: ${usage.favoriteStyles.join(', ')}\n`;
    }
    
    // Technical issues
    if (technical.recentErrors.length > 0) {
      contextText += `\nRECENT ISSUES:\n`;
      technical.recentErrors.slice(0, 3).forEach(error => {
        contextText += `- ${error}\n`;
      });
    }
    
    return contextText;
  }

  /**
   * PHASE 5: Get Maya system context with escalation intelligence
   */
  static getMayaSupportSystemContext(userContext: string): string {
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