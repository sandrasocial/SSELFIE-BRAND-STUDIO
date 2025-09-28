/**
 * Notification System Type Definitions
 * Defines types for the notification system following the type-safe infrastructure patterns
 */

export type NotificationId = string;
export type UserId = string;

export type NotificationType = 
  | 'model_training_complete'
  | 'payment_confirmation'
  | 'onboarding_status'
  | 'generation_limit_warning'
  | 'system_update'
  | 'agent_insight'
  | 'task_completed'
  | 'error_alert';

export type NotificationPriority = 'high' | 'medium' | 'low';
export type NotificationStatus = 'unread' | 'read' | 'dismissed';

export interface BaseNotification {
  id: NotificationId;
  userId: UserId;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
}

export interface ModelTrainingNotification extends BaseNotification {
  type: 'model_training_complete';
  data: {
    modelId: string;
    modelName: string;
    trainingDuration: number; // in minutes
    accuracy?: number;
  };
}

export interface PaymentNotification extends BaseNotification {
  type: 'payment_confirmation';
  data: {
    transactionId: string;
    amount: number;
    currency: string;
    planType: string;
    nextBillingDate?: string;
  };
}

export interface OnboardingNotification extends BaseNotification {
  type: 'onboarding_status';
  data: {
    step: string;
    completed: boolean;
    nextAction?: string;
  };
}

export interface AgentInsightNotification extends BaseNotification {
  type: 'agent_insight';
  data: {
    agentName: string;
    insightType: 'strategic' | 'technical' | 'operational' | 'urgent';
    context?: Record<string, any>;
  };
}

export type Notification = 
  | ModelTrainingNotification 
  | PaymentNotification 
  | OnboardingNotification 
  | AgentInsightNotification 
  | BaseNotification;

// Notification preferences
export interface NotificationPreferences {
  emailEnabled: boolean;
  slackEnabled: boolean;
  pushEnabled: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
  quietHours?: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string;   // HH:MM format
  };
  types: Record<NotificationType, boolean>;
  priorities: Record<NotificationPriority, boolean>;
}

// API response types
export interface NotificationResponse {
  notifications: Notification[];
  totalCount: number;
  unreadCount: number;
  hasMore: boolean;
}

export interface NotificationServiceConfig {
  enableFeatureFlag?: string;
  emailService?: boolean;
  realTimeUpdates?: boolean;
  persistToDatabase?: boolean;
}

// Email integration types
export interface NotificationEmailTemplate {
  type: NotificationType;
  subject: string;
  template: string;
  variables: Record<string, any>;
}

export interface EmailQueueItem {
  id: string;
  userId: UserId;
  notification: Notification;
  template: NotificationEmailTemplate;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  lastAttemptAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  error?: string;
}

// Hook state types
export interface UseNotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

export interface UseNotificationsActions {
  markAsRead: (id: NotificationId) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismiss: (id: NotificationId) => Promise<void>;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export interface UseNotificationsReturn extends UseNotificationsState, UseNotificationsActions {}