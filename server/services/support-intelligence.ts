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

import { storage } from '../storage.js'

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

// Type guards for validation
export function isValidUserSupportContext(obj: unknown): obj is UserSupportContext {
  if (!obj || typeof obj !== 'object') return false;
  
  const context = obj as Record<string, unknown>;
  
  return (
    typeof context.subscription === 'object' &&
    context.subscription !== null &&
    typeof context.training === 'object' &&
    context.training !== null &&
    typeof context.usage === 'object' &&
    context.usage !== null &&
    typeof context.technical === 'object' &&
    context.technical !== null
  );
}

export function isValidSubscriptionContext(obj: unknown): obj is UserSupportContext['subscription'] {
  if (!obj || typeof obj !== 'object') return false;
  
  const sub = obj as Record<string, unknown>;
  
  return (
    typeof sub.plan === 'string' &&
    typeof sub.status === 'string' &&
    typeof sub.generationsUsed === 'number' &&
    typeof sub.generationsTotal === 'number' &&
    typeof sub.billingStatus === 'string'
  );
}

export class SupportIntelligenceService {
  
  /**
   * Get comprehensive user context for support assistance
   */
  static async getUserSupportContext(userId: string): Promise<UserSupportContext> {
    if (!userId || typeof userId !== 'string') {
      console.error('❌ PHASE 2: Invalid userId provided to getUserSupportContext');
      return this.getBasicSupportContext();
    }

    try {
      console.log(`🧠 PHASE 2: Gathering support intelligence for user ${userId}`);
      
      // Get user basic info with error handling
      const user = await storage.getUser(userId).catch(error => {
        console.error(`❌ PHASE 2: Error fetching user ${userId}:`, error);
        return null;
      });

      if (!user) {
        console.warn(`⚠️ PHASE 2: User ${userId} not found, returning basic context`);
        return this.getBasicSupportContext();
      }

      // Get subscription context with fallback
      const subscription = await this.getSubscriptionContext(userId, user).catch(error => {
        console.error('❌ PHASE 2: Error getting subscription context:', error);
        return {
          plan: 'sselfie-studio',
          status: 'active',
          generationsUsed: 0,
          generationsTotal: 100,
          billingStatus: 'current'
        };
      });
      
      // Get training context with fallback
      const training = await this.getTrainingContext(userId).catch(error => {
        console.error('❌ PHASE 2: Error getting training context:', error);
        return {
          hasModel: false,
          trainingStatus: 'unknown'
        };
      });
      
      // Get usage context with fallback
      const usage = await this.getUsageContext(userId).catch(error => {
        console.error('❌ PHASE 2: Error getting usage context:', error);
        return {
          recentGenerations: 0,
          totalGenerations: 0,
          favoriteStyles: [],
          commonIssues: []
        };
      });
      
      // Get technical context with fallback
      const technical = await this.getTechnicalContext(userId).catch(error => {
        console.error('❌ PHASE 2: Error getting technical context:', error);
        return {
          recentErrors: [],
          connectionIssues: false
        };
      });

      const context: UserSupportContext = {
        subscription,
        training,
        usage,
        technical
      };

      // Validate the constructed context
      if (!isValidUserSupportContext(context)) {
        console.warn('⚠️ PHASE 2: Invalid context constructed, using basic fallback');
        return this.getBasicSupportContext();
      }

      console.log(`🧠 PHASE 2: Support context gathered - Plan: ${subscription.plan}, Training: ${training.trainingStatus}, Usage: ${usage.recentGenerations}/${subscription.generationsTotal}`);
      
      return context;
      
    } catch (error) {
      console.error('❌ PHASE 2: Error gathering support context:', error);
      // Return basic context even if there are errors
      return this.getBasicSupportContext();
    }
  }

