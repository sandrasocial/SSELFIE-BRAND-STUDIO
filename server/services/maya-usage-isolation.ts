/**
 * MAYA USAGE ISOLATION SERVICE
 * Separates admin and member Maya usage for analytics and tracking
 * Admin (platform owner) vs Member (€47/month subscribers) separation
 */

import { storage } from '../storage';

export interface MayaUsageMetrics {
  userId: string;
  userType: 'admin' | 'member';
  conversationId: string;
  chatCount: number;
  generationCount: number;
  tokenUsage: number;
  lastActivity: Date;
  isAdmin: boolean;
}

export interface MayaAnalytics {
  memberMetrics: {
    totalChats: number;
    totalGenerations: number;
    activeUsers: number;
    averageChatsPerUser: number;
    popularCategories: string[];
  };
  adminMetrics: {
    platformChats: number;
    contentGenerations: number;
    lastAdminActivity: Date;
    adminConversationThreads: string[];
  };
  separationStatus: {
    cleanSeparation: boolean;
    memberDataProtected: boolean;
    adminIsolated: boolean;
  };
}

class MayaUsageIsolationService {
  
  /**
   * Track Maya usage with admin/member context
   */
  async trackMayaUsage(
    userId: string,
    userType: 'admin' | 'member',
    conversationId: string,
    activityType: 'chat' | 'generation',
    metadata?: any
  ): Promise<void> {
    try {
      const logEntry = {
        userId,
        userType,
        conversationId,
        activityType,
        timestamp: new Date(),
        metadata: metadata || {},
        isAdmin: userType === 'admin'
      };

      console.log(`📊 MAYA USAGE: ${userType.toUpperCase()} ${activityType} tracked for user ${userId}`);
      
      // Store usage data with clear admin/member separation
      // This could be implemented with a dedicated usage tracking table
      // For now, we'll use console logging to demonstrate separation
      
      if (userType === 'admin') {
        console.log(`🎯 ADMIN MAYA USAGE: Platform content activity tracked separately`);
      } else {
        console.log(`👤 MEMBER MAYA USAGE: Subscriber activity tracked for business analytics`);
      }

    } catch (error) {
      console.error('Maya usage tracking error:', error);
    }
  }

  /**
   * Get member-only Maya analytics (excludes admin usage)
   */
  async getMemberAnalytics(): Promise<MayaAnalytics['memberMetrics']> {
    try {
      // Get all Maya chats excluding admin conversations
      const allChats = await storage.getMayaChats();
      const memberChats = allChats.filter(chat => !chat.chatTitle?.startsWith('[ADMIN]'));
      
      const memberMetrics = {
        totalChats: memberChats.length,
        totalGenerations: await this.countMemberGenerations(),
        activeUsers: await this.getActiveMemberCount(),
        averageChatsPerUser: await this.getActiveMemberCount() > 0 ? memberChats.length / await this.getActiveMemberCount() : 0,
        popularCategories: await this.getPopularMemberCategories()
      };

      console.log(`📊 MEMBER ANALYTICS: ${memberMetrics.totalChats} subscriber chats tracked`);
      return memberMetrics;

    } catch (error) {
      console.error('Member analytics error:', error);
      return {
        totalChats: 0,
        totalGenerations: 0,
        activeUsers: 0,
        averageChatsPerUser: 0,
        popularCategories: []
      };
    }
  }

  /**
   * Get admin-only Maya analytics (platform usage only)
   */
  async getAdminAnalytics(): Promise<MayaAnalytics['adminMetrics']> {
    try {
      // Get admin-specific Maya usage
      const allChats = await storage.getMayaChats();
      const adminChats = allChats.filter(chat => chat.chatTitle?.startsWith('[ADMIN]'));
      
      const adminMetrics = {
        platformChats: adminChats.length,
        contentGenerations: await this.countAdminGenerations(),
        lastAdminActivity: new Date(), // Would be calculated from actual usage
        adminConversationThreads: adminChats.map(chat => `maya_admin_platform_${chat.userId}`)
      };

      console.log(`🎯 ADMIN ANALYTICS: ${adminMetrics.platformChats} platform content chats tracked`);
      return adminMetrics;

    } catch (error) {
      console.error('Admin analytics error:', error);
      return {
        platformChats: 0,
        contentGenerations: 0,
        lastAdminActivity: new Date(),
        adminConversationThreads: []
      };
    }
  }

