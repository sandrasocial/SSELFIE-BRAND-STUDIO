import { 
  Notification,
  NotificationSchema,
  NotificationTemplate,
  NotificationChannel 
} from '../../shared/notification-types.js';
import { infrastructureFlags } from '../../shared/feature-flags.js';

interface NotificationServiceConfig {
  defaultChannel: NotificationChannel;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
}

class NotificationService {
  private config: NotificationServiceConfig;
  private notifications: Map<string, Notification>;
  private templates: Map<string, NotificationTemplate>;
  private subscribers: Set<(notification: Notification) => void>;

  constructor(config: NotificationServiceConfig) {
    this.config = config;
    this.notifications = new Map();
    this.templates = new Map();
    this.subscribers = new Set();
  }

  // Feature flag check
  private isFeatureEnabled(): boolean {
    return typeof window !== 'undefined' && 
           window.__FEATURE_FLAGS__?.[infrastructureFlags.NEW_NOTIFICATION_SYSTEM] === true;
  }

  // Add a notification template
  public addTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  // Create a notification from a template
  public async createFromTemplate(
    templateId: string,
    data: Record<string, unknown>
  ): Promise<Notification | null> {
    if (!this.isFeatureEnabled()) {
      console.warn('New notification system is not enabled');
      return null;
    }

    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const notification: Notification = {
      id: crypto.randomUUID(),
      type: template.type,
      priority: template.priority,
      channels: template.channels,
      title: this.interpolate(template.titleTemplate, data),
      message: this.interpolate(template.messageTemplate, data),
      actionUrl: template.actionUrlTemplate ? 
        this.interpolate(template.actionUrlTemplate, data) : undefined,
      metadata: data,
      createdAt: Date.now(),
      read: false,
      dismissed: false
    };

    // Validate notification
    NotificationSchema.parse(notification);

    // Store and notify subscribers
    this.notifications.set(notification.id, notification);
    this.notifySubscribers(notification);

    return notification;
  }

  // Subscribe to notifications
  public subscribe(callback: (notification: Notification) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Mark notification as read
  public markAsRead(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
      this.notifySubscribers(notification);
    }
  }

  // Dismiss notification
  public dismiss(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.dismissed = true;
      this.notifications.set(id, notification);
      this.notifySubscribers(notification);
    }
  }

  // Get all active notifications
  public getActiveNotifications(): Notification[] {
    return Array.from(this.notifications.values())
      .filter(n => !n.dismissed)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Private helper to interpolate templates
  private interpolate(template: string, data: Record<string, unknown>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => 
      String(data[key] ?? ''));
  }

  // Notify all subscribers
  private notifySubscribers(notification: Notification): void {
    this.subscribers.forEach(callback => callback(notification));
  }
}

// Export a singleton instance
export const notificationService = new NotificationService({
  defaultChannel: 'in_app',
  inAppEnabled: true,
  emailEnabled: true,
  pushEnabled: false
});