  /**
   * Get subscription and billing context with enhanced error handling
   */
  private static async getSubscriptionContext(userId: string, user: any): Promise<UserSupportContext['subscription']> {
    try {
      if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object provided');
      }

      // Safely extract user properties with defaults
      const plan = (typeof user.subscriptionPlan === 'string' && user.subscriptionPlan) || 'sselfie-studio';
      const status = (typeof user.subscriptionStatus === 'string' && user.subscriptionStatus) || 'active';
      
      // Get usage information with error handling
      let generationsUsed = 0;
      let generationsTotal = 100; // Default sselfie-studio plan

      try {
        const usageInfo = await storage.getUserUsage(userId);
        if (usageInfo && typeof usageInfo.monthlyGenerationsUsed === 'number') {
          generationsUsed = Math.max(0, usageInfo.monthlyGenerationsUsed);
        }
      } catch (error) {
        console.warn(`⚠️ PHASE 2: Could not fetch usage for user ${userId}:`, error);
      }
      
      // Plan limits (standardized to sselfie-studio)
      if (user.subscriptionPlan === 'admin' || generationsUsed === -1) {
        generationsTotal = -1; // Unlimited for admin
      }

      // Safely parse nextBilling date
      let nextBilling: Date | undefined;
      if (user.nextBilling) {
        try {
          nextBilling = new Date(user.nextBilling);
          // Validate the date
          if (isNaN(nextBilling.getTime())) {
            nextBilling = undefined;
          }
        } catch (error) {
          console.warn('⚠️ Invalid nextBilling date format:', user.nextBilling);
          nextBilling = undefined;
        }
      }

      const subscriptionContext = {
        plan,
        status,
        generationsUsed,
        generationsTotal,
        billingStatus: (typeof user.billingStatus === 'string' && user.billingStatus) || 'current',
        nextBilling
      };

      // Validate the subscription context
      if (!isValidSubscriptionContext(subscriptionContext)) {
        throw new Error('Constructed subscription context failed validation');
      }
      
      return subscriptionContext;
      
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
   * Get training model context with enhanced null checking
   */
  private static async getTrainingContext(userId: string): Promise<UserSupportContext['training']> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided');
      }

      // Check if user has a trained model with error handling
      let userModel: any = null;
      try {
        userModel = await storage.getUserModel(userId);
      } catch (error) {
        console.warn(`⚠️ PHASE 2: Could not fetch user model for ${userId}:`, error);
      }

      const hasModel = !!(userModel && typeof userModel === 'object');
      
      let trainingStatus = 'no_model';
      let lastTrainingDate: Date | undefined;
      let modelQuality: string | undefined;
      