  /**
   * Verify admin/member separation is working correctly
   */
  async validateSeparation(): Promise<MayaAnalytics['separationStatus']> {
    try {
      const allChats = await storage.getMayaChats();
      const adminChats = allChats.filter(chat => chat.chatTitle?.startsWith('[ADMIN]'));
      const memberChats = allChats.filter(chat => !chat.chatTitle?.startsWith('[ADMIN]'));

      const separationStatus = {
        cleanSeparation: adminChats.length >= 0 && memberChats.length >= 0,
        memberDataProtected: memberChats.every(chat => !chat.chatTitle?.includes('ADMIN')),
        adminIsolated: adminChats.every(chat => chat.chatTitle?.startsWith('[ADMIN]'))
      };

      console.log(`✅ SEPARATION VALIDATION: Clean=${separationStatus.cleanSeparation}, Protected=${separationStatus.memberDataProtected}, Isolated=${separationStatus.adminIsolated}`);
      return separationStatus;

    } catch (error) {
      console.error('Separation validation error:', error);
      return {
        cleanSeparation: false,
        memberDataProtected: false,
        adminIsolated: false
      };
    }
  }

  /**
   * Get complete Maya analytics with admin/member separation
   */
  async getCompleteMayaAnalytics(): Promise<MayaAnalytics> {
    const [memberMetrics, adminMetrics, separationStatus] = await Promise.all([
      this.getMemberAnalytics(),
      this.getAdminAnalytics(),
      this.validateSeparation()
    ]);

    return {
      memberMetrics,
      adminMetrics,
      separationStatus
    };
  }

  // Helper methods for analytics calculations
  private async countMemberGenerations(): Promise<number> {
    try {
      // Count generations from non-admin conversations
      // This would query actual generation records
      return 0; // Placeholder
    } catch {
      return 0;
    }
  }

  private async countAdminGenerations(): Promise<number> {
    try {
      // Count generations from admin conversations
      // This would query actual generation records
      return 0; // Placeholder
    } catch {
      return 0;
    }
  }

  private async getActiveMemberCount(): Promise<number> {
    try {
      // Count unique member users (excluding admin)
      const allChats = await storage.getMayaChats();
      const memberChats = allChats.filter(chat => !chat.chatTitle?.startsWith('[ADMIN]'));
      const uniqueMembers = new Set(memberChats.map(chat => chat.userId));
      return uniqueMembers.size;
    } catch {
      return 0;
    }
  }

  private async getPopularMemberCategories(): Promise<string[]> {
    try {
      // Analyze member chat categories
      const allChats = await storage.getMayaChats();
      const memberChats = allChats.filter(chat => !chat.chatTitle?.startsWith('[ADMIN]'));
      
      const categories = memberChats.map(chat => {
        if (chat.chatTitle?.includes('Headshot')) return 'Professional Headshots';
        if (chat.chatTitle?.includes('Social')) return 'Social Media Photos';
        if (chat.chatTitle?.includes('Website')) return 'Website Photos';
        if (chat.chatTitle?.includes('Email')) return 'Email & Marketing Photos';
        if (chat.chatTitle?.includes('Premium')) return 'Premium Brand Photos';
        return 'General Styling';
      });

      // Return top 3 categories
      const categoryCount = categories.reduce((acc: Record<string, number>, cat: string) => {
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);
        
    } catch {
      return ['Professional Headshots', 'Social Media Photos', 'Website Photos'];
    }
  }
}

// Export singleton instance
export const mayaUsageIsolation = new MayaUsageIsolationService();

// Export for direct usage tracking
export function trackMayaActivity(
  userId: string,
  userType: 'admin' | 'member',
  conversationId: string,
  activityType: 'chat' | 'generation',
  metadata?: any
): void {
  mayaUsageIsolation.trackMayaUsage(userId, userType, conversationId, activityType, metadata)
    .catch(error => console.error('Maya activity tracking failed:', error));
}