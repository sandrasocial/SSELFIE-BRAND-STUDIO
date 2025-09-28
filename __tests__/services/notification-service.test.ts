/**
 * Unit tests for NotificationService
 * Tests service functionality, database operations, and email integration
 */

import { NotificationService } from '../../server/services/notification-service.js';
import { FeatureFlags } from '../../server/utils/feature-flags.js';
import * as emailService from '../../server/services/email-service.js';
import type { 
  Notification, 
  NotificationPreferences, 
  CreateNotificationParams 
} from '../../shared/types/notification-types.js';

// Mock dependencies
jest.mock('../../server/utils/feature-flags.js');
jest.mock('../../server/services/email-service.js');

const mockFeatureFlags = FeatureFlags as jest.Mocked<typeof FeatureFlags>;
const mockEmailService = emailService as jest.Mocked<typeof emailService>;

describe('NotificationService', () => {
  const mockUserId = 'user_123';
  const mockNotificationParams: CreateNotificationParams = {
    userId: mockUserId,
    type: 'model_training_complete',
    title: 'Model Training Complete',
    message: 'Your AI model has finished training',
    priority: 'high',
    data: {
      modelId: 'model_456',
      modelName: 'Brand Voice',
      trainingDuration: 30,
    },
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default mock implementations
    mockFeatureFlags.isEnabled.mockImplementation((flag: string) => {
      const flags: Record<string, boolean> = {
        'NOTIFICATIONS_ENABLED': true,
        'EMAIL_NOTIFICATIONS': true,
        'VERBOSE_LOGGING': false,
      };
      return flags[flag] || false;
    });
    
    mockFeatureFlags.shouldLogVerbose.mockReturnValue(false);
    mockEmailService.sendEmail.mockResolvedValue(true);
  });

  describe('createNotification', () => {
    it('should create a notification successfully', async () => {
      const notification = await NotificationService.createNotification(mockNotificationParams);
      
      expect(notification).toMatchObject({
        userId: mockUserId,
        type: 'model_training_complete',
        title: 'Model Training Complete',
        message: 'Your AI model has finished training',
        priority: 'high',
        status: 'unread',
        data: mockNotificationParams.data,
      });
      
      expect(notification.id).toBeDefined();
      expect(notification.createdAt).toBeInstanceOf(Date);
      expect(notification.updatedAt).toBeInstanceOf(Date);
    });

    it('should use default priority when not specified', async () => {
      const paramsWithoutPriority = {
        ...mockNotificationParams,
        priority: undefined,
      };
      
      const notification = await NotificationService.createNotification(paramsWithoutPriority);
      
      expect(notification.priority).toBe('medium');
    });

    it('should throw error when notifications are disabled', async () => {
      mockFeatureFlags.isEnabled.mockReturnValue(false);
      
      await expect(NotificationService.createNotification(mockNotificationParams))
        .rejects.toThrow('Notifications are currently disabled');
    });

    it('should log when verbose logging is enabled', async () => {
      mockFeatureFlags.shouldLogVerbose.mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.createNotification(mockNotificationParams);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Notification created:',
        expect.objectContaining({
          userId: mockUserId,
          type: 'model_training_complete',
          title: 'Model Training Complete',
        })
      );
      
      consoleSpy.mockRestore();
    });

    it('should schedule email notification when enabled', async () => {
      // Mock user preferences to allow emails
      const mockPreferences: NotificationPreferences = {
        emailEnabled: true,
        slackEnabled: false,
        pushEnabled: false,
        frequency: 'immediate',
        types: {
          model_training_complete: true,
          payment_confirmation: true,
          onboarding_status: true,
          generation_limit_warning: true,
          system_update: true,
          agent_insight: true,
          task_completed: true,
          error_alert: true,
        },
        priorities: {
          high: true,
          medium: true,
          low: true,
        },
      };
      
      // Set user preferences first
      await NotificationService.updateUserPreferences(mockUserId, mockPreferences);
      
      await NotificationService.createNotification(mockNotificationParams);
      
      // Email should be scheduled (we can't easily test the internal queue without exposing it)
      // This would normally require integration tests or exposing queue methods
      expect(mockFeatureFlags.isEnabled).toHaveBeenCalledWith('EMAIL_NOTIFICATIONS');
    });
  });

  describe('getNotifications', () => {
    beforeEach(async () => {
      // Create some test notifications
      await NotificationService.createNotification(mockNotificationParams);
      await NotificationService.createNotification({
        ...mockNotificationParams,
        type: 'payment_confirmation',
        title: 'Payment Confirmed',
        priority: 'medium',
      });
    });

    it('should return notifications for a user', async () => {
      const response = await NotificationService.getNotifications({
        userId: mockUserId,
      });
      
      expect(response.notifications).toHaveLength(2);
      expect(response.totalCount).toBe(2);
      expect(response.unreadCount).toBe(2);
      expect(response.hasMore).toBe(false);
    });

    it('should filter by status', async () => {
      // Mark one notification as read
      const allNotifications = await NotificationService.getNotifications({
        userId: mockUserId,
      });
      await NotificationService.markAsRead(allNotifications.notifications[0].id);
      
      // Get only unread notifications
      const unreadResponse = await NotificationService.getNotifications({
        userId: mockUserId,
        status: 'unread',
      });
      
      expect(unreadResponse.notifications).toHaveLength(1);
      expect(unreadResponse.notifications[0].status).toBe('unread');
    });

    it('should filter by type', async () => {
      const response = await NotificationService.getNotifications({
        userId: mockUserId,
        type: 'model_training_complete',
      });
      
      expect(response.notifications).toHaveLength(1);
      expect(response.notifications[0].type).toBe('model_training_complete');
    });

    it('should filter by priority', async () => {
      const response = await NotificationService.getNotifications({
        userId: mockUserId,
        priority: 'high',
      });
      
      expect(response.notifications).toHaveLength(1);
      expect(response.notifications[0].priority).toBe('high');
    });

    it('should respect pagination limits', async () => {
      // Create more notifications
      for (let i = 0; i < 10; i++) {
        await NotificationService.createNotification({
          ...mockNotificationParams,
          title: `Test Notification ${i}`,
        });
      }
      
      const response = await NotificationService.getNotifications({
        userId: mockUserId,
        limit: 5,
      });
      
      expect(response.notifications).toHaveLength(5);
      expect(response.hasMore).toBe(true);
    });

    it('should return empty result when notifications are disabled', async () => {
      mockFeatureFlags.isEnabled.mockReturnValue(false);
      
      const response = await NotificationService.getNotifications({
        userId: mockUserId,
      });
      
      expect(response.notifications).toHaveLength(0);
      expect(response.totalCount).toBe(0);
      expect(response.unreadCount).toBe(0);
      expect(response.hasMore).toBe(false);
    });

    it('should sort notifications by creation date (newest first)', async () => {
      const response = await NotificationService.getNotifications({
        userId: mockUserId,
      });
      
      const timestamps = response.notifications.map(n => n.createdAt.getTime());
      const sortedTimestamps = [...timestamps].sort((a, b) => b - a);
      
      expect(timestamps).toEqual(sortedTimestamps);
    });
  });

  describe('markAsRead', () => {
    let testNotification: Notification;

    beforeEach(async () => {
      testNotification = await NotificationService.createNotification(mockNotificationParams);
    });

    it('should mark notification as read', async () => {
      const updatedNotification = await NotificationService.markAsRead(testNotification.id);
      
      expect(updatedNotification).not.toBeNull();
      expect(updatedNotification!.status).toBe('read');
      expect(updatedNotification!.readAt).toBeInstanceOf(Date);
      expect(updatedNotification!.updatedAt.getTime()).toBeGreaterThan(
        testNotification.updatedAt.getTime()
      );
    });

    it('should return null for non-existent notification', async () => {
      const result = await NotificationService.markAsRead('non_existent_id');
      
      expect(result).toBeNull();
    });

    it('should log when verbose logging is enabled', async () => {
      mockFeatureFlags.shouldLogVerbose.mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.markAsRead(testNotification.id, mockUserId);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Notification marked as read:',
        { id: testNotification.id, userId: mockUserId }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('markAllAsRead', () => {
    beforeEach(async () => {
      // Create multiple unread notifications
      await NotificationService.createNotification(mockNotificationParams);
      await NotificationService.createNotification({
        ...mockNotificationParams,
        type: 'payment_confirmation',
        title: 'Payment Confirmed',
      });
      await NotificationService.createNotification({
        ...mockNotificationParams,
        type: 'onboarding_status',
        title: 'Onboarding Complete',
      });
    });

    it('should mark all unread notifications as read', async () => {
      const markedCount = await NotificationService.markAllAsRead(mockUserId);
      
      expect(markedCount).toBe(3);
      
      // Verify all are marked as read
      const response = await NotificationService.getNotifications({
        userId: mockUserId,
        status: 'unread',
      });
      
      expect(response.notifications).toHaveLength(0);
    });

    it('should not affect already read notifications', async () => {
      // Mark one as read first
      const allNotifications = await NotificationService.getNotifications({
        userId: mockUserId,
      });
      await NotificationService.markAsRead(allNotifications.notifications[0].id);
      
      const markedCount = await NotificationService.markAllAsRead(mockUserId);
      
      expect(markedCount).toBe(2); // Only 2 remaining unread notifications
    });

    it('should log when verbose logging is enabled', async () => {
      mockFeatureFlags.shouldLogVerbose.mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.markAllAsRead(mockUserId);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Marked all notifications as read:',
        { userId: mockUserId, count: 3 }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('dismiss', () => {
    let testNotification: Notification;

    beforeEach(async () => {
      testNotification = await NotificationService.createNotification(mockNotificationParams);
    });

    it('should dismiss notification', async () => {
      const dismissedNotification = await NotificationService.dismiss(testNotification.id);
      
      expect(dismissedNotification).not.toBeNull();
      expect(dismissedNotification!.status).toBe('dismissed');
      expect(dismissedNotification!.dismissedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent notification', async () => {
      const result = await NotificationService.dismiss('non_existent_id');
      
      expect(result).toBeNull();
    });

    it('should log when verbose logging is enabled', async () => {
      mockFeatureFlags.shouldLogVerbose.mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.dismiss(testNotification.id, mockUserId);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Notification dismissed:',
        { id: testNotification.id, userId: mockUserId }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('User Preferences', () => {
    const mockPreferences: NotificationPreferences = {
      emailEnabled: true,
      slackEnabled: false,
      pushEnabled: true,
      frequency: 'hourly',
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00',
      },
      types: {
        model_training_complete: true,
        payment_confirmation: false,
        onboarding_status: true,
        generation_limit_warning: true,
        system_update: false,
        agent_insight: true,
        task_completed: false,
        error_alert: true,
      },
      priorities: {
        high: true,
        medium: false,
        low: false,
      },
    };

    it('should return default preferences for new user', async () => {
      const preferences = await NotificationService.getUserPreferences('new_user');
      
      expect(preferences).toMatchObject({
        emailEnabled: false,
        slackEnabled: true,
        frequency: 'immediate',
        types: expect.objectContaining({
          model_training_complete: true,
          error_alert: true,
        }),
        priorities: expect.objectContaining({
          high: true,
          medium: true,
          low: false,
        }),
      });
    });

    it('should update and retrieve user preferences', async () => {
      await NotificationService.updateUserPreferences(mockUserId, mockPreferences);
      
      const retrievedPreferences = await NotificationService.getUserPreferences(mockUserId);
      
      expect(retrievedPreferences).toEqual(mockPreferences);
    });

    it('should log when updating preferences with verbose logging', async () => {
      mockFeatureFlags.shouldLogVerbose.mockReturnValue(true);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await NotificationService.updateUserPreferences(mockUserId, mockPreferences);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'User preferences updated:',
        { userId: mockUserId }
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Email Queue Processing', () => {
    beforeEach(async () => {
      // Set up user preferences to allow emails
      const mockPreferences: NotificationPreferences = {
        emailEnabled: true,
        slackEnabled: false,
        pushEnabled: false,
        frequency: 'immediate',
        types: {
          model_training_complete: true,
          payment_confirmation: true,
          onboarding_status: true,
          generation_limit_warning: true,
          system_update: true,
          agent_insight: true,
          task_completed: true,
          error_alert: true,
        },
        priorities: {
          high: true,
          medium: true,
          low: true,
        },
      };
      
      await NotificationService.updateUserPreferences(mockUserId, mockPreferences);
    });

    it('should process email queue when feature is enabled', async () => {
      // Create notification that should trigger email
      await NotificationService.createNotification(mockNotificationParams);
      
      // Process the queue
      await NotificationService.processEmailQueue();
      
      // Should attempt to send email
      expect(mockEmailService.sendEmail).toHaveBeenCalled();
    });

    it('should skip email queue when feature is disabled', async () => {
      mockFeatureFlags.isEnabled.mockImplementation((flag: string) => {
        return flag !== 'EMAIL_NOTIFICATIONS';
      });
      
      await NotificationService.processEmailQueue();
      
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle email sending failures gracefully', async () => {
      mockEmailService.sendEmail.mockResolvedValue(false);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Create notification and process queue
      await NotificationService.createNotification(mockNotificationParams);
      await NotificationService.processEmailQueue();
      
      // Should not throw errors
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should respect user email preferences', async () => {
      // Disable emails for user
      await NotificationService.updateUserPreferences(mockUserId, {
        emailEnabled: false,
        slackEnabled: true,
        pushEnabled: false,
        frequency: 'immediate',
        types: {
          model_training_complete: true,
          payment_confirmation: true,
          onboarding_status: true,
          generation_limit_warning: true,
          system_update: true,
          agent_insight: true,
          task_completed: true,
          error_alert: true,
        },
        priorities: {
          high: true,
          medium: true,
          low: true,
        },
      });
      
      await NotificationService.createNotification(mockNotificationParams);
      await NotificationService.processEmailQueue();
      
      // Should not send email
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should respect notification type preferences', async () => {
      // Disable specific notification type
      await NotificationService.updateUserPreferences(mockUserId, {
        emailEnabled: true,
        slackEnabled: false,
        pushEnabled: false,
        frequency: 'immediate',
        types: {
          model_training_complete: false, // Disabled
          payment_confirmation: true,
          onboarding_status: true,
          generation_limit_warning: true,
          system_update: true,
          agent_insight: true,
          task_completed: true,
          error_alert: true,
        },
        priorities: {
          high: true,
          medium: true,
          low: true,
        },
      });
      
      await NotificationService.createNotification(mockNotificationParams);
      await NotificationService.processEmailQueue();
      
      // Should not send email for disabled type
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should respect priority preferences', async () => {
      // Disable high priority notifications
      await NotificationService.updateUserPreferences(mockUserId, {
        emailEnabled: true,
        slackEnabled: false,
        pushEnabled: false,
        frequency: 'immediate',
        types: {
          model_training_complete: true,
          payment_confirmation: true,
          onboarding_status: true,
          generation_limit_warning: true,
          system_update: true,
          agent_insight: true,
          task_completed: true,
          error_alert: true,
        },
        priorities: {
          high: false, // Disabled
          medium: true,
          low: true,
        },
      });
      
      await NotificationService.createNotification(mockNotificationParams); // High priority
      await NotificationService.processEmailQueue();
      
      // Should not send email for disabled priority
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });
});