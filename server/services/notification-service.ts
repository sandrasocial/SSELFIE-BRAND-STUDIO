/**
 * Notification Service
 * Server-side service for managing notifications with database persistence and email integration
 */

import type {
  Notification,
  NotificationId,
  UserId,
  NotificationType,
  NotificationPriority,
  NotificationResponse,
  NotificationPreferences,
  EmailQueueItem,
} from '@shared/types/notification-types.js';
import { FeatureFlags } from '../utils/feature-flags.js';
import { sendEmail } from './email-service.js';

interface CreateNotificationParams {
  userId: UserId;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  data?: Record<string, any>;
}

interface NotificationFilter {
  userId?: UserId;
  status?: 'unread' | 'read' | 'dismissed';
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}

/**
 * In-memory storage for notifications (replace with database in production)
 * This is a temporary implementation for testing purposes
 */
class InMemoryNotificationStore {
  private notifications: Map<NotificationId, Notification> = new Map();
  private userPreferences: Map<UserId, NotificationPreferences> = new Map();
  private emailQueue: EmailQueueItem[] = [];

  generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const id = this.generateId();
    const now = new Date();
    
    const notification: Notification = {
      id,
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      priority: params.priority || 'medium',
      status: 'unread',
      createdAt: now,
      updatedAt: now,
      data: params.data,
    } as Notification;

    this.notifications.set(id, notification);
    return notification;
  }

  async getNotifications(filter: NotificationFilter): Promise<Notification[]> {
    let results = Array.from(this.notifications.values());

    if (filter.userId) {
      results = results.filter(n => n.userId === filter.userId);
    }
    
    if (filter.status) {
      results = results.filter(n => n.status === filter.status);
    }
    
    if (filter.type) {
      results = results.filter(n => n.type === filter.type);
    }
    
    if (filter.priority) {
      results = results.filter(n => n.priority === filter.priority);
    }

    // Sort by creation date (newest first)
    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const offset = filter.offset || 0;
    const limit = filter.limit || 50;
    return results.slice(offset, offset + limit);
  }

  async updateNotification(id: NotificationId, updates: Partial<Notification>): Promise<Notification | null> {
    const notification = this.notifications.get(id);
    if (!notification) return null;

    const updated = {
      ...notification,
      ...updates,
      updatedAt: new Date(),
    };

    this.notifications.set(id, updated);
    return updated;
  }

  async deleteNotification(id: NotificationId): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async getUnreadCount(userId: UserId): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.status === 'unread')
      .length;
  }

  async getUserPreferences(userId: UserId): Promise<NotificationPreferences | null> {
    return this.userPreferences.get(userId) || null;
  }

  async setUserPreferences(userId: UserId, preferences: NotificationPreferences): Promise<void> {
    this.userPreferences.set(userId, preferences);
  }

  async addToEmailQueue(item: EmailQueueItem): Promise<void> {
    this.emailQueue.push(item);
  }

  async getEmailQueue(): Promise<EmailQueueItem[]> {
    return [...this.emailQueue];
  }

  async updateEmailQueueItem(id: string, updates: Partial<EmailQueueItem>): Promise<void> {
    const index = this.emailQueue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.emailQueue[index] = { ...this.emailQueue[index], ...updates };
    }
  }
}

// Global store instance (replace with database connection in production)
const store = new InMemoryNotificationStore();

/**
 * Main Notification Service Class
 */