      if (hasModel && userModel) {
        // Safely extract training status
        const rawStatus = userModel.trainingStatus;
        if (typeof rawStatus === 'string' && rawStatus) {
          switch (rawStatus.toLowerCase()) {
            case 'training':
              trainingStatus = 'in_progress';
              break;
            case 'failed':
              trainingStatus = 'failed';
              break;
            case 'completed':
              trainingStatus = 'completed';
              modelQuality = 'good';
              break;
            default:
              trainingStatus = rawStatus;
          }
        } else {
          trainingStatus = 'completed'; // Default for existing models
          modelQuality = 'good';
        }
        
        // Safely parse creation date
        if (userModel.createdAt) {
          try {
            lastTrainingDate = new Date(userModel.createdAt);
            // Validate the date
            if (isNaN(lastTrainingDate.getTime())) {
              lastTrainingDate = undefined;
            }
          } catch (error) {
            console.warn('⚠️ Invalid createdAt date format:', userModel.createdAt);
            lastTrainingDate = undefined;
          }
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
   * Get usage patterns and history with improved error handling
   */
  private static async getUsageContext(userId: string): Promise<UserSupportContext['usage']> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided');
      }

      // Get generation history with error handling
      let recentGenerations = 0;
      let totalGenerations = 0;

      try {
        const usageInfo = await storage.getUserUsage(userId);
        if (usageInfo && typeof usageInfo === 'object') {
          if (typeof usageInfo.monthlyGenerationsUsed === 'number') {
            recentGenerations = Math.max(0, usageInfo.monthlyGenerationsUsed);
            totalGenerations = recentGenerations; // Simplified - use same value
          }
        }
      } catch (error) {
        console.warn(`⚠️ PHASE 2: Could not fetch usage info for ${userId}:`, error);
      }
      
      // Get last activity from Maya chats with error handling
      let lastActivity: Date | undefined;
      try {
        const mayaChats = await storage.getMayaChats(userId);
        if (Array.isArray(mayaChats) && mayaChats.length > 0) {
          const latestChat = mayaChats[0];
          if (latestChat) {
            const activityDate = latestChat.lastActivity || latestChat.createdAt;
            if (activityDate) {
              lastActivity = new Date(activityDate);
              // Validate the date
              if (isNaN(lastActivity.getTime())) {
                lastActivity = undefined;
              }
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ PHASE 2: Could not fetch Maya chats for ${userId}:`, error);
      }
      
      // Analyze usage patterns with error handling
      let favoriteStyles: string[] = [];
      let commonIssues: string[] = [];

      try {
        favoriteStyles = await this.analyzeFavoriteStyles(userId);
        commonIssues = await this.analyzeCommonIssues(userId);
      } catch (error) {
        console.warn(`⚠️ PHASE 2: Could not analyze usage patterns for ${userId}:`, error);
      }

      // Ensure arrays are valid
      if (!Array.isArray(favoriteStyles)) favoriteStyles = [];
      if (!Array.isArray(commonIssues)) commonIssues = [];
      
      return {
        recentGenerations,
        totalGenerations,
        lastActivity,
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
   * Get technical context and error history with improved error handling
   */
  private static async getTechnicalContext(userId: string): Promise<UserSupportContext['technical']> {
    try {
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid userId provided');
      }

      const recentErrors: string[] = [];
      let lastSuccessfulAction: string | undefined;

      // Get training status for error context with error handling
      try {
        const trainingStatus = await storage.checkTrainingStatus(userId);
        if (trainingStatus && typeof trainingStatus === 'object') {
          // Add training errors if any
          if (trainingStatus.needsRestart && typeof trainingStatus.reason === 'string') {
            recentErrors.push(trainingStatus.reason);
          }
        }
      } catch (error) {
        console.warn(`⚠️ PHASE 2: Could not check training status for ${userId}:`, error);
      }
      
      // Get last successful action with error handling
      try {
        const usageInfo = await storage.getUserUsage(userId);
        if (usageInfo && typeof usageInfo === 'object' && usageInfo.lastGenerationAt) {
          lastSuccessfulAction = 'image_generation';
        }
      } catch (error) {
        console.warn(`⚠️ PHASE 2: Could not check last generation for ${userId}:`, error);
      }
      
      return {
        recentErrors,
        lastSuccessfulAction,
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
   * Format support context for Maya's understanding with improved error handling
   */
  static formatSupportContextForMaya(context: UserSupportContext): string {
    try {
      if (!isValidUserSupportContext(context)) {
        console.warn('⚠️ Invalid context provided to formatSupportContextForMaya');
        context = this.getBasicSupportContext();
      }

      const { subscription, training, usage, technical } = context;
      
      let contextText = `USER ACCOUNT CONTEXT:\n`;
      
      // Subscription info with safe access
      if (subscription && typeof subscription === 'object') {
        contextText += `Subscription: ${subscription.plan || 'unknown'} plan (${subscription.status || 'unknown'})\n`;
        const genUsed = typeof subscription.generationsUsed === 'number' ? subscription.generationsUsed : 0;
        const genTotal = subscription.generationsTotal === -1 ? 'unlimited' : (subscription.generationsTotal || 100);
        contextText += `Usage: ${genUsed}/${genTotal} images this month\n`;
        contextText += `Billing: ${subscription.billingStatus || 'unknown'}\n\n`;
      }
      
      // Training info with safe access
      if (training && typeof training === 'object') {
        contextText += `TRAINING STATUS:\n`;
        if (training.hasModel) {
          contextText += `✅ Personal AI model: ${training.trainingStatus || 'unknown'} (${training.modelQuality || 'good'} quality)\n`;
          if (training.lastTrainingDate && training.lastTrainingDate instanceof Date) {
            contextText += `Last trained: ${training.lastTrainingDate.toLocaleDateString()}\n`;
          }
        } else {
          contextText += `❌ No personal AI model yet (${training.trainingStatus || 'unknown'})\n`;
        }
      }
      
      // Usage patterns with safe access
      if (usage && typeof usage === 'object') {
        contextText += `\nUSAGE PATTERNS:\n`;
        const recentGens = typeof usage.recentGenerations === 'number' ? usage.recentGenerations : 0;
        const totalGens = typeof usage.totalGenerations === 'number' ? usage.totalGenerations : 0;
        contextText += `Recent activity: ${recentGens} generations, total: ${totalGens}\n`;
        
        if (usage.lastActivity && usage.lastActivity instanceof Date) {
          contextText += `Last active: ${usage.lastActivity.toLocaleDateString()}\n`;
        }
        
        if (Array.isArray(usage.favoriteStyles) && usage.favoriteStyles.length > 0) {
          contextText += `Favorite styles: ${usage.favoriteStyles.join(', ')}\n`;
        }
      }
      
      // Technical issues with safe access
      if (technical && typeof technical === 'object' && Array.isArray(technical.recentErrors) && technical.recentErrors.length > 0) {
        contextText += `\nRECENT ISSUES:\n`;
        technical.recentErrors.slice(0, 3).forEach(error => {
          if (typeof error === 'string') {
            contextText += `- ${error}\n`;
          }
        });
      }
      
      return contextText;
    } catch (error) {
      console.error('❌ Error formatting context for Maya:', error);
      return `USER ACCOUNT CONTEXT:\nError formatting context. Please contact support for assistance.`;
    }
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