export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(params: CreateNotificationParams): Promise<Notification> {
    if (!FeatureFlags.isEnabled('NOTIFICATIONS_ENABLED')) {
      console.log('Notifications disabled by feature flag');
      throw new Error('Notifications are currently disabled');
    }

    const notification = await store.createNotification(params);
    
    // Schedule email if user preferences allow it
    if (FeatureFlags.isEnabled('EMAIL_NOTIFICATIONS')) {
      await this.scheduleEmailNotification(notification);
    }

    // Log for debugging
    if (FeatureFlags.shouldLogVerbose()) {
      console.log('Notification created:', {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
      });
    }

    return notification;
  }

  /**
   * Get notifications for a user with filtering
   */
  static async getNotifications(filter: NotificationFilter): Promise<NotificationResponse> {
    if (!FeatureFlags.isEnabled('NOTIFICATIONS_ENABLED')) {
      return {
        notifications: [],
        totalCount: 0,
        unreadCount: 0,
        hasMore: false,
      };
    }

    const notifications = await store.getNotifications(filter);
    const unreadCount = filter.userId ? await store.getUnreadCount(filter.userId) : 0;
    
    // For pagination, we need to determine if there are more results
    const hasMore = notifications.length === (filter.limit || 50);

    return {
      notifications,
      totalCount: notifications.length,
      unreadCount,
      hasMore,
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: NotificationId, userId?: UserId): Promise<Notification | null> {
    const notification = await store.updateNotification(id, {
      status: 'read',
      readAt: new Date(),
    });

    if (notification && FeatureFlags.shouldLogVerbose()) {
      console.log('Notification marked as read:', { id, userId });
    }

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: UserId): Promise<number> {
    const unreadNotifications = await store.getNotifications({
      userId,
      status: 'unread',
    });

    let markedCount = 0;
    for (const notification of unreadNotifications) {
      const updated = await store.updateNotification(notification.id, {
        status: 'read',
        readAt: new Date(),
      });
      if (updated) markedCount++;
    }

    if (FeatureFlags.shouldLogVerbose()) {
      console.log('Marked all notifications as read:', { userId, count: markedCount });
    }

    return markedCount;
  }

  /**
   * Dismiss a notification
   */
  static async dismiss(id: NotificationId, userId?: UserId): Promise<Notification | null> {
    const notification = await store.updateNotification(id, {
      status: 'dismissed',
      dismissedAt: new Date(),
    });

    if (notification && FeatureFlags.shouldLogVerbose()) {
      console.log('Notification dismissed:', { id, userId });
    }

    return notification;
  }

  /**
   * Get user notification preferences
   */
  static async getUserPreferences(userId: UserId): Promise<NotificationPreferences> {
    const preferences = await store.getUserPreferences(userId);
    
    // Return default preferences if none exist
    if (!preferences) {
      return {
        emailEnabled: false,
        slackEnabled: true,
        pushEnabled: false,
        frequency: 'immediate',
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
        },
        types: {
          model_training_complete: true,
          payment_confirmation: true,
          onboarding_status: true,
          generation_limit_warning: true,
          system_update: false,
          agent_insight: true,
          task_completed: true,
          error_alert: true,
        },
        priorities: {
          high: true,
          medium: true,
          low: false,
        },
      };
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   */
  static async updateUserPreferences(userId: UserId, preferences: NotificationPreferences): Promise<void> {
    await store.setUserPreferences(userId, preferences);
    
    if (FeatureFlags.shouldLogVerbose()) {
      console.log('User preferences updated:', { userId });
    }
  }

  /**
   * Schedule email notification if user preferences allow
   */
  private static async scheduleEmailNotification(notification: Notification): Promise<void> {
    const preferences = await this.getUserPreferences(notification.userId);
    
    if (!preferences.emailEnabled || !preferences.types[notification.type]) {
      return;
    }

    // Check priority preferences
    if (!preferences.priorities[notification.priority]) {
      return;
    }

    // Check quiet hours
    if (preferences.quietHours?.enabled) {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      if (preferences.quietHours.start && preferences.quietHours.end) {
        const isQuietTime = currentTime >= preferences.quietHours.start || 
                           currentTime <= preferences.quietHours.end;
        if (isQuietTime && notification.priority !== 'high') {
          // Schedule for later if not high priority
          return;
        }
      }
    }

    const queueItem: EmailQueueItem = {
      id: store.generateId(),
      userId: notification.userId,
      notification,
      template: {
        type: notification.type,
        subject: notification.title,
        template: 'default',
        variables: notification.data || {},
      },
      attempts: 0,
      maxAttempts: 3,
      scheduledAt: new Date(),
      status: 'pending',
    };

    await store.addToEmailQueue(queueItem);
  }

  /**
   * Process email queue (should be called by a background job)
   */
  static async processEmailQueue(): Promise<void> {
    if (!FeatureFlags.isEnabled('EMAIL_NOTIFICATIONS')) {
      return;
    }

    const queue = await store.getEmailQueue();
    const pendingItems = queue.filter(item => 
      item.status === 'pending' && 
      item.attempts < item.maxAttempts &&
      item.scheduledAt <= new Date()
    );

    for (const item of pendingItems) {
      try {
        const success = await sendEmail({
          to: `user_${item.userId}@example.com`, // Replace with actual user email lookup
          subject: item.template.subject,
          html: await this.generateEmailTemplate(item.notification),
          tags: [item.notification.type, item.notification.priority],
        });

        await store.updateEmailQueueItem(item.id, {
          status: success ? 'sent' : 'failed',
          attempts: item.attempts + 1,
          lastAttemptAt: new Date(),
          error: success ? undefined : 'Email sending failed',
        });

        if (FeatureFlags.shouldLogVerbose()) {
          console.log('Email notification processed:', {
            id: item.id,
            success,
            attempts: item.attempts + 1,
          });
        }
      } catch (error) {
        await store.updateEmailQueueItem(item.id, {
          status: 'failed',
          attempts: item.attempts + 1,
          lastAttemptAt: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        console.error('Failed to process email notification:', error);
      }
    }
  }

  /**
   * Generate email template for notification
   */
  private static async generateEmailTemplate(notification: Notification): Promise<string> {
    // Basic template - in production, use a proper template engine
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${notification.title}</h2>
        <p style="color: #666;">${notification.message}</p>
        <div style="margin-top: 20px; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">
          <small style="color: #888;">
            Priority: ${notification.priority} | 
            Type: ${notification.type} |
            Created: ${notification.createdAt.toLocaleString()}
          </small>
        </div>
      </div>
    `;
  }